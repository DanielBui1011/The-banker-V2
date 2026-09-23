import { useEffect, useState } from 'react'
import { AppStateProvider, useApp } from './state/appState.jsx'
import { PermissionProvider } from './state/permissionState.jsx'
import { SettlementProvider } from './state/settlementState.jsx'
import { useHashRoute } from './utils/route.js'
import AppShell from './components/ui/AppShell.jsx'
import KeyHint from './components/ui/KeyHint.jsx'
import ScenarioPanel from './components/ScenarioPanel.jsx'
import LegacyScreen from './components/LegacyScreen.jsx'

export default function App() {
  return (
    <AppStateProvider>
      <PermissionProvider>
        <SettlementProvider>
          <AppRoutes />
        </SettlementProvider>
      </PermissionProvider>
    </AppStateProvider>
  )
}

function AppRoutes() {
  const { state, dispatch, resetSignal } = useApp()
  const route = useHashRoute(state.role)
  const [helpOpen, setHelpOpen] = useState(false)

  // Ghi nhận trang đã mở tại ngày mô phỏng hiện tại (nhiệm vụ 2 và 5, san-pham.md D.2)
  useEffect(() => {
    dispatch({ type: 'visit', key: `${state.role}:${route.page}` })
  }, [dispatch, state.role, route.page, state.eventIndex])

  const openHelp = () => setHelpOpen((v) => !v)
  // Ba mục cổng ngân hàng dùng chung một màn cũ → không remount khi đổi mục
  const screenKey = route.space === 'ngan-hang' ? 'ngan-hang' : route.href

  return (
    <>
      <AppShell route={route} onHelp={openHelp}>
        <div data-legacy-screen className="h-full" key={`${screenKey}:${resetSignal}`}>
          <LegacyScreen route={route} phase3={state.scenario.phase3} />
        </div>
      </AppShell>
      <ScenarioPanel route={route} onHelp={openHelp} />
      {helpOpen && <KeyHint onClose={() => setHelpOpen(false)} />}
    </>
  )
}
