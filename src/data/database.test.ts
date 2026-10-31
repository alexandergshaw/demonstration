import { describe, expect, it } from 'vitest';
import { createLocalBackend, DATABASE_KEY, DatabaseError, MAX_CYCLES } from './database';
import { createReferenceData } from './seed';
import { encodeDraft, hasFocus, hasPlan, hasReflection, initialState, reducer, STORAGE_KEY, type PlanState } from '../model';

type Backend = ReturnType<typeof createLocalBackend>;
type Snapshot = ReturnType<Backend['load']>;

// A deliberately small Storage adapter: failures occur before the atomic replacement.
class MemoryStorage implements Storage {
  readonly data = new Map<string, string>();
  writes = 0;
  failRead: Error | null = null;
  failWrite: Error | null = null;
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  key(index: number) { return [...this.data.keys()][index] ?? null; }
  getItem(key: string) {
    if (this.failRead) throw this.failRead;
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    if (this.failWrite) throw this.failWrite;
    this.data.set(key, value);
    this.writes++;
  }
  removeItem(key: string) { this.data.delete(key); }
}

function setup(storage = new MemoryStorage()) {
  let serial = 0;
  let clock = 0;
  const backend = createLocalBackend(() => storage, {
    id: () => `test-cycle-${++serial}`,
    now: () => new Date(Date.UTC(2026, 9, 30, 12, 0, clock++)).toISOString(),
  });
  return { storage, backend };
}
function active(snapshot: Snapshot) {
  const cycle = snapshot.cycles.find(item => item.id === snapshot.activeCycleId);
  if (!cycle) throw new Error('Snapshot must identify an existing active cycle');
  return cycle;
}
function expectCode(action: () => unknown, code: string) {
  try { action(); }
  catch (error) {
    expect(error).toBeInstanceOf(DatabaseError);
    expect(error).toMatchObject({ code });
    return;
  }
  expect.fail(`Expected an explicit ${code} failure, not a successful result`);
}
const authoredText = 'Students will compare two fractions and explain how a shared whole supports their reasoning.';
function completedState(value = authoredText): PlanState {
  let state = reducer(initialState(), { type: 'evidence', id: 'responseC' });
  state = reducer(state, { type: 'lens', value: 'meaning' });
  state = reducer(state, { type: 'confidence', value: 'strong' });
  for (const field of ['interpretation', 'focus'] as const) state = reducer(state, { type: 'text', field, value });
  state = reducer(state, { type: 'challenge' });
  state = reducer(state, { type: 'confirm-focus' });
  for (const field of ['action', 'owner', 'implementationCheck', 'learningCheck'] as const) state = reducer(state, { type: 'text', field, value });
  for (let index = 0; index < 6; index++) state = reducer(state, { type: 'agenda', index, value });
  state = reducer(state, { type: 'consent', value: true });
  state = reducer(state, { type: 'confirm-plan' });
  state = reducer(state, { type: 'implementation', value: 'yes' });
  state = reducer(state, { type: 'text', field: 'reflection', value });
  state = reducer(state, { type: 'save-reflection' });
  expect(hasFocus(state)).toBe(true);
  expect(hasPlan(state)).toBe(true);
  expect(hasReflection(state)).toBe(true);
  return state;
}
function alterStringLeaf(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (typeof record[key] === 'string') { record[key] = 'Caller changed reference text'; return true; }
    if (alterStringLeaf(record[key])) return true;
  }
  return false;
}

