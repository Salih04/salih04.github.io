import { failedExperiments } from "@/content/financeiq";

/** Negative results, kept as first-class records. */
export function FailedExperiments() {
  return (
    <div className="failed">
      {failedExperiments.map((e) => (
        <article key={e.id} className="failed__card" aria-labelledby={`exp-${e.id}`}>
          <header>
            <h4 id={`exp-${e.id}`} className="mono">
              Experiment #{e.id}
            </h4>
            <span className={`tag ${e.status === "Archived" ? "tag--warning" : "tag--research"}`}>{e.status}</span>
          </header>
          <dl>
            <dt>Hypothesis</dt>
            <dd>{e.hypothesis}</dd>
            <dt>Result</dt>
            <dd>{e.result}</dd>
            <dt>Why keep it?</dt>
            <dd>{e.why}</dd>
          </dl>
        </article>
      ))}
    </div>
  );
}
