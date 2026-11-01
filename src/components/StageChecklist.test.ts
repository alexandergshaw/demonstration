import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { StageChecklist, type ChecklistTask } from './StageChecklist';

describe('stage checklist', () => {
  it('counts core tasks separately from optional work and exposes truthful status labels', () => {
    const open = vi.fn();
    const items: ChecklistTask[] = [
      { id: 'write', label: 'Write a draft', detail: 'Explain your decision.', status: 'done', statusLabel: 'Drafted', onSelect: open },
      { id: 'references', label: 'Add references', detail: 'Keep source material nearby.', status: 'done', statusLabel: 'Included', optional: true, onSelect: open },
      { id: 'approve', label: 'Review and approve', detail: 'Inspect the actual output.', status: 'todo', onSelect: open },
    ];
    const html = renderToStaticMarkup(createElement(StageChecklist, { title: 'Plan checklist', description: 'Prepare your own plan.', items, currentId: 'approve', note: 'Drafted does not mean approved.' }));
    expect(html).toContain('1 of 2 core tasks checked');
    expect(html).toContain('Optional · ');
    expect(html).toContain('Drafted does not mean approved.');
    expect(html.match(/aria-current="step"/g)).toHaveLength(1);
    expect(html.match(/class="stage-checklist-task"/g)).toHaveLength(3);
    expect(html).not.toContain('type="checkbox"');
    expect(html).not.toContain('disabled=');
    expect(html).not.toContain('role="progressbar"');
    expect(open).not.toHaveBeenCalled();
    expect(items[2].status).toBe('todo');
  });

  it('places each action region immediately under its own task with one expanded child', () => {
    const open = vi.fn();
    const items: ChecklistTask[] = ['write', 'review'].map(id => ({ id, label: id, detail: `Open ${id}`, status: 'todo', onSelect: open }));
    const html = renderToStaticMarkup(createElement(StageChecklist, {
      title: 'Draft checklist', description: 'Write, then review.', items, currentId: 'write',
      contents: { write: createElement('input', { id: 'draft-field', defaultValue: 'Retained draft' }), review: createElement('button', { type: 'button', onClick: open }, 'Approve explicitly') },
    }));
    expect(html).toContain('<section class="stage-checklist"');
    expect(html).not.toContain('<nav');
    expect(html.match(/aria-expanded="true"/g)).toHaveLength(1);
    expect(html.match(/aria-expanded="false"/g)).toHaveLength(1);
    for (const [id, control] of [['write', 'id="draft-field"'], ['review', 'Approve explicitly']]) {
      const start = html.indexOf(`<li data-task="${id}"`);
      const row = html.slice(start, html.indexOf('</li>', start));
      expect(row).toMatch(/<\/button><div[^>]*class="stage-checklist-content"/);
      expect(row).toContain(`data-task-content="${id}"`);
      expect(row).toContain(control);
      const target = row.match(/aria-controls="([^"]+)"/)?.[1];
      expect(target).toBeTruthy();
      expect(row).toContain(`id="${target}"`);
      const body = row.match(/<div[^>]*class="stage-checklist-content"[^>]*>/)?.[0];
      if (id === 'write') expect(body).not.toContain('hidden=');
      else expect(body).toContain('hidden=');
    }
    expect(open).not.toHaveBeenCalled();
  });
});
