import { describe, expect, it } from 'vitest';
import {
  decodeDraft, encodeDraft, exportPlan, focusError, hasFocus, hasPlan,
  hasReflection, initialState, minutes, planError, reducer, reflectionError,
  type Action, type PlanState,
} from './model';

const interpretation = 'Many students selected the correct fraction, but fewer explained why. We should check the wording as well as their conceptual understanding.';
const focus = 'Help students justify fraction equivalence with visual models and partner explanations.';
const actionText = 'Each teacher will use a partner explanation routine with fraction models in two upcoming lessons.';
const implementationCheck = 'Teacher check-in and two observation notes on whether the routine was used.';
const learningCheck = 'Compare two equivalent cool-down explanations using the same rubric and cohort.';
const reflection = 'The routine was tried in every class. The next explanations improved, but we need comparable tasks before attributing the change to the routine.';
const apply = (state: PlanState, ...actions: Action[]) => actions.reduce(reducer, state);

function focusDraft(): PlanState {
  return apply(initialState(),
    { type: 'evidence', id: 'responseB' },
    { type: 'evidence', id: 'observation' },
    { type: 'text', field: 'interpretation', value: interpretation },
    { type: 'challenge' },
    { type: 'text', field: 'focus', value: focus },
  );
}
function planDraft(): PlanState {
  return apply(focusDraft(),
    { type: 'confirm-focus' },
    { type: 'text', field: 'action', value: actionText },
    { type: 'text', field: 'implementationCheck', value: implementationCheck },
    { type: 'text', field: 'learningCheck', value: learningCheck },
    { type: 'consent', value: true },
  );
}
function approvedPlan(): PlanState { return reducer(planDraft(), { type: 'confirm-plan' }); }
function completed(): PlanState {
  return apply(approvedPlan(),
    { type: 'implementation', value: 'yes' },
    { type: 'text', field: 'reflection', value: reflection },
    { type: 'save-reflection' },
  );
}

// These oracles come from the checked educator-ownership contract, not snapshots of JSX.
describe('educator-owned workflow', () => {
  it('requires explicit decisions throughout a complete evidence-to-follow-up journey', () => {
    const draft = focusDraft();
    expect(hasFocus(draft)).toBe(false);
    expect(focusError(draft)).toBe('');
    const planned = planDraft();
    expect(hasFocus(planned)).toBe(true);
    expect(hasPlan(planned)).toBe(false);
    expect(planError(planned)).toBe('');
    const approved = approvedPlan();
    expect(hasPlan(approved)).toBe(true);
    expect(approved.step).toBe(3);
    expect(hasReflection(approved)).toBe(false);
    const finished = completed();
    expect(hasReflection(finished)).toBe(true);
    expect(finished.interpretation).toBe(interpretation);
    expect(finished.focus).toBe(focus);
    expect(minutes.reduce((sum, value) => sum + value, 0)).toBe(50);
    expect(finished.agenda).toHaveLength(6);
  });

  it.each([2, 3, -1, 4, 1.5, Number.NaN])('rejects unavailable or invalid navigation to %s', step => {
    expect(reducer(initialState(), { type: 'go', step }).step).toBe(0);
  });

  it('allows evidence and reasoning navigation but gates follow-up until approval', () => {
    expect(reducer(initialState(), { type: 'go', step: 1 }).step).toBe(1);
    const confirmed = reducer(focusDraft(), { type: 'confirm-focus' });
    expect(reducer(confirmed, { type: 'go', step: 3 }).step).toBe(2);
    expect(reducer(approvedPlan(), { type: 'go', step: 0 }).step).toBe(0);
  });

  it('does not manufacture completion by calling confirmations out of order', () => {
    const state = apply(initialState(), { type: 'challenge' }, { type: 'confirm-focus' }, { type: 'confirm-plan' }, { type: 'save-reflection' });
    expect(hasFocus(state)).toBe(false);
    expect(hasPlan(state)).toBe(false);
    expect(hasReflection(state)).toBe(false);
    expect(state.step).toBe(0);
  });

  it('keeps the base assessment attached while toggling supplementary evidence', () => {
    const selected = apply(initialState(), { type: 'evidence', id: 'responseC' }, { type: 'evidence', id: 'assessment' });
    expect(selected.selected).toEqual(['assessment', 'responseC']);
    expect(reducer(selected, { type: 'evidence', id: 'responseC' }).selected).toEqual(['assessment']);
  });

  it('requires a challenge of the current interpretation before confirming a focus', () => {
    const changed = reducer(focusDraft(), { type: 'text', field: 'interpretation', value: interpretation + ' Another possibility deserves consideration.' });
    expect(changed.challenged).toBe(false);
    expect(focusError(changed)).toMatch(/challenge/i);
    expect(hasFocus(reducer(changed, { type: 'confirm-focus' }))).toBe(false);
  });
});

