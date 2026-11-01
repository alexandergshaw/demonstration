# Throughline product decisions

**Purpose:** An educator-owned planning partner for a fictional grade-four math PLC. This is an interview concept, not a production or district-tested product. The thinking-partner questions are scripted.

## Workspace design

The interface gives each stage a distinct working composition while keeping one cycle, one evidence version and the same approval model. A compact product bar holds the cycle selector and a single Menu for Decisions, Reading settings, Guide and cycle actions. The stage bar holds save status. Decision history opens on demand; it does not compete with the current task in a permanent sidebar. Help is available from the header and each stage without a required welcome flow.

| Stage | Primary work | Supporting information |
| --- | --- | --- |
| Evidence | Assessment → Student work → Review selection, with one active task | Results, By class and Task & sources remain assessment views; optional work selection and historical context stay separate from the included class results |
| Interpret | Notice → Test an alternative → Choose a focus, with one active task | A selected source occupies roughly one third of the desktop workspace; narrow screens keep its dated quotation or counts inline and offer the full source reader; earlier writing has summary/Edit controls |
| Plan | Teaching move → Meeting activities → Follow-up checks → Review & approve; after approval, a meeting-ready handoff | One activity or check is edited at a time; sources open on demand; the actual draft kit is available before explicit approval |
| Reflect | Teaching attempt → Next step, with one active task | Missing follow-up evidence remains explicit; planned collection expands when needed; worked cases open in a separate dialog |

This organization addresses scrolling and visual overload through stable source access and progressive disclosure. There is no live conversation or generated-chart runtime. The design demonstrates how a workflow can keep evidence and authored decisions available without relying on chat scrollback.

## Professional product references — October 31, 2026

