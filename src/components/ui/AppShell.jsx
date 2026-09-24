import {
  LayoutDashboard,
  ArrowLeftRight,
  FileCheck2,
  HandCoins,
  ReceiptText,
  ShieldCheck,
  CalendarDays,
  CircleHelp,
  ArrowRight,
} from 'lucide-react'
import { DISPLAY_NAME } from '../../config/brand.js'
import { FOOTER_NOTE } from '../../data/mockData.js'
import { ROUTES, simDate, nextStep } from '../../logic/journey.js'
import { formatDateVN } from '../../utils/format.js'
import { useApp } from '../../state/appState.jsx'
import { TaskChecklist } from '../Guide.jsx'

// Khung app nhà bán (docs/san-pham.md B.1, K.2, K.5): thanh trên, thanh điều hướng trái
// 6 trang + khu nhiệm vụ ở cuối, chân trang. Mục đang chọn mang nền nhạt của Tầng nó
// thuộc. Vòng 22: mỗi trang nhà bán có dải tiêu đề (nền nhạt của Tầng, K.2) và thẻ
// "Bước tiếp theo" (nextStep, D.3) — vẽ một lần ở đây cho cả 6 trang. Trang Techcombank
// và cổng ngân hàng (khu khác 'nha-ban') không có thanh trên/điều hướng của Nền tảng
// (quy-tac mục 3) — chỉ có chân trang.
// question: câu hỏi trang trả lời (san-pham.md B.1); tier: nhãn Tầng trên dải tiêu đề.
const NAV = [
  { page: 'tong-quan', href: ROUTES.tongQuan, label: 'Tổng quan', icon: LayoutDashboard, tone: 'primary', question: 'Tiền của tôi đang ở đâu, tôi nên làm gì tiếp?' },
  { page: 'doi-soat', href: ROUTES.doiSoat, label: 'Đối soát', icon: ArrowLeftRight, tone: 'tier1', tier: 'Tầng 1', question: 'Tiền về đã khớp với đơn chưa?' },
  { page: 'khoan-phai-thu', href: ROUTES.khoanPhaiThu, label: 'Khoản phải thu', icon: FileCheck2, tone: 'tier2', tier: 'Tầng 2', question: 'Khoản nào đủ tin cậy để làm tài sản bảo đảm?' },
  { page: 'ung-von', href: ROUTES.ungVon, label: 'Ứng vốn', icon: HandCoins, tone: 'tier3', tier: 'Tầng 3', question: 'Tôi được ứng bao nhiêu, chi phí bao nhiêu?' },
  { page: 'khoan-vay', href: ROUTES.khoanVay, label: 'Khoản vay', icon: ReceiptText, tone: 'tier2', tier: 'Tầng 2', question: 'Còn nợ bao nhiêu, trả khi nào?' },
  { page: 'quyen-du-lieu', href: ROUTES.quyen, label: 'Quyền & dữ liệu', icon: ShieldCheck, tone: 'primary', question: 'Ai được xem dữ liệu của tôi?' },
]
const ACTIVE_TONE = {
  primary: 'bg-primary-soft text-primary',
  tier1: 'bg-tier1-bg text-tier1-fg',
  tier2: 'bg-tier2-bg text-tier2-fg',
  tier3: 'bg-tier3-bg text-tier3-fg',
}
const BAND_TONE = { primary: 'bg-app-surface', tier1: 'bg-tier1-bg', tier2: 'bg-tier2-bg', tier3: 'bg-tier3-bg' }
const TIER_FG = { tier1: 'text-tier1-fg', tier2: 'text-tier2-fg', tier3: 'text-tier3-fg' }

