import { useEffect, useRef, useState } from 'react';
import type { ReferenceData } from '../data/seed';
import { evidenceSnapshotDescription } from '../data/evidenceSnapshots';
import { lessonContext, selectedSourceBlocks, taskBlocks } from '../lessonContext';
import { agendaHeadings, agendaHints } from '../meetingMaterials';
import { hasPlan, minutes, type Action, type PlanState } from '../model';
import { Modal } from '../components/CycleManager';
import { EvidenceCollection } from '../components/EvidenceCollection';
import { AccessParticipation } from '../components/EquitySupport';
import { FieldError, TextArea, TextInput, useFieldError } from '../components/Field';
import { Icon } from '../components/Icon';
import { RehearsalGuide } from '../components/RehearsalGuide';
import { StepCoach } from '../components/StepCoach';
import './PlanWorkspace.css';

interface PlanWorkspaceProps {
  state: PlanState;
  reference: ReferenceData;
  dispatch: (action: Action) => boolean;
  submit: (kind: 'focus' | 'plan' | 'reflection') => boolean;
  errorField: string;
  errorAttempt: number;
  clearError: () => void;
  saveError?: string;
  initialCheckEditor?: 'learning';
}

type CheckEditor = 'implementation' | 'learning' | null;
const facilitationQuestions = [
  'How will the team connect the learning goal to this focus?',
  'What should colleagues notice and record in the student work?',
  'How will the team test another explanation before deciding?',
  'What will colleagues rehearse, and what reasoning will students still do?',
  'Who will try the move, and what will show it happened?',
  'What comparable work will the team bring back, and when?',
];

function focusVisibleField(id: string) {
  const field = document.getElementById(id);
  if (!field) return;
  let parent = field.parentElement;
  while (parent) {
    if (parent instanceof HTMLDetailsElement) parent.open = true;
    parent = parent.parentElement;
  }
  field.focus();
  field.scrollIntoView({ block: 'nearest' });
}

function DraftValue({ value, empty = 'Not written yet' }: { value: string; empty?: string }) {
  return <p className={`pw-draft-value${value.trim() ? '' : ' pw-empty-value'}`}>{value.trim() ? value : empty}</p>;
}

