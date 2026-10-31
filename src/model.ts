export const STORAGE_KEY = 'throughline.draft.v1';
// Nested approval snapshots expand JSON escapes; every permitted 4,000-character field must round-trip.
const MAX_DRAFT_LENGTH = 2_000_000;
export const evidenceLabels = {
  assessment: 'Oct 28 cool-down · 120 responses',
  responseB: 'Student response B · Procedure described',
  responseC: 'Student response C · Fraction comparison error',
  observation: 'Sep 9 observation · One classroom · Historical context',
};
export type EvidenceId = keyof typeof evidenceLabels;
export type Lens = 'wording' | 'meaning' | 'variation';
export const minutes = [5, 10, 10, 15, 5, 5];
export const initialAgenda = [
  'Reaffirm the instructional goal', 'Examine student explanations',
  'Discuss patterns and alternative explanations', 'Design one teaching change grounded in the evidence',
  'Agree on classroom implementation', 'Choose follow-up evidence',
];
export interface PlanState {
  step: number; selected: EvidenceId[]; interpretation: string; lens: Lens;
  challenged: boolean; focus: string; confidence: 'tentative' | 'moderate' | 'strong';
  focusStamp: string | null; agenda: string[]; action: string; owner: string;
  implementationCheck: string; learningCheck: string; accessParticipation: string; consent: boolean;
  planStamp: string | null; implementation: '' | 'yes' | 'partial' | 'no';
  reflection: string; reflectionStamp: string | null; review: boolean;
  evidenceCollector: string; collectionDate: string; reviewDate: string; nextCycleQuestion: string;
}
export const initialState = (): PlanState => ({
  step: 0, selected: ['assessment'], interpretation: '', lens: 'wording', challenged: false,
  focus: '', confidence: 'moderate', focusStamp: null, agenda: [...initialAgenda],
  action: '', owner: 'Grade 4 teaching team', implementationCheck: '', learningCheck: '', accessParticipation: '',
  consent: false, planStamp: null, implementation: '', reflection: '', reflectionStamp: null, review: false,
  evidenceCollector: '', collectionDate: '', reviewDate: '', nextCycleQuestion: '',
});
const focusSignature = (s: PlanState) => JSON.stringify([s.selected, s.interpretation, s.lens, s.challenged, s.focus, s.confidence]);
// Empty optional notes retain the original signature so existing approvals remain valid.
const planSignature = (s: PlanState) => JSON.stringify([s.focusStamp, s.agenda, s.action, s.owner, s.implementationCheck, s.learningCheck, s.consent, ...(s.accessParticipation ? [s.accessParticipation] : []),
  ...(s.evidenceCollector || s.collectionDate || s.reviewDate ? [{ extension: 'plan-v3', evidenceCollector: s.evidenceCollector, collectionDate: s.collectionDate, reviewDate: s.reviewDate }] : []),
]);
const reflectionSignature = (s: PlanState) => JSON.stringify([s.planStamp, s.implementation, s.reflection,
  ...(s.nextCycleQuestion ? [{ extension: 'reflection-v3', nextCycleQuestion: s.nextCycleQuestion }] : []),
]);
export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return day <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}
const isOptionalDate = (value: string) => value === '' || isCalendarDate(value);
export function focusError(s: PlanState): string {
  if (s.interpretation.trim().length < 30) return 'Write an interpretation of at least 30 characters in your own words.';
  if (!s.challenged) return 'Review a thinking-partner challenge before confirming your focus.';
  if (s.focus.trim().length < 25) return 'Describe one specific instructional focus in at least 25 characters.';
  return '';
}
export const hasFocus = (s: PlanState) => !focusError(s) && s.focusStamp === focusSignature(s);
export function planError(s: PlanState): string {
  if (!hasFocus(s)) return 'Reconfirm your instructional focus before approving the meeting.';
  if (s.agenda.some(a => a.trim().length < 5)) return 'Describe an activity of at least 5 characters for every agenda segment.';
  if (s.action.trim().length < 25) return 'Describe a concrete teaching action in at least 25 characters.';
  if (s.owner.trim().length < 3) return 'Name who will try the strategy (at least 3 characters).';
  if (s.implementationCheck.trim().length < 15) return 'Describe how you will check implementation (at least 15 characters).';
  if (s.learningCheck.trim().length < 15) return 'Describe how you will check student learning (at least 15 characters).';
  if (!isOptionalDate(s.collectionDate)) return 'Choose a valid collection date.';
  if (!isOptionalDate(s.reviewDate)) return 'Choose a valid review date.';
  if (s.collectionDate && s.reviewDate && s.reviewDate < s.collectionDate) return 'Choose a review date on or after the collection date.';
  if (!s.consent) return 'Confirm that you reviewed and own this plan.';
  return '';
}
export const hasPlan = (s: PlanState) => !planError(s) && s.planStamp === planSignature(s);
export function reflectionError(s: PlanState): string {
  if (!hasPlan(s)) return 'Approve the current meeting plan before recording follow-up.';
  if (!s.implementation) return 'Choose what happened when the strategy was tried.';
  if (s.reflection.trim().length < 30) return 'Reflect on the evidence and next step in at least 30 characters.';
  return '';
}
export const hasReflection = (s: PlanState) => !reflectionError(s) && s.reflectionStamp === reflectionSignature(s);
type TextField = 'interpretation' | 'focus' | 'action' | 'owner' | 'implementationCheck' | 'learningCheck' | 'accessParticipation' | 'reflection' | 'evidenceCollector' | 'collectionDate' | 'reviewDate' | 'nextCycleQuestion';
export type Action =
  | { type: 'text'; field: TextField; value: string }
  | { type: 'evidence'; id: EvidenceId }
  | { type: 'lens'; value: Lens }
  | { type: 'confidence'; value: PlanState['confidence'] }
  | { type: 'agenda'; index: number; value: string }
  | { type: 'consent'; value: boolean }
  | { type: 'implementation'; value: PlanState['implementation'] }
  | { type: 'go'; step: number }
  | { type: 'challenge' | 'confirm-focus' | 'confirm-plan' | 'save-reflection' | 'reset' };
