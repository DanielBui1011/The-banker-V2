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
import Callout, { EstimateDisclaimer } from '../components/ui/Callout.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import LockCertificate from '../components/LockCertificate.jsx'
import { A2_CONSENT, LENDER_QUOTES, PRICING_PARAMS } from '../data/mockData.js'
import { computeAvailableValueStaircase, computeAdvanceInterest, computeQuoteComparison } from '../logic/pricing.js'
import { ROUTES, availability, activeUnits, loan, unitStatus, fundingFrozen } from '../logic/journey.js'
import { go } from '../utils/route.js'
import { formatNumberVN, formatPercentVN } from '../utils/format.js'
import { useApp } from '../state/appState.jsx'

// Ứng vốn (Màn 5 cũ, san-pham.md B.1 Tầng 3; hanh-trinh 1.10–1.16). Bốn bước; bước 1 và 3
// diễn ra trên trang Techcombank (A2, A4). Bước hiện tại suy ra từ state, không lưu riêng.
// Giai đoạn 3 (san-pham.md G.3) thay luồng: A2 → chọn bên nhận → chào giá → ký trên trang
// bên được chọn (A4 ghi sổ khóa ngay, journey.js).
export const FUNDING_STEPS = ['Cấp A2', 'Xem ước tính', 'Ký A4', 'Gửi đề nghị']
const PHASE3_STEPS = ['Cấp A2', 'Chọn bên nhận', 'Chọn chào giá', 'Ký thỏa thuận']
export const fundingSteps = (state) => (state.scenario.phase3 ? PHASE3_STEPS : FUNDING_STEPS)
const TCB_QUOTE = LENDER_QUOTES.find((q) => q.lender === 'Techcombank')
const INTEREST_DAYS = 5
// "Techcombank đang thẩm định" — trạng thái giao diện có chữ, giữ 1,2 giây kể cả khi
// reduced-motion (san-pham.md mục I, dòng 5d)
const REVIEW_MS = 1200