const mutations: Array<[string, (backend: Backend, snapshot: Snapshot) => Snapshot]> = [
  ['save', (db, s) => db.saveCycle(s.activeCycleId, completedState(), s.revision)],
  ['create', (db, s) => db.createCycle('New planning cycle', s.revision)],
  ['rename', (db, s) => db.renameCycle(s.activeCycleId, 'Renamed cycle', s.revision)],
  ['duplicate', (db, s) => db.duplicateCycle(s.activeCycleId, s.revision)],
  ['select', (db, s) => db.selectCycle(s.cycles.find(c => c.id !== s.activeCycleId)!.id, s.revision)],
  ['delete', (db, s) => db.deleteCycle(s.activeCycleId, s.revision)],
  ['reset', (db, s) => db.resetCycle(s.activeCycleId, s.revision)],
];

 describe('local database initialization and copy isolation', () => {
  it('persists a usable seed once and returns the same durable workspace on repeated loads', () => {
    const { storage, backend } = setup();
    const first = backend.load();
    expect(first.version).toBe(1);
    expect(first.cycles).toHaveLength(1);
    expect(active(first).state).toEqual(initialState());
    expect(active(first).id.length).toBeGreaterThan(0);
    expect(Number.isNaN(Date.parse(active(first).createdAt))).toBe(false);
    expect(first.reference).toEqual(createReferenceData());
    const bytes = storage.data.get(DATABASE_KEY);
    const second = backend.load();
    expect(second.cycles).toEqual(first.cycles);
    expect(second.revision).toBe(first.revision);
    expect(storage.data.get(DATABASE_KEY)).toBe(bytes);
    expect(storage.writes).toBe(1);
  });

  it('isolates nested reference and cycle reads from callers and from earlier snapshots', () => {
    const { backend } = setup();
    const first = backend.load();
    const reference = createReferenceData();
    const second = backend.load();
    expect(first.reference).not.toBe(second.reference);
    expect(first.cycles[0].state.agenda).not.toBe(second.cycles[0].state.agenda);
    first.cycles[0].state.agenda[0] = 'An unsaved caller mutation';
    first.cycles[0].state.selected.push('observation');
    first.cycles[0].title = 'Unsaved title';
    // A frozen reference is also acceptable; neither a mutation nor its rejection may change storage.
    try { alterStringLeaf(first.reference); } catch { /* readonly reference */ }
    expect(second.cycles[0].state).toEqual(initialState());
    const again = backend.load();
    expect(again.reference).toEqual(reference);
    expect(again.cycles).toEqual(second.cycles);
  });

  it('does not retain mutable aliases to supplied state or a returned save result', () => {
    const { backend, storage } = setup();
    const first = backend.load();
    const input = completedState();
    const expected = structuredClone(input);
    const saved = backend.saveCycle(first.activeCycleId, input, first.revision);
    input.agenda[0] = 'Changed outside the repository';
    input.reflection = 'Changed outside the repository';
    active(saved).state.selected.push('observation');
    const reopened = createLocalBackend(() => storage).load();
    expect(active(reopened).state).toEqual(expected);
    expect(hasReflection(active(reopened).state)).toBe(true);
  });
});