function invalidatePlan(s: PlanState): PlanState {
  return { ...s, planStamp: null, consent: false, reflectionStamp: null, review: s.review || s.planStamp !== null };
}
function invalidateFocus(s: PlanState): PlanState {
  return { ...invalidatePlan(s), focusStamp: null, review: s.review || s.focusStamp !== null || s.planStamp !== null };
}
export function reducer(s: PlanState, action: Action): PlanState {
  switch (action.type) {
    case 'reset': return initialState();
    case 'text': {
      if (s[action.field] === action.value) return s;
      const value = action.value.slice(0, 4000);
      if (action.field === 'reflection' || action.field === 'nextCycleQuestion') return { ...s, [action.field]: value, reflectionStamp: null };
      const next = action.field === 'interpretation' || action.field === 'focus' ? invalidateFocus(s) : invalidatePlan(s);
      return { ...next, [action.field]: value, challenged: action.field === 'interpretation' ? false : next.challenged };
    }
    case 'evidence':
      if (action.id === 'assessment') return s;
      return { ...invalidateFocus(s), challenged: false, selected: s.selected.includes(action.id) ? s.selected.filter(id => id !== action.id) : [...s.selected, action.id] };
    case 'lens': return action.value === s.lens ? s : { ...invalidateFocus(s), lens: action.value, challenged: false };
    case 'confidence': return action.value === s.confidence ? s : { ...invalidateFocus(s), confidence: action.value };
    case 'agenda': {
      if (action.index < 0 || action.index >= minutes.length || !Number.isInteger(action.index) || s.agenda[action.index] === action.value) return s;
      return { ...invalidatePlan(s), agenda: s.agenda.map((text, i) => i === action.index ? action.value.slice(0, 4000) : text) };
    }
    case 'consent': return action.value === s.consent ? s : { ...invalidatePlan(s), consent: action.value };
    case 'implementation': return action.value === s.implementation ? s : { ...s, implementation: action.value, reflectionStamp: null };
    case 'go':
      if (![0, 1, 2, 3].includes(action.step) || (action.step >= 2 && !hasFocus(s)) || (action.step === 3 && !hasPlan(s))) return s;
      return { ...s, step: action.step };
    case 'challenge': return s.interpretation.trim().length < 30 ? s : { ...s, challenged: true };
    case 'confirm-focus': return focusError(s) ? s : { ...s, focusStamp: focusSignature(s), step: 2 };
    case 'confirm-plan': return planError(s) ? s : { ...s, planStamp: planSignature(s), review: false, step: 3 };
    case 'save-reflection': return reflectionError(s) ? s : { ...s, reflectionStamp: reflectionSignature(s) };
  }
}
export function exportPlan(s: PlanState, labels = evidenceLabels): string {
  if (!hasPlan(s)) throw new Error('Approve the current plan before exporting.');
  return [
    'THROUGHLINE | PLC PLANNING PARTNER', 'Fictional demonstration · No real student data or live AI', '',
    'Evidence: ' + s.selected.map(id => labels[id]).join('; '),
    'Educator interpretation: ' + s.interpretation, 'Instructional focus: ' + s.focus,
    'Confidence: ' + s.confidence, '', '50-MINUTE MEETING AGENDA',
    ...s.agenda.map((text, i) => `${minutes[i]} min · ${text}`), '',
    'Teaching action: ' + s.action, 'Owner: ' + s.owner,
    'Implementation check: ' + s.implementationCheck, 'Student learning check: ' + s.learningCheck,
    ...(s.evidenceCollector.trim() || s.collectionDate || s.reviewDate ? ['', 'PLANNED · Evidence collection'] : []),
    ...(s.evidenceCollector.trim() ? ['Evidence collector: ' + s.evidenceCollector] : []),
    ...(s.collectionDate ? ['Planned collection date: ' + s.collectionDate] : []),
    ...(s.reviewDate ? ['Planned review date: ' + s.reviewDate] : []),
    ...(s.evidenceCollector.trim() || s.collectionDate || s.reviewDate ? ['These are plans, not evidence that collection or review occurred.'] : []),
    ...(s.accessParticipation.trim() ? ['Access & participation plan: ' + s.accessParticipation] : []),
    '', 'FOLLOW-UP', hasReflection(s) ? 'Implementation: ' + s.implementation : 'Implementation: Not yet recorded',
    hasReflection(s) ? 'Recorded reflection: ' + s.reflection : 'Reflection: Not yet recorded (draft edits are not included)',
    ...(hasReflection(s) && s.nextCycleQuestion.trim() ? ['Question for the next PLC: ' + s.nextCycleQuestion] : []),
    '', 'Evidence does not establish causality. Observation notes describe one classroom on Sep 9.',
  ].join('\n');
}
// Shared trust boundary for legacy drafts and database cycle records.
export function parseStoredState(value: unknown): { state: PlanState; stale: boolean } {
  if (!value || typeof value !== 'object' || Array.isArray(value) || JSON.stringify(value).length > MAX_DRAFT_LENGTH) throw new Error('Invalid draft');
  const source = value as Record<string, unknown>;
  // A missing optional field is an older cycle, while a present invalid value remains an error.
  const input: Record<string, unknown> = { accessParticipation: '', evidenceCollector: '', collectionDate: '', reviewDate: '', nextCycleQuestion: '', ...source };
  const base = initialState();
  for (const [key, expected] of Object.entries(base)) {
    const actual = input[key];
    if (expected === null) { if (actual !== null && typeof actual !== 'string') throw new Error('Invalid approval'); }
    else if (Array.isArray(expected)) { if (!Array.isArray(actual)) throw new Error('Invalid list'); }
    else if (typeof actual !== typeof expected || (typeof actual === 'string' && actual.length > 4000)) throw new Error('Invalid field');
  }
  if (!Array.isArray(input.selected) || input.selected.length > 4 || !input.selected.includes('assessment') || new Set(input.selected).size !== input.selected.length || !input.selected.every(id => typeof id === 'string' && Object.hasOwn(evidenceLabels, id))) throw new Error('Invalid evidence');
  if (!Array.isArray(input.agenda) || input.agenda.length !== minutes.length || !input.agenda.every(text => typeof text === 'string' && text.length <= 4000)) throw new Error('Invalid agenda');
  if (![0, 1, 2, 3].includes(input.step as number) || !['wording', 'meaning', 'variation'].includes(input.lens as string) || !['tentative', 'moderate', 'strong'].includes(input.confidence as string) || !['', 'yes', 'partial', 'no'].includes(input.implementation as string)) throw new Error('Invalid choice');
  // Date drafts are bounded strings, including incomplete input. Validate their
  // calendar meaning only at plan approval so an edit can always be corrected.
  let state = Object.fromEntries(Object.keys(base).map(key => [key, input[key]])) as unknown as PlanState;
  const stale = Boolean((state.focusStamp && !hasFocus(state)) || (state.planStamp && !hasPlan(state)) || (state.reflectionStamp && !hasReflection(state)));
  if (!hasFocus(state)) state = { ...state, focusStamp: null, planStamp: null, consent: false, reflectionStamp: null, step: Math.min(state.step, 1) };
  else if (!hasPlan(state)) state = { ...state, planStamp: null, reflectionStamp: null, step: Math.min(state.step, 2) };
  else if (!hasReflection(state)) state = { ...state, reflectionStamp: null };
  return { state: { ...state, review: state.review || stale }, stale };
}
export function parseDraft(raw: string): { state: PlanState; stale: boolean } {
  if (raw.length > MAX_DRAFT_LENGTH) throw new Error('Oversized draft');
  const parsed: unknown = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || !('version' in parsed) || parsed.version !== 1 || !('state' in parsed)) throw new Error('Unknown draft version');
  return parseStoredState(parsed.state);
}
export function decodeDraft(raw: string | null): { state: PlanState; notice: string } {
  if (!raw) return { state: initialState(), notice: '' };
  try {
    const { state, stale } = parseDraft(raw);
    return { state, notice: stale ? 'Your draft was restored. Changed decisions need your approval again.' : 'Your saved draft was restored on this browser.' };
  } catch {
    return { state: initialState(), notice: 'The saved draft could not be read. A fresh demo is ready.' };
  }
}
export const encodeDraft = (state: PlanState) => JSON.stringify({ version: 1, state });
