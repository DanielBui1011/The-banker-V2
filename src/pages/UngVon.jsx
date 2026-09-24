import { useEffect, useRef, useState } from 'react'
import { KeyRound, Link2, Hourglass } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Money from '../components/ui/Money.jsx'
import Stepper from '../components/ui/Stepper.jsx'
import Button from '../components/ui/Button.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import GatedButton from '../components/ui/GatedButton.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import DoneCheck from '../components/ui/DoneCheck.jsx'
import { EstimateDisclaimer } from '../components/ui/Callout.jsx'
import LockCertificate from '../components/LockCertificate.jsx'
import { A2_CONSENT, LENDER_QUOTES, PRICING_PARAMS } from '../data/mockData.js'
import { computeAvailableValueStaircase, computeAdvanceInterest } from '../logic/pricing.js'
import { ROUTES, availability, activeUnits, loan, unitStatus, fundingFrozen } from '../logic/journey.js'
import { go } from '../utils/route.js'
import { formatNumberVN, formatPercentVN } from '../utils/format.js'
import { useApp } from '../state/appState.jsx'

// Ứng vốn (Màn 5 cũ, san-pham.md B.1 Tầng 3; hanh-trinh 1.10–1.16). Bốn bước; bước 1 và 3
// diễn ra trên trang Techcombank (A2, A4). Bước hiện tại suy ra từ state, không lưu riêng.
// Giai đoạn 3 dùng màn cũ (App.jsx) tới Vòng 25.
export const FUNDING_STEPS = ['Cấp A2', 'Xem ước tính', 'Ký A4', 'Gửi đề nghị']
const TCB_QUOTE = LENDER_QUOTES.find((q) => q.lender === 'Techcombank')
const INTEREST_DAYS = 5
// "Techcombank đang thẩm định" — trạng thái giao diện có chữ, giữ 1,2 giây kể cả khi
// reduced-motion (san-pham.md mục I, dòng 5d)
const REVIEW_MS = 1200

function currentStep(state) {
  if (state.registry.length > 0) return FUNDING_STEPS.length + 1
  if (state.consents.A2 !== 'active' && state.consents.A4 !== 'signed') return 1
  if (state.consents.A4 !== 'signed') return 2
  return 4
}

export default function UngVon() {
  const { state } = useApp()
  const open = availability(state, 'openFunding')
  if (!open.ok) {
    return (
      <EmptyState icon={state.consents.A1 === 'none' ? Link2 : Hourglass} gate={open}>
        <p>Ứng vốn dựa trên khoản phải thu đã xác thực. Chúng có từ 15/09, sau 6 tuần đối soát.</p>
      </EmptyState>
    )
  }
  return <Funding />
}

function Funding() {
  const { state } = useApp()
  const step = currentStep(state)
  // Hướng trượt (L.2): tiến từ phải, lùi từ trái (vd. rút A2 làm lùi về bước 1)
  const prevStep = useRef(step)
  const direction = step >= prevStep.current ? 'forward' : 'back'
  useEffect(() => {
    prevStep.current = step
  }, [step])

  const units = activeUnits(state)
  const params = state.scenario.peakSeason ? PRICING_PARAMS.megaSale : PRICING_PARAMS.normal
  const staircase = computeAvailableValueStaircase({ units, params, lockedByOthers: 0 })

  return (
    <>
      <Card padding="px-6 py-4">
        <Stepper id="ung-von" steps={FUNDING_STEPS} currentStep={step} />
      </Card>
      <div key={step} className={direction === 'forward' ? 'animate-step-forward' : 'animate-step-back'}>
        {step === 1 && <NeedA2 />}
        {step === 2 && <Estimate staircase={staircase} />}
        {step === 4 && <Submit staircase={staircase} />}
        {step === 5 && <Disbursed />}
      </div>
    </>
  )
}

