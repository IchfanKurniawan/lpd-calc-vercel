import { useApp } from '../../store/AppContext.jsx';
import STRINGS from '../../data/i18n.js';
import SNI_DATABASE from '../../data/sniDatabase.js';
import { getSNILPD, getRoomDesignLPD, isRoomComplete } from '../../engine/calculator.js';

const s = STRINGS.en;

/**
 * Row-level completeness marker. The native title acts as the hover tooltip
 * and the aria-label exposes the same message to assistive technology.
 */
function RoomStatus({ complete }) {
  const label = complete ? s.room_status_complete : s.room_status_incomplete;
  return (
    <span
      className={`room-status ${complete ? 'room-status--complete' : 'room-status--incomplete'}`}
      role="img"
      aria-label={label}
      title={label}
    >
      <span className="material-symbols-outlined" aria-hidden="true">
        {complete ? 'check_circle' : 'warning'}
      </span>
    </span>
  );
}

export function SectionB() {
  const { state, dispatch } = useApp();
  const { rooms, lightingDB } = state;
  const shared = { s, lightingDB, dispatch };

  return (
    <section className="section-card">
      <div className="section-card__header">
        <div className="section-card__title-block">
          <h2 className="section-card__title">
            <span className="section-card__title-badge">B</span>
            {s.sec_b}
          </h2>
          <p className="section-card__sub">{s.sec_b_sub}</p>
        </div>
        {rooms.length > 0 && (
          <span style={{ fontSize: 12, color: 'var(--slate-400)' }} className="tabular">
            {rooms.length} rooms
          </span>
        )}
      </div>

      {lightingDB.length === 0 && rooms.length === 0 && (
        <div className="info-banner">
          <span className="material-symbols-outlined" aria-hidden="true">info</span>
          <span>
            Add lamp types in Table A first before filling in room data.
          </span>
        </div>
      )}

      {/* Desktop table */}
      <div className="room-table-desktop section-card__body">
        {rooms.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined" aria-hidden="true">meeting_room</span>
            <p>{s.no_rooms_yet}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 44 }}>{s.col_no}</th>
                <th style={{ minWidth: 150 }}>{s.col_room}</th>
                <th style={{ minWidth: 175 }}>{s.col_typology}</th>
                <th style={{ minWidth: 195 }}>{s.col_room_type}</th>
                <th style={{ width: 100 }}>{s.col_area}</th>
                <th style={{ minWidth: 260 }}>{s.col_lamps}</th>
                <th style={{ width: 100, textAlign: 'right' }}>{s.col_std_lpd}</th>
                <th style={{ width: 110, textAlign: 'right' }}>{s.col_design_lpd}</th>
                <th style={{ width: 96 }}></th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, idx) => (
                <DesktopRow key={room.id} room={room} idx={idx} {...shared} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Mobile cards */}
      <div className="room-cards">
        {rooms.length === 0 ? (
          <div className="empty-state">
            <span className="material-symbols-outlined" aria-hidden="true">meeting_room</span>
            <p>{s.no_rooms_yet}</p>
          </div>
        ) : (
          rooms.map((room, idx) => (
            <MobileCard key={room.id} room={room} idx={idx} {...shared} />
          ))
        )}
      </div>

      <div className="section-card__footer">
        <button className="btn-add-row" onClick={() => dispatch({ type: 'ADD_ROOM' })}>
          <span className="material-symbols-outlined" aria-hidden="true">add</span>
          {s.add_room}
        </button>
        <p className="section-note" style={{ marginTop: 8, fontSize: 12, color: 'var(--slate-500)', lineHeight: 1.4 }}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ verticalAlign: 'middle', fontSize: 14, marginRight: 4 }}>info</span>
          Only lamp types with both <strong>Name</strong> and <strong>Power (W)</strong> completed in Table A appear in the Lighting System dropdown.
        </p>
      </div>
    </section>
  );
}

function useRoomHelpers(room, lightingDB, dispatch) {
  const typologyOptions = Object.entries(SNI_DATABASE).map(([key, val]) => ({
    key, label: val.label.en,
  }));
  const roomOptions = room.typology
    ? (SNI_DATABASE[room.typology]?.rooms ?? []).map((r) => ({ id: r.id, label: r.label.en }))
    : [];
  const stdLPD    = getSNILPD(room.typology, room.roomType);
  const designLPD = getRoomDesignLPD(room, lightingDB);
  const isOver    = designLPD > stdLPD && stdLPD > 0 && room.area > 0;

  function update(field, value) {
    dispatch({ type: 'UPDATE_ROOM', payload: { id: room.id, field, value } });
  }

  return { typologyOptions, roomOptions, stdLPD, designLPD, isOver, update };
}

