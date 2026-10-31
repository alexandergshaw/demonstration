export type LessonId = 0 | 1 | 2 | 3;
export type PracticeId = 'aggregate' | 'historical' | 'checks';
export type LearningView = 'home' | 'walkthrough' | 'practice' | 'glossary' | 'about';

export const learningLessons = [
  {
    id: 0, title: 'Read the sources', stage: 'Evidence',
    goal: 'Understand what the evidence shows before deciding why it happened.',
    steps: [
      'Open the task and scoring criteria. Check what students were asked to show.',
      'Compare the counts with the sample responses. Add useful sources to your Decision Thread.',
      'Check dates and scope. One old classroom observation cannot describe teaching across the grade today.',
    ],
    example: '89 of 120 responses selected the correct fraction; 46 of 120 met the explanation rubric. The rates differ, but the totals do not tell us which students met both criteria.',
    selfCheck: 'Can you name one thing the source shows and one thing it cannot establish?',
    nextAction: 'Inspect the original task, then choose the student work you want to discuss.',
  },
  {
    id: 1, title: 'Own the interpretation', stage: 'Interpretation',
    goal: 'Separate an observation from a possible explanation and test another account.',
    steps: [
      'Write what you notice, what might explain it, and what remains unknown.',
      'Choose a challenge angle and read the prewritten question. It is a thinking prompt, not live AI or approval.',
      'Consider strengths, access and missing perspectives. Confirm one teaching focus in your own words.',
    ],
    example: '“Fewer responses met the explanation rubric” describes the evidence. “Students had too few chances to explain” is a possible cause that needs more evidence.',
    selfCheck: 'What evidence would make you revise your interpretation?',
    nextAction: 'Write your interpretation, consider a challenge, then confirm a teaching focus.',
  },
  {
    id: 2, title: 'Shape a practical meeting', stage: 'Meeting plan',
    goal: 'Choose a teaching action and two checks, then shape the meeting around them.',
    steps: [
      'Name one teaching action connected to the learning goal, who will try it, and separate checks for implementation and student learning.',
      'Consider access and participation, then optionally plan who will collect evidence and when the PLC will review it.',
      'Expand the six agenda prompts into directions. Activity 4 offers an optional rehearsal guide. Review your decisions and approve them to open the meeting kit.',
    ],
    example: 'A lesson artifact can help check whether a routine was used. Comparable student explanations can help check learning. Neither measure alone explains why a change occurred.',
    selfCheck: 'Could another facilitator follow your activity directions, and do your two checks answer different questions?',
    nextAction: 'Write directions and checks that fit your team. Only you can approve the plan.',
  },
  {
    id: 3, title: 'Revisit the next evidence', stage: 'Reflection',
    goal: 'Distinguish implementation from learning and keep uncertainty visible.',
    steps: [
      'Record whether the teaching action was used as planned, partly used or not yet used.',
      'Inspect the follow-up context. Compare task, scoring, cohort and missing responses before drawing a conclusion.',
      'Write what you can conclude, what remains uncertain, and what to examine next. Save the reflection explicitly.',
    ],
    example: 'The demo shows a fixed 56/120 follow-up count for every plan. Its date, task, scoring and matched cohort are not supplied, so it is not an observed effect of your action.',
    selfCheck: 'What additional evidence would you need before describing this as learning progress?',
    nextAction: 'Record your interpretation of implementation and learning, including the limits of the evidence.',
  },
] as const;

