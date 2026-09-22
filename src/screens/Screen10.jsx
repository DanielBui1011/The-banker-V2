import { useEffect, useState } from 'react'
import ScreenShell from '../components/ScreenShell.jsx'
import { useScenario } from '../state/scenarioState.jsx'
import { FOOTER_NOTE, RECEIVABLE_UNITS, LENDER_QUOTES, LOCK_CERTIFICATE, A4_AGREEMENT } from '../data/mockData.js'
import { computeAdvanceInterest } from '../logic/pricing.js'
import { formatNumberVN, formatPercentVN } from '../utils/format.js'

const UNITS = RECEIVABLE_UNITS.filter((u) => u.code === 'RU-03' || u.code === 'RU-04')
const LENDER_NAMES = LENDER_QUOTES.map((q) => q.lender)
const INITIAL_RECIPIENTS = Object.fromEntries(LENDER_NAMES.map((name) => [name, false]))
const INTEREST_DAYS = 5
const QUOTE_DISCLAIMER =
  'Mỗi bên cho vay tự thẩm định và tự giải ngân; Nền tảng chỉ chuyển yêu cầu và chào giá.'

export default function Screen10({ onGoToScreen }) {
  const { resetSignal } = useScenario()
  const [step, setStep] = useState('a') // a | b | sign | cert
  const [recipients, setRecipients] = useState(INITIAL_RECIPIENTS)
  const [confirmed, setConfirmed] = useState(false)
  const [selectedQuote, setSelectedQuote] = useState(null)

  // Phím R đặt lại Màn 10 về bước gửi yêu cầu, không giữ lựa chọn cũ.
  useEffect(() => {
    setStep('a')
    setRecipients(INITIAL_RECIPIENTS)
    setConfirmed(false)
    setSelectedQuote(null)
  }, [resetSignal])

  function toggleRecipient(name) {
    setRecipients((r) => ({ ...r, [name]: !r[name] }))
  }

  const selectedNames = Object.entries(recipients)
    .filter(([, checked]) => checked)
    .map(([name]) => name)
  const canSubmit = selectedNames.length > 0

  const quotes = LENDER_QUOTES.filter((q) => selectedNames.includes(q.lender)).sort(
    (a, b) => a.annualRate - b.annualRate
  )

  function selectQuote(quote) {
    setSelectedQuote(quote)
    setConfirmed(false)
    setStep('sign')
  }

  // Trang ký thỏa thuận dùng khuôn của trang cấp quyền Techcombank (Bước 2b) — nền sáng,
  // tách hẳn khỏi Nền tảng — chỉ đổi tên bên cho vay theo chào giá đã chọn.
  if (step === 'sign' && selectedQuote) {
    return (
      <LenderSignPage
        quote={selectedQuote}
        confirmed={confirmed}
        setConfirmed={setConfirmed}
        onConfirm={() => setStep('cert')}
      />
    )
  }

  return (
    <ScreenShell screenNumber={10} title="Giai đoạn 3 — Nhiều bên chào giá">
      {step === 'a' && (
        <RequestStep
          recipients={recipients}
          toggleRecipient={toggleRecipient}
          canSubmit={canSubmit}
          onSubmit={() => setStep('b')}
        />
      )}
      {step === 'b' && <QuotesStep quotes={quotes} onSelect={selectQuote} />}
      {step === 'cert' && selectedQuote && (
        <CertificateStep quote={selectedQuote} onBack={() => onGoToScreen?.(8)} />
      )}
    </ScreenShell>
  )
}

// Bước 10a — gửi yêu cầu báo giá, chọn bên nhận dữ liệu doanh thu đã xác thực.
function RequestStep({ recipients, toggleRecipient, canSubmit, onSubmit }) {
  return (
    <div className="space-y-6">
      <p className="text-lg text-slate-400">
        Gửi yêu cầu báo giá cho{' '}
        {UNITS.map((u, i) => (
          <span key={u.code}>
            {i > 0 && ' và '}
            {u.code} ({formatNumberVN(u.projectedNetValue)} triệu)
          </span>
        ))}
        .
      </p>

      <div className="space-y-3">
        {Object.keys(recipients).map((name) => (
          <label
            key={name}
            className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-lg text-slate-100"
          >
            <input
              type="checkbox"
              checked={recipients[name]}
              onChange={() => toggleRecipient(name)}
              className="h-5 w-5 rounded border-slate-600"
            />
            {name}
          </label>
        ))}
      </div>

      <p className="text-base text-slate-500">Chỉ các bên bạn chọn nhận được dữ liệu cho yêu cầu này.</p>

      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
      >
        Gửi yêu cầu báo giá
      </button>
    </div>
  )
}

