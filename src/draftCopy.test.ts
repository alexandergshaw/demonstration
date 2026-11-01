import { describe, expect, it } from 'vitest';
import { referenceForVersion } from './data/evidenceSnapshots';
import { createReferenceData } from './data/seed';
import { exportDraftCopy } from './draftCopy';
import { hasPlan, hasReflection, initialState, reducer, type Action, type PlanState } from './model';

const apply = (state: PlanState, ...actions: Action[]) => actions.reduce(reducer, state);

describe('draft recovery copy', () => {
  it('preserves unfinished writing and every educator field exactly without approving or mutating it', () => {
    const state: PlanState = {
      ...initialState(),
      interpretation: '  First observation.\nA second line with “student words” and café.  ',
      lens: 'variation',
      challenged: true,
      focus: 'Short draft',
      confidence: 'tentative',
      agenda: ['Opening notes', 'Read response B\nCompare claims', 'Alternative account', 'Rehearse a question', 'Agree who tries it', 'Plan the collection'],
      action: 'Unfinished move',
      owner: 'Ms. Rivera’s team',
      implementationCheck: 'Dated lesson notes',
      learningCheck: 'Independent student explanations',
      accessParticipation: '  Draw, speak or write an explanation.  ',
      evidenceCollector: 'PLC facilitator',
      collectionDate: '2026-11-03',
      reviewDate: '2026-11-05',
      implementation: 'no',
      reflection: 'Materials were not available; prepare them before the next attempt.',
      nextCycleQuestion: 'What does the drawing show about equal amounts?',
    };
    const reference = createReferenceData();
    const before = structuredClone({ state, reference });
    const copy = exportDraftCopy(state, reference, '  Fraction discussion  ');

    for (const value of [state.interpretation, state.focus, ...state.agenda, state.action, state.owner,
      state.implementationCheck, state.learningCheck, state.accessParticipation, state.evidenceCollector,
      state.collectionDate, state.reviewDate, state.reflection, state.nextCycleQuestion]) expect(copy).toContain(value);
    expect(copy).toContain('Cycle\n  Fraction discussion  ');
    expect(copy).toContain(`Your interpretation\n${state.interpretation}\n\n`);
    expect(copy).toContain('Alternative lens\nvariation');
    expect(copy).toContain('Confidence\ntentative');
    expect(copy).toContain('Thinking prompt considered: Yes');
    expect(copy).toContain('Teaching attempt report\nNot yet used');
    expect(copy).toContain('Plan ownership confirmation: Not currently given');
    expect(copy).toContain('Meeting plan: Not currently approved');
    expect(copy).toContain('Draft recovery copy');
    expect(copy).toContain('Automatic import is not available.');
    expect({ state, reference }).toEqual(before);
    expect(hasPlan(state)).toBe(false);
  });

  it('binds complete selected quotations and counts to the current collection, excluding unselected work', () => {
    const reference = createReferenceData();
    const state: PlanState = { ...initialState(), evidenceVersion: 'oct29', selected: ['assessment', 'responseB', 'observation'] };
    const current = referenceForVersion(reference, 'oct29');
    const copy = exportDraftCopy(state, reference, 'October 29 review');
    const selected = current.responses.find(response => response.id === 'responseB')!;
    const unselected = current.responses.find(response => response.id === 'responseC')!;
    expect(copy).toContain(selected.quote);
    expect(copy).toContain(current.observation.quote);
    expect(copy).toContain(String(current.assessment.total));
    expect(copy).toContain(current.assessment.date);
    expect(copy).not.toContain(reference.responses.find(response => response.id === 'responseB')!.quote);
    expect(copy).not.toContain(unselected.quote);
    expect(state.evidenceVersion).toBe('oct29');
    expect(reference.assessment.total).toBe(120);
  });

  it('labels existing confirmations as draft states without exposing signatures or claiming a saved meeting kit', () => {
    const state = apply(initialState(),
      { type: 'text', field: 'interpretation', value: 'Correct choices are more common than explanations of equal amounts of the same whole.' },
      { type: 'challenge' },
      { type: 'text', field: 'focus', value: 'Help students explain why partitioning preserves the same amount.' },
      { type: 'confirm-focus' },
      { type: 'text', field: 'action', value: 'Ask students to draw two equivalent fractions and explain the equal amounts.' },
      { type: 'text', field: 'implementationCheck', value: 'Bring a dated note describing the prompt and response.' },
      { type: 'text', field: 'learningCheck', value: 'Collect independent explanations with a comparable task and rubric.' },
      { type: 'consent', value: true },
      { type: 'confirm-plan' },
      { type: 'implementation', value: 'partial' },
      { type: 'text', field: 'reflection', value: 'The opening prompt was tried; rehearse the partner explanation before collecting comparable work.' },
      { type: 'save-reflection' });
    const before = structuredClone(state);
    expect(hasPlan(state)).toBe(true);
    expect(hasReflection(state)).toBe(true);
    const copy = exportDraftCopy(state, createReferenceData(), 'Recorded cycle');
    expect(copy).toContain('Focus: Confirmed in this draft');
    expect(copy).toContain('Meeting plan: Approved in this draft');
    expect(copy).toContain('Reflection: Recorded in this draft');
    expect(copy).toContain('May include unsaved work.');
    expect(copy).toContain('not an approved meeting kit');
    expect(copy).toContain('This download does not save the workspace or approve any decisions.');
    for (const signature of [state.focusStamp, state.planStamp, state.reflectionStamp]) {
      expect(signature).not.toBeNull();
      expect(copy).not.toContain(signature!);
    }
    expect(copy).not.toContain('focusStamp');
    expect(copy).not.toContain('planStamp');
    expect(copy).not.toContain('reflectionStamp');
    expect(state).toEqual(before);
  });
});
