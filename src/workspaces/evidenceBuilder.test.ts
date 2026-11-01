import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { referenceForVersion } from '../data/evidenceSnapshots';
import { createReferenceData } from '../data/seed';
import { decodeDraft, encodeDraft, evidenceReviewTasks, initialState, reducer, type PlanState } from '../model';
import { EvidenceWorkspace } from './EvidenceWorkspace';

function renderEvidence(state = initialState()) {
  const reference = referenceForVersion(createReferenceData(), state.evidenceVersion);
  const before = structuredClone({ state, reference });
  const dispatch = vi.fn(() => true);
  const markup = renderToStaticMarkup(createElement(EvidenceWorkspace, { state, reference, dispatch }));
  expect({ state, reference }).toEqual(before);
  expect(dispatch).not.toHaveBeenCalled();
  return { markup, reference };
}

function review(markup: string) {
  const start = markup.indexOf('<section id="evidence-review-panel"');
  expect(start).toBeGreaterThanOrEqual(0);
  return markup.slice(start);
}

function checklist(markup: string) {
  const start = markup.indexOf('<section class="stage-checklist"');
  expect(start).toBeGreaterThanOrEqual(0);
  return markup.slice(start);
}

function task(markup: string, id: string) {
  const start = markup.indexOf(`<li data-task="${id}"`);
  expect(start).toBeGreaterThanOrEqual(0);
  let depth = 0;
  for (const match of markup.slice(start).matchAll(/<\/?li\b[^>]*>/g)) {
    depth += match[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return markup.slice(start, start + match.index! + match[0].length);
  }
  throw new Error(`Unclosed checklist task: ${id}`);
}

const escaped = (text: string) => renderToStaticMarkup(createElement('span', null, text)).slice(6, -7);

describe('guided evidence review', () => {
  it('opens one assessment task and preserves the optional path straight to interpretation', () => {
    const { markup } = renderEvidence();
    const panels = [...markup.matchAll(/<section\b[^>]*class="evidence-builder-panel [^"]+"[^>]*>/g)].map(match => match[0]);
    expect(panels).toHaveLength(5);
    const visible = panels.filter(tag => !/\bhidden(?:=|\s)/.test(tag));
    expect(visible).toHaveLength(1);
    expect(visible[0]).toContain('id="evidence-assessment-panel"');
    expect(markup).toContain('id="evidence-assessment-title" tabindex="-1"');
    const tasks = checklist(markup);
    expect(tasks).toContain('>Evidence checklist</h2>');
    expect(tasks).toContain('0 of 3 core tasks checked');
    expect(tasks.match(/data-task=/g)).toHaveLength(5);
    expect(task(tasks, 'results')).toContain('aria-current="step"');
    expect(task(tasks, 'task')).toContain('Read the task and scoring');
    expect(task(tasks, 'work')).toContain('Examine student work');
    expect(task(tasks, 'selection')).toContain('Review your evidence selection');
    const statusStart = markup.indexOf('class="evidence-builder-status"');
    const shortcut = markup.slice(statusStart, markup.indexOf('</div>', statusStart));
    expect(shortcut).toContain('Continue to interpretation');
    expect(shortcut).not.toContain('disabled=');
    expect(markup).toContain('role="group" aria-label="Assessment actions"');
    expect(markup).toContain('Continue to task &amp; scoring');
    expect(markup).toContain('Review selected evidence');
    expect(markup).toContain('Interpret the evidence');
  });

  it('places each review and its actions inside its own checklist child region', () => {
    const { markup } = renderEvidence();
    const tasks = checklist(markup);
    const mappings = [
      ['results', 'evidence-assessment-panel', 'Assessment actions', 'I reviewed the results and their limits.'],
      ['task', 'evidence-task-panel', 'Task and scoring actions', 'I reviewed the task and scoring criteria.'],
      ['classes', 'evidence-classes-panel', 'Class comparison actions', 'I reviewed the class comparison.'],
      ['work', 'evidence-work-panel', 'Student work actions', 'I examined the student work and its limits.'],
      ['selection', 'evidence-review-panel', 'Evidence actions', 'I reviewed the evidence I am taking forward.'],
    ];
    for (const [id, panel, actions, acknowledgment] of mappings) {
      const row = task(tasks, id);
      expect(row).toContain(`data-task-content="${id}"`);
      expect(row.indexOf(`data-task-content="${id}"`)).toBeGreaterThan(row.indexOf('</button>'));
      expect(row).toContain(`id="${panel}"`);
      expect(row).toContain(`aria-label="${actions}"`);
      expect(row).toContain(acknowledgment);
      expect(row).toContain(`aria-expanded="${id === 'results'}"`);
      const contentTag = row.match(/<div\b[^>]*data-task-content="[^"]+"[^>]*>/)?.[0];
      expect(Boolean(contentTag?.includes(' hidden='))).toBe(id !== 'results');
      for (const [, otherPanel] of mappings) {
        if (otherPanel !== panel) expect(row).not.toContain(`id="${otherPanel}"`);
      }
    }
    expect(markup).not.toContain('class="evidence-view-switch"');
    expect(markup.match(/class="evidence-review-acknowledgment"/g)).toHaveLength(5);
  });

  it.each(['oct28', 'oct29'] as const)('reviews only selected %s sources with exact dated evidence and scope', evidenceVersion => {
    const state: PlanState = { ...initialState(), evidenceVersion, selected: ['assessment', 'responseB', 'observation'] };
    const { markup, reference } = renderEvidence(state);
    const selection = review(markup);
    expect(selection).toContain(`${reference.assessment.correct}/${reference.assessment.total} correct fractions`);
    expect(selection).toContain(`${reference.assessment.explanations}/${reference.assessment.total} adequate explanations`);
    expect(selection).toContain(`Assessment · ${reference.assessment.date}`);
    expect(selection).toContain(escaped(reference.responses[0].quote));
    expect(selection).not.toContain(escaped(reference.responses[1].quote));
    expect(selection).toContain(escaped(reference.observation.quote));
    expect(selection).toContain(reference.observation.caution);
    expect(selection).toContain('Separate scores; these totals do not identify who met both criteria.');
    expect(selection).toContain('Illustrative work, not a representative sample.');
    expect(selection).toContain('Continuing does not confirm an interpretation.');
    expect(selection).not.toContain('disabled=');
    if (evidenceVersion === 'oct29') expect(selection).toContain('not matched student-level gains');
  });

  it('keeps source opening separate from explicit acknowledgment and leaves optional reviews out of the core count', () => {
    const { markup } = renderEvidence({ ...initialState(), interpretation: 'An existing educator draft stays available.' });
    const tasks = checklist(markup);
    expect(markup).toContain('Return to interpretation');
    expect(tasks).toContain('0 of 3 core tasks checked');
    expect(tasks.match(/data-status="todo"/g)).toHaveLength(5);
    expect(tasks).toContain('Mark each review yourself in its work area.');
    expect(tasks).toContain('Checks save with this cycle; check the save status before leaving.');
    expect(tasks).toContain('You can continue without checking every task.');
    for (const id of ['classes', 'work']) expect(task(tasks, id)).toContain('Optional ·');
    for (const id of ['results', 'task', 'selection']) expect(task(tasks, id)).not.toContain('Optional ·');
    expect(markup).toContain('I reviewed the results and their limits.');
    expect(markup).not.toMatch(/<input type="checkbox"[^>]*checked=/);
    expect(markup).not.toContain('role="progressbar"');
    expect(review(markup)).toContain('No student work selected.');
    expect(review(markup)).not.toContain('Historical context ·');
  });

  it('restores explicit acknowledgments independently of selected examples and reopens selection review after an edit', () => {
    const saved = { ...initialState(), evidenceReviewed: [...evidenceReviewTasks] };
    const restored = decodeDraft(encodeDraft(saved)).state;
    const { markup } = renderEvidence(restored);
    const tasks = checklist(markup);
    expect(tasks).toContain('3 of 3 core tasks checked');
    expect(tasks.match(/data-status="done"/g)).toHaveLength(5);
    expect(tasks.match(/Reviewed by you/g)).toHaveLength(5);
    expect(markup).toContain('<input type="checkbox" checked=""/>');
    expect(review(markup)).toContain('No student work selected.');
    const edited = reducer(restored, { type: 'evidence', id: 'responseB' });
    const revised = checklist(renderEvidence(edited).markup);
    expect(revised).toContain('2 of 3 core tasks checked');
    expect(task(revised, 'selection')).toContain('data-status="todo"');
    expect(task(revised, 'work')).toContain('data-status="done"');
  });
});
