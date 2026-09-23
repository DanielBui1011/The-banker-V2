import { X } from 'lucide-react'

// Drawer (docs/thiet-ke.md mục 4). Nút Đóng tách hẳn khỏi tiêu đề: đặt tuyệt đối
// ở góc phải trên, có vùng bấm riêng (p-2 + nền hover) thay vì chỉ là chữ nằm
// chung hàng với tiêu đề.
export default function Drawer({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[150] flex justify-end bg-slate-950/50" onClick={onClose}>
      <div
        className="relative h-full w-[480px] overflow-y-auto bg-white p-6 shadow-sm"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <X size={20} aria-hidden="true" />
        </button>
        <div className="mb-4 pr-12 text-emphasis font-semibold text-slate-900">{title}</div>
        {children}
      </div>
    </div>
  )
}
