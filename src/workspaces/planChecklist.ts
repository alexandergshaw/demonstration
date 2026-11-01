import type { ChecklistTask } from '../components/StageChecklist';
import { hasPlan, initialAgenda, isCalendarDate, type PlanState } from '../model';

interface PlanChecklistActions {
  move: () => void;
  activities: () => void;
  implementation: () => void;
  learning: () => void;
  collection: () => void;
  review: () => void;
}

/** Draft presence and explicit approval have different meanings; visiting a row changes neither. */
export function planChecklistItems(state: PlanState, actions: PlanChecklistActions): ChecklistTask[] {
  const approved = hasPlan(state);
  const moveReady = state.action.trim().length >= 25 && state.owner.trim().length >= 3;
  const adapted = state.agenda.filter((activity, index) => activity.trim().length >= 5 && activity.trim() !== initialAgenda[index]).length;
  const activitiesReady = approved || adapted === initialAgenda.length;
  const activitiesStarted = state.agenda.some(activity => Boolean(activity.trim()));
  const missingDirections = state.agenda.some(activity => activity.trim().length < 5);
  const activityStatus = approved ? 'Reviewed in approved plan' : activitiesReady ? 'Drafted' : !activitiesStarted ? 'Not drafted' : `${adapted} of ${initialAgenda.length} adapted · ${missingDirections ? 'add directions' : 'review starters'}`;
  const implementationReady = state.implementationCheck.trim().length >= 15;
  const learningReady = state.learningCheck.trim().length >= 15;
  const collectionStarted = Boolean(state.evidenceCollector.trim() || state.collectionDate || state.reviewDate);
  const collectionReady = Boolean(state.evidenceCollector.trim() && isCalendarDate(state.collectionDate) && isCalendarDate(state.reviewDate) && state.reviewDate >= state.collectionDate);
  const invalidDates = Boolean(state.collectionDate && !isCalendarDate(state.collectionDate) || state.reviewDate && (!isCalendarDate(state.reviewDate) || state.collectionDate && state.reviewDate < state.collectionDate));
  return [
    {
      id: 'move', label: 'Name the teaching move and owner', detail: 'Say what teachers will try and what thinking students will do.',
      status: moveReady ? 'done' : state.action.trim() ? 'started' : 'todo', statusLabel: moveReady ? 'Drafted' : state.action.trim() ? 'In progress' : 'To do', onSelect: actions.move,
    },
    {
      id: 'activities', label: 'Shape the six meeting activities', detail: 'Give the facilitator directions, evidence and an output for each activity.',
      status: activitiesReady ? 'done' : activitiesStarted ? 'started' : 'todo', statusLabel: activityStatus, onSelect: actions.activities,
    },
    {
      id: 'implementation', label: 'Plan the implementation check', detail: 'Name the record that would show whether the move was tried.',
      status: implementationReady ? 'done' : state.implementationCheck.trim() ? 'started' : 'todo', statusLabel: implementationReady ? 'Drafted' : state.implementationCheck.trim() ? 'In progress' : 'To do', onSelect: actions.implementation,
    },
    {
      id: 'learning', label: 'Plan the student learning check', detail: 'Name comparable student work and the reasoning you will examine.',
      status: learningReady ? 'done' : state.learningCheck.trim() ? 'started' : 'todo', statusLabel: learningReady ? 'Drafted' : state.learningCheck.trim() ? 'In progress' : 'To do', onSelect: actions.learning,
    },
    {
      id: 'collection', label: 'Arrange collection and review', detail: 'Add who will collect the work and when the team will revisit it.', optional: true,
      status: collectionReady ? 'done' : collectionStarted ? 'started' : 'todo', statusLabel: collectionReady ? 'Planned' : invalidDates ? 'Check dates' : collectionStarted ? 'Partly arranged' : 'Not arranged', onSelect: actions.collection,
    },
    {
      id: 'review', label: 'Review the kit and approve the plan', detail: 'Inspect the complete draft, then explicitly confirm that you own it.',
      status: approved ? 'done' : 'todo', statusLabel: approved ? 'Approved by you' : 'Awaiting approval', onSelect: actions.review,
    },
  ];
}
