import { formatNumberVN } from '../../utils/format.js'

const SIZE_CLASS = {
  label: 'text-label',
  body: 'text-body',
  emphasis: 'text-emphasis font-semibold',
  'section-title': 'text-section-title font-semibold',
  hero: 'text-hero font-bold',
}

// Money (docs/thiet-ke.md mục 4) — luôn qua format.js, luôn tabular-nums để số
// không nhảy hàng khi cập nhật (số tiền là điểm nhìn đầu tiên).
export default function Money({ value, unit = 'triệu', size = 'body', className = '' }) {
  return (
    <span className={`tabular-nums ${SIZE_CLASS[size] ?? SIZE_CLASS.body} ${className}`}>
      {formatNumberVN(value)}
      {unit && <span className="ml-1 text-label font-normal text-slate-600">{unit}</span>}
    </span>
  )
}
