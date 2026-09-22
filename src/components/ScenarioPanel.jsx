import { useScenario } from '../state/scenarioState.jsx'

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
        <div className="fixed top-20 right-6 z-[70] rounded-full border border-orange-600 bg-orange-950/90 px-4 py-1.5 text-sm font-semibold text-orange-200 shadow-lg">
          {activeLabel}
        </div>
      )}

      <button
        onClick={togglePanel}
        aria-label="Bảng điều khiển kịch bản"
        className="fixed bottom-6 right-6 z-[80] flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-xl text-slate-300 shadow-lg transition hover:bg-slate-800"
      >
        ⚙
      </button>

      {panelOpen && (
        <div className="fixed bottom-24 right-6 z-[80] w-80 rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold text-slate-100">Bảng điều khiển kịch bản</div>
            <button onClick={closePanel} className="text-base text-slate-400 hover:text-slate-200">
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <ScenarioToggle label="Mega Sale" hint="Phím M" active={megaSale} onToggle={toggleMegaSale} />
            <ScenarioToggle label="Rò rỉ" hint="Phím L" active={leak} onToggle={toggleLeak} />
            <ScenarioToggle label="Giai đoạn 3" hint="Phím 3" active={phase3} onToggle={togglePhase3} />
          </div>

          <button
            onClick={onReset}
            className="mt-5 w-full rounded-lg border border-slate-600 py-2 text-base font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            Đặt lại (phím R)
          </button>
        </div>
      )}
    </>
  )
}

function ScenarioToggle({ label, hint, active, onToggle, locked = false }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2.5">
      <div>
        <div className={`text-base font-medium ${locked ? 'text-slate-500' : 'text-slate-200'}`}>{label}</div>
        <div className="text-sm text-slate-500">{hint}</div>
      </div>
      {locked ? (
        <span className="text-lg text-slate-600" aria-label="Đã khóa">
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
