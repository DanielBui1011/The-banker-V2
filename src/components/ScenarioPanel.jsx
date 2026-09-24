import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { ROUTES, availability, events, simDate, initialState } from '../logic/journey.js'
import { isCommand } from '../utils/route.js'
import { formatDateVN } from '../utils/format.js'
import { isTypingTarget } from '../utils/keyboard.js'
import { useApp } from '../state/appState.jsx'
import ConfirmDialog from './ui/ConfirmDialog.jsx'

// Bảng điều khiển Mô phỏng (docs/san-pham.md mục C, G.3): ngăn kéo cạnh phải, nền tối,
// không mang màu Nền tảng hay Techcombank. Nút trên bảng, phím tắt và lệnh '#/mo-phong/…'
// (đường dẫn sửa lỗi của availability) cùng đi qua availability().

// Tên sự kiện kế tiếp (san-pham.md E.1) — nhánh Đổi tài khoản nhận tiền khác ở E2
function eventLabel(id, accountChange) {
  if (id === 'E2' && accountChange) return 'Shopee không thanh toán RU-03 về tài khoản Techcombank'
  return {
    E0: 'Bắt đầu — chưa kết nối',
    E1: 'Sáu tuần đối soát xong, RU-03 và RU-04 đã xác thực',
    E2: 'Shopee thanh toán RU-03',
    E3: 'TikTok Shop thanh toán RU-04',
    E4: 'Hết cửa sổ thanh toán RU-03',
    E5: 'Hết ân hạn — RU-03 đứt gãy',
  }[id]
}
const ddmm = (iso) => formatDateVN(iso).slice(0, 5)

const SCENARIOS = [
  {
    action: 'togglePeakSeason',
    key: 'peakSeason',
    label: 'Mùa cao điểm',
    hint: 'M',
    desc: 'Doanh thu sàn tăng mạnh — chỉ xem ước tính giá trị khả dụng, không tạo khoản vay.',
  },
  {
    action: 'toggleAccountChange',
    key: 'accountChange',
    label: 'Đổi tài khoản nhận tiền',
    hint: 'L',
    desc: 'Chị Lan đổi tài khoản nhận tiền trên Shopee sang ngân hàng khác mà chưa cập nhật.',
  },
  {
    action: 'togglePhase3',
    key: 'phase3',
    label: 'Giai đoạn 3',
    hint: '3',
    desc: 'Nhiều bên cho vay chào giá trên cùng khoản phải thu.',
  },
]

export const SHORTCUTS = [
  ['Space', 'Tua tới sự kiện tiếp theo'],
  ['M', 'Mùa cao điểm'],
  ['L', 'Đổi tài khoản nhận tiền'],
  ['3', 'Giai đoạn 3'],
  ['R', 'Bắt đầu lại (có xác nhận)'],
  ['D', 'Gửi lại lệnh khóa (cổng ngân hàng)'],
  ['F', 'Toàn màn hình'],
  ['?', 'Hướng dẫn và phím tắt'],
]

const START_DATE = formatDateVN(simDate(initialState()))
const ROLE_LABEL = { seller: 'Nhà bán', officer: 'Cán bộ Techcombank' }

