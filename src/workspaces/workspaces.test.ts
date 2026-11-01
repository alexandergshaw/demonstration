import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { referenceForVersion } from '../data/evidenceSnapshots';
import { createReferenceData } from '../data/seed';
import { hasPlan, hasReflection, initialState, planError, reducer, type Action, type EvidenceVersion, type PlanState } from '../model';
import { EvidenceWorkspace } from './EvidenceWorkspace';
import { PlanWorkspace } from './PlanWorkspace';
import { ReasoningWorkspace } from './ReasoningWorkspace';
import { ReflectWorkspace } from './ReflectWorkspace';
import { MeetingReady } from './MeetingReady';
import { agendaHeadings } from '../meetingMaterials';
import { minutes } from '../model';

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

function visibleWorkspacePanel(markup: string, panelClass: string, expectedCount: number) {
  const panels: { attributes: string; content: string }[] = [];
  let depth = 0;
  let active: { attributes: string; start: number; depth: number } | undefined;
  for (const tag of markup.matchAll(/<\/?section\b[^>]*>/g)) {
    if (tag[0].startsWith('</')) {
      if (active?.depth === depth) {
        panels.push({ attributes: active.attributes, content: markup.slice(active.start, tag.index) });
        active = undefined;
      }
      depth--;
    } else {
      depth++;
      if (tag[0].match(/\bclass="([^"]*)"/)?.[1].split(/\s+/).includes(panelClass)) active = { attributes: tag[0], start: tag.index! + tag[0].length, depth };
    }
  }
  const visible = panels.filter(({ attributes }) => !/\bhidden(?:\s|=|$)/.test(attributes));
  expect(panels).toHaveLength(expectedCount);
  expect(visible).toHaveLength(1);
  return visible[0].content;
}

function visibleReasoningPanel(markup: string) {
  return visibleWorkspacePanel(markup, 'reasoning-beat-panel', 4);
}

