import { Info, AlertTriangle, OctagonAlert } from 'lucide-react'
import { ESTIMATE_DISCLAIMER } from '../../data/mockData.js'

// Callout (docs/thiet-ke.md mục 4) — info / warn / danger.
const VARIANTS = {
  info: { Icon: Info, style: 'border-slate-300 bg-slate-100 text-slate-700' },
  warn: { Icon: AlertTriangle, style: 'border-amber-600 bg-amber-50 text-amber-700' },
  danger: { Icon: OctagonAlert, style: 'border-red-600 bg-red-50 text-red-700' },
}

export function Callout({ variant = 'info', children, className = '' }) {
  const { Icon, style } = VARIANTS[variant] ?? VARIANTS.info
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-label ${style} ${className}`}>
      <Icon size={18} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

// Biến thể cố định — mọi giá trị ứng ước tính phải kèm dòng này (CLAUDE.md #4,
// docs/quy-tac.md mục 4).
export function EstimateDisclaimer({ className = '' }) {
  return (
    <Callout variant="info" className={className}>
      {ESTIMATE_DISCLAIMER}
    </Callout>
  )
}

export default Callout
