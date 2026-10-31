import { useEffect, useState } from 'react';
import { FieldError, TextArea, useFieldError } from '../components/Field';
import { hasReflection, type Action, type PlanState } from '../model';
import './ReflectWorkspace.css';

interface ReflectWorkspaceProps {
  state: PlanState; dispatch: (action: Action) => boolean;
  submit: (kind: 'focus' | 'plan' | 'reflection') => boolean;
  errorField: string; errorAttempt: number; openExamples: () => void;
  unsaved?: boolean;
}
export function ReflectWorkspace({ state: s, dispatch, submit, errorField, errorAttempt, openExamples, unsaved = false }: ReflectWorkspaceProps) {
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [questionOpen, setQuestionOpen] = useState(() => Boolean(s.nextCycleQuestion.trim()));
  const recorded = hasReflection(s);
  const implementationError = useFieldError('implementation-yes', 'implementation-explanation');
  useEffect(() => {
    if (!errorField) return;
    const frame = requestAnimationFrame(() => document.getElementById(errorField)?.focus());
    return () => cancelAnimationFrame(frame);
  }, [errorField, errorAttempt]);
  const implementationMessage = s.implementation === 'no'
    ? 'The move has not been tested yet. Start with what would make implementation possible.'
    : s.implementation === 'partial'
    ? 'Record what was tried and what was different before interpreting learning evidence.'
    : s.implementation === 'yes'
    ? 'This is your implementation report. Comparable student work is still needed.'
    : 'Record what happened before deciding what the next evidence can tell you.';
  return <div className="reflect-workspace">
    <section className="reflect-action" aria-labelledby="reflect-action-title">
      <p className="context-label" id="reflect-action-title">Agreed teaching move</p>
      <p className="reflect-action-text">{s.action}</p>
      <p className="caption">{s.owner}</p>
    </section>
    <div className="reflect-evidence-layout">
      <section className="reflect-implementation" aria-labelledby="implementation-title">
        <fieldset aria-invalid={implementationError.invalid || undefined} aria-describedby={implementationError.describedBy}>
          <legend id="implementation-title">Was the move tried?</legend>
          <div className="reflect-status-options">{([
            ['yes', 'Used as planned'], ['partial', 'Partially used'], ['no', 'Not yet used'],
          ] as const).map(([value, label]) => <label className={s.implementation === value ? 'selected' : ''} key={value}>
            <input id={`implementation-${value}`} type="radio" name="implementation" value={value} checked={s.implementation === value}
              aria-invalid={implementationError.invalid || undefined} aria-describedby={implementationError.describedBy}
              onChange={() => dispatch({ type: 'implementation', value })} />{label}
          </label>)}</div>
        </fieldset>
        <p className="caption" id="implementation-explanation">{implementationMessage}</p>
        <FieldError id="implementation-yes" />
      </section>
      <section className="reflect-empty" aria-labelledby="follow-up-empty-title">
        <p className="context-label">Learning evidence</p>
        <h2 id="follow-up-empty-title">Follow-up evidence is not available yet.</h2>
        <p>This cycle has planned checks, but no collected follow-up dataset. Planned dates and example results do not establish an outcome.</p>
        <button className="textlink" aria-expanded={collectionOpen} aria-controls="reflect-collection" onClick={() => setCollectionOpen(!collectionOpen)}>Review what to collect</button>
      </section>
    </div>
    {collectionOpen && <section className="reflect-collection" id="reflect-collection" aria-label="Planned evidence collection">
      <div><h3>Check implementation</h3><p>{s.implementationCheck}</p></div>
      <div><h3>Check student learning</h3><p>{s.learningCheck}</p></div>
      <p className="caption">Request dated work, the task and rubric, expected and actual response counts, and an implementation record. Check comparability before drawing a conclusion.</p>
      {(s.evidenceCollector || s.collectionDate || s.reviewDate) && <p className="caption">{[
        s.evidenceCollector && `Collector: ${s.evidenceCollector}`,
        s.collectionDate && `Planned collection: ${s.collectionDate}`,
        s.reviewDate && `Planned review: ${s.reviewDate}`,
      ].filter(Boolean).join(' · ')}</p>}
      {s.accessParticipation.trim() && <p className="caption">Access & participation plan: {s.accessParticipation}</p>}
    </section>}
    <div className="reflect-next-step">
      <TextArea id="reflection" heading label="What can you conclude, and what will you check next?"
        hint="Use your own words. State the limits of the available evidence and the next decision it needs to inform."
        value={s.reflection} onChange={value => dispatch({ type: 'text', field: 'reflection', value })}
        placeholder="We can say… We still need… Before keeping or revising the move, we will…" />
      <details className="reflect-next-question" open={questionOpen} onToggle={event => setQuestionOpen(event.currentTarget.open)}>
        <summary>Question for the next PLC <span className="caption">Optional</span></summary>
        <TextArea id="next-cycle-question" label="What should the team examine next?" hint="Recorded with your reflection; this does not create another evidence cycle."
          value={s.nextCycleQuestion} onChange={value => dispatch({ type: 'text', field: 'nextCycleQuestion', value })} />
      </details>
    </div>
    <div className="workspace-stage-footer">
      <button className="textlink" onClick={openExamples}>Explore a worked example</button>
      <div className="reflect-save"><span className="caption" role="status">{unsaved ? 'Changes are not saved. Retry saving before leaving this browser.' : recorded ? 'Reflection recorded with this plan.' : 'Your report remains separate from demonstration examples.'}</span>
        <button className="btn" onClick={() => submit('reflection')}>{recorded && !unsaved ? 'Reflection recorded' : 'Record next step'}</button></div>
    </div>
  </div>;
}
