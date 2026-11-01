import { hasPlan, initialAgenda, isCalendarDate, type PlanState } from '../model';

export type PlanBuilderStep = 'move' | 'activities' | 'checks' | 'review';
export const planBuilderSteps = [
  { id: 'move', label: 'Teaching move', panelId: 'pw-move-panel' },
  { id: 'activities', label: 'Meeting activities', panelId: 'pw-activities-panel' },
  { id: 'checks', label: 'Follow-up checks', panelId: 'pw-checks-panel' },
  { id: 'review', label: 'Review & approve', panelId: 'pw-review-panel' },
] as const;

export function planStepForField(field: string): PlanBuilderStep | undefined {
  if (field === 'action' || field === 'owner') return 'move';
  if (field.startsWith('agenda-') || field === 'access-participation') return 'activities';
  if (['implementation-check', 'learning-check', 'evidence-collector', 'collection-date', 'review-date'].includes(field)) return 'checks';
  if (field === 'consent') return 'review';
  return undefined;
}

export function initialPlanActivity(state: PlanState, errorField = ''): number {
  if (errorField === 'access-participation') return 3;
  if (errorField.startsWith('agenda-')) {
    const index = Number(errorField.slice(7));
    if (Number.isInteger(index) && index >= 0 && index < state.agenda.length) return index;
  }
  const incomplete = state.agenda.findIndex(activity => activity.trim().length < 5);
  if (incomplete >= 0) return incomplete;
  return Math.max(0, state.agenda.findIndex((activity, index) => activity.trim() === initialAgenda[index]));
}

/** Resume a draft without changing its data or inferring approval from completeness. */
export function initialPlanStep(state: PlanState, collectionEntry = false, errorField = ''): PlanBuilderStep {
  const errorStep = planStepForField(errorField);
  if (errorStep) return errorStep;
  if (collectionEntry) return 'checks';
  if (hasPlan(state)) return 'review';
  if (state.action.trim().length < 25 || state.owner.trim().length < 3) return 'move';
  // Starter text is valid draft data, but resuming here invites inspection rather than implying it was reviewed.
  if (state.agenda.some((activity, index) => activity.trim().length < 5 || activity.trim() === initialAgenda[index])) return 'activities';
  if (state.implementationCheck.trim().length < 15 || state.learningCheck.trim().length < 15) return 'checks';
  if (state.collectionDate && !isCalendarDate(state.collectionDate)) return 'checks';
  if (state.reviewDate && (!isCalendarDate(state.reviewDate) || (state.collectionDate && state.reviewDate < state.collectionDate))) return 'checks';
  return 'review';
}