describe('saved cycle lifecycle', () => {
  it('creates and selects a trimmed new cycle without changing the existing cycle', () => {
    const { backend } = setup();
    const first = backend.load();
    const created = backend.createCycle('  Fraction comparison  ', first.revision);
    expect(created.cycles).toHaveLength(2);
    expect(created.activeCycleId).not.toBe(first.activeCycleId);
    expect(active(created).title).toBe('Fraction comparison');
    expect(active(created).state).toEqual(initialState());
    expect(created.cycles.find(c => c.id === first.activeCycleId)).toEqual(active(first));
    expect(created.revision).toBeGreaterThan(first.revision);
    expect(backend.load().activeCycleId).toBe(created.activeCycleId);
  });

  it('saves, renames and switches cycles while preserving approvals and independent content', () => {
    const { backend, storage } = setup();
    let snapshot = backend.load();
    const original = active(snapshot);
    const state = completedState();
    snapshot = backend.saveCycle(original.id, state, snapshot.revision);
    const saved = active(snapshot);
    expect(saved.revision).toBeGreaterThan(original.revision);
    expect(saved.updatedAt).not.toBe(original.updatedAt);
    snapshot = backend.renameCycle(original.id, '  October PLC  ', snapshot.revision);
    expect(active(snapshot).title).toBe('October PLC');
    expect(active(snapshot).createdAt).toBe(original.createdAt);
    expect(active(snapshot).state).toEqual(state);
    expect(active(snapshot).revision).toBeGreaterThan(saved.revision);
    snapshot = backend.createCycle('November PLC', snapshot.revision);
    const other = active(snapshot);
    snapshot = backend.selectCycle(original.id, snapshot.revision);
    expect(active(snapshot).state).toEqual(state);
    expect(snapshot.cycles.find(c => c.id === other.id)).toEqual(other);
    const reopened = createLocalBackend(() => storage).load();
    expect(reopened.activeCycleId).toBe(original.id);
    expect(reopened.cycles).toEqual(snapshot.cycles);
    expect(hasReflection(active(reopened).state)).toBe(true);
  });

  it('routes a save to its explicit cycle ID without silently changing the active cycle', () => {
    const { backend } = setup();
    let snapshot = backend.load();
    const firstId = snapshot.activeCycleId;
    snapshot = backend.createCycle('Another cycle', snapshot.revision);
    const activeId = snapshot.activeCycleId;
    const state = completedState();
    snapshot = backend.saveCycle(firstId, state, snapshot.revision);
    expect(snapshot.activeCycleId).toBe(activeId);
    expect(active(snapshot).state).toEqual(initialState());
    expect(snapshot.cycles.find(c => c.id === firstId)!.state).toEqual(state);
  });

  it('duplicates authored content as a new draft without carrying educator authority or follow-up', () => {
    const { backend } = setup();
    let snapshot = backend.load();
    snapshot = backend.renameCycle(snapshot.activeCycleId, 'T'.repeat(80), snapshot.revision);
    snapshot = backend.saveCycle(snapshot.activeCycleId, completedState(), snapshot.revision);
    const original = active(snapshot);
    snapshot = backend.duplicateCycle(original.id, snapshot.revision);
    const duplicate = active(snapshot);
    expect(duplicate.id).not.toBe(original.id);
    expect(duplicate.title.length).toBeLessThanOrEqual(80);
    expect(duplicate.title.trim().length).toBeGreaterThan(0);
    for (const field of ['selected', 'interpretation', 'focus', 'lens', 'confidence', 'agenda', 'action', 'owner', 'implementationCheck', 'learningCheck'] as const) {
      expect(duplicate.state[field]).toEqual(original.state[field]);
    }
    expect(duplicate.state).toMatchObject({
      focusStamp: null, planStamp: null, reflectionStamp: null,
      challenged: false, consent: false, implementation: '', reflection: '', step: 0, review: true,
    });
    expect(hasFocus(duplicate.state)).toBe(false);
    expect(hasPlan(duplicate.state)).toBe(false);
    expect(hasReflection(duplicate.state)).toBe(false);
    expect(snapshot.cycles.find(c => c.id === original.id)).toEqual(original);
    expect(backend.load().cycles).toEqual(snapshot.cycles);
  });

  it('deletes a cycle and selects the first remaining cycle only when the active cycle was deleted', () => {
    const { backend } = setup();
    let snapshot = backend.load();
    const firstId = snapshot.activeCycleId;
    snapshot = backend.createCycle('Second', snapshot.revision);
    const secondId = snapshot.activeCycleId;
    snapshot = backend.createCycle('Third', snapshot.revision);
    const thirdId = snapshot.activeCycleId;
    snapshot = backend.deleteCycle(secondId, snapshot.revision);
    expect(snapshot.activeCycleId).toBe(thirdId);
    expect(snapshot.cycles.some(c => c.id === secondId)).toBe(false);
    snapshot = backend.deleteCycle(thirdId, snapshot.revision);
    expect(snapshot.activeCycleId).toBe(firstId);
    expect(snapshot.cycles).toHaveLength(1);
    expect(backend.load().cycles).toEqual(snapshot.cycles);
  });

  it('rejects deletion of the final cycle without writing or changing selection', () => {
    const { backend, storage } = setup();
    const snapshot = backend.load();
    const bytes = storage.data.get(DATABASE_KEY);
    expectCode(() => backend.deleteCycle(snapshot.activeCycleId, snapshot.revision), 'last-cycle');
    expect(storage.data.get(DATABASE_KEY)).toBe(bytes);
    expect(backend.load().activeCycleId).toBe(snapshot.activeCycleId);
  });

  it('resets only the requested cycle state while retaining identity and title', () => {
    const { backend } = setup();
    let snapshot = backend.load();
    const other = active(snapshot);
    snapshot = backend.createCycle('Keep this name', snapshot.revision);
    snapshot = backend.saveCycle(snapshot.activeCycleId, completedState(), snapshot.revision);
    const previous = active(snapshot);
    snapshot = backend.resetCycle(previous.id, snapshot.revision);
    expect(active(snapshot).state).toEqual(initialState());
    expect(active(snapshot)).toMatchObject({ id: previous.id, title: previous.title, createdAt: previous.createdAt });
    expect(active(snapshot).updatedAt).not.toBe(previous.updatedAt);
    expect(active(snapshot).revision).toBeGreaterThan(previous.revision);
    expect(snapshot.cycles.find(c => c.id === other.id)).toEqual(other);
    expect(backend.load().cycles).toEqual(snapshot.cycles);
  });

  it('rejects creation and duplication beyond the supported cycle count without changing saved bytes', () => {
    const { backend, storage } = setup();
    let snapshot = backend.load();
    while (snapshot.cycles.length < MAX_CYCLES) snapshot = backend.createCycle(`Cycle ${snapshot.cycles.length + 1}`, snapshot.revision);
    const bytes = storage.data.get(DATABASE_KEY);
    expectCode(() => backend.createCycle('One too many', snapshot.revision), 'cycle-limit');
    expectCode(() => backend.duplicateCycle(snapshot.activeCycleId, snapshot.revision), 'cycle-limit');
    expect(storage.data.get(DATABASE_KEY)).toBe(bytes);
    expect(backend.load().cycles).toHaveLength(MAX_CYCLES);
  });

  it.each(['', '   ', 'T'.repeat(81)])('rejects an invalid title without losing a cycle (%j)', title => {
    const { backend, storage } = setup();
    const snapshot = backend.load();
    const bytes = storage.data.get(DATABASE_KEY);
    expectCode(() => backend.createCycle(title, snapshot.revision), 'invalid-input');
    expectCode(() => backend.renameCycle(snapshot.activeCycleId, title, snapshot.revision), 'invalid-input');
    expect(storage.data.get(DATABASE_KEY)).toBe(bytes);
  });

  it('accepts the title boundary after trimming', () => {
    const { backend } = setup();
    const first = backend.load();
    const saved = backend.createCycle(`  ${'T'.repeat(80)}  `, first.revision);
    expect(active(saved).title).toBe('T'.repeat(80));
  });

  it.each(['save', 'rename', 'duplicate', 'select', 'delete', 'reset'] as const)('rejects a missing cycle for %s', operation => {
    const { backend, storage } = setup();
    let s = backend.load();
    s = backend.createCycle('Second', s.revision);
    const bytes = storage.data.get(DATABASE_KEY);
    const actions = {
      save: () => backend.saveCycle('missing-cycle', initialState(), s.revision),
      rename: () => backend.renameCycle('missing-cycle', 'A name', s.revision),
      duplicate: () => backend.duplicateCycle('missing-cycle', s.revision),
      select: () => backend.selectCycle('missing-cycle', s.revision),
      delete: () => backend.deleteCycle('missing-cycle', s.revision),
      reset: () => backend.resetCycle('missing-cycle', s.revision),
    };
    expectCode(actions[operation], 'not-found');
    expect(storage.data.get(DATABASE_KEY)).toBe(bytes);
  });
});

