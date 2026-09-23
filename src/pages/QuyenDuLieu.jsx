import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Terminal, X } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import GatedButton from '../components/ui/GatedButton.jsx'
import SurfaceFrame from '../components/ui/SurfaceFrame.jsx'
import { GRANTED_PERMISSIONS, A1_TOKEN_TTL_SECONDS } from '../data/mockData.js'
import { LEGAL_NAME, TPP_CODE } from '../config/brand.js'
import { ROUTES, availability, accessLog, loan } from '../logic/journey.js'
import { formatDateVN } from '../utils/format.js'
import { useApp } from '../state/appState.jsx'

// Quyền & dữ liệu (Màn 7 cũ — trang thường, không còn lớp phủ). Rút và cấp lại A1/A2 đều
// đi qua trang Techcombank (#/techcombank/a1|a2, 'thao-tac=rut' để rút). A4 là biện pháp
// bảo đảm: không rút được khi còn dư nợ (availability 'revokeA4', quy-tac mục 3).
const NATURE = { A1: 'Xử lý dữ liệu', A2: 'Xử lý dữ liệu', A4: 'Biện pháp bảo đảm' }
const RECIPIENT = { A2: 'Techcombank (bên đánh giá tín dụng)' }
const PERMISSION = Object.fromEntries(GRANTED_PERMISSIONS.map((p) => [p.code, p]))
// Mọi vị trí pháp lý dùng LEGAL_NAME + TPP_CODE (docs/thiet-ke.md mục 3)
const displayActor = (actor) => (actor === LEGAL_NAME ? `${LEGAL_NAME} — mã TPP ${TPP_CODE}` : actor)

function statusOf(state, code) {
  if (code === 'A4') {
    if (loan(state).status === 'repaid') return 'granted-terminated'
    return state.consents.A4 === 'signed' ? 'granted-in-effect' : 'not-granted'
  }
  const c = state.consents[code]
  return c === 'none' ? 'not-granted' : `granted-${c}`
}

// Nút của từng thẻ quyền: rút / cấp lại (đều mở trang Techcombank) hoặc nút vô hiệu + lý do
function PermissionAction({ code, status }) {
  const { state, dispatch } = useApp()
  const link = (href, label, variant) => (
    <a
      href={href}
      className={`inline-block rounded-xl px-5 py-2.5 text-body font-semibold transition duration-fast ${
        variant === 'primary' ? 'bg-primary text-white hover:opacity-90' : 'border border-line text-ink hover:bg-app-bg'
      }`}
    >
      {label}
    </a>
  )
  if (code === 'A4') {
    if (status !== 'granted-in-effect') return null
    return (
      <GatedButton variant="secondary" align="start" gate={availability(state, 'revokeA4')} onClick={() => dispatch({ type: 'revokeA4' })}>
        Rút thỏa thuận A4
      </GatedButton>
    )
  }
  const base = code === 'A1' ? ROUTES.a1 : ROUTES.a2
  if (status === 'granted-active') return link(`${base}?thao-tac=rut`, `Rút quyền ${code} trên Techcombank`, 'secondary')
  if (status === 'granted-revoked')
    return link(code === 'A1' ? ROUTES.a1 : `${ROUTES.a2}?ve=quyen-du-lieu`, `Cấp lại ${code} trên Techcombank`, 'primary')
  if (code === 'A1') return link(ROUTES.a1, 'Kết nối Techcombank', 'primary')
  return null
}

