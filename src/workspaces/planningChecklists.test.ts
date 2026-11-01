import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { createReferenceData } from '../data/seed';
import { hasPlan, hasReflection, initialAgenda, initialState, reducer, type PlanState } from '../model';
import { MeetingReady } from './MeetingReady';
import { PlanWorkspace, type PlanTaskEntry } from './PlanWorkspace';
import { ReflectWorkspace } from './ReflectWorkspace';
import { planChecklistItems } from './planChecklist';

function writtenPlan(): PlanState {
  return reducer({
    ...initialState(), interpretation: 'The work raises a question about what equivalent fractions mean.', challenged: true,
    focus: 'Help students explain why partitioning preserves an amount of the same whole.',
    action: 'Ask students to show equal amounts with fraction strips and explain what stays the same.', owner: 'Grade four team',
    implementationCheck: 'Bring a dated lesson note describing the teacher prompt and student response.',
    learningCheck: 'Collect independent explanations scored with the shared criteria.',
  }, { type: 'confirm-focus' });
}
function approvedPlan() { return reducer({ ...writtenPlan(), consent: true }, { type: 'confirm-plan' }); }
function checklistRow(markup: string, id: string) {
  const row = markup.match(new RegExp(`<li data-task="${id}"[^>]*>[\\s\\S]*?<\\/li>`))?.[0];
  expect(row).toBeDefined();
  return row!;
}
function callbacks() { return { move: vi.fn(), activities: vi.fn(), implementation: vi.fn(), learning: vi.fn(), collection: vi.fn(), review: vi.fn() }; }

