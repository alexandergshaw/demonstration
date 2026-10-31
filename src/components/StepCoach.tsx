import { useId, type ReactNode } from 'react';
import './StepCoach.css';

interface StepCoachProps {
  question: string;
  children: ReactNode;
  ready?: string;
}

/** Optional thinking support. A self-check is guidance, not a completion assessment. */
export function StepCoach({ question, children, ready }: StepCoachProps) {
  const questionId = useId();
  return <section className="step-coach" aria-labelledby={questionId}>
    <p className="step-coach-question" id={questionId}>{question}</p>
    <details className="step-coach-help">
      <summary>Help me think this through</summary>
      <div className="step-coach-content">
        {children}
        {ready && <p className="step-coach-self-check"><strong>Self-check</strong> {ready}</p>}
      </div>
    </details>
  </section>;
}
