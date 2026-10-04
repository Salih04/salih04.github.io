import type { DecisionRecord as Decision } from "@/content/types";

/** An engineering decision rendered as a lab record. Used in lab and case-study modes. */
export function DecisionRecord({ decision, headingLevel = 3 }: { decision: Decision; headingLevel?: 2 | 3 | 4 }) {
  const H = `h${headingLevel}` as "h2" | "h3" | "h4";
  const selected = decision.options.find((o) => o.key === decision.selected);
  return (
    <article className="record" aria-labelledby={`decision-${decision.id}`}>
      <header className="record__head">
        <span className="record__id mono">Decision {decision.id}</span>
        <span className="tag tag--success">Selected · {decision.selected}</span>
      </header>
      <H id={`decision-${decision.id}`} className="record__title">
        {decision.title}
      </H>
      <dl className="record__fields">
        <div>
          <dt>Problem</dt>
          <dd>{decision.problem}</dd>
        </div>
        <div>
          <dt>Options considered</dt>
          <dd>
            <ul className="record__options">
              {decision.options.map((o) => (
                <li key={o.key} data-selected={o.key === decision.selected || undefined}>
                  <span className="record__key mono">{o.key}</span>
                  <span>
                    <strong>{o.label}</strong>
                    <span className="record__detail">{o.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt>Selected</dt>
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
          <dd>{decision.evidence}</dd>
        </div>
      </dl>
    </article>
  );
}
