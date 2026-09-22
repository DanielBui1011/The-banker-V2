import { createContext, useCallback, useContext, useMemo, useState } from 'react'

// Trạng thái kịch bản dùng chung (phím M = Mega Sale, phím L = rò rỉ, phím R đặt lại) —
// đọc/ghi từ ScenarioPanel và các màn liên quan (Màn 4, 5, 6/9).

const ScenarioContext = createContext(null)

export function ScenarioProvider({ children }) {
  const [megaSale, setMegaSale] = useState(false)
  const [leak, setLeak] = useState(false)
  const [phase3, setPhase3] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)
  // Tăng mỗi lần đặt lại (phím R) — Màn 8 và Màn 10 dùng để tự xóa trạng thái nội bộ
  // (bộ chọn thời điểm, công tắc minh họa, bước 10a/10b/10c) ngay cả khi người trình
  // bày không rời màn, vì hai màn này giữ state riêng bằng useState thay vì context.
  const [resetSignal, setResetSignal] = useState(0)

  const toggleMegaSale = useCallback(() => setMegaSale((v) => !v), [])
  const toggleLeak = useCallback(() => setLeak((v) => !v), [])
  const togglePhase3 = useCallback(() => setPhase3((v) => !v), [])
  const openPanel = useCallback(() => setPanelOpen(true), [])
  const closePanel = useCallback(() => setPanelOpen(false), [])
  const togglePanel = useCallback(() => setPanelOpen((v) => !v), [])

  const resetScenario = useCallback(() => {
    setMegaSale(false)
    setLeak(false)
    setPhase3(false)
    setResetSignal((n) => n + 1)
  }, [])

  const value = useMemo(
    () => ({
      megaSale,
      toggleMegaSale,
      leak,
      toggleLeak,
      phase3,
      togglePhase3,
      panelOpen,
      openPanel,
      closePanel,
      togglePanel,
      resetScenario,
      resetSignal,
    }),
    [
      megaSale,
      toggleMegaSale,
      leak,
      toggleLeak,
      phase3,
      togglePhase3,
      panelOpen,
      openPanel,
      closePanel,
      togglePanel,
      resetScenario,
      resetSignal,
    ]
  )

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>
}

export function useScenario() {
  const ctx = useContext(ScenarioContext)
  if (!ctx) throw new Error('useScenario phải được gọi bên trong ScenarioProvider')
  return ctx
}
