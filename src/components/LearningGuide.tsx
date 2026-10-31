import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  glossaryTerms, isLessonId, learningLessons, learningReducer, practiceScenarios,
  readLearningProgress, saveLearningProgress,
  type LearningAction, type LearningView, type LessonId,
} from '../learning';
import { Modal } from './CycleManager';
import { PilotEvaluation } from './PilotEvaluation';
import { FlowIntroduction } from './FlowIntroduction';
import { flowOrientation } from '../flowOrientation';

const browserStorage = () => window.localStorage;
export function useLearningProgress() {
  const [snapshot, setSnapshot] = useState(() => readLearningProgress(browserStorage));
  const latest = useRef(snapshot);
  const dispatch = (action: LearningAction) => {
    const progress = learningReducer(latest.current.progress, action);
    const next = saveLearningProgress(browserStorage, progress);
    // Event-path persistence and a synchronous ref preserve sequential actions without updater side effects.
    latest.current = next;
    setSnapshot(next);
  };
  return { ...snapshot, dispatch };
}
export type LearningController = ReturnType<typeof useLearningProgress>;

interface LearningGuideProps {
  learning: LearningController;
  currentStep: number;
  canEnter: (step: number) => boolean;
  onNavigate: (step: number) => void;
  onClose: () => void;
  initialView?: LearningView;
  initialStep?: number;
  about?: ReactNode;
  presenterTools?: ReactNode;
  onOpenExamples?: () => void;
}
const views: { id: LearningView; label: string }[] = [
  { id: 'home', label: 'Start here' }, { id: 'walkthrough', label: 'Walkthrough' },
  { id: 'practice', label: 'Practice' }, { id: 'glossary', label: 'Glossary' }, { id: 'about', label: 'About this demo' },
];