function workflowActions(markup: string, label: string) {
  const group = markup.indexOf(`role="group" aria-label="${label}"`);
  expect(group).toBeGreaterThanOrEqual(0);
  const start = markup.lastIndexOf('<div class="workflow-actions">', group);
  expect(start).toBeGreaterThanOrEqual(0);
  let depth = 0;
  for (const tag of markup.slice(start).matchAll(/<\/?div\b[^>]*>/g)) {
    depth += tag[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return markup.slice(start, start + tag.index! + tag[0].length);
  }
  throw new Error(`Unclosed workflow actions: ${label}`);
}

function primaryAction(markup: string) {
  const button = markup.match(/<button\b[^>]*class="btn workflow-actions-primary"[^>]*>([\s\S]*?)<\/button>/)?.[1];
  expect(button).toBeDefined();
  return button!;
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
  it('starts Evidence with only the assessment comparison, with further inspection closed', () => {
    const markup = renderToStaticMarkup(createElement(EvidenceWorkspace, props(initialState())));
    const panel = visibleWorkspacePanel(markup, 'evidence-builder-panel', 5);
    expect(panel.match(/<figure\b/g)).toHaveLength(1);
    expect(panel).not.toContain('<article');
    expect(markup.match(/<article\b/g)).toHaveLength(2);
    expect(panel).not.toContain('<table');
    expect(panel).not.toContain('What the scores mean');
    expect(panel).toContain('<details class="evidence-source-details">');
    expect(markup).not.toMatch(/<details\b[^>]*\bopen=/);
    expect(panel).toContain('Totals do not tell us which students met both criteria.');
    expect(primaryAction(workflowActions(panel, 'Assessment actions'))).toContain('Continue to task &amp; scoring');
  });

  it('starts a fresh interpretation at Notice with the other writing steps hidden', () => {
    const options = props(initialState());
    const panel = visibleReasoningPanel(renderToStaticMarkup(createElement(ReasoningWorkspace, options)));
    expect(panel).toContain('id="interpretation"');
    expect(panel).not.toContain('id="focus"');
    expect(panel).not.toContain('reasoning-question-copy');
    expect(options.submit).not.toHaveBeenCalled();
  });

  it('returns a confirmed focus to its review without exposing the writing fields', () => {
    const options = props(focused());
    const panel = visibleReasoningPanel(renderToStaticMarkup(createElement(ReasoningWorkspace, options)));
    expect(panel).toContain('id="reasoning-confirm-title"');
    expect(panel).not.toContain('id="focus"');
    expect(panel).toContain(options.state.focus);
    expect(panel).not.toContain('id="interpretation"');
    expect(options.dispatch).not.toHaveBeenCalled();
  });

  it('starts Plan with only activity one editable, and leaves checks and approval behind deliberate actions', () => {
    const state = planned();
    const before = structuredClone(state);
    const options = props(state);
    const markup = renderToStaticMarkup(createElement(PlanWorkspace, options));
    expect(markup.match(/<textarea\b[^>]*id="agenda-\d"/g)).toHaveLength(1);
    expect(markup).toContain('id="agenda-0"');
    expect(markup.match(/class="pw-agenda-choice"/g)).toHaveLength(6);
    expect(markup).toContain(state.focus);
    expect(markup.indexOf(state.focus)).toBeLessThan(markup.indexOf('id="pw-activity-heading"'));
    expect(markup).toContain('<details class="pw-focus-context">');
    expect(markup).toContain('Read full focus &amp; sources');
    for (const value of [state.action, state.implementationCheck, state.learningCheck]) expect(markup).not.toContain(value);
    expect(markup).toContain('id="pw-activities-panel"');
    for (const id of ['pw-move-panel', 'pw-checks-panel', 'pw-review-panel']) expect(markup).not.toContain(`id="${id}"`);
    for (const id of ['action', 'owner', 'implementation-check', 'learning-check', 'collection-date', 'review-date', 'consent']) {
      expect(markup).not.toContain(`id="${id}"`);
    }
    expect(markup).not.toContain('<dialog');
    expect(markup).not.toContain('Approve meeting plan');
    expect(markup).toContain('Review the kit and approve the plan');
    expect(markup).toContain('Preview draft meeting kit');
    expect(markup).not.toContain('class="planning-disclosure rehearsal-guide"');
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
    expect(markup).not.toContain('id="agenda-0"');
    expect(markup).not.toContain('id="pw-activities-panel"');
    expect(markup).not.toContain('id="implementation-check"');
    expect(state.action).toBe('');
    expect(options.dispatch).not.toHaveBeenCalled();
  });

  it('opens collection fields under their own task when returning to resolve missing evidence', () => {
    const options = { ...props(planned()), initialCheckEditor: 'learning' as const };
    const markup = renderToStaticMarkup(createElement(PlanWorkspace, options));
    for (const id of ['evidence-collector', 'collection-date', 'review-date']) expect(markup).toContain(`id="${id}"`);
    expect(markup).toContain('data-task-content="collection"');
    expect(markup).not.toContain('id="learning-check"');
    expect(markup).toContain('Still to agree: who will collect, collection date, review date.');
    expect(markup).not.toContain('id="implementation-check"');
    expect(options.dispatch).not.toHaveBeenCalled();
    expect(options.submit).not.toHaveBeenCalled();
  });

  it('leaves coaching optional in every active workspace', () => {
    const options = props(planned());
    const markups = [
      visibleWorkspacePanel(renderToStaticMarkup(createElement(EvidenceWorkspace, options)), 'evidence-builder-panel', 5),
      visibleReasoningPanel(renderToStaticMarkup(createElement(ReasoningWorkspace, props(initialState())))),
      renderToStaticMarkup(createElement(PlanWorkspace, options)),
      visibleWorkspacePanel(renderToStaticMarkup(createElement(ReflectWorkspace, { ...options, state: { ...options.state, implementation: 'yes' } })), 'reflect-builder-panel', 4),
    ];
    for (const markup of markups) {
      expect(markup.match(/class="step-coach"/g)).toHaveLength(1);
      expect(markup).toContain('<details class="step-coach-help">');
      expect(markup).not.toMatch(/<details\b[^>]*class="step-coach-help"[^>]*\bopen/);
      const coaching = markup.match(/<section class="step-coach"[\s\S]*?<\/section>/)?.[0];
      expect(coaching).toBeDefined();
      expect(coaching).toMatch(/<details class="step-coach-help">[\s\S]*?<\/summary>[\s\S]*?class="step-coach-question"/);
    }
    expect(options.dispatch).not.toHaveBeenCalled();
    expect(options.submit).not.toHaveBeenCalled();
  });
});

