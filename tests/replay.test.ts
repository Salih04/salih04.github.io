import { describe, expect, it } from "vitest";
import { FIRST_SEQ, replayScript } from "@/content/sams";
import {
  WORKER_RECOVERY_TICKS,
  clientTick,
  converged,
  disconnect,
  reconnect,
  serverSeq,
  start,
  stopWorker,
  tick,
  verify,
  type ReplayState,
} from "@/lib/replay";

const run = (s: ReplayState, n: number) => Array.from({ length: n }).reduce<ReplayState>((acc) => tick(acc), s);
const untilConverged = (s: ReplayState) => {
  let cur = s;
  for (let i = 0; i < 200 && !converged(cur); i++) cur = tick(cur);
  return cur;
};
const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

describe("replay simulation", () => {
  it("runs the task to completion and converges without interventions", () => {
    const s = untilConverged(start());
    expect(converged(s)).toBe(true);
    expect(s.log.map((e) => e.seq)).toEqual(range(FIRST_SEQ, FIRST_SEQ + replayScript.length - 1));
    expect(s.log.every((e) => e.delivery === "live")).toBe(true);
  });

  it("keeps appending on the server while the client is disconnected", () => {
    const s = run(disconnect(run(start(), 1)), 6);
    expect(s.clientSeq).toBe(FIRST_SEQ);
    expect(serverSeq(s)).toBe(FIRST_SEQ + 6);
    expect(s.log.filter((e) => e.delivery === "pending").map((e) => e.seq)).toEqual(range(FIRST_SEQ + 1, FIRST_SEQ + 6));
  });

  it("replays the missed interval from last_seq, then converges with every event applied exactly once, in order", () => {
    const behind = run(disconnect(run(start(), 1)), 6);
    const resumed = reconnect(behind);
    expect(resumed.resumeFrom).toBe(FIRST_SEQ);
    expect(resumed.connection).toBe("replaying");
    const done = untilConverged(resumed);
    expect(converged(done)).toBe(true);
    expect(done.applied).toEqual(range(FIRST_SEQ, serverSeq(done)));
    expect(done.log.filter((e) => e.delivery === "replayed").map((e) => e.seq)).toEqual(range(FIRST_SEQ + 1, FIRST_SEQ + 6));
  });

  it("hands off from replay to live delivery with no gap or duplicate while the server keeps appending", () => {
    let s = reconnect(run(disconnect(run(start(), 1)), 4));
    // The server keeps moving during replay; the client replays one event per fast tick in between.
    for (let i = 0; i < 40 && !converged(s); i++) s = i % 3 === 0 ? tick(s) : clientTick(s);
    expect(converged(s)).toBe(true);
    expect(new Set(s.applied).size).toBe(s.applied.length);
    expect(s.applied).toEqual(range(FIRST_SEQ, serverSeq(s)));
  });

  it("pauses appends while the worker is stopped and resumes without re-running completed steps", () => {
    const before = run(start(), 5);
    const stopped = stopWorker(before);
    const held = run(stopped, WORKER_RECOVERY_TICKS - 1);
    expect(serverSeq(held)).toBe(serverSeq(before));
    const resumed = run(held, 1);
    expect(resumed.log.at(-1)?.type).toBe("WORKFLOW_RESUMED");
    expect(resumed.resumedAtStep).toBe(3);
    const done = untilConverged(resumed);
    const steps = done.log.filter((e) => e.type === "STEP_COMPLETED").map((e) => e.step);
    expect(steps).toEqual([1, 2, 3]);
    expect(converged(done)).toBe(true);
  });

  it("is deterministic for the same sequence of actions", () => {
    const script = (s: ReplayState) => untilConverged(reconnect(run(stopWorker(disconnect(run(s, 2))), 5)));
    expect(script(start())).toEqual(script(start()));
  });
});

describe("verification readout", () => {
  it("passes continuity, finds no duplicates and converges after a disconnect and replay", () => {
    const v = verify(untilConverged(reconnect(run(disconnect(run(start(), 1)), 6))));
    expect(v).toEqual({ continuity: true, duplicates: 0, convergence: true, stepsRerun: null });
  });

  it("reports no re-run steps after a worker is replaced", () => {
    const v = verify(untilConverged(stopWorker(run(start(), 4))));
    expect(v.stepsRerun).toBe(0);
    expect(v.convergence).toBe(true);
  });

  it("does not report convergence while the client is behind", () => {
    const v = verify(run(disconnect(run(start(), 1)), 3));
    expect(v.convergence).toBe(false);
    expect(v.continuity).toBe(true);
  });

  it("would catch a duplicate or a gap in the applied list", () => {
    const s = untilConverged(start());
    expect(verify({ ...s, applied: [...s.applied, s.applied[0]!] }).duplicates).toBe(1);
    expect(verify({ ...s, applied: s.applied.filter((seq) => seq !== FIRST_SEQ + 2) }).continuity).toBe(false);
  });
});
