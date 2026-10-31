# Throughline: adversarial visual audit and professional comparisons

Author: `/root/visual_adversary`. Date: October 31, 2026. Report assignment: `visual-audit-author`, packet revision 3. This report records actual read-only research and baseline inspection performed before the report-writing grant; it does not claim those observations occurred after admission. The only file written is this report. No application source, user data, deployment, or test was changed.

## Evidence and comparison limits

Baseline: `.agnostic-loop/deployment/hosted-preview.jpg`, SHA-256 `b487cd16587c793770594332ea99d09211cb0c565d0aa803308619ff7194f5fe`, inspected visually. It is a 1234 by 712 capture of the deployed evidence screen. Source inspected: `src/App.tsx` (`bcb96e3a70669a3da86a737d704cb1a368ad8eeb2dfa82ee05b0714ac218c593`), `src/styles.css` (`e3f65a51693c309e6230fbb727e7cb6c28589de059deb65fbe75532ab9cae687`), and `src/components/CycleManager.tsx` (`5c529cffaa2de088a362073bb5aa4ef9e089697e31d01adfcb276e3bea647069`).

I inspected public product imagery linked from the official pages below in a dedicated browser tab. These are published illustrations/screenshots, not a login or usability test of the vendors' current authenticated applications. Comparison judgments are my design inferences from that imagery. No full feature-parity claim is made.