export interface PracticeOption { id: string; text: string; supported: boolean; feedback: string }
export interface PracticeScenario { id: PracticeId; title: string; context: string; question: string; options: PracticeOption[]; takeaway: string }
export const practiceScenarios: PracticeScenario[] = [
  {
    id: 'aggregate', title: 'Read an aggregate count',
    context: 'Fictional October 28 evidence: 89 of 120 responses selected the correct fraction; 46 of 120 met the explanation rubric. No matched student-level records are supplied.',
    question: 'Which statement is supported by these counts?',
    options: [
      { id: 'overlap', text: 'Exactly 43 students selected correctly but could not explain.', supported: false, feedback: 'Subtracting 46 from 89 gives 43, but that is a difference between totals. Without matched records, we do not know which responses met both criteria or what any individual student can explain.' },
      { id: 'rates', text: 'The aggregate rates differ; which students met both criteria is unknown.', supported: true, feedback: 'This stays within the evidence. The two totals describe different criteria. Inspect the task, rubric and full work before explaining the pattern or identifying individual learning needs.' },
      { id: 'ability', text: 'The count proves the class cannot understand fraction equivalence.', supported: false, feedback: 'A count on one task cannot establish a class’s ability or its cause. The work may reveal strengths as well as unfinished reasoning; wording, scoring and opportunities to respond also need examination.' },
    ],
    takeaway: 'In your own cycle, distinguish the pattern you observe from your explanation of it.',
  },
  {
    id: 'historical', title: 'Use historical context carefully',
    context: 'An observation on September 9 describes limited opportunities to explain in one classroom. The assessment is dated October 28 and includes four classes.',
    question: 'How can you responsibly use the observation?',
    options: [
      { id: 'cause', text: 'Use it as proof that all four teachers caused the October pattern.', supported: false, feedback: 'The observation covers one classroom at an earlier date. It cannot establish current practice across four classes, teacher effectiveness, or the cause of the assessment pattern.' },
      { id: 'ignore', text: 'Discard it because historical evidence can never be useful.', supported: false, feedback: 'Older evidence can suggest a worthwhile question. Its usefulness depends on keeping its date and scope visible and checking whether the pattern still applies.' },
      { id: 'investigate', text: 'Treat it as context and seek recent evidence before drawing a conclusion.', supported: true, feedback: 'This keeps the source’s limits in view. Recent observations, lesson artifacts or student perspectives could help investigate opportunities to explain without treating the old note as proof.' },
    ],
    takeaway: 'When selecting context, keep its date and scope attached to the claim.',
  },
  {
    id: 'checks', title: 'Choose two different checks',
    context: 'A PLC plans to try a routine that asks students to explain fraction equivalence using the same whole.',
    question: 'Which pair checks both implementation and student learning?',
    options: [
      { id: 'intentions', text: 'Ask whether teachers intend to try it, then count who attends the next PLC.', supported: false, feedback: 'Intentions and attendance do not show whether the routine happened in lessons or what students learned. Plan an implementation artifact and comparable student work instead.' },
      { id: 'outcome', text: 'Use the next aggregate score as proof that the routine was used and caused improvement.', supported: false, feedback: 'A later count does not verify implementation or causality. You also need comparable tasks, scoring, cohort and response coverage before interpreting a change in learning.' },
      { id: 'two-measures', text: 'Examine lesson artifacts for use of the routine, and comparable explanations for learning.', supported: true, feedback: 'These checks answer different questions. Confirm what the artifact shows about implementation, and compare student work using appropriate tasks and the same scoring criteria. Keep cohort, missing responses and other possible explanations in view.' },
    ],
    takeaway: 'In your meeting plan, name who will collect each kind of evidence and when the PLC will revisit it.',
  },
];

export const glossaryTerms = [
  { term: 'PLC', definition: 'Professional learning community: educators who meet to examine teaching and learning, plan a change, and revisit evidence together.' },
  { term: 'Cool-down', definition: 'A short task near the end of a lesson that helps reveal current student understanding. It is one source of evidence, not a complete account of ability.' },
  { term: 'Rubric', definition: 'The criteria used to judge a response. Here, an adequate explanation connects equivalent fractions to equal amounts of the same whole; words or a labeled drawing can show that reasoning.' },
  { term: 'Aggregate', definition: 'A combined total or rate for a group. An aggregate does not show which individual students met each criterion or explain why the pattern occurred.' },
  { term: 'Percentage points (pp)', definition: 'The difference between two percentages. For example, 70% minus 40% is 30 percentage points. This is not the same as a 30% relative increase or a count of particular students.' },
  { term: 'Instructional focus', definition: 'One teaching change to explore, chosen by the educator after interpreting evidence and considering an alternative explanation.' },
  { term: 'Implementation check', definition: 'Evidence about whether and how the agreed teaching action happened. A lesson artifact, teacher account or observation may help, with their limits made explicit.' },
  { term: 'Learning check', definition: 'Evidence about what students understand or can do. Use tasks and scoring that permit a meaningful comparison; a score change alone does not establish causality.' },
  { term: 'Cohort', definition: 'The group whose results are being considered. Equal response totals on two dates do not prove that the same students responded.' },
  { term: 'Comparable evidence', definition: 'Evidence similar enough for the intended comparison. Check the learning goal, task difficulty, scoring, cohort, missing responses and relevant teaching conditions.' },
] as const;

