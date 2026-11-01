import { useEffect, useRef, useState } from 'react';
import { FieldError, TextArea, useFieldError } from '../components/Field';
import { hasReflection, type Action, type PlanState } from '../model';
import { StepCoach } from '../components/StepCoach';
import { BuilderNavigation } from '../components/BuilderNavigation';
import { TaskExplanation } from '../components/TaskExplanation';
import { WorkflowActions } from '../components/WorkflowActions';
import { CollectionSummary } from '../components/CollectionSummary';
import './ReflectWorkspace.css';

interface ReflectWorkspaceProps {
  state: PlanState; dispatch: (action: Action) => boolean;
  submit: (kind: 'focus' | 'plan' | 'reflection') => boolean;
  errorField: string; errorAttempt: number; openExamples: () => void;
  unsaved?: boolean;
  onEditCollection?: () => void;
  onOpenRecord?: () => void;
  onBackToPlan?: () => void;
}
const reflectionTasks = [
  { id: 'attempt', label: 'Teaching attempt', panelId: 'reflect-attempt-panel' },
  { id: 'next-step', label: 'Next step', panelId: 'reflect-next-panel' },
] as const;
type ReflectionTask = typeof reflectionTasks[number]['id'];

export function ReflectWorkspace({ state: s, dispatch, submit, errorField, errorAttempt, openExamples, unsaved = false, onEditCollection, onOpenRecord, onBackToPlan }: ReflectWorkspaceProps) {
  const [task, setTask] = useState<ReflectionTask>(() => s.implementation ? 'next-step' : 'attempt');
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(() => Boolean(s.nextCycleQuestion.trim()));
  const [focusRequest, setFocusRequest] = useState<{ id: string; attempt: number } | null>(null);
  const focusCounter = useRef(0);
  const recorded = hasReflection(s);
  const nextRequiredControl = !s.implementation ? 'implementation-yes' : s.reflection.trim().length < 30 ? 'reflection' : null;
  const implementationError = useFieldError('implementation-yes', 'implementation-explanation');
  useEffect(() => {
    if (!errorField) return;
    setTask(errorField.startsWith('implementation-') ? 'attempt' : 'next-step');
    if (errorField === 'next-cycle-question') setQuestionOpen(true);
    setFocusRequest({ id: errorField, attempt: ++focusCounter.current });
  }, [errorField, errorAttempt]);
  useEffect(() => {
    if (!focusRequest) return;
    const frame = window.requestAnimationFrame(() => focusControl(focusRequest.id));
    return () => window.cancelAnimationFrame(frame);
  }, [focusRequest]);
  const implementationMessage = s.implementation === 'no'
    ? 'The move has not been tested yet. Start with what would make implementation possible.'
    : s.implementation === 'partial'
    ? 'Record what was tried and what was different before interpreting learning evidence.'
    : s.implementation === 'yes'
    ? 'This is your implementation report. Comparable student work is still needed.'
    : 'Record what happened before deciding what the next evidence can tell you.';
  const reflectionQuestion = s.implementation === 'no'
    ? 'What prevented implementation, and what will make the next attempt possible?'
    : s.implementation === 'partial'
    ? 'What was tried, what prevented the rest, and what evidence will you bring back?'
    : s.implementation === 'yes'
    ? 'What student work do you need before judging the effect of this move?'
    : 'What was tried, and what can the available evidence support?';
  const reflectionGuidance = s.implementation === 'no'
    ? { label: 'Plan the next opportunity', detail: 'Name what prevented the move, one adjustment that would make it possible, who will act and when the team will check back. Without an attempt, there is no outcome of this move to judge.', example: 'If materials were unavailable, a next step could be: We have not tested the move yet. The facilitator will prepare the materials with the team before the next lesson. At the following PLC, we will check whether the move was tried and agree what student work to examine.' }
    : s.implementation === 'partial'
    ? { label: 'Separate the attempt from the intended plan', detail: 'Describe which parts happened and what changed. Then name the support or evidence needed before the team decides whether to adapt or try the move again.', example: 'If the teacher asked the opening question but students did not explain to a partner, record both parts. A next step could be to rehearse the partner prompt, name who will try it, and agree when to bring back lesson notes and student explanations.' }
    : { label: 'Make the next decision proportionate to the evidence', detail: 'A report that the move was used does not show what students learned. If comparable work is missing, name what to collect, who will bring it and when the team will review it.', example: 'If the move was used but comparable student work is still missing: We can report the teaching attempt, but cannot yet judge a change in reasoning. The team will collect independent explanations using the agreed task and rubric and bring them to the next PLC.' };
  function focusControl(id: string) {
    const control = document.getElementById(id);
    control?.focus({ preventScroll: true });
    control?.scrollIntoView({ block: 'nearest' });
  }
  function showTask(next: string, focus = true, control?: string) {
    if (!reflectionTasks.some(item => item.id === next)) return;
    setTask(next as ReflectionTask);
    setFocusRequest(focus ? { id: control ?? (next === 'attempt' ? 'reflect-attempt-title' : 'reflection'), attempt: ++focusCounter.current } : null);
  }
  function continueFromAttempt() {
    if (!s.implementation) { showTask('attempt', true, 'implementation-yes'); return; }
    showTask('next-step');
  }
  function recordNextStep() {
    if (nextRequiredControl) {
      showTask(nextRequiredControl === 'implementation-yes' ? 'attempt' : 'next-step', true, nextRequiredControl);
      return;
    }
    submit('reflection');
  }
  const implementationLabel = s.implementation === 'yes' ? 'Used as planned' : s.implementation === 'partial' ? 'Partially used' : s.implementation === 'no' ? 'Not yet used' : 'Not reported yet';
  const recordIsReady = recorded && !unsaved;
  return <div className="reflect-workspace">
    <BuilderNavigation label="Reflection tasks" current={task} steps={reflectionTasks} onSelect={showTask} />
    <p className="reflect-draft-status">{unsaved ? recorded ? 'Recorded in this draft · save pending' : 'Unsaved changes · keep this page open' : recorded ? 'Next step recorded' : 'Draft reflection · record your decision when ready'}</p>
    <details className="reflect-collection-disclosure" open={collectionOpen} onToggle={event => setCollectionOpen(event.currentTarget.open)}>
      <summary>Review planned checks</summary>
      <section className="reflect-collection" id="reflect-collection" aria-label="Planned evidence collection">
        <div className="reflect-collection-header"><p className="context-label">Reference · From your approved plan</p><h2 id="reflect-collection-title" tabIndex={-1}>Planned evidence collection</h2></div>
        <div><h3>Check implementation</h3><p className="caption">The planned record of what the teacher and students did during the move.</p><p>{s.implementationCheck}</p></div>
        <div><h3>Check student learning</h3><p className="caption">The planned student work and criteria for examining their reasoning.</p><p>{s.learningCheck}</p></div>
        <p className="caption">Request dated work, the task and rubric, expected and actual response counts, and an implementation record. Check comparability before drawing a conclusion.</p>
        <CollectionSummary state={s} />
        {onEditCollection && <div className="reflect-collection-action"><button className="btn secondary" onClick={onEditCollection}>Edit collection details</button><p className="caption">Changing planned checks or dates requires plan approval again. Your reflection draft stays available.</p></div>}
        {s.accessParticipation.trim() && <p className="caption">Access & participation plan: {s.accessParticipation}</p>}
      </section>
    </details>

    <section id="reflect-attempt-panel" className="reflect-builder-panel" hidden={task !== 'attempt'} aria-labelledby="reflect-attempt-title">
    <h2 id="reflect-attempt-title" tabIndex={-1}>Report the teaching attempt</h2>
    <section className="reflect-action" aria-labelledby="reflect-action-title">
      <h2 id="reflect-action-title">Agreed teaching move</h2>
      <p className="reflect-action-text">{s.action}</p>
      <p className="caption">Who planned to try it: {s.owner}</p>
      {!recorded && (s.implementation || s.reflection.trim()) && <p className="caption">Draft report · Check that it describes this approved teaching move before recording.</p>}
    </section>

    <div className="reflect-evidence-layout">
      <section className="reflect-implementation" aria-labelledby="implementation-title">
        <fieldset aria-invalid={implementationError.invalid || undefined} aria-describedby={implementationError.describedBy}>
          <legend id="implementation-title">Was the move tried?</legend>
          <div className="reflect-status-options">{([
            ['yes', 'Used as planned', 'The agreed teaching move was tried as intended.'],
            ['partial', 'Partially used', 'Some parts happened, or the approach changed.'],
            ['no', 'Not yet used', 'The classroom attempt has not happened.'],
          ] as const).map(([value, label, explanation]) => <label className={s.implementation === value ? 'selected' : ''} key={value}>
            <input id={`implementation-${value}`} type="radio" name="implementation" value={value} checked={s.implementation === value}
              aria-invalid={implementationError.invalid || undefined} aria-describedby={implementationError.describedBy}
              onChange={() => dispatch({ type: 'implementation', value })} /><span><strong>{label}</strong><small>{explanation}</small></span>
          </label>)}</div>
        </fieldset>
        <p className="caption" id="implementation-explanation">{implementationMessage}</p>
        <FieldError id="implementation-yes" />
      </section>
      <section className="reflect-empty" aria-labelledby="follow-up-empty-title">
        <p className="context-label">Learning evidence</p>
        <h2 id="follow-up-empty-title">Follow-up evidence is not available yet.</h2>
        <p>This cycle has planned checks, but no collected follow-up dataset. Planned dates and example results do not establish an outcome.</p>
        <p>Use the planned checks to organize the next collection. To compare learning later, the team needs dated student work, the task and scoring criteria, response coverage and a record of the teaching attempt.</p>
        <button className="textlink" aria-controls="reflect-collection" onClick={() => { setCollectionOpen(true); setFocusRequest({ id: 'reflect-collection-title', attempt: ++focusCounter.current }); }}>Review planned checks</button>
      </section>
    </div>
    <WorkflowActions label="Teaching attempt actions"
      description={<p>Used, partly used and not yet used are equally valid reports. Continue to choose the next action; this does not record the reflection yet.</p>}
      secondary={onBackToPlan ? <button type="button" className="btn secondary" onClick={onBackToPlan}>Back to meeting plan</button> : undefined}
      primary={{ label: s.implementation ? 'Continue to next step' : 'Report implementation first', onClick: continueFromAttempt, arrow: true }} />
    </section>

    <section id="reflect-next-panel" className="reflect-builder-panel reflect-next-step" hidden={task !== 'next-step'} aria-labelledby="reflection-label">
      <p className="reflect-attempt-summary"><strong>Teaching attempt:</strong> {implementationLabel}. {implementationMessage}</p>
      <p className="reflect-follow-up-boundary">This cycle has no collected follow-up dataset. Recording a next step does not establish student improvement.</p>

      <TextArea id="reflection" heading label={reflectionQuestion} requirement="Required · at least 30 characters"
        hint={s.implementation === 'no'
          ? 'Write the barrier, the adjustment or support needed, who will arrange it and when you will revisit the attempt. Do not judge a learning effect before the move has been tried.'
          : s.implementation === 'partial'
          ? 'Write what was tried, what changed, what you can and cannot conclude, then the next action, owner and review point.'
          : 'Write what you can support and what remains unknown. Then name the next action or evidence to collect, who is responsible and when the team will review it.'}
        value={s.reflection} onChange={value => dispatch({ type: 'text', field: 'reflection', value })}
        placeholder={s.implementation === 'no' ? 'The move was not tried because… Next, [who] will… We will revisit this on…' : 'We can say… We still need… [Who] will collect… We will revisit this on…'} />
      <details className="reflect-next-question" open={questionOpen} onToggle={event => setQuestionOpen(event.currentTarget.open)}>
        <summary>Question for the next PLC <span className="caption">Optional</span></summary>
        <TextArea id="next-cycle-question" label="What should the team examine next?" hint="Optional: turn an unresolved issue into a question for the next meeting, such as what drawings would reveal about equal amounts. It is recorded with this reflection; it does not create another evidence cycle."
          value={s.nextCycleQuestion} onChange={value => dispatch({ type: 'text', field: 'nextCycleQuestion', value })} />
      </details>
      <WorkflowActions label="Reflection actions"
        status={<p role="status">{unsaved ? 'Changes are not saved. Retry saving before leaving this browser.' : recorded ? 'Reflection recorded with this plan.' : 'Your report remains separate from demonstration examples.'}</p>}
        secondary={<button type="button" className="btn secondary" onClick={() => showTask('attempt')}>Back to teaching attempt</button>}
        primary={{ id: 'reflect-record', label: recordIsReady && onOpenRecord ? 'View your decision record' : nextRequiredControl === 'implementation-yes' ? 'Report implementation first' : nextRequiredControl === 'reflection' ? s.reflection.trim() ? 'Add detail to your next step' : 'Write your next step' : recordIsReady ? 'Reflection recorded' : 'Record next step', onClick: recordIsReady && onOpenRecord ? onOpenRecord : recordNextStep, disabled: recordIsReady && !onOpenRecord }} />
        <TaskExplanation title="Connect the teaching attempt to the next evidence-based decision" disclosureLabel="How to shape a useful next step"
        why="An approved plan records an intention. Reflection begins with what happened in class, then asks what the available evidence can support. Needing more evidence is a useful next decision when the collection plan is specific."
        steps={[
          { label: 'Report whether the move was used', detail: 'Compare the agreed move above with the classroom attempt. Choose Used as planned, Partially used or Not yet used. This is your report of implementation, not a measurement of student learning.' },
          { label: 'Check what evidence you actually have', detail: 'Review planned checks to see what the team intended to collect. Those checks and dates are plans. This prototype has no collected follow-up dataset attached to the cycle, so do not treat its worked examples as your results.' },
          { label: reflectionGuidance.label, detail: reflectionGuidance.detail },
        ]}
        example={reflectionGuidance.example}
        handoff="Record next step saves your implementation report and next action with this plan. It does not upload evidence, create a new cycle or certify that the teaching move worked." />
      <StepCoach question={reflectionQuestion} ready="Can you name the next action, who will take it, and when the team will revisit it?">
        <p>{s.implementation === 'no'
          ? 'Describe the barrier, one adjustment and the next opportunity to try the move. It has not been tested, so an outcome judgment would be premature.'
          : s.implementation === 'partial'
          ? 'Describe which parts happened and which did not. Keep that implementation report separate from what student work might show.'
          : 'A report that the move was used is different from evidence that students learned. Name the work needed for the next decision.'}</p>
        <p>Before comparing results, inspect the dated tasks, rubric, response coverage and teaching conditions. If these differ, describe what the current work shows and limit claims about change.</p>
        <p>Needing more evidence is a valid decision. Make it actionable by naming what to collect, who will bring it and the next review point.</p>
      </StepCoach>
    </section>
    <div className="workspace-stage-footer">
      <button className="textlink" onClick={openExamples}>Explore a worked example</button>
    </div>
  </div>;
}
