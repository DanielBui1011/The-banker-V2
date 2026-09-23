import { useEffect, useState } from 'react'
import TopBar from '../components/ui/TopBar.jsx'
import ActProgress from '../components/ui/ActProgress.jsx'
import SurfaceFrame from '../components/ui/SurfaceFrame.jsx'
import Card from '../components/ui/Card.jsx'
import Stepper from '../components/ui/Stepper.jsx'
import Button from '../components/ui/Button.jsx'
import Stat from '../components/ui/Stat.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import Callout from '../components/ui/Callout.jsx'
import ConsentPage from '../components/ui/ConsentPage.jsx'
import { actForScreen } from '../config/flow.js'
import { usePermissions } from '../state/permissionState.jsx'
import {
  FOOTER_NOTE,
  AIS_OTHER_BANKS,
  A1_CONSENT,
  A1_TOKEN_TTL_SECONDS,
  SELLER_PROFILE,
  BANK_TRANSACTIONS,
} from '../data/mockData.js'
import { summarizeTransactions } from '../logic/reconciliation.js'
import { LEGAL_NAME, TPP_CODE } from '../config/brand.js'
import { formatDateVN } from '../utils/format.js'

const OTHER_BANKS = AIS_OTHER_BANKS

// Khớp thử 7 ngày (Bước 2d, man-hinh.md) — 7 ngày đầu của lô giao dịch mẫu
// (01–10/09/2027, du-lieu.md mục 5), tính trực tiếp từ BANK_TRANSACTIONS.
const TRIAL_WINDOW_END_DATE = '2027-09-07'
const TRIAL_MATCH_TRANSACTIONS = BANK_TRANSACTIONS.filter((tx) => tx.date <= TRIAL_WINDOW_END_DATE)

// Luồng 2a→2d — nhãn Stepper hiển thị xuyên suốt cả khi đang ở trang Techcombank (2b).
const FLOW_STEPS = ['Chọn ngân hàng', 'Xem yêu cầu quyền', 'Xác thực', 'Hoàn tất']
const FLOW_STEP_NUMBER = { a: 1, b: 2, c: 3, d: 4 }

// Che token: chỉ hiện 8 ký tự đầu + "••••" — không bao giờ hiện token đầy đủ
// (CLAUDE.md, docs/quy-tac.md). Chuỗi mẫu chỉ để minh họa, không phải token thật.
function maskToken(sample) {
  return `${sample.slice(0, 8)}••••`
}

const SAMPLE_ACCESS_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9'
const SAMPLE_REFRESH_TOKEN = 'rt_9f3a7c2e1b8d4056a1f0c3e9'

// Bước 2c — hiệu ứng terminal luồng OAuth, tái sử dụng ý tưởng của bản cũ
// (docs/reference/settlesync_prototype.html), rút gọn đúng nội dung được yêu cầu:
// GET /authorize (PKCE, scope=AIS) → mã ủy quyền → access_token + refresh_token → quay về.
// Vòng 9: chỉ 3 trường làm nổi (scope=AIS, thời hạn token, refresh_token) — các
// trường còn lại mờ đi để người xem không phải đọc hết cả khối kỹ thuật.
const TERMINAL_LINES = [
  { kind: 'authorize' },
  { kind: 'dim', text: '   code_challenge: sha256(verifier)' },
  { kind: 'dim', text: '⟳ Đang xác thực trên trang Techcombank...' },
  { kind: 'dim', text: '✓ Nhận mã ủy quyền (authorization code)' },
  { kind: 'dim', text: '→ POST /token (authorization_code)' },
  { kind: 'accessToken' },
  { kind: 'refreshToken' },
  { kind: 'dim', text: '# Quay về Nền tảng...' },
]

const HISTORY_STEPS = ['Tài khoản', '90 ngày giao dịch', 'Khớp thử 7 ngày']
const HISTORY_STEP_DELAY_MS = 500 // 3 bước × 500ms = 1500ms, đúng trần 1,5s (CLAUDE.md, man-hinh.md)

