/** Walk-forward validation folds: train on the past, embargo, test on what follows. */
export function WalkForward({ folds = 5 }: { folds?: number }) {
  const W = 600;
  const rowH = 26;
  const H = folds * rowH + 34;
  const unit = (W - 70) / (folds + 4);
  return (
    <figure className="walk">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby="walk-title">
        <title id="walk-title">Walk-forward validation: each fold trains on all earlier data, skips an embargo gap, then tests on the next window.</title>
        {Array.from({ length: folds }, (_, i) => {
          const y = 8 + i * rowH;
          const trainW = unit * (3 + i);
          return (
            <g key={i}>
              <text x={0} y={y + 14} className="walk__label">
                Fold {i + 1}
              </text>
              <rect x={60} y={y} width={trainW - 2} height={18} rx={3} className="walk__train" />
              <rect x={60 + trainW} y={y} width={unit * 0.35} height={18} className="walk__gap" />
              <rect x={60 + trainW + unit * 0.35 + 2} y={y} width={unit - 4} height={18} rx={3} className="walk__test" />
            </g>
          );
        })}
        <line x1={60} x2={W - 6} y1={H - 14} y2={H - 14} className="walk__axis" />
        <text x={W - 6} y={H - 2} textAnchor="end" className="walk__label">
          time →
        </text>
      </svg>
      <figcaption className="timeline__legend">
        <span>
          <i className="lg lg--train" /> train (past only)
        </span>
        <span>
          <i className="lg lg--gap" /> embargo gap
        </span>
        <span>
          <i className="lg lg--test" /> test (next window)
        </span>
      </figcaption>
    </figure>
  );
}
