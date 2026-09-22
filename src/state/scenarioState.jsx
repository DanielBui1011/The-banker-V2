import { createContext, useCallback, useContext, useMemo, useState } from 'react'

// Trạng thái kịch bản dùng chung (phím M = Mega Sale, phím L = rò rỉ, phím R đặt lại) —
// đọc/ghi từ ScenarioPanel và các màn liên quan (Màn 4, 5, 6/9).

const ScenarioContext = createContext(null)

export function ScenarioProvider({ children }) {
  const [megaSale, setMegaSale] = useState(false)
  const [leak, setLeak] = useState(false)
  const [panelOpen, setPanelOpen] = useState(false)

  const toggleMegaSale = useCallback(() => setMegaSale((v) => !v), [])
  const toggleLeak = useCallback(() => setLeak((v) => !v), [])
  const openPanel = useCallback(() => setPanelOpen(true), [])
  const closePanel = useCallback(() => setPanelOpen(false), [])
  const togglePanel = useCallback(() => setPanelOpen((v) => !v), [])

  const resetScenario = useCallback(() => {
    setMegaSale(false)
    setLeak(false)
  }, [])

  const value = useMemo(
    () => ({
      megaSale,
      toggleMegaSale,
      leak,
      toggleLeak,
      panelOpen,
      openPanel,
      closePanel,
      togglePanel,
      resetScenario,
    }),
    [megaSale, toggleMegaSale, leak, toggleLeak, panelOpen, openPanel, closePanel, togglePanel, resetScenario]
  )

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>
}

export function useScenario() {
  const ctx = useContext(ScenarioContext)
  if (!ctx) throw new Error('useScenario phải được gọi bên trong ScenarioProvider')
  return ctx
}
