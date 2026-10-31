export interface PilotEvaluationProtocol {
  title: string;
  status: string;
  purpose: string;
  participants: string;
  scope: string;
  roles: { role: string; responsibility: string }[];
  steps: { title: string; text: string }[];
  measures: { question: string; evidence: string; review: string }[];
  decisions: { label: string; rule: string }[];
  sources: { title: string; url: string; relevance: string }[];
}

/** A proposed research protocol, independent of PLC records and meeting materials. */
export const pilotEvaluationProtocol: PilotEvaluationProtocol = {
  title: 'How we would test this',
  status: 'Proposed formative trial · No results collected',
  purpose: 'Test whether Throughline helps PLC leaders make usable, evidence-grounded instructional decisions within their existing planning routine. This is a proposal for learning about the design, not evidence of effectiveness.',
  participants: 'Invite 6–8 math PLC leaders from the intended pilot context, with varied data and AI confidence and access needs. Co-design the tasks, supports and review criteria with participating educators before the trial.',
  scope: 'This demonstration has one fixed fictional case and scripted prompts. A second comparable task packet and the trial arrangements would need to be prepared. No pilot is running, and this app does not collect research telemetry.',
  roles: [
    { role: 'Participating PLC leaders and peers', responsibility: 'Define what a useful plan looks like, try the tasks, rehearse a teaching move with a peer, and explain what helped or added burden.' },
    { role: 'Research facilitator', responsibility: 'Prepare comparable fictional packets, observe without completing the work, record time and obstacles manually, and coordinate a later implementation check.' },
    { role: 'Mathematics curriculum reviewer', responsibility: 'Use agreed criteria to review evidence fit, mathematical accuracy, cognitive demand and teachability. Review artifacts without knowing which process produced them where practical.' },
  ],
  steps: [
    { title: '1. Establish the baseline together', text: 'Observe the current PLC preparation process and identify the document or activity Throughline would replace. Agree on the instructional goal, review criteria, acceptable burden and decision rules before collecting comparison data.' },
    { title: '2. Compare matched planning tasks', text: 'Use two comparable fictional task packets: one with the current process and one with Throughline. Vary their order across participants where practical to reduce practice effects. Keep task difficulty and available planning time comparable; record differences and any researcher assistance.' },
    { title: '3. Examine judgment and rehearsal', text: 'Ask leaders to explain the evidence behind their choice and examine an unsupported inference supplied in the research task. Observe whether they challenge it. Include a brief peer rehearsal, then record how feedback changes the question, support or teaching move.' },
    { title: '4. Follow up and decide', text: 'Arrange a later check with educators on whether the planned move was tried and what additional work it required. Keep implementation evidence separate from student learning evidence. Review the findings together and choose adopt, revise or stop using the criteria agreed after baseline observation.' },
  ],
  measures: [
    { question: 'Does the whole workflow fit?', evidence: 'Manual time notes for preparation, correction, returning after an interruption, and follow-up; obstacles and assistance needed.', review: 'Compare total burden with the current process, including any duplicate documentation. Faster drafting alone is insufficient.' },
    { question: 'Is the plan instructionally sound?', evidence: 'Plan, selected task and evidence, proposed teacher question, and the curriculum reviewer’s comments.', review: 'Review evidence fit, mathematical accuracy, preserved cognitive demand and whether a teacher can carry out the move.' },
    { question: 'Does the leader exercise judgment?', evidence: 'Think-aloud explanation and response to the unsupported inference; what the leader accepts, rejects or revises and why.', review: 'Look for reasoning grounded in the task and student work. A completed field or approval click does not establish judgment.' },
    { question: 'Does rehearsal improve the move?', evidence: 'Peer feedback and the teaching question or move before and after the rehearsal.', review: 'Check whether feedback produces a specific, instructionally useful revision while preserving the learning goal.' },
    { question: 'Was the move actually tried?', evidence: 'Educator follow-up plus a suitable implementation artifact, when available; reasons for adaptation or non-use.', review: 'Distinguish an intention, a self-report and corroborating evidence. Record follow-up workload as well as implementation.' },
    { question: 'Can learning evidence be compared?', evidence: 'Collection dates, tasks, scoring criteria, cohort, response coverage and relevant conditions for both samples.', review: 'Explain any differences or missing context before interpreting a change. A small formative trial does not establish causal learning impact.' },
  ],
  decisions: [
    { label: 'Adopt for a next bounded trial', rule: 'Educators and reviewers find useful, instructionally sound decisions with acceptable total burden across the participating access needs. This supports another test, not a claim of district-wide effectiveness.' },
    { label: 'Revise and retest', rule: 'The core decision is useful, but a step adds avoidable work, blocks participation, weakens clarity or needs more support. Name the specific change and the evidence needed next.' },
    { label: 'Stop this approach', rule: 'The workflow repeatedly encourages unsupported conclusions, weakens mathematical rigor, creates an unresolved access barrier, or adds burden without a useful instructional benefit.' },
  ],
  sources: [
    { title: 'Leading Educators · MathAI Impact Network', url: 'https://leadingeducators.org/partnership/mathai-impact-network/', relevance: 'Describes embedding support in existing curriculum-specific professional learning and examining when AI adds value.' },
    { title: 'Antoinette Melvin · Strengthening Instructional Decision Making and Practice for the Age of AI', url: 'https://leadingeducators.org/blog/strengthening-instructional-decision-making-and-practice-for-the-age-of-ai/', relevance: 'Discusses instructional value, educator judgment and human relationships.' },
    { title: 'Leading Educators · How Rural Educators Are Co-Designing the Future of AI in Learning', url: 'https://leadingeducators.org/blog/how-rural-educators-are-co-designing-the-future-of-ai-in-learning/', relevance: 'Describes local problems of practice, focused hypotheses, co-design and iterative testing.' },
  ],
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!));
function safeSourceLink(url: string): string | null {
  try { const parsed = new URL(url); return parsed.protocol === 'https:' ? escapeHtml(parsed.href) : null; } catch { return null; }
}

