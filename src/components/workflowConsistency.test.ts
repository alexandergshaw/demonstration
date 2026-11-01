import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { createReferenceData } from '../data/seed';
import { initialState } from '../model';
import { CollectionSummary } from './CollectionSummary';
import { MeetingKit } from './MeetingKit';
import { WorkflowActions } from './WorkflowActions';

describe('shared workflow actions', () => {
  it('keeps context, status, secondary and primary controls in the same DOM order without taking an action', () => {
    const proceed = vi.fn();
    const goBack = vi.fn();
    const markup = renderToStaticMarkup(createElement(WorkflowActions, {
      label: 'Interpretation actions',
      description: createElement('p', null, 'Compare your observation with another explanation.'),
      status: createElement('p', { role: 'status' }, 'Changes are not saved.'),
      secondary: createElement('button', { type: 'button', onClick: goBack }, 'Back to evidence'),
      primary: { label: 'Test an alternative', onClick: proceed, arrow: true },
    }));
    const positions = ['Compare your observation', 'Changes are not saved.', 'Back to evidence', 'Test an alternative']
      .map(text => markup.indexOf(text));
    expect(positions.every(position => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(markup).toContain('role="group" aria-label="Interpretation actions"');
    expect(markup.match(/role="status"/g)).toHaveLength(1);
    expect(markup).toContain('aria-hidden="true"');
    expect(proceed).not.toHaveBeenCalled();
    expect(goBack).not.toHaveBeenCalled();
  });

  it('preserves the primary control identity and error association without changing its disabled state', () => {
    const markup = renderToStaticMarkup(createElement(WorkflowActions, {
      primary: {
        label: 'Keep this interpretation', onClick: vi.fn(), id: 'challenge',
        describedBy: 'reasoning-challenge-help challenge-error', invalid: true, disabled: true,
      },
    }));
    expect(markup).toContain('type="button" id="challenge"');
    expect(markup).toContain('disabled=""');
    expect(markup).toContain('aria-describedby="reasoning-challenge-help challenge-error"');
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain('role="group" aria-label="Workflow actions"');
  });

  it('does not manufacture saving, live announcements or invalid states from ordinary status text', () => {
    const markup = renderToStaticMarkup(createElement(WorkflowActions, {
      status: 'Review the current writing before continuing.',
      primary: { label: 'Continue', onClick: vi.fn(), invalid: false },
    }));
    expect(markup).not.toContain('aria-live');
    expect(markup).not.toContain('role="status"');
    expect(markup).not.toContain('aria-invalid');
    expect(markup).not.toContain('aria-describedby');
    expect(markup).not.toContain('workflow-actions-secondary');
    expect(markup).not.toContain('workflow-actions-description');
    expect(markup).not.toContain('Saved');
  });
});

describe('shared collection summary', () => {
  it('uses one set of labels while preserving the entered values exactly', () => {
    const state = { evidenceCollector: '  Ms. Rivera & team  ', collectionDate: '2026-11-04', reviewDate: '2026-11-06' };
    const before = structuredClone(state);
    const markup = renderToStaticMarkup(createElement(CollectionSummary, { state, className: 'review-copy' }));
    expect(markup).toContain('class="collection-summary review-copy"');
    expect(markup).toContain('aria-label="Planned collection arrangements"');
    expect(markup).toContain('<dt>Who will collect</dt><dd>  Ms. Rivera &amp; team  </dd>');
    expect(markup).toContain('<dt>Planned collection</dt><dd>2026-11-04</dd>');
    expect(markup).toContain('<dt>Planned review</dt><dd>2026-11-06</dd>');
    expect(state).toEqual(before);
  });

  it('uses the same undecided wording for empty and whitespace-only arrangements', () => {
    const empty = renderToStaticMarkup(createElement(CollectionSummary, {
      state: { evidenceCollector: '', collectionDate: '', reviewDate: '' },
    }));
    const whitespace = renderToStaticMarkup(createElement(CollectionSummary, {
      state: { evidenceCollector: '  ', collectionDate: '\n', reviewDate: '\t' },
    }));
    expect(whitespace).toBe(empty);
    expect(empty).toContain('<dt>Who will collect</dt><dd>Not yet agreed</dd>');
    expect(empty).toContain('<dt>Planned collection</dt><dd>Date not yet agreed</dd>');
    expect(empty).toContain('<dt>Planned review</dt><dd>Date not yet agreed</dd>');
  });
});

describe('draft kit return context', () => {
  it.each([
    [undefined, 'Return to planning'],
    ['Return to review', 'Return to review'],
  ])('labels the return destination for %s without granting draft downloads', (returnLabel, expected) => {
    const state = initialState();
    const before = structuredClone(state);
    const onClose = vi.fn();
    const onEditActivity = vi.fn();
    const markup = renderToStaticMarkup(createElement(MeetingKit, {
      state, reference: createReferenceData(), mode: 'draft', returnLabel, onClose, onEditActivity,
    }));
    expect(markup).toContain(`<button type="button" class="btn secondary">${expected}</button>`);
    expect(markup).toContain('Edit activity 1 directions');
    expect(markup).toContain('Draft meeting kit preview');
    expect(markup).not.toContain('>Download meeting kit<');
    expect(markup).not.toContain('>Download text plan<');
    expect(onClose).not.toHaveBeenCalled();
    expect(onEditActivity).not.toHaveBeenCalled();
    expect(state).toEqual(before);
  });
});
