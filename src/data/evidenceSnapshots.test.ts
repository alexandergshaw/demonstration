import { describe, expect, it } from 'vitest';
import { createReferenceData } from './seed';
import { evidenceSnapshotDescription, referenceForVersion } from './evidenceSnapshots';

describe('fixed fictional evidence snapshots', () => {
  it('retains the original references and resolves a separate dated version', () => {
    const base = createReferenceData();
    const before = structuredClone(base);
    expect(referenceForVersion(base, 'oct28')).toBe(base);
    const latest = referenceForVersion(base, 'oct29');
    expect(base).toEqual(before);
    expect(latest.assessment).toMatchObject({ isoDate: '2026-10-29', total: 116, correct: 90, explanations: 52 });
    expect(latest.observation.isoDate).toBe('2026-09-09');
    expect(latest.observation.quote).toBe(base.observation.quote);
    expect(latest.observation.caution).toBe(base.observation.caution);
    expect(latest.labels.assessment).toContain('Oct 29');
    expect(latest.responses[0].quote).not.toBe(base.responses[0].quote);
    latest.responses[0].quote = 'Caller edit';
    latest.workspace.name = 'Caller edit';
    expect(base).toEqual(before);
    expect(referenceForVersion(base, 'oct29').responses[0].quote).not.toBe('Caller edit');
  });

  it.each(['oct28', 'oct29'] as const)('keeps aggregate counts consistent with all classes for %s', version => {
    const reference = referenceForVersion(createReferenceData(), version);
    for (const metric of ['total', 'correct', 'explanations'] as const) {
      expect(reference.classes.reduce((sum, classroom) => sum + classroom[metric], 0)).toBe(reference.assessment[metric]);
    }
    for (const classroom of reference.classes) {
      expect(classroom.correct).toBeLessThanOrEqual(classroom.total);
      expect(classroom.explanations).toBeLessThanOrEqual(classroom.total);
    }
  });

  it('makes changing coverage and repeated-task limitations explicit', () => {
    const description = evidenceSnapshotDescription('oct29');
    expect(description).toContain('116 of 120 expected responses');
    expect(description).toContain('four students were absent');
    expect(description).toContain('same rubric');
    expect(description).toContain('not matched student-level gains');
    expect(description).toContain('Repeating the task');
    expect(description).toContain('September 9 observation is unchanged');
  });
});