- [Linear planning](https://linear.app/plan): its project-overview image uses one dominant title, compact rows for project properties and resources, and little surrounding card decoration. Context sits beside work. The useful lesson is a legible title-to-metadata hierarchy and low-friction access to related information, not adopting dark mode or copying its exact layout.
- [Notion projects](https://www.notion.com/product/projects): the inspected issue-tracking image uses thin table dividers, compact view tabs, small semantic status tags, one strong creation action, and a contextual view-options surface. This supports moving low-frequency cycle administration out of the dominant working area and reserving emphasis for the task.
- [Panorama Student Success](https://www.panoramaed.com/products/student-success): the published intervention-planning image is a stylized composite. It groups labeled form fields, separates monitoring frequency/baseline/target, and localizes progress with a status label and short timeline. Borrow explicit form grouping and intelligible progress. Do not imply that Throughline has Panorama's data integrations, individual student records, or intervention monitoring.

The browser reference tab is closed. No viewport override or app data changes were made. The first encoded Linear image link returned a malformed-URL page; I then opened its official page, read the actual rendered image URL, and inspected that image. Panorama's optimized image endpoint failed in web extraction; its linked source image rendered in the browser. The successful source observations, rather than the failed requests, support this report.

## Prioritized critique

### P1: The first useful evidence is below the fold

In the supplied 712px-high capture, the evidence panel begins around y=443 and metric cards around y=657; neither key metric value is visible. Brand chrome, the cycle-management card, an explanatory introduction, and stage buttons consume most of the initial viewport. The evidence panel then repeats a kicker, question, explanation, and source summary before presenting numbers. An educator must scroll before assessing the two core facts.

**Required correction:** reduce the shell and introductory repetition. At 1280x720, both key metric values, their labels, and source date/scope must be visible without scrolling. The page should make the current workflow stage clear without repeating a marketing-style premise. Show the beginning of actionable student evidence in that first viewport when space permits.

### P1: Administration competes with the instructional task

New, rename, duplicate, and delete all sit in a prominent full-width card; reset occupies the global header. Meanwhile, the main workflow action is at the bottom of long content. Cycle administration is useful but mostly occasional. The current placement visually tells the user that managing containers is as important as interpreting evidence.

**Required correction:** keep the current cycle selector and new-cycle action compact and discoverable; place low-frequency operations in an accessible contextual disclosure. Keep destructive operations distinguishable and confirmed. Each stage should have one visually dominant primary action, with quieter back/navigation actions. Preserve the ability to inspect evidence rather than encouraging blind continuation.

### P1: Several normal-text colors lack sufficient contrast

Computed from declared CSS foreground/background colors, using the standard relative-luminance formula:

| Baseline text | Foreground / background | Ratio |
| --- | --- | --- |
| Caption text on white | `#758795` / `#ffffff` | 3.71:1 |
| Empty decision text on white | `#8b99a1` / `#ffffff` | 2.93:1 |
| Intro copy on page background | `#637b8c` / `#f4f7f8` | 4.11:1 |
| Metric denominator on its card | `#91a4ad` / `#f9fbfc` | 2.49:1 |

These values are source-based calculations, not sampled antialiased screenshot pixels. The meaningful captions/empty-state explanations are not disabled controls. Normal text needs at least 4.5:1 and qualifying large text at least 3:1 under [W3C's contrast-minimum explanation](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

**Required correction:** define readable secondary/muted tokens and verify actual pairings, including tinted panels, placeholders, labels, saved status, and error text. Quietness should come from placement, size, and weight, not unreadably pale text. This audit is not an exhaustive WCAG certification.

### P2: Too many similar surfaces flatten priority

Large radii, borders, pale fills, and shadows recur at the page panel, source summary, metrics, response cards, notices, and decision rail. Nearly every item looks like a separate product card. The eye spends effort resolving container boundaries rather than evidence relationships.

**Required correction:** use fewer surface levels, finer dividers, and a consistent radius/spacing scale. Let content grouping create hierarchy. Reserve teal for active workflow/selection/primary action; reserve amber for actual caution, rather than generic decoration.

### P2: The decision rail spends attention on empty promises

The 330px rail contains substantial explanation and six decision slots, most empty at the start. It is useful as a durable record, but repeats guidance and consumes central width before it contains much substantive work.

**Required correction:** emphasize captured decisions and the next meaningful missing step. Retain readable future-state guidance without long repeated placeholder sentences. Long approved text needs a deliberate expand/read mechanism rather than forcing an unbounded page or silently truncating the only copy. A new 200px workflow rail plus a 300px decision rail must not starve the central form: keep at least roughly 600px of central content at 1280px, or collapse/reposition a rail first.

### P2: Type and navigation need a coherent application grammar

The interface mixes a large branded header, rhetorical page title, uppercase kicker, repeated section question, and numerous small labels. Inter is declared but not loaded in the inspected CSS, making rendering depend on the host font. Locked stages are pale without explanatory guidance in their visible labels.

**Required correction:** establish a deliberate title/body/label/metadata scale, load the chosen font or use an intentional system stack, and reduce all-caps labels. Workflow navigation should clearly show current, completed, and locked states through text/shape as well as color. Explain prerequisites without presenting inactive controls as broken features.

## Reviewable acceptance criteria

1. **Evidence first:** at 1280x720, key data values and source context appear before scrolling; no repeated large introduction displaces them. Initial mobile view at 390x844 reaches useful evidence promptly.
2. **Real application hierarchy:** compact cycle context; current stage and a single dominant stage action; secondary/destructive actions available through understandable, keyboard-operable controls. No fake search, notifications, collaboration, or live-AI affordances.
3. **Readable system:** consistent spacing, borders, type, and icon treatment. Normal text pairings meet 4.5:1; qualifying large text meets 3:1. Selected/error/locked meanings do not rely on color alone.
4. **Responsive robustness:** no document-level horizontal overflow at 390px, and usable layouts at intermediate/tablet widths and 200% zoom. Primary touch controls should be approximately 44px high as a project comfort target. Long cycle names and 4,000-character authored values must not stretch the shell or hide needed controls.
5. **Preserved judgment and truthfulness:** source dates/scope, fictional-data status, scripted prompts, local-storage status, consent, upstream invalidation, locked-stage reasons, save errors and explicit recovery remain understandable. Compression must not erase epistemic caveats or authority boundaries.
6. **Evidence-based completion:** desktop/mobile screenshots of the implemented interface, actual browser checks for keyboard/dialog/disclosure behavior and a complete educator flow, existing model/repository tests, and a production build. Review actual rendered result, including open menus and validation/error states, rather than accepting CSS alone.

The intended redesign direction sent by root—compact light shell, restrained teal, a bounded workflow rail, contextual cycle actions, early metrics, self-hosted Inter, and a concise status-aware decision trail—addresses the major findings. Acceptance still depends on the implemented screenshots and behavior, especially available central width, contrast, long text, and mobile controls. I have not reviewed a redesigned implementation yet.
