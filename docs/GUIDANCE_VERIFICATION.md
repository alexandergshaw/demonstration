# Guidance workflow: verification boundaries and next study

This record describes the current implementation of optional stage guidance and the meeting-ready handoff. Workflow descriptions are based on source inspection, with integration checks recorded below. It does not report an educator study or claim that preparation within 20 minutes has been achieved.

## Implemented workflow

| Area | Behavior in the code | Boundary |
| --- | --- | --- |
| Local guidance | `StepCoach` places a short question near the task; **Help me think this through** and its **Self-check** are collapsed by default | Guidance does not write content, score readiness or approve a decision |
| Evidence | A question asks which pattern is worth bringing to the team; help directs attention to counts, original work, strengths, task and source limits | A leader may start interpretation with class results alone; sample selection is not a new requirement |
| Interpretation | **Revise interpretation**, **Inspect source**, and **Keep interpretation & explain uncertainty** are explicit routes from the alternative | Keeping records consideration and opens the focus editor only after saving; the leader still authors and confirms the focus |
| Plan | The action prompt distinguishes the teacher move from student thinking; an activity-specific question and one facilitator self-check follow the selected agenda activity | The app does not infer the quality of the move or require opening all help |
| Checks and collection | Teaching records and student-reasoning evidence have separate prompts; absent collector/dates stay visible | Collection arrangements are optional for approval; entered dates still use the existing validity and ordering checks |
| Approval handoff | Successful `confirm-plan` saves Plan (`step: 2`); current approval renders **Your meeting is ready** | Approval means the plan is ready to use, not that the meeting or teaching move has happened |
| Meeting materials | **Open meeting kit** offers the approved agenda, activities and source packet for presentation, printing or export | Existing approval gates remain; exports are snapshots, and scripted structure is not AI authorship |
| Later reflection | **Go to reflection** is separate from approval; prompts respond to reported full, partial or absent implementation | Reports are self-reported. No collected follow-up dataset is attached, and example outcomes remain separate |
| Edit collection | Ready-screen **Edit collection details** and Reflect's **Update collection plan** open Plan's learning check and target the collector field | Opening the editor alone does not revoke approval; changing commitments requires reapproval and preserves authored drafts |
| Save failure | Confirmation state is adopted only after the backend accepts it | A failed confirmation cannot award approval or recorded-reflection success; retrying a draft save does not confirm it |

The meeting-ready screen is derived from durable plan approval and the saved stage, rather than a temporary success dialog. Reloading an approved plan saved at Plan restores that handoff. After an actual change to the plan, approval and recorded-reflection stamps are invalidated; the action, agenda and reflection text remain available for reconsideration and reapproval.

Relevant implementation: [StepCoach](../src/components/StepCoach.tsx), [Evidence](../src/workspaces/EvidenceWorkspace.tsx), [Interpret](../src/workspaces/ReasoningWorkspace.tsx), [Plan](../src/workspaces/PlanWorkspace.tsx), [MeetingReady](../src/workspaces/MeetingReady.tsx), [Reflect](../src/workspaces/ReflectWorkspace.tsx), [collection editor](../src/components/EvidenceCollection.tsx), [application routing](../src/App.tsx), [planning model](../src/model.ts), and [persistence controller](../src/useWorkspace.ts).

## Automated integration checks

The integration run completed with:

- `npm test`: 325 passing tests across 13 files, including the compact Evidence views and first-use purpose introduction.
- `npm run build`: production TypeScript/Vite build passed.
- `git diff --check`: passed.

Regression coverage includes the approved ready landing and reload, existing cycles saved at Reflect, collection edits that require reapproval while preserving reflection text as an unrecorded draft, optional coaching, the collection-editor entry route, the approval guard on MeetingReady, and implementation-specific reflection prompts. Controller tests exercise save-failure policy against the local backend. Server-render and controller checks do not exercise a real browser DOM or replace interaction testing.

The compact Evidence pass adds seven source-render regressions for both dated snapshots: exact aggregate and class counts, independently specified rounded percentages, each class's denominator, stable class order, table caption and header scopes, unchanged task/rubric/source wording, collapsed detail and escaped source labels. Existing workspace contracts still check source selection and date/coverage boundaries. The three view controls remain ordinary pressed buttons associated with one labelled content region; keyboard focus uses their native button behavior. Switching views only updates local presentation state.

The first-use pass adds 18 eligibility cases and four component-render checks. The overview appears only in an undismissed, unstarted Evidence cycle; retained agenda, owner, check, collection and follow-up work also suppress it. Tests cover that boundary without altering the cycle, the closed structural preview, the real six-activity/50-minute agenda, subordinate Guide headings, and the meeting/teaching interval. Existing learning-storage tests cover preference reload, blocked/full storage and separation from cycle records. They do not verify browser focus or pointer interaction. The explicit continue action changes only the existing `welcomeDismissed` preference; the workspace stays usable without it. Guide → Start here replays the overview independently of that preference.

## Professional-workflow gap pass — October 31, 2026

Verified after the compact entry, narrow-screen evidence context, draft-kit preview, expanded decision record and draft recovery changes: **380 tests across 18 files passed**, and `npm run build` passed TypeScript and Vite compilation. The existing local development server returned HTTP 200 at `http://127.0.0.1:5173/`. These checks establish source/content/state contracts and buildability, not rendered behavior.

