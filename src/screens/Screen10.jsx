import { useEffect, useState } from 'react'
import TopBar from '../components/ui/TopBar.jsx'
import ActProgress from '../components/ui/ActProgress.jsx'
import SurfaceFrame from '../components/ui/SurfaceFrame.jsx'
import Card from '../components/ui/Card.jsx'
import Money from '../components/ui/Money.jsx'
import LayerTag from '../components/ui/LayerTag.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import { actForScreen } from '../config/flow.js'
import { usePermissions } from '../state/permissionState.jsx'
import { useScenario } from '../state/scenarioState.jsx'
import { FOOTER_NOTE, RECEIVABLE_UNITS, LENDER_QUOTES, LOCK_CERTIFICATE, A4_AGREEMENT } from '../data/mockData.js'
import { computeQuoteComparison } from '../logic/pricing.js'
import { formatNumberVN, formatPercentVN } from '../utils/format.js'

const UNITS = RECEIVABLE_UNITS.filter((u) => u.code === 'RU-03' || u.code === 'RU-04')
const LENDER_NAMES = LENDER_QUOTES.map((q) => q.lender)
const INITIAL_RECIPIENTS = Object.fromEntries(LENDER_NAMES.map((name) => [name, false]))
const INTEREST_DAYS = 5
// So sánh chi phí trên cùng một khoản vay (LENDER_QUOTES['Techcombank'].value = 85,
// khớp T1 mục 4.2) và cùng số ngày — không viết cứng, lấy từ chào giá Techcombank.
const COMPARISON_PRINCIPAL = LENDER_QUOTES.find((q) => q.lender === 'Techcombank').value
const QUOTE_DISCLAIMER = 'Mỗi bên cho vay tự thẩm định và tự giải ngân; Nền tảng chỉ chuyển yêu cầu và chào giá.'

// Vòng 7C — Màn 10 (chỉ hiện khi phím 3 bật) dựng bằng component chung.
export default function Screen10({ onGoToScreen }) {
  const { openPeek } = usePermissions()
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

  // Bảng so sánh chỉ gồm bên khách hàng đã chọn — không liệt kê bên chưa chọn
  // (docs/man-hinh.md Màn 10, bước 10b). Chi phí ước tính tính trên cùng khoản
  // vay và cùng số ngày để so sánh công bằng (quy-tac.md mục 4).
  const selectedQuotes = LENDER_QUOTES.filter((q) => selectedNames.includes(q.lender)).sort(
    (a, b) => a.annualRate - b.annualRate
  )
  const quotes = computeQuoteComparison(selectedQuotes, COMPARISON_PRINCIPAL, INTEREST_DAYS)

  function selectQuote(quote) {
    setSelectedQuote(quote)
    setConfirmed(false)
    setStep('sign')
  }

  if (step === 'sign' && selectedQuote) {
    return <LenderSignPage quote={selectedQuote} confirmed={confirmed} setConfirmed={setConfirmed} onConfirm={() => setStep('cert')} />
  }

  return (
    <div className="flex h-full flex-col">
      <TopBar screenNumber={10} onOpenPeek={() => openPeek(10)} />
      <SurfaceFrame variant="platform">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 px-12 pb-3 pt-3">
            <ActProgress currentAct={actForScreen(10)} tone="light" />
          </div>

          <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-12 py-10">
            <div className="mx-auto w-full max-w-[1536px] space-y-6">
              <div className="flex items-center gap-3">
                <h1 className="text-screen-title font-bold text-slate-900">Giai đoạn 3 — Nhiều bên chào giá</h1>
                <LayerTag layer={3} />
              </div>

              {step === 'a' && (
                <RequestStep recipients={recipients} toggleRecipient={toggleRecipient} canSubmit={canSubmit} onSubmit={() => setStep('b')} />
              )}
              {step === 'b' && <QuotesStep quotes={quotes} onSelect={selectQuote} />}
              {step === 'cert' && selectedQuote && <CertificateStep quote={selectedQuote} onBack={() => onGoToScreen?.(8)} />}
            </div>
          </main>

          <footer className="border-t border-slate-200 px-12 py-3 text-label text-slate-500">{FOOTER_NOTE}</footer>
        </div>
      </SurfaceFrame>
    </div>
  )
}

// Bước 10a — gửi yêu cầu báo giá, chọn bên nhận dữ liệu doanh thu đã xác thực.
function RequestStep({ recipients, toggleRecipient, canSubmit, onSubmit }) {
  return (
    <div className="space-y-6">
      <p className="text-body text-slate-600">
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
          <label key={name} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-body text-slate-900 shadow-sm">
            <input
              type="checkbox"
              checked={recipients[name]}
              onChange={() => toggleRecipient(name)}
              className="h-5 w-5 rounded border-slate-300"
            />
            {name}
          </label>
        ))}
      </div>

      <p className="text-label text-slate-500">Chỉ các bên bạn chọn nhận được dữ liệu cho yêu cầu này.</p>

      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        className="w-full rounded-xl bg-navy py-4 text-emphasis font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Gửi yêu cầu báo giá
      </button>
    </div>
  )
}