export default function Screen2({ onGoToScreen }) {
  const { grantA1, reauthRequested, consumeReauthRequest, openPeek } = usePermissions()
  const [step, setStep] = useState('a') // a | b | c | d
  const [terminalCount, setTerminalCount] = useState(0)
  const [historyStep, setHistoryStep] = useState(0)

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
    setHistoryStep(0)
    const timer = setInterval(() => {
      setHistoryStep((s) => (s >= HISTORY_STEPS.length ? s : s + 1))
    }, HISTORY_STEP_DELAY_MS)
    return () => clearInterval(timer)
  }, [step])

  // Bỏ qua hiệu ứng bước 2d bằng phím mũi tên hoặc Space (man-hinh.md).
  useEffect(() => {
    if (step !== 'd') return
    function handleSkip(event) {
      if (['ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault()
        setHistoryStep(HISTORY_STEPS.length)
      }
    }
    window.addEventListener('keydown', handleSkip)
    return () => window.removeEventListener('keydown', handleSkip)
  }, [step])

  if (step === 'b') {
    return (
      <ConsentPage
        steps={FLOW_STEPS}
        currentStep={FLOW_STEP_NUMBER.b}
        heading="Yêu cầu cấp quyền truy cập dữ liệu"
        subheading="Vui lòng xem lại phạm vi trước khi quyết định."
        requesterName={LEGAL_NAME}
        requesterCode={TPP_CODE}
        purpose={A1_CONSENT.purposeLabel}
        scopeItems={A1_CONSENT.dataScopes}
        recipient={A1_CONSENT.dataRecipient}
        duration={`${A1_CONSENT.durationDays} ngày — ${A1_CONSENT.renewalNote}`}
        notAllowedText="Quyền này KHÔNG cho phép: chuyển tiền, thay đổi thông tin tài khoản, xem mật khẩu hoặc mã OTP."
        withdrawalText="Bạn có thể rút lại quyền này bất cứ lúc nào trong ứng dụng Techcombank hoặc tại mục Quyền của tôi."
        confirmLabel="Tôi đã đọc và đồng ý cấp quyền cho mục đích trên"
        approveLabel="Đồng ý cấp quyền"
        onApprove={approve}
        onReject={reject}
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      <TopBar screenNumber={2} onOpenPeek={() => openPeek(2)} />
      <div className="min-h-0 flex-1">
        <SurfaceFrame variant={step === 'c' ? 'tech' : 'platform'}>
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200/20 px-12 pb-3 pt-3">
              <ActProgress currentAct={actForScreen(2)} tone={step === 'c' ? 'dark' : 'light'} />
            </div>
            <main className="flex-1 overflow-y-auto px-12 pt-10 pb-24">
              <div className="mx-auto max-w-[1536px] space-y-6">
                <h1 className={`text-screen-title font-bold ${step === 'c' ? 'text-slate-50' : 'text-slate-900'}`}>
                  Cấp quyền A1
                </h1>
                <Stepper steps={FLOW_STEPS} currentStep={step === 'd' ? FLOW_STEPS.length + 1 : FLOW_STEP_NUMBER[step]} tone={step === 'c' ? 'dark' : 'light'} />
                {step === 'a' && <BankPicker onSelect={selectBank} />}
                {step === 'c' && <TerminalFlow lines={TERMINAL_LINES.slice(0, terminalCount)} />}
                {step === 'd' && (
                  <HistoryLoading step={historyStep} onGoToScreen={onGoToScreen} />
                )}
              </div>
            </main>
            <footer className={`border-t px-12 py-3 text-label ${step === 'c' ? 'border-slate-800 text-slate-50' : 'border-slate-200 text-slate-600'}`}>
              {FOOTER_NOTE}
            </footer>
          </div>
        </SurfaceFrame>
      </div>
    </div>
  )
}

// Giai đoạn 2, sau mốc Thông tư 64 (01/3/2027): ngân hàng khác đã kết nối được qua
// Open API — không còn hiện trạng thái mờ "Đang kết nối". Bấm vào ngân hàng khác
// chỉ hiện chú thích tại chỗ, không đổi luồng (tiền sàn của chị Lan về Techcombank).
function BankPicker({ onSelect }) {
  const [notedBank, setNotedBank] = useState(null)

  return (
    <div className="max-w-xl space-y-6">
      <p className="text-body text-slate-600">
        Chọn ngân hàng nơi bạn nhận tiền để cấp quyền đối soát dòng tiền (A1).
      </p>
      <div className="space-y-3">
        <button onClick={() => onSelect('Techcombank')} className="block w-full text-left">
          <Card className="border-navy transition hover:bg-slate-50">
            <div className="text-emphasis font-semibold text-slate-900">Techcombank</div>
            <div className="mt-1 text-label text-slate-600">
              Tài khoản nhận tiền sàn của {SELLER_PROFILE.ownerName}
            </div>
          </Card>
        </button>
        {OTHER_BANKS.map((name) => (
          <button
            key={name}
            onClick={() => setNotedBank(name)}
            className="block w-full text-left"
          >
            <Card className="transition hover:bg-slate-50">
              <div className="text-emphasis font-semibold text-slate-900">{name}</div>
              <div className="mt-1 text-label text-slate-600">Hỗ trợ kết nối qua Open API</div>
            </Card>
          </button>
        ))}
      </div>
      {notedBank && (
        <Callout variant="info">
          Tiền sàn của {SELLER_PROFILE.ownerName} về Techcombank — demo đi theo tài khoản này, không theo {notedBank}.
        </Callout>
      )}
    </div>
  )
}

// Căn giữa theo chiều dọc trong phần nội dung còn lại — tránh mảng đen trống lớn
// phía dưới khối terminal (Vòng 13). Chữ trong terminal dùng text-body (20px, nằm
// trong khoảng khuyến nghị 18–20px), trên mức tối thiểu text-label (16px).
function TerminalFlow({ lines }) {
  return (
    <div className="flex min-h-[60vh] flex-col justify-center space-y-6">
      <p className="text-body text-slate-50">Techcombank đang xác nhận và cấp quyền truy cập...</p>
      <div className="min-h-[360px] rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="ml-2 font-mono text-label text-slate-50">Luồng OAuth — Open API</span>
        </div>
        <div className="space-y-2.5 font-mono text-body">
          {lines.length === 0 && <div className="text-slate-50"># Đang khởi tạo phiên xác thực...</div>}
          {lines.map((line, i) => (
            <div key={i}>
              <TerminalLine line={line} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Một dòng terminal — chỉ scope=AIS, thời hạn token và refresh_token được làm nổi
// (khung màu sáng); các trường còn lại dùng chung chữ sáng text-slate-50 (Vòng 16: không làm mờ chữ nội dung).
function TerminalLine({ line }) {
  if (line.kind === 'authorize') {
    return (
      <div className="text-slate-50">
        {'→ GET /authorize?response_type=code&'}
        <span className="rounded border border-sky-400 bg-sky-950/60 px-1.5 py-0.5 font-semibold text-sky-300">
          scope=AIS
        </span>
        {' (PKCE)'}
      </div>
    )
  }
  if (line.kind === 'accessToken') {
    return (
      <div className="text-slate-50">
        {`← access_token: ${maskToken(SAMPLE_ACCESS_TOKEN)}  hạn `}
        <span className="rounded border border-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 font-semibold text-emerald-300">
          {`${A1_TOKEN_TTL_SECONDS.toLocaleString('vi-VN')} giây`}
        </span>
      </div>
    )
  }
  if (line.kind === 'refreshToken') {
    return (
      <div>
        <span className="text-slate-50">{'← '}</span>
        <span className="rounded border border-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 font-semibold text-emerald-300">
          {`refresh_token: ${maskToken(SAMPLE_REFRESH_TOKEN)}`}
        </span>
      </div>
    )
  }
  return <div className="text-slate-50">{line.text}</div>
}

// Bước 2d — Stepper phía trên đã ở trạng thái xong cả 4 bước. Hai chỉ số lớn tính từ
// BANK_TRANSACTIONS (lô mẫu 01–10/09, du-lieu.md mục 5; du-lieu.md không có số
// giao dịch 90 ngày nên nhãn nói đúng là "giao dịch mẫu"), hạn quyền A1 lấy từ
// permissions (du-lieu.md mục 8).
const SAMPLE_DATES = BANK_TRANSACTIONS.map((tx) => tx.date).sort()
const SAMPLE_RANGE = `${formatDateVN(SAMPLE_DATES[0])} – ${formatDateVN(SAMPLE_DATES[SAMPLE_DATES.length - 1])}`

function HistoryLoading({ step, onGoToScreen }) {
  const { permissions } = usePermissions()
  const done = step >= HISTORY_STEPS.length
  const trialSummary = summarizeTransactions(TRIAL_MATCH_TRANSACTIONS)
  const a1Expiry = permissions.find((p) => p.code === 'A1')?.expiryDate

  return (
    <div className="space-y-6">
      <Card>
        {done ? (
          <div className="space-y-5">
            <StatusBadge status="complete" />
            <div className="grid grid-cols-2 gap-8">
              <Stat
                large
                label="Giao dịch mẫu đã tải"
                value={`${BANK_TRANSACTIONS.length} giao dịch`}
                hint={SAMPLE_RANGE}
              />
              <Stat
                large
                label="Khớp thử 7 ngày"
                value={`${trialSummary.matchedCount}/${TRIAL_MATCH_TRANSACTIONS.length} tự động`}
                hint="Đối soát thử trên 7 ngày đầu của lô mẫu"
              />
            </div>
            <p className="border-t border-slate-200 pt-4 text-body text-slate-700">
              Quyền A1 hiệu lực đến {formatDateVN(a1Expiry)} — rút bất cứ lúc nào tại Quyền của tôi
            </p>
          </div>
        ) : (
          <span className="text-body text-slate-700">Đang tải {HISTORY_STEPS[step]}...</span>
        )}
      </Card>

      {done && (
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => onGoToScreen(3)}>
            Xem đối soát
          </Button>
          <Button onClick={() => onGoToScreen(7)}>Xem quyền của tôi →</Button>
        </div>
      )}
    </div>
  )
}
