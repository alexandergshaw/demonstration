import { useId } from 'react';
import './TaskExplanation.css';

interface TaskExplanationProps {
  id?: string;
  title: string;
  why: string;
  steps: readonly { label: string; detail: string }[];
  example?: string;
  handoff?: string;
}

/** Visible task guidance; examples never write to or evaluate the educator's draft. */
export function TaskExplanation({ id, title, why, steps, example, handoff }: TaskExplanationProps) {
  const titleId = useId();
  return <section id={id} tabIndex={id ? -1 : undefined} className="task-explanation" aria-labelledby={titleId}>
    <p className="task-explanation-title" id={titleId}>{title}</p>
    <p className="task-explanation-why">{why}</p>
    <ol className="task-explanation-steps">
      {steps.map(step => <li key={step.label}><strong>{step.label}</strong><span>{step.detail}</span></li>)}
    </ol>
    {handoff && <p className="task-explanation-handoff"><strong>What comes next</strong> {handoff}</p>}
    {example && <details className="task-explanation-example">
      <summary>See an illustrative example</summary>
      <p className="task-explanation-example-note">Example only · Use it to understand the task, then write your own response.</p>
      <p>{example}</p>
    </details>}
  </section>;
}
