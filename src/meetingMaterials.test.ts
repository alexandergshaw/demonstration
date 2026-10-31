import { describe, expect, it } from 'vitest';
import { createReferenceData } from './data/seed';
import { buildMeetingKit, exportMeetingHtml, exportMeetingNotes } from './meetingMaterials';
import { followUpSourceBlocks, lessonContext, selectedSourceBlocks } from './lessonContext';
import { hasPlan, hasReflection, initialState, reducer, type Action, type PlanState } from './model';

const reference = createReferenceData();
const apply = (state: PlanState, ...actions: Action[]) => actions.reduce(reducer, state);
function approved(): PlanState {
  return apply(initialState(),
    { type: 'evidence', id: 'responseB' },
    { type: 'text', field: 'interpretation', value: 'The gap could reflect the prompt as well as incomplete fraction reasoning.' },
    { type: 'challenge' },
    { type: 'text', field: 'focus', value: 'Test whether students can explain the same whole using fraction strips.' },
    { type: 'confirm-focus' },
    { type: 'agenda', index: 1, value: 'Read response B alone. Then compare with a colleague. Record a question to ask the student.' },
    { type: 'agenda', index: 3, value: 'Sketch two equal-length strips. Rehearse a question, and record what it reveals.' },
    { type: 'text', field: 'action', value: 'Teachers will ask students to explain equal-length fraction strips in the next lesson.' },
    { type: 'text', field: 'implementationCheck', value: 'Each teacher shares a lesson note at the next PLC.' },
    { type: 'text', field: 'learningCheck', value: 'Bring comparable fraction-strip explanations scored with the same rubric.' },
    { type: 'consent', value: true }, { type: 'confirm-plan' });
}

