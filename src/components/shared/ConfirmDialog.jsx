import { useEffect, useId, useRef } from 'react';

export function ConfirmDialog({ title, body, onConfirm, onCancel, returnFocusSelectors = [], confirmLabel = 'Yes', cancelLabel = 'Cancel', confirmTone = 'primary' }) {
  const titleId = useId();
  const dialogRef = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    const buttons = dialogRef.current?.querySelectorAll('button');
    buttons?.[0]?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCancel();
      if (event.key !== 'Tab' || !buttons?.length) return;
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const visible = (element) => element instanceof HTMLElement && element.isConnected &&
        element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden';
      const targets = [previous, ...returnFocusSelectors.map((selector) => document.querySelector(selector))];
      targets.find(visible)?.focus();
    };
  }, []);

  return (
    <div className="overlay" onClick={onCancel}>
      <div className="dialog" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()}>
        <div className="dialog__title" id={titleId}>{title}</div>
        <div className="dialog__body">{body}</div>
        <div className="dialog__actions">
          <button className="btn btn-secondary" onClick={onCancel}>{cancelLabel}</button>
          <button className={`btn ${confirmTone === 'danger' ? 'btn-confirm-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
