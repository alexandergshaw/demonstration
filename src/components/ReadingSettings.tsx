import { useEffect, useState } from 'react';
import { defaultPreferences, readPreferences, savePreferences, type ReadingPreferences } from '../preferences';
import { Modal } from './CycleManager';

const browserStorage = () => window.localStorage;
export function useReadingPreferences() {
  const [reading, setReading] = useState(() => readPreferences(browserStorage));
  useEffect(() => {
    document.documentElement.dataset.textSize = reading.value.textSize;
    document.documentElement.dataset.spacious = String(reading.value.spacious);
  }, [reading.value.textSize, reading.value.spacious]);
  const update = (value: ReadingPreferences) => setReading({ value, message: savePreferences(browserStorage, value) });
  return { ...reading, update };
}
export type ReadingController = ReturnType<typeof useReadingPreferences>;
export function ReadingSettings({ reading }: { reading: ReadingController }) {
  const [open, setOpen] = useState(false);
  return <>
    <button className="guide-button" onClick={() => setOpen(true)} aria-label="Open reading settings">Reading</button>
    {open && <Modal title="Reading settings" onClose={() => setOpen(false)}>
      <p className="guide-intro">Choose what is comfortable for you. These settings apply across your cycles and leave your planning decisions unchanged.</p>
      <div className="field-group"><label className="field" htmlFor="reading-size">Text size</label>
        <select id="reading-size" value={reading.value.textSize} onChange={event => reading.update({ ...reading.value, textSize: event.target.value as ReadingPreferences['textSize'] })}>
          <option value="standard">Standard · 100%</option><option value="large">Large · 125%</option><option value="largest">Larger · 150%</option>
        </select>
      </div>
      <label className="reading-choice"><input type="checkbox" checked={reading.value.spacious} onChange={event => reading.update({ ...reading.value, spacious: event.target.checked })} /><span>More space between lines</span></label>
      <p className="caption reading-help">You can also use your browser’s zoom and device accessibility settings. Use Tab to move between controls, Enter or Space to activate them, and Escape to close a dialog.</p>
      <p className="caption reading-status" role="status">{reading.message || 'Settings save only on this browser. No account is needed.'}</p>
      <div className="modal-actions"><button className="btn secondary" onClick={() => reading.update(defaultPreferences())}>Restore defaults</button><button className="btn" onClick={() => setOpen(false)}>Done</button></div>
    </Modal>}
  </>;
}
