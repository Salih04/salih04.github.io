/**
 * Interface sound, synthesized at runtime — no audio files are shipped.
 * Sound is off by default and only plays after the visitor enables it.
 */

export type Cue = "tick" | "step" | "complete" | "warn";

let ctx: AudioContext | null = null;

const CUES: Record<Cue, { freq: number; to?: number; dur: number; gain: number; type: OscillatorType }> = {
  tick: { freq: 1320, dur: 0.035, gain: 0.025, type: "sine" },
  step: { freq: 660, to: 880, dur: 0.09, gain: 0.03, type: "triangle" },
  complete: { freq: 523, to: 1046, dur: 0.32, gain: 0.04, type: "sine" },
  warn: { freq: 220, to: 180, dur: 0.22, gain: 0.04, type: "square" },
};

export function playCue(cue: Cue) {
  if (typeof window === "undefined") return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    const spec = CUES[cue];
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = spec.type;
    osc.frequency.setValueAtTime(spec.freq, t);
    if (spec.to) osc.frequency.exponentialRampToValueAtTime(spec.to, t + spec.dur);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(spec.gain, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + spec.dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + spec.dur + 0.02);
  } catch {
    // Audio is decorative; never let it break the interface.
  }
}
