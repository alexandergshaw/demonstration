# Local backend manual-loop run

This isolated run uses `.agnostic-loop/local-backend/state`; the completed original `.agnostic-loop/throughline/state` is preserved. Existing repository loop tools remain unchanged. Only this excluded runtime helper and planning/audit documents are bootstrapped before admissions; new application writes require admitted exact paths.

Run the helper with the same Node flags every time so candidate tool identity remains stable:

```powershell
node --experimental-strip-types --experimental-default-type=module --experimental-loader file:///C:/Users/alexa/OneDrive/Documents/Projects/demonstration/tools/resolve-ts-hook.ts .agnostic-loop/local-backend/host.ts status
```

Other helper commands take a JSON request file: `bootstrap`, `start`, `author`, `import`, `finish`, `review`, `advance`, `gates`, `verify-report`, `final-report`. `review` requires an already admitted checker and exact artifact/report hashes; it imports the actual report and finishes that checker. `author` admits an actual author, imports supplied bytes and finishes. The existing core CLI also supports this state via `--state .agnostic-loop/local-backend/state --actor operator`.

The policy has concurrency one, a six-hour deadline, sixty-assignment maximum, five-minute command timeout, whole-candidate hashes and fixed local Node gates. No provider dispatch, Git mutation or deployment is enabled. Worker identity is operator-attested. Reports and gate outputs are immutable blobs; successful launch is not proof of completed work.

`review-batch` sequentially admits missing checker records and imports already received, independent per-artifact verdicts with exact artifact/report hashes. Each source receipt records whether the substantive review occurred under a prior planning admission as related-artifact analysis. It does not claim a new agent execution, a fresh context, or a future packet read. The existing engine still enforces independent identities, activity roles, round caps, current artifacts and serialized admissions. This batching was requested by the coordinating agent to avoid redundant review round trips on unchanged planning bytes.
