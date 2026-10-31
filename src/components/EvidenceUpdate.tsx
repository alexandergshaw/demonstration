import { useState } from 'react';
import type { Action, PlanState } from '../model';
import type { ReferenceData } from '../data/seed';
import { evidenceSnapshotDescription, referenceForVersion } from '../data/evidenceSnapshots';
import { Modal } from './CycleManager';
import './EvidenceUpdate.css';

export function EvidenceUpdate({ state, base, dispatch, onRevise, error, saveError, onRetrySave }: {
  state: PlanState; base: ReferenceData; dispatch: (action: Action) => boolean;
  onRevise: () => boolean; error: string; saveError: string; onRetrySave: () => boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = referenceForVersion(base, state.evidenceVersion);
  const incoming = referenceForVersion(base, 'oct29');
  const updated = state.evidenceVersion === 'oct29';
  const available = state.updateAvailable && !updated;
  return <section className={`evidence-update ${available && !state.updateReviewed ? 'update-pending' : ''}`} aria-label="Evidence snapshot">
    <div><p className="context-label">Evidence snapshot · {current.assessment.date}, 2026</p>
      <p className="small">{updated ? 'This cycle uses the newer results. The source packet includes their coverage and comparison limits.' : available ? state.updateReviewed ? 'You kept this snapshot. Newer results remain available to compare.' : 'New fictional results are available. Your current decisions still use the saved snapshot.' : 'Your decisions stay attached to these dated sources.'}</p>
    </div>
    {!updated && <button className="btn secondary compact" onClick={() => {
      if (!state.updateAvailable) dispatch({ type: 'simulate-evidence-update' });
      setOpen(true);
    }}>{available ? 'Compare new results' : 'Try a new-results update'}</button>}
    {open && <Modal title="Review the new results" onClose={() => setOpen(false)}>
      <p className="caption">Fictional update demonstration · No live data connection</p>
      <p className="update-intro">Compare what changed before deciding whether to revise. Newer work does not automatically replace the evidence behind your plan.</p>
      <div className="update-comparison">
        {[{ title: 'Current snapshot', data: current, version: state.evidenceVersion }, { title: 'Available snapshot', data: incoming, version: 'oct29' as const }].map(({ title, data, version }) => <section key={title}>
          <h3>{title}</h3><p className="update-date">{data.assessment.date}, 2026</p>
          <dl><dt>Correct fraction</dt><dd>{data.assessment.correct}/{data.assessment.total}</dd><dt>Adequate explanation</dt><dd>{data.assessment.explanations}/{data.assessment.total}</dd></dl>
          <p className="small">{evidenceSnapshotDescription(version)}</p>
        </section>)}
      </div>
      <div className="update-context"><h3>Historical context stays historical</h3><p>{base.observation.date} · {base.observation.scope}. {base.observation.caution}</p></div>
      <p className="small">A new draft keeps your writing for revision and starts a fresh evidence selection. Recheck the new work, consider an alternative, and confirm your focus and plan again. The original cycle remains saved with its decisions and evidence.</p>
      {error && <p role="alert" className="dialog-error">{error}</p>}
      {saveError && <div role="alert" className="dialog-error"><p><strong>Changes are not saved.</strong> {saveError}</p><button className="btn secondary compact" onClick={onRetrySave}>Retry save</button><p className="caption">If another tab changed the workspace, close this reader and reload the saved data.</p></div>}
      <div className="modal-actions button-group">
        <button className="btn secondary" onClick={() => { if (dispatch({ type: 'keep-current-evidence' })) setOpen(false); }}>Keep current snapshot</button>
        <button className="btn" disabled={Boolean(saveError)} onClick={() => { if (onRevise()) setOpen(false); }}>Create draft with new results</button>
      </div>
    </Modal>}
  </section>;
}
