import { useId, type Ref } from 'react';
import { agendaHeadings } from '../meetingMaterials';
import { minutes } from '../model';
import { Icon } from './Icon';
import './FlowIntroduction.css';

interface FlowIntroductionProps {
  onContinue: () => void;
  continueLabel?: string;
  headingLevel?: 'h1' | 'h2' | 'h3';
  headingRef?: Ref<HTMLHeadingElement>;
}

export function FlowIntroduction({ onContinue, continueLabel = 'Start with the evidence', headingLevel = 'h2', headingRef }: FlowIntroductionProps) {
  const titleId = useId();
  const Heading = headingLevel;
  const PhaseHeading = headingLevel === 'h1' ? 'h2' : headingLevel === 'h2' ? 'h3' : 'h4';
  const PreviewHeading = PhaseHeading;
  return <section className={`flow-introduction${headingLevel === 'h1' ? ' flow-introduction-welcome' : ''}`} aria-labelledby={titleId}>
    <div className="flow-introduction-overview">
      <div className="flow-introduction-purpose">
        <p className="flow-introduction-eyebrow">Throughline · From student work to teaching practice</p>
        <Heading className="flow-introduction-title" id={titleId} ref={headingRef} tabIndex={headingRef ? -1 : undefined}>Help your team decide what to teach differently.</Heading>
        <p className="flow-introduction-lead">Throughline helps teacher-team leaders turn student evidence into a focused professional learning community (PLC) meeting, one teaching change to try, and a plan to check what students learn.</p>
        <div className="flow-introduction-start">
          <button type="button" className="btn" onClick={onContinue}>{continueLabel}<Icon name="arrow" size={17} /></button>
          <p>This demo uses a fictional Grade 4 math case. The evidence is already here.</p>
        </div>
      </div>

      <aside className="flow-introduction-destination" aria-labelledby={`${titleId}-destination`}>
        <p className="flow-introduction-eyebrow">What you’re working toward</p>
        <PhaseHeading className="flow-destination-title" id={`${titleId}-destination`}>Walk into the meeting with a plan you can explain.</PhaseHeading>
        <dl className="flow-introduction-outcomes">
          <div><dt>Evidence you can point to</dt><dd>What student work shows, with dates and limits in view.</dd></div>
          <div><dt>One teaching change to try</dt><dd>A specific move for the team to discuss, practice and use.</dd></div>
          <div><dt>A way to check what happened</dt><dd>Did the move happen? What does new student work show?</dd></div>
        </dl>
        <p className="flow-destination-deliverable">Your approved meeting kit includes a <strong>50-minute agenda, source packet and participant activity.</strong></p>
      </aside>
    </div>

      <p className="flow-introduction-agency"><strong>You interpret, choose and approve.</strong> Throughline keeps the evidence, thinking prompts and your plan together. It does not decide why students responded as they did or write a teaching decision for you. Its questions are scripted; your writing gives the meeting its direction.</p>

    <p className="flow-introduction-timeline-label" id={`${titleId}-timeline`}>The cycle · Before, during and after the meeting</p>
    <ol className="flow-introduction-phases" aria-labelledby={`${titleId}-timeline`}>
      <li><span className="flow-phase-number" aria-hidden="true">1</span><div><PhaseHeading className="flow-phase-title">Prepare here</PhaseHeading><p>Examine the results, task and student work. Write a possible explanation, test another account, and choose a focus before planning the meeting.</p></div></li>
      <li><span className="flow-phase-number" aria-hidden="true">2</span><div><PhaseHeading className="flow-phase-title">Meet and try the move</PhaseHeading><p>Review and approve your writing to make the kit available. Lead the conversation, rehearse with colleagues, then try the move in class.</p></div></li>
      <li><span className="flow-phase-number" aria-hidden="true">3</span><div><PhaseHeading className="flow-phase-title">Return to Reflect</PhaseHeading><p>Report implementation, examine new evidence and choose a next step. If evidence is missing, decide what to collect, who will bring it and when to review it.</p></div></li>
    </ol>

    <section className="flow-introduction-method" aria-labelledby={`${titleId}-method`}>
      <PhaseHeading className="flow-method-title" id={`${titleId}-method`}>Four different decisions, connected.</PhaseHeading>
      <dl>
        <div><dt>Interpretation · What might explain the work?</dt><dd>Separate the pattern you can see from a possible explanation. Ask what else could account for it.</dd></div>
        <div><dt>Focus · What is worth investigating?</dt><dd>Choose one learning priority tied to the evidence, such as explaining why two fractions represent the same amount.</dd></div>
        <div><dt>Teaching move · What will change in class?</dt><dd>Name what the teacher will do and the thinking students will do themselves. The meeting helps colleagues prepare to try it.</dd></div>
        <div><dt>Next decision · What do we now know?</dt><dd>After teaching, distinguish whether the move happened from what students learned. Record a supported next action or a plan to gather missing evidence.</dd></div>
      </dl>
      <p>You can revisit earlier work. Changing a source or decision keeps your draft but requires affected approvals again, so the meeting materials stay connected to your current judgment.</p>
    </section>

    <details className="flow-introduction-preview">
      <summary>Preview what you’ll make</summary>
      <figure className="flow-kit-preview">
        <figcaption>Structure preview · your approved decisions become these meeting materials.</figcaption>
        <div className="flow-kit-pages">
          <section className="flow-kit-page flow-kit-sources">
            <Icon name="evidence" size={23} />
            <PreviewHeading className="flow-kit-title">Source packet</PreviewHeading>
            <p>Selected evidence, the original task and scoring criteria.</p>
            <div className="flow-kit-section">Evidence you can explain</div>
            <div className="flow-kit-section">Dates and source limits</div>
          </section>
          <section className="flow-kit-page flow-kit-agenda">
            <Icon name="meeting" size={23} />
            <PreviewHeading className="flow-kit-title">50-minute agenda</PreviewHeading>
            <p>Six activities with your facilitation directions.</p>
            <ol>{agendaHeadings.map((heading, index) => <li key={heading}><span>{heading}</span><span>{minutes[index]} min</span></li>)}</ol>
          </section>
          <section className="flow-kit-page flow-kit-action">
            <Icon name="reasoning" size={23} />
            <PreviewHeading className="flow-kit-title">Participant activity</PreviewHeading>
            <p>One teaching move: teacher action + student thinking.</p>
            <div className="flow-kit-section"><strong>Implementation check</strong><span>What would show the move happened?</span></div>
            <div className="flow-kit-section"><strong>Learning check</strong><span>What would reveal student reasoning?</span></div>
          </section>
        </div>
      </figure>
    </details>

    <details className="flow-introduction-controls">
      <summary>Understand the controls you can use throughout</summary>
      <dl>
        <div><dt>PLC cycle and Menu</dt><dd>A cycle is one saved investigation and plan. Switch between named cycles in the header. Open Menu to start, rename or manage a cycle. Saved work belongs to this browser and site.</dd></div>
        <div><dt>Decisions</dt><dd>Open Menu, then Decisions to read the sources, writing and approval states recorded for this cycle. It is a record of your choices, not a rating of their quality.</dd></div>
        <div><dt>Reading settings</dt><dd>Open Menu, then Reading settings to adjust text size and line spacing for comfort. These settings do not change your instructional decisions.</dd></div>
        <div><dt>Guide and About this step</dt><dd>Open Guide from Menu, or expand About this step for guidance on the current task. Revisit this introduction, read a walkthrough, try a separate practice case or look up a term. Help is optional and never fills in or approves your plan.</dd></div>
        <div><dt>Save status</dt><dd>Check for Saved beside the stages before leaving. It means saved on this browser. If saving fails, keep the page open and use Retry save. Saving a draft is separate from confirming your focus or approving the meeting.</dd></div>
      </dl>
    </details>

    <div className="flow-introduction-footer">
      <p>Fictional Grade 4 math · Scripted prompts, no live AI · Saves only in this browser</p>
    </div>
  </section>;
}
