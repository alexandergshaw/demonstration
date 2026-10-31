import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { referenceForVersion } from '../data/evidenceSnapshots';
import { createReferenceData } from '../data/seed';
import { hasPlan, hasReflection, initialState, reducer, type Action, type EvidenceVersion, type PlanState } from '../model';
import { EvidenceWorkspace } from './EvidenceWorkspace';
import { PlanWorkspace } from './PlanWorkspace';
import { ReasoningWorkspace } from './ReasoningWorkspace';
import { ReflectWorkspace } from './ReflectWorkspace';

const apply = (state: PlanState, ...actions: Action[]) => actions.reduce(reducer, state);
const reference = createReferenceData();

function focused(version: EvidenceVersion = 'oct28') {
  return apply({ ...initialState(), evidenceVersion: version },
    { type: 'evidence', id: 'responseB' },
    { type: 'text', field: 'interpretation', value: 'The work suggests a gap between selecting a fraction and explaining equal amounts.' },
    { type: 'challenge' },
    { type: 'text', field: 'focus', value: 'Help students explain why partitioning preserves the amount of the same whole.' },
    { type: 'confirm-focus' });
}

function planned(version: EvidenceVersion = 'oct28') {
  return apply(focused(version),
    { type: 'text', field: 'action', value: 'Teachers will ask students to explain equal amounts using their own words and fraction strips.' },
    { type: 'text', field: 'owner', value: 'Grade 4 team' },
    { type: 'text', field: 'implementationCheck', value: 'Each teacher brings a lesson note documenting the explanation routine.' },
    { type: 'text', field: 'learningCheck', value: 'Compare independent explanations using the same rubric and comparable task.' });
}

function props(state: PlanState) {
  return {
    state,
    reference: referenceForVersion(reference, state.evidenceVersion),
    dispatch: vi.fn((_action: Action) => true),
    submit: vi.fn((_kind: 'focus' | 'plan' | 'reflection') => true),
    clearError: vi.fn(),
    errorField: '',
    errorAttempt: 0,
    openExamples: vi.fn(),
  };
}

function visibleReasoningPanel(markup: string) {
  const panels = [...markup.matchAll(/<section\b([^>]*class="reasoning-beat-panel"[^>]*)>([\s\S]*?)<\/section>/g)];
  const visible = panels.filter(([, attributes]) => !/\bhidden(?:\s|=|$)/.test(attributes));
  expect(panels).toHaveLength(3);
  expect(visible).toHaveLength(1);
  return visible[0][2];
}

describe('workspace evidence belongs to the selected collection', () => {
  it.each([
    ['oct28', 'Oct 28', 120, 89, 46],
    ['oct29', 'Oct 29', 116, 90, 52],
  ] as const)('renders %s counts, work samples and historical boundaries together', (version, date, total, correct, explanations) => {
    const options = props({ ...initialState(), evidenceVersion: version });
    const markup = renderToStaticMarkup(createElement(EvidenceWorkspace, options));
    expect(markup).toContain(`Of ${total} responses, ${correct} selected the correct fraction and ${explanations} gave an adequate explanation.`);
    expect(markup).toContain(`${date}, 2026`);
    for (const response of options.reference.responses) expect(markup).toContain(response.quote);
    const other = referenceForVersion(reference, version === 'oct28' ? 'oct29' : 'oct28');
    for (const response of other.responses) expect(markup).not.toContain(response.quote);
    expect(markup).toMatch(/datetime="2026-09-09"/i);
    expect(markup).toContain('Historical context, not current proof of teaching practice across the grade.');
    expect(markup.includes('116 of 120 expected responses; 4 absent.')).toBe(version === 'oct29');
    expect(options.dispatch).not.toHaveBeenCalled();
  });

  it.each(['oct28', 'oct29'] as const)('keeps selected %s work and its counts beside reasoning', version => {
    const options = props({ ...initialState(), evidenceVersion: version, selected: ['assessment', 'responseB'] });
    const markup = renderToStaticMarkup(createElement(ReasoningWorkspace, options));
    const { assessment, responses } = options.reference;
    expect(markup).toContain(responses[0].quote);
    expect(markup).toContain(`Selected student work · ${assessment.date}`);
    expect(markup).toContain(`${assessment.correct}/${assessment.total}`);
    expect(markup).toContain(`${assessment.explanations}/${assessment.total}`);
    expect(markup).not.toContain(responses[1].quote);
    expect(markup).toContain('An illustrative response, not a representative sample.');
    if (version === 'oct29') {
      expect(markup).toContain('not matched student-level gains');
      expect(markup).not.toContain('89/120');
    }
    expect(options.dispatch).not.toHaveBeenCalled();
  });
});

