import { useEffect } from 'react'
import { useJourneyState } from './state/journeyState.js'
import { PermissionProvider, usePermissions } from './state/permissionState.jsx'
import { ScenarioProvider, useScenario } from './state/scenarioState.jsx'
import { SettlementProvider, useSettlement } from './state/settlementState.jsx'
import ScenarioPanel from './components/ScenarioPanel.jsx'
import Screen1 from './screens/Screen1.jsx'
import Screen2 from './screens/Screen2.jsx'
import Screen3 from './screens/Screen3.jsx'
import Screen4 from './screens/Screen4.jsx'
import Screen5 from './screens/Screen5.jsx'
import Screen6 from './screens/Screen6.jsx'
import Screen7 from './screens/Screen7.jsx'
import Screen8 from './screens/Screen8.jsx'
import Screen10 from './screens/Screen10.jsx'

const SCREEN_COMPONENTS = {
  1: Screen1,
  2: Screen2,
  3: Screen3,
  4: Screen4,
  5: Screen5,
  6: Screen6,
  7: Screen7,
  8: Screen8,
  10: Screen10,
}

export default function App() {
  const journey = useJourneyState()

  return (
    <ScenarioProvider>
      <SettlementProvider>
        <AppWithPermissions journey={journey} />
      </SettlementProvider>
    </ScenarioProvider>
  )
}

// Quyền A4 và nhật ký truy cập (Màn 7) phản ánh tiến trình tất toán (Màn 6) —
// PermissionProvider cần đọc settlementState nên lồng bên trong SettlementProvider.
function AppWithPermissions({ journey }) {
  const settlement = useSettlement()
  return (
    <PermissionProvider debtFullyRepaid={settlement.debtFullyRepaid} visibleLogDates={settlement.visibleLogDates}>
      <AppScreens journey={journey} />
    </PermissionProvider>
  )
}

function AppScreens({ journey }) {
  const { currentScreen, goNext, goPrev, goToScreen } = journey
  const { isPeeking, closePeek, reset } = usePermissions()
  const { toggleMegaSale, toggleLeak, resetScenario, openPanel } = useScenario()
  const settlement = useSettlement()

  function handleReset() {
    reset()
    resetScenario()
    settlement.reset()
  }

  useEffect(() => {
    function handleKeyDown(event) {
      const key = event.key.toLowerCase()
      if (key === 'r') {
        handleReset()
        return
      }
      if (key === 'm') {
        toggleMegaSale()
        return
      }
      if (key === 'l') {
        toggleLeak()
        return
      }
      if (event.key === '3') {
        // Giai đoạn 3 chưa mở — chỉ mở bảng điều khiển để thấy nhãn "sắp có".
        openPanel()
        return
      }
      if (event.key === ' ' && currentScreen === 6) {
        event.preventDefault()
        settlement.advance()
        return
      }
      if (isPeeking) return
      if (event.key === 'ArrowRight') goNext()
      if (event.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goNext, goPrev, isPeeking, currentScreen, settlement, toggleMegaSale, toggleLeak, openPanel])

  const CurrentScreen = SCREEN_COMPONENTS[currentScreen]
  return (
    <>
      <CurrentScreen onNext={goNext} onPrev={goPrev} onGoToScreen={goToScreen} />
      <ScenarioPanel onReset={handleReset} />
      {isPeeking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <Screen7 onBack={closePeek} onGoToScreen={goToScreen} />
        </div>
      )}
    </>
  )
}
