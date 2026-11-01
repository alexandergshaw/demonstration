import type { ReferenceData } from '../data/seed';
import { evidenceSnapshotDescription } from '../data/evidenceSnapshots';
import { lessonContext } from '../lessonContext';
import type { EvidenceVersion } from '../model';
import { TaskExplanation } from '../components/TaskExplanation';

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
    <TaskExplanation title="How to read these two results"
      why="Choosing an equivalent fraction and explaining why it is equivalent reveal different things. The team needs to understand the reasoning behind the answer before deciding what to teach."
      steps={[
        { label: 'Read each count against its total.', detail: `Both measures describe the same collection of ${assessment.total} responses. Compare the proportion meeting each criterion, not just the bar lengths.` },
        { label: 'Describe the pattern before explaining it.', detail: 'You can say that the two rates differ. You cannot subtract them to identify a particular group of students, or tell from these totals why an explanation was missing.' },
      ]}
      handoff="Open Task & sources to see exactly what counted as an adequate explanation. Then use student work to investigate what the totals might mean." />
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
    <TaskExplanation title="Use class differences to choose a question"
      why="A combined total can hide variation. Looking across classes helps the team decide whether to investigate a shared pattern or a difference that needs more context."
      steps={[
        { label: 'Compare the two measures within each row.', detail: 'Look for a difference between selecting the correct fraction and explaining it. Then check whether that relationship appears in the other classes.' },
        { label: 'Use percentages when response totals differ.', detail: 'The denominator is the number of responses in that class. A higher rate alone does not explain teaching quality, student needs or the cause of a difference.' },
      ]}
      handoff="Return to the illustrative work. Look for reasoning that could help the team investigate the pattern; these samples are not matched to the class rows." />
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
    <TaskExplanation title="Check what the scores mean"
      why="The task asks for a choice and a justification. The scoring criteria explain why a correct answer can still leave a question about understanding."
      steps={[
        { label: 'Read the prompt as a student would.', detail: 'Identify what students had to select and what they had to explain. Notice the words, representation and response options they were given.' },
        { label: 'Use the rubric to examine the samples.', detail: 'Look for reasoning about equal amounts of the same whole, in words or a labeled drawing. A rule about doubling can produce the answer without showing that connection.' },
      ]}
      handoff="Compare classes to see how widely the pattern appears. Open the full rubric or collection details below when you need the exact wording or scope." />
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
