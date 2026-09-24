import { useState } from 'react'
import { ReceiptText, Clock, FileBadge } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Money from '../components/ui/Money.jsx'
import Button from '../components/ui/Button.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import GatedButton from '../components/ui/GatedButton.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import DoneCheck from '../components/ui/DoneCheck.jsx'
import Term from '../components/ui/Term.jsx'
import Callout from '../components/ui/Callout.jsx'
import Drawer from '../components/ui/Drawer.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import LockCertificate from '../components/LockCertificate.jsx'
import {
  LENDER_QUOTES,
  SELLER_PROFILE,
  SETTLEMENT_TIMELINE_NORMAL,
  SETTLEMENT_TIMELINE_LEAK,
  VERIFICATION_METRICS,
  LEAK_BATCH_RATE,
} from '../data/mockData.js'
import { computeAdvanceInterest } from '../logic/pricing.js'
import { computeVerificationScore, computeLeakAdjustedScore } from '../logic/verification.js'
import { ROUTES, availability, loan, simDate, unitStatus, fundingFrozen } from '../logic/journey.js'
import { go } from '../utils/route.js'
import { formatNumberVN } from '../utils/format.js'
import { useApp } from '../state/appState.jsx'

// Khoản vay (Màn 6 cũ, san-pham.md B.1; hanh-trinh 1.17–1.21). Dòng thời gian theo ngày
// mô phỏng; nút trả nợ theo availability (bật ở E2/E3); dư nợ = loan(state), đổi thẳng —
// không chạy số (quyết định đã chốt). Nhánh Đổi tài khoản nhận tiền (hành trình 2) hiện
// tối thiểu ở đây; hoàn thiện ở Vòng 25.
const TCB_QUOTE = LENDER_QUOTES.find((q) => q.lender === 'Techcombank')
const INTEREST_DAYS = 5
const PAYMENT = Object.fromEntries(
  SETTLEMENT_TIMELINE_NORMAL.filter((m) => m.kind === 'marketplace-payment').map((m) => [m.unit, m])
)
const LEAK = Object.fromEntries(SETTLEMENT_TIMELINE_LEAK.map((m) => [m.id, m]))
const ddmm = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

export default function KhoanVay() {
  const { state } = useApp()
  const l = loan(state)
  if (l.status === 'none') {
    return (
      <EmptyState icon={ReceiptText} title="Chưa có khoản vay" gate={{ fix: { label: 'Đi tới Ứng vốn', href: ROUTES.ungVon } }}>
        <p>Khoản vay xuất hiện ở đây sau khi Techcombank phê duyệt và giải ngân đề nghị ứng vốn của bạn.</p>
      </EmptyState>
    )
  }
  if (l.lender !== TCB_QUOTE.lender) {
    const repay = availability(state, { type: 'repay', unit: 'RU-03' })
    return <EmptyState icon={ReceiptText} title={repay.reason} gate={repay} />
  }
  return <Loan />
}

function Loan() {
  const { state } = useApp()
  const [certOpen, setCertOpen] = useState(false)
  const l = loan(state)
  const amounts = Object.fromEntries(state.registry.map((e) => [e.unitId, e.amount]))
  const interest = Math.round(computeAdvanceInterest(l.principal, TCB_QUOTE.annualRate, INTEREST_DAYS) * 1000)

  return (
    <>
      <Card padding="p-6">
        <div className="grid grid-cols-5 gap-6">
          <div className="col-span-2">
            <div className="text-label font-medium text-ink-muted">Dư nợ còn lại</div>
            {/* Đổi thẳng khi trả — không chạy số, không hiệu ứng (quyết định đã chốt) */}
            <Money value={l.debt} size="hero" className="mt-1 block text-ink" />
            <p className="mt-1 text-body text-ink-muted">
              Khoản vay có bảo đảm bằng <Term name="Khoản phải thu">khoản phải thu</Term> · Techcombank giải ngân {formatNumberVN(l.principal)} triệu ngày {ddmm(SETTLEMENT_TIMELINE_NORMAL[0].isoDate)}
            </p>
            <button
              type="button"
              onClick={() => setCertOpen(true)}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-label font-semibold text-primary transition duration-fast hover:bg-primary-soft"
            >
              <FileBadge size={18} aria-hidden="true" />
              Xem chứng thư khóa
            </button>
          </div>
          <div className="col-span-3 space-y-3">
            {Object.keys(amounts).map((code) => (
              <RepayRow key={code} code={code} amount={amounts[code]} />
            ))}
          </div>
        </div>
      </Card>

      {l.status === 'repaid' && <Settled interest={interest} />}
      <AccountChange />
      <LoanTimeline />

      <Drawer open={certOpen} onClose={() => setCertOpen(false)} title="Chứng thư khóa">
        <LockCertificate amounts={amounts} secured={l.lender} />
      </Drawer>
    </>
  )
}

