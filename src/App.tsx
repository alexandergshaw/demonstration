import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { focusError, hasFocus, hasPlan, isCalendarDate, planError, reflectionError, type Action } from './model';
import { useWorkspace, type ReadyWorkspace, type WorkspaceController } from './useWorkspace';
import { CycleManager, ConfirmationDialog, Modal } from './components/CycleManager';
import { FieldErrorProvider } from './components/Field';
import { Icon } from './components/Icon';
import type { ReferenceData } from './data/seed';
import { MeetingKit } from './components/MeetingKit';
import { DraftCopyButton } from './components/DraftCopy';
import { ReadingSettings, ReadingSettingsDialog, useReadingPreferences, type ReadingController } from './components/ReadingSettings';
import { LearningGuide, useLearningProgress, type LearningController } from './components/LearningGuide';
import { isLessonId } from './learning';
import { EvidenceUpdate } from './components/EvidenceUpdate';
import { referenceForVersion } from './data/evidenceSnapshots';
import { EvidenceWorkspace } from './workspaces/EvidenceWorkspace';
import { ReasoningWorkspace } from './workspaces/ReasoningWorkspace';
import { PlanWorkspace, type PlanTaskEntry } from './workspaces/PlanWorkspace';
import { ReflectWorkspace } from './workspaces/ReflectWorkspace';
import { DecisionHistory, FollowUpExamples } from './workspaces/WorkspaceReaders';
import { MeetingReady } from './workspaces/MeetingReady';
import { FlowIntroduction } from './components/FlowIntroduction';
import { flowOrientation, meetingOrientation, shouldIntroduceFlow } from './flowOrientation';
import { stageCompletionLabels, stageIsComplete } from './stageProgress';

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
const titles = ['Read the evidence', 'Choose a teaching focus', 'Plan the meeting', 'Review what changed'];
function Notice({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'warning' | 'success' }) {
  return <div className={`notice ${tone}`}><Icon name={tone === 'success' ? 'check' : tone === 'warning' ? 'warning' : 'info'} size={18} /><div>{children}</div></div>;
}
function Planner({ workspace, reading, learning }: { workspace: ReadyWorkspace; reading: ReadingController; learning: LearningController }) {
  const { state, snapshot, notice, setNotice, saveError } = workspace;
  const reference = useReference();
  const cycleTitle = snapshot.cycles.find(cycle => cycle.id === snapshot.activeCycleId)?.title ?? 'PLC cycle';
  const [error, setError] = useState(''), [errorField, setErrorField] = useState('');
  const [errorAttempt, setErrorAttempt] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false), [examplesOpen, setExamplesOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false), [reloadOpen, setReloadOpen] = useState(false), [freshOpen, setFreshOpen] = useState(false), [guideOpen, setGuideOpen] = useState(false);
  const [lockNotice, setLockNotice] = useState('');
  const [guideEntry, setGuideEntry] = useState<{ view: 'home' | 'walkthrough'; step?: number }>({ view: 'home' });
  const [kitOpen, setKitOpen] = useState(false);
  const [readingOpen, setReadingOpen] = useState(false);
  const [editingApprovedPlan, setEditingApprovedPlan] = useState(false);
  const [planEntry, setPlanEntry] = useState<'learning' | undefined>();
  const [planTaskEntry, setPlanTaskEntry] = useState<PlanTaskEntry | undefined>();
  const [returnToReflection, setReturnToReflection] = useState(false);
  const title = useRef<HTMLHeadingElement>(null), errorBox = useRef<HTMLDivElement>(null);
  const preserveStagePickerFocus = useRef(false);
  const focus = hasFocus(state), plan = hasPlan(state);
  const meetingReady = state.step === 2 && plan && !editingApprovedPlan;
  const introduceFlow = shouldIntroduceFlow(state, learning.progress.welcomeDismissed);
  const orientation = meetingReady ? meetingOrientation : flowOrientation[state.step];
  useEffect(() => {
    if (!preserveStagePickerFocus.current) title.current?.focus();
    preserveStagePickerFocus.current = false;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [state.step, meetingReady]);
  useEffect(() => {
    if (!workspace.dirty) return;
    const protectDraft = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', protectDraft);
    return () => window.removeEventListener('beforeunload', protectDraft);
  }, [workspace.dirty]);
  const openGuide = (step?: number) => { if (isLessonId(step)) learning.dispatch({ type: 'visitLesson', lesson: step }); setGuideEntry(step === undefined ? { view: 'home' } : { view: 'walkthrough', step }); setGuideOpen(true); };
  const canEnterStage = (step: number) => Number.isInteger(step) && step >= 0 && step < 4 && (step < 2 || (step === 2 ? focus : plan));
  const act = (action: Action): boolean => { setError(''); setErrorField(''); setLockNotice(''); if (action.type === 'go') { setEditingApprovedPlan(false); setPlanEntry(undefined); setPlanTaskEntry(undefined); setReturnToReflection(false); } return workspace.dispatch(action); };
  const editPlan = (collection = false, task?: PlanTaskEntry) => {
    setError(''); setErrorField(''); setLockNotice('');
    setEditingApprovedPlan(true); setPlanEntry(collection ? 'learning' : undefined); setPlanTaskEntry(task);
    setReturnToReflection(state.step === 3);
    workspace.dispatch({ type: 'go', step: 2 });
  };
  const reloadSaved = () => { if (workspace.reload()) { setReloadOpen(false); setError(''); setErrorField(''); window.requestAnimationFrame(() => title.current?.focus()); } };
  const requestReload = () => workspace.dirty ? setReloadOpen(true) : reloadSaved();
  const clearError = () => { setError(''); setErrorField(''); };
  const beginFlow = () => {
    learning.dispatch({ type: 'dismissWelcome' });
    window.requestAnimationFrame(() => { const taskHeading = document.querySelector<HTMLElement>('.evidence-builder-panel:not([hidden]) h2'); if (taskHeading) { taskHeading.focus(); taskHeading.scrollIntoView({ block: 'start' }); } else { title.current?.focus(); } });
  };
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
    const saved = act(kind === 'plan' ? { type: 'confirm-plan', returnToReflection } : { type: kind === 'focus' ? 'confirm-focus' : 'save-reflection' });
    if (saved && kind === 'plan') { setEditingApprovedPlan(false); setPlanEntry(undefined); setPlanTaskEntry(undefined); setReturnToReflection(false); }
    return saved;
  };
  const savedLabel = saveError ? 'Save failed' : workspace.dirty ? 'Unsaved changes' : workspace.externalChanged ? 'Newer version available' : 'Saved on this browser';
  const savedShortLabel = saveError ? 'Save failed' : workspace.dirty ? 'Unsaved' : workspace.externalChanged ? 'Update available' : 'Saved';
  return <FieldErrorProvider value={{ field: errorField, message: error }}>
    <a className="skip-link" href="#workspace">Skip to planning workspace</a>
    <header className="app-topbar">
      <CycleManager compact workspace={workspace} onReset={() => setResetOpen(true)}
        headerBrand={<div className="brand"><span className="brandmark"><Icon name="mark" size={23} /></span><span className="brandname">throughline</span></div>}
        menuActions={closeMenu => <>
          <button onClick={() => { closeMenu(); setHistoryOpen(true); }}><Icon name="clock" size={18} />Decisions</button>
          <button onClick={() => { closeMenu(); setReadingOpen(true); }}><Icon name="settings" size={18} />Reading settings</button>
          <button onClick={() => { closeMenu(); openGuide(); }}><Icon name="book" size={18} />Guide</button>
          <DraftCopyButton state={state} reference={reference} cycleTitle={cycleTitle} />
        </>} />
    </header>
    <div className="app-shell"><div className="workflow-rail">
      <div className="workflow-controls">
      <nav className="mobile-stage-nav" aria-label="Planning stages">
        <label htmlFor="mobile-stage">Stage</label>
        <select id="mobile-stage" value={state.step} aria-describedby="mobile-stage-hint" onChange={event => {
          const step = Number(event.target.value);
          if (step === state.step || !canEnterStage(step)) return;
          preserveStagePickerFocus.current = true;
          if (!act({ type: 'go', step })) preserveStagePickerFocus.current = false;
        }}>
          {stages.map((stage, i) => <option key={stage.label} value={i} disabled={!canEnterStage(i)}>
            {i + 1}. {stage.short}{i === 3 ? ' — after teaching' : ''}{!canEnterStage(i) ? i === 2 ? ' — confirm a focus first' : ' — approve a plan first' : ''}
          </option>)}
        </select>
        <span id="mobile-stage-hint" className="sr-only">Choosing a stage opens that workspace.</span>
      </nav>
      <nav className="path" aria-label="Planning stages">{stages.map((stage, i) => {
        const locked = (i === 2 && !focus) || (i === 3 && !plan);
        const detail = i === 2 && !focus ? 'Confirm a focus first' : i === 3 && !plan ? 'Approve a plan first' : stage.detail;
        const complete = stageIsComplete(state, i);
        return <button key={stage.label} className={`step ${state.step === i ? 'active' : ''} ${complete ? 'done' : ''}`} aria-current={state.step === i ? 'step' : undefined} aria-disabled={locked || undefined} aria-describedby={`stage-note-${i}`} onClick={() => locked ? setLockNotice(i === 2 ? 'Confirm your instructional focus in Interpretation to unlock the meeting plan.' : 'Approve your meeting plan to unlock Reflection.') : act({ type: 'go', step: i })}><span className="step-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><span className="step-copy"><span className="nav-wide">{stage.label}</span><span className="nav-short">{stage.short}</span>{i === 3 && <span className="step-timing">After teaching</span>}<span className="step-note" id={`stage-note-${i}`}>{detail}</span></span><span className="step-state">{locked ? <Icon name="lock" size={13} /> : complete ? <><Icon name="check" size={14} /><span className="sr-only">{stageCompletionLabels[i]}</span></> : null}</span></button>;
      })}</nav>
      <span className={`save-indicator ${workspace.dirty || saveError ? 'unsaved' : ''}`} role="status" title={savedLabel}><span className="status-dot" /><span className="save-full-label">{savedLabel}</span><span className="save-short-label" aria-hidden="true">{savedShortLabel}</span></span>
      </div>
      {lockNotice && <p className="nav-help" role="status">{lockNotice}</p>}
    </div><div className="workspace-shell">
      <div className="page">{!introduceFlow && <header className="intro"><div className="flow-heading">
        <h1 ref={title} tabIndex={-1}>{meetingReady ? 'Your meeting is ready.' : titles[state.step]}</h1>
        <p className="flow-purpose">{orientation.purpose}</p>
      </div>
        <details className="flow-help" key={state.step}>
          <summary>About this step</summary>
          <p className="flow-phase">{orientation.phase}</p>
          <dl className="flow-context">
            <div><dt>Why this step matters</dt><dd>{orientation.why}</dd></div>
            <div><dt>You’ll take forward</dt><dd>{orientation.outcome}</dd></div>
          </dl>
          <button className="textlink" onClick={() => openGuide(state.step)}>Open step guide</button>
        </details>
        {plan && !meetingReady && <div className="intro-actions"><button className="btn secondary compact" onClick={() => setKitOpen(true)}><Icon name="book" size={16} />Meeting kit</button></div>}
      </header>}
        {!guideOpen && learning.message && <p className="caption learning-page-status" role="status">{learning.message}</p>}
        {notice && <div className="restore-note" role="status"><Icon name="info" size={17} /><span>{notice}</span><button className="icon-button" aria-label="Dismiss draft notice" onClick={() => setNotice('')}><Icon name="close" size={16} /></button></div>}
        {saveError && <Notice tone="warning"><div role="alert"><strong>Changes are not saved.</strong> {saveError}</div><div className="button-group"><button className="btn secondary compact" onClick={workspace.retrySave} disabled={workspace.externalChanged}>Retry save</button><DraftCopyButton state={state} reference={reference} cycleTitle={cycleTitle} className="btn secondary compact" /><button className="btn secondary compact" onClick={() => setReloadOpen(true)}>Reload saved data</button></div></Notice>}
        {workspace.externalChanged && !saveError && <div className="restore-note" role="status"><Icon name="info" size={17} /><span>Another tab changed this workspace. Reload to see its saved cycles.</span><button className="btn secondary compact" onClick={requestReload}>Reload saved data</button></div>}
        {workspace.operationError && <Notice tone="warning"><span role="alert">{workspace.operationError}</span><div className="button-group"><button className="btn secondary compact" onClick={requestReload}>Reload saved data</button></div></Notice>}
        <EvidenceUpdate state={state} base={snapshot.reference} dispatch={act} onRevise={workspace.reviseWithLatest} error={workspace.operationError} saveError={saveError} onRetrySave={workspace.retrySave} />
        <main id="workspace" className="main focused-workspace" tabIndex={-1}>
          {state.review && <div role="status"><Notice tone="warning"><strong>Review required.</strong> A source or decision changed. Your drafts are preserved; reconfirm the affected decisions.</Notice></div>}
          {error && <div ref={errorBox} tabIndex={-1} role="alert" className="form-error">{errorField ? 'Review the highlighted field to continue.' : error}{errorField && <button className="textlink" onClick={() => { setErrorAttempt(value => value + 1); window.requestAnimationFrame(() => focusField(errorField)); }}>Go to that field<Icon name="arrow" size={14} /></button>}</div>}
          {introduceFlow && <FlowIntroduction compact headingLevel="h1" headingRef={title} onContinue={beginFlow} onOpenOverview={() => openGuide()} />}
          {state.step === 0 && <EvidenceWorkspace key={state.evidenceVersion} state={state} reference={reference} dispatch={act} />}
          {state.step === 1 && <ReasoningWorkspace state={state} reference={reference} dispatch={act} submit={submit} errorField={errorField} errorAttempt={errorAttempt} clearError={clearError} />}
          {meetingReady && <MeetingReady state={state} onOpenKit={() => setKitOpen(true)} onEditPlan={() => editPlan()} onEditTask={task => editPlan(false, task)} onReflect={() => act({ type: 'go', step: 3 })} onEditCollection={() => editPlan(true)} />}
          {state.step === 2 && !meetingReady && <PlanWorkspace state={state} reference={reference} dispatch={act} submit={submit} errorField={errorField} errorAttempt={errorAttempt} clearError={clearError} saveError={saveError} externalChanged={workspace.externalChanged} initialCheckEditor={planEntry} initialTask={planTaskEntry} returnToReflection={returnToReflection} onReturnToApproved={() => returnToReflection ? act({ type: 'go', step: 3 }) : setEditingApprovedPlan(false)} />}
          {state.step === 3 && <ReflectWorkspace state={state} dispatch={act} submit={submit} errorField={errorField} errorAttempt={errorAttempt} openExamples={() => setExamplesOpen(true)} unsaved={workspace.dirty} onEditCollection={() => editPlan(true)} onOpenRecord={() => setHistoryOpen(true)} onBackToPlan={() => act({ type: 'go', step: 2 })} />}
        </main>
        <footer className="footnote"><span>Fictional demo · Scripted prompts</span><span>PLC planning workbook</span></footer>
      </div>
    </div></div>
    {readingOpen && <ReadingSettingsDialog reading={reading} onClose={() => setReadingOpen(false)} />}
    {kitOpen && plan && <MeetingKit state={state} reference={reference} externalChanged={workspace.externalChanged} onClose={() => setKitOpen(false)} />}
    {historyOpen && <DecisionHistory state={state} reference={reference} unsaved={workspace.dirty} externalChanged={workspace.externalChanged}
      cycleTitle={cycleTitle}
      onNavigate={step => {
        if (!canEnterStage(step)) return;
        setHistoryOpen(false);
        act({ type: 'go', step });
        window.requestAnimationFrame(() => { title.current?.focus(); window.scrollTo({ top: 0, behavior: 'instant' }); });
      }}
      onClose={() => setHistoryOpen(false)} />}
    {examplesOpen && <FollowUpExamples onClose={() => setExamplesOpen(false)} />}
    {resetOpen && <ConfirmationDialog title="Reset this cycle?" confirmLabel="Reset cycle" error={workspace.operationError} onClose={() => setResetOpen(false)} onConfirm={() => { if (workspace.resetCycle(snapshot.activeCycleId)) { setResetOpen(false); setError(''); setErrorField(''); window.requestAnimationFrame(() => title.current?.focus()); } }}><p>This clears this cycle's draft, approvals, and reflection. Other saved cycles stay unchanged.</p></ConfirmationDialog>}
    {reloadOpen && <ConfirmationDialog title="Reload saved data?" confirmLabel="Reload saved data" error={workspace.saveError || workspace.operationError} onClose={() => setReloadOpen(false)} onConfirm={reloadSaved}><p>This replaces unsaved edits on this page with the latest saved workspace. Download a draft copy first to keep your current writing as a manual reference. The copy cannot be imported automatically.</p><DraftCopyButton state={state} reference={reference} cycleTitle={cycleTitle} className="btn secondary" /></ConfirmationDialog>}
    {freshOpen && <ConfirmationDialog title="Start a fresh demo?" confirmLabel="Reset all cycles" error={workspace.operationError} onClose={() => setFreshOpen(false)} onConfirm={() => { if (workspace.resetDatabase()) setFreshOpen(false); }}><p>This removes all saved PLC cycles from this browser and starts one fresh cycle.</p></ConfirmationDialog>}
    {guideOpen && <LearningGuide learning={learning} currentStep={state.step} canEnter={canEnterStage}
      onNavigate={step => { if (!canEnterStage(step)) return; setGuideOpen(false); act({ type: 'go', step }); window.requestAnimationFrame(() => { title.current?.focus(); window.scrollTo({ top: 0, behavior: 'instant' }); }); }}
      onClose={() => { setGuideOpen(false); window.requestAnimationFrame(() => { if (document.activeElement === document.body) title.current?.focus(); }); }} onOpenExamples={() => { setGuideOpen(false); setExamplesOpen(true); }} initialView={guideEntry.view} initialStep={guideEntry.step}
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