The strongest recognition evidence is specific: [Playlab's public Leading Educators collection](https://gardens.playlab.ai/collection/leading-educators) lists **LeAnita Garner** as the author of BPS IM Lesson Rehearsal Lab. [LE's AI work](https://leadingeducators.org/ai-at-le/) also documents Playlab and Illustrative Mathematics connections. These are relevant professional comparables, not evidence that every interviewer uses them or endorses this design.

The [Playlab builder documentation](https://learn.playlab.ai/getstarted/Creating%20a%20Playlab%20App) includes an actual editor screenshot: one product bar, a named app, task navigation, distinct preview/editor/reference areas, and explicit publishing controls. The [workspace documentation](https://learn.playlab.ai/getstarted/Navigating%20Playlab) shows neutral navigation, a pale canvas and separate white working surfaces. Both public screenshots were inspected as design references; they were not added to the application.

Throughline adapts those boundaries with a compact product bar, numbered desktop stages, a full-width cycle selector and native stage selector on phones, and consistent white evidence/editor panels against a pale canvas. The Plan outline and selected activity remain separate. Save status and explicit educator approval retain different meanings. No live AI, publishing, collaboration or integration capability is implied by the borrowed presentation.

Two complementary references ground the instructional layout:

- **Illustrative Mathematics / AccessIM:** [Grade 4, Unit 2, Lesson 9 preparation](https://ca.accessim.org/k-5/grade-4/unit-2/section-b/lesson-9/preparation?a=teacher) separates Preparation and Lesson, states a purpose, and groups materials, activity preparation and reflection. Throughline retains a concise stage purpose, an activity outline beside its editor, and optional extended explanations. [LE lists IM among its curriculum connections](https://leadingeducators.org/our-work/curriculum-based-professional-learning/). We borrow the organization, not the lesson content or branding.
- **EdLight:** Its [official product tour](https://edlight.navattic.com/wq1207s4), linked from the [product page](https://www.edlight.com/product), follows assignment context into student-work analysis and instructional next steps, with educator revision available. [LE documents an EdLight partnership](https://leadingeducators.org/team/araceli-flores/). Throughline gives assessment and original student quotations separate panels, places the next inspection action nearby, and moves its longer rationale into an optional disclosure. Existing selection and educator-authored interpretation remain intact.

Evidence scope: Playlab public screenshots were visually inspected; IM public page structure and EdLight official tour text were inspected. Authenticated product use and mobile rendering were not verified. Throughline itself was served locally, but local browser access remained disabled; source-only release follows the user's explicit exception. Automated tests and builds do not constitute a visual check.

Role-based rationale is our design inference:

| Panel lens | Design consequence |
| --- | --- |
| Tyler Nakatsu — Senior Director of Digital Products and Strategy | A recognizable product shell separates navigation, the active cycle and the current work. |
| LeAnita Garner — Director of AI-Enabled Instruction, Math | Assessment task, scoring and student reasoning stay connected; the exact quotation remains more prominent than help text. |
| Nia Ladson — Senior Director of AI-Enabled Instruction, ELA | Source material and educator-authored interpretation occupy distinct, readable areas. |
| Antoinette Melvin — Senior Director of Innovation | Repeated surface and selection conventions make each new stage easier to understand. |
| Sandra Jin — Senior Director of AI Strategy | Review and approval remain explicit; preparation, implementation and learning evidence stay separate. |
| Sabrina Ware — Associate Director, Innovation–AI Strategy | Stable cycle, menu and save controls support return to unfinished work. |

The user's typography requirements take precedence over reference branding: IBM Plex Sans, one non-link text color, 36px page headings, 24px section headings and 16px for every other text role. Panel names explain design decisions here; they are not presented as endorsements in the educator interface.

### Guided builder pass

The [Playlab app-creation guide](https://learn.playlab.ai/getstarted/Creating%20a%20Playlab%20App) separates defining an app, writing instructions, optional references, testing/refinement and publishing. The [SchoolAI Space builder guide](https://help.schoolai.com/en/articles/17591237-create-launch-and-share-spaces) describes authoring with a student preview, saving, and a separate launch. These are guided-builder references; we do not claim that their interfaces are identical numbered wizards or that panel members personally use SchoolAI.

Throughline now uses one task navigator across Evidence, Interpret, Plan and Reflect. Desktop buttons and a narrow-screen native selector identify location without awarding completion. Each stage exposes one task and a consistent action row; users can revisit earlier tasks without changing their writing. Plan resumes at missing move details, an incomplete or unchanged starter activity, missing checks, or the whole-plan review. A current approved plan returns to review. Starter text remains permissible after the educator reviews it; visiting tasks or advancing does not certify quality.

The useful payoff is the educator's own inspectable work: a selected evidence set, confirmed focus, assembled meeting kit and recorded next action. It is not a score or a badge. The complete plan review is inline, with section edits returning to it; the draft kit stays a separate preview and cannot grant approval or expose approved downloads. Reflection separates reporting the attempt from recording the next action. Existing save-failure, validation, consent and approval-invalidation rules remain in force.

These choices apply Tyler Nakatsu's product lens and Antoinette Melvin's consistency lens to a shared navigation pattern; LeAnita Garner's and Nia Ladson's instructional lenses to source inspection and authored reasoning; and Sandra Jin's and Sabrina Ware's strategy lenses to clear approval, draft recovery and implementation boundaries. This is our role-based design rationale, not a statement of their preferences or an endorsement.

### Stage checklists

Each main tab now starts with an actionable checklist, replacing its local task strip. The literal reference is [Canvas's Course Setup Checklist](https://community.instructure.com/en/kb/articles/660754-how-do-i-use-the-course-setup-checklist): named preparation tasks link to their work areas, while publication remains a separate action. Playlab and SchoolAI continue to inform optional references, preserved drafts and preview before release. These documented patterns do not establish that every panel member personally uses Canvas, and the checklist is our adaptation rather than a copied product screen.

Evidence lists results, task/scoring, optional class comparison, optional student work and selection review. A check requires the educator's explicit acknowledgment in the corresponding work area; opening a source does not check it. Acknowledgments persist with the cycle, selection edits reopen its selection review, and duplication, reset or revised evidence starts with fresh checks. Existing cycles default to no acknowledgments without changing saved approvals. These are advisory reminders, not new navigation or approval requirements.

Interpretation separates drafted interpretation, considered alternative, drafted focus and explicit confirmation. Plan separates the move/owner, activities, both checks, optional collection arrangements and approval; unchanged activity starters retain a review cue until the educator accepts them in an approved plan. Reflect separates the implementation report, next-action draft, optional next-PLC question and saved recording. Task rows navigate to the work; they do not themselves approve or record it. Checkmarks use precise status labels such as Drafted, Reviewed by you and Recorded, and optional rows do not increase the core-task total. The approved Plan landing keeps its checklist and routes back to the corresponding task.

### Full-flow gap review

This pass compared the actual workflow with the documented professional patterns above. The [IM Grade 4 lesson structure](https://im.kendallhunt.com/k5/teachers/grade-4/unit-2/lesson-4/lesson.html) also separates named, timed activities into launch, student work and synthesis. The consequences below are design judgments; they are not claims about individual interviewers' preferences or measured improvements.

| Gap found | Relevant professional pattern | Change |
| --- | --- | --- |
| First use put a long orientation between the user and the evidence. | Playlab opens into an identifiable task; IM gives a purpose beside the work. | A compact purpose, Start review and optional How it works precede the assessment. The full introduction remains in Guide. |
| On a phone, interpreting required opening a dialog to see any source content; three task buttons consumed vertical space. | Playlab separates reference and editor; EdLight connects student work to instructional decisions. | Keep the current dated quotation, task or counts above the writing. A native Reasoning task selector replaces the stacked buttons on narrow screens. The full reader remains available. |
| Long explanations separated writing from the next action. | IM separates activity directions from supporting preparation. | Keep field-level prompts visible and move extended interpretation/reflection rationale into optional disclosures. Place Record next step directly after the reflection and optional next question. |
| Approval was required before inspecting the actual assembled meeting materials. | Playlab's builder offers testing and refinement before explicit publishing. | Preview all eight draft kit sections before approval, including source packet and participant handout. Missing writing and unchanged starters are identified. Activity edit links return to the relevant editor. Only current approved plans expose kit downloads. |
| The decision record omitted parts of the follow-up and showed a wall of empty sections. | A stable workspace should let a returning educator locate the current work and resume it. | Show the cycle, evidence version, implementation report, owner, collection arrangements and optional access/next-question notes. Consolidate blank sections. Offer stage routes with prerequisite explanations. Explicitly describe this as a current record, not version history. |
| A save failure left unfinished writing with no portable recovery path. | Return to work and output ownership matter for a professional authoring tool. This is an identified Throughline reliability gap, not a claim about a specific competitor's recovery feature. | Download draft copy is available from Menu, the save-failure notice and the reload confirmation. It preserves unfinished writing and selected dated evidence as a plain-text manual reference. It cannot be imported automatically, does not save the browser workspace and never bypasses approved kit export gates. |
| The evidence guide said inspection was optional but the nearby action only offered more inspection. | Guided tools need a clear next action and an escape from optional help. | Add a direct Continue to interpretation route beside the suggested inspection when those suggestions remain. |

The incentive is a useful, inspectable output: selected evidence beside writing, a confirmed focus, an actual meeting kit, and a recorded next action. Opening views and reaching writing minimums do not certify review, quality or learning. No points, streaks or automatic approval were added.

Remaining product gaps are substantive: shared accounts and permissions, collaboration, real curriculum and student-work ingestion, revision history, adjustable meeting length, and linked follow-up evidence. The prototype remains one browser-local fictional math workflow with scripted prompts. Adding interface promises for those capabilities would misrepresent the product; they require a separately scoped implementation. Desktop/mobile rendering, real keyboard interaction and screen-reader behavior also remain unverified while browser access is disabled. Source-only review uses the user's existing explicit exception.

## Consistency across repeated work

Authoring follows the same order in Interpret, Plan activities and checks, and Reflect: write or choose, use the action row, then open optional help. `WorkflowActions` gives each row the same description/status placement and secondary-before-primary DOM order. Desktop places the primary action on the right; narrow screens stack without reversing keyboard order. Callers retain the existing validation, save and approval semantics. Done editing closes an editor; Return to review restores the review the editor came from. Neither approves writing.

Task directions and thinking support use the same closed disclosure treatment, touch target, focus indicator and expanded-content spacing. Plan activity guidance and the meeting-ready handoff now follow this pattern too. Necessary field instructions stay visible.

Interpret and the six-activity Plan outline use labelled native task selectors at the same narrow-screen breakpoint and at 150% reading size. Desktop retains the full navigation. Selection preserves native keyboard focus and the draft; button-driven next/back actions still focus the relevant editor. At 150% text, the inline evidence reference replaces the desktop source pane so source access remains available.

`CollectionSummary` renders the same collector, planned collection and planned review labels and empty states in Plan, review, meeting-ready and Reflect. Both collection edit routes say Edit collection details. Draft-kit return buttons name their actual destination: planning or review. These shared components keep repeated patterns aligned as content changes, without treating planning, approval and classroom implementation as the same event.

## Guided progress and practical incentives

The same references inform the next layer of guidance. Playlab makes building, testing and deliberate publication separate actions; IM connects preparation to usable teaching activities and reflection; EdLight connects work analysis to instructional next steps. Our inference is to make the useful output of each step visible and provide a direct route to the next unfinished part. The sources do not establish that this design increases completion or learning outcomes.

| Stage | Incentive shown to the leader | Guidance and honest feedback |
| --- | --- | --- |
| Evidence | A source packet that keeps the assessment and selected quotations available for writing and the meeting | An optional route through results, task/scoring, classes and student work. The count labels places opened during this visit, not sources reviewed. Selecting work is optional; direct interpretation stays available. |
| Interpret | One confirmed focus that can shape the teaching move and meeting | Draft interpretation, consideration of an alternative, and draft focus are visible as separate parts. Next opens the unfinished part. Confirmation remains an explicit educator decision. |
| Plan | A reviewed agenda, source packet and participant activity | Teaching move/owner, authored activity directions and the two checks have direct edit routes. Starter activity text is not counted as newly authored work. Retaining suitable starter text remains allowed at review. Approval makes the kit available. |
| Reflect | A decision the next PLC can reopen alongside the original plan | Report implementation, write a supported next action, and explicitly record it. Used, partly used and not yet used receive equal progress credit. The recorded state offers a direct link to Decisions. |

The shared guide is compact and its full step list stays collapsed until requested. Draft progress is derived from current state; it does not change approval rules, write sample answers or introduce another persistence schema. Evidence navigation history is local to a visit and resets when the evidence version or cycle changes. Edits and invalidated approvals are reflected immediately. Counts acknowledge input presence, never reasoning quality, mastery or student improvement. Save status remains the authority for persistence; the guide does not announce success on each keystroke.

These are practical incentives and return paths, without points, rankings, streaks or new mandatory gates. The panel rationale is unchanged: Tyler and Sabrina's product/operational lenses inform predictable next actions; LeAnita and Nia's instructional lenses keep evidence and judgment separate; Antoinette and Sandra's innovation/strategy lenses inform explicit review and the classroom-to-reflection handoff.

Verification for this guidance pass: 360 tests across 15 files pass, including six regressions for optional source navigation, explicit confirmation, retained starter text, valid non-implementation reports, edited reflections and unsaved recorded states. The production build succeeds. The local server serves the new guide and workspace modules; source review checked next-action routing and existing focus handlers. Browser rendering and interactions remain unverified under the user's source-only exception.

## Decision principles

| Decision | Alternative considered | Reason |
| --- | --- | --- |
| Leader-authored interpretation before acknowledging a scripted question | An AI-authored diagnosis | Preserves the brief's “do with, never do for” instruction |
| Two comparable measures with inspectable work and class detail | An exhaustive dashboard | Supports the 20-minute preparation target while retaining source inspection |
| Dates, scope and evidence version travel with the plan | A single undifferentiated evidence feed | Quarterly observations cannot become current proof when daily results change |
| One concrete teaching move with separate implementation and learning checks | A single achievement indicator | Makes the action testable without conflating implementation and student outcomes |
| Complete draft preview, ownership confirmation and reapproval after edits | Approval without a consolidated review | Makes the decision being approved inspectable |
| A durable meeting-ready state before reflection | Sending a leader directly to reflection on approval | Separates preparing materials from trying the teaching move and observing what happened |
| A short task question with optional help and an educator self-check | More mandatory guidance or automatic readiness scores | Supports a decision without adding another completion exercise or claiming instructional quality |
| An explicit unavailable-evidence state in Reflect | Example results presented alongside the active plan | Prevents invented follow-up from becoming evidence for a leader's action |
| One grade in the pilot | Full multi-grade analysis | Keeps the complete instructional cycle narrow enough to test |

## Evidence amount and provenance

The October 28 fixture contains 120 responses: 89 correct fraction selections and 46 adequate explanations. They are separate aggregate scores, not linked student-level records. Two student responses illustrate possible reasoning without establishing prevalence. The learning goal, original fraction prompt and scoring criteria are explicit prototype assumptions; they were not supplied district curriculum.

The Evidence workspace starts with the aggregate comparison and original work. The compact view design gives each view one question to answer while keeping the assessment date, response coverage and class scope in a shared frame:

| View | Main information | Detail available without adding another dashboard |
| --- | --- | --- |
| Results | Two directly labeled bars for correct fraction and adequate explanation, with exact count/denominator and percentage to one decimal place | A brief comparison prompt and a visible reminder that the totals do not identify which students met both criteria |
| By class | A semantic three-column table: class and the two separate measures; stable A–D order | Each measure includes its own exact denominator and a bar on the same 0–100% scale, so differing response totals remain interpretable |
| Task & sources | The exact student-facing prompt and two concise scoring definitions | Full scoring rubric, lesson context and source provenance in native disclosures that begin collapsed |

Repeated-task and missing-response cautions stay above the view content rather than disappearing into a source disclosure. Original sample quotations and selection controls remain alongside the views. A response's letter is not a link to a class with the same letter. Differences between aggregate scores are not counts of particular students, and class comparisons do not rank teachers or explain causes. Percentages are display calculations, not new evidence.

This plan aims to reduce repeated reading while preserving substantive interpretation. Leading Educators' [AI principles](https://leadingeducators.org/ai-at-le/) emphasize teacher-led judgment and intellectual engagement, while its [mathematics approach](https://leadingeducators.org/mathematics/) connects conceptual understanding, student-work routines and instructional improvement. The design inference is to make the task, criteria and work easier to inspect rather than supply a diagnosis. These sources do not establish that this layout improves educator performance or represent an endorsement.

The class table retains row/column headers and a caption following [W3C/WAI's table guidance](https://www.w3.org/WAI/tutorials/tables/). Supplemental detail uses native show/hide controls; [WAI's disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) informs the need for a clear control, visible state and keyboard operation. These are implementation principles, not completed accessibility verification. Browser use remains disabled, so visual density, responsive layout, keyboard flow and assistive-technology behavior still need hands-on checks. Faster comprehension and lower reading burden remain hypotheses to test with leaders.

Interpret keeps one source beside writing; Plan provides the confirmed focus and source packet through **View focus & sources**. Suggested diagnoses do not precede the original student responses.

The September 9 observation covers one classroom. Its date and caution remain visible even when its quotation is collapsed. Selecting it adds historical context; it does not establish current teaching practice across the grade.

## Fresh and stale sources

A cycle uses a fixed dated evidence version. **Guide → About this demo → Presenter tools → Simulate new results** exposes a fictional October 29 collection for comparison. The leader can keep the current snapshot or create a revised draft. The original cycle and approvals survive. A revision retains authored writing for reconsideration, resets selected student work because the samples differ, and clears approvals and recorded follow-up.

The newer collection has 116 of 120 expected responses, with four students absent, and repeats the same task and rubric. The coverage and practice-effect limits remain explicit in the source packet. Newer results do not turn the September observation into current evidence. This is a demonstration of update handling, with no live integration.

## Educator ownership and instructional work

Interpretation follows three local steps: Notice, Test an alternative and Choose a focus. At the scripted alternative, **Revise interpretation** returns to earlier writing, **Inspect source** opens the evidence reader, and **Keep interpretation & explain uncertainty** records consideration and advances only after a successful save. The focus prompt asks for the evidence, the alternative and what would make the leader reconsider. Editing the interpretation or changing the question angle revokes consideration through the existing model. The educator still writes and confirms the focus; choosing Keep does not validate the interpretation.

Each stage places one short question by the current task. **Help me think this through** opens additional prompts and a **Self-check** in a native disclosure. These are questions for the educator, not scores or prerequisites. Evidence asks which pattern merits discussion. Notice separates observation from explanation; the alternative step makes revising, inspecting or keeping explicit; the focus step asks what would change the decision. Plan puts a facilitator check beside the single selected activity. Reflect adapts its question to the implementation report and asks for an actionable next check. Optional help never changes authored content or approval state.

Plan begins by asking what the teacher will do differently and what thinking students will do. The six fixed activities total 50 minutes. Selecting an outline item opens its facilitation directions rather than presenting six large editors simultaneously. The local guidance question changes with that activity; its facilitator self-check asks whether a colleague could tell what participants will do, which evidence they will use and what they will leave with. Activity 4 includes optional prepare/rehearse/feedback/revise support grounded in the selected work and fraction rubric, plus access/participation notes. The support does not fill the agenda or certify instructional quality.

Implementation and student-learning checks remain separate: an observable teaching record is different from student work that reveals reasoning. Optional collector and dates live with the learning check. Missing arrangements remain visible in the summary, review and ready screen; leaving them empty does not block approval. Incomplete date drafts can save, while nonempty dates must be valid and review cannot precede collection when approving. Planned commitments do not establish that teaching, collection or review occurred or schedule a reminder.

**Review meeting plan** gathers the confirmed focus, teaching move, six activities, checks, selected sources and optional commitments into one preview. Edit controls return to the relevant authoring area. The ownership checkbox and approval action stay in that review. Edits retain the existing invalidation rules; they do not silently reuse an earlier approval.

Successful plan confirmation stores Plan as the current stage (`step: 2`) and shows **Your meeting is ready**. This handoff is derived from the saved approval and stage, so reload restores it. Its primary action opens the meeting kit; after the meeting and lesson, **Go to reflection** is a separate choice. Approval does not imply that instruction happened. Confirmation state is adopted only after persistence succeeds: a failed focus confirmation, plan approval or reflection recording keeps the previous draft available and reports failure. Retrying ordinary draft persistence does not itself confirm a decision.

**Edit collection details** on the ready screen and **Update collection plan** in Reflect route back to Plan with the learning check open and collector field focused. Opening an editor alone preserves the approval. Changing a commitment invalidates plan approval and recorded reflection while retaining their text; the leader reviews and approves the revised plan, then explicitly returns to Reflect. This closes a navigation gap without manufacturing a new dataset or linked cycle.

## Reflection and worked cases

Reflect displays the agreed teaching move and asks whether it was used as planned, partially used or not yet used. These are leader reports. When it was not tried, the prompt asks about the barrier and next opportunity; partial use asks what differed; reported use still requires comparable learning evidence. The active cycle has no collected follow-up dataset, and the interface says so. **Review what to collect** exposes checks, unset arrangements and the route to edit them. The main writing task asks for a supported conclusion or uncertainty plus the next action, owner and review point. These are authoring prompts, not semantic validation of the answer. An optional next-PLC question stays part of the recorded reflection rather than automatically starting a linked cycle.

Worked examples are separate from this cycle. **Reflect → Explore a worked example** and **Guide → Explore worked examples** open a dialog with two cases. Documented follow-up includes a specific routine, implementation records, dated tasks, shared scoring criteria, matched coverage and a qualified keep/revise decision. Missing evidence uses the fixed 46/120 → 56/120 illustration to demonstrate withholding judgment when task, date, scoring, cohort, coverage and implementation evidence are unknown. Neither case is a forecast or a result attached to the active plan.

Saving a reflection records the educator's text and self-reported implementation. A text export includes that reflection only while current, with explicit no-dataset and planned-check limits. It does not append the unrelated example as the cycle's outcome. Editing reflection/status removes the recorded follow-up from export until recorded again; upstream edits retain existing reapproval requirements.

## Meeting materials

From **Your meeting is ready → Open meeting kit**, Throughline assembles six presentation sections, a selected-source packet and an evidence-to-action participant handout. Directions, focus, action and checks come from the exact approved plan. Fixed discussion prompts and worksheet labels provide structure. This is deterministic document assembly, not AI authorship. Plan also offers a clearly marked draft preview through the same assembly before approval. Approved kit access and downloads remain gated on a current approval; the ready component also checks that approval before offering materials.

Activity 2 and Activity 4 directions carry into the handout. The self-contained HTML works offline and supports printing or saving as PDF through the browser. Exports are snapshots. The HTML meeting kit remains the initial meeting materials; the text export can also carry a current recorded reflection. Plan edits revoke approved kit access and downloads until reapproval; draft preview remains available. The separate draft recovery copy preserves unfinished work as a manual reference, without approval signatures or automatic import. Existing saved plans and the versioned local database remain compatible.

## Typography, access and learning

At standard reading size, the hierarchy is 36px page titles, 24px section headings and 16px for all other text, including task labels, inputs, metadata and instructions. All non-link text uses #242424. Spacing, restrained borders and distinct working compositions separate source context from authoring. Self-hosted IBM Plex Sans avoids external font requests. Reading preferences provide 100/125/150% text and expanded spacing independently of cycle decisions.

Native controls, stage-lock explanations, field-specific errors, focus movement into revealed editors and modal source readers support navigation. These are implementation choices, not a claim of accessibility certification. Browser testing is unavailable because browser use is disabled in the app settings; rendered layout, actual keyboard behavior and assistive-technology coverage still require hands-on verification.

Optional interpretation prompts ask about strengths, task access, language and missing perspectives. An educator-authored access/participation plan travels into approved materials. No identity or subgroup result is inferred from a sample response, and no score certifies equity.

Guide offers a replayable walkthrough, three authored practice cases with feedback, a glossary and worked examples. Learning metadata is browser-local and separate from instructional approvals. Reviewed or attempted topics indicate engagement, not proficiency. Learning support never fills or approves the leader's plan.

## Research and validation

Public work from [Leading Educators' MathAI Impact Network](https://leadingeducators.org/partnership/mathai-impact-network/), [instructional decision-making guidance](https://leadingeducators.org/blog/strengthening-instructional-decision-making-and-practice-for-the-age-of-ai/) and [rural educator co-design](https://leadingeducators.org/blog/how-rural-educators-are-co-designing-the-future-of-ai-in-learning/) informed design hypotheses. W3C/WAI, CAST and professional-learning research provide complementary principles. These are design inferences, not endorsements or a feature list approved by Leading Educators. Source matrices remain in `accessibility-equity/` and `onboarding/`.

The pilot targets a single-grade math PLC leader preparing within 20 minutes for a 50-minute meeting. That target has not been validated. Evaluate total workload, evidence traceability, the leader's ability to explain the conclusion, whether the strategy was tried and whether comparable work supports the next decision. Completion counts and attractive screens cannot establish ownership or instructional quality.

**Guide → About this demo → How we would test this** contains a proposed small formative comparison with the current workflow, independent mathematics review, manual workload observations, implementation follow-up and adopt/revise/stop criteria. The printable proposal has no collected findings or telemetry. Historical review records describe their own checkpoints; the current verification record should be used for this implementation's checks and limits.

[Guidance verification](GUIDANCE_VERIFICATION.md) describes the code-derived workflow, the remaining browser checks and a small proposed leader trial for this guidance pass. It does not report observed educator behavior or demonstrate the 20-minute target.

## Deferred scope

Multi-grade comparisons, configurable meeting duration, lesson-planning-first workflows, real curriculum and student-record integrations, production security, live AI, routine libraries and linked evidence cycles remain deferred. Privacy, permissions, evidence validity, multilingual support, individual accommodations and accessibility require district co-design and validation.
