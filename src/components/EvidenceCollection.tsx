import { useEffect, useState } from 'react';
import type { Action, PlanState } from '../model';
import { FieldError, TextInput, useFieldError } from './Field';

function PlannedDate({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  const error = useFieldError(id, `${id}-hint`);
  return <div className="field-group text-input-group">
    <label className="field" htmlFor={id}>{label}</label>
    <p className="field-hint" id={`${id}-hint`}>Optional · YYYY-MM-DD. This is a planned date.</p>
    <input id={id} type="text" value={value} maxLength={10} placeholder="YYYY-MM-DD" autoComplete="off"
      aria-invalid={error.invalid || undefined} aria-describedby={error.describedBy} onChange={event => onChange(event.target.value)} />
    <FieldError id={id} />
  </div>;
}

export function EvidenceCollection({ state, dispatch }: { state: PlanState; dispatch: (action: Action) => void }) {
  const [open, setOpen] = useState(Boolean(state.evidenceCollector || state.collectionDate || state.reviewDate));
  const collectionError = useFieldError('collection-date');
  const reviewError = useFieldError('review-date');
  useEffect(() => { if (collectionError.invalid || reviewError.invalid) setOpen(true); }, [collectionError.invalid, reviewError.invalid]);
  return <details className="planning-disclosure" open={open} onToggle={event => setOpen(event.currentTarget.open)}>
    <summary>Plan the next evidence collection <span className="caption">Optional</span></summary>
    <div className="planning-disclosure-body">
      <p className="small muted">Use the implementation and learning checks above to decide what to collect. These commitments do not supply or verify the fictional follow-up evidence.</p>
      <TextInput id="evidence-collector" label="Who will collect the evidence?" hint="Optional · A team or role is enough."
        value={state.evidenceCollector} onChange={value => dispatch({ type: 'text', field: 'evidenceCollector', value })} />
      <div className="grid2">
        <PlannedDate id="collection-date" label="Planned collection date" value={state.collectionDate} onChange={value => dispatch({ type: 'text', field: 'collectionDate', value })} />
        <PlannedDate id="review-date" label="Planned PLC review date" value={state.reviewDate} onChange={value => dispatch({ type: 'text', field: 'reviewDate', value })} />
      </div>
    </div>
  </details>;
}
