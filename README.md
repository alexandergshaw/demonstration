# Throughline | PLC Planning Partner

A React/TypeScript implementation of the supplied Throughline design package with a localStorage mock backend. The four-stage workspace connects fictional evidence, educator reasoning, an editable PLC meeting, and follow-up reflection. The lesson, task, rubric and all student data are fictional; thinking-partner prompts are scripted. No account, API key, external database, or live AI connection is required.

## Run locally

Use Node.js 22.14 or newer within the Node 22 release line, and npm.

```bash
npm ci
npm run dev
```

Open the localhost URL printed by Vite. The app stores its reference data and named PLC cycles in this browser. You can create, rename, duplicate as draft, switch, and delete cycles. Reset cycle clears only the current plan; presenter tools include a confirmed reset of all cycles. Existing single-draft saves migrate automatically.

If saving fails, your unsaved work remains visible and the app offers retry/reload controls. Data is local to the browser and site URL. Open Meeting kit after approval for presentation sections, a source packet and a participant activity handout. Download the self-contained HTML to present offline or print/save as PDF, or download a text plan with source excerpts.

## Check and build

```bash
npm test
npm run loop:test
npm run build
npm run preview
```

App tests cover the planning model, local repository, and approval-gated meeting materials. The manual loop suite has 85 passing tests and two Windows symlink-capability skips. See `docs/dev-loop/local-backend/` for the current review records; original implementation records remain in `docs/dev-loop/`. Runtime receipts are retained locally under the ignored `.agnostic-loop/` directory.

## Workflow

1. Inspect the October 28 results and optionally select student responses or the older classroom observation.
2. Write an interpretation, consider a scripted challenge, and confirm one instructional focus.
3. Write facilitation and activity directions in the six-part, 50-minute agenda; specify an action, owner, and separate implementation and learning checks; then explicitly approve.
4. Record implementation, inspect the fictional follow-up comparison and its missing context, then save a reflection. The text plan includes a current recorded reflection and those comparison limits; the HTML meeting kit remains the approved meeting materials.

Upstream changes revoke affected approvals and recorded reflection while preserving draft content. Each saved cycle keeps its own state. Duplicated cycles require fresh educator decisions.

## Local backend and deployment

`src/data/database.ts` is the mock repository, `src/data/seed.ts` owns the read-only fictional reference tables, and `src/useWorkspace.ts` connects React to stored cycles. The versioned database validates inputs and uses optimistic revisions to reject stale updates. It is not an atomic multi-user service. Details, API examples, migration behavior, and limits are in `docs/LOCAL_BACKEND.md`.

Live app: **https://throughline-phi-six.vercel.app**. Vercel project `alexandergshaws-projects/throughline` is connected to this GitHub repository with production branch `main`. It uses Vite, Node 22, `npm ci`, `npm run build`, and `dist`. No application environment variables are needed. Each origin has its own browser-local data. See `docs/DEPLOYMENT_STATUS.md` for verification and deployment commands.

This repository includes the local backend, deployment configuration, and reviewed interface redesign. Vercel builds the production app from `main` on subsequent pushes. The original pre-backend checkpoint remains available at `ead2317da648daccfcdb1375925bc901c71344eb`.

## Preserved reference materials

`figma/` contains the original SVG frames, screenshots, and handoff notes. `docs/INTERVIEW_GUIDE.md` and `docs/PRODUCT_DECISIONS.md` explain the presentation and product rationale. The original `public-prototype.html` and `docs/Assignment.pdf` remain unchanged. The standalone HTML reference is not emitted into Vite's `dist` output.

## Interface redesign

The interface is an evidence workbook: a numbered horizontal workflow, counts on a shared scale, cited student responses, a ruled agenda, and an open Decision Thread. Ink and cobalt distinguish source material, editable work, and decisions. Field-specific errors, explained stage locks, full-text source readers, keyboard-safe dialogs, and responsive layouts preserve the planning model. IBM Plex Sans is hosted locally with its original SIL Open Font License; there are no external font requests. The earlier Inter assets remain available with their license.

Use **New cycle** for a fresh plan and **Cycle actions** for rename, duplicate, reset, and delete. **Guide** explains the fictional/scripted demonstration and contains presenter reset tools. Unsaved edits prompt before a browser refresh. On a stale workspace or failed operation, **Reload saved data** restores durable data after confirmation when needed.

Design research and agnostic-loop review records are in `docs/design-pass/`. The exact post-redesign hosting receipt is recorded separately in `docs/design-pass/deployment.md` after local acceptance.

## Repository delivery preference

After completed repository changes pass the appropriate checks, commit and push the active branch unless the user explicitly asks to keep the work local.

## Requirements audit

The deployed flow was audited against the performance-task brief. Source inspection now carries the original fictional task/rubric, class counts and selected quotations into interpretation and meeting preparation. The meeting kit assembles exact approved educator decisions into six presentation sections and an activity handout; it does not generate instructional decisions. The Guide exposes the pilot target, assumptions and deferred workflows. Audit and independent acceptance records are in `docs/requirements-pass/`.

## Visual identity pass

The workbook treatment replaces repetitive rounded score cards, tinted panels, decorative badges and duplicate progress summaries. The comparison shows 89/120 correct selections and 46/120 adequate explanations on the same count scale; it does not imply linked pupil-level data. Source dates, sample limitations, approval states and all saved-cycle behavior remain intact. Meeting-kit previews and portable HTML share the document hierarchy.

The self-hosted font files come from the official [IBM Plex repository](https://github.com/IBM/plex), with `public/fonts/IBM-Plex-OFL.txt` preserved. Design decisions, asset provenance, and independent visual/functional verification are in `docs/visual-identity-pass/`.

## Brief re-audit

The follow-up count is a fixed fictional illustration, independent of the chosen teaching action or reported implementation. Reflection now exposes the missing date, follow-up task, verified rubric, matched cohort, response coverage and implementation evidence, with the original task available as a baseline only. A higher count does not establish comparable learning progress. The same context travels with a recorded reflection in the text download; drafts and invalidated reflections are excluded. Review evidence is in `docs/brief-reaudit/`.
