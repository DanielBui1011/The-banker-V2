// ToggleSwitch (mới, theo phong cách hệ thống — dùng cho công tắc minh họa ở Màn 8).
export default function ToggleSwitch({ active, onToggle, label }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={active}
      aria-label={label}
      className={`h-7 w-12 flex-shrink-0 rounded-full transition ${active ? 'bg-navy' : 'bg-slate-300'}`}
    >
      <span
        className={`block h-6 w-6 rounded-full bg-white shadow-sm transition ${active ? 'translate-x-5' : 'translate-x-0.5'}`}
      />
    </button>
  )
}
