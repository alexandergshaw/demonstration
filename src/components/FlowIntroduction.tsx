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

    <p className="flow-introduction-agency"><strong>You interpret, choose and approve.</strong> Throughline keeps the evidence, thinking prompts and your plan together.</p>

    <ol className="flow-introduction-phases" aria-label="From preparation to classroom learning">
      <li><span className="flow-phase-number" aria-hidden="true">1</span><div><PhaseHeading className="flow-phase-title">Prepare here</PhaseHeading><p>Examine evidence, choose a focus and build the meeting.</p></div></li>
      <li><span className="flow-phase-number" aria-hidden="true">2</span><div><PhaseHeading className="flow-phase-title">Meet and try the move</PhaseHeading><p>Lead the conversation. Your team tries the change in class.</p></div></li>
      <li><span className="flow-phase-number" aria-hidden="true">3</span><div><PhaseHeading className="flow-phase-title">Return to Reflect</PhaseHeading><p>Report implementation, examine new evidence and choose a next step.</p></div></li>
    </ol>

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

    <div className="flow-introduction-footer">
      <p>Fictional Grade 4 math · Scripted prompts, no live AI · Saves only in this browser</p>
    </div>
  </section>;
}
