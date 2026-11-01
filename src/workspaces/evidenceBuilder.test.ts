import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { referenceForVersion } from '../data/evidenceSnapshots';
import { createReferenceData } from '../data/seed';
import { initialState, type PlanState } from '../model';
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
  return markup.slice(start, markup.indexOf('<details class="evidence-inspection-history"', start));
}

const escaped = (text: string) => renderToStaticMarkup(createElement('span', null, text)).slice(6, -7);

describe('guided evidence review', () => {
  it('opens one assessment task and preserves the optional path straight to interpretation', () => {
    const { markup } = renderEvidence();
    const panels = [...markup.matchAll(/<section\b[^>]*class="evidence-builder-panel [^"]+"[^>]*>/g)].map(match => match[0]);
    expect(panels).toHaveLength(3);
    const visible = panels.filter(tag => !/\bhidden(?:=|\s)/.test(tag));
    expect(visible).toHaveLength(1);
    expect(visible[0]).toContain('id="evidence-assessment-panel"');
    expect(markup).toContain('id="evidence-assessment-title" tabindex="-1"');
    expect(markup).toContain('aria-label="Evidence review tasks"');
    expect(markup).toContain('aria-controls="evidence-assessment-panel"');
    expect(markup).toContain('<option value="work">2. Student work</option>');
    expect(markup).toContain('<option value="review">3. Review selection</option>');
    const statusStart = markup.indexOf('class="evidence-builder-status"');
    const shortcut = markup.slice(statusStart, markup.indexOf('</div>', statusStart));
    expect(shortcut).toContain('Continue to interpretation');
    expect(shortcut).not.toContain('disabled=');
    expect(markup).toContain('role="group" aria-label="Assessment actions"');
    expect(markup).toContain('Continue to student work');
    expect(markup).toContain('Review selected evidence');
    expect(markup).toContain('Interpret the evidence');
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

  it('treats source opening as optional navigation rather than reviewed or approved work', () => {
    const { markup } = renderEvidence({ ...initialState(), interpretation: 'An existing educator draft stays available.' });
    expect(markup).toContain('Return to interpretation');
    expect(markup).toContain('<details class="evidence-inspection-history">');
    expect(markup).toContain('Source views opened · 1 of 4 this visit');
    expect(markup).toContain('not a record that you reviewed a source');
    expect(markup).toContain('You can interpret without opening every view; selecting work is optional.');
    expect(markup).toContain('This visit count resets when you leave Evidence.');
    expect(markup).not.toContain('role="progressbar"');
    expect(review(markup)).toContain('No student work selected.');
    expect(review(markup)).not.toContain('Historical context ·');
  });
});