function NeedA2() {
  const { state } = useApp()
  return (
    <Card padding="p-6" className="space-y-4">
      <div className="flex items-start gap-4">
        <KeyRound size={28} className="flex-shrink-0 text-primary" aria-hidden="true" />
        <div>
          <h2 className="text-section-title font-semibold text-ink">Techcombank cần quyền đánh giá tín dụng (A2)</h2>
          <p className="mt-1 text-body text-ink-muted">
            Bạn cấp quyền trên trang của Techcombank. Techcombank nhận: {A2_CONSENT.dataScopes.join(', ').toLowerCase()}.{' '}
            {A2_CONSENT.independenceNote}
          </p>
        </div>
      </div>
      <GatedButton gate={availability(state, 'viewEstimate')} onClick={() => {}}>
        Xem ước tính
      </GatedButton>
    </Card>
  )
}

// Bảng tính giá trị khả dụng từng dòng (quy-tac mục 4; du-lieu mục 4.2)
function Estimate({ staircase }) {
  const { state, dispatch } = useApp()
  // Đang ở bước xem ước tính = đã xem (điều kiện của Ký A4, san-pham.md G.1)
  useEffect(() => {
    if (!state.application.estimateViewed) dispatch({ type: 'viewEstimate' })
  }, [state.application.estimateViewed, dispatch])

  const interest = computeAdvanceInterest(staircase.result, TCB_QUOTE.annualRate, INTEREST_DAYS)
  const sign = availability(state, 'signA4')

  return (
    <div className="grid grid-cols-5 gap-5">
      <StaircaseCard staircase={staircase} units={activeUnits(state)} className="col-span-3" />
      {/* Nút chính ngay dưới con số — nằm trong màn hình đầu ở 1366×768; chi phí ở dưới */}
      <div className="col-span-2 space-y-4">
        <Card padding="p-6">
          <div className="text-label font-medium text-ink-muted">Giá trị khả dụng ước tính</div>
          <Money value={staircase.result} size="hero" className="mt-1 block text-ink" />
          <EstimateDisclaimer className="mt-3" />
        </Card>
        <GatedButton gate={sign} onClick={() => go(ROUTES.a4)}>
          Tiếp: ký thỏa thuận A4
        </GatedButton>
        <Card padding="px-6 py-3">
          <div className="divide-y divide-line">
            <CostRow label="Bên cấp tín dụng" value="Techcombank" />
            <CostRow label="Lãi suất" value={`${formatPercentVN(TCB_QUOTE.annualRate)}/năm`} />
            <CostRow
              label={`Tiền lãi nếu tất toán sau ${INTEREST_DAYS} ngày`}
              value={<Money value={Math.round(interest * 1000)} unit="nghìn đồng" size="body" />}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}

function StaircaseCard({ staircase, units, className }) {
  const projected = staircase.totalProjectedNetValue
  const minus = (key) => -staircase.steps.find((s) => s.key === key).value
  const returns = minus('weightedReturnRate')
  const safety = minus('safetyMargin')
  const discount = minus('verificationDiscount')
  const formula = staircase.formulaValueTotal
  const pct = (v) => `${projected > 0 ? Math.max(0, Math.min(100, (v / projected) * 100)) : 0}%`

  return (
    <Card padding="p-6" className={className}>
      <h2 className="text-emphasis font-semibold text-ink">Bảng tính giá trị khả dụng</h2>
      <div className="mt-3 flex h-8 w-full overflow-hidden rounded-lg" role="img" aria-label="Cơ cấu giá trị ròng dự phóng">
        <div className="bg-primary" style={{ width: pct(formula) }} />
        <div className="bg-slate-400" style={{ width: pct(returns) }} />
        <div className="bg-slate-300" style={{ width: pct(safety) }} />
        <div className="bg-slate-200" style={{ width: pct(discount) }} />
      </div>
      <div className="mt-4 divide-y divide-line rounded-lg border border-line">
        <CalcRow label={`Giá trị ròng dự phóng (${units.map((u) => `${u.code} ${formatNumberVN(u.projectedNetValue)}`).join(" + ")})`} value={projected} />
        <CalcRow label={`− Tỷ lệ hoàn gia quyền (${formatPercentVN(returns / projected)})`} value={returns} />
        <CalcRow label={`− Biên an toàn (${formatPercentVN(safety / projected)})`} value={safety} />
        <CalcRow label="− Chiết khấu xác thực" value={discount} />
        <CalcRow label={`= Theo công thức (tỷ lệ ứng ${formatPercentVN(formula / projected)})`} value={formula} strong />
        <CalcRow label="Trần dư nợ" value={staircase.debtCap} />
        <CalcRow label="− Đã bị bên khác khóa" value={staircase.lockedByOthers} />
      </div>
      <p className="mt-3 text-body font-semibold text-ink">
        {staircase.cappedByDebtCap
          ? `Bị chặn bởi trần dư nợ: ${formatNumberVN(formula)} → ${formatNumberVN(staircase.result)} triệu`
          : `${formatNumberVN(formula)} ≤ trần ${formatNumberVN(staircase.capAfterLock)} → giá trị khả dụng ${formatNumberVN(staircase.result)} triệu`}
      </p>
    </Card>
  )
}


function CalcRow({ label, value, strong }) {
  return (
    <div className={`flex items-center justify-between px-4 py-2 text-body ${strong ? 'bg-app-bg font-semibold text-ink' : 'text-ink-muted'}`}>
      <span>{label}</span>
      <span className="font-medium tabular-nums text-ink">{formatNumberVN(value)} triệu</span>
    </div>
  )
}

function CostRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 text-body">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  )
}