describe('legacy migration and deliberate recovery', () => {
  it('migrates a valid approved legacy draft once and preserves the original backup bytes', () => {
    const { backend, storage } = setup();
    const state = completedState();
    const legacy = encodeDraft(state);
    storage.data.set(STORAGE_KEY, legacy);
    const migrated = backend.load();
    expect(active(migrated).state).toEqual(state);
    expect(hasReflection(active(migrated).state)).toBe(true);
    expect(migrated.notice.length).toBeGreaterThan(0);
    expect(storage.data.get(STORAGE_KEY)).toBe(legacy);
    const databaseBytes = storage.data.get(DATABASE_KEY);
    storage.data.set(STORAGE_KEY, encodeDraft(initialState()));
    const reopened = backend.load();
    expect(reopened.cycles).toEqual(migrated.cycles);
    expect(storage.data.get(DATABASE_KEY)).toBe(databaseBytes);
    expect(storage.writes).toBe(1);
  });

  it.each(['{broken', JSON.stringify({ version: 2, state: initialState() }), JSON.stringify({ version: 1, state: { focusStamp: 'approved' } })])('recovers invalid legacy input with notice and retains its bytes (%s)', legacy => {
    const { backend, storage } = setup();
    storage.data.set(STORAGE_KEY, legacy);
    const loaded = backend.load();
    expect(active(loaded).state).toEqual(initialState());
    expect(loaded.notice.length).toBeGreaterThan(0);
    expect(storage.data.get(STORAGE_KEY)).toBe(legacy);
  });

  it('retains a changed legacy draft while clearing its stale approvals', () => {
    const { backend, storage } = setup();
    const changed = { ...completedState(), interpretation: 'A new explanation changed the meaning of this saved evidence.' };
    storage.data.set(STORAGE_KEY, encodeDraft(changed));
    const restored = active(backend.load()).state;
    expect(restored.interpretation).toBe(changed.interpretation);
    expect(restored.reflection).toBe(changed.reflection);
    expect(restored.review).toBe(true);
    expect(hasFocus(restored)).toBe(false);
    expect(hasPlan(restored)).toBe(false);
    expect(hasReflection(restored)).toBe(false);
  });

  it('preserves legacy bytes and reports a failed migration when storage rejects the new database', () => {
    const { backend, storage } = setup();
    const legacy = encodeDraft(completedState());
    storage.data.set(STORAGE_KEY, legacy);
    storage.failWrite = new DOMException('Storage is full', 'QuotaExceededError');
    expectCode(() => backend.load(), 'quota-exceeded');
    expect(storage.data.has(DATABASE_KEY)).toBe(false);
    expect(storage.data.get(STORAGE_KEY)).toBe(legacy);
    storage.failWrite = null;
    expect(hasReflection(active(backend.load()).state)).toBe(true);
  });

  it('explicitly resets a corrupt database without importing legacy data or clearing unrelated keys', () => {
    const { backend, storage } = setup();
    const legacy = encodeDraft(completedState());
    storage.data.set(DATABASE_KEY, '{broken');
    storage.data.set(STORAGE_KEY, legacy);
    storage.data.set('another-app.setting', 'keep me');
    const recovered = backend.resetDatabase();
    expect(recovered.cycles).toHaveLength(1);
    expect(active(recovered).state).toEqual(initialState());
    expect(recovered.reference).toEqual(createReferenceData());
    expect(storage.data.get(STORAGE_KEY)).toBe(legacy);
    expect(storage.data.get('another-app.setting')).toBe('keep me');
    expect(backend.load().cycles).toEqual(recovered.cycles);
  });
});

