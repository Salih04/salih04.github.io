"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { FigureLabel } from "@/components/records/FigureLabel";
import { useLab } from "@/components/shell/LabProvider";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { eventShortLabel, FIRST_SEQ, replayScript, topology, type NodeId } from "@/content/sams";
import {
  clientTick,
  converged,
  disconnect,
  initialState,
  pad,
  reconnect,
  serverSeq,
  start,
  stopWorker,
  tick,
  verify,
  workflowDone,
  type ReplayState,
} from "@/lib/replay";

const BASE_MS = 1150;
const REPLAY_MS = 460;

const nodeById = Object.fromEntries(topology.map((n) => [n.id, n])) as Record<NodeId, (typeof topology)[number]>;
const agents = topology.filter((n) => n.kind === "agent" || n.kind === "human");

const DELIVERY_LABEL = { live: "seen", replayed: "replayed", pending: "pending" } as const;

/** Row index of a sequence number in the event table (the log is contiguous from FIRST_SEQ). */
const rowOf = (seq: number) => seq - FIRST_SEQ;

/**
 * SAMS failure demo: a deterministic simulation of one task, drawn as a
 * machine with three regions — SYSTEM (schematic topology), EVENTS (the
 * ordered log with a server cursor and a client cursor) and CLIENT STATE.
 * The client is attached to the log by a cable at its cursor; a disconnect
 * breaks the cable, a reconnect replays the missed rows through the cursor
 * one by one. The engine is src/lib/replay.ts; nothing real is connected.
 */
