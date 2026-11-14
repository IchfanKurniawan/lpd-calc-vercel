import { useState, useCallback, useEffect, useRef } from 'react';
import { createId } from '../../engine/id.js';

let _addToast = null;

export function toast(message, type = 'default') {
  _addToast?.({ message, type, id: createId() });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const addToast = useCallback((t) => {
    setToasts((prev) => [...prev, t]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
      timers.current.delete(t.id);
    }, 3500);
    timers.current.set(t.id, timer);
  }, []);

  useEffect(() => { _addToast = addToast; return () => { _addToast = null; }; }, [addToast]);

  useEffect(() => () => {
    timers.current.forEach((timer) => clearTimeout(timer));
    timers.current.clear();
  }, []);

  const icons = { success: 'check_circle', error: 'error', default: 'info' };

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`} role={t.type === 'error' ? 'alert' : 'status'}>
          <span className="material-symbols-outlined" aria-hidden="true">{icons[t.type] ?? icons.default}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
