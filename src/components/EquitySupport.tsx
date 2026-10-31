import type { Action, PlanState } from '../model';
import { TextArea } from './Field';

export function EquityLens() {
  return <details className="equity-lens">
    <summary>Check access, strengths & voice</summary>
    <div className="equity-lens-body">
      <p>Use these questions to test your interpretation before choosing a teaching focus.</p>
      <ul>
        <li>What understanding or strategy is already visible in this work?</li>
        <li>Could task wording, language, format, or opportunities to respond be hiding understanding?</li>
        <li>Whose work or perspective is missing? What would you ask students, families, or colleagues before deciding?</li>
        <li>How could you keep the same learning goal while offering more than one way to participate or explain?</li>
      </ul>
      <p className="caption">These fictional samples contain no demographic, language, disability, or participation records. Treat these as questions to investigate, not conclusions about students.</p>
    </div>
  </details>;
}

export function AccessParticipation({ state, dispatch }: { state: PlanState; dispatch: (action: Action) => void }) {
  return <section className="access-planning" aria-label="Access and participation">
    <TextArea id="access-participation" label="Access & participation plan (optional)"
      hint="Keep the learning goal challenging. Name a participation or language support, the strengths it builds on, and what you still need to learn. Use fictional or non-identifying notes."
      value={state.accessParticipation}
      onChange={value => dispatch({ type: 'text', field: 'accessParticipation', value })}
      placeholder="We will make room for… while keeping… We still need to ask or check…" />
    <details className="participation-options">
      <summary>Consider participation options</summary>
      <ul>
        <li>Offer private thinking time and spoken, written, or drawn contributions. Agree how someone can pass or contribute later.</li>
        <li>Ask which language supports or representations would help participants explain the same mathematical idea.</li>
        <li>Seek student, family, or colleague perspectives that are missing before deciding what a response means.</li>
      </ul>
      <p className="caption">Choose what fits your context. A planning note is not evidence that access improved; revisit it alongside the next evidence.</p>
    </details>
  </section>;
}
