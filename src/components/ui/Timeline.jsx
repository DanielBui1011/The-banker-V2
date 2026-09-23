// Timeline (docs/thiet-ke.md mục 4) — chỉ-thêm-mới, dd/mm/yyyy.
// items: [{ date: 'dd/mm', label, done? }]
export default function Timeline({ items }) {
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <div className="w-24 flex-shrink-0 text-label tabular-nums text-slate-600">{item.date}</div>
          <div
            className={`flex-1 border-l-2 pl-3 text-label ${
              item.done ? 'border-teal-600 text-slate-800' : 'border-slate-200 text-slate-600'
            }`}
          >
            {item.label}
          </div>
        </li>
      ))}
    </ol>
  )
}
