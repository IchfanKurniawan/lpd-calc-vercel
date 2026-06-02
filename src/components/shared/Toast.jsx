import { useState, useCallback, useEffect } from 'react';

let _addToast = null;

export function toast(message, type = 'default') {
  _addToast?.({ message, type, id: crypto.randomUUID() });
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((t) => {
    setToasts((prev) => [...prev, t]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
    }, 3500);
  }, []);

  useEffect(() => { _addToast = addToast; return () => { _addToast = null; }; }, [addToast]);

  const icons = { success: 'check_circle', error: 'error', default: 'info' };

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="material-symbols-outlined">{icons[t.type] ?? icons.default}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
