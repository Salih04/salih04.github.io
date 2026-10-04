"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FigureLabel } from "@/components/records/FigureLabel";
import { useLab } from "@/components/shell/LabProvider";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { replayScript, topology, type NodeId } from "@/content/sams";
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
  workflowDone,
  type ReplayState,
} from "@/lib/replay";

const BASE_MS = 1150;
const REPLAY_MS = 420;

const nodeById = Object.fromEntries(topology.map((n) => [n.id, n])) as Record<NodeId, (typeof topology)[number]>;
const branch = topology.filter((n) => n.kind === "agent" || n.kind === "human");

const DELIVERY_LABEL = { live: "live", replayed: "replayed", pending: "pending" } as const;

/**
 * SAMS failure demo: a deterministic simulation of one task, shown as two
 * lanes — the agent topology and the ordered event stream — with two
 * visitor-triggered faults: a client disconnect and a worker stop. The
 * engine is src/lib/replay.ts; nothing here is connected to a real system.
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

  // Replay clock: missed events replay faster than the server appends new ones.
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

  // The page header's "Run failure demo" button starts a run here.
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

  // Which nodes have produced events, and the last event each produced.
  const nodeSeq = useMemo(() => {
    const m = new Map<NodeId, number>();
    for (const e of state.log) m.set(e.node, e.seq);
    return m;
  }, [state.log]);
  const activeNode = state.worker === "stopped" ? null : last?.node;
  const nodeState = (id: NodeId) => (activeNode === id && !isConverged ? "active" : nodeSeq.has(id) ? "done" : "idle");

  // Remaining script events render as empty slots, so the log never shifts.
  const slots = replayScript.length - state.next;

  const syncLabel = !state.started
    ? "Idle"
    : isConverged
      ? "State converged ✓"
      : state.connection === "replaying"
        ? `Replaying ${pad(state.clientSeq + 1)} → ${pad(state.handoffSeq ?? head)}`
        : state.connection === "disconnected"
          ? `Client behind by ${behind}`
          : "In sync";

  const hint = !state.started
    ? "Start the task. Events append to the log on the right and reach the client."
    : isConverged
      ? everDisconnected || state.resumedAtStep
        ? "Same final state on both sides. Run again and try the other fault."
        : "Run again and disconnect the client mid-task, or stop the worker."
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

  return (
    <section className="instrument" aria-labelledby="demo-title" data-started={state.started || undefined}>
      <header className="instrument__head">
        <FigureLabel fig="01" kind="simulation" />
        <div className="instrument__title">
          <h2 id="demo-title">Failure demo · one task, two faults</h2>
          <p>Cut the client&apos;s connection or stop the worker mid-task, and watch the system recover.</p>
        </div>
      </header>

      <div className="instrument__controls" role="group" aria-label="Demo controls">
        <button type="button" className="ctl ctl--primary" onClick={begin}>
          {state.started ? "Restart task" : "Run failure demo"}
        </button>
        <button
          type="button"
          className="ctl"
          onClick={toggleConnection}
          aria-disabled={!state.started || undefined}
          aria-pressed={state.connection === "disconnected"}
          data-tone={state.connection === "disconnected" ? "fault" : undefined}
        >
          {state.connection === "disconnected" ? "Reconnect client" : "Disconnect client"}
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

      <div className="instrument__foot">
        <p className="instrument__narration">{state.narration}</p>
        <p className="instrument__hint">{hint}</p>
        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>
      </div>

      <div className="readout" ref={statusRef} tabIndex={-1} aria-label="Simulation state">
        <div className="readout__cell">
          <span className="readout__k">Server</span>
          <span className="readout__v">{state.started ? pad(head) : "—"}</span>
        </div>
        <div className="readout__cell" data-behind={behind > 0 && state.started ? "" : undefined}>
          <span className="readout__k">Client</span>
          <span className="readout__v">{state.started ? pad(state.clientSeq) : "—"}</span>
        </div>
        <div className="readout__cell readout__cell--wide" data-converged={isConverged || undefined}>
          <span className="readout__k">Sync</span>
          <span className="readout__v readout__v--text">{syncLabel}</span>
        </div>
        <div className="readout__cell">
          <span className="readout__k">Connection</span>
          <span className="readout__v readout__v--text" data-tone={state.connection === "disconnected" ? "fault" : undefined}>
            {state.connection === "connected" ? "Live" : state.connection === "replaying" ? "Replaying" : "Disconnected"}
          </span>
        </div>
        <div className="readout__cell">
          <span className="readout__k">Worker</span>
          <span className="readout__v readout__v--text" data-tone={state.worker === "stopped" ? "fault" : undefined}>
            {state.worker === "stopped" ? "Stopped" : state.resumedAtStep ? "Replaced" : "Running"}
          </span>
        </div>
        {state.resumeFrom !== null ? (
          <p className="readout__request mono">
            client → server <b>resume last_seq = {pad(state.resumeFrom)}</b>
          </p>
        ) : null}
      </div>

      <div className="instrument__lanes">
        <div className="lane lane--topology" aria-labelledby="lane-a">
          <div className="lane__head">
            <h3 id="lane-a" className="lane__title">
              <span className="lane__key">A</span> Agent topology
            </h3>
            <FigureLabel kind="schematic" className="fig-label--inline" />
          </div>
          <ol className="spine">
            {(["api", "workflow"] as const).map((id) => (
              <li key={id} className="spine__item" data-state={nodeState(id)} data-kind={nodeById[id].kind}>
                <button type="button" className="spine__node" aria-pressed={inspected === id} onClick={() => setInspected(id)}>
                  <span className="spine__label">{nodeById[id].label}</span>
                  {id === "workflow" ? (
                    <span className="spine__worker" data-tone={state.worker === "stopped" ? "fault" : undefined}>
                      worker {state.worker === "stopped" ? "stopped" : state.resumedAtStep ? "replaced" : "running"}
                    </span>
                  ) : null}
                  <span className="spine__seq">{nodeSeq.has(id) ? pad(nodeSeq.get(id)!) : ""}</span>
                </button>
              </li>
            ))}
            <li className="spine__branch">
              <ol>
                {branch.map((n) => (
                  <li key={n.id} className="spine__item" data-state={nodeState(n.id)} data-kind={n.kind}>
                    <button type="button" className="spine__node" aria-pressed={inspected === n.id} onClick={() => setInspected(n.id)}>
                      <span className="spine__label">
                        {n.label}
                        {n.kind === "human" ? <span className="spine__human">human</span> : null}
                      </span>
                      <span className="spine__seq">{nodeSeq.has(n.id) ? pad(nodeSeq.get(n.id)!) : ""}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </li>
          </ol>
          <p className="spine__inspect" aria-live="polite">
            <b>{node.label}.</b> {node.role}
          </p>
        </div>

        <div className="lane lane--events" aria-labelledby="lane-b">
          <div className="lane__head">
            <h3 id="lane-b" className="lane__title">
              <span className="lane__key">B</span> Event stream
            </h3>
            <span className="lane__note mono">ordered · append-only</span>
          </div>
          <div className="evlog" role="table" aria-label="Event stream">
            <div className="evlog__row evlog__row--head" role="row">
              <span role="columnheader">Seq</span>
              <span role="columnheader">Event</span>
              <span role="columnheader" className="evlog__colLog">Log</span>
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
                <span role="cell" className="evlog__type">
                  {e.type}
                </span>
                <span role="cell" className="evlog__log evlog__colLog">
                  appended
                </span>
                <span role="cell" className="evlog__client">
                  <span className="evlog__delivery">{DELIVERY_LABEL[e.delivery]}</span>
                  <span className="evlog__cursors">
                    {e.seq === head ? <span className="cursor cursor--server">server</span> : null}
                    {e.seq === state.clientSeq ? <span className="cursor cursor--client">client</span> : null}
                  </span>
                </span>
              </div>
            ))}
            {Array.from({ length: slots }, (_, i) => (
              <div key={`slot-${i}`} role="row" className="evlog__row evlog__row--slot" aria-hidden="true">
                <span className="evlog__seq">{pad(head + i + 1)}</span>
                <span className="evlog__type">·</span>
                <span className="evlog__colLog" />
                <span />
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="instrument__caption">
        Simulation of one task: sequence numbers, not timestamps. In SAMS, when retained history cannot prove a missed interval is complete,
        the client receives an explicit gap instead of a replay that only looks complete.
      </p>
    </section>
  );
}
