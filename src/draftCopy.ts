import { evidenceSnapshotDescription, referenceForVersion } from './data/evidenceSnapshots';
import type { ReferenceData } from './data/seed';
import { selectedSourceBlocks, taskBlocks } from './lessonContext';
import { agendaHeadings } from './meetingMaterials';
import { hasFocus, hasPlan, hasReflection, minutes, type PlanState } from './model';

/** A manual recovery reference, including unfinished writing; never a saved or approved artifact. */
export function exportDraftCopy(state: PlanState, reference: ReferenceData, cycleTitle: string): string {
  const currentReference = referenceForVersion(reference, state.evidenceVersion);
  const field = (label: string, value: string) => `${label}\n${value === '' ? '(Not entered)' : value}`;
  const implementation = state.implementation === 'yes' ? 'Used as planned'
    : state.implementation === 'partial' ? 'Partially used'
    : state.implementation === 'no' ? 'Not yet used' : 'Not reported';
  const sources = selectedSourceBlocks(currentReference, state.selected);

  return [
    'THROUGHLINE | Draft recovery copy',
    'May include unsaved work. This download does not save the workspace or approve any decisions.',
    'This is a manual reference copy, not an approved meeting kit. Automatic import is not available.',
    'Fictional demonstration · Scripted prompts · No live AI',
    field('Cycle', cycleTitle),
    'CURRENT DRAFT STATUS',
    `Workspace stage: ${['Evidence', 'Interpret', 'Plan', 'Reflect'][state.step] ?? 'Unknown'}`,
    `Focus: ${hasFocus(state) ? 'Confirmed in this draft' : 'Not currently confirmed'}`,
    `Meeting plan: ${hasPlan(state) ? 'Approved in this draft' : 'Not currently approved'}`,
    `Reflection: ${hasReflection(state) ? 'Recorded in this draft' : 'Not currently recorded'}`,
    'These states describe the current draft, not whether the latest changes were saved in the browser.',
    'EVIDENCE COLLECTION',
    evidenceSnapshotDescription(state.evidenceVersion),
    'SELECTED EVIDENCE',
    ...sources.map(source => field(source.heading, source.text)),
    'ORIGINAL TASK AND SCORING',
    ...taskBlocks().map(source => field(source.heading, source.text)),
    'INTERPRETATION AND FOCUS',
    field('Your interpretation', state.interpretation),
    field('Alternative lens', state.lens),
    `Thinking prompt considered: ${state.challenged ? 'Yes' : 'Not yet'}`,
    field('Teaching focus', state.focus),
    field('Confidence', state.confidence),
    'MEETING PLAN',
    field('Teaching move', state.action),
    field('Who will try it', state.owner),
    ...agendaHeadings.map((heading, index) => field(`Activity ${index + 1}: ${heading} · ${minutes[index]} minutes`, state.agenda[index] ?? '')),
    field('Implementation check', state.implementationCheck),
    field('Student learning check', state.learningCheck),
    field('Access and participation', state.accessParticipation),
    field('Who will collect', state.evidenceCollector),
    field('Planned collection date', state.collectionDate),
    field('Planned review date', state.reviewDate),
    `Plan ownership confirmation: ${state.consent ? 'Given in this draft' : 'Not currently given'}`,
    'Planned checks and dates do not establish that collection or review occurred.',
    'FOLLOW-UP DRAFT',
    field('Teaching attempt report', implementation),
    field('Reflection and next action', state.reflection),
    field('Question for the next PLC', state.nextCycleQuestion),
    'An implementation report is separate from evidence of student learning. Worked examples are not results for this cycle.',
  ].join('\n\n') + '\n';
}
