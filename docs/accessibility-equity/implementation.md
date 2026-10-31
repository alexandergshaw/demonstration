# Phase-one implementation

Root owns the candidate. The explicitly delegated equity_research contributor authored model, model/database/material tests, meeting materials and EquitySupport. Root authored ReadingSettings/preferences/tests, App wiring, Field hints, Modal focus behavior and styles. Neither contributor is the independent verifier.

The implementation follows the accepted research and plan: browser-local text size and spacious reading preferences; relative typography; resilient wrapping and native reduced-motion/forced-color rules; source-specific evidence control names; associated field limits; long-dialog title focus with explicit control focus for short entry/confirmation forms; and mobile labels/save status retained in the accessibility tree.

Equity questions invite examination of strengths, access, language and missing perspectives without filling decisions. The optional accessParticipation field belongs to the approved teaching plan, appears in relevant meeting materials and the participant handout, and remains visible in follow-up. Editing it invalidates plan/reflection approval. Absence in older records defaults to empty and preserves the original signature. The fictional reference fixture, dependencies, loop tools and lesson context are unchanged.

Preference changes are held above the cycle component, including session-only changes when storage cannot safely be written. Malformed, future-version or inaccessible saved preferences are not overwritten. Preferences use a separate key and do not revise cycle data. The new tests cover storage failures, legacy signatures, text survival, invalidation and escaped/approval-gated exports. No checks are claimed as executed by this report; actual gate and independent review receipts follow separately.

All reading and equity choices are product hypotheses informed by the linked primary research, not an LE endorsement or certification. Screen-reader software, native OS contrast/zoom, user studies and native offline printing remain unverified unless explicitly recorded in later evidence.

## Bounded repair after R1

The independent reviewer found an evidence action overflowing at 320px with 150% text and spacious spacing. Root repaired its metadata row to wrap and allowed the action to shrink within the available width. Other completed R1 checks retain their recorded provenance; affected reflow is rechecked on the new build.

Root also discovered an older-client persistence risk by inspecting the previous release: its version-1 parser discarded unknown state keys before saving. Root therefore added a database schema-2 migration under the replacement repair assignment. The storage key stays the same. Version-1 cycles load with preserved content and approvals without rewriting stored bytes; the next successful mutation writes version 2. Existing version-1 clients already refuse newer versions, protecting access notes from silent deletion. A failed first write preserves the original version-1 bytes. The added regression exercises this boundary; unsupported future-version coverage now uses version 3. This finding belongs to root, not the independent R1 reviewer.
