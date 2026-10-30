# Throughline implementation and verification plan

1. Preserve the archive and restore the minimal manual loop engine and resolver. Capture bootstrap limits; create fresh state, grants and planning artifacts.
2. Independently check scope, criteria, design and this plan before accepting them. Admit app implementation with bounded writes to `src/`, project configuration and documentation.
3. Implement a readable state model, versioned persistence and React screens faithful to the references. Keep deterministic fictional data and educator approval boundaries.
4. Run independent unit/component tests for expected behavior and negative controls: attempting later stages early, revoked consent, stale follow-up after upstream edits, malformed saved state, storage exceptions, whitespace-only input and rejected export without approval. Test refresh/reset as behavioral contracts, not by asserting implementation details.
5. Capture the candidate and execute registered `app-tests`, `loop-tests` and `build` gates. Any source/configuration change requires fresh affected evidence. Gate failures are defects to repair, not waiver candidates.
6. Have a fresh verifier inspect the actual app/diff and independently exercise desktop/mobile UI, keyboard/error recovery, save/reopen, complete workflow, approval invalidation and export. Record limits separately from local gate results. Perform an isolated meaningful mutation or negative control to establish that important invalidation assertions detect regressions, restoring all candidate bytes afterward.
7. Import actual verification and final-report artifacts, independently check them, audit retained assignments/operations and current gate coverage, and hand off the local app with deployment explicitly pending for the user.

Workspace-changing operations and gates serialize on the `workspace` resource. Review workers may read concurrently with non-conflicting activities, but no acceptance is assumed merely because a report exists. Two substantive review rounds are the engine limit; invalidation does not reset them. No automatic provider dispatch is enabled.
