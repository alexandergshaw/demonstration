import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { createReferenceData } from '../data/seed';
import { hasPlan, initialAgenda, initialState, reducer, type PlanState } from '../model';
import { PlanWorkspace } from './PlanWorkspace';
import { initialPlanActivity, initialPlanStep, planStepForField } from './planBuilder';

function written(): PlanState {
  return reducer({
    ...initialState(),
    interpretation: 'The work raises a question about the meaning of equivalent fractions.',
    focus: 'Help students explain why two fractions can name the same amount.',
    challenged: true,
    action: 'Ask students to draw equivalent amounts and explain what is preserved.',
    owner: 'Grade 4 team',
    implementationCheck: 'Bring a dated record of the teacher prompt and student response.',
    learningCheck: 'Collect independent explanations scored with the shared criteria.',
    agenda: initialAgenda.map((activity, index) => `Activity ${index + 1}: ${activity} Ask colleagues to record their next question.`),
  }, { type: 'confirm-focus' });
}

function render(state: PlanState, extra: { initialCheckEditor?: 'learning'; errorField?: string } = {}) {
  const options = {
    state, reference: createReferenceData(), dispatch: vi.fn(() => true), submit: vi.fn(() => true),
    clearError: vi.fn(), errorField: '', errorAttempt: 0, ...extra,
  };
  const before = structuredClone(state);
  const markup = renderToStaticMarkup(createElement(PlanWorkspace, options));
  expect(state).toEqual(before);
  expect(options.dispatch).not.toHaveBeenCalled();
  expect(options.submit).not.toHaveBeenCalled();
  return markup;
}

describe('meeting plan builder', () => {
  it('resumes the first unfinished required part without approving or rewriting the draft', () => {
    const complete = written();
    expect(initialPlanStep(initialState())).toBe('move');
    expect(initialPlanStep({ ...complete, agenda: [...initialAgenda] })).toBe('activities');
    expect(initialPlanStep({ ...complete, action: 'Short', agenda: complete.agenda.map(() => '') })).toBe('move');
    expect(initialPlanStep({ ...complete, agenda: complete.agenda.map((value, index) => index === 2 ? '' : value) })).toBe('activities');
    expect(initialPlanStep({ ...complete, implementationCheck: '' })).toBe('checks');
    expect(initialPlanStep({ ...complete, learningCheck: '' })).toBe('checks');
    expect(initialPlanStep({ ...complete, collectionDate: '2026-02-30' })).toBe('checks');
    expect(initialPlanStep({ ...complete, collectionDate: '2026-11-05', reviewDate: '2026-11-04' })).toBe('checks');
    expect(initialPlanStep(complete)).toBe('review');
    expect(hasPlan(complete)).toBe(false);
  });

  it('selects the first incomplete activity before starters and preserves direct correction routes', () => {
    const state = written();
    state.agenda[1] = initialAgenda[1];
    state.agenda[4] = 'Ask';
    expect(initialPlanActivity(state)).toBe(4);
    state.agenda[4] = 'Invite the team to record an implementation agreement.';
    expect(initialPlanActivity(state)).toBe(1);
    expect(initialPlanActivity(state, 'agenda-5')).toBe(5);
    expect(initialPlanActivity(state, 'access-participation')).toBe(3);
    expect(initialPlanActivity(written())).toBe(0);
  });

  it('preserves approval and reviews an approved plan even when the team accepted starter activities', () => {
    const state = reducer({ ...written(), agenda: [...initialAgenda], consent: true }, { type: 'confirm-plan' });
    expect(hasPlan(state)).toBe(true);
    expect(initialPlanStep(state)).toBe('review');
    expect(initialPlanStep(state, true)).toBe('checks');
    expect(initialPlanStep(state, false, 'action')).toBe('move');
    expect(hasPlan(state)).toBe(true);
  });

  it('honors direct collection entry and maps validation to the corresponding work area', () => {
    expect(initialPlanStep(initialState(), true)).toBe('checks');
    for (const [field, step] of [
      ['action', 'move'], ['owner', 'move'], ['agenda-3', 'activities'], ['access-participation', 'activities'],
      ['implementation-check', 'checks'], ['learning-check', 'checks'], ['evidence-collector', 'checks'],
      ['collection-date', 'checks'], ['review-date', 'checks'], ['consent', 'review'],
    ]) {
      expect(planStepForField(field)).toBe(step);
      expect(initialPlanStep(written(), false, field)).toBe(step);
    }
    expect(planStepForField('unrelated')).toBeUndefined();
  });

  it('shows the teaching move alone with a back route and preview, keeping sources optional', () => {
    const markup = render(initialState());
    expect(markup).toContain('id="pw-move-panel"');
    expect(markup).not.toContain('id="pw-activities-panel"');
    expect(markup).not.toContain('id="pw-checks-panel"');
    expect(markup).not.toContain('id="pw-review-panel"');
    expect(markup).toContain('id="action"');
    expect(markup).toContain('Back to interpretation');
    expect(markup).toContain('Preview draft meeting kit');
    expect(markup).toContain('<details class="pw-focus-context">');
    expect(markup).not.toContain('Approve meeting plan');
  });

  it('opens only the unfinished activity while preserving the complete outline and starter provenance', () => {
    const state = written();
    state.agenda = [...initialAgenda];
    state.agenda[3] = 'Ask';
    const markup = render(state);
    expect(markup).toContain('id="pw-activities-panel"');
    expect(markup).toContain('id="agenda-3"');
    expect(markup).not.toContain('id="action"');
    expect(markup).not.toContain('id="implementation-check"');
    expect(markup.match(/class="pw-agenda-choice"/g)).toHaveLength(6);
    expect(markup.match(/<span class="pw-agenda-summary">Starter text · /g)).toHaveLength(5);
    expect(markup).toContain('Write activity directions');
  });

  it('keeps the two checks sequential and opens collection editing directly when requested', () => {
    const implementation = render({ ...written(), implementationCheck: '', learningCheck: '' });
    expect(implementation).toContain('id="implementation-check"');
    expect(implementation).not.toContain('id="learning-check"');
    expect(implementation).toContain('Back to meeting activities');
    const collection = render(written(), { initialCheckEditor: 'learning' });
    expect(collection).toContain('id="pw-collection-panel"');
    expect(collection).toContain('id="evidence-collector"');
    expect(collection).not.toContain('id="learning-check"');
    expect(collection).not.toContain('id="implementation-check"');
    expect(collection).toContain('Back to student learning check');
    const learning = render(written(), { errorField: 'learning-check' });
    expect(learning).toContain('id="learning-check"');
    expect(learning).not.toContain('id="evidence-collector"');
    expect(learning).toContain('Back to implementation check');
    expect(render(written(), { errorField: 'implementation-check' })).toContain('id="implementation-check"');
    expect(render(written(), { errorField: 'access-participation' })).toContain('id="access-participation"');
  });

  it('makes the complete draft an inline review with explicit ownership and approval controls', () => {
    const state = written();
    const markup = render(state);
    expect(markup).toContain('id="pw-review-panel"');
    expect(markup).not.toContain('<dialog');
    expect(markup).toContain('Preview draft meeting kit');
    expect(markup).toContain('id="consent"');
    expect(markup).toContain('Approve meeting plan');
    expect(markup).toContain('Back to follow-up checks');
    expect(markup).not.toContain('id="action"');
    expect(markup).not.toContain('id="learning-check"');
    for (const activity of state.agenda) expect(markup).toContain(activity);
    expect(hasPlan(state)).toBe(false);
  });
});
