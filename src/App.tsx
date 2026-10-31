import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { focusError, hasFocus, hasPlan, hasReflection, isCalendarDate, planError, reflectionError, type Action } from './model';
import { useWorkspace, type ReadyWorkspace, type WorkspaceController } from './useWorkspace';
import { CycleManager, ConfirmationDialog, Modal } from './components/CycleManager';
import { FieldErrorProvider } from './components/Field';
import { Icon } from './components/Icon';
import type { ReferenceData } from './data/seed';
import { MeetingKit } from './components/MeetingKit';
import { exportMeetingNotes } from './meetingMaterials';
import { ReadingSettings, useReadingPreferences, type ReadingController } from './components/ReadingSettings';
import { LearningGuide, useLearningProgress, type LearningController } from './components/LearningGuide';
import { isLessonId } from './learning';
import { EvidenceUpdate } from './components/EvidenceUpdate';
import { referenceForVersion } from './data/evidenceSnapshots';
import { EvidenceWorkspace } from './workspaces/EvidenceWorkspace';
import { ReasoningWorkspace } from './workspaces/ReasoningWorkspace';
import { PlanWorkspace } from './workspaces/PlanWorkspace';
import { ReflectWorkspace } from './workspaces/ReflectWorkspace';
import { DecisionHistory, FollowUpExamples } from './workspaces/WorkspaceReaders';
import { MeetingReady } from './workspaces/MeetingReady';

const ReferenceContext = createContext<ReferenceData | null>(null);
function useReference() {
  const reference = useContext(ReferenceContext);
  if (!reference) throw new Error('Workspace references are not loaded');
  return reference;
}

