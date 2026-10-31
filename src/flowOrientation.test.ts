import { describe, expect, it } from 'vitest';
import { initialState, type PlanState } from './model';
import { shouldIntroduceFlow } from './flowOrientation';

describe('first-use flow introduction eligibility', () => {
  it('introduces an untouched Evidence cycle only until the welcome is dismissed', () => {
    const state = initialState();
    expect(shouldIntroduceFlow(state, false)).toBe(true);
    expect(shouldIntroduceFlow(state, true)).toBe(false);
  });

  it.each([1, 2, 3])('does not interrupt stage %s even if no decision text exists', step => {
    expect(shouldIntroduceFlow({ ...initialState(), step }, false)).toBe(false);
  });

  it.each(['interpretation', 'focus', 'action', 'reflection'] as const)(
    'preserves a returning user’s partial %s without reopening the introduction', field => {
      const state = { ...initialState(), [field]: 'I' };
      expect(shouldIntroduceFlow(state, false)).toBe(false);
    },
  );

  it('treats whitespace as unstarted writing without changing the cycle', () => {
    const state = { ...initialState(), interpretation: ' \n ', focus: '\t', action: ' ', reflection: '\n' };
    const before = structuredClone(state);
    expect(shouldIntroduceFlow(state, false)).toBe(true);
    expect(state).toEqual(before);
  });

  it.each<Partial<PlanState>>([
    { owner: 'Math coach' },
    { agenda: initialState().agenda.map((item, index) => index === 1 ? 'Compare drawings with a partner.' : item) },
    { implementationCheck: 'Bring lesson notes.' },
    { learningCheck: 'Collect comparable student work.' },
    { evidenceCollector: 'Team facilitator' },
    { nextCycleQuestion: 'What else should we examine?' },
    { implementation: 'no' },
    { review: true },
  ])('does not interrupt retained planning or follow-up work after core writing is cleared: %j', changes => {
    expect(shouldIntroduceFlow({ ...initialState(), ...changes }, false)).toBe(false);
  });

  it('checks eligibility without changing selected evidence, drafts or approvals', () => {
    const state = { ...initialState(), selected: ['assessment', 'responseB'] as const };
    const cycle = { ...state, selected: [...state.selected] };
    const before = structuredClone(cycle);
    expect(shouldIntroduceFlow(cycle, false)).toBe(true);
    expect(shouldIntroduceFlow(cycle, true)).toBe(false);
    expect(cycle).toEqual(before);
  });
});
