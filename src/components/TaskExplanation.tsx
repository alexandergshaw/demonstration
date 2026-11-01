import { useId } from 'react';
import './TaskExplanation.css';

interface TaskExplanationProps {
  id?: string;
  title: string;
  headingLevel?: 'h2' | 'h3' | 'h4';
  why: string;
  steps: readonly { label: string; detail: string }[];
  example?: string;
  handoff?: string;
}

/** Visible task guidance; examples never write to or evaluate the educator's draft. */
export function TaskExplanation({ id, title, headingLevel = 'h3', why, steps, example, handoff }: TaskExplanationProps) {
  const titleId = useId();
  const Heading = headingLevel;
  return <section id={id} tabIndex={id ? -1 : undefined} className="task-explanation" aria-labelledby={titleId}>
    <Heading className="task-explanation-title" id={titleId}>{title}</Heading>
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
  </section>;
}
