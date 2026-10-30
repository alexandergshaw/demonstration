import { useEffect, useReducer, useRef, useState } from 'react';
import {
  decodeDraft, encodeDraft, evidenceLabels, exportPlan, focusError, hasFocus, hasPlan,
  hasReflection, initialState, minutes, planError, reducer, reflectionError, STORAGE_KEY,
  type Action, type EvidenceId, type Lens, type PlanState,
} from './model';

type Dispatch = (action: Action) => void;
const stages = ['Explore evidence', 'Interpret & decide', 'Build meeting', 'Revisit impact'];
const titles = ['Explore evidence, not just scores', 'Let the educator do the reasoning', 'Turn the decision into a meeting', 'Revisit what happened in classrooms'];
const subtitles = ['Inspect fictional student responses and understand the reliability of each source.', 'Form your interpretation first; then use the thinking partner to test it against the evidence.', 'Shape a usable PLC plan around one educator-owned teaching change.', 'Separate whether the strategy was tried from whether student learning improved.'];
const lenses: { id: Lens; label: string; prompt: string }[] = [
  { id: 'wording', label: 'Question wording', prompt: 'Could confusing question wording explain some incomplete explanations? Compare the responses with the original prompt before choosing a teaching action.' },
  { id: 'meaning', label: 'Procedure versus meaning', prompt: 'Does describing a procedure show that a student understands why the amounts are equal? What could a visual model or a follow-up question reveal?' },
  { id: 'variation', label: 'Variation across classrooms', prompt: 'Does the same pattern appear in every class? Class-level totals are descriptive, and the September observation covers only one classroom. What more would you need to know?' },
];
function Notice({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'warning' | 'success' }) {
  return <div className={`notice ${tone}`}><span className="sym" aria-hidden="true">{tone === 'success' ? '✓' : 'ⓘ'}</span><div>{children}</div></div>;
}
function SectionHead({ kicker, title, children, badge }: { kicker: string; title: string; children: React.ReactNode; badge?: string }) {
  return <div className="sectionhead"><div><div className="kicker">{kicker}</div><h2>{title}</h2><p>{children}</p></div>{badge && <span className="pill teal">{badge}</span>}</div>;
}
function Metric({ label, value, detail, secondary = false }: { label: string; value: number; detail: string; secondary?: boolean }) {
  return <div className={`stat ${secondary ? 'stat-tinted' : ''}`}><strong className="small muted">{label}</strong><div className="statnum">{value}<span>/120</span></div><small>{Math.round(value / 120 * 100)}% · {detail}</small><div className="progress" aria-hidden="true"><span style={{ width: `${value / 120 * 100}%` }} /></div></div>;
}
function EvidenceButton({ id, state, dispatch }: { id: EvidenceId; state: PlanState; dispatch: Dispatch }) {
  const selected = state.selected.includes(id);
  return <button className={`selectbtn ${selected ? 'chosen' : ''}`} aria-pressed={selected} onClick={() => dispatch({ type: 'evidence', id })}>{selected ? '✓ Added to thread' : id === 'observation' ? '+ Add as context' : '+ Add as evidence'}</button>;
}
function Evidence({ state, dispatch }: { state: PlanState; dispatch: Dispatch }) {
  const [examples, setExamples] = useState(true);
  const [classes, setClasses] = useState(false);
  return <>
    <SectionHead kicker="01 / Evidence workspace" title="What does the student work actually show?" badge="Updated Oct 28">Start with what we can observe. A score alone is not an instructional diagnosis.</SectionHead>
    <div className="summary source-summary"><div><strong>Grade 4 · Fraction equivalence</strong><p className="small muted">One fictional end-of-lesson cool-down · 120 responses · Four classes</p></div><span className="pill">Always included in thread</span></div>
    <div className="grid2 metrics"><Metric label="Correct fraction selected" value={89} detail="Oct 28" /><Metric label="Explanation meets rubric" value={46} detail="Oct 28" secondary /></div>
    <div className="subsection-title"><div><h3>Look beneath the score</h3><p className="small muted">The responses matter more than the aggregate alone.</p></div><button className="selectbtn" aria-expanded={examples} aria-controls="student-examples" onClick={() => setExamples(!examples)}>{examples ? 'Hide examples' : 'Show examples'}</button></div>
    {examples && <div className="grid2" id="student-examples">
      <article className="work"><div className="workheader"><strong className="small">Student response B</strong><span className="pill blue">Procedural</span></div><blockquote>“1/2 and 2/4 are equal because I doubled both numbers.”</blockquote><p>Possible procedural knowledge. Does the student understand why the amounts match?</p><div className="evidence-action"><EvidenceButton id="responseB" state={state} dispatch={dispatch} /></div></article>
      <article className="work"><div className="workheader"><strong className="small">Student response C</strong><span className="pill amber">Possible misconception</span></div><blockquote>“2/4 is bigger than 1/2 because 4 is bigger than 2.”</blockquote><p>Possible confusion about the size of fractional parts. What would reveal the underlying reasoning?</p><div className="evidence-action"><EvidenceButton id="responseC" state={state} dispatch={dispatch} /></div></article>
    </div>}
    <div className="subsection-title"><div><h3>Across-class variation</h3><p className="small muted">Comparison is descriptive, not a teacher ranking.</p></div><button className="selectbtn" aria-expanded={classes} aria-controls="class-results" onClick={() => setClasses(!classes)}>{classes ? 'Hide class results' : 'Explore class results'} <span aria-hidden="true">›</span></button></div>
    {classes && <div className="class-results" id="class-results"><table><caption>Fictional Oct 28 results · 30 responses in each class</caption><thead><tr><th scope="col">Class</th><th scope="col">Correct fraction</th><th scope="col">Adequate explanation</th></tr></thead><tbody>{[['A', 23, 12], ['B', 22, 10], ['C', 24, 13], ['D', 20, 11]].map(([name, correct, explanation]) => <tr key={name}><th scope="row">Class {name}</th><td>{correct}/30<div className="mini-bar" aria-hidden="true"><i style={{ width: `${Number(correct) / 30 * 100}%` }} /></div></td><td>{explanation}/30<div className="mini-bar" aria-hidden="true"><i className="two" style={{ width: `${Number(explanation) / 30 * 100}%` }} /></div></td></tr>)}</tbody></table><p className="caption">Different task conditions and missing context may explain variation. These totals do not measure teacher effectiveness.</p></div>}
    <article className="observation"><div><div className="workheader"><strong className="small">Classroom observation</strong><span className="pill amber">7 weeks old</span></div><p className="caption">Sep 9 · One classroom only</p><blockquote>“Students had limited opportunities to explain their strategies to one another.”</blockquote><p className="small caution-text">Historical context, not current proof of teaching practice across the grade.</p></div><EvidenceButton id="observation" state={state} dispatch={dispatch} /></article>
    <Notice><strong>Interpret with care.</strong> No teacher rankings. No causal conclusions from a single observation. Source dates and scope stay visible.</Notice>
    <div className="btnrow section-footer"><span className="caption">Select evidence worth discussing; you decide what it means.</span><button className="btn" onClick={() => dispatch({ type: 'go', step: 1 })}>Continue to interpretation <span aria-hidden="true">→</span></button></div>
  </>;
}
function TextArea({ id, label, value, onChange, hint, placeholder }: { id: string; label: string; value: string; onChange: (value: string) => void; hint?: string; placeholder?: string }) {
  return <div className="field-group"><label className="field" htmlFor={id}>{label}</label>{hint && <p className="field-hint" id={`${id}-hint`}>{hint}</p>}<textarea id={id} value={value} maxLength={4000} aria-describedby={hint ? `${id}-hint` : undefined} onChange={e => onChange(e.target.value)} placeholder={placeholder} /></div>;
}
function Reasoning({ state: s, dispatch, submit }: { state: PlanState; dispatch: Dispatch; submit: (kind: 'focus' | 'plan' | 'reflection') => void }) {
  return <>
    <SectionHead kicker="02 / Educator reasoning" title="What do you think the evidence means?">The thinking partner can test your reasoning. You choose the instructional conclusion.</SectionHead>
    <div className="summary"><strong className="small">Facts available for interpretation</strong><p className="small">89/120 students chose the correct fraction; 46/120 met the explanation rubric. {s.selected.includes('observation') ? 'Your selected observation was recorded seven weeks earlier, in one classroom.' : 'The older observation is not selected in your Decision Thread.'}</p></div>
    <div className="teacherbox"><div className="kicker">Your interpretation</div><TextArea id="interpretation" label="Describe what you notice, and what you still don't know." hint="At least 30 characters. Keep the observation separate from your explanation for it." value={s.interpretation} onChange={value => dispatch({ type: 'text', field: 'interpretation', value })} placeholder="I notice… One possible explanation is… I still need to know…" /></div>
    <div className="coachbox"><strong>✧ Thinking partner · simulated prompt</strong><p className="small muted">Choose an angle to challenge your interpretation. These prompts are scripted, not live AI.</p><div className="optionrow" role="group" aria-label="Challenge angle">{lenses.map(lens => <button key={lens.id} className={`option ${s.lens === lens.id ? 'selected' : ''}`} aria-pressed={s.lens === lens.id} onClick={() => dispatch({ type: 'lens', value: lens.id })}>{lens.label}</button>)}</div><div className="btnrow"><button id="challenge" className="btn secondary" disabled={s.interpretation.trim().length < 30} onClick={() => dispatch({ type: 'challenge' })}>Challenge my interpretation</button>{s.interpretation.trim().length < 30 && <span className="caption">Write your interpretation first.</span>}</div>{s.challenged && <div className="challenge-result" role="status"><strong className="small">A question to consider</strong><p>{lenses.find(lens => lens.id === s.lens)?.prompt}</p><p className="caption">Consider the question, then choose or revise your focus below.</p></div>}</div>
    <TextArea id="focus" label="One instructional focus · Your decision" hint="At least 25 characters. Name a change in teaching to explore, not a diagnosis of a teacher." value={s.focus} onChange={value => dispatch({ type: 'text', field: 'focus', value })} placeholder="What one change should this PLC explore?" />
    <div className="grid2"><div><label className="field" htmlFor="confidence">Confidence in this interpretation</label><select id="confidence" value={s.confidence} onChange={e => dispatch({ type: 'confidence', value: e.target.value as PlanState['confidence'] })}><option value="tentative">Tentative · More evidence needed</option><option value="moderate">Moderate · Plausible, not proven</option><option value="strong">Strong · Supported, still open to revision</option></select></div><div className="summary authority"><strong className="small">Decision authority</strong><p className="small muted">Only you can confirm this focus. The thinking partner offers questions, not approval.</p></div></div>
    <div className="btnrow section-footer"><button className="btn secondary" onClick={() => dispatch({ type: 'go', step: 0 })}>← Review evidence</button><button className="btn" onClick={() => submit('focus')}>Confirm instructional focus →</button></div>
  </>;
}
function Meeting({ state: s, dispatch, submit }: { state: PlanState; dispatch: Dispatch; submit: (kind: 'focus' | 'plan' | 'reflection') => void }) {
  return <>
    <SectionHead kicker="03 / Meeting studio" title="Make one teaching change concrete" badge="50-minute PLC">Use this starting structure to build a meeting your team can act on.</SectionHead>
    <div className="callout focus-summary"><strong className="small">Your confirmed instructional focus</strong><p>{s.focus}</p><button className="textlink" onClick={() => dispatch({ type: 'go', step: 1 })}>Revisit your reasoning</button></div>
    <div className="subsection-title"><h3>Editable meeting agenda</h3><span className="pill">Suggested structure</span></div>
    <div className="agenda-list">{s.agenda.map((activity, i) => <div className="agenda" key={i}><span className="minute">{minutes[i]} min</span><label className="sr-only" htmlFor={`agenda-${i}`}>Agenda activity {i + 1}</label><input type="text" id={`agenda-${i}`} maxLength={4000} value={activity} onChange={e => dispatch({ type: 'agenda', index: i, value: e.target.value })} /></div>)}</div>
    <p className="caption">Keep this agenda connected to the evidence and focus. Every segment remains editable.</p>
    <hr className="divider" /><h3>Classroom action & follow-up</h3>
    <TextArea id="action" label="One concrete teaching action" hint="At least 25 characters. What will teachers try in their next lessons?" value={s.action} onChange={value => dispatch({ type: 'text', field: 'action', value })} placeholder="Teachers will try…" />
    <label className="field" htmlFor="owner">Who will try the strategy?</label><input type="text" id="owner" value={s.owner} maxLength={4000} onChange={e => dispatch({ type: 'text', field: 'owner', value: e.target.value })} />
    <div className="grid2"><TextArea id="implementation-check" label="How will you check that teaching changed?" hint="Implementation evidence · At least 15 characters" value={s.implementationCheck} onChange={value => dispatch({ type: 'text', field: 'implementationCheck', value })} placeholder="A teacher check-in, a lesson artifact, an observation…" /><TextArea id="learning-check" label="How will you check student learning?" hint="Comparable learning evidence · At least 15 characters" value={s.learningCheck} onChange={value => dispatch({ type: 'text', field: 'learningCheck', value })} placeholder="Comparable cool-downs, the same explanation rubric…" /></div>
    <label className="approval"><input id="consent" type="checkbox" checked={s.consent} onChange={e => dispatch({ type: 'consent', value: e.target.checked })} /><span><strong>I reviewed and own this plan.</strong><span className="small muted">The focus, teaching action, and follow-up reflect educator decisions. Any edits will require approval again.</span></span></label>
    <div className="btnrow section-footer"><button className="btn secondary" onClick={() => dispatch({ type: 'go', step: 1 })}>← Revisit reasoning</button><button className="btn" onClick={() => submit('plan')}>Approve plan & open follow-up →</button></div>
  </>;
}
function FollowUp({ state: s, dispatch, submit, download }: { state: PlanState; dispatch: Dispatch; submit: (kind: 'focus' | 'plan' | 'reflection') => void; download: () => void }) {
  const messages = { '': 'Choose an implementation status before interpreting the next learning evidence.', yes: 'Inspect subsequent work and implementation fidelity before evaluating the strategy.', partial: 'Record which classes used the routine and how. Aggregate results may conceal different experiences.', no: 'Start with implementation barriers. The agreed strategy has not yet been tested in classrooms.' };
  return <>
    <SectionHead kicker="04 / Next PLC cycle" title="Did the teaching change happen?">A better score alone cannot tell us whether the strategy worked.</SectionHead>
    <div className="summary"><strong className="small">Previously agreed teaching action</strong><p>{s.action}</p><p className="small muted">Owner: {s.owner}</p><dl className="checks"><dt>Implementation check</dt><dd>{s.implementationCheck}</dd><dt>Learning check</dt><dd>{s.learningCheck}</dd></dl></div>
    <fieldset className="implementation"><legend>1 · What happened when the strategy was tried?</legend><div className="optionrow">{([['yes', 'Used as planned'], ['partial', 'Partially used'], ['no', 'Not yet used']] as const).map(([id, label]) => <label className={`option ${s.implementation === id ? 'selected' : ''}`} key={id}><input id={`implementation-${id}`} type="radio" name="implementation" value={id} checked={s.implementation === id} onChange={() => dispatch({ type: 'implementation', value: id })} />{label}</label>)}</div></fieldset>
    <Notice>{messages[s.implementation]}</Notice><hr className="divider" /><h3>2 · Inspect the next student evidence</h3>
    <div className="grid2 metrics"><Metric label="Initial adequate explanations" value={46} detail="Oct 28" /><Metric label="Next-cycle adequate explanations" value={56} detail="Fictional follow-up" secondary /></div>
    <Notice tone="warning"><strong>Improvement is not proof of causality.</strong> Check the rubric, assessment, cohort, missing responses, and actual implementation before interpreting the change.</Notice>
    <TextArea id="reflection" label="3 · Your follow-up interpretation" hint="At least 30 characters. What changed, what might explain it, and what should the PLC examine next?" value={s.reflection} onChange={value => dispatch({ type: 'text', field: 'reflection', value })} placeholder="The next evidence suggests… Before concluding, we should…" />
    {hasReflection(s) && <div role="status"><Notice tone="success"><strong>Reflection recorded.</strong> Your interpretation is now linked to this plan in the Decision Thread.</Notice></div>}
    <div className="btnrow section-footer"><button className="btn secondary" onClick={() => dispatch({ type: 'go', step: 2 })}>← Edit meeting</button><div className="button-group"><button className="btn secondary" onClick={download}>Export plan ↓</button><button className="btn" onClick={() => submit('reflection')}>{hasReflection(s) ? 'Reflection recorded ✓' : 'Save reflection'}</button></div></div>
  </>;
}
function DecisionThread({ state: s }: { state: PlanState }) {
  const focus = hasFocus(s), plan = hasPlan(s), reflection = hasReflection(s);
  const items = [
    { label: 'Evidence selected', value: s.selected.map(id => evidenceLabels[id]).join(' · '), done: true },
    { label: 'Educator interpretation', value: focus ? s.interpretation : 'Awaiting your confirmation', done: focus },
    { label: 'Instructional focus', value: focus ? s.focus : 'Not yet confirmed', done: focus },
    { label: 'Classroom action', value: plan ? s.action : 'Awaiting an approved teaching commitment', done: plan },
    { label: 'Follow-up measures', value: plan ? `Implementation: ${s.implementationCheck}\nLearning: ${s.learningCheck}` : 'Not yet agreed', done: plan },
    { label: 'Next-cycle reflection', value: reflection ? s.reflection : 'Not yet recorded', done: reflection },
  ];
  return <aside className="sidebar" aria-label="Decision Thread"><div className="card thread"><div className="kicker">Persistent decision record</div><h2>Decision Thread</h2><p className="small muted">Trace every choice back to evidence. No hidden instructional decisions.</p><ol className="thread-list">{items.map((item, i) => <li className={`threaditem ${item.done ? '' : 'empty'}`} key={item.label}><span className={`thread-number ${item.done ? 'complete' : ''}`} aria-hidden="true">{item.done ? '✓' : i + 1}</span><div><h3>{item.label}</h3><p>{item.value}</p></div></li>)}</ol><div className="callout"><strong className="small">Keep the thread connected.</strong><p className="small">If evidence or a decision changes, review and approve the affected plan again.</p></div></div><div className="sidefoot"><strong>Do with, never do for.</strong><p>AI supports the thinking. The educator makes the decisions.</p><p className="privacy">Concept only · All data fictional · Scripted prompts · No live AI or district integration.</p></div></aside>;
}
function ResetDialog({ onClose, onReset }: { onClose: () => void; onReset: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { dialog.current?.showModal(); }, []);
  return <dialog ref={dialog} onCancel={onClose} aria-labelledby="reset-title"><h2 id="reset-title">Start a fresh demo?</h2><p>This clears your draft, approvals, and reflection on this browser.</p><div className="button-group"><button className="btn secondary" autoFocus onClick={onClose}>Keep my draft</button><button className="btn" onClick={onReset}>Reset demo</button></div></dialog>;
}
export default function App() {
  const [loaded] = useState(() => { try { return decodeDraft(window.localStorage.getItem(STORAGE_KEY)); } catch { return { state: initialState(), notice: 'Browser storage is unavailable. Your changes will last only while this page stays open.' }; } });
  const [state, dispatch] = useReducer(reducer, loaded.state);
  const [notice, setNotice] = useState(loaded.notice);
  const [storageError, setStorageError] = useState('');
  const [error, setError] = useState('');
  const [errorField, setErrorField] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const errorBox = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  useEffect(() => { try { window.localStorage.setItem(STORAGE_KEY, encodeDraft(state)); setStorageError(''); } catch { setStorageError('Changes cannot be saved on this browser. Keep this page open; export your approved plan to keep a copy.'); } }, [state]);
  useEffect(() => { if (firstRender.current) { firstRender.current = false; return; } title.current?.focus(); window.scrollTo({ top: 0, behavior: 'instant' }); }, [state.step]);
  useEffect(() => { if (error) errorBox.current?.focus(); }, [error]);
  const act: Dispatch = action => { setError(''); dispatch(action); };
  const submit = (kind: 'focus' | 'plan' | 'reflection') => {
    const message = kind === 'focus' ? focusError(state) : kind === 'plan' ? planError(state) : reflectionError(state);
    if (message) {
      const field = kind === 'focus'
        ? state.interpretation.trim().length < 30 ? 'interpretation' : !state.challenged ? 'challenge' : 'focus'
        : kind === 'reflection' ? !state.implementation ? 'implementation-yes' : 'reflection'
        : state.agenda.some(a => a.trim().length < 5) ? `agenda-${state.agenda.findIndex(a => a.trim().length < 5)}`
        : state.action.trim().length < 25 ? 'action' : state.owner.trim().length < 3 ? 'owner'
        : state.implementationCheck.trim().length < 15 ? 'implementation-check'
        : state.learningCheck.trim().length < 15 ? 'learning-check' : 'consent';
      setErrorField(field); setError(message); errorBox.current?.focus(); return;
    }
    act({ type: kind === 'focus' ? 'confirm-focus' : kind === 'plan' ? 'confirm-plan' : 'save-reflection' });
  };
  const download = () => {
    try { const url = URL.createObjectURL(new Blob([exportPlan(state)], { type: 'text/plain;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = 'Throughline_PLC_Meeting_Plan.txt'; document.body.append(a); a.click(); a.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); } catch (e) { setError(e instanceof Error ? e.message : 'The plan could not be exported. Please try again.'); }
  };
  return <>
    <a className="skip-link" href="#workspace">Skip to planning workspace</a>
    <header className="top"><div className="topin"><div className="brand"><span className="brandmark" aria-hidden="true">↗</span><div><div className="brandname">throughline<span>.</span></div><div className="brandtag">PLC PLANNING PARTNER</div></div></div><div className="topmeta"><span className="chip-dark">Grade 4 Math</span><span className="chip-dark">Fictional data only</span><button className="topbtn" onClick={() => setResetOpen(true)}>↻ Reset demo</button></div></div></header>
    <div className="page"><div className="intro"><div><div className="eyebrow">The evidence-to-action workspace</div><h1 ref={title} tabIndex={-1}>{titles[state.step]}</h1><p>{subtitles[state.step]}</p></div></div>
      {notice && <div className="restore-note" role="status"><span>{notice}</span><button aria-label="Dismiss draft notice" onClick={() => setNotice('')}>×</button></div>}
      {storageError && <Notice tone="warning"><span role="status">{storageError}</span></Notice>}
      <nav className="path" aria-label="Planning stages">{stages.map((label, i) => { const complete = i === 0 ? state.step > 0 || hasFocus(state) : i === 1 ? hasFocus(state) : i === 2 ? hasPlan(state) : hasReflection(state); return <button key={label} className={`step ${state.step === i ? 'active' : ''} ${complete ? 'done' : ''}`} aria-current={state.step === i ? 'step' : undefined} disabled={(i === 2 && !hasFocus(state)) || (i === 3 && !hasPlan(state))} onClick={() => act({ type: 'go', step: i })}><span className="num" aria-hidden="true">{complete && state.step !== i ? '✓' : i + 1}</span>{label}</button>; })}</nav>
      <div className="layout"><main id="workspace" className="card pad main" tabIndex={-1}>
        {state.review && <div role="status"><Notice tone="warning"><strong>Review required.</strong> A source or decision changed. Your drafts are preserved; reconfirm the focus and affected plan before continuing.</Notice></div>}
        {state.step === 0 && <Evidence state={state} dispatch={act} />}
        {state.step === 1 && <Reasoning state={state} dispatch={act} submit={submit} />}
        {state.step === 2 && <Meeting state={state} dispatch={act} submit={submit} />}
        {state.step === 3 && <FollowUp state={state} dispatch={act} submit={submit} download={download} />}
        <div ref={errorBox} tabIndex={-1} role="alert" className={error ? 'form-error' : 'sr-only'}>{error}{error && errorField && <button onClick={() => document.getElementById(errorField)?.focus()}>Go to the field that needs attention →</button>}</div>
      </main><DecisionThread state={state} /></div>
      <details className="presenter"><summary>Design notes & presenter tools</summary><div className="card pad"><h2>Designed for educator judgment</h2><p>Start with one grade-four math PLC. Keep evidence visible, ask the leader to interpret it, and link one teaching change to separate implementation and learning checks.</p><div className="grid3"><div><h3>A workspace, beyond chat</h3><p>Persistent evidence and the Decision Thread keep sources beside decisions, without scrolling through a conversation.</p></div><div><h3>Focused, not exhaustive</h3><p>Two patterns first; student work and class breakdowns on demand. Multi-grade planning remains outside this pilot.</p></div><div><h3>Dates are part of evidence</h3><p>Daily student results and a quarterly observation have different scopes. Context is never presented as causal proof.</p></div></div><p className="small muted">For the interview: clarify a new constraint, explain the tradeoff, revise the affected step, and describe what you would validate with educators.</p><p className="caption">The original HTML reference and Figma handoff files are preserved with the project source.</p></div></details>
      <footer className="footnote"><span>Throughline · Leading Educators fictional performance task · October 2026</span><span role="status">{storageError ? 'Session only · Browser save unavailable' : 'Draft saved on this browser'}</span></footer>
    </div>{resetOpen && <ResetDialog onClose={() => setResetOpen(false)} onReset={() => { act({ type: 'reset' }); setNotice('A fresh demo is ready.'); setResetOpen(false); }} />}
  </>;
}
