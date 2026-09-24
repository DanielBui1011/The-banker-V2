import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// ConfirmDialog (docs/thiet-ke.md mục 4). Vòng 22: portal vào <body> (xem Drawer), mờ +
// thu từ 98% trong 250ms (L.2). Vòng 25: ra 200ms rồi mới gỡ, giữ chữ lần mở cuối (xem Drawer).
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Xác nhận', cancelLabel = 'Hủy', onConfirm, onCancel }) {
  const [mounted, setMounted] = useState(open)
  const last = useRef(null)
  if (open && !mounted) setMounted(true)
  if (open) last.current = { title, message }
  if (!mounted) return null
  const closing = !open
  return createPortal(
    <div
      className={`fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/60 ${closing ? 'pointer-events-none' : ''}`}
      onClick={onCancel}
    >
      <div
        className={`w-[420px] rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${
          closing ? 'animate-[dialog-out_200ms_var(--ease-in)_both]' : 'animate-[dialog-in_250ms_var(--ease-out)]'
        }`}
        onAnimationEnd={(e) => closing && e.target === e.currentTarget && setMounted(false)}
        onClick={(event) => event.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
      >
        <div className="text-emphasis font-semibold text-slate-900">{last.current.title}</div>
        {last.current.message && <p className="mt-2 text-label text-slate-600">{last.current.message}</p>}
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
    </div>,
    document.body
  )
}
