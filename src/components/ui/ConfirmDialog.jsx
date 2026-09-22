// ConfirmDialog (docs/thiet-ke.md mục 4).
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Xác nhận', cancelLabel = 'Hủy', onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/60" onClick={onCancel}>
      <div
        className="w-[420px] rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        onClick={(event) => event.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        <div className="text-emphasis font-semibold text-slate-900">{title}</div>
        {message && <p className="mt-2 text-label text-slate-600">{message}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2 text-label font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-navy px-4 py-2 text-label font-medium text-white transition hover:opacity-90"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
