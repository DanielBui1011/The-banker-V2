import { useEffect, useMemo, useState } from 'react'
import TopBar from '../components/ui/TopBar.jsx'
import ActProgress from '../components/ui/ActProgress.jsx'
import SurfaceFrame from '../components/ui/SurfaceFrame.jsx'
import Stepper from '../components/ui/Stepper.jsx'
import Card from '../components/ui/Card.jsx'
import Money from '../components/ui/Money.jsx'
import Callout, { EstimateDisclaimer } from '../components/ui/Callout.jsx'
import Button from '../components/ui/Button.jsx'
import LockCertificate from '../components/LockCertificate.jsx'
import ConsentPage from '../components/ui/ConsentPage.jsx'
import { actForScreen } from '../config/flow.js'
import { usePermissions } from '../state/permissionState.jsx'
import { useScenario } from '../state/scenarioState.jsx'
import { useSettlement } from '../state/settlementState.jsx'
import { isTypingTarget } from '../utils/keyboard.js'
import {
  FOOTER_NOTE,
  A2_CONSENT,
  A4_AGREEMENT,
  RECEIVABLE_UNITS,
  MEGA_SALE_UNITS,
  PRICING_PARAMS,
  LENDER_QUOTES,
  LOCK_CERTIFICATE,
} from '../data/mockData.js'
import { LEGAL_NAME, TPP_CODE } from '../config/brand.js'
import { computeAvailableValueStaircase, computeAvailableValue, computeAdvanceInterest } from '../logic/pricing.js'
import { formatNumberVN, formatPercentVN } from '../utils/format.js'

const NORMAL_UNITS = RECEIVABLE_UNITS.filter((u) => u.code === 'RU-03' || u.code === 'RU-04')
const TECHCOMBANK_QUOTE = LENDER_QUOTES.find((q) => q.lender === 'Techcombank')
const INTEREST_DAYS = 5
const STEPS = ['Cấp A2', 'Xem ước tính', 'Ký A4 tại Techcombank', 'Gửi đề nghị']

