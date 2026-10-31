# Four focused workspaces — verification

October 31, 2026.

## Delivered behavior

The four stages now have different working compositions: a counts-and-quotations comparison desk; one reasoning editor beside an original source; an agenda outline with one activity editor and a complete draft review; and an implementation report with an explicit missing-follow-up state. Decisions, examples and presenter controls are outside the main working surface.

Existing cycle data and approval signatures remain compatible. No database schema or reference-data changes were needed. Focus, plan and reflection confirmations now wait for a successful repository save before changing the visible completion state or advancing the stage. Failed typing saves still retain the draft in memory. The text export preserves authored reflection and describes missing follow-up evidence without appending unrelated example outcomes.

## Automated and source checks

All 286 tests pass across ten files. The production build passes TypeScript and Vite. Regression checks cover both evidence versions, original sample text and dated historical context, initially hidden editors, safe rendering of educator-authored text, missing outcomes even in a recorded reflection, and approval-gated exports. The existing planning-model and repository tests cover invalidation, migrations, conflicting updates and failed writes.

Five controller tests exercise the actual repository and `useWorkspace` with a deterministic hook host: failed focus, plan and reflection confirmations preserve visible state and durable data; unsaved typing survives failure and retry; a competing client cannot be overwritten by approval. Retrying a save does not silently confirm a decision. The hook host is not a React scheduling or browser interaction test.

Independent source review prompted fixes for focus after local navigation, a disclosure closing when its text was erased, confirmation state advancing before a failed save, misleading saved-state copy, and the old main-column width constraining the new layout. Source review also checked the 320px and enlarged-reading rules, field-error reveal paths, modal return paths and distinct example boundaries.

## Verification limits

The browser tool reports “Local browser use is disabled in Work settings.” No alternate browser-control method was used. The current screens have not been visually rendered or exercised with a real keyboard or assistive technology in this pass. Server rendering checks markup and content, not CSS layout, native dialog behavior or usability. A production HTTP and asset check confirms publication only.

The 20-minute preparation target remains a hypothesis. Before calling the workflow validated, observe a leader selecting evidence, explaining an alternative, preparing one teaching move, reviewing a complete plan and naming the next evidence needed. Include small screens, 125/150% reading settings, long saved writing, invalid hidden fields, quota failure and conflicting tabs in browser verification.

## Local release artifacts

The verified build emits `index-CUMsuvWz.js` and `index-CC2Mhgmb.css`. Publication is checked after the source commit is pushed to `main`; a public HTTP response and matching asset names establish that this build is served, not that the screens have passed visual QA.
