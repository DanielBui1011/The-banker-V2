import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

// Drawer (docs/thiet-ke.md mục 4). Nút Đóng tách hẳn khỏi tiêu đề: đặt tuyệt đối
// ở góc phải trên, có vùng bấm riêng (p-2 + nền hover) thay vì chỉ là chữ nằm
// chung hàng với tiêu đề.
// Vòng 22: vẽ qua portal vào <body> — vùng nội dung trang có view-transition-name (tạo
// stacking context) nên lớp phủ bên trong nó bị mấu "Mô phỏng" đè. Trượt vào 250ms (L.2).
// Esc đóng; focus chuyển vào nút Đóng khi mở (người dùng bàn phím).
// Vòng 25: trượt ra 200ms (L.2) rồi mới gỡ; lúc trượt ra giữ nội dung lần mở cuối (nơi gọi
// thường xóa nội dung ngay khi đóng). reduced-motion → animationend tới ngay (0,01ms).
export default function Drawer({ open, onClose, title, children }) {
  const [mounted, setMounted] = useState(open)
  const last = useRef(null)
  if (open && !mounted) setMounted(true)
  if (open) last.current = { title, children }
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!mounted) return null
  const closing = !open
  return createPortal(
    <div className={`fixed inset-0 z-[150] flex justify-end bg-slate-950/50 ${closing ? 'pointer-events-none' : ''}`} onClick={onClose}>
      <div
        className={`relative h-full w-[480px] overflow-y-auto bg-white p-6 shadow-sm ${
          closing ? 'animate-[drawer-out_200ms_var(--ease-in)_both]' : 'animate-[drawer-in_250ms_var(--ease-out)]'
        }`}
        onAnimationEnd={(e) => closing && e.target === e.currentTarget && setMounted(false)}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={last.current.title}
      >
        <button
          autoFocus
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <X size={20} aria-hidden="true" />
        </button>
        <div className="mb-4 pr-12 text-emphasis font-semibold text-slate-900">{last.current.title}</div>
        {last.current.children}
      </div>
    </div>,
    document.body
  )
}