// notice: thẻ tạm hiện trên đầu trang (vd. tóm tắt "6 tuần sau" ngay sau khi tua).
export default function AppShell({ route, onHelp, notice, children }) {
  const seller = route.space === 'nha-ban'
  const nav = seller && NAV.find((n) => n.page === route.page)
  return (
    // pr-12: chừa chỗ cho mấu "Mô phỏng" thu gọn ở cạnh phải
    <div className="flex h-screen min-w-[1280px] flex-col bg-app-bg pr-12 text-ink">
      {seller && <TopBar onHelp={onHelp} />}
      <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1">
        {seller && <SideNav active={route.page} />}
        <main className="min-w-0 flex-1 overflow-auto" style={{ viewTransitionName: 'page' }}>
          {nav ? (
            <>
              <PageBand nav={nav} />
              <div className="space-y-5 px-8 pb-10 pt-5">
                <NextStepCard page={route.page} />
                {notice}
                {children}
              </div>
            </>
          ) : (
            children
          )}
        </main>
      </div>
      <footer className="border-t border-line px-6 py-2 text-label text-ink-muted">{FOOTER_NOTE}</footer>
    </div>
  )
}

// Dải tiêu đề trang: nền nhạt của Tầng (K.2) — nền Tầng không dùng cho thẻ đơn vị.
function PageBand({ nav }) {
  return (
    <div className={`border-b border-line px-8 py-4 ${BAND_TONE[nav.tone]}`}>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h1 className="text-screen-title font-bold text-ink">{nav.label}</h1>
        {nav.tier && <span className={`text-label font-semibold ${TIER_FG[nav.tone]}`}>{nav.tier}</span>}
        <p className="text-body text-ink-muted">{nav.question}</p>
      </div>
    </div>
  )
}

// Thẻ "Bước tiếp theo" (san-pham.md D.3): một câu + một nút, đọc nextStep(state, trang).
function NextStepCard({ page }) {
  const { state } = useApp()
  const step = nextStep(state, page)
  return (
    <section aria-label="Bước tiếp theo" className="flex items-center gap-4 rounded-xl border border-primary bg-primary-soft px-5 py-3">
      <ArrowRight size={22} className="flex-shrink-0 text-primary" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-body text-ink">
          <span className="font-semibold text-primary">Bước tiếp theo: </span>
          {step.text}
        </p>
        {step.hint && <p className="text-label text-ink-muted">{step.hint}</p>}
      </div>
      {step.action && (
        <a
          href={step.action.href}
          className="flex-shrink-0 rounded-lg bg-primary px-4 py-2 text-body font-semibold text-white transition duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {step.action.label}
        </a>
      )}
    </section>
  )
}

function TopBar({ onHelp }) {
  const { state } = useApp()
  return (
    <header className="border-b border-line bg-app-surface">
      <div className="mx-auto flex max-w-[1440px] items-center gap-6 px-6 py-3">
        <span className="text-emphasis font-bold text-primary">{DISPLAY_NAME}</span>
        <span className="text-body">Đối tác: Techcombank</span>
        <span className="ml-auto flex items-center gap-2 text-body">
          <CalendarDays size={20} aria-hidden="true" className="text-ink-muted" />
          <span className="text-ink-muted">Ngày mô phỏng</span>
          {/* key: ngày mới mờ dần vào 200ms khi tua (hanh-trinh 1.7) */}
          <span key={state.eventIndex} className="animate-[page-in_200ms_var(--ease-out)] font-semibold tabular-nums">
            {formatDateVN(simDate(state))}
          </span>
        </span>
        <button
          type="button"
          onClick={onHelp}
          aria-label="Hướng dẫn và phím tắt"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-primary transition duration-fast hover:bg-primary-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        >
          <CircleHelp size={22} aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}

function SideNav({ active }) {
  return (
    <nav aria-label="Điều hướng chính" className="flex w-64 flex-shrink-0 flex-col overflow-y-auto border-r border-line bg-app-surface">
      <ul className="space-y-1 p-3">
        {NAV.map(({ page, href, label, icon: Icon, tone }) => {
          const current = page === active
          return (
            <li key={page}>
              <a
                href={href}
                aria-current={current ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-body transition duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
                  current ? `${ACTIVE_TONE[tone]} font-semibold` : 'text-ink hover:bg-app-bg'
                }`}
              >
                <Icon size={20} aria-hidden="true" className="flex-shrink-0" />
                {label}
              </a>
            </li>
          )
        })}
      </ul>
      <TaskChecklist />
    </nav>
  )
}
