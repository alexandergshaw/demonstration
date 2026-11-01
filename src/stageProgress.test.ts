import { describe, expect, it } from 'vitest';
import { initialState, reducer, type PlanState } from './model';
import { stageIsComplete } from './stageProgress';

function confirmedFocus(): PlanState {
  return reducer({ ...initialState(), interpretation: 'The totals differ, but do not show which students met both criteria.', challenged: true, focus: 'Investigate how students explain equal amounts of the same whole.' }, { type: 'confirm-focus' });
}

describe('stage completion belongs to its own task', () => {
  it('does not claim evidence was reviewed just because a focus was confirmed', () => {
    const state = confirmedFocus();
    expect(stageIsComplete(state, 0)).toBe(false);
    expect(stageIsComplete(state, 1)).toBe(true);
  });
  it('allows core evidence reviews to be complete without selecting work or confirming a focus', () => {
    const state: PlanState = { ...initialState(), evidenceReviewed: ['results', 'task', 'selection'] };
    expect(stageIsComplete(state, 0)).toBe(true);
    expect(stageIsComplete(state, 1)).toBe(false);
    expect(reducer(initialState(), { type: 'go', step: 1 }).step).toBe(1);
  });
  it('does not substitute optional review for core review, and reopens selection after a source change', () => {
    expect(stageIsComplete({ ...initialState(), evidenceReviewed: ['classes', 'work'] }, 0)).toBe(false);
    const state: PlanState = { ...confirmedFocus(), evidenceReviewed: ['results', 'task', 'selection'] };
    const changed = reducer(state, { type: 'evidence', id: 'responseB' });
    expect(stageIsComplete(changed, 0)).toBe(false);
    expect(stageIsComplete(changed, 1)).toBe(false);
  });
  it('keeps drafted plans and reports distinct from approval and recorded reflection', () => {
    const state = { ...confirmedFocus(), action: 'Ask students to draw equal amounts and explain what stays the same.', implementationCheck: 'Bring a dated account of the prompt and classroom attempt.', learningCheck: 'Collect comparable explanations scored with the same criteria.', implementation: 'no' as const, reflection: 'The move was not tried. The team will prepare materials and agree another date.' };
    expect(stageIsComplete(state, 2)).toBe(false);
    expect(stageIsComplete(state, 3)).toBe(false);
    const approved = reducer({ ...state, consent: true }, { type: 'confirm-plan' });
    expect(stageIsComplete(approved, 2)).toBe(true);
    expect(stageIsComplete(approved, 3)).toBe(false);
    const recorded = reducer(approved, { type: 'save-reflection' });
    expect(stageIsComplete(recorded, 3)).toBe(true);
    expect(stageIsComplete(reducer(recorded, { type: 'text', field: 'reflection', value: 'Updated next action for the next meeting.' }), 3)).toBe(false);
  });
});
