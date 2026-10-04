import type { FigureKind } from "@/content/types";

export const FIGURE_KINDS: Record<FigureKind, { label: string; meaning: string }> = {
  simulation: { label: "Simulation", meaning: "A deterministic demonstration of system behaviour. Nothing real is connected." },
  synthetic: { label: "Synthetic data", meaning: "Invented entities or numerical values. Not research results." },
  schematic: { label: "Schematic", meaning: "A conceptual representation of a real architecture or method. Not to scale, not exhaustive." },
};

/**
 * Plate label for a figure: `FIG. 03 · SIMULATION`. It sits in the top-left
 * corner of the figure frame and stays visible in every state of the figure.
 */
export function FigureLabel({ kind, fig, className = "" }: { kind: FigureKind; fig?: string; className?: string }) {
  const k = FIGURE_KINDS[kind];
  return (
    <span className={`fig-label ${className}`} data-kind={kind} title={k.meaning}>
      {fig ? <span className="fig-label__n">Fig. {fig}</span> : null}
      <span className="fig-label__kind">{k.label}</span>
      <span className="sr-only">: {k.meaning}</span>
    </span>
  );
}
