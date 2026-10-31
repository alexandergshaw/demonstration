# Independent onboarding verification

## R1 — changes required

Reviewed by `/root/learning_reviewer`, independent of the source authors `/root` and `/root/equity_research`, under candidate-verifier packet revision 46. This review binds candidate `10e86f0f68a7ee508074452187da9bd729de6f9e79afb3b567fb1a349703bffd` (90 files) and implementation report `4e7640934745db9785bf5df13f9e9365bd7418990557eb6d1eef010e682fe00f`.

**Verification and whole-change verdict: changes required for C5.** The implementation otherwise matches the accepted learning design in the bounded source and browser checks below. This is an actual verifier-admission judgment, not a claim that a later review packet was already executed.

### Finding R1.1 — narrow walkthrough has horizontal overflow

At the retained built preview `http://127.0.0.1:4178/`, Chrome viewport 320 × 800, reading size 150% and spacious text enabled, open Help with this step from Meeting plan. The native Guide dialog has a horizontal scrollbar. Read-only DOM measurements: viewport innerWidth 320; document clientWidth/scrollWidth 305/305; dialog bounding width 257, clientWidth 240, scrollWidth 246. Inside it, `.learning-guide`, `.learning-section`, and `.learning-steps` each have clientWidth 200 and scrollWidth 226. The second `.learning-steps li` has clientWidth 176 and scrollWidth 202; its text is “Name one teaching action, who will try it, and separate checks for implementation and student learning.” The word implementation exceeds the available line width. This violates the accepted no-clipping/no-horizontal-overflow narrow reading check.

Reproduce with the existing reading controls and Help with this step, or Walkthrough → 3. Meeting plan. Fix text wrapping within the Guide without clipping content or making the text smaller. Recheck all four lessons, practice choices/feedback, glossary, and Guide navigation at 320 and 390 with 150% spacious settings, plus ordinary text size. Proof screenshot is in ignored `.agnostic-loop/onboarding/evidence/r1-320-spacious-overflow.png`.

### Registered gates and protected boundaries

- Executed the registered candidate gates once, under the admitted verifier: all 201 tests in five files passed, including 18 learning tests; production build passed (47 modules). No duplicate unregistered run.
- App-tests output hash: `44dce3be53c27306007b8d140ff9b825244a08de91718247b9128ea0004fe933`.
- Build output hash: `8b7e510243b989bbd281c77325b02806d14bdcc7f50f72c529afe04609d4d4c5`.
- Independently SHA-256-compared all 16 functional baseline files and all 34 loop-tool baseline files: no mismatch. Protected model, database, seed, materials, workspace controller, reading-preference implementation/tests, dependencies and tool boundaries remain intact.

### Source and browser checks completed

- Read the complete learning content/progress helpers, guide component, learning tests, and relevant App integration. Only the separate learning key stores bounded lesson/review/scenario metadata. Content remains authored fictional practice; no live tutor, proficiency score, generated plan, approval or automatic stage unlock is claimed.
- Fresh learning metadata on an existing saved workspace showed the optional Evidence invitation. Dismissal persisted after reload; Open guide stayed available. Current-stage help opened Evidence while the ordinary guide had previously offered resume at lesson 4. Contextual help then became the new resume position, as designed.
- Read all four lessons. Marked Evidence reviewed, navigated Previous/Next/direct lesson controls, closed/reopened, and verified the resume position and reviewed history. Directly revisiting the first lesson permits replay without clearing history. Section changes focus their heading; initial modal entry focuses its title.
- Exercised all nine answer choices across all three practice scenarios and read each specific explanation. Wrong and supported choices were distinguished without a score. Changed choice removed previous feedback before resubmission; Try again cleared choice/feedback and focused the first radio. Scenario navigation cleared prior choice/feedback and focused the new heading. Tried counts survived close and cycle switch.
- Glossary search covered a no-result query and Show all terms recovery (10 terms; search focus restored), plus “cohort” matching its term and related definition. About retained pilot audience, assumptions, fictional/scripted/local-storage privacy boundaries and the existing reset entry; no reset was executed.
- In the existing blank QA stage-lock cycle, Meeting plan and Reflection remained locked after all three scenarios had been tried. Their lessons remained readable with explanatory lock text and no Open-stage control. Explicit Open Interpretation stage closed the guide, changed only the stage, and focused the destination H1. Restored that QA cycle to Evidence afterward.
- Restored the original Fraction equivalence cycle to its original Meeting plan stage. Compared every visible meeting input/textarea value and consent checkbox with the captured starting values: exact equality, including the six agenda fields, action, owner, both checks, access note and approval consent. Meeting kit remained available. Reading settings still showed original 100%/non-spacious settings before the intentional narrow-layout test.
- At narrow size, Mark lesson reviewed disables the button and the browser focus falls off that disabled element; the next Tab advances to Previous lesson, followed by Next lesson. There was no keyboard trap. This is not an additional blocker.

