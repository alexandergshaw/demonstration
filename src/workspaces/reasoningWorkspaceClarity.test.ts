import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { TaskExplanation } from '../components/TaskExplanation';
import { createReferenceData } from '../data/seed';
import { initialState, type PlanState } from '../model';
import { ReasoningWorkspace } from './ReasoningWorkspace';

function renderReasoning(state = initialState(), reference = createReferenceData()) {
  return renderToStaticMarkup(createElement(ReasoningWorkspace, {
    state, reference, dispatch: vi.fn(() => true), submit: vi.fn(() => true),
    clearError: vi.fn(), errorField: '', errorAttempt: 0,
  }));
}

function checklist(markup: string) {
  const start = markup.indexOf('<section class="stage-checklist"');
  expect(start).toBeGreaterThanOrEqual(0);
  return markup.slice(start, markup.indexOf('<p class="stage-checklist-note"', start)) + markup.slice(markup.indexOf('<p class="stage-checklist-note"', start), markup.indexOf('</p>', markup.indexOf('<p class="stage-checklist-note"', start)) + 4);
}

function mobileEvidence(markup: string) {
  const start = markup.indexOf('class="reasoning-mobile-evidence"');
  expect(start).toBeGreaterThanOrEqual(0);
  return markup.slice(start, markup.indexOf('</aside>', start));
}

describe('reasoning guidance and source clarity', () => {
  it('preserves full guidance in an opt-in closed disclosure without changing other task guides', () => {
    const props = {
      title: 'Explain the evidence', why: 'The source supports the decision.',
      steps: [{ label: 'Name the source', detail: 'Include its date and scope.' }],
      example: 'An illustrative response.', handoff: 'Then consider another explanation.',
    };
    const expanded = renderToStaticMarkup(createElement(TaskExplanation, props));
    expect(expanded).not.toContain('task-explanation-disclosure');
    const collapsed = renderToStaticMarkup(createElement(TaskExplanation, { ...props, disclosureLabel: 'How to explain the evidence' }));
    expect(collapsed).toContain('<details class="task-explanation-disclosure">');
    expect(collapsed).not.toContain(' open=');
    for (const text of [props.title, props.why, props.steps[0].detail, props.example, props.handoff]) {
      expect(collapsed).toContain(text);
    }
  });

  it('labels all four checklist tasks and identifies the current work without awarding progress for a visit', () => {
    const initial = renderReasoning();
    const tasks = checklist(initial);
    const titleId = tasks.match(/aria-labelledby="([^"]+)"/)?.[1];
    expect(titleId).toBeTruthy();
    expect(tasks).toContain(`<h2 id="${titleId}">Interpretation checklist</h2>`);
    expect(tasks.match(/data-task=/g)).toHaveLength(4);
    expect(tasks.match(/data-status="todo"/g)).toHaveLength(4);
    expect(tasks).toContain('0 of 4 core tasks checked');
    for (const id of ['notice', 'test', 'focus', 'confirm']) expect(tasks).toContain(`data-task="${id}"`);
    expect(tasks).toMatch(/data-task="notice"[^>]*><button[^>]*aria-current="step"/);
    expect(tasks).toContain('Drafted means the writing minimum is met.');
    expect(tasks).toContain('Confirmation is your separate decision');
    expect(initial).toContain('id="reasoning-test-guide"');
    const resumed: PlanState = { ...initialState(), challenged: true };
    const resumedChecklist = checklist(renderReasoning(resumed));
    expect(resumedChecklist).toMatch(/data-task="focus"[^>]*><button[^>]*aria-current="step"/);
    expect(resumedChecklist).toContain('1 of 4 core tasks checked');
  });

  it('nests writing and its actions under each task, with separate review before confirmation', () => {
    const state = initialState();
    const before = structuredClone(state);
    const dispatch = vi.fn(() => true), submit = vi.fn(() => true);
    const markup = renderToStaticMarkup(createElement(ReasoningWorkspace, {
      state, reference: createReferenceData(), dispatch, submit, clearError: vi.fn(), errorField: '', errorAttempt: 0,
    }));
    const starts = [...markup.matchAll(/<section\b[^>]*class="reasoning-beat-panel"[^>]*>/g)];
    expect(starts).toHaveLength(4);
    const contexts = [
      { task: 'id="interpretation"', actions: 'Interpretation actions', help: 'How to write an interpretation' },
      { task: 'id="reasoning-challenge-help"', actions: 'Respond to the alternative', help: 'How to test an alternative' },
      { task: 'id="focus"', actions: 'Focus draft actions', help: 'How to choose a teaching focus' },
    ];
    contexts.forEach(({ task, actions, help }, index) => {
      const panel = markup.slice(starts[index].index, starts[index + 1]?.index ?? markup.length);
      const taskPosition = panel.indexOf(task);
      const actionPosition = panel.indexOf(`role="group" aria-label="${actions}"`);
      const helpPosition = panel.indexOf('<details class="task-explanation-disclosure">');
      expect(taskPosition).toBeGreaterThanOrEqual(0);
      expect(actionPosition).toBeGreaterThan(taskPosition);
      expect(helpPosition).toBeGreaterThan(actionPosition);
      expect(panel.indexOf('class="step-coach"')).toBeGreaterThan(actionPosition);
      expect(panel.match(/class="btn workflow-actions-primary"/g)).toHaveLength(1);
      expect(panel).toContain(`${help}</summary>`);
      expect(panel).not.toMatch(/<details\b[^>]*class="(?:task-explanation-disclosure|step-coach-help)"[^>]*\bopen/);
    });
    const confirmation = markup.slice(starts[3].index);
    expect(confirmation).toContain('Review your teaching focus');
    expect(confirmation).toContain('role="group" aria-label="Teaching focus actions"');
    expect(confirmation).toContain('id="focus-confirm"');
    expect(confirmation).not.toContain('id="focus"');
    for (const [id, control] of [['notice', 'interpretation'], ['test', 'challenge'], ['focus', 'focus'], ['confirm', 'focus-confirm']]) {
      const bodyStart = markup.indexOf(`data-task-content="${id}"`);
      const parentStart = markup.lastIndexOf(`<li data-task="${id}"`, bodyStart);
      const nextTask = markup.indexOf('<li data-task=', bodyStart);
      expect(parentStart).toBeGreaterThanOrEqual(0);
      expect(bodyStart).toBeGreaterThan(parentStart);
      expect(markup.slice(bodyStart, nextTask < 0 ? undefined : nextTask)).toContain(`id="${control}"`);
    }
    expect(state).toEqual(before);
    expect(dispatch).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
  });

  it('uses the current source data in the narrow reference instead of requiring a modal for every comparison', () => {
    const reference = createReferenceData();
    reference.assessment = { ...reference.assessment, correct: 71, explanations: 44, total: 119, date: 'Nov 2' };
    const assessment = mobileEvidence(renderReasoning(initialState(), reference));
    expect(assessment).toContain('Assessment · Nov 2');
    expect(assessment).toContain('71/119 correct fractions · 44/119 adequate explanations');
    expect(assessment).toContain('Separate scores; the totals do not identify who met both criteria.');
    const selected: PlanState = { ...initialState(), selected: ['assessment', reference.responses[0].id] };
    const work = mobileEvidence(renderReasoning(selected, reference));
    expect(work).toContain(reference.responses[0].label);
    expect(work).toContain(renderToStaticMarkup(createElement('blockquote', null, `“${reference.responses[0].quote}”`)));
    expect(work).toContain('Illustrative work, not a representative sample.');
    expect(work).toContain('View selected evidence &amp; task');
  });
});
