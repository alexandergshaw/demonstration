import { useState } from 'react';
import type { ReferenceData } from '../data/seed';
import { exportDraftCopy } from '../draftCopy';
import type { PlanState } from '../model';
import { Icon } from './Icon';

interface DraftCopyButtonProps {
  state: PlanState;
  reference: ReferenceData;
  cycleTitle: string;
  className?: string;
}

export function DraftCopyButton({ state, reference, cycleTitle, className = 'btn secondary compact' }: DraftCopyButtonProps) {
  const [message, setMessage] = useState<{ failed: boolean; text: string } | null>(null);

  function download() {
    let url = '';
    let anchor: HTMLAnchorElement | null = null;
    try {
      const content = exportDraftCopy(state, reference, cycleTitle);
      url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
      anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'Throughline_Draft_Recovery_Copy.txt';
      document.body.append(anchor);
      anchor.click();
      setMessage({ failed: false, text: 'Draft copy download requested. Check your browser’s downloads. This does not save the workspace.' });
    } catch {
      setMessage({ failed: true, text: 'The draft copy could not be downloaded. Keep this page open and try again, or copy your writing before reloading.' });
    } finally {
      anchor?.remove();
      if (url) window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }

  return <>
    <button type="button" className={className} onClick={download}><Icon name="download" size={16} />Download draft copy</button>
    <p className={!message ? 'sr-only draft-copy-status' : message.failed ? 'caption draft-copy-status dialog-error' : 'caption draft-copy-status'} role="status" aria-live="polite" aria-atomic="true">{message?.text}</p>
  </>;
}