describe('untrusted database and save boundaries', () => {
  const invalidDocuments: Array<[string, (snapshot: Snapshot) => unknown]> = [
    ['missing cycles', s => ({ ...s, cycles: undefined })],
    ['empty cycles', s => ({ ...s, cycles: [] })],
    ['invalid active cycle', s => ({ ...s, activeCycleId: 'missing-cycle' })],
    ['negative database revision', s => ({ ...s, revision: -1 })],
    ['fractional database revision', s => ({ ...s, revision: 0.5 })],
    ['unsafe database revision', s => ({ ...s, revision: Number.MAX_SAFE_INTEGER + 1 })],
    ['missing reference data', s => ({ ...s, reference: {} })],
    ['duplicate cycle IDs', s => ({ ...s, cycles: [s.cycles[0], s.cycles[0]] })],
    ['empty cycle ID', s => ({ ...s, activeCycleId: '', cycles: [{ ...s.cycles[0], id: '' }] })],
    ['blank title', s => ({ ...s, cycles: [{ ...s.cycles[0], title: '   ' }] })],
    ['oversized title', s => ({ ...s, cycles: [{ ...s.cycles[0], title: 'T'.repeat(81) }] })],
    ['invalid timestamp', s => ({ ...s, cycles: [{ ...s.cycles[0], updatedAt: 'yesterday' }] })],
    ['negative cycle revision', s => ({ ...s, cycles: [{ ...s.cycles[0], revision: -1 }] })],
    ['invalid model choice', s => ({ ...s, cycles: [{ ...s.cycles[0], state: { ...s.cycles[0].state, lens: 'invented' } }] })],
    ['incomplete model agenda', s => ({ ...s, cycles: [{ ...s.cycles[0], state: { ...s.cycles[0].state, agenda: ['only one'] } }] })],
    ['too many cycles', s => ({ ...s, activeCycleId: 'cycle-0', cycles: Array.from({ length: MAX_CYCLES + 1 }, (_, i) => ({ ...s.cycles[0], id: `cycle-${i}` })) })],
  ];
  it.each(invalidDocuments)('rejects %s without automatically overwriting its bytes', (_name, makeInvalid) => {
    const { backend, storage } = setup();
    const seed = backend.load();
    const raw = JSON.stringify(makeInvalid(seed));
    storage.data.set(DATABASE_KEY, raw);
    const writes = storage.writes;
    expectCode(() => backend.load(), 'corrupt-data');
    expect(storage.data.get(DATABASE_KEY)).toBe(raw);
    expect(storage.writes).toBe(writes);
  });

  it.each(['{bad json', 'null', '[]'])('rejects a malformed database without replacing it (%s)', raw => {
    const { backend, storage } = setup();
    storage.data.set(DATABASE_KEY, raw);
    expectCode(() => backend.load(), 'corrupt-data');
    expect(storage.data.get(DATABASE_KEY)).toBe(raw);
    expect(storage.writes).toBe(0);
  });

  it('rejects a future database version without downgrading or overwriting it', () => {
    const { backend, storage } = setup();
    const seed = backend.load();
    const raw = JSON.stringify({ ...seed, version: 2 });
    storage.data.set(DATABASE_KEY, raw);
    expectCode(() => backend.load(), 'unsupported-version');
    expect(storage.data.get(DATABASE_KEY)).toBe(raw);
  });

  it('rejects altered fixed evidence even when the replacement remains a string', () => {
    const { backend, storage } = setup();
    const seed = backend.load();
    const altered = structuredClone(seed);
    expect(alterStringLeaf(altered.reference)).toBe(true);
    const raw = JSON.stringify(altered);
    storage.data.set(DATABASE_KEY, raw);
    expectCode(() => backend.load(), 'corrupt-data');
    expect(storage.data.get(DATABASE_KEY)).toBe(raw);
  });

  it('bounds external input even when oversized padding is syntactically valid JSON', () => {
    const { backend, storage } = setup();
    const seed = backend.load();
    const raw = ' '.repeat(21_000_000) + JSON.stringify(seed);
    storage.data.set(DATABASE_KEY, raw);
    expectCode(() => backend.load(), 'corrupt-data');
    expect(storage.data.get(DATABASE_KEY)).toBe(raw);
  });

  it.each([
    { ...initialState(), interpretation: 42 },
    { ...initialState(), selected: ['assessment', 'invented'] },
    { ...initialState(), agenda: [] },
    { ...initialState(), reflection: 'x'.repeat(4001) },
  ])('rejects structurally invalid save input without changing durable state', invalid => {
    const { backend, storage } = setup();
    const snapshot = backend.load();
    const bytes = storage.data.get(DATABASE_KEY);
    expectCode(() => backend.saveCycle(snapshot.activeCycleId, invalid as unknown as PlanState, snapshot.revision), 'invalid-input');
    expect(storage.data.get(DATABASE_KEY)).toBe(bytes);
  });

  it('normalizes forged approval strings but retains otherwise valid authored drafts', () => {
    const { backend } = setup();
    const snapshot = backend.load();
    const input = { ...completedState(), focusStamp: 'forged', planStamp: 'forged', reflectionStamp: 'forged' };
    const saved = backend.saveCycle(snapshot.activeCycleId, input, snapshot.revision);
    const state = active(saved).state;
    expect(state.interpretation).toBe(input.interpretation);
    expect(state.reflection).toBe(input.reflection);
    expect(state.review).toBe(true);
    expect(state.step).toBeLessThan(2);
    expect(state.consent).toBe(false);
    expect(hasFocus(state)).toBe(false);
    expect(hasPlan(state)).toBe(false);
    expect(hasReflection(state)).toBe(false);
    expect(backend.load().cycles).toEqual(saved.cycles);
  });

  it('does not persist unexpected caller properties as part of model state', () => {
    const { backend, storage } = setup();
    const snapshot = backend.load();
    const input = { ...initialState(), unexpectedPayload: { marker: 'do-not-persist-this-property' } };
    const saved = backend.saveCycle(snapshot.activeCycleId, input, snapshot.revision);
    expect(active(saved).state).not.toHaveProperty('unexpectedPayload');
    expect(storage.data.get(DATABASE_KEY)).not.toContain('do-not-persist-this-property');
  });
});

