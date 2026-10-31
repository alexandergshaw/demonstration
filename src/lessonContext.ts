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
