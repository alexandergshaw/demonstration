import { evidenceLabels, type Lens } from '../model';

export interface ReferenceData {
  workspace: { id: string; name: string; grade: number; subject: string; unit: string };
  assessment: { id: 'assessment'; date: string; isoDate: string; total: number; correct: number; explanations: number; followUp: number };
  classes: { id: string; label: string; total: number; correct: number; explanations: number }[];
  responses: { id: 'responseB' | 'responseC'; label: string; category: string; tone: 'blue' | 'amber'; quote: string; interpretation: string }[];
  observation: { id: 'observation'; date: string; isoDate: string; scope: string; age: string; quote: string; caution: string };
  labels: typeof evidenceLabels;
  challenges: { id: Lens; label: string; prompt: string }[];
}

// A fresh copy for each database. Reference tables are read-only through the repository.
export function createReferenceData(): ReferenceData {
  return {
    workspace: { id: 'grade-4-math', name: 'Grade 4 Math', grade: 4, subject: 'Math', unit: 'Fraction equivalence' },
    assessment: { id: 'assessment', date: 'Oct 28', isoDate: '2026-10-28', total: 120, correct: 89, explanations: 46, followUp: 56 },
    classes: [
      { id: 'A', label: 'Class A', total: 30, correct: 23, explanations: 12 },
      { id: 'B', label: 'Class B', total: 30, correct: 22, explanations: 10 },
      { id: 'C', label: 'Class C', total: 30, correct: 24, explanations: 13 },
      { id: 'D', label: 'Class D', total: 30, correct: 20, explanations: 11 },
    ],
    responses: [
      { id: 'responseB', label: 'Student response B', category: 'Procedural', tone: 'blue', quote: '1/2 and 2/4 are equal because I doubled both numbers.', interpretation: 'Possible procedural knowledge. Does the student understand why the amounts match?' },
      { id: 'responseC', label: 'Student response C', category: 'Possible misconception', tone: 'amber', quote: '2/4 is bigger than 1/2 because 4 is bigger than 2.', interpretation: 'Possible confusion about the size of fractional parts. What would reveal the underlying reasoning?' },
    ],
    observation: { id: 'observation', date: 'Sep 9', isoDate: '2026-09-09', scope: 'One classroom only', age: '7 weeks old', quote: 'Students had limited opportunities to explain their strategies to one another.', caution: 'Historical context, not current proof of teaching practice across the grade.' },
    labels: { ...evidenceLabels },
    challenges: [
      { id: 'wording', label: 'Question wording', prompt: 'Could confusing question wording explain some incomplete explanations? Compare the responses with the original prompt before choosing a teaching action.' },
      { id: 'meaning', label: 'Procedure versus meaning', prompt: 'Does describing a procedure show that a student understands why the amounts are equal? What could a visual model or a follow-up question reveal?' },
      { id: 'variation', label: 'Variation across classrooms', prompt: 'Does the same pattern appear in every class? Class-level totals are descriptive, and the September observation covers only one classroom. What more would you need to know?' },
    ],
  };
}