function focusField(id: string) {
  const field = document.getElementById(id);
  for (let parent = field?.parentElement; parent; parent = parent.parentElement) {
    if (parent instanceof HTMLDetailsElement) parent.open = true;
  }
  field?.focus();
}
const stages: { label: string; short: string; detail: string }[] = [
  { label: 'Evidence', short: 'Evidence', detail: 'Inspect the sources' },
  { label: 'Interpretation', short: 'Interpret', detail: 'Choose a teaching focus' },
  { label: 'Meeting plan', short: 'Plan', detail: 'Turn the focus into action' },
  { label: 'Reflection', short: 'Reflect', detail: 'Return after trying the teaching move' },
];
const titles = ['What does the work show?', 'What is your interpretation?', 'Build the meeting around one move.', 'What can we decide now?'];
const subtitles = ['Compare the results with the student work. Choose the evidence worth discussing.', 'Keep the evidence beside your reasoning. Make one decision at a time.', 'Prepare the conversation, then review the complete plan before approving it.', 'Start with what was tried. Name the evidence still needed for the next decision.'];
function Notice({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'warning' | 'success' }) {
  return <div className={`notice ${tone}`}><Icon name={tone === 'success' ? 'check' : tone === 'warning' ? 'warning' : 'info'} size={18} /><div>{children}</div></div>;
}
function Planner({ workspace, reading, learning }: { workspace: ReadyWorkspace; reading: ReadingController; learning: LearningController }) {
  const { state, snapshot, notice, setNotice, saveError } = workspace;
  const reference = useReference();
  const [error, setError] = useState(''), [errorField, setErrorField] = useState('');
  const [errorAttempt, setErrorAttempt] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false), [examplesOpen, setExamplesOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false), [reloadOpen, setReloadOpen] = useState(false), [freshOpen, setFreshOpen] = useState(false), [guideOpen, setGuideOpen] = useState(false);
  const [lockNotice, setLockNotice] = useState('');
  const [guideEntry, setGuideEntry] = useState<{ view: 'home' | 'walkthrough'; step?: number }>({ view: 'home' });
  const [kitOpen, setKitOpen] = useState(false);
  const [editingApprovedPlan, setEditingApprovedPlan] = useState(false);
  const [planEntry, setPlanEntry] = useState<'learning' | undefined>();
  const title = useRef<HTMLHeadingElement>(null), errorBox = useRef<HTMLDivElement>(null);
  const focus = hasFocus(state), plan = hasPlan(state), reflection = hasReflection(state);
  const meetingReady = state.step === 2 && plan && !editingApprovedPlan;
  useEffect(() => { title.current?.focus(); window.scrollTo({ top: 0, behavior: 'instant' }); }, [state.step, meetingReady]);
  useEffect(() => {
    if (!workspace.dirty) return;
    const protectDraft = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', protectDraft);
    return () => window.removeEventListener('beforeunload', protectDraft);
  }, [workspace.dirty]);
  const openGuide = (step?: number) => { if (isLessonId(step)) learning.dispatch({ type: 'visitLesson', lesson: step }); setGuideEntry(step === undefined ? { view: 'home' } : { view: 'walkthrough', step }); setGuideOpen(true); };
  const canEnterStage = (step: number) => Number.isInteger(step) && step >= 0 && step < 4 && (step < 2 || (step === 2 ? focus : plan));
  const act = (action: Action): boolean => { setError(''); setErrorField(''); setLockNotice(''); if (action.type === 'go') { setEditingApprovedPlan(false); setPlanEntry(undefined); } return workspace.dispatch(action); };
  const editPlan = (collection = false) => {
    setError(''); setErrorField(''); setLockNotice('');
    setEditingApprovedPlan(true); setPlanEntry(collection ? 'learning' : undefined);
    workspace.dispatch({ type: 'go', step: 2 });
  };
  const reloadSaved = () => { if (workspace.reload()) { setReloadOpen(false); setError(''); setErrorField(''); window.requestAnimationFrame(() => title.current?.focus()); } };
  const requestReload = () => workspace.dirty ? setReloadOpen(true) : reloadSaved();
  const clearError = () => { setError(''); setErrorField(''); };
  const submit = (kind: 'focus' | 'plan' | 'reflection'): boolean => {
    const message = kind === 'focus' ? focusError(state) : kind === 'plan' ? planError(state) : reflectionError(state);
    if (message) {
      const field = kind === 'focus'
        ? state.interpretation.trim().length < 30 ? 'interpretation' : !state.challenged ? 'challenge' : 'focus'
        : kind === 'reflection' ? !state.implementation ? 'implementation-yes' : 'reflection'
        : state.agenda.some(activity => activity.trim().length < 5) ? `agenda-${state.agenda.findIndex(activity => activity.trim().length < 5)}`
        : state.action.trim().length < 25 ? 'action' : state.owner.trim().length < 3 ? 'owner'
        : state.implementationCheck.trim().length < 15 ? 'implementation-check'
        : state.learningCheck.trim().length < 15 ? 'learning-check'
        : state.collectionDate && !isCalendarDate(state.collectionDate) ? 'collection-date'
        : state.reviewDate && (!isCalendarDate(state.reviewDate) || (state.collectionDate && state.reviewDate < state.collectionDate)) ? 'review-date' : 'consent';
      setErrorField(field); setError(message); setErrorAttempt(value => value + 1); window.requestAnimationFrame(() => focusField(field)); return false;
    }
    const saved = act({ type: kind === 'focus' ? 'confirm-focus' : kind === 'plan' ? 'confirm-plan' : 'save-reflection' });
    if (saved && kind === 'plan') { setEditingApprovedPlan(false); setPlanEntry(undefined); }
    return saved;
  };
  const download = () => {
    try { const url = URL.createObjectURL(new Blob([exportMeetingNotes(state, reference)], { type: 'text/plain;charset=utf-8' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'Throughline_PLC_Meeting_Plan.txt'; document.body.append(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }
    catch (caught) { setErrorField(''); setError(caught instanceof Error ? caught.message : 'The plan could not be exported. Please try again.'); window.requestAnimationFrame(() => errorBox.current?.focus()); }
  };
  const savedLabel = saveError ? 'Save failed' : workspace.dirty ? 'Unsaved changes' : workspace.externalChanged ? 'Newer version available' : 'Saved on this browser';
  return <FieldErrorProvider value={{ field: errorField, message: error }}>
    <a className="skip-link" href="#workspace">Skip to planning workspace</a>
    <header className="app-topbar"><div className="brand"><span className="brandmark"><Icon name="mark" size={23} /></span><span className="brandname">throughline</span></div><CycleManager compact workspace={workspace} onReset={() => setResetOpen(true)} /><div className="topbar-actions"><span className={`save-indicator ${workspace.dirty || saveError ? 'unsaved' : ''}`} role="status"><span className="status-dot" />{savedLabel}</span><button className="guide-button" onClick={() => setHistoryOpen(true)}>Decisions</button><ReadingSettings reading={reading} /><button className="guide-button" aria-label="Open guide" onClick={() => openGuide()}><span>Guide</span></button></div></header>
    <div className="app-shell"><div className="workflow-rail">
      <nav className="path" aria-label="Planning stages">{stages.map((stage, i) => {
        const locked = (i === 2 && !focus) || (i === 3 && !plan);
        const detail = i === 2 && !focus ? 'Confirm a focus first' : i === 3 && !plan ? 'Approve a plan first' : stage.detail;
        const complete = i < 2 ? focus : i === 2 ? plan : reflection;
        return <button key={stage.label} className={`step ${state.step === i ? 'active' : ''} ${complete ? 'done' : ''}`} aria-current={state.step === i ? 'step' : undefined} aria-disabled={locked || undefined} aria-describedby={`stage-note-${i}`} onClick={() => locked ? setLockNotice(i === 2 ? 'Confirm your instructional focus in Interpretation to unlock the meeting plan.' : 'Approve your meeting plan to unlock Reflection.') : act({ type: 'go', step: i })}><span className="step-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><span className="step-copy"><span className="nav-wide">{stage.label}</span><span className="nav-short">{stage.short}</span><span className="step-note" id={`stage-note-${i}`}>{detail}</span></span><span className="step-state">{locked ? <Icon name="lock" size={13} /> : complete ? <Icon name="check" size={14} /> : null}</span></button>;
      })}</nav>
      {lockNotice && <p className="nav-help" role="status">{lockNotice}</p>}
    </div><div className="workspace-shell">
      <div className="page"><header className="intro"><div><h1 ref={title} tabIndex={-1}>{meetingReady ? 'Your meeting is ready.' : titles[state.step]}</h1><p>{meetingReady ? 'Use your approved materials with the team. Return to Reflect after trying the teaching move.' : subtitles[state.step]}</p></div><div className="intro-actions"><button className="textlink" onClick={() => openGuide(state.step)}>Help with this step</button>{plan && !meetingReady && <button className="btn secondary compact" onClick={() => setKitOpen(true)}><Icon name="book" size={16} />Meeting kit</button>}</div></header>
        {!guideOpen && learning.message && <p className="caption learning-page-status" role="status">{learning.message}</p>}
        {notice && <div className="restore-note" role="status"><Icon name="info" size={17} /><span>{notice}</span><button className="icon-button" aria-label="Dismiss draft notice" onClick={() => setNotice('')}><Icon name="close" size={16} /></button></div>}
        {saveError && <Notice tone="warning"><div role="alert"><strong>Changes are not saved.</strong> {saveError}</div><div className="button-group"><button className="btn secondary compact" onClick={workspace.retrySave} disabled={workspace.externalChanged}>Retry save</button><button className="btn secondary compact" onClick={() => setReloadOpen(true)}>Reload saved data</button></div></Notice>}
        {workspace.externalChanged && !saveError && <div className="restore-note" role="status"><Icon name="info" size={17} /><span>Another tab changed this workspace. Reload to see its saved cycles.</span><button className="btn secondary compact" onClick={requestReload}>Reload saved data</button></div>}
        {workspace.operationError && <Notice tone="warning"><span role="alert">{workspace.operationError}</span><div className="button-group"><button className="btn secondary compact" onClick={requestReload}>Reload saved data</button></div></Notice>}
        <EvidenceUpdate state={state} base={snapshot.reference} dispatch={act} onRevise={workspace.reviseWithLatest} error={workspace.operationError} saveError={saveError} onRetrySave={workspace.retrySave} />
        <main id="workspace" className="main focused-workspace" tabIndex={-1}>
          {state.review && <div role="status"><Notice tone="warning"><strong>Review required.</strong> A source or decision changed. Your drafts are preserved; reconfirm the affected decisions.</Notice></div>}
          {error && <div ref={errorBox} tabIndex={-1} role="alert" className="form-error">{errorField ? 'Review the highlighted field to continue.' : error}{errorField && <button className="textlink" onClick={() => { setErrorAttempt(value => value + 1); window.requestAnimationFrame(() => focusField(errorField)); }}>Go to that field<Icon name="arrow" size={14} /></button>}</div>}
          {state.step === 0 && <EvidenceWorkspace state={state} reference={reference} dispatch={act} />}
          {state.step === 1 && <ReasoningWorkspace state={state} reference={reference} dispatch={act} submit={submit} errorField={errorField} errorAttempt={errorAttempt} clearError={clearError} />}
          {meetingReady && <MeetingReady state={state} onOpenKit={() => setKitOpen(true)} onEditPlan={() => editPlan()} onReflect={() => act({ type: 'go', step: 3 })} onEditCollection={() => editPlan(true)} />}
          {state.step === 2 && !meetingReady && <PlanWorkspace state={state} reference={reference} dispatch={act} submit={submit} errorField={errorField} errorAttempt={errorAttempt} clearError={clearError} saveError={saveError} initialCheckEditor={planEntry} />}
          {state.step === 3 && <ReflectWorkspace state={state} dispatch={act} submit={submit} errorField={errorField} errorAttempt={errorAttempt} openExamples={() => setExamplesOpen(true)} unsaved={workspace.dirty} onEditCollection={() => editPlan(true)} />}
        </main>
        <footer className="footnote"><span>Fictional demo · Scripted prompts</span><span>PLC planning workbook</span></footer>
      </div>
    </div></div>
    {kitOpen && plan && <MeetingKit state={state} reference={reference} onClose={() => setKitOpen(false)} downloadNotes={download} />}
    {historyOpen && <DecisionHistory state={state} reference={reference} unsaved={workspace.dirty} onClose={() => setHistoryOpen(false)} />}
    {examplesOpen && <FollowUpExamples onClose={() => setExamplesOpen(false)} />}
    {resetOpen && <ConfirmationDialog title="Reset this cycle?" confirmLabel="Reset cycle" error={workspace.operationError} onClose={() => setResetOpen(false)} onConfirm={() => { if (workspace.resetCycle(snapshot.activeCycleId)) { setResetOpen(false); setError(''); setErrorField(''); window.requestAnimationFrame(() => title.current?.focus()); } }}><p>This clears this cycle's draft, approvals, and reflection. Other saved cycles stay unchanged.</p></ConfirmationDialog>}
    {reloadOpen && <ConfirmationDialog title="Reload saved data?" confirmLabel="Reload saved data" error={workspace.saveError || workspace.operationError} onClose={() => setReloadOpen(false)} onConfirm={reloadSaved}><p>This replaces unsaved edits on this page with the latest saved workspace. Copy any work you want to keep before continuing.</p></ConfirmationDialog>}
    {freshOpen && <ConfirmationDialog title="Start a fresh demo?" confirmLabel="Reset all cycles" error={workspace.operationError} onClose={() => setFreshOpen(false)} onConfirm={() => { if (workspace.resetDatabase()) setFreshOpen(false); }}><p>This removes all saved PLC cycles from this browser and starts one fresh cycle.</p></ConfirmationDialog>}
    {guideOpen && <LearningGuide learning={learning} currentStep={state.step} canEnter={canEnterStage}
      onNavigate={step => { if (!canEnterStage(step)) return; setGuideOpen(false); act({ type: 'go', step }); window.requestAnimationFrame(() => { title.current?.focus(); window.scrollTo({ top: 0, behavior: 'instant' }); }); }}
      onClose={() => setGuideOpen(false)} onOpenExamples={() => { setGuideOpen(false); setExamplesOpen(true); }} initialView={guideEntry.view} initialStep={guideEntry.step}
      about={<><section className="pilot-notes"><h4>Who this pilot serves</h4><p>A single-grade math PLC leader examining student work. A guided sequence supports leaders who want help reading data or are new to AI. Multi-grade planning and lesson-planning-first workflows need a later design pass.</p><h4>Assumptions to test</h4><p>Aim to prepare an evidence-grounded plan within 20 minutes for a 50-minute meeting; this target has not been validated with educators. The task, rubric, scores and observation are fictional. Check preparation time, whether leaders can explain their choices, and whether the teaching action was tried.</p><p>Keep selected evidence beside your writing, or use View evidence on a smaller screen without leaving your draft. Six fixed time blocks favor a complete pilot flow; meeting length and data integrations are not configurable yet.</p></section><Notice>All evidence is fictional. Thinking prompts are scripted, with no live AI. Use fictional or non-identifying notes. Drafts save only in this browser and may be visible to other people using this device. This demo is not a secure student-record system. Export an approved plan for a portable copy.</Notice></>} presenterTools={<details className="guide-reset support-disclosure"><summary>Presenter tools</summary><p>Show how a new snapshot is reviewed without replacing an existing plan.</p>{state.evidenceVersion === 'oct28' && <button className="btn secondary" onClick={() => { if (act({ type: 'simulate-evidence-update' })) setGuideOpen(false); }}>Simulate new results</button>}{saveError && <p role="alert">{saveError}</p>}<p>Start the demonstration again with one fresh cycle.</p><button className="btn secondary" onClick={() => { workspace.clearOperationError(); setGuideOpen(false); setFreshOpen(true); }}>Reset all saved cycles</button></details>} />}

  </FieldErrorProvider>;
}
function Startup({ workspace, reading }: { workspace: WorkspaceController; reading: ReadingController }) {
  const [freshOpen, setFreshOpen] = useState(false);
  return <main className="startup"><ReadingSettings reading={reading} /><span className="brandmark"><Icon name="mark" size={26} /></span><div className="kicker">Throughline · PLC planning partner</div><h1>{workspace.loading ? 'Opening your workspace…' : 'Your workspace could not be opened'}</h1>
    {workspace.loading ? <p role="status">Loading your saved cycles from this browser.</p> : <><p role="alert">{workspace.loadError}</p><div className="button-group"><button className="btn" onClick={workspace.reload}>Retry loading</button><button className="btn secondary" onClick={() => { workspace.clearOperationError(); setFreshOpen(true); }}>Start a fresh demo</button></div></>}
    {freshOpen && <ConfirmationDialog title="Start a fresh local workspace?" confirmLabel="Start fresh" error={workspace.operationError} onClose={() => setFreshOpen(false)} onConfirm={workspace.resetDatabase}><p>This replaces all saved PLC cycles in this browser with one fresh cycle, only if the new workspace can be saved.</p></ConfirmationDialog>}
  </main>;
}
export default function App() {
  const workspace = useWorkspace();
  const reading = useReadingPreferences();
  const learning = useLearningProgress();
  if (!workspace.snapshot || !workspace.state) return <Startup workspace={workspace} reading={reading} />;
  return <ReferenceContext.Provider value={referenceForVersion(workspace.snapshot.reference, workspace.state.evidenceVersion)}><Planner learning={learning} reading={reading} key={workspace.snapshot.activeCycleId} workspace={{ ...workspace, snapshot: workspace.snapshot, state: workspace.state }} /></ReferenceContext.Provider>;
}
