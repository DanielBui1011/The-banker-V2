import { Lock, Landmark } from 'lucide-react'

// SurfaceFrame (docs/thiet-ke.md mục 0 và 4) — phân biệt 4 bề mặt trong 1 giây:
// platform (Nền tảng), bank (trang ngân hàng), bankOps (cổng nghiệp vụ ngân hàng),
// tech (hậu trường kỹ thuật). Đây là yêu cầu pháp lý (docs/quy-tac.md mục 2, 3):
// nếu mọi thứ trông như app ngân hàng, người xem sẽ hiểu Nền tảng là bên cho vay.
//
// Token tcb-* (màu Techcombank xấp xỉ, san-pham.md K.2–K.3) CHỈ nằm trong file này
// (tests/quy-tac.test.js Quy tắc 9): khung bank Techcombank, vạch vàng kim trên tiêu
// đề (BankAccent) và màn chuyển tiếp sang trang Techcombank (HandoffScreen).
const TCB = 'Techcombank'
const VARIANTS = {
  platform: {
    body: 'bg-slate-50 text-slate-900',
  },
  bank: {
    body: 'bg-white text-slate-900',
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

  if (variant === 'bank') {
    // Techcombank: thanh #141414 + chữ "Mô phỏng" + vạch đỏ 4px (K.2). Bên cho vay khác
    // (Ngân hàng B, Công ty tài chính C): khung trung tính, không mượn màu ngân hàng thật (K.3.6).
    const tcb = bankName === TCB
    return (
      <div className={`flex h-full flex-col ${config.body} ${className}`} data-surface-frame="bank" data-bank={tcb ? 'tcb' : 'neutral'}>
        <div className={tcb ? 'bg-tcb-bar text-tcb-on-bar' : 'bg-slate-800 text-slate-50'}>
          <div className="flex items-center gap-2 px-12 py-3 text-body font-medium">
            <Lock size={18} aria-hidden="true" />
            <span>
              Bạn đang ở trang của <span className={`font-semibold ${tcb ? 'text-tcb-gold' : ''}`}>{bankName}</span>
            </span>
            <span className={`ml-auto text-label ${tcb ? 'text-[#B8BEC9]' : ''}`}>Mô phỏng</span>
          </div>
        </div>
        {tcb && <div className="h-1 bg-tcb-stripe" aria-hidden="true" />}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    )
  }

  return (
    <div className={`flex h-full flex-col ${config.body} ${className}`} data-surface-frame={variant}>
      {config.strip && (
        <div className={`flex items-center gap-2 px-12 py-2 text-label font-medium ${config.strip}`}>
          {config.label(bankName)}
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">{children}</div>
    </div>
  )
}

// Vạch vàng kim 48×3px trên tiêu đề trang Techcombank (K.2). Bên khác: không có.
export function BankAccent({ bankName }) {
  if (bankName !== TCB) return null
  return <div className="mb-3 h-[3px] w-12 bg-tcb-gold" aria-hidden="true" />
}

// Màn chuyển tiếp 700ms (san-pham.md L.2): sang Techcombank = nền #141414 + vạch đỏ
// chạy một lần; về app = nền app + vạch cobalt. Là trạng thái giao diện; nơi gọi
// quyết định thời lượng và bỏ qua khi prefers-reduced-motion.
export function HandoffScreen({ toBank, text }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[300] flex flex-col items-center justify-center gap-6 ${
        toBank ? 'bg-tcb-bar text-tcb-on-bar' : 'bg-app-bg text-ink'
      }`}
    >
      <p className="text-section-title font-semibold">{text}</p>
      <div className="h-1 w-80 overflow-hidden rounded-full">
        <div className={`h-full w-full animate-handoff-bar ${toBank ? 'bg-tcb-stripe' : 'bg-primary'}`} />
      </div>
    </div>
  )
}
