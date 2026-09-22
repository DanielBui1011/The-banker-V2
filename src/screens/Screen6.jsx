import ScreenShell from '../components/ScreenShell.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useScenario } from '../state/scenarioState.jsx'
import { useSettlement } from '../state/settlementState.jsx'
import { LENDER_QUOTES, SELLER_PROFILE, FOOTER_NOTE } from '../data/mockData.js'
import { computeAdvanceInterest } from '../logic/pricing.js'
import { formatNumberVN } from '../utils/format.js'
import LeakScenarioContent from './Screen9.jsx'

const TECHCOMBANK_QUOTE = LENDER_QUOTES.find((q) => q.lender === 'Techcombank')
const INTEREST_DAYS = 5

const RU_STATUS_TONE = { locked: 'tier2', settled: 'tier1', broken: 'broken' }
const RU_STATUS_LABEL = { locked: 'Đã khóa', settled: 'Đã tất toán', broken: 'Đứt gãy' }

export default function Screen6({ onNext }) {
  const { leak } = useScenario()
  const settlement = useSettlement()

  const interestVN = Math.round(computeAdvanceInterest(settlement.initialDebt, TECHCOMBANK_QUOTE.annualRate, INTEREST_DAYS) * 100) / 100
  const interestThousandVN = Math.round(interestVN * 1000)

  return (
    <ScreenShell screenNumber={6} title="Tất toán">
      <div className="space-y-6">
        <DebtBlock debt={settlement.debt} ru03Status={settlement.ru03Status} ru04Status={settlement.ru04Status} />

        <Timeline timeline={settlement.timeline} stepIndex={settlement.stepIndex} />

        <div className="flex justify-center">
          <button
            onClick={settlement.advance}
            disabled={settlement.atLastStep}
            className="rounded-xl bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            Sự kiện tiếp theo (phím Space) →
          </button>
        </div>

        {leak ? (
          <LeakScenarioContent settlement={settlement} />
        ) : (
          <NormalMilestoneDetail settlement={settlement} interestThousandVN={interestThousandVN} />
        )}

        {settlement.atLastStep && (
          <button
            onClick={onNext}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 text-lg font-semibold text-slate-100 transition hover:bg-slate-700"
          >
            Tiếp →
          </button>
        )}
      </div>

      {settlement.repayModalUnit && <TechcombankRepayPage unit={settlement.repayModalUnit} settlement={settlement} />}
    </ScreenShell>
  )
}

function DebtBlock({ debt, ru03Status, ru04Status }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-base text-slate-400">Dư nợ còn lại</div>
          <div className="mt-1 text-4xl font-bold text-teal-200">{formatNumberVN(debt)} triệu</div>
        </div>
        <div className="flex gap-4">
          <RuChip code="RU-03" status={ru03Status} />
          <RuChip code="RU-04" status={ru04Status} />
        </div>
      </div>
    </div>
  )
}

function RuChip({ code, status }) {
  return (
    <div className="text-center">
      <div className="mb-1 text-base font-semibold text-slate-200">{code}</div>
      <StatusBadge tone={RU_STATUS_TONE[status]}>{RU_STATUS_LABEL[status]}</StatusBadge>
    </div>
  )
}

function milestoneShortLabel(m) {
  switch (m.kind) {
    case 'disburse':
      return 'Techcombank giải ngân, khóa RU-03 và RU-04'
    case 'selling':
      return 'Nhập hàng, bán tiếp'
    case 'marketplace-payment':
      return `${m.marketplace} thanh toán ${m.unit}`
    case 'settled':
      return 'Khoản vay tất toán'
    case 'leak-no-payment':
      return `${m.marketplace} không thanh toán về Techcombank`
    case 'leak-window-closed':
      return `Hết cửa sổ thanh toán ${m.unit}`
    case 'leak-broken':
      return `${m.unit} chuyển Đứt gãy`
    default:
      return ''
  }
}

