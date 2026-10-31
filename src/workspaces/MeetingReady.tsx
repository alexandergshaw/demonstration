import { Icon } from '../components/Icon';
import { hasPlan, type PlanState } from '../model';
import './MeetingReady.css';

interface MeetingReadyProps {
  state: PlanState;
  onOpenKit: () => void;
  onEditPlan: () => void;
  onReflect: () => void;
  onEditCollection: () => void;
}

export function MeetingReady({ state, onOpenKit, onEditPlan, onReflect, onEditCollection }: MeetingReadyProps) {
  if (!hasPlan(state)) return <section className="meeting-ready meeting-ready-unapproved">
    <h2>Review your meeting plan first.</h2>
    <p>Your current draft needs approval before meeting materials are ready.</p>
    <button className="btn" onClick={onEditPlan}>Return to the plan<Icon name="arrow" size={17} /></button>
  </section>;

  const collectionIncomplete = !state.evidenceCollector.trim() || !state.collectionDate || !state.reviewDate;
  return <div className="meeting-ready">
    <section className="meeting-ready-move" aria-labelledby="meeting-ready-move-title">
      <div className="meeting-ready-heading"><p className="meeting-ready-status"><Icon name="check" size={17} />Plan approved by you</p><button className="textlink" onClick={onEditPlan}><Icon name="pencil" size={15} />Edit plan</button></div>
      <h2 id="meeting-ready-move-title">The move you will bring to the team</h2>
      <p className="meeting-ready-action">{state.action}</p>
      <p className="meeting-ready-owner">Who will try it · {state.owner}</p>
    </section>

    <section className="meeting-ready-materials" aria-labelledby="meeting-ready-materials-title">
      <div><h2 id="meeting-ready-materials-title">Take the plan into your meeting.</h2><p>Open your reviewed agenda, activities and source packet to present, print or export.</p></div>
      <button className="btn" onClick={onOpenKit}><Icon name="book" size={18} />Open meeting kit<Icon name="arrow" size={17} /></button>
    </section>

    <section className="meeting-ready-collection" aria-labelledby="meeting-ready-collection-title">
      <div className="meeting-ready-heading"><h2 id="meeting-ready-collection-title">What to bring back after the lesson</h2><button className="textlink" onClick={onEditCollection}>Edit collection details<Icon name="pencil" size={15} /></button></div>
      <div className="meeting-ready-checks">
        <div><h3>Evidence the move happened</h3><p>{state.implementationCheck}</p></div>
        <div><h3>Evidence of student reasoning</h3><p>{state.learningCheck}</p></div>
      </div>
      <dl className="meeting-ready-arrangements">
        <div><dt>Who will collect</dt><dd className={state.evidenceCollector.trim() ? '' : 'is-unresolved'}>{state.evidenceCollector.trim() || 'Not yet agreed'}</dd></div>
        <div><dt>Planned collection</dt><dd className={state.collectionDate ? '' : 'is-unresolved'}>{state.collectionDate || 'Date not yet agreed'}</dd></div>
        <div><dt>Planned team review</dt><dd className={state.reviewDate ? '' : 'is-unresolved'}>{state.reviewDate || 'Date not yet agreed'}</dd></div>
      </dl>
      <p className="meeting-ready-note">{collectionIncomplete ? 'The meeting plan is approved. Agree the remaining collection details with your team.' : 'These are your team’s planned commitments. Collected follow-up evidence is still needed.'}</p>
    </section>

    <footer className="meeting-ready-next"><div><h3>After the lesson</h3><p>Record whether the move was tried, what the evidence supports, and what to check next.</p></div><button className="btn secondary" onClick={onReflect}>Go to reflection<Icon name="arrow" size={17} /></button></footer>
  </div>;
}
