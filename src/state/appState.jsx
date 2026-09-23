import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import { reducer, loadState, saveState } from '../logic/journey.js'

// Store duy nhất (docs/san-pham.md mục F): bọc reducer của src/logic/journey.js,
// lưu localStorage qua loadState/saveState (đã bọc try/catch — bị chặn thì app vẫn chạy).
const AppContext = createContext(null)

export function AppStateProvider({ children }) {
  const [state, rawDispatch] = useReducer(reducer, undefined, () => loadState())
  // Tăng mỗi lần Bắt đầu lại — màn cũ còn giữ state cục bộ được remount theo khóa này
  // (adapter tạm Vòng 21, gỡ ở Vòng 24 cùng các màn cũ).
  const [resetSignal, setResetSignal] = useState(0)

  useEffect(() => saveState(state), [state])

  const dispatch = useCallback((action) => {
    if (action.type === 'reset') setResetSignal((n) => n + 1)
    rawDispatch(action)
  }, [])

  const value = useMemo(() => ({ state, dispatch, resetSignal }), [state, dispatch, resetSignal])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp phải được gọi bên trong AppStateProvider')
  return ctx
}
