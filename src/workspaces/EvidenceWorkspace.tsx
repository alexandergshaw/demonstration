import { useEffect, useId, useRef, useState } from 'react';
import { BuilderNavigation } from '../components/BuilderNavigation';
import { Icon } from '../components/Icon';
import { StepCoach } from '../components/StepCoach';
import { WorkflowActions } from '../components/WorkflowActions';
import { TaskExplanation } from '../components/TaskExplanation';
import type { ReferenceData } from '../data/seed';
import { lessonContext } from '../lessonContext';
import type { Action, EvidenceId, PlanState } from '../model';
import { AssessmentResults, ClassResults, TaskSources } from './EvidenceViews';
import './EvidenceWorkspace.css';

interface EvidenceWorkspaceProps {
  state: PlanState;
  reference: ReferenceData;
  dispatch: (action: Action) => boolean | void;
}

type EvidenceView = 'results' | 'classes' | 'task';
type EvidencePlace = EvidenceView | 'work';
type EvidenceStep = 'assessment' | 'work' | 'review';

const evidenceSteps = [
  { id: 'assessment', label: 'Assessment', panelId: 'evidence-assessment-panel' },
  { id: 'work', label: 'Student work', panelId: 'evidence-work-panel' },
  { id: 'review', label: 'Review selection', panelId: 'evidence-review-panel' },
] as const;

