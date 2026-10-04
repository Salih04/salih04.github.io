"use client";

import { useState } from "react";
import { useLab } from "@/components/shell/LabProvider";
import { archLayers, architecture, type ArchComponent } from "@/content/sams";

const byLayer = (layer: ArchComponent["layer"]) => architecture.filter((c) => c.layer === layer);

/** Engineering view of SAMS: click any component to see why it exists. */
export function ArchitectureView({ compact = false }: { compact?: boolean }) {
  const { cue } = useLab();
  const [selected, setSelected] = useState("temporal");
  const component = architecture.find((c) => c.id === selected) ?? architecture[0]!;

  const select = (id: string) => {
    setSelected(id);
    cue("tick");
  };

  const nodeButton = (c: ArchComponent) => (
    <button
      key={c.id}
      type="button"
      className="arch__node"
      data-layer={c.layer}
      aria-pressed={c.id === selected}
      aria-controls="arch-detail"
      onClick={() => select(c.id)}
    >
      {c.label}
    </button>
  );

  return (
    <div className={`arch${compact ? " arch--compact" : ""}`}>
      <div className="arch__diagram" role="group" aria-label="SAMS architecture components">
        <ol className="arch__stack">
          {archLayers.map((layer, i) => (
            <li key={layer.id} className="arch__layer">
              <span className="arch__layer-label mono">{layer.label}</span>
              <div className="arch__layer-nodes">
                {byLayer(layer.id).map(nodeButton)}
              </div>
              {i < archLayers.length - 1 ? <span className="arch__flow" aria-hidden="true" /> : null}
            </li>
          ))}
        </ol>
        <div className="arch__cross">
          <span className="arch__layer-label mono">Cross-cutting</span>
          <div className="arch__cross-nodes">
            {byLayer("crosscutting").map(nodeButton)}
          </div>
        </div>
      </div>

      <section id="arch-detail" className="arch__detail panel" aria-live="polite" aria-labelledby="arch-detail-title">
        <p className="eyebrow eyebrow--signal">Component</p>
        <h3 id="arch-detail-title" className="arch__detail-title">
          {component.label}
        </h3>
        <dl>
          <dt>Why it exists</dt>
          <dd>{component.why}</dd>
          <dt>Design responsibility</dt>
          <dd>
            <ul>
              {component.responsibilities.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </dd>
          <dt>Trade-off</dt>
          <dd>{component.tradeoff}</dd>
        </dl>
        {component.boundary ? <p className="arch__boundary mono">⌀ {component.boundary}</p> : null}
      </section>

      <details className="text-alt arch__text">
        <summary>Architecture as text</summary>
        <ol>
          {architecture.map((c) => (
            <li key={c.id}>
              <strong>{c.label}</strong> — {c.why} Responsibilities: {c.responsibilities.join("; ")}.
            </li>
          ))}
        </ol>
      </details>
    </div>
  );
}
