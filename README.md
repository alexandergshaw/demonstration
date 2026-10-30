# Throughline | PLC Planning Partner

A React and TypeScript implementation of the supplied Throughline design package. The four-stage workspace connects fictional evidence, educator reasoning, an editable PLC meeting, and follow-up reflection. All student data is fictional and the thinking-partner prompts are scripted. No account, backend, API key, or live AI connection is required.

## Run locally

Use Node.js 22.14 or newer and npm.

```bash
npm ci
npm run dev
```

Open the localhost URL printed by Vite. Drafts save in that browser. Reset demo clears the local draft after confirmation. Browser storage failures show a warning; export an approved plan to keep a text copy.

## Check and build

```bash
npm test
npm run loop:test
npm run build
npm run preview
```

The app has 69 behavioral model tests. The restored manual loop has 85 passing tests and two platform-conditional skips on Windows. Production TypeScript/Vite compilation and the local production browser workflow were checked during implementation. See `docs/dev-loop/` for review evidence and the manual loop workflow. Runtime evidence is retained locally in the ignored `.agnostic-loop/throughline/` directory.

## Workflow

1. Inspect the October 28 results and optionally select student responses or the older classroom observation.
2. Write an interpretation, consider a scripted challenge, and confirm one instructional focus.
3. Edit the six-part, 50-minute agenda; specify an action, owner, and separate implementation and learning checks; then explicitly approve.
4. Record implementation, inspect fictional next-cycle evidence, save a reflection, and export the approved plan.

Changing upstream evidence or decisions revokes affected approvals and recorded reflection while preserving the draft text. The Decision Thread and export only present currently approved or recorded work.

## Deploy with Vercel

Deployment is left to the repository owner. Use the **Vite** framework preset, `npm run build`, and output directory `dist`; the included `vercel.json` already supplies those settings. No environment variables are needed. This implementation has not been deployed or verified on Vercel.

## Project contents

- `src/App.tsx`, `src/styles.css`: accessible, responsive React workspace.
- `src/model.ts`, `src/model.test.ts`: approval lifecycle, persistence recovery, export, and independent tests.
- `tools/`: runnable manual provider-agnostic loop restored from the supplied archive.
- `docs/dev-loop/`: scope, criteria, design, plan, reviews, and loop instructions.
- `docs/INTERVIEW_GUIDE.md`, `docs/PRODUCT_DECISIONS.md`: presentation and product rationale.
- `docs/DEPLOYMENT_STATUS.md`: current local verification and deployment status.
- `figma/`: original SVG frames, screenshots, and handoff instructions; these are references, not a native cloud Figma document.
- `public-prototype.html`, `docs/Assignment.pdf`: preserved original reference materials. The HTML reference is not part of Vite's production output.

