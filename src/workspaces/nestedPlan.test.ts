import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { createReferenceData } from '../data/seed';
import { hasPlan, initialState, reducer, type PlanState } from '../model';
import { MeetingReady } from './MeetingReady';
import { PlanWorkspace, type PlanTaskEntry } from './PlanWorkspace';

function approvedPlan(): PlanState {
  const focused = reducer({ ...initialState(), interpretation: 'The assessment raises a question about how students explain equivalent fractions.', challenged: true,
    focus: 'Help students explain how equal amounts remain equal when partitioned.', action: 'Ask students to show equal amounts and explain what partitioning preserves.',
    implementationCheck: 'Bring dated lesson notes showing the teacher question and student response.', learningCheck: 'Collect comparable student explanations scored with shared criteria.' }, { type: 'confirm-focus' });
  return reducer({ ...focused, consent: true }, { type: 'confirm-plan' });
}

function row(html: string, id: string) {
  const start = html.indexOf(`<li data-task="${id}"`);
  expect(start).toBeGreaterThanOrEqual(0);
  let depth = 0;
  for (const tag of html.slice(start).matchAll(/<\/?li\b[^>]*>/g)) {
    depth += tag[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return html.slice(start, start + tag.index! + tag[0].length);
  }
  throw new Error('Unclosed checklist row');
}

describe('nested plan task actions', () => {
  it('names the reflection destination on both unchanged and edited collection-return paths', () => {
    const approved = approvedPlan();
    const edited = reducer(approved, { type: 'text', field: 'evidenceCollector', value: 'Grade four team' });
    for (const [state, label] of [[approved, 'Return to reflection'], [edited, 'Approve and return to reflection']] as const) {
      const html = renderToStaticMarkup(createElement(PlanWorkspace, { state, reference: createReferenceData(), dispatch: vi.fn(() => true), submit: vi.fn(() => true), clearError: vi.fn(), errorField: '', errorAttempt: 0, initialTask: 'review', returnToReflection: true, onReturnToApproved: vi.fn() }));
      expect(row(html, 'review')).toContain(label);
      expect(html).toContain('Your reflection writing is preserved.');
    }
  });

  it.each([
    ['move', 'action', 'Teaching move actions'],
    ['activities', 'agenda-0', 'Meeting activity actions'],
    ['implementation', 'implementation-check', 'Implementation check actions'],
    ['learning', 'learning-check', 'Student learning check actions'],
    ['review', 'consent', 'Meeting plan approval'],
  ] as const)('keeps %s fields and actions directly within their parent checklist row', (initialTask, field, actions) => {
    const state = approvedPlan();
    const before = structuredClone(state);
    const dispatch = vi.fn(() => true), submit = vi.fn(() => true);
    const html = renderToStaticMarkup(createElement(PlanWorkspace, { state, reference: createReferenceData(), dispatch, submit, clearError: vi.fn(), errorField: '', errorAttempt: 0, initialTask: initialTask as PlanTaskEntry }));
    const parent = row(html, initialTask);
    expect(parent).toContain(`data-task-content="${initialTask}"`);
    expect(parent).toContain(`id="${field}"`);
    expect(parent).toContain(`aria-label="${actions}"`);
    expect(parent.indexOf('class="stage-checklist-task"')).toBeLessThan(parent.indexOf('class="stage-checklist-content"'));
    expect(parent).not.toMatch(/data-task-content="[^"]+"[^>]* hidden/);
    expect(html.match(new RegExp(`id="${field}"`, 'g'))).toHaveLength(1);
    expect(state).toEqual(before);
    expect(hasPlan(state)).toBe(true);
    expect(dispatch).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
  });

  it('puts optional collection controls under collection rather than beneath the learning check', () => {
    const state = approvedPlan();
    const html = renderToStaticMarkup(createElement(PlanWorkspace, { state, reference: createReferenceData(), dispatch: vi.fn(() => true), submit: vi.fn(() => true), clearError: vi.fn(), errorField: '', errorAttempt: 0, initialCheckEditor: 'learning' }));
    const collection = row(html, 'collection');
    for (const field of ['evidence-collector', 'collection-date', 'review-date']) expect(collection).toContain(`id="${field}"`);
    expect(collection).toContain('aria-label="Collection arrangement actions"');
    expect(collection).toContain('These arrangements are optional');
    expect(row(html, 'learning')).not.toContain('id="evidence-collector"');
    expect(hasPlan(state)).toBe(true);
  });

  it('nests approved-task edit actions and the kit action under their own completed rows', () => {
    const callbacks = { onOpenKit: vi.fn(), onEditPlan: vi.fn(), onEditTask: vi.fn(), onReflect: vi.fn(), onEditCollection: vi.fn() };
    const html = renderToStaticMarkup(createElement(MeetingReady, { state: approvedPlan(), ...callbacks }));
    for (const [id, action] of [
      ['move', 'Edit teaching move and owner'], ['activities', 'Edit meeting activities'], ['implementation', 'Edit implementation check'],
      ['learning', 'Edit student learning check'], ['collection', 'Edit collection details'], ['review', 'Open meeting kit'],
    ]) expect(row(html, id)).toContain(action);
    expect(html.match(/>Open meeting kit</g)).toHaveLength(1);
    for (const callback of Object.values(callbacks)) expect(callback).not.toHaveBeenCalled();
  });
});
