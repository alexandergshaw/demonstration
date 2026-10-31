# Redesigned Throughline deployment

Published and verified October 31, 2026, after clean local agnostic-loop acceptance.

- Public app: https://throughline-phi-six.vercel.app
- Project: https://vercel.com/alexandergshaws-projects/throughline
- Production deployment: `dpl_6VocHh6Ga6czps2536n3Hx1qmd7g`, READY, Node22.x.
- Immutable deployment: https://throughline-k2ycot709-alexandergshaws-projects.vercel.app
- Accepted local candidate: `1211d68c3ecf5aefd7d041a87b780dbb5671ca0cf4e5240e5c18862a54c1ff0c`.

This updates the previous local-backend release on the same public origin. The upload came from the accepted local working tree. No Git commit or push was performed during that deployment. The user subsequently requested that completed work always be committed and pushed, authorizing a separate Git delivery of the backend and redesign. The earlier review receipts retain their original local-delivery boundary. Deployment protection was retained; the public production alias responds without authentication.

## Verified delivery

Vercel reported READY and assigned the existing production aliases. The public HTML returned HTTP200 and referenced the accepted build. Downloaded hosted assets exactly matched the local production build:

| Asset | SHA-256 |
| --- | --- |
| `index-23LNUIZe.js` | `3031929d49f4ac878834b0804e0f69df8d8e11032ac5e43c62d81509f3f7087e` |
| `index-DqPlMGK7.css` | `8f36ad7dee7abb964eae7675eaf43376907e865fd4fd2ee53b30f88919fa059f` |

The hosted Inter font and OFL license also matched their local files byte-for-byte. No application environment variable, external database, or live AI service was added.

A fresh live browser tab rendered the redesigned workspace and existing saved cycles. At1280×720, document/client width both1265px. Inter loaded, source metadata computed at12px, and the Guide exposed its Open guide name. The Guide opened, closed, and returned focus correctly. Browser warning/error capture was empty. No authored cycle content was changed during this hosted smoke check. A live screenshot is retained at `.agnostic-loop/design-pass/deployment/live-redesign.jpg`; HTTP, CLI, and hash receipts are in the same directory.

## Acceptance and limits

The local loop closed at revision106 with all nine artifacts accepted, no active assignments/operations, and the exact75-file candidate unchanged after final gates. Independent reviews required and verified the typography and mobile Guide repairs. Final gates passed:151 app tests;85 loop tests with2 Windows symlink capability skips; TypeScript/Vite production build. Independent browser checks covered the complete approval flow, error/focus handling, exact long decisions, lifecycle operations, real two-tab conflict recovery, exported text, and320/360/390/768/1280px layouts including overlays.

Native200% browser zoom could not be exercised by the available instrument; actual320px reflow was measured instead. Native beforeunload was source-reviewed rather than fault-injected. No exhaustive assistive-technology certification is claimed. The pre-existing development-tool dependency advisories remain outside this design-only pass. See `verification.md`, `ux-audit.md`, and `visual-implementation-review.md` for exact provenance and limits.

The owned local preview server and QA tabs were stopped/closed, and temporary viewport overrides reset. The live output tab remains available. This deployment record is deliberately separate from the accepted source candidate and does not retroactively alter its local-loop receipts.
