import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../store/AppContext.jsx';
import STRINGS from '../../data/i18n.js';
import { exportToJSON } from '../../engine/exportSerializer.js';
import { parseJSONImport } from '../../engine/importParser.js';
import { triggerDownload } from '../../engine/download.js';
import { toast } from '../shared/Toast.jsx';

const SECTION_META = {
  A: { icon: 'lightbulb',    labelKey: 'tab_a' },
  B: { icon: 'meeting_room', labelKey: 'tab_b' },
  C: { icon: 'analytics',    labelKey: 'tab_c' },
};

export function TopNavBar({ onHamburger, onImportRequest, activeTab, sidebarOpen, s }) {
  const { state, dispatch } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const fileRef   = useRef(null);
  const strings   = s || STRINGS.en;

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  // Derive section label for breadcrumb
  const meta = SECTION_META[activeTab] ?? SECTION_META.A;

  function handleExportJSON() {
    const json = exportToJSON({ projectName: state.projectName, lightingDB: state.lightingDB, rooms: state.rooms });
    const name = (state.projectName || 'lpd_calculator')
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/^\.+|\.+$/g, '')
      .slice(0, 120) || 'lpd_calculator';
    triggerDownload(json, `${name}.json`, 'application/json');
    toast(strings.toast_export_ok, 'success');
    setMenuOpen(false);
  }

  function handleImportClick() {
    fileRef.current.value = '';
    fileRef.current.click();
    setMenuOpen(false);
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File exceeds the 5 MB import limit.');
      }
      const text = await file.text();
      let imported;
      if (file.name.toLowerCase().endsWith('.json')) {
        imported = parseJSONImport(text);
      } else {
        throw new Error('Unsupported file type. Use .json');
      }
      onImportRequest(imported);
    } catch (err) {
      toast(strings.toast_import_err + err.message, 'error');
    }
  }

  return (
    <header className="topbar">
      {/* Hamburger — always visible, opens sidebar drawer */}
      <button
        className="hamburger"
        onClick={onHamburger}
        aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={sidebarOpen}
        aria-controls="calculator-sidebar"
      >
        <span className="material-symbols-outlined" aria-hidden="true">menu</span>
      </button>

      {/* Project name */}
      <div className="topbar__project">
        <input
          className="topbar__project-input"
          placeholder={strings.project_placeholder}
          value={state.projectName}
          onChange={(e) => dispatch({ type: 'SET_PROJECT_NAME', payload: e.target.value })}
          maxLength={200}
          aria-label="Project name"
        />
      </div>

      {/* Active section breadcrumb */}
      <div className="topbar__section-pill">
        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 14 }}>{meta.icon}</span>
        <span>{strings[meta.labelKey]}</span>
      </div>

      {/* SNI badge */}
      <div className="topbar__badge">
        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 13 }}>info</span>
        {strings.std_badge}
      </div>

      {/* Actions */}
      <div className="topbar__actions">
        {/* Import / Export */}
        <div className="dropdown">
          <button
            className="btn btn-secondary"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={strings.data_menu}
          >
            <span className="material-symbols-outlined" aria-hidden="true">import_export</span>
            <span>Data</span>
          </button>

          {menuOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 299 }}
                onClick={() => setMenuOpen(false)}
              />
              <div className="dropdown__menu" role="menu">
                <button className="dropdown__item" role="menuitem" onClick={handleImportClick}>
                  <span className="material-symbols-outlined" aria-hidden="true">upload_file</span>
                  {strings.import}
                </button>
                <div className="dropdown__divider" />
                <button className="dropdown__item" role="menuitem" onClick={handleExportJSON}>
                  <span className="material-symbols-outlined" aria-hidden="true">data_object</span>
                  {strings.export_json}
                </button>
              </div>
            </>
          )}
        </div>

        </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-hidden="true"
      />
    </header>
  );
}
