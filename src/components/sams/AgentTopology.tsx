"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { useLab } from "@/components/shell/LabProvider";
import { agentEdges, agents, liveScript, type AgentId } from "@/content/sams";
import { useReducedMotion } from "@/lib/useReducedMotion";

const STEP_MS = 1150;
const CYCLE_PAUSE_MS = 2600;
const FEED_LIMIT = 9;

const nodeById = Object.fromEntries(agents.map((a) => [a.id, a])) as Record<AgentId, (typeof agents)[number]>;

interface FeedLine {
  id: number;
  time: string;
  text: string;
}

const fmt = (d: Date) => d.toTimeString().slice(0, 8);

/**
 * The SAMS "Live System": a scripted, deterministic demonstration of how a
 * task moves through the agents. It is not connected to any real system.
 */
export function AgentTopology() {
  const reduce = useReducedMotion();
  const { cue } = useLab();
  const [running, setRunning] = useState(true);
  const [step, setStep] = useState(-1);
  const [task, setTask] = useState(1);
  const [feed, setFeed] = useState<FeedLine[]>([]);
  const clock = useRef<Date | null>(null);
  const lineId = useRef(0);

  useEffect(() => {
    if (reduce) setRunning(false);
  }, [reduce]);

  const stepRef = useRef(-1);
  const advance = useCallback(() => {
    const prev = stepRef.current;
    const next = prev + 1 >= liveScript.length ? 0 : prev + 1;
    stepRef.current = next;
    if (next === 0 && prev !== -1) setTask((t) => t + 1);
    setStep(next);
    const entry = liveScript[next];
    if (!entry) return;
    clock.current ??= new Date();
    clock.current = new Date(clock.current.getTime() + (next === 0 ? 4000 : 1000 + (next % 3) * 500));
    const line = { id: lineId.current++, time: fmt(clock.current), text: entry.feed };
    setFeed((f) => [...f, line].slice(-FEED_LIMIT));
  }, []);

  useEffect(() => {
    if (!running) return;
    const delay = step === liveScript.length - 1 ? CYCLE_PAUSE_MS : step === -1 ? 400 : STEP_MS;
    const t = window.setTimeout(advance, delay);
    return () => window.clearTimeout(t);
  }, [running, step, advance]);

  useEffect(() => {
    if (step < 0) return;
    cue(step === liveScript.length - 1 ? "complete" : "tick");
  }, [step, cue]);

  const current = step >= 0 ? liveScript[step] : undefined;
  const visited = new Set<AgentId>(liveScript.slice(0, step + 1).map((s) => s.to));
  const activeEdge = current?.from && current.from !== current.to ? `${current.from}-${current.to}` : null;

  const from = current ? (current.from ? nodeById[current.from] : { x: 280, y: -24 }) : null;
  const to = current ? nodeById[current.to] : null;
  const travelling = from && to && current && current.from !== current.to;

  return (
    <div className="topology">
      <figure className="topology__figure">
        <svg viewBox="0 -30 560 470" className="topology__svg" role="img" aria-labelledby="topology-title topology-desc">
          <title id="topology-title">SAMS agent topology</title>
          <desc id="topology-desc">
            A planner feeds a coordinator, which assigns work to research, analysis and spatial agents. All three report to
            an execution agent.
          </desc>
          <defs>
            <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 0 L8 4 L0 8 z" fill="var(--line-strong)" />
            </marker>
          </defs>
          <line x1={280} y1={-24} x2={280} y2={22} className="topology__edge topology__edge--in" />
          {agentEdges.map(([a, b]) => {
            const p = nodeById[a];
            const q = nodeById[b];
            const id = `${a}-${b}`;
            return (
              <line
                key={id}
                x1={p.x}
                y1={p.y + 24}
                x2={q.x}
                y2={q.y - 26}
                className="topology__edge"
                data-active={activeEdge === id || undefined}
                markerEnd="url(#arrow)"
              />
            );
          })}
          {travelling ? (
            <circle
              key={`packet-${task}-${step}`}
              r={5}
              className="topology__packet"
              style={
                {
                  "--x1": `${from.x}px`,
                  "--y1": `${from.y + 24}px`,
                  "--x2": `${to.x}px`,
                  "--y2": `${to.y - 26}px`,
                  "--dur": `${STEP_MS * 0.7}ms`,
                } as CSSProperties
              }
            />
          ) : null}
          {agents.map((a) => {
            const state = current?.to === a.id ? "active" : visited.has(a.id) ? "done" : "idle";
            return (
              <g key={a.id} className="topology__node" data-state={state} transform={`translate(${a.x} ${a.y})`}>
                {state === "active" ? <circle r={34} className="topology__halo" key={`halo-${task}-${step}`} /> : null}
                <rect x={-62} y={-24} width={124} height={48} rx={6} />
                <text y={5} textAnchor="middle">
                  {a.label}
                </text>
              </g>
            );
          })}
        </svg>
        <figcaption className="demo-note">Controlled demonstration · scripted, deterministic, not connected to production</figcaption>
      </figure>

      <div className="topology__side">
        <div className="topology__controls">
          <span className="mono topology__task">Task #{String(task).padStart(3, "0")}</span>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setRunning((r) => !r)} aria-pressed={!running}>
            {running ? "Pause" : "Play"}
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={advance} disabled={running}>
            Step
          </button>
        </div>
        <div className="feed panel">
          <p className="eyebrow">Activity feed</p>
          <ol className="feed__list mono" role="log" aria-live={running ? "off" : "polite"} aria-label="Activity feed">
            {feed.length === 0 ? <li className="feed__empty">Waiting for task…</li> : null}
            {feed.map((line) => (
              <li key={line.id}>
                <time>{line.time}</time>
                <span>{line.text}</span>
              </li>
            ))}
          </ol>
        </div>
        <details className="text-alt">
          <summary>Agents as text</summary>
          <ul>
            {agents.map((a) => (
              <li key={a.id}>
                <strong>{a.label}</strong> — {a.role}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}
