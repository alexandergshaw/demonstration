import { useState } from 'react';
import { exportPilotEvaluationHtml, pilotEvaluationProtocol } from '../pilotEvaluation';
import { Icon } from './Icon';

export function PilotEvaluation() {
  const [error, setError] = useState('');
  const [downloaded, setDownloaded] = useState(false);
  const protocol = pilotEvaluationProtocol;
  function download() {
    let url: string | undefined;
    let anchor: HTMLAnchorElement | undefined;
    try {
      url = URL.createObjectURL(new Blob([exportPilotEvaluationHtml()], { type: 'text/html;charset=utf-8' }));
      anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'Throughline_Proposed_Pilot_Evaluation.html';
      document.body.append(anchor);
      anchor.click();
      setError('');
      setDownloaded(true);
    } catch {
      setDownloaded(false);
      setError('The research handout could not be downloaded. Please try again.');
    } finally {
      anchor?.remove();
      if (url) { const downloadUrl = url; window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000); }
    }
  }

  return <details className="pilot-evaluation">
    <summary>{protocol.title}</summary>
    <div className="pilot-evaluation-body">
      <p className="kicker">{protocol.status}</p>
      <p className="learning-lead">{protocol.purpose}</p>
      <p className="pilot-boundary">{protocol.scope}</p>
      <section className="pilot-roles"><h4>Participants & responsibilities</h4><p>{protocol.participants}</p><dl>{protocol.roles.map(item => <div key={item.role}><dt>{item.role}</dt><dd>{item.responsibility}</dd></div>)}</dl></section>
      <section className="pilot-sequence"><h4>Proposed sequence</h4><ol>{protocol.steps.map(item => <li key={item.title}><h5>{item.title.replace(/^\d+\. /, '')}</h5><p>{item.text}</p></li>)}</ol></section>
      <section className="pilot-measures" aria-labelledby="pilot-measures-heading"><h4 id="pilot-measures-heading">Manual observations & artifact review</h4>
        {protocol.measures.map(item => <article key={item.question}><h5>{item.question}</h5><dl>
          <div><dt>Evidence to collect</dt><dd>{item.evidence}</dd></div>
          <div><dt>How to review it</dt><dd>{item.review}</dd></div>
        </dl></article>)}
      </section>
      <section className="pilot-decisions"><h4>Agree on decision rules after the baseline</h4><p>Set context-specific thresholds together before collecting comparison data. These are proposed criteria, not measured results.</p>
        <dl>{protocol.decisions.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.rule}</dd></div>)}</dl>
      </section>
      <section className="pilot-download"><h4>Take the proposal with you</h4><p>Download a separate research handout with blank manual notes. Open it locally and use your browser’s Print command for paper or PDF.</p>
        <button className="btn secondary" onClick={download}><Icon name="download" size={16} />Download proposed pilot handout</button>
        <p className="caption">It contains no saved cycle or student records and is separate from your approved meeting materials.</p>
        {error && <p className="form-error" role="alert">{error}</p>}
        {downloaded && <p className="caption" role="status">Research handout download started. Open the HTML file to read or print it.</p>}
      </section>
      <details className="pilot-sources"><summary>Research informing this proposal</summary><ul>{protocol.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a><p className="caption">{source.relevance}</p></li>)}</ul><p className="caption">The sources inform this proposal. They do not endorse Throughline or establish its effectiveness.</p></details>
    </div>
  </details>;
}
