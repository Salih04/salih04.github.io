import type { DecisionRecord as Decision } from "@/content/types";

/** A decision rendered as a ruled record. Used in lab and case-study modes. */
export function DecisionRecord({ decision, kind, headingLevel = 3 }: { decision: Decision; kind: string; headingLevel?: 2 | 3 | 4 }) {
  const H = `h${headingLevel}` as "h2" | "h3" | "h4";
  const selected = decision.options.find((o) => o.key === decision.selected);
  const id = `decision-${kind.split(" ")[0]!.toLowerCase()}-${decision.key.toLowerCase()}`;
  return (
    <article className="record" aria-labelledby={id}>
      <header className="record__head">
        <span className="record__id mono">
          {kind} {decision.key}
        </span>
        {decision.status ? <span className="record__status">{decision.status}</span> : null}
      </header>
      <H id={id} className="record__title">
        {decision.title}
      </H>
      <dl className="record__fields">
        <div>
          <dt>Need</dt>
          <dd>{decision.problem}</dd>
        </div>
        <div>
          <dt>Alternatives</dt>
          <dd>
            <ul className="record__options">
              {decision.options.map((o) => (
                <li key={o.key} data-selected={o.key === decision.selected || undefined}>
                  <span className="record__key mono">{o.key}</span>
                  <span>
                    <strong>{o.label}</strong>
                    <span className="record__detail">{o.detail}</span>
                  </span>
                  {o.key === decision.selected ? <span className="record__chosen">chosen</span> : null}
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt>Chosen</dt>
          <dd>
            {decision.selected} — {selected?.label}
          </dd>
        </div>
        <div>
          <dt>Reason</dt>
          <dd>{decision.reason}</dd>
        </div>
        <div>
          <dt>Trade-off</dt>
          <dd>{decision.tradeoff}</dd>
        </div>
        <div>
          <dt>Evidence</dt>
          <dd>
            {decision.evidence}
            {decision.evidenceSource ? (
              <>
                {" "}
                <a className="record__source" href={decision.evidenceSource.href}>
                  Source: {decision.evidenceSource.label} ↗
                </a>
              </>
            ) : null}
          </dd>
        </div>
      </dl>
    </article>
  );
}
