import { useEffect, useRef, useState } from 'react';
import type { ReferenceData } from '../data/seed';
import { hasPlan, type PlanState } from '../model';
import { buildMeetingKit, exportMeetingHtml } from '../meetingMaterials';
import { Modal } from './CycleManager';
import { Icon } from './Icon';

export function MeetingKit({ state, reference, onClose, downloadNotes }: { state: PlanState; reference: ReferenceData; onClose: () => void; downloadNotes: () => void }) {
  const [index, setIndex] = useState(0);
  const [error, setError] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const previousIndex = useRef(index);
  useEffect(() => {
    // Preserve the dialog's initial focus, including StrictMode's effect replay.
    if (previousIndex.current === index) return;
    previousIndex.current = index;
    heading.current?.focus({ preventScroll: true });
    heading.current?.closest('dialog')?.scrollTo({ top: 0 });
  }, [index]);
  if (!hasPlan(state)) return null;
  const pages = buildMeetingKit(state, reference);
  const page = pages[index];
  const download = () => {
    try {
      const url = URL.createObjectURL(new Blob([exportMeetingHtml(state, reference)], { type: 'text/html;charset=utf-8' }));
      const anchor = document.createElement('a');
      anchor.href = url; anchor.download = 'Throughline_PLC_Meeting_Kit.html';
      document.body.append(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setError('');
    } catch { setError('The meeting kit could not be downloaded. Please try again.'); }
  };
  return <Modal title="Your approved meeting kit" onClose={onClose}>
    <div className="meeting-kit">
      <p className="guide-intro">Six presentation sections, a source packet, and a participant handout assembled from your approved plan. Your interpretation, teaching move and facilitation directions appear in the materials. Fixed discussion prompts support your decisions.</p>
      <p className="caption">Use Preview a section to jump to any part, or Previous and Next to read the kit in order. The first six sections guide the meeting; the source packet and handout give colleagues the evidence and activity. Previewing a section does not change or approve your writing.</p>
      <div className="kit-toolbar"><div><label className="field" htmlFor="kit-page">Preview a section</label><select id="kit-page" value={index} onChange={event => setIndex(Number(event.target.value))}>{pages.map((item, i) => <option value={i} key={item.title}>{i + 1}. {item.title}</option>)}</select></div><span className="pill">50-minute PLC</span></div>
      <article className="kit-page" aria-label={page.title}>
        <p className="kicker">{page.label}</p><h3 ref={heading} tabIndex={-1}>{page.title}</h3>
        <div className="source-blocks">{page.blocks.map(block => <section key={block.heading}><h4>{block.heading}</h4><p>{block.text}</p></section>)}</div>
      </article>
      <div className="kit-pagination"><button className="btn secondary" disabled={index === 0} onClick={() => setIndex(index - 1)}>Previous</button><span role="status">{index + 1} of {pages.length}</span><button className="btn secondary" disabled={index === pages.length - 1} onClick={() => setIndex(index + 1)}>Next</button></div>
      <p className="caption"><strong>Choose what to take into the meeting.</strong> Download meeting kit gives you a self-contained HTML file to present offline. Open that file and use your browser’s Print command for a PDF or paper handouts. Download text plan gives you the written agenda, decisions and source excerpts for reference. Long content continues naturally; no text is truncated.</p>
      <p className="caption">Each download is a snapshot of the approved plan. If you change the plan, review and approve it again, then download a new copy. Closing this preview returns to your saved cycle; it does not mark the meeting or classroom teaching as completed.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions"><button className="btn secondary" onClick={downloadNotes}>Download text plan</button><button className="btn" onClick={download}><Icon name="download" size={16} />Download meeting kit</button></div>
    </div>
  </Modal>;
}
