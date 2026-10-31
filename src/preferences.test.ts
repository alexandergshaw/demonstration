import { describe, expect, it } from 'vitest';
import { defaultPreferences, PREFERENCES_KEY, readPreferences, savePreferences } from './preferences';

function storage(raw: string | null = null) {
  const values = new Map<string, string>([['throughline.database.v1', 'untouched-cycle-record']]);
  if (raw !== null) values.set(PREFERENCES_KEY, raw);
  return { values, getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
}
describe('reading preferences independent of instructional decisions', () => {
  it('does not write defaults on load', () => {
    const store = storage();
    expect(readPreferences(() => store)).toEqual({ value: defaultPreferences(), message: '' });
    expect(store.values.has(PREFERENCES_KEY)).toBe(false);
  });
  it('persists both options, restores defaults, and never touches cycle bytes', () => {
    const store = storage();
    expect(savePreferences(() => store, { textSize: 'largest', spacious: true })).toContain('saved');
    expect(readPreferences(() => store).value).toEqual({ textSize: 'largest', spacious: true });
    savePreferences(() => store, defaultPreferences());
    expect(readPreferences(() => store).value).toEqual(defaultPreferences());
    expect(store.values.get('throughline.database.v1')).toBe('untouched-cycle-record');
  });
  it.each(['{', 'null', '[]', '{"version":2,"textSize":"large","spacious":false}', '{"version":1,"textSize":"huge","spacious":true}', '{"version":1,"textSize":"standard","spacious":"yes"}', 'x'.repeat(501)])('preserves unreadable/unsupported bytes on load and explicit save: %s', raw => {
    const store = storage(raw);
    expect(readPreferences(() => store).message).not.toBe('');
    expect(savePreferences(() => store, { textSize: 'large', spacious: true })).toContain('page only');
    expect(store.values.get(PREFERENCES_KEY)).toBe(raw);
  });
  it('rechecks an unsupported record introduced after initial load', () => {
    const store = storage();
    readPreferences(() => store);
    const newer = '{"version":3}';
    store.setItem(PREFERENCES_KEY, newer);
    expect(savePreferences(() => store, defaultPreferences())).toContain('page only');
    expect(store.getItem(PREFERENCES_KEY)).toBe(newer);
  });
  it('survives denied access without promising persistence', () => {
    const denied = () => { throw new Error('denied'); };
    expect(readPreferences(denied).value).toEqual(defaultPreferences());
    expect(savePreferences(denied, defaultPreferences())).toContain('page only');
  });
  it('preserves the previous settings when quota rejects a write', () => {
    const store = storage('{"version":1,"textSize":"large","spacious":false}');
    const full = { ...store, setItem: () => { throw new Error('quota'); } };
    expect(savePreferences(() => full, { textSize: 'largest', spacious: true })).toContain('will not survive a reload');
    expect(readPreferences(() => store).value.textSize).toBe('large');
  });
});
