import type { PlanState } from '../model';
import './CollectionSummary.css';

interface CollectionSummaryProps {
  state: Pick<PlanState, 'evidenceCollector' | 'collectionDate' | 'reviewDate'>;
  className?: string;
}

/** The same planned commitments wherever a cycle's collection is summarized. */
export function CollectionSummary({ state, className = '' }: CollectionSummaryProps) {
  return <dl className={`collection-summary${className ? ` ${className}` : ''}`} aria-label="Planned collection arrangements">
    <div><dt>Who will collect</dt><dd>{state.evidenceCollector.trim() ? state.evidenceCollector : 'Not yet agreed'}</dd></div>
    <div><dt>Planned collection</dt><dd>{state.collectionDate.trim() ? state.collectionDate : 'Date not yet agreed'}</dd></div>
    <div><dt>Planned review</dt><dd>{state.reviewDate.trim() ? state.reviewDate : 'Date not yet agreed'}</dd></div>
  </dl>;
}
