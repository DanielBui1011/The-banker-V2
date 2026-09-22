import { createContext, useCallback, useContext, useMemo, useState } from 'react'

// Trạng thái kịch bản dùng chung (phím M = Mega Sale, phím R đặt lại) — hiện tại
// chỉ có Mega Sale; các kịch bản khác (rò rỉ, Giai đoạn 3) sẽ thêm vào đây sau.

const ScenarioContext = createContext(null)

export function ScenarioProvider({ children }) {
  const [megaSale, setMegaSale] = useState(false)

  const toggleMegaSale = useCallback(() => setMegaSale((v) => !v), [])
  const resetScenario = useCallback(() => setMegaSale(false), [])

  const value = useMemo(
    () => ({ megaSale, toggleMegaSale, resetScenario }),
    [megaSale, toggleMegaSale, resetScenario]
  )

  return <ScenarioContext.Provider value={value}>{children}</ScenarioContext.Provider>
}

export function useScenario() {
  const ctx = useContext(ScenarioContext)
  if (!ctx) throw new Error('useScenario phải được gọi bên trong ScenarioProvider')
  return ctx
}
