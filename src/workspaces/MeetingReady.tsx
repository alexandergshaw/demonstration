import { Icon } from '../components/Icon';
import { TaskExplanation } from '../components/TaskExplanation';
import { CollectionSummary } from '../components/CollectionSummary';
import { WorkflowActions } from '../components/WorkflowActions';
import { StageChecklist } from '../components/StageChecklist';
import { hasPlan, type PlanState } from '../model';
import { planChecklistItems } from './planChecklist';
import type { PlanTaskEntry } from './PlanWorkspace';
import './MeetingReady.css';

interface MeetingReadyProps {
  state: PlanState;
  onOpenKit: () => void;
  onEditPlan: () => void;
  onEditTask?: (task: PlanTaskEntry) => void;
  onReflect: () => void;
  onEditCollection: () => void;
}

export function MeetingReady({ state, onOpenKit, onEditPlan, onEditTask, onReflect, onEditCollection }: MeetingReadyProps) {
  if (!hasPlan(state)) return <section className="meeting-ready meeting-ready-unapproved">
    <h2>Review your meeting plan first.</h2>
    <p>Your current draft needs approval before meeting materials are ready.</p>
    <button className="btn" onClick={onEditPlan}>Return to the plan<Icon name="arrow" size={17} /></button>
  </section>;

  const collectionIncomplete = !state.evidenceCollector.trim() || !state.collectionDate || !state.reviewDate;
  const editTask = (task: PlanTaskEntry) => onEditTask ? onEditTask(task) : onEditPlan();
  return <div className="meeting-ready">
    <StageChecklist title="Plan checklist" description="Your plan is approved. Revisit a task or open the kit to prepare for the meeting."
      items={planChecklistItems(state, { move: () => editTask('move'), activities: () => editTask('activities'), implementation: () => editTask('implementation'), learning: () => editTask('learning'), collection: onEditCollection, review: () => editTask('review') })}
      note="The required planning tasks are complete. Collection arrangements remain optional; this does not report that the meeting or lesson has happened." />
    <section className="meeting-ready-materials" aria-labelledby="meeting-ready-materials-title">
      <div><h2 id="meeting-ready-materials-title">Take the plan into your meeting.</h2><p>Open your reviewed agenda, activities and source packet to present, print or export. The kit uses your approved writing, including the directions you gave each activity; it does not generate a new teaching decision.</p></div>
      <button className="btn" onClick={onOpenKit}><Icon name="book" size={18} />Open meeting kit<Icon name="arrow" size={17} /></button>
    </section>

    <section className="meeting-ready-move" aria-labelledby="meeting-ready-move-title">
      <div className="meeting-ready-heading"><p className="meeting-ready-status"><Icon name="check" size={17} />Plan approved by you</p><button className="textlink" onClick={onEditPlan}><Icon name="pencil" size={15} />Edit plan</button></div>
      <h2 id="meeting-ready-move-title">The move you will bring to the team</h2>
      <p className="meeting-ready-action">{state.action}</p>
      <p className="meeting-ready-owner">Who will try it · {state.owner}</p>
    </section>

    <TaskExplanation headingLevel="h2" title="Use the kit, then gather evidence" disclosureLabel="How to use your meeting kit"
      why="Approval finishes preparation in Throughline. The meeting and classroom attempt happen next, so this screen is a handoff into the team’s work."
      steps={[
        { label: 'Prepare the materials', detail: 'Open meeting kit to review the six presentation sections, source packet and participant activity. Print or download the materials your team will need.' },
        { label: 'Lead the conversation', detail: 'Use your directions to examine the evidence, test the interpretation and rehearse the teaching move. Agree who will try it and finalize the collection arrangements below.' },
        { label: 'Try the move and keep a record', detail: 'After the lesson, gather the implementation record and dated student work. Bring both to the team before deciding whether to continue or adjust the move.' },
      ]}
      handoff="Downloads are snapshots of this approved plan. If you change a decision, review and approve again, then export a fresh copy." />

    <section className="meeting-ready-collection" aria-labelledby="meeting-ready-collection-title">
      <div className="meeting-ready-heading"><h2 id="meeting-ready-collection-title">What to bring back after the lesson</h2><button className="textlink" onClick={onEditCollection}>Edit collection details<Icon name="pencil" size={15} /></button></div>
      <p className="meeting-ready-explanation">Keep these two kinds of evidence separate: one describes what teachers tried; the other reveals students’ reasoning. The entries below are your collection plans, not results already gathered by Throughline.</p>
      <div className="meeting-ready-checks">
        <div><h3>Evidence the move happened</h3><p>{state.implementationCheck}</p></div>
        <div><h3>Evidence of student reasoning</h3><p>{state.learningCheck}</p></div>
      </div>
      <CollectionSummary state={state} />
      <p className="meeting-ready-note">{collectionIncomplete ? 'The meeting plan is approved. Agree the remaining collection details with your team.' : 'These are your team’s planned commitments. Collected follow-up evidence is still needed.'}</p>
    </section>

    <WorkflowActions label="After the lesson"
      description={<><h2>After the lesson</h2><p>Return to report whether the move was used as planned, partially used or not yet used. Then record the supported next decision, including an action, owner and review point. If the move was not tried or evidence is missing, explain the barrier and what to gather next.</p></>}
      primary={{ label: 'Go to reflection', onClick: onReflect, arrow: true }} />
  </div>;
}
