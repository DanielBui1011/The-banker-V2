import { ACT_LABELS } from '../../config/flow.js'

// ActProgress (docs/thiet-ke.md mục 4): 4 hồi, hồi hiện tại nổi bật. tone="light"
// cho bề mặt sáng (Màn 1 mới), tone="dark" cho các màn còn giữ nền tối hiện có.
export default function ActProgress({ currentAct, tone = 'dark' }) {
  const activeClass = tone === 'light' ? 'bg-navy' : 'bg-blue-500'
  const inactiveClass = tone === 'light' ? 'bg-slate-200' : 'bg-slate-800'

  return (
    <div className="grid grid-cols-4 gap-2">
      {ACT_LABELS.map((label, i) => {
        const isActive = i + 1 === currentAct
        return (
          <div
            key={label}
            className={`h-1.5 rounded-full ${isActive ? activeClass : inactiveClass}`}
            title={label}
            aria-current={isActive ? 'step' : undefined}
          />
        )
      })}
    </div>
  )
}
