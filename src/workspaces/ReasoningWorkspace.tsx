import { useEffect, useId, useRef, useState } from 'react';
import type { ReferenceData } from '../data/seed';
import { evidenceSnapshotDescription } from '../data/evidenceSnapshots';
import { hasFocus, type Action, type EvidenceId, type Lens, type PlanState } from '../model';
import { lessonContext } from '../lessonContext';
import { Modal } from '../components/CycleManager';
import { FieldError, TextArea, useFieldError } from '../components/Field';
import { Icon } from '../components/Icon';
import { StepCoach } from '../components/StepCoach';
import { StageChecklist } from '../components/StageChecklist';
import { TaskExplanation } from '../components/TaskExplanation';
import { WorkflowActions } from '../components/WorkflowActions';
import './ReasoningWorkspace.css';

interface ReasoningWorkspaceProps {
  state: PlanState;
  reference: ReferenceData;
  dispatch: (action: Action) => boolean;
  submit: (kind: 'focus' | 'plan' | 'reflection') => boolean;
  errorField: string;
  errorAttempt: number;
  clearError: () => void;
}

type Beat = 'notice' | 'test' | 'choose';
type Source = EvidenceId | 'task';

function TaskAndRubric({ headingLevel = 'h3' }: { headingLevel?: 'h3' | 'h4' }) {
  const Heading = headingLevel;
  return <div className="reasoning-task-material">
    <section><Heading>Original task</Heading><p>{lessonContext.prompt}</p></section>
    <section><Heading>Scoring criteria</Heading><p>{lessonContext.selection}</p><p>{lessonContext.rubric}</p></section>
    <p className="reasoning-source-note">{lessonContext.provenance}</p>
  </div>;
}

