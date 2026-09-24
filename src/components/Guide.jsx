import { useEffect, useRef } from 'react'
import { ChevronDown, RotateCcw } from 'lucide-react'
import { ESCROW_STUCK, FOOTER_NOTE, GLOSSARY, SALES_CHANNELS, SELLER_PROFILE } from '../data/mockData.js'
import { ROUTES, nextStep, tasks } from '../logic/journey.js'
import { formatNumberVN } from '../utils/format.js'
import { useApp } from '../state/appState.jsx'
import Drawer from './ui/Drawer.jsx'
import DoneCheck from './ui/DoneCheck.jsx'
import { SHORTCUTS } from './ScenarioPanel.jsx'

// Hướng dẫn người dùng (docs/san-pham.md D.1, D.2, D.5): màn chào, danh sách nhiệm vụ,
// ngăn Hướng dẫn. Mọi lớp đọc tasks(state) — không kịch bản viết cứng theo thứ tự trang.

const OWNER = SELLER_PROFILE.ownerName.replace('Chị', 'chị')
const CHANNELS = SALES_CHANNELS.map((c) => c.channel.split('/')[0]).join(', ').replace(/, ([^,]*)$/, ' và $1')
const ROLE_TEXT = `Bạn là ${OWNER}, chủ shop ${SELLER_PROFILE.industry.toLowerCase()} ${SELLER_PROFILE.shopName}, bán trên ${CHANNELS}.`
const GOAL_TEXT = `Lúc nào cũng có khoảng ${formatNumberVN(ESCROW_STUCK.normal.amount)} triệu tiền hàng nằm ở sàn. Hãy dùng app để biến số tiền đó thành tài sản bảo đảm và nhận vốn từ Techcombank — rồi trả nợ khi sàn thanh toán.`

// Nhiệm vụ kèm đường Đi tới. Đường trỏ đúng trang đang mở (vd. nhiệm vụ 1 → Tổng quan) thì bấm
// không đi đâu → dùng hành động của thẻ Bước tiếp theo trên trang này. Đọc hash lúc vẽ: App vẽ
// lại mỗi lần đổi trang.
function guideTasks(state) {
  const here = window.location.hash.split('?')[0]
  const t = tasks(state)
  const items = t.items.map((task) =>
    task.fix?.href === here ? { ...task, fix: nextStep(state, here.split('/')[2]).action ?? task.fix } : task
  )
  return { ...t, items }
}