// Một đơn vị: trạng thái + nút "Trả … trên Techcombank" (mở trang Trả nợ một chạm)
function RepayRow({ code, amount }) {
  const { state } = useApp()
  const status = unitStatus(state, code)
  const repaid = state.repaid[code]
  const gate = availability(state, { type: 'repay', unit: code })
  return (
    <div key={status} className="animate-ru-card-glow rounded-xl border border-line p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-body">
          <span className="font-semibold">{code}</span> {PAYMENT[code].marketplace} — khóa {formatNumberVN(amount)} triệu
        </span>
        <StatusBadge status={status} className="animate-ru-badge-fade whitespace-nowrap" />
      </div>
      {!repaid && (
        <div className="mt-3">
          <GatedButton gate={gate} onClick={() => go(`${ROUTES.traNo}?don-vi=${code}`)}>
            Trả {formatNumberVN(amount)} triệu trên Techcombank
          </GatedButton>
        </div>
      )}
    </div>
  )
}

function Settled({ interest }) {
  return (
    <Card padding="p-5" className="flex items-start gap-3">
      <span className="text-primary">
        <DoneCheck />
      </span>
      <div>
        <p className="text-emphasis font-semibold text-ink">
          Khoản vay đã tất toán — tiền lãi khoảng <Money value={interest} unit="nghìn đồng" size="emphasis" />
        </p>
        <p className="mt-1 text-body text-ink-muted">
          Điểm xác thực đã cập nhật sau lô tất toán. <Term name="Thỏa thuận A4" /> đã chấm dứt — khoản vay đã tất toán.
        </p>
      </div>
    </Card>
  )
}

// Hành trình 2 (tối thiểu, Vòng 25 hoàn thiện): không có tiền Shopee → ân hạn → đứt gãy → giải trình
function AccountChange() {
  const { state, dispatch } = useApp()
  const [confirmOpen, setConfirmOpen] = useState(false)
  if (!state.scenario.accountChange) return null
  const today = simDate(state)
  const resolve = availability(state, 'resolveAccountChange')

  if (unitStatus(state, 'RU-03') === 'broken') {
    const base = computeVerificationScore(VERIFICATION_METRICS.Shopee)
    return (
      <Card padding="p-5" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-emphasis font-semibold text-ink">RU-03 — tiền không về tài khoản neo</h2>
          <StatusBadge status="broken" />
        </div>
        <p className="text-body text-ink">
          Điểm xác thực Shopee: {base} → {computeLeakAdjustedScore(base, LEAK_BATCH_RATE)}.{' '}
          {fundingFrozen(state) ? 'Cấp vốn mới đang tạm dừng.' : 'Cấp vốn mới đã mở lại.'}
        </p>
        {resolve.ok && (
          <>
            <p className="text-body text-ink-muted">Vui lòng xác nhận tài khoản nhận tiền trên sàn.</p>
            <div className="flex justify-end">
              <Button onClick={() => setConfirmOpen(true)}>Tôi đã đổi tài khoản — giải trình</Button>
            </div>
          </>
        )}
        <ConfirmDialog
          open={confirmOpen}
          title="Giải trình tài khoản nhận tiền"
          message={`Xác nhận đã đổi lại tài khoản nhận tiền trên Shopee về ${SELLER_PROFILE.paymentAccount} và sẽ trả RU-03 từ nguồn khác.`}
          confirmLabel="Xác nhận"
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            dispatch({ type: 'resolveAccountChange' })
            setConfirmOpen(false)
          }}
        />
      </Card>
    )
  }
  if (today >= LEAK['leak-window-closed'].isoDate)
    return (
      <Card padding="p-4" className="flex items-center gap-3">
        <Clock size={22} className="flex-shrink-0 text-ink-muted" aria-hidden="true" />
        <p className="text-body text-ink">Hết <Term name="Cửa sổ thanh toán">cửa sổ thanh toán</Term> RU-03 — đang trong 3 ngày{' '}
          <Term name="Ân hạn">ân hạn</Term>, tới {ddmm(LEAK['leak-broken'].isoDate)}.</p>
      </Card>
    )
  if (today >= LEAK['leak-no-payment'].isoDate)
    return <Callout variant="info">Không có khoản thanh toán Shopee nào về tài khoản Techcombank cho RU-03.</Callout>
  return null
}