// Bước 10b — chào giá chỉ từ các bên đã chọn, sắp theo lãi suất tăng dần.
// KHÔNG gắn nhãn "khuyên dùng" hay bất kỳ nhãn thiên vị nào (docs/man-hinh.md).
function QuotesStep({ quotes, onSelect }) {
  return (
    <div className="space-y-6">
      <p className="text-body text-slate-600">{QUOTE_DISCLAIMER}</p>

      <DataTable
        columns={[
          { key: 'lender', header: 'Bên cho vay' },
          { key: 'value', header: 'Giá trị', align: 'right', render: (q) => `${formatNumberVN(q.value)} triệu` },
          { key: 'annualRate', header: 'Lãi suất/năm', align: 'right', render: (q) => formatPercentVN(q.annualRate) },
          {
            key: 'estimatedCost',
            header: `Chi phí ước tính (${formatNumberVN(COMPARISON_PRINCIPAL)} triệu, ${INTEREST_DAYS} ngày)`,
            align: 'right',
            render: (q) => `${formatNumberVN(q.estimatedCost)} triệu`,
          },
          { key: 'term', header: 'Hạn hiệu lực chào giá' },
          { key: 'action', header: '', render: (q) => <SelectButton onClick={() => onSelect(q)} /> },
        ]}
        rows={quotes}
        rowKey={(q) => q.lender}
      />
    </div>
  )
}

function SelectButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border border-teal-600 bg-teal-50 px-3 py-1.5 text-label font-semibold text-teal-700 transition hover:bg-teal-100"
    >
      Chọn →
    </button>
  )
}

// Trang ký thỏa thuận chuyển giao quyền đòi nợ — SurfaceFrame kiểu bank,
// bankName động theo chào giá đã chọn.
function LenderSignPage({ quote, confirmed, setConfirmed, onConfirm }) {
  return (
    <SurfaceFrame variant="bank" bankName={quote.lender}>
      <div className="flex h-full flex-col">
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-8 pt-8 pb-24">
          <Card padding="p-8" className="mx-auto w-full max-w-3xl">
            <h1 className="mb-1 text-section-title font-bold text-slate-900">Thỏa thuận chuyển giao quyền đòi nợ</h1>
            <p className="mb-6 text-body text-slate-600">Vui lòng đọc kỹ nội dung trước khi ký.</p>

            <div className="space-y-4 text-body">
              <div>
                <div className="text-label font-medium text-slate-500">Nội dung thỏa thuận</div>
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
                <div className="text-label font-medium text-slate-500">Đăng ký biện pháp bảo đảm</div>
                <div className="text-slate-900">{A4_AGREEMENT.registrationNote}</div>
              </div>

              <div>
                <div className="text-label font-medium text-slate-500">Dòng tiền</div>
                <div className="text-slate-900">Tiền sàn về tài khoản {quote.lender} dùng để trả khoản vay.</div>
              </div>

              <label className="flex items-start gap-3 text-label text-slate-800">
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
              className="mt-8 w-full rounded-xl bg-slate-900 py-3 text-emphasis font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
            >
              Ký thỏa thuận
            </button>
          </Card>
        </main>
        <footer className="border-t border-slate-200 px-8 py-3 text-label text-slate-500">{FOOTER_NOTE}</footer>
      </div>
    </SurfaceFrame>
  )
}

// Bước 10c — chứng thư khóa theo docs/du-lieu.md mục 12, chỉ đổi "Bên nhận bảo đảm".
function CertificateStep({ quote, onBack }) {
  return (
    <div className="space-y-6">
      <Card className="border-violet-600 bg-violet-50">
        <div className="text-emphasis font-semibold text-violet-900">Chứng thư khóa</div>
        <div className="mt-3 divide-y divide-violet-100">
          <CertRow label="Mã chứng thư" value={LOCK_CERTIFICATE.certificateId} />
          <CertRow label="Đơn vị" value={LOCK_CERTIFICATE.units.join(', ')} />
          <CertRow label="Bên nhận bảo đảm" value={quote.lender} />
          <CertRow label="Thứ tự ưu tiên" value={`#${LOCK_CERTIFICATE.priority}`} />
          <CertRow label="Thời điểm khóa" value={LOCK_CERTIFICATE.lockedAt} />
          <CertRow label="Mã đăng ký bảo đảm" value={LOCK_CERTIFICATE.registrationId} />
          <CertRow label="Ký số" value={LOCK_CERTIFICATE.signature} />
        </div>
      </Card>

      <button
        onClick={onBack}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-label font-medium text-slate-700 transition hover:bg-slate-50"
      >
        ← Quay lại Màn 8
      </button>
    </div>
  )
}

function CertRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-label">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  )
}
