import { useEffect, useRef, useState } from 'react'
import TopBar from '../components/ui/TopBar.jsx'
import ActProgress from '../components/ui/ActProgress.jsx'
import SurfaceFrame from '../components/ui/SurfaceFrame.jsx'
import Card from '../components/ui/Card.jsx'
import Money from '../components/ui/Money.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import Callout from '../components/ui/Callout.jsx'
import Button from '../components/ui/Button.jsx'
import { actForScreen } from '../config/flow.js'
import { usePermissions } from '../state/permissionState.jsx'
import { useScenario } from '../state/scenarioState.jsx'
import { useSettlement } from '../state/settlementState.jsx'
import { LENDER_QUOTES, SELLER_PROFILE, FOOTER_NOTE } from '../data/mockData.js'
import { computeAdvanceInterest } from '../logic/pricing.js'
import { formatNumberVN } from '../utils/format.js'
import LeakScenarioContent from './Screen9.jsx'

const TECHCOMBANK_QUOTE = LENDER_QUOTES.find((q) => q.lender === 'Techcombank')
const INTEREST_DAYS = 5

const RU_STATUS = { locked: 'locked', settled: 'settled', broken: 'broken' }

// Đếm số lần trạng thái RU-03/RU-04 đổi để remount RuChip theo key — animation
// CSS (ru-badge-fade, ru-card-glow ở src/index.css) tự chạy một lần khi phần tử
// được mount lại. Không dùng setTimeout để xếp trình tự nên không cần kiểm
// matchMedia thủ công: quy tắc prefers-reduced-motion toàn cục đã rút
// animation-duration về gần 0 khi người dùng bật giảm chuyển động.
function useStatusChangeGen(status) {
  const prev = useRef(status)
  const [gen, setGen] = useState(0)
  useEffect(() => {
    if (prev.current !== status) {
      prev.current = status
      setGen((g) => g + 1)
    }
  }, [status])
  return gen
}

// Vòng 7C — Màn 6 dựng lại bằng SurfaceFrame(platform)/TopBar/ActProgress dùng
// chung, không đổi logic tất toán (src/state/settlementState.jsx).
export default function Screen6({ onNext }) {
  const { openPeek } = usePermissions()
  const { leak } = useScenario()
  const settlement = useSettlement()
  const ru03Gen = useStatusChangeGen(settlement.ru03Status)
  const ru04Gen = useStatusChangeGen(settlement.ru04Status)

  const interestVN = Math.round(computeAdvanceInterest(settlement.initialDebt, TECHCOMBANK_QUOTE.annualRate, INTEREST_DAYS) * 100) / 100
  const interestThousandVN = Math.round(interestVN * 1000)

  return (
    <div className="flex h-full flex-col">
      <TopBar screenNumber={6} onOpenPeek={() => openPeek(6)} />
      <SurfaceFrame variant="platform">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 px-12 pb-3 pt-3">
            <ActProgress currentAct={actForScreen(6)} tone="light" />
          </div>

          <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-12 pt-10 pb-24">
            <div className="mx-auto w-full max-w-[1536px] space-y-6">
              <h1 className="text-screen-title font-bold text-slate-900">Tất toán</h1>

              <DebtBlock
                debt={settlement.debt}
                ru03Status={settlement.ru03Status}
                ru04Status={settlement.ru04Status}
                ru03Gen={ru03Gen}
                ru04Gen={ru04Gen}
              />

              <Card>
                <MilestoneTimeline timeline={settlement.timeline} stepIndex={settlement.stepIndex} />
              </Card>

              <div className="flex justify-center">
                <button
                  onClick={settlement.advance}
                  disabled={settlement.atLastStep}
                  className="rounded-xl bg-navy px-6 py-3 text-emphasis font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-300"
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
                <div className="flex justify-end">
                  <Button onClick={onNext}>Tiếp →</Button>
                </div>
              )}
            </div>
          </main>

          <footer className="border-t border-slate-200 px-12 py-3 text-label text-slate-600">{FOOTER_NOTE}</footer>
        </div>
      </SurfaceFrame>

      {settlement.repayModalUnit && <TechcombankRepayPage unit={settlement.repayModalUnit} settlement={settlement} />}
    </div>
  )
}

function DebtBlock({ debt, ru03Status, ru04Status, ru03Gen, ru04Gen }) {
  return (
    <Card padding="p-8">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="text-label font-medium text-slate-600">Dư nợ còn lại</div>
          <Money value={debt} size="hero" className="mt-1 block text-slate-900" />
        </div>
        <div className="flex gap-6">
          <RuChip code="RU-03" status={ru03Status} gen={ru03Gen} />
          <RuChip code="RU-04" status={ru04Status} gen={ru04Gen} />
        </div>
      </div>
    </Card>
  )
}

