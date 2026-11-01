import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { createReferenceData } from '../data/seed';
import { focusError, hasFocus, hasPlan, hasReflection, initialAgenda, initialState, reducer, type Action, type PlanState } from '../model';
import { EvidenceWorkspace } from './EvidenceWorkspace';
import { PlanWorkspace } from './PlanWorkspace';
import { ReasoningWorkspace } from './ReasoningWorkspace';
import { ReflectWorkspace } from './ReflectWorkspace';

const apply = (state: PlanState, ...actions: Action[]) => actions.reduce(reducer, state);

function focusDraft() {
  return apply(initialState(),
    { type: 'text', field: 'interpretation', value: 'More students selected a correct fraction than explained why the amounts are equal.' },
    { type: 'challenge' },
    { type: 'text', field: 'focus', value: 'Ask students to explain why partitioning preserves the amount of the same whole.' });
}

function approvedPlan() {
  return apply(focusDraft(),
    { type: 'confirm-focus' },
    { type: 'text', field: 'action', value: 'Ask students to show equal amounts with fraction strips and explain what stays the same.' },
    { type: 'text', field: 'implementationCheck', value: 'Each teacher brings a dated lesson note describing the explanation prompt.' },
    { type: 'text', field: 'learningCheck', value: 'Collect independent explanations with the same task and scoring criteria.' },
    { type: 'consent', value: true },
    { type: 'confirm-plan' });
}

function recordedReflection() {
  return apply(approvedPlan(),
    { type: 'implementation', value: 'no' },
    { type: 'text', field: 'reflection', value: 'The materials were unavailable. The team will prepare fraction strips before the next lesson and review the attempt at the next PLC.' },
    { type: 'save-reflection' });
}

function workspaceProps(state: PlanState, unsaved = false) {
  return {
    state,
    reference: createReferenceData(),
    dispatch: vi.fn((_action: Action) => true),
    submit: vi.fn((_kind: 'focus' | 'plan' | 'reflection') => true),
    clearError: vi.fn(),
    openExamples: vi.fn(),
    errorField: '',
    errorAttempt: 0,
    unsaved,
  };
}

function renderWorkspace(Component: ComponentType<ReturnType<typeof workspaceProps>>, state: PlanState, unsaved = false) {
  const options = workspaceProps(state, unsaved);
  const before = structuredClone({ state, reference: options.reference });
  const markup = renderToStaticMarkup(createElement(Component, options));
  expect({ state, reference: options.reference }).toEqual(before);
  expect(options.dispatch).not.toHaveBeenCalled();
  expect(options.submit).not.toHaveBeenCalled();
  expect(options.clearError).not.toHaveBeenCalled();
  expect(options.openExamples).not.toHaveBeenCalled();
  return markup;
}

