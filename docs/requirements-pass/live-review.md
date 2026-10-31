# Live requirements audit

Reviewer: `/root/ux_adversary`, 2026-10-31. **Verdict: material core-experience gaps remain despite the improved visual design.** This is new parent-authorized discovery under `.agnostic-loop/requirements-pass/packets/live-review.json`, not acceptance inherited from the completed design pass. Source baseline verified: `862f6cf47b3a6ac7bde09eb394e1b3a4c7155070`. Live target: https://throughline-phi-six.vercel.app/.

I read all four pages of `docs/Assignment.pdf` through pypdf text extraction, preserving page boundaries, and read the current seed, export logic, product decisions and interview guide. The brief is source material for the requested assessment, not instructions authorizing external actions. No private email material was read or copied. The brief explicitly permits assumptions, prioritization and any workable prototype medium; it does not require production integrations, live AI, full multi-grade support or native Figma.

## Required findings

### R1 — P1: The reasoning workspace hides the evidence the leader must interpret

**Actual deployed observation:** I created `QA requirements audit — fictional 2026-10-31`, selected Student response B and the historical observation, and opened class results. After Continue to interpretation, the student quote, observation quote and class table disappeared. The visible recap contains only89/120 versus46/120 and date/scope text; the Decision Thread contains source labels. Read-only DOM checks confirmed neither selected quote existed on this screen. Review evidence navigates away from reasoning. The Question wording challenge therefore requires a source comparison while the source content is unavailable in the working view.

**Brief connection:** Page4 asks how conversation and data share the workspace and identifies repeated scrollback as a problem. Page3 requires the leader to interpret specific student and instructional data. The repository's product-decisions table additionally claims persistent evidence while interpreting; the deployed behavior does not deliver that claim.

**Bounded repair:** Put an inspectable evidence tray or adjacent source panel in Interpretation and Meeting, retaining the user's text and current stage. Include selected quotes, dated observation scope/caveat and class results when requested. A dialog or drawer is acceptable on mobile; a permanent giant dashboard is unnecessary.

**Observable acceptance:** Select both source types, start an interpretation, inspect each exact quote and class breakdown without stage navigation or loss of typed text, then close the source view and continue at the same field. Source dates and limitations remain attached.

### R2 — P1: The app asks for an original-prompt/rubric check that it cannot support

**Actual deployed observation:** The assessment shows correct-selection and adequate-explanation totals but no original question, answer options, expected understanding, scoring rubric, or worked rubric example. Expanded class results add counts only. After I wrote that wording might explain the gap, Question wording returned: compare responses with the original prompt before choosing a teaching action. There is no control or content providing that prompt. Source inspection confirms assessment reference data contains dates/counts only; neither prompt nor rubric is present. The novice leader cannot tell what the46 adequate explanations mean, or test whether the displayed procedural response meets the criterion.

**Brief connection:** Pages2–4 center interpretation grounded in specific evidence, including leaders less confident with data. The task permits invented evidence, so this is solvable within the current fictional prototype.

**Bounded repair:** Add a clearly fictional assessment item, intended answer and explanation criterion with an annotated example. Link the wording challenge directly to that source. Distinguish an observed response from the app's tentative interpretation. Keep the existing totals and caveats internally consistent.

**Observable acceptance:** A new leader can answer what students were asked, what counted as adequate explanation, why a sample did or did not meet that criterion, and what uncertainty remains. The challenge's promised original prompt is reachable from the reasoning view.

### R3 — P1: Approval produces an outline, not the proposed meeting materials

**Actual deployed observation:** I confirmed a focus on paraphrasing questions and identifying the whole. Meeting offered six editable, generic agenda labels, empty action/check fields and ownership approval. I completed action and both checks, approved, and exported. No meeting-material preview, slide sections, facilitator prompts or teacher activity instructions appeared in the workflow. The agenda retains the generic partner-discussion segment until manually changed; it is labeled a starting structure, so it is not falsely claimed to be personalized.