export function LearningGuide({ learning, currentStep, canEnter, onNavigate, onClose, initialView = 'home', initialStep, about, presenterTools, onOpenExamples }: LearningGuideProps) {
  const [view, setView] = useState<LearningView>(initialView);
  const [lessonId, setLessonId] = useState<LessonId>(isLessonId(initialStep) ? initialStep : learning.progress.lastLesson);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [choice, setChoice] = useState('');
  const [reviewedChoice, setReviewedChoice] = useState('');
  const [termQuery, setTermQuery] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const question = useRef<HTMLFieldSetElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const screen = `${view}:${view === 'walkthrough' ? lessonId : view === 'practice' ? practiceIndex : ''}`;
  const priorScreen = useRef(screen);
  useEffect(() => {
    if (priorScreen.current === screen) return;
    priorScreen.current = screen;
    heading.current?.focus({ preventScroll: true });
    const dialog = heading.current?.closest('dialog');
    if (dialog) dialog.scrollTop = 0;
  }, [screen]);
  const openLesson = (id: LessonId) => {
    setLessonId(id); setView('walkthrough');
    learning.dispatch({ type: 'visitLesson', lesson: id });
  };
  const openPractice = (index: number) => {
    setPracticeIndex(index); setChoice(''); setReviewedChoice(''); setView('practice');
  };
  const lesson = learningLessons[lessonId];
  const scenario = practiceScenarios[practiceIndex];
  const feedback = scenario.options.find(option => option.id === reviewedChoice);
  const filteredTerms = glossaryTerms.filter(item => `${item.term} ${item.definition}`.toLowerCase().includes(termQuery.trim().toLowerCase()));
  const currentStage = learningLessons[isLessonId(currentStep) ? currentStep : 0].stage;
  const reviewed = learning.progress.reviewedLessons.includes(lessonId);

  return <Modal title="Guide & practice" onClose={onClose}>
    <div className="learning-guide">
      <nav className="learning-nav" aria-label="Guide sections">
        {views.map(item => <button key={item.id} className={view === item.id ? 'selected' : ''} aria-current={view === item.id ? 'page' : undefined}
          onClick={() => item.id === 'walkthrough' ? openLesson(lessonId) : setView(item.id)}>{item.label}</button>)}
      </nav>

      {view === 'home' && <section className="learning-section">
        <FlowIntroduction headingLevel="h3" headingRef={heading} continueLabel={`Return to ${currentStage}`} onContinue={() => { learning.dispatch({ type: 'dismissWelcome' }); onClose(); }} />
        <h4 className="learning-support-heading">More support when you need it</h4>
        <p className="learning-lead">Walk through a step, practice a decision, or look up a term. Everything is optional.</p>
        <div className="learning-routes">
          {onOpenExamples && <article><div className="learning-route-copy"><span className="kicker">Separate fictional cases</span><h4>Follow a decision through to reflection</h4><p>Compare a documented follow-up with a case missing key evidence.</p></div><button className="btn secondary" onClick={onOpenExamples}>Explore worked examples</button></article>}
          <article><div className="learning-route-copy"><span className="kicker">Four short lessons</span><h4>Walk through the planning cycle</h4><p>See what to do at each stage and why it matters.</p>
            <span className="caption">{learning.progress.reviewedLessons.length} of 4 lessons marked reviewed</span></div>
            <button className="btn secondary" onClick={() => openLesson(learning.progress.lastLesson)}>Open walkthrough · Lesson {learning.progress.lastLesson + 1}</button></article>
          <article><div className="learning-route-copy"><span className="kicker">Three fictional scenarios</span><h4>Practice reading evidence</h4><p>Try a choice and read its explanation. You can retry freely.</p>
            <span className="caption">{learning.progress.practiced.length} of 3 scenarios tried · no proficiency score</span></div>
            <button className="btn secondary" onClick={() => openPractice(0)}>Open practice</button></article>
          <article><div className="learning-route-copy"><span className="kicker">Plain-language reference</span><h4>Look up a term</h4><p>Definitions for the data and planning terms used in this workbook.</p></div>
            <button className="btn secondary" onClick={() => setView('glossary')}>Open glossary</button></article>
        </div>
        <p className="learning-boundary">Your current cycle is at <strong>{currentStage}</strong>. Guide activities leave its evidence, writing and approvals unchanged.</p>
        <p className="caption">This prototype offers written guidance and authored practice explanations. There is no live tutor or coaching service.</p>
      </section>}

      {view === 'walkthrough' && <section className="learning-section">
        <p className="kicker">Lesson {lessonId + 1} of 4 · {lesson.stage}</p>
        <h3 ref={heading} tabIndex={-1} className="learning-heading">{lesson.title}</h3>
        <p className="learning-goal">{flowOrientation[lessonId].why}</p>
        <nav className="lesson-picker" aria-label="Walkthrough lessons">{learningLessons.map(item => <button key={item.id} aria-current={item.id === lessonId ? 'step' : undefined}
          className={item.id === lessonId ? 'selected' : ''} onClick={() => openLesson(item.id)}><span>{item.id + 1}. {item.stage}</span>{learning.progress.reviewedLessons.includes(item.id) && <small>Reviewed</small>}</button>)}</nav>
        <ol className="learning-steps">{lesson.steps.map(step => <li key={step}>{step}</li>)}</ol>
        <section className="learning-example"><h4>Example to think through</h4><p>{lesson.example}</p></section>
        <section className="learning-check"><h4>Ask yourself</h4><p>{lesson.selfCheck}</p></section>
        <div className="learning-review"><button className="btn secondary" disabled={reviewed} onClick={() => learning.dispatch({ type: 'reviewLesson', lesson: lessonId })}>{reviewed ? 'Lesson marked reviewed' : 'Mark lesson reviewed'}</button><p className="caption">Reviewed records what you chose to revisit. It is not a proficiency rating or plan approval.</p></div>
        <div className="learning-pager"><button className="btn secondary" disabled={lessonId === 0} onClick={() => openLesson((lessonId - 1) as LessonId)}>Previous lesson</button>
          {lessonId < 3 ? <button className="btn" onClick={() => openLesson((lessonId + 1) as LessonId)}>Next lesson</button> : <button className="btn" onClick={() => openPractice(0)}>Try a practice scenario</button>}</div>
        <div className="learning-transfer"><strong>In your planning cycle</strong><p>{lesson.nextAction}</p>
          {canEnter(lessonId) ? <button className="textlink" onClick={() => onNavigate(lessonId)}>Open {lesson.stage} stage</button>
            : <p className="caption">{lessonId === 2 ? 'Confirm your instructional focus in Interpretation before entering the meeting plan.' : 'Approve your meeting plan before entering Reflection.'} You can read this lesson at any time.</p>}</div>
      </section>}

      {view === 'practice' && <section className="learning-section">
        <p className="kicker">Scenario {practiceIndex + 1} of 3 · Fictional practice</p>
        <h3 ref={heading} tabIndex={-1} className="learning-heading">{scenario.title}</h3>
        <nav className="practice-picker" aria-label="Practice scenarios">{practiceScenarios.map((item, index) => <button key={item.id} aria-current={index === practiceIndex ? 'step' : undefined}
          className={index === practiceIndex ? 'selected' : ''} onClick={() => openPractice(index)}><span>{index + 1}. {item.title}</span>{learning.progress.practiced.includes(item.id) && <small>Tried</small>}</button>)}</nav>
        <p className="practice-context">{scenario.context}</p>
        <fieldset ref={question} className="practice-question" aria-describedby="practice-choice-hint"><legend>{scenario.question}</legend>
          {scenario.options.map(option => <label className={`practice-option ${choice === option.id ? 'selected' : ''}`} key={option.id}>
            <input type="radio" name={`practice-${scenario.id}`} value={option.id} checked={choice === option.id} onChange={() => { setChoice(option.id); setReviewedChoice(''); }} />
            <span>{option.text}</span></label>)}
        </fieldset>
        <p className="caption" id="practice-choice-hint">Choose an answer, then review its explanation. Attempts do not change your plan or unlock stages.</p>
        <div className="button-group"><button className="btn" disabled={!choice} onClick={() => { setReviewedChoice(choice); learning.dispatch({ type: 'practice', id: scenario.id }); }}>Review answer</button>
          {reviewedChoice && <button className="btn secondary" onClick={() => { setChoice(''); setReviewedChoice(''); question.current?.querySelector<HTMLInputElement>('input')?.focus(); }}>Try again</button>}</div>
        {feedback && <section className="practice-feedback" role="status"><h4>{feedback.supported ? 'Supported by the evidence' : 'Consider what is missing'}</h4><p>{feedback.feedback}</p><p className="practice-takeaway">{scenario.takeaway}</p></section>}
        <div className="learning-pager"><button className="btn secondary" disabled={practiceIndex === 0} onClick={() => openPractice(practiceIndex - 1)}>Previous scenario</button>
          {practiceIndex < practiceScenarios.length - 1 ? <button className="btn secondary" onClick={() => openPractice(practiceIndex + 1)}>Next scenario</button> : <button className="btn secondary" onClick={() => setView('home')}>Back to Guide</button>}</div>
      </section>}

      {view === 'glossary' && <section className="learning-section">
        <h3 ref={heading} tabIndex={-1} className="learning-heading">Terms used in this workbook</h3>
        <label className="field" htmlFor="glossary-search">Find a term</label>
        <input ref={search} id="glossary-search" type="search" value={termQuery} onChange={event => setTermQuery(event.target.value)} maxLength={100} aria-describedby="glossary-count" placeholder="For example: rubric or cohort" />
        <p id="glossary-count" className="caption" role="status">{filteredTerms.length} {filteredTerms.length === 1 ? 'term' : 'terms'} shown</p>
        {filteredTerms.length ? <dl className="learning-glossary">{filteredTerms.map(item => <div key={item.term}><dt>{item.term}</dt><dd>{item.definition}</dd></div>)}</dl>
          : <div className="glossary-empty"><p>No matching term. Try a shorter word, or browse the full glossary.</p><button className="btn secondary" onClick={() => { setTermQuery(''); search.current?.focus(); }}>Show all terms</button></div>}
      </section>}

      {view === 'about' && <section className="learning-section learning-about"><h3 ref={heading} tabIndex={-1} className="learning-heading">About this demonstration</h3>
        <div className="learning-about-overview">{about ?? <p>Throughline is a fictional grade-four math PLC workbook. Evidence and thinking prompts are scripted. You write and approve your own decisions; no live AI creates the plan.</p>}</div>
        <PilotEvaluation />{presenterTools}</section>}

      <p className="learning-storage caption" role="status">{learning.message || 'Reviewed topics and practice attempts save only on this browser. They are separate from your planning decisions.'}</p>
      <div className="modal-actions"><button className="btn" onClick={onClose}>Return to my {currentStage} stage</button></div>
    </div>
  </Modal>;
}
