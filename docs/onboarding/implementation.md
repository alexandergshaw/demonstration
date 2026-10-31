# Learning implementation

Root owns this candidate. The delegated equity_research contributor authored learning.ts, learning.test.ts and LearningGuide.tsx. Root integrated the stable controller, contextual Guide entry, optional welcome invitation, guarded explicit stage navigation, styles and repository documentation. Independent verification belongs to learning_reviewer.

Guide now offers four optional walkthrough lessons, three fictional practice scenarios with specific explanations for every choice, a searchable ten-term glossary and the preserved About/presenter material. There is no automatic modal, timer, proficiency score, live tutor or generated plan. Walkthrough navigation stays within Guide; only the explicit planning-stage action can navigate the workbook, and both the guide and root enforce stage availability.

Contextual help remembers the chosen lesson on the user event. Home resumes the remembered lesson rather than substituting the current planning step. Reviews and practice attempts record engagement only. Choices and explanations stay in the guide; no instructional field or approval is written. Practice clears previous feedback on answer/scenario changes; retry and empty-search recovery keep keyboard focus on a useful control.

The learning record is separate from reading preferences and the planning database. Its schema validates bounded metadata, merges reviewed/attempted topics with a current valid record, and preserves unsupported or unreadable stored bytes. A stable App-level controller keeps session-only progress across closing the guide or switching cycles. Save failures remain visible, including after dismissing the invitation. This is a local prototype, not an atomic multi-user service or monitored learning system.

The contributor added 18 behavioral regression cases covering metadata semantics, sequence composition, invalid records, separate keys, failures and recovery. Root's diff check passed. This report does not claim those tests or browser acceptance have run; the registered gates and independent report record actual execution. Existing model, database, seed, material exports, reading modules, dependencies and loop tools remain unchanged in this phase.

Research supports these product hypotheses, not a proven learning outcome or LE endorsement. Direct screen-reader/OS validation and educator usability/transfer studies are not claimed.

## R1 narrow-layout repair

The independent R1 review found horizontal overflow in the third walkthrough lesson at a 320-pixel viewport with 150% text and spacious reading enabled. The long word implementation exceeded the list item's available width. Root added inherited overflow wrapping to the Guide container so a word can break when it would otherwise overflow; ordinary desktop wrapping and text size are preserved. This is a single-property CSS change. Fresh registered gates and the bounded independent R2 layout check will determine acceptance; this note does not claim those checks have already passed.