// Mốc theo ngày mô phỏng; mốc đã tới tô đầy 300ms (transition khi ngày đổi)
function LoanTimeline() {
  const { state } = useApp()
  const today = simDate(state)
  const leak = state.scenario.accountChange
  const [disburse, selling] = SETTLEMENT_TIMELINE_NORMAL
  const items = [
    { iso: disburse.isoDate, date: disburse.date, label: 'Techcombank giải ngân, khóa RU-03 và RU-04' },
    { iso: selling.isoDate, date: selling.date, label: 'Nhập hàng, bán tiếp' },
    leak
      ? { iso: LEAK['leak-no-payment'].isoDate, date: LEAK['leak-no-payment'].date, label: 'Shopee không thanh toán RU-03 về Techcombank' }
      : payItem(PAYMENT['RU-03']),
    payItem(PAYMENT['RU-04']),
    ...(leak
      ? [
          { iso: LEAK['leak-window-closed'].isoDate, date: LEAK['leak-window-closed'].date, label: 'Hết cửa sổ thanh toán RU-03' },
          { iso: LEAK['leak-broken'].isoDate, date: LEAK['leak-broken'].date, label: 'Hết ân hạn — RU-03 đứt gãy' },
        ]
      : []),
  ]
  return (
    <Card padding="p-5">
      <h2 className="text-emphasis font-semibold text-ink">Dòng thời gian</h2>
      <ol className="mt-4 flex">
        {items.map((m, i) => {
          const reached = m.iso <= today
          return (
            <li key={m.label} className="flex flex-1 flex-col items-center gap-2 px-2 text-center">
              <div className="flex w-full items-center">
                <span className={`h-1 flex-1 transition-colors duration-slow ${i === 0 ? 'invisible' : reached ? 'bg-primary' : 'bg-line'}`} />
                <span
                  className={`h-4 w-4 flex-shrink-0 rounded-full border-2 transition-colors duration-slow ease-standard ${
                    reached ? 'border-primary bg-primary' : 'border-line bg-app-surface'
                  }`}
                />
                <span
                  className={`h-1 flex-1 transition-colors duration-slow ${i === items.length - 1 ? 'invisible' : items[i + 1].iso <= today ? 'bg-primary' : 'bg-line'}`}
                />
              </div>
              <span className={`text-label font-semibold ${reached ? 'text-ink' : 'text-ink-muted'}`}>{m.date}</span>
              <span className="text-label text-ink-muted">{m.label}</span>
            </li>
          )
        })}
      </ol>
    </Card>
  )
}

const payItem = (m) => ({
  iso: m.isoDate,
  date: m.date,
  label: `${m.marketplace} thanh toán ${m.unit}: ${formatNumberVN(m.marketplaceAmount)} triệu về tài khoản Techcombank`,
})