// Checklist rows navigate; their statuses distinguish authored drafts from explicit decisions.
function balancedElement(markup: string, start: number, tagName: string) {
  expect(start).toBeGreaterThanOrEqual(0);
  let depth = 0;
  for (const tag of markup.slice(start).matchAll(new RegExp(`<\\/?${tagName}\\b[^>]*>`, 'g'))) {
    depth += tag[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return markup.slice(start, start + tag.index! + tag[0].length);
  }
  throw new Error(`Unclosed ${tagName} element`);
}

function checklist(markup: string, title: string, current: string, count: string) {
  const start = markup.indexOf('<section class="stage-checklist"');
  expect(start).toBeGreaterThanOrEqual(0);
  const nav = balancedElement(markup, start, 'section');
  expect(nav).toContain(`>${title}</h2>`);
  expect(nav).toContain(`${count} core tasks checked`);
  expect(nav.match(/aria-current="step"/g)).toHaveLength(1);
  expect(item(nav, current)).toContain('aria-current="step"');
  const rowButtons = nav.match(/<button\b[^>]*class="stage-checklist-task"[^>]*>/g) ?? [];
  expect(rowButtons.length).toBeGreaterThan(0);
  for (const button of rowButtons) expect(button).not.toContain('disabled=');
  expect(nav).not.toContain('role="progressbar"');
  expect(nav).not.toContain('aria-live=');
  return nav;
}

function button(markup: string, label: string) {
  const control = markup.match(/<button\b[^>]*>[\s\S]*?<\/button>/g)?.find(candidate => candidate.includes(label));
  expect(control).toBeDefined();
  return control!;
}

function reflectionStatus(markup: string) {
  const status = markup.match(/<p class="reflect-draft-status">([\s\S]*?)<\/p>/)?.[1];
  expect(status).toBeDefined();
  return status!;
}

function activityOutline(markup: string) {
  const start = markup.indexOf('<ol class="pw-agenda-list">');
  expect(start).toBeGreaterThanOrEqual(0);
  return markup.slice(start, markup.indexOf('</ol>', start) + '</ol>'.length);
}

function item(markup: string, id: string) {
  const start = markup.indexOf(`<li data-task="${id}"`);
  expect(start).toBeGreaterThanOrEqual(0);
  return balancedElement(markup, start, 'li');
}

describe('guided progress distinguishes navigation, drafts, approvals and saving', () => {
  it('requires explicit source acknowledgments, keeps optional work separate, and permits direct interpretation', () => {
    const state = initialState();
    const markup = renderWorkspace(EvidenceWorkspace, state);
    const guidance = checklist(markup, 'Evidence checklist', 'results', '0 of 3');
    expect(guidance.match(/data-task=/g)).toHaveLength(5);
    for (const id of ['results', 'task', 'classes', 'work', 'selection']) expect(item(guidance, id)).toContain('data-status="todo"');
    for (const id of ['classes', 'work']) expect(item(guidance, id)).toContain('Optional ·');
    for (const id of ['results', 'task', 'selection']) expect(item(guidance, id)).not.toContain('Optional ·');
    expect(guidance).toContain('Mark each review yourself in its work area.');
    expect(guidance).toContain('You can continue without checking every task.');
    expect(markup).toContain('I reviewed the results and their limits.');
    expect(markup).not.toMatch(/<input type="checkbox"[^>]*checked=/);
    expect(state.evidenceReviewed).toEqual([]);
    expect(button(markup, 'Continue to interpretation')).not.toContain('disabled=');
    expect(button(markup, 'Interpret the evidence')).not.toContain('disabled=');
    expect(markup).toContain('Continuing does not confirm an interpretation.');
    expect(state.selected).toEqual(['assessment']);
    expect(reducer(state, { type: 'go', step: 1 }).step).toBe(1);
  });

  it('requires explicit focus confirmation and removes approval status after a confirmed focus changes', () => {
    const draft = focusDraft();
    expect(focusError(draft)).toBe('');
    expect(hasFocus(draft)).toBe(false);
    const draftMarkup = renderWorkspace(ReasoningWorkspace, draft);
    const draftChecklist = checklist(draftMarkup, 'Interpretation checklist', 'confirm', '3 of 4');
    expect(item(draftChecklist, 'confirm')).toContain('data-status="todo"');
    expect(button(draftMarkup, 'Confirm focus &amp; continue')).not.toContain('disabled=');
    expect(draftMarkup).not.toContain('Focus confirmed by you');

    const approved = approvedPlan();
    expect(hasPlan(approved)).toBe(true);
    expect(renderWorkspace(ReasoningWorkspace, approved)).toContain('Focus confirmed by you.');
    const approvedMarkup = renderWorkspace(PlanWorkspace, approved);
    const approvedChecklist = checklist(approvedMarkup, 'Plan checklist', 'review', '5 of 5');
    expect(item(approvedChecklist, 'review')).toContain('Approved by you');
    expect(approvedMarkup).toContain('Current approved plan');
    const edited = reducer(approved, { type: 'text', field: 'focus', value: 'Use student drawings to explain equal amounts before naming an equivalence rule.' });
    expect(hasFocus(edited)).toBe(false);
    expect(hasPlan(edited)).toBe(false);
    const reasoningMarkup = renderWorkspace(ReasoningWorkspace, edited);
    expect(item(checklist(reasoningMarkup, 'Interpretation checklist', 'confirm', '3 of 4'), 'confirm')).toContain('data-status="todo"');
    expect(reasoningMarkup).not.toContain('Focus confirmed by you');
    expect(reasoningMarkup).toContain('Confirm focus &amp; continue');
    const planMarkup = renderWorkspace(PlanWorkspace, edited);
    expect(planMarkup).toContain('The teaching focus needs confirmation before this plan can be approved.');
    expect(planMarkup).toContain('Reconfirm the focus');
    expect(planMarkup).not.toContain('Current approved plan');
    expect(planMarkup).not.toContain('Your confirmed focus &amp; sources');
  });

  it('identifies supplied agenda starters without treating them as authored or approved directions', () => {
    const state = apply(focusDraft(),
      { type: 'confirm-focus' },
      { type: 'text', field: 'action', value: 'Ask students to show equal amounts with fraction strips and explain what stays the same.' });
    expect(state.agenda).toEqual(initialAgenda);
    const markup = renderWorkspace(PlanWorkspace, state);
    const guidance = checklist(markup, 'Plan checklist', 'activities', '1 of 5');
    expect(item(guidance, 'activities')).toContain('data-status="started"');
    expect(item(guidance, 'activities')).toContain('0 of 6 adapted · review starters');
    expect(item(guidance, 'collection')).toContain('Optional ·');
    expect(activityOutline(markup).match(/Starter text · /g)).toHaveLength(6);
    expect(markup).toContain('<strong>Starter text.</strong> Review and adapt these directions for your team.');
    expect(markup).toContain('Review all six before approving your plan.');
    expect(markup).not.toContain('Current approved plan');
    expect(hasPlan(state)).toBe(false);
    const edited = reducer(state, { type: 'agenda', index: 0, value: 'Ask pairs to explain the learning goal, then record a question about the selected work.' });
    const editedMarkup = renderWorkspace(PlanWorkspace, edited);
    const outline = activityOutline(editedMarkup);
    expect(outline.match(/Starter text · /g)).toHaveLength(5);
    expect(outline).toContain(edited.agenda[0]);
    const firstActivity = outline.slice(outline.indexOf('<li>'), outline.indexOf('</li>'));
    expect(firstActivity).not.toContain('Starter text');
    expect(editedMarkup).not.toContain('Current approved plan');
    expect(hasPlan(edited)).toBe(false);
  });

  it('accepts not-yet-used as a report without claiming implementation or student learning', () => {
    const state = reducer(approvedPlan(), { type: 'implementation', value: 'no' });
    const markup = renderWorkspace(ReflectWorkspace, state);
    const guidance = checklist(markup, 'Reflect checklist', 'next-step', '1 of 3');
    expect(item(guidance, 'attempt')).toContain('>Reported</span>');
    expect(item(guidance, 'record')).toContain('data-status="todo"');
    expect(item(guidance, 'question')).toContain('Optional ·');
    expect(reflectionStatus(markup)).toBe('Draft reflection · record your decision when ready');
    expect(markup).toContain('Used, partly used and not yet used are equally valid reports.');
    expect(markup).toContain('this does not record the reflection yet.');
    expect(markup).toContain('Recording a next step does not establish student improvement.');
    expect(markup).toContain('<strong>Teaching attempt:</strong> Not yet used.');
    expect(button(markup, 'Write your next step')).not.toContain('disabled=');
    expect(markup).toContain('The move has not been tested yet.');
    expect(markup).toContain('Follow-up evidence is not available yet.');
    expect(hasReflection(state)).toBe(false);
  });

  it('requires recording again when a previously recorded reflection is edited', () => {
    const recorded = recordedReflection();
    expect(hasReflection(recorded)).toBe(true);
    const recordedMarkup = renderWorkspace(ReflectWorkspace, recorded);
    expect(item(checklist(recordedMarkup, 'Reflect checklist', 'record', '3 of 3'), 'record')).toContain('data-status="done"');
    expect(reflectionStatus(recordedMarkup)).toBe('Next step recorded');
    expect(button(recordedMarkup, 'Reflection recorded')).toContain('disabled=');
    const edited = reducer(recorded, { type: 'text', field: 'reflection', value: `${recorded.reflection} The facilitator will bring the materials on Monday.` });
    expect(hasReflection(edited)).toBe(false);
    const markup = renderWorkspace(ReflectWorkspace, edited);
    expect(item(checklist(markup, 'Reflect checklist', 'record', '2 of 3'), 'record')).toContain('data-status="todo"');
    expect(reflectionStatus(markup)).toBe('Draft reflection · record your decision when ready');
    expect(markup).not.toContain('Next step recorded');
    expect(markup).not.toContain('Your next decision is recorded');
    expect(markup).not.toContain('Reflection recorded with this plan.');
    expect(button(markup, 'Record next step')).not.toContain('disabled=');
  });

  it('distinguishes an in-memory recorded reflection from a successful browser save', () => {
    const state = recordedReflection();
    const markup = renderWorkspace(ReflectWorkspace, state, true);
    expect(hasReflection(state)).toBe(true);
    const guidance = checklist(markup, 'Reflect checklist', 'record', '2 of 3');
    expect(item(guidance, 'record')).toContain('data-status="started"');
    expect(item(guidance, 'record')).toContain('Save pending');
    expect(reflectionStatus(markup)).toBe('Recorded in this draft · save pending');
    expect(reflectionStatus(markup)).not.toContain('Next step recorded');
    expect(markup).toContain('Changes are not saved. Retry saving before leaving this browser.');
    expect(markup).not.toContain('Reflection recorded with this plan.');
    expect(button(markup, 'Record next step')).not.toContain('disabled=');
  });
});