describe('downstream invalidation', () => {
  const focusChanges: [string, Action, boolean][] = [
    ['selected evidence', { type: 'evidence', id: 'responseC' }, true],
    ['interpretation', { type: 'text', field: 'interpretation', value: interpretation + ' We need another sample.' }, true],
    ['focus', { type: 'text', field: 'focus', value: focus + ' Start with small-group practice.' }, false],
    ['challenge lens', { type: 'lens', value: 'variation' }, true],
    ['confidence', { type: 'confidence', value: 'tentative' }, false],
  ];
  it.each(focusChanges)('changing %s revokes affected approvals without deleting drafts', (_name, change, challengeStale) => {
    const state = reducer(completed(), change);
    expect(hasFocus(state)).toBe(false);
    expect(hasPlan(state)).toBe(false);
    expect(hasReflection(state)).toBe(false);
    expect(state.consent).toBe(false);
    expect(state.review).toBe(true);
    expect(state.action).toBe(actionText);
    expect(state.reflection).toBe(reflection);
    expect(state.implementation).toBe('yes');
    if (challengeStale) expect(state.challenged).toBe(false);
    expect(() => exportPlan(state)).toThrow(/approve/i);
  });

  const planChanges: [string, Action][] = [
    ['agenda', { type: 'agenda', index: 1, value: 'Compare two contrasting student explanations' }],
    ['classroom action', { type: 'text', field: 'action', value: actionText + ' Debrief after each lesson.' }],
    ['owner', { type: 'text', field: 'owner', value: 'Grade 4 coaches and teachers' }],
    ['implementation measure', { type: 'text', field: 'implementationCheck', value: implementationCheck + ' Use a shared checklist.' }],
    ['learning measure', { type: 'text', field: 'learningCheck', value: learningCheck + ' Include missing responses.' }],
    ['withdrawn consent', { type: 'consent', value: false }],
  ];
  it.each(planChanges)('changing %s keeps the focus but revokes plan and reflection acceptance', (_name, change) => {
    const state = reducer(completed(), change);
    expect(hasFocus(state)).toBe(true);
    expect(hasPlan(state)).toBe(false);
    expect(hasReflection(state)).toBe(false);
    expect(state.consent).toBe(false);
    expect(state.review).toBe(true);
    expect(state.interpretation).toBe(interpretation);
    expect(state.focus).toBe(focus);
    expect(state.reflection).toBe(reflection);
    expect(() => exportPlan(state)).toThrow(/approve/i);
  });

  it('requires a fresh reflection save even after a changed plan is reapproved', () => {
    let state = reducer(completed(), { type: 'text', field: 'focus', value: focus + ' Include equal-sized wholes.' });
    state = apply(state, { type: 'confirm-focus' }, { type: 'consent', value: true }, { type: 'confirm-plan' });
    expect(hasPlan(state)).toBe(true);
    expect(hasReflection(state)).toBe(false);
    expect(exportPlan(state)).not.toContain(reflection);
    expect(exportPlan(state)).toContain('Not yet recorded');
    expect(hasReflection(reducer(state, { type: 'save-reflection' }))).toBe(true);
  });

  it.each<Action>([
    { type: 'implementation', value: 'partial' },
    { type: 'text', field: 'reflection', value: reflection + ' We will gather another cycle.' },
  ])('follow-up edits preserve the approved plan but need a fresh save (%j)', change => {
    const state = reducer(completed(), change);
    expect(hasFocus(state)).toBe(true);
    expect(hasPlan(state)).toBe(true);
    expect(hasReflection(state)).toBe(false);
    expect(exportPlan(state)).not.toContain(state.reflection);
  });

  it('does not revoke approval for a no-op field change', () => {
    const state = reducer(completed(), { type: 'text', field: 'focus', value: focus });
    expect(hasReflection(state)).toBe(true);
  });
});

