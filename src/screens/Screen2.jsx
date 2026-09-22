import { useEffect, useState } from 'react'
import ScreenShell from '../components/ScreenShell.jsx'
import { usePermissions } from '../state/permissionState.jsx'
import { SOLUTION_NAME, FOOTER_NOTE, LENDER_QUOTES, A1_CONSENT, A1_TOKEN_TTL_SECONDS } from '../data/mockData.js'

const OTHER_BANKS = LENDER_QUOTES.map((l) => l.lender).filter((name) => name !== 'Techcombank')

// Bước 2c — hiệu ứng terminal luồng OAuth, tái sử dụng ý tưởng của bản cũ
// (docs/reference/settlesync_prototype.html), rút gọn đúng nội dung được yêu cầu:
// GET /authorize (PKCE) → xác thực → POST /token → access_token → quay về.
const TERMINAL_LINES = [
  { tone: 'text-sky-400', text: '→ GET /authorize?response_type=code&scope=AIS (PKCE)' },
  { tone: 'text-slate-600', text: '   code_challenge: sha256(verifier)' },
  { tone: 'text-amber-300', text: '⟳ Đang xác thực trên trang Techcombank...' },
  { tone: 'text-emerald-400', text: '✓ Xác thực thành công' },
  { tone: 'text-sky-400', text: '→ POST /token (authorization_code)' },
  { tone: 'text-emerald-400', text: `← access_token: eyJ... (${A1_TOKEN_TTL_SECONDS.toLocaleString('vi-VN')} giây)` },
  { tone: 'text-emerald-400', text: '← refresh_token: nhận thành công' },
  { tone: 'text-slate-500', text: '# Quay về Nền tảng...' },
]

export default function Screen2({ onGoToScreen }) {
  const { grantA1, reauthRequested, consumeReauthRequest } = usePermissions()
  const [step, setStep] = useState('a') // a | b | c | d
  const [terminalCount, setTerminalCount] = useState(0)
  const [historyDone, setHistoryDone] = useState(false)

  // Từ Màn 7, "Cấp lại" A1 điều hướng thẳng tới bước 2b thay vì bắt đầu lại từ 2a.
  useEffect(() => {
    if (!reauthRequested) return
    setStep('b')
    consumeReauthRequest()
  }, [reauthRequested, consumeReauthRequest])

  function selectBank(name) {
    if (name !== 'Techcombank') return
    setStep('b')
  }

  function approve() {
    setTerminalCount(0)
    setStep('c')
  }

  function reject() {
    setStep('a')
  }

  useEffect(() => {
    if (step !== 'c') return
    if (terminalCount >= TERMINAL_LINES.length) {
      grantA1()
      const timer = setTimeout(() => setStep('d'), 600)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => setTerminalCount((c) => c + 1), 480)
    return () => clearTimeout(timer)
  }, [step, terminalCount, grantA1])

  useEffect(() => {
    if (step !== 'd') return
    setHistoryDone(false)
    const timer = setTimeout(() => setHistoryDone(true), 1400)
    return () => clearTimeout(timer)
  }, [step])

  if (step === 'b') {
    return <TechcombankConsentPage onApprove={approve} onReject={reject} />
  }

  return (
    <ScreenShell screenNumber={2} title="Cấp quyền A1">
      {step === 'a' && <BankPicker onSelect={selectBank} />}
      {step === 'c' && <TerminalFlow lines={TERMINAL_LINES.slice(0, terminalCount)} />}
      {step === 'd' && <HistoryLoading done={historyDone} onGoToScreen={onGoToScreen} />}
    </ScreenShell>
  )
}