export default function ScenarioPanel({ route, onHelp }) {
  const { state, dispatch } = useApp()
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  const next = events(state)[state.eventIndex + 1]
  const today = formatDateVN(simDate(state))

  function showToast(text) {
    clearTimeout(toastTimer.current)
    setToast(text)
    toastTimer.current = setTimeout(() => setToast(null), 4000) // hanh-trinh 2.1: tự tắt sau 4 giây
  }

  // Chạy một hành động qua availability; trả về thông báo cho phím tắt / lệnh hash
  function run(type, doneText, blockedText) {
    const a = availability(state, type)
    if (!a.ok) return `${blockedText}: ${a.reason}`
    dispatch({ type })
    return doneText
  }
  const advanceMessage = () =>
    run('advance', next && `Đã tua tới ${ddmm(next.date)}: ${eventLabel(next.id, state.scenario.accountChange)}`, 'Không tua được')
  const toggleMessage = (s) =>
    run(s.action, `${state.scenario[s.key] ? 'Đã tắt' : 'Đã bật'} tình huống: ${s.label}`, `Không đổi được ${s.label}`)
  const switchRole = () => {
    dispatch({ type: 'switchRole' })
    return `Đã đổi sang vai ${ROLE_LABEL[state.role === 'seller' ? 'officer' : 'seller']}`
  }

  // Phím tắt — cùng điều kiện với nút (availability); bị chặn thì chỉ báo lý do
  useEffect(() => {
    function onKeyDown(event) {
      if (isTypingTarget(event.target) || event.ctrlKey || event.metaKey || event.altKey) return
      if (document.querySelector('dialog[open]')) return // màn chào đang mở: chưa nhận phím tắt
      const key = event.key.toLowerCase()
      const scenario = SCENARIOS.find((s) => s.hint.toLowerCase() === key)
      if (event.key === ' ') {
        // Space trên nút/liên kết đang được chọn vẫn là bấm nút (bàn phím), không phải Tua
        if (event.target.closest?.('button, a, summary, [role="switch"]')) return
        event.preventDefault()
        showToast(advanceMessage())
      } else if (scenario) {
        showToast(toggleMessage(scenario))
      } else if (key === 'r') {
        setConfirmOpen(true)
      } else if (key === 'f') {
        if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
        else document.documentElement.requestFullscreen?.().catch(() => {})
      } else if (event.key === '?') {
        onHelp()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  // Lệnh '#/mo-phong/…' (đường dẫn sửa lỗi trong availability, nhiệm vụ) → chạy rồi trả hash về trang cũ
  useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash
      if (!isCommand(hash)) return
      window.history.replaceState(null, '', route.href)
      if (hash === ROUTES.tua) showToast(advanceMessage())
      else if (hash === ROUTES.batDauLai) setConfirmOpen(true)
      else if (hash === ROUTES.doiVai) showToast(switchRole())
      else setOpen(true)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  })

  function confirmReset() {
    dispatch({ type: 'reset' })
    setConfirmOpen(false)
    window.location.hash = ROUTES.tongQuan
  }

  const advance = availability(state, 'advance')

  return (
    <>
      {open ? (
        <aside
          aria-label="Mô phỏng"
          className="fixed inset-y-0 right-0 z-[100] flex w-[360px] animate-[drawer-in_250ms_cubic-bezier(0.2,0,0,1)] flex-col overflow-y-auto bg-slate-900 text-slate-50 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
            <h2 className="text-section-title font-bold">Mô phỏng</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Thu gọn bảng Mô phỏng"
              className="rounded-lg p-2 transition duration-fast hover:bg-slate-800"
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>

          <div className="space-y-6 px-5 py-5">
            <Block title="Vai">
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-600 p-1">
                {['seller', 'officer'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    aria-pressed={state.role === role}
                    onClick={() => state.role !== role && switchRole()}
                    className={`rounded-md px-2 py-2 text-label font-semibold transition duration-fast ${
                      state.role === role ? 'bg-slate-50 text-slate-900' : 'text-slate-50 hover:bg-slate-800'
                    }`}
                  >
                    {ROLE_LABEL[role]}
                  </button>
                ))}
              </div>
            </Block>

            <Block title="Ngày mô phỏng">
              <div className="text-hero font-bold tabular-nums">{today}</div>
              <button
                type="button"
                disabled={!advance.ok}
                onClick={() => dispatch({ type: 'advance' })}
                className="mt-3 w-full rounded-lg bg-slate-50 px-4 py-2.5 text-body font-semibold text-slate-900 transition duration-fast hover:bg-white disabled:cursor-not-allowed disabled:border disabled:border-slate-600 disabled:bg-slate-800 disabled:text-slate-50"
              >
                Tua tới sự kiện tiếp theo
              </button>
              {next && advance.ok && (
                <p className="mt-2 text-label">
                  → {ddmm(next.date)}: {eventLabel(next.id, state.scenario.accountChange)}
                </p>
              )}
              {!advance.ok && <Blocked reason={advance.reason} fix={advance.fix} />}
            </Block>

            <Block title="Tình huống">
              <ul className="space-y-3">
                {SCENARIOS.map((s) => {
                  const a = availability(state, s.action)
                  const on = state.scenario[s.key]
                  return (
                    <li key={s.key} className="rounded-lg border border-slate-700 px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-body font-semibold">{s.label}</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={on}
                          aria-label={s.label}
                          disabled={!a.ok}
                          onClick={() => showToast(toggleMessage(s))}
                          className="flex flex-shrink-0 items-center gap-2 rounded-full text-label font-semibold disabled:cursor-not-allowed"
                        >
                          {on ? 'Bật' : 'Tắt'}
                          <span
                            className={`flex h-7 w-12 items-center rounded-full border border-slate-50 transition duration-fast ${
                              on ? 'justify-end bg-slate-50' : 'justify-start bg-slate-800'
                            }`}
                          >
                            <span className={`mx-0.5 block h-5 w-5 rounded-full ${on ? 'bg-slate-900' : 'bg-slate-50'}`} />
                          </span>
                        </button>
                      </div>
                      <p className="mt-1 text-label">{s.desc}</p>
                      {!a.ok && <Blocked reason={a.reason} fix={a.fix} />}
                    </li>
                  )
                })}
              </ul>
            </Block>

            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="w-full rounded-lg border border-slate-50 px-4 py-2.5 text-body font-semibold transition duration-fast hover:bg-slate-800"
            >
              Bắt đầu lại
            </button>

            <details className="rounded-lg border border-slate-700 px-3 py-2">
              <summary className="cursor-pointer text-label font-semibold">Phím tắt</summary>
              <dl className="mt-2 space-y-1.5">
                {SHORTCUTS.map(([k, desc]) => (
                  <div key={k} className="flex items-center justify-between gap-3 text-label">
                    <dt>
                      <kbd className="rounded border border-slate-600 bg-slate-800 px-2 py-0.5 font-mono">{k}</kbd>
                    </dt>
                    <dd className="text-right">{desc}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </div>
        </aside>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-label={`Mở bảng Mô phỏng — ngày ${today}`}
          className="fixed right-0 top-1/2 z-[100] -translate-y-1/2 rounded-l-lg bg-slate-900 px-3 py-4 text-label font-semibold text-slate-50 shadow-lg transition duration-fast [writing-mode:vertical-rl] hover:bg-slate-800"
        >
          Mô phỏng · {today}
        </button>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Bắt đầu lại"
        message={`Xóa toàn bộ tiến trình và quay về ${START_DATE}?`}
        confirmLabel="Bắt đầu lại"
        onConfirm={confirmReset}
        onCancel={() => setConfirmOpen(false)}
      />

      <div role="status" aria-live="polite" className="fixed bottom-14 left-1/2 z-[160] max-w-[640px] -translate-x-1/2">
        {toast && <div className="rounded-lg bg-slate-900 px-5 py-3 text-body text-slate-50 shadow-xl">{toast}</div>}
      </div>
    </>
  )
}

function Block({ title, children }) {
  return (
    <section>
      <h3 className="mb-2 text-label font-semibold uppercase tracking-wide">{title}</h3>
      {children}
    </section>
  )
}

function Blocked({ reason, fix }) {
  return (
    <p className="mt-2 text-label">
      {reason}
      {fix && (
        <>
          {' '}
          →{' '}
          <a href={fix.href} className="font-semibold underline underline-offset-2">
            {fix.label}
          </a>
        </>
      )}
    </p>
  )
}
