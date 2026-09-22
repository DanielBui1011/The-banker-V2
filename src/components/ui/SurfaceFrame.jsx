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
    strip: 'bg-slate-800 text-slate-100',
    icon: true,
    label: (bankName) => `Bạn đang ở trang của ${bankName}`,
  },
  bankOps: {
    body: 'bg-white text-slate-900',
  },
  tech: {
    body: 'bg-slate-950 font-mono text-slate-100',
    strip: 'bg-slate-900 text-slate-300',
    label: () => 'Hậu trường kỹ thuật',
  },
}

// Mục giả trang trí (Vòng 8) — chỉ để dựng bố cục "phần mềm nghiệp vụ nội bộ" nhận ra
// được ngay không cần đọc chữ; không bấm được, không phải điều hướng thật (Màn 8 chỉ có
// một màn hình tra cứu).
const BANK_OPS_NAV = ['Tra cứu nhà bán', 'Danh mục khóa', 'Cảnh báo']

export default function SurfaceFrame({ variant = 'platform', bankName, children, className = '' }) {
  const config = VARIANTS[variant] ?? VARIANTS.platform

  if (variant === 'bankOps') {
    return (
      <div className={`flex h-full ${config.body} ${className}`} data-surface-frame={variant}>
        <div className="flex w-56 flex-shrink-0 flex-col bg-slate-700 text-slate-100">
          <div className="flex items-center gap-2 px-5 py-5">
            <Landmark size={24} aria-hidden="true" />
            <span className="text-label font-semibold">Nội bộ — mô phỏng</span>
          </div>
          <nav className="flex-1 space-y-1 border-t border-slate-600 px-3 py-4" aria-hidden="true">
            {BANK_OPS_NAV.map((label, i) => (
              <div
                key={label}
                className={`rounded-lg px-3 py-2 text-label ${
                  i === 0 ? 'bg-slate-600 font-medium text-white' : 'text-slate-300'
                }`}
              >
                {label}
              </div>
            ))}
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
