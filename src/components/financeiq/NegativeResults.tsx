import { negativeResults } from "@/content/financeiq";

/**
 * Negative results as research records, not error states. Records from the
 * public project repository carry a quiet source line; the illustration says
 * it is synthetic.
 */
export function NegativeResults() {
  return (
    <ol className="negatives">
      {negativeResults.map((r) => (
        <li key={r.id} className="negative" data-provenance={r.provenance}>
          <header className="negative__head">
            <span className="negative__tag">Negative result</span>
            <span className="negative__status">{r.status}</span>
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
              <dt>Interpretation</dt>
              <dd>{r.interpretation}</dd>
            </div>
            <div>
              <dt>Why keep this?</dt>
              <dd>{r.keep}</dd>
            </div>
          </dl>
          <p className="negative__source">
            {r.source ? (
              <>
                <span className="negative__prov">Public project evidence</span>{" "}
                <a href={r.source.href}>Supporting research repository · {r.source.label} ↗</a>
              </>
            ) : (
              <span className="negative__prov">Synthetic example · not a research result</span>
            )}
          </p>
        </li>
      ))}
    </ol>
  );
}
