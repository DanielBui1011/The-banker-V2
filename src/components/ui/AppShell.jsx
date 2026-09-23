import {
  LayoutDashboard,
  ArrowLeftRight,
  FileCheck2,
  HandCoins,
  ReceiptText,
  ShieldCheck,
  CalendarDays,
  CircleHelp,
  CheckCircle2,
  Circle,
  ChevronDown,
} from 'lucide-react'
import { DISPLAY_NAME } from '../../config/brand.js'
import { FOOTER_NOTE } from '../../data/mockData.js'
import { ROUTES, simDate, tasks } from '../../logic/journey.js'
import { formatDateVN } from '../../utils/format.js'
import { useApp } from '../../state/appState.jsx'

// Khung app nhà bán (docs/san-pham.md B.1, K.2, K.5): thanh trên, thanh điều hướng trái
// 6 trang + khu nhiệm vụ ở cuối, chân trang. Mục đang chọn mang nền nhạt của Tầng nó
// thuộc. Trang Techcombank và cổng ngân hàng (khu khác 'nha-ban') không có thanh trên/điều
// hướng của Nền tảng (quy-tac mục 3) — chỉ có chân trang.
const NAV = [
  { page: 'tong-quan', href: ROUTES.tongQuan, label: 'Tổng quan', icon: LayoutDashboard, tone: 'primary' },
  { page: 'doi-soat', href: ROUTES.doiSoat, label: 'Đối soát', icon: ArrowLeftRight, tone: 'tier1' },
  { page: 'khoan-phai-thu', href: ROUTES.khoanPhaiThu, label: 'Khoản phải thu', icon: FileCheck2, tone: 'tier2' },
  { page: 'ung-von', href: ROUTES.ungVon, label: 'Ứng vốn', icon: HandCoins, tone: 'tier3' },
  { page: 'khoan-vay', href: ROUTES.khoanVay, label: 'Khoản vay', icon: ReceiptText, tone: 'tier2' },
  { page: 'quyen-du-lieu', href: ROUTES.quyen, label: 'Quyền & dữ liệu', icon: ShieldCheck, tone: 'primary' },
]
const ACTIVE_TONE = {
  primary: 'bg-primary-soft text-primary',
  tier1: 'bg-tier1-bg text-tier1-fg',
  tier2: 'bg-tier2-bg text-tier2-fg',
  tier3: 'bg-tier3-bg text-tier3-fg',
}

export default function AppShell({ route, onHelp, children }) {
  const seller = route.space === 'nha-ban'
  return (
    // pr-12: chừa chỗ cho mấu "Mô phỏng" thu gọn ở cạnh phải
    <div className="flex h-screen min-w-[1280px] flex-col bg-app-bg pr-12 text-ink">
      {seller && <TopBar onHelp={onHelp} />}
      <div className="mx-auto flex min-h-0 w-full max-w-[1440px] flex-1">
        {seller && <SideNav active={route.page} />}
        <main className="min-w-0 flex-1 overflow-auto" style={{ viewTransitionName: 'page' }}>
          {children}
        </main>
      </div>
      <footer className="border-t border-line px-6 py-2 text-label text-ink-muted">{FOOTER_NOTE}</footer>
    </div>
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
          <span className="font-semibold tabular-nums">{formatDateVN(simDate(state))}</span>
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
      <TaskList />
    </nav>
  )
}

// Tạm hiện tasks(state) — giao diện đầy đủ ở Vòng 25 (san-pham.md D.2)
function TaskList() {
  const { state, dispatch } = useApp()
  const { items, requiredDone, requiredTotal } = tasks(state)
  const open = state.guide.checklistOpen
  return (
    <section aria-label="Nhiệm vụ" className="mt-auto border-t border-line p-3">
      <button
        type="button"
        onClick={() => dispatch({ type: 'toggleChecklist' })}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-label font-semibold transition duration-fast hover:bg-app-bg"
      >
        Nhiệm vụ {requiredDone}/{requiredTotal}
        <ChevronDown size={18} aria-hidden="true" className={`transition duration-fast ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ol className="mt-1 space-y-1">
          {items.map((t) => (
            <li key={t.id} className="flex gap-2 px-3 py-1 text-label">
              {t.done ? (
                <CheckCircle2 size={18} aria-label="Đã xong" className="mt-0.5 flex-shrink-0 text-primary" />
              ) : (
                <Circle size={18} aria-label="Chưa xong" className="mt-0.5 flex-shrink-0 text-ink-muted" />
              )}
              <span className={t.done ? 'text-ink-muted line-through' : ''}>
                {t.fix ? (
                  <a href={t.fix.href} className="hover:text-primary hover:underline">
                    {t.label}
                  </a>
                ) : (
                  t.label
                )}
                {t.optional && <span className="text-ink-muted"> (tùy chọn)</span>}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
