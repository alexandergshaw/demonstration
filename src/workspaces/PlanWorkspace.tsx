import { useEffect, useRef, useState } from 'react';
import type { ReferenceData } from '../data/seed';
import { evidenceSnapshotDescription } from '../data/evidenceSnapshots';
import { lessonContext, selectedSourceBlocks, taskBlocks } from '../lessonContext';
import { agendaHeadings, agendaHints } from '../meetingMaterials';
import { hasFocus, hasPlan, initialAgenda, isCalendarDate, minutes, planError, type Action, type PlanState } from '../model';
import { Modal } from '../components/CycleManager';
import { EvidenceCollection } from '../components/EvidenceCollection';
import { AccessParticipation } from '../components/EquitySupport';
import { FieldError, TextArea, TextInput, useFieldError } from '../components/Field';
import { Icon } from '../components/Icon';
import { RehearsalGuide } from '../components/RehearsalGuide';
import { StepCoach } from '../components/StepCoach';
import { TaskExplanation } from '../components/TaskExplanation';
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
type DraftTarget = 'focus' | 'agenda' | 'action' | 'owner' | 'implementation-check' | 'learning-check' | 'collection-date' | 'review-date' | 'review';
const draftActionLabels: Record<DraftTarget, string> = {
  focus: 'Reconfirm the focus', agenda: 'Write activity directions', action: 'Describe the teaching move',
  owner: 'Name who will try it', 'implementation-check': 'Write the implementation check',
  'learning-check': 'Write the student learning check', 'collection-date': 'Correct the collection date',
  'review-date': 'Correct the review date', review: 'Review meeting plan',
};
const facilitationQuestions = [
  'How will the team connect the learning goal to this focus?',
  'What should colleagues notice and record in the student work?',
  'How will the team test another explanation before deciding?',
  'What will colleagues rehearse, and what reasoning will students still do?',
  'Who will try the move, and what will show it happened?',
  'What comparable work will the team bring back, and when?',
];
const activityExplanations = [
  {
    title: 'Give the meeting a shared destination',
    why: 'The team needs to understand the mathematical learning goal and why this particular focus deserves attention before discussing strategies.',
    steps: [
      { label: 'Reconnect to the learning goal', detail: 'Ask colleagues what students should understand about equivalent fractions, beyond getting the answer right.' },
      { label: 'Introduce your focus as a proposal', detail: 'Name the evidence that led you to it and invite the team to identify what remains uncertain.' },
      { label: 'Record a shared question', detail: 'Write the question the team will use to examine the work in the next activity.' },
    ],
    example: 'Ask pairs to explain what “equal amounts of the same whole” means. Share the proposed focus, then record one question the student work could help answer.',
    handoff: 'Next, the team examines the original work to see whether it supports this focus.',
  },
  {
    title: 'Make the evidence inspectable together',
    why: 'Colleagues should be able to see the basis for a claim. Looking closely at a response can reveal reasoning that the total score alone cannot explain.',
    steps: [
      { label: 'Name the material', detail: 'Specify the response, task or class results participants should read. The source packet keeps the original wording available.' },
      { label: 'Notice before explaining', detail: 'Ask participants to identify a strength and cite an exact phrase or feature before suggesting why a pattern occurred.' },
      { label: 'Capture evidence and questions', detail: 'Have the team record what the work shows separately from what they would still need to ask a student.' },
    ],
    example: 'Read a selected response silently, underline the evidence of understanding, then compare observations in pairs. Record one supported claim and one question about the student’s reasoning.',
    handoff: 'These observations become the starting point for testing an alternative explanation.',
  },
  {
    title: 'Test the explanation before choosing a response',
    why: 'The same score pattern can have several explanations. Checking an alternative reduces the chance of designing teaching around an assumption the evidence cannot support.',
    steps: [
      { label: 'State the working interpretation', detail: 'Ask the team to connect the proposed explanation to specific evidence from the previous activity.' },
      { label: 'Consider a plausible alternative', detail: 'Discuss whether task wording, expression, class variation or missing work could change the interpretation.' },
      { label: 'Decide what to carry forward', detail: 'Record the focus the team will investigate and the evidence that would make them reconsider it.' },
    ],
    example: 'Ask: “Does this response show a reasoning gap, or could the student understand more than the written explanation reveals?” Record what a follow-up question could distinguish.',
    handoff: 'Use the qualified focus to design a teaching move. The scripted question supports discussion; it does not decide for the team.',
  },
  {
    title: 'Practice a move that reveals student thinking',
    why: 'A teaching move is useful when another teacher can try it and explain what reasoning it should elicit. Rehearsal lets colleagues improve the move before using it with students.',
    steps: [
      { label: 'Specify the teacher action', detail: 'Name the question, representation or routine connected to the focus. Keep the mathematical explanation for students to construct.' },
      { label: 'Try it with a colleague', detail: 'Use the original task or selected work. One person rehearses the prompt while another anticipates possible student reasoning.' },
      { label: 'Use feedback to refine it', detail: 'Record the revised move and how students with different language or participation needs can engage in the same thinking.' },
    ],
    example: 'Rehearse asking a student to show why 1/2 and 2/4 cover the same amount. A partner checks whether the prompt invites an explanation or gives the explanation away.',
    handoff: 'Next, agree who will try the move in class and what record will show how it was used.',
  },
  {
    title: 'Turn the agreement into a classroom attempt',
    why: 'A meeting decision does not tell you whether teaching changed. A clear owner, opportunity and implementation record help the team distinguish an untried idea from a tested move.',
    steps: [
      { label: 'Name who will try it', detail: 'Identify the teachers or team and the lesson opportunity. Make any needed materials or preparation explicit.' },
      { label: 'Anticipate a practical barrier', detail: 'Ask what could prevent the attempt and what adjustment would make it possible.' },
      { label: 'Agree how to document use', detail: 'Choose a dated lesson note, brief observation or artifact that records the relevant teacher action.' },
    ],
    example: 'Each participating teacher identifies a lesson opportunity and brings a dated note of the question asked, the representation used and any change to the planned routine.',
    handoff: 'The implementation check below records this agreement. The next activity specifies the student work to bring back.',
  },
  {
    title: 'Plan evidence that can inform the next decision',
    why: 'A later score is only interpretable when the team knows what students were asked, how the work was scored and whose responses are represented.',
    steps: [
      { label: 'Choose comparable student work', detail: 'Name the task and explanation criteria. Record differences in task, rubric, response coverage or conditions that would limit comparison.' },
      { label: 'Arrange collection and review', detail: 'Agree who will gather the work and when the team will discuss it. These arrangements can be finalized during the meeting.' },
      { label: 'Name the decision it will support', detail: 'Explain what the team will look for when deciding to continue, adjust or investigate the move further.' },
    ],
    example: 'Bring dated explanations from a comparable fraction task, scored with the same criteria. Include expected and actual response counts and the implementation notes before discussing change.',
    handoff: 'Write both planned checks below, then review the full agenda before approving the meeting kit.',
  },
] as const;

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
  const [actionEditing, setActionEditing] = useState(state.action.trim().length < 25 || state.owner.trim().length < 3);
  const [selectedAgenda, setSelectedAgenda] = useState(() => Math.max(0, state.agenda.findIndex(activity => activity.trim().length < 5)));
  const [checkEditor, setCheckEditor] = useState<CheckEditor>(initialCheckEditor ?? null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [focusRequest, setFocusRequest] = useState<{ id: string; attempt: number } | null>(null);
  const focusCounter = useRef(0);
  const consentError = useFieldError('consent', 'consent-hint');
  const approved = hasPlan(state);
  // Consent remains an explicit review action. This read-only validation probe guides drafting only.
  const draftMessage = planError({ ...state, consent: true });
  const missingAgenda = state.agenda.findIndex(activity => activity.trim().length < 5);
  // Keep routing in planError's order; its message is the source of the requirement shown to the user.
  const draftTarget: DraftTarget = !draftMessage ? 'review' : !hasFocus(state) ? 'focus'
    : missingAgenda >= 0 ? 'agenda' : state.action.trim().length < 25 ? 'action'
    : state.owner.trim().length < 3 ? 'owner' : state.implementationCheck.trim().length < 15 ? 'implementation-check'
    : state.learningCheck.trim().length < 15 ? 'learning-check'
    : state.collectionDate && !isCalendarDate(state.collectionDate) ? 'collection-date' : 'review-date';
  const isStarter = (index: number) => state.agenda[index]?.trim() === initialAgenda[index];
  const moveTarget = state.action.trim().length < 25 ? 'action' : state.owner.trim().length < 3 ? 'owner' : null;
  const activityReady = state.agenda[selectedAgenda].trim().length >= 5;
  const implementationReady = state.implementationCheck.trim().length >= 15;
  const learningReady = state.learningCheck.trim().length >= 15;

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
    if (focus) requestFocus(index === selectedAgenda ? `agenda-${index}` : 'pw-activity-heading');
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

  function openReview() {
    clearError();
    setReviewOpen(true);
  }

  function beginActivities() {
    setActionEditing(false);
    editAgenda(0, false);
    requestFocus('pw-activity-heading');
  }

  function continueFromMove() {
    if (!moveTarget) { beginActivities(); return; }
    editAction();
    if (moveTarget === 'owner') requestFocus('owner');
  }

  function continueFromActivity() {
    if (!activityReady) { editAgenda(selectedAgenda); return; }
    if (selectedAgenda < agendaHeadings.length - 1) editAgenda(selectedAgenda + 1);
    else editCheck('implementation');
  }

  function followSuggestedAction() {
    if (draftTarget === 'review') { openReview(); return; }
    if (draftTarget === 'focus') { clearError(); dispatch({ type: 'go', step: 1 }); return; }
    if (draftTarget === 'agenda') { editAgenda(missingAgenda); return; }
    if (draftTarget === 'action' || draftTarget === 'owner') {
      editAction();
      if (draftTarget === 'owner') requestFocus('owner');
      return;
    }
    editCheck(draftTarget === 'implementation-check' ? 'implementation' : 'learning');
    if (draftTarget === 'collection-date' || draftTarget === 'review-date') requestFocus(draftTarget);
  }

  return <div className="plan-workspace">
    <p className="pw-explanation pw-entry-explanation">You are preparing a conversation the team can act on. First propose one teaching move, then write directions for the six meeting activities, and finally decide what evidence to bring back. Edits save in this browser as you work. Check the save status before leaving; approval is a separate decision.</p>
    <nav className="pw-route" aria-label="Build the meeting plan">
      <ol>
        <li><button type="button" onClick={editAction} aria-controls="pw-teaching-move"><span className="pw-route-number" aria-hidden="true">1</span><span><strong>Define the move</strong><small>What teaching will change, and who will try it</small></span></button></li>
        <li><button type="button" onClick={beginActivities} aria-controls="pw-agenda-editor"><span className="pw-route-number" aria-hidden="true">2</span><span><strong>Shape six activities</strong><small>Directions for the team’s 50-minute meeting</small></span></button></li>
        <li><button type="button" onClick={() => editCheck('implementation')} aria-controls="pw-follow-up"><span className="pw-route-number" aria-hidden="true">3</span><span><strong>Set two checks</strong><small>Evidence of implementation and student learning</small></span></button></li>
      </ol>
    </nav>

    <section className="pw-focus-context" aria-labelledby="pw-focus-heading">
      <div className="pw-section-heading">
        <h2 id="pw-focus-heading">Your confirmed focus</h2>
        <button className="textlink" onClick={() => { clearError(); setSourcesOpen(true); }}><Icon name="evidence" size={16} />Read full focus & sources</button>
      </div>
      <p className="pw-focus-preview">{state.focus}</p>
      <p className="pw-explanation">This is the focus you confirmed in Interpret. Use it to keep the meeting connected to the evidence. Open the full focus and sources whenever you need to check the reasoning behind it.</p>
    </section>

    <section id="pw-teaching-move" className="pw-teaching-move" aria-labelledby="pw-move-heading">
      <div className="pw-section-heading">
        <h2 id="pw-move-heading">One teaching move</h2>
        {!actionEditing && <button id="pw-edit-action" className="textlink" onClick={editAction}><Icon name="pencil" size={16} />Edit teaching move</button>}
      </div>
      <p className="pw-explanation">Your focus names what the team wants to investigate. The teaching move says what a teacher will actually do in a lesson and what thinking that action should invite from students. Propose something the team can practice and refine in the meeting.</p>
      {actionEditing ? <div className="pw-action-editor">
        <TextArea id="action" label="What will the teacher do differently—and what thinking will students do?" requirement="Required · at least 25 characters" hint="Name the teacher’s question, representation or routine, then describe the explanation students will construct. For example, ask students to show equal amounts with fraction strips and explain what stays the same. Write your own move for this focus."
          value={state.action} onChange={value => dispatch({ type: 'text', field: 'action', value })}
          placeholder="Teachers will… so students can…" />
        <div className="pw-action-owner">
          <TextInput id="owner" label="Who will try the strategy?" requirement="Required · at least 3 characters" hint="Name the teachers or team responsible for the classroom attempt. Check the starter team name so it reflects your intended agreement." value={state.owner} onChange={value => dispatch({ type: 'text', field: 'owner', value })} />
          <button className="btn secondary compact" onClick={() => { clearError(); setActionEditing(false); requestFocus('pw-edit-action'); }}>Done editing</button>
        </div>
      </div> : <>
        <DraftValue value={state.action} empty="Choose one concrete change in teaching." />
        <p className="pw-owner">{state.owner.trim() || 'Name who will try the strategy'}</p>
      </>}
      <button type="button" className="textlink pw-section-next" onClick={continueFromMove}>{moveTarget ? draftActionLabels[moveTarget] : 'Next: shape the meeting activities'}<Icon name="arrow" size={15} /></button>
    </section>

    <div className="pw-agenda-workspace">
      <section className="pw-outline" aria-labelledby="pw-outline-heading">
        <div className="pw-section-heading"><h2 id="pw-outline-heading">Meeting outline</h2><span className="pw-meta">50 minutes</span></div>
        <p className="pw-route-hint">Choose any activity to edit. Review all six before approving your plan.</p>
        <p className="pw-explanation">Select an activity to see its purpose and write the directions a facilitator will give. The time shown for each activity adds up to this fixed 50-minute meeting. Starter text names a topic; your directions explain who does what, with which evidence, and what they record.</p>
        <ol className="pw-agenda-list">
          {agendaHeadings.map((heading, index) => <li key={heading}>
            <button className="pw-agenda-choice" aria-pressed={selectedAgenda === index} aria-controls="pw-agenda-editor"
              onClick={() => editAgenda(index)}>
              <span className="pw-duration">{minutes[index]}<span> min</span></span>
              <span className="pw-agenda-copy"><span className="pw-agenda-title">{heading}</span><span className="pw-agenda-summary">{isStarter(index) ? 'Starter text · ' : ''}{state.agenda[index]?.trim() || 'Add facilitation directions'}</span></span>
              <Icon name="chevron" size={15} />
            </button>
          </li>)}
        </ol>
      </section>

      <section id="pw-agenda-editor" className="pw-agenda-editor" aria-labelledby="pw-activity-heading">
        <p className="pw-meta">Activity {selectedAgenda + 1} of {agendaHeadings.length} · {minutes[selectedAgenda]} minutes</p>
        <h2 id="pw-activity-heading" tabIndex={-1}>{agendaHeadings[selectedAgenda]}</h2>
        {isStarter(selectedAgenda) && <p className="pw-starter-note"><strong>Starter text.</strong> Review and adapt these directions for your team.</p>}
        <TaskExplanation {...activityExplanations[selectedAgenda]} />
        <StepCoach question={facilitationQuestions[selectedAgenda]} ready="A colleague can tell what participants will do, which evidence they will use, and what they will leave with.">
          <p>{agendaHints[selectedAgenda]}</p>
          <p>Include a prompt or task, how the team will work together, and what they will record. Use the time shown for this activity.</p>
        </StepCoach>
        <TextArea id={`agenda-${selectedAgenda}`} label="Facilitation directions" requirement="Required · at least 5 characters" hint={`Activity ${selectedAgenda + 1} of ${agendaHeadings.length}: ${agendaHeadings[selectedAgenda]}. Write the instructions you will give colleagues: the material to use, the question or task, how they will work together, and what they should record. These exact directions appear in your meeting kit.`}
          value={state.agenda[selectedAgenda]} onChange={value => dispatch({ type: 'agenda', index: selectedAgenda, value })} />
        {selectedAgenda === 3 && <>
          <RehearsalGuide state={state} reference={reference} />
          <AccessParticipation state={state} dispatch={dispatch} />
        </>}
        <nav className="pw-activity-navigation" aria-label="Move between meeting activities">
          {selectedAgenda > 0 && <button type="button" className="textlink" onClick={() => editAgenda(selectedAgenda - 1)}>Previous activity<span className="sr-only">: {agendaHeadings[selectedAgenda - 1]}</span></button>}
          <button type="button" className="btn secondary compact" onClick={continueFromActivity}>{!activityReady ? 'Write activity directions' : selectedAgenda < agendaHeadings.length - 1 ? 'Next activity' : 'Next: set the two checks'}<Icon name="arrow" size={15} />{activityReady && selectedAgenda < agendaHeadings.length - 1 && <span className="sr-only">: {agendaHeadings[selectedAgenda + 1]}</span>}</button>
        </nav>
      </section>
    </div>

    <section id="pw-follow-up" className="pw-follow-up" aria-labelledby="pw-follow-up-heading">
      <div className="pw-section-heading"><h2 id="pw-follow-up-heading">Agree what to look for next</h2><span className="pw-meta">Planned checks</span></div>
      <p className="pw-route-hint">Write both checks. Collection names and dates can be agreed with the team later.</p>
      <p className="pw-explanation">These checks answer different questions. An implementation record helps you understand whether the move was tried as intended. Student work helps you examine what students understood. Having one does not supply the other, and neither by itself proves that the move caused a change.</p>
      <div className="pw-checks">
        <section className="pw-check" aria-labelledby="pw-implementation-heading">
          <div className="pw-check-heading"><h3 id="pw-implementation-heading">Did teaching change?</h3>
            {checkEditor !== 'implementation' && <button id="pw-edit-implementation" className="textlink" onClick={() => editCheck('implementation')}>{state.implementationCheck.trim() ? 'Edit check' : 'Add check'}<span className="sr-only"> for implementation</span></button>}
          </div>
          <p className="pw-check-explanation">Look for evidence of the teacher action: what was asked or used, when, and what differed from the plan. A stated intention to try the move is not yet an implementation record.</p>
          {checkEditor === 'implementation' ? <>
            <TextArea id="implementation-check" label="What would show that the teaching move happened?" requirement="Required · at least 15 characters" hint="Name the record and what someone would look for in it. For example: a dated lesson note records the teacher’s prompt, the representation used and any adjustment to the planned routine."
              value={state.implementationCheck} onChange={value => dispatch({ type: 'text', field: 'implementationCheck', value })} />
            <div className="pw-check-navigation">
              <button className="textlink" onClick={() => { clearError(); setCheckEditor(null); requestFocus('pw-edit-implementation'); }}>Done editing implementation check</button>
              <button type="button" className="btn secondary compact" onClick={() => editCheck(implementationReady ? 'learning' : 'implementation')}>{implementationReady ? 'Next: student learning check' : 'Write the implementation check'}<Icon name="arrow" size={15} /></button>
            </div>
          </> : <DraftValue value={state.implementationCheck} empty="Choose evidence that the teaching move happened." />}
        </section>
        <section className="pw-check" aria-labelledby="pw-learning-heading">
          <div className="pw-check-heading"><h3 id="pw-learning-heading">Did student reasoning change?</h3>
            {checkEditor !== 'learning' && <button id="pw-edit-learning" className="textlink" onClick={() => editCheck('learning')}>{state.learningCheck.trim() ? 'Edit check' : 'Add check'}<span className="sr-only"> for student learning</span></button>}
          </div>
          <p className="pw-check-explanation">Look for students’ explanations of the mathematical idea. Specify the task, the criteria for judging the explanation and whose work you will collect so the team can interpret the evidence together.</p>
          {checkEditor === 'learning' ? <>
            <TextArea id="learning-check" label="What student work would reveal a change in reasoning?" requirement="Required · at least 15 characters" hint="Name a comparable task and the reasoning to look for, using the same scoring criteria. Include the date and response coverage. Repeating the identical task can introduce practice effects, so record that limitation."
              value={state.learningCheck} onChange={value => dispatch({ type: 'text', field: 'learningCheck', value })} />
            <EvidenceCollection state={state} dispatch={dispatch} />
            <div className="pw-check-navigation">
              <button className="textlink" onClick={() => { clearError(); setCheckEditor(null); requestFocus('pw-edit-learning'); }}>Done editing learning check</button>
              <button type="button" className="btn secondary compact" onClick={() => learningReady ? openReview() : editCheck('learning')}>{learningReady ? 'Next: review the whole plan' : 'Write the student learning check'}<Icon name="arrow" size={15} /></button>
            </div>
          </> : <>
            <DraftValue value={state.learningCheck} empty="Choose comparable work that will reveal students’ reasoning." />
            <dl className="pw-collection-status" aria-label="Optional collection arrangements">
              <div><dt>Collector</dt><dd>{state.evidenceCollector.trim() || 'Not yet agreed'}</dd></div>
              <div><dt>Collect</dt><dd>{state.collectionDate || 'Date not yet agreed'}</dd></div>
              <div><dt>Review</dt><dd>{state.reviewDate || 'Date not yet agreed'}</dd></div>
            </dl>
            <p className="pw-meta">Optional details to agree with the team. The collector gathers the evidence; the collection date is when it will be gathered; the review date is when the PLC will examine it. Use Add check or Edit check to add these arrangements.</p>
          </>}
        </section>
      </div>
    </section>

    <footer className="pw-footer">
      <div className="pw-next-guidance"><p><strong>Suggested next</strong> {draftMessage || (approved ? 'Review your current approved plan. Editing it will require approval again.' : 'Review every activity and both checks, including any starter text, before approving.')}</p>{draftTarget !== 'review' && <button type="button" className="textlink" onClick={openReview}>Review meeting plan</button>}</div>
      <button type="button" className="btn" onClick={followSuggestedAction}>{draftActionLabels[draftTarget]}<Icon name="arrow" size={17} /></button>
    </footer>
    <p className="pw-explanation pw-approval-explanation">Review meeting plan opens the complete draft without approving it. Check that the directions fit your team, including any starter text you kept. Your ownership confirmation and approval then make the meeting kit available; they do not certify the plan’s quality or report that teaching has happened.</p>

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
        <p className="pw-explanation pw-review-explanation">Read this as the facilitator who will run the meeting: can you identify the evidence, the participant task and the intended output of each activity? Use Edit beside a section to revise it. Approval assembles these exact decisions into a kit; it does not replace your review or establish a classroom outcome.</p>
        <section className="pw-review-section"><h3>Learning goal & confirmed focus</h3><p className="pw-meta">{lessonContext.goal}</p><DraftValue value={state.focus} /></section>
        <section className="pw-review-section pw-review-move">
          <div className="pw-check-heading"><h3>The teaching move</h3><button className="textlink" onClick={editAction}>Edit</button></div>
          <DraftValue value={state.action} /><p className="pw-meta">Who will try it: {state.owner.trim() || 'Not named yet'}</p>
        </section>
        <section className="pw-review-section"><h3>The meeting, from start to finish</h3>
          <ol className="pw-review-agenda">{agendaHeadings.map((heading, index) => <li key={heading}>
            <div className="pw-review-agenda-title"><span className="pw-meta">{minutes[index]} min</span><h4>{heading}</h4><button className="textlink" onClick={() => editAgenda(index)}>Edit<span className="sr-only"> activity {index + 1}</span></button></div>
            {isStarter(index) && <p className="pw-starter-label">Starter text · confirm it fits your team or edit it.</p>}
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
        {draftMessage && <section className="pw-review-requirement" aria-labelledby="pw-review-requirement-title"><h3 id="pw-review-requirement-title">Before approval</h3><p>{draftMessage}</p><button type="button" className="textlink" onClick={followSuggestedAction}>{draftActionLabels[draftTarget]}<Icon name="arrow" size={15} /></button></section>}
        <label className="approval"><input id="consent" type="checkbox" checked={state.consent} aria-invalid={consentError.invalid || undefined} aria-describedby={consentError.describedBy} onChange={event => dispatch({ type: 'consent', value: event.target.checked })} /><span><strong>I reviewed and own this plan.</strong><span id="consent-hint">These decisions reflect my team’s judgment. Editing the plan will require approval again.</span></span></label>
        <FieldError id="consent" />
        {saveError && <p className="dialog-error" role="alert">{saveError}</p>}
        <div className="modal-actions pw-review-actions"><button className="btn secondary" onClick={closeReview}>Keep editing</button><button className="btn" onClick={() => { if (submit('plan')) setReviewOpen(false); }}>Approve meeting plan<Icon name="check" size={17} /></button></div>
      </div>
    </Modal>}
  </div>;
}
