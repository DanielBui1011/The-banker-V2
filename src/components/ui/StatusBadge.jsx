import * as icons from 'lucide-react'
import { STATUS_TABLE } from '../../ui/status.js'

// StatusBadge (docs/thiet-ke.md mục 4) — đọc từ bảng duy nhất src/ui/status.js.
// Trạng thái không bao giờ chỉ dựa vào màu: luôn kèm icon lucide + nhãn chữ.
//
// Đây là bản mới cho hệ thống thiết kế Vòng 7A, dùng ở các màn đã áp chuẩn mới
// (Màn 1). src/components/StatusBadge.jsx (tone + children, nền tối) vẫn phục vụ
// Màn 4/6/9 hiện có — sẽ hợp nhất khi các màn đó được migrate ở vòng sau.
const TONE_STYLE = {
  tier1: 'border-teal-600 bg-teal-50 text-teal-700',
  tier2: 'border-violet-600 bg-violet-50 text-violet-700',
  tier3: 'border-orange-600 bg-orange-50 text-orange-700',
  insufficient: 'border-amber-600 bg-amber-50 text-amber-700',
  broken: 'border-red-600 bg-red-50 text-red-700',
  neutral: 'border-slate-400 bg-slate-100 text-slate-700',
}

export default function StatusBadge({ status, className = '' }) {
  const entry = STATUS_TABLE[status]
  if (!entry) return null
  const Icon = icons[entry.icon]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-label font-medium ${TONE_STYLE[entry.tone]} ${className}`}
    >
      {Icon && <Icon size={16} aria-hidden="true" />}
      {entry.label}
    </span>
  )
}
