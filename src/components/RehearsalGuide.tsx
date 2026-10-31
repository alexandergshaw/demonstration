import type { ReferenceData } from '../data/seed';
import type { PlanState } from '../model';
import { TaskContext } from './EvidenceInspector';

export function RehearsalGuide({ state, reference }: { state: PlanState; reference: ReferenceData }) {
  const selected = reference.responses.filter(response => state.selected.includes(response.id));
  return <details className="planning-disclosure rehearsal-guide">
    <summary>Plan a short rehearsal</summary>
    <div className="planning-disclosure-body">
      <p className="small muted">Use this optional structure to write Activity 4 in your own words. It fits the existing 15-minute block and leaves the teaching decision with your team.</p>
      {selected.length > 0 ? <div className="rehearsal-evidence"><h3>Selected work to consider</h3>{selected.map(response => <blockquote key={response.id}><p>“{response.quote}”</p><cite>{response.label} · fictional example</cite></blockquote>)}</div>
        : <p className="caption">Choose an illustrative student response in Evidence, or use the original task to anticipate possible reasoning.</p>}
      <ol className="rehearsal-steps">
        <li><strong>Prepare · 3 minutes</strong><p>Choose one response or the task. Write a teacher question that could reveal how the student reasons about equivalent fractions. Anticipate more than one possible response.</p></li>
        <li><strong>Rehearse · 5 minutes</strong><p>One teacher asks the question; a colleague tries a possible student response. Treat the role-play as a hypothesis. Leave the explanation with the student.</p></li>
        <li><strong>Give feedback · 4 minutes</strong><p>Use the task and rubric: does the question help reveal equal amounts of the same whole, and why partitioning changes the number of parts without changing the amount? A doubling rule alone does not explain the equivalence. Notice whether the teacher elicited reasoning or supplied it.</p></li>
        <li><strong>Revise · 3 minutes</strong><p>Revise the teacher question using the feedback. Name what a future student response would reveal and which evidence your learning check will collect.</p></li>
      </ol>
      <TaskContext />
      <p className="caption">Prototype facilitation guidance. Possible responses are not observations of students, and this structure has not been validated with educators.</p>
    </div>
  </details>;
}
