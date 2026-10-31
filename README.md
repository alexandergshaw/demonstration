# Throughline | PLC Planning Partner

A React/TypeScript prototype with a localStorage mock backend. Four focused workspaces connect fictional evidence, educator reasoning, an editable PLC meeting and follow-up reflection. The lesson, task, rubric and student data are fictional; thinking-partner questions are scripted. No account, API key, external database or live AI connection is required.

## Run locally

Use Node.js 22.14 or newer within the Node 22 release line, and npm.

```bash
npm ci
npm run dev
```

Open the localhost URL printed by Vite. Reference data and named PLC cycles save in this browser. **Cycle actions → New cycle** starts a fresh plan; the same menu provides rename, duplicate as draft, reset and delete. Reset cycle clears only the current plan. **Guide → About this demo → Presenter tools → Reset all saved cycles** is a separate confirmed action. Existing single-draft saves migrate automatically.

If saving fails, unsaved work remains visible with retry/reload controls. Unsaved edits prompt before a browser refresh. **Reload saved data** restores durable data after confirmation when needed. Storage belongs to this browser and site URL.

## Check and build

```bash
npm test
npm run loop:test
npm run build
npm run preview
```

App tests cover the planning model, local repository, workspace rendering contracts and approval-gated meeting materials. The current guidance workflow, verification boundaries and proposed leader trial are in [guidance verification](docs/GUIDANCE_VERIFICATION.md). [Focused-workspace verification](docs/FOCUSED_WORKSPACES_VERIFICATION.md) records the earlier layout pass; original implementation and backend records remain in `docs/dev-loop/`. Runtime receipts are retained locally under the ignored `.agnostic-loop/` directory. Browser testing is unavailable because browser use is disabled in the app settings, so source review and automated checks do not establish rendered layout or interaction quality.

## Four focused workspaces

1. **Evidence — a comparison desk.** Compare correct fractions and adequate explanations on one count scale beside original student responses. Select work to carry forward. **By class** and **Task & sources** expose detail within the evidence area; the older one-classroom observation has its own dated disclosure and visible caution.
2. **Interpret — writing beside an original source.** Move through **Notice → Test an alternative → Choose a focus**, with one active writing task. A selected source stays beside the editor on larger screens; **View selected evidence & task** opens a dialog on smaller screens. At the alternative, choose **Revise interpretation**, **Inspect source**, or **Keep interpretation & explain uncertainty**. The last action records consideration and opens the focus editor only when that save succeeds. The educator still writes and confirms the focus.
3. **Plan — an agenda builder and meeting handoff.** Establish what the teacher will do differently and what thinking students will do, then edit one activity in the six-part, 50-minute outline. Activity 4 contains optional rehearsal and access/participation support. Separate checks name evidence of implementation and student reasoning. Missing collector/dates remain visible and optional. **Review meeting plan** shows the complete draft before ownership confirmation and approval. Successful approval stays in Plan at **Your meeting is ready**, with **Open meeting kit** as the next action. Reflect is a separate action for after the teaching move is tried.
4. **Reflect — evidence availability and the next decision.** Report whether the teaching move was used. The workspace states that no collected follow-up dataset is attached to this cycle. Guidance responds to the implementation report, including a barrier and next opportunity when the move was not tried. Review planned collection, write the supported conclusion or uncertainty and a next action, owner and review point, optionally add a question for the next PLC, then **Record next step**.

Upstream edits revoke affected approvals and recorded reflection while preserving draft content. **Edit collection details** on the ready screen, or **Reflect → Review what to collect → Update collection plan**, returns to the learning-check editor and collector field. Opening an editor alone does not revoke approval; changing a planned check, collector or date does. Review and approve again before returning to Reflect; earlier reflection text remains a draft. Each saved cycle keeps its own decisions and evidence version. Duplicated cycles require fresh educator decisions.

## Interface and supporting controls

A compact header holds the cycle selector, save state, **Decisions**, **Reading** and **Guide**. Decisions opens the current cycle's evidence, writing and approval states in a dialog. It is available on demand rather than occupying a permanent sidebar. The four-step navigation leads to a different working composition in each stage.

The interface uses self-hosted IBM Plex Sans, ink and cobalt, restrained borders and deliberate whitespace. At standard reading size, the hierarchy is 36px page titles, 24px section headings, 18px task labels, 16px body/input text and 13px metadata, with 14px supporting instructions. The 125/150% reading settings and expanded spacing remain available. Original font licenses are preserved; there are no external font requests.

Each stage has a short question near the active task and a collapsed **Help me think this through** disclosure. Its **Self-check** helps the leader judge their own readiness; it does not score or approve the answer. Evidence asks what pattern merits discussion, Interpret separates observation from explanation and uncertainty, Plan changes its question with the selected activity and checks whether another facilitator could run it, and Reflect turns uncertainty into an actionable next check.

**Guide** provides a replayable walkthrough, three fictional practice cases with explanatory feedback, a glossary, separate worked follow-up examples and prototype information. **Help with this step** opens the relevant lesson. All support is optional and never writes or approves a plan.

## Freshness and follow-up

**Guide → About this demo → Presenter tools → Simulate new results** demonstrates an incoming October 29 collection. Review the dated snapshots, keep October 28 or create a revised draft. A revision preserves the original cycle and approvals, retains writing to reconsider, resets source selection and requires fresh decisions. October 29 includes 116 of 120 expected responses and repeats the original task; missing responses and practice-effect limits travel with the source packet. This is a fictional update demonstration, not a live integration. The September observation remains historical context.

