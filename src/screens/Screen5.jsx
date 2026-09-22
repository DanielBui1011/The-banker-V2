import { useEffect, useMemo, useState } from 'react'
import ScreenShell from '../components/ScreenShell.jsx'
import { usePermissions } from '../state/permissionState.jsx'
import { useScenario } from '../state/scenarioState.jsx'
import {
  FOOTER_NOTE,
  ESTIMATE_DISCLAIMER,
  A2_CONSENT,
  A4_AGREEMENT,
  RECEIVABLE_UNITS,
  MEGA_SALE_UNITS,
  PRICING_PARAMS,
  LENDER_QUOTES,
} from '../data/mockData.js'
import { LEGAL_NAME, TPP_CODE } from '../config/brand.js'
import { computeAvailableValue, computeAdvanceInterest } from '../logic/pricing.js'
import { formatNumberVN, formatPercentVN } from '../utils/format.js'

const NORMAL_UNITS = RECEIVABLE_UNITS.filter((u) => u.code === 'RU-03' || u.code === 'RU-04')
const TECHCOMBANK_QUOTE = LENDER_QUOTES.find((q) => q.lender === 'Techcombank')
const INTEREST_DAYS = 5

// Thứ tự Màn 5 (docs/man-hinh.md): 5a cấp A2 → 5b xem ước tính → 5c ký A4 →
// 5d gửi đề nghị và nhận kết quả. Đổi so với bản đặc tả gốc để nhà bán biết
// giá trị và chi phí trước khi ký chuyển giao quyền đòi nợ.
export default function Screen5({ onNext, onPrev }) {
  const { grantA2A4 } = usePermissions()
  const { megaSale } = useScenario()

  const [step, setStep] = useState('a') // a | b | c | d
  const [a2Confirmed, setA2Confirmed] = useState(false)
  const [a4Confirmed, setA4Confirmed] = useState(false)
  const [submitPhase, setSubmitPhase] = useState('idle') // idle | reviewing | approved

  const units = megaSale ? MEGA_SALE_UNITS : NORMAL_UNITS
  const params = megaSale ? PRICING_PARAMS.megaSale : PRICING_PARAMS.normal

  const pricing = useMemo(
    () => computeAvailableValue({ units, params, lockedByOthers: 0 }),
    [units, params]
  )

  const unitRows = units.map((u) => {
    const breakdown = pricing.unitBreakdown.find((b) => b.code === u.code)
    return { ...u, ...breakdown }
  })

  const interestEstimate = computeAdvanceInterest(pricing.result, TECHCOMBANK_QUOTE.annualRate, INTEREST_DAYS)

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

  return (
    <>
      {step === 'a' && (
        <TechcombankStep
          heading="Yêu cầu cấp quyền đánh giá tín dụng"
          subheading="Vui lòng xem lại phạm vi trước khi quyết định."
          confirmed={a2Confirmed}
          setConfirmed={setA2Confirmed}
          confirmLabel="Tôi đã đọc và đồng ý cấp quyền cho mục đích trên"
          approveLabel="Đồng ý"
          onApprove={approveA2}
          onReject={rejectA2}
        >
          <div>
            <div className="text-base font-medium text-slate-500">Bên yêu cầu</div>
            <div className="text-slate-900">{LEGAL_NAME}</div>
            <div className="text-base text-slate-500">Mã TPP đã đăng ký: {TPP_CODE}</div>
          </div>

          <div>
            <div className="text-base font-medium text-slate-500">Mục đích</div>
            <div className="text-slate-900">{A2_CONSENT.purposeLabel}</div>
          </div>

          <div>
            <div className="mb-2 text-base font-medium text-slate-500">Phạm vi dữ liệu</div>
            <ul className="list-disc space-y-1 pl-5">
              {A2_CONSENT.dataScopes.map((scope) => (
                <li key={scope} className="text-slate-800">
                  {scope}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-slate-100 p-4 text-base text-slate-600">
            Quyền này KHÔNG cho phép: chuyển tiền, thay đổi thông tin tài khoản, xem mật khẩu hoặc mã OTP.
          </div>

          <div>
            <div className="text-base font-medium text-slate-500">Thời hạn</div>
            <div className="text-slate-900">{A2_CONSENT.durationDays} ngày</div>
          </div>

          <p className="text-base text-slate-500">{A2_CONSENT.independenceNote}</p>
        </TechcombankStep>
      )}

      {step === 'b' && (
        <ScreenShell screenNumber={5} title="Đề nghị ứng vốn — Xem ước tính">
          <EstimateStep
            unitRows={unitRows}
            pricing={pricing}
            interestEstimate={interestEstimate}
            onNext={() => setStep('c')}
          />
        </ScreenShell>
      )}

      {step === 'c' && (
        <TechcombankStep
          heading="Thỏa thuận chuyển giao quyền đòi nợ"
          subheading="Vui lòng đọc kỹ nội dung trước khi ký."
          confirmed={a4Confirmed}
          setConfirmed={setA4Confirmed}
          confirmLabel="Tôi đã đọc và đồng ý ký thỏa thuận chuyển giao quyền đòi nợ nêu trên"
          approveLabel="Ký thỏa thuận"
          onApprove={signA4}
        >
          <div>
            <div className="text-base font-medium text-slate-500">Nội dung thỏa thuận</div>
            <div className="text-slate-900">
              Chuyển giao quyền đòi nợ đối với{' '}
              {unitRows.map((u, i) => (
                <span key={u.code}>
                  {i > 0 && (i === unitRows.length - 1 ? ' và ' : ', ')}
                  {u.code} ({formatNumberVN(u.formulaValue)} triệu)
                </span>
              ))}{' '}
              làm tài sản bảo đảm cho khoản vay {formatNumberVN(pricing.result)} triệu của Techcombank.
            </div>
          </div>

          <div>
            <div className="text-base font-medium text-slate-500">Đăng ký biện pháp bảo đảm</div>
            <div className="text-slate-900">{A4_AGREEMENT.registrationNote}</div>
          </div>

          <div>
            <div className="text-base font-medium text-slate-500">Dòng tiền</div>
            <div className="text-slate-900">{A4_AGREEMENT.settlementNote}</div>
          </div>
        </TechcombankStep>
      )}

      {step === 'd' && (
        <ScreenShell screenNumber={5} title="Đề nghị ứng vốn — Gửi đề nghị">
          <SubmitStep
            pricing={pricing}
            submitPhase={submitPhase}
            onSubmit={() => setSubmitPhase('reviewing')}
            onNext={onNext}
          />
        </ScreenShell>
      )}
    </>
  )
}

// Khuôn trang mô phỏng Techcombank dùng chung cho bước 5a và 5c — cùng khuôn
// Bước 2b (docs/man-hinh.md): nền sáng, tách biệt hẳn với Nền tảng, dòng
// "Bạn đang ở trang của Techcombank", một ô xác nhận không tích sẵn.
function TechcombankStep({ heading, subheading, children, confirmed, setConfirmed, confirmLabel, approveLabel, onApprove, onReject }) {
  return (
    <div className="flex h-full flex-col bg-white text-slate-900">
      <header className="border-b border-slate-200 px-8 py-4">
        <div className="text-base font-medium text-slate-500">Bạn đang ở trang của Techcombank</div>
        <div className="mt-1 text-3xl font-bold text-slate-900">Techcombank</div>
      </header>

      <main className="flex flex-1 items-center justify-center px-8 py-10">
        <div className="w-full max-w-3xl rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h1 className="mb-1 text-3xl font-bold text-slate-900">{heading}</h1>
          {subheading && <p className="mb-6 text-lg text-slate-500">{subheading}</p>}

          <div className="space-y-4 text-lg">
            {children}

            <label className="flex items-start gap-3 text-base text-slate-800">
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
                className="flex-1 rounded-xl border border-slate-300 py-3 text-lg font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Từ chối
              </button>
            )}
            <button
              onClick={onApprove}
              disabled={!confirmed}
              className="flex-1 rounded-xl bg-slate-900 py-3 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300"
            >
              {approveLabel}
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 px-8 py-3 text-base text-slate-400">{FOOTER_NOTE}</footer>
    </div>
  )
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-base text-slate-400">{label}</span>
      <span className={`text-base font-medium ${highlight ? 'text-teal-300' : 'text-slate-100'}`}>{value}</span>
    </div>
  )
}

