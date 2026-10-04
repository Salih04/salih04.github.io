"use client";

import { useState } from "react";
import type { DecisionRecord as Decision } from "@/content/types";
import { DecisionRecord } from "./DecisionRecord";

/** Index of decision records with one record open at a time. */
export function DecisionBrowser({ decisions, initial }: { decisions: Decision[]; initial?: string }) {
  const [current, setCurrent] = useState(initial ?? decisions[0]?.id);
  const decision = decisions.find((d) => d.id === current) ?? decisions[0];

  return (
    <div className="decisions">
      <ul className="decisions__index" aria-label="Decision records">
        {decisions.map((d) => (
          <li key={d.id}>
            <button type="button" aria-pressed={d.id === decision?.id} onClick={() => setCurrent(d.id)}>
              <span className="mono">{d.id}</span>
              <span>{d.title}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="decisions__record" aria-live="polite">
        {decision ? <DecisionRecord key={decision.id} decision={decision} /> : null}
      </div>
    </div>
  );
}