describe('workspace defaults keep one decision in view', () => {
  it('starts Evidence with the comparison and two work samples, with further inspection closed', () => {
    const markup = renderToStaticMarkup(createElement(EvidenceWorkspace, props(initialState())));
    expect(markup.match(/<figure\b/g)).toHaveLength(1);
    expect(markup.match(/<article\b/g)).toHaveLength(2);
    expect(markup).not.toContain('<table');
    expect(markup).not.toContain('What the scores mean');
    expect(markup).toContain('<details><summary>');
    expect(markup).not.toMatch(/<details\b[^>]*\bopen=/);
    expect(markup).toContain('Totals do not tell us which students met both criteria.');
  });

  it('starts a fresh interpretation at Notice with the other writing steps hidden', () => {
    const options = props(initialState());
    const panel = visibleReasoningPanel(renderToStaticMarkup(createElement(ReasoningWorkspace, options)));
    expect(panel).toContain('id="interpretation"');
    expect(panel).not.toContain('id="focus"');
    expect(panel).not.toContain('reasoning-question-copy');
    expect(options.submit).not.toHaveBeenCalled();
  });

  it('returns a confirmed focus to its own editor without exposing all three steps', () => {
    const options = props(focused());
    const panel = visibleReasoningPanel(renderToStaticMarkup(createElement(ReasoningWorkspace, options)));
    expect(panel).toContain('id="focus"');
    expect(panel).toContain(options.state.focus);
    expect(panel).not.toContain('id="interpretation"');
    expect(options.dispatch).not.toHaveBeenCalled();
  });

  it('starts Plan with only activity four editable, and leaves checks and approval behind deliberate actions', () => {
    const state = planned();
    const before = structuredClone(state);
    const options = props(state);
    const markup = renderToStaticMarkup(createElement(PlanWorkspace, options));
    expect(markup.match(/<textarea\b[^>]*id="agenda-\d"/g)).toHaveLength(1);
    expect(markup).toContain('id="agenda-3"');
    expect(markup.match(/class="pw-agenda-choice"/g)).toHaveLength(6);
    expect(markup).toContain(state.action);
    expect(markup).toContain(state.implementationCheck);
    expect(markup).toContain(state.learningCheck);
    for (const id of ['action', 'owner', 'implementation-check', 'learning-check', 'collection-date', 'review-date', 'consent']) {
      expect(markup).not.toContain(`id="${id}"`);
    }
    expect(markup).not.toContain('<dialog');
    expect(markup).not.toContain('Approve meeting plan');
    expect(markup).toContain('Review meeting plan');
    expect(markup).toMatch(/<details class="planning-disclosure rehearsal-guide">/);
    expect(hasPlan(state)).toBe(false);
    expect(state).toEqual(before);
    expect(options.dispatch).not.toHaveBeenCalled();
    expect(options.submit).not.toHaveBeenCalled();
  });

  it('opens an empty teaching move for authorship without supplying a generated action', () => {
    const state = focused();
    const options = props(state);
    const markup = renderToStaticMarkup(createElement(PlanWorkspace, options));
    expect(markup).toMatch(/<textarea\b[^>]*id="action"[^>]*><\/textarea>/);
    expect(markup).toContain('id="owner"');
    expect(markup).toContain('id="agenda-3"');
    expect(markup).not.toContain('id="implementation-check"');
    expect(state.action).toBe('');
    expect(options.dispatch).not.toHaveBeenCalled();
  });
});

