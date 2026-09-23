// Stat (docs/thiet-ke.md mục 4) — tối đa 3 Stat mỗi hàng (ràng buộc bố cục do nơi
// gọi tuân thủ, ví dụ grid-cols-3).
export default function Stat({ label, value, hint, large = false, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-label text-slate-600">{label}</span>
      <span className={`tabular-nums text-slate-900 ${large ? 'text-section-title font-bold' : 'text-emphasis font-semibold'}`}>{value}</span>
      {hint && <span className="text-label text-slate-600">{hint}</span>}
    </div>
  )
}