describe('guidance points to required work without completing it', () => {
  it('keeps task-and-scoring views and interpretation available beside the guided assessment action', () => {
    const options = props(initialState());
    const before = structuredClone(options.state);
    const markup = renderToStaticMarkup(createElement(EvidenceWorkspace, options));
    const panel = visibleWorkspacePanel(markup, 'evidence-builder-panel', 5);
    const actions = workflowActions(panel, 'Assessment actions');
    expect(primaryAction(actions)).toContain('Continue to task &amp; scoring');
    expect(actions).toContain('Use the task and scoring criteria to understand the counts.');
    for (const label of ['Compare the results', 'Compare classes', 'Read the task and scoring']) expect(markup).toContain(label);
    expect(markup).toContain('Continue to interpretation');
    expect(markup).toContain('Student work selection is optional');
    expect(markup.indexOf('data-task="results"')).toBeLessThan(markup.indexOf('data-task="task"'));
    expect(markup.indexOf('data-task="task"')).toBeLessThan(markup.indexOf('data-task="classes"'));
    expect(markup).toContain('Read the task and scoring');
    expect(markup).not.toContain('disabled=');
    expect(options.state).toEqual(before);
    expect(options.dispatch).not.toHaveBeenCalled();
  });

  it.each<{ changes: Partial<PlanState>; target: string }>([
    { changes: { focusStamp: null, action: '' }, target: 'Reconfirm the focus' },
    { changes: { agenda: planned().agenda.map((entry, index) => index === 2 ? '' : entry), action: '' }, target: 'Write activity directions' },
    { changes: { action: '', owner: '' }, target: 'Describe the teaching move' },
    { changes: { owner: '', implementationCheck: '' }, target: 'Name who will try it' },
    { changes: { implementationCheck: '', learningCheck: '' }, target: 'Write the implementation check' },
    { changes: { learningCheck: '', collectionDate: '2026-02-30' }, target: 'Write the student learning check' },
    { changes: { collectionDate: '2026-02-30', reviewDate: 'invalid' }, target: 'Correct the collection date' },
    { changes: { reviewDate: 'invalid' }, target: 'Correct the review date' },
    { changes: { collectionDate: '2026-11-05', reviewDate: '2026-11-04' }, target: 'Correct the review date' },
    { changes: { consent: false }, target: 'I reviewed and own this plan.' },
  ])('reviews $target in validation order without approving the plan', ({ changes, target }) => {
    // Enter the review explicitly; the resume location is intentionally independent of validation order.
    const options = { ...props({ ...planned(), ...changes }), errorField: 'consent' };
    const before = structuredClone(options.state);
    const markup = renderToStaticMarkup(createElement(PlanWorkspace, options));
    expect(markup).toContain('id="pw-review-panel"');
    for (const id of ['pw-move-panel', 'pw-activities-panel', 'pw-checks-panel']) expect(markup).not.toContain(`id="${id}"`);
    const footer = workflowActions(markup, 'Meeting plan approval');
    expect(primaryAction(footer)).toContain('<span>Approve meeting plan</span>');
    const error = planError({ ...options.state, consent: true });
    const correction = markup.match(/<section class="pw-review-requirement"[\s\S]*?<\/section>/)?.[0];
    if (error) {
      expect(correction).toBeDefined();
      expect(correction).toContain(error);
      expect(correction).toContain(`>${target}<`);
    } else {
      expect(correction).toBeUndefined();
      expect(markup).toContain(`<strong>${target}</strong>`);
      expect(planError(options.state)).toBe('Confirm that you reviewed and own this plan.');
    }
    expect(markup).toMatch(/<input id="consent" type="checkbox"[^>]*\/>/);
    expect(markup).not.toMatch(/<input id="consent"[^>]*\bchecked=/);
    expect(options.state).toEqual(before);
    expect(options.state.consent).toBe(false);
    expect(options.dispatch).not.toHaveBeenCalled();
    expect(options.submit).not.toHaveBeenCalled();
  });

  it('keeps starter provenance visible and offers adjacent activities without claiming review', () => {
    const options = props(planned());
    const markup = renderToStaticMarkup(createElement(PlanWorkspace, options));
    expect(markup.match(/<span class="pw-agenda-summary">Starter text · /g)).toHaveLength(6);
    expect(markup).toContain('Activity 1 of 6');
    expect(markup).not.toContain('Previous activity');
    expect(markup).toContain('Next activity');
    expect(markup).toContain('Review all six before approving your plan.');
    expect(markup).not.toContain('6 of 6 complete');
    const edited = props({ ...options.state, agenda: options.state.agenda.map((entry, index) => index === 0 ? 'Connect the learning goal to the chosen focus and record one question to explore.' : entry) });
    const editedMarkup = renderToStaticMarkup(createElement(PlanWorkspace, edited));
    expect(editedMarkup.match(/<span class="pw-agenda-summary">Starter text · /g)).toHaveLength(5);
    expect(editedMarkup).toContain('id="agenda-1"');
    expect(editedMarkup).toContain('<p class="pw-starter-note">');
    const revisit = renderToStaticMarkup(createElement(PlanWorkspace, { ...edited, errorField: 'agenda-0' }));
    expect(revisit).toContain('id="agenda-0"');
    expect(revisit).not.toContain('<p class="pw-starter-note">');
    expect(revisit).toContain(edited.state.agenda[0]);
    expect(options.submit).not.toHaveBeenCalled();
    expect(edited.submit).not.toHaveBeenCalled();
  });

  it.each([
    ['', 'Write your interpretation'],
    ['I notice a gap.', 'Add detail to your interpretation'],
    ['The assessment shows more correct choices than adequate explanations.', 'Test an alternative'],
  ])('keeps Notice on its required writing until it can be tested: %s', (interpretation, label) => {
    const options = props({ ...initialState(), interpretation });
    const markup = renderToStaticMarkup(createElement(ReasoningWorkspace, options));
    const footer = workflowActions(visibleReasoningPanel(markup), 'Interpretation actions');
    expect(primaryAction(footer)).toContain(`<span>${label}</span>`);
    expect(markup).toContain('Interpretation checklist');
    expect(options.dispatch).not.toHaveBeenCalled();
    expect(options.submit).not.toHaveBeenCalled();
  });

  it.each([
    ['', 'Write your teaching focus'],
    ['Explain fractions.', 'Add detail to your focus'],
    ['Focus on explaining equivalent fractions using equal amounts of the same whole.', 'Confirm focus &amp; continue'],
  ])('asks for the focus before offering confirmation: %s', (focus, label) => {
    const options = props({ ...focused(), focus });
    const markup = renderToStaticMarkup(createElement(ReasoningWorkspace, options));
    const panel = visibleReasoningPanel(markup);
    const footer = workflowActions(panel, focus.trim().length >= 25 ? 'Teaching focus actions' : 'Focus draft actions');
    expect(primaryAction(footer)).toContain(`<span>${label}</span>`);
    if (focus.trim().length >= 25) {
      expect(panel).toContain(focus);
      expect(panel).not.toContain('id="focus"');
    } else expect(panel).toContain('id="focus"');
    expect(options.submit).not.toHaveBeenCalled();
  });

  it('opens the first unfinished activity with accessible context and keeps its draft intact', () => {
    const state = { ...planned(), agenda: planned().agenda.map((entry, index) => index === 3 ? 'Ask' : entry) };
    const options = props(state);
    const markup = renderToStaticMarkup(createElement(PlanWorkspace, options));
    expect(markup).toContain('id="agenda-3"');
    expect(markup).toContain('Activity 4 of 6:');
    expect(markup).toContain('aria-describedby="agenda-3-hint agenda-3-limit agenda-3-requirement"');
    expect(markup).toContain('id="agenda-3-requirement">Required · at least 5 characters');
    expect(primaryAction(workflowActions(markup, 'Meeting activity actions'))).toContain('<span>Write activity directions</span>');
    expect(markup).toContain('Previous activity');
    expect(markup).toContain('class="planning-disclosure rehearsal-guide"');
    expect(state.agenda[3]).toBe('Ask');
    expect(options.dispatch).not.toHaveBeenCalled();
  });

  it('offers the same six meeting activities through a labelled selector linked to the active editor', () => {
    const state = { ...planned(), agenda: planned().agenda.map((entry, index) => index === 3 ? 'Ask' : entry) };
    const before = structuredClone(state);
    const options = props(state);
    const markup = renderToStaticMarkup(createElement(PlanWorkspace, options));
    const pickerStart = markup.indexOf('class="pw-activity-picker task-picker"');
    expect(pickerStart).toBeGreaterThanOrEqual(0);
    const picker = markup.slice(pickerStart, markup.indexOf('</div>', pickerStart));
    const labelId = picker.match(/<label for="([^"]+)">Meeting activity<\/label>/)?.[1];
    expect(labelId).toBeTruthy();
    expect(picker).toContain(`<select id="${labelId}"`);
    expect(picker).toContain('aria-controls="pw-agenda-editor"');
    const activityOptions = [...picker.matchAll(/<option\b([^>]*)>([\s\S]*?)<\/option>/g)];
    expect(activityOptions).toHaveLength(6);
    activityOptions.forEach((option, index) => {
      const label = `${index + 1}. ${agendaHeadings[index]} · ${minutes[index]} min`;
      const escaped = renderToStaticMarkup(createElement('span', null, label)).slice(6, -7);
      expect(option[1]).toContain(`value="${index}"`);
      expect(option[2]).toBe(escaped);
      expect(option[1].includes('selected=""')).toBe(index === 3);
    });
    expect(markup).toContain('id="pw-agenda-editor"');
    expect(markup).toContain('id="agenda-3"');
    expect(markup).toContain('class="pw-agenda-list"');
    expect(markup).toContain('<details class="task-explanation-disclosure">');
    expect(markup).toContain('How to guide this activity</summary>');
    expect(markup).not.toMatch(/<details\b[^>]*class="task-explanation-disclosure"[^>]*\bopen/);
    expect(markup.indexOf('aria-label="Meeting activity actions"')).toBeLessThan(markup.indexOf('How to guide this activity</summary>'));
    expect(state).toEqual(before);
    expect(options.dispatch).not.toHaveBeenCalled();
    expect(options.submit).not.toHaveBeenCalled();
  });

  it('shows short teaching-move and owner requirements before an approval attempt', () => {
    const options = props({ ...planned(), action: 'Explain', owner: 'Me' });
    const markup = renderToStaticMarkup(createElement(PlanWorkspace, options));
    expect(markup).toContain('id="action-requirement">Required · at least 25 characters');
    expect(markup).toContain('id="owner-requirement">Required · at least 3 characters');
    expect(markup).toContain('aria-describedby="action-hint action-limit action-requirement"');
    expect(primaryAction(workflowActions(markup, 'Teaching move actions'))).toContain('<span>Describe the teaching move</span>');
    expect(markup).not.toContain('Next: shape the meeting activities');
    expect(options.submit).not.toHaveBeenCalled();
  });

  it('keeps an incomplete learning check in its editor with the requirement beside it', () => {
    const options = { ...props({ ...planned(), learningCheck: 'Work' }), initialTask: 'learning' as const };
    const markup = renderToStaticMarkup(createElement(PlanWorkspace, options));
    expect(markup).toContain('id="learning-check-requirement">Required · at least 15 characters');
    expect(primaryAction(workflowActions(markup, 'Student learning check actions'))).toContain('<span>Write the student learning check</span>');
    expect(markup).not.toContain('Next: review the whole plan');
    expect(options.submit).not.toHaveBeenCalled();
  });

  it('routes an incomplete retained interpretation back to writing without discarding the focus', () => {
    const options = props({ ...focused(), interpretation: 'I notice' });
    const markup = renderToStaticMarkup(createElement(ReasoningWorkspace, options));
    expect(visibleReasoningPanel(markup)).toContain(options.state.focus);
    expect(markup).toContain('Write interpretation first');
    expect(markup).toContain('using at least 30 characters');
    expect(options.submit).not.toHaveBeenCalled();
    expect(options.dispatch).not.toHaveBeenCalled();
  });

  it.each([
    ['', '', 'Report implementation first'],
    ['yes', '', 'Write your next step'],
    ['partial', 'Need more work.', 'Add detail to your next step'],
    ['no', 'We need a new opportunity to try the move. The team will agree a date at the next meeting.', 'Record next step'],
  ] as const)('directs reflection toward its next required control: %s / %s', (implementation, reflection, action) => {
    const options = props({ ...planned(), implementation, reflection });
    const markup = renderToStaticMarkup(createElement(ReflectWorkspace, options));
    const panel = visibleWorkspacePanel(markup, 'reflect-builder-panel', 4);
    const completeDraft = implementation && reflection.trim().length >= 30;
    expect(primaryAction(workflowActions(panel, !implementation ? 'Teaching attempt actions' : completeDraft ? 'Reflection actions' : 'Next action drafting'))).toContain(`<span>${action}</span>`);
    if (implementation && !completeDraft) expect(panel).toContain('id="reflection-requirement">Required · at least 30 characters');
    else if (completeDraft) {
      expect(panel).toContain(reflection);
      expect(panel).not.toContain('id="reflection"');
    }
    else {
      expect(panel).toContain('id="implementation-yes"');
      expect(panel).not.toContain('id="reflection"');
    }
    expect(panel).toContain('no collected follow-up dataset');
    expect(options.dispatch).not.toHaveBeenCalled();
    expect(options.submit).not.toHaveBeenCalled();
  });
});

