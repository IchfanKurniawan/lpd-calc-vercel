import { useState, useRef } from 'react';
import { useApp } from '../../store/AppContext.jsx';
import STRINGS from '../../data/i18n.js';
import { exportToJSON, exportToCSV } from '../../engine/exportSerializer.js';
import { parseJSONImport, parseCSVImport } from '../../engine/importParser.js';
import { triggerDownload } from '../../engine/download.js';
import { CSV_TEMPLATE } from '../../engine/csvTemplate.js';
import { toast } from '../shared/Toast.jsx';

const SECTION_META = {
  A: { icon: 'lightbulb',    labelKey: 'tab_a' },
  B: { icon: 'meeting_room', labelKey: 'tab_b' },
  C: { icon: 'analytics',    labelKey: 'tab_c' },
};

export function TopNavBar({ onHamburger, onImportRequest, activeTab, s }) {
  const { state, dispatch } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const fileRef   = useRef(null);
  const lang      = state.language;
  const strings   = s || STRINGS[lang];

  // Derive section label for breadcrumb
  const meta = SECTION_META[activeTab] ?? SECTION_META.A;

  function handleExportJSON() {
    const json = exportToJSON({ projectName: state.projectName, lightingDB: state.lightingDB, rooms: state.rooms });
    const name = (state.projectName || 'lpd_calculator').replace(/\s+/g, '_');
    triggerDownload(json, `${name}.json`, 'application/json');
    toast(strings.toast_export_ok, 'success');
    setMenuOpen(false);
  }

  function handleExportCSV() {
    const csv = exportToCSV({ projectName: state.projectName, lightingDB: state.lightingDB, rooms: state.rooms });
    const name = (state.projectName || 'lpd_calculator').replace(/\s+/g, '_');
    triggerDownload(csv, `${name}.csv`, 'text/csv');
    toast(strings.toast_export_ok, 'success');
    setMenuOpen(false);
  }

  function handleDownloadTemplate() {
    triggerDownload(CSV_TEMPLATE, 'lpd_calculator_template.csv', 'text/csv');
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
    const text = await file.text();
    try {
      let imported;
      if (file.name.endsWith('.json')) {
        imported = parseJSONImport(text);
      } else if (file.name.endsWith('.csv')) {
        imported = parseCSVImport(text);
      } else {
        throw new Error('Unsupported file type. Use .json or .csv');
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
        aria-label="Open navigation"
        aria-expanded={false}
      >
        <span className="material-symbols-outlined">menu</span>
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
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{meta.icon}</span>
        <span>{strings[meta.labelKey]}</span>
      </div>

      {/* SNI badge */}
      <div className="topbar__badge">
        <span className="material-symbols-outlined" style={{ fontSize: 13 }}>verified</span>
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
          >
            <span className="material-symbols-outlined">import_export</span>
            <span>Data</span>
          </button>

          {menuOpen && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 299 }}
                onClick={() => setMenuOpen(false)}
              />
              <div className="dropdown__menu">
                <button className="dropdown__item" onClick={handleImportClick}>
                  <span className="material-symbols-outlined">upload_file</span>
                  {strings.import}
                </button>
                <div className="dropdown__divider" />
                <button className="dropdown__item" onClick={handleExportJSON}>
                  <span className="material-symbols-outlined">data_object</span>
                  {strings.export_json}
                </button>
                <button className="dropdown__item" onClick={handleExportCSV}>
                  <span className="material-symbols-outlined">table_view</span>
                  {strings.export_csv}
                </button>
                <div className="dropdown__divider" />
                <button className="dropdown__item" onClick={handleDownloadTemplate}>
                  <span className="material-symbols-outlined">download</span>
                  {strings.download_template}
                </button>
              </div>
            </>
          )}
        </div>

        {/* PDF / Print */}
        <button className="btn btn-primary" onClick={() => { window.print(); setMenuOpen(false); }}>
          <span className="material-symbols-outlined">picture_as_pdf</span>
          <span>{strings.export_pdf}</span>
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept=".json,.csv"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        aria-hidden="true"
      />
    </header>
  );
}