// Bước 5b — Bảng tính giá trị khả dụng, hiện TỪNG DÒNG (docs/du-lieu.md mục 4.2).
function EstimateStep({ unitRows, pricing, interestEstimate, onNext }) {
  return (
    <div className="space-y-6">
      <p className="text-lg text-slate-400">
        Giá trị khả dụng tính từ các đơn vị khoản phải thu đã xác thực, trước khi ký chuyển giao quyền đòi nợ.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {unitRows.map((u) => (
          <div key={u.code} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-white">{u.code}</div>
              <div className="text-base text-slate-400">Điểm xác thực {u.verificationScore}</div>
            </div>
            <div className="mt-2 divide-y divide-slate-800/60">
              <Row label="Giá trị ròng dự phóng" value={`${formatNumberVN(u.projectedNetValue)} triệu`} />
              <Row label="Tỷ lệ hoàn gia quyền" value={formatPercentVN(pricing.weightedReturnRate)} />
              <Row label="Biên an toàn" value={formatPercentVN(pricing.safetyMargin)} />
              <Row label="Chiết khấu xác thực" value={formatPercentVN(u.verificationDiscount)} />
              <Row label="Tỷ lệ ứng" value={formatPercentVN(u.advanceRate)} highlight />
              <Row label="Giá trị theo công thức" value={`${formatNumberVN(u.formulaValue)} triệu`} highlight />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="mb-1 text-xl font-semibold text-slate-200">Tổng hợp</div>
        <div className="divide-y divide-slate-800/60">
          <Row label="Tổng giá trị theo công thức" value={`${formatNumberVN(pricing.formulaValueTotal)} triệu`} />
          <Row label="Trần dư nợ" value={`${formatNumberVN(pricing.debtCap)} triệu`} />
          <Row label="Phần đã bị bên khác khóa" value={`${formatNumberVN(pricing.lockedByOthers)} triệu`} />
        </div>

        {pricing.cappedByDebtCap && (
          <div className="mt-3 rounded-lg border border-amber-700/60 bg-amber-950/20 px-4 py-2.5 text-base font-semibold text-amber-300">
            Bị chặn bởi trần dư nợ
          </div>
        )}

        <div className="mt-4 flex items-center justify-between rounded-lg border border-teal-800/60 bg-teal-950/20 px-4 py-3.5">
          <span className="text-lg font-semibold text-teal-200">GIÁ TRỊ KHẢ DỤNG</span>
          <span className="text-3xl font-bold text-teal-100">{formatNumberVN(pricing.result)} triệu</span>
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="mb-1 text-xl font-semibold text-slate-200">Chi phí</div>
        <div className="divide-y divide-slate-800/60">
          <Row label="Bên cấp tín dụng" value="Techcombank" />
          <Row label="Lãi suất" value={`${formatPercentVN(TECHCOMBANK_QUOTE.annualRate)}/năm`} />
          <Row
            label={`Tiền lãi ước tính nếu tất toán sau ${INTEREST_DAYS} ngày`}
            value={`≈ ${formatNumberVN(interestEstimate)} triệu`}
          />
        </div>
      </div>

      <p className="text-lg font-semibold text-amber-300">{ESTIMATE_DISCLAIMER}</p>

      <button
        onClick={onNext}
        className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white transition hover:bg-blue-500"
      >
        Tiếp: Ký thỏa thuận A4 →
      </button>
    </div>
  )
}

// Bước 5d — Gửi đề nghị: hiệu ứng ngắn "đang thẩm định" rồi kết quả phê duyệt.
function SubmitStep({ pricing, submitPhase, onSubmit, onNext }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="text-base text-slate-400">Sẵn sàng gửi đề nghị ứng vốn</div>
        <div className="mt-1 text-4xl font-bold text-teal-200">{formatNumberVN(pricing.result)} triệu</div>
        <p className="mt-2 text-lg font-semibold text-amber-300">{ESTIMATE_DISCLAIMER}</p>
      </div>

      {submitPhase === 'idle' && (
        <button
          onClick={onSubmit}
          className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white transition hover:bg-blue-500"
        >
          Gửi đề nghị tới Techcombank
        </button>
      )}

      {submitPhase === 'reviewing' && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-lg text-slate-300">
          <span className="h-3 w-3 animate-pulse rounded-full bg-blue-500" />
          Techcombank đang thẩm định...
        </div>
      )}

      {submitPhase === 'approved' && (
        <>
          <div className="rounded-xl border border-teal-700/60 bg-teal-950/20 p-6 text-lg font-semibold text-teal-200">
            Techcombank đã phê duyệt và giải ngân {formatNumberVN(pricing.result)} triệu vào tài khoản của bạn.
          </div>
          <button
            onClick={onNext}
            className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white transition hover:bg-blue-500"
          >
            Tiếp →
          </button>
        </>
      )}
    </div>
  )
}