export const LEARNING_KEY = 'throughline.learning.v1';
export interface LearningProgress { welcomeDismissed: boolean; lastLesson: LessonId; reviewedLessons: LessonId[]; practiced: PracticeId[] }
export const defaultLearningProgress = (): LearningProgress => ({ welcomeDismissed: false, lastLesson: 0, reviewedLessons: [], practiced: [] });
export type LearningAction =
  | { type: 'dismissWelcome' }
  | { type: 'visitLesson' | 'reviewLesson'; lesson: LessonId }
  | { type: 'practice'; id: PracticeId };
export const isLessonId = (value: unknown): value is LessonId => Number.isInteger(value) && typeof value === 'number' && value >= 0 && value < learningLessons.length;
const isPracticeId = (value: unknown): value is PracticeId => practiceScenarios.some(scenario => scenario.id === value);
export function learningReducer(progress: LearningProgress, action: LearningAction): LearningProgress {
  if (action.type === 'dismissWelcome') return progress.welcomeDismissed ? progress : { ...progress, welcomeDismissed: true };
  if (action.type === 'practice') {
    if (!isPracticeId(action.id) || progress.practiced.includes(action.id)) return progress;
    return { ...progress, practiced: [...progress.practiced, action.id] };
  }
  if (!isLessonId(action.lesson)) return progress;
  if (action.type === 'visitLesson') return progress.lastLesson === action.lesson ? progress : { ...progress, lastLesson: action.lesson };
  return { ...progress, lastLesson: action.lesson, reviewedLessons: progress.reviewedLessons.includes(action.lesson) ? progress.reviewedLessons : [...progress.reviewedLessons, action.lesson] };
}

type LearningStorageGetter = () => Pick<Storage, 'getItem' | 'setItem'>;
export interface LearningSnapshot { progress: LearningProgress; message: string }
const invalidProgress = () => new Error('Invalid learning progress');
export function parseLearningProgress(raw: string): LearningProgress {
  if (raw.length > 2000) throw invalidProgress();
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalidProgress();
  const data = value as Record<string, unknown>;
  if (data.version !== 1 || typeof data.welcomeDismissed !== 'boolean' || !isLessonId(data.lastLesson)) throw invalidProgress();
  if (!Array.isArray(data.reviewedLessons) || data.reviewedLessons.length > 4 || !data.reviewedLessons.every(isLessonId) || new Set(data.reviewedLessons).size !== data.reviewedLessons.length) throw invalidProgress();
  if (!Array.isArray(data.practiced) || data.practiced.length > 3 || !data.practiced.every(isPracticeId) || new Set(data.practiced).size !== data.practiced.length) throw invalidProgress();
  return { welcomeDismissed: data.welcomeDismissed, lastLesson: data.lastLesson, reviewedLessons: [...data.reviewedLessons], practiced: [...data.practiced] };
}
export function readLearningProgress(getStorage: LearningStorageGetter): LearningSnapshot {
  try {
    const raw = getStorage().getItem(LEARNING_KEY);
    return { progress: raw === null ? defaultLearningProgress() : parseLearningProgress(raw), message: '' };
  } catch {
    return { progress: defaultLearningProgress(), message: 'Saved learning progress could not be read. You can still use the Guide; the stored copy has not been changed.' };
  }
}
export function saveLearningProgress(getStorage: LearningStorageGetter, progress: LearningProgress): LearningSnapshot {
  let next: LearningProgress;
  try { next = parseLearningProgress(JSON.stringify({ version: 1, ...progress })); }
  catch { return { progress, message: 'Learning progress was not saved because it was invalid. The stored copy has not been changed.' }; }
  try {
    const storage = getStorage();
    const raw = storage.getItem(LEARNING_KEY);
    let stored: LearningProgress;
    try { stored = raw === null ? defaultLearningProgress() : parseLearningProgress(raw); }
    catch { return { progress: next, message: 'Learning progress is kept for this page only. The existing saved record could not be read and was left unchanged.' }; }
    // Reviewed topics accumulate across tabs; the latest explicit visit sets the resume point.
    next = { ...next, welcomeDismissed: next.welcomeDismissed || stored.welcomeDismissed, reviewedLessons: [...new Set([...stored.reviewedLessons, ...next.reviewedLessons])], practiced: [...new Set([...stored.practiced, ...next.practiced])] };
    storage.setItem(LEARNING_KEY, JSON.stringify({ version: 1, ...next }));
    return { progress: next, message: 'Learning progress saved on this browser.' };
  } catch {
    return { progress: next, message: 'Learning progress is kept for this page only. Browser storage is unavailable or full; it will not survive a reload.' };
  }
}
