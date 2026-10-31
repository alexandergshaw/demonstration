import { useState } from 'react';
import { Icon } from '../components/Icon';
import { StepCoach } from '../components/StepCoach';
import { evidenceSnapshotDescription } from '../data/evidenceSnapshots';
import type { ReferenceData } from '../data/seed';
import { lessonContext } from '../lessonContext';
import type { Action, PlanState } from '../model';
import './EvidenceWorkspace.css';

interface EvidenceWorkspaceProps {
  state: PlanState;
  reference: ReferenceData;
  dispatch: (action: Action) => boolean | void;
}

type EvidenceView = 'results' | 'classes' | 'task';

export function EvidenceWorkspace({ state, reference, dispatch }: EvidenceWorkspaceProps) {
  const [view, setView] = useState<EvidenceView>('results');
  const { assessment, classes, responses, observation } = reference;
  const isRepeat = state.evidenceVersion === 'oct29';
  const observationSelected = state.selected.includes('observation');
  const selectedWork = responses.filter(response => state.selected.includes(response.id)).length;
  const results = [
    { label: 'Selected the correct fraction', count: assessment.correct, tone: 'answer' },
    { label: 'Explained why the amounts are equal', count: assessment.explanations, tone: 'explanation' },
  ];

  return <div className="evidence-workspace">
    <p className="evidence-goal"><span>Learning goal</span>{lessonContext.goal}</p>

    <div className="evidence-composition">
      <section className="evidence-results" aria-labelledby="evidence-results-title">
        <div className="evidence-section-heading">
          <div>
            <p className="evidence-kicker">The class picture</p>
            <h2 id="evidence-results-title">Answers and explanations</h2>
          </div>
          <span className="evidence-included"><Icon name="check" size={15} />Included</span>
        </div>
        <p className="evidence-source-date">Fictional cool-down · <time dateTime={assessment.isoDate}>{assessment.date}, 2026</time> · {classes.length} classes</p>

        <div className="evidence-view-switch" role="group" aria-label="View assessment evidence">
          {([
            ['results', 'Results'],
            ['classes', 'By class'],
            ['task', 'Task & sources'],
          ] as const).map(([id, label]) => <button type="button" key={id} aria-pressed={view === id} onClick={() => setView(id)}>{label}</button>)}
        </div>

        <div className="evidence-view-content">
          {view === 'results' && <>
            <figure className="evidence-chart" aria-label={`Of ${assessment.total} responses, ${assessment.correct} selected the correct fraction and ${assessment.explanations} gave an adequate explanation.`}>
              {results.map(result => <div className="evidence-chart-row" key={result.tone}>
                <div className="evidence-chart-label"><span>{result.label}</span><strong>{result.count}<span> / {assessment.total}</span></strong></div>
                <div className="evidence-chart-track" aria-hidden="true"><div className={`evidence-chart-fill ${result.tone}`} style={{ width: `${result.count / assessment.total * 100}%` }} /></div>
              </div>)}
              <div className="evidence-chart-scale" aria-hidden="true"><span>0 responses</span><span>{assessment.total} responses</span></div>
              <figcaption>Both measures use the same scale. Totals do not tell us which students met both criteria.</figcaption>
            </figure>
          </>}

          {view === 'classes' && <div className="evidence-class-view">
            <table>
              <caption>Response counts by class · {assessment.date}</caption>
              <thead><tr><th scope="col">Class</th><th scope="col">Responses</th><th scope="col">Correct fraction</th><th scope="col">Adequate explanation</th></tr></thead>
              <tbody>{classes.map(item => <tr key={item.id}><th scope="row">{item.label}</th><td>{item.total}</td><td>{item.correct}</td><td>{item.explanations}</td></tr>)}</tbody>
            </table>
            <p className="evidence-note">Compare each count with its class response total. These descriptive counts do not measure teacher effectiveness.</p>
          </div>}

          {view === 'task' && <div className="evidence-task-view">
            <section><h3>Original task</h3><p>{lessonContext.prompt}</p></section>
            <section><h3>What the scores mean</h3><p>{lessonContext.selection}</p><p>{lessonContext.rubric}</p></section>
            <section><h3>Lesson context</h3><p>{lessonContext.lesson}</p></section>
            <section><h3>Source and limits</h3><p>{evidenceSnapshotDescription(state.evidenceVersion)}</p><p>{lessonContext.provenance}</p><p>{lessonContext.limits}</p></section>
          </div>}
        </div>

        <StepCoach question="What pattern is worth bringing to the team?" ready="You can point to a pattern, name its source, and say what it does not tell you.">
          <ul>
            <li>Compare the answer counts with the explanations in the work. What can each source tell you?</li>
            <li>Notice a strength in a student response before naming what it does not yet explain.</li>
            <li>Use Task & sources to check the prompt and scoring, or By class to inspect whether the counts vary.</li>
          </ul>
          <p>Select work that helps you examine the pattern. You can also start your interpretation with the class results alone.</p>
        </StepCoach>

        {isRepeat && <p className="evidence-repeat-limit"><strong>Repeated task · 116 of 120 expected responses; 4 absent.</strong> Practice may affect results. These samples do not establish student gains or the effect of a teaching action. <button type="button" onClick={() => setView('task')}>Inspect source details</button></p>}
      </section>

      <section className="evidence-student-work" aria-labelledby="evidence-work-title">
        <div className="evidence-section-heading"><div><p className="evidence-kicker">Look closer</p><h2 id="evidence-work-title">Student work</h2></div></div>
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
        <p className="evidence-note">Illustrative, not representative. These samples are not linked to individual results in the class totals.</p>
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
