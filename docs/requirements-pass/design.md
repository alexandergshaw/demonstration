# Repair design

Keep the persisted model and repository shape. Add immutable fictional lessonContext.ts data for task, expected understanding, explanation criteria and annotated example. Existing evidence totals and quotes remain authoritative fixtures; describe the new context as constructed prototype context, not recovered district evidence.

EvidenceInspector.tsx reuses selected evidence and reference data. Keep a short selected quote excerpt near the interpretation field; a full source reader exposes complete content, class breakdown, task and rubric during interpretation and planning. Use semantic labels, native disclosure/dialog behavior, an explicit close control and focus restoration. Opening sources does not dispatch a stage change or replace the draft.

Reuse the six agenda fields as editable activity/facilitation directions. Do not rewrite existing saved cycles. Only the fresh-cycle default becomes strategy-neutral. meetingMaterials.ts builds an approved-plan-derived structured/HTML artifact using exact state and source selections; centralize HTML escaping and enforce the public current-approval guard. MeetingKit.tsx renders a readable participant presentation/print view with an educator-owned label, source sections, timed directions and checks. React and standalone HTML remain safe for untrusted authored text. No provider call, dependency or persistence field is needed.

Guide and repository presenter/product docs explain the chosen novice-friendly PLC audience, assumptions and preparation-versus-meeting timing. The kit formats and carries educator decisions rather than silently generating a teaching strategy. Source changes stay within the explicit grant; final gates bind the frozen candidate before root commits, pushes and deploys it.