// ─── D.1 Màn chào ────────────────────────────────────────────────────────────
// <dialog> gốc: showModal() cho lớp phủ, chặn nền và giữ focus bên trong. Esc = Tự khám phá.
export function WelcomeDialog({ open, onChoose }) {
  const ref = useRef(null)
  const { state } = useApp()
  const total = tasks(state).requiredTotal

  useEffect(() => {
    const dialog = ref.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="welcome-title"
      onCancel={(e) => {
        e.preventDefault()
        onChoose('explore')
      }}
      className="w-[600px] max-w-[calc(100vw-32px)] animate-[dialog-in_250ms_var(--ease-out)] rounded-2xl border border-line bg-app-surface p-8 text-ink shadow-xl backdrop:bg-slate-950/40 backdrop:backdrop-blur-sm"
    >
      <h2 id="welcome-title" className="text-screen-title font-bold">
        Chào mừng — hãy thử app trong vai {OWNER}
      </h2>
      <dl className="mt-5 space-y-4 text-body">
        <div>
          <dt className="text-label font-semibold text-primary">Vai của bạn</dt>
          <dd>{ROLE_TEXT}</dd>
        </div>
        <div>
          <dt className="text-label font-semibold text-primary">Mục tiêu</dt>
          <dd>{GOAL_TEXT}</dd>
        </div>
        <div>
          <dt className="text-label font-semibold text-primary">Thời lượng</dt>
          <dd>Khoảng 3 phút · {total} nhiệm vụ.</dd>
        </div>
      </dl>
      <div className="mt-7 flex flex-wrap gap-3">
        <button
          type="button"
          autoFocus
          onClick={() => onChoose('guided')}
          className="rounded-lg bg-primary px-5 py-2.5 text-body font-semibold text-white transition duration-fast hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Bắt đầu có hướng dẫn
        </button>
        <button
          type="button"
          onClick={() => onChoose('explore')}
          className="rounded-lg border border-primary px-5 py-2.5 text-body font-semibold text-primary transition duration-fast hover:bg-primary-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Tự khám phá
        </button>
      </div>
      <p className="mt-5 text-label text-ink-muted">
        {FOOTER_NOTE}. Bạn có thể đổi sang vai cán bộ Techcombank ở bảng Mô phỏng bên phải.
      </p>
    </dialog>
  )
}

// ─── D.2 Danh sách nhiệm vụ ──────────────────────────────────────────────────
const GO_CLASS =
  'inline-block rounded-md px-3 py-1 text-label font-semibold transition duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

function GoTo({ task, current }) {
  return (
    <a
      href={task.fix.href}
      aria-label={`Đi tới: ${task.label}`}
      className={`${GO_CLASS} ${current ? 'bg-primary text-white hover:opacity-90' : 'border border-primary text-primary hover:bg-primary-soft'}`}
    >
      Đi tới
    </a>
  )
}

// Tên ngắn cho thanh điều hướng (thiếu chỗ ở 1366×768); tên đầy đủ ở nhiệm vụ đang làm,
// aria-label và ngăn Hướng dẫn.
const SHORT = {
  1: 'Kết nối Techcombank',
  2: 'Xem khoản phải thu',
  3: 'Nhận giải ngân',
  4: 'Trả hết khoản vay',
  5: 'Góc nhìn cán bộ',
  6: 'Đổi tài khoản nhận tiền',
  7: 'Nhiều bên chào giá',
}

function TaskIcon({ task, current }) {
  if (task.done) return <DoneCheck size={22} className="text-primary" />
  return (
    <span
      aria-hidden="true"
      className={`flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full border-2 text-label font-semibold leading-none ${
        current ? 'border-primary text-primary' : 'border-line text-ink-muted'
      }`}
    >
      {task.id}
    </span>
  )
}

// compact: một dòng tên ngắn; nhiệm vụ chưa xong thì cả dòng là liên kết Đi tới.
// Nhiệm vụ đang làm (current) luôn hiện đủ: tên đầy đủ + nút Đi tới.
function TaskRow({ task, current, compact }) {
  if (compact && !current) {
    const text = (
      <>
        <span className="sr-only">{task.done ? 'Đã xong: ' : 'Chưa xong: '}</span>
        {SHORT[task.id]}
      </>
    )
    return (
      <li className="flex items-center gap-2.5 px-2 py-1">
        <TaskIcon task={task} />
        {task.fix ? (
          <a
            href={task.fix.href}
            aria-label={`Đi tới: ${task.label}`}
            className="min-w-0 flex-1 truncate rounded text-label text-ink transition-colors duration-fast hover:text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            {text}
          </a>
        ) : (
          <span className="min-w-0 flex-1 truncate text-label text-ink-muted transition-colors duration-slow">{text}</span>
        )}
      </li>
    )
  }
  return (
    <li className={`flex gap-2.5 rounded-lg px-2 py-1.5 transition-colors duration-slow ${current ? 'bg-primary-soft' : ''}`}>
      <span className="mt-0.5">
        <TaskIcon task={task} current={current} />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <p className={`text-label transition-colors duration-slow ${task.done ? 'text-ink-muted' : current ? 'font-semibold text-ink' : 'text-ink'}`}>
          <span className="sr-only">{task.done ? 'Đã xong: ' : 'Chưa xong: '}</span>
          {task.label}
          {task.optional && <span className="text-ink-muted"> (tùy chọn)</span>}
        </p>
        {task.fix && <GoTo task={task} current={current} />}
      </div>
    </li>
  )
}

function Progress({ done, total }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label="Tiến độ nhiệm vụ">
      <div className="h-full rounded-full bg-primary transition-[width] duration-slow ease-standard" style={{ width: `${(done / total) * 100}%` }} />
    </div>
  )
}

