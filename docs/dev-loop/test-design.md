# Independent Throughline test design

Author: `/root/app_tests`, fresh context, supplied to loop host before test implementation. This is a test plan, not completed verification evidence.

C2/C3 positive oracle: user-authored interpretation, reviewed challenge, explicit focus, complete 50-minute agenda/action/owner/two distinct checks, consent, then explicit approval. No stage shortcut or confirm action may create absent prerequisites.

C4: parameterized upstream-edit tests start from completed saved reflection. Changing evidence, interpretation, focus, lens, confidence, agenda, action, owner, checks or consent must revoke appropriate downstream approval and saved-reflection status, preserve draft content and prevent stale export.

C5: roundtrip valid drafts; corrupt JSON, wrong version, invalid arrays/enums/field types and forged approval stamps yield safe fresh or review-needed state with future stages locked. Storage-I/O exceptions and DOM/accessibility require separate browser checks.

C6: export assertions use authored fixture strings, require source dates and a 50-minute agenda, and omit unsaved reflection. Reset yields a pristine demo. Boundary cases exercise trimmed input minimums and whitespace.

Mutation control: in an isolated copy, remove exportPlan's current-approved-plan guard. Tests requiring rejection before approval and after upstream edits must fail. Restore bytes. Retaining an internal stamp alone is not a sufficient mutation because content binding may still reject it correctly.
