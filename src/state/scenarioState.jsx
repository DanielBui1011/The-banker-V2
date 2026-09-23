import { useApp } from './appState.jsx'

// ADAPTER TẠM (Vòng 21, gỡ ở Vòng 24 — docs/ban-giao.md): giao diện cũ của useScenario()
// cho các màn cũ, đọc tình huống từ store journey.js. Tên cũ → tên mới:
// megaSale = Mùa cao điểm, leak = Đổi tài khoản nhận tiền.
export function useScenario() {
  const { state, dispatch, resetSignal } = useApp()
  const { peakSeason, accountChange, phase3 } = state.scenario
  return {
    megaSale: peakSeason,
    leak: accountChange,
    phase3,
    toggleMegaSale: () => dispatch({ type: 'togglePeakSeason' }),
    toggleLeak: () => dispatch({ type: 'toggleAccountChange' }),
    togglePhase3: () => dispatch({ type: 'togglePhase3' }),
    resetSignal,
  }
}
