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
  tier1Outline: 'border-2 border-teal-600 bg-white text-teal-700',
  tier1Solid: 'border-teal-700 bg-teal-700 text-white',
  tier2: 'border-violet-600 bg-violet-50 text-violet-700',
  tier3: 'border-orange-600 bg-orange-50 text-orange-700',
  insufficient: 'border-amber-600 bg-amber-50 text-amber-700',
  // Đứt gãy: đỏ đặc #B91C1C + chữ trắng (DESIGN.md) — cú sốc đỏ duy nhất, khác mọi badge nền nhạt
  broken: 'border-red-700 bg-red-700 text-white',
  neutral: 'border-slate-400 bg-slate-100 text-slate-700',
}

// size 'sm' giữ nguyên text-label (16px, tối thiểu tuyệt đối CLAUDE.md #7) — chỉ
// giảm khoảng đệm và icon để gọn trong hàng bảng (Màn 3).
const SIZE_STYLE = {
  md: 'px-3 py-1',
  sm: 'px-2 py-0.5',
}
const ICON_SIZE = { md: 16, sm: 14 }

export default function StatusBadge({ status, size = 'md', className = '' }) {
  const entry = STATUS_TABLE[status]
  if (!entry) return null
  const Icon = icons[entry.icon]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border text-label font-medium ${SIZE_STYLE[size] ?? SIZE_STYLE.md} ${TONE_STYLE[entry.tone]} ${className}`}
    >
      {Icon && <Icon size={ICON_SIZE[size] ?? ICON_SIZE.md} aria-hidden="true" />}
      {entry.label}
    </span>
  )
}