// Thứ tự Màn 5 (docs/man-hinh.md): 5a cấp A2 → 5b xem ước tính → 5c ký A4 →
// 5d gửi đề nghị và nhận kết quả. Vòng 7C: áp SurfaceFrame + component chung,
// giữ nguyên logic đã có (không đổi công thức/state).
export default function Screen5({ onNext, onPrev }) {
  const { grantA2A4, openPeek } = usePermissions()
  const { megaSale } = useScenario()
  const settlement = useSettlement()

  const [step, setStep] = useState('a') // a | b | c | d
  const [submitPhase, setSubmitPhase] = useState('idle') // idle | reviewing | approved
  const [duplicateCallout, setDuplicateCallout] = useState(null)

  const units = megaSale ? MEGA_SALE_UNITS : NORMAL_UNITS
  const params = megaSale ? PRICING_PARAMS.megaSale : PRICING_PARAMS.normal

  const staircase = useMemo(
    () => computeAvailableValueStaircase({ units, params, lockedByOthers: 0 }),
    [units, params]
  )

  const interestEstimate = computeAdvanceInterest(staircase.result, TECHCOMBANK_QUOTE.annualRate, INTEREST_DAYS)

  // Chứng thư khóa hiển thị giá trị theo đơn vị — luôn theo bộ RU-03/RU-04 thật
  // (kết quả T1 của mục 4.2: 46,75 + 38,25 = 85), bất kể Mega Sale có bật hay không.
  const lockAmounts = useMemo(() => {
    const pricing = computeAvailableValue({ units: NORMAL_UNITS, params: PRICING_PARAMS.normal })
    return Object.fromEntries(pricing.unitBreakdown.map((u) => [u.code, u.formulaValue]))
  }, [])

  useEffect(() => {
    if (submitPhase !== 'reviewing') return
    const timer = setTimeout(() => {
      grantA2A4()
      settlement.performLocks()
      setSubmitPhase('approved')
    }, 1200)
    return () => clearTimeout(timer)
  }, [submitPhase, grantA2A4, settlement])

  // Phím D (Màn 5 sau khi đã khóa): mô phỏng Techcombank gửi lại lệnh khóa
  useEffect(() => {
    function handleKeyDown(e) {
      if (isTypingTarget(e.target)) return
      if (e.key.toLowerCase() !== 'd') return
      if (step !== 'd' || submitPhase !== 'approved') return
      const result = settlement.retryLock('RU-03')
      if (result?.status === 'DA_GHI_NHAN') {
        const lockedAt = LOCK_CERTIFICATE.lockedAt.slice(11, 16) // hh:mm
        setDuplicateCallout({ lockedAt, priority: 1, total: settlement.totalLocked })
        setTimeout(() => setDuplicateCallout(null), 6000)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [step, submitPhase, settlement])

  function approveA2() {
    setStep('b')
  }

  function rejectA2() {
    onPrev?.()
  }

  function signA4() {
    setStep('d')
  }

  const currentStepNumber = { a: 1, b: 2, c: 3, d: 4 }[step]

  if (step === 'a') {
    return (
      <ConsentPage
        steps={STEPS}
        currentStep={currentStepNumber}
        heading="Yêu cầu cấp quyền đánh giá tín dụng"
        subheading="Vui lòng xem lại phạm vi trước khi quyết định."
        requesterName={LEGAL_NAME}
        requesterCode={TPP_CODE}
        purpose={A2_CONSENT.purposeLabel}
        scopeItems={A2_CONSENT.dataScopes}
        recipient={A2_CONSENT.dataRecipient}
        duration={`${A2_CONSENT.durationDays} ngày`}
        notAllowedText="Quyền này KHÔNG cho phép: chuyển tiền, thay đổi thông tin tài khoản, xem mật khẩu hoặc mã OTP."
        withdrawalText={A2_CONSENT.independenceNote}
        confirmLabel="Tôi đã đọc và đồng ý cấp quyền cho mục đích trên"
        approveLabel="Đồng ý cấp quyền"
        onApprove={approveA2}
        onReject={rejectA2}
      />
    )
  }

  if (step === 'c') {
    return (
      <ConsentPage
        steps={STEPS}
        currentStep={currentStepNumber}
        heading="Thỏa thuận chuyển giao quyền đòi nợ"
        subheading="Vui lòng đọc kỹ nội dung trước khi ký."
        requesterLabel="Bên nhận bảo đảm"
        requesterName="Techcombank"
        purpose="Bảo đảm khoản ứng vốn bằng khoản phải thu, đăng ký theo Nghị định 99/2022/NĐ-CP."
        scopeLabel="Tài sản bảo đảm"
        scopeItems={units.map((u) => `${u.code} — khoản phải thu ghi nhận khóa cho Techcombank tại sổ đăng ký`)}
        recipientLabel="Đăng ký biện pháp bảo đảm"
        recipient={`${A4_AGREEMENT.registrationNote} Mã đăng ký giả định: ${LOCK_CERTIFICATE.registrationId}.`}
        durationLabel="Dòng tiền"
        duration={A4_AGREEMENT.settlementNote}
        notAllowedText="Thỏa thuận này KHÔNG cho phép Techcombank truy cập hay xử lý dữ liệu ngoài phạm vi tài sản bảo đảm nêu trên."
        withdrawalText="Không thể rút khi còn dư nợ — thỏa thuận tự động chấm dứt sau khi tất toán."
        confirmLabel="Tôi đã đọc và đồng ý ký thỏa thuận chuyển giao quyền đòi nợ nêu trên"
        approveLabel="Ký thỏa thuận"
        onApprove={signA4}
      />
    )
  }

  return (
    <Screen5Chrome currentStepNumber={currentStepNumber} onOpenPeek={openPeek}>
      {step === 'b' && <EstimateStep staircase={staircase} interestEstimate={interestEstimate} onNext={() => setStep('c')} />}
      {step === 'd' && (
        <SubmitStep
          staircase={staircase}
          submitPhase={submitPhase}
          onSubmit={() => setSubmitPhase('reviewing')}
          onNext={onNext}
          lockAmounts={lockAmounts}
          duplicateCallout={duplicateCallout}
        />
      )}
    </Screen5Chrome>
  )
}

// Khung dùng chung cho bước 5b/5d (bề mặt Nền tảng). Bước 5a/5c dùng ConsentPage
// riêng (khung ngân hàng, Stepper Nền tảng nằm ngoài SurfaceFrame).
function Screen5Chrome({ currentStepNumber, onOpenPeek, children }) {
  return (
    <div className="flex h-full flex-col">
      <TopBar screenNumber={5} onOpenPeek={() => onOpenPeek?.(5)} />
      <SurfaceFrame variant="platform">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 px-12 pb-3 pt-3">
            <ActProgress currentAct={actForScreen(5)} tone="light" />
          </div>
          <div className="border-b border-slate-200 bg-slate-50 px-12 py-4">
            <Stepper steps={STEPS} currentStep={currentStepNumber} />
          </div>
          <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-12 pt-10 pb-24">
            <div className="mx-auto w-full max-w-[1536px] space-y-6">{children}</div>
          </main>
          <footer className="border-t border-slate-200 px-12 py-3 text-label text-slate-500">{FOOTER_NOTE}</footer>
        </div>
      </SurfaceFrame>
    </div>
  )
}

// Bảng tính giá trị khả dụng (Vòng 14) — một thanh xếp chồng duy nhất trên cùng
// một thang đo (tổng giá trị ròng dự phóng), bảng phép tính từng bước bên dưới,
// và kiểm tra trần dư nợ là một dòng riêng — docs/du-lieu.md mục 4.2.
function StaircaseCard({ staircase }) {
  const projected = staircase.totalProjectedNetValue
  const returnDeduction = -staircase.steps.find((s) => s.key === 'weightedReturnRate').value
  const safetyDeduction = -staircase.steps.find((s) => s.key === 'safetyMargin').value
  const verificationDeduction = -staircase.steps.find((s) => s.key === 'verificationDiscount').value
  const formulaValue = staircase.formulaValueTotal
  const cap = staircase.capAfterLock
  const capExceeded = staircase.cappedByDebtCap

  function pct(v) {
    return `${projected > 0 ? Math.max(0, Math.min(100, (v / projected) * 100)) : 0}%`
  }

  return (
    <Card>
      <div className="mb-4 text-emphasis font-semibold text-slate-900">Bảng tính giá trị khả dụng</div>

      <div className="flex h-10 w-full overflow-hidden rounded-lg" role="img" aria-label="Cơ cấu giá trị ròng dự phóng">
        <div className="bg-teal-600" style={{ width: pct(formulaValue) }} title={`Khả dụng: ${formatNumberVN(formulaValue)} triệu`} />
        <div className="bg-slate-400" style={{ width: pct(returnDeduction) }} title={`Tỷ lệ hoàn: ${formatNumberVN(returnDeduction)} triệu`} />
        <div className="bg-slate-300" style={{ width: pct(safetyDeduction) }} title={`Biên an toàn: ${formatNumberVN(safetyDeduction)} triệu`} />
        <div className="bg-slate-200" style={{ width: pct(verificationDeduction) }} title={`Chiết khấu xác thực: ${formatNumberVN(verificationDeduction)} triệu`} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-label text-slate-600">
        <LegendDot swatchClass="bg-teal-600" label="Khả dụng" value={formulaValue} />
        <LegendDot swatchClass="bg-slate-400" label="Tỷ lệ hoàn" value={returnDeduction} />
        <LegendDot swatchClass="bg-slate-300" label="Biên an toàn" value={safetyDeduction} />
        {verificationDeduction > 0 && <LegendDot swatchClass="bg-slate-200" label="Chiết khấu xác thực" value={verificationDeduction} />}
        <span className="text-slate-400">= {formatNumberVN(projected)} triệu giá trị ròng dự phóng</span>
      </div>

      <div className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200">
        <CalcRow label="Giá trị ròng dự phóng" value={`${formatNumberVN(projected)} triệu`} />
        <CalcRow
          label={`− Tỷ lệ hoàn gia quyền (${formatPercentVN(returnDeduction / projected)})`}
          value={`${formatNumberVN(returnDeduction)} triệu`}
        />
        <CalcRow
          label={`− Biên an toàn (${formatPercentVN(safetyDeduction / projected)})`}
          value={`${formatNumberVN(safetyDeduction)} triệu`}
        />
        <CalcRow label="− Chiết khấu xác thực" value={`${formatNumberVN(verificationDeduction)} triệu`} />
        <CalcRow label="= Giá trị theo công thức" value={`${formatNumberVN(formulaValue)} triệu`} emphasis />
      </div>

      <div className="mt-3 text-label font-medium">
        {capExceeded ? (
          <span className="text-amber-700">
            {formatNumberVN(formulaValue)} → bị chặn ở trần {formatNumberVN(cap)}
          </span>
        ) : (
          <span className="text-slate-600">
            {formatNumberVN(formulaValue)} ≤ trần dư nợ {formatNumberVN(cap)} <span className="text-teal-800">✓</span>
          </span>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-teal-600 bg-teal-50 px-6 py-5">
        <span className="text-emphasis font-semibold text-teal-800">GIÁ TRỊ KHẢ DỤNG</span>
        <Money value={staircase.result} size="hero" className="text-teal-800" />
      </div>
    </Card>
  )
}

function LegendDot({ swatchClass, label, value }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-sm ${swatchClass}`} aria-hidden="true" />
      {label} <span className="tabular-nums font-medium text-slate-900">{formatNumberVN(value)}</span>
    </span>
  )
}

function CalcRow({ label, value, emphasis }) {
  return (
    <div className={`flex items-center justify-between px-4 py-2.5 text-body ${emphasis ? 'bg-teal-50' : ''}`}>
      <span className={emphasis ? 'font-semibold text-teal-800' : 'text-slate-600'}>{label}</span>
      <span className={`tabular-nums ${emphasis ? 'font-semibold text-teal-800' : 'font-medium text-slate-900'}`}>{value}</span>
    </div>
  )
}

// Bước 5b — Bảng tính giá trị khả dụng dạng bậc thang.
function EstimateStep({ staircase, interestEstimate, onNext }) {
  return (
    <div className="space-y-6">
      <p className="text-body text-slate-600">
        Giá trị khả dụng tính từ các đơn vị khoản phải thu đã xác thực, trước khi ký chuyển giao quyền đòi nợ.
      </p>

      <StaircaseCard staircase={staircase} />

      <Card>
        <div className="mb-1 text-emphasis font-semibold text-slate-900">Chi phí</div>
        <div className="divide-y divide-slate-100">
          <CostRow label="Bên cấp tín dụng" value="Techcombank" />
          <CostRow label="Lãi suất" value={`${formatPercentVN(TECHCOMBANK_QUOTE.annualRate)}/năm`} />
          <CostRow
            label={`Tiền lãi ước tính nếu tất toán sau ${INTEREST_DAYS} ngày`}
            value={<Money value={Math.round(interestEstimate * 1000)} unit="nghìn đồng" size="body" className="text-slate-900" />}
          />
        </div>
      </Card>

      <EstimateDisclaimer />

      <div className="flex justify-end">
        <Button onClick={onNext}>Tiếp: Ký thỏa thuận A4 →</Button>
      </div>
    </div>
  )
}

function CostRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-body">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  )
}

// Bước 5d — Gửi đề nghị: hiệu ứng ngắn "đang thẩm định" rồi chứng thư khóa.
function SubmitStep({ staircase, submitPhase, onSubmit, onNext, lockAmounts, duplicateCallout }) {
  return (
    <div className="space-y-6">
      <Card padding="p-8">
        <div className="text-label text-slate-500">Sẵn sàng gửi đề nghị ứng vốn</div>
        <Money value={staircase.result} size="hero" className="mt-1 block text-slate-900" />
        <EstimateDisclaimer className="mt-4" />
      </Card>

      {submitPhase === 'idle' && (
        <div className="flex justify-end">
          <Button onClick={onSubmit}>Gửi đề nghị tới Techcombank</Button>
        </div>
      )}

      {submitPhase === 'reviewing' && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-6 text-body text-slate-600">
          <span className="h-3 w-3 animate-pulse rounded-full bg-navy" />
          Techcombank đang thẩm định...
        </div>
      )}

      {submitPhase === 'approved' && (
        <>
          <Card padding="p-6" className="border-teal-600 bg-teal-50">
            <div className="text-body font-semibold text-teal-800">
              Techcombank đã phê duyệt và giải ngân {formatNumberVN(staircase.result)} triệu vào tài khoản của bạn.
            </div>
          </Card>

          <LockCertificate amounts={lockAmounts} />

          {duplicateCallout && (
            <Callout variant="info">
              Lệnh khóa này đã được ghi nhận lúc {duplicateCallout.lockedAt} — không tạo khóa mới. Thứ tự ưu tiên #{duplicateCallout.priority} giữ nguyên. Tổng đã khóa: {formatNumberVN(duplicateCallout.total)} triệu.
            </Callout>
          )}

          <div className="flex justify-end">
            <Button onClick={onNext}>Tiếp →</Button>
          </div>
        </>
      )}
    </div>
  )
}
