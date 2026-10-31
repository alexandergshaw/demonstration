# Comparable product research and design decisions

Reviewed October 31, 2026. These are observations of official public product pages and imagery, not authenticated use of those products.

| Official reference | Observed design pattern | Throughline implementation |
| --- | --- | --- |
| [Linear — Plan](https://linear.app/plan) | A clear project title, compact properties, restrained navigation, and related context beside the work | Slim header, compact cycle toolbar, four-stage workflow rail, and a secondary Decision Thread |
| [Notion — Projects](https://www.notion.com/product/projects) | Useful information density, quiet separators, compact view controls, and a dominant creation action | Short section headings, consistent 44px controls, contextual cycle actions, and one primary next step |
| [Panorama — Student Success](https://www.panoramaed.com/products/student-success) | Educator intervention context connects status, evidence, action, and follow-up | Source dates and scope stay visible; planning leads from evidence to an owned action and two distinct follow-up checks |

These adaptations are design judgments, not claims of feature parity. Throughline retains its own forest-green identity, fictional evidence, educator authority, scripted questions, and browser-local storage. No search, collaboration, notifications, accounts, or live AI controls were invented.

## Adversarial baseline

The old 1280×720 layout placed the first metric values at y714.64–754.23, below the initial viewport. Large cycle-administration and introductory areas displaced the evidence. Repeated pale rounded containers weakened hierarchy. Several supporting text colors fell below 4.5:1, and focus indication below 3:1. Long decisions expanded the sidebar without a bound. Validation did not associate errors with the specific controls; locked stages were disabled without an explanation.

The redesign moves the metrics to y377.39–422.89 at 1280×720, with a 773px main column in the author check. A quiet toolbar replaces the large management panel. The Decision Thread has 150-character previews and a full-text dialog. Invalid controls expose visible errors, aria-invalid, and aria-describedby. Focusable locked stages explain prerequisites without dispatching a transition. Browser refresh protection exists only while unsaved edits are present, and operation errors expose Reload saved data.

## Type, color, and provenance

Inter is self-hosted; there is no runtime font request to a third party. The official [Inter site](https://rsms.me/inter/) links the v4.1 font used here. Downloaded from `https://rsms.me/inter/font-files/InterVariable.woff2?v=4.1`; the [v4.1 SIL Open Font License](https://raw.githubusercontent.com/rsms/inter/v4.1/LICENSE.txt) is preserved verbatim in `public/fonts/OFL.txt`.

- `InterVariable.woff2` SHA-256: `693b77d4f32ee9b8bfc995589b5fad5e99adf2832738661f5402f9978429a8e3`
- `OFL.txt` SHA-256: `262481e844521b326f5ecd053e59b98c8b2da78c8ee1bdbb6e8174305e54935a`
- Muted text `#59675f` on white: 5.95:1.
- Metadata `#647168` on `#f6f7f5`: 4.76:1.
- Teal text/focus `#186b56` on white: 6.41:1.
- Input border `#84948a` on white: 3.19:1.

The original Figma and project reference material remains unchanged. Further independent observations and verification limits are in this directory's review records.
