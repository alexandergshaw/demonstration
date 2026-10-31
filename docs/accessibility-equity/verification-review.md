# Independent candidate review — round 1

Reviewer: `/root/accessibility_audit`, independent of both source authors. Date: 2026-10-31. **Verdict: repair required; not accepted.**

Candidate: `437979ef572a28f9d20dc0c261132f1a29b83fb1417c3fc4856724ae6565d5b4`. Implementation artifact: `7121a4ceb1933eda21c314f7d19a0c4f05592241002c1ad60309a403d541fc4c`. Source review began under root authorization; registered gates and subsequent browser checks ran under the actual revision-46 `candidate-verifier` admission. This is verifier analysis, not a claim of later formal checker execution.

## Required repair

**P2 — an evidence selection action extends beyond the viewport with combined reading settings.** On the root-owned production build preview at `http://127.0.0.1:4178/`, Chrome viewport 320×800, text size 150%, and spacious spacing enabled: root computed font size was 24px, body 21px, and letter spacing 2.52px. The document client width was 305px (scrollbar present), but scroll width was 331px. One Add as evidence button had left=154px and right=330.765625px. Thus selecting the supported combined settings introduces horizontal overflow on Evidence. The `.work-meta` flex row and nonshrinking `.evidence-action` need to wrap or stack at the constrained width. Recheck the actual combined settings after repair, including selected and unselected labels.

## Completed verification

- Independently read the changed model, preferences store/hook/settings control, equity support, App integration, fields, modal, materials, CSS and meaningful new regression tests. No additional source defect found in the reviewed behavior.
- Executed the two registered gates exactly once on this candidate. App-tests receipt `287525fd-9b28-4436-92ad-5c96c0a8ba45`: exit 0. Build receipt `fa1828f0-369a-4f5e-b5cc-caf232408cf7`: exit 0. Receipts remain in `.agnostic-loop/accessibility-equity/candidate-gates.json`. Unchanged loop-tool suite was not rerun.
- Source/tests cover missing legacy access fields versus malformed present fields; old signature compatibility; downstream approval invalidation; persistence/duplication; optional blank output; exact authored material text and escaping; denied/quota/corrupt/future preference storage and preservation of stored bytes. These are automated/source checks, not browser storage-fault injection.
- Created only the owned fictional cycle `QA access and voice — fictional Oct31` on localhost. Original selected cycle was `Fraction equivalence · Cycle 1`, Meeting stage, with an existing approved plan and blank optional access note. Original cycle text was not edited.
- Name dialog focused Cycle name. Reading dialog focused its heading. Changed settings through actual UI to 150% plus spacious and confirmed actual computed enlargement.
- At 320px with both settings active, Guide, source reader, and meeting kit entered at the title and scrollTop 0. Guide title top was 17.5px. Each long dialog client/scroll width was 240/240px. Guide and source reader closed with Escape and returned focus to their invoking control.
- Distinct source action names appeared in AX, including Student response B and C. Selected response B through its control. The equity disclosure exposed strengths, barriers, missing perspectives, unchanged learning goal and explicit lack of demographic records.
- Submitting empty reasoning marked interpretation invalid and associated both hint/error. After the animation-frame focus update, the active element was `interpretation`.
- Completed a representative own-word reasoning/meeting flow, authored all six agenda activities and the new access note, and approved it. At the combined 320px settings, Meeting and Reflection each had clientWidth=scrollWidth=305px and no out-of-bounds tested controls/headings.
- Reflection displayed the exact approved access note, including literal `<em>` markup and quoted text as text. Meeting kit section 4 displayed the same note, with correct section-heading focus and scroll reset. Its tested controls/headings remained within bounds.

## Pending and limits

The final browser tool attempted participant-handout selection and portable downloads, then stalled waiting for a download event and was interrupted. Its completion was not observed, so neither those downloads nor that handout step is claimed as browser-passed. The final tab state must be inspected before resuming.

Pending targeted work on the repaired candidate: verify Evidence overflow is fixed; complete the handout inspection and new access-note reload/edit/reapproval lifecycle; check persistence and restoration of reading settings within this owned QA flow; inspect desktop/narrow widths as necessary; restore original cycle, original default reading settings and viewport, and close the owned tab. Avoid repeating unrelated old workflow checks.

Owned Chrome tab `1192172374` remains available pending follow-up, with viewport override 320×800 and local reading settings 150%/spacious. No user cycle was deleted. Cleanup is not yet complete.

No claim is made for actual screen-reader testing, native browser 200%/400% zoom, OS forced-colors behavior, native print, or WCAG conformance certification. Source support and DOM/AX checks do not substitute for those instruments.

## Round 2 — repaired candidate and final local verdict

**Accepted for the defined phase-one scope, with the instrument limits below.** This subsequent review preserves the R1 findings above; it does not rewrite the failed candidate as having passed.

