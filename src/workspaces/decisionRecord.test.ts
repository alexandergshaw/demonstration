import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { createReferenceData } from '../data/seed';
import { evidenceSnapshotDescription, referenceForVersion } from '../data/evidenceSnapshots';
import { hasFocus, hasPlan, hasReflection, initialState, reducer, type Action, type EvidenceVersion, type PlanState } from '../model';
import { ReflectWorkspace } from './ReflectWorkspace';
import { DecisionHistory } from './WorkspaceReaders';

const apply = (state: PlanState, ...actions: Action[]) => actions.reduce(reducer, state);

function focused(version: EvidenceVersion = 'oct28') {
  return apply({ ...initialState(), evidenceVersion: version },
    { type: 'evidence', id: 'responseB' },
    { type: 'text', field: 'interpretation', value: 'The work suggests a difference between choosing a fraction and explaining equal amounts.' },
    { type: 'challenge' },
    { type: 'text', field: 'focus', value: 'Help students explain why partitioning preserves the amount of the same whole.' },
    { type: 'confirm-focus' });
}

function approved(version: EvidenceVersion = 'oct28') {
  return apply(focused(version),
    { type: 'text', field: 'action', value: 'Teachers will ask students to explain equal amounts using fraction strips and their own words.' },
    { type: 'text', field: 'owner', value: 'Ms Rivera and the Grade 4 team' },
    { type: 'text', field: 'implementationCheck', value: 'Bring dated lesson notes documenting how the explanation prompt was used.' },
    { type: 'text', field: 'learningCheck', value: 'Collect independent explanations using a comparable task and the same rubric.' },
    { type: 'text', field: 'evidenceCollector', value: 'Mr Chen' },
    { type: 'text', field: 'collectionDate', value: '2026-11-03' },
    { type: 'text', field: 'reviewDate', value: '2026-11-05' },
    { type: 'text', field: 'accessParticipation', value: 'Offer fraction strips and oral explanations before asking students to write.' },
    { type: 'consent', value: true },
    { type: 'confirm-plan' });
}

function reflectionDraft(version: EvidenceVersion = 'oct28', implementation: PlanState['implementation'] = 'partial') {
  return apply(approved(version),
    { type: 'implementation', value: implementation },
    { type: 'text', field: 'reflection', value: 'The team will collect independent explanations and a dated account of the teaching attempt before judging learning.' },
    { type: 'text', field: 'nextCycleQuestion', value: 'What will student drawings reveal about equal amounts?' });
}

function recorded(version: EvidenceVersion = 'oct28', implementation: PlanState['implementation'] = 'partial') {
  return reducer(reflectionDraft(version, implementation), { type: 'save-reflection' });
}

function recordMarkup(state: PlanState, unsaved = false) {
  const reference = referenceForVersion(createReferenceData(), state.evidenceVersion);
  const onNavigate = vi.fn(), onClose = vi.fn();
  const before = structuredClone(state);
  const markup = renderToStaticMarkup(createElement(DecisionHistory, {
    state, reference, unsaved, onNavigate, onClose, cycleTitle: 'Grade 4 fraction inquiry',
  }));
  expect(state).toEqual(before);
  expect(onNavigate).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
  return markup;
}

function recordItem(markup: string, title: string) {
  const heading = markup.indexOf(`<h3>${title}</h3>`);
  expect(heading).toBeGreaterThanOrEqual(0);
  return markup.slice(markup.lastIndexOf('<li>', heading), markup.indexOf('</li>', heading));
}

function routeButton(markup: string, label: string) {
  const match = [...markup.matchAll(/<button\b[^>]*>[\s\S]*?<\/button>/g)]
    .find(item => item[0].endsWith(`>${label}</button>`));
  expect(match).toBeDefined();
  return match![0];
}

