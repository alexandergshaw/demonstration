import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { MAX_CYCLES } from '../data/database';
import type { ReadyWorkspace } from '../useWorkspace';
import { Icon } from './Icon';

export function Modal({ title, children, onClose, initialFocus = 'title' }: { title: string; children: ReactNode; onClose: () => void; initialFocus?: 'title' | 'control' }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const node = dialog.current;
    const trigger = document.activeElement;
    if (node && !node.open) {
      node.showModal();
      const target = initialFocus === 'control' ? node.querySelector<HTMLElement>('[data-autofocus]') : node.querySelector<HTMLElement>('.modal-heading h2');
      target?.focus({ preventScroll: true });
      node.scrollTop = 0;
    }
    return () => {
      if (node?.open) node.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, []);
  return <dialog ref={dialog} onCancel={event => { event.preventDefault(); onClose(); }} aria-labelledby={titleId}>
    <div className="modal-heading"><h2 id={titleId} tabIndex={-1}>{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><Icon name="close" /></button></div>
    {children}
  </dialog>;
}
export function ConfirmationDialog({ title, children, confirmLabel, error, onClose, onConfirm }: { title: string; children: ReactNode; confirmLabel: string; error?: string; onClose: () => void; onConfirm: () => void }) {
  return <Modal title={title} onClose={onClose} initialFocus="control">
    <div className="dialog-description">{children}</div>
    {error && <p role="alert" className="dialog-error">{error}</p>}
    <div className="button-group modal-actions"><button className="btn secondary" data-autofocus onClick={onClose}>Cancel</button><button className="btn" onClick={onConfirm}>{confirmLabel}</button></div>
  </Modal>;
}
function NameDialog({ mode, initialName, error, onClose, onSave }: { mode: 'create' | 'rename'; initialName: string; error: string; onClose: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState(initialName);
  return <Modal title={mode === 'create' ? 'Start a new PLC cycle' : 'Rename this cycle'} onClose={onClose} initialFocus="control">
    <form onSubmit={event => { event.preventDefault(); onSave(name); }}>
      <label className="field" htmlFor="cycle-name">Cycle name</label>
      <input id="cycle-name" type="text" value={name} onChange={event => setName(event.target.value)} maxLength={80} required data-autofocus aria-invalid={Boolean(error && !name.trim()) || undefined} aria-describedby={`cycle-name-hint${error ? ' cycle-name-error' : ''}`} />
      <p id="cycle-name-hint" className="field-hint">A name your team will recognize. Up to 80 characters.</p>
      {error && <p id="cycle-name-error" role="alert" className="dialog-error">{error}</p>}
      <div className="button-group modal-actions"><button className="btn secondary" type="button" onClick={onClose}>Cancel</button><button className="btn" type="submit">{mode === 'create' ? 'Create cycle' : 'Save name'}</button></div>
    </form>
  </Modal>;
}
export function CycleManager({ workspace, onReset, compact = false }: { workspace: ReadyWorkspace; onReset: () => void; compact?: boolean }) {
  const { snapshot, dirty, externalChanged } = workspace;
  const cycle = snapshot.cycles.find(value => value.id === snapshot.activeCycleId)!;
  const [mode, setMode] = useState<'create' | 'rename' | 'delete' | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const blocked = dirty || externalChanged;
  const updated = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(cycle.updatedAt));
  useEffect(() => {
    if (!menuOpen) return;
    const closeOutside = (event: Event) => { if (event.target instanceof Node && !menu.current?.contains(event.target)) setMenuOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); setMenuOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('focusin', closeOutside); document.removeEventListener('keydown', escape); };
  }, [menuOpen]);
  function closeMenu() { setMenuOpen(false); trigger.current?.focus(); }
  function open(next: typeof mode) { closeMenu(); workspace.clearOperationError(); setMode(next); }
  return <section className={`cycle-toolbar ${compact ? 'cycle-compact' : ''}`} aria-label="Saved PLC cycles">
    <div className="cycle-selector"><label htmlFor="active-cycle">PLC cycle</label><select id="active-cycle" value={cycle.id} disabled={blocked} onChange={event => workspace.selectCycle(event.target.value)}>{snapshot.cycles.map(value => <option key={value.id} value={value.id}>{value.title}</option>)}</select></div>
    <span className="cycle-updated">{dirty ? 'Unsaved edits' : externalChanged ? 'Newer version available' : `Updated ${updated}`}</span>
    <div className="cycle-actions">
      {!compact && <button className="btn secondary compact" disabled={blocked || snapshot.cycles.length >= MAX_CYCLES} onClick={() => { workspace.clearOperationError(); setMode('create'); }}><Icon name="plus" size={16} />New cycle</button>}
      <div className="cycle-menu" ref={menu}>
        <button ref={trigger} className="icon-button" aria-label="Cycle actions" aria-expanded={menuOpen} aria-controls={menuId} disabled={blocked} onClick={() => setMenuOpen(!menuOpen)}><Icon name="more" /></button>
        {menuOpen && <div className="cycle-popover" id={menuId} role="group" aria-label="Cycle actions">
          <div className="popover-caption">{snapshot.cycles.length} of {MAX_CYCLES} saved cycles</div>
          {compact && <button disabled={snapshot.cycles.length >= MAX_CYCLES} onClick={() => open('create')}><Icon name="plus" size={16} />New cycle</button>}
          <button onClick={() => open('rename')}><Icon name="pencil" size={16} />Rename cycle</button>
          <button disabled={snapshot.cycles.length >= MAX_CYCLES} onClick={() => { closeMenu(); workspace.duplicateCycle(cycle.id); }}><Icon name="copy" size={16} />Duplicate as draft</button>
          <div className="popover-divider" />
          <button onClick={() => { closeMenu(); workspace.clearOperationError(); onReset(); }}><Icon name="reset" size={16} />Reset this cycle</button>
          <button className="danger-text" disabled={snapshot.cycles.length === 1} onClick={() => open('delete')}><Icon name="trash" size={16} />Delete cycle</button>
          {snapshot.cycles.length === 1 && <p className="popover-hint">Keep one cycle. Reset it to start again.</p>}
        </div>}
      </div>
    </div>
    {(mode === 'create' || mode === 'rename') && <NameDialog mode={mode} initialName={mode === 'rename' ? cycle.title : ''} error={workspace.operationError} onClose={() => setMode(null)} onSave={name => { if (mode === 'create' ? workspace.createCycle(name) : workspace.renameCycle(cycle.id, name)) setMode(null); }} />}
    {mode === 'delete' && <ConfirmationDialog title="Delete this cycle?" confirmLabel="Delete cycle" error={workspace.operationError} onClose={() => setMode(null)} onConfirm={() => { if (workspace.deleteCycle(cycle.id)) setMode(null); }}><p>Delete “{cycle.title}” and its plan and reflection from this browser? Your other cycles will stay saved.</p></ConfirmationDialog>}
  </section>;
}
