import { useEffect } from 'react'
import { useJourneyState } from './state/journeyState.js'
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
  const { currentScreen, goNext, goPrev } = useJourneyState()

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'ArrowRight') goNext()
      if (event.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev])

  const CurrentScreen = SCREEN_COMPONENTS[currentScreen]
  return <CurrentScreen onNext={goNext} onPrev={goPrev} />
}
