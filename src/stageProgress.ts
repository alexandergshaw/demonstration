import { hasFocus, hasPlan, hasReflection, type PlanState } from './model';

/** A stage's check describes its own work, never completion inferred from a later stage. */
export function stageIsComplete(state: PlanState, stage: number): boolean {
  if (stage === 0) return ['results', 'task', 'selection'].every(item => state.evidenceReviewed.some(review => review === item));
  if (stage === 1) return hasFocus(state);
  if (stage === 2) return hasPlan(state);
  if (stage === 3) return hasReflection(state);
  return false;
}

export const stageCompletionLabels = ['Core evidence reviews checked', 'Focus confirmed', 'Plan approved', 'Next step recorded'] as const;