function currentStep(state) {
  const { consents, application } = state
  if (state.registry.length > 0) return FUNDING_STEPS.length + 1
  if (state.scenario.phase3) {
    if (consents.A2 !== 'active') return 1
    if (!application.quoteRequest) return 2
    return application.chosenLender ? 4 : 3
  }
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
        <Stepper id="ung-von" steps={fundingSteps(state)} currentStep={step} />
      </Card>
      <div key={step} className={direction === 'forward' ? 'animate-step-forward' : 'animate-step-back'}>
        {step === 1 && <NeedA2 />}
        {state.scenario.phase3 ? (
          <>
            {step === 2 && <Recipients />}
            {step === 3 && <Quotes />}
            {step === 4 && <SignChosen />}
            {step === 5 && (loan(state).lender === TCB_QUOTE.lender ? <Disbursed /> : <OtherLenderEnd />)}
          </>
        ) : (
          <>
            {step === 2 && <Estimate staircase={staircase} />}
            {step === 4 && <Submit staircase={staircase} />}
            {step === 5 && <Disbursed />}
          </>
        )}
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
        {state.scenario.phase3 ? 'Tiếp: chọn bên nhận yêu cầu' : 'Xem ước tính'}
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
        <LockedUnits amounts={amounts} />
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

function LockedUnits({ amounts }) {
  const { state } = useApp()
  return (
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
  )
}

// ─── Giai đoạn 3 (san-pham.md G.3) ───────────────────────────────────────────

// Bước 2 — chọn bên nhận yêu cầu chào giá: không tích sẵn, cần ít nhất một bên
function Recipients() {
  const { state, dispatch } = useApp()
  const [recipients, setRecipients] = useState([])
  const toggle = (name) => setRecipients((r) => (r.includes(name) ? r.filter((x) => x !== name) : [...r, name]))
  const units = activeUnits(state)

  return (
    <Card padding="p-6" className="space-y-5">
      <div>
        <h2 className="text-section-title font-semibold text-ink">Gửi yêu cầu chào giá</h2>
        <p className="mt-1 text-body text-ink-muted">
          Cho {units.map((u) => `${u.code} (${formatNumberVN(u.projectedNetValue)} triệu)`).join(' và ')}. Chỉ các bên bạn
          chọn nhận được dữ liệu cho yêu cầu này.
        </p>
      </div>
      <fieldset className="grid grid-cols-3 gap-4">
        <legend className="sr-only">Bên nhận yêu cầu</legend>
        {LENDER_QUOTES.map(({ lender }) => (
          <label
            key={lender}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-line bg-app-surface p-4 text-body font-medium text-ink transition duration-fast has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
          >
            <input
              type="checkbox"
              checked={recipients.includes(lender)}
              onChange={() => toggle(lender)}
              className="h-5 w-5 accent-primary"
            />
            {lender}
          </label>
        ))}
      </fieldset>
      <GatedButton
        gate={availability(state, { type: 'requestQuotes', recipients })}
        onClick={() => dispatch({ type: 'requestQuotes', recipients })}
      >
        Gửi yêu cầu chào giá
      </GatedButton>
    </Card>
  )
}

// Bước 3 — chào giá của các bên đã chọn, lãi suất tăng dần. Tiền lãi tính trên giá trị chào
// của từng bên (pricing.js). Nhãn duy nhất: "Lãi thấp nhất" — không nhãn khuyên dùng.
function Quotes() {
  const { state, dispatch } = useApp()
  const { recipients } = state.application.quoteRequest
  const quotes = computeQuoteComparison(
    LENDER_QUOTES.filter((q) => recipients.includes(q.lender)),
    INTEREST_DAYS
  ).sort((a, b) => a.annualRate - b.annualRate)
  const lowestRate = quotes[0].annualRate

  function choose(lender) {
    dispatch({ type: 'chooseQuote', lender })
    go(ROUTES.a4)
  }

  return (
    <Card padding="p-6" className="space-y-4">
      <div>
        <h2 className="text-section-title font-semibold text-ink">Chào giá cho {activeUnits(state).map((u) => u.code).join(' và ')}</h2>
        <p className="mt-1 text-body text-ink-muted">
          Mỗi bên cho vay tự thẩm định và tự giải ngân; ứng dụng chỉ chuyển yêu cầu và chào giá.
        </p>
      </div>
      <DataTable
        columns={[
          {
            key: 'lender',
            header: 'Bên cho vay',
            render: (q) => (
              <span className="flex flex-col items-start gap-1 whitespace-nowrap py-2 text-body font-medium text-ink">
                {q.lender}
                {q.annualRate === lowestRate && (
                  <span className="whitespace-nowrap rounded-full border border-ink-muted px-2.5 py-0.5 text-label font-semibold text-ink">
                    Lãi thấp nhất
                  </span>
                )}
              </span>
            ),
          },
          { key: 'value', header: 'Giá trị', align: 'right', render: (q) => <Money value={q.value} /> },
          { key: 'annualRate', header: <span className="whitespace-nowrap">Lãi suất/năm</span>, align: 'right', render: (q) => formatPercentVN(q.annualRate) },
          {
            key: 'estimatedCost',
            header: `Tiền lãi nếu tất toán sau ${INTEREST_DAYS} ngày`,
            align: 'right',
            render: (q) => <Money value={Math.round(q.estimatedCost * 1000)} unit="nghìn đồng" />,
          },
          { key: 'term', header: 'Kỳ hạn' },
          {
            key: 'action',
            header: '',
            align: 'right',
            render: (q) => (
              <Button variant="secondary" onClick={() => choose(q.lender)} aria-label={`Chọn chào giá của ${q.lender}`}>
                Chọn
              </Button>
            ),
          },
        ]}
        rows={quotes}
        rowKey={(q) => q.lender}
      />
      <EstimateDisclaimer />
    </Card>
  )
}

// Bước 4 — đã chọn, chưa ký (vd. bấm Từ chối trên trang ký): ký tiếp hoặc chọn bên khác
function SignChosen() {
  const { state, dispatch } = useApp()
  const { chosenLender, quoteRequest } = state.application
  const quote = LENDER_QUOTES.find((q) => q.lender === chosenLender)

  return (
    <Card padding="p-6" className="space-y-4">
      <h2 className="text-section-title font-semibold text-ink">Bạn đã chọn chào giá của {chosenLender}</h2>
      <p className="text-body text-ink-muted">
        {formatNumberVN(quote.value)} triệu, lãi suất {formatPercentVN(quote.annualRate)}/năm. Thỏa thuận chuyển giao
        quyền đòi nợ được ký trên trang của {chosenLender}.
      </p>
      <EstimateDisclaimer />
      <div className="flex items-start justify-end gap-3">
        <Button variant="secondary" onClick={() => dispatch({ type: 'requestQuotes', recipients: quoteRequest.recipients })}>
          Chọn chào giá khác
        </Button>
        <GatedButton gate={availability(state, 'signA4')} onClick={() => go(ROUTES.a4)}>
          Ký trên trang {chosenLender}
        </GatedButton>
      </div>
    </Card>
  )
}

// Bước 5 với Ngân hàng B / Công ty tài chính C: dừng ở chứng thư khóa (sổ đã ghi thật)
function OtherLenderEnd() {
  const { state, dispatch } = useApp()
  const l = loan(state)
  const amounts = Object.fromEntries(state.registry.map((e) => [e.unitId, e.amount]))

  return (
    <div className="grid grid-cols-2 gap-5">
      <Card padding="p-6" className="space-y-4">
        <div className="flex items-start gap-3 text-primary">
          <DoneCheck />
          <p className="text-emphasis font-semibold text-ink">
            Đã ký thỏa thuận với {l.lender}. Sổ đăng ký đã ghi khóa {formatNumberVN(l.principal)} triệu.
          </p>
        </div>
        <LockedUnits amounts={amounts} />
        <Callout>Dòng tất toán trong mô phỏng dựng cho Techcombank.</Callout>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => go(ROUTES.batDauLai)}>
            Bắt đầu lại
          </Button>
          <Button onClick={() => dispatch({ type: 'rechooseQuote' })}>Chọn lại chào giá</Button>
        </div>
      </Card>
      <LockCertificate amounts={amounts} secured={l.lender} />
    </div>
  )
}
