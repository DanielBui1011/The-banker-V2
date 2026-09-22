// Card (docs/thiet-ke.md mục 2, 4) — bo góc 12, bóng tối đa shadow-sm.
export default function Card({ children, className = '', padding = 'p-6' }) {
  return <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${padding} ${className}`}>{children}</div>
}
