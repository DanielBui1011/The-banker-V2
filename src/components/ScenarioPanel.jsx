import { useScenario } from '../state/scenarioState.jsx'
import KeyHint from './ui/KeyHint.jsx'

const DARK_KEY_HINT = 'border-slate-600 bg-slate-800 text-slate-200'

// Bảng điều khiển kịch bản — nút tròn góc dưới phải, mặc định ẩn; bấm để mở/đóng.
// Nhãn kịch bản đang bật hiện ở góc trên phải, trên mọi màn (mount một lần ở App).

export default function ScenarioPanel({ onReset }) {
  const { megaSale, toggleMegaSale, leak, toggleLeak, phase3, togglePhase3, panelOpen, togglePanel, closePanel } =
    useScenario()

  const activeLabel = megaSale
    ? 'Kịch bản: Mega Sale'
    : leak
      ? 'Kịch bản: Rò rỉ'
      : phase3
        ? 'Kịch bản: Giai đoạn 3 — minh họa tầm nhìn'
        : null

  return (
    <>
      {activeLabel && (
        <div className="fixed top-20 right-6 z-[70] rounded-full border border-slate-600 bg-slate-900/90 px-4 py-1.5 text-label font-semibold text-slate-100 shadow-lg">
          {activeLabel}
        </div>
      )}

      <button
        onClick={togglePanel}
        aria-label="Bảng điều khiển kịch bản"
        className="fixed bottom-6 right-6 z-[80] flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-emphasis text-slate-300 shadow-lg transition hover:bg-slate-800"
      >
        ⚙
      </button>

      {panelOpen && (
        <div className="fixed bottom-24 right-6 z-[80] w-80 rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-emphasis font-semibold text-slate-100">Bảng điều khiển kịch bản</div>
            <button onClick={closePanel} className="text-body text-slate-400 hover:text-slate-200">
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <ScenarioToggle label="Mega Sale" hintKey="M" active={megaSale} onToggle={toggleMegaSale} />
            <ScenarioToggle label="Rò rỉ" hintKey="L" active={leak} onToggle={toggleLeak} />
            <ScenarioToggle label="Giai đoạn 3" hintKey="3" active={phase3} onToggle={togglePhase3} />
          </div>

          <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-body text-slate-400">
            <div className="font-semibold text-slate-300 mb-1">Phím tắt khác</div>
            <div className="flex items-center justify-between"><span>Tiến dòng thời gian (Màn 6)</span><KeyHint label="Space" className={DARK_KEY_HINT} /></div>
            <div className="mt-1 flex items-center justify-between"><span>Gửi lại lệnh khóa (Màn 5/8)</span><KeyHint label="D" className={DARK_KEY_HINT} /></div>
            <div className="mt-1 flex items-center justify-between"><span>Xem bảng phím đầy đủ</span><KeyHint label="?" className={DARK_KEY_HINT} /></div>
          </div>

          <button
            onClick={onReset}
            className="mt-3 w-full rounded-lg border border-slate-600 py-2 text-body font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            Đặt lại (phím R)
          </button>
        </div>
      )}
    </>
  )
}

function ScenarioToggle({ label, hintKey, active, onToggle, locked = false }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className={`text-body font-medium ${locked ? 'text-slate-500' : 'text-slate-200'}`}>{label}</div>
        <KeyHint label={hintKey} className={DARK_KEY_HINT} />
      </div>
      {locked ? (
        <span className="text-emphasis text-slate-600" aria-label="Đã khóa">
          🔒
        </span>
      ) : (
        <button
          onClick={onToggle}
          aria-pressed={active}
          className={`h-7 w-12 rounded-full transition ${active ? 'bg-teal-600' : 'bg-slate-700'}`}
        >
          <span
            className={`block h-6 w-6 rounded-full bg-white shadow transition ${
              active ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      )}
    </div>
  )
}
