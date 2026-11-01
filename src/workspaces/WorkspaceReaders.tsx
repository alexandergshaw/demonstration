import { useState } from 'react';
import { Modal } from '../components/CycleManager';
import { WorkedFollowUp } from '../components/WorkedFollowUp';
import type { ReferenceData } from '../data/seed';
import { evidenceSnapshotDescription } from '../data/evidenceSnapshots';
import { followUpSourceBlocks } from '../lessonContext';
import { hasFocus, hasPlan, hasReflection, type PlanState } from '../model';

export function DecisionHistory({ state: s, reference, unsaved, onClose, cycleTitle, onNavigate }: {
  state: PlanState;
  reference: ReferenceData;
  unsaved: boolean;
  onClose: () => void;
  cycleTitle?: string;
  onNavigate?: (step: number) => void;
}) {
  const focus = hasFocus(s), plan = hasPlan(s), reflected = hasReflection(s);
  const implementation = s.implementation === 'yes' ? 'Used as planned' : s.implementation === 'partial' ? 'Partially used' : s.implementation === 'no' ? 'Not yet used' : '';
  const collection = [
    s.evidenceCollector.trim() ? `Who will collect: ${s.evidenceCollector}` : '',
    s.collectionDate ? `Planned collection: ${s.collectionDate}` : '',
    s.reviewDate ? `Planned review: ${s.reviewDate}` : '',
  ].filter(Boolean).join('\n');
  const items = [
    { title: 'Selected evidence', status: reference.assessment.date, text: s.selected.map(id => reference.labels[id]).join('\n') },
    { title: 'Your interpretation', status: focus ? 'Confirmed' : 'Draft', text: s.interpretation },
    { title: 'Teaching focus', status: focus ? 'Confirmed' : 'Draft', text: s.focus },
    { title: 'Teaching action', status: plan ? 'Approved' : 'Draft', text: s.action },
    ...(s.action.trim() ? [{ title: 'Who planned to try it', status: plan ? 'Agreed owner' : 'Draft', text: s.owner }] : []),
    { title: 'Implementation check', status: plan ? 'Planned' : 'Draft', text: s.implementationCheck },
    { title: 'Learning check', status: plan ? 'Planned' : 'Draft', text: s.learningCheck },
    ...(collection ? [{ title: 'Collection arrangements', status: plan ? 'Planned, not collected' : 'Draft arrangements', text: collection }] : []),
    ...(s.accessParticipation.trim() ? [{ title: 'Access and participation', status: plan ? 'Planned' : 'Draft', text: s.accessParticipation }] : []),
    { title: 'Teaching attempt', status: reflected ? 'Recorded report' : 'Draft report', text: implementation },
    { title: 'Reflection', status: reflected ? 'Recorded' : 'Draft', text: s.reflection },
    ...(s.nextCycleQuestion.trim() ? [{ title: 'Next PLC question', status: reflected ? 'Recorded' : 'Draft', text: s.nextCycleQuestion }] : []),
  ];
  const written = items.filter(item => item.text.trim());
  const missing = items.filter(item => !item.text.trim());
  const destinations = [
    { step: 0, label: 'Revisit evidence', available: true },
    { step: 1, label: 'Revisit interpretation', available: true },
    { step: 2, label: 'Review meeting plan', available: focus },
    { step: 3, label: 'Review reflection', available: plan },
  ];
  return <Modal title="Your decisions" onClose={onClose}>
    {cycleTitle && <p className="caption"><strong>{cycleTitle}</strong></p>}
    <p className="caption">{evidenceSnapshotDescription(s.evidenceVersion)}</p>
    <p className="caption">Current draft and confirmation states for this cycle. Earlier versions are not retained here. An implementation report is separate from evidence of student learning.</p>
    {unsaved && <p className="dialog-error" role="alert">These decisions include unsaved changes. Approval and recorded states below apply to this in-memory draft; retry saving before leaving.</p>}
    {onNavigate && <>
      <div className="button-group modal-actions" role="group" aria-label="Revisit a decision">
        {destinations.map(destination => <button type="button" className="btn secondary compact" key={destination.step} disabled={!destination.available} onClick={() => onNavigate(destination.step)}>{destination.label}</button>)}
      </div>
      {!focus && <p className="caption">Confirm a teaching focus in Interpret to open the meeting plan.</p>}
      {!plan && <p className="caption">Approve the current meeting plan before opening Reflection.</p>}
    </>}
    <ol className="decision-records">{written.map(item => <li key={item.title}><div><h3>{item.title}</h3><span className="caption">{item.status}</span></div><p>{item.text}</p></li>)}</ol>
    {missing.length > 0 && <details className="support-disclosure">
      <summary>Not recorded yet · {missing.length} parts</summary>
      <p className="caption">Blank parts do not count as recorded decisions. Complete them in their workspace when you reach that stage.</p>
      <ul>{missing.map(item => <li key={item.title}>{item.title}</li>)}</ul>
    </details>}
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