describe('approved meeting handoff', () => {
  function readyProps(state: PlanState) {
    return { state, onOpenKit: vi.fn(), onEditPlan: vi.fn(), onReflect: vi.fn(), onEditCollection: vi.fn() };
  }

  it('shows the approved move, separate checks and unresolved collection commitments before reflection', () => {
    const state = apply(planned(), { type: 'consent', value: true }, { type: 'confirm-plan' });
    const before = structuredClone(state);
    const options = readyProps(state);
    const markup = renderToStaticMarkup(createElement(MeetingReady, options));
    for (const value of [state.action, state.owner, state.implementationCheck, state.learningCheck]) expect(markup).toContain(value);
    expect(markup).toContain('Open meeting kit');
    expect(markup).toContain('Not yet agreed');
    expect(markup.match(/Date not yet agreed/g)).toHaveLength(2);
    expect(markup.indexOf('Open meeting kit')).toBeLessThan(markup.indexOf('Go to reflection'));
    expect(markup).toContain('After the lesson');
    expect(markup).not.toContain('textarea');
    expect(state).toEqual(before);
    for (const callback of [options.onOpenKit, options.onEditPlan, options.onReflect, options.onEditCollection]) expect(callback).not.toHaveBeenCalled();
  });

  it('withholds the kit and ready status from a draft even when directly rendered', () => {
    const options = readyProps(planned());
    const markup = renderToStaticMarkup(createElement(MeetingReady, options));
    expect(markup).toContain('Review your meeting plan first.');
    expect(markup).not.toContain('Open meeting kit');
    expect(markup).not.toContain('Plan approved by you');
    expect(options.onOpenKit).not.toHaveBeenCalled();
  });
});

