"use client";

import { useState } from "react";
import { FigureLabel } from "@/components/records/FigureLabel";
import { useLab } from "@/components/shell/LabProvider";
import { architecture, architecturePaths as P, type ArchComponent } from "@/content/sams";

const byId = (id: string) => architecture.find((c) => c.id === id)!;
const [reqClient, reqApi, reqWorkflow, reqState] = P.request;
const [delRedis, delGateway] = P.delivery;

/**
 * SAMS architecture as paths, in the failure demo's machine grammar: a
 * request path into durable work and durable state on the left, the event
 * delivery path back to the client on the right, and the system boundary
 * around both. Steps, roles and edges come from `architecturePaths`, which the
 * case-study figure also draws, so the two views cannot disagree. Select a component for why it exists and what it costs.
 */
export function ArchitecturePath({ fig = "02" }: { fig?: string }) {
  const { cue } = useLab();
  const [selected, setSelected] = useState("redis");
  const component = byId(selected);

  const select = (id: string) => {
    setSelected(id);
    cue("tick");
  };

  // Render helpers, not components: a re-render must not remount the focused button.
  const node = (id: string, role: string) => {
    const c: ArchComponent = byId(id);
    return (
      <button type="button" className="apath__node" data-id={id} aria-pressed={id === selected} aria-controls="arch-detail" onClick={() => select(id)}>
        <i className="apath__mark" aria-hidden="true" />
        <span className="apath__role">{role}</span>
        <span className="apath__name">{c.label}</span>
        <span className="apath__owns">{c.owns}</span>
      </button>
    );
  };

  const tag = (id: string) => (
    <button key={id} type="button" className="apath__tag" aria-pressed={id === selected} aria-controls="arch-detail" onClick={() => select(id)}>
      {byId(id).label}
    </button>
  );

  return (
    <div className="arch arch--path">
      <div className="apath" role="group" aria-label="SAMS architecture: request, workflow, state and delivery paths (schematic)">
        <div className="apath__head">
          <FigureLabel fig={fig} kind="schematic" />
          <span className="apath__legend mono">
            <span data-k="work">Durable work</span>
            <span data-k="delivery">Event delivery</span>
          </span>
        </div>

        <div className="apath__client">
          {node(reqClient.id, reqClient.role)}
        </div>
        <p className="apath__edge apath__edge--down apath__edge--request">{reqClient.edge}</p>
        <p className="apath__edge apath__edge--up apath__edge--push">
          {delGateway.edge} <span className="apath__resume">↓ resume from last_seq</span>
        </p>

        <section className="apath__boundary" aria-label="System boundary">
          <div className="apath__api">
            {node(reqApi.id, reqApi.role)}
          </div>
          <p className="apath__edge apath__edge--down apath__edge--start">{reqApi.edge}</p>
          <div className="apath__wf">
            {node(reqWorkflow.id, reqWorkflow.role)}
          </div>
          <p className="apath__link">
            <span>
              <span className="apath__link-who">Workflow </span>
              {P.crossing}
            </span>
          </p>
          <div className="apath__workers">
            {node(P.activities.id, P.activities.role)}
          </div>
          <p className="apath__edge apath__edge--down apath__edge--state">{reqWorkflow.edge}</p>
          <div className="apath__pg">
            {node(reqState.id, reqState.role)}
          </div>

          <div className="apath__ws">
            {node(delGateway.id, delGateway.role)}
          </div>
          <p className="apath__edge apath__edge--up apath__edge--deliver">{delRedis.edge}</p>
          <div className="apath__redis">
            {node(delRedis.id, delRedis.role)}
          </div>
          <div className="apath__reconnect">
            <p className="apath__reconnect-k mono">Reconnect</p>
            <ol>
              {P.reconnect.map((r, n) => (
                <li key={r.k}>
                  <span className="mono">{String(n + 1).padStart(2, "0")}</span> <span>{r.text}</span>
                </li>
              ))}
            </ol>
          </div>
          <p className="apath__boundary-k">
            <span className="mono">System boundary</span>
            {P.boundary.map(tag)}
          </p>
        </section>
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