export function PlanWorkspace({ state, reference, dispatch, submit, errorField, errorAttempt, clearError, saveError = '', initialCheckEditor }: PlanWorkspaceProps) {
  const [actionEditing, setActionEditing] = useState(!state.action.trim() || !state.owner.trim());
  const [selectedAgenda, setSelectedAgenda] = useState(3);
  const [checkEditor, setCheckEditor] = useState<CheckEditor>(initialCheckEditor ?? null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [focusRequest, setFocusRequest] = useState<{ id: string; attempt: number } | null>(null);
  const focusCounter = useRef(0);
  const consentError = useFieldError('consent', 'consent-hint');
  const approved = hasPlan(state);

  function requestFocus(id: string) {
    setFocusRequest({ id, attempt: ++focusCounter.current });
  }

  useEffect(() => {
    if (initialCheckEditor !== 'learning') return;
    setCheckEditor('learning');
    setFocusRequest({ id: 'evidence-collector', attempt: ++focusCounter.current });
  }, [initialCheckEditor]);

  // Validation can target a field in another activity or a closed editor.
  // Reveal it first, then focus after React has committed that editor.
  useEffect(() => {
    if (!errorField) return;
    setSourcesOpen(false);
    if (errorField === 'consent') {
      setReviewOpen(true);
    } else {
      setReviewOpen(false);
      if (errorField === 'action' || errorField === 'owner') setActionEditing(true);
      if (errorField.startsWith('agenda-')) {
        const index = Number(errorField.slice(7));
        if (Number.isInteger(index) && index >= 0 && index < agendaHeadings.length) setSelectedAgenda(index);
      }
      if (errorField === 'implementation-check') setCheckEditor('implementation');
      if (['learning-check', 'evidence-collector', 'collection-date', 'review-date'].includes(errorField)) setCheckEditor('learning');
    }
    setFocusRequest({ id: errorField, attempt: ++focusCounter.current });
  }, [errorField, errorAttempt]);

  useEffect(() => {
    if (!focusRequest) return;
    const frame = window.requestAnimationFrame(() => focusVisibleField(focusRequest.id));
    return () => window.cancelAnimationFrame(frame);
  }, [focusRequest]);

  function editAction() {
    clearError();
    setReviewOpen(false);
    setActionEditing(true);
    requestFocus('action');
  }

  function editAgenda(index: number, focus = true) {
    clearError();
    setReviewOpen(false);
    setSelectedAgenda(index);
    if (focus) requestFocus(`agenda-${index}`);
  }

  function editCheck(which: Exclude<CheckEditor, null>) {
    clearError();
    setReviewOpen(false);
    setCheckEditor(which);
    requestFocus(which === 'implementation' ? 'implementation-check' : 'learning-check');
  }

  function closeReview() {
    clearError();
    setReviewOpen(false);
  }

  return <div className="plan-workspace">
    <section className="pw-focus-context" aria-labelledby="pw-focus-heading">
      <div className="pw-section-heading">
        <h2 id="pw-focus-heading">Your confirmed focus</h2>
        <button className="textlink" onClick={() => { clearError(); setSourcesOpen(true); }}><Icon name="evidence" size={16} />Read full focus & sources</button>
      </div>
      <p className="pw-focus-preview">{state.focus}</p>
    </section>

    <section className="pw-teaching-move" aria-labelledby="pw-move-heading">
      <div className="pw-section-heading">
        <h2 id="pw-move-heading">One teaching move</h2>
        {!actionEditing && <button id="pw-edit-action" className="textlink" onClick={editAction}><Icon name="pencil" size={16} />Edit teaching move</button>}
      </div>
      {actionEditing ? <div className="pw-action-editor">
        <TextArea id="action" label="What will the teacher do differently—and what thinking will students do?" hint="Name one observable teaching move, then the reasoning students will do themselves."
          value={state.action} onChange={value => dispatch({ type: 'text', field: 'action', value })}
          placeholder="Teachers will… so students can…" />
        <div className="pw-action-owner">
          <TextInput id="owner" label="Who will try the strategy?" value={state.owner} onChange={value => dispatch({ type: 'text', field: 'owner', value })} />
          <button className="btn secondary compact" onClick={() => { clearError(); setActionEditing(false); requestFocus('pw-edit-action'); }}>Done editing</button>
        </div>
      </div> : <>
        <DraftValue value={state.action} empty="Choose one concrete change in teaching." />
        <p className="pw-owner">{state.owner.trim() || 'Name who will try the strategy'}</p>
      </>}
    </section>

    <div className="pw-agenda-workspace">
      <section className="pw-outline" aria-labelledby="pw-outline-heading">
        <div className="pw-section-heading"><h2 id="pw-outline-heading">Meeting outline</h2><span className="pw-meta">50 minutes</span></div>
        <ol className="pw-agenda-list">
          {agendaHeadings.map((heading, index) => <li key={heading}>
            <button className="pw-agenda-choice" aria-pressed={selectedAgenda === index} aria-controls="pw-agenda-editor"
              onClick={() => editAgenda(index)}>
              <span className="pw-duration">{minutes[index]}<span> min</span></span>
              <span className="pw-agenda-copy"><span className="pw-agenda-title">{heading}</span><span className="pw-agenda-summary">{state.agenda[index]?.trim() || 'Add facilitation directions'}</span></span>
              <Icon name="chevron" size={15} />
            </button>
          </li>)}
        </ol>
      </section>

      <section id="pw-agenda-editor" className="pw-agenda-editor" aria-labelledby="pw-activity-heading">
        <p className="pw-meta">Activity {selectedAgenda + 1} · {minutes[selectedAgenda]} minutes</p>
        <h2 id="pw-activity-heading">{agendaHeadings[selectedAgenda]}</h2>
        <StepCoach question={facilitationQuestions[selectedAgenda]} ready="A colleague can tell what participants will do, which evidence they will use, and what they will leave with.">
          <p>{agendaHints[selectedAgenda]}</p>
          <p>Include a prompt or task, how the team will work together, and what they will record. Use the time shown for this activity.</p>
        </StepCoach>
        <TextArea id={`agenda-${selectedAgenda}`} label="Facilitation directions" hint="Write what participants will do, discuss, and record."
          value={state.agenda[selectedAgenda]} onChange={value => dispatch({ type: 'agenda', index: selectedAgenda, value })} />
        {selectedAgenda === 3 && <>
          <RehearsalGuide state={state} reference={reference} />
          <AccessParticipation state={state} dispatch={dispatch} />
        </>}
      </section>
    </div>

    <section className="pw-follow-up" aria-labelledby="pw-follow-up-heading">
      <div className="pw-section-heading"><h2 id="pw-follow-up-heading">Agree what to look for next</h2><span className="pw-meta">Planned checks</span></div>
      <div className="pw-checks">
        <section className="pw-check" aria-labelledby="pw-implementation-heading">
          <div className="pw-check-heading"><h3 id="pw-implementation-heading">Did teaching change?</h3>
            {checkEditor !== 'implementation' && <button id="pw-edit-implementation" className="textlink" onClick={() => editCheck('implementation')}>{state.implementationCheck.trim() ? 'Edit check' : 'Add check'}<span className="sr-only"> for implementation</span></button>}
          </div>
          {checkEditor === 'implementation' ? <>
            <TextArea id="implementation-check" label="What would show that the teaching move happened?" hint="Name an observable record, such as a lesson note or a brief observation, and what it should show the teacher did."
              value={state.implementationCheck} onChange={value => dispatch({ type: 'text', field: 'implementationCheck', value })} />
            <button className="textlink" onClick={() => { clearError(); setCheckEditor(null); requestFocus('pw-edit-implementation'); }}>Done editing implementation check</button>
          </> : <DraftValue value={state.implementationCheck} empty="Choose evidence that the teaching move happened." />}
        </section>
        <section className="pw-check" aria-labelledby="pw-learning-heading">
          <div className="pw-check-heading"><h3 id="pw-learning-heading">Did student reasoning change?</h3>
            {checkEditor !== 'learning' && <button id="pw-edit-learning" className="textlink" onClick={() => editCheck('learning')}>{state.learningCheck.trim() ? 'Edit check' : 'Add check'}<span className="sr-only"> for student learning</span></button>}
          </div>
          {checkEditor === 'learning' ? <>
            <TextArea id="learning-check" label="What student work would reveal a change in reasoning?" hint="Name the task or work to collect, the reasoning to look for, and the same scoring criteria you will use to compare it."
              value={state.learningCheck} onChange={value => dispatch({ type: 'text', field: 'learningCheck', value })} />
            <EvidenceCollection state={state} dispatch={dispatch} />
            <button className="textlink" onClick={() => { clearError(); setCheckEditor(null); requestFocus('pw-edit-learning'); }}>Done editing learning check</button>
          </> : <>
            <DraftValue value={state.learningCheck} empty="Choose comparable work that will reveal students’ reasoning." />
            <dl className="pw-collection-status" aria-label="Optional collection arrangements">
              <div><dt>Collector</dt><dd>{state.evidenceCollector.trim() || 'Not yet agreed'}</dd></div>
              <div><dt>Collect</dt><dd>{state.collectionDate || 'Date not yet agreed'}</dd></div>
              <div><dt>Review</dt><dd>{state.reviewDate || 'Date not yet agreed'}</dd></div>
            </dl>
            <p className="pw-meta">Optional details to agree with the team.</p>
          </>}
        </section>
      </div>
    </section>

    <footer className="pw-footer"><p>{approved ? 'Current plan approved. Editing will require a new review.' : 'Review the complete plan before approving it.'}</p><button className="btn" onClick={() => { clearError(); setReviewOpen(true); }}>Review meeting plan<Icon name="arrow" size={17} /></button></footer>

    {sourcesOpen && <Modal title="Your focus & evidence" onClose={() => { clearError(); setSourcesOpen(false); }}>
      <div className="source-reader source-blocks pw-source-reader">
        <section><h3>Confirmed instructional focus</h3><p>{state.focus}</p><button className="textlink" onClick={() => { clearError(); if (dispatch({ type: 'go', step: 1 })) setSourcesOpen(false); }}>Revisit reasoning<Icon name="arrow" size={15} /></button></section>
        <p className="caption">Fictional sources · Close this reader to return to your draft.</p>
        <p className="caption">{evidenceSnapshotDescription(state.evidenceVersion)}</p>
        {[...taskBlocks(), ...selectedSourceBlocks(reference, state.selected)].map(block => <section key={block.heading}><h3>{block.heading}</h3><p>{block.text}</p></section>)}
      </div>
      <div className="modal-actions"><button className="btn secondary" onClick={() => { clearError(); setSourcesOpen(false); }}>Return to my plan</button></div>
    </Modal>}

    {reviewOpen && <Modal title="Review your meeting plan" onClose={closeReview}>
      <div className="pw-plan-review">
        <p className="pw-review-status">{approved ? 'Current approved plan' : 'Draft · Awaiting your approval'} · 50-minute PLC</p>
        <section className="pw-review-section"><h3>Learning goal & confirmed focus</h3><p className="pw-meta">{lessonContext.goal}</p><DraftValue value={state.focus} /></section>
        <section className="pw-review-section pw-review-move">
          <div className="pw-check-heading"><h3>The teaching move</h3><button className="textlink" onClick={editAction}>Edit</button></div>
          <DraftValue value={state.action} /><p className="pw-meta">Who will try it: {state.owner.trim() || 'Not named yet'}</p>
        </section>
        <section className="pw-review-section"><h3>The meeting, from start to finish</h3>
          <ol className="pw-review-agenda">{agendaHeadings.map((heading, index) => <li key={heading}>
            <div className="pw-review-agenda-title"><span className="pw-meta">{minutes[index]} min</span><h4>{heading}</h4><button className="textlink" onClick={() => editAgenda(index)}>Edit<span className="sr-only"> activity {index + 1}</span></button></div>
            <DraftValue value={state.agenda[index]} />
          </li>)}</ol>
        </section>
        <section className="pw-review-section"><h3>Your follow-up commitments</h3>
          <div className="pw-review-checks">
            <div><div className="pw-check-heading"><h4>Check implementation</h4><button className="textlink" onClick={() => editCheck('implementation')}>Edit<span className="sr-only"> implementation check</span></button></div><DraftValue value={state.implementationCheck} /></div>
            <div><div className="pw-check-heading"><h4>Check student learning</h4><button className="textlink" onClick={() => editCheck('learning')}>Edit<span className="sr-only"> learning check</span></button></div><DraftValue value={state.learningCheck} /></div>
          </div>
          <dl className="pw-review-collection">
            <div><dt>Who will collect</dt><dd>{state.evidenceCollector.trim() || 'Not yet agreed'}</dd></div>
            <div><dt>Planned collection</dt><dd>{state.collectionDate || 'Date not yet agreed'}</dd></div>
            <div><dt>Planned review</dt><dd>{state.reviewDate || 'Date not yet agreed'}</dd></div>
          </dl>
          <p className="pw-meta">These optional arrangements can remain open when you approve the meeting plan.</p>
        </section>
        {state.accessParticipation.trim() && <section className="pw-review-section"><div className="pw-check-heading"><h3>Access & participation</h3><button className="textlink" onClick={() => { editAgenda(3, false); requestFocus('access-participation'); }}>Edit</button></div><DraftValue value={state.accessParticipation} /></section>}
        <section className="pw-review-section pw-review-sources"><h3>Evidence used in this plan</h3>
          <p><strong>Student results · {reference.assessment.date}</strong><br />{reference.assessment.correct}/{reference.assessment.total} correct fractions · {reference.assessment.explanations}/{reference.assessment.total} adequate explanations</p>
          <ul>{state.selected.map(id => <li key={id}>{reference.labels[id]}</li>)}</ul>
          <p className="pw-meta">{evidenceSnapshotDescription(state.evidenceVersion)}</p>
          {state.selected.includes('observation') && <p><strong>Historical context · {reference.observation.date}</strong><br />{reference.observation.caution}</p>}
          <p className="pw-meta">All sources are fictional. Your checks are plans for future evidence, not results of this teaching move.</p>
        </section>
        <label className="approval"><input id="consent" type="checkbox" checked={state.consent} aria-invalid={consentError.invalid || undefined} aria-describedby={consentError.describedBy} onChange={event => dispatch({ type: 'consent', value: event.target.checked })} /><span><strong>I reviewed and own this plan.</strong><span id="consent-hint">These decisions reflect my team’s judgment. Editing the plan will require approval again.</span></span></label>
        <FieldError id="consent" />
        {saveError && <p className="dialog-error" role="alert">{saveError}</p>}
        <div className="modal-actions pw-review-actions"><button className="btn secondary" onClick={closeReview}>Keep editing</button><button className="btn" onClick={() => { if (submit('plan')) setReviewOpen(false); }}>Approve meeting plan<Icon name="check" size={17} /></button></div>
      </div>
    </Modal>}
  </div>;
}
