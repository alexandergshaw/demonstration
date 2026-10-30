# Throughline independent planning review

Reviewer: `/root/design_review`, a fresh subagent context distinct from the planning author `/root/loop_host` and the app implementer `/root`.

Scope: the requested React implementation, its supplied visual/source references, and the five planning artifacts below. The test-design author is `/root/app_tests`, a further distinct context. This report is an independent planning judgment, not a runtime test result or application acceptance. No provider call, deployment, external communication, or app-source mutation was performed by this reviewer.

## Substantive round 1

| Artifact | SHA256 of reviewed bytes | Verdict |
| --- | --- | --- |
| `docs/dev-loop/scope.md` | `1edf410e8c1c44bd6351a10b423138d74b936bab955fff31f224272f9782f9b7` | Clean |
| `docs/dev-loop/criteria.md` | `c6a64f98fee90bed6ec265720c36bda8a869ee94cfd9b145747aaa05f4574aae` | Defective; correction required |
| `docs/dev-loop/design.md` | `d1f58ed7d9b8163c5dca948d180cc47c2bd280995486a3c87349ddfb43b07496` | Clean |
| `docs/dev-loop/plan.md` | `e493925600b9b701e57132423a0d3162d99c945e0079c14aea4c50d5c46f3cc4` | Clean |
| `docs/dev-loop/test-design.md` | `72a3587b2707db843adf42f1058cf93971bb9d15e236a43cd531e6908b3ed288` | Clean |

Finding P2, new class, approval invalidation: C4 says focus edits revoke plan approval and saved follow-up status, but omits revoking focus approval itself. An implementation could satisfy that text while treating a changed focus as already confirmed. Require an edited focus to lose focus approval, plan approval, consent and saved follow-up status, while preserving authored drafts. Stop before accepting the criteria artifact; recheck the narrow correction independently. A new challenge is not required merely because focus wording changed while interpretation remains unchanged.

The independent test design supplies positive and negative approval-flow oracles, input boundaries, corrupt-storage recovery, actual export content, reset behavior and a meaningful isolated export-guard mutation. Its explicit separation of browser storage-I/O and accessibility observations is appropriate: passing model tests alone will not establish those behaviors. That test plan is accepted at the hash above.

## Substantive round 2 delta check

Reviewed `docs/dev-loop/criteria.md` SHA256 `3507a971cf1bea3085ba384f3ae2d7aa6602464c84f17938807f59897913d9dc`. Verdict: **clean; accepted**.

The sole change is the requested C4 sentence: focus edits now revoke focus and plan approval, consent and saved follow-up status. I independently read the revised criteria and verified mechanically that replacing that one sentence with its original produces the exact Round 1 SHA256. The P2 approval-invalidation finding is resolved, with no remaining planning defects. The other four artifacts retain their Round 1 clean judgments at the hashes listed above. This concludes the substantive planning review; implementation and browser verification remain separate obligations.

## Reference and scope checks

The requested scope fits the supplied fictional grade-four pilot and avoids expanding into a production student-data system. It retains the core advantage over chat: persistent evidence, an educator-owned decision record, an editable meeting, and separate implementation and learning follow-up. The visual target is the supplied navy/teal desktop evidence workspace and stacked mobile layout, not pixel-identical rendering of the simplified React seed.

The source references contain usable controls missing from the compressed React seed: progressive student-work examples, class comparisons, alternate challenge prompts and confidence selection. Restore visible reference controls when implementing the supplied experience. Any fictional-response convenience action must populate editable drafts only and invalidate prior approvals; it must not masquerade as educator approval.

The seed's focus edit omitted clearing its saved-reflection flag, and unchecking consent omitted revoking an approved plan. C4 now explicitly addresses those failure classes except for the focus-approval omission recorded above. These are observations of supplied source, not claims about the implementation that will replace it.

## Independent behavioral oracles

1. **Positive flow:** Select sample evidence; author an interpretation; inspect a scripted challenge; author and confirm a focus; edit a 50-minute agenda, action, owner and both checks; give explicit consent; approve; record implementation and a substantive reflection. The Decision Thread must reflect those actual values.
2. **Gates and boundaries:** Empty and whitespace-only inputs fail; the minimum accepted input and one-short boundary behave consistently. An unavailable stage cannot be reached by its navigation control. Later-stage rendering/export must also reject inconsistent state, rather than relying solely on a disabled button.
3. **Invalidation:** From a completed, saved flow, independently edit selected evidence, interpretation, focus, each plan field and consent. Assert required upstream approval boundaries are revoked, saved follow-up is no longer presented as current, drafts remain recoverable, and the user can explicitly reconfirm and proceed.
4. **Persistence and recovery:** Reload a valid partial draft and a valid approved plan. Test malformed JSON, wrong schema version, wrong field types, unknown evidence IDs, malformed agenda, invalid enum values, and inconsistent approval/stage flags. Storage read/write failures must leave a usable session and visibly distinguish session-only work from persisted work. Reset must survive reload.
5. **Export:** No unapproved or invalidated plan is exportable. An approved download contains the actual selected evidence, authored interpretation/focus, all six current agenda activities totaling 50 minutes, action, owner and separate checks. An unsaved reflection must be omitted or explicitly labeled as a draft.
6. **Evidence semantics:** The fictional dataset remains 89/120 correct selections and 46/120 adequate explanations; the next cycle is 56/120, not a causal treatment effect. The September 9 one-classroom observation stays dated and scoped. If class comparisons are shown, the class counts sum to the displayed totals.
7. **Actual browser checks:** At desktop and 390-pixel mobile width, inspect all four stages, keyboard focus, error announcement/targeting and overflow. Verify actual refresh/reopen and downloaded content, rather than inferring them from a unit test or successful Vite build.
8. **Meaningful control:** In an isolated copy, disable a focus-edit invalidation or retain the stale saved-reflection flag. The relevant behavioral test must fail for the intended assertion. Record the changed bytes, failing assertion and restoration; a syntax/import failure does not demonstrate detection of the defect.

Deployment and live-provider qualification remain outside this implementation's acceptance. A successful local browser flow may establish local app behavior only.
