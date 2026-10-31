import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { evidenceSnapshotDescription, referenceForVersion } from '../data/evidenceSnapshots';
import { createReferenceData } from '../data/seed';
import { lessonContext } from '../lessonContext';
import { AssessmentResults, ClassResults, TaskSources } from './EvidenceViews';

// Fixed expectations independently describe the two fictional collections.
const snapshots = [
  {
    version: 'oct28', total: 120, correct: 89, explanation: 46,
    rates: ['74.2%', '38.3%'],
    rows: [
      ['Class A', 30, 23, 12, '76.7%', '40.0%'],
      ['Class B', 30, 22, 10, '73.3%', '33.3%'],
      ['Class C', 30, 24, 13, '80.0%', '43.3%'],
      ['Class D', 30, 20, 11, '66.7%', '36.7%'],
    ],
  },
  {
    version: 'oct29', total: 116, correct: 90, explanation: 52,
    rates: ['77.6%', '44.8%'],
    rows: [
      ['Class A', 30, 24, 15, '80.0%', '50.0%'],
      ['Class B', 29, 23, 13, '79.3%', '44.8%'],
      ['Class C', 29, 23, 14, '79.3%', '48.3%'],
      ['Class D', 28, 20, 10, '71.4%', '35.7%'],
    ],
  },
] as const;

const visibleText = (markup: string) => markup.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const escapedText = (value: string) => renderToStaticMarkup(createElement('span', null, value)).slice(6, -7);
const countPattern = (count: number, total: number) => new RegExp(`\\b${count}\\s*/\\s*${total}\\b`);

describe('condensed assessment evidence', () => {
  it.each(snapshots)('retains exact $version counts beside one-decimal rates', snapshot => {
    const reference = referenceForVersion(createReferenceData(), snapshot.version);
    const before = structuredClone(reference);
    const markup = renderToStaticMarkup(createElement(AssessmentResults, { reference }));
    const text = visibleText(markup);
    expect(text).toMatch(countPattern(snapshot.correct, snapshot.total));
    expect(text).toMatch(countPattern(snapshot.explanation, snapshot.total));
    for (const rate of snapshot.rates) expect(text).toContain(rate);
    expect(markup).toContain('<figure');
    expect(reference).toEqual(before);
    if (snapshot.version === 'oct29') {
      expect(text).not.toMatch(countPattern(89, 120));
      expect(text).not.toMatch(countPattern(46, 120));
    }
  });

  it.each(snapshots)('compares $version classes in stable order with their own denominators', snapshot => {
    const reference = referenceForVersion(createReferenceData(), snapshot.version);
    const before = structuredClone(reference);
    const markup = renderToStaticMarkup(createElement(ClassResults, { reference }));
    expect(markup).toMatch(/<caption\b[^>]*>[^<]+/);
    expect(markup.match(/<th\b[^>]*scope="col"/g)).toHaveLength(3);
    const body = markup.match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/)?.[1];
    expect(body).toBeDefined();
    const rows = [...body!.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)].map(match => match[1]);
    expect(rows).toHaveLength(4);
    snapshot.rows.forEach(([label, total, correct, explanations, correctRate, explanationRate], index) => {
      const row = rows[index];
      const text = visibleText(row);
      expect(row).toMatch(/<th\b[^>]*scope="row"/);
      expect(text).toContain(label);
      expect(text).toMatch(countPattern(correct, total));
      expect(text).toMatch(countPattern(explanations, total));
      expect(text).toContain(correctRate);
      expect(text).toContain(explanationRate);
      // The two illustrative responses are not student records for these classes.
      for (const response of reference.responses) expect(row).not.toContain(escapedText(response.quote));
    });
    expect(reference).toEqual(before);
  });
});

describe('compact task and source inspection', () => {
  it.each(snapshots)('preserves the full task, rubric and $version provenance behind closed detail', snapshot => {
    const reference = referenceForVersion(createReferenceData(), snapshot.version);
    const markup = renderToStaticMarkup(createElement(TaskSources, { reference, version: snapshot.version }));
    for (const source of [lessonContext.prompt, lessonContext.selection, lessonContext.rubric, lessonContext.lesson, lessonContext.provenance, lessonContext.limits, evidenceSnapshotDescription(snapshot.version)]) {
      expect(markup).toContain(escapedText(source));
    }
    const details = [...markup.matchAll(/<details\b([^>]*)>/g)];
    expect(details.length).toBeGreaterThanOrEqual(2);
    for (const [, attributes] of details) expect(attributes).not.toMatch(/\bopen(?:\s|=|$)/);
    expect(markup.indexOf(escapedText(lessonContext.prompt))).toBeLessThan(markup.indexOf('<details'));
    if (snapshot.version === 'oct29') {
      expect(markup).toContain('116 of 120 expected responses');
      expect(markup).toContain('four students were absent');
      expect(markup).toContain('not matched student-level gains');
      expect(markup).not.toContain('Fictional collection: October 28, 2026.');
    }
  });

  it('renders source class labels as literal text, never executable markup', () => {
    const reference = createReferenceData();
    reference.classes[0].label = '<script>alert("source")</script> & Class A';
    const markup = renderToStaticMarkup(createElement(ClassResults, { reference }));
    expect(markup).toContain(escapedText(reference.classes[0].label));
    expect(markup).not.toContain('<script>');
  });
});
