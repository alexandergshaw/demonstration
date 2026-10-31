import { createContext, useContext } from 'react';
import { Icon } from './Icon';

const FieldErrorContext = createContext({ field: '', message: '' });
export const FieldErrorProvider = FieldErrorContext.Provider;
export function useFieldError(id: string, hint?: string) {
  const error = useContext(FieldErrorContext);
  const invalid = error.field === id && Boolean(error.message);
  return { invalid, message: invalid ? error.message : '', describedBy: [hint, invalid ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined };
}
export function FieldError({ id }: { id: string }) {
  const { message } = useFieldError(id);
  return message ? <p id={`${id}-error`} className="field-error"><Icon name="warning" size={16} /><span>{message}</span></p> : null;
}
interface FieldProps {
  id: string; label: string; value: string; onChange: (value: string) => void;
  hint?: string; placeholder?: string;
}
export function TextArea({ id, label, value, onChange, hint, placeholder }: FieldProps) {
  const error = useFieldError(id, hint ? `${id}-hint` : undefined);
  return <div className="field-group">
    <label className="field" htmlFor={id}>{label}</label>
    {hint && <p className="field-hint" id={`${id}-hint`}>{hint}</p>}
    <textarea id={id} value={value} maxLength={4000} aria-invalid={error.invalid || undefined} aria-describedby={error.describedBy} onChange={event => onChange(event.target.value)} placeholder={placeholder} />
    <FieldError id={id} />
  </div>;
}
export function TextInput({ id, label, value, onChange, hint, hiddenLabel = false }: FieldProps & { hiddenLabel?: boolean }) {
  const error = useFieldError(id, hint ? `${id}-hint` : undefined);
  return <div className="field-group text-input-group">
    <label className={hiddenLabel ? 'sr-only' : 'field'} htmlFor={id}>{label}</label>
    {hint && <p className="field-hint" id={`${id}-hint`}>{hint}</p>}
    <input type="text" id={id} value={value} maxLength={4000} aria-invalid={error.invalid || undefined} aria-describedby={error.describedBy} onChange={event => onChange(event.target.value)} />
    <FieldError id={id} />
  </div>;
}