describe('input boundaries and failure recovery', () => {
  it('trims whitespace and enforces interpretation/focus boundaries', () => {
    let state = apply(initialState(), { type: 'text', field: 'interpretation', value: ' '.repeat(60) }, { type: 'challenge' });
    expect(state.challenged).toBe(false);
    state = apply(state, { type: 'text', field: 'interpretation', value: 'A'.repeat(29) }, { type: 'challenge' });
    expect(state.challenged).toBe(false);
    state = apply(state, { type: 'text', field: 'interpretation', value: 'A'.repeat(30) }, { type: 'challenge' }, { type: 'text', field: 'focus', value: 'B'.repeat(24) });
    expect(focusError(state)).not.toBe('');
    state = reducer(state, { type: 'text', field: 'focus', value: 'B'.repeat(25) });
    expect(focusError(state)).toBe('');
  });

  it.each<[string, Action]>([
    ['short action', { type: 'text', field: 'action', value: 'A'.repeat(24) }],
    ['missing owner', { type: 'text', field: 'owner', value: '  ' }],
    ['short implementation measure', { type: 'text', field: 'implementationCheck', value: 'A'.repeat(14) }],
    ['missing learning measure', { type: 'text', field: 'learningCheck', value: ' '.repeat(30) }],
    ['empty agenda segment', { type: 'agenda', index: 2, value: '   ' }],
  ])('rejects %s despite consent', (_name, change) => {
    const state = apply(planDraft(), change, { type: 'consent', value: true });
    expect(planError(state)).not.toBe('');
    expect(hasPlan(reducer(state, { type: 'confirm-plan' }))).toBe(false);
  });

  it('requires both implementation status and substantive reflection', () => {
    let state = reducer(approvedPlan(), { type: 'text', field: 'reflection', value: reflection });
    expect(reflectionError(state)).toMatch(/choose/i);
    state = apply(state, { type: 'implementation', value: 'no' }, { type: 'text', field: 'reflection', value: 'A'.repeat(29) });
    expect(reflectionError(state)).not.toBe('');
    state = reducer(state, { type: 'text', field: 'reflection', value: 'A'.repeat(30) });
    expect(reflectionError(state)).toBe('');
    expect(hasReflection(reducer(state, { type: 'save-reflection' }))).toBe(true);
  });

  it('ignores nonexistent agenda rows and bounds text rather than breaking persistence', () => {
    expect(reducer(planDraft(), { type: 'agenda', index: 6, value: 'Extra row' }).agenda).toHaveLength(6);
    const state = reducer(initialState(), { type: 'text', field: 'interpretation', value: 'x'.repeat(5000) });
    expect(state.interpretation).toHaveLength(4000);
    expect(decodeDraft(encodeDraft(state)).state.interpretation).toHaveLength(4000);
  });
});

