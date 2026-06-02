import { useState } from 'react';
import { useApp } from './store/AppContext.jsx';
import STRINGS from './data/i18n.js';
import { SideNavBar }    from './components/layout/SideNavBar.jsx';
import { TopNavBar }     from './components/layout/TopNavBar.jsx';
import { Footer }        from './components/layout/Footer.jsx';
import { SectionA }      from './components/calculator/SectionA.jsx';
import { SectionB }      from './components/calculator/SectionB.jsx';
import { SectionC }      from './components/calculator/SectionC.jsx';
import { ConfirmDialog } from './components/shared/ConfirmDialog.jsx';
import { ToastContainer, toast } from './components/shared/Toast.jsx';

export default function App() {
  const { state, dispatch } = useApp();
  const s = STRINGS[state.language];

  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [activeTab,     setActiveTab]     = useState('A');
  const [resetPending,  setResetPending]  = useState(false);
  const [importPending, setImportPending] = useState(null);

  function handleResetConfirm() {
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
    setSidebarOpen(false);   // close drawer after selection on any screen size
  }

  return (
    <div className="app-shell">
      {/* Sidebar overlay — always a drawer, never pushes content */}
      <SideNavBar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onResetRequest={() => { setResetPending(true); setSidebarOpen(false); }}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <TopNavBar
        onHamburger={() => setSidebarOpen((v) => !v)}
        onImportRequest={setImportPending}
        activeTab={activeTab}
        tabLabel={s[`tab_a_short`]}   /* passed for topbar breadcrumb */
        s={s}
      />

      <main className="main-content">
        <div className="content-center">

          {/* Section A */}
          <div
            id="tabpanel-A"
            role="tabpanel"
            hidden={activeTab !== 'A'}
            className="tab-panel"
          >
            <SectionA />
          </div>

          {/* Section B */}
          <div
            id="tabpanel-B"
            role="tabpanel"
            hidden={activeTab !== 'B'}
            className="tab-panel"
          >
            <SectionB />
          </div>

          {/* Section C */}
          <div
            id="tabpanel-C"
            role="tabpanel"
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
        />
      )}

      <ToastContainer />
    </div>
  );
}
