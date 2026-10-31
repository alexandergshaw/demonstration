import { useEffect, useId, useRef, useState } from 'react';
import type { ReferenceData } from '../data/seed';
import { evidenceSnapshotDescription } from '../data/evidenceSnapshots';
import { hasFocus, type Action, type EvidenceId, type Lens, type PlanState } from '../model';
import { lessonContext } from '../lessonContext';
import { Modal } from '../components/CycleManager';
import { FieldError, TextArea, useFieldError } from '../components/Field';
import { Icon } from '../components/Icon';
import { StepCoach } from '../components/StepCoach';
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
const beats: { id: Beat; label: string }[] = [
  { id: 'notice', label: 'Notice' },
  { id: 'test', label: 'Test an alternative' },
  { id: 'choose', label: 'Choose a focus' },
];

function TaskAndRubric() {
  return <div className="reasoning-task-material">
    <section><h3>Original task</h3><p>{lessonContext.prompt}</p></section>
    <section><h3>Scoring criteria</h3><p>{lessonContext.selection}</p><p>{lessonContext.rubric}</p></section>
    <p className="reasoning-source-note">{lessonContext.provenance}</p>
  </div>;
}

function SourceReader({ state, reference, source, onSourceChange }: {
  state: PlanState; reference: ReferenceData; source: Source; onSourceChange: (source: Source) => void;
}) {
  const selectId = useId();
  const { assessment, observation, responses } = reference;
  const selectedResponses = responses.filter(response => state.selected.includes(response.id));
  const response = selectedResponses.find(item => item.id === source);
  return <div className="reasoning-source-reader">
    <label className="reasoning-eyebrow" htmlFor={selectId}>Keep a source in view</label>
    <select id={selectId} value={source} onChange={event => onSourceChange(event.target.value as Source)}>
      {selectedResponses.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
      <option value="assessment">Assessment · {assessment.date}</option>
      {state.selected.includes('observation') && <option value="observation">Historical observation · {observation.date}</option>}
      <option value="task">Original task & rubric</option>
    </select>

    <div className="reasoning-source-content">
      {response ? <>
        <p className="reasoning-source-date">Selected student work · {assessment.date}</p>
        <h2>{response.label}</h2>
        <blockquote>“{response.quote}”</blockquote>
        <p className="reasoning-source-note">An illustrative response, not a representative sample.</p>
      </> : source === 'observation' ? <>
        <p className="reasoning-source-date reasoning-historical"><Icon name="clock" size={15} /> Historical context · {observation.date}</p>
        <h2>Classroom observation</h2>
        <blockquote>“{observation.quote}”</blockquote>
        <p className="reasoning-source-note">{observation.scope} · {observation.age}</p>
        <p className="reasoning-source-caution">{observation.caution}</p>
      </> : source === 'task' ? <>
        <p className="reasoning-source-date">Fictional lesson materials</p>
        <h2>Task & rubric</h2>
        <TaskAndRubric />
      </> : <>
        <p className="reasoning-source-date">Selected assessment · {assessment.date}</p>
        <h2>What the work shows</h2>
        <dl className="reasoning-source-totals">
          <div><dt>Correct fraction</dt><dd>{assessment.correct}<span> / {assessment.total}</span></dd></div>
          <div><dt>Adequate explanation</dt><dd>{assessment.explanations}<span> / {assessment.total}</span></dd></div>
        </dl>
        <p className="reasoning-source-note">Separate scores. The totals do not show which students met both criteria.</p>
      </>}
    </div>

    {response && <p className="reasoning-assessment-context"><strong>{assessment.correct}/{assessment.total}</strong> correct fractions<br /><strong>{assessment.explanations}/{assessment.total}</strong> adequate explanations</p>}
    {source !== 'task' && <details className="reasoning-source-disclosure"><summary>Inspect original task & rubric</summary><TaskAndRubric /></details>}
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
  const [source, setSource] = useState<Source>(() => reference.responses.find(item => state.selected.includes(item.id))?.id ?? 'assessment');
  const [sourceOpen, setSourceOpen] = useState(false);
  const [focusAttempt, setFocusAttempt] = useState(0);
  const pendingFocus = useRef<string | null>(null);
  const workspace = useRef<HTMLDivElement>(null);
  const challengeError = useFieldError('challenge', 'reasoning-challenge-help');
  const selectedSource = source === 'task' || source === 'assessment' || state.selected.includes(source) ? source : 'assessment';
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

  function goToBeat(next: Beat) {
    requestFocus(next === 'notice' ? 'interpretation' : next === 'test' ? 'reasoning-test-title' : 'focus');
    clearError();
    setBeat(next);
  }
  function considerQuestion() {
    if (dispatch({ type: 'challenge' })) {
      goToBeat('choose');
    }
  }

  return <div className="reasoning-workspace" ref={workspace}>
    <aside className="reasoning-source-pane" aria-label="Original evidence beside your writing">
      <SourceReader state={state} reference={reference} source={selectedSource} onSourceChange={setSource} />
      <button className="textlink reasoning-change-sources" onClick={() => dispatch({ type: 'go', step: 0 })}>Change selected evidence<Icon name="arrow" size={15} /></button>
    </aside>

    <div className="reasoning-writing">
      <nav className="reasoning-beats" aria-label="Reasoning sequence">
        {beats.map((item, index) => <button key={item.id} onClick={() => goToBeat(item.id)} aria-current={beat === item.id ? 'step' : undefined}>
          <span className="reasoning-beat-number" aria-hidden="true">{index + 1}</span><span>{item.label}</span>
        </button>)}
      </nav>
      <button className="btn secondary reasoning-mobile-source" onClick={() => setSourceOpen(true)}><Icon name="evidence" />View selected evidence & task</button>

      <section className="reasoning-beat-panel" hidden={beat !== 'notice'} aria-labelledby="interpretation-label">
        <StepCoach question="What does this work show, and what might explain it?" ready="You can point to a specific part of the work and distinguish what it shows from your possible explanation.">
          <p>Start with the learning goal and the original task. Name the source behind your claim, including the understanding already visible in the work.</p>
          <p>Could wording, language, format or opportunities to respond be hiding understanding? Consider whose work or perspective is missing, and how students could explain the same idea in another way.</p>
        </StepCoach>
        <TextArea id="interpretation" heading label="What do you notice?" requirement="Required · at least 30 characters"
          hint="Name the source. Separate what you observe from your explanation, and keep uncertainty visible."
          value={state.interpretation} onChange={value => dispatch({ type: 'text', field: 'interpretation', value })}
          placeholder="I notice… The work suggests… I’m still unsure about…" />
      </section>

      <section className="reasoning-beat-panel" hidden={beat !== 'test'} aria-labelledby="reasoning-test-title">
        <div className="reasoning-previous-writing">
          <div><span className="reasoning-eyebrow">Your interpretation</span><button className="textlink" onClick={() => goToBeat('notice')}>{state.interpretation.trim() ? 'Edit' : 'Write interpretation'}<Icon name="pencil" size={14} /></button></div>
          <p>{state.interpretation.trim() || 'Start with what you notice in the selected work.'}</p>
        </div>
        <h2 id="reasoning-test-title" tabIndex={-1}>What else could explain it?</h2>
        <StepCoach question="How does this alternative affect your interpretation?" ready="You can explain why you revised or kept your interpretation, and what evidence could change your mind.">
          <p>You can revise your earlier writing, inspect the source again, or keep your interpretation and explain the remaining uncertainty in your focus.</p>
          <p>Keeping your interpretation marks this question as considered. You still write and confirm your own focus; the question is not a diagnosis or approval.</p>
        </StepCoach>
        <div className="reasoning-question">
          <p className="reasoning-eyebrow">Thinking partner · Scripted question</p>
          <p className="reasoning-question-copy">{challenge.prompt}</p>
        </div>
        <div className="reasoning-lens-choice"><label htmlFor="reasoning-lens">Try another angle</label><select id="reasoning-lens" value={state.lens} onChange={event => dispatch({ type: 'lens', value: event.target.value as Lens })}>{reference.challenges.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
        <div className="reasoning-challenge-routes" role="group" aria-label="Respond to the alternative">
          <button className="btn secondary" onClick={() => goToBeat('notice')}><Icon name="pencil" size={16} />Revise interpretation</button>
          <button className="btn secondary" onClick={() => setSourceOpen(true)}><Icon name="evidence" size={16} />Inspect source</button>
        </div>
        <p id="reasoning-challenge-help" className="reasoning-panel-help">If you keep your interpretation, carry the alternative and remaining uncertainty into your focus.</p>
        {!interpretationReady && <p className="reasoning-panel-help">Write your interpretation first so you can compare it with this alternative. Use at least 30 characters.</p>}
        <FieldError id="challenge" />
      </section>

      <section className="reasoning-beat-panel" hidden={beat !== 'choose'} aria-labelledby="focus-label">
        <div className="reasoning-previous-writing">
          <div><span className="reasoning-eyebrow">Your interpretation</span><button className="textlink" onClick={() => goToBeat('notice')}>Edit<Icon name="pencil" size={14} /></button></div>
          <p>{state.interpretation.trim() || 'Your interpretation will appear here.'}</p>
          <button className="textlink reasoning-review-question" onClick={() => goToBeat('test')}><Icon name={state.challenged ? 'check' : 'reasoning'} size={15} />{state.challenged ? 'Revisit the alternative' : 'Consider an alternative'}</button>
        </div>
        <StepCoach question="What evidence would make you choose a different focus?" ready="You can explain one focus through its evidence, an alternative explanation and what would make you reconsider.">
          <p>Choose one teaching focus connected to the learning goal. Explain why it is worth investigating without turning a small sample or an older observation into proof.</p>
          <p>Use the focus below to connect the evidence, the alternative you considered and the next thing to check. A few precise sentences are enough.</p>
        </StepCoach>
        <TextArea id="focus" heading label="Choose one teaching focus" requirement="Required · at least 25 characters"
          hint="Connect one teaching focus to its evidence, the alternative you considered, and what would change your mind."
          value={state.focus} onChange={value => dispatch({ type: 'text', field: 'focus', value })}
          placeholder="Focus on… The work shows… Another explanation is… I would reconsider if…" />
        <div className="reasoning-confidence"><label htmlFor="confidence">How certain are you?</label><select id="confidence" value={state.confidence} onChange={event => dispatch({ type: 'confidence', value: event.target.value as PlanState['confidence'] })}><option value="tentative">Tentative</option><option value="moderate">Moderate</option><option value="strong">Strong</option></select></div>
        <p className="reasoning-ownership">This is your working judgment. Confirm it when you can explain the evidence in your own words.</p>
      </section>

      <footer className="reasoning-footer">
        {beat === 'notice' && <p className="reasoning-next-requirement">{interpretationReady
          ? 'Next, compare your interpretation with another explanation before choosing a focus.'
          : 'Start with your observation and possible explanation. Use at least 30 characters, then test another explanation.'}</p>}
        {beat === 'choose' && missingFocusStep && <p className="reasoning-next-requirement">{missingFocusStep === 'notice'
          ? 'Before confirming: write the interpretation that supports this focus, using at least 30 characters. Your focus draft stays here.'
          : 'Before confirming: consider an alternative explanation. Your focus draft stays here.'}</p>}
        {beat !== 'test' && <button className="textlink" onClick={() => beat === 'notice' ? dispatch({ type: 'go', step: 0 }) : goToBeat('test')}>{beat === 'notice' ? 'Review evidence' : 'Revisit alternative'}</button>}
        {beat === 'notice' ? <button className="btn" onClick={() => goToBeat(interpretationReady ? 'test' : 'notice')}>{interpretationReady ? 'Test an alternative' : state.interpretation.trim() ? 'Add detail to your interpretation' : 'Write your interpretation'}<Icon name="arrow" size={17} /></button>
          : beat === 'test' ? <button id="challenge" className="btn reasoning-keep-interpretation" aria-invalid={challengeError.invalid || undefined} aria-describedby={challengeError.describedBy} onClick={() => interpretationReady ? considerQuestion() : goToBeat('notice')}>{interpretationReady ? 'Keep interpretation & explain uncertainty' : 'Write interpretation first'}<Icon name="arrow" size={17} /></button>
          : <button className="btn" onClick={() => missingFocusStep ? goToBeat(missingFocusStep) : !focusReady ? goToBeat('choose') : submit('focus')}>{missingFocusStep === 'notice' ? 'Write interpretation first' : missingFocusStep === 'test' ? 'Consider an alternative first' : !focusReady ? state.focus.trim() ? 'Add detail to your focus' : 'Write your teaching focus' : 'Confirm focus & continue'}<Icon name="arrow" size={17} /></button>}
      </footer>
    </div>
    {sourceOpen && <Modal title="Selected evidence & original task" onClose={() => setSourceOpen(false)}><div className="reasoning-source-modal"><SourceReader state={state} reference={reference} source={selectedSource} onSourceChange={setSource} /><button className="btn secondary" onClick={() => setSourceOpen(false)}>Return to my writing</button></div></Modal>}
  </div>;
}