describe('versioned draft restore', () => {
  it.each([focusDraft, planDraft, approvedPlan, completed])('roundtrips authored work and its current approvals', factory => {
    const original = factory();
    const restored = decodeDraft(encodeDraft(original));
    expect(restored.state).toEqual(original);
    expect(hasFocus(restored.state)).toBe(hasFocus(original));
    expect(hasPlan(restored.state)).toBe(hasPlan(original));
    expect(hasReflection(restored.state)).toBe(hasReflection(original));
    expect(restored.notice).toMatch(/restored/i);
  });

  it.each(['{broken', 'null', '[]', '{}', '{"version":2,"state":{}}'])('recovers safely from malformed or unsupported storage %s', raw => {
    const result = decodeDraft(raw);
    expect(result.state).toEqual(initialState());
    expect(result.notice).toMatch(/could not be read/i);
  });

  const corruptions: [string, string, unknown][] = [
    ['wrong scalar type', 'interpretation', 7], ['missing base evidence', 'selected', []],
    ['unknown evidence', 'selected', ['assessment', 'invented']], ['duplicate evidence', 'selected', ['assessment', 'assessment']],
    ['wrong list type', 'agenda', 'not an agenda'], ['wrong agenda length', 'agenda', ['Only one']],
    ['wrong agenda item type', 'agenda', ['valid', 'valid', 'valid', 'valid', 'valid', 7]],
    ['unknown lens', 'lens', 'unregistered'], ['unknown confidence', 'confidence', 'certain'],
    ['unknown implementation', 'implementation', 'complete'], ['invalid stage', 'step', 9],
    ['nonboolean consent', 'consent', 'yes'], ['nonstring stamp', 'focusStamp', true],
  ];
  it.each(corruptions)('resets a draft with %s', (_name, key, value) => {
    const envelope = JSON.parse(encodeDraft(completed()));
    envelope.state[key] = value;
    const result = decodeDraft(JSON.stringify(envelope));
    expect(result.state).toEqual(initialState());
    expect(result.notice).toMatch(/could not be read/i);
  });

  it('rejects inconsistent approval while retaining the author\'s draft for review', () => {
    const envelope = JSON.parse(encodeDraft(completed()));
    envelope.state.focus += ' A new unreviewed focus.';
    const result = decodeDraft(JSON.stringify(envelope));
    expect(hasFocus(result.state)).toBe(false);
    expect(hasPlan(result.state)).toBe(false);
    expect(hasReflection(result.state)).toBe(false);
    expect(result.state.reflection).toBe(reflection);
    expect(result.state.step).toBe(1);
    expect(result.state.review).toBe(true);
    expect(result.notice).toMatch(/approval again/i);
  });

  it('does not accept a forged approval string or restore a locked future stage', () => {
    const draft = { ...initialState(), step: 3, focusStamp: 'approved', planStamp: 'approved', reflectionStamp: 'saved' };
    const state = decodeDraft(encodeDraft(draft)).state;
    expect(state.step).toBe(1);
    expect(hasFocus(state)).toBe(false);
    expect(hasPlan(state)).toBe(false);
    expect(hasReflection(state)).toBe(false);
  });

  it('restores the planning stage when focus is valid but the plan is not approved', () => {
    const draft = { ...planDraft(), step: 3 };
    const state = decodeDraft(encodeDraft(draft)).state;
    expect(hasFocus(state)).toBe(true);
    expect(hasPlan(state)).toBe(false);
    expect(state.step).toBe(2);
  });

  it('returns a clean first visit and rejects excessively large storage', () => {
    expect(decodeDraft(null)).toEqual({ state: initialState(), notice: '' });
    const authored = reducer(initialState(), { type: 'text', field: 'interpretation', value: interpretation });
    // Whitespace is legal JSON: rejection must come from the input budget,
    // not a JSON syntax error or an invalid field in the authored draft.
    const oversized = ' '.repeat(2_100_000) + encodeDraft(authored);
    const recovered = decodeDraft(oversized);
    expect(recovered.state).toEqual(initialState());
    expect(recovered.notice).toMatch(/could not be read/i);
  });
});

