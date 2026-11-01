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
});