describe('failure atomicity and optimistic conflicts', () => {
  it('reports an unavailable storage provider explicitly', () => {
    expectCode(() => createLocalBackend(() => { throw new DOMException('Denied', 'SecurityError'); }).load(), 'storage-unavailable');
  });

  it('reports denied reads without replacing existing saved work', () => {
    const { backend, storage } = setup();
    const first = backend.load();
    const bytes = storage.data.get(DATABASE_KEY);
    const writes = storage.writes;
    storage.failRead = new DOMException('Denied', 'SecurityError');
    expectCode(() => backend.load(), 'storage-unavailable');
    expectCode(() => backend.saveCycle(first.activeCycleId, completedState(), first.revision), 'storage-unavailable');
    expect(storage.data.get(DATABASE_KEY)).toBe(bytes);
    expect(storage.writes).toBe(writes);
  });

  it.each([
    ['QuotaExceededError', 'quota-exceeded'],
    ['SecurityError', 'storage-unavailable'],
  ])('does not publish a successful save after %s and allows a later retry', (name, code) => {
    const { backend, storage } = setup();
    const previous = backend.load();
    const draft = completedState();
    const untouchedDraft = structuredClone(draft);
    const bytes = storage.data.get(DATABASE_KEY);
    storage.failWrite = new DOMException('Storage rejected the write', name);
    expectCode(() => backend.saveCycle(previous.activeCycleId, draft, previous.revision), code);
    expect(storage.data.get(DATABASE_KEY)).toBe(bytes);
    expect(draft).toEqual(untouchedDraft);
    expect(backend.load().cycles).toEqual(previous.cycles);
    expect(backend.load().revision).toBe(previous.revision);
    storage.failWrite = null;
    const retried = backend.saveCycle(previous.activeCycleId, draft, previous.revision);
    expect(active(retried).state).toEqual(untouchedDraft);
    expect(retried.revision).toBeGreaterThan(previous.revision);
  });

  it.each(mutations)('preserves the whole saved document when %s fails to write', (_name, mutate) => {
    const { backend, storage } = setup();
    let snapshot = backend.load();
    snapshot = backend.createCycle('Another cycle', snapshot.revision);
    const bytes = storage.data.get(DATABASE_KEY);
    storage.failWrite = new DOMException('Quota exceeded', 'QuotaExceededError');
    expectCode(() => mutate(backend, snapshot), 'quota-exceeded');
    expect(storage.data.get(DATABASE_KEY)).toBe(bytes);
    expect(backend.load().cycles).toEqual(snapshot.cycles);
    expect(backend.load().activeCycleId).toBe(snapshot.activeCycleId);
  });

  it('does not destroy corrupt bytes when an explicitly requested reset also fails', () => {
    const { backend, storage } = setup();
    const raw = '{important unrecoverable original';
    storage.data.set(DATABASE_KEY, raw);
    storage.failWrite = new DOMException('Denied', 'SecurityError');
    expectCode(() => backend.resetDatabase(), 'storage-unavailable');
    expect(storage.data.get(DATABASE_KEY)).toBe(raw);
  });

  it.each(mutations)('rejects stale %s after another repository has changed the document', (_name, mutate) => {
    const { backend, storage } = setup();
    let stale = backend.load();
    stale = backend.createCycle('Second cycle', stale.revision);
    const external = createLocalBackend(() => storage);
    const latest = external.renameCycle(stale.activeCycleId, 'Changed in another tab', stale.revision);
    const bytes = storage.data.get(DATABASE_KEY);
    expectCode(() => mutate(backend, stale), 'conflict');
    expect(storage.data.get(DATABASE_KEY)).toBe(bytes);
    expect(backend.load().cycles).toEqual(latest.cycles);
    expect(backend.load().revision).toBe(latest.revision);
    expect(active(stale).title).toBe('Second cycle');
  });

  it('requires a new revision after an external selection change and preserves both cycle drafts', () => {
    const { backend, storage } = setup();
    let stale = backend.load();
    const firstId = stale.activeCycleId;
    stale = backend.createCycle('Second cycle', stale.revision);
    const workingDraft = completedState();
    const otherTab = createLocalBackend(() => storage);
    const latest = otherTab.selectCycle(firstId, stale.revision);
    const bytes = storage.data.get(DATABASE_KEY);
    expectCode(() => backend.saveCycle(stale.activeCycleId, workingDraft, stale.revision), 'conflict');
    expect(storage.data.get(DATABASE_KEY)).toBe(bytes);
    expect(backend.load().activeCycleId).toBe(latest.activeCycleId);
    expect(backend.load().cycles.every(c => !hasPlan(c.state))).toBe(true);
    expect(hasReflection(workingDraft)).toBe(true);
  });
});

