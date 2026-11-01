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

// Task position is navigation, not a completion or approval score.
function navigation(markup: string, label: string, current: string, position: string) {
  const start = markup.indexOf(`<nav class="builder-navigation" aria-label="${label}">`);
  expect(start).toBeGreaterThanOrEqual(0);
  const nav = markup.slice(start, markup.indexOf('</nav>', start) + '</nav>'.length);
  expect(nav).toContain(`Task ${position}`);
  expect(nav.match(/aria-current="step"/g)).toHaveLength(1);
  const currentButton = nav.match(/<button\b[^>]*aria-current="step"[^>]*>[\s\S]*?<\/button>/)?.[0];
  expect(currentButton).toContain(current);
  expect(nav).not.toContain('disabled=');
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

function item(markup: string, label: string) {
  const start = markup.indexOf(label);
  expect(start).toBeGreaterThanOrEqual(0);
  return markup.slice(markup.lastIndexOf('<li>', start), markup.indexOf('</li>', start));
}

describe('guided progress distinguishes navigation, drafts, approvals and saving', () => {
  it('separates optional source opening from task position and permits direct interpretation', () => {
    const state = initialState();
    const markup = renderWorkspace(EvidenceWorkspace, state);
    navigation(markup, 'Evidence review tasks', 'Assessment', '1 of 3');
    const start = markup.indexOf('<details class="evidence-inspection-history">');
    expect(start).toBeGreaterThanOrEqual(0);
    const guidance = markup.slice(start, markup.indexOf('</details>', start));
    expect(guidance).toContain('Source views opened · 1 of 4 this visit');
    expect(item(guidance, 'Compare the results')).toContain('>Opened</span>');
    expect(item(guidance, 'Check the task and scoring')).toContain('>Available</span>');
    expect(guidance).toContain('not a record that you reviewed a source');
    expect(guidance).toContain('You can interpret without opening every view; selecting work is optional.');
    expect(guidance).toContain('This visit count resets when you leave Evidence.');
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
    navigation(draftMarkup, 'Reasoning sequence', 'Choose a focus', '3 of 3');
    expect(button(draftMarkup, 'Confirm focus &amp; continue')).not.toContain('disabled=');
    expect(draftMarkup).not.toContain('Focus confirmed by you');

    const approved = approvedPlan();
    expect(hasPlan(approved)).toBe(true);
    expect(renderWorkspace(ReasoningWorkspace, approved)).toContain('Focus confirmed by you.');
    const approvedMarkup = renderWorkspace(PlanWorkspace, approved);
    navigation(approvedMarkup, 'Meeting plan tasks', 'Review &amp; approve', '4 of 4');
    expect(approvedMarkup).toContain('Current approved plan');
    const edited = reducer(approved, { type: 'text', field: 'focus', value: 'Use student drawings to explain equal amounts before naming an equivalence rule.' });
    expect(hasFocus(edited)).toBe(false);
    expect(hasPlan(edited)).toBe(false);
    const reasoningMarkup = renderWorkspace(ReasoningWorkspace, edited);
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
    navigation(markup, 'Meeting plan tasks', 'Meeting activities', '2 of 4');
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
    navigation(markup, 'Reflection tasks', 'Next step', '2 of 2');
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
    expect(reflectionStatus(recordedMarkup)).toBe('Next step recorded');
    expect(button(recordedMarkup, 'Reflection recorded')).toContain('disabled=');
    const edited = reducer(recorded, { type: 'text', field: 'reflection', value: `${recorded.reflection} The facilitator will bring the materials on Monday.` });
    expect(hasReflection(edited)).toBe(false);
    const markup = renderWorkspace(ReflectWorkspace, edited);
    navigation(markup, 'Reflection tasks', 'Next step', '2 of 2');
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
    expect(reflectionStatus(markup)).toBe('Recorded in this draft · save pending');
    expect(reflectionStatus(markup)).not.toContain('Next step recorded');
    expect(markup).toContain('Changes are not saved. Retry saving before leaving this browser.');
    expect(markup).not.toContain('Reflection recorded with this plan.');
    expect(button(markup, 'Record next step')).not.toContain('disabled=');
  });
});