describe('workspace writing remains authored content', () => {
  const authored = 'Ask “what stayed equal?” & keep <script>alert("example")</script> as literal notes.\nDo not replace this second line.';
  const escaped = 'Ask “what stayed equal?” &amp; keep &lt;script&gt;alert(&quot;example&quot;)&lt;/script&gt; as literal notes.\nDo not replace this second line.';

  it('preserves exact interpretation and agenda content while escaping markup', () => {
    const state = { ...planned(), interpretation: authored, action: authored, agenda: planned().agenda.map((entry, index) => index === 3 ? authored : entry) };
    const before = structuredClone(state);
    for (const component of [ReasoningWorkspace, PlanWorkspace]) {
      const options = props(state);
      const markup = renderToStaticMarkup(createElement(component, options));
      expect(markup).toContain(escaped);
      expect(markup).not.toContain('<script>');
      expect(options.dispatch).not.toHaveBeenCalled();
    }
    expect(state).toEqual(before);
  });

  it('preserves reported reflection and teaching action without interpreting embedded HTML', () => {
    const options = props({ ...planned(), action: authored, reflection: authored, nextCycleQuestion: authored });
    const markup = renderToStaticMarkup(createElement(ReflectWorkspace, options));
    expect(markup).toContain(escaped);
    expect(markup).not.toContain('<script>');
    expect(markup).toMatch(/<details class="reflect-next-question" open="">/);
    expect(options.state.reflection).toBe(authored);
    expect(options.dispatch).not.toHaveBeenCalled();
  });
});

describe('Reflect separates this cycle from demonstration outcomes', () => {
  it.each(['oct28', 'oct29'] as const)('does not attach example results to a recorded %s plan', version => {
    const state = apply(planned(version),
      { type: 'text', field: 'evidenceCollector', value: 'Grade 4 facilitator' },
      { type: 'text', field: 'collectionDate', value: '2026-11-05' },
      { type: 'text', field: 'reviewDate', value: '2026-11-09' },
      { type: 'consent', value: true },
      { type: 'confirm-plan' },
      { type: 'implementation', value: 'yes' },
      { type: 'text', field: 'reflection', value: 'We tried the routine, but still need comparable student work before concluding whether learning changed.' },
      { type: 'save-reflection' });
    expect(hasReflection(state)).toBe(true);
    const options = props(state);
    const markup = renderToStaticMarkup(createElement(ReflectWorkspace, options));
    expect(markup).toContain('Follow-up evidence is not available yet.');
    expect(markup).toContain('no collected follow-up dataset');
    expect(markup).toContain('Planned dates and example results do not establish an outcome.');
    expect(markup).toContain('This is your implementation report. Comparable student work is still needed.');
    expect(markup).toContain('Reflection recorded with this plan.');
    expect(markup).toContain('Explore a worked example');
    expect(markup).not.toContain('id="reflect-collection"');
    expect(markup).not.toMatch(/<(?:figure|table)\b/);
    expect(markup).not.toMatch(/(?:56|72)\s*\/\s*(?:116|120)/);
    expect(options.dispatch).not.toHaveBeenCalled();
    expect(options.submit).not.toHaveBeenCalled();
    expect(options.openExamples).not.toHaveBeenCalled();
  });

  it('keeps a not-yet-used move distinct from evidence of learning', () => {
    const state = { ...planned(), implementation: 'no' as const };
    const markup = renderToStaticMarkup(createElement(ReflectWorkspace, props(state)));
    expect(markup).toContain('The move has not been tested yet.');
    expect(markup).toContain('Follow-up evidence is not available yet.');
    expect(markup).toContain('Your report remains separate from demonstration examples.');
  });
});
