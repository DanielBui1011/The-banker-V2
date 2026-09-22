// Nhãn trạng thái dùng màu theo bảng ngữ nghĩa CLAUDE.md — dùng chung cho các màn
// hiển thị đơn vị khoản phải thu (Màn 4, và các màn sau tái sử dụng cùng trạng thái).
const TONE_STYLE = {
  tier1: 'border-teal-700 bg-teal-950/40 text-teal-300', // Tầng 1, trạng thái tất toán
  tier2: 'border-purple-700 bg-purple-950/40 text-purple-300', // Tầng 2, trạng thái đã khóa
  tier3: 'border-orange-700 bg-orange-950/40 text-orange-300', // Tầng 3
  insufficient: 'border-amber-700 bg-amber-950/40 text-amber-300', // Tất toán thiếu
  broken: 'border-red-700 bg-red-950/40 text-red-300', // Đứt gãy
  neutral2: 'border-slate-700 bg-slate-800/60 text-slate-300', // Trung tính, dự phóng, hết hiệu lực, đã hoàn
}

export default function StatusBadge({ tone, children, className = '' }) {
  const style = TONE_STYLE[tone] ?? TONE_STYLE.neutral2
  return (
    <span className={`inline-block rounded-full border px-3 py-1 text-base font-medium ${style} ${className}`}>
      {children}
    </span>
  )
}
