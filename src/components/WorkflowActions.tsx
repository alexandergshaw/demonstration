import type { ReactNode } from 'react';
import { Icon } from './Icon';
import './WorkflowActions.css';

export interface WorkflowActionsProps {
  primary: {
    label: ReactNode;
    onClick: () => void;
    id?: string;
    disabled?: boolean;
    arrow?: boolean;
    describedBy?: string;
    invalid?: boolean;
  };
  secondary?: ReactNode;
  description?: ReactNode;
  status?: ReactNode;
  label?: string;
}

/** Shared action placement only; callers own validation, save status and navigation. */
export function WorkflowActions({ primary, secondary, description, status, label = 'Workflow actions' }: WorkflowActionsProps) {
  return <div className="workflow-actions">
    {description && <div className="workflow-actions-description">{description}</div>}
    {status && <div className="workflow-actions-status">{status}</div>}
    <div className="workflow-actions-controls" role="group" aria-label={label}>
      {secondary && <div className="workflow-actions-secondary">{secondary}</div>}
      <button type="button" id={primary.id} className="btn workflow-actions-primary" disabled={primary.disabled} aria-describedby={primary.describedBy} aria-invalid={primary.invalid || undefined} onClick={primary.onClick}>
        <span>{primary.label}</span>{primary.arrow && <Icon name="arrow" size={17} />}
      </button>
    </div>
  </div>;
}
