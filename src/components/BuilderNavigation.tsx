import { useId } from 'react';
import './BuilderNavigation.css';

export interface BuilderNavigationProps {
  label: string;
  current: string;
  steps: readonly { id: string; label: string; panelId?: string }[];
  /** Buttons may move focus into the task; native selection keeps focus on the selector. */
  onSelect: (id: string, focus: boolean) => void;
}

/** Position and navigation only. Visiting a task never means it is reviewed or approved. */
export function BuilderNavigation({ label, current, steps, onSelect }: BuilderNavigationProps) {
  const pickerId = useId();
  const currentIndex = steps.findIndex(step => step.id === current);
  if (currentIndex < 0) return null;
  return <nav className="builder-navigation" aria-label={label}>
    <p className="builder-position">Task {currentIndex + 1} of {steps.length}</p>
    <ol className="builder-step-list">
      {steps.map((step, index) => <li key={step.id}>
        <button type="button" aria-current={current === step.id ? 'step' : undefined} aria-controls={current === step.id ? step.panelId : undefined}
          onClick={() => onSelect(step.id, true)}>
          <span className="builder-step-number" aria-hidden="true">{index + 1}</span><span>{step.label}</span>
        </button>
      </li>)}
    </ol>
    <div className="builder-task-picker">
      <label className="sr-only" htmlFor={pickerId}>{label}</label>
      <select id={pickerId} value={current} aria-controls={steps[currentIndex].panelId} onChange={event => {
        if (steps.some(step => step.id === event.target.value)) onSelect(event.target.value, false);
      }}>
        {steps.map((step, index) => <option key={step.id} value={step.id}>{index + 1}. {step.label}</option>)}
      </select>
    </div>
  </nav>;
}