/** Self-contained research handout. It accepts no cycle, student or approval state. */
export function exportPilotEvaluationHtml(protocol: PilotEvaluationProtocol = pilotEvaluationProtocol): string {
  const text = escapeHtml;
  const roles = protocol.roles.map(item => `<dt>${text(item.role)}</dt><dd>${text(item.responsibility)}</dd>`).join('');
  const steps = protocol.steps.map(item => `<li><h3>${text(item.title)}</h3><p>${text(item.text)}</p></li>`).join('');
  const rows = protocol.measures.map(item => `<tr><th scope="row">${text(item.question)}</th><td>${text(item.evidence)}</td><td>${text(item.review)}</td></tr>`).join('');
  const decisions = protocol.decisions.map(item => `<dt>${text(item.label)}</dt><dd>${text(item.rule)}</dd>`).join('');
  const sources = protocol.sources.map(item => {
    const href = safeSourceLink(item.url);
    return `<li>${href ? `<a href="${href}">${text(item.title)}</a>` : text(item.title)}<p>${text(item.relevance)}</p>${href ? `<p class="source-url">${text(item.url)}</p>` : ''}</li>`;
  }).join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Throughline · ${text(protocol.title)}</title>
<style>
*{box-sizing:border-box}body{margin:0;color:#17202b;background:#fff;font:16px/1.55 system-ui,sans-serif}main{max-width:1100px;margin:auto;padding:40px 28px}h1{font-size:2rem;line-height:1.15}h2{margin-top:2rem;font-size:1.3rem}h3{font-size:1.05rem}p{margin:.6rem 0 1rem}.status{font-weight:700;color:#163c73}.boundary{border-left:3px solid #31578b;padding-left:1rem}dt{font-weight:700;margin-top:1rem}dd{margin:.3rem 0 1rem}ol{padding-left:1.4rem}li{padding-left:.3rem}.table-scroll{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:.94rem}caption{text-align:left;font-weight:700;margin-bottom:.7rem}th,td{border:1px solid #b4bbc4;padding:12px;vertical-align:top;text-align:left;overflow-wrap:anywhere}thead th{background:#eef1f5}tbody th{width:22%}a{color:#163c73;text-decoration:underline}.source-url{font-size:.8rem;overflow-wrap:anywhere}.manual-notes{margin-top:2rem;border-top:2px solid #17202b}.note-line{min-height:3rem;border-bottom:1px solid #bbc1ca}.note-line span{font-size:.85rem;color:#3f4c5d}footer{margin-top:2rem;border-top:1px solid #bbc1ca;padding-top:1rem;font-size:.85rem}@media(max-width:640px){main{padding:24px 16px}table{min-width:650px}}@media print{@page{margin:18mm}body{font-size:10pt}main{max-width:none;padding:0}h2,h3{break-after:avoid}tr{break-inside:avoid}thead{display:table-header-group}.table-scroll{overflow:visible}table{min-width:0;font-size:9pt}a{color:inherit}.manual-notes{break-before:page}.note-line{min-height:4rem}}
</style></head><body><main>
<p class="status">${text(protocol.status)}</p><h1>${text(protocol.title)}</h1><p>${text(protocol.purpose)}</p>
<p class="boundary">${text(protocol.scope)}</p><p>Standalone research proposal. This handout is separate from an approved PLC meeting kit and contains no saved cycle, participant or student records. Open it locally and use your browser’s Print command for paper or PDF.</p>
<h2>Participants and responsibilities</h2><p>${text(protocol.participants)}</p><dl>${roles}</dl>
<h2>Proposed sequence</h2><ol>${steps}</ol>
<h2>Manual evidence collection</h2><div class="table-scroll"><table><caption>Agree on these review criteria with educators before the comparison</caption><thead><tr><th scope="col">Question</th><th scope="col">Evidence to collect</th><th scope="col">How to review it</th></tr></thead><tbody>${rows}</tbody></table></div>
<h2>Agree on decision rules after the baseline</h2><p>Set context-specific thresholds together before collecting comparison data. There are no measured results or predetermined numerical success targets in this proposal.</p><dl>${decisions}</dl>
<section class="manual-notes" aria-label="Blank notes for manual use"><h2>Manual trial notes</h2><p>For the research team to complete outside this app. Keep identifiable student information out of this handout.</p><div class="note-line"><span>Context, dates and facilitator:</span></div><div class="note-line"><span>Task pairing, order and differences:</span></div><div class="note-line"><span>Baseline and agreed decision thresholds:</span></div><div class="note-line"><span>Observed reasoning, corrections, access needs and burden:</span></div><div class="note-line"><span>Implementation evidence and learning-comparison limits:</span></div><div class="note-line"><span>Decision, rationale, owner and next review:</span></div></section>
<h2>Research informing the proposal</h2><ul>${sources}</ul><footer>These sources inform a proposed Throughline evaluation. They do not endorse this prototype, establish its effectiveness or report findings from this trial. No study results have been collected.</footer>
</main></body></html>`;
}