// Bước 10b — chào giá chỉ từ các bên đã chọn, sắp theo lãi suất tăng dần.
function QuotesStep({ quotes, onSelect }) {
  return (
    <div className="space-y-6">
      <p className="text-lg text-slate-400">{QUOTE_DISCLAIMER}</p>

      <div className="space-y-4">
        {quotes.map((q) => {
          const interest = computeAdvanceInterest(q.value, q.annualRate, INTEREST_DAYS)
          return (
            <div key={q.lender} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xl font-semibold text-white">{q.lender}</div>
                <div className="text-2xl font-bold text-teal-200">{formatNumberVN(q.value)} triệu</div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-4 text-base text-slate-300">
                <div>Lãi suất: {formatPercentVN(q.annualRate)}/năm</div>
                <div>Kỳ hạn: {q.term}</div>
                <div>
                  Tiền lãi ước tính {INTEREST_DAYS} ngày: {formatNumberVN(interest)} triệu
                </div>
              </div>
              <button
                onClick={() => onSelect(q)}
                className="mt-4 w-full rounded-xl border border-teal-700 bg-teal-950/30 py-2.5 text-lg font-semibold text-teal-200 transition hover:bg-teal-900/40"
              >
                Chọn chào giá này →
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Trang ký thỏa thuận chuyển giao quyền đòi nợ — cùng khuôn trang 2b (Bước 2b: nền
// sáng, tách biệt hẳn với Nền tảng), chỉ đổi tên bên cho vay theo chào giá đã chọn.
function LenderSignPage({ quote, confirmed, setConfirmed, onConfirm }) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <header className="border-b border-slate-200 px-8 py-4">
        <div className="text-base font-medium text-slate-500">Bạn đang ở trang của {quote.lender}</div>
        <div className="mt-1 text-3xl font-bold text-slate-900">{quote.lender}</div>
      </header>

      <main className="flex flex-1 items-center justify-center px-8 py-10">
        <div className="w-full max-w-3xl rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h1 className="mb-1 text-3xl font-bold text-slate-900">Thỏa thuận chuyển giao quyền đòi nợ</h1>
          <p className="mb-6 text-lg text-slate-500">Vui lòng đọc kỹ nội dung trước khi ký.</p>

          <div className="space-y-4 text-lg">
            <div>
              <div className="text-base font-medium text-slate-500">Nội dung thỏa thuận</div>
              <div className="text-slate-900">
                Chuyển giao quyền đòi nợ đối với{' '}
                {UNITS.map((u, i) => (
                  <span key={u.code}>
                    {i > 0 && ' và '}
                    {u.code}
                  </span>
                ))}{' '}
                làm tài sản bảo đảm cho khoản vay {formatNumberVN(quote.value)} triệu của {quote.lender}.
              </div>
            </div>

            <div>
              <div className="text-base font-medium text-slate-500">Đăng ký biện pháp bảo đảm</div>
              <div className="text-slate-900">{A4_AGREEMENT.registrationNote}</div>
            </div>

            <div>
              <div className="text-base font-medium text-slate-500">Dòng tiền</div>
              <div className="text-slate-900">Tiền sàn về tài khoản {quote.lender} dùng để trả khoản vay.</div>
            </div>

            <label className="flex items-start gap-3 text-base text-slate-800">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-slate-300"
              />
              <span>Tôi đã đọc và đồng ý ký thỏa thuận chuyển giao quyền đòi nợ nêu trên</span>
            </label>
          </div>

          <button
            onClick={onConfirm}
            disabled={!confirmed}
            className="mt-8 w-full rounded-xl bg-slate-900 py-3 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300"
          >
            Ký thỏa thuận
          </button>
        </div>
      </main>

      <footer className="border-t border-slate-200 px-8 py-3 text-base text-slate-400">{FOOTER_NOTE}</footer>
    </div>
  )
}

// Bước 10c — chứng thư khóa theo docs/du-lieu.md mục 12, chỉ đổi "Bên nhận bảo đảm".
function CertificateStep({ quote, onBack }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-purple-800/60 bg-purple-950/20 p-6">
        <div className="text-lg font-semibold text-purple-200">Chứng thư khóa</div>
        <div className="mt-3 divide-y divide-slate-800/60">
          <CertRow label="Mã chứng thư" value={LOCK_CERTIFICATE.certificateId} />
          <CertRow label="Đơn vị" value={LOCK_CERTIFICATE.units.join(', ')} />
          <CertRow label="Bên nhận bảo đảm" value={quote.lender} />
          <CertRow label="Thứ tự ưu tiên" value={LOCK_CERTIFICATE.priority} />
          <CertRow label="Thời điểm khóa" value={LOCK_CERTIFICATE.lockedAt} />
          <CertRow label="Mã đăng ký bảo đảm" value={LOCK_CERTIFICATE.registrationId} />
          <CertRow label="Ký số" value={LOCK_CERTIFICATE.signature} />
        </div>
      </div>

      <button
        onClick={onBack}
        className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-base font-medium text-slate-300 hover:bg-slate-800"
      >
        ← Quay lại Màn 8
      </button>
    </div>
  )
}

function CertRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-base text-slate-400">{label}</span>
      <span className="text-base font-medium text-slate-100">{value}</span>
    </div>
  )
}
