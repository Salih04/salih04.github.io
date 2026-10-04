"use client";

import { useState } from "react";
import { pipeline } from "@/content/financeiq";

/** The research pipeline as a sequence of questions the data must answer. */
export function PipelineView() {
  const [selected, setSelected] = useState(pipeline[0]!.id);
  const index = pipeline.findIndex((s) => s.id === selected);
  const stage = pipeline[index] ?? pipeline[0]!;

  return (
    <div className="pipeline">
      <ol className="pipeline__stages" aria-label="Pipeline stages">
        {pipeline.map((s, i) => (
          <li key={s.id} data-state={i < index ? "done" : i === index ? "active" : "idle"}>
            <button type="button" aria-pressed={s.id === selected} aria-controls="pipeline-detail" onClick={() => setSelected(s.id)}>
              <span className="mono pipeline__n">{String(i + 1).padStart(2, "0")}</span>
              <span>{s.label}</span>
            </button>
          </li>
        ))}
      </ol>
      <section id="pipeline-detail" className="pipeline__detail panel" aria-live="polite">
        <p className="eyebrow eyebrow--research">
          Stage {String(index + 1).padStart(2, "0")} · {stage.label}
        </p>
        <h3>{stage.question}</h3>
        <p>{stage.detail}</p>
      </section>
    </div>
  );
}
