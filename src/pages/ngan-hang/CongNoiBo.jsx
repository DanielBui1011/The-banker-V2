import { useEffect, useState } from 'react'
import { Eye, EyeOff, Lock, FileBadge, ArrowRight, CircleHelp, RotateCw } from 'lucide-react'
import SimHint, { isSimHref } from '../../components/ui/SimHint.jsx'
import SurfaceFrame from '../../components/ui/SurfaceFrame.jsx'
import Card from '../../components/ui/Card.jsx'
import Money from '../../components/ui/Money.jsx'
import ToggleSwitch from '../../components/ui/ToggleSwitch.jsx'
import Callout from '../../components/ui/Callout.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import Drawer from '../../components/ui/Drawer.jsx'
import Term from '../../components/ui/Term.jsx'
import StatusBadge from '../../components/ui/StatusBadge.jsx'
import LockCertificate from '../../components/LockCertificate.jsx'
import {
  SELLER_PROFILE,
  GRANTED_PERMISSIONS,
  BANK_ALERT_POLICY,
  RECEIVABLE_UNITS,
  VERIFICATION_METRICS,
  LEAK_BATCH_RATE,
  LOCK_CERTIFICATE,
  MIN_LOTS_FOR_SCORE,
} from '../../data/mockData.js'
import { computeVerificationScore, computeLeakAdjustedScore } from '../../logic/verification.js'
import { ROUTES, availability, bankView, nextStep, resendLock, simDate, unitStatus, ru03Broke } from '../../logic/journey.js'
import { go } from '../../utils/route.js'
import { isTypingTarget } from '../../utils/keyboard.js'
import { formatNumberVN, formatDateVN } from '../../utils/format.js'
import { useApp } from '../../state/appState.jsx'

// Cổng nội bộ Techcombank (san-pham.md B.3, G.2; hanh-trinh 3.1–3.8). Mọi số đọc từ
// bankView(state) tại ngày mô phỏng chung — không bộ chọn thời điểm riêng. Không bao giờ
// hiện tên bên khóa khác (quy-tac mục 5): chỉ SỐ bên.
const TCB = LOCK_CERTIFICATE.secured
const A2_PERMISSION = GRANTED_PERMISSIONS.find((p) => p.code === 'A2')
const SECTIONS = [
  { id: 'tra-cuu', label: 'Tra cứu nhà bán', href: ROUTES.traCuu },
  { id: 'danh-muc-khoa', label: 'Danh mục khóa', href: ROUTES.danhMucKhoa },
  { id: 'canh-bao', label: 'Cảnh báo', href: ROUTES.canhBao },
]
const RESEND_MS = 6000
const LOCKED_AT = `${formatDateVN(LOCK_CERTIFICATE.lockedAt.slice(0, 10))} ${LOCK_CERTIFICATE.lockedAt.slice(11)}`

