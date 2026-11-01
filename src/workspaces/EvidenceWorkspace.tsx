import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StageChecklist, type ChecklistTask } from '../components/StageChecklist';
import { Icon } from '../components/Icon';
import { StepCoach } from '../components/StepCoach';
import { WorkflowActions } from '../components/WorkflowActions';
import { TaskExplanation } from '../components/TaskExplanation';
import type { ReferenceData } from '../data/seed';
import { lessonContext } from '../lessonContext';
import type { Action, EvidenceId, EvidenceReviewTask, PlanState } from '../model';
import { AssessmentResults, ClassResults, TaskSources } from './EvidenceViews';
import './EvidenceWorkspace.css';

interface EvidenceWorkspaceProps {
  state: PlanState;
  reference: ReferenceData;
  dispatch: (action: Action) => boolean | void;
}

type EvidenceView = 'results' | 'classes' | 'task';
const evidenceHeadingIds: Record<EvidenceReviewTask, string> = {
  results: 'evidence-assessment-title', task: 'evidence-task-title', classes: 'evidence-classes-title',
  work: 'evidence-work-title', selection: 'evidence-review-title',
};

export function EvidenceWorkspace({ state, reference, dispatch }: EvidenceWorkspaceProps) {
  const [current, setCurrent] = useState<EvidenceReviewTask>('results');
  const [focusAttempt, setFocusAttempt] = useState(0);
  const pendingFocus = useRef<EvidenceReviewTask | null>(null);
  const pendingReviewRemoval = useRef<EvidenceId | null>(null);
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
      if (current === 'selection') pendingFocus.current = 'selection';
    }
    if (!pendingFocus.current) return;
    const target = pendingFocus.current;
    const frame = window.requestAnimationFrame(() => {
      const heading = document.getElementById(evidenceHeadingIds[target]);
      heading?.focus({ preventScroll: true });
      heading?.scrollIntoView({ block: 'nearest' });
      pendingFocus.current = null;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [current, focusAttempt, state.selected]);

  function showTask(next: EvidenceReviewTask) {
    pendingReviewRemoval.current = null;
    pendingFocus.current = next;
    setCurrent(next);
    // Reopening the current task should also focus its content.
    setFocusAttempt(previous => previous + 1);
  }
  function removeFromReview(id: EvidenceId) {
    if (!state.selected.includes(id)) return;
    pendingReviewRemoval.current = id;
    // A failed save can retain this edit as a local draft. Observe the actual selection before restoring focus.
    dispatch({ type: 'evidence', id });
  }
  const selectionStatus = `Class results included${selectedWork > 0 ? ` · ${selectedWork} work ${selectedWork === 1 ? 'sample' : 'samples'} selected` : ' · Student work selection is optional'}${observationSelected ? ' · Historical context included' : ''}`;
  const reviewTasks: { id: EvidenceReviewTask; label: string; detail: string; optional?: boolean }[] = [
    { id: 'results', label: 'Compare the results', detail: 'Notice the difference between answers and explanations.' },
    { id: 'task', label: 'Read the task and scoring', detail: 'Check what students were asked to show.' },
    { id: 'classes', label: 'Compare classes', detail: 'Look for variation before generalizing.', optional: true },
    { id: 'work', label: 'Examine student work', detail: 'Choose examples that help the team discuss reasoning.', optional: true },
    { id: 'selection', label: 'Review your evidence selection', detail: 'Check the sources and limits you will take forward.' },
  ];
  const checklist: ChecklistTask[] = reviewTasks.map(item => ({
    ...item, status: state.evidenceReviewed.includes(item.id) ? 'done' : 'todo',
    statusLabel: state.evidenceReviewed.includes(item.id) ? 'Reviewed by you' : 'To review',
    onSelect: () => showTask(item.id),
  }));
  function reviewCheck(item: EvidenceReviewTask, label: string) {
    return <label className="evidence-review-acknowledgment"><input type="checkbox" checked={state.evidenceReviewed.includes(item)}
      onChange={event => dispatch({ type: 'evidence-review', item, reviewed: event.target.checked })} /><span>{label}</span></label>;
  }

  function assessmentContent(view: EvidenceView) {
    const headingId = evidenceHeadingIds[view];
    return <section id={view === 'results' ? 'evidence-assessment-panel' : `evidence-${view}-panel`} className="evidence-builder-panel evidence-results" hidden={current !== view} aria-labelledby={headingId}>
      <div className="evidence-section-heading">
        <h2 id={headingId} tabIndex={-1}>{view === 'results' ? 'Read the assessment' : view === 'task' ? 'Read the task and scoring' : 'Compare results by class'}</h2>
        <span className="evidence-included" title="Assessment included"><Icon name="check" size={15} /><span className="evidence-included-label">Included</span></span>
      </div>
      <p className="evidence-source-date">Fictional cool-down · <time dateTime={assessment.isoDate}>{assessment.date}, 2026</time> · {assessment.total} responses · {classes.length} classes</p>
      {isRepeat && <p className="evidence-repeat-limit"><strong>Repeated task · 116 of 120 expected responses; 4 absent.</strong> Practice may affect results. These are not matched student-level gains or evidence of a teaching action’s effect.</p>}
      <div className="evidence-view-content">
        {view === 'results' && <AssessmentResults reference={reference} />}
        {view === 'classes' && <ClassResults reference={reference} />}
        {view === 'task' && <TaskSources reference={reference} version={state.evidenceVersion} />}
      </div>
      {reviewCheck(view, view === 'results' ? 'I reviewed the results and their limits.' : view === 'task' ? 'I reviewed the task and scoring criteria.' : 'I reviewed the class comparison.')}
      <WorkflowActions label={view === 'results' ? 'Assessment actions' : view === 'task' ? 'Task and scoring actions' : 'Class comparison actions'}
        description={<p>Use the task and scoring criteria to understand the counts. Next, inspect examples of student reasoning.</p>}
        secondary={view !== 'results' ? <button type="button" className="btn secondary" onClick={() => showTask('results')}>Back to results</button> : undefined}
        primary={{ label: view === 'results' ? 'Continue to task & scoring' : 'Continue to student work', onClick: () => showTask(view === 'results' ? 'task' : 'work'), arrow: true }} />
      {view === 'results' && <><details className="evidence-source-details">
        <summary>Learning goal & assessment context</summary>
        <div><p><strong>Learning goal:</strong> {lessonContext.goal}</p><p>This short end-of-lesson task gives the team a starting point for discussion. The assessment is included automatically and carries into your interpretation and meeting materials.</p></div>
      </details>
      <StepCoach question="What pattern is worth bringing to the team?" ready="You can point to a pattern, name its source, and say what it does not tell you.">
        <ul>
          <li>Compare the answer counts with the explanations in the work. What can each source tell you?</li>
          <li>Notice a strength in a student response before naming what it does not yet explain.</li>
          <li>Use Read the task and scoring to check the prompt and criteria, or Compare classes to inspect whether the counts vary.</li>
        </ul>
        <p>Select work that helps you examine the pattern. You can also start your interpretation with the class results alone.</p>
      </StepCoach></>}
    </section>;
  }

  const contents: Partial<Record<EvidenceReviewTask, ReactNode>> = {
    results: assessmentContent('results'), task: assessmentContent('task'), classes: assessmentContent('classes'),
    work: <section id="evidence-work-panel" className="evidence-builder-panel evidence-student-work" hidden={current !== 'work'} aria-labelledby="evidence-work-title">
      <h2 id="evidence-work-title" tabIndex={-1}>Examine student work</h2>
      <p className="evidence-source-date">Two illustrative samples · {assessment.date}</p>
      <p className="evidence-rubric-anchor">Look for equal amounts of the same whole.</p>
      <p className="evidence-selection-intro">Selection is optional. The assessment stays included.</p>
      <div className="evidence-response-list">
        {responses.map(response => {
          const selected = state.selected.includes(response.id);
          return <article className={`evidence-response${selected ? ' is-selected' : ''}`} key={response.id}>
            <p className="evidence-response-label">{response.label}</p>
            <blockquote>“{response.quote}”</blockquote>
            <button type="button" className="evidence-select" aria-pressed={selected} aria-label={`${selected ? 'Remove this work' : 'Select this work'}: ${response.label}`} onClick={() => dispatch({ type: 'evidence', id: response.id })}>
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
      {reviewCheck('work', 'I examined the student work and its limits.')}
      <WorkflowActions label="Student work actions"
        secondary={<button type="button" className="btn secondary" onClick={() => showTask('results')}>Back to assessment</button>}
        primary={{ label: 'Review selected evidence', onClick: () => showTask('selection'), arrow: true }} />
      <TaskExplanation title="Choose work that helps the team think" disclosureLabel="How to choose student work"
        why="These two examples make the reasoning visible in a way that totals cannot. They are illustrations to discuss, not a representative sample of the whole grade."
        steps={[
          { label: 'Name what the student already understands.', detail: 'Look at the choice, words and reasoning. Then identify what the response leaves uncertain about equal amounts of the same whole.' },
          { label: 'Select a useful discussion example.', detail: 'Select this work keeps its exact quotation available beside your writing and in the approved source packet. Use Remove this work to take it out of your selection. The assessment remains included either way.' },
        ]} />
    </section>,

    selection: <section id="evidence-review-panel" className="evidence-builder-panel evidence-selection-review" hidden={current !== 'selection'} aria-labelledby="evidence-review-title">
      <h2 id="evidence-review-title" tabIndex={-1}>Evidence you will take forward</h2>
      <p>The assessment is always included. Selected work and historical context will stay beside your interpretation and in the source packet.</p>
      <section className="evidence-review-source">
        <div className="evidence-section-heading"><h3>Assessment · {assessment.date}</h3><button type="button" className="textlink" onClick={() => showTask('results')}>Revisit assessment</button></div>
        <p>{assessment.correct}/{assessment.total} correct fractions · {assessment.explanations}/{assessment.total} adequate explanations</p>
        <p>Separate scores; these totals do not identify who met both criteria.</p>
        {isRepeat && <p>Repeated task with 4 absent responses. These are not matched student-level gains or evidence of a teaching action’s effect.</p>}
      </section>
      {selectedResponses.map(response => <section className="evidence-review-source" key={response.id}>
        <div className="evidence-section-heading"><h3>{response.label} · {assessment.date}</h3><button type="button" className="textlink" onClick={() => removeFromReview(response.id)}>Remove<span className="sr-only"> {response.label}</span></button></div>
        <blockquote>“{response.quote}”</blockquote>
        <p>Illustrative work, not a representative sample.</p>
      </section>)}
      {!selectedWork && <div className="evidence-review-source"><p>No student work selected. You can interpret the class results alone or return to choose a discussion example.</p><button type="button" className="textlink" onClick={() => showTask('work')}>Choose student work</button></div>}
      {observationSelected && <section className="evidence-review-source">
        <div className="evidence-section-heading"><h3>Historical context · {observation.date}</h3><button type="button" className="textlink" onClick={() => removeFromReview('observation')}>Remove historical context</button></div>
        <blockquote>“{observation.quote}”</blockquote><p>{observation.caution}</p>
      </section>}
      {reviewCheck('selection', 'I reviewed the evidence I am taking forward.')}
      <WorkflowActions label="Evidence actions"
        description={<p>When you can name a pattern and a question worth investigating, write your own explanation in the next step. Continuing does not confirm an interpretation.</p>}
        secondary={<button type="button" className="btn secondary" onClick={() => showTask('work')}>Back to student work</button>}
        primary={{ label: 'Interpret the evidence', onClick: () => dispatch({ type: 'go', step: 1 }), arrow: true }} />
    </section>,
  };
  return <div className="evidence-workspace">
    <div className="evidence-builder-status">
      <p aria-live="polite">{selectionStatus}</p>
      <button type="button" className="textlink" onClick={() => dispatch({ type: 'go', step: 1 })}>{returningToWriting ? 'Return to interpretation' : 'Continue to interpretation'}<Icon name="arrow" size={16} /></button>
    </div>
    <StageChecklist title="Evidence checklist" description="Build an evidence set you can explain to your team."
      items={checklist} currentId={current} contents={contents}
      note="Mark each review yourself in its work area. Checks save with this cycle; check the save status before leaving. You can continue without checking every task." />
  </div>;
}
