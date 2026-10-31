import { workedFollowUp as example } from '../workedFollowUp';
import './WorkedFollowUp.css';

/** Optional reference case, deliberately independent of the active PLC cycle. */
export function WorkedFollowUp({ initiallyOpen = false }: { initiallyOpen?: boolean }) {
  return <details className="worked-follow-up" open={initiallyOpen || undefined}>
    <summary>Explore a complete worked example<span className="disclosure-meta">Separate fictional case</span></summary>
    <div className="worked-example-body">
      <p className="worked-example-boundary">{example.boundary}</p>
      <h3>{example.title}</h3>
      <ol className="worked-example-steps">
        <li><h4>Explain the evidence</h4><blockquote>{example.reasoning}</blockquote></li>
        <li><h4>Try one teaching move</h4><p>{example.action}</p><p className="caption">{example.owner}</p>
          <details><summary>What the leader planned to look for</summary><p>{example.plannedCheck}</p></details>
        </li>
        <li><h4>Check implementation and learning</h4>
          <p>In this case, three classes recorded all three routines; one class recorded the full routine once. Adequate explanations changed from <strong>{example.baseline.adequate}/{example.baseline.responses} on {example.baseline.label}</strong> to <strong>{example.followUp.adequate}/{example.followUp.responses} on {example.followUp.label}</strong>.</p>
          <details><summary>Inspect dates, tasks, scoring and response coverage</summary>
            <dl className="worked-example-records">
              <dt>Initial task · {example.baseline.date}</dt><dd>{example.baselineTask}</dd>
              <dt>Follow-up task · {example.followUp.date}</dt><dd>{example.followUpTask}</dd>
              <dt>Same conceptual rubric</dt><dd>{example.rubric}</dd>
              <dt>Scoring record</dt><dd>{example.scoring}</dd>
              <dt>Matched cohort and conditions</dt><dd>{example.coverage}</dd>
              <dt>Comparison limits</dt><dd>{example.comparabilityLimit}</dd>
            </dl>
          </details>
          <details><summary>Inspect class results and implementation records</summary>
            <div className="worked-example-table"><table>
              <caption>Adequate explanations · Same 30 students per class on both dates</caption>
              <thead><tr><th scope="col">Class</th><th scope="col">Oct 28</th><th scope="col">Nov 4</th><th scope="col">Full routines</th></tr></thead>
              <tbody>{example.classes.map(item => <tr key={item.name}><th scope="row">{item.name}</th><td>{item.baselineAdequate}/{item.students}</td><td>{item.followUpAdequate}/{item.students}</td><td>{item.fullRoutines}/{item.plannedRoutines}</td></tr>)}</tbody>
            </table></div>
            <dl className="worked-example-records">{example.classes.map(item => <div key={item.name}><dt>Class {item.name} · Implementation record</dt><dd>{item.implementation}</dd></div>)}</dl>
            <p className="caption">{example.implementationLimit}</p>
          </details>
          <details><summary>Read one matched student response</summary>
            <p className="caption">{example.sample.label}</p>
            <div className="worked-example-samples"><div><h5>Oct 28</h5><blockquote>{example.sample.before}</blockquote></div><div><h5>Nov 4</h5><blockquote>{example.sample.after}</blockquote></div></div>
            <p>{example.sample.interpretation}</p>
          </details>
        </li>
        <li><h4>Decide what to keep and revise</h4><blockquote>{example.judgment}</blockquote><p><strong>Next teaching decision.</strong> {example.decision}</p>
          <details><summary>What would change the next decision?</summary><p>{example.nextCheck}</p></details>
        </li>
      </ol>
      <p className="caption">Use this case to examine the reasoning. It does not fill, approve or report results for your current plan.</p>
    </div>
  </details>;
}
