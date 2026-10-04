import { negativeResults } from "@/content/financeiq";

/** Negative results as ruled records. Documented ones cite their source; illustrations say so. */
export function NegativeResults() {
  return (
    <ol className="negatives">
      {negativeResults.map((r) => (
        <li key={r.id} className="negative" data-provenance={r.provenance}>
          <header className="negative__head">
            <span className="negative__tag">Negative result</span>
            <span className="negative__prov">{r.provenance === "documented" ? "Documented" : "Synthetic example"}</span>
          </header>
          <dl className="negative__fields">
            <div>
              <dt>Hypothesis</dt>
              <dd>{r.hypothesis}</dd>
            </div>
            <div>
              <dt>Observation</dt>
              <dd>{r.observation}</dd>
            </div>
            <div>
              <dt>Why it matters</dt>
              <dd>{r.why}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{r.status}</dd>
            </div>
          </dl>
          {r.source ? (
            <a className="negative__source" href={r.source.href}>
              Source: public FinanceIQ repository · {r.source.label} ↗
            </a>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