describe('planning and reflection task checklists', () => {
  it('checks present draft writing without marking supplied activity starters or approval complete', () => {
    const state = writtenPlan();
    const before = structuredClone(state);
    const actions = callbacks();
    const items = planChecklistItems(state, actions);
    expect(items.filter(item => item.status === 'done').map(item => item.id)).toEqual(['move', 'implementation', 'learning']);
    expect(items.find(item => item.id === 'activities')).toMatchObject({ status: 'started', statusLabel: '0 of 6 adapted · review starters' });
    expect(items.find(item => item.id === 'review')).toMatchObject({ status: 'todo', statusLabel: 'Awaiting approval' });
    expect(items.find(item => item.id === 'collection')).toMatchObject({ optional: true, status: 'todo' });
    expect(state).toEqual(before);
    for (const callback of Object.values(actions)) expect(callback).not.toHaveBeenCalled();
    items.find(item => item.id === 'learning')!.onSelect();
    expect(actions.learning).toHaveBeenCalledOnce();
    expect(hasPlan(state)).toBe(false);
  });

  it('counts adapted directions as drafted and current approval as an explicit review of accepted starters', () => {
    const blank = { ...writtenPlan(), agenda: initialAgenda.map(() => '') };
    expect(planChecklistItems(blank, callbacks()).find(item => item.id === 'activities')).toMatchObject({ status: 'todo', statusLabel: 'Not drafted' });
    const incomplete = { ...writtenPlan(), agenda: initialAgenda.map((value, index) => index === 0 ? 'Ask' : value) };
    expect(planChecklistItems(incomplete, callbacks()).find(item => item.id === 'activities')).toMatchObject({ status: 'started', statusLabel: '0 of 6 adapted · add directions' });
    const drafted = { ...writtenPlan(), agenda: initialAgenda.map(activity => `${activity} Have colleagues record an evidence-based question.`) };
    expect(planChecklistItems(drafted, callbacks()).find(item => item.id === 'activities')).toMatchObject({ status: 'done', statusLabel: 'Drafted' });
    const approved = approvedPlan();
    expect(hasPlan(approved)).toBe(true);
    const approvedItems = planChecklistItems(approved, callbacks());
    expect(approvedItems.filter(item => !item.optional).every(item => item.status === 'done')).toBe(true);
    expect(approvedItems.find(item => item.id === 'activities')?.statusLabel).toBe('Reviewed in approved plan');
    const edited = reducer(approved, { type: 'text', field: 'action', value: 'Ask students to draw equivalent amounts and explain what is preserved.' });
    expect(planChecklistItems(edited, callbacks()).find(item => item.id === 'review')).toMatchObject({ status: 'todo', statusLabel: 'Awaiting approval' });
    expect(planChecklistItems(edited, callbacks()).find(item => item.id === 'activities')?.status).toBe('started');
  });

  it('keeps incomplete collection arrangements optional and identifies invalid entered dates', () => {
    const state = writtenPlan();
    const partial = planChecklistItems({ ...state, evidenceCollector: 'Team lead' }, callbacks()).find(item => item.id === 'collection');
    expect(partial).toMatchObject({ optional: true, status: 'started', statusLabel: 'Partly arranged' });
    const invalid = planChecklistItems({ ...state, collectionDate: '2026-02-30' }, callbacks()).find(item => item.id === 'collection');
    expect(invalid).toMatchObject({ optional: true, status: 'started', statusLabel: 'Check dates' });
    const ready = planChecklistItems({ ...state, evidenceCollector: 'Team lead', collectionDate: '2026-11-05', reviewDate: '2026-11-09' }, callbacks()).find(item => item.id === 'collection');
    expect(ready).toMatchObject({ optional: true, status: 'done', statusLabel: 'Planned' });
  });

  it('shows the same checklist on the draft and approved Plan landings without rendering an extra task navigator', () => {
    const state = writtenPlan();
    const callbacks = { dispatch: vi.fn(() => true), submit: vi.fn(() => true), clearError: vi.fn() };
    const markup = renderToStaticMarkup(createElement(PlanWorkspace, { state, reference: createReferenceData(), errorField: '', errorAttempt: 0, ...callbacks }));
    expect(markup).toContain('Plan checklist');
    expect(markup).toContain('3 of 5 core tasks checked');
    expect(markup).not.toContain('class="builder-navigation"');
    expect(checklistRow(markup, 'review')).toContain('data-status="todo"');
    for (const callback of Object.values(callbacks)) expect(callback).not.toHaveBeenCalled();
    const readyActions = { onOpenKit: vi.fn(), onEditPlan: vi.fn(), onReflect: vi.fn(), onEditCollection: vi.fn() };
    const ready = renderToStaticMarkup(createElement(MeetingReady, { state: approvedPlan(), ...readyActions }));
    expect(ready).toContain('Plan checklist');
    expect(ready).toContain('5 of 5 core tasks checked');
    expect(checklistRow(ready, 'collection')).toContain('Optional');
    expect(ready).toContain('does not report that the meeting or lesson has happened');
    for (const callback of Object.values(readyActions)) expect(callback).not.toHaveBeenCalled();
  });

  it('checks a not-yet-used report and draft writing while leaving recording and optional questions distinct', () => {
    const state = { ...approvedPlan(), implementation: 'no' as const, reflection: 'The materials were unavailable. The team lead will prepare them before the next lesson and review the attempt at the following PLC.' };
    const options = { state, dispatch: vi.fn(() => true), submit: vi.fn(() => true), errorField: '', errorAttempt: 0, openExamples: vi.fn() };
    const markup = renderToStaticMarkup(createElement(ReflectWorkspace, options));
    expect(markup).toContain('2 of 3 core tasks checked');
    expect(checklistRow(markup, 'attempt')).toContain('data-status="done"');
    expect(checklistRow(markup, 'attempt')).toContain('Reported');
    expect(checklistRow(markup, 'next-step')).toContain('Drafted');
    expect(checklistRow(markup, 'record')).toContain('Ready to record');
    expect(checklistRow(markup, 'record')).toContain('data-status="todo"');
    expect(checklistRow(markup, 'question')).toContain('Optional');
    expect(markup).toContain('no collected follow-up dataset');
    expect(hasReflection(state)).toBe(false);
    expect(options.dispatch).not.toHaveBeenCalled();
    expect(options.submit).not.toHaveBeenCalled();
  });

  it('opens each approved-plan checklist destination without revoking approval, with collection and validation taking precedence', () => {
    const state = approvedPlan();
    const before = structuredClone(state);
    const options = { state, reference: createReferenceData(), dispatch: vi.fn(() => true), submit: vi.fn(() => true), clearError: vi.fn(), errorField: '', errorAttempt: 0 };
    for (const [initialTask, panel, field] of [
      ['move', 'pw-move-panel', 'action'], ['activities', 'pw-activities-panel', 'agenda-0'],
      ['implementation', 'pw-checks-panel', 'implementation-check'], ['learning', 'pw-checks-panel', 'learning-check'], ['review', 'pw-review-panel', 'consent'],
    ] as [PlanTaskEntry, string, string][]) {
      const markup = renderToStaticMarkup(createElement(PlanWorkspace, { ...options, initialTask }));
      expect(markup).toContain(`id="${panel}"`);
      expect(markup).toContain(`id="${field}"`);
      expect(hasPlan(state)).toBe(true);
    }
    const collection = renderToStaticMarkup(createElement(PlanWorkspace, { ...options, initialTask: 'move', initialCheckEditor: 'learning' }));
    expect(collection).toContain('id="evidence-collector"');
    expect(collection).not.toContain('id="action"');
    const correction = renderToStaticMarkup(createElement(PlanWorkspace, { ...options, initialTask: 'move', errorField: 'learning-check' }));
    expect(correction).toContain('id="learning-check"');
    expect(correction).not.toContain('id="action"');
    expect(state).toEqual(before);
    expect(options.dispatch).not.toHaveBeenCalled();
    expect(options.submit).not.toHaveBeenCalled();
  });

  it('checks recording only while the reflection is current and saved', () => {
    const state = reducer({ ...approvedPlan(), implementation: 'yes', reflection: 'The routine was tried. We need comparable explanations before judging learning, so the team will collect them before the next PLC.' }, { type: 'save-reflection' });
    expect(hasReflection(state)).toBe(true);
    const render = (current: PlanState, unsaved = false) => renderToStaticMarkup(createElement(ReflectWorkspace, { state: current, unsaved, dispatch: vi.fn(() => true), submit: vi.fn(() => true), errorField: '', errorAttempt: 0, openExamples: vi.fn() }));
    expect(checklistRow(render(state), 'record')).toContain('data-status="done"');
    expect(checklistRow(render(state, true), 'record')).toContain('data-status="started"');
    expect(checklistRow(render(state, true), 'record')).toContain('Save pending');
    const edited = reducer(state, { type: 'text', field: 'reflection', value: `${state.reflection} The collector is the team lead.` });
    expect(checklistRow(render(edited), 'record')).toContain('data-status="todo"');
  });
});
