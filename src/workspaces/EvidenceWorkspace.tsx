import { useId, useRef, useState } from 'react';
import { Icon } from '../components/Icon';
import { StepCoach } from '../components/StepCoach';
import { StepProgress } from '../components/StepProgress';
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
type EvidencePlace = EvidenceView | 'work';

export function EvidenceWorkspace({ state, reference, dispatch }: EvidenceWorkspaceProps) {
  const [view, setView] = useState<EvidenceView>('results');
  const [opened, setOpened] = useState<EvidencePlace[]>(['results']);
  const viewId = useId();
  const viewContent = useRef<HTMLDivElement>(null);
  const studentWorkHeading = useRef<HTMLHeadingElement>(null);
  const { assessment, classes, responses, observation } = reference;
  const isRepeat = state.evidenceVersion === 'oct29';
  const observationSelected = state.selected.includes('observation');
  const selectedWork = responses.filter(response => state.selected.includes(response.id)).length;
  function markOpened(place: EvidencePlace) {
    setOpened(previous => previous.includes(place) ? previous : [...previous, place]);
  }
  function inspectPlace(place: EvidencePlace, focus = true) {
    markOpened(place);
    if (place !== 'work') setView(place);
    if (!focus) return;
    window.requestAnimationFrame(() => {
      const target = place === 'work' ? studentWorkHeading.current : viewContent.current;
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ block: 'nearest' });
    });
  }
  const inspectionItems = ([['results', 'Compare the results'], ['task', 'Check the task and scoring'], ['classes', 'Compare classes'], ['work', 'Examine student work']] as const)
    .map(([id, label]) => ({ id, label, complete: opened.includes(id), onSelect: () => inspectPlace(id) }));
  const suggestedPlace = inspectionItems.find(item => !item.complete)?.id;
  const returningToWriting = Boolean(state.interpretation.trim());
  const nextInspectionWhy = returningToWriting
    ? 'Your interpretation draft is still available. Revisit it alongside the currently selected evidence and decide whether the explanation or focus needs to change.'
    : suggestedPlace === 'task'
    ? 'Before explaining the gap, check exactly what counted as an adequate explanation. Then use student work to investigate what the totals might mean.'
    : suggestedPlace === 'classes'
    ? 'Use the same scoring criteria to see whether the pattern varies across classes.'
    : suggestedPlace === 'work'
    ? 'Look for reasoning that could help the team investigate the class pattern. These illustrative samples are not matched to the class rows.'
    : 'Use the evidence you can explain to write what you notice, what it might mean and what you still need to know. You can revisit any source.';

  return <div className="evidence-workspace">
    <div className="evidence-composition">
      <section className="evidence-results" aria-labelledby="evidence-results-title">
        <div className="evidence-section-heading">
          <h2 id="evidence-results-title">Read the assessment</h2>
          <span className="evidence-included" title="Assessment included"><Icon name="check" size={15} /><span className="evidence-included-label">Included</span></span>
        </div>
        <p className="evidence-source-date">Fictional cool-down · <time dateTime={assessment.isoDate}>{assessment.date}, 2026</time> · {assessment.total} responses · {classes.length} classes</p>

        <div className="evidence-view-switch" role="group" aria-label="View assessment evidence">
          {([
            ['results', 'Results'],
            ['task', 'Task & sources'],
            ['classes', 'By class'],
          ] as const).map(([id, label]) => <button type="button" key={id} id={`${viewId}-${id}`} aria-pressed={view === id} aria-controls={`${viewId}-content`} onClick={() => inspectPlace(id, false)}>{label}</button>)}
        </div>

        {isRepeat && <p className="evidence-repeat-limit"><strong>Repeated task · 116 of 120 expected responses; 4 absent.</strong> Practice may affect results. These are not matched student-level gains or evidence of a teaching action’s effect.</p>}

        <div ref={viewContent} tabIndex={-1} className="evidence-view-content" id={`${viewId}-content`} role="region" aria-labelledby={`${viewId}-${view}`}>
          {view === 'results' && <AssessmentResults reference={reference} />}
          {view === 'classes' && <ClassResults reference={reference} />}
          {view === 'task' && <TaskSources reference={reference} version={state.evidenceVersion} />}
        </div>

        <details className="evidence-source-details">
          <summary>Learning goal & assessment context</summary>
          <div>
            <p><strong>Learning goal:</strong> {lessonContext.goal}</p>
            <p>This short end-of-lesson task gives the team a starting point for discussion. The assessment is included automatically and carries into your interpretation and meeting materials.</p>
          </div>
        </details>

        <div className="evidence-next-inspection">
          <StepProgress title="Build the evidence for your meeting"
            benefit={`The assessment is included${selectedWork ? ` with ${selectedWork} selected work ${selectedWork === 1 ? 'sample' : 'samples'}` : ''}. Selected quotations stay beside your writing and carry into the approved source packet.`}
            items={inspectionItems} nextId={returningToWriting ? undefined : suggestedPlace}
            nextLabel={returningToWriting ? 'Return to interpretation' : suggestedPlace === 'task' ? 'Check task & scoring' : suggestedPlace === 'classes' ? 'Compare classes' : suggestedPlace === 'work' ? 'Examine student work' : 'Interpret the evidence'}
            onNext={returningToWriting || !suggestedPlace ? () => dispatch({ type: 'go', step: 1 }) : undefined}
            progressLabel="places opened this visit" completeLabel="Opened" incompleteLabel="Available"
            note="This is a navigation aid, not a record that you reviewed a source. You can interpret without opening every view; selecting work is optional. This visit count resets when you leave Evidence." />
          <details className="evidence-source-details">
            <summary>Why this next step?</summary>
            <div><p>{nextInspectionWhy}</p></div>
          </details>
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
        <div className="evidence-section-heading"><h2 id="evidence-work-title" ref={studentWorkHeading} tabIndex={-1}>Examine student work</h2></div>
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
        <details className="evidence-source-details">
          <summary>How to choose student work</summary>
          <div>
            <p>Select a sample to keep its exact quotation beside your writing and in the meeting materials. Selection is optional. The assessment stays included.</p>
            <TaskExplanation title="Choose work that helps the team think"
              why="These two examples make the reasoning visible in a way that totals cannot. They are illustrations to discuss, not a representative sample of the whole grade."
              steps={[
                { label: 'Name what the student already understands.', detail: 'Look at the choice, words and reasoning. Then identify what the response leaves uncertain about equal amounts of the same whole.' },
                { label: 'Select a useful discussion example.', detail: 'Select this work keeps its exact quotation available beside your writing and in the approved source packet. Use Remove this work to take it out of your selection. The assessment remains included either way.' },
              ]} />
          </div>
        </details>
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
      <div><p className="evidence-next-label">Ready to interpret?</p>
        <p>When you can name a pattern and a question worth investigating, write your own explanation in the next step.</p>
        <p className="evidence-selection-status" aria-live="polite">Class results included{selectedWork > 0 ? ` · ${selectedWork} work ${selectedWork === 1 ? 'sample' : 'samples'} selected` : ' · Student work selection is optional'}{observationSelected ? ' · Historical context included' : ''}</p>
      </div>
      <button type="button" className="btn" onClick={() => dispatch({ type: 'go', step: 1 })}>Interpret the evidence<Icon name="arrow" size={18} /></button>
    </footer>
  </div>;
}
