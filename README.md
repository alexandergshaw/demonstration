# Throughline | PLC Planning Partner

A React/TypeScript implementation of the supplied Throughline design package with a localStorage mock backend. The four-stage workspace connects fictional evidence, educator reasoning, an editable PLC meeting, and follow-up reflection. All student data is fictional; thinking-partner prompts are scripted. No account, API key, external database, or live AI connection is required.

## Run locally

Use Node.js 22.14 or newer within the Node 22 release line, and npm.

```bash
npm ci
npm run dev
```

Open the localhost URL printed by Vite. The app stores its reference data and named PLC cycles in this browser. You can create, rename, duplicate as draft, switch, and delete cycles. Reset cycle clears only the current plan; presenter tools include a confirmed reset of all cycles. Existing single-draft saves migrate automatically.

If saving fails, your unsaved work remains visible and the app offers retry/reload controls. Data is local to the browser and site URL. Export an approved plan when you need a portable text copy.

## Check and build

```bash
npm test
npm run loop:test
npm run build
npm run preview
```

App tests: 69 model cases plus 82 independent repository cases. The manual loop suite has 85 passing tests and two Windows symlink-capability skips. See `docs/dev-loop/local-backend/` for the current review records; original implementation records remain in `docs/dev-loop/`. Runtime receipts are retained locally under the ignored `.agnostic-loop/` directory.

## Workflow

1. Inspect the October 28 results and optionally select student responses or the older classroom observation.
2. Write an interpretation, consider a scripted challenge, and confirm one instructional focus.
3. Edit the six-part, 50-minute agenda; specify an action, owner, and separate implementation and learning checks; then explicitly approve.
4. Record implementation, inspect fictional next-cycle evidence, save a reflection, and export the approved plan.

Upstream changes revoke affected approvals and recorded reflection while preserving draft content. Each saved cycle keeps its own state. Duplicated cycles require fresh educator decisions.

## Local backend and deployment

`src/data/database.ts` is the mock repository, `src/data/seed.ts` owns the read-only fictional reference tables, and `src/useWorkspace.ts` connects React to stored cycles. The versioned database validates inputs and uses optimistic revisions to reject stale updates. It is not an atomic multi-user service. Details, API examples, migration behavior, and limits are in `docs/LOCAL_BACKEND.md`.

Live app: **https://throughline-phi-six.vercel.app**. Vercel project `alexandergshaws-projects/throughline` is connected to this GitHub repository with production branch `main`. It uses Vite, Node 22, `npm ci`, `npm run build`, and `dist`. No application environment variables are needed. Each origin has its own browser-local data. See `docs/DEPLOYMENT_STATUS.md` for verification and deployment commands.

This repository includes the local backend, deployment configuration, and reviewed interface redesign. Vercel builds the production app from `main` on subsequent pushes. The original pre-backend checkpoint remains available at `ead2317da648daccfcdb1375925bc901c71344eb`.

## Preserved reference materials

`figma/` contains the original SVG frames, screenshots, and handoff notes. `docs/INTERVIEW_GUIDE.md` and `docs/PRODUCT_DECISIONS.md` explain the presentation and product rationale. The original `public-prototype.html` and `docs/Assignment.pdf` remain unchanged. The standalone HTML reference is not emitted into Vite's `dist` output.

## Interface redesign

The app includes a professional UI pass informed by official Linear, Notion, and Panorama product imagery. A compact workflow rail and cycle toolbar keep evidence prominent. Field-specific errors, explained stage locks, full-text decision readers, keyboard-safe dialogs, and responsive layouts preserve the existing planning model. Inter is bundled locally with its SIL Open Font License.

Use **New cycle** for a fresh plan and **Cycle actions** for rename, duplicate, reset, and delete. **Guide** explains the fictional/scripted demonstration and contains presenter reset tools. Unsaved edits prompt before a browser refresh. On a stale workspace or failed operation, **Reload saved data** restores durable data after confirmation when needed.

Design research and agnostic-loop review records are in `docs/design-pass/`. The exact post-redesign hosting receipt is recorded separately in `docs/design-pass/deployment.md` after local acceptance.

## Repository delivery preference

After completed repository changes pass the appropriate checks, commit and push the active branch unless the user explicitly asks to keep the work local.