describe('approved export and reset', () => {
  it('rejects export before approval and after an upstream change', () => {
    expect(() => exportPlan(initialState())).toThrow(/approve/i);
    expect(() => exportPlan(planDraft())).toThrow(/approve/i);
    expect(() => exportPlan(reducer(completed(), { type: 'evidence', id: 'responseC' }))).toThrow(/approve/i);
  });

  it('exports the actual approved evidence, decisions, measures and recorded reflection', () => {
    const text = exportPlan(completed());
    for (const value of [interpretation, focus, actionText, implementationCheck, learningCheck, reflection, 'Grade 4 teaching team', 'Oct 28', 'Sep 9', '50-MINUTE', 'Fictional demonstration']) expect(text).toContain(value);
    expect(text.match(/^\d+ min/gm)).toHaveLength(6);
    expect(text).toContain('does not establish causality');
    expect(text).toContain('Implementation: yes');
  });

  it('excludes a follow-up draft until the educator explicitly saves it', () => {
    const state = apply(approvedPlan(), { type: 'implementation', value: 'partial' }, { type: 'text', field: 'reflection', value: reflection });
    expect(exportPlan(state)).not.toContain(reflection);
    expect(exportPlan(state)).toContain('Not yet recorded');
  });

  it('reset clears all draft inputs and approvals and cannot leak data into a new session', () => {
    const state = reducer(completed(), { type: 'reset' });
    expect(state).toEqual(initialState());
    expect(decodeDraft(encodeDraft(state)).state).toEqual(initialState());
    expect(() => exportPlan(state)).toThrow();
  });
});

// Every field here is within the UI's documented input limit. Approval records
// are part of the saved state, so reload must handle their JSON escaping too.
describe('maximum supported draft persistence', () => {
  const cases: [string, string][] = [
    ['plain text', 'x'.repeat(4000)],
    ['quotation marks', '"'.repeat(4000)],
    ['backslashes', '\\'.repeat(4000)],
    ['JSON-escaped control characters', '\u0000'.repeat(4000)],
    ['mixed text, quotes, newlines and tabs', 'Evidence\n\t"quoted"\\source '.repeat(200).slice(0, 4000)],
  ];

  it.each(cases)('restores all maximum-length fields and approvals with %s', (_name, value) => {
    let original = apply(initialState(),
      { type: 'text', field: 'interpretation', value },
      { type: 'text', field: 'focus', value },
      { type: 'challenge' },
      { type: 'confirm-focus' },
    );
    for (const field of ['action', 'owner', 'implementationCheck', 'learningCheck'] as const) {
      original = reducer(original, { type: 'text', field, value });
    }
    for (let index = 0; index < 6; index++) original = reducer(original, { type: 'agenda', index, value });
    original = apply(original,
      { type: 'consent', value: true },
      { type: 'confirm-plan' },
      { type: 'implementation', value: 'yes' },
      { type: 'text', field: 'reflection', value },
      { type: 'save-reflection' },
    );

    expect(hasFocus(original), 'the maximum-length fixture has explicit focus approval').toBe(true);
    expect(hasPlan(original), 'the maximum-length fixture has explicit plan approval').toBe(true);
    expect(hasReflection(original), 'the maximum-length fixture has a recorded reflection').toBe(true);

    const restored = decodeDraft(encodeDraft(original));
    expect(hasFocus(restored.state), 'reload must retain the approved focus').toBe(true);
    expect(hasPlan(restored.state), 'reload must retain the approved plan').toBe(true);
    expect(hasReflection(restored.state), 'reload must retain the recorded reflection').toBe(true);
    expect(restored.state.step).toBe(3);
    for (const field of ['interpretation', 'focus', 'action', 'owner', 'implementationCheck', 'learningCheck', 'reflection'] as const) {
      expect(original[field]).toHaveLength(4000);
      expect(restored.state[field]).toBe(value);
    }
    expect(restored.state.agenda).toEqual(Array(6).fill(value));
    expect(restored.notice).toMatch(/restored/i);
  });
});
