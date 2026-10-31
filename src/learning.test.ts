import { describe, expect, it } from 'vitest';
import {
  defaultLearningProgress, LEARNING_KEY, learningReducer, parseLearningProgress,
  readLearningProgress, saveLearningProgress,
  type LearningAction, type LearningProgress,
} from './learning';
import { DATABASE_KEY } from './data/database';
import { PREFERENCES_KEY } from './preferences';

class MemoryStorage {
  data = new Map<string, string>();
  writes = 0;
  getItem(key: string) { return this.data.get(key) ?? null; }
  setItem(key: string, value: string) { this.data.set(key, value); this.writes++; }
}
const encoded = (progress: LearningProgress) => JSON.stringify({ version: 1, ...progress });
const apply = (progress: LearningProgress, ...actions: LearningAction[]) => actions.reduce(learningReducer, progress);

describe('optional learning progress', () => {
  it('tracks visits, explicit review and practice independently without invented completion', () => {
    const start = defaultLearningProgress();
    const visited = learningReducer(start, { type: 'visitLesson', lesson: 3 });
    expect(visited.lastLesson).toBe(3);
    expect(visited.reviewedLessons).toEqual([]);
    expect(visited.practiced).toEqual([]);
    const reviewed = apply(visited,
      { type: 'reviewLesson', lesson: 3 }, { type: 'practice', id: 'aggregate' },
      { type: 'reviewLesson', lesson: 3 }, { type: 'practice', id: 'aggregate' },
      { type: 'visitLesson', lesson: 1 }, { type: 'dismissWelcome' });
    expect(reviewed).toEqual({ welcomeDismissed: true, lastLesson: 1, reviewedLessons: [3], practiced: ['aggregate'] });
    expect(start).toEqual(defaultLearningProgress());
    expect(Object.keys(reviewed).sort()).toEqual(['lastLesson', 'practiced', 'reviewedLessons', 'welcomeDismissed']);
  });

  it('composes a rapid visit and review without losing the resume point or reviewed topics', () => {
    const state = apply(defaultLearningProgress(), { type: 'visitLesson', lesson: 2 }, { type: 'reviewLesson', lesson: 2 }, { type: 'visitLesson', lesson: 3 });
    expect(state.lastLesson).toBe(3);
    expect(state.reviewedLessons).toEqual([2]);
  });

  it('ignores invalid lesson and exercise identifiers at the event boundary', () => {
    const start = defaultLearningProgress();
    expect(learningReducer(start, { type: 'visitLesson', lesson: 99 } as unknown as LearningAction)).toBe(start);
    expect(learningReducer(start, { type: 'reviewLesson', lesson: -1 } as unknown as LearningAction)).toBe(start);
    expect(learningReducer(start, { type: 'practice', id: 'invented' } as unknown as LearningAction)).toBe(start);
  });
});