function Submit({ staircase }) {
  const { state, dispatch } = useApp()
  const [reviewing, setReviewing] = useState(false)
  const gate = availability(state, 'submit')

  useEffect(() => {
    if (!reviewing) return
    const timer = setTimeout(() => dispatch({ type: 'submit' }), REVIEW_MS)
    return () => clearTimeout(timer)
  }, [reviewing, dispatch])

  return (
    <Card padding="p-6" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="text-label font-medium text-ink-muted">Đề nghị ứng vốn gửi tới Techcombank</div>
          <Money value={staircase.result} size="hero" className="mt-1 block text-ink" />
          <EstimateDisclaimer className="mt-3" />
        </div>
        <ul className="space-y-1 text-body text-ink">
          <li>Quyền đánh giá tín dụng A2: {state.consents.A2 === 'active' ? 'đang hoạt động' : 'đã rút'}</li>
          <li>Thỏa thuận A4: đã ký với Techcombank</li>
          <li>Techcombank tự thẩm định và giải ngân vào tài khoản của bạn</li>
        </ul>
      </div>
      {reviewing ? (
        <div role="status" className="flex items-center justify-end gap-3 text-body font-semibold text-ink">
          <span className="h-3 w-3 animate-pulse rounded-full bg-primary" aria-hidden="true" />
          Techcombank đang thẩm định…
        </div>
      ) : (
        <GatedButton gate={gate} onClick={() => setReviewing(true)}>
          Gửi đề nghị tới Techcombank
        </GatedButton>
      )}
    </Card>
  )
}

function Disbursed() {
  const { state } = useApp()
  const l = loan(state)
  const amounts = Object.fromEntries(state.registry.map((e) => [e.unitId, e.amount]))
  return (
    <div className="grid grid-cols-2 gap-5">
      <Card padding="p-6" className="space-y-4">
        <div className="flex items-start gap-3 text-primary">
          <DoneCheck />
          <p className="text-emphasis font-semibold text-ink">
            {l.lender} đã phê duyệt và giải ngân {formatNumberVN(l.principal)} triệu vào tài khoản của bạn.
          </p>
        </div>
        <ul className="space-y-2">
          {Object.keys(amounts).map((code) => (
            <li key={code} className="flex items-center justify-between gap-3 text-body">
              <span>
                <span className="font-semibold">{code}</span> — khóa {formatNumberVN(amounts[code])} triệu
              </span>
              <StatusBadge status={unitStatus(state, code)} className="animate-ru-badge-fade whitespace-nowrap" />
            </li>
          ))}
        </ul>
        <div className="flex justify-end">
          <Button onClick={() => go(ROUTES.khoanVay)}>Xem khoản vay</Button>
        </div>
        {/* Hành trình 2.6: đứt gãy → đóng băng cấp vốn mới; Ký A4 cho đề nghị mới vô hiệu kèm lý do */}
        {fundingFrozen(state) && (
          <div className="border-t border-line pt-4">
            <GatedButton gate={availability(state, 'signA4')} onClick={() => {}}>
              Ký A4 cho đề nghị mới
            </GatedButton>
          </div>
        )}
      </Card>
      <LockCertificate amounts={amounts} secured={l.lender} />
    </div>
  )
}
