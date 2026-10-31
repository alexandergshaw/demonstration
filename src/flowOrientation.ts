import { initialState, type PlanState } from './model';

/** Purpose and handoff for the real instructional cycle, separate from help completion. */
export const flowOrientation = [
  {
    phase: 'Prepare your meeting · 1 of 3',
    purpose: 'Start with a specific source so your team can see what prompted the discussion.',
    outcome: 'Evidence you can point to in the meeting.',
    why: 'Scores show a pattern; original work, the task and dates help you judge what it can support.',
  },
  {
    phase: 'Prepare your meeting · 2 of 3',
    purpose: 'Turn what you notice into one teaching focus by testing another possible explanation.',
    outcome: 'One focus you can explain in your own words.',
    why: 'An alternative is a thinking prompt. You decide whether to revise or keep your interpretation before confirming the focus.',
  },
  {
    phase: 'Prepare your meeting · 3 of 3',
    purpose: 'Build a meeting around your confirmed focus and one observable teaching move.',
    outcome: 'A reviewed agenda, source packet and activity, with separate implementation and learning checks.',
    why: 'Your directions prepare colleagues to discuss, practice and agree what to try. Approval makes the meeting materials available; teaching happens afterwards.',
  },
  {
    phase: 'After teaching',
    purpose: 'After the teaching attempt, report what happened and choose the next supported step.',
    outcome: 'A recorded next action, or a plan to collect the evidence still needed.',
    why: 'Implementation and learning need different evidence. This cycle has no collected follow-up dataset; identify what you still need before judging impact.',
  },
] as const;

export const meetingOrientation = {
  phase: 'Take it into the meeting',
  purpose: 'Use your approved kit with the team, try the teaching move, then return to Reflect.',
  outcome: 'Meeting materials you can present, print or export.',
  why: 'Plan approval records your decision. The next evidence comes from classroom implementation and comparable student work.',
} as const;

/** An introduction must never interrupt a later stage or an already authored decision. */
export function shouldIntroduceFlow(state: PlanState, welcomeDismissed: boolean): boolean {
  if (welcomeDismissed || state.step !== 0 || state.review || state.implementation) return false;
  const baseline = initialState();
  return ![state.interpretation, state.focus, state.action, state.reflection,
    state.implementationCheck, state.learningCheck, state.accessParticipation,
    state.evidenceCollector, state.collectionDate, state.reviewDate, state.nextCycleQuestion].some(value => value.trim()) &&
    state.owner === baseline.owner && state.agenda.length === baseline.agenda.length &&
    state.agenda.every((value, index) => value === baseline.agenda[index]);
}
