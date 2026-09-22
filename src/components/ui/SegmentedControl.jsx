// SegmentedControl (mới, theo phong cách hệ thống — docs/thiet-ke.md mục 2/4):
// bộ chọn nhiều lựa chọn loại trừ nhau, dùng cho bộ chọn thời điểm ở Màn 8.
// options: [{ id, label }]. value: id đang chọn. onChange(id).
export default function SegmentedControl({ options, value, onChange, className = '' }) {
  return (
    <div className={`inline-flex rounded-lg border border-slate-300 bg-slate-100 p-1 ${className}`} role="tablist">
      {options.map((opt) => {
        const active = opt.id === value
        return (
          <button
            key={opt.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={`rounded-md px-4 py-2 text-label font-medium transition ${
              active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