export function EvidenceWorkspace({ state, reference, dispatch }: EvidenceWorkspaceProps) {
  const [step, setStep] = useState<EvidenceStep>('assessment');
  const [view, setView] = useState<EvidenceView>('results');
  const [opened, setOpened] = useState<EvidencePlace[]>(['results']);
  const [focusAttempt, setFocusAttempt] = useState(0);
  const pendingFocus = useRef<EvidenceStep | null>(null);
  const pendingReviewRemoval = useRef<EvidenceId | null>(null);
  const assessmentHeading = useRef<HTMLHeadingElement>(null);
  const studentWorkHeading = useRef<HTMLHeadingElement>(null);
  const reviewHeading = useRef<HTMLHeadingElement>(null);
  const viewId = useId();
  const { assessment, classes, responses, observation } = reference;
  const isRepeat = state.evidenceVersion === 'oct29';
  const observationSelected = state.selected.includes('observation');
  const selectedResponses = responses.filter(response => state.selected.includes(response.id));
  const selectedWork = selectedResponses.length;
  const returningToWriting = Boolean(state.interpretation.trim());

  useEffect(() => {
    const removedSource = pendingReviewRemoval.current;
    if (removedSource && !state.selected.includes(removedSource)) {
      pendingReviewRemoval.current = null;
      if (step === 'review') pendingFocus.current = 'review';
    }
    if (!pendingFocus.current) return;
    const target = pendingFocus.current;
    const frame = window.requestAnimationFrame(() => {
      const heading = target === 'assessment' ? assessmentHeading.current : target === 'work' ? studentWorkHeading.current : reviewHeading.current;
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ block: 'nearest' });
      pendingFocus.current = null;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [step, focusAttempt, state.selected]);

  function markOpened(place: EvidencePlace) {
    setOpened(previous => previous.includes(place) ? previous : [...previous, place]);
  }
  function selectStep(id: string, focus: boolean) {
    if (!evidenceSteps.some(item => item.id === id)) return;
    const next = id as EvidenceStep;
    pendingReviewRemoval.current = null;
    if (next === 'work') markOpened('work');
    pendingFocus.current = focus ? next : null;
    setStep(next);
    // Also cancels a queued button focus when a native selector is used.
    setFocusAttempt(previous => previous + 1);
  }
  function inspectPlace(place: EvidencePlace, focus = false) {
    markOpened(place);
    if (place !== 'work') setView(place);
    selectStep(place === 'work' ? 'work' : 'assessment', focus);
  }
  function removeFromReview(id: EvidenceId) {
    if (!state.selected.includes(id)) return;
    pendingReviewRemoval.current = id;
    if (dispatch({ type: 'evidence', id }) === false) pendingReviewRemoval.current = null;
  }
  const selectionStatus = `Class results included${selectedWork > 0 ? ` · ${selectedWork} work ${selectedWork === 1 ? 'sample' : 'samples'} selected` : ' · Student work selection is optional'}${observationSelected ? ' · Historical context included' : ''}`;

  return <div className="evidence-workspace">
    <BuilderNavigation label="Evidence review tasks" current={step} steps={evidenceSteps} onSelect={selectStep} />
    <div className="evidence-builder-status">
      <p aria-live="polite">{selectionStatus}</p>
      <button type="button" className="textlink" onClick={() => dispatch({ type: 'go', step: 1 })}>{returningToWriting ? 'Return to interpretation' : 'Continue to interpretation'}<Icon name="arrow" size={16} /></button>
    </div>

    <section id="evidence-assessment-panel" className="evidence-builder-panel evidence-results" hidden={step !== 'assessment'} aria-labelledby="evidence-assessment-title">
      <div className="evidence-section-heading">
        <h2 id="evidence-assessment-title" ref={assessmentHeading} tabIndex={-1}>Read the assessment</h2>
        <span className="evidence-included" title="Assessment included"><Icon name="check" size={15} /><span className="evidence-included-label">Included</span></span>
      </div>
      <p className="evidence-source-date">Fictional cool-down · <time dateTime={assessment.isoDate}>{assessment.date}, 2026</time> · {assessment.total} responses · {classes.length} classes</p>
      <div className="evidence-view-switch" role="group" aria-label="View assessment evidence">
        {([
          ['results', 'Results'], ['task', 'Task & sources'], ['classes', 'By class'],
        ] as const).map(([id, label]) => <button type="button" key={id} id={`${viewId}-${id}`} aria-pressed={view === id} aria-controls={`${viewId}-content`} onClick={() => inspectPlace(id)}>{label}</button>)}
      </div>
      {isRepeat && <p className="evidence-repeat-limit"><strong>Repeated task · 116 of 120 expected responses; 4 absent.</strong> Practice may affect results. These are not matched student-level gains or evidence of a teaching action’s effect.</p>}
      <div tabIndex={-1} className="evidence-view-content" id={`${viewId}-content`} role="region" aria-labelledby={`${viewId}-${view}`}>
        {view === 'results' && <AssessmentResults reference={reference} />}
        {view === 'classes' && <ClassResults reference={reference} />}
        {view === 'task' && <TaskSources reference={reference} version={state.evidenceVersion} />}
      </div>
      <WorkflowActions label="Assessment actions"
        description={<p>Use the task and scoring criteria to understand the counts. Next, inspect examples of student reasoning.</p>}
        primary={{ label: 'Continue to student work', onClick: () => selectStep('work', true), arrow: true }} />
      <details className="evidence-source-details">
        <summary>Learning goal & assessment context</summary>
        <div><p><strong>Learning goal:</strong> {lessonContext.goal}</p><p>This short end-of-lesson task gives the team a starting point for discussion. The assessment is included automatically and carries into your interpretation and meeting materials.</p></div>
      </details>
      <StepCoach question="What pattern is worth bringing to the team?" ready="You can point to a pattern, name its source, and say what it does not tell you.">
        <ul>
          <li>Compare the answer counts with the explanations in the work. What can each source tell you?</li>
          <li>Notice a strength in a student response before naming what it does not yet explain.</li>
          <li>Use Task & sources to check the prompt and scoring, or By class to inspect whether the counts vary.</li>
        </ul>
        <p>Select work that helps you examine the pattern. You can also start your interpretation with the class results alone.</p>
      </StepCoach>
    </section>

    <section id="evidence-work-panel" className="evidence-builder-panel evidence-student-work" hidden={step !== 'work'} aria-labelledby="evidence-work-title">
      <h2 id="evidence-work-title" ref={studentWorkHeading} tabIndex={-1}>Examine student work</h2>
      <p className="evidence-source-date">Two illustrative samples · {assessment.date}</p>
      <p className="evidence-rubric-anchor">Look for equal amounts of the same whole.</p>
      <p className="evidence-selection-intro">Selection is optional. The assessment stays included.</p>
      <div className="evidence-response-list">
        {responses.map(response => {
          const selected = state.selected.includes(response.id);
          return <article className={`evidence-response${selected ? ' is-selected' : ''}`} key={response.id}>
            <p className="evidence-response-label">{response.label}</p>
            <blockquote>“{response.quote}”</blockquote>
            <button type="button" className="evidence-select" aria-pressed={selected} aria-label={`${selected ? 'Remove this work' : 'Select this work'}: ${response.label}`} onClick={() => { markOpened('work'); dispatch({ type: 'evidence', id: response.id }); }}>
              <Icon name={selected ? 'check' : 'plus'} size={17} />{selected ? 'Remove this work' : 'Select this work'}
            </button>
          </article>;
        })}
      </div>
      <div className={`evidence-history${observationSelected ? ' is-selected' : ''}`}>
        <details>
          <summary><span className="evidence-history-title"><Icon name="clock" size={17} />Earlier observation</span><span className="evidence-history-meta"><time dateTime={observation.isoDate}>{observation.date}, 2026</time> · {observation.scope}</span>{observationSelected && <span className="evidence-history-status">Context selected</span>}</summary>
          <div className="evidence-history-body">
            <p className="evidence-source-date">Fictional observation · {observation.age}</p>
            <blockquote>“{observation.quote}”</blockquote>
            <button type="button" className="evidence-select" aria-pressed={observationSelected} onClick={() => dispatch({ type: 'evidence', id: 'observation' })}><Icon name={observationSelected ? 'check' : 'plus'} size={17} />{observationSelected ? 'Remove historical context' : 'Add historical context'}</button>
          </div>
        </details>
        <p className="evidence-history-caution">{observation.caution}</p>
        {observationSelected && <p className="evidence-history-next-check"><strong>Next check:</strong> Ask for a recent, dated observation or lesson artifact from the relevant classrooms before inferring current practice. Name what to gather in Plan’s implementation check.</p>}
      </div>
      <WorkflowActions label="Student work actions"
        secondary={<button type="button" className="btn secondary" onClick={() => selectStep('assessment', true)}>Back to assessment</button>}
        primary={{ label: 'Review selected evidence', onClick: () => selectStep('review', true), arrow: true }} />
      <TaskExplanation title="Choose work that helps the team think" disclosureLabel="How to choose student work"
        why="These two examples make the reasoning visible in a way that totals cannot. They are illustrations to discuss, not a representative sample of the whole grade."
        steps={[
          { label: 'Name what the student already understands.', detail: 'Look at the choice, words and reasoning. Then identify what the response leaves uncertain about equal amounts of the same whole.' },
          { label: 'Select a useful discussion example.', detail: 'Select this work keeps its exact quotation available beside your writing and in the approved source packet. Use Remove this work to take it out of your selection. The assessment remains included either way.' },
        ]} />
    </section>

    <section id="evidence-review-panel" className="evidence-builder-panel evidence-selection-review" hidden={step !== 'review'} aria-labelledby="evidence-review-title">
      <h2 id="evidence-review-title" ref={reviewHeading} tabIndex={-1}>Evidence you will take forward</h2>
      <p>The assessment is always included. Selected work and historical context will stay beside your interpretation and in the source packet.</p>
      <section className="evidence-review-source">
        <div className="evidence-section-heading"><h3>Assessment · {assessment.date}</h3><button type="button" className="textlink" onClick={() => selectStep('assessment', true)}>Revisit assessment</button></div>
        <p>{assessment.correct}/{assessment.total} correct fractions · {assessment.explanations}/{assessment.total} adequate explanations</p>
        <p>Separate scores; these totals do not identify who met both criteria.</p>
        {isRepeat && <p>Repeated task with 4 absent responses. These are not matched student-level gains or evidence of a teaching action’s effect.</p>}
      </section>
      {selectedResponses.map(response => <section className="evidence-review-source" key={response.id}>
        <div className="evidence-section-heading"><h3>{response.label} · {assessment.date}</h3><button type="button" className="textlink" onClick={() => removeFromReview(response.id)}>Remove<span className="sr-only"> {response.label}</span></button></div>
        <blockquote>“{response.quote}”</blockquote>
        <p>Illustrative work, not a representative sample.</p>
      </section>)}
      {!selectedWork && <div className="evidence-review-source"><p>No student work selected. You can interpret the class results alone or return to choose a discussion example.</p><button type="button" className="textlink" onClick={() => selectStep('work', true)}>Choose student work</button></div>}
      {observationSelected && <section className="evidence-review-source">
        <div className="evidence-section-heading"><h3>Historical context · {observation.date}</h3><button type="button" className="textlink" onClick={() => removeFromReview('observation')}>Remove historical context</button></div>
        <blockquote>“{observation.quote}”</blockquote><p>{observation.caution}</p>
      </section>}
      <WorkflowActions label="Evidence actions"
        description={<p>When you can name a pattern and a question worth investigating, write your own explanation in the next step. Continuing does not confirm an interpretation.</p>}
        secondary={<button type="button" className="btn secondary" onClick={() => selectStep('work', true)}>Back to student work</button>}
        primary={{ label: 'Interpret the evidence', onClick: () => dispatch({ type: 'go', step: 1 }), arrow: true }} />
    </section>

    <details className="evidence-inspection-history">
      <summary>Source views opened · {opened.length} of 4 this visit</summary>
      <p>This is a navigation aid, not a record that you reviewed a source. You can interpret without opening every view; selecting work is optional. This visit count resets when you leave Evidence.</p>
      <ul>{([['results', 'Compare the results'], ['task', 'Check the task and scoring'], ['classes', 'Compare classes'], ['work', 'Examine student work']] as const).map(([id, label]) => <li key={id}><button type="button" className="textlink" onClick={() => inspectPlace(id, true)}>{label}</button><span>{opened.includes(id) ? 'Opened' : 'Available'}</span></li>)}</ul>
    </details>
  </div>;
}