// gen > 0 nghĩa là trạng thái đã đổi ít nhất một lần kể từ khi Màn 6 mount —
// key={gen} buộc React remount div này mỗi lần đổi, animation CSS tự chạy lại.
function RuChip({ code, status, gen }) {
  const highlighted = gen > 0
  return (
    <div
      key={gen}
      className={`rounded-xl border-2 px-3 py-2 text-center ${
        highlighted ? 'animate-ru-card-glow border-slate-400' : 'border-transparent'
      }`}
    >
      <div className="mb-1 text-label font-semibold text-slate-900">{code}</div>
      <StatusBadge status={RU_STATUS[status]} className={highlighted ? 'animate-ru-badge-fade' : ''} />
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

// Dòng thời gian ngang các mốc 15/09 → 19/09 → 20/09 (docs/du-lieu.md mục 10),
// khoảng cách đều giữa các mốc theo lưới 8px.
function MilestoneTimeline({ timeline, stepIndex }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max">
        {timeline.map((m, i) => {
          const reached = i <= stepIndex
          const isCurrent = i === stepIndex
          return (
            <div key={m.id} className="flex w-56 flex-col items-center gap-2 px-2 text-center">
              <div className="flex w-full items-center">
                <div className={`h-0.5 flex-1 ${i === 0 ? 'invisible' : reached ? 'bg-teal-500' : 'bg-slate-200'}`} />
                <div
                  className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                    reached ? 'border-teal-600 bg-teal-500' : 'border-slate-300 bg-white'
                  } ${isCurrent ? 'ring-4 ring-teal-500/30' : ''}`}
                />
                <div
                  className={`h-0.5 flex-1 ${
                    i === timeline.length - 1 ? 'invisible' : reached ? 'bg-teal-500' : 'bg-slate-200'
                  }`}
                />
              </div>
              <div className={`text-label font-semibold ${reached ? 'text-slate-900' : 'text-slate-600'}`}>{m.date}</div>
              <div className={`text-label ${reached ? 'text-slate-600' : 'text-slate-600'}`}>{milestoneShortLabel(m)}</div>
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
    <Card className="border-violet-600 bg-violet-50">
      <div className="text-body font-semibold text-violet-900">
        {milestone.marketplace} đã thanh toán {formatNumberVN(milestone.marketplaceAmount)} triệu cho {milestone.unit}{' '}
        về tài khoản Techcombank. Trả {formatNumberVN(milestone.repaymentAmount)} triệu cho khoản vay?
      </div>

      {alreadyRepaid ? (
        <div className="mt-2 text-label font-semibold text-teal-700">Đã trả nợ trên Techcombank.</div>
      ) : (
        <>
          <p className="mt-2 text-label text-slate-600">
            Nếu quá thời hạn ân hạn mà chưa trả, Techcombank trích nợ theo hợp đồng tín dụng. Nền tảng chỉ thông báo
            và dẫn sang trang Techcombank — không thực hiện giao dịch.
          </p>
          <button
            onClick={() => settlement.openRepayModal(milestone.unit)}
            className="mt-4 rounded-xl bg-navy px-5 py-2.5 text-body font-semibold text-white transition hover:opacity-90"
          >
            Trả nợ một chạm — sang trang Techcombank
          </button>
        </>
      )}
    </Card>
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
      <Card className="border-teal-600 bg-teal-50">
        <div className="text-body font-semibold text-teal-800">
          Khoản vay đã tất toán — tiền lãi{' '}
          <Money value={interestThousandVN} unit="nghìn đồng" size="body" className="text-teal-800" />
        </div>
        <div className="mt-1 text-label text-teal-700">
          trên khoản {formatNumberVN(settlement.initialDebt)} triệu, {INTEREST_DAYS} ngày
        </div>
        <div className="mt-1 text-label text-teal-700">Điểm xác thực được cập nhật sau lô tất toán.</div>
      </Card>
    )
  }
  return null
}

function InfoBox({ children }) {
  return <Callout variant="info">{children}</Callout>
}

// Khuôn trang mô phỏng Techcombank dùng chung cho trả nợ (Màn 6) và giải trình rò rỉ
// (Màn 9) — SurfaceFrame kiểu bank, tách biệt hẳn với Nền tảng.
export function TechcombankPageFrame({ heading, subheading, children, confirmLabel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[90] overflow-hidden">
      <SurfaceFrame variant="bank" bankName="Techcombank">
        <div className="flex h-full flex-col">
          <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-8 pt-8 pb-24">
            <div className="mx-auto w-full max-w-xl">
              <Card padding="p-8">
                <h1 className="mb-1 text-section-title font-bold text-slate-900">{heading}</h1>
                {subheading && <p className="mb-6 text-body text-slate-600">{subheading}</p>}

                <div className="space-y-4 text-body">{children}</div>

                <div className="mt-8 flex justify-end">
                  <Button onClick={onConfirm}>{confirmLabel}</Button>
                </div>
              </Card>
            </div>
          </main>
          <footer className="border-t border-slate-200 px-8 py-3 text-label text-slate-600">{FOOTER_NOTE}</footer>
        </div>
      </SurfaceFrame>
    </div>
  )
}

export function TechRow({ label, value }) {
  return (
    <div>
      <div className="text-label font-medium text-slate-600">{label}</div>
      <div className="text-slate-900">{value}</div>
    </div>
  )
}

function TechcombankRepayPage({ unit, settlement }) {
  const amount = unit === 'RU-03' ? settlement.ru03LockAmount : settlement.ru04LockAmount
  return (
    <TechcombankPageFrame
      heading="Trả nợ khoản vay"
      subheading="Techcombank thực hiện trả nợ trực tiếp từ khoản thanh toán vừa về tài khoản."
      confirmLabel="Xác nhận trả nợ"
      onConfirm={() => settlement.confirmRepay(unit)}
    >
      <TechRow label="Bên thực hiện trả nợ" value="Techcombank" />
      <TechRow label="Khoản vay" value={`Khoản vay có bảo đảm bằng khoản phải thu ${unit}`} />
      <TechRow label="Số tiền trả" value={`${formatNumberVN(amount)} triệu`} />
      <TechRow label="Tài khoản trích" value={SELLER_PROFILE.paymentAccount} />
    </TechcombankPageFrame>
  )
}
