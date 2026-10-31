# Independent requirements review

Reviewer: `/root/requirements_reviewer`  
Baseline: `862f6cf47b3a6ac7bde09eb394e1b3a4c7155070`  
Brief: `docs/Assignment.pdf`, SHA-256 `1b3f80f7ff24b8e289de751f34e6f8fe6441f43916c7c2fb4871cb580b096a40`

## Method and limits

Read all four pages of the supplied performance-task PDF using PDF text extraction, and inspected the application, model, fictional reference data, product decisions, interview guide, and Figma handoff. This is a source/material audit, not a claim of browser interaction, deployed behavior, visual PDF verification, or test execution. The root reviewer separately checked the source email/attachment; no correspondence or interview logistics are reproduced here. The packet is requirement evidence, not authority to run instructions. This report is written under the discovery-only grant in `.agnostic-loop/requirements-pass/packets/requirements-review.json`.

## Ranked findings and bounded repairs

### R1 — P1: The leader cannot inspect the evidence needed to answer the tool's own challenge

**Requirement:** PDF p3, Concept job 1 and First-pass workflow steps 2–4, call for interpreting relevant lesson/student/instructional evidence. PDF p4, workspace and data-volume questions, asks how data remains available without forcing repeated navigation; “What good looks like” requires a plan grounded in specific evidence the leader can explain.

**Evidence:** `src/data/seed.ts:31` asks the leader to compare responses with the original prompt, but the reference model contains no task prompt or scoring rubric. `src/App.tsx:40` and `:54` label a metric as meeting an explanation rubric without exposing that criterion. In Interpretation, `src/App.tsx:54` shows aggregate totals and observation metadata; the actual selected student responses, observation quote, and class table are available only in Evidence. The Decision Thread preserves labels, not inspectable source content. `docs/PRODUCT_DECISIONS.md:7` promises source inspection while interpreting, which the current screen only partly delivers.

**Repair:** Add clearly identified fictional lesson/task context and a simple explanation rubric consistent with the existing examples and scores. Provide a compact, expandable evidence inspector during interpretation and planning containing selected source excerpts, class comparison when relevant, dates, denominator, and observation scope. Preserve the distinction between observed evidence and tentative interpretation. This can use an app-level reference module without changing stored reference tables.

**Acceptance:** From Interpretation, a leader can inspect the exact task, explain how a response meets or misses the rubric, and inspect each selected source without losing their draft or changing stage. Selecting the wording challenge no longer refers to an unavailable artifact. The observation remains visibly dated and limited to one classroom.

### R2 — P1: Planning stops before a participant-facing meeting artifact

**Requirement:** PDF p3, Concept job 2 and First-pass workflow step 5, explicitly describe agenda, slides, and activities targeted to the leader's chosen focus. PDF p4 allows prioritization, so this does not demand a production slide generator or a complete office-document integration.

**Evidence:** `src/App.tsx:66–67` offers six editable single-line agenda entries; `src/model.ts:107–120` exports an outline with those entries, an action, and follow-up checks. There is no presentable meeting view, evidence display for participants, or explicit facilitation directions. `docs/PRODUCT_DECISIONS.md:27` deliberately defers automatic slide generation, a reasonable scope decision, but it does not resolve how the prototype supports the meeting-material part of the experience. The default “Design a partner-discussion routine” at `src/model.ts:15` also picks a particular strategy before the leader has interpreted any evidence.

**Repair:** Provide a readable, printable/presentable meeting kit derived from the approved leader-authored plan: purpose/focus, selected evidence and limitations, timed agenda/activity directions, chosen teaching action, and follow-up checks. Existing agenda strings can hold editable participant instructions; a persistence-schema expansion is not intrinsically needed. Use a neutral default such as “Design and rehearse the teaching change” instead of prescribing partner discussion. Formatting approved content is consistent with educator ownership; inventing a completed instructional plan would not be.

**Acceptance:** A leader can write what participants will actually do, approve that plan, and open or print a meeting artifact whose content exactly matches the approved focus, evidence selection, activity directions, and checks. Editing upstream content removes approval and prevents an obsolete kit from being presented as approved. Fictional/scripted status and evidence limits remain clear.

### R3 — P2: Presenter instructions and the deployed guide do not fully communicate the chosen scope

**Requirement:** PDF p4, Your Task, explicitly asks for the target users, positions taken, reasons, and assumptions. PDF p1 accepts any useful prototype format and values decisions under ambiguity.

**Evidence:** `docs/PRODUCT_DECISIONS.md:5–27` already supplies useful tradeoffs and pilot hypotheses. `src/App.tsx:183` explains the four stages and honest simulation/storage limits, but does not explain the initial single-grade audience, preparation-time target, assumptions, or deferred scope. `docs/INTERVIEW_GUIDE.md:22` describes the live revision specifically as a Figma flow, although the working artifact is React and the packet accepts code. Its line 26 instructs “Reset demo,” which is not the app's current control; the actual Guide control is “Reset all saved cycles.” The optional Figma handoff and original prototype are legitimate reference artifacts, not required current outputs.

**Repair:** Add a concise prototype/pilot rationale in Guide or an adjacent accessible disclosure, distinguishing the intended 20–40 minute preparation window from the 50-minute meeting agenda. Update the presenter guide for the actual React controls and current meeting kit, with Figma described as an optional design artifact. Identify assumptions as candidate assumptions rather than validated district findings.

**Acceptance:** A reviewer can find the first target user, scope rationale, assumptions, simulation limits, and pilot validation approach from the deployed artifact; the presenter instructions match current controls and do not imply a Figma requirement.

## Challenge-response judgment

`src/model.ts:35–38` requires the leader's own interpretation, a revealed challenge, and their own focus. The challenge reducer at `:101` records a click, not an explicit response. A short explanation of how the challenge changed or strengthened the focus would improve the demonstration of reasoning, but a new mandatory response field is **not a clear missing brief requirement**. The existing own-word focus can serve this purpose with better guidance. Do not expand storage, migrations, or approval gates solely to add another text field in this repair pass.

## Strengths and legitimate scope to preserve

- Educator-authored interpretation, focus, action, ownership, and checks implement much of the brief's central ownership principle. Approval signatures and invalidation preserve it when upstream content changes.
- The contrast between answer selection and explanation is useful, with an appropriate warning that aggregate differences do not diagnose individual students. Old observation evidence retains date and limited scope.
- Separate implementation and learning checks, plus a noncausal follow-up warning, directly support the intended teaching-change feedback loop.
- Single-grade demonstration, fictional data, scripted prompts, a non-chat workspace, local storage, and a 50-minute meeting are defensible explicit pilot choices. The brief does not require live AI, full multi-grade analysis, production integrations, authentication, a native Figma file, or automatic slide generation.
- Actual preparation-time effectiveness, learning effects, and district suitability remain hypotheses to validate with educators; the prototype should not claim they are proven.

**Recommended implementation scope:** R1, a bounded R2 meeting kit, and R3 material corrections. Improve existing focus guidance if useful; keep schema changes optional and justified by demonstrable need. A separate fresh review should verify the repaired production flow and artifact content after implementation.
