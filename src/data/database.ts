import { initialState, parseDraft, parseStoredState, STORAGE_KEY, type PlanState } from '../model';
import { createReferenceData, type ReferenceData } from './seed';

export const DATABASE_KEY = 'throughline.database.v1';
export const MAX_CYCLES = 12;
// Twelve legal, escaping-heavy states fit; the browser may impose a smaller quota.
const MAX_DATABASE_LENGTH = 20_000_000;
export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;
export type DatabaseErrorCode = 'storage-unavailable' | 'quota-exceeded' | 'corrupt-data' | 'unsupported-version' | 'conflict' | 'not-found' | 'invalid-input' | 'last-cycle' | 'cycle-limit';
export class DatabaseError extends Error {
  constructor(public readonly code: DatabaseErrorCode, message: string) { super(message); this.name = 'DatabaseError'; }
}
export interface CycleRecord {
  id: string; title: string; createdAt: string; updatedAt: string; revision: number; state: PlanState;
}
interface Database {
  version: 5; revision: number; activeCycleId: string; reference: ReferenceData; cycles: CycleRecord[];
}
export interface WorkspaceSnapshot extends Database { notice: string }
const copy = <T,>(value: T): T => structuredClone(value);
const isObject = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const isRevision = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const isId = (value: unknown): value is string => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);
const isDate = (value: unknown): value is string => typeof value === 'string' && value.length <= 40 && Number.isFinite(Date.parse(value));
function sameReference(actual: unknown, expected: unknown): boolean {
  if (Array.isArray(expected)) return Array.isArray(actual) && actual.length === expected.length && expected.every((value, i) => sameReference(actual[i], value));
  if (isObject(expected)) return isObject(actual) && Object.keys(actual).length === Object.keys(expected).length && Object.keys(expected).every(key => Object.hasOwn(actual, key) && sameReference(actual[key], expected[key]));
  return actual === expected;
}
function titleValue(value: unknown): string {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 80) throw new DatabaseError('invalid-input', 'Give this cycle a name of 1 to 80 characters.');
  return value.trim();
}
function parseDatabase(raw: string): { database: Database; notice: string } {
  try {
    if (raw.length > MAX_DATABASE_LENGTH) throw new Error('Oversized database');
    const input: unknown = JSON.parse(raw);
    if (!isObject(input)) throw new Error('Invalid database');
    if (input.version !== 1 && input.version !== 2 && input.version !== 3 && input.version !== 4 && input.version !== 5) {
      if (typeof input.version === 'number' && Number.isInteger(input.version) && input.version > 5) throw new DatabaseError('unsupported-version', 'These saved cycles use a newer version of Throughline. Your stored data has not been changed.');
      throw new Error('Invalid version');
    }
    if (!isRevision(input.revision) || !isId(input.activeCycleId) || !Array.isArray(input.cycles) || input.cycles.length < 1 || input.cycles.length > MAX_CYCLES) throw new Error('Invalid database fields');
    const reference = createReferenceData();
    if (!sameReference(input.reference, reference)) throw new Error('Invalid reference tables');
    let stale = false;
    const ids = new Set<string>();
    const cycles = input.cycles.map((value: unknown): CycleRecord => {
      if (!isObject(value) || !isId(value.id) || ids.has(value.id) || !isDate(value.createdAt) || !isDate(value.updatedAt) || !isRevision(value.revision)) throw new Error('Invalid cycle');
      const title = titleValue(value.title);
      if (title !== value.title) throw new Error('Invalid stored title');
      ids.add(value.id);
      const parsed = parseStoredState(value.state);
      stale ||= parsed.stale;
      return { id: value.id, title, createdAt: value.createdAt, updatedAt: value.updatedAt, revision: value.revision, state: parsed.state };
    });
    if (!ids.has(input.activeCycleId)) throw new Error('Missing active cycle');
    // Read old versions without rewriting. An explicit mutation writes v5,
    // so pre-checklist clients reject it instead of dropping evidenceReviewed.
    return { database: { version: 5, revision: input.revision, activeCycleId: input.activeCycleId, reference, cycles }, notice: stale ? 'Saved decisions changed. Your drafts are available; review and approve them again.' : '' };
  } catch (error) {
    if (error instanceof DatabaseError && error.code === 'unsupported-version') throw error;
    throw new DatabaseError('corrupt-data', 'The saved workspace could not be read safely. Your stored data has not been changed. Retry or start a fresh demo.');
  }
}
function storageError(error: unknown): DatabaseError {
  const name = isObject(error) && typeof error.name === 'string' ? error.name : '';
  // DOMException and test adapters can originate in a different JavaScript realm.
  return name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED'
    ? new DatabaseError('quota-exceeded', 'This browser has no room to save these changes. Keep this page open and retry after making room. Your last saved cycles are unchanged.')
    : new DatabaseError('storage-unavailable', 'Browser storage is unavailable. Enable storage for this site and try again. Keep this page open to retain unsaved work.');
}

