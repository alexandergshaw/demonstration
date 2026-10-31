import { useId, type Ref } from 'react';
import { agendaHeadings } from '../meetingMaterials';
import { minutes } from '../model';
import { Icon } from './Icon';
import './FlowIntroduction.css';

interface FlowIntroductionProps {
  onContinue: () => void;
  continueLabel?: string;
  headingLevel?: 'h2' | 'h3';
  headingRef?: Ref<HTMLHeadingElement>;
}

export function FlowIntroduction({ onContinue, continueLabel = 'Start with the evidence', headingLevel = 'h2', headingRef }: FlowIntroductionProps) {
  const titleId = useId();
  const Heading = headingLevel;
  const PhaseHeading = headingLevel === 'h2' ? 'h3' : 'h4';
  const PreviewHeading = PhaseHeading;
  return <section className="flow-introduction" aria-labelledby={titleId}>
    <Heading className="flow-introduction-title" id={titleId} ref={headingRef} tabIndex={headingRef ? -1 : undefined}>How the planning cycle works</Heading>
    <p className="flow-introduction-lead">For a professional learning community (PLC) leader preparing a 50-minute meeting kit.</p>
    <p className="flow-introduction-agency">Throughline organizes evidence and prompts. You interpret, choose and approve.</p>

    <ol className="flow-introduction-phases" aria-label="From preparation to classroom learning">
      <li><span className="flow-phase-number" aria-hidden="true">1</span><div><PhaseHeading className="flow-phase-title">Prepare here</PhaseHeading><p>Evidence → Interpret → Plan</p></div></li>
      <li><span className="flow-phase-number" aria-hidden="true">2</span><div><PhaseHeading className="flow-phase-title">With your team</PhaseHeading><p>Meet; the team tries the move.</p></div></li>
      <li><span className="flow-phase-number" aria-hidden="true">3</span><div><PhaseHeading className="flow-phase-title">Return to Reflect</PhaseHeading><p>Report implementation, examine evidence, choose a next step.</p></div></li>
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
      <button type="button" className="btn" onClick={onContinue}>{continueLabel}<Icon name="arrow" size={17} /></button>
    </div>
  </section>;
}
