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

// Thẻ bậc thang dựng bằng div (không dùng thư viện chart) — docs/du-lieu.md mục 4.2.
function StaircaseCard({ staircase }) {
  const cap = staircase.debtCap
  // Trục hiển thị theo giá trị lớn nhất cần vẽ (tổng dự phóng hoặc trần, tuỳ cái nào lớn hơn).
  const axisMax = Math.max(staircase.totalProjectedNetValue, cap, staircase.result) * 1.05
  let running = staircase.totalProjectedNetValue

  const bars = staircase.steps.map((s) => {
    const startRunning = running
    running += s.value
    return { ...s, startRunning, endRunning: running }
  })

  function pct(v) {
    return `${Math.max(0, Math.min(100, (v / axisMax) * 100))}%`
  }

  const capExceeded = staircase.cappedByDebtCap

  return (
    <Card>
      <div className="mb-4 text-emphasis font-semibold text-slate-900">Bảng tính giá trị khả dụng</div>

      <div className="relative space-y-3">
        {/* Vạch ngang trần dư nợ */}
        <div className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-dashed border-slate-400" style={{ top: `${100 - parseFloat(pct(cap))}%` }}>
          <span className="absolute -top-3 right-0 bg-white px-1 text-label font-medium text-slate-600">
            Trần dư nợ {formatNumberVN(cap)} triệu
          </span>
        </div>

        {bars.map((b) => (
          <div key={b.key} className="flex items-center gap-4">
            <div className="w-64 flex-shrink-0 text-label text-slate-600">{b.label}</div>
            <div className="relative h-8 flex-1 rounded bg-slate-100">
              <div
                className={`absolute h-8 rounded ${b.value >= 0 ? 'bg-navy' : 'bg-slate-400'}`}
                style={{
                  left: pct(Math.min(b.startRunning, b.endRunning)),
                  width: pct(Math.abs(b.value)),
                }}
              />
            </div>
            <div className="w-28 flex-shrink-0 text-right text-label tabular-nums text-slate-700">
              {b.value >= 0 ? '' : '− '}
              {formatNumberVN(Math.abs(b.value))}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-4 border-t border-slate-200 pt-3">
          <div className="w-64 flex-shrink-0 text-label font-semibold text-slate-900">Giá trị theo công thức</div>
          <div className="relative h-8 flex-1 rounded bg-slate-100">
            <div
              className={`absolute h-8 rounded ${capExceeded ? 'bg-slate-300' : 'bg-teal-600'}`}
              style={{ left: 0, width: pct(staircase.formulaValueTotal) }}
            />
            {capExceeded && (
              <div
                className="absolute h-8 rounded border-2 border-dashed border-red-400 bg-red-50/60"
                style={{ left: pct(staircase.result), width: pct(staircase.formulaValueTotal - staircase.result) }}
                title="Vượt trần dư nợ"
              />
            )}
          </div>
          <div className="w-28 flex-shrink-0 text-right text-label font-semibold tabular-nums text-slate-900">
            {formatNumberVN(staircase.formulaValueTotal)}
          </div>
        </div>

        {capExceeded && (
          <div className="text-right text-label font-medium text-red-600">
            Phần vượt trần dư nợ: {formatNumberVN(staircase.formulaValueTotal - staircase.result)} triệu — Vượt trần dư nợ
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between rounded-xl border border-teal-600 bg-teal-50 px-6 py-5">
        <span className="text-emphasis font-semibold text-teal-800">GIÁ TRỊ KHẢ DỤNG</span>
        <Money value={staircase.result} size="hero" className="text-teal-800" />
      </div>

      {capExceeded && (
        <div className="mt-3 text-label font-semibold text-amber-700">Bị chặn bởi trần dư nợ</div>
      )}

      <EstimateDisclaimer className="mt-4" />
    </Card>
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
