import { useApp } from '../../store/AppContext.jsx';
import STRINGS from '../../data/i18n.js';

const NAV_TABS = [
  { tab: 'A', icon: 'lightbulb',    labelKey: 'tab_a' },
  { tab: 'B', icon: 'meeting_room', labelKey: 'tab_b' },
  { tab: 'C', icon: 'analytics',    labelKey: 'tab_c' },
];

export function SideNavBar({ open, onClose, onResetRequest, activeTab, onTabChange }) {
  const { state, dispatch } = useApp();
  const s = STRINGS[state.language];

  function setLang(l) {
    dispatch({ type: 'SET_LANGUAGE', payload: l });
    document.documentElement.lang = l;
  }

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
        className={`sidebar${open ? ' open' : ''}`}
        aria-label="Navigation"
      >
        {/* ── Logo ── */}
        <div className="sidebar__logo">
          <svg className="sidebar__logo-icon" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="8" fill="rgba(211,254,171,0.15)"/>
            <path d="M18 7C14.13 7 11 10.13 11 14c0 2.5 1.25 4.7 3.15 6.05V22a.5.5 0 00.5.5h6.7a.5.5 0 00.5-.5v-1.95C23.75 18.7 25 16.5 25 14c0-3.87-3.13-7-7-7z" fill="#D3FEAB"/>
            <rect x="14.5" y="23.5" width="7" height="1.5" rx=".75" fill="#D3FEAB"/>
            <rect x="15.5" y="26" width="5" height="1.5" rx=".75" fill="#D3FEAB"/>
          </svg>
          <div className="sidebar__logo-text">
            <span className="sidebar__logo-title">LPD Calculator</span>
            <span className="sidebar__logo-sub">Greenship NB 1.3</span>
          </div>
        </div>

        {/* ── Section nav (A / B / C) ── */}
        <nav className="sidebar__nav" role="tablist" aria-label="Calculator sections">
          {NAV_TABS.map(({ tab, icon, labelKey }) => (
            <button
              key={tab}
              role="tab"
              aria-selected={activeTab === tab}
              className={`nav-item${activeTab === tab ? ' active' : ''}`}
              onClick={() => onTabChange(tab)}
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span className="nav-item__label">{s[labelKey]}</span>
            </button>
          ))}
        </nav>

        {/* ── Language toggle ── */}
        <div className="sidebar__lang">
          <div className="lang-toggle">
            <button
              className={`lang-toggle__btn${state.language === 'id' ? ' active' : ''}`}
              onClick={() => setLang('id')}
              aria-label="Bahasa Indonesia"
            >
              ID
            </button>
            <button
              className={`lang-toggle__btn${state.language === 'en' ? ' active' : ''}`}
              onClick={() => setLang('en')}
              aria-label="English"
            >
              EN
            </button>
          </div>
        </div>

        {/* ── New Calculation CTA ── */}
        <div className="sidebar__cta">
          <button
            className="btn-cta"
            onClick={onResetRequest}
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span className="btn-text">{s.new_calc}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
