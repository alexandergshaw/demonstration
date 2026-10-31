import { useState } from 'react';
import type { ReferenceData } from '../data/seed';
import type { PlanState } from '../model';
import { lessonContext, selectedSourceBlocks, taskBlocks } from '../lessonContext';
import { Modal } from './CycleManager';
import { Icon } from './Icon';

export function LearningGoal() {
  return <section className="learning-goal-context" aria-label="Lesson learning goal">
    <p className="context-label">Learning goal <span className="caption">Fictional lesson</span></p>
    <p className="lesson-goal">{lessonContext.goal}</p>
    <details className="task-context">
      <summary>Inspect task & rubric</summary>
      <div className="source-blocks"><section><h3>Lesson context · prototype assumption</h3><p>{lessonContext.provenance + '\n' + lessonContext.lesson}</p></section>{taskBlocks().slice(1).map(block => <section key={block.heading}><h3>{block.heading}</h3><p>{block.text}</p></section>)}</div>
    </details>
  </section>;
}

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
  const excerptCount = responses.length + (observation ? 1 : 0);
  return <div className="evidence-inspector">
    <ul className="selected-source-list" aria-label="Selected sources">{state.selected.map(id => <li key={id}>{reference.labels[id]}</li>)}</ul>
    {showQuotes && excerptCount > 0 && <details className="source-excerpts support-disclosure">
      <summary>Selected source excerpts <span className="disclosure-meta">{excerptCount} {excerptCount === 1 ? 'excerpt' : 'excerpts'}</span></summary>
      <div className="selected-source-strip" aria-label="Selected source excerpts">
      {responses.map(response => <div key={response.id}><span className="caption">{response.label} · {reference.assessment.date}</span><blockquote>“{response.quote}”</blockquote></div>)}
      {observation && <div><span className="caption">{observation.date} · {observation.scope} · Historical context</span><blockquote>“{observation.quote}”</blockquote><p className="caption">{observation.caution}</p></div>}
      </div>
    </details>}
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
