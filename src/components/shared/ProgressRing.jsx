import STRINGS from '../../data/i18n.js';

const s = STRINGS.en;

export function ProgressRing({ value, size = 140, stroke = 12 }) {
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const clamped = Math.min(Math.abs(value), 100);
  const offset  = circ - (clamped / 100) * circ;
  const isNeg   = value < 0;
  const label   = s.res_reduction;

  return (
    <div className="progress-ring-wrap">
      <div className="progress-ring-label">{label}</div>
      <svg
        width={size}
        height={size}
        className="progress-ring"
        role="img"
        aria-label={`${value.toFixed(1)}% ${s.res_reduction}`}
      >
        <circle
          className="progress-ring__track"
          cx={size / 2} cy={size / 2}
          r={r}
          strokeWidth={stroke}
        />
        <circle
          className={`progress-ring__fill${isNeg ? ' over-baseline' : ''}`}
          cx={size / 2} cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          className="progress-ring__text"
          x="50%" y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size < 100 ? 18 : 26}
        >
          {value > 0 ? '+' : ''}{value.toFixed(1)}%
        </text>
        <text
          className="progress-ring__sub"
          x="50%" y="67%"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10}
        >
          {s.vs_baseline}
        </text>
      </svg>
    </div>
  );
}