New regression coverage checks that draft preview preserves writing without permitting approved exports, labels starter/missing content and escapes markup; recovery copies preserve exact unfinished writing and current evidence without exposing approval signatures; decision records distinguish missing, draft, recorded and unsaved content and gate navigation correctly; narrow-screen task selection has a label and matching panel IDs; and the single reflection recording control precedes optional help.

The user's explicit source-only exception remains in effect. No local visual check was performed because browser access is disabled. Additional hands-on checks are required for desktop and narrow layout, 125/150% text, selector keyboard behavior, source-reader focus, review → draft kit → activity editing → review, Guide focus when first-use controls disappear, and actual file downloads/recovery under failed storage. The first-use overview is now compact; the full structural preview is reached through **How it works**. Approved kit downloads remain gated, while draft preview is available before approval.

## Verification limits

Browser testing was unavailable because browser use is disabled in the app settings. This pass therefore has no observed browser-rendered layout, keyboard-flow, screen-reader, text-zoom or pointer-interaction results. Source inspection and server-render tests can establish content and state contracts, but cannot demonstrate those interactive behaviors.

The application remains a browser-local prototype with fictional material and scripted questions. There is no live AI, dataset collection, scheduled reminder, automatic instructional-quality assessment or verified classroom outcome. A leader's own next-action text is preserved as authored; the app does not verify whether it contains a meaningful owner, time or causal explanation.

## Browser checks still to perform

These are proposed checks, not completed observations. Once browser testing is available, exercise the complete path with pointer, keyboard and a screen reader where possible.

1. Open and close local help at every stage. Confirm that help starts collapsed, keeps the main work readable and does not edit the draft or create completion state. Check narrow screens, 125/150% text and expanded spacing.
2. At the interpretation alternative, try all three routes. Check that returning to Notice preserves writing, the source reader closes back to the draft, and Keep moves to the focus only after successful persistence. Change the interpretation or question angle and verify that consideration must be recorded again.
3. Edit one agenda activity at a time. Trigger errors in a different activity, a closed check and an optional date. Confirm that the correct editor/disclosure becomes visible and focus reaches the invalid field.
4. Review and approve a complete plan with collection arrangements left blank. Confirm the unresolved labels remain honest, the ready screen appears after saving, and reload restores it. Inspect the meeting kit before choosing to enter Reflect.
5. In Reflect, try each implementation status. Confirm that an untried move receives barrier/next-opportunity guidance and that none of the statuses supplies a learning outcome.
6. From Reflect, open **Review what to collect → Update collection plan**. Confirm that the collector is reachable, changing a commitment removes the current plan approval, reflection text survives, and reapproval returns to the meeting-ready handoff. Enter Reflect explicitly to review and record again.
7. In a controlled local test, deny or exhaust storage and simulate a revision conflict. Attempt focus confirmation, plan approval and reflection recording. Confirm that failure leaves the draft available, communicates the save problem, and never displays a newly awarded approval or recorded success. Restore storage, save as appropriate and explicitly confirm again.
8. Check meeting-kit access and exports before approval, after approval and after invalidating edits. Verify that only the current approved decisions appear and that any exported recorded reflection retains the no-dataset limitation.
9. Start with a new browser-local learning preference and untouched cycle. Read the purpose, preview the material structure and choose Start with the evidence. Verify focus moves to the main heading, reload retains dismissal and no decisions are created. Replay from Guide at each stage, close it and confirm the current draft and stage remain unchanged. Repeat with blocked preference storage; the current page should honor dismissal while reporting that it was not saved.

## Proposed small leader trial

Recruit four to six PLC leaders with differing confidence in interpreting data and planning meetings. Use fictional material and avoid student identifiers. This is a formative usability study; such a small sample cannot establish instructional impact or population-wide efficiency.

Give each leader the same goal: prepare a 50-minute PLC around one teaching move that they can explain through specific evidence. Allow up to 20 minutes for preparation, recording actual time, unfinished work and assistance. The 20-minute limit is a target to investigate, not an observed result or an instruction to rush a decision. Do not count opening every help panel as success.

Observe whether the leader can:

- Find the original evidence and distinguish an observed pattern from an explanation.
- Explain why they revised or kept an interpretation after considering an alternative.
- State one teacher move, the thinking students will do and a usable facilitation activity.
- Separate evidence that the move happened from evidence about student reasoning.
- Identify missing collection arrangements and recognize that the approved kit precedes the lesson and reflection.
- Explain what remains unknown without turning older observations or worked examples into current results.

After preparation, ask the leader to explain the plan without reading the guidance. Record the sources they cite, uncertainty they retain and any moderator prompts. Have a curriculum reviewer examine the proposed move and student task separately from the usability observations.

Then give a clearly fictional after-lesson scenario, including a case where the move was not tried or only partly used and no comparable follow-up work is available. Ask the leader to record a next action and update one collection commitment. Observe whether they find the edit route, understand reapproval and retain their reflection draft. This is a scenario exercise, not evidence that the strategy was implemented.

If comparing with the leader's current workflow, use a second equivalent fictional case in a separate session and counterbalance which workflow comes first. Report time, total work, source traceability, explanation quality, unresolved decisions and assistance rather than form-completion rate alone. Ask which help was useful, redundant or distracting. Define adopt/revise/stop criteria before running the study; record negative and incomplete cases as well as successful ones.

No recruitment, participant observations or study results are reported here. A later classroom study would still be needed to examine actual implementation and comparable student learning evidence.