export default function CongNoiBo({ page, onHelp }) {
  const { state } = useApp()
  const view = bankView(state)
  const [resent, setResent] = useState(null)

  // Nút "Thử gửi lại lệnh khóa" ở Danh mục khóa; phím D là lối tắt — lũy đẳng, sổ khóa không thêm
  // sự kiện (3.6). Thông báo chỉ hiện SAU khi bấm (Vòng 28).
  function resend() {
    const gate = availability(state, 'resendLock')
    setResent(gate.ok && resendLock(state)?.status === 'DA_GHI_NHAN' ? 'ok' : gate.reason)
  }
  useEffect(() => {
    function onKeyDown(e) {
      if (isTypingTarget(e.target) || e.ctrlKey || e.metaKey || e.altKey || e.key.toLowerCase() !== 'd') return
      resend()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [state])
  useEffect(() => {
    if (!resent) return
    const timer = setTimeout(() => setResent(null), RESEND_MS)
    return () => clearTimeout(timer)
  }, [resent])

  const nav = {
    items: SECTIONS.map((s) => ({ ...s, count: s.id === 'canh-bao' ? view.alerts.length : 0 })),
    active: page,
    onSelect: (id) => go(SECTIONS.find((s) => s.id === id).href),
  }
  const title = SECTIONS.find((s) => s.id === page).label
  // Tổng của lệnh khóa gốc (3.6: 85 triệu) — không đổi theo phần đã trả
  const tcbTotal = state.registry.filter((e) => e.lenderId === TCB).reduce((sum, e) => sum + e.amount, 0)

  return (
    <SurfaceFrame variant="bankOps" bankName={TCB} nav={nav}>
      <div className="max-w-6xl space-y-6 px-12 pb-16 pt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="text-screen-title font-bold text-slate-900">
            {title} — {SELLER_PROFILE.shopName}
          </h1>
          <span className="flex items-center gap-4 text-body text-slate-700">
            <SimHint className="whitespace-nowrap">
              Ngày mô phỏng <span className="text-body font-semibold tabular-nums">{formatDateVN(simDate(state))}</span>
            </SimHint>
            {/* Nút ? mở ngăn Hướng dẫn (san-pham.md D.5) — trung tính, không màu Nền tảng */}
            <button
              type="button"
              onClick={onHelp}
              aria-label="Hướng dẫn và phím tắt"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-900 transition duration-fast hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-900"
            >
              <CircleHelp size={22} aria-hidden="true" />
            </button>
          </span>
        </div>

        <OfficerStep page={page} />

        {resent && page !== 'danh-muc-khoa' && <ResendResult resent={resent} total={tcbTotal} />}

        {page === 'tra-cuu' && <Lookup view={view} />}
        {page === 'danh-muc-khoa' && <Portfolio onResend={resend} result={resent && <ResendResult resent={resent} total={tcbTotal} />} />}
        {page === 'canh-bao' && <Alerts alerts={view.alerts} resolved={view.resolvedAlerts} />}
      </div>
    </SurfaceFrame>
  )
}

function ResendResult({ resent, total }) {
  return (
    <Callout variant="info">
      {resent === 'ok'
        ? `Lệnh khóa này đã được ghi nhận lúc ${LOCK_CERTIFICATE.lockedAt.slice(11, 16)} — không tạo khóa mới. Thứ tự ưu tiên #${LOCK_CERTIFICATE.priority} giữ nguyên. Tổng đã khóa: ${formatNumberVN(total)} triệu.`
        : resent}
    </Callout>
  )
}

// Thẻ "Bước tiếp theo" của cổng (D.3, 3.8) — màu trung tính, không mang màu Nền tảng.
// Tua là thao tác mô phỏng → SimHint (Vòng 29), không phải nút của cổng.
function OfficerStep({ page }) {
  const { state } = useApp()
  const step = nextStep(state, page)
  // Tra cứu bị chặn đã tự nêu lý do + đường dẫn — không lặp lại
  if (!step.action || (page === 'tra-cuu' && !availability(state, 'viewProfile').ok)) return null
  return (
    <section aria-label="Bước tiếp theo" className="flex items-center gap-4 rounded-xl border border-slate-300 bg-slate-50 px-5 py-3">
      <ArrowRight size={22} className="flex-shrink-0 text-slate-700" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-body text-slate-900">{step.text}</p>
      {isSimHref(step.action.href) ? (
        <SimHint href={step.action.href} className="flex-shrink-0 whitespace-nowrap">
          {step.action.label}
        </SimHint>
      ) : (
        <a
          href={step.action.href}
          className="flex-shrink-0 rounded-lg border border-slate-900 px-4 py-2 text-body font-semibold text-slate-900 transition duration-fast hover:bg-slate-100"
        >
          {step.action.label}
        </a>
      )}
    </section>
  )
}

// Trạng thái trống có lý do + đường dẫn (G.2)
function Blocked({ gate }) {
  return (
    <Card padding="p-8" className="space-y-3">
      <Lock size={32} className="text-slate-600" aria-hidden="true" />
      <h2 className="text-section-title font-semibold text-slate-900">{gate.reason}</h2>
      {isSimHref(gate.fix?.href) ? (
        <SimHint href={gate.fix.href}>{gate.fix.label}</SimHint>
      ) : gate.fix && (
        <a href={gate.fix.href} className="inline-block text-body font-semibold text-slate-900 underline underline-offset-2">
          {gate.fix.label}
        </a>
      )}
    </Card>
  )
}

function Lookup({ view }) {
  const { state } = useApp()
  const [crossOn, setCrossOn] = useState(false)
  const gate = availability(state, 'viewProfile')
  if (!gate.ok) return <Blocked gate={gate} />

  const shopeeBase = computeVerificationScore(VERIFICATION_METRICS.Shopee)
  const shopeeBroken = ru03Broke(state) // điểm giữ 58 cả sau khi đã xử lý (Vòng 29)
  const cross = view.crossExposureExample

  return (
    <>
      <Card>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="text-label font-medium text-slate-600">
              Tổng <Term name="Phơi nhiễm hợp nhất">phơi nhiễm hợp nhất</Term>
            </div>
            <Money value={view.totalConsolidatedExposure} size="hero" className="text-slate-900" />
            <div className="mt-1 text-body text-slate-700">
              trên <span className="font-semibold tabular-nums">{view.lenderCount}</span> bên cho vay
            </div>
          </div>
          <div className="space-y-2 text-label text-slate-700">
            <div>
              Khả dụng còn lại để khóa: <Money value={view.remainingAvailable} size="body" className="font-semibold text-slate-900" />
            </div>
            <div>
              Truy cập theo <Term name="Quyền A2">quyền A2</Term> của nhà bán — hiệu lực đến {formatDateVN(A2_PERMISSION.expiryDate)}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-emphasis font-semibold text-slate-900">
          <Term name="Đơn vị khoản phải thu" />
        </h2>
        <DataTable
          columns={[
            { key: 'code', header: 'Đơn vị', render: (u) => <span className="whitespace-nowrap font-semibold text-slate-900">{u.code}</span> },
            { key: 'projected', header: <Term name="Giá trị ròng dự phóng" />, align: 'right', render: (u) => <span className="whitespace-nowrap">{formatNumberVN(u.projectedNetValue)} triệu</span> },
            {
              key: 'available',
              header: <Term name="Giá trị khả dụng" />,
              align: 'right',
              render: (u) => (u.availableValue == null ? 'Chưa đủ điều kiện' : <span className="whitespace-nowrap">{formatNumberVN(u.availableValue)} triệu</span>),
            },
            { key: 'locked', header: 'Đã bị khóa', align: 'right', render: (u) => <span className="whitespace-nowrap">{formatNumberVN(u.lockedAmount)} triệu</span> },
            { key: 'count', header: 'Số bên đang khóa', align: 'right', render: (u) => u.lockerCount },
            { key: 'status', header: 'Trạng thái', render: (u) => <StatusBadge status={u.status} size="sm" className="whitespace-nowrap" /> },
          ]}
          rows={view.units}
          rowKey={(u) => u.code}
        />
        <InsufficientNote units={view.units} />
      </Card>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <div className="text-emphasis font-semibold text-slate-900">Điểm xác thực theo kênh</div>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <ScoreTile
              channel="Shopee"
              value={shopeeBroken ? `${shopeeBase} → ${computeLeakAdjustedScore(shopeeBase, LEAK_BATCH_RATE)}` : shopeeBase}
            />
            <ScoreTile channel="TikTok Shop" value={computeVerificationScore(VERIFICATION_METRICS['TikTok Shop'])} />
          </div>
        </Card>
        <Card>
          <div className="grid grid-cols-2 gap-6">
            <VisibilityList
              title="Ngân hàng thấy"
              Icon={Eye}
              items={['Doanh thu đã xác thực', 'Điểm xác thực', 'Trạng thái đơn vị', 'Giá trị đã khóa', 'Số bên khóa']}
            />
            <VisibilityList title="Ngân hàng KHÔNG thấy" Icon={EyeOff} items={['Dữ liệu đơn hàng thô', 'Danh tính bên khóa', 'Dữ liệu ngoài phạm vi A2']} />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-emphasis font-semibold text-slate-900">
              Minh họa: đã có bên khác khóa {formatNumberVN(cross.otherLockedAmount)} triệu
            </div>
            <div className="text-label text-slate-600">Ảnh hưởng tới giá trị khả dụng của RU-03 và RU-04.</div>
          </div>
          <ToggleSwitch active={crossOn} onToggle={() => setCrossOn((v) => !v)} label="Minh họa bên khác khóa" />
        </div>
        {crossOn && (
          <div className="mt-4 animate-[page-in_200ms_var(--ease-out)] space-y-3">
            <Callout variant="warn">
              Đã bị khóa bởi 1 bên khác: {formatNumberVN(cross.otherLockedAmount)} triệu — giá trị khả dụng đã được trừ.
            </Callout>
            <div className="text-label text-slate-600">Giá trị khả dụng còn lại (RU-03 + RU-04)</div>
            <Money value={cross.remainingAvailable} size="emphasis" className="text-slate-900" />
          </div>
        )}
        <p className="mt-2 text-label text-slate-600">Danh tính bên khóa được ẩn theo quy chế thành viên.</p>
      </Card>
    </>
  )
}

function Portfolio({ onResend, result }) {
  const { state } = useApp()
  const [certOpen, setCertOpen] = useState(false)
  const gate = availability(state, 'viewCertificate')
  if (!gate.ok)
    return (
      <>
        <Blocked gate={gate} />
        {result}
      </>
    )
  const own = state.registry.filter((e) => e.lenderId === TCB)
  const amounts = Object.fromEntries(own.map((e) => [e.unitId, e.amount]))
  return (
    <>
      <Card>
        <DataTable
          columns={[
            { key: 'code', header: 'Đơn vị', render: (e) => <span className="font-semibold text-slate-900">{e.unitId}</span> },
            { key: 'amount', header: 'Giá trị khóa', align: 'right', render: (e) => `${formatNumberVN(e.amount)} triệu` },
            { key: 'priority', header: <Term name="Thứ tự ưu tiên" />, render: () => `#${LOCK_CERTIFICATE.priority}` },
            { key: 'lockedAt', header: 'Thời điểm khóa', render: () => LOCKED_AT },
            {
              key: 'status',
              header: 'Trạng thái',
              render: (e) => <StatusBadge status={unitStatus(state, e.unitId)} size="sm" className="whitespace-nowrap" />,
            },
          ]}
          rows={own}
          rowKey={(e) => e.unitId}
        />
        <p className="mt-4 text-label text-slate-700">Lệnh trùng không tạo khóa mới và không đổi thứ tự ưu tiên (lũy đẳng).</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onResend}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-900 px-4 py-2 text-body font-semibold text-slate-900 transition duration-fast hover:bg-slate-100"
          >
            <RotateCw size={20} aria-hidden="true" />
            Thử gửi lại lệnh khóa
            <kbd className="rounded border border-slate-300 px-1.5 font-mono text-label">D</kbd>
          </button>
          <button
            type="button"
            onClick={() => setCertOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-900 px-4 py-2 text-body font-semibold text-slate-900 transition duration-fast hover:bg-slate-100"
          >
            <FileBadge size={20} aria-hidden="true" />
            Xem chứng thư
          </button>
        </div>
        {result && <div className="mt-3">{result}</div>}
      </Card>
      <p className="text-label text-slate-700">Khóa của bên khác trên cùng đơn vị chỉ hiện số bên ở mục Tra cứu nhà bán.</p>
      <Drawer open={certOpen} onClose={() => setCertOpen(false)} title="Chứng thư khóa">
        <LockCertificate amounts={amounts} secured={TCB} />
      </Drawer>
    </>
  )
}

function Alerts({ alerts, resolved }) {
  const policy = `Hệ thống kiểm tra ${BANK_ALERT_POLICY.checkInterval}; cảnh báo đứt gãy được gửi trong ${BANK_ALERT_POLICY.brokenNoticeMinutes} phút.`
  if (alerts.length === 0 && resolved.length === 0)
    return (
      <Card>
        <div className="text-emphasis font-semibold text-slate-900">Không có cảnh báo</div>
        <p className="mt-2 text-label text-slate-700">{policy}</p>
      </Card>
    )
  return [
    ...alerts.map((a) => <OpenAlert key={a.unit} alert={a} policy={policy} />),
    ...resolved.map((a) => (
      <Card key={`${a.unit}-xu-ly`}>
        <div className="flex items-center gap-3">
          <StatusBadge status="resolved" />
          <span className="text-emphasis font-semibold text-slate-900">{a.unit}</span>
          <span className="ml-auto text-label tabular-nums text-slate-600">{formatDateVN(a.date)}</span>
        </div>
        <p className="mt-3 text-body text-slate-900">
          Từng đứt gãy {formatDateVN(a.date).slice(0, 5)}. Nhà bán đã giải trình và trả {a.unit} từ nguồn khác; khóa trên {a.unit} đã
          giải phóng, cấp vốn mới đã mở lại.
        </p>
      </Card>
    )),
  ]
}

function OpenAlert({ alert: a, policy }) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <StatusBadge status="broken" />
        <span className="text-emphasis font-semibold text-slate-900">{a.unit}</span>
        <span className="ml-auto text-label tabular-nums text-slate-600">{formatDateVN(a.date)}</span>
      </div>
      <p className="mt-3 text-body text-slate-900">
        Tiền sàn của {a.unit} không về tài khoản neo sau 3 ngày ân hạn. <span className="font-semibold">Hệ quả:</span> đóng băng cấp
        vốn mới cho nhà bán tới khi nhà bán giải trình.
      </p>
      <p className="mt-2 text-label text-slate-700">{policy}</p>
    </Card>
  )
}

function InsufficientNote({ units }) {
  const pending = units.filter((u) => u.status === 'insufficient-history')
  if (pending.length === 0) return null
  return (
    <p className="mt-3 text-label text-slate-700">
      {pending
        .map((u) => `${u.code}: chưa đủ ${MIN_LOTS_FOR_SCORE} lô lịch sử (${RECEIVABLE_UNITS.find((r) => r.code === u.code).lots}/${MIN_LOTS_FOR_SCORE})`)
        .join(' · ')}
    </p>
  )
}

function VisibilityList({ title, Icon, items }) {
  return (
    <div>
      <div className="mb-2 text-label font-semibold text-slate-900">{title}</div>
      <ul className="space-y-1 text-label text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <Icon size={18} className="flex-shrink-0 text-slate-600" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ScoreTile({ channel, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="text-label font-medium text-slate-600">{channel}</div>
      <div className="mt-1 text-section-title font-bold tabular-nums text-slate-900">{value}</div>
    </div>
  )
}
