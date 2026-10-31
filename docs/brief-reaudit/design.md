# Design

Keep fictional follow-up disclosure outside persisted ReferenceData in lessonContext. Reuse existing details/context presentation. Do not invent follow-up metadata: explicitly disclose no collection date/task, no verified rubric, no matched cohort/expected coverage or missingness, and no observed implementation artifact. The fixed 56/120 illustration is independent of the chosen action and implementation status. Original task/rubric remain available as the baseline only.

Shared followUpSourceBlocks(reference) serves screen and text output. meetingMaterials appends it to the text cycle record only when existing hasReflection(state) is true; current-plan export guard remains authoritative. The HTML/preview meeting kit stays preimplementation with no future-result appendix. Preserve the existing escaping renderer. Update presenter/product documentation to distinguish the meeting kit from the text cycle record. No model or persistence changes are necessary.
