# Core-decisions verification

This is the earlier core-decisions checkpoint. The subsequent stage redesign and its current verification limits are recorded in [Four focused workspaces](FOCUSED_WORKSPACES_VERIFICATION.md).

## Story and boundaries

The leader inspects a bounded set of sources, keeps evidence visible while writing a decision, chooses whether new results justify a revised plan, and examines what adequate follow-up evidence would support. This local prototype uses React → planning reducer → versioned localStorage repository → resolved source snapshot → on-screen context and exported meeting materials. No API, live AI or incoming student records are involved.

## Checked

- The application suite passed 267 tests across eight files after integration. It covers legacy approval compatibility, evidence-version invalidation, notification actions that preserve approval, preserved original cycles, new-draft creation, conflicts/write failures/capacity limits, fixture totals, worked-example consistency and version-correct exports.
- A production build passed TypeScript compilation and Vite bundling.
- Independent static review found and prompted fixes for save errors hidden inside the update dialog and an incorrect follow-up denominator when resolving newer evidence. A regression assertion keeps the separate incomplete case at 56/120 even in an October 29 cycle.
- Compact evidence closes without stealing focus when the leader returns to the draft. Escape/close returns to the evidence toggle; the source view has no modal focus trap. Responsive sizing and reading-size rules received code review.

## Not yet verified

The browser tool reported “Local browser use is disabled in Work settings.” No alternate browser automation was used. The current rendered layout, keyboard behavior and a timed task have therefore not been observed. Automated tests do not establish usability, accessibility conformance, educator ownership or instructional effectiveness.

## Timed educator walkthrough — procedure, not results

Give a leader a fresh fictional cycle and 20 minutes. Do not prefill their interpretation or coach their conclusion. Observe whether they inspect a count and student response, consider an alternative, choose one concrete teaching move and prepare usable meeting directions with implementation and learning checks. Record preparation time, help needed, source switching, lost position and unfinished work.

After the preparation window, ask them to explain the decision without reading the app: which specific evidence supports it, what alternative remains plausible, what teachers will change, and what next evidence would make them keep or revise the move. Record their actual explanation rather than inferring ownership from completed fields.

Then demonstrate the fictional update separately so it does not distort preparation timing. Ask them to compare October 28 with October 29, explain response coverage and repeated-task limits, keep or revise intentionally, and recover the original approved cycle. Inspect both exports for the correct evidence dates and denominators.

Finally, compare the incomplete-evidence illustration with the complete worked case. Ask what conclusion each permits and why implementation records and matched work matter. Treat observed difficulty as input for revision; no participant results have been collected.
