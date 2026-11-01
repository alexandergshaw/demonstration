import { useEffect, useRef, useState } from 'react';
import type { ReferenceData } from '../data/seed';
import { hasPlan, type PlanState } from '../model';
import { buildMeetingKit, exportMeetingHtml, exportMeetingNotes } from '../meetingMaterials';
import { Modal } from './CycleManager';
import { Icon } from './Icon';

export function MeetingKit({ state, reference, onClose }: { state: PlanState; reference: ReferenceData; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const [downloadMessage, setDownloadMessage] = useState<{ kind: 'error' | 'status'; text: string } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const focusSection = useRef(false);
  useEffect(() => {
    // Only pagination moves focus. The select keeps its native keyboard behavior.
    if (!focusSection.current) return;
    focusSection.current = false;
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: 'start' });
  }, [index]);
  if (!hasPlan(state)) return null;
  const pages = buildMeetingKit(state, reference);
  const page = pages[index];
  const changePage = (nextIndex: number, moveFocus: boolean) => {
    focusSection.current = moveFocus;
    setIndex(nextIndex);
  };
  const download = (format: 'html' | 'text') => {
    const isHtml = format === 'html';
    const label = isHtml ? 'Meeting kit' : 'Text plan';
    let url = '';
    let anchor: HTMLAnchorElement | null = null;
    try {
      const content = isHtml ? exportMeetingHtml(state, reference) : exportMeetingNotes(state, reference);
      url = URL.createObjectURL(new Blob([content], { type: isHtml ? 'text/html;charset=utf-8' : 'text/plain;charset=utf-8' }));
      anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = isHtml ? 'Throughline_PLC_Meeting_Kit.html' : 'Throughline_PLC_Meeting_Plan.txt';
      document.body.append(anchor);
      anchor.click();
      setDownloadMessage({ kind: 'status', text: `${label} download requested. Check your browser’s downloads.` });
    } catch {
      setDownloadMessage({ kind: 'error', text: `${label} could not be downloaded. Please try again.` });
    } finally {
      anchor?.remove();
      if (url) window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };
  return <Modal title="Your approved meeting kit" onClose={onClose}>
    <div className="meeting-kit">
      <p className="guide-intro">Six presentation sections, a source packet, and a participant handout assembled from your approved plan. Your interpretation, teaching move and facilitation directions appear in the materials. Fixed discussion prompts support your decisions.</p>
      <p className="caption">Use Preview a section to jump to any part, or Previous and Next to read the kit in order. The first six sections guide the meeting; the source packet and handout give colleagues the evidence and activity. Previewing a section does not change or approve your writing.</p>
      <div className="kit-toolbar"><div><label className="field" htmlFor="kit-page">Preview a section</label><select id="kit-page" value={index} onChange={event => changePage(Number(event.target.value), false)}>{pages.map((item, i) => <option value={i} key={item.title}>{i + 1}. {item.title}</option>)}</select></div><span className="pill">50-minute PLC</span></div>
      <article className="kit-page" aria-label={page.title}>
        <p className="kicker">{page.label}</p><h3 ref={heading} tabIndex={-1}>{page.title}</h3>
        <div className="source-blocks">{page.blocks.map(block => <section key={block.heading}><h4>{block.heading}</h4><p>{block.text}</p></section>)}</div>
      </article>
      <div className="kit-pagination"><button className="btn secondary" disabled={index === 0} onClick={() => changePage(index - 1, true)}>Previous</button><span role="status">{index + 1} of {pages.length}</span><button className="btn secondary" disabled={index === pages.length - 1} onClick={() => changePage(index + 1, true)}>Next</button></div>
      <p className="caption"><strong>Choose what to take into the meeting.</strong> Download meeting kit gives you a self-contained HTML file to present offline. Open that file and use your browser’s Print command for a PDF or paper handouts. Download text plan gives you the written agenda, decisions and source excerpts for reference. Long content continues naturally; no text is truncated.</p>
      <p className="caption">Each download is a snapshot of the approved plan. If you change the plan, review and approve it again, then download a new copy. Closing this preview returns to your saved cycle; it does not mark the meeting or classroom teaching as completed.</p>
      {downloadMessage && <p className={downloadMessage.kind === 'error' ? 'form-error' : 'caption'} role={downloadMessage.kind === 'error' ? 'alert' : 'status'}>{downloadMessage.text}</p>}
      <div className="modal-actions"><button className="btn secondary" onClick={() => download('text')}>Download text plan</button><button className="btn" onClick={() => download('html')}><Icon name="download" size={16} />Download meeting kit</button></div>
    </div>
  </Modal>;
}
