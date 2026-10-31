import { useId, type ReactNode } from 'react';
import './StepCoach.css';

interface StepCoachProps {
  question: string;
  children: ReactNode;
  ready?: string;
}

/** Optional thinking support. A self-check is guidance, not a completion assessment. */
export function StepCoach({ question, children, ready }: StepCoachProps) {
  const helpId = useId();
  return <section className="step-coach" aria-labelledby={helpId}>
    <details className="step-coach-help">
      <summary id={helpId}>Help me think this through</summary>
      <div className="step-coach-content">
        <p className="step-coach-question">{question}</p>
        {children}
        {ready && <p className="step-coach-self-check"><strong>Self-check</strong> {ready}</p>}
      </div>
    </details>
  </section>;
}