**Reflect → Explore a worked example** and **Guide → Explore worked examples** open a separate dialog. **Documented follow-up** illustrates a specific teaching move, implementation records, dated tasks, shared criteria, matched coverage, student work and a qualified decision. **Missing evidence** uses the fixed 46/120 → 56/120 illustration to show why a higher count is insufficient. Neither case belongs to the active cycle, fills a plan or supplies results for the leader's action.

## Meeting materials and exports

After approval saves, **Your meeting is ready → Open meeting kit** assembles six presentation sections, a source packet and a participant activity handout from the exact educator-authored decisions. The approved Plan screen is restored on reload; approval does not imply the lesson has happened. Use the kit with the team, try the teaching move, then choose **Go to reflection**. Activity 2 and Activity 4 directions carry into the handout. This is deterministic document assembly. Download the self-contained HTML for offline presentation or print/save as PDF, or download the text plan with source excerpts. Exports are snapshots; later edits require reapproval and a new export.

Failed focus approval, plan approval or reflection recording does not advance to a success state. The visible draft stays available while the app reports the save failure. Retry saving the draft as needed, then explicitly confirm or record again; storage retry does not grant approval by itself.

A current recorded reflection travels with the text plan, along with explicit limits: implementation is self-reported, checks are planned and no collected follow-up dataset is attached to the cycle. Draft or invalidated reflections are excluded. The unrelated worked examples are not appended as the cycle's follow-up. The HTML meeting kit remains the approved meeting materials.

## Accessibility, equity and learning support

**Reading** provides 100/125/150% text and expanded spacing independently of instructional decisions. The implementation includes native controls, field-specific errors, stage-lock explanations, keyboard focus management, modal source readers, reduced-motion and forced-color rules. The current pass still needs browser and assistive-technology verification; it is not an accessibility certification.

Interpretation offers optional questions about strengths, access, language and missing perspectives. An educator-authored **Access & participation** plan carries into approved materials and the collection review. Editing it requires plan approval again. No student identity or subgroup result is inferred from a quotation, and no score certifies equity.

Learning progress records reviewed/attempted topics and navigation preferences in a separate browser-local record. It is not a proficiency score or personnel record. Corrupt, unsupported, denied or full storage does not silently overwrite an existing record; unsaved choices remain available for the current page session. There is no live tutor, external analytics, automatic translation or student upload.

Published guidance informs product hypotheses. See [accessibility and equity research](docs/accessibility-equity/equity-research.md), [accessibility review](docs/accessibility-equity/accessibility-audit.md) and [learning research](docs/onboarding/research.md). These features have not been validated in an educator study or endorsed by Leading Educators.

## Pilot and evaluation

The pilot serves a single-grade math PLC leader examining student work. Preparation within 20 minutes for a 50-minute meeting is an unvalidated target. **Guide → About this demo → How we would test this** describes a proposed formative trial, comparison with the current workflow, independent curriculum review, total workload, implementation follow-up and adopt/revise/stop criteria. Its downloadable HTML is a printable research handout with blank notes, not collected findings.

Multi-grade planning, configurable meeting duration, lesson-planning-first workflows, real curriculum/data integrations, live AI, routine libraries and linked evidence cycles remain outside this prototype. The original brief audit and core-decision rationale are retained in `docs/requirements-pass/`, `docs/brief-reaudit/` and [the core-decisions check](docs/CORE_DECISIONS_VERIFICATION.md); those records describe their respective checkpoints.

## Local backend and deployment

`src/data/database.ts` is the mock repository, `src/data/seed.ts` owns fictional reference tables and `src/useWorkspace.ts` connects React to stored cycles. Schema 4 retains each cycle's evidence version and optional planning fields; schemas 1–3 remain readable without rewriting on load. The database validates inputs and uses optimistic revisions to reject stale updates. It is not an atomic multi-user service. Details and limits are in [LOCAL_BACKEND.md](docs/LOCAL_BACKEND.md).

Live app: **https://throughline-phi-six.vercel.app**. Vercel project `alexandergshaws-projects/throughline` is connected to this repository with production branch `main`. It uses Vite, Node 22, `npm ci`, `npm run build` and `dist`. No application environment variables are needed. Each origin has its own browser-local data. See [DEPLOYMENT_STATUS.md](docs/DEPLOYMENT_STATUS.md) for deployment commands and recorded hosting verification.

## Reference materials

`figma/` contains original SVG frames, screenshots and handoff notes. [INTERVIEW_GUIDE.md](docs/INTERVIEW_GUIDE.md) and [PRODUCT_DECISIONS.md](docs/PRODUCT_DECISIONS.md) describe the current presentation and rationale. The original `public-prototype.html` and `docs/Assignment.pdf` remain unchanged. The standalone HTML is an archival reference and is not emitted into Vite's `dist`.

Historical design, research and review records remain in `docs/design-pass/`, `docs/visual-identity-pass/`, `docs/accessibility-equity/` and `docs/onboarding/`. The original pre-backend checkpoint is `ead2317da648daccfcdb1375925bc901c71344eb`.

## Repository delivery preference

After completed repository changes pass the appropriate checks, commit and push the active branch unless the user explicitly asks to keep the work local.