Actual admission: `candidate-verifier-r2`, revision 66. Candidate: `820858d2ecb6f221f775312c6f151ea4db0cac43d103a3031c19d926ae22f10d` (87 files). Implementation-v2: `191bcd0717c9d3d400d7b04cd5451df75c22e816a8b9dd70095f18dca32cc2aa`.

### Changed source and gates

The Evidence actions now wrap, shrink, and stay within their containing block. Independently reviewed the additional **author-discovered** compatibility repair: the same database key reads schema 1 or 2, normalizes the in-memory model to 2 without a load-time write, and writes schema 2 on a successful mutation. Earlier clients reject unsupported schema versions instead of loading and stripping the new access field. The new regression checks failed-write preservation, successful migration, unchanged authored fields, and access-note reload. Legacy approval and future-version checks remain intact. This compatibility finding belongs to root, not the R1 independent audit.

Executed fresh registered gates exactly once because source changed:

| Gate | Receipt | Result | Output SHA256 |
| --- | --- | --- | --- |
| app-tests | `fbca8827-c8c8-47c7-bfcf-4e20cb71931b` | 183 passed, exit 0 | `449ecb5a4348e8201f6d6a0635ac8f17bf105beca06a8f35b05f3ba1525ca59a` |
| build | `b1daa2f4-87d9-4939-b2e9-48b56f8108d1` | TypeScript + Vite passed, exit 0 | `3bd865468a1f40278f1d291bbdfc696f7ddb4851af386bd18806b9b83646afbf` |

Gate receipt bundle `.agnostic-loop/accessibility-equity/candidate-r2-gates.json` SHA256: `89a48a5bb924d0b61da8a28456d4700f55715964a2596fd13b54d2e89de544c5`. Build assets: `index-CnfV98h3.js`, `index-BuKQOAyY.css`.

### Targeted browser recheck and cleanup

- Rebound the existing owned Chrome tab after the interrupted tool reset its JavaScript bindings; inspected its actual state, then reloaded the newly built preview. The complete approved access note survived, remained visible in Reflection, and Meeting kit remained available. Stored reading settings also survived: `largest`, `spacious=true`, root 24px and body 21px.
- Rechecked 320×800 with 150% text and spacious spacing together. Evidence document clientWidth and scrollWidth both equal 305px. Selected response B action bounds were left 14px, right 189.5625px; unselected C action right 190.765625px. No tested buttons, selects, textareas, tables or headings exceeded document bounds. The R1 overflow is repaired.
- Opened Meeting kit, selected the participant handout, and verified the exact approved access note including literal markup and quoted text. Dialog clientWidth and scrollWidth both equal 240px. The participant handout preserves the new decision as content, with no fabricated participation outcome.
- Saved visual evidence at `.agnostic-loop/accessibility-equity/evidence/accessibility-audit/approved-handout-320.png`; it shows the deliberately demanding 320px/150%/spacious reading condition, not the default layout.
- Restored Standard/100% and default spacing through Reading settings. Selected original `Fraction equivalence · Cycle 1`; its original Meeting stage and approved Meeting kit remained available. Did not edit or delete original cycle text. Kept the distinctly named fictional QA cycle as evidence.
- Reset the browser viewport override, observed no captured console errors, and closed owned tab `1192172374`. Cleanup is complete.

### Criteria and limits

| Criterion | Evidence and disposition |
| --- | --- |
| C1 | Preference store tests cover default, roundtrip, restoration, invalid/future/denied/quota records and cycle-byte separation. Actual browser enlargement persists on reload and resets. Accepted. |
| C2 | Source relative typography/system media rules reviewed. Combined extreme-width browser repair verified, with no tested-control overflow; R1 Meeting/Reflection/reader widths passed. Accepted for tested layouts. No native zoom or OS forced-colors claim. |
| C3 | R1 actual Guide/source/kit heading focus, Escape return, name-input focus, source names, mobile cycle label/status and linked validation observed; confirmation Cancel behavior preserved in source. Accepted. |
| C4 | Contextual equity questions, explicit uncertainty, optional author note, approved Reflection/kit/handout browser flow and automated portable-content escaping verified. Accepted. |
| C5 | Legacy signature preservation, strict fields, invalidation/duplication, maximal legal states, migration failure preservation and schema-2 writes verified through source and passing tests. Accepted. |
| C6 | Independent source/targeted browser analysis and both recorded final gates cover the frozen candidate. No source edits by this reviewer. Accepted for local handoff; production release remains root's later action. |

The browser download-event attempt was not repeated. Actual download completion in this phase remains unverified; portable text/HTML content and escaping are covered by the passing tests and unchanged download wiring was source-reviewed. Native print/offline-file rendering, real screen-reader sessions, OS forced colors, and native browser 200%/400% zoom are unverified. The optional access-note edit/reapproval lifecycle is covered by reducer/repository regressions rather than an additional browser replay. No accessibility certification or organization endorsement is claimed.
