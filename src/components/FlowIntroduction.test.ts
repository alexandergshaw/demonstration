import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { FlowIntroduction } from './FlowIntroduction';

const escapedText = (value: string) => renderToStaticMarkup(createElement('span', null, value)).slice(6, -7);

describe('first-use purpose and structural preview', () => {
  it('keeps first entry compact while offering the full overview separately', () => {
    const onContinue = vi.fn(), onOpenOverview = vi.fn();
    const markup = renderToStaticMarkup(createElement(FlowIntroduction, { compact: true, headingLevel: 'h1', onContinue, onOpenOverview }));
    expect(markup).toContain('Read the evidence');
    expect(markup).toContain('Start with the results below.');
    expect(markup).toContain('Start review');
    expect(markup).toContain('How it works');
    expect(markup).toContain('Saves in this browser');
    expect(markup).not.toContain('flow-introduction-phases');
    expect(markup).not.toContain('flow-kit-pages');
    expect(onContinue).not.toHaveBeenCalled();
    expect(onOpenOverview).not.toHaveBeenCalled();
  });
  it.each(['h1', 'h2'] as const)('exposes the purpose and outcomes before the closed preview with a %s heading', headingLevel => {
    const onContinue = vi.fn();
    const markup = renderToStaticMarkup(createElement(FlowIntroduction, { onContinue, headingLevel }));
    const labelId = markup.match(/^<section\b[^>]*aria-labelledby="([^"]+)"/)?.[1];
    expect(labelId).toBeDefined();
    expect(markup).toContain(`<${headingLevel} class="flow-introduction-title" id="${labelId}">`);
    const details = markup.match(/<details\b([^>]*)>/);
    expect(details).not.toBeNull();
    expect(details![1]).not.toMatch(/\bopen(?:\s|=|$)/);
    expect(markup).toContain('professional learning community (PLC)');
    const visibleOpening = markup.split('<details')[0];
    expect(visibleOpening).toContain('Help your team decide what to teach differently.');
    expect(visibleOpening).toContain('teacher-team leaders');
    expect(visibleOpening).toContain('Start with the evidence');
    expect(visibleOpening).toContain('The evidence is already here.');
    for (const outcome of ['Evidence you can point to', 'One teaching change to try', 'A way to check what happened']) {
      expect(visibleOpening).toContain(`<dt>${outcome}</dt>`);
    }
    expect(visibleOpening).toContain(`aria-labelledby="${labelId}-destination"`);
    expect(visibleOpening).toContain(`id="${labelId}-destination"`);
    expect(visibleOpening).toContain('You interpret, choose and approve.');
    expect(markup).toMatch(/Structure preview[^<]+(?:approved|approval)/);
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('previews all six real agenda sections and their 50-minute allocation without offering an export or approval', () => {
    const markup = renderToStaticMarkup(createElement(FlowIntroduction, { onContinue: vi.fn() }));
    const agenda = markup.match(/<section class="flow-kit-page flow-kit-agenda">([\s\S]*?)<\/section>/)?.[1];
    expect(agenda).toBeDefined();
    const rows = [...agenda!.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(match => match[1]);
    const expectedRows = [
      ['Connect to the goal', 5],
      ['Examine student work', 10],
      ['Test the interpretation', 10],
      ['Design & rehearse the teaching move', 15],
      ['Plan implementation', 5],
      ['Choose the next evidence', 5],
    ] as const;
    expect(rows).toHaveLength(6);
    expectedRows.forEach(([heading, duration], index) => {
      expect(rows[index]).toContain(escapedText(heading));
      expect(rows[index]).toContain(`${duration} min`);
    });
    expect(markup).toContain('50-minute agenda');
    expect(markup).toContain('Source packet');
    expect(markup).toContain('Participant activity');
    expect(markup).toMatch(/teacher action \+ student thinking/i);
    expect(markup).toContain('Implementation check');
    expect(markup).toContain('Learning check');
    expect(markup.match(/<button\b/g)).toHaveLength(1);
    expect(markup).not.toMatch(/<(?:a|input|textarea)\b/);
    expect(markup).not.toContain('Plan approved by you');
    expect(markup).not.toContain('Open meeting kit');
  });

  it('uses subordinate headings when replayed inside the Guide dialog', () => {
    const onContinue = vi.fn();
    const markup = renderToStaticMarkup(createElement(FlowIntroduction, {
      onContinue, headingLevel: 'h3', continueLabel: 'Return to Interpretation',
    }));
    expect(markup).toMatch(/<h3 class="flow-introduction-title"/);
    expect(markup.match(/<h4 class="flow-phase-title"/g)).toHaveLength(3);
    expect(markup.match(/<h4 class="flow-kit-title"/g)).toHaveLength(3);
    expect(markup).not.toMatch(/<h[1256]\b/);
    expect(markup).toContain('Return to Interpretation');
    expect(markup).not.toContain('Start with the evidence');
    expect(onContinue).not.toHaveBeenCalled();
  });

  it('keeps classroom work between preparation and reflection and states the demonstration boundary', () => {
    const markup = renderToStaticMarkup(createElement(FlowIntroduction, { onContinue: vi.fn() }));
    const phases = [...markup.matchAll(/class="flow-phase-title">([^<]+)<\/h[34]>/g)].map(match => match[1]);
    expect(phases).toEqual(['Prepare here', 'Meet and try the move', 'Return to Reflect']);
    expect(markup).toMatch(/(?:try|tries) the move/);
    expect(markup).toContain('Report implementation');
    expect(markup).toContain('examine new evidence');
    expect(markup).toContain('choose a next step');
    for (const boundary of ['Fictional Grade 4 math', 'Scripted prompts', 'no live AI', 'Saves only in this browser']) expect(markup).toContain(boundary);
  });
});
