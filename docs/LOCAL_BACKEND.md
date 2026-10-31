# Local mock backend

Throughline now uses a localStorage database through a typed synchronous repository. There is no HTTP server, network request, account, cookie, IndexedDB, hosted database, or new runtime dependency. Data belongs to this browser and origin; another device or deployment URL has a separate workspace.

## Stored records

The `throughline.database.v1` key holds one versioned JSON document with a database revision, the selected cycle ID, read-only reference tables, and up to twelve saved cycles. Reference tables contain the fictional workspace, assessment, four class totals, student responses, observation, evidence labels, and scripted challenges. Every cycle has an ID, name, created/updated timestamps, revision, and the existing validated planning state.

`src/data/seed.ts` creates independent copies of the reference data. `src/data/database.ts` validates every persisted document and returns detached snapshots. A changed reference table, invalid version/schema, duplicate or missing cycle ID, invalid active selection, oversized field, or invalid model state cannot be trusted as a saved workspace. Approval stamps are validated by the shared model parser; stale approvals restore as drafts requiring review.

## Repository API

```ts
import { createLocalBackend } from './src/data/database';

const backend = createLocalBackend(() => window.localStorage);
let workspace = backend.load();
workspace = backend.createCycle('November planning', workspace.revision);
workspace = backend.renameCycle(workspace.activeCycleId, 'Week 2 PLC', workspace.revision);
const cycle = workspace.cycles.find(row => row.id === workspace.activeCycleId)!;
workspace = backend.saveCycle(cycle.id, cycle.state, workspace.revision);
```

The remaining methods are `selectCycle`, `duplicateCycle`, `reviseWithLatest`, `deleteCycle`, `resetCycle`, and explicit `resetDatabase`. All cycle mutations require the expected database revision. `load` initializes missing storage, and `resetDatabase` deliberately replaces it. Optional clock and ID generators plus an injected Storage adapter support deterministic tests.

Creating or duplicating selects the new cycle. Duplication keeps teaching draft content but clears challenge review, approvals, consent, implementation, reflection, collection role/dates, and the next-PLC question. Deleting the active cycle selects the first remaining one; deleting the last cycle is prevented. Reset cycle preserves its name/identity and clears only its planning state. Reset all saved cycles appears in presenter tools and requires confirmation.

## Migration and recovery

The current schema is version 4 under the existing storage key. Versions 1, 2 and 3 remain readable without rewriting their stored bytes on load. Missing optional access, collection and next-PLC fields default to empty strings. Empty additions preserve existing approval signatures; populated collection commitments extend the plan signature and the next-PLC question extends only the reflection signature. A successful mutation writes schema 4, which older clients reject rather than silently dropping its fields. Incomplete or invalid date text remains a saveable draft; approval validates calendar dates and review order.

When the new key is absent, a valid legacy `throughline.draft.v1` draft migrates with its valid approvals and current stage. The original key remains untouched as a recovery copy. An existing new database always takes precedence. Invalid legacy data produces a visible fresh-cycle notice without deleting the legacy bytes. Invalid or future-version new databases are not overwritten by ordinary reads; retry or an explicitly confirmed fresh start is required.

Every mutation reads and validates the latest document, checks the expected revision, prepares the next snapshot, checks for an intervening change, and uses one `setItem` replacement. Failed or denied writes and quota errors throw typed `DatabaseError` values and do not report success. The React hook retains unsaved input, exposes retry/reload controls, and blocks cycle switches that would lose pending work. Other-tab storage events notify the user; reloading unsaved work requires confirmation.

These are optimistic checks, not cross-tab atomic transactions. Two simultaneous writers can still race between the final check and write. This is a local prototype, not a shared multi-user database. The browser quota can be smaller than the document's defensive size bound; long drafts may require reducing saved data. Clearing site data removes the database and legacy backup. Keep exported approved plans when a portable copy is needed.

## Evidence versions

Each cycle now stores `evidenceVersion`, `updateAvailable` and `updateReviewed`. Legacy cycles default to `oct28`, `false`, `false`; their existing approval signatures remain valid. The immutable base reference table is unchanged. `referenceForVersion` resolves the October 29 fixture for a revised cycle, and exports resolve this version too. The non-default evidence version participates in the focus approval signature.

Simulating an update and keeping the current snapshot do not revoke decisions. `reviseWithLatest(id, expectedRevision)` creates a new October 29 draft in one repository mutation, leaving the original record intact. It requires an available update and spare cycle capacity. The new draft preserves authored reasoning/action/agenda for revision, resets selection to the assessment, and clears challenge review, approvals, implementation/reflection and planned collection commitments. Conflict or failed-write errors leave stored records unchanged. Resetting a cycle returns it to the October 28 starting fixture.

## Verification

The current application suite covers lifecycle, schema migration, detached reads, invalid/unsupported data, failed writes, retry, stale revisions, twelve maximum-length escaping-heavy drafts, approval invalidation and export boundaries. Historical browser walkthroughs covered named cycle management and recovery. For the instructional-practice update, 241 tests and the production build passed; a fresh browser walkthrough was unavailable because local browser use was disabled in Work settings.

The pre-backend checkpoint was pushed to `main` as `ead2317da648daccfcdb1375925bc901c71344eb`. The local-backend implementation run completed without another push or deployment. Subsequent reviewed changes were committed and pushed to main, which triggers the connected production deployment. See `DEPLOYMENT_STATUS.md` for the current hosted status.
