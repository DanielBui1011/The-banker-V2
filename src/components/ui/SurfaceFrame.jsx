import { Lock, Landmark } from 'lucide-react'

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
    strip: 'bg-slate-800 text-slate-50',
    icon: true,
    label: (bankName) => `Bạn đang ở trang của ${bankName}`,
  },
  bankOps: {
    body: 'bg-white text-slate-900',
  },
  tech: {
    body: 'bg-slate-950 font-mono text-slate-50',
    strip: 'bg-slate-900 text-slate-50',
    label: () => 'Hậu trường kỹ thuật',
  },
}

// bankOps (Vòng 18): 3 mục thanh bên bấm được, do màn truyền qua `nav` =
// { items: [{ id, label, count? }], active, onSelect }. count > 0 hiện chấm đếm đỏ
// (đỏ = đứt gãy — chỉ mục "Cảnh báo" dùng).
export default function SurfaceFrame({ variant = 'platform', bankName, nav, children, className = '' }) {
  const config = VARIANTS[variant] ?? VARIANTS.platform

  if (variant === 'bankOps') {
    return (
      <div className={`flex h-full ${config.body} ${className}`} data-surface-frame={variant}>
        <div className="flex w-60 flex-shrink-0 flex-col bg-slate-700 text-slate-50">
          <div className="flex items-center gap-3 px-5 py-5">
            <Landmark size={24} className="flex-shrink-0" aria-hidden="true" />
            <div className="min-w-0 whitespace-nowrap">
              {bankName && <div className="text-body font-semibold">{bankName}</div>}
              <div className="text-label">Nội bộ — mô phỏng</div>
            </div>
          </div>
          <nav className="flex-1 space-y-1 border-t border-slate-600 px-3 py-4">
            {nav?.items.map((item) => {
              const active = item.id === nav.active
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => nav.onSelect(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex w-full items-center justify-between gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-left text-label transition ${
                    active ? 'bg-slate-500 font-semibold text-white' : 'text-slate-50 hover:bg-slate-600'
                  }`}
                >
                  {item.label}
                  {item.count > 0 && (
                    <span className="min-w-6 rounded-full bg-red-600 px-2 text-center font-semibold tabular-nums text-white">
                      {item.count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white">{children}</div>
      </div>
    )
  }

  return (
    <div className={`flex h-full flex-col ${config.body} ${className}`} data-surface-frame={variant}>
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
