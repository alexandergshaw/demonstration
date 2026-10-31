# Evidence workbook visual identity

Author: `/root`. Implementation assignment: `visual-implementation` under `.agnostic-loop/visual-identity-pass`. This records completed author work; independent review and final gates are separate evidence.

The previous interface repeated rounded containers, pale green highlights, compact badges and a conventional sidebar/dashboard layout. The independent discovery review identified the resulting weak distinction between primary evidence, source context, coaching and an approved document. This pass gives those things different visual roles.

- Four numbered horizontal stages replace the sidebar and duplicate progress widget. Existing prerequisites, status semantics and keyboard behavior remain.
- A shared 0–120 scale compares 89 correct answers with 46 rubric-level explanations. Counts and percentages remain explicit. The 36 percentage-point aggregate difference includes a warning that the counts do not identify students who met both criteria.
- Student responses use large quotations and citation columns in ruled rows. The original task, scoring criteria, full evidence readers, class table and dated observation remain available.
- The Decision Thread is an open ledger. Coaching has a distinct margin treatment; the agenda uses numbered rules; approved materials use a white document with clear section headings.
- Ink, white and cobalt replace the repeated cream/green card treatment. Buttons retain visible boundaries and 44px targets. Responsive layouts preserve the four stages and source access.
- Local IBM Plex Sans assets, a custom through-line mark and a matching favicon establish a consistent identity. No font network service or dependency was added.

The changed source paths are `src/App.tsx`, `src/styles.css`, `src/components/Icon.tsx`, `src/meetingMaterials.ts`, `index.html` and `public/favicon.svg`, plus the three new font/license assets and README. The meeting-material change is limited to the HTML stylesheet. Storage/model/seed files, hooks, dialog and kit paging logic, tests and loop tools were not edited. Existing interpretation, plan approval, invalidation, local persistence and exports remain the behavioral contract.

## Font provenance

Official [IBM Plex repository](https://github.com/IBM/plex) files downloaded from `packages/plex-sans/fonts/complete/woff2/` and its root `LICENSE.txt`:

| Local asset | SHA-256 |
| --- | --- |
| `IBMPlexSans-Regular.woff2` | `ba711a3085ff9f27440b6b9c4550cfc47c97bf36591d5da958b975bb3add8c1a` |
| `IBMPlexSans-SemiBold.woff2` | `f78048030eab62e860efa39a0df79e2e5581bf122eb95b9bc42c0b8a4988d205` |
| `IBM-Plex-OFL.txt` | `7e6b2818edbd8f6a01ae80641cc8f16a51080d08fb4e532be3a0b6f74adb07da` |

The license is preserved verbatim; existing Inter assets/license remain. Standalone HTML uses an offline system font stack.

## Author verification

The implementation builds to the local production preview at port 4178. The author inspected the desktop evidence page, scrolled student-response rows and approved-kit dialog against the former production presentation. The visible differences are structural: shared comparison scale, horizontal stages, cited quotations and open decision records. The kit has readable document sections rather than another dashboard card.

Calculated WCAG contrast ratios: primary ink on white 15.34:1, body muted text on white 6.36:1, subtle text on the page background 5.39:1, cobalt on white 5.90:1, input boundary on white 3.58:1, caution text on white 6.62:1.

Independent source and responsive/essential-flow review must assess the frozen candidate before release, followed by the required existing app tests and production build. No implementation-mirroring tests were added for presentation changes. Native print pagination and opening the offline HTML file are not verified by this author pass; the previous browser file-URL restriction remains, and no bypass was attempted. Final deployment must be verified separately against the exact pushed commit.

## R1 navigation repair

Both independent reviewers found that the small-screen stylesheet hid stage lock/check icons. Under the bounded `workflow-status-repair` assignment, the author removed that hiding rule, retained the status icons at tablet sizes, and placed them in the top-right of each stacked mobile stage. Labels and numbers have separate space; the existing handlers, ARIA and prerequisite explanations are unchanged. Only `src/styles.css` and this record changed in the repair. The prior essential-flow evidence remains attributable to R1; R2 must directly check visible locked/completed/current states and navigation geometry at 320/390/768 before final gates.
