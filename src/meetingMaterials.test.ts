import { describe, expect, it } from 'vitest';
import { createReferenceData } from './data/seed';
import { buildMeetingKit, exportMeetingHtml, exportMeetingNotes } from './meetingMaterials';
import { followUpSourceBlocks, lessonContext, selectedSourceBlocks } from './lessonContext';
import { hasPlan, hasReflection, initialState, parseStoredState, reducer, type Action, type PlanState } from './model';

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
  it('carries exact approved collection plans into materials without presenting them as collected evidence', () => {
    const collector = 'Ms. Chen & team <script>not markup</script>';
    const state = apply(approved(),
      { type: 'text', field: 'evidenceCollector', value: collector },
      { type: 'text', field: 'collectionDate', value: '2026-11-06' },
      { type: 'text', field: 'reviewDate', value: '2026-11-09' },
      { type: 'consent', value: true }, { type: 'confirm-plan' });
    const pages = buildMeetingKit(state, reference);
    for (const page of [pages[5], pages[7]]) {
      const collection = page.blocks.find(block => block.heading === 'PLANNED · Evidence collection & review');
      expect(collection?.text).toBe(`Who will collect: ${collector}\nPlanned collection date: 2026-11-06\nPlanned PLC review date: 2026-11-09\nThese are plans, not evidence that collection or review occurred.`);
    }
    const html = exportMeetingHtml(state, reference);
    expect(html).toContain('Ms. Chen &amp; team &lt;script&gt;not markup&lt;/script&gt;');
    expect(html).not.toContain('<script>');
    const notes = exportMeetingNotes(state, reference);
    for (const text of [collector, '2026-11-06', '2026-11-09']) expect(notes).toContain(text);
    expect(notes).toMatch(/planned/i);
    expect(html).not.toContain('Follow-up illustration: 56/120');
    expect(() => buildMeetingKit(reducer(state, { type: 'text', field: 'collectionDate', value: '2026-11-07' }), reference)).toThrow(/Approve/);
  });

  it('keeps older approved plans usable without inventing optional collection details', () => {
    const legacy: Partial<PlanState> = { ...approved() };
    delete legacy.evidenceCollector; delete legacy.collectionDate; delete legacy.reviewDate; delete legacy.nextCycleQuestion;
    const restored = parseStoredState(legacy).state;
    expect(hasPlan(restored)).toBe(true);
    const pages = buildMeetingKit(restored, reference);
    expect(pages).toHaveLength(8);
    expect(pages.some(page => page.blocks.some(block => block.heading === 'PLANNED · Evidence collection & review'))).toBe(false);
    const notes = exportMeetingNotes(restored, reference);
    expect(notes).not.toContain('Evidence collector:');
    expect(notes).not.toContain('Planned collection date:');
    expect(notes).not.toContain('Question for the next PLC:');
  });

  it('exports the next inquiry question only with the current recorded reflection and never in the initial meeting kit', () => {
    const question = 'Which comparable student explanations would distinguish a task-reading issue from fraction reasoning?';
    const draft = apply(approved(),
      { type: 'implementation', value: 'partial' },
      { type: 'text', field: 'reflection', value: 'The fixed comparison does not establish progress. We need comparable work and implementation evidence.' },
      { type: 'text', field: 'nextCycleQuestion', value: question });
    const recorded = apply(draft, { type: 'save-reflection' });
    const edited = apply(recorded, { type: 'text', field: 'nextCycleQuestion', value: 'A revised question: which responses are still missing from the collection?' });
    expect(exportMeetingNotes(recorded, reference)).toContain(question);
    for (const state of [draft, edited]) {
      expect(hasReflection(state)).toBe(false);
      expect(exportMeetingNotes(state, reference)).not.toContain(state.nextCycleQuestion);
      expect(exportMeetingNotes(state, reference)).not.toContain(state.reflection);
    }
    for (const state of [draft, recorded, edited]) {
      expect(JSON.stringify(buildMeetingKit(state, reference))).not.toContain(state.nextCycleQuestion);
      expect(exportMeetingHtml(state, reference)).not.toContain(state.nextCycleQuestion);
      expect(exportMeetingHtml(state, reference)).not.toContain(state.reflection);
    }
  });

  it('supports a task-specific rehearsal while retaining authored directions and leaving student reasoning blank', () => {
    const state = approved(), pages = buildMeetingKit(state, reference), handout = pages[7];
    expect(pages[3].title).toBe('Design & rehearse the teaching move');
    expect(pages[3].blocks[0].text).toBe(state.agenda[3]);
    expect(handout.blocks.some(block => block.text === state.agenda[3])).toBe(true);
    const guide = handout.blocks.find(block => block.heading === 'Optional rehearsal guide · fraction equivalence')!;
    expect(guide.text).toContain('selected student response or the original task');
    expect(guide.text).toContain('equal amounts of the same whole');
    expect(guide.text).toContain('beyond a doubling rule alone');
    expect(guide.text).toContain('partitioning change the number of parts while preserving the amount');
    expect(guide.text).toContain('hypothesis to test, not a claim about the student');
    const notes = handout.blocks.find(block => block.heading === 'Optional rehearsal notes · complete together')!;
    expect(notes.text).toBe('Selected student response or original task and what to examine:\n\nTeacher question to rehearse:\n\nAnticipated student reasoning:\n\nPeer feedback:\n\nRevised teacher question:\n\nWhat thinking will students still do themselves?\n\n');
    expect(pages[6].blocks.some(block => block.text === lessonContext.prompt)).toBe(true);
  });

  it('carries the current approved access plan into the teaching section, handout and exports with escaped HTML', () => {
    const note = 'Keep the fraction goal. Offer writing or drawing; ask whose voice is missing. <script>unsafe</script> & "quoted"';
    const state = apply(approved(), { type: 'text', field: 'accessParticipation', value: note }, { type: 'consent', value: true }, { type: 'confirm-plan' });
    const pages = buildMeetingKit(state, reference);
    expect(pages).toHaveLength(8);
    for (const page of [pages[3], pages[7]]) {
      expect(page.blocks.some(block => block.heading === 'Access & participation · leader plan' && block.text === note)).toBe(true);
    }
    expect(exportMeetingNotes(state, reference)).toContain(note);
    const html = exportMeetingHtml(state, reference);
    expect(html).toContain('&lt;script&gt;unsafe&lt;/script&gt; &amp; &quot;quoted&quot;');
    expect(html).not.toContain('<script>');
    expect(html).toContain('@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}');
    const changed = reducer(state, { type: 'text', field: 'accessParticipation', value: 'A revised support needs renewed approval.' });
    expect(() => buildMeetingKit(changed, reference)).toThrow(/Approve/);
    expect(() => exportMeetingNotes(changed, reference)).toThrow(/Approve/);
    expect(() => exportMeetingHtml(changed, reference)).toThrow(/Approve/);
  });

  it('does not invent an access commitment when optional notes were left blank', () => {
    const state = approved();
    expect(state.accessParticipation).toBe('');
    expect(buildMeetingKit(state, reference).some(page => page.blocks.some(block => block.heading === 'Access & participation · leader plan'))).toBe(false);
    expect(exportMeetingNotes(state, reference)).not.toContain('Access & participation plan:');
    expect(hasPlan(state)).toBe(true);
  });

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
