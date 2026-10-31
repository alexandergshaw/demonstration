import type { ReferenceData } from '../data/seed';
import { evidenceSnapshotDescription } from '../data/evidenceSnapshots';
import { lessonContext } from '../lessonContext';
import type { EvidenceVersion } from '../model';

function Score({ count, total, tone }: { count: number; total: number; tone: 'answer' | 'explanation' }) {
  const rate = total > 0 ? count / total * 100 : null;
  return <div className={`evidence-score ${tone}`}>
    <div className="evidence-score-values"><strong>{count}<span> / {total}</span></strong><span className="evidence-rate">{rate === null ? 'No responses' : `${rate.toFixed(1)}%`}</span></div>
    <div className="evidence-score-track" aria-hidden="true"><span style={{ width: `${rate ?? 0}%` }} /></div>
  </div>;
}

export function AssessmentResults({ reference }: { reference: ReferenceData }) {
  const { assessment } = reference;
  return <div className="evidence-results-view">
    <p className="evidence-view-lead">Compare choosing the fraction with explaining why.</p>
    <figure className="evidence-chart" aria-label={`Of ${assessment.total} responses, ${assessment.correct} selected the correct fraction and ${assessment.explanations} gave an adequate explanation.`}>
      <div className="evidence-measure"><span className="evidence-measure-label">Correct fraction</span><Score count={assessment.correct} total={assessment.total} tone="answer" /></div>
      <div className="evidence-measure"><span className="evidence-measure-label">Adequate explanation</span><Score count={assessment.explanations} total={assessment.total} tone="explanation" /></div>
      <figcaption>Separate scores · same 0–100% scale. Totals do not tell us which students met both criteria.</figcaption>
    </figure>
  </div>;
}

export function ClassResults({ reference }: { reference: ReferenceData }) {
  const { assessment, classes } = reference;
  return <div className="evidence-class-view">
    <p className="evidence-view-lead">Does the pattern hold across classes?</p>
    <table>
      <caption>Response counts and percentages by class · {assessment.date}</caption>
      <colgroup><col className="evidence-class-name-column" /><col /><col /></colgroup>
      <thead><tr><th scope="col">Class</th><th scope="col">Correct fraction</th><th scope="col">Adequate explanation</th></tr></thead>
      <tbody>{classes.map(item => <tr key={item.id}>
        <th scope="row">{item.label}</th>
        <td><Score count={item.correct} total={item.total} tone="answer" /></td>
        <td><Score count={item.explanations} total={item.total} tone="explanation" /></td>
      </tr>)}</tbody>
    </table>
    <p className="evidence-note">Each score uses that class’s response total. Bars share a 0–100% scale; percentages are rounded. Descriptive results, not teacher-effectiveness ratings.</p>
  </div>;
}

export function TaskSources({ reference, version }: { reference: ReferenceData; version: EvidenceVersion }) {
  return <div className="evidence-task-view">
    <section className="evidence-original-task" aria-label="Original task">
      <h3>What students were asked</h3>
      <p className="evidence-task-provenance">Fictional task & rubric · not district curriculum</p>
      <blockquote>{lessonContext.prompt}</blockquote>
    </section>
    <dl className="evidence-scoring-summary" aria-label="Two separate scoring criteria">
      <div><dt>Correct fraction</dt><dd><strong>2/4.</strong> The choice is scored separately.</dd></div>
      <div><dt>Adequate explanation</dt><dd>Words or a labeled drawing show <strong>equal amounts of the same whole.</strong> A doubling rule alone is not enough.</dd></div>
    </dl>
    <details className="evidence-source-details">
      <summary>Full scoring rubric</summary>
      <div><p>{lessonContext.selection}</p><p>{lessonContext.rubric}</p></div>
    </details>
    <details className="evidence-source-details">
      <summary>Collection & source details</summary>
      <div>
        <dl className="evidence-source-facts">
          <div><dt>Collected</dt><dd><time dateTime={reference.assessment.isoDate}>{reference.assessment.date}, 2026</time></dd></div>
          <div><dt>Scope</dt><dd>{reference.assessment.total} responses · {reference.classes.length} classes</dd></div>
          <div><dt>Lesson</dt><dd>{lessonContext.lesson}</dd></div>
        </dl>
        <p>{evidenceSnapshotDescription(version)}</p>
        <p>{lessonContext.provenance}</p>
        <p>{lessonContext.limits}</p>
      </div>
    </details>
  </div>;
}
