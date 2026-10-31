import { useEffect, useState } from 'react';
import { FieldError, TextArea, useFieldError } from '../components/Field';
import { hasReflection, type Action, type PlanState } from '../model';
import { StepCoach } from '../components/StepCoach';
import './ReflectWorkspace.css';

interface ReflectWorkspaceProps {
  state: PlanState; dispatch: (action: Action) => boolean;
  submit: (kind: 'focus' | 'plan' | 'reflection') => boolean;
  errorField: string; errorAttempt: number; openExamples: () => void;
  unsaved?: boolean;
  onEditCollection?: () => void;
}
export function ReflectWorkspace({ state: s, dispatch, submit, errorField, errorAttempt, openExamples, unsaved = false, onEditCollection }: ReflectWorkspaceProps) {
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
  const reflectionQuestion = s.implementation === 'no'
    ? 'What prevented implementation, and what will make the next attempt possible?'
    : s.implementation === 'partial'
    ? 'What was tried, what prevented the rest, and what evidence will you bring back?'
    : s.implementation === 'yes'
    ? 'What student work do you need before judging the effect of this move?'
    : 'What was tried, and what can the available evidence support?';
  return <div className="reflect-workspace">
    <section className="reflect-action" aria-labelledby="reflect-action-title">
      <p className="context-label" id="reflect-action-title">Agreed teaching move</p>
      <p className="reflect-action-text">{s.action}</p>
      <p className="caption">{s.owner}</p>
      {!recorded && (s.implementation || s.reflection.trim()) && <p className="caption">Draft report · Check that it describes this approved teaching move before recording.</p>}
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
      <dl className="reflect-commitments">
        <div><dt>Who will collect</dt><dd>{s.evidenceCollector.trim() || 'Not assigned yet'}</dd></div>
        <div><dt>Planned collection</dt><dd>{s.collectionDate || 'Date not set'}</dd></div>
        <div><dt>Planned review</dt><dd>{s.reviewDate || 'Date not set'}</dd></div>
      </dl>
      {onEditCollection && <div className="reflect-collection-action"><button className="btn secondary" onClick={onEditCollection}>Update collection plan</button><p className="caption">Changing planned checks or dates requires plan approval again. Your reflection draft stays available.</p></div>}
      {s.accessParticipation.trim() && <p className="caption">Access & participation plan: {s.accessParticipation}</p>}
    </section>}
    <div className="reflect-next-step">
      <StepCoach question={reflectionQuestion} ready="Can you name the next action, who will take it, and when the team will revisit it?">
        <p>{s.implementation === 'no'
          ? 'Describe the barrier, one adjustment and the next opportunity to try the move. It has not been tested, so an outcome judgment would be premature.'
          : s.implementation === 'partial'
          ? 'Describe which parts happened and which did not. Keep that implementation report separate from what student work might show.'
          : 'A report that the move was used is different from evidence that students learned. Name the work needed for the next decision.'}</p>
        <p>Before comparing results, inspect the dated tasks, rubric, response coverage and teaching conditions. If these differ, describe what the current work shows and limit claims about change.</p>
        <p>Needing more evidence is a valid decision. Make it actionable by naming what to collect, who will bring it and the next review point.</p>
      </StepCoach>
      <TextArea id="reflection" heading label={reflectionQuestion}
        hint="Record the supported conclusion or implementation barrier, then name the next action, owner and review point in your own words."
        value={s.reflection} onChange={value => dispatch({ type: 'text', field: 'reflection', value })}
        placeholder={s.implementation === 'no' ? 'The move was not tried because… Next, [who] will… We will revisit this on…' : 'We can say… We still need… [Who] will collect… We will revisit this on…'} />
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
