export const PREFERENCES_KEY = 'throughline.reading.v1';
export type ReadingPreferences = { textSize: 'standard' | 'large' | 'largest'; spacious: boolean };
export const defaultPreferences = (): ReadingPreferences => ({ textSize: 'standard', spacious: false });
type StorageGetter = () => Pick<Storage, 'getItem' | 'setItem'>;
export function readPreferences(getStorage: StorageGetter): { value: ReadingPreferences; message: string } {
  try {
    const raw = getStorage().getItem(PREFERENCES_KEY);
    if (raw === null) return { value: defaultPreferences(), message: '' };
    if (raw.length > 500) throw new Error('Invalid preferences');
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid preferences');
    const input = data as Record<string, unknown>;
    if (input.version !== 1 || !['standard', 'large', 'largest'].includes(input.textSize as string) || typeof input.spacious !== 'boolean') throw new Error('Unsupported preferences');
    return { value: { textSize: input.textSize as ReadingPreferences['textSize'], spacious: input.spacious }, message: '' };
  } catch {
    return { value: defaultPreferences(), message: 'Saved reading settings could not be read. Their stored copy has not been changed.' };
  }
}
export function savePreferences(getStorage: StorageGetter, value: ReadingPreferences): string {
  // Recheck before every explicit save: another tab or a newer app may have replaced this record.
  if (readPreferences(getStorage).message) return 'Settings apply to this page only. The existing saved settings could not be read and were left unchanged.';
  try {
    getStorage().setItem(PREFERENCES_KEY, JSON.stringify({ version: 1, ...value }));
    return 'Reading settings saved on this browser.';
  } catch {
    return 'Settings apply to this page only. Browser storage is unavailable or full; these changes will not survive a reload.';
  }
}
