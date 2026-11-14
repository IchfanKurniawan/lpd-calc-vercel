import STRINGS from '../../data/i18n.js';

const NAV_TABS = [
  { tab: 'A', icon: 'lightbulb',    labelKey: 'tab_a' },
  { tab: 'B', icon: 'meeting_room', labelKey: 'tab_b' },
  { tab: 'C', icon: 'analytics',    labelKey: 'tab_c' },
];

export function SideNavBar({ open, onClose, onResetRequest, activeTab, onTabChange }) {
  const s = STRINGS.en;

  return (
    <>
      {/* Overlay backdrop — only meaningful on mobile when sidebar is a drawer */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        id="calculator-sidebar"
        className={`sidebar${open ? ' open' : ''}`}
        aria-label="Calculator navigation"
      >
        {/* ── Logo ── */}
        <div className="sidebar__logo">
          <img className="sidebar__brand" src="/gbci-logo.webp" alt="GBC Indonesia" width="190" height="48" />
          <div className="sidebar__logo-text">
            <span className="sidebar__logo-title">LPD Calculator</span>
          </div>
        </div>

        {/* ── Section nav (A / B / C) ── */}
        <nav className="sidebar__nav" aria-label="Calculator sections">
          {NAV_TABS.map(({ tab, icon, labelKey }) => (
            <button
              key={tab}
              id={`tab-${tab}`}
              aria-controls={`tabpanel-${tab}`}
              aria-current={activeTab === tab ? 'step' : undefined}
              className={`nav-item${activeTab === tab ? ' active' : ''}`}
              onClick={() => onTabChange(tab)}
            >
              <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
              <span className="nav-item__label">{s[labelKey]}</span>
            </button>
          ))}
        </nav>

        {/* ── New Calculation CTA ── */}
        <div className="sidebar__cta">
          <button
            className="btn-cta"
            onClick={onResetRequest}
          >
            <span className="material-symbols-outlined" aria-hidden="true">add_circle</span>
            <span className="btn-text">{s.new_calc}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
