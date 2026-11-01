import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { hasReflection, initialState, reducer, type Action, type PlanState } from '../model';
import { ReflectWorkspace } from './ReflectWorkspace';

const apply = (state: PlanState, ...actions: Action[]) => actions.reduce(reducer, state);
function approvedPlan() {
  return apply(initialState(),
    { type: 'text', field: 'interpretation', value: 'Correct fractions are more common than explanations of equal amounts of the same whole.' },
    { type: 'challenge' },
    { type: 'text', field: 'focus', value: 'Help students explain why partitioning preserves the same amount.' },
    { type: 'confirm-focus' },
    { type: 'text', field: 'action', value: 'Ask students to draw two equivalent fractions and explain the equal amounts.' },
    { type: 'text', field: 'implementationCheck', value: 'Bring a dated note describing the prompt and student response.' },
    { type: 'text', field: 'learningCheck', value: 'Collect independent explanations with a comparable task and rubric.' },
    { type: 'consent', value: true },
    { type: 'confirm-plan' });
}
function render(state: PlanState, unsaved = false) {
  const before = structuredClone(state);
  const callbacks = { dispatch: vi.fn(() => true), submit: vi.fn(() => true), openExamples: vi.fn(), onEditCollection: vi.fn(), onOpenRecord: vi.fn(), onBackToPlan: vi.fn() };
  const markup = renderToStaticMarkup(createElement(ReflectWorkspace, { state, unsaved, errorField: '', errorAttempt: 0, ...callbacks }));
  expect(state).toEqual(before);
  for (const callback of Object.values(callbacks)) expect(callback).not.toHaveBeenCalled();
  return markup;
}
function panelTag(markup: string, id: string) {
  const tag = markup.match(new RegExp(`<section id="${id}"[^>]*>`))?.[0];
  expect(tag).toBeDefined();
  return tag!;
}

describe('guided reflection builder', () => {
  it('opens only the teaching-attempt task when no implementation has been reported, preserving unfinished next-step writing', () => {
    const state = { ...approvedPlan(), reflection: 'Unfinished next action retained for later.' };
    const markup = render(state);
    expect(markup).toContain('Reflect checklist');
    expect(markup).toMatch(/<li data-task="attempt" data-status="todo"><button[^>]*aria-current="step"/);
    expect(markup).toContain('1 of 3 core tasks checked');
    expect(panelTag(markup, 'reflect-attempt-panel')).not.toContain('hidden=');
    expect(panelTag(markup, 'reflect-next-panel')).toContain('hidden=""');
    expect(markup).toContain('Report implementation first');
    expect(markup).toContain(state.reflection);
    expect(markup).not.toContain('aria-label="Step progress"');
    expect(hasReflection(state)).toBe(false);
  });

  it.each([
    ['yes', 'Used as planned', 'Comparable student work is still needed.'],
    ['partial', 'Partially used', 'Record what was tried and what was different'],
    ['no', 'Not yet used', 'The move has not been tested yet.'],
  ] as const)('resumes the next-step task for %s without recording or inventing a learning outcome', (implementation, label, boundary) => {
    const state = reducer(approvedPlan(), { type: 'implementation', value: implementation });
    const markup = render(state);
    expect(markup).toMatch(/<li data-task="next-step" data-status="todo"><button[^>]*aria-current="step"/);
    expect(markup).toContain('1 of 3 core tasks checked');
    expect(panelTag(markup, 'reflect-attempt-panel')).toContain('hidden=""');
    expect(panelTag(markup, 'reflect-next-panel')).not.toContain('hidden=');
    expect(markup).toContain(`<strong>Teaching attempt:</strong> ${label}.`);
    expect(markup).toContain(boundary);
    expect(markup).toContain('Recording a next step does not establish student improvement.');
    expect(markup).toContain('Back to teaching attempt');
    expect(markup).not.toContain('View your decision record');
    expect(hasReflection(state)).toBe(false);
  });

  it('keeps the same closed collection reference available outside both task panels', () => {
    for (const implementation of ['', 'no'] as const) {
      const markup = render({ ...approvedPlan(), implementation });
      expect(markup).toContain('<details class="reflect-collection-disclosure">');
      expect(markup).not.toContain('<details class="reflect-collection-disclosure" open');
      expect(markup.match(/id="reflect-collection"/g)).toHaveLength(1);
      expect(markup.indexOf('id="reflect-collection"')).toBeLessThan(markup.indexOf('id="reflect-attempt-panel"'));
      expect(markup).toContain('Edit collection details');
      expect(markup).toContain('Your reflection draft stays available.');
    }
  });

  it('offers the decision record only after a current saved recording and keeps an unsaved draft explicit', () => {
    const state = apply(approvedPlan(),
      { type: 'implementation', value: 'no' },
      { type: 'text', field: 'reflection', value: 'The materials were unavailable. The team will prepare them before trying the move next week.' },
      { type: 'save-reflection' });
    expect(hasReflection(state)).toBe(true);
    const markup = render(state);
    expect(markup.match(/id="reflect-record"/g)).toHaveLength(1);
    expect(markup).toContain('<span>View your decision record</span>');
    const unsaved = render(state, true);
    expect(unsaved).toContain('Recorded in this draft · save pending');
    expect(unsaved).toContain('Changes are not saved. Retry saving before leaving this browser.');
    expect(unsaved).toContain('<span>Record next step</span>');
    expect(unsaved).not.toContain('View your decision record');
  });
});
