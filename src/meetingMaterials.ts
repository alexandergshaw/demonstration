import { exportPlan, hasPlan, hasReflection, minutes, type PlanState } from './model';
import type { ReferenceData } from './data/seed';
import { evidenceSnapshotDescription, referenceForVersion } from './data/evidenceSnapshots';
import { selectedSourceBlocks, taskBlocks, type MaterialBlock } from './lessonContext';
import { portableFontCsp, portableTypographyCss } from './portableTypography';

export const agendaHeadings = ['Connect to the goal', 'Examine student work', 'Test the interpretation', 'Design & rehearse the teaching move', 'Plan implementation', 'Choose the next evidence'];
export const agendaHints = [
  'How will the team connect the learning goal to your confirmed focus?',
  'Give participants directions: which work to inspect, what to discuss, and what to record.',
  'How will the team test an alternative explanation before deciding?',
  'Describe how the team will design the teaching move. If useful, rehearse a teacher question, anticipate student reasoning, and invite peer feedback. Keep the thinking with students.',
  'Agree who will try the action, when, and how implementation will be checked.',
  'Specify what comparable student work to collect and when the PLC will revisit it.',
];
export interface MeetingPage { title: string; label: string; blocks: MaterialBlock[] }
function plannedCollectionBlocks(state: PlanState): MaterialBlock[] {
  const details = [
    ...(state.evidenceCollector.trim() ? ['Who will collect: ' + state.evidenceCollector] : []),
    ...(state.collectionDate ? ['Planned collection date: ' + state.collectionDate] : []),
    ...(state.reviewDate ? ['Planned PLC review date: ' + state.reviewDate] : []),
  ];
  return details.length ? [{ heading: 'PLANNED · Evidence collection & review', text: details.join('\n') + '\nThese are plans, not evidence that collection or review occurred.' }] : [];
}
export function buildMeetingKit(state: PlanState, reference: ReferenceData): MeetingPage[] {
  if (!hasPlan(state)) throw new Error('Approve the current plan before opening meeting materials.');
  reference = referenceForVersion(reference, state.evidenceVersion);
  const challenge = reference.challenges.find(item => item.id === state.lens);
  const selectedWork = reference.responses.filter(response => state.selected.includes(response.id));
  const accessPlan = state.accessParticipation.trim()
    ? [{ heading: 'Access & participation · leader plan', text: state.accessParticipation }]
    : [];
  const collectionPlan = plannedCollectionBlocks(state);
  const content: MaterialBlock[][] = [
    [{ heading: 'Our instructional focus', text: state.focus }, { heading: 'Leader interpretation', text: state.interpretation }, { heading: 'Confidence', text: state.confidence }],
    [{ heading: 'Current evidence · ' + reference.assessment.date, text: `${reference.assessment.correct}/${reference.assessment.total} correct fractions; ${reference.assessment.explanations}/${reference.assessment.total} adequate explanations. Full task, rubric and class counts are in the source packet.` }, ...selectedWork.map(response => ({ heading: response.label, text: '“' + response.quote + '”' }))],
    [{ heading: 'Alternative considered · scripted question', text: challenge?.prompt ?? '' }, { heading: 'Leader-shaped focus after considering the challenge', text: state.focus }, { heading: 'Discussion prompt', text: 'Which evidence supports this interpretation? What else could explain the pattern, and what remains uncertain?' }],
    [{ heading: 'Teaching action to develop', text: state.action }, ...accessPlan, { heading: 'Optional rehearsal support', text: 'Follow the approved facilitation directions above. If a rehearsal supports them, use a selected student response or the original task to practice a teacher question. Anticipate student reasoning, invite peer feedback, and revise the question. Keep the explanation with the student.' }],
    [{ heading: 'Who will try it', text: state.owner }, { heading: 'Teaching action', text: state.action }, { heading: 'PLANNED · Check that teaching changed', text: state.implementationCheck }],
    [{ heading: 'PLANNED · Check student learning', text: state.learningCheck }, { heading: 'PLANNED · Check implementation', text: state.implementationCheck }, ...collectionPlan, { heading: 'Before concluding', text: 'Compare task, rubric, cohort, missing responses and implementation. Improvement alone does not establish causality.' }],
  ];
  return [
    ...agendaHeadings.map((title, index) => ({ title, label: `Slide ${index + 1} · ${minutes[index]} minutes`, blocks: [{ heading: 'Facilitation directions · reviewed by the leader', text: state.agenda[index] }, ...content[index]] })),
    { title: 'Source packet', label: 'Reference handout · fictional evidence', blocks: [{ heading: 'Evidence snapshot used for this plan', text: evidenceSnapshotDescription(state.evidenceVersion) }, ...taskBlocks(), ...selectedSourceBlocks(reference, state.selected)] },
    { title: 'Evidence-to-action activity', label: 'Participant handout · write in during the PLC', blocks: [
      { heading: 'Instructional focus', text: state.focus },
      { heading: '1 · Examine the evidence', text: state.agenda[1] },
      ...selectedWork.map(response => ({ heading: response.label, text: '“' + response.quote + '”' })),
      { heading: 'Evidence to cite', text: 'Use the accompanying source packet for the original task, scoring criteria and class counts. Name the source and distinguish what you observe from your explanation.' },
      { heading: '2 · Design & rehearse the teaching move', text: state.agenda[3] },
      { heading: 'Teaching action to develop', text: state.action },
      ...accessPlan,
      { heading: 'Team notes · complete together', text: 'Evidence and strengths we noticed:\n\nAlternative explanation to test:\n\nWhose perspective or work is missing, and what will we seek?\n\n' },
      { heading: 'Optional rehearsal guide · fraction equivalence', text: 'Follow the approved facilitation directions. If useful, rehearse with a selected student response or the original task. Use the task and rubric to examine equal amounts of the same whole, beyond a doubling rule alone: how can partitioning change the number of parts while preserving the amount? Rehearse your own question; do not supply the student\'s explanation. Ask a colleague what the question could reveal, then revise it. Anticipated reasoning is a hypothesis to test, not a claim about the student.' },
      { heading: 'Optional rehearsal notes · complete together', text: 'Selected student response or original task and what to examine:\n\nTeacher question to rehearse:\n\nAnticipated student reasoning:\n\nPeer feedback:\n\nRevised teacher question:\n\nWhat thinking will students still do themselves?\n\n' },
      { heading: 'PLANNED · Agreed follow-up', text: 'Implementation: ' + state.implementationCheck + '\nLearning: ' + state.learningCheck },
      ...collectionPlan,
    ] },
  ];
}
export function exportMeetingNotes(state: PlanState, reference: ReferenceData): string {
  reference = referenceForVersion(reference, state.evidenceVersion);
  const plan = exportPlan(state, reference.labels);
  const sources = [{ heading: 'Evidence snapshot used for this plan', text: evidenceSnapshotDescription(state.evidenceVersion) }, ...taskBlocks(), ...selectedSourceBlocks(reference, state.selected)];
  const recordedContext = hasReflection(state)
    ? '\n\nFOLLOW-UP EVIDENCE STATUS\n\nNo collected follow-up dataset is attached to this cycle. Implementation is leader-reported; planned checks and dates do not establish that collection occurred. Worked examples in the Guide are separate fictional cases, not outcomes of this plan. Obtain dated student work, its task and rubric, response coverage, and implementation records before judging the effect of the teaching move.'
    : '';
  return plan + '\n\nSOURCE PACKET\n\n' + sources.map(block => block.heading + '\n' + block.text).join('\n\n') + recordedContext;
}
// Every dynamic string is text, including headings. The portable document has no scripts or external requests.
const escapeHtml = (text: string) => text.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]!));
export function exportMeetingHtml(state: PlanState, reference: ReferenceData): string {
  const pages = buildMeetingKit(state, reference);
  const sections = pages.map((page, index) => `<section class="sheet" id="page-${index}"><p class="eyebrow">${escapeHtml(page.label)}</p><h2>${escapeHtml(page.title)}</h2>${page.blocks.map(block => `<div class="block"><h3>${escapeHtml(block.heading)}</h3><p>${escapeHtml(block.text)}</p></div>`).join('')}<footer>Throughline · Fictional demonstration · Educator-approved plan · ${index + 1}/${pages.length}</footer></section>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; ${portableFontCsp} base-uri 'none'; form-action 'none'"><title>Throughline · PLC meeting kit</title><style>
${portableTypographyCss}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;color:#172637;background:#f3f5f8;font-family:var(--font-family);font-size:var(--text-body);font-weight:var(--font-regular);line-height:1.6}
header,nav,.sheet{max-width:1040px;margin:28px auto;padding:36px}
header{padding-bottom:0}
h1,h2,h3,p{margin:0}
h1,h2,h3{font-weight:var(--font-semibold);line-height:1.25}
h1{font-size:var(--text-title);letter-spacing:-.03em}
h2{font-size:var(--text-section);letter-spacing:-.02em;margin:12px 0 28px}
h3{font-size:var(--text-label);color:#172637;margin-bottom:9px}
p{white-space:pre-wrap;overflow-wrap:anywhere}
.eyebrow,footer{font-size:var(--text-meta);line-height:1.5;color:#526170}
header p{font-size:var(--text-support);color:#526170;margin-top:12px}
.sheet{background:#fff;border:1px solid #ccd4de;border-top:4px solid #225cd5;min-height:70vh;scroll-margin-top:20px}
.block{margin:22px 0;padding-top:18px;border-top:1px solid #ccd4de}
.block p{font-size:var(--text-body)}
footer{border-top:1px solid #ccd4de;padding-top:18px;margin-top:32px}
nav{display:flex;flex-wrap:wrap;gap:8px 22px;padding-top:0;padding-bottom:0}
nav a{color:#163f99;font-size:var(--text-support);padding:10px 0;text-underline-offset:5px}
a:focus-visible{outline:3px solid #225cd5;outline-offset:3px}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
@media(max-width:600px){header,nav,.sheet{margin:12px;padding:20px}.sheet{min-height:0}}
@media print{
  @page{size:auto;margin:18mm}
  body{background:#fff}
  header,nav{display:none}
  .sheet{border:0;min-height:0;margin:0;padding:0;break-before:page}
  .sheet:first-of-type{break-before:auto}
  h2,h3{break-after:avoid}
  .block{margin:14pt 0;padding-top:10pt}
  .block p{orphans:3;widows:3}
  footer{margin-top:20pt}
}
</style></head><body><header><h1>${escapeHtml(reference.workspace.name)} · Meeting kit</h1><p>50-minute PLC · Six presentation sections, source packet and activity handout. Open this file in a browser; use its Print command to print or save a PDF. This is a snapshot of the approved plan; later edits in Throughline require a new export.</p><p>All evidence is fictional. Directions and decisions are reviewed by the educator. Discussion prompts and the handout structure are fixed scaffolds, not live AI.</p></header><nav aria-label="Meeting sections">${pages.map((page, index) => `<a href="#page-${index}">${index + 1}. ${escapeHtml(page.title)}</a>`).join('')}</nav><main>${sections}</main></body></html>`;
}