function SourceReader({ state, reference, source, onSourceChange, headingLevel = 'h2' }: {
  state: PlanState; reference: ReferenceData; source: Source; onSourceChange: (source: Source) => void;
  headingLevel?: 'h2' | 'h3';
}) {
  const Heading = headingLevel;
  const taskHeadingLevel = headingLevel === 'h2' ? 'h3' : 'h4';
  const selectId = useId();
  const { assessment, observation, responses } = reference;
  const selectedResponses = responses.filter(response => state.selected.includes(response.id));
  const response = selectedResponses.find(item => item.id === source);
  return <div className="reasoning-source-reader">
    <label className="reasoning-eyebrow" htmlFor={selectId}>Keep a source in view</label>
    <select id={selectId} aria-describedby={`${selectId}-help`} value={source} onChange={event => onSourceChange(event.target.value as Source)}>
      {selectedResponses.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
      <option value="assessment">Assessment · {assessment.date}</option>
      {state.selected.includes('observation') && <option value="observation">Historical observation · {observation.date}</option>}
      <option value="task">Original task & rubric</option>
    </select>
    <p id={`${selectId}-help`} className="reasoning-source-help">Switch between the counts, selected work and task as you write. Reading a different source here does not change your selection or your writing.</p>

    <div className="reasoning-source-content">
      {response ? <>
        <p className="reasoning-source-date">Selected student work · {assessment.date}</p>
        <Heading>{response.label}</Heading>
        <blockquote>“{response.quote}”</blockquote>
        <p className="reasoning-source-note">An illustrative response, not a representative sample.</p>
      </> : source === 'observation' ? <>
        <p className="reasoning-source-date reasoning-historical"><Icon name="clock" size={15} /> Historical context · {observation.date}</p>
        <Heading>Classroom observation</Heading>
        <blockquote>“{observation.quote}”</blockquote>
        <p className="reasoning-source-note">{observation.scope} · {observation.age}</p>
        <p className="reasoning-source-caution">{observation.caution}</p>
      </> : source === 'task' ? <>
        <p className="reasoning-source-date">Fictional lesson materials</p>
        <Heading>Task & rubric</Heading>
        <TaskAndRubric headingLevel={taskHeadingLevel} />
      </> : <>
        <p className="reasoning-source-date">Selected assessment · {assessment.date}</p>
        <Heading>What the work shows</Heading>
        <dl className="reasoning-source-totals">
          <div><dt>Correct fraction</dt><dd>{assessment.correct}<span> / {assessment.total}</span></dd></div>
          <div><dt>Adequate explanation</dt><dd>{assessment.explanations}<span> / {assessment.total}</span></dd></div>
        </dl>
        <p className="reasoning-source-note">Separate scores. The totals do not show which students met both criteria.</p>
      </>}
    </div>

    {response && <p className="reasoning-assessment-context"><strong>{assessment.correct}/{assessment.total}</strong> correct fractions<br /><strong>{assessment.explanations}/{assessment.total}</strong> adequate explanations</p>}
    {source !== 'task' && <details className="reasoning-source-disclosure"><summary>Inspect original task & rubric</summary><TaskAndRubric headingLevel={taskHeadingLevel} /></details>}
    <details className="reasoning-source-disclosure">
      <summary>Source scope & collection</summary>
      <div className="reasoning-source-detail"><p>{evidenceSnapshotDescription(state.evidenceVersion)}</p><p>{lessonContext.limits}</p></div>
    </details>
    <details className="reasoning-source-disclosure">
      <summary>Check variation across classes</summary>
      <div className="reasoning-source-detail">
        <p>{assessment.date} · Descriptive counts, not a measure of teacher effectiveness.</p>
        <ul className="reasoning-class-counts">{reference.classes.map(item => <li key={item.id}><strong>{item.label}</strong><span>{item.correct}/{item.total} correct fraction</span><span>{item.explanations}/{item.total} adequate explanation</span></li>)}</ul>
      </div>
    </details>
  </div>;
}

export function ReasoningWorkspace({ state, reference, dispatch, submit, errorField, errorAttempt, clearError }: ReasoningWorkspaceProps) {
  const [beat, setBeat] = useState<Beat>(() => state.challenged || hasFocus(state) ? 'choose' : 'notice');
  const [focusTask, setFocusTask] = useState<'focus' | 'confirm'>(() => state.focus.trim().length >= 25 ? 'confirm' : 'focus');
  const [source, setSource] = useState<Source>(() => reference.responses.find(item => state.selected.includes(item.id))?.id ?? 'assessment');
  const [sourceOpen, setSourceOpen] = useState(false);
  const [focusAttempt, setFocusAttempt] = useState(0);
  const pendingFocus = useRef<string | null>(null);
  const workspace = useRef<HTMLDivElement>(null);
  const challengeError = useFieldError('challenge', 'reasoning-challenge-help');
  const selectedSource = source === 'task' || source === 'assessment' || state.selected.includes(source) ? source : 'assessment';
  const selectedResponse = reference.responses.find(item => item.id === selectedSource);
  const challenge = reference.challenges.find(item => item.id === state.lens) ?? reference.challenges[0];
  const interpretationReady = state.interpretation.trim().length >= 30;
  const focusReady = state.focus.trim().length >= 25;
  const missingFocusStep = !interpretationReady ? 'notice' : !state.challenged ? 'test' : null;

  // Reveal an invalid field first, then focus it after the newly visible panel commits.
  useEffect(() => {
    const target: Beat | undefined = errorField === 'interpretation' ? 'notice' : errorField === 'challenge' ? 'test' : errorField === 'focus' || errorField === 'confidence' ? 'choose' : undefined;
    // Clearing a validation message must not erase focus requested by beat navigation.
    if (!target) return;
    pendingFocus.current = errorField;
    if (target === 'choose') setFocusTask('focus');
    setBeat(target);
  }, [errorField, errorAttempt]);
  useEffect(() => {
    if (!pendingFocus.current) return;
    const frame = requestAnimationFrame(() => {
      const id = pendingFocus.current;
      const field = id ? document.getElementById(id) : null;
      if (field && workspace.current?.contains(field) && !field.closest('[hidden]')) {
        field.focus();
        pendingFocus.current = null;
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [beat, errorField, errorAttempt, focusAttempt]);

  function requestFocus(id: string) {
    pendingFocus.current = id;
    setFocusAttempt(attempt => attempt + 1);
  }

  function goToBeat(next: Beat, focusEditor = false) {
    if (next === 'choose') setFocusTask('focus');
    const changedBeat = next !== beat;
    requestFocus(next === 'notice' ? focusEditor || !changedBeat ? 'interpretation' : 'reasoning-notice-guide'
      : next === 'test' ? 'reasoning-test-title'
      : focusEditor || !changedBeat ? 'focus' : 'reasoning-focus-guide');
    clearError();
    setBeat(next);
  }
  function considerQuestion() {
    if (dispatch({ type: 'challenge' })) {
      goToBeat('choose');
    }
  }
  const confirmedFocus = hasFocus(state);
  function reviewFocus() {
    clearError();
    setBeat('choose');
    setFocusTask('confirm');
    requestFocus('focus-confirm');
  }

  return <div className="reasoning-workspace" ref={workspace}>
    <aside className="reasoning-source-pane" aria-label="Original evidence beside your writing">
      <SourceReader state={state} reference={reference} source={selectedSource} onSourceChange={setSource} />
      <button className="textlink reasoning-change-sources" onClick={() => dispatch({ type: 'go', step: 0 })}>Change selected evidence<Icon name="arrow" size={15} /></button>
    </aside>

    <div className="reasoning-writing">
      <StageChecklist title="Interpretation checklist" description="Turn an observed pattern into a teaching focus you can defend."
        currentId={beat === 'choose' ? focusTask : beat}
        items={[
          { id: 'notice', label: 'Write your interpretation', detail: 'Connect the pattern to a specific source.', status: interpretationReady ? 'done' : state.interpretation.trim() ? 'started' : 'todo', statusLabel: interpretationReady ? 'Drafted' : undefined, onSelect: () => goToBeat('notice', true) },
          { id: 'test', label: 'Consider an alternative', detail: 'Decide how another explanation changes your thinking.', status: state.challenged ? 'done' : 'todo', statusLabel: state.challenged ? 'Considered by you' : undefined, onSelect: () => goToBeat('test') },
          { id: 'focus', label: 'Write one teaching focus', detail: 'Name the learning need the meeting will investigate.', status: focusReady ? 'done' : state.focus.trim() ? 'started' : 'todo', statusLabel: focusReady ? 'Drafted' : undefined, onSelect: () => goToBeat('choose', true) },
          { id: 'confirm', label: 'Review and confirm your focus', detail: 'Own the decision before building the meeting plan.', status: confirmedFocus ? 'done' : 'todo', statusLabel: confirmedFocus ? 'Confirmed by you' : undefined, onSelect: reviewFocus },
        ]} note="Drafted means the writing minimum is met. Confirmation is your separate decision; edits can require it again." />
      <aside className="reasoning-mobile-evidence" aria-label="Evidence reference while writing">
        {selectedResponse ? <>
          <p><strong>{selectedResponse.label} · {reference.assessment.date}</strong></p>
          <blockquote>“{selectedResponse.quote}”</blockquote>
          <p>Illustrative work, not a representative sample.</p>
        </> : selectedSource === 'observation' ? <>
          <p><strong>Historical observation · {reference.observation.date}</strong></p>
          <blockquote>“{reference.observation.quote}”</blockquote>
          <p>{reference.observation.caution}</p>
        </> : selectedSource === 'task' ? <>
          <p><strong>Original task</strong></p>
          <blockquote>{lessonContext.prompt}</blockquote>
        </> : <>
          <p><strong>Assessment · {reference.assessment.date}</strong></p>
          <p>{reference.assessment.correct}/{reference.assessment.total} correct fractions · {reference.assessment.explanations}/{reference.assessment.total} adequate explanations</p>
          <p>Separate scores; the totals do not identify who met both criteria.</p>
        </>}
        <button className="textlink reasoning-mobile-source" onClick={() => setSourceOpen(true)}><Icon name="evidence" />View selected evidence & task</button>
      </aside>

      <section className="reasoning-beat-panel" hidden={beat !== 'notice'} id="reasoning-notice-guide" tabIndex={-1} aria-labelledby="interpretation-label">
        <div className="reasoning-work-area">
          <TextArea id="interpretation" heading label="What do you notice?" requirement="Required · at least 30 characters"
            hint="Write three connected parts: what the source shows, what it might mean, and what you still need to know. A few precise sentences are enough."
            value={state.interpretation} onChange={value => dispatch({ type: 'text', field: 'interpretation', value })}
            placeholder="I notice… The work suggests… I’m still unsure about…" />
        </div>
        <WorkflowActions label="Interpretation actions"
          description={<p>{interpretationReady ? 'Next, compare your interpretation with another explanation before choosing a focus.' : 'Start with your observation and possible explanation. Use at least 30 characters, then test another explanation.'}</p>}
          secondary={<button type="button" className="btn secondary" onClick={() => dispatch({ type: 'go', step: 0 })}>Back to evidence</button>}
          primary={{ label: interpretationReady ? 'Test an alternative' : state.interpretation.trim() ? 'Add detail to your interpretation' : 'Write your interpretation', onClick: () => goToBeat(interpretationReady ? 'test' : 'notice'), arrow: true }} />
        <TaskExplanation title="Separate what you can see from what you think it means" disclosureLabel="How to write an interpretation"
          why="The team needs a shared starting point before deciding what to teach. A count or quotation is an observation; an explanation of why it happened is a hypothesis to examine."
          steps={[
            { label: 'Point to the evidence', detail: 'Name a count, phrase or drawing, and its source. Include the understanding a student has already shown.' },
            { label: 'Offer a possible explanation', detail: 'Explain what that detail might mean for fraction understanding. Use language such as “may” or “suggests” when the source cannot establish the cause.' },
            { label: 'Name the uncertainty', detail: 'Say what another task, student explanation or classroom observation would help you find out. Then use Test an alternative to challenge your first account.' },
          ]}
          example={`Observation: ${reference.assessment.correct} of ${reference.assessment.total} responses selected the correct fraction; ${reference.assessment.explanations} gave an adequate explanation. Possible interpretation: some students may know a procedure without being able to explain equal amounts. Uncertainty: the totals do not identify which students met both criteria, and the prompt may affect how students explain.`}
          handoff="Your writing carries into the next step. You can return to Notice and revise it after considering another explanation." />
        <StepCoach question="What does this work show, and what might explain it?" ready="You can point to a specific part of the work and distinguish what it shows from your possible explanation.">
          <p>Start with the learning goal and the original task. Name the source behind your claim, including the understanding already visible in the work.</p>
          <p>Could wording, language, format or opportunities to respond be hiding understanding? Consider whose work or perspective is missing, and how students could explain the same idea in another way.</p>
        </StepCoach>
      </section>

      <section className="reasoning-beat-panel" hidden={beat !== 'test'} id="reasoning-test-guide" aria-labelledby="reasoning-test-title">
        <h2 id="reasoning-test-title" tabIndex={-1}>What else could explain it?</h2>
        <div className="reasoning-previous-writing">
          <div><span className="reasoning-eyebrow">Your interpretation</span><button className="textlink" onClick={() => goToBeat('notice', true)}>{state.interpretation.trim() ? 'Edit interpretation' : 'Write interpretation'}<Icon name="pencil" size={14} /></button></div>
          {state.interpretation.trim() ? <details className="reasoning-interpretation-disclosure"><summary>Read full interpretation</summary><p>{state.interpretation}</p></details> : <p>Start with what you notice in the selected work.</p>}
        </div>
        <div className="reasoning-work-area reasoning-alternative-work">
          <div className="reasoning-question">
            <p className="reasoning-eyebrow">Thinking partner · Scripted question</p>
            <p className="reasoning-question-copy">{challenge.prompt}</p>
          </div>
          <div className="reasoning-lens-choice"><label htmlFor="reasoning-lens">Try another angle</label><select id="reasoning-lens" aria-describedby="reasoning-lens-help" value={state.lens} onChange={event => dispatch({ type: 'lens', value: event.target.value as Lens })}>{reference.challenges.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
          <p id="reasoning-lens-help" className="reasoning-panel-help">Each angle opens a different scripted question. Changing it asks you to consider that question before confirming your focus again.</p>
          <p id="reasoning-challenge-help" className="reasoning-panel-help">If you keep your interpretation, carry the alternative and remaining uncertainty into your focus.</p>
          {!interpretationReady && <p className="reasoning-panel-help">Write your interpretation first so you can compare it with this alternative. Use at least 30 characters.</p>}
          <FieldError id="challenge" />
        </div>
        <WorkflowActions label="Respond to the alternative"
          secondary={<><button type="button" className="btn secondary" onClick={() => goToBeat('notice', true)}>Revise interpretation</button><button type="button" className="textlink" onClick={() => setSourceOpen(true)}>Inspect source</button></>}
          primary={{ id: 'challenge', invalid: challengeError.invalid, describedBy: challengeError.describedBy, label: interpretationReady ? 'Keep interpretation & explain uncertainty' : 'Write interpretation first', onClick: () => interpretationReady ? considerQuestion() : goToBeat('notice', true), arrow: true }} />
        <TaskExplanation title="Test your account before turning it into a teaching decision" disclosureLabel="How to test an alternative"
          why="The same response can have more than one explanation. This prewritten question helps you check a possibility; it does not analyze your writing or decide which explanation is correct."
          steps={[
            { label: 'Compare the question with your evidence', detail: 'Read the scripted question, then inspect the original task or student work. Try another angle if wording, mathematical meaning or class variation deserves a closer look.' },
            { label: 'Choose how to respond', detail: 'Use Revise interpretation if the alternative changes your account. Use Inspect source if you need another look. Both keep your draft available.' },
            { label: 'Carry a qualified judgment forward', detail: 'When you are ready to retain your current interpretation, choose Keep interpretation & explain uncertainty. That records consideration of this question and opens the focus editor; you will explain the remaining uncertainty there.' },
          ]}
          example="A student who writes “I doubled both numbers” may understand equivalent amounts, but the sentence alone does not show why they are equal. Asking the student to show the same whole in a drawing could help distinguish a memorized procedure from an explanation of the amounts."
          handoff="You do not have to agree with the alternative. The aim is to make your reasoning and its limits clear before choosing the focus." />
        <StepCoach question="How does this alternative affect your interpretation?" ready="You can explain why you revised or kept your interpretation, and what evidence could change your mind.">
          <p>You can revise your earlier writing, inspect the source again, or keep your interpretation and explain the remaining uncertainty in your focus.</p>
          <p>Keeping your interpretation marks this question as considered. You still write and confirm your own focus; the question is not a diagnosis or approval.</p>
        </StepCoach>
      </section>

      <section className="reasoning-beat-panel" hidden={beat !== 'choose'} id="reasoning-focus-guide" tabIndex={-1} aria-labelledby="focus-label">
        <div className="reasoning-work-area">
          <TextArea id="focus" heading label="Choose one teaching focus" requirement="Required · at least 25 characters"
            hint="Connect one teaching focus to its evidence, the alternative you considered, and what would change your mind."
            value={state.focus} onChange={value => dispatch({ type: 'text', field: 'focus', value })}
            placeholder="Focus on… The work shows… Another explanation is… I would reconsider if…" />
          <div className="reasoning-confidence"><label htmlFor="confidence">How certain are you?</label><select id="confidence" aria-describedby="reasoning-confidence-help" value={state.confidence} onChange={event => dispatch({ type: 'confidence', value: event.target.value as PlanState['confidence'] })}><option value="tentative">Tentative</option><option value="moderate">Moderate</option><option value="strong">Strong</option></select></div>
          <dl id="reasoning-confidence-help" className="reasoning-confidence-scale">
            <div><dt>Tentative</dt><dd>A useful possibility with substantial uncertainty.</dd></div>
            <div><dt>Moderate</dt><dd>Some evidence supports the focus, with alternatives still open.</dd></div>
            <div><dt>Strong</dt><dd>You can explain substantial supporting evidence and its limits.</dd></div>
          </dl>
          <p className="reasoning-ownership">This is your judgment, not a score from the app. Confirm when you can explain the focus in your own words. The writing minimum only checks that you have entered a response; it does not establish that the interpretation is sound.</p>
        </div>
        <div className="reasoning-previous-writing">
          <div><span className="reasoning-eyebrow">Your interpretation</span><button className="textlink" onClick={() => goToBeat('notice', true)}>Edit interpretation<Icon name="pencil" size={14} /></button></div>
          {state.interpretation.trim() ? <details className="reasoning-interpretation-disclosure"><summary>Read full interpretation</summary><p>{state.interpretation}</p></details> : <p>Your interpretation will appear here.</p>}
          <button className="textlink reasoning-review-question" onClick={() => goToBeat('test')}><Icon name={state.challenged ? 'check' : 'reasoning'} size={15} />{state.challenged ? 'Revisit the alternative' : 'Consider an alternative'}</button>
        </div>
        <WorkflowActions label="Teaching focus actions"
          description={missingFocusStep ? <p>{missingFocusStep === 'notice' ? 'Before confirming: write the interpretation that supports this focus, using at least 30 characters. Your focus draft stays here.' : 'Before confirming: consider an alternative explanation. Your focus draft stays here.'}</p> : undefined}
          status={confirmedFocus ? <p>Focus confirmed by you. Continue with this decision, or revise your writing and confirm it again.</p> : undefined}
          secondary={<button type="button" className="btn secondary" onClick={() => goToBeat('test')}>Back to the alternative</button>}
          primary={{ id: 'focus-confirm', label: confirmedFocus ? 'Continue to meeting plan' : missingFocusStep === 'notice' ? 'Write interpretation first' : missingFocusStep === 'test' ? 'Consider an alternative first' : !focusReady ? state.focus.trim() ? 'Add detail to your focus' : 'Write your teaching focus' : 'Confirm focus & continue', onClick: () => confirmedFocus ? dispatch({ type: 'go', step: 2 }) : missingFocusStep ? goToBeat(missingFocusStep, true) : !focusReady ? goToBeat('choose', true) : submit('focus'), arrow: true }} />
        <TaskExplanation title="Choose the learning need the meeting will investigate" disclosureLabel="How to choose a teaching focus"
          why="A focus narrows the team’s attention to one aspect of student thinking. The next workspace turns that focus into a specific teacher action and meeting plan."
          steps={[
            { label: 'Name one learning focus', detail: 'Describe the reasoning students need to develop, such as explaining why two fractions represent equal amounts of the same whole.' },
            { label: 'Explain your choice', detail: 'Connect the focus to the source you noticed and the alternative you considered. Include the evidence that would make you choose differently.' },
            { label: 'Set your confidence and confirm', detail: 'Choose how strongly the available evidence supports this working judgment. Confirm focus & continue records your decision and opens Plan; the app does not rate its instructional quality.' },
          ]}
          example="Focus on explaining why equivalent fractions name equal amounts of the same whole. The example using a doubling rule raises a question about how students connect a procedure to meaning. I would reconsider if follow-up drawings and explanations showed that students already make that connection."
          handoff="You can revise this focus later. Changing the evidence or your reasoning requires confirmation again so the meeting plan stays connected to the decision you actually made." />
        <StepCoach question="What evidence would make you choose a different focus?" ready="You can explain one focus through its evidence, an alternative explanation and what would make you reconsider.">
          <p>Choose one teaching focus connected to the learning goal. Explain why it is worth investigating without turning a small sample or an older observation into proof.</p>
          <p>Use your focus to connect the evidence, the alternative you considered and the next thing to check. A few precise sentences are enough.</p>
        </StepCoach>
      </section>

    </div>
    {sourceOpen && <Modal title="Selected evidence & original task" onClose={() => setSourceOpen(false)}><div className="reasoning-source-modal"><SourceReader state={state} reference={reference} source={selectedSource} onSourceChange={setSource} headingLevel="h3" /><button className="btn secondary" onClick={() => setSourceOpen(false)}>Return to my writing</button></div></Modal>}
  </div>;
}
