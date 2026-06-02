import { useApp } from '../../store/AppContext.jsx';
import STRINGS from '../../data/i18n.js';

export function Footer() {
  const { state } = useApp();
  return (
    <footer className="footer">
      <p className="footer__text">{STRINGS[state.language].footer}</p>
    </footer>
  );
}
