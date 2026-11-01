import { useId } from 'react';
import './TaskExplanation.css';
import './TaskHelp.css';

interface TaskExplanationProps {
  id?: string;
  title: string;
  headingLevel?: 'h2' | 'h3' | 'h4';
  why: string;
  steps: readonly { label: string; detail: string }[];
  example?: string;
  handoff?: string;
  disclosureLabel?: string;
}

/** Task guidance; examples never write to or evaluate the educator's draft. */
export function TaskExplanation({ id, title, headingLevel = 'h3', why, steps, example, handoff, disclosureLabel }: TaskExplanationProps) {
  const titleId = useId();
  const Heading = headingLevel;
  const content = <>
    <Heading className="task-explanation-title" id={disclosureLabel ? undefined : titleId}>{title}</Heading>
    <p className="task-explanation-why">{why}</p>
    <ol className="task-explanation-steps">
      {steps.map(step => <li key={step.label}><strong>{step.label}</strong><span>{step.detail}</span></li>)}
    </ol>
    {example && <details className="task-explanation-example">
      <summary>See an illustrative example</summary>
      <p className="task-explanation-example-note">Example only · Use it to understand the task, then write your own response.</p>
      <p>{example}</p>
    </details>}
    {handoff && <p className="task-explanation-handoff"><strong>What comes next</strong><span>{handoff}</span></p>}
  </>;
  return <section id={id} tabIndex={id ? -1 : undefined} className={`task-explanation${disclosureLabel ? ' is-collapsible' : ''}`} aria-labelledby={titleId}>
    {disclosureLabel ? <details className="task-explanation-disclosure">
      <summary id={titleId}>{disclosureLabel}</summary>
      <div className="task-explanation-content">{content}</div>
    </details> : content}
  </section>;
}