function FinishCard({ optional }) {
  return (
    <div className="space-y-3 rounded-lg border border-primary bg-primary-soft p-3">
      <p className="flex items-center gap-2 text-body font-semibold text-ink">
        <DoneCheck size={24} className="text-primary" />
        Bạn đã đi hết hành trình
      </p>
      <p className="text-label text-ink-muted">Muốn xem thêm? Thử hai tình huống:</p>
      <ol className="space-y-1">
        {optional.map((t) => (
          <TaskRow key={t.id} task={t} compact />
        ))}
      </ol>
      <a
        href={ROUTES.batDauLai}
        className={`${GO_CLASS} flex w-fit items-center gap-1.5 border border-primary text-primary hover:bg-app-surface`}
      >
        <RotateCcw size={16} aria-hidden="true" />
        Bắt đầu lại
      </a>
    </div>
  )
}

// Cuối thanh điều hướng trái: thu gọn được thành một dòng "Nhiệm vụ x/5". Chỉ 5 nhiệm vụ bắt
// buộc, dạng gọn (vừa chiều cao 1366×768); 2 nhiệm vụ tùy chọn ở thẻ kết và ngăn Hướng dẫn.
export function TaskChecklist() {
  const { state, dispatch } = useApp()
  const { items, requiredDone, requiredTotal, allRequiredDone } = guideTasks(state)
  const open = state.guide.checklistOpen
  const required = items.filter((t) => !t.optional)
  const currentId = required.find((t) => !t.done)?.id

  return (
    <section aria-label="Nhiệm vụ" className="mt-auto space-y-2 border-t border-line p-3">
      <button
        type="button"
        onClick={() => dispatch({ type: 'toggleChecklist' })}
        aria-expanded={open}
        className="w-full space-y-1.5 rounded-lg px-2 py-1.5 text-left transition duration-fast hover:bg-app-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      >
        <span className="flex items-center justify-between text-label font-semibold">
          Nhiệm vụ {requiredDone}/{requiredTotal}
          <ChevronDown size={18} aria-hidden="true" className={`transition duration-fast ${open ? 'rotate-180' : ''}`} />
        </span>
        <Progress done={requiredDone} total={requiredTotal} />
      </button>
      {open &&
        (allRequiredDone ? (
          <FinishCard optional={items.filter((t) => t.optional)} />
        ) : (
          <ol className="space-y-0.5">
            {required.map((t) => (
              <TaskRow key={t.id} task={t} current={t.id === currentId} compact />
            ))}
          </ol>
        ))}
    </section>
  )
}

// ─── D.5 Ngăn Hướng dẫn ──────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <section className="space-y-2 border-t border-slate-200 pt-4">
      <h3 className="text-emphasis font-semibold text-slate-900">{title}</h3>
      {children}
    </section>
  )
}

export function HelpDrawer({ open, onClose, onReplayWelcome }) {
  const { state } = useApp()
  const { items, requiredDone, requiredTotal } = guideTasks(state)
  const currentId = items.find((t) => !t.optional && !t.done)?.id
  return (
    <Drawer open={open} onClose={onClose} title="Hướng dẫn">
      <div className="space-y-5 text-slate-900">
        <div className="space-y-2 text-body">
          <p>{ROLE_TEXT}</p>
          <p>{GOAL_TEXT}</p>
          <button
            type="button"
            onClick={onReplayWelcome}
            className="rounded-lg border border-primary px-4 py-2 text-label font-semibold text-primary transition duration-fast hover:bg-primary-soft"
          >
            Xem lại màn chào
          </button>
        </div>

        <Section title={`Nhiệm vụ ${requiredDone}/${requiredTotal}`}>
          <ol className="space-y-0.5">
            {items.map((t) => (
              <TaskRow key={t.id} task={t} current={t.id === currentId} />
            ))}
          </ol>
        </Section>

        <Section title="Thuật ngữ">
          <dl className="space-y-2.5">
            {Object.entries(GLOSSARY).map(([term, def]) => (
              <div key={term}>
                <dt className="text-label font-semibold">{term}</dt>
                <dd className="text-label text-slate-700">{def}</dd>
              </div>
            ))}
          </dl>
        </Section>

        <Section title="Phím tắt">
          <dl className="space-y-1.5">
            {SHORTCUTS.map(([k, desc]) => (
              <div key={k} className="flex items-center justify-between gap-3 text-label">
                <dt>
                  <kbd className="rounded border border-slate-300 bg-slate-100 px-2 py-0.5 font-mono">{k}</kbd>
                </dt>
                <dd className="text-right text-slate-700">{desc}</dd>
              </div>
            ))}
          </dl>
        </Section>
      </div>
    </Drawer>
  )
}