function BankPicker({ onSelect }) {
  return (
    <div className="space-y-6">
      <p className="text-lg text-slate-400">
        Chọn ngân hàng nơi bạn nhận tiền để cấp quyền đối soát dòng tiền (A1).
      </p>
      <div className="space-y-3">
        <button
          onClick={() => onSelect('Techcombank')}
          className="w-full rounded-xl border border-blue-600 bg-blue-950/40 p-5 text-left transition hover:bg-blue-900/40"
        >
          <div className="text-xl font-semibold text-white">Techcombank</div>
          <div className="mt-1 text-base text-blue-300">Tài khoản thanh toán hiện tại — bấm để kết nối</div>
        </button>
        {OTHER_BANKS.map((name) => (
          <div
            key={name}
            className="w-full cursor-not-allowed rounded-xl border border-slate-800 bg-slate-900/40 p-5 opacity-50"
          >
            <div className="text-xl font-semibold text-slate-300">{name}</div>
            <div className="mt-1 text-base text-slate-500">Đang kết nối</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Bước 2b — trang mô phỏng Techcombank: nền sáng, bố cục riêng, tách biệt hẳn
// với giao diện tối của Nền tảng (docs/quy-tac.md mục 3). Không dùng ScreenShell.
// Cỡ chữ theo CLAUDE.md: nhãn/chữ phụ tối thiểu 16px (text-base), tiêu đề tối
// thiểu 24px (text-2xl); thẻ rộng ~40% màn hình 1920px (max-w-3xl = 768px).
function TechcombankConsentPage({ onApprove, onReject }) {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <header className="border-b border-slate-200 px-8 py-4">
        <div className="text-base font-medium text-slate-500">Bạn đang ở trang của Techcombank</div>
        <div className="mt-1 text-3xl font-bold text-slate-900">Techcombank</div>
      </header>

      <main className="flex flex-1 items-center justify-center px-8 py-10">
        <div className="w-full max-w-3xl rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h1 className="mb-1 text-3xl font-bold text-slate-900">Yêu cầu cấp quyền truy cập dữ liệu</h1>
          <p className="mb-6 text-lg text-slate-500">Vui lòng xem lại phạm vi trước khi quyết định.</p>

          <div className="space-y-4 text-lg">
            <div>
              <div className="text-base font-medium text-slate-500">Bên yêu cầu</div>
              <div className="text-slate-900">Công ty {SOLUTION_NAME}</div>
              <div className="text-base text-slate-500">Mã TPP đã đăng ký: {A1_CONSENT.registeredTppId}</div>
            </div>

            <div>
              <div className="text-base font-medium text-slate-500">Mục đích</div>
              <div className="text-slate-900">{A1_CONSENT.purposeLabel}</div>
            </div>

            <div>
              <div className="mb-2 text-base font-medium text-slate-500">Phạm vi dữ liệu</div>
              <ul className="list-disc space-y-1 pl-5">
                {A1_CONSENT.dataScopes.map((scope) => (
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
              <div className="text-slate-900">
                {A1_CONSENT.durationDays} ngày — {A1_CONSENT.renewalNote}
              </div>
            </div>

            <p className="text-base text-slate-500">
              Bạn có thể rút lại quyền này bất cứ lúc nào trong ứng dụng Techcombank hoặc tại mục Quyền của tôi.
            </p>

            <label className="flex items-start gap-3 text-base text-slate-800">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-slate-300"
              />
              <span>Tôi đã đọc và đồng ý cấp quyền cho mục đích trên</span>
            </label>
          </div>

          <div className="mt-8 flex gap-3">
            <button
              onClick={onReject}
              className="flex-1 rounded-xl border border-slate-300 py-3 text-lg font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Từ chối
            </button>
            <button
              onClick={onApprove}
              disabled={!confirmed}
              className="flex-1 rounded-xl bg-slate-900 py-3 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300"
            >
              Đồng ý
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 px-8 py-3 text-base text-slate-400">{FOOTER_NOTE}</footer>
    </div>
  )
}

function TerminalFlow({ lines }) {
  return (
    <div className="space-y-6">
      <p className="text-lg text-slate-400">Techcombank đang xác nhận và cấp quyền truy cập...</p>
      <div className="min-h-[220px] rounded-xl border border-slate-800 bg-slate-950 p-5">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="ml-2 font-mono text-base text-slate-600">Luồng OAuth — Open API</span>
        </div>
        <div className="space-y-1 font-mono text-base">
          {lines.length === 0 && <div className="text-slate-600"># Đang khởi tạo phiên xác thực...</div>}
          {lines.map((line, i) => (
            <div key={i} className={line.tone}>
              {line.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HistoryLoading({ done, onGoToScreen }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        {!done ? (
          <div className="flex items-center gap-3 text-lg text-slate-300">
            <span className="h-3 w-3 animate-pulse rounded-full bg-blue-500" />
            Đang tải {A1_CONSENT.durationDays} ngày lịch sử...
          </div>
        ) : (
          <div className="flex items-center gap-3 text-lg font-semibold text-emerald-400">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            Hoàn tất
          </div>
        )}
      </div>

      {done && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onGoToScreen(7)}
            className="rounded-xl border border-slate-700 bg-slate-800 py-3 text-lg font-semibold text-slate-100 transition hover:bg-slate-700"
          >
            Xem quyền của tôi →
          </button>
          <button
            onClick={() => onGoToScreen(3)}
            className="rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white transition hover:bg-blue-500"
          >
            Xem đối soát →
          </button>
        </div>
      )}
    </div>
  )
}