/** Local mock repository. No requests, server, cookies, or external database. */
export function createLocalBackend(storageGetter: () => StorageLike, options: { now?: () => string; id?: () => string } = {}) {
  const now = options.now ?? (() => new Date().toISOString());
  const newId = options.id ?? (() => crypto.randomUUID());
  function storage(): StorageLike { try { return storageGetter(); } catch (error) { throw storageError(error); } }
  function read(adapter: StorageLike, key: string): string | null { try { return adapter.getItem(key); } catch (error) { throw storageError(error); } }
  function snapshot(database: Database, notice = ''): WorkspaceSnapshot { return { ...copy(database), notice }; }
  function timestamp(): string {
    const value = now();
    if (!isDate(value)) throw new DatabaseError('invalid-input', 'The current timestamp is invalid.');
    return value;
  }
  function idFor(cycles: CycleRecord[]): string {
    const id = newId();
    if (!isId(id) || cycles.some(cycle => cycle.id === id)) throw new DatabaseError('invalid-input', 'A unique cycle identifier could not be created. Try again.');
    return id;
  }
  function fresh(state = initialState()): Database {
    const id = idFor([]), time = timestamp();
    return { version: 5, revision: 0, activeCycleId: id, reference: createReferenceData(), cycles: [{ id, title: 'Fraction equivalence · Cycle 1', createdAt: time, updatedAt: time, revision: 0, state }] };
  }
  function write(adapter: StorageLike, database: Database, notice = ''): WorkspaceSnapshot {
    const raw = JSON.stringify(database);
    if (raw.length > MAX_DATABASE_LENGTH) throw new DatabaseError('invalid-input', 'The saved workspace is too large. Shorten the draft or remove an unused cycle.');
    try { adapter.setItem(DATABASE_KEY, raw); } catch (error) { throw storageError(error); }
    return snapshot(database, notice);
  }
  function existing() {
    const adapter = storage(), raw = read(adapter, DATABASE_KEY);
    if (raw === null) throw new DatabaseError('conflict', 'The saved workspace was removed. Reload the latest data before continuing.');
    return { adapter, raw, ...parseDatabase(raw) };
  }
  function cycleIn(database: Database, id: string): CycleRecord {
    const cycle = database.cycles.find(value => value.id === id);
    if (!cycle) throw new DatabaseError('not-found', 'That cycle no longer exists. Reload the latest saved workspace.');
    return cycle;
  }
  function bumpCycle(cycle: CycleRecord) {
    if (!Number.isSafeInteger(cycle.revision + 1)) throw new DatabaseError('invalid-input', 'The cycle revision limit has been reached.');
    cycle.revision++; cycle.updatedAt = timestamp();
  }
  function mutate(expectedRevision: number, change: (database: Database) => string | void): WorkspaceSnapshot {
    if (!isRevision(expectedRevision)) throw new DatabaseError('invalid-input', 'A valid saved revision is required.');
    const { adapter, raw, database, notice } = existing();
    if (database.revision !== expectedRevision) throw new DatabaseError('conflict', 'Another tab changed this workspace. Your edits are still on this page; reload the saved version before continuing.');
    const changeNotice = change(database);
    if (!Number.isSafeInteger(database.revision + 1)) throw new DatabaseError('invalid-input', 'The workspace revision limit has been reached.');
    database.revision++;
    // Detect intervening changes before the atomic write. This is optimistic, not a cross-tab transaction.
    if (read(adapter, DATABASE_KEY) !== raw) throw new DatabaseError('conflict', 'The saved workspace changed while saving. Reload the latest version.');
    return write(adapter, database, changeNotice || notice);
  }
  return {
    load(): WorkspaceSnapshot {
      const adapter = storage(), raw = read(adapter, DATABASE_KEY);
      if (raw !== null) { const parsed = parseDatabase(raw); return snapshot(parsed.database, parsed.notice); }
      const legacy = read(adapter, STORAGE_KEY);
      let state = initialState(), notice = '';
      if (legacy !== null) {
        try {
          const parsed = parseDraft(legacy); state = parsed.state;
          notice = parsed.stale ? 'Your previous draft was moved into a saved cycle. Changed decisions need approval again.' : 'Your previous draft was moved into a saved cycle, including its confirmed decisions.';
        } catch { notice = 'The previous draft could not be read. A fresh cycle is ready; the original draft is retained as a backup.'; }
      }
      // Legacy bytes are deliberately retained. A failed write never consumes the migration source.
      return write(adapter, fresh(state), notice);
    },
    saveCycle(id: string, state: PlanState, expectedRevision: number): WorkspaceSnapshot {
      let parsed: ReturnType<typeof parseStoredState>;
      try { parsed = parseStoredState(state); } catch { throw new DatabaseError('invalid-input', 'The cycle contains invalid or oversized fields. The last saved version is unchanged.'); }
      return mutate(expectedRevision, database => { const cycle = cycleIn(database, id); cycle.state = copy(parsed.state); bumpCycle(cycle); if (parsed.stale) return 'Changed decisions were saved as drafts and require approval again.'; });
    },
    createCycle(title: string, expectedRevision: number): WorkspaceSnapshot {
      const name = titleValue(title);
      return mutate(expectedRevision, database => {
        if (database.cycles.length >= MAX_CYCLES) throw new DatabaseError('cycle-limit', `You can keep up to ${MAX_CYCLES} cycles. Delete an unused cycle first.`);
        const id = idFor(database.cycles), time = timestamp();
        database.cycles.push({ id, title: name, createdAt: time, updatedAt: time, revision: 0, state: initialState() }); database.activeCycleId = id;
      });
    },
    renameCycle(id: string, title: string, expectedRevision: number): WorkspaceSnapshot {
      const name = titleValue(title);
      return mutate(expectedRevision, database => { const cycle = cycleIn(database, id); cycle.title = name; bumpCycle(cycle); });
    },
    duplicateCycle(id: string, expectedRevision: number): WorkspaceSnapshot {
      return mutate(expectedRevision, database => {
        const source = cycleIn(database, id);
        if (database.cycles.length >= MAX_CYCLES) throw new DatabaseError('cycle-limit', `You can keep up to ${MAX_CYCLES} cycles. Delete an unused cycle first.`);
        const newCycleId = idFor(database.cycles), time = timestamp();
        const state: PlanState = { ...copy(source.state), step: 0, challenged: false, focusStamp: null, planStamp: null, reflectionStamp: null, consent: false, implementation: '', reflection: '', review: true,
          nextCycleQuestion: '', evidenceCollector: '', collectionDate: '', reviewDate: '', evidenceReviewed: [] };
        database.cycles.push({ id: newCycleId, title: `${source.title.slice(0, 73).trimEnd()} (copy)`, createdAt: time, updatedAt: time, revision: 0, state }); database.activeCycleId = newCycleId;
      });
    },
    reviseWithLatest(id: string, expectedRevision: number): WorkspaceSnapshot {
      return mutate(expectedRevision, database => {
        const source = cycleIn(database, id);
        if (source.state.evidenceVersion !== 'oct28' || !source.state.updateAvailable) throw new DatabaseError('invalid-input', 'There are no newer results to review for this cycle.');
        if (database.cycles.length >= MAX_CYCLES) throw new DatabaseError('cycle-limit', `You can keep up to ${MAX_CYCLES} cycles. Delete an unused cycle before creating an evidence review.`);
        const newCycleId = idFor(database.cycles), time = timestamp();
        const state: PlanState = { ...copy(source.state), evidenceVersion: 'oct29', updateAvailable: false, updateReviewed: false,
          step: 0, selected: ['assessment'], challenged: false, focusStamp: null, planStamp: null, reflectionStamp: null, consent: false,
          implementation: '', reflection: '', review: true, nextCycleQuestion: '', evidenceCollector: '', collectionDate: '', reviewDate: '', evidenceReviewed: [] };
        database.cycles.push({ id: newCycleId, title: `${source.title.slice(0, 64).trimEnd()} · Oct 29 review`, createdAt: time, updatedAt: time, revision: 0, state });
        database.activeCycleId = newCycleId;
        return 'A new draft uses the October 29 evidence. Your original cycle and its approvals are preserved. Review the new work, revise your reasoning and confirm the decisions again.';
      });
    },
    selectCycle(id: string, expectedRevision: number): WorkspaceSnapshot {
      return mutate(expectedRevision, database => { cycleIn(database, id); database.activeCycleId = id; });
    },
    deleteCycle(id: string, expectedRevision: number): WorkspaceSnapshot {
      return mutate(expectedRevision, database => {
        cycleIn(database, id);
        if (database.cycles.length === 1) throw new DatabaseError('last-cycle', 'Keep at least one cycle. You can reset this cycle instead.');
        database.cycles = database.cycles.filter(cycle => cycle.id !== id);
        if (database.activeCycleId === id) database.activeCycleId = database.cycles[0].id;
      });
    },
    resetCycle(id: string, expectedRevision: number): WorkspaceSnapshot {
      return mutate(expectedRevision, database => { const cycle = cycleIn(database, id); cycle.state = initialState(); bumpCycle(cycle); });
    },
    resetDatabase(): WorkspaceSnapshot { return write(storage(), fresh(), 'A fresh local workspace is ready.'); },
  };
}
export type LocalBackend = ReturnType<typeof createLocalBackend>;