describe('workspace writing remains authored content', () => {
  const authored = 'Ask “what stayed equal?” & keep <script>alert("example")</script> as literal notes.\nDo not replace this second line.';
  const escaped = 'Ask “what stayed equal?” &amp; keep &lt;script&gt;alert(&quot;example&quot;)&lt;/script&gt; as literal notes.\nDo not replace this second line.';

  it('preserves exact interpretation and agenda content while escaping markup', () => {
    const state = { ...planned(), interpretation: authored, action: authored, agenda: planned().agenda.map((entry, index) => index === 3 ? authored : entry) };
    const before = structuredClone(state);
    for (const component of [ReasoningWorkspace, PlanWorkspace]) {
      const options = { ...props(state), errorField: component === PlanWorkspace ? 'agenda-3' : '' };
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
    expect(markup).toContain('data-task-content="question"');
    expect(markup).toContain('id="next-cycle-question"');
    expect(options.state.reflection).toBe(authored);
    expect(options.dispatch).not.toHaveBeenCalled();
  });
});

describe('Reflect separates this cycle from demonstration outcomes', () => {
  it.each([
    ['no', 'What prevented implementation'],
    ['partial', 'What was tried, what prevented the rest'],
    ['yes', 'What student work do you need'],
  ] as const)('guides a %s implementation report without manufacturing learning evidence', (implementation, question) => {
    const options = props({ ...planned(), implementation });
    const markup = renderToStaticMarkup(createElement(ReflectWorkspace, options));
    expect(markup).toContain(question);
    const fieldLabel = markup.match(/<label id="reflection-label"[^>]*>([^<]+)<\/label>/)?.[1];
    expect(fieldLabel).toContain(question);
    expect(markup).toContain('no collected follow-up dataset');
    expect(markup).toContain('Draft report');
    expect(markup).not.toContain('Reflection recorded with this plan.');
    expect(options.dispatch).not.toHaveBeenCalled();
    expect(options.submit).not.toHaveBeenCalled();
  });

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
    expect(markup).toContain('<details class="reflect-collection-disclosure">');
    expect(markup).not.toMatch(/<details\b[^>]*class="reflect-collection-disclosure"[^>]*\bopen/);
    expect(markup).toContain('id="reflect-collection"');
    expect(markup).toContain(state.evidenceCollector);
    expect(markup).toContain('2026-11-05');
    expect(markup).toContain('2026-11-09');
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
