"use client";

import { useState } from "react";
import type { DecisionRecord as Decision } from "@/content/types";
import { DecisionRecord } from "./DecisionRecord";

/** Index of decision records with one record open at a time. */
export function DecisionBrowser({ decisions, initial, kind }: { decisions: Decision[]; initial?: string; kind: string }) {
  const [current, setCurrent] = useState(initial ?? decisions[0]?.key);
  const decision = decisions.find((d) => d.key === current) ?? decisions[0];

  return (
    <div className="decisions">
      <ul className="decisions__index" aria-label={`${kind} records`}>
        {decisions.map((d) => (
          <li key={d.key}>
            <button type="button" aria-pressed={d.key === decision?.key} onClick={() => setCurrent(d.key)}>
              <span className="decisions__key mono">{d.key}</span>
              <span>{d.title}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="decisions__record" aria-live="polite">
        {decision ? <DecisionRecord key={decision.key} decision={decision} kind={kind} /> : null}
      </div>
    </div>
  );
}