export function FailureDemo({ startToken = 0 }: { startToken?: number }) {
  const { cue } = useLab();
  const [state, setState] = useState<ReplayState>(initialState);
  const [paused, setPaused] = useState(false);
  const [inspected, setInspected] = useState<NodeId>("workflow");
  const [everDisconnected, setEverDisconnected] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  const head = serverSeq(state);
  const done = workflowDone(state);
  const isConverged = converged(state);
  const behind = head - state.clientSeq;
  const running = state.started && !paused && !isConverged;

  // Base clock: the server appends, the client follows when connected.
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => setState((s) => tick(s)), BASE_MS);
    return () => window.clearInterval(t);
  }, [running]);

  // Replay clock: missed events pass through the client cursor one at a time.
  useEffect(() => {
    if (paused || state.connection !== "replaying") return;
    const t = window.setInterval(() => setState((s) => clientTick(s)), REPLAY_MS);
    return () => window.clearInterval(t);
  }, [paused, state.connection]);

  // Arriving on the page starts one run, so the machine is visibly working.
  // Under reduced motion the visitor starts it.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = window.setTimeout(() => setState((s) => (s.started ? s : start())), 700);
    return () => window.clearTimeout(t);
  }, []);

  // The page header's "Run failure demo" control starts a run here.
  useEffect(() => {
    if (startToken === 0) return;
    begin();
    statusRef.current?.focus();
  }, [startToken]);

  const last = state.log.at(-1);
  useEffect(() => {
    if (!last) return;
    cue(last.type === "TASK_COMPLETED" ? "complete" : last.type === "WORKFLOW_RESUMED" ? "warn" : "tick");
  }, [last, cue]);

  const begin = () => {
    setPaused(false);
    setEverDisconnected(false);
    setState(start());
  };

  const toggleConnection = () => {
    if (!state.started) return;
    if (state.connection === "disconnected") setState((s) => reconnect(s));
    else {
      setEverDisconnected(true);
      setState((s) => disconnect(s));
    }
  };

  const canStopWorker = state.started && !done && state.worker === "running";
  const onStopWorker = () => canStopWorker && setState((s) => stopWorker(s));

  // The last event each node produced.
  const nodeSeq = useMemo(() => {
    const m = new Map<NodeId, number>();
    for (const e of state.log) m.set(e.node, e.seq);
    return m;
  }, [state.log]);
  const activeNode = state.worker === "stopped" ? null : last?.node;
  const nodeState = (id: NodeId) => (activeNode === id && !isConverged ? "active" : nodeSeq.has(id) ? "done" : "idle");

  // Remaining script events render as empty slots, so the log never shifts.
  const slots = replayScript.length - state.next;
  const replayed = state.log.filter((e) => e.delivery === "replayed").map((e) => e.seq);
  const check = isConverged ? verify(state) : null;

  const syncLabel = !state.started
    ? "Idle"
    : isConverged
      ? "State converged"
      : state.connection === "replaying"
        ? `Replaying ${pad(state.clientSeq + 1)} → ${pad(state.handoffSeq ?? head)}`
        : state.connection === "disconnected"
          ? `Client behind by ${behind}`
          : behind > 0
            ? "Applying"
            : "In sync";

  const hint = !state.started
    ? "Start the task. Events append to the log and reach the client through its cursor."
    : isConverged
      ? everDisconnected || state.resumedAtStep
        ? "Same final state on both sides. Restart and try the other fault."
        : "Restart and disconnect the client mid-task, or stop the worker."
      : state.connection === "disconnected"
        ? "The server keeps appending. Reconnect when you like."
        : state.connection === "replaying"
          ? "Missed events replay first; live delivery continues after them."
          : state.worker === "stopped"
            ? "No new events while the worker is down."
            : "Try it: disconnect the client while the server keeps working.";

  // Screen readers hear interventions and outcomes, not every event.
  const announcement = !state.started
    ? ""
    : isConverged
      ? `State converged. Server ${pad(head)}, client ${pad(state.clientSeq)}.`
      : state.connection === "disconnected"
        ? `Client disconnected at ${pad(state.clientSeq)}.`
        : state.connection === "replaying"
          ? `Client reconnected with last sequence ${pad(state.resumeFrom ?? 0)}. Replaying missed events.`
          : state.worker === "stopped"
            ? "Worker stopped. Waiting for a replacement."
            : state.resumedAtStep
              ? `Workflow resumed at step ${state.resumedAtStep}.`
              : "Task running.";

  const node = nodeById[inspected];
  const connection = state.connection;
  const cursorStyle = (seq: number) => ({ "--row-i": rowOf(seq) }) as CSSProperties;

  return (
    <section
      className="instrument"
      aria-labelledby="demo-title"
      data-started={state.started || undefined}
      data-connection={connection}
      data-worker={state.worker}
      data-converged={isConverged || undefined}
    >
      <header className="instrument__head">
        <FigureLabel fig="01" kind="simulation" />
        <h2 id="demo-title" className="instrument__title">
          Failure demo <span>one task, two faults</span>
        </h2>
        <div className="instrument__controls" role="group" aria-label="Demo controls">
          <button type="button" className="ctl ctl--primary" onClick={begin}>
            {state.started ? "Restart task" : "Run failure demo"}
          </button>
          <button
            type="button"
            className="ctl"
            onClick={toggleConnection}
            aria-disabled={!state.started || undefined}
            aria-pressed={connection === "disconnected"}
            data-tone={connection === "disconnected" ? "fault" : undefined}
          >
            {connection === "disconnected" ? "Reconnect client" : "Disconnect client"}
          </button>
          <button type="button" className="ctl" onClick={onStopWorker} aria-disabled={!canStopWorker || undefined} data-tone={state.worker === "stopped" ? "fault" : undefined}>
            {state.worker === "stopped" ? "Worker stopped…" : "Stop worker"}
          </button>
          <span className="instrument__spacer" />
          <button type="button" className="ctl ctl--quiet" onClick={() => setPaused((p) => !p)} aria-disabled={!state.started || isConverged || undefined} aria-pressed={paused}>
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            type="button"
            className="ctl ctl--quiet"
            onClick={() => state.started && paused && setState((s) => (s.connection === "replaying" ? clientTick(s) : tick(s)))}
            aria-disabled={!state.started || !paused || undefined}
          >
            Step
          </button>
        </div>
      </header>

      <div className="machine">
        {/* ---- SYSTEM ---------------------------------------------------- */}
        <div className="machine__system" aria-labelledby="lane-system">
          <div className="lane__head">
            <h3 id="lane-system" className="lane__title">
              System
            </h3>
            <FigureLabel kind="schematic" className="fig-label--inline" />
          </div>
          <ol className="topo">
            <li className="topo__item" data-kind="entry" data-state={nodeState("api")}>
              <button type="button" className="topo__node" aria-pressed={inspected === "api"} onClick={() => setInspected("api")}>
                <span className="topo__mark" aria-hidden="true" />
                <span className="topo__label">{nodeById.api.label}</span>
                <span className="topo__seq">{nodeSeq.has("api") ? pad(nodeSeq.get("api")!) : ""}</span>
              </button>
            </li>
            <li className="topo__item" data-kind="coordinator" data-state={nodeState("workflow")}>
              <button type="button" className="topo__node" aria-pressed={inspected === "workflow"} onClick={() => setInspected("workflow")}>
                <span className="topo__label">{nodeById.workflow.label}</span>
                <span className="topo__worker" data-tone={state.worker === "stopped" ? "fault" : undefined}>
                  worker {state.worker === "stopped" ? "stopped" : state.resumedAtStep ? "replaced" : "running"}
                </span>
                <span className="topo__seq">{nodeSeq.has("workflow") ? pad(nodeSeq.get("workflow")!) : ""}</span>
              </button>
            </li>
            <li className="topo__bus">
              <ol>
                {agents.map((n) => (
                  <li key={n.id} className="topo__item" data-kind={n.kind} data-state={nodeState(n.id)}>
                    <button type="button" className="topo__node" aria-pressed={inspected === n.id} onClick={() => setInspected(n.id)}>
                      <span className="topo__mark" aria-hidden="true" />
                      <span className="topo__label">
                        {n.label}
                        {n.kind === "human" ? <span className="topo__human">human</span> : null}
                      </span>
                      <span className="topo__seq">{nodeSeq.has(n.id) ? pad(nodeSeq.get(n.id)!) : ""}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </li>
            <li className="topo__store" data-recovering={state.worker === "stopped" || undefined}>
              <span className="topo__store-rail" aria-hidden="true" />
              <span className="topo__store-label">Durable state</span>
              <span className="topo__store-note">tasks · ownership · decisions</span>
            </li>
          </ol>
          <p className="topo__inspect" aria-live="polite">
            <b>{node.label}.</b> {node.role}
          </p>
        </div>

        {/* ---- EVENTS ---------------------------------------------------- */}
        <div className="machine__events" aria-labelledby="lane-events">
          <div className="lane__head">
            <h3 id="lane-events" className="lane__title">
              Events
            </h3>
            <span className="lane__note mono">ordered · append-only</span>
          </div>
          <div className="evlog-wrap">
            <div className="evlog" role="table" aria-label="Event stream">
              <div className="evlog__row evlog__row--head" role="row">
                <span role="columnheader">Seq</span>
                <span role="columnheader">Event</span>
                <span role="columnheader" className="evlog__colDur">
                  Durability
                </span>
                <span role="columnheader">Client</span>
              </div>
              {state.log.map((e) => (
                <div
                  key={e.seq}
                  role="row"
                  className="evlog__row"
                  data-delivery={e.delivery}
                  data-client={e.seq === state.clientSeq || undefined}
                  data-head={e.seq === head || undefined}
                  data-resumed={e.type === "WORKFLOW_RESUMED" || undefined}
                >
                  <span role="cell" className="evlog__seq">
                    {pad(e.seq)}
                  </span>
                  <span role="cell" className="evlog__type" title={e.type}>
                    <span className="evlog__type-id">{e.type}</span>
                    <span className="evlog__type-short" aria-hidden="true">
                      {eventShortLabel[e.type]}
                    </span>
                  </span>
                  <span role="cell" className="evlog__dur evlog__colDur">
                    <i aria-hidden="true" /> retained
                  </span>
                  <span role="cell" className="evlog__delivery">
                    {DELIVERY_LABEL[e.delivery]}
                  </span>
                </div>
              ))}
              {Array.from({ length: slots }, (_, i) => (
                <div key={`slot-${i}`} role="row" className="evlog__row evlog__row--slot" aria-hidden="true">
                  <span className="evlog__seq">{pad(head + i + 1)}</span>
                  <span className="evlog__type">·</span>
                  <span className="evlog__colDur" />
                  <span />
                </div>
              ))}
            </div>

            {head >= FIRST_SEQ ? (
              <span className="evcur evcur--server" style={cursorStyle(head)} aria-hidden="true">
                server
              </span>
            ) : null}
            {state.clientSeq >= FIRST_SEQ ? (
              <span className="cable" style={cursorStyle(state.clientSeq)} data-state={connection} aria-hidden="true">
                <span className="cable__label">client</span>
                <i className="cable__a" />
                <i className="cable__b" />
              </span>
            ) : null}
          </div>
          <div className="instrument__log">
            <p className="instrument__narration">
              <span className="mono" aria-hidden="true">
                log ›
              </span>{" "}
              {state.narration}
            </p>
            <p className="instrument__hint">{hint}</p>
            <p className="sr-only" role="status" aria-live="polite">
              {announcement}
            </p>
          </div>
        </div>

        {/* ---- CLIENT STATE ---------------------------------------------- */}
        <div className="machine__client" aria-labelledby="lane-client">
          <div className="lane__head">
            <h3 id="lane-client" className="lane__title">
              Client state
            </h3>
          </div>
          <div className="readout" ref={statusRef} tabIndex={-1} aria-label="Simulation state">
            <div className="readout__pair">
              <div className="readout__cell" data-k="server">
                <span className="readout__k">Server</span>
                <span className="readout__v">{state.started ? pad(head) : "—"}</span>
              </div>
              <div className="readout__cell" data-k="client" data-behind={behind > 0 && state.started && connection !== "connected" ? "" : undefined}>
                <span className="readout__k">Client</span>
                <span className="readout__v">{state.started ? pad(state.clientSeq) : "—"}</span>
              </div>
            </div>
            <p className="readout__sync" data-converged={isConverged || undefined} data-behind={connection === "disconnected" || undefined}>
              {syncLabel}
            </p>
            <dl className="readout__rows">
              <div>
                <dt>Connection</dt>
                <dd data-tone={connection === "disconnected" ? "fault" : undefined}>
                  {connection === "connected" ? "Live" : connection === "replaying" ? "Replaying" : "Disconnected"}
                </dd>
              </div>
              <div>
                <dt>Worker</dt>
                <dd data-tone={state.worker === "stopped" ? "fault" : undefined}>
                  {state.worker === "stopped" ? "Stopped" : state.resumedAtStep ? "Replaced" : "Running"}
                </dd>
              </div>
            </dl>
            {state.resumeFrom !== null ? (
              <p className="readout__request mono">
                resume from <b>last_seq={pad(state.resumeFrom)}</b>
              </p>
            ) : null}
            {replayed.length ? (
              <p className="readout__replayed mono" aria-label={`Replayed ${replayed.map(pad).join(", ")}`}>
                {replayed.map((seq) => (
                  <span key={seq}>{pad(seq)}</span>
                ))}
              </p>
            ) : null}
          </div>

          {check ? (
            <div className="verify">
              <p className="verify__head">
                <span>Verification</span>
                <FigureLabel kind="simulation" className="fig-label--inline" />
              </p>
              <dl className="verify__rows">
                <div>
                  <dt>Sequence continuity</dt>
                  <dd data-pass={check.continuity || undefined}>{check.continuity ? "PASS" : "FAIL"}</dd>
                </div>
                <div>
                  <dt>Duplicate delivery</dt>
                  <dd data-pass={check.duplicates === 0 || undefined}>{check.duplicates === 0 ? "NONE" : check.duplicates}</dd>
                </div>
                <div>
                  <dt>Client convergence</dt>
                  <dd data-pass={check.convergence || undefined}>{check.convergence ? "PASS" : "FAIL"}</dd>
                </div>
                {check.stepsRerun !== null ? (
                  <div>
                    <dt>Steps re-run after recovery</dt>
                    <dd data-pass={check.stepsRerun === 0 || undefined}>{check.stepsRerun === 0 ? "NONE" : check.stepsRerun}</dd>
                  </div>
                ) : null}
              </dl>
              <p className="verify__note">Checked on this simulated run only.</p>
            </div>
          ) : null}
        </div>
      </div>

      <p className="instrument__caption">
        Simulation of one task: sequence numbers, not timestamps. In SAMS, when retained history cannot prove a missed interval is complete,
        the client receives an explicit gap instead of a replay that only looks complete.
      </p>
    </section>
  );
}
