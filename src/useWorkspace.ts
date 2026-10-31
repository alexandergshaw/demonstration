import { useCallback, useEffect, useRef, useState } from 'react';
import { createLocalBackend, DATABASE_KEY, DatabaseError, type WorkspaceSnapshot } from './data/database';
import { reducer, type Action, type PlanState } from './model';

const backend = createLocalBackend(() => window.localStorage);
interface WorkspaceView { snapshot: WorkspaceSnapshot | null; state: PlanState | null }
const message = (error: unknown) => error instanceof Error ? error.message : 'The workspace could not be saved. Please try again.';

export function useWorkspace() {
  const current = useRef<WorkspaceView>({ snapshot: null, state: null });
  const [view, setView] = useState<WorkspaceView>(current.current);
  const dirtyRef = useRef(false), externalRef = useRef(false);
  const [dirty, setDirty] = useState(false), [externalChanged, setExternalChanged] = useState(false);
  const [loading, setLoading] = useState(true), [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState(''), [operationError, setOperationError] = useState('');
  const [notice, setNotice] = useState('');
  const adopt = useCallback((snapshot: WorkspaceSnapshot) => {
    const state = snapshot.cycles.find(cycle => cycle.id === snapshot.activeCycleId)!.state;
    current.current = { snapshot, state }; setView(current.current);
    dirtyRef.current = false; externalRef.current = false;
    setDirty(false); setExternalChanged(false); setSaveError(''); setLoadError(''); setOperationError('');
    if (snapshot.notice) setNotice(snapshot.notice);
  }, []);
  const reload = useCallback(() => {
    try { adopt(backend.load()); return true; }
    catch (error) {
      if (current.current.snapshot) { setOperationError(message(error)); if (dirtyRef.current) setSaveError(message(error)); }
      else setLoadError(message(error));
      return false;
    }
    finally { setLoading(false); }
  }, [adopt]);
  useEffect(() => {
    reload();
    const changed = (event: StorageEvent) => {
      if (event.key !== DATABASE_KEY && event.key !== null) return;
      externalRef.current = true; setExternalChanged(true);
    };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, [reload]);
  function persist(state: PlanState, keepDraftOnFailure = true): boolean {
    const snapshot = current.current.snapshot;
    if (!snapshot) return false;
    // Typing stays visible after a failed save. Confirmation must wait for
    // storage so a failed confirmation cannot close its review or claim success.
    if (keepDraftOnFailure) { current.current = { snapshot, state }; setView(current.current); }
    try {
      if (externalRef.current) throw new Error('Another tab changed this workspace. Your edits are still here; reload the saved version before continuing.');
      adopt(backend.saveCycle(snapshot.activeCycleId, state, snapshot.revision)); return true;
    } catch (error) {
      if (error instanceof DatabaseError && error.code === 'conflict') { externalRef.current = true; setExternalChanged(true); }
      if (keepDraftOnFailure) { dirtyRef.current = true; setDirty(true); }
      setSaveError(message(error)); return false;
    }
  }
  function dispatch(action: Action) {
    const state = current.current.state;
    if (!state) return false;
    const next = reducer(state, action);
    const confirmation = action.type === 'confirm-focus' || action.type === 'confirm-plan' || action.type === 'save-reflection';
    return next !== state ? persist(next, !confirmation) : !dirtyRef.current && !externalRef.current;
  }
  function command(operation: (snapshot: WorkspaceSnapshot) => WorkspaceSnapshot): boolean {
    const snapshot = current.current.snapshot;
    if (!snapshot) return false;
    setOperationError('');
    if (dirtyRef.current || externalRef.current) {
      setOperationError('Save your current edits or reload the saved version before changing cycles.'); return false;
    }
    try { adopt(operation(snapshot)); return true; }
    catch (error) { setOperationError(message(error)); return false; }
  }
  function resetDatabase(): boolean {
    try { adopt(backend.resetDatabase()); setLoading(false); return true; }
    catch (error) { setOperationError(message(error)); return false; }
  }
  return {
    ...view, loading, loadError, saveError, operationError, dirty, externalChanged, notice, setNotice,
    dispatch, reload, resetDatabase, clearOperationError: () => setOperationError(''),
    retrySave: () => current.current.state ? persist(current.current.state) : false,
    createCycle: (title: string) => command(snapshot => backend.createCycle(title, snapshot.revision)),
    renameCycle: (id: string, title: string) => command(snapshot => backend.renameCycle(id, title, snapshot.revision)),
    duplicateCycle: (id: string) => command(snapshot => backend.duplicateCycle(id, snapshot.revision)),
    reviseWithLatest: () => command(snapshot => backend.reviseWithLatest(snapshot.activeCycleId, snapshot.revision)),
    selectCycle: (id: string) => command(snapshot => backend.selectCycle(id, snapshot.revision)),
    deleteCycle: (id: string) => command(snapshot => backend.deleteCycle(id, snapshot.revision)),
    resetCycle: (id: string) => command(snapshot => backend.resetCycle(id, snapshot.revision)),
  };
}
export type WorkspaceController = ReturnType<typeof useWorkspace>;
export type ReadyWorkspace = WorkspaceController & { snapshot: WorkspaceSnapshot; state: PlanState };
