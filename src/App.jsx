import { useEffect, useRef, useState } from 'react';
import { useApp } from './store/AppContext.jsx';
import { clearStorage } from './store/localStorage.js';
import STRINGS from './data/i18n.js';
import { SideNavBar }    from './components/layout/SideNavBar.jsx';
import { TopNavBar }     from './components/layout/TopNavBar.jsx';
import { Footer }        from './components/layout/Footer.jsx';
import { SectionA }      from './components/calculator/SectionA.jsx';
import { SectionB }      from './components/calculator/SectionB.jsx';
import { SectionC }      from './components/calculator/SectionC.jsx';
import { ConfirmDialog } from './components/shared/ConfirmDialog.jsx';
import { ToastContainer, toast } from './components/shared/Toast.jsx';

const s = STRINGS.en;

export default function App() {
  const { state, dispatch, storageIssue } = useApp();

  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [activeTab,     setActiveTab]     = useState('A');
  const [resetPending,  setResetPending]  = useState(false);
  const [importPending, setImportPending] = useState(null);
  const storageWarningShown = useRef(false);

  useEffect(() => {
    if (!storageIssue || storageWarningShown.current) return;
    storageWarningShown.current = true;
    toast(`Stored data was not loaded: ${storageIssue}`, 'error');
  }, [storageIssue]);

  function handleResetConfirm() {
    clearStorage();
    dispatch({ type: 'RESET' });
    toast(s.toast_reset_ok, 'success');
    setResetPending(false);
    setActiveTab('A');
  }

  function handleImportConfirm() {
    dispatch({ type: 'IMPORT', payload: importPending });
    toast(s.toast_import_ok, 'success');
    setImportPending(null);
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (sidebarOpen) closeSidebar();
  }

  function closeSidebar() {
    setSidebarOpen(false);
    if (window.matchMedia('(max-width: 1024px)').matches) {
      requestAnimationFrame(() => document.querySelector('.hamburger')?.focus());
    }
  }

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    requestAnimationFrame(() => document.querySelector('.sidebar .nav-item')?.focus());
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeSidebar();
        return;
      }
      if (event.key !== 'Tab') return;
      const controls = document.querySelectorAll('.sidebar button');
      if (!controls.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="app-shell">
      {/* Sidebar overlay — always a drawer, never pushes content */}
      <SideNavBar
        open={sidebarOpen}
        onClose={closeSidebar}
        onResetRequest={() => { setResetPending(true); setSidebarOpen(false); }}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <TopNavBar
        onHamburger={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
        onImportRequest={setImportPending}
        activeTab={activeTab}
        s={s}
      />

      <main className="main-content">
        <div className="content-center">

          <div className="workspace-heading">
            <div>
              <h1>Lighting power calculator</h1>
              <p>Enter lamps and rooms to compare your design against the SNI reference.</p>
              {state.projectName && <p className="print-project">{state.projectName}</p>}
            </div>
            <span className="workspace-heading__standard">SNI 03-6197-2020</span>
          </div>
          <div className="workflow-steps" aria-label="Calculation steps">
            {['A', 'B', 'C'].map((tab, index) => (
              <button key={tab} type="button" className={`workflow-step${activeTab === tab ? ' is-active' : ''}`}
                onClick={() => handleTabChange(tab)} aria-current={activeTab === tab ? 'step' : undefined}>
                <span className="workflow-step__number">{index + 1}</span>
                <span>{s[`tab_${tab.toLowerCase()}_short`]}</span>
              </button>
            ))}
          </div>

          {/* Section A */}
          <div
            id="tabpanel-A"
            role="region"
            aria-labelledby="tab-A"
            hidden={activeTab !== 'A'}
            className="tab-panel"
          >
            <SectionA />
          </div>

          {/* Section B */}
          <div
            id="tabpanel-B"
            role="region"
            aria-labelledby="tab-B"
            hidden={activeTab !== 'B'}
            className="tab-panel"
          >
            <SectionB />
          </div>

          {/* Section C */}
          <div
            id="tabpanel-C"
            role="region"
            aria-labelledby="tab-C"
            hidden={activeTab !== 'C'}
            className="tab-panel"
          >
            <SectionC />
          </div>

        </div>
      </main>

      <Footer />

      {resetPending && (
        <ConfirmDialog
          title={s.confirm_reset_title}
          body={s.confirm_reset_body}
          confirmLabel={s.confirm_yes}
          cancelLabel={s.confirm_cancel}
          onConfirm={handleResetConfirm}
          onCancel={() => setResetPending(false)}
          returnFocusSelectors={['.sidebar__cta button', '.hamburger']}
        />
      )}

      {importPending && (
        <ConfirmDialog
          title={s.confirm_import_title}
          body={s.confirm_import_body}
          confirmLabel={s.confirm_yes}
          cancelLabel={s.confirm_cancel}
          onConfirm={handleImportConfirm}
          onCancel={() => setImportPending(null)}
          returnFocusSelectors={['.dropdown > button', '.hamburger']}
        />
      )}

      <ToastContainer />
    </div>
  );
}
