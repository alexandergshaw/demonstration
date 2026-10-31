import { describe, expect, it } from 'vitest';
import { exportPilotEvaluationHtml, pilotEvaluationProtocol } from './pilotEvaluation';

describe('standalone proposed pilot handout', () => {
  it('can be read and printed offline without scripts, remote assets or stored cycle data', () => {
    const html = exportPilotEvaluationHtml();
    expect(html).toMatch(/^<!doctype html>/);
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('@media print');
    expect(html).toContain('<caption>');
    expect(html).toContain('scope="col"');
    expect(html).toContain('scope="row"');
    expect(html).not.toMatch(/<(script|iframe|img|link|form)\b/i);
    expect(html).not.toMatch(/\bon\w+\s*=|localStorage|sessionStorage|fetch\(/i);
    expect(html).not.toMatch(/56\/120|89\/120|alexandergshaw|@leadingeducators\.org/);
    expect(html.match(/class="note-line"/g)).toHaveLength(6);
    expect(html).toContain('No results collected');
    expect(html).toContain('separate from an approved PLC meeting kit');
    for (const link of html.matchAll(/href="([^"]+)"/g)) expect(link[1]).toMatch(/^https:\/\//);
  });

  it('escapes editable protocol content and does not turn unsafe source URLs into active links', () => {
    const injection = '<img src=x onerror="alert(1)"> & \'quoted\'';
    const protocol = structuredClone(pilotEvaluationProtocol);
    protocol.title = injection;
    protocol.roles[0].responsibility = injection;
    protocol.steps[0].text = injection;
    protocol.measures[0].evidence = injection;
    protocol.decisions[0].rule = injection;
    protocol.sources = [
      { title: injection, url: 'javascript:alert(1)', relevance: injection },
      { title: 'HTTPS reference', url: 'https://example.org/?one=1&two="quoted"', relevance: 'Text' },
    ];
    const html = exportPilotEvaluationHtml(protocol);
    expect(html).toContain('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; &#39;quoted&#39;');
    expect(html).not.toContain(injection);
    expect(html).not.toContain('href="javascript:');
    expect(html).not.toContain('<img');
    expect(html).toContain('href="https://example.org/?one=1&amp;two=%22quoted%22"');
    expect(pilotEvaluationProtocol.title).toBe('How we would test this');
  });
});
