import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { BuilderNavigation } from './BuilderNavigation';

const steps = [
  { id: 'write', label: 'Write the draft', panelId: 'draft-panel' },
  { id: 'review', label: 'Review the draft', panelId: 'review-panel' },
  { id: 'approve', label: 'Approve', panelId: 'approve-panel' },
] as const;

describe('builder task navigation', () => {
  it('identifies location and both navigation surfaces without claiming task completion', () => {
    const onSelect = vi.fn();
    const before = structuredClone(steps);
    const markup = renderToStaticMarkup(createElement(BuilderNavigation, { label: 'Draft tasks', current: 'review', steps, onSelect }));
    expect(markup).toContain('Task 2 of 3');
    expect(markup.match(/aria-current="step"/g)).toHaveLength(1);
    expect(markup).toContain('aria-current="step" aria-controls="review-panel"');
    // Inactive panels may be unmounted by the workspace; never reference absent targets.
    expect(markup).not.toContain('aria-controls="draft-panel"');
    expect(markup).not.toContain('aria-controls="approve-panel"');
    const select = markup.match(/<select\b[^>]*>/)?.[0];
    expect(select).toContain('aria-controls="review-panel"');
    expect(markup).toContain('<option value="review" selected="">2. Review the draft</option>');
    expect(markup.match(/<option\b/g)).toHaveLength(3);
    expect(markup).not.toContain('disabled=');
    expect(markup).not.toContain('role="progressbar"');
    expect(markup).not.toContain('complete');
    expect(markup).not.toContain('Approved');
    const pickerId = select?.match(/id="([^"]+)"/)?.[1];
    expect(pickerId).toBeTruthy();
    expect(markup).toContain(`for="${pickerId}">Draft tasks</label>`);
    expect(onSelect).not.toHaveBeenCalled();
    expect(steps).toEqual(before);
  });

  it('does not invent a current task when the caller supplies an unknown one', () => {
    const onSelect = vi.fn();
    const markup = renderToStaticMarkup(createElement(BuilderNavigation, { label: 'Draft tasks', current: 'unknown', steps, onSelect }));
    expect(markup).toBe('');
    expect(onSelect).not.toHaveBeenCalled();
  });
});
