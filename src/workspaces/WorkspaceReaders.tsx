import { useState } from 'react';
import { Modal } from '../components/CycleManager';
import { WorkedFollowUp } from '../components/WorkedFollowUp';
import type { ReferenceData } from '../data/seed';
import { evidenceSnapshotDescription } from '../data/evidenceSnapshots';
import { followUpSourceBlocks } from '../lessonContext';
import { hasFocus, hasPlan, hasReflection, type PlanState } from '../model';

export function DecisionHistory({ state: s, reference, unsaved, onClose }: { state: PlanState; reference: ReferenceData; unsaved: boolean; onClose: () => void }) {
  const focus = hasFocus(s), plan = hasPlan(s), reflected = hasReflection(s);
  const items = [
    { title: 'Selected evidence', status: reference.assessment.date, text: s.selected.map(id => reference.labels[id]).join('\n') },
    { title: 'Your interpretation', status: focus ? 'Confirmed' : 'Draft', text: s.interpretation },
    { title: 'Teaching focus', status: focus ? 'Confirmed' : 'Draft', text: s.focus },
    { title: 'Teaching action', status: plan ? 'Approved' : 'Draft', text: s.action },
    { title: 'Implementation check', status: plan ? 'Planned' : 'Draft', text: s.implementationCheck },
    { title: 'Learning check', status: plan ? 'Planned' : 'Draft', text: s.learningCheck },
    { title: 'Reflection', status: reflected ? 'Recorded' : 'Draft', text: s.reflection },
    { title: 'Next PLC question', status: reflected ? 'Recorded' : 'Draft', text: s.nextCycleQuestion },
  ];
  return <Modal title="Your decisions" onClose={onClose}>
    <p className="caption">{evidenceSnapshotDescription(s.evidenceVersion)}</p>
    {unsaved && <p className="dialog-error" role="alert">These decisions include unsaved changes. Approval and recorded states below apply to this in-memory draft; retry saving before leaving.</p>}
    <ol className="decision-records">{items.map(item => <li key={item.title}><div><h3>{item.title}</h3><span className="caption">{item.text.trim() ? item.status : 'Not written yet'}</span></div>{item.text.trim() && <p>{item.text}</p>}</li>)}</ol>
    <div className="modal-actions"><button className="btn secondary" onClick={onClose}>Return to workspace</button></div>
  </Modal>;
}

export function FollowUpExamples({ onClose }: { onClose: () => void }) {
  const [example, setExample] = useState<'documented' | 'incomplete'>('documented');
  return <Modal title="Worked examples" onClose={onClose}>
    <p className="caption">Separate fictional cases. These results do not belong to your current cycle.</p>
    <nav className="example-picker" aria-label="Follow-up examples">
      <button className={`btn ${example === 'documented' ? '' : 'secondary'}`} aria-pressed={example === 'documented'} onClick={() => setExample('documented')}>Documented follow-up</button>
      <button className={`btn ${example === 'incomplete' ? '' : 'secondary'}`} aria-pressed={example === 'incomplete'} onClick={() => setExample('incomplete')}>Missing evidence</button>
    </nav>
    {example === 'documented' ? <WorkedFollowUp initiallyOpen /> : <div className="source-blocks example-source-blocks">
      <h3>A higher count is not enough to conclude progress</h3>
      {followUpSourceBlocks().map(block => <section key={block.heading}><h4>{block.heading}</h4><p>{block.text}</p></section>)}
    </div>}
    <div className="modal-actions"><button className="btn secondary" onClick={onClose}>Return to my cycle</button></div>
  </Modal>;
}
