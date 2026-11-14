import { useState } from 'react';
import { useApp } from '../../store/AppContext.jsx';
import STRINGS from '../../data/i18n.js';
import { countLampUsage } from '../../engine/calculator.js';
import { ConfirmDialog } from '../shared/ConfirmDialog.jsx';

const s = STRINGS.en;

export function SectionA() {
  const { state, dispatch } = useApp();
  const { lightingDB, rooms } = state;
  const [deletePending, setDeletePending] = useState(null);

  function update(index, field, value) {
    const sanitised = field === 'watts'
      ? Math.max(0, parseFloat(value) || 0)
      : String(value).slice(0, 200);
    dispatch({ type: 'UPDATE_LAMP', payload: { index, field, value: sanitised } });
  }

  /** Any room row that currently references this lamp code counts as usage. */
  function requestDelete(index) {
    const lamp = lightingDB[index];
    if (!lamp) return;
    const usedCount = countLampUsage(rooms, lamp.code);

    if (usedCount === 0) {
      dispatch({ type: 'DELETE_LAMP', payload: index });
      return;
    }
    setDeletePending({ index, code: lamp.code, usedCount });
  }

  function confirmDelete() {
    dispatch({ type: 'DELETE_LAMP', payload: deletePending.index });
    setDeletePending(null);
  }

  return (
    <>
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
              <span className="material-symbols-outlined" aria-hidden="true">lightbulb</span>
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
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '4px 6px' }}
                          onClick={() => dispatch({ type: 'DUPLICATE_LAMP', payload: i })}
                          aria-label={`Duplicate lamp ${lamp.code}`}
                          title="Duplicate"
                        >
                          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>content_copy</span>
                        </button>
                        <button
                          className="btn-danger btn"
                          onClick={() => requestDelete(i)}
                          aria-label={`Delete lamp ${lamp.code}`}
                          title="Delete"
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                        </button>
                      </div>
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
            <span className="material-symbols-outlined" aria-hidden="true">add</span>
            {s.add_lamp_db}
          </button>
        </div>
      </section>

      {deletePending && (
        <ConfirmDialog
          title={s.confirm_delete_lamp_title}
          body={s.confirm_delete_lamp_body
            .replace('{code}', deletePending.code)
            .replace('{count}', String(deletePending.usedCount))}
          confirmLabel={s.confirm_delete_lamp_confirm}
          cancelLabel={s.confirm_cancel}
          confirmTone="danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeletePending(null)}
          returnFocusSelectors={['.section-card__footer .btn-add-row', '.sidebar__cta button']}
        />
      )}
    </>
  );
}
