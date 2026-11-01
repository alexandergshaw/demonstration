import { Icon } from './Icon';
import './StepProgress.css';

export interface StepProgressProps {
  title: string;
  benefit: string;
  items: readonly {
    id: string;
    label: string;
    complete: boolean;
    onSelect: () => void;
  }[];
  nextId?: string;
  nextLabel?: string;
  onNext?: () => void;
  completion?: string;
  progressLabel?: string;
  completeLabel?: string;
  incompleteLabel?: string;
  note?: string;
}

/** Draft completeness only; it does not infer quality, saving, or approval. */
export function StepProgress({
  title,
  benefit,
  items,
  nextId,
  nextLabel,
  onNext,
  completion,
  progressLabel = 'parts recorded',
  completeLabel = 'Recorded',
  incompleteLabel = 'To do',
  note = 'This tracks recorded work, not its quality or whether it has saved.',
}: StepProgressProps) {
  const completed = items.filter(item => item.complete).length;
  const nextItem = items.find(item => item.id === nextId);
  const nextAction = onNext ?? nextItem?.onSelect;
  const actionLabel = nextLabel ?? (nextItem ? `Next: ${nextItem.label}` : 'Continue');

  return <section className="step-progress" aria-label="Step progress">
    <div className="step-progress-overview">
      <div className="step-progress-copy">
        <p className="step-progress-title"><strong>{title}</strong></p>
        <p className="step-progress-benefit">{benefit}</p>
      </div>
      {nextAction && <button type="button" className="step-progress-next" onClick={nextAction}>
        <span>{actionLabel}</span><Icon name="arrow" />
      </button>}
    </div>
    <details className="step-progress-details">
      <summary>See the steps <span className="step-progress-count">· {completion ?? `${completed} of ${items.length} ${progressLabel}`}</span></summary>
      <p className="step-progress-note">{note}</p>
      <ol className="step-progress-list">
        {items.map(item => <li key={item.id}>
          <button type="button" className="step-progress-item" onClick={item.onSelect}>
            <span className="step-progress-check" aria-hidden="true">{item.complete && <Icon name="check" />}</span>
            <span className="step-progress-item-label">{item.label}</span>
            <span className="step-progress-item-state">{item.complete ? completeLabel : incompleteLabel}</span>
          </button>
        </li>)}
      </ol>
    </details>
  </section>;
}