export default function QuyenDuLieu() {
  const { state } = useApp()
  const [techOpen, setTechOpen] = useState(false)
  const [exported, setExported] = useState(false)
  const log = accessLog(state).slice().reverse()
  const activeCount = ['A1', 'A2', 'A4'].filter((c) => ['granted-active', 'granted-in-effect'].includes(statusOf(state, c))).length

  return (
    <>
      <p className="text-section-title font-semibold text-ink">
        {activeCount} quyền đang hiệu lực
      </p>

      <div className="grid grid-cols-3 gap-4">
        {['A1', 'A2', 'A4'].map((code) => {
          const p = PERMISSION[code]
          const status = statusOf(state, code)
          const granted = status !== 'not-granted'
          return (
            <Card key={code} padding="p-5" className="flex flex-col gap-2">
              <div className="text-emphasis font-semibold text-ink">
                {code} — {p.purpose}
              </div>
              <StatusBadge status={status} className="self-start" />
              <div className="text-label text-ink-muted">Bản chất: {NATURE[code]}</div>
              <div className="text-label text-ink-muted">Bên nhận: {RECIPIENT[code] ?? p.to}</div>
              <div className="text-label text-ink-muted">
                {granted
                  ? `Cấp ngày ${formatDateVN(p.grantedDate)} · Hạn ${/^\d{4}/.test(p.expiryDate) ? formatDateVN(p.expiryDate) : p.expiryDate.toLowerCase()}`
                  : code === 'A1'
                    ? 'Cấp khi bạn kết nối tài khoản Techcombank'
                    : 'Sẽ cấp khi bạn đề nghị ứng vốn'}
              </div>
              <div className="mt-auto pt-2">
                <PermissionAction code={code} status={status} />
              </div>
            </Card>
          )
        })}
      </div>

      <Card padding="p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-emphasis font-semibold text-ink">Nhật ký truy cập</h2>
          <button
            type="button"
            onClick={() => setTechOpen(true)}
            className="inline-flex items-center gap-2 text-body font-semibold text-primary underline underline-offset-2"
          >
            <Terminal size={18} aria-hidden="true" />
            Xem hậu trường kỹ thuật
          </button>
        </div>
        {log.length === 0 ? (
          <p className="mt-3 text-body text-ink-muted">Chưa có hoạt động truy cập nào.</p>
        ) : (
          <table className="mt-3 w-full text-label">
            <thead>
              <tr className="border-b border-line text-left text-ink-muted">
                <th className="py-2 pr-4 font-medium">Thời điểm</th>
                <th className="py-2 pr-4 font-medium">Bên</th>
                <th className="py-2 pr-4 font-medium">Mục đích</th>
                <th className="py-2 font-medium">Dữ liệu / thao tác</th>
              </tr>
            </thead>
            <tbody>
              {log.map((l, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="whitespace-nowrap py-2 pr-4 tabular-nums">
                    {formatDateVN(l.date)} {l.time}
                  </td>
                  <td className="py-2 pr-4">{displayActor(l.actor)}</td>
                  <td className="py-2 pr-4">{l.purpose}</td>
                  <td className="py-2">{l.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card padding="p-5" className="flex items-center justify-between gap-6">
        <div>
          <h2 className="text-emphasis font-semibold text-ink">Dữ liệu của tôi</h2>
          <p className="text-body text-ink-muted">
            {exported
              ? 'Đã xuất hồ sơ doanh thu đã xác thực (mô phỏng) — không có tệp thật được tạo.'
              : 'Xuất hồ sơ doanh thu đã xác thực để lưu hoặc chia sẻ.'}
          </p>
        </div>
        <GatedButton variant="secondary" gate={availability(state, 'exportProfile')} onClick={() => setExported(true)}>
          Xuất hồ sơ
        </GatedButton>
      </Card>

      {techOpen && <TechBackstage onClose={() => setTechOpen(false)} />}
    </>
  )
}

// Hậu trường kỹ thuật (terminal Màn 2c cũ, khung `tech`): luồng OAuth scope=AIS khi cấp A1.
// Hiện ngay toàn bộ — người dùng tự thao tác không phải chờ hiệu ứng gõ.
const mask = (sample) => `${sample.slice(0, 8)}••••`
function TechBackstage({ onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Portal vào <body>: vùng nội dung trang là stacking context riêng (xem Drawer)
  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/60" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Hậu trường kỹ thuật"
        className="relative h-[560px] w-[880px] overflow-hidden rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <SurfaceFrame variant="tech">
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-3 top-1.5 rounded-lg p-1.5 text-slate-50 transition hover:bg-slate-800"
          >
            <X size={20} aria-hidden="true" />
          </button>
          <div className="space-y-3 p-6 text-body">
            <p>Luồng OAuth — Open API, khi bạn bấm "Đồng ý" trên trang Techcombank A1:</p>
            <div className="space-y-2 rounded-lg border border-slate-800 bg-slate-900 p-5">
              <div>
                {'→ GET /authorize?response_type=code&'}
                <span className="rounded border border-sky-400 px-1.5 font-semibold text-sky-300">scope=AIS</span>
                {' (PKCE)'}
              </div>
              <div>{'   code_challenge: sha256(verifier)'}</div>
              <div>✓ Techcombank xác thực chủ tài khoản, trả mã ủy quyền (authorization code)</div>
              <div>→ POST /token (authorization_code)</div>
              <div>
                {`← access_token: ${mask('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9')}  hạn `}
                <span className="rounded border border-emerald-400 px-1.5 font-semibold text-emerald-300">
                  {A1_TOKEN_TTL_SECONDS.toLocaleString('vi-VN')} giây
                </span>
              </div>
              <div>
                {'← '}
                <span className="rounded border border-emerald-400 px-1.5 font-semibold text-emerald-300">
                  {`refresh_token: ${mask('rt_9f3a7c2e1b8d4056a1f0c3e9')}`}
                </span>
              </div>
              <div># Token chỉ đọc giao dịch — không chuyển tiền được. Rút A1 = thu hồi token.</div>
            </div>
            <p className="text-label">Chuỗi token là mẫu minh họa, không phải token thật.</p>
          </div>
        </SurfaceFrame>
      </div>
    </div>,
    document.body
  )
}