### Limits and remaining check

The concrete C5 finding bounded this first pass; 390-width and repaired ordinary-size visual checks are pending. Progress faults (malformed/unsupported records, blocked reads/writes, quota failures, bounded parsing, separate key and multi-tab merging) were verified through the meaningful unit cases and source inspection, not by manipulating browser storage. This pass does not re-audit the prior full planning workflow, download/native-print outputs, screen-reader announcements, OS/browser native zoom, forced-colors modes, or educator learning outcomes. Existing phase-one results are not represented as this reviewer's observations. Browser test tab and temporary reading/viewport settings are retained for the targeted repair recheck; restore them and close only this review tab afterward.

## R2 — accepted after targeted repair

Actual follow-up review under candidate-verifier-r2 packet revision 62, after the author's one-property CSS repair. Candidate: `4124bfee87a3f54faeb0312ccbc561343f306fda87113a56a8f34ca0a3b4db9c` (90 files). Updated implementation report: `392331a2b5cfee47355106887aaf5bcfeb3bfd69a90e9e5087f9ecef5fff86f3`. CSS: `ea8cd644b0fcdec8c77119b999bac14ed2253be12648ec35262f9379d50dee03`.

**Final implementation, verification and whole-onboarding-change verdict: accepted within the stated scope.** R1.1 is resolved and no blocking finding remains. The unchanged source/content/functional observations above are carried from R1, not represented as a second full execution. This verdict combines those actual independent observations with the fresh R2 gates and layout checks; later loop bookkeeping must preserve that provenance.

- Fresh registered app-tests ran once for R2: all 201 tests passed, including the 18 learning cases. Receipt `dd0bc1ce-3265-45a0-9806-a1c72be20a12`; output hash `d5ac4f32b61dd61003d5dad0eedb0845947b9c6ce0bbb936402c5187d7d195a6`.
- Fresh registered production build ran once for R2 and passed. Receipt `3c34e236-c571-4cfb-90ff-7b30fd2dc317`; output hash `6c0b5b69b81f7d5da797db37852087f47338f4206d8179e4e484ecf961427543`.
- Independently compared all 90 current candidate files to the R2 manifest, all 16 protected functional files and all 34 tool files to their original baselines: zero mismatches.
- Reloaded the built preview before rechecking. At 320 × 800 with 150% spacious text, all four lesson sections, all three practice questions with supported-answer feedback, glossary and home had equal dialog client/scroll widths (240/240) and no overflowing descendant. The previously offending list item now wraps; no horizontal scrollbar remains.
- At 390 × 844 with the same reading settings, all four lessons, the third practice question/legend/options/feedback, glossary, About and home had equal dialog client/scroll widths (310/310) and no overflowing descendant. Screenshots confirmed legible wrapping and available navigation. These were bounded layout checks, not repeat workflow audits.
- Restored ordinary 100% non-spacious reading and the default viewport (958 pixels in this Chrome session). The Meeting plan lesson retained ordinary readable typography with equal client/scroll widths (803/803), no overflowing descendant and no clipping in the inspected view. Escape closed the modal and returned focus to Help with this step.
- Final visible plan/consent comparison again matched the original snapshot exactly. Original Fraction equivalence / Meeting plan selection and original reading settings are restored; the QA lock cycle remains at its original Evidence stage. Reset the viewport override and closed only this reviewer's tab. The root-owned preview can now stop. Learning engagement metadata intentionally records the exercised lessons/scenarios; no planning reset was used.

Proof screenshots remain in ignored `.agnostic-loop/onboarding/evidence/r2-320-spacious-repaired.png` and `r2-ordinary-guide.png`. The limits above still apply: this is not screen-reader/OS/native-print certification or evidence of educator learning gains, and production deployment verification belongs to the parent release step. No requested local acceptance work remains for this reviewer.
