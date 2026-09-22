// Stat (docs/thiet-ke.md mục 4) — tối đa 3 Stat mỗi hàng (ràng buộc bố cục do nơi
// gọi tuân thủ, ví dụ grid-cols-3).
export default function Stat({ label, value, hint, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-label text-slate-600">{label}</span>
      <span className="text-emphasis font-semibold tabular-nums text-slate-900">{value}</span>
      {hint && <span className="text-label text-slate-500">{hint}</span>}
    </div>
  )
}
