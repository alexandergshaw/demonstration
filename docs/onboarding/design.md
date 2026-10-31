# Design

Keep content and pure progress parsing/updating in learning.ts; LearningGuide renders hub/walkthrough/practice/glossary/About with native modal semantics and explicit section focus. A stable learning controller preserves session-only progress across closing or cycle switching. Persist only metadata under its own key; unsupported records are not silently replaced.

Root integrates a fixed Guide entry, optional invitation and Help with this step without changing cycle reducers or approval APIs. Tutorial lesson selection changes only the tutorial; any separate, explicit Open this planning stage action uses the existing stage gates. Practice feedback is choice-specific and resets correctly; no score or model answer populates a plan. Retain existing assumptions and presenter tools in About, with confirmation for any existing database reset. Reuse the accessible typography/preferences and protect the phase-one work.
