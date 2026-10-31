import type { ReferenceData } from './data/seed';
import type { EvidenceId } from './model';

export interface MaterialBlock { heading: string; text: string }

// Prototype assumptions, kept outside the versioned, persisted reference tables.
export const lessonContext = {
  provenance: 'Fictional lesson, task and scoring criteria created for this prototype; not supplied district curriculum.',
  goal: 'Explain why two fractions represent the same amount when they refer to the same whole.',
  lesson: 'Grade 4 · Fraction equivalence. Students compare equal-length fraction strips, partition halves into quarters, and explain what stays the same.',
  prompt: 'Which fraction is equivalent to 1/2: 2/4, 1/4, or 2/3? Explain why your choice represents the same amount as 1/2. You may use words or a drawing.',
  selection: 'Correct fraction selected: 2/4. This score records the choice separately from the explanation.',
  rubric: 'An adequate explanation connects 1/2 and 2/4 to equal amounts of the same whole. Words or a labeled drawing must show that splitting each half into two equal parts produces four quarters, with two quarters covering one half. A doubling rule alone does not yet explain why the amounts match.',
  limits: 'The two sample responses illustrate possible reasoning; they are not a representative sample or linked student-level records. Aggregate counts do not show which students met both criteria. Check the full work and task conditions before deciding why a response was scored this way.',
} as const;

export function taskBlocks(): MaterialBlock[] {
  return [
    { heading: 'Lesson context · prototype assumption', text: lessonContext.provenance + '\n' + lessonContext.lesson + '\nLearning goal: ' + lessonContext.goal },
    { heading: 'Original cool-down prompt · fictional', text: lessonContext.prompt },
    { heading: 'Scoring criteria · fictional', text: lessonContext.selection + '\n' + lessonContext.rubric },
  ];
}
export function selectedSourceBlocks(reference: ReferenceData, selected: EvidenceId[]): MaterialBlock[] {
  const { assessment, classes, responses, observation } = reference;
  return [
    { heading: 'Assessment · ' + assessment.date, text: `${assessment.correct}/${assessment.total} selected the correct fraction; ${assessment.explanations}/${assessment.total} gave an adequate explanation.\n` + lessonContext.limits },
    ...responses.filter(response => selected.includes(response.id)).map(response => ({ heading: response.label + ' · ' + assessment.date, text: '“' + response.quote + '”' })),
    { heading: 'Across-class counts · ' + assessment.date, text: classes.map(result => `${result.label}: ${result.correct}/${result.total} correct fraction; ${result.explanations}/${result.total} adequate explanation.`).join('\n') + '\nDescriptive counts, not a measure of teacher effectiveness.' },
    ...(selected.includes('observation') ? [{ heading: 'Historical observation · ' + observation.date + ' · ' + observation.scope, text: '“' + observation.quote + '”\n' + observation.caution }] : []),
  ];
}

// The fixture supplies a count, not a documented second assessment or an action forecast.
// Share the same limits on screen and with a recorded reflection's text export.
export const incompleteFollowUpComparison = { date: 'Oct 28', total: 120, explanations: 46, followUp: 56 } as const;
export function followUpSourceBlocks(): MaterialBlock[] {
  const assessment = incompleteFollowUpComparison;
  return [
    { heading: 'Fixed fictional comparison · Separate Oct 28 case', text: `Initial: ${assessment.explanations}/${assessment.total} adequate explanations (${assessment.date}). Follow-up illustration: ${assessment.followUp}/${assessment.total}. This incomplete-evidence case stays the same for every teaching action, evidence snapshot and implementation choice; it is not a prediction or an observed outcome of your plan.` },
    { heading: 'Collection date and follow-up task · not supplied', text: 'No follow-up collection date or question is supplied. The initial task is available as a baseline only; an equivalent follow-up task and comparable difficulty have not been established.' },
    { heading: 'Follow-up scoring · unverified', text: 'The illustration labels this count as adequate explanations. No follow-up scoring rubric or scoring record is supplied, so use of the same criteria as the initial task is unverified.' },
    { heading: 'Cohort and response coverage · unknown', text: `The follow-up denominator is ${assessment.total} responses in the illustration. There is no matched student roster, expected response total or missing-response count. Equal denominators do not establish the same students or complete coverage.` },
    { heading: 'Implementation evidence · leader reported', text: 'Your implementation choice and reflection record what you report. This example supplies no new classroom observation or implementation artifact to verify that the teaching action occurred.' },
    { heading: 'What to obtain before concluding', text: 'Request the dated follow-up task, scoring criteria, cohort and response coverage, and evidence of implementation. Record what remains uncertain and what you would examine next. These counts alone establish neither comparable learning progress nor causality.' },
  ];
}
