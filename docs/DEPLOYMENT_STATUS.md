# Deployment and integration status

Updated October 31, 2026.

## Live deployment

- Public app: https://throughline-phi-six.vercel.app
- Vercel project: https://vercel.com/alexandergshaws-projects/throughline
- Team/project: `alexandergshaws-projects/throughline` (`prj_ecS70KxFiDyLirL6zWefzcsKIA72`).
- Reviewed redesign deployment: `dpl_6VocHh6Ga6czps2536n3Hx1qmd7g`, ready, Node `22.x`. Exact asset and hosted checks are recorded in `docs/design-pass/deployment.md`.
- GitHub: `alexandergshaw/demonstration`, production branch `main`; future pushes trigger deployments.
- Build: Vite, `npm ci`, `npm run build`, output `dist`. No application environment variables are required. The package engine is bounded to Node 22 so Vercel does not select a newer major version.
- `.vercelignore` excludes environment files, local loop runtime, development outputs, and reference documents from CLI uploads. Local Vercel linking and credentials remain ignored by Git.

The user authorized this deployment after the local-backend implementation was complete. Vercel classified the first deployment as production even though the initial CLI request specified preview. That successful initial build selected Node 24 because the package allowed any newer major version; the current deployment was rebuilt successfully after bounding the engine to Node 22. Existing deployment protection was retained. The production alias responds without authentication; immutable deployment URLs may require Vercel authentication.

## Source and future updates

The source includes the localStorage backend, reviewed redesign, and Vercel configuration. The initial backend and redesign deployments were uploaded from the verified local working tree; the user subsequently requested that completed work always be committed and pushed. Future pushes to `main` trigger the connected Vercel build. The original pre-backend checkpoint remains available at `ead2317da648daccfcdb1375925bc901c71344eb`.

To deploy the current local working tree again from this linked directory:

```sh
vercel deploy --prod --scope alexandergshaws-projects
```

## Initial local-backend deployment verification

- Vercel reports the final deployment `READY`, production, Node `22.x`, with the public alias assigned.
- Public HTTP check returned 200 without credentials. Authenticated `vercel curl` also returned the expected app HTML.
- The hosted page rendered the React workspace and local cycle controls. A new demo cycle, its selection, stage, and authored interpretation survived reload. The saved content also survived the corrected deployment. Browser warning/error capture was empty.
- Hosted asset names match the previously verified local backend build: `index-DRBTTlXK.js` and `index-BkpRc9lG.css`. The deployment build completed TypeScript and Vite successfully.
- Existing implementation verification remains recorded separately: 151 app tests, 85 loop tests, two Windows capability skips, and clean independent reviews. Application source was not changed during deployment setup; the engine constraint and upload/documentation settings changed.
- The build reported six development-tool dependency advisories, including high/critical entries in the Vite/Vitest toolchain. A production-only dependency audit reported zero. Dependency upgrades were not bundled into this deployment; the reports are retained locally under `.agnostic-loop/deployment/`.

The original and local-backend agnostic-loop records remain historical and unchanged. This deployment setup does not retroactively change their local-delivery status. Runtime deployment receipts, HTTP evidence, audit reports, and the hosted screenshot are stored in the ignored `.agnostic-loop/deployment/` directory.

## Product boundaries

The app remains a fictional, scripted React prototype. Its database is localStorage in each browser and origin, with no hosted database, accounts, live AI, or district integration. Localhost data is separate from data on the public deployment. The existing reference documents and Figma handoff remain in the repository.

## Subsequent interface redesign

The source includes the October 31 adversarial design pass. The historical verification above describes the initial local-backend release. The redesigned release's actual deployment ID, asset hashes, and hosted checks are recorded in `docs/design-pass/deployment.md`. Review artifacts retain their original local-delivery provenance; the subsequent commit/push is a separate user-authorized delivery step.
