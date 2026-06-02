import { useApp } from '../../store/AppContext.jsx';
import STRINGS from '../../data/i18n.js';

export function SectionA() {
  const { state, dispatch } = useApp();
  const s = STRINGS[state.language];
  const { lightingDB } = state;

  function update(index, field, value) {
    const sanitised = field === 'watts'
      ? Math.max(0, parseFloat(value) || 0)
      : String(value).slice(0, 200);
    dispatch({ type: 'UPDATE_LAMP', payload: { index, field, value: sanitised } });
  }

  return (
    <section className="section-card">
      <div className="section-card__header">
        <div className="section-card__title-block">
          <h2 className="section-card__title">
            <span className="section-card__title-badge">A</span>
            {s.sec_a}
          </h2>
          <p className="section-card__sub">{s.sec_a_sub}</p>
        </div>
      </div>

      <div className="section-card__body">
        {lightingDB.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined">lightbulb</span>
            <p>{s.no_lamps_yet}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 64 }}>{s.col_code}</th>
                <th style={{ minWidth: 160 }}>{s.col_name}</th>
                <th style={{ minWidth: 140 }}>{s.col_mfr}</th>
                <th style={{ minWidth: 120 }}>{s.col_type}</th>
                <th style={{ width: 110 }}>{s.col_watts}</th>
                <th style={{ width: 48 }}>{s.col_actions}</th>
              </tr>
            </thead>
            <tbody>
              {lightingDB.map((lamp, i) => (
                <tr key={lamp.code}>
                  <td>
                    <span className="table-code-badge">{lamp.code}</span>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={lamp.name}
                      onChange={(e) => update(i, 'name', e.target.value)}
                      placeholder="e.g. LED Panel 10W"
                      maxLength={200}
                      aria-label={`Lamp ${lamp.code} name`}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={lamp.manufacturer}
                      onChange={(e) => update(i, 'manufacturer', e.target.value)}
                      placeholder="e.g. Philips"
                      maxLength={200}
                      aria-label={`Lamp ${lamp.code} manufacturer`}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={lamp.type}
                      onChange={(e) => update(i, 'type', e.target.value)}
                      placeholder="e.g. LED"
                      maxLength={200}
                      aria-label={`Lamp ${lamp.code} type`}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={lamp.watts || ''}
                      onChange={(e) => update(i, 'watts', e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      className="tabular"
                      aria-label={`Lamp ${lamp.code} watts`}
                      style={{ textAlign: 'right' }}
                    />
                  </td>
                  <td>
                    <button
                      className="btn-danger btn"
                      onClick={() => dispatch({ type: 'DELETE_LAMP', payload: i })}
                      aria-label={`Delete lamp ${lamp.code}`}
                      title="Delete"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="section-card__footer">
        <button
          className="btn-add-row"
          onClick={() => dispatch({ type: 'ADD_LAMP' })}
        >
          <span className="material-symbols-outlined">add</span>
          {s.add_lamp_db}
        </button>
      </div>
    </section>
  );
}
