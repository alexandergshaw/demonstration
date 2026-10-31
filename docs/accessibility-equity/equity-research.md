# Accessibility and equity research: Leading Educators

Research date: October 31, 2026. Discovery review of public primary sources and the current Throughline implementation. This document is a product hypothesis, not a specification supplied or endorsed by Leading Educators (LE). It separates published positions from the implementation choices inferred from them. Learning and onboarding research belongs to the subsequent phase.

## What the sources support

| Source | Published position, paraphrased | Product implication (our inference) |
| --- | --- | --- |
| [LE: AI Strategy & Support](https://leadingeducators.org/ai-at-le/) | AI should strengthen core instruction, cognitive engagement and educator leadership. The page identifies opportunity gaps and uneven access to strong instruction as concerns. | Preserve educator authorship and explicit approval. Support analysis of access barriers without generating diagnoses or reducing the intellectual demand of the task. |
| [LE: Resource Strands](https://leadingeducators.org/resources-2/) | Equity involves examining policies and outcomes across differences, responding to unequal needs, and sharing voice and power with students, families and communities. The framework also emphasizes protected collaboration time and limited instructional priorities. | Offer a focused reflection on whose evidence and perspectives are absent, and one practical participation commitment. Avoid adding a long compliance questionnaire to every cycle. |
| [LE: Knowledge & Beliefs](https://leadingeducators.org/results/knowledge-beliefs/) | Teacher expectations influence task selection. LE describes risks from implicit bias, lowered expectations and withholding complex work until basic skills are mastered. Grade-appropriate challenge can be supported with scaffolds. | Prompt leaders to identify demonstrated strengths and barriers in task conditions, language, response modes or instructional opportunity. Ask how supports will retain the same learning goal. Do not label students by presumed ability. |
| [LE: Three Ways We're Thinking About the Value of AI in K–12 Education](https://leadingeducators.org/blog/three-ways-were-thinking-about-the-value-of-ai-in-k-12-education/) (March 4, 2026) | LE distinguishes time savings, stronger learning and expanded possibilities. Its examples emphasize educators diagnosing a specific barrier and selecting a support that strengthens sense-making without lowering rigor. | Tie the new access plan to the existing teaching action and evidence. Make supports educator choices rather than a tool-generated strategy imposed on every classroom. |
| [LE: Value Add of Technology on Teaching](https://leadingeducators.org/vatt/) | The current second edition centers instructional quality, student thinking and educator judgment. It warns that features without connections to teachers' responsibilities can add burden. | Implement small, usable improvements inside the existing planning flow. Evaluate whether they improve decisions and participation rather than reporting a feature count as impact. |
| [LE: Value Add of Technology for Leadership](https://leadingeducators.org/vatl/) | The living leadership framework addresses governance and ethics, people and capacity, and infrastructure and resources. It explicitly names privacy, security and identity protections, transparency and accountability. | Keep the fictional/local prototype boundary visible. Explain that local browser storage is not a secure student-record system. Do not request names, diagnoses, demographic profiles or other sensitive records to use the equity feature. |
| [LE: AI-Powered Math Pilot](https://leadingeducators.org/news/leading-educators-launches-ai-powered-math-pilot/) (February 16, 2026) | The pilot embeds supports in curriculum-specific professional learning and positions educators as co-designers. LE describes the aim as strengthening coherent instruction without increasing burden or disrupting priorities. | Integrate the access commitment with the current math goal, agenda, approval and meeting materials. Keep it optional for the prototype and test it with leaders before making it an approval requirement. |
| [LE: Rural Educators Co-Designing AI in Learning](https://leadingeducators.org/blog/how-rural-educators-are-co-designing-the-future-of-ai-in-learning/) (December 9, 2025) | The account describes locally defined problems, root-cause analysis, focused hypotheses, testing and reflection. Teams consider the full range of student strengths and needs; teacher and district participation matters. | Provide questions, a space to record a local response and a route to revisit it. Treat local context as something educators must establish, not something the demo can infer from aggregate scores. |
| [LE: Generative Practice](https://leadingeducators.org/generative-practice/) | The public report overview describes educators using AI for time savings, differentiation, student thinking and reflection, supported by collaboration and system conditions. | Preserve the complete evidence-to-action-to-reflection cycle. A saved access plan should remain visible when evaluating the next evidence, with no claim that the plan caused a result. |
| [CAST: UDL Guidelines 3.0](https://udlguidelines.cast.org/) (2024) | CAST organizes guidance around engagement, representation, and action/expression. It includes choice, accessible tools, multiple communication modes, attention to bias and learner agency. | Improve access to the workbook itself while helping the leader plan more than one way to participate and express understanding. UDL is a design framework, not a diagnosis or a substitute for individual accommodations. |
| [CAST: Languages and Dialects, consideration 2.3](https://udlguidelines.cast.org/representation/language-symbols/languages-dialects/) | CAST values languages and dialects and recommends understandable vocabulary, multiple representations and access to key information in relevant languages. | Prompt leaders to consider language access in materials and discussion. Do not add a language selector that only translates a few labels, or claim an unreviewed automatic translation is instructionally equivalent. |
| [WIDA: Supporting Multilingual Learners With Disabilities](https://wida.wisc.edu/teach/disabilities) | WIDA emphasizes student assets, collaboration with families and specialists, and planning for language development alongside accessibility. Its guidance describes scaffolding that keeps learning accessible and challenging. | Avoid treating language development and disability as interchangeable explanations for scores. Ask what evidence and collaboration are needed, while recording only fictional or non-identifying planning notes in this prototype. |

These are public organizational and instructional positions. None of the reviewed LE pages supplies a Throughline feature list, a formal accessibility procurement standard, an approved translation specification, or an endorsement of this app. Technical accessibility acceptance criteria are documented in the separate standards/audit work for this phase.

## Current product evidence

The current app already provides a valuable foundation: educator-written interpretation and focus, an explicit scripted-prompt disclosure, confirmation before meeting materials, accessible native dialogs, a source reader, text exports, and safeguards against treating class counts as teacher effectiveness. The fictional initial task permits words or a drawing. The follow-up disclosure identifies missing dates, scoring, cohort and coverage.

The main equity gap is a missing connection between this careful interpretation and an actionable access/participation commitment. `Meeting` currently records an action, owner, implementation check and learning check, but offers no dedicated place for the leader's decisions about participation. `buildMeetingKit` carries the action into presentation sections and the participant handout, but cannot carry an access decision that was never recorded. Interpretation also lacks a compact prompt to consider strengths, student voice, language and access before attributing the pattern to students.

The reference fixture supplies no demographic categories, disability information, home languages, student roster, representative sample or participation records. Class A–D cannot stand in for any of those categories. Any demographic comparison, diagnosis or claim of equitable outcomes would be invented.

## Prioritized implementation plan

1. **Add an educator-authored access and participation plan.** Add one optional multiline `accessParticipation` field to the meeting plan, with an explicit optional label. Keep the wording factual and practical: “How will you keep the learning goal challenging, make participation accessible, and include perspectives you have not heard?” A blank field is not an equity failure; the app must not score or certify equity. A completed field becomes part of the approved plan, the relevant meeting section, the activity handout, the text export and the follow-up review.
2. **Offer a compact equity reflection scaffold beside interpretation.** Use an optional disclosure containing four questions: what strengths are visible; what task, language or response conditions may hide understanding; whose work or perspective is absent; and what evidence would test the explanation. Explicitly state that the demo cannot determine identities, needs or causes from these samples. The questions must not fill interpretation or focus automatically.
3. **Make participation actionable in the meeting materials.** Include the leader's own access plan and a neutral participant note space. Examples such as private thinking time, spoken/written/drawn contributions, reviewed language supports and a way to pass or contribute later are options to consider, not inferred needs or mandated interventions. Keep the initial fraction-equivalence goal and scoring purpose visible.
4. **Strengthen access to the workbook itself.** Apply the technical accessibility audit's findings, preserving keyboard access, readable focus, semantic labels, equivalent text for visual evidence, reflow and user preferences. Provide clear help about the available controls and honest testing limits. Improving interface accessibility is separate from evaluating the equity of a classroom plan.
5. **Preserve privacy and portability.** Remind users to use fictional or non-identifying notes. Local storage stays local to this browser and may be lost or visible to other device users; it is not authentication, encryption or district-approved storage. Keep approved text/HTML exports usable without external services. Do not add analytics, student uploads or automatic translation providers.

## Suggested interface language

**Disclosure title:** “Check access, strengths & voice”

- “What understanding or strategy is already visible in this work?”
- “Could task wording, language, format, or opportunities to respond be hiding understanding?”
- “Whose work or perspective is missing? What would you ask students, families, or colleagues before deciding?”
- “How could you keep the same learning goal while offering more than one way to participate or explain?”

**Evidence boundary:** “These fictional samples contain no demographic, language, disability, or participation records. Treat these as questions to investigate, not conclusions about students.”

**Field label:** “Access & participation plan (optional)”

**Field hint:** “Keep the learning goal challenging. Name a participation or language support, the strengths it builds on, and what you still need to learn. Use fictional or non-identifying notes.”

**Placeholder:** “We will make room for… while keeping… We still need to ask or check…”

No model answer is inserted. No green “equitable” badge appears after typing. Existing educator decisions remain the authority.

## Compatibility and verification requirements

- Older saved cycles lacking `accessParticipation` must read as an empty optional value. Absence must not invalidate the database, delete a cycle, or silently discard its text.
- Preserve existing approvals when the added field is absent or empty: keep the previous approval signature for that case. Add the field to the signature when nonempty. Editing or clearing a recorded access plan must revoke plan and reflection approval through the existing reducer behavior.
- Parse type and length strictly when the field is present. Do not change the immutable reference fixture or seed schema for editorial prompts.
- Verify that new text survives save, reload, cycle switching and duplication; exports include only the current approved value. Export HTML must escape arbitrary educator input.
- Verify that optional blank input still permits the existing complete workflow and that a legacy approved plan remains approved after restoration.
- Confirm that source, count and observation caveats remain intact. An access plan is a proposed teaching/facilitation decision, not evidence that participation improved.
- In later district research, include educators using assistive technology, multilingual educators, classroom teachers, coaches and leaders with different data comfort. Evaluate completion, ability to explain decisions, participation barriers and whether prompts increase useful reflection or simply add burden. These studies have not been performed.

## Explicit deferrals

Demographic dashboards, inferred accommodations, identity-based recommendations, real student imports, automated translation, speech capture, universal equity scoring and claims of legal/accessibility certification are outside this implementation. They require data permissions, co-design, expert review and validation unavailable in this fictional local-storage prototype. Full multilingual product localization and individual assistive-technology validation should be researched with actual users rather than represented as completed by a label toggle.