describe('learning storage stays separate from the planning database', () => {
  it('reads a first visit without creating a record, then restores dismissal, review and resume', () => {
    const storage = new MemoryStorage();
    expect(readLearningProgress(() => storage)).toEqual({ progress: defaultLearningProgress(), message: '' });
    expect(storage.writes).toBe(0);
    const progress = apply(defaultLearningProgress(), { type: 'dismissWelcome' }, { type: 'reviewLesson', lesson: 1 }, { type: 'practice', id: 'historical' });
    const saved = saveLearningProgress(() => storage, progress);
    expect(saved.message).toMatch(/saved on this browser/i);
    expect(readLearningProgress(() => storage).progress).toEqual(progress);
    expect(storage.writes).toBe(1);
  });

  it('never reads or writes cycle decisions or reading settings while saving learning progress', () => {
    const storage = new MemoryStorage();
    const cycleBytes = '{"sentinel":"educator-owned plan and approvals"}';
    const settingsBytes = '{"sentinel":"chosen reading settings"}';
    storage.data.set(DATABASE_KEY, cycleBytes);
    storage.data.set(PREFERENCES_KEY, settingsBytes);
    const touched: string[] = [];
    const adapter = {
      getItem: (key: string) => { touched.push(key); return storage.getItem(key); },
      setItem: (key: string, value: string) => { touched.push(key); storage.setItem(key, value); },
    };
    saveLearningProgress(() => adapter, apply(defaultLearningProgress(), { type: 'reviewLesson', lesson: 3 }, { type: 'practice', id: 'checks' }));
    expect(new Set(touched)).toEqual(new Set([LEARNING_KEY]));
    expect(storage.getItem(DATABASE_KEY)).toBe(cycleBytes);
    expect(storage.getItem(PREFERENCES_KEY)).toBe(settingsBytes);
  });

  it('keeps reviewed and practiced topics from another tab while applying the latest explicit visit', () => {
    const storage = new MemoryStorage();
    const firstTab = apply(defaultLearningProgress(), { type: 'reviewLesson', lesson: 0 }, { type: 'practice', id: 'aggregate' }, { type: 'dismissWelcome' });
    const secondTab = apply(defaultLearningProgress(), { type: 'reviewLesson', lesson: 2 }, { type: 'practice', id: 'checks' });
    saveLearningProgress(() => storage, firstTab);
    const merged = saveLearningProgress(() => storage, secondTab);
    expect(merged.progress).toEqual({ welcomeDismissed: true, lastLesson: 2, reviewedLessons: [0, 2], practiced: ['aggregate', 'checks'] });
    expect(readLearningProgress(() => storage).progress).toEqual(merged.progress);
  });

  it.each([
    ['malformed JSON', '{broken'],
    ['future version', JSON.stringify({ version: 2, ...defaultLearningProgress() })],
    ['duplicate lessons', JSON.stringify({ version: 1, ...defaultLearningProgress(), reviewedLessons: [0, 0] })],
    ['invalid lesson', JSON.stringify({ version: 1, ...defaultLearningProgress(), lastLesson: 8 })],
    ['invalid exercise', JSON.stringify({ version: 1, ...defaultLearningProgress(), practiced: ['invented'] })],
    ['duplicate exercises', JSON.stringify({ version: 1, ...defaultLearningProgress(), practiced: ['checks', 'checks'] })],
    ['wrong scalar type', JSON.stringify({ version: 1, ...defaultLearningProgress(), welcomeDismissed: 'yes' })],
    ['oversized record', ' '.repeat(2001) + encoded(defaultLearningProgress())],
  ])('preserves %s and permits session-only learning', (_description, raw) => {
    const storage = new MemoryStorage();
    storage.data.set(LEARNING_KEY, raw);
    const loaded = readLearningProgress(() => storage);
    expect(loaded.progress).toEqual(defaultLearningProgress());
    expect(loaded.message).toMatch(/could not be read/i);
    const local = apply(loaded.progress, { type: 'dismissWelcome' }, { type: 'reviewLesson', lesson: 1 });
    const saved = saveLearningProgress(() => storage, local);
    expect(saved.progress).toEqual(local);
    expect(saved.message).toMatch(/page only/i);
    expect(storage.getItem(LEARNING_KEY)).toBe(raw);
    expect(storage.writes).toBe(0);
  });

  it('rechecks storage before saving if a newer app replaces the record after load', () => {
    const storage = new MemoryStorage();
    const loaded = readLearningProgress(() => storage);
    const future = '{"version":5,"future":"preserve"}';
    storage.data.set(LEARNING_KEY, future);
    const saved = saveLearningProgress(() => storage, learningReducer(loaded.progress, { type: 'reviewLesson', lesson: 2 }));
    expect(saved.progress.reviewedLessons).toEqual([2]);
    expect(saved.message).toMatch(/left unchanged/i);
    expect(storage.getItem(LEARNING_KEY)).toBe(future);
    expect(storage.writes).toBe(0);
  });

  it('retains in-memory progress when storage is blocked and composes later local actions', () => {
    const blocked = () => { throw new Error('Blocked'); };
    const loaded = readLearningProgress(blocked);
    const first = saveLearningProgress(blocked, learningReducer(loaded.progress, { type: 'reviewLesson', lesson: 1 }));
    const second = saveLearningProgress(blocked, learningReducer(first.progress, { type: 'practice', id: 'checks' }));
    expect(second.progress.reviewedLessons).toEqual([1]);
    expect(second.progress.practiced).toEqual(['checks']);
    expect(second.message).toMatch(/page only/i);
  });

  it('reports quota failure without replacing the last saved record or discarding the current lesson', () => {
    const storage = new MemoryStorage();
    const original = encoded(defaultLearningProgress());
    storage.data.set(LEARNING_KEY, original);
    const adapter = { getItem: (key: string) => storage.getItem(key), setItem: () => { throw new DOMException('Full', 'QuotaExceededError'); } };
    const local = apply(defaultLearningProgress(), { type: 'reviewLesson', lesson: 2 }, { type: 'practice', id: 'aggregate' });
    const result = saveLearningProgress(() => adapter, local);
    expect(result.progress).toEqual(local);
    expect(result.message).toMatch(/unavailable or full/i);
    expect(storage.getItem(LEARNING_KEY)).toBe(original);
  });

  it('rejects invalid writes and serializes only the allowed progress fields', () => {
    const storage = new MemoryStorage();
    const invalid = { ...defaultLearningProgress(), reviewedLessons: [7] } as unknown as LearningProgress;
    expect(saveLearningProgress(() => storage, invalid).message).toMatch(/invalid/i);
    expect(storage.writes).toBe(0);
    const extra = { ...defaultLearningProgress(), answerText: 'This must not be persisted', planStamp: 'This must not be persisted' };
    saveLearningProgress(() => storage, extra);
    const saved = storage.getItem(LEARNING_KEY)!;
    expect(saved).not.toContain('answerText');
    expect(saved).not.toContain('planStamp');
    expect(parseLearningProgress(saved)).toEqual(defaultLearningProgress());
  });
});
