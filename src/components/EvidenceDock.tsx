import { useEffect, useId, useRef, useState } from 'react';
import type { ReferenceData } from '../data/seed';
import { lessonContext } from '../lessonContext';
import type { EvidenceId, PlanState } from '../model';
import { Icon } from './Icon';
import './EvidenceDock.css';

type SourceView = EvidenceId | 'task';

/** The same source stays available while the educator writes; this is not a dialog. */
export function EvidenceDock({ state, reference }: { state: PlanState; reference: ReferenceData }) {
  const selectedResponses = reference.responses.filter(response => state.selected.includes(response.id));
  const fallback: SourceView = selectedResponses[0]?.id ?? 'assessment';
  const [requestedView, setRequestedView] = useState<SourceView>(fallback);
  const [compactOpen, setCompactOpen] = useState(false);
  const dock = useRef<HTMLElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const sourcePicker = useRef<HTMLSelectElement>(null);
  const regionId = useId();
  const headingId = useId();
  const pickerId = useId();
  const view = requestedView === 'task' || state.selected.includes(requestedView) ? requestedView : fallback;
  const response = selectedResponses.find(item => item.id === view);
  const { assessment, observation } = reference;
  const closeCompact = () => {
    setCompactOpen(false);
    trigger.current?.focus({ preventScroll: true });
  };
  const openCompact = () => {
    setCompactOpen(true);
    window.requestAnimationFrame(() => sourcePicker.current?.focus({ preventScroll: true }));
  };
  useEffect(() => {
    if (!compactOpen) return;
    const isCompact = () => Boolean(trigger.current?.getClientRects().length);
    const leaveEvidence = (event: Event) => {
      if (isCompact() && event.target instanceof Node && !dock.current?.contains(event.target)) {
        // Returning to the draft keeps that control focused and exposes it immediately.
        setCompactOpen(false);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (isCompact() && event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault();
        setCompactOpen(false);
        trigger.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener('focusin', leaveEvidence);
    document.addEventListener('pointerdown', leaveEvidence);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('focusin', leaveEvidence);
      document.removeEventListener('pointerdown', leaveEvidence);
      document.removeEventListener('keydown', escape);
    };
  }, [compactOpen]);

  return <section ref={dock} className="evidence-dock" aria-label="Evidence beside your draft">
    <button ref={trigger} type="button" className="evidence-dock-toggle" aria-expanded={compactOpen} aria-controls={regionId}
      onClick={() => compactOpen ? closeCompact() : openCompact()}>
      <Icon name="evidence" size={18} />{compactOpen ? 'Hide evidence' : 'View evidence'}
      <span>{assessment.date}</span>
    </button>
    <div id={regionId} className={`evidence-dock-panel${compactOpen ? ' evidence-dock-open' : ''}`} role="region" aria-labelledby={headingId}>
      <div className="evidence-dock-heading">
        <div><p className="evidence-dock-eyebrow">Fictional evidence · {assessment.date}</p><h2 id={headingId}>Compare as you write</h2></div>
        <button type="button" className="evidence-dock-close icon-button" aria-label="Close evidence and return to its toggle" onClick={closeCompact}><Icon name="close" size={18} /></button>
      </div>
      <div className="evidence-dock-scroll">
        <label className="evidence-dock-label" htmlFor={pickerId}>Source to inspect</label>
        <select id={pickerId} ref={sourcePicker} value={view} onChange={event => setRequestedView(event.target.value as SourceView)}>
          <option value="assessment">Student results · {assessment.date}</option>
          {selectedResponses.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
          {state.selected.includes('observation') && <option value="observation">Observation · {observation.date}</option>}
          <option value="task">Original task & rubric</option>
        </select>
        {view === 'assessment' && <div className="evidence-dock-source">
          <p className="evidence-dock-source-date">{assessment.date} · {assessment.total} responses</p>
          <figure className="evidence-dock-chart" aria-label="Correct answers and adequate explanations on the same count scale">
            {[
              { label: 'Correct fraction', count: assessment.correct, kind: 'answer' },
              { label: 'Adequate explanation', count: assessment.explanations, kind: 'explanation' },
            ].map(item => <div key={item.kind} className={`evidence-dock-metric evidence-dock-${item.kind}`}>
              <div><span>{item.label}</span><strong>{item.count}/{assessment.total}</strong></div>
              <div className="evidence-dock-bar" aria-hidden="true"><i style={{ width: `${item.count / assessment.total * 100}%` }} /></div>
            </div>)}
            <figcaption>Aggregate counts do not identify which students met both criteria.</figcaption>
          </figure>
          <details className="evidence-dock-detail"><summary>Compare the four classes</summary><ul className="evidence-dock-class-list">{reference.classes.map(item => <li key={item.id}><strong>{item.label}</strong><span>{item.correct}/{item.total} correct · {item.explanations}/{item.total} adequate explanations</span></li>)}</ul><p>Descriptive counts, not a measure of teacher effectiveness.</p></details>
        </div>}
        {response && <div className="evidence-dock-source">
          <p className="evidence-dock-source-date">{response.label} · {assessment.date}</p>
          <blockquote>“{response.quote}”</blockquote>
          <p className="evidence-dock-limit">Illustrative response, not a representative sample. What in the work supports your interpretation?</p>
          <details className="evidence-dock-detail"><summary>Consider a possible interpretation</summary><p>{response.interpretation}</p></details>
        </div>}
        {view === 'observation' && <div className="evidence-dock-source">
          <p className="evidence-dock-source-date">{observation.date} · {observation.age}</p>
          <p className="evidence-dock-scope">Historical context · {observation.scope}</p>
          <blockquote>“{observation.quote}”</blockquote>
          <p className="evidence-dock-limit">{observation.caution}</p>
        </div>}
        {view === 'task' && <div className="evidence-dock-source"><h3>Original cool-down prompt</h3><p>{lessonContext.prompt}</p></div>}
        <details className="evidence-dock-detail" key={view === 'task' ? 'task-open' : 'task-closed'} open={view === 'task' || undefined}>
          <summary>{view === 'task' ? 'Scoring criteria' : 'Inspect original task & rubric'}</summary>
          {view !== 'task' && <p>{lessonContext.prompt}</p>}
          <p>{lessonContext.selection}</p><p>{lessonContext.rubric}</p>
        </details>
        <p className="evidence-dock-footnote">Name the source in your explanation. Keep what you observe separate from what you infer.</p>
      </div>
    </div>
  </section>;
}