describe('meeting materials preserve educator ownership', () => {
  it('rejects unapproved and edited plans for both portable formats and preview', () => {
    const valid = approved();
    const changed = reducer(valid, { type: 'agenda', index: 3, value: 'Changed rehearsal directions needing a fresh approval.' });
    for (const state of [initialState(), changed]) {
      expect(() => buildMeetingKit(state, reference)).toThrow(/Approve/);
      expect(() => exportMeetingHtml(state, reference)).toThrow(/Approve/);
      expect(() => exportMeetingNotes(state, reference)).toThrow(/Approve/);
    }
  });
  it('uses exact approved directions, focus, action and both checks in reusable materials', () => {
    const state = approved(), pages = buildMeetingKit(state, reference), output = JSON.stringify(pages);
    expect(pages).toHaveLength(8);
    for (const text of [...state.agenda, state.focus, state.action, state.owner, state.implementationCheck, state.learningCheck]) expect(output).toContain(text);
    const handout = pages[7];
    expect(handout.blocks.some(block => block.text === state.agenda[1])).toBe(true);
    expect(handout.blocks.some(block => block.text === state.agenda[3])).toBe(true);
    expect(handout.blocks.some(block => block.heading.includes('complete together'))).toBe(true);
  });
  it('includes task, rubric, selected quotations and historical context only when selected', () => {
    let state = approved();
    const text = exportMeetingNotes(state, reference);
    expect(text).toContain(lessonContext.prompt);
    expect(text).toContain(lessonContext.rubric);
    expect(text).toContain(reference.responses[0].quote);
    expect(text).not.toContain(reference.responses[1].quote);
    expect(text).not.toContain(reference.observation.quote);
    state = apply(state, { type: 'evidence', id: 'observation' }, { type: 'challenge' }, { type: 'confirm-focus' }, { type: 'consent', value: true }, { type: 'confirm-plan' });
    const blocks = selectedSourceBlocks(reference, state.selected);
    expect(blocks.some(block => block.heading.includes('Sep 9') && block.heading.includes('One classroom') && block.text.includes(reference.observation.quote) && block.text.includes(reference.observation.caution))).toBe(true);
  });
  it('reports counts honestly without manufacturing student-level or causal conclusions', () => {
    const text = exportMeetingNotes(approved(), reference);
    for (const row of reference.classes) expect(text).toContain(`${row.label}: ${row.correct}/${row.total} correct fraction; ${row.explanations}/${row.total} adequate explanation.`);
    expect(text).toContain('not a representative sample');
    expect(text).toContain('do not show which students met both criteria');
    expect(text).toContain('not supplied district curriculum');
  });
  it('escapes hostile educator text and carries long multiline directions without truncation', () => {
    const attack = '<script>alert("unsafe")</script><img src=x onerror=alert(1)> & \'';
    const long = attack + '\n' + 'Long directions '.repeat(240);
    const state = apply(approved(), { type: 'agenda', index: 1, value: long }, { type: 'consent', value: true }, { type: 'confirm-plan' });
    const html = exportMeetingHtml(state, reference);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp; &#39;');
    expect(html).toContain('Long directions '.repeat(240));
    expect(html).toContain('Content-Security-Policy');
    expect(html).toContain('@media print');
  });
  it('does not overwrite or reinterpret an already saved agenda when adding materials', () => {
    // This is the prior six-title format, including its former strategy suggestion.
    const state = apply(approved(), { type: 'agenda', index: 3, value: 'Design a partner-discussion routine' }, { type: 'consent', value: true }, { type: 'confirm-plan' });
    const before = JSON.stringify(state);
    buildMeetingKit(state, reference);
    exportMeetingHtml(state, reference);
    expect(JSON.stringify(state)).toBe(before);
    expect(hasPlan(state)).toBe(true);
    expect(initialState().agenda[3]).not.toContain('partner-discussion');
  });
  it('carries comparison limits with exact recorded reflection text, without adding future results to the meeting kit', () => {
    const reflection = 'We cannot call this progress yet. Check the task and missing responses before attributing change. <note>Keep my wording & uncertainty.</note>';
    const state = apply(approved(), { type: 'implementation', value: 'partial' }, { type: 'text', field: 'reflection', value: reflection }, { type: 'save-reflection' });
    const before = JSON.stringify(state), notes = exportMeetingNotes(state, reference);
    expect(hasReflection(state)).toBe(true);
    expect(notes).toContain('Implementation: partial');
    expect(notes).toContain('Recorded reflection: ' + reflection);
    expect(notes).toContain('Follow-up illustration: 56/120');
    for (const block of followUpSourceBlocks(reference)) {
      expect(notes).toContain(block.heading + '\n' + block.text);
    }
    expect(notes).toContain('not a prediction or an observed outcome of your plan');
    expect(notes).toContain('Equal denominators do not establish the same students or complete coverage');
    expect(buildMeetingKit(state, reference)).toHaveLength(8);
    for (const prospective of [JSON.stringify(buildMeetingKit(state, reference)), exportMeetingHtml(state, reference)]) {
      expect(prospective).not.toContain(reflection);
      expect(prospective).not.toContain('56/120');
      expect(prospective).not.toContain('Fixed fictional comparison');
    }
    expect(JSON.stringify(state)).toBe(before);
  });
  it('excludes unrecorded and invalidated reflection context until the current reflection is saved again', () => {
    const draft = apply(approved(), { type: 'implementation', value: 'partial' }, { type: 'text', field: 'reflection', value: 'First reflection: the illustrative counts need a verified task and response coverage.' });
    const recorded = apply(draft, { type: 'save-reflection' });
    const edited = apply(recorded, { type: 'text', field: 'reflection', value: 'Revised reflection: obtain dated follow-up work and check who responded before comparing.' });
    const statusChanged = apply(recorded, { type: 'implementation', value: 'no' });
    for (const state of [approved(), draft, edited, statusChanged]) {
      expect(hasReflection(state)).toBe(false);
      const notes = exportMeetingNotes(state, reference);
      expect(notes).not.toContain('RECORDED FOLLOW-UP COMPARISON CONTEXT');
      expect(notes).not.toContain('Follow-up illustration:');
      if (state.reflection) expect(notes).not.toContain(state.reflection);
    }
    const savedAgain = apply(edited, { type: 'save-reflection' });
    expect(exportMeetingNotes(savedAgain, reference)).toContain('Recorded reflection: ' + edited.reflection);
    expect(exportMeetingNotes(savedAgain, reference)).toContain('RECORDED FOLLOW-UP COMPARISON CONTEXT');
    expect(exportMeetingNotes(savedAgain, reference)).not.toContain(recorded.reflection);
    const upstreamEdit = apply(recorded, { type: 'text', field: 'action', value: 'A changed teaching action needs fresh approval before this cycle can be exported.' });
    expect(() => exportMeetingNotes(upstreamEdit, reference)).toThrow(/Approve/);
  });
});