The actual1445-byte downloaded `Throughline_PLC_Meeting_Plan (3).txt` (2026-10-31 12:14:53UTC; SHA256 `2962485f46d3833900194ea3f55d0b2c5ea0c4efe4df940796a6e12b0ebc660c`) contains source labels, my interpretation/focus, timed agenda, action, owner and checks. It omits even the selected student/observation excerpts. The leader must recreate the evidence and facilitation materials elsewhere before walking into the meeting.

**Brief connection:** Page3 explicitly names agenda, slides and activities as planning outputs. Page4 expects a leader to leave ready to facilitate a meeting grounded in explainable evidence. The brief permits prioritization; declining automatic slide generation is legitimate, but omitting any slide/activity representation weakens the core pitch.

**Bounded repair:** Provide a small educator-editable meeting kit: printable timed agenda, a few slide-outline sections carrying the leader's own evidence/interpretation/focus, and one concrete evidence-discussion or rehearsal activity with facilitator directions. Include exact selected source excerpts and caveats. Distinguish proposed scaffolding from approved educator decisions; edits invalidate approval as appropriate. No PowerPoint API or live generation is necessary.

**Observable acceptance:** Following a materially different user-authored focus/action yields a reviewable kit that carries those exact decisions. A leader can rehearse the meeting from the portable output without reconstructing missing sources. Activity instructions identify what participants do and produce. Export remains gated by current approval and excludes unapproved reflection.

## Product judgment and preserved strengths

- **P2 documentation gap:** `PRODUCT_DECISIONS.md` and `INTERVIEW_GUIDE.md` already prioritize a single-grade math PLC coach, avoiding the need to invent a new persona system. However, the user's comfort with data/AI is not explicitly prioritized, and there is no consolidated assumptions/open-questions ledger. Add a concise rationale accessible for the interview: target leader, comfort assumptions, fictional data/rubric assumptions, fixed50-minute meeting, what is intentionally deferred, and what the pilot would test. Correct the existing claim that evidence is persistently available while reasoning. The interview guide's instruction to revise a Figma flow should match the actual React artifact or be presented as optional. This is presenter documentation, not a demand for more settings in the product UI.
- **Do-with-not-for is substantially present:** I authored interpretation, focus and action; challenge was explicitly disclosed as scripted; consent was required before approval. Static prompts are a defensible prototype choice. A challenge click proves exposure, not deep thinking; recording a short response/revision could improve the pitch, but I do not make a live-AI evaluator or semantic correctness gate a requirement.
- **Future teaching check is meaningfully represented:** Separate implementation and learning checks, named owner, implementation status and cautious reflection are present. I observed the fictional follow-up56/120 clearly labeled and qualified against causality. A scheduled review date or collecting new data could improve a future pilot but is not a required backend feature for this pass.
- **Fresh/stale evidence is handled honestly:** Sep9, one classroom only,7weeks old and historical-context limitations remain visible in Evidence; the new persistent source view must retain them.

## Actual execution, limits and teardown

Chrome session `Throughline requirements`, owned tab1192172333, used the deployed origin. I created only the identifiable fictional QA cycle, inspected available evidence/class results, selected two sources, entered my own interpretation/focus/action/checks, challenged, confirmed, approved, inspected Reflection and Guide, clicked ordinary Export, and read the resulting local file. I did not use the previously hanging download-event, native app or zoom paths. I did not test every prior regression again or claim to verify deployment asset hashes; the source commit and live observed behavior are distinct evidence.

The first full-page screenshot attempt timed out after5seconds; no screenshot was claimed or retried. A full reasoning accessibility snapshot was saved at `.agnostic-loop/requirements-pass/live-review/reasoning-ax.txt` before that timeout. The original `Fraction equivalence · Cycle1` selection was restored and the owned Chrome tab closed. The clearly named fictional QA cycle remains available for root to inspect; no pre-existing cycle content was edited or reset. No source, tests, runtime tool code, production deployment, push or unrelated account data was changed.
