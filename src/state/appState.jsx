import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { reducer, loadState, saveState } from '../logic/journey.js'

// Store duy nhất (docs/san-pham.md mục F): bọc reducer của src/logic/journey.js,
// lưu localStorage qua loadState/saveState (đã bọc try/catch — bị chặn thì app vẫn chạy).
const AppContext = createContext(null)

export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => loadState())

  useEffect(() => saveState(state), [state])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp phải được gọi bên trong AppStateProvider')
  return ctx
}
