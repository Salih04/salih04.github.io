import { FIRST_SEQ, replayScript, type EventType, type NodeId, type ScriptEvent } from "@/content/sams";

/**
 * Deterministic simulation of resumable event delivery, for the SAMS
 * failure demo. Pure: every function returns a new state, so the demo is
 * reproducible and the guarantees it shows are unit-tested.
 *
 * Two cursors move along one ordered log:
 *  - the server appends events while its worker is running;
 *  - the client applies events while it is connected.
 * Disconnecting stops only the client. Reconnecting sends `last_seq`; the
 * server replays the missed interval, then hands off to live delivery with
 * no gap and no duplicate. Stopping the worker pauses appends until a
 * replacement resumes the workflow from durable state.
 */

export type Delivery = "pending" | "live" | "replayed";
export type Connection = "connected" | "disconnected" | "replaying";
export type WorkerState = "running" | "stopped";

export interface LogEntry {
  seq: number;
  type: EventType;
  node: NodeId;
  note: string;
  step?: number;
  delivery: Delivery;
}

export interface ReplayState {
  started: boolean;
  log: LogEntry[];
  /** Index of the next script event the workflow will append. */
  next: number;
  /** Last sequence number the client has applied. */
  clientSeq: number;
  /** Every sequence number the client applied, in order (exactly-once check). */
  applied: number[];
  connection: Connection;
  worker: WorkerState;
  stoppedFor: number;
  /** `last_seq` sent on the most recent reconnect. */
  resumeFrom: number | null;
  /** Server position when replay started; live delivery continues after it. */
  handoffSeq: number | null;
  /** Plan step at which a replacement worker resumed, if the worker was stopped. */
  resumedAtStep: number | null;
  narration: string;
}

/** Ticks a stopped worker stays down before a replacement picks the workflow up. */
export const WORKER_RECOVERY_TICKS = 3;

export const pad = (seq: number) => String(seq).padStart(3, "0");

export function initialState(): ReplayState {
  return {
    started: false,
    log: [],
    next: 0,
    clientSeq: FIRST_SEQ - 1,
    applied: [],
    connection: "connected",
    worker: "running",
    stoppedFor: 0,
    resumeFrom: null,
    handoffSeq: null,
    resumedAtStep: null,
    narration: "Ready. Nothing has run yet.",
  };
}

export function start(): ReplayState {
  return { ...initialState(), started: true, narration: "Task submitted." };
}

export function serverSeq(s: ReplayState): number {
  return s.log.length ? s.log[s.log.length - 1]!.seq : FIRST_SEQ - 1;
}

/** Every script event has been appended. */
export function workflowDone(s: ReplayState, script: ScriptEvent[] = replayScript): boolean {
  return s.next >= script.length;
}

export function converged(s: ReplayState, script: ScriptEvent[] = replayScript): boolean {
  return s.started && workflowDone(s, script) && s.connection === "connected" && s.clientSeq === serverSeq(s);
}

/** The plan step the workflow is currently working on (1-based). */
export function currentStep(s: ReplayState): number {
  const done = s.log.filter((e) => e.type === "STEP_COMPLETED").length;
  return Math.min(done + 1, 3);
}

function append(s: ReplayState, e: Omit<LogEntry, "seq" | "delivery">): ReplayState {
  return { ...s, log: [...s.log, { ...e, seq: serverSeq(s) + 1, delivery: "pending" }] };
}

/** Advance the server by one tick: append the next event, or recover a stopped worker. */
export function serverTick(s: ReplayState, script: ScriptEvent[] = replayScript): ReplayState {
  if (!s.started) return s;
  if (s.worker === "stopped") {
    const stoppedFor = s.stoppedFor + 1;
    if (stoppedFor < WORKER_RECOVERY_TICKS) {
      return { ...s, stoppedFor, narration: `Worker down. The workflow's state is durable; it waits for a replacement worker.` };
    }
    const step = currentStep(s);
    const note = `A replacement worker resumed the workflow at step ${step}. Completed steps were not re-run.`;
    return { ...append(s, { type: "WORKFLOW_RESUMED", node: "workflow", note }), worker: "running", stoppedFor: 0, resumedAtStep: step, narration: note };
  }
  const event = script[s.next];
  if (!event) return s;
  const appended = append({ ...s, next: s.next + 1 }, event);
  const narration = s.connection === "connected" ? event.note : `Server appended ${pad(serverSeq(appended))} ${event.type}. The client is still at ${pad(s.clientSeq)}.`;
  return { ...appended, narration };
}

function deliver(s: ReplayState, upTo: number, how: Exclude<Delivery, "pending">): ReplayState {
  if (upTo <= s.clientSeq) return s;
  const applied = [...s.applied];
  const log = s.log.map((e) => {
    if (e.seq > s.clientSeq && e.seq <= upTo) {
      applied.push(e.seq);
      return { ...e, delivery: how };
    }
    return e;
  });
  return { ...s, log, applied, clientSeq: upTo };
}

/** Advance the client by one tick: apply live events, or replay one missed event. */
export function clientTick(s: ReplayState): ReplayState {
  if (!s.started) return s;
  if (s.connection === "connected") return deliver(s, serverSeq(s), "live");
  if (s.connection === "replaying" && s.handoffSeq !== null) {
    const next = deliver(s, s.clientSeq + 1, "replayed");
    if (next.clientSeq >= s.handoffSeq) {
      const after = s.handoffSeq + 1;
      return {
        ...next,
        connection: "connected",
        handoffSeq: null,
        narration:
          serverSeq(next) >= after
            ? `Replay complete. Live delivery continues from ${pad(after)}: no gap, no duplicate.`
            : `Replay complete. The client is back in sync at ${pad(next.clientSeq)}.`,
      };
    }
    return { ...next, narration: `Replaying ${pad(next.clientSeq)} of ${pad(s.handoffSeq)}…` };
  }
  return s;
}

/** One base tick of the demo: the server moves, then the client follows. */
export function tick(s: ReplayState, script: ScriptEvent[] = replayScript): ReplayState {
  return clientTick(serverTick(s, script));
}

export function disconnect(s: ReplayState): ReplayState {
  if (!s.started || s.connection === "disconnected") return s;
  return {
    ...s,
    connection: "disconnected",
    handoffSeq: null,
    narration: `Client disconnected at ${pad(s.clientSeq)}. The server keeps appending; the client cursor stops.`,
  };
}

export function reconnect(s: ReplayState): ReplayState {
  if (s.connection !== "disconnected") return s;
  const head = serverSeq(s);
  if (head === s.clientSeq) {
    return { ...s, connection: "connected", resumeFrom: s.clientSeq, narration: `Client reconnected with last_seq = ${pad(s.clientSeq)}. Nothing was missed.` };
  }
  return {
    ...s,
    connection: "replaying",
    resumeFrom: s.clientSeq,
    handoffSeq: head,
    narration: `Client reconnects with last_seq = ${pad(s.clientSeq)}. The server replays ${pad(s.clientSeq + 1)}–${pad(head)}.`,
  };
}

export function stopWorker(s: ReplayState, script: ScriptEvent[] = replayScript): ReplayState {
  if (!s.started || s.worker === "stopped" || workflowDone(s, script)) return s;
  return {
    ...s,
    worker: "stopped",
    stoppedFor: 0,
    narration: `Worker stopped during step ${currentStep(s)}. No new events until a replacement worker picks up the workflow.`,
  };
}
