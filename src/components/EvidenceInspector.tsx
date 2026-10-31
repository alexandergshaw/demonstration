import { useState } from 'react';
import type { ReferenceData } from '../data/seed';
import type { PlanState } from '../model';
import { lessonContext, selectedSourceBlocks, taskBlocks } from '../lessonContext';
import { Modal } from './CycleManager';
import { Icon } from './Icon';

export function TaskContext() {
  return <details className="task-context">
    <summary>Inspect the lesson, original prompt & scoring criteria</summary>
    <div className="source-blocks">{taskBlocks().map(block => <section key={block.heading}><h3>{block.heading}</h3><p>{block.text}</p></section>)}</div>
  </details>;
}
export function EvidenceInspector({ state, reference, showQuotes = false }: { state: PlanState; reference: ReferenceData; showQuotes?: boolean }) {
  const [open, setOpen] = useState(false);
  const responses = reference.responses.filter(response => state.selected.includes(response.id));
  const observation = state.selected.includes('observation') ? reference.observation : null;
  return <div className="evidence-inspector">
    {showQuotes && (responses.length > 0 || observation) && <div className="selected-source-strip" aria-label="Selected source excerpts">
      {responses.map(response => <div key={response.id}><span className="caption">{response.label} · {reference.assessment.date}</span><blockquote>“{response.quote}”</blockquote></div>)}
      {observation && <div><span className="caption">{observation.date} · {observation.scope} · Historical context</span><blockquote>“{observation.quote}”</blockquote><p className="caption">{observation.caution}</p></div>}
    </div>}
    <button className="textlink" onClick={() => setOpen(true)}><Icon name="evidence" size={16} />Inspect selected evidence & task</button>
    {open && <Modal title="Evidence & original task" onClose={() => setOpen(false)}>
      <div className="source-reader source-blocks">
        <p className="caption">All sources are fictional. Close this reader to return to your unchanged draft.</p>
        {[...taskBlocks(), ...selectedSourceBlocks(reference, state.selected)].map(block => <section key={block.heading}><h3>{block.heading}</h3><p>{block.text}</p></section>)}
        {!observation && <p className="caption">The {reference.observation.date} observation is not selected. Add it on Evidence if your team needs that historical context.</p>}
        <p className="caption">{lessonContext.provenance}</p>
      </div>
      <div className="modal-actions"><button className="btn" data-autofocus onClick={() => setOpen(false)}>Return to my draft</button></div>
    </Modal>}
  </div>;
}
