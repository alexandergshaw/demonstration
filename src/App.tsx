import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { focusError, hasFocus, hasPlan, hasReflection, minutes, planError, reflectionError, type Action, type EvidenceId, type PlanState } from './model';
import { useWorkspace, type ReadyWorkspace, type WorkspaceController } from './useWorkspace';
import { CycleManager, ConfirmationDialog, Modal } from './components/CycleManager';
import { FieldErrorProvider, FieldError, TextArea, TextInput, useFieldError } from './components/Field';
import { Icon } from './components/Icon';
import type { ReferenceData } from './data/seed';
import { EvidenceInspector, TaskContext } from './components/EvidenceInspector';
import { MeetingKit } from './components/MeetingKit';
import { agendaHeadings, agendaHints, exportMeetingNotes } from './meetingMaterials';
import { followUpSourceBlocks, taskBlocks } from './lessonContext';

const ReferenceContext = createContext<ReferenceData | null>(null);
function useReference() {
  const reference = useContext(ReferenceContext);
  if (!reference) throw new Error('Workspace references are not loaded');
  return reference;
}
type Dispatch = (action: Action) => void;
const stages: { label: string; short: string; detail: string }[] = [
  { label: 'Evidence', short: 'Evidence', detail: 'Inspect the sources' },
  { label: 'Interpretation', short: 'Interpret', detail: 'Choose a teaching focus' },
  { label: 'Meeting plan', short: 'Plan', detail: 'Turn the focus into action' },
  { label: 'Reflection', short: 'Reflect', detail: 'Revisit the next evidence' },
];
const titles = ['Read the student work', 'Choose a teaching focus', 'Prepare the PLC meeting', 'Review the next evidence'];
const subtitles = ['Start with the task. Compare answers with explanations, then choose the work to discuss.', 'Form your interpretation, test an alternative, and choose one instructional focus.', 'Connect one teaching action to a clear agenda and meaningful follow-up.', 'Separate what was implemented from what students learned.'];
function Notice({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'warning' | 'success' }) {
  return <div className={`notice ${tone}`}><Icon name={tone === 'success' ? 'check' : tone === 'warning' ? 'warning' : 'info'} size={18} /><div>{children}</div></div>;
}
function Metric({ label, value, total, detail, secondary = false }: { label: string; value: number; total: number; detail: string; secondary?: boolean }) {
  return <div className={`stat ${secondary ? 'stat-secondary' : ''}`}><span className="stat-label">{label}</span><div className="statnum">{Math.round(value / total * 100)}<span>%</span></div><div className="metric-detail">{value} of {total} responses <span>· {detail}</span></div><div className="progress" aria-hidden="true"><span style={{ width: `${value / total * 100}%` }} /></div></div>;
}
function EvidenceButton({ id, state, dispatch }: { id: EvidenceId; state: PlanState; dispatch: Dispatch }) {
  const selected = state.selected.includes(id);
  return <button className={`selectbtn ${selected ? 'chosen' : ''}`} aria-pressed={selected} onClick={() => dispatch({ type: 'evidence', id })}><Icon name={selected ? 'check' : 'plus'} size={15} />{selected ? 'Added to thread' : id === 'observation' ? 'Add as context' : 'Add as evidence'}</button>;
}
function AssessmentComparison({ assessment }: { assessment: ReferenceData['assessment'] }) {
  const rows = [
    { label: 'Correct fraction selected', value: assessment.correct, kind: 'answers' },
    { label: 'Explanation meets rubric', value: assessment.explanations, kind: 'explanations' },
  ];
  const gap = Math.round((assessment.correct - assessment.explanations) / assessment.total * 100);
  return <figure className="assessment-chart" aria-label="Answer and explanation counts on the same scale">
    {rows.map(row => <div className={`chart-row ${row.kind}`} key={row.kind}>
      <span className="chart-label">{row.label}</span>
      <div className="chart-track" aria-hidden="true"><div className="chart-bar" style={{ width: `${row.value / assessment.total * 100}%` }} /></div>
      <div className="chart-value"><strong>{row.value}</strong><span>/{assessment.total}</span><small>{Math.round(row.value / assessment.total * 100)}%</small></div>
    </div>)}
    <div className="chart-scale" aria-hidden="true">{[0, .25, .5, .75, 1].map(tick => <span key={tick}>{assessment.total * tick}</span>)}</div>
    <figcaption className="chart-note"><strong>{gap} pp difference</strong><span>Between aggregate rates. These counts do not identify which students met both criteria.</span></figcaption>
  </figure>;
}
function Evidence({ state, dispatch }: { state: PlanState; dispatch: Dispatch }) {
  const [examples, setExamples] = useState(true), [classes, setClasses] = useState(false);
  const { workspace, assessment, responses, observation, classes: results } = useReference();
  return <>
    <div className="evidence-heading"><div><h2>{workspace.unit}</h2><p className="source-meta">End-of-lesson cool-down <span>·</span> {assessment.total} students <span>·</span> {results.length} classes</p></div><span className="source-date">{assessment.date}</span></div>
    <AssessmentComparison assessment={assessment} />
    <TaskContext />
    <div className="subsection-title"><div><h2>Student work</h2><p className="small muted">Two illustrative responses, not a representative sample.</p></div><button className="textlink" aria-expanded={examples} aria-controls="student-examples" onClick={() => setExamples(!examples)}>{examples ? 'Hide examples' : 'Show examples'}</button></div>
    {examples && <div className="student-work" id="student-examples">{responses.map(response => <article className={`work ${state.selected.includes(response.id) ? 'work-selected' : ''}`} key={response.id}>
      <div className="source-label"><span className="source-avatar" aria-hidden="true">{response.id === 'responseB' ? 'B' : 'C'}</span><strong>{response.label}</strong></div>
      <div className="work-body"><blockquote>“{response.quote}”</blockquote><p>{response.interpretation}</p><div className="work-meta"><span className="source-category">{response.category}</span><div className="evidence-action"><EvidenceButton id={response.id} state={state} dispatch={dispatch} /></div></div></div>
    </article>)}</div>}
    <div className="class-disclosure"><div><h3>Across-class variation</h3><p>Compare responses, not teacher performance.</p></div><button className="selectbtn" aria-expanded={classes} aria-controls="class-results" onClick={() => setClasses(!classes)}>{classes ? 'Hide class results' : 'View class results'}<Icon name="chevron" size={15} /></button></div>
    {classes && <div className="class-results" id="class-results"><table><caption>{assessment.date} · Fictional responses by class</caption><thead><tr><th scope="col">Class</th><th scope="col">Correct fraction</th><th scope="col">Adequate explanation</th></tr></thead><tbody>{results.map(result => <tr key={result.id}><th scope="row">{result.label}</th><td>{result.correct}/{result.total}<div className="mini-bar" aria-hidden="true"><i style={{ width: `${result.correct / result.total * 100}%` }} /></div></td><td>{result.explanations}/{result.total}<div className="mini-bar" aria-hidden="true"><i className="two" style={{ width: `${result.explanations / result.total * 100}%` }} /></div></td></tr>)}</tbody></table><p className="caption">Task conditions and missing context may explain variation. These totals do not measure teacher effectiveness.</p></div>}
    <article className="observation"><div className="observation-stamp"><span>Observation</span><strong>{observation.date}</strong></div><div className="observation-copy"><div className="workheader"><h3>Classroom notes</h3><span className="pill amber">{observation.age}</span></div><p className="caption">{observation.scope}</p><blockquote>“{observation.quote}”</blockquote><p className="caution-text">{observation.caution}</p><EvidenceButton id={observation.id} state={state} dispatch={dispatch} /></div></article>
    <p className="evidence-caution"><Icon name="info" size={16} /><span>A single observation cannot establish causality. Keep source dates and scope in view.</span></p>
    <div className="section-footer"><span className="caption">{state.selected.length} {state.selected.length === 1 ? 'source' : 'sources'} in your decision thread</span><button className="btn" onClick={() => dispatch({ type: 'go', step: 1 })}>Continue to interpretation<Icon name="arrow" size={16} /></button></div>
  </>;
}
function Reasoning({ state: s, dispatch, submit }: { state: PlanState; dispatch: Dispatch; submit: (kind: 'focus' | 'plan' | 'reflection') => void }) {
  const reference = useReference();
  const { assessment, observation, challenges: lenses } = reference;
  const challengeError = useFieldError('challenge');
  return <>
    <div className="summary evidence-recap"><Icon name="evidence" /><div><strong>Evidence in view</strong><p>{assessment.correct}/{assessment.total} students selected the correct fraction; {assessment.explanations}/{assessment.total} met the explanation rubric.</p><p className="caption">{assessment.date} · {s.selected.includes('observation') ? `Selected observation: ${observation.date}, ${observation.scope.toLowerCase()}, ${observation.age.toLowerCase()}.` : 'The older observation is not selected.'}</p></div></div>
    <EvidenceInspector state={s} reference={reference} showQuotes />
    <TextArea id="interpretation" label="Your interpretation" hint="At least 30 characters. Separate what you observe from what might explain it." value={s.interpretation} onChange={value => dispatch({ type: 'text', field: 'interpretation', value })} placeholder="I notice… One possible explanation is… I still need to know…" />
    <section className="coachbox" aria-labelledby="challenge-title"><div className="coach-heading"><Icon name="reasoning" /><h2 id="challenge-title">Test your interpretation</h2><span className="pill">Scripted prompts</span></div><p className="small muted">Consider an alternative before choosing a focus. These are prewritten questions, not live AI.</p><div className="optionrow" role="group" aria-label="Challenge angle">{lenses.map(lens => <button key={lens.id} className={`option ${s.lens === lens.id ? 'selected' : ''}`} aria-pressed={s.lens === lens.id} onClick={() => dispatch({ type: 'lens', value: lens.id })}>{lens.label}</button>)}</div><div className="btnrow"><button id="challenge" className="btn secondary" disabled={s.interpretation.trim().length < 30} aria-invalid={challengeError.invalid || undefined} aria-describedby={challengeError.describedBy} onClick={() => dispatch({ type: 'challenge' })}>Challenge my interpretation</button>{s.interpretation.trim().length < 30 && <span className="caption">Write your interpretation first.</span>}</div><FieldError id="challenge" />{s.challenged && <div className="challenge-result" role="status"><strong>A question to consider</strong><p>{lenses.find(lens => lens.id === s.lens)?.prompt}</p><span className="caption">Consider the question, then choose or revise your focus.</span></div>}</section>
    <TextArea id="focus" label="One instructional focus" hint="At least 25 characters. Name one teaching change to explore and explain how the challenge affected your choice." value={s.focus} onChange={value => dispatch({ type: 'text', field: 'focus', value })} placeholder="After considering the alternative, our focus is… because…" />
    <div className="grid2 confidence-row"><div><label className="field" htmlFor="confidence">Confidence in this interpretation</label><select id="confidence" value={s.confidence} onChange={event => dispatch({ type: 'confidence', value: event.target.value as PlanState['confidence'] })}><option value="tentative">Tentative · More evidence needed</option><option value="moderate">Moderate · Plausible, not proven</option><option value="strong">Strong · Supported, still open to revision</option></select></div><div className="authority"><Icon name="shield" /><p>Only you can confirm this focus. A thinking prompt offers questions, not approval.</p></div></div>
    <div className="section-footer"><button className="btn secondary" onClick={() => dispatch({ type: 'go', step: 0 })}>Review evidence</button><button className="btn" onClick={() => submit('focus')}>Confirm instructional focus<Icon name="arrow" size={16} /></button></div>
  </>;
}
function Meeting({ state: s, dispatch, submit }: { state: PlanState; dispatch: Dispatch; submit: (kind: 'focus' | 'plan' | 'reflection') => void }) {
  const reference = useReference();
  const consentError = useFieldError('consent', 'consent-hint');
  return <>
    <div className="focus-summary"><div className="kicker"><Icon name="check" size={15} />Confirmed instructional focus</div><p>{s.focus}</p><button className="textlink" onClick={() => dispatch({ type: 'go', step: 1 })}>Revisit your reasoning</button></div>
    <EvidenceInspector state={s} reference={reference} />
    <div className="subsection-title"><div><h2>Your meeting agenda & activities</h2><p className="small muted">Shape the directions for your team. After approval, these become presentation sections and a printable activity handout.</p></div><span className="pill"><Icon name="clock" size={14} />50 minutes</span></div>
    <div className="agenda-list">{s.agenda.map((activity, i) => <div className="agenda" key={i}><span className="agenda-index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><span className="minute">{minutes[i]}<small>min</small></span><TextArea id={`agenda-${i}`} label={`Activity ${i + 1} · ${agendaHeadings[i]}`} hint={agendaHints[i]} value={activity} onChange={value => dispatch({ type: 'agenda', index: i, value })} /></div>)}</div>
    <div className="subsection-title section-start"><div><h2>Classroom action & follow-up</h2><p className="small muted">Be specific about what changes and how you will check it.</p></div></div>
    <TextArea id="action" label="One concrete teaching action" hint="At least 25 characters. What will teachers try in their next lessons?" value={s.action} onChange={value => dispatch({ type: 'text', field: 'action', value })} placeholder="Teachers will try…" />
    <TextInput id="owner" label="Who will try the strategy?" value={s.owner} onChange={value => dispatch({ type: 'text', field: 'owner', value })} />
    <div className="grid2"><TextArea id="implementation-check" label="Check that teaching changed" hint="Implementation evidence · At least 15 characters" value={s.implementationCheck} onChange={value => dispatch({ type: 'text', field: 'implementationCheck', value })} placeholder="A teacher check-in, a lesson artifact, an observation…" /><TextArea id="learning-check" label="Check student learning" hint="Comparable learning evidence · At least 15 characters" value={s.learningCheck} onChange={value => dispatch({ type: 'text', field: 'learningCheck', value })} placeholder="Comparable cool-downs, the same explanation rubric…" /></div>
    <label className="approval"><input id="consent" type="checkbox" checked={s.consent} aria-invalid={consentError.invalid || undefined} aria-describedby={consentError.describedBy} onChange={event => dispatch({ type: 'consent', value: event.target.checked })} /><span><strong>I reviewed and own this plan.</strong><span id="consent-hint">These decisions reflect my team's judgment. Editing the plan will require approval again.</span></span></label><FieldError id="consent" />
    <div className="section-footer"><button className="btn secondary" onClick={() => dispatch({ type: 'go', step: 1 })}>Revisit reasoning</button><button className="btn" onClick={() => submit('plan')}>Approve plan & continue<Icon name="arrow" size={16} /></button></div>
  </>;
}
function FollowUp({ state: s, dispatch, submit, download }: { state: PlanState; dispatch: Dispatch; submit: (kind: 'focus' | 'plan' | 'reflection') => void; download: () => void }) {
  const reference = useReference();
  const { assessment } = reference;
  const statusError = useFieldError('implementation-yes');
  const messages = { '': 'Choose an implementation status before interpreting the next learning evidence.', yes: 'Inspect subsequent work and implementation fidelity before evaluating the strategy.', partial: 'Record which classes used the routine and how. Aggregate results may conceal different experiences.', no: 'Start with implementation barriers. The agreed strategy has not yet been tested in classrooms.' };
  return <>
    <div className="summary"><div className="kicker"><Icon name="check" size={15} />Agreed teaching action</div><p>{s.action}</p><p className="small muted">Owner: {s.owner}</p><dl className="checks"><dt>Implementation check</dt><dd>{s.implementationCheck}</dd><dt>Learning check</dt><dd>{s.learningCheck}</dd></dl></div>
    <fieldset className="implementation" aria-invalid={statusError.invalid || undefined} aria-describedby={statusError.describedBy}><legend>Was the strategy used?</legend><div className="optionrow">{([['yes', 'Used as planned'], ['partial', 'Partially used'], ['no', 'Not yet used']] as const).map(([id, label]) => <label className={`option ${s.implementation === id ? 'selected' : ''}`} key={id}><input id={`implementation-${id}`} type="radio" name="implementation" value={id} checked={s.implementation === id} aria-invalid={statusError.invalid || undefined} aria-describedby={statusError.describedBy} onChange={() => dispatch({ type: 'implementation', value: id })} />{label}</label>)}</div></fieldset><FieldError id="implementation-yes" />
    <Notice>{messages[s.implementation]}</Notice><div className="subsection-title section-start"><h2>Inspect the follow-up comparison</h2><span className="pill">Fictional illustration</span></div>
    <p className="caption">This fixed example stays the same for every plan and implementation choice.</p>
    <div className="metrics grid2"><Metric label="Initial adequate explanations" value={assessment.explanations} total={assessment.total} detail={assessment.date} /><Metric label="Next-cycle adequate explanations" value={assessment.followUp} total={assessment.total} detail="Date not supplied" secondary /></div>
    <details className="task-context"><summary>Inspect follow-up context & initial task</summary><div className="source-blocks">
      {followUpSourceBlocks(reference).map(block => <section key={block.heading}><h3>{block.heading}</h3><p>{block.text}</p></section>)}
      <p className="caption">Initial reference only. These are not verified follow-up materials.</p>
      {taskBlocks().map(block => <section key={block.heading}><h3>{block.heading}</h3><p>{block.text}</p></section>)}
    </div></details>
    <Notice tone="warning"><strong>Check comparability before drawing a conclusion.</strong> The follow-up task, scoring, cohort and missing responses are not supplied. A higher count does not establish learning progress or causality.</Notice>
    <TextArea id="reflection" label="Your follow-up interpretation" hint="At least 30 characters. What can you conclude, what remains unknown, and what should the PLC examine next?" value={s.reflection} onChange={value => dispatch({ type: 'text', field: 'reflection', value })} placeholder="Given these limits, I can say… Before concluding, we need…" />
    {hasReflection(s) && <div role="status"><Notice tone="success"><strong>Reflection recorded.</strong> Your interpretation is linked to this plan in the Decision Thread. Download the text plan from Meeting kit to keep this reflection and its comparison context.</Notice></div>}
    <div className="section-footer"><button className="btn secondary" onClick={() => dispatch({ type: 'go', step: 2 })}>Edit meeting</button><div className="button-group"><button className="btn secondary" onClick={download}><Icon name="book" size={16} />Open meeting kit</button><button className="btn" onClick={() => submit('reflection')}>{hasReflection(s) ? 'Reflection recorded' : 'Save reflection'}<Icon name="check" size={16} /></button></div></div>
  </>;
}
function DecisionThread({ state: s }: { state: PlanState }) {
  const { labels } = useReference();
  const [expanded, setExpanded] = useState<number | null>(null);
  const focus = hasFocus(s), plan = hasPlan(s), reflection = hasReflection(s);
  const items = [
    { label: 'Evidence selected', value: s.selected.map(id => labels[id]).join('\n'), done: true },
    { label: 'Educator interpretation', value: focus ? s.interpretation : 'Awaiting your confirmation', done: focus },
    { label: 'Instructional focus', value: focus ? s.focus : 'Not yet confirmed', done: focus },
    { label: 'Classroom action', value: plan ? s.action : 'Awaiting plan approval', done: plan },
    { label: 'Follow-up measures', value: plan ? `Implementation: ${s.implementationCheck}\nLearning: ${s.learningCheck}` : 'Not yet agreed', done: plan },
    { label: 'Next-cycle reflection', value: reflection ? s.reflection : 'Not yet recorded', done: reflection },
  ];
  const captured = items.filter(item => item.done).length;
  const next = !focus ? 'Interpret your evidence and confirm one instructional focus.' : !plan ? 'Shape the meeting around your focus, then review and approve the plan.' : !reflection ? 'Record what was implemented and what the next evidence suggests.' : 'Your decisions are connected. Export the plan or start another cycle.';
  return <aside className="decision-sidebar" aria-label="Decision Thread">
    <section className="thread"><div className="thread-heading"><h2>Decision Thread</h2><span className="thread-count" aria-label={`${captured} of 6 items captured`}>{captured}/6</span></div>
      <ol className="thread-list">{items.map((item, i) => <li className={`threaditem ${item.done ? 'captured' : 'empty'}`} key={item.label}><span className="thread-number" aria-hidden="true">{item.done ? <Icon name="check" size={12} /> : i + 1}</span><div className="thread-content"><h3>{item.label}</h3><p>{item.value.length > 150 ? `${item.value.slice(0, 150)}…` : item.value}</p>{item.done && item.value.length > 150 && <button className="textlink" onClick={() => setExpanded(i)} aria-label={`Read full ${item.label.toLowerCase()}`}>Read full decision<Icon name="chevron" size={13} /></button>}</div></li>)}</ol>
      <div className="next-step"><span className="kicker">{reflection ? 'Cycle captured' : 'Up next'}</span><p>{next}</p></div>
    </section>
    {expanded !== null && items[expanded].done && <Modal title={items[expanded].label} onClose={() => setExpanded(null)}><p className="full-decision">{items[expanded].value}</p><div className="modal-actions"><button className="btn secondary" data-autofocus onClick={() => setExpanded(null)}>Close</button></div></Modal>}
  </aside>;
}
function Planner({ workspace }: { workspace: ReadyWorkspace }) {
  const { state, snapshot, notice, setNotice, saveError } = workspace;
  const [error, setError] = useState(''), [errorField, setErrorField] = useState('');
  const [resetOpen, setResetOpen] = useState(false), [reloadOpen, setReloadOpen] = useState(false), [freshOpen, setFreshOpen] = useState(false), [guideOpen, setGuideOpen] = useState(false);
  const [lockNotice, setLockNotice] = useState('');
  const [kitOpen, setKitOpen] = useState(false);
  const title = useRef<HTMLHeadingElement>(null), errorBox = useRef<HTMLDivElement>(null);
  const focus = hasFocus(state), plan = hasPlan(state), reflection = hasReflection(state);
  useEffect(() => { title.current?.focus(); window.scrollTo({ top: 0, behavior: 'instant' }); }, [state.step]);
  useEffect(() => {
    if (!workspace.dirty) return;
    const protectDraft = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', protectDraft);
    return () => window.removeEventListener('beforeunload', protectDraft);
  }, [workspace.dirty]);
  const act: Dispatch = action => { setError(''); setErrorField(''); setLockNotice(''); workspace.dispatch(action); };
  const reloadSaved = () => { if (workspace.reload()) { setReloadOpen(false); setError(''); setErrorField(''); window.requestAnimationFrame(() => title.current?.focus()); } };
  const requestReload = () => workspace.dirty ? setReloadOpen(true) : reloadSaved();
  const submit = (kind: 'focus' | 'plan' | 'reflection') => {
    const message = kind === 'focus' ? focusError(state) : kind === 'plan' ? planError(state) : reflectionError(state);
    if (message) {
      const field = kind === 'focus'
        ? state.interpretation.trim().length < 30 ? 'interpretation' : !state.challenged ? 'challenge' : 'focus'
        : kind === 'reflection' ? !state.implementation ? 'implementation-yes' : 'reflection'
        : state.agenda.some(activity => activity.trim().length < 5) ? `agenda-${state.agenda.findIndex(activity => activity.trim().length < 5)}`
        : state.action.trim().length < 25 ? 'action' : state.owner.trim().length < 3 ? 'owner'
        : state.implementationCheck.trim().length < 15 ? 'implementation-check'
        : state.learningCheck.trim().length < 15 ? 'learning-check' : 'consent';
      setErrorField(field); setError(message); window.requestAnimationFrame(() => document.getElementById(field)?.focus()); return;
    }
    act({ type: kind === 'focus' ? 'confirm-focus' : kind === 'plan' ? 'confirm-plan' : 'save-reflection' });
  };
  const download = () => {
    try { const url = URL.createObjectURL(new Blob([exportMeetingNotes(state, snapshot.reference)], { type: 'text/plain;charset=utf-8' })); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'Throughline_PLC_Meeting_Plan.txt'; document.body.append(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }
    catch (caught) { setErrorField(''); setError(caught instanceof Error ? caught.message : 'The plan could not be exported. Please try again.'); window.requestAnimationFrame(() => errorBox.current?.focus()); }
  };
  const savedLabel = workspace.dirty ? 'Unsaved changes' : workspace.externalChanged ? 'Newer version available' : 'Saved on this browser';
  return <FieldErrorProvider value={{ field: errorField, message: error }}>
    <a className="skip-link" href="#workspace">Skip to planning workspace</a>
    <header className="app-topbar"><div className="brand"><span className="brandmark"><Icon name="mark" size={23} /></span><span className="brandname">throughline</span></div><div className="topbar-context"><span>PLC workbook</span><strong>{snapshot.reference.workspace.name}</strong></div><div className="topbar-actions"><span className={`save-indicator ${workspace.dirty ? 'unsaved' : ''}`} role="status"><span className="status-dot" />{savedLabel}</span><span className="demo-badge">Fictional demo</span><button className="guide-button" aria-label="Open guide" onClick={() => setGuideOpen(true)}><Icon name="info" size={16} /><span>Guide</span></button></div></header>
    <div className="app-shell"><div className="workflow-rail">
      <nav className="path" aria-label="Planning stages">{stages.map((stage, i) => {
        const locked = (i === 2 && !focus) || (i === 3 && !plan);
        const detail = i === 2 && !focus ? 'Confirm a focus first' : i === 3 && !plan ? 'Approve a plan first' : stage.detail;
        const complete = i < 2 ? focus : i === 2 ? plan : reflection;
        return <button key={stage.label} className={`step ${state.step === i ? 'active' : ''} ${complete ? 'done' : ''}`} aria-current={state.step === i ? 'step' : undefined} aria-disabled={locked || undefined} aria-describedby={`stage-note-${i}`} onClick={() => locked ? setLockNotice(i === 2 ? 'Confirm your instructional focus in Interpretation to unlock the meeting plan.' : 'Approve your meeting plan to unlock Reflection.') : act({ type: 'go', step: i })}><span className="step-number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><span className="step-copy"><span className="nav-wide">{stage.label}</span><span className="nav-short">{stage.short}</span><span className="step-note" id={`stage-note-${i}`}>{detail}</span></span><span className="step-state">{locked ? <Icon name="lock" size={13} /> : complete ? <Icon name="check" size={14} /> : null}</span></button>;
      })}</nav>
      {lockNotice && <p className="nav-help" role="status">{lockNotice}</p>}
    </div><div className="workspace-shell">
      <CycleManager workspace={workspace} onReset={() => setResetOpen(true)} />
      <div className="page"><header className="intro"><div><h1 ref={title} tabIndex={-1}>{titles[state.step]}</h1><p>{subtitles[state.step]}</p></div>{plan && <button className="btn secondary compact" onClick={() => setKitOpen(true)}><Icon name="book" size={16} />Meeting kit</button>}</header>
        {notice && <div className="restore-note" role="status"><Icon name="info" size={17} /><span>{notice}</span><button className="icon-button" aria-label="Dismiss draft notice" onClick={() => setNotice('')}><Icon name="close" size={16} /></button></div>}
        {saveError && <Notice tone="warning"><div role="alert"><strong>Changes are not saved.</strong> {saveError}</div><div className="button-group"><button className="btn secondary compact" onClick={workspace.retrySave} disabled={workspace.externalChanged}>Retry save</button><button className="btn secondary compact" onClick={() => setReloadOpen(true)}>Reload saved data</button></div></Notice>}
        {workspace.externalChanged && !saveError && <div className="restore-note" role="status"><Icon name="info" size={17} /><span>Another tab changed this workspace. Reload to see its saved cycles.</span><button className="btn secondary compact" onClick={requestReload}>Reload saved data</button></div>}
        {workspace.operationError && <Notice tone="warning"><span role="alert">{workspace.operationError}</span><div className="button-group"><button className="btn secondary compact" onClick={requestReload}>Reload saved data</button></div></Notice>}
        <div className="layout"><main id="workspace" className="main" tabIndex={-1}>
          {state.review && <div role="status"><Notice tone="warning"><strong>Review required.</strong> A source or decision changed. Your drafts are preserved; reconfirm the affected decisions.</Notice></div>}
          {error && <div ref={errorBox} tabIndex={-1} role="alert" className="form-error">{errorField ? 'Review the highlighted field to continue.' : error}{errorField && <button className="textlink" onClick={() => document.getElementById(errorField)?.focus()}>Go to that field<Icon name="arrow" size={14} /></button>}</div>}
          {state.step === 0 && <Evidence state={state} dispatch={act} />}
          {state.step === 1 && <Reasoning state={state} dispatch={act} submit={submit} />}
          {state.step === 2 && <Meeting state={state} dispatch={act} submit={submit} />}
          {state.step === 3 && <FollowUp state={state} dispatch={act} submit={submit} download={() => setKitOpen(true)} />}
        </main><DecisionThread state={state} /></div>
        <footer className="footnote"><span>Throughline / PLC planning workbook</span><span>{savedLabel}</span></footer>
      </div>
    </div></div>
    {kitOpen && plan && <MeetingKit state={state} reference={snapshot.reference} onClose={() => setKitOpen(false)} downloadNotes={download} />}
    {resetOpen && <ConfirmationDialog title="Reset this cycle?" confirmLabel="Reset cycle" error={workspace.operationError} onClose={() => setResetOpen(false)} onConfirm={() => { if (workspace.resetCycle(snapshot.activeCycleId)) { setResetOpen(false); setError(''); setErrorField(''); window.requestAnimationFrame(() => title.current?.focus()); } }}><p>This clears this cycle's draft, approvals, and reflection. Other saved cycles stay unchanged.</p></ConfirmationDialog>}
    {reloadOpen && <ConfirmationDialog title="Reload saved data?" confirmLabel="Reload saved data" error={workspace.saveError || workspace.operationError} onClose={() => setReloadOpen(false)} onConfirm={reloadSaved}><p>This replaces unsaved edits on this page with the latest saved workspace. Copy any work you want to keep before continuing.</p></ConfirmationDialog>}
    {freshOpen && <ConfirmationDialog title="Start a fresh demo?" confirmLabel="Reset all cycles" error={workspace.operationError} onClose={() => setFreshOpen(false)} onConfirm={() => { if (workspace.resetDatabase()) setFreshOpen(false); }}><p>This removes all saved PLC cycles from this browser and starts one fresh cycle.</p></ConfirmationDialog>}
    {guideOpen && <Modal title="A connected planning cycle" onClose={() => setGuideOpen(false)}><p className="guide-intro">Start with the evidence. End with a teaching decision you can revisit.</p><ol className="guide-steps"><li><strong>Inspect the evidence.</strong><span>Compare scores with student work, dates, and source scope.</span></li><li><strong>Own the interpretation.</strong><span>Consider a prewritten challenge, then confirm your focus.</span></li><li><strong>Make a practical plan.</strong><span>Write activity directions, agree on an action and two follow-up checks, then approve and open your meeting kit.</span></li><li><strong>Revisit what happened.</strong><span>Separate implementation from learning and record your reflection.</span></li></ol><section className="pilot-notes"><h3>Who this pilot serves</h3><p>A single-grade math PLC leader examining student work. A guided sequence supports leaders who want help reading data or are new to AI. Multi-grade planning and lesson-planning-first workflows need a later design pass.</p><h3>Assumptions to test</h3><p>Aim for 20–40 minutes of preparation for a 50-minute meeting; this is a design target, not a measured result. The task, rubric, scores and observation are fictional. Check preparation time, whether leaders can explain their choices, and whether the teaching action was tried.</p><p>Detailed data stays one click away while selected excerpts remain visible. Six fixed time blocks favor a complete pilot flow; meeting length and data integrations are not configurable yet.</p></section><Notice>All evidence is fictional. Thinking prompts are scripted, with no live AI. Drafts save only in this browser; export an approved plan for a portable copy.</Notice><div className="guide-reset"><strong>Presenter tools</strong><p>Start the demonstration again with one fresh cycle.</p><button className="btn secondary" onClick={() => { workspace.clearOperationError(); setGuideOpen(false); setFreshOpen(true); }}>Reset all saved cycles</button></div><div className="modal-actions"><button className="btn" data-autofocus onClick={() => setGuideOpen(false)}>Got it</button></div></Modal>}
  </FieldErrorProvider>;
}
function Startup({ workspace }: { workspace: WorkspaceController }) {
  const [freshOpen, setFreshOpen] = useState(false);
  return <main className="startup"><span className="brandmark"><Icon name="mark" size={26} /></span><div className="kicker">Throughline · PLC planning partner</div><h1>{workspace.loading ? 'Opening your workspace…' : 'Your workspace could not be opened'}</h1>
    {workspace.loading ? <p role="status">Loading your saved cycles from this browser.</p> : <><p role="alert">{workspace.loadError}</p><div className="button-group"><button className="btn" onClick={workspace.reload}>Retry loading</button><button className="btn secondary" onClick={() => { workspace.clearOperationError(); setFreshOpen(true); }}>Start a fresh demo</button></div></>}
    {freshOpen && <ConfirmationDialog title="Start a fresh local workspace?" confirmLabel="Start fresh" error={workspace.operationError} onClose={() => setFreshOpen(false)} onConfirm={workspace.resetDatabase}><p>This replaces all saved PLC cycles in this browser with one fresh cycle, only if the new workspace can be saved.</p></ConfirmationDialog>}
  </main>;
}
export default function App() {
  const workspace = useWorkspace();
  if (!workspace.snapshot || !workspace.state) return <Startup workspace={workspace} />;
  return <ReferenceContext.Provider value={workspace.snapshot.reference}><Planner key={workspace.snapshot.activeCycleId} workspace={{ ...workspace, snapshot: workspace.snapshot, state: workspace.state }} /></ReferenceContext.Provider>;
}
