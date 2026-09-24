import * as icons from 'lucide-react'
import { STATUS_TABLE } from '../../ui/status.js'

// Vệt vòng đời một đơn vị khoản phải thu: 4 chấm nối nhau, chấm hiện tại được tô
// bằng màu của đúng bước đó (cùng tone với StatusBadge). Các bước còn lại là chấm
// rỗng trung tính. Chỉ Khoản phải thu dùng; nằm trong ui/ vì test màu quét src/pages.
const STEPS = ['projected', 'verified', 'locked', 'settled']

const DOT_STYLE = {
  neutral: 'border-slate-600 bg-slate-600 text-white',
  tier1Outline: 'border-teal-600 bg-teal-50 text-teal-700',
  tier2: 'border-violet-600 bg-violet-600 text-white',
  tier1Solid: 'border-teal-700 bg-teal-700 text-white',
}
const LABEL_STYLE = {
  neutral: 'text-slate-700',
  tier1Outline: 'text-teal-700',
  tier2: 'text-violet-700',
  tier1Solid: 'text-teal-700',
}

export default function LifecycleTrail({ current, className = '' }) {
  const currentIndex = STEPS.indexOf(current)
  return (
    <ol className={`flex items-start ${className}`} aria-label="Vòng đời đơn vị khoản phải thu">
      {STEPS.map((step, i) => {
        const { tone, icon, label } = STATUS_TABLE[step]
        const isCurrent = i === currentIndex
        const Icon = icons[icon]
        return (
          <li key={step} className="relative flex flex-1 flex-col items-center gap-1.5" aria-current={isCurrent ? 'step' : undefined}>
            {i > 0 && <span className="absolute right-1/2 top-[13px] h-0.5 w-full bg-slate-300" aria-hidden="true" />}
            <span
              className={`relative z-10 flex items-center justify-center rounded-full border-2 ${
                isCurrent ? `h-7 w-7 ${DOT_STYLE[tone]}` : 'my-1 h-5 w-5 border-slate-300 bg-white'
              }`}
            >
              {isCurrent && Icon && <Icon size={16} aria-hidden="true" />}
            </span>
            <span className={`text-label ${isCurrent ? `font-semibold ${LABEL_STYLE[tone]}` : 'text-slate-600'}`}>{label}</span>
          </li>
        )
      })}
    </ol>
  )
}
