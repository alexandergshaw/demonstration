import { useId, useRef, useState } from 'react';
import { Icon } from '../components/Icon';
import { StepCoach } from '../components/StepCoach';
import { TaskExplanation } from '../components/TaskExplanation';
import type { ReferenceData } from '../data/seed';
import { lessonContext } from '../lessonContext';
import type { Action, PlanState } from '../model';
import { AssessmentResults, ClassResults, TaskSources } from './EvidenceViews';
import './EvidenceWorkspace.css';

interface EvidenceWorkspaceProps {
  state: PlanState;
  reference: ReferenceData;
  dispatch: (action: Action) => boolean | void;
}

type EvidenceView = 'results' | 'classes' | 'task';

export function EvidenceWorkspace({ state, reference, dispatch }: EvidenceWorkspaceProps) {
  const [view, setView] = useState<EvidenceView>('results');
  const viewId = useId();
  const viewContent = useRef<HTMLDivElement>(null);
  const studentWorkHeading = useRef<HTMLHeadingElement>(null);
  const { assessment, classes, responses, observation } = reference;
  const isRepeat = state.evidenceVersion === 'oct29';
  const observationSelected = state.selected.includes('observation');
  const selectedWork = responses.filter(response => state.selected.includes(response.id)).length;
  const nextInspection = view === 'results'
    ? { why: 'Before explaining the gap, check what the task asked and how explanations were scored.', label: 'Check task & scoring', view: 'task' as const }
    : view === 'task'
    ? { why: 'Use the same scoring criteria to see whether the pattern varies across classes.', label: 'Compare classes', view: 'classes' as const }
    : { why: 'Compare the class pattern with the reasoning in the illustrative samples.', label: 'Examine student work', view: null };

  function inspectNext() {
    if (nextInspection.view) setView(nextInspection.view);
    window.requestAnimationFrame(() => {
      const target = nextInspection.view ? viewContent.current : studentWorkHeading.current;
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: 'nearest' });
    });
  }

  return <div className="evidence-workspace">
    <p className="evidence-goal"><span>Learning goal</span>{lessonContext.goal}</p>

    <div className="evidence-composition">
      <section className="evidence-results" aria-labelledby="evidence-results-title">
        <div className="evidence-section-heading">
          <h2 id="evidence-results-title">Assessment</h2>
          <span className="evidence-included"><Icon name="check" size={15} />Included</span>
        </div>
        <p className="evidence-source-date">Fictional cool-down · <time dateTime={assessment.isoDate}>{assessment.date}, 2026</time> · {assessment.total} responses · {classes.length} classes</p>
        <p className="evidence-note">This short end-of-lesson task gives the team a starting point for discussion. The assessment is included automatically and carries into your interpretation and meeting materials.</p>

        <div className="evidence-view-switch" role="group" aria-label="View assessment evidence">
          {([
            ['results', 'Results'],
            ['task', 'Task & sources'],
            ['classes', 'By class'],
          ] as const).map(([id, label]) => <button type="button" key={id} id={`${viewId}-${id}`} aria-pressed={view === id} aria-controls={`${viewId}-content`} onClick={() => setView(id)}>{label}</button>)}
        </div>

        {isRepeat && <p className="evidence-repeat-limit"><strong>Repeated task · 116 of 120 expected responses; 4 absent.</strong> Practice may affect results. These are not matched student-level gains or evidence of a teaching action’s effect.</p>}

        <div ref={viewContent} tabIndex={-1} className="evidence-view-content" id={`${viewId}-content`} role="region" aria-labelledby={`${viewId}-${view}`}>
          {view === 'results' && <AssessmentResults reference={reference} />}
          {view === 'classes' && <ClassResults reference={reference} />}
          {view === 'task' && <TaskSources reference={reference} version={state.evidenceVersion} />}
        </div>

        <div className="evidence-next-inspection">
          <p>{nextInspection.why}</p>
          <button type="button" className="textlink" onClick={inspectNext}>{nextInspection.label}<Icon name="arrow" size={16} /></button>
        </div>

        <StepCoach question="What pattern is worth bringing to the team?" ready="You can point to a pattern, name its source, and say what it does not tell you.">
          <ul>
            <li>Compare the answer counts with the explanations in the work. What can each source tell you?</li>
            <li>Notice a strength in a student response before naming what it does not yet explain.</li>
            <li>Use Task & sources to check the prompt and scoring, or By class to inspect whether the counts vary.</li>
          </ul>
          <p>Select work that helps you examine the pattern. You can also start your interpretation with the class results alone.</p>
        </StepCoach>
      </section>

      <section className="evidence-student-work" aria-labelledby="evidence-work-title">
        <div className="evidence-section-heading"><h2 id="evidence-work-title" ref={studentWorkHeading} tabIndex={-1}>Student work</h2></div>
        <p className="evidence-source-date">Two illustrative samples · {assessment.date}</p>
        <p className="evidence-rubric-anchor">Look for equal amounts of the same whole.</p>
        <div className="evidence-response-list">
          {responses.map(response => {
            const selected = state.selected.includes(response.id);
            return <article className={`evidence-response${selected ? ' is-selected' : ''}`} key={response.id}>
              <p className="evidence-response-label">{response.label}</p>
              <blockquote>“{response.quote}”</blockquote>
              <button type="button" className="evidence-select" aria-pressed={selected} aria-label={`${selected ? 'Remove' : 'Select'} ${response.label}`} onClick={() => dispatch({ type: 'evidence', id: response.id })}>
                <Icon name={selected ? 'check' : 'plus'} size={17} />{selected ? 'Selected for interpretation' : 'Select this work'}
              </button>
            </article>;
          })}
        </div>
        <TaskExplanation title="Choose work that helps the team think"
          why="These two examples make the reasoning visible in a way that totals cannot. They are illustrations to discuss, not a representative sample of the whole grade."
          steps={[
            { label: 'Name what the student already understands.', detail: 'Look at the choice, words and reasoning. Then identify what the response leaves uncertain about equal amounts of the same whole.' },
            { label: 'Select a useful discussion example.', detail: 'Select this work keeps its exact quotation available beside your writing and in the approved source packet. Select it again to remove it. The assessment remains included either way.' },
          ]}
          handoff="When you can name a pattern and a question worth investigating, choose Interpret the evidence. You will write your own explanation there." />
        <p className="evidence-note">Selection is optional. Choose a sample if it helps explain your focus. These illustrative samples are not representative or linked to individual results in the class totals.</p>
      </section>
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

    <footer className="evidence-next">
      <p aria-live="polite">Class results included{selectedWork > 0 ? ` · ${selectedWork} work ${selectedWork === 1 ? 'sample' : 'samples'} selected` : ' · Student work selection is optional'}{observationSelected ? ' · Historical context included' : ''}</p>
      <button type="button" className="btn" onClick={() => dispatch({ type: 'go', step: 1 })}>Interpret the evidence<Icon name="arrow" size={18} /></button>
    </footer>
  </div>;
}