describe('the decision record describes the current cycle completely', () => {
  it.each(['oct28', 'oct29'] as const)('uses the %s evidence labels and collection date without claiming a version history', version => {
    const state = recorded(version);
    expect(hasReflection(state)).toBe(true);
    const markup = recordMarkup(state);
    const current = referenceForVersion(createReferenceData(), version);
    const other = referenceForVersion(createReferenceData(), version === 'oct28' ? 'oct29' : 'oct28');
    const evidence = recordItem(markup, 'Selected evidence');
    expect(evidence).toContain(current.assessment.date);
    expect(evidence).toContain(current.labels.assessment);
    expect(evidence).toContain(current.labels.responseB);
    expect(evidence).not.toContain(other.labels.assessment);
    expect(markup).toContain(evidenceSnapshotDescription(version));
    expect(markup).toContain('Grade 4 fraction inquiry');
    expect(markup).toContain('Earlier versions are not retained here.');
  });

  it('includes ownership, planned collection, access notes and the next question with their correct states', () => {
    const state = recorded();
    const markup = recordMarkup(state);
    for (const [title, value] of [
      ['Your interpretation', state.interpretation], ['Teaching focus', state.focus],
      ['Teaching action', state.action], ['Who planned to try it', state.owner],
      ['Implementation check', state.implementationCheck], ['Learning check', state.learningCheck],
      ['Access and participation', state.accessParticipation], ['Reflection', state.reflection],
      ['Next PLC question', state.nextCycleQuestion],
    ]) expect(recordItem(markup, title)).toContain(value);
    expect(recordItem(markup, 'Who planned to try it')).toContain('Agreed owner');
    const collection = recordItem(markup, 'Collection arrangements');
    expect(collection).toContain(`Who will collect: ${state.evidenceCollector}`);
    expect(collection).toContain(`Planned collection: ${state.collectionDate}`);
    expect(collection).toContain(`Planned review: ${state.reviewDate}`);
    expect(collection).toContain('Planned, not collected');
    expect(recordItem(markup, 'Next PLC question')).toContain('Recorded');
    expect(markup).not.toContain('Not recorded yet');
    expect(markup).toContain('An implementation report is separate from evidence of student learning.');
  });

  it.each([
    ['yes', 'Used as planned'], ['partial', 'Partially used'], ['no', 'Not yet used'],
  ] as const)('shows the %s implementation report and distinguishes drafts from recorded reports', (implementation, label) => {
    const draft = recordItem(recordMarkup(reflectionDraft('oct28', implementation)), 'Teaching attempt');
    expect(draft).toContain(label);
    expect(draft).toContain('Draft report');
    const report = recordItem(recordMarkup(recorded('oct28', implementation)), 'Teaching attempt');
    expect(report).toContain(label);
    expect(report).toContain('Recorded report');
  });

  it('consolidates missing required content without adding empty optional records', () => {
    const markup = recordMarkup(initialState());
    const written = markup.match(/<ol class="decision-records">([\s\S]*?)<\/ol>/)?.[1];
    expect(written).toBeDefined();
    expect(written!.match(/<li>/g)).toHaveLength(1);
    expect(written).toContain('<h3>Selected evidence</h3>');
    expect(markup.match(/<summary>Not recorded yet/g)).toHaveLength(1);
    expect(markup).toContain('Not recorded yet · 7 parts');
    expect(markup).toContain('<li>Your interpretation</li>');
    expect(markup).toContain('<li>Teaching attempt</li>');
    expect(markup).toContain('<li>Reflection</li>');
    expect(markup).not.toContain('<h3>Who planned to try it</h3>');
    expect(markup).not.toContain('<h3>Collection arrangements</h3>');
    expect(markup).not.toContain('<h3>Access and participation</h3>');
    expect(markup).not.toContain('<h3>Next PLC question</h3>');
  });

  it('gates Plan and Reflect routes on current approvals, including approval invalidation', () => {
    const plan = approved();
    const states = [
      { state: initialState(), planOpen: false, reflectOpen: false },
      { state: focused(), planOpen: true, reflectOpen: false },
      { state: plan, planOpen: true, reflectOpen: true },
      { state: reducer(plan, { type: 'text', field: 'owner', value: 'A different teacher' }), planOpen: true, reflectOpen: false },
      { state: reducer(plan, { type: 'text', field: 'focus', value: 'A revised focus on explaining how the same whole is partitioned.' }), planOpen: false, reflectOpen: false },
    ];
    for (const { state, planOpen, reflectOpen } of states) {
      expect(hasFocus(state)).toBe(planOpen);
      expect(hasPlan(state)).toBe(reflectOpen);
      const markup = recordMarkup(state);
      expect(routeButton(markup, 'Review meeting plan').includes('disabled=""')).toBe(!planOpen);
      expect(routeButton(markup, 'Review reflection').includes('disabled=""')).toBe(!reflectOpen);
      expect(routeButton(markup, 'Revisit evidence')).not.toContain('disabled=');
      expect(routeButton(markup, 'Revisit interpretation')).not.toContain('disabled=');
    }
  });

  it('qualifies recorded decisions when the current draft has unsaved changes', () => {
    const markup = recordMarkup(recorded(), true);
    expect(markup).toContain('role="alert"');
    expect(markup).toContain('These decisions include unsaved changes.');
    expect(markup).toContain('states below apply to this in-memory draft');
  });
});

describe('Reflection keeps its single recording action beside the authored report', () => {
  it.each([
    ['draft', () => reflectionDraft(), 'Record next step'],
    ['recorded', () => recorded(), 'Reflection recorded'],
  ] as const)('places the %s action after the report and optional question but before optional writing help', (_label, makeState, actionLabel) => {
    const state = makeState();
    const dispatch = vi.fn(() => true), submit = vi.fn(() => true);
    const markup = renderToStaticMarkup(createElement(ReflectWorkspace, {
      state, dispatch, submit, errorField: '', errorAttempt: 0, openExamples: vi.fn(),
    }));
    expect(markup.match(/id="reflect-record"/g)).toHaveLength(1);
    expect(markup.match(new RegExp(`>${actionLabel}</button>`, 'g'))).toHaveLength(1);
    const action = markup.indexOf('id="reflect-record"');
    const report = markup.indexOf('id="reflection"');
    const question = markup.indexOf('id="next-cycle-question"');
    const help = markup.indexOf('<details class="reflect-writing-help">');
    expect(report).toBeGreaterThanOrEqual(0);
    expect(question).toBeGreaterThan(report);
    expect(action).toBeGreaterThan(question);
    expect(help).toBeGreaterThan(action);
    expect(markup.indexOf('class="step-coach"')).toBeGreaterThan(action);
    expect(markup.slice(markup.indexOf('class="workspace-stage-footer"'))).not.toContain('id="reflect-record"');
    expect(dispatch).not.toHaveBeenCalled();
    expect(submit).not.toHaveBeenCalled();
  });
});
