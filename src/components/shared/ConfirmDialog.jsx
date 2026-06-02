export function ConfirmDialog({ title, body, onConfirm, onCancel, confirmLabel = 'Yes', cancelLabel = 'Cancel' }) {
  return (
    <div className="overlay" onClick={onCancel}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog__title">{title}</div>
        <div className="dialog__body">{body}</div>
        <div className="dialog__actions">
          <button className="btn btn-secondary" onClick={onCancel}>{cancelLabel}</button>
          <button className="btn btn-primary" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
