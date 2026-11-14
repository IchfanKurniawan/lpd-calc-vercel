import { useApp } from '../../store/AppContext.jsx';
import STRINGS from '../../data/i18n.js';
import { isRoomComplete } from '../../engine/calculator.js';
import { ProgressRing } from '../shared/ProgressRing.jsx';

const s = STRINGS.en;

export function SectionC() {
  const { computed, state } = useApp();
  const { totalArea, lpdBaseline, lpdDesign, reductionPct } = computed;
  const incompleteCount = state.rooms.filter((room) => !isRoomComplete(room)).length;
  const canCalculate = incompleteCount === 0;

  return (
    <section className="section-card">
      <div className="section-card__header">
        <div className="section-card__title-block">
          <h2 className="section-card__title">
            <span className="section-card__title-badge">C</span>
            {s.sec_c}
          </h2>
          <p className="section-card__sub">{s.sec_c_sub}</p>
        </div>
      </div>

      {canCalculate ? (
        <div className="results-grid">
          <MetricCard
            label={s.res_total_area}
            value={totalArea.toFixed(2)}
            unit={s.unit_m2}
            icon="straighten"
          />
          <MetricCard
            label={s.res_baseline}
            value={lpdBaseline.toFixed(3)}
            unit={s.unit_wm2}
            icon="bolt"
          />
          <MetricCard
            label={s.res_design}
            value={lpdDesign.toFixed(3)}
            unit={s.unit_wm2}
            icon="electric_bolt"
            highlight={lpdBaseline > 0 && lpdDesign < lpdBaseline}
            warn={lpdBaseline > 0 && lpdDesign > lpdBaseline}
          />

          <ProgressRing value={reductionPct} size={148} stroke={13} />
        </div>
      ) : (
        <div className="results-blocked" role="status">
          <span className="material-symbols-outlined" aria-hidden="true">warning</span>
          <p>{s.results_blocked.replace('{count}', String(incompleteCount))}</p>
        </div>
      )}
    </section>
  );
}

function MetricCard({ label, value, unit, icon, highlight, warn }) {
  const borderColor = highlight
    ? 'rgba(216,241,221,0.85)'
    : warn
    ? 'rgba(164,93,11,0.4)'
    : 'var(--slate-200)';

  const valueColor = highlight
    ? 'var(--deep-teal)'
    : warn
    ? 'var(--amber)'
    : 'var(--jet-gray)';

  const bg = highlight
    ? 'rgba(216,241,221,0.24)'
    : warn
    ? 'rgba(164,93,11,0.07)'
    : 'var(--slate-50)';

  return (
    <div
      className="metric-card"
      style={{ borderColor, background: bg }}
    >
      <div className="metric-card__label">
        <span
          className="material-symbols-outlined"
          aria-hidden="true"
          style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4, color: 'var(--slate-400)' }}
        >
          {icon}
        </span>
        {label}
      </div>
      <div className="metric-card__value tabular" style={{ color: valueColor }}>
        {value}
      </div>
      <div className="metric-card__unit">{unit}</div>
    </div>
  );
}
