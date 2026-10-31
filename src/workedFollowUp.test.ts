import { describe, expect, it } from 'vitest';
import { workedFollowUp as example } from './workedFollowUp';

describe('complete fictional follow-up case', () => {
  it('reconciles class counts with both dated assessments and full response coverage', () => {
    const sum = (field: 'students' | 'baselineCorrect' | 'baselineAdequate' | 'followUpCorrect' | 'followUpAdequate') => example.classes.reduce((total, item) => total + item[field], 0);
    expect(sum('students')).toBe(example.baseline.expected);
    expect(sum('students')).toBe(example.followUp.expected);
    expect(sum('baselineCorrect')).toBe(example.baseline.correct);
    expect(sum('baselineAdequate')).toBe(example.baseline.adequate);
    expect(sum('followUpCorrect')).toBe(example.followUp.correct);
    expect(sum('followUpAdequate')).toBe(example.followUp.adequate);
    expect(example.baseline.responses).toBe(example.baseline.expected);
    expect(example.followUp.responses).toBe(example.followUp.expected);
    expect(Date.parse(example.followUp.date)).toBeGreaterThan(Date.parse(example.baseline.date));
    for (const item of example.classes) {
      expect(item.baselineAdequate).toBeLessThanOrEqual(item.baselineCorrect);
      expect(item.followUpAdequate).toBeLessThanOrEqual(item.followUpCorrect);
      expect(item.baselineCorrect).toBeLessThanOrEqual(item.students);
      expect(item.followUpCorrect).toBeLessThanOrEqual(item.students);
      expect(item.fullRoutines).toBeLessThanOrEqual(item.plannedRoutines);
    }
  });

  it('retains the partial-implementation counterexample and the limits needed to interpret the comparison', () => {
    expect(example.classes.filter(item => item.fullRoutines === item.plannedRoutines)).toHaveLength(3);
    expect(example.classes.filter(item => item.fullRoutines < item.plannedRoutines)).toHaveLength(1);
    expect(example.classes.find(item => item.name === 'D')?.implementation).toContain('omitted in two lessons');
    expect(example.boundary).toContain('Every record below is invented');
    expect(example.boundary).toContain('not outcomes of your plan');
    expect(example.coverage).toContain('same 120 students');
    expect(example.coverage).toContain('no missing responses');
    expect(example.comparabilityLimit).toContain('equal task difficulty is an assumption');
    expect(example.comparabilityLimit).toContain('do not establish causality');
    expect(example.implementationLimit).toContain('do not verify every lesson');
    expect(example.nextCheck).toContain('despite documented use');
  });
});
