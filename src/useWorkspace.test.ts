import { afterEach, describe, expect, it, vi } from 'vitest';
import { createLocalBackend, DATABASE_KEY } from './data/database';
import { initialState, reducer, type Action, type PlanState } from './model';

// Exercise the actual controller and repository without a DOM dependency.
// This deterministic hook host tests persistence decisions, not React scheduling,
// focus, native dialogs or browser storage-event delivery.
const host = vi.hoisted(() => {
  type Cell = { value: unknown; deps?: readonly unknown[]; cleanup?: () => void };
  const cells: Cell[] = [];
  let cursor = 0, changed = false;
  const effects: (() => void)[] = [];
  const sameDeps = (a: readonly unknown[] | undefined, b: readonly unknown[] | undefined) =>
    a !== undefined && b !== undefined && a.length === b.length && a.every((value, index) => Object.is(value, b[index]));
  return {
    begin() { cursor = 0; changed = false; },
    flush() { while (effects.length) effects.shift()!(); return changed; },
    reset() { cells.forEach(cell => cell.cleanup?.()); cells.length = 0; effects.length = 0; cursor = 0; changed = false; },
    useState<T>(initial: T | (() => T)): [T, (next: T | ((value: T) => T)) => void] {
      const index = cursor++;
      cells[index] ??= { value: typeof initial === 'function' ? (initial as () => T)() : initial };
      return [cells[index].value as T, next => {
        const prior = cells[index].value as T;
        const value = typeof next === 'function' ? (next as (value: T) => T)(prior) : next;
        if (!Object.is(prior, value)) { cells[index].value = value; changed = true; }
      }];
    },
    useRef<T>(initial: T) {
      const index = cursor++;
      cells[index] ??= { value: { current: initial } };
      return cells[index].value as { current: T };
    },
    useCallback<T>(callback: T, deps: readonly unknown[]) {
      const index = cursor++;
      if (!cells[index] || !sameDeps(cells[index].deps, deps)) cells[index] = { value: callback, deps };
      return cells[index].value as T;
    },
    useEffect(effect: () => void | (() => void), deps?: readonly unknown[]) {
      const index = cursor++;
      if (cells[index] && sameDeps(cells[index].deps, deps)) return;
      const cleanup = cells[index]?.cleanup;
      cells[index] = { value: null, deps };
      effects.push(() => { cleanup?.(); const next = effect(); if (next) cells[index].cleanup = next; });
    },
  };
});
vi.mock('react', () => ({ useState: host.useState, useRef: host.useRef, useCallback: host.useCallback, useEffect: host.useEffect }));
import { useWorkspace } from './useWorkspace';

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  failWrites = false;
  get length() { return this.data.size; }
  key(index: number) { return [...this.data.keys()][index] ?? null; }
  clear() { this.data.clear(); }
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { if (this.failWrites) throw new Error('Storage quota exceeded'); this.data.set(key, value); }
  removeItem(key: string) { this.data.delete(key); }
}
const apply = (state: PlanState, ...actions: Action[]) => actions.reduce(reducer, state);
function beforeConfirmation(kind: 'focus' | 'plan' | 'reflection') {
  let state = apply(initialState(),
    { type: 'go', step: 1 },
    { type: 'text', field: 'interpretation', value: 'The response uses a doubling procedure without explaining equal amounts of the same whole.' },
    { type: 'challenge' },
    { type: 'text', field: 'focus', value: 'Ask students to explain why partitioning preserves the amount of the same whole.' });
  if (kind === 'focus') return state;
  state = apply(state,
    { type: 'confirm-focus' },
    { type: 'text', field: 'action', value: 'Teachers ask students to partition equal strips and explain why the amounts remain equal.' },
    { type: 'text', field: 'owner', value: 'Grade four team' },
    { type: 'text', field: 'implementationCheck', value: 'Bring a lesson note showing how the explanation routine was used.' },
    { type: 'text', field: 'learningCheck', value: 'Compare work from equivalent tasks using the same conceptual rubric.' },
    { type: 'consent', value: true });
  if (kind === 'plan') return state;
  return apply(state, { type: 'confirm-plan' }, { type: 'go', step: 3 }, { type: 'implementation', value: 'partial' },
    { type: 'text', field: 'reflection', value: 'We need comparable dated student work and implementation records before judging this teaching move.' });
}
function setup(state: PlanState) {
  const storage = new MemoryStorage();
  const backend = createLocalBackend(() => storage);
  const initial = backend.load();
  backend.saveCycle(initial.activeCycleId, state, initial.revision);
  vi.stubGlobal('window', { localStorage: storage, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  const render = () => {
    let result: ReturnType<typeof useWorkspace>;
    let renders = 0;
    do {
      if (++renders > 20) throw new Error('Controller did not settle');
      host.begin(); result = useWorkspace();
    } while (host.flush());
    return result;
  };
  return { storage, backend, render, controller: render() };
}
afterEach(() => { host.reset(); vi.unstubAllGlobals(); });

describe('confirmation persistence', () => {
  it('saves plan approval and return to reflection together, and retains the editor on failure', () => {
    const before = { ...beforeConfirmation('plan'), reflection: 'Preserve this authored reflection while the collection arrangements are updated.' };
    const { storage, render, controller } = setup(before);
    const durable = storage.getItem(DATABASE_KEY);
    const action: Action = { type: 'confirm-plan', returnToReflection: true };
    storage.failWrites = true;
    expect(controller.dispatch(action)).toBe(false);
    let current = render();
    expect(current.state).toEqual(before);
    expect(storage.getItem(DATABASE_KEY)).toBe(durable);
    storage.failWrites = false;
    expect(current.dispatch(action)).toBe(true);
    current = render();
    expect(current.state).toEqual(reducer(before, action));
    expect(current.state?.step).toBe(3);
    expect(current.state?.reflection).toBe(before.reflection);
    const saved = JSON.parse(storage.getItem(DATABASE_KEY)!);
    expect(saved.cycles.find((cycle: { id: string }) => cycle.id === saved.activeCycleId).state).toEqual(current.state);
  });

  it.each([
    ['focus', 'confirm-focus'], ['plan', 'confirm-plan'], ['reflection', 'save-reflection'],
  ] as const)('retains the visible %s draft after a failed confirmation and requires explicit confirmation after retry', (kind, type) => {
    const before = beforeConfirmation(kind);
    const { storage, render, controller } = setup(before);
    const durable = storage.getItem(DATABASE_KEY);
    storage.failWrites = true;
    expect(controller.dispatch({ type })).toBe(false);
    let current = render();
    expect(current.state).toEqual(before);
    expect(current.state?.step).toBe(before.step);
    expect(storage.getItem(DATABASE_KEY)).toBe(durable);
    expect(current.saveError).not.toBe('');
    expect(current.dirty).toBe(false);
    storage.failWrites = false;
    expect(current.retrySave()).toBe(true);
    current = render();
    expect(current.state).toEqual(before);
    expect(current.dispatch({ type })).toBe(true);
    current = render();
    expect(current.state).toEqual(reducer(before, { type }));
    expect(current.state?.step).toBe(kind === 'reflection' ? 3 : 2);
    expect(current.saveError).toBe('');
    expect(current.dirty).toBe(false);
    expect(storage.getItem(DATABASE_KEY)).not.toBe(durable);
  });

  it('retains unsaved typing and its dirty state through a failed confirmation, then saves it on retry', () => {
    const before = beforeConfirmation('plan');
    const { storage, render, controller } = setup(before);
    const durable = storage.getItem(DATABASE_KEY);
    storage.failWrites = true;
    const action: Action = { type: 'text', field: 'owner', value: 'Grade four teaching team with facilitator' };
    expect(controller.dispatch(action)).toBe(false);
    let current = render();
    const typed = reducer(before, action);
    expect(current.state).toEqual(typed);
    expect(current.dirty).toBe(true);
    // Editing revokes consent; restore it as another unsaved draft action.
    expect(current.dispatch({ type: 'consent', value: true })).toBe(false);
    current = render();
    const draft = current.state;
    expect(current.dispatch({ type: 'confirm-plan' })).toBe(false);
    current = render();
    expect(current.state).toEqual(draft);
    expect(current.state?.planStamp).toBeNull();
    expect(current.dirty).toBe(true);
    expect(storage.getItem(DATABASE_KEY)).toBe(durable);
    storage.failWrites = false;
    expect(current.retrySave()).toBe(true);
    current = render();
    expect(current.state).toEqual(draft);
    expect(current.dirty).toBe(false);
    expect(current.dispatch({ type: 'confirm-plan' })).toBe(true);
    expect(render().state?.owner).toBe('Grade four teaching team with facilitator');
  });

  it('does not approve or overwrite a plan when another repository client has advanced the revision', () => {
    const before = beforeConfirmation('plan');
    const { storage, backend, render, controller } = setup(before);
    const other = backend.load();
    backend.renameCycle(other.activeCycleId, 'Changed in another tab', other.revision);
    const durable = storage.getItem(DATABASE_KEY);
    expect(controller.dispatch({ type: 'confirm-plan' })).toBe(false);
    let current = render();
    expect(current.state).toEqual(before);
    expect(current.externalChanged).toBe(true);
    expect(current.saveError).not.toBe('');
    expect(current.retrySave()).toBe(false);
    current = render();
    expect(current.state?.planStamp).toBeNull();
    expect(storage.getItem(DATABASE_KEY)).toBe(durable);
    expect(current.reload()).toBe(true);
    current = render();
    expect(current.snapshot?.cycles[0].title).toBe('Changed in another tab');
    expect(current.externalChanged).toBe(false);
    expect(current.dispatch({ type: 'confirm-plan' })).toBe(true);
    expect(render().state?.planStamp).not.toBeNull();
  });
});
