import { useEffect, useMemo, useState } from 'react'
import TopBar from '../components/ui/TopBar.jsx'
import ActProgress from '../components/ui/ActProgress.jsx'
import SurfaceFrame from '../components/ui/SurfaceFrame.jsx'
import Stepper from '../components/ui/Stepper.jsx'
import Card from '../components/ui/Card.jsx'
import Money from '../components/ui/Money.jsx'
import { EstimateDisclaimer } from '../components/ui/Callout.jsx'
import LockCertificate from '../components/LockCertificate.jsx'
import { actForScreen } from '../config/flow.js'
import { usePermissions } from '../state/permissionState.jsx'
import { useScenario } from '../state/scenarioState.jsx'
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

  const [step, setStep] = useState('a') // a | b | c | d
  const [a2Confirmed, setA2Confirmed] = useState(false)
  const [a4Confirmed, setA4Confirmed] = useState(false)
  const [submitPhase, setSubmitPhase] = useState('idle') // idle | reviewing | approved

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
      setSubmitPhase('approved')
    }, 1200)
    return () => clearTimeout(timer)
  }, [submitPhase, grantA2A4])

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

  return (
    <Screen5Chrome variant={step === 'a' || step === 'c' ? 'bank' : 'platform'} currentStepNumber={currentStepNumber} onOpenPeek={openPeek}>
      {step === 'a' && (
        <BankConsent
          heading="Yêu cầu cấp quyền đánh giá tín dụng"
          subheading="Vui lòng xem lại phạm vi trước khi quyết định."
          confirmed={a2Confirmed}
          setConfirmed={setA2Confirmed}
          confirmLabel="Tôi đã đọc và đồng ý cấp quyền cho mục đích trên"
          approveLabel="Đồng ý"
          onApprove={approveA2}
          onReject={rejectA2}
        >
          <ConsentRow label="Bên yêu cầu" value={`${LEGAL_NAME} (mã TPP: ${TPP_CODE})`} />
          <ConsentRow label="Mục đích" value={A2_CONSENT.purposeLabel} />
          <div>
            <div className="mb-2 text-label font-medium text-slate-500">Phạm vi dữ liệu</div>
            <ul className="list-disc space-y-1 pl-5">
              {A2_CONSENT.dataScopes.map((scope) => (
                <li key={scope} className="text-slate-800">
                  {scope}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg bg-slate-100 p-4 text-label text-slate-600">
            Quyền này KHÔNG cho phép: chuyển tiền, thay đổi thông tin tài khoản, xem mật khẩu hoặc mã OTP.
          </div>
          <ConsentRow label="Thời hạn" value={`${A2_CONSENT.durationDays} ngày`} />
          <p className="text-label text-slate-500">{A2_CONSENT.independenceNote}</p>
        </BankConsent>
      )}

      {step === 'b' && <EstimateStep staircase={staircase} interestEstimate={interestEstimate} onNext={() => setStep('c')} />}

      {step === 'c' && (
        <BankConsent
          heading="Thỏa thuận chuyển giao quyền đòi nợ"
          subheading="Vui lòng đọc kỹ nội dung trước khi ký."
          confirmed={a4Confirmed}
          setConfirmed={setA4Confirmed}
          confirmLabel="Tôi đã đọc và đồng ý ký thỏa thuận chuyển giao quyền đòi nợ nêu trên"
          approveLabel="Ký thỏa thuận"
          onApprove={signA4}
        >
          <ConsentRow label="Bên nhận bảo đảm" value="Techcombank" />
          <div>
            <div className="text-label font-medium text-slate-500">Tài sản bảo đảm</div>
            <div className="text-slate-900">
              Các đơn vị khoản phải thu được ghi nhận khóa cho Techcombank tại sổ đăng ký:{' '}
              {units.map((u, i) => (
                <span key={u.code}>
                  {i > 0 && (i === units.length - 1 ? ' và ' : ', ')}
                  {u.code}
                </span>
              ))}
              .
            </div>
          </div>
          <ConsentRow label="Đăng ký biện pháp bảo đảm" value={`${A4_AGREEMENT.registrationNote} Mã đăng ký giả định: ${LOCK_CERTIFICATE.registrationId}.`} />
          <ConsentRow label="Dòng tiền" value={A4_AGREEMENT.settlementNote} />
        </BankConsent>
      )}

      {step === 'd' && (
        <SubmitStep
          staircase={staircase}
          submitPhase={submitPhase}
          onSubmit={() => setSubmitPhase('reviewing')}
          onNext={onNext}
          lockAmounts={lockAmounts}
        />
      )}
    </Screen5Chrome>
  )
}

// Khung dùng chung cho Màn 5 — Stepper hiện suốt màn, đặt trên SurfaceFrame để phân
// biệt bề mặt (platform/bank) mà không phá cấu trúc "chỉ 1 vùng cuộn" của SurfaceFrame.
function Screen5Chrome({ variant, currentStepNumber, onOpenPeek, children }) {
  return (
    <div className="flex h-full flex-col">
      {variant === 'platform' && <TopBar screenNumber={5} onOpenPeek={() => onOpenPeek?.(5)} />}
      <SurfaceFrame variant={variant} bankName="Techcombank">
        <div className="flex h-full flex-col">
          <div className={`border-b px-12 pb-3 pt-3 ${variant === 'platform' ? 'border-slate-200' : 'border-slate-200'}`}>
            <ActProgress currentAct={actForScreen(5)} tone="light" />
          </div>
          <div className="border-b border-slate-200 bg-slate-50 px-12 py-4">
            <Stepper steps={STEPS} currentStep={currentStepNumber} />
          </div>
          <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-12 py-10">
            <div className="mx-auto w-full max-w-[1536px] space-y-6">{children}</div>
          </main>
          <footer className="border-t border-slate-200 px-12 py-3 text-label text-slate-500">{FOOTER_NOTE}</footer>
        </div>
      </SurfaceFrame>
    </div>
  )
}

function ConsentRow({ label, value }) {
  return (
    <div>
      <div className="text-label font-medium text-slate-500">{label}</div>
      <div className="text-slate-900">{value}</div>
    </div>
  )
}

// Bước 5a / 5c — trang mô phỏng Techcombank, tách biệt hẳn với Nền tảng, một ô
// xác nhận không tích sẵn (CLAUDE.md #3, quy-tac.md mục 3).
function BankConsent({ heading, subheading, children, confirmed, setConfirmed, confirmLabel, approveLabel, onApprove, onReject }) {
  return (
    <Card padding="p-8" className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-section-title font-bold text-slate-900">{heading}</h1>
      {subheading && <p className="mb-6 text-body text-slate-600">{subheading}</p>}

      <div className="space-y-4 text-body">
        {children}

        <label className="flex items-start gap-3 text-label text-slate-800">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-1 h-5 w-5 rounded border-slate-300"
          />
          <span>{confirmLabel}</span>
        </label>
      </div>

      <div className="mt-8 flex gap-3">
        {onReject && (
          <button
            onClick={onReject}
            className="flex-1 rounded-xl border border-slate-300 py-3 text-emphasis font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Từ chối
          </button>
        )}
        <button
          onClick={onApprove}
          disabled={!confirmed}
          className="flex-1 rounded-xl bg-slate-900 py-3 text-emphasis font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300"
        >
          {approveLabel}
        </button>
      </div>
    </Card>
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
        <div className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-dashed border-red-500" style={{ top: `${100 - parseFloat(pct(cap))}%` }}>
          <span className="absolute -top-3 right-0 bg-white px-1 text-label font-medium text-red-600">
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
            value={`≈ ${formatNumberVN(interestEstimate)} triệu`}
          />
        </div>
      </Card>

      <button
        onClick={onNext}
        className="w-full rounded-xl bg-navy py-4 text-emphasis font-semibold text-white transition hover:opacity-90"
      >
        Tiếp: Ký thỏa thuận A4 →
      </button>
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
function SubmitStep({ staircase, submitPhase, onSubmit, onNext, lockAmounts }) {
  return (
    <div className="space-y-6">
      <Card padding="p-8">
        <div className="text-label text-slate-500">Sẵn sàng gửi đề nghị ứng vốn</div>
        <Money value={staircase.result} size="hero" className="mt-1 block text-slate-900" />
        <EstimateDisclaimer className="mt-4" />
      </Card>

      {submitPhase === 'idle' && (
        <button
          onClick={onSubmit}
          className="w-full rounded-xl bg-navy py-4 text-emphasis font-semibold text-white transition hover:opacity-90"
        >
          Gửi đề nghị tới Techcombank
        </button>
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

          <button
            onClick={onNext}
            className="w-full rounded-xl bg-navy py-4 text-emphasis font-semibold text-white transition hover:opacity-90"
          >
            Tiếp →
          </button>
        </>
      )}
    </div>
  )
}
