# Independent onboarding plan review

Reviewer: /root/learning_reviewer. Date: 2026-10-31. This is an actual review of ignored research/planning drafts before the phase-two engine packet exists. It does not claim source admission, implementation execution or final acceptance. No application or tracked files were changed.

## Verdict

No blocking conceptual or scope issue. The plan is a defensible response to the brief's varied data/AI comfort and educator-ownership requirements. It teaches both the navigation and a few consequential reasoning distinctions while keeping approval under the leader's control. It avoids presenting a short tutorial as validated professional development or a proficiency assessment.

I read the full onboarding research matrix, the root plan, all five planning drafts, current product decisions, model gates and ReadingSettings implementation. I independently verified the strongest external claims in [LE's May 2026 professional-learning article](https://leadingeducators.org/blog/putting-the-professional-back-in-educator-pd/) (teacher-owned evidence, focused priorities, rehearsal and feedback), [LE's February 2026 MathAI article](https://leadingeducators.org/blog/when-ai-meets-high-quality-professional-learning/) (support for existing routines, discourse practice/feedback and coaching preparation), and [WAI clear instructions guidance](https://www.w3.org/WAI/WCAG2/supplemental/patterns/o4p07-step-instructions/) (concise contextual steps and examples). These support the proposed mechanisms, not an LE-approved feature specification or proof of app impact.

## Align before exact-byte admission

1. C1 should prohibit implicit cycle navigation. The proposed explicit Open this planning stage control is appropriate if it uses existing gates; merely viewing a later lesson must not navigate or unlock anything.
2. The test design says confirmed tutorial reset, whereas the research/API require replay/restart rather than erasing history. Replay may return to lesson one without clearing reviewed metadata. If a distinct reset is implemented, its scope must be only learning metadata. Do not add a destructive control just to satisfy accidental plan wording.
3. Root's earlier draft mentions an access-support quiz; the final research and five formal drafts correctly specify aggregate overlap, historical observation and two checks. Use those final topics; access remains in the walkthrough and phase-one prompts.

## Required acceptance details

- Help with this step opens the current planning step; Resume opens the saved tutorial position. Test them separately.
- A lesson view, review marker or practice submission cannot confirm focus, approve a plan or record a reflection. Explicit permitted navigation may change only the normal stage position, not decisions or approvals.
- Opening/closing Guide and revisiting lessons must leave the current cycle's text, evidence selection and approval signatures unchanged. A progress reset, if present, must not touch cycle or reading-setting keys.
- Every option needs its own explanatory feedback. Changing an answer or switching scenarios must clear stale feedback. An attempted/reviewed label is truthful; a proficiency score or certified badge is not supported.
- The 43-response subtraction in the aggregate example is not an exact identified subgroup. Feedback should explain missing overlap rather than claiming the two aggregate counts reveal individual students' performance.
- Historical-observation feedback must identify both the date and one-class scope. Learning-check feedback should address comparability of task, scoring, cohort/coverage and implementation, not just a higher later count.
- The stable learning controller must preserve session-only progress through Guide close/reopen and cycle switches. Unsupported/corrupt storage remains untouched even after a later learning action; failures cannot stop planning from opening.
- Native dialog focus return, section-change focus, radio/feedback keyboard paths and 320px with 150% plus spacious settings require actual browser observation. No claim of full screen-reader, native zoom, forced-color or learning-outcome validation follows from DOM tests.

The API split is suitable: pure content/progress helpers in learning.ts, a stable useLearningProgress controller at App, and a dialog that receives currentStep/canEnter/onNavigate without direct access to approval actions. Source and browser verification remain pending after implementation.

## Draft hashes at review time
- criteria.md: c0e910296182191462b3d4abb460b4b3360b9a690834ba46706a7adf913bcdf9
- design.md: a8bc0b6982430e88e1384ed710af1957860d34a8944aecf324f05fd5d6752b39
- plan.md: 17167676ea841b80a64272fdc6f4416bb9f57f934f2257759a29284869037917
- scope.md: 08104af1c56858d1f84ddf9737a11dd15dae1a8f202f9bb9c17adc7ad738f720
- test-design.md: 8254ad0d9102c6c75b824b761f8638f1b8cc784f56d686a2216607fa4b7aa6b8

## Corrected-draft check

After the host's correction message, I reread criteria.md and test-design.md. The two identified wording mismatches are resolved: explicit navigation is allowed only through existing gates, and replay from the first lesson preserves reviewed history. A separate history reset is conditional, not a required new UI. The corrected five drafts are accepted as a planning concept with the acceptance details above. This verdict remains a prepacket review, not an assertion that an engine packet has already run.

Corrected exact hashes:
- criteria.md: c0e910296182191462b3d4abb460b4b3360b9a690834ba46706a7adf913bcdf9
- design.md: a8bc0b6982430e88e1384ed710af1957860d34a8944aecf324f05fd5d6752b39
- plan.md: 17167676ea841b80a64272fdc6f4416bb9f57f934f2257759a29284869037917
- scope.md: 08104af1c56858d1f84ddf9737a11dd15dae1a8f202f9bb9c17adc7ad738f720
- test-design.md: 8254ad0d9102c6c75b824b761f8638f1b8cc784f56d686a2216607fa4b7aa6b8

## Formal planning reconciliation and acceptance

After phase-one release, I read the actual revision-22 planning-check packet assigned to /root/learning_reviewer. I checked the five public planning files against the corrected draft hashes above; all are identical. The independent conceptual/source review therefore applies to the admitted exact bytes without a second speculative review. Scope is the active formal planning-check judgment; criteria, design, plan and test-design are four related artifact judgments from this actual check, not claims that future packet executions already occurred.

Accepted: scope 08104af1c56858d1f84ddf9737a11dd15dae1a8f202f9bb9c17adc7ad738f720; criteria c0e910296182191462b3d4abb460b4b3360b9a690834ba46706a7adf913bcdf9; design a8bc0b6982430e88e1384ed710af1957860d34a8944aecf324f05fd5d6752b39; plan 17167676ea841b80a64272fdc6f4416bb9f57f934f2257759a29284869037917; test-design 8254ad0d9102c6c75b824b761f8638f1b8cc784f56d686a2216607fa4b7aa6b8.

No unresolved planning blocker. Implementation, source/browser verification and delivery remain subsequent work; no new research or application changes were performed for this reconciliation.
