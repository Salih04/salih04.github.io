import { FigureLabel } from "@/components/records/FigureLabel";

/** Expanding-window walk-forward evaluation: train on everything before the test window, then test on that window. */
export function WalkForward({ folds = 4, fig = "06" }: { folds?: number; fig?: string }) {
  const W = 600;
  const rowH = 30;
  const H = folds * rowH + 36;
  const unit = (W - 80) / (folds + 3);
  return (
    <figure className="walk plate plate--paper">
      <FigureLabel fig={fig} kind="schematic" className="plate__label" />
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="walk-title">
        <title id="walk-title">Expanding-window walk-forward evaluation: each fold trains on all earlier data, then tests on the next window.</title>
        {Array.from({ length: folds }, (_, i) => {
          const y = 8 + i * rowH;
          const trainW = unit * (2 + i);
          return (
            <g key={i}>
              <text x={0} y={y + 15} className="walk__label">
                Fold {i + 1}
              </text>
              <rect x={70} y={y} width={trainW - 3} height={20} className="walk__train" />
              <rect x={70 + trainW} y={y} width={unit - 3} height={20} className="walk__test" />
            </g>
          );
        })}
        <line x1={70} x2={W - 6} y1={H - 16} y2={H - 16} className="walk__axis" />
        <text x={W - 6} y={H - 2} textAnchor="end" className="walk__label">
          time →
        </text>
      </svg>
      <figcaption className="pit__legend">
        <span>
          <i className="lg lg--train" /> train: everything before the test window
        </span>
        <span>
          <i className="lg lg--test" /> test: the next window
        </span>
      </figcaption>
    </figure>
  );
}
