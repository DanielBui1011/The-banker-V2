// Drawer (docs/thiet-ke.md mục 4).
export default function Drawer({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[150] flex justify-end bg-slate-950/50" onClick={onClose}>
      <div
        className="h-full w-[480px] overflow-y-auto bg-white p-6 shadow-sm"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-4 flex items-center justify-between">
          <span className="text-emphasis font-semibold text-slate-900">{title}</span>
          <button onClick={onClose} className="text-label text-slate-500 hover:text-slate-800">
            Đóng
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
