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

// Scope assertions to the accessible progress section, so unrelated guidance cannot mask a regression.
function progress(markup: string) {
  const label = markup.indexOf('aria-label="Step progress"');
  expect(label).toBeGreaterThanOrEqual(0);
  const section = markup.slice(markup.lastIndexOf('<section', label), markup.indexOf('</section>', label) + '</section>'.length);
  expect(section).not.toContain('role="progressbar"');
  expect(section).not.toContain('aria-live=');
  return section;
}

function item(markup: string, label: string) {
  const start = markup.indexOf(label);
  expect(start).toBeGreaterThanOrEqual(0);
  return markup.slice(markup.lastIndexOf('<li>', start), markup.indexOf('</li>', start));
}

describe('guided progress distinguishes navigation, drafts, approvals and saving', () => {
  it('counts evidence places opened, keeps selection optional and permits direct interpretation', () => {
    const state = initialState();
    const markup = renderWorkspace(EvidenceWorkspace, state);
    const guidance = progress(markup);
    expect(guidance).toContain('1 of 4 places opened this visit');
    expect(item(guidance, 'Compare the results')).toContain('>Opened</span>');
    expect(item(guidance, 'Check the task and scoring')).toContain('>Available</span>');
    expect(guidance).toContain('not a record that you reviewed a source');
    expect(guidance).toContain('You can interpret without opening every view; selecting work is optional.');
    expect(guidance).toContain('This visit count resets when you leave Evidence.');
    const footer = markup.slice(markup.indexOf('<footer'));
    expect(footer).toContain('Interpret the evidence');
    expect(footer).not.toContain('disabled=');
    expect(state.selected).toEqual(['assessment']);
    expect(reducer(state, { type: 'go', step: 1 }).step).toBe(1);
  });

  it('requires explicit focus confirmation and removes approval progress after a confirmed focus changes', () => {
    const draft = focusDraft();
    expect(focusError(draft)).toBe('');
    expect(hasFocus(draft)).toBe(false);
    const draftProgress = progress(renderWorkspace(ReasoningWorkspace, draft));
    expect(draftProgress).toContain('3 of 3 draft parts recorded');
    expect(draftProgress).toContain('Review your focus before confirming');
    expect(draftProgress).not.toContain('Focus confirmed by you');

    const approved = approvedPlan();
    expect(hasPlan(approved)).toBe(true);
    expect(progress(renderWorkspace(PlanWorkspace, approved))).toContain('Approved by you');
    const edited = reducer(approved, { type: 'text', field: 'focus', value: 'Use student drawings to explain equal amounts before naming an equivalence rule.' });
    expect(hasFocus(edited)).toBe(false);
    expect(hasPlan(edited)).toBe(false);
    expect(progress(renderWorkspace(ReasoningWorkspace, edited))).not.toContain('Focus confirmed by you');
    const planProgress = progress(renderWorkspace(PlanWorkspace, edited));
    expect(planProgress).toContain('Reconfirm the focus');
    expect(planProgress).not.toContain('Approved by you');
  });

  it('does not count supplied agenda starters as authored directions', () => {
    const state = reducer(focusDraft(), { type: 'confirm-focus' });
    expect(state.agenda).toEqual(initialAgenda);
    const guidance = progress(renderWorkspace(PlanWorkspace, state));
    expect(item(guidance, 'Activity directions · 0 of 6 authored')).toContain('>To draft</span>');
    expect(guidance).toContain('Suitable starter text can remain in your plan; it does not count as authored here.');
    const edited = reducer(state, { type: 'agenda', index: 0, value: 'Ask pairs to explain the learning goal, then record a question about the selected work.' });
    expect(progress(renderWorkspace(PlanWorkspace, edited))).toContain('Activity directions · 1 of 6 authored');
    expect(hasPlan(edited)).toBe(false);
  });

  it('accepts not-yet-used as a report without claiming implementation or student learning', () => {
    const state = reducer(approvedPlan(), { type: 'implementation', value: 'no' });
    const markup = renderWorkspace(ReflectWorkspace, state);
    const guidance = progress(markup);
    expect(guidance).toContain('1 of 3 steps recorded');
    expect(item(guidance, 'Report what was tried')).toContain('>Recorded</span>');
    expect(item(guidance, 'Review and record the next step')).toContain('>To do</span>');
    expect(guidance).toContain('Used, partly used and not yet used are equally valid reports.');
    expect(guidance).toContain('Recording a next step does not establish student improvement.');
    expect(markup).toContain('The move has not been tested yet.');
    expect(markup).toContain('Follow-up evidence is not available yet.');
    expect(hasReflection(state)).toBe(false);
  });

  it('requires recording again when a previously recorded reflection is edited', () => {
    const recorded = recordedReflection();
    expect(hasReflection(recorded)).toBe(true);
    expect(progress(renderWorkspace(ReflectWorkspace, recorded))).toContain('Next step recorded');
    const edited = reducer(recorded, { type: 'text', field: 'reflection', value: `${recorded.reflection} The facilitator will bring the materials on Monday.` });
    expect(hasReflection(edited)).toBe(false);
    const guidance = progress(renderWorkspace(ReflectWorkspace, edited));
    expect(guidance).toContain('2 of 3 steps recorded');
    expect(item(guidance, 'Review and record the next step')).toContain('>To do</span>');
    expect(guidance).not.toContain('Next step recorded');
    expect(guidance).not.toContain('Your next decision is recorded');
    expect(guidance).toContain('Review your next step');
  });

  it('distinguishes an in-memory recorded reflection from a successful browser save', () => {
    const state = recordedReflection();
    const markup = renderWorkspace(ReflectWorkspace, state, true);
    const guidance = progress(markup);
    expect(hasReflection(state)).toBe(true);
    expect(guidance).toContain('Recorded in this draft · save pending');
    expect(guidance).not.toContain('· Next step recorded');
    expect(markup).toContain('Changes are not saved. Retry saving before leaving this browser.');
    expect(markup).not.toContain('Reflection recorded with this plan.');
    expect(markup).toContain('Record next step');
  });
});
