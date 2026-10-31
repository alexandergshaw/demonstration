import type { EvidenceVersion } from '../model';
import type { ReferenceData } from './seed';

/** Fixed, fictional source versions. A cycle always resolves its own evidence version. */
export function referenceForVersion(base: ReferenceData, version: EvidenceVersion): ReferenceData {
  if (version === 'oct28') return base;
  return {
    ...structuredClone(base),
    assessment: { ...base.assessment, date: 'Oct 29', isoDate: '2026-10-29', total: 116, correct: 90, explanations: 52 },
    classes: [
      { id: 'A', label: 'Class A', total: 30, correct: 24, explanations: 15 },
      { id: 'B', label: 'Class B', total: 29, correct: 23, explanations: 13 },
      { id: 'C', label: 'Class C', total: 29, correct: 23, explanations: 14 },
      { id: 'D', label: 'Class D', total: 28, correct: 20, explanations: 10 },
    ],
    responses: [
      { id: 'responseB', label: 'Oct 29 student response B', category: 'Equal amounts explained', tone: 'blue', quote: 'I split each half into two equal pieces. Two of the four pieces cover the same amount as one half of the same strip.', interpretation: 'This response connects the number of parts to equal amounts. Which details meet the explanation rubric?' },
      { id: 'responseC', label: 'Oct 29 student response C', category: 'Possible misconception', tone: 'amber', quote: 'I chose 2/3 because both numbers are bigger than 1/2.', interpretation: 'A larger numerator and denominator do not establish equal amounts. What would a drawing reveal about this reasoning?' },
    ],
    observation: { ...base.observation, age: '7 weeks, 1 day old at collection' },
    labels: {
      ...base.labels,
      assessment: 'Oct 29 repeat cool-down · 116 responses',
      responseB: 'Oct 29 response B · Equal amounts explained',
      responseC: 'Oct 29 response C · Fraction comparison error',
    },
  };
}

export function evidenceSnapshotDescription(version: EvidenceVersion): string {
  return version === 'oct28'
    ? 'Fictional collection: October 28, 2026. 120 responses across four classes. The September 9 observation covers one classroom and remains historical context.'
    : 'Fictional collection: October 29, 2026. The same four classes repeated the original prompt with the same rubric: 116 of 120 expected responses; four students were absent. These are new work samples, not matched student-level gains. Repeating the task may affect results; the change does not establish the effect of a teaching action. The September 9 observation is unchanged.';
}