describe('supported maximum draft persistence', () => {
  it.each([
    ['plain text', 'x'.repeat(4000)],
    ['JSON quotes', '"'.repeat(4000)],
    ['JSON backslashes', '\\'.repeat(4000)],
    ['JSON control characters', '\u0000'.repeat(4000)],
    ['newlines and mixed escapes', 'Evidence\n\t"quoted"\\source '.repeat(200).slice(0, 4000)],
  ])('retains all fields and current approvals after saving maximum %s', (_name, value) => {
    const { backend, storage } = setup();
    const first = backend.load();
    const state = completedState(value);
    const saved = backend.saveCycle(first.activeCycleId, state, first.revision);
    const reopened = createLocalBackend(() => storage).load();
    expect(active(reopened).state).toEqual(state);
    expect(reopened.cycles).toEqual(saved.cycles);
    expect(hasFocus(active(reopened).state)).toBe(true);
    expect(hasPlan(active(reopened).state)).toBe(true);
    expect(hasReflection(active(reopened).state)).toBe(true);
  });

  it('retains twelve complete maximum escaping-heavy cycles under the database envelope budget', () => {
    const { backend, storage } = setup();
    const state = completedState('\u0000'.repeat(4000));
    let snapshot = backend.load();
    for (let i = 0; i < 12; i++) {
      if (i > 0) snapshot = backend.createCycle(`Maximum legal cycle ${i + 1}`, snapshot.revision);
      snapshot = backend.saveCycle(snapshot.activeCycleId, state, snapshot.revision);
    }
    const reopened = createLocalBackend(() => storage).load();
    expect(reopened.cycles).toHaveLength(12);
    expect(reopened.activeCycleId).toBe(snapshot.activeCycleId);
    for (const cycle of reopened.cycles) {
      expect(cycle.state).toEqual(state);
      expect(hasFocus(cycle.state)).toBe(true);
      expect(hasPlan(cycle.state)).toBe(true);
      expect(hasReflection(cycle.state)).toBe(true);
    }
  }, 20_000);
});