/* ── Desktop Table Row ── */
function DesktopRow({ room, idx, s, lightingDB, dispatch }) {
  const { typologyOptions, roomOptions, stdLPD, designLPD, isOver, update } =
    useRoomHelpers(room, lightingDB, dispatch);

  return (
    <tr className={isOver ? 'row-over-baseline' : ''}>
      <td>
        <span style={{ color: 'var(--slate-400)', fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
          {idx + 1}
        </span>
      </td>
      <td>
        <input
          type="text"
          aria-label={`${s.col_room} ${idx + 1}`}
          value={room.roomName}
          onChange={(e) => update('roomName', e.target.value)}
          placeholder="Room name…"
          maxLength={200}
        />
      </td>
      <td>
        <select aria-label={`${s.col_typology} ${idx + 1}`} value={room.typology} onChange={(e) => update('typology', e.target.value)}>
          <option value="">{s.select_typology}</option>
          {typologyOptions.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      </td>
      <td>
        <select aria-label={`${s.col_room_type} ${idx + 1}`} value={room.roomType} onChange={(e) => update('roomType', e.target.value)} disabled={!room.typology}>
          <option value="">{s.select_room_type}</option>
          {roomOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
      </td>
      <td>
        <input
          type="number" value={room.area || ''} placeholder="0" min="0" step="0.1"
          aria-label={`${s.col_area} ${idx + 1}`}
          className="tabular" style={{ textAlign: 'right' }}
          onChange={(e) => update('area', Math.max(0, parseFloat(e.target.value) || 0))}
        />
      </td>
      <td>
        <LampSlots room={room} s={s} lightingDB={lightingDB} dispatch={dispatch} />
      </td>
      <td style={{ textAlign: 'right' }}>
        {stdLPD > 0
          ? <span className="tabular" style={{ fontSize: 13 }}>{stdLPD.toFixed(2)}</span>
          : <span style={{ color: 'var(--slate-300)', fontSize: 13 }}>—</span>}
      </td>
      <td style={{ textAlign: 'right' }}>
        {room.area > 0 && room.lamps.length > 0
          ? <span className="tabular" style={{ fontSize: 13, fontWeight: 600, color: isOver ? 'var(--amber)' : 'var(--deep-teal)' }}>{designLPD.toFixed(2)}</span>
          : <span style={{ color: 'var(--slate-300)', fontSize: 13 }}>—</span>}
      </td>
      <td>
        <div className="row-actions">
          <RoomStatus complete={isRoomComplete(room)} />
          <button className="btn btn-ghost" style={{ padding: '4px 6px' }}
            title="Duplicate"
            aria-label={`Duplicate ${room.roomName || idx + 1}`}
            onClick={() => dispatch({ type: 'DUPLICATE_ROOM', payload: room.id })}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 15 }}>content_copy</span>
          </button>
          <button className="btn btn-danger" style={{ padding: '4px 6px' }}
            title="Delete"
            aria-label={`Delete ${room.roomName || idx + 1}`}
            onClick={() => dispatch({ type: 'DELETE_ROOM', payload: room.id })}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 15 }}>delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ── Mobile Card ── */
function MobileCard({ room, idx, s, lightingDB, dispatch }) {
  const { typologyOptions, roomOptions, stdLPD, designLPD, isOver, update } =
    useRoomHelpers(room, lightingDB, dispatch);

  return (
    <div className="room-card">
      <div className="room-card__header">
        <span className="room-card__num">{idx + 1}</span>
        <input className="room-card__name-input" type="text" value={room.roomName}
          aria-label={`${s.col_room} ${idx + 1}`}
          onChange={(e) => update('roomName', e.target.value)}
          placeholder="Room name…" maxLength={200} />
        <RoomStatus complete={isRoomComplete(room)} />
        <button className="btn btn-ghost" style={{ padding: '4px 6px' }}
          aria-label={`Duplicate ${room.roomName || idx + 1}`}
          onClick={() => dispatch({ type: 'DUPLICATE_ROOM', payload: room.id })}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>content_copy</span>
        </button>
        <button className="btn btn-danger" style={{ padding: '4px 6px' }}
          aria-label={`Delete ${room.roomName || idx + 1}`}
          onClick={() => dispatch({ type: 'DELETE_ROOM', payload: room.id })}>
          <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>delete</span>
        </button>
      </div>

      <div className="room-card__grid">
        <div className="room-card__field" style={{ gridColumn: '1 / -1' }}>
          <label>{s.col_typology}</label>
          <select aria-label={`${s.col_typology} ${idx + 1}`} value={room.typology} onChange={(e) => update('typology', e.target.value)}>
            <option value="">{s.select_typology}</option>
            {typologyOptions.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>
        <div className="room-card__field" style={{ gridColumn: '1 / -1' }}>
          <label>{s.col_room_type}</label>
          <select aria-label={`${s.col_room_type} ${idx + 1}`} value={room.roomType} onChange={(e) => update('roomType', e.target.value)} disabled={!room.typology}>
            <option value="">{s.select_room_type}</option>
            {roomOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>
        <div className="room-card__field">
          <label>{s.col_area}</label>
          <input type="number" value={room.area || ''} placeholder="0" min="0" step="0.1"
            aria-label={`${s.col_area} ${idx + 1}`}
            className="tabular" style={{ textAlign: 'right' }}
            onChange={(e) => update('area', Math.max(0, parseFloat(e.target.value) || 0))} />
        </div>
      </div>

      <div>
        <div className="room-card__lamps-header">
          <span>Lighting System</span>
        </div>
        <div style={{ marginTop: 8 }}>
          <LampSlots room={room} s={s} lightingDB={lightingDB} dispatch={dispatch} />
        </div>
      </div>

      {(stdLPD > 0 || (room.area > 0 && room.lamps.length > 0)) && (
        <div className="room-card__lpd-row">
          {stdLPD > 0 && (
            <div className="room-card__lpd-item">
              <label>{s.col_std_lpd}</label>
              <span className="tabular">{stdLPD.toFixed(2)}</span>
            </div>
          )}
          {room.area > 0 && room.lamps.length > 0 && (
            <div className="room-card__lpd-item"
              style={{ borderColor: isOver ? 'rgba(164,93,11,0.4)' : 'var(--slate-200)' }}>
              <label>{s.col_design_lpd}</label>
              <span className="tabular" style={{ color: isOver ? 'var(--amber)' : 'var(--deep-teal)' }}>
                {designLPD.toFixed(2)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Lamp Slots (shared) ── */
const LABELS = ['A','B','C','D','E','F','G','H','I','J','K','L'];

/** Check if a lamp has complete data (name + watts > 0) */
function isLampComplete(lamp) {
  return lamp.name && lamp.name.trim() !== '' && lamp.watts && lamp.watts > 0;
}

function LampSlots({ room, s, lightingDB, dispatch }) {
  const referencedCodes = new Set(room.lamps.map((lamp) => lamp.code).filter(Boolean));
  const completeLamps = lightingDB.filter(isLampComplete);
  const selectableLamps = lightingDB.filter(
    (lamp) => isLampComplete(lamp) || referencedCodes.has(lamp.code)
  );

  if (lightingDB.length === 0) {
    return <p style={{ fontSize: 11, color: 'var(--slate-400)', fontStyle: 'italic' }}>{s.fill_lamp_first}</p>;
  }

  return (
    <div className="lamp-slots">
      {completeLamps.length === 0 && (
        <p style={{ fontSize: 11, color: 'var(--slate-500)', fontStyle: 'italic' }}>
          {s.no_complete_lamps}
        </p>
      )}
      {room.lamps.map((lamp, i) => (
        <div key={lamp.id} className="lamp-slot">
          <span className="lamp-slot__badge">{LABELS[i] ?? i + 1}</span>
          <select
            aria-label={`${s.col_lamps} ${i + 1}`}
            value={lamp.code}
            onChange={(e) => dispatch({ type: 'UPDATE_ROOM_LAMP', payload: { roomId: room.id, lampId: lamp.id, field: 'code', value: e.target.value } })}
          >
            <option value="">{s.select_lamp}</option>
            {selectableLamps.map((l) => (
              <option key={l.code} value={l.code}>
                {l.code}{l.name ? ` – ${l.name}` : ''}{isLampComplete(l) ? '' : ` (${s.incomplete})`}
              </option>
            ))}
          </select>
          <input
            aria-label={`Number of points ${i + 1}`}
            type="number" value={lamp.points || ''} placeholder="0" min="0" className="tabular"
            onChange={(e) => dispatch({ type: 'UPDATE_ROOM_LAMP', payload: { roomId: room.id, lampId: lamp.id, field: 'points', value: Math.max(0, parseInt(e.target.value) || 0) } })}
          />
          <button className="btn-remove-lamp"
            onClick={() => dispatch({ type: 'DELETE_ROOM_LAMP', payload: { roomId: room.id, lampId: lamp.id } })}
            aria-label={`Remove lamp ${i + 1}`}>
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
      ))}
      <button className="btn-add-lamp-slot"
        onClick={() => dispatch({ type: 'ADD_ROOM_LAMP', payload: room.id })}>
        <span className="material-symbols-outlined" aria-hidden="true">add</span>
        {s.add_lamp_room}
      </button>
    </div>
  );
}