function Timeline({ timeline, stepIndex }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max">
        {timeline.map((m, i) => {
          const reached = i <= stepIndex
          const isCurrent = i === stepIndex
          return (
            <div key={m.id} className="flex w-56 flex-col items-center px-2 text-center">
              <div className="flex w-full items-center">
                <div className={`h-0.5 flex-1 ${i === 0 ? 'opacity-0' : reached ? 'bg-teal-500' : 'bg-slate-800'}`} />
                <div
                  className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                    reached ? 'border-teal-400 bg-teal-500' : 'border-slate-700 bg-slate-800'
                  } ${isCurrent ? 'ring-4 ring-teal-500/30' : ''}`}
                />
                <div
                  className={`h-0.5 flex-1 ${
                    i === timeline.length - 1 ? 'opacity-0' : reached ? 'bg-teal-500' : 'bg-slate-800'
                  }`}
                />
              </div>
              <div className={`mt-2 text-base font-semibold ${reached ? 'text-slate-100' : 'text-slate-500'}`}>
                {m.date}
              </div>
              <div className={`mt-1 text-sm ${reached ? 'text-slate-300' : 'text-slate-600'}`}>
                {milestoneShortLabel(m)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Bước 19/09, 20/09 — thông báo Nền tảng: chỉ thông báo tiền sàn đã về, không tự
// chuyển tiền (docs/quy-tac.md mục 2). Trả nợ thật diễn ra trên trang Techcombank.
export function MarketplacePaymentNotice({ milestone, settlement }) {
  const alreadyRepaid = settlement.repaid[milestone.unit]
  return (
    <div className="space-y-3 rounded-xl border border-purple-800/60 bg-purple-950/20 p-5">
      <div className="text-lg font-semibold text-purple-200">
        {milestone.marketplace} đã thanh toán {formatNumberVN(milestone.marketplaceAmount)} triệu cho {milestone.unit}{' '}
        về tài khoản Techcombank. Trả {formatNumberVN(milestone.repaymentAmount)} triệu cho khoản vay?
      </div>

      {alreadyRepaid ? (
        <div className="text-base font-semibold text-teal-300">Đã trả nợ trên Techcombank.</div>
      ) : (
        <>
          <p className="text-sm text-slate-400">
            Nếu quá thời hạn ân hạn mà chưa trả, Techcombank trích nợ theo hợp đồng tín dụng.
          </p>
          <button
            onClick={() => settlement.openRepayModal(milestone.unit)}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-lg font-semibold text-white transition hover:bg-blue-500"
          >
            Trả nợ trên Techcombank
          </button>
        </>
      )}
    </div>
  )
}

function NormalMilestoneDetail({ settlement, interestThousandVN }) {
  const m = settlement.currentMilestone
  if (!m) return null

  if (m.kind === 'disburse') {
    return (
      <InfoBox>
        Techcombank đã giải ngân {formatNumberVN(settlement.initialDebt)} triệu; khóa{' '}
        {formatNumberVN(settlement.ru03LockAmount)} triệu (RU-03) và {formatNumberVN(settlement.ru04LockAmount)} triệu
        (RU-04).
      </InfoBox>
    )
  }
  if (m.kind === 'selling') {
    return <InfoBox>Nhập hàng, bán tiếp.</InfoBox>
  }
  if (m.kind === 'marketplace-payment') {
    return <MarketplacePaymentNotice milestone={m} settlement={settlement} />
  }
  if (m.kind === 'settled') {
    return (
      <div className="space-y-2 rounded-xl border border-teal-800/60 bg-teal-950/20 p-5">
        <div className="text-lg font-semibold text-teal-200">
          Khoản vay đã tất toán — tiền lãi {formatNumberVN(interestThousandVN)} nghìn đồng ({INTEREST_DAYS} ngày)
        </div>
        <div className="text-base text-teal-300">Điểm xác thực đã cập nhật sau lô tất toán.</div>
      </div>
    )
  }
  return null
}

function InfoBox({ children }) {
  return <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-lg text-slate-200">{children}</div>
}

// Khuôn trang mô phỏng Techcombank dùng chung cho trả nợ (Màn 6) và giải trình rò rỉ
// (Màn 9) — cùng khuôn Bước 2b: nền sáng, tách biệt hẳn với Nền tảng.
export function TechcombankPageFrame({ heading, subheading, children, confirmLabel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[90] flex min-h-screen flex-col overflow-y-auto bg-white text-slate-900">
      <header className="border-b border-slate-200 px-8 py-4">
        <div className="text-base font-medium text-slate-500">Bạn đang ở trang của Techcombank</div>
        <div className="mt-1 text-3xl font-bold text-slate-900">Techcombank</div>
      </header>

      <main className="flex flex-1 items-center justify-center px-8 py-10">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h1 className="mb-1 text-3xl font-bold text-slate-900">{heading}</h1>
          {subheading && <p className="mb-6 text-lg text-slate-500">{subheading}</p>}

          <div className="space-y-4 text-lg">{children}</div>

          <button
            onClick={onConfirm}
            className="mt-8 w-full rounded-xl bg-slate-900 py-3 text-lg font-semibold text-white transition hover:bg-slate-800"
          >
            {confirmLabel}
          </button>
        </div>
      </main>

      <footer className="border-t border-slate-200 px-8 py-3 text-base text-slate-400">{FOOTER_NOTE}</footer>
    </div>
  )
}

export function TechRow({ label, value }) {
  return (
    <div>
      <div className="text-base font-medium text-slate-500">{label}</div>
      <div className="text-slate-900">{value}</div>
    </div>
  )
}

function TechcombankRepayPage({ unit, settlement }) {
  const amount = unit === 'RU-03' ? settlement.ru03LockAmount : settlement.ru04LockAmount
  return (
    <TechcombankPageFrame
      heading="Trả nợ khoản vay"
      confirmLabel="Xác nhận trả nợ"
      onConfirm={() => settlement.confirmRepay(unit)}
    >
      <TechRow label="Khoản vay" value={`Khoản ứng bảo đảm bằng ${unit}`} />
      <TechRow label="Số tiền trả" value={`${formatNumberVN(amount)} triệu`} />
      <TechRow label="Tài khoản trích" value={SELLER_PROFILE.paymentAccount} />
    </TechcombankPageFrame>
  )
}
