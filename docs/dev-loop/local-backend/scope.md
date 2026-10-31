# Local backend scope

The user asked to mock a backend/database with purely local storage, and then explicitly requested pushing before that addition. Root reports the completed original application checkpoint was committed and pushed as `ead2317da648daccfcdb1375925bc901c71344eb`. This new run starts after that checkpoint and preserves the original completed Throughline loop. It authorizes local implementation and verification, not another push or deployment.

Deliver a synchronous, typed local repository over versioned localStorage with seeded read-only workspace/evidence records and multiple saved PLC cycles. Integrate its reference data and lifecycle into the React application while preserving educator-owned approvals, invalidation, follow-up and export. Migrate valid existing `throughline.draft.v1` content when no database exists. Clearly surface persistence failures and conflicts without claiming data was saved.

Root owns the approved application paths; an independent test author owns only `src/data/database.test.ts`. The existing 69 model tests remain unchanged unless a specific amendment is reviewed. Existing loop engine/tool sources and package dependencies remain unchanged. Host work stays in `.agnostic-loop/local-backend/**` and `docs/dev-loop/local-backend/**`.

This is a browser-local mock repository, not an HTTP service or real database server. No fetch, accounts, provider calls, deployment, external service, or new dependency is required. Device-local storage is best-effort; optimistic revision checks detect already committed conflicting writes but do not create cross-tab transactional isolation. All data remains fictional. The user deploys via Vercel.
