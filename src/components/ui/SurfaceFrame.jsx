import { Lock } from 'lucide-react'

// SurfaceFrame (docs/thiet-ke.md mục 0 và 4) — phân biệt 4 bề mặt trong 1 giây:
// platform (Nền tảng), bank (trang ngân hàng), bankOps (cổng nghiệp vụ ngân hàng),
// tech (hậu trường kỹ thuật). Đây là yêu cầu pháp lý (docs/quy-tac.md mục 2, 3):
// nếu mọi thứ trông như app ngân hàng, người xem sẽ hiểu Nền tảng là bên cho vay.
const VARIANTS = {
  platform: {
    body: 'bg-slate-50 text-slate-900',
  },
  bank: {
    body: 'bg-white text-slate-900',
    strip: 'bg-slate-800 text-slate-100',
    icon: true,
    label: (bankName) => `Bạn đang ở trang của ${bankName}`,
  },
  bankOps: {
    body: 'bg-white text-slate-900',
    strip: 'border-b border-slate-200 bg-slate-100 text-slate-600',
    label: (bankName) => `Cổng nghiệp vụ ${bankName} — mô phỏng`,
  },
  tech: {
    body: 'bg-slate-950 font-mono text-slate-100',
    strip: 'bg-slate-900 text-slate-300',
    label: () => 'Hậu trường kỹ thuật',
  },
}

export default function SurfaceFrame({ variant = 'platform', bankName, children, className = '' }) {
  const config = VARIANTS[variant] ?? VARIANTS.platform

  return (
    <div className={`flex h-full flex-col ${config.body} ${className}`}>
      {config.strip && (
        <div className={`flex items-center gap-2 px-12 py-2 text-label font-medium ${config.strip}`}>
          {config.icon && <Lock size={16} aria-hidden="true" />}
          {config.label(bankName)}
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">{children}</div>
    </div>
  )
}
