# Independent phase-one plan review

Reviewer: `accessibility_audit`. Date: 2026-10-31. Verdict: **proceed, with the acceptance details below**. This reviews the actual proposed plan and source baseline; it does not report implementation or test results.

Inputs: the root's proposed phase-one plan, `accessibility-audit.md`, `equity-research.md`, and the existing model, repository, modal, field and meeting-material code. Root authorized this report directly before an engine review packet was supplied. Do not represent this review as execution of a packet that did not yet exist.

## Assessment

The proposed scope addresses the verified accessibility defects and the strongest research-supported needs without replacing educator judgment. An optional, educator-authored access and participation field is preferable to a score or mandatory claim of equity. The interpretation disclosure supplies questions without inferring identities from fictional responses. Integrating the field into approval signatures and exported materials makes it part of the actual meeting decision.

Separate reader preferences are appropriate. Converting typography to relative units while retaining current default dimensions supports useful enlargement; changing the root size alone would not enlarge the existing fixed-pixel text. A title-first modal default is appropriate for long reading content, with explicit input/Cancel exceptions for the existing name and confirmation dialogs. Distinct evidence names, visible minimum-length rules, and accessible mobile labels directly address the audit.

No substantive blocker was found. These recommendations remain product inferences from LE and accessibility/UDL evidence, not a statement of organizational endorsement or certified conformance.

## Acceptance details that must survive implementation

1. **Existing saved decisions remain valid.** An old approved and reflected state lacking `accessParticipation` must parse with an empty value and retain all three approvals. Absence is the only legacy accommodation; nonstring or oversized values must reject. Test both legacy draft and database paths.
2. **New decisions are bound correctly.** Editing access/participation invalidates plan and reflection approvals, but preserves confirmed instructional focus and all draft text. Reapproval binds the new value. Duplication preserves the value as draft; reset clears it. The optional field does not become an unannounced required gate.
3. **Materials carry the decision.** Preview, relevant presentation section, participant handout, text export, and follow-up view must include a completed access/participation plan. Blank legacy fields must not imply that an equity review passed or failed. HTML treats the field as text and safely escapes markup.
4. **Preferences do not become cycle data.** Size and spacing survive reload and cycle switching without revising workspace data, invalidating approvals, or changing reference evidence. Parsing rejects malformed/unsupported preference records without overwriting them. Explicit session-only status is needed when reading or writing storage fails. Selecting a new session preference must not erase a preserved newer-version record.
5. **Verify combined presentation demands.** Exercise 150% type plus roomy spacing together at 320px, including the toolbar, stage controls, long field labels, dialog controls, meeting pager, and source tables. Verify no content or controls become inaccessible. Native browser zoom, actual screen readers, OS forced colors, and offline print remain separate verification claims.
6. **Focus follows the task.** Reading dialogs begin at the title; name dialogs begin at the input; destructive confirmations begin at Cancel. Escape closes each and returns focus sensibly. Preserve existing heading focus after stage or meeting-section changes, and validation focus on the failing field.
7. **Respect system preferences across outputs.** The exported HTML currently uses smooth anchor scrolling; reduced-motion handling should cover that output as well as the app. Forced-colors support should retain visible selected states and chart text rather than treating color as the only distinction.
8. **Keep scope honest.** No demographic filters, inferred disability/language labels, automatic translations, automated equity judgments, or blanket WCAG certification. Keep this browser-local and keep full onboarding implementation in the later phase.

Discovery report SHA256 at review: `ccf045488aa6514a52b085183a09fd843a44d409b2b6067c24fa7d9a89157e53`.

## Subsequent exact-artifact check

After the conceptual review above, the reviewer received and read `.agnostic-loop/accessibility-equity/packets/planning-check.json` at revision 22, then independently read all five actual artifact files and computed their SHA256 hashes. The following are actual judgments under that admission; only scope is the formal packet activity, and the remaining four are related-artifact judgments made in the same review. No future packet execution is claimed.

| Artifact | SHA256 | Verdict |
| --- | --- | --- |
| scope | `1af35eca9717bd852f981e96fc22f0fd9efa82d042cbcb701fd6547a4950492a` | Accepted: matches completed research and verified defects; author/delegate and exclusions are explicit. |
| criteria | `8729f526a755668f1b364154b30d5bc1d28d50098aea7bd0346cb7a6234fc53e` | Accepted: C1–C6 cover storage, actual enlargement, semantics, optional equity content, legacy authority and independent verification. |
| design | `648103dade650d97245eca05931ef00a09cac69cf316364e36eadbab81f5c70a` | Accepted: separate preferences and conditional legacy-compatible signatures correctly separate presentation from instructional authority. |
| plan | `6e5c6f70eaf3174c14a9d4c7bfb706a85aadf192664894dea1c112710793a87f` | Accepted: concrete ownership, source freeze, actual review/gates and later release are appropriately ordered. |
| test-design | `eaedcd4f9151faa355cdeaa5cbd47336ebd9c32924f273a9acd307b40cec73e9` | Accepted: behavioral oracles include genuinely old approved fixtures, corruption, maximum escaping, independent preference state, browser flow and honest instrument limits. |

The acceptance details above refine execution of these artifacts and do not introduce a new requirement or scope blocker. Implementation may proceed.
