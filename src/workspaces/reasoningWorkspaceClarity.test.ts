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

function taskPicker(markup: string) {
  const start = markup.indexOf('class="reasoning-task-picker task-picker"');
  expect(start).toBeGreaterThanOrEqual(0);
  return markup.slice(start, markup.indexOf('</div>', start));
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

  it('names the native task selector and points it at the active panel while retaining desktop navigation', () => {
    const initial = renderReasoning();
    const picker = taskPicker(initial);
    const labelId = picker.match(/<label for="([^"]+)">Reasoning task<\/label>/)?.[1];
    expect(labelId).toBeTruthy();
    expect(picker).toContain(`<select id="${labelId}"`);
    expect(picker).toContain('aria-controls="reasoning-notice-guide"');
    expect(picker).toContain('<option value="notice" selected="">1. Notice</option>');
    expect(picker).toContain('2. Test an alternative');
    expect(picker).toContain('3. Choose a focus');
    expect(initial).toContain('aria-label="Reasoning sequence"');
    expect(initial).toContain('id="reasoning-test-guide"');
    const resumed: PlanState = { ...initialState(), challenged: true };
    expect(taskPicker(renderReasoning(resumed))).toContain('aria-controls="reasoning-focus-guide"');
  });

  it('keeps one labelled action group after the task and before closed help in all three reasoning panels', () => {
    const state = initialState();
    const before = structuredClone(state);
    const dispatch = vi.fn(() => true), submit = vi.fn(() => true);
    const markup = renderToStaticMarkup(createElement(ReasoningWorkspace, {
      state, reference: createReferenceData(), dispatch, submit, clearError: vi.fn(), errorField: '', errorAttempt: 0,
    }));
    const starts = [...markup.matchAll(/<section\b[^>]*class="reasoning-beat-panel"[^>]*>/g)];
    expect(starts).toHaveLength(3);
    const contexts = [
      { task: 'id="interpretation"', actions: 'Interpretation actions', help: 'How to write an interpretation' },
      { task: 'id="reasoning-challenge-help"', actions: 'Respond to the alternative', help: 'How to test an alternative' },
      { task: 'id="focus"', actions: 'Teaching focus actions', help: 'How to choose a teaching focus' },
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
