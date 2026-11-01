import { useId, type ReactNode } from 'react';
import { Icon } from './Icon';
import './StageChecklist.css';

export interface ChecklistTask {
  id: string;
  label: string;
  detail: string;
  status: 'todo' | 'started' | 'done';
  statusLabel?: string;
  optional?: boolean;
  onSelect: () => void;
}

interface StageChecklistProps {
  title: string;
  description: string;
  items: readonly ChecklistTask[];
  currentId?: string;
  note?: string;
  contents?: Partial<Record<string, ReactNode>>;
}

/** Status is supplied by the workspace. Choosing a task only opens its work area. */
export function StageChecklist({ title, description, items, currentId, note, contents }: StageChecklistProps) {
  const titleId = useId();
  const required = items.filter(item => !item.optional);
  const complete = required.filter(item => item.status === 'done').length;
  return <section className="stage-checklist" aria-labelledby={titleId}>
    <div className="stage-checklist-heading">
      <h2 id={titleId}>{title}</h2>
      <p>{complete} of {required.length} core tasks checked</p>
    </div>
    <p className="stage-checklist-purpose">{description}</p>
    <ol className="stage-checklist-items">
      {items.map(item => <li key={item.id} data-task={item.id} data-status={item.status}>
        <button type="button" className="stage-checklist-task" aria-current={item.id === currentId ? 'step' : undefined}
          aria-expanded={contents && item.id in contents ? item.id === currentId : undefined}
          aria-controls={contents?.[item.id] != null ? `${titleId}-${item.id}-content` : undefined} onClick={item.onSelect}>
          <span className={`stage-checklist-mark is-${item.status}`} aria-hidden="true">{item.status === 'done' ? <Icon name="check" size={16} /> : item.status === 'started' ? '−' : null}</span>
          <span className="stage-checklist-copy"><strong id={`${titleId}-${item.id}-label`}>{item.label}</strong><span>{item.detail}</span></span>
          <span className="stage-checklist-state">{item.optional && <span>Optional · </span>}{item.statusLabel ?? (item.status === 'done' ? 'Done' : item.status === 'started' ? 'In progress' : 'To do')}</span>
          <Icon name="chevron" size={16} />
        </button>
        {contents?.[item.id] != null && <div id={`${titleId}-${item.id}-content`} className="stage-checklist-content" data-task-content={item.id}
          hidden={item.id !== currentId} role="region" aria-labelledby={`${titleId}-${item.id}-label`}>{contents[item.id]}</div>}
      </li>)}
    </ol>
    <p className="stage-checklist-note">Select a task to open its work below.{note ? ` ${note}` : ''}</p>
  </section>;
}
