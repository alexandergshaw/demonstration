# Independent local repository test design

Author: `/root/app_tests`, context `/root/app_tests-fresh-context`. This is the actual independent planning report received before source admission; no test execution is claimed.

1. A fresh repository seeds usable immutable reference datasets and one draft exactly once. Rereads return deep copies; caller mutations cannot change saved cycles or references.
2. Create/read/update/list preserves authored content and cycle identity. Duplicate creates a new editable draft and clears approvals/follow-up. Delete cannot remove the final cycle.
3. Valid legacy state migrates once without losing current approvals or text. Invalid legacy input is surfaced safely without being mistaken for migration success.
4. Malformed, future-version, over-budget and structurally invalid databases are rejected without automatically overwriting stored bytes. Legal maximum and escaping-heavy model states remain reloadable.
5. Denied reads and quota/denied writes produce explicit failure, never false success or mutated cached persisted state. Existing stored bytes remain unchanged.
6. Successful updates advance revision. Stale expected revisions and external changes are rejected rather than overwriting newer work.
7. Active-cycle selection remains valid through create/delete/reload. Conflicts cannot silently switch or overwrite the active draft.

Exact success/error and mutation assertions will follow the agreed repository contract. Tests will be written only to `src/data/database.test.ts` after admission. UI unsaved/error messaging needs browser review in addition to repository unit tests. Existing model tests remain unchanged.

The independent test author additionally requires a complete twelve-cycle database containing legal maximum JSON-escaping-heavy fields to preserve current approvals and authored content. Assertions use documented error codes, durable byte equality and restored semantic state, not private approval-signature encoding or an initial revision constant.
