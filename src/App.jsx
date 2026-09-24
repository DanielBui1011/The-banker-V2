import { useEffect, useRef, useState } from 'react'
import { AppStateProvider, useApp } from './state/appState.jsx'
import { useHashRoute } from './utils/route.js'
import { DISPLAY_NAME } from './config/brand.js'
import AppShell from './components/ui/AppShell.jsx'
import { HandoffScreen } from './components/ui/SurfaceFrame.jsx'
import KeyHint from './components/ui/KeyHint.jsx'
import ScenarioPanel from './components/ScenarioPanel.jsx'
import TongQuan, { SixWeeksSummary } from './pages/TongQuan.jsx'
import DoiSoat from './pages/DoiSoat.jsx'
import KhoanPhaiThu from './pages/KhoanPhaiThu.jsx'
import UngVon from './pages/UngVon.jsx'
import KhoanVay from './pages/KhoanVay.jsx'
import QuyenDuLieu from './pages/QuyenDuLieu.jsx'
import A1 from './pages/bank/A1.jsx'
import A2 from './pages/bank/A2.jsx'
import A4 from './pages/bank/A4.jsx'
import TraNo from './pages/bank/TraNo.jsx'
import RutQuyen from './pages/bank/RutQuyen.jsx'
import CongNoiBo from './pages/ngan-hang/CongNoiBo.jsx'

const PAGES = {
  'tong-quan': TongQuan,
  'doi-soat': DoiSoat,
  'khoan-phai-thu': KhoanPhaiThu,
  'ung-von': UngVon,
  'khoan-vay': KhoanVay,
  'quyen-du-lieu': QuyenDuLieu,
  a1: A1,
  a2: A2,
  a4: A4,
  'tra-no': TraNo,
}

// Màn chuyển tiếp sang/về trang Techcombank (san-pham.md L.2, L.3): 700ms (= --dur-handoff),
// chặn thao tác (trang đích chưa dựng, phím bị nuốt); prefers-reduced-motion → bỏ qua.
const HANDOFF_MS = 700
const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function useBankHandoff(space) {
  const [lastSpace, setLastSpace] = useState(space)
  const [handoff, setHandoff] = useState(null)
  // Suy ra ngay trong lần render đổi trang, để trang đích không lóe lên trước màn chuyển tiếp
  if (lastSpace !== space) {
    setLastSpace(space)
    const crossing = (lastSpace === 'techcombank') !== (space === 'techcombank')
    if (crossing && !reducedMotion()) setHandoff({ toBank: space === 'techcombank' })
  }

  useEffect(() => {
    if (!handoff) return
    const swallow = (e) => {
      e.stopPropagation()
      e.preventDefault()
    }
    window.addEventListener('keydown', swallow, true)
    const timer = setTimeout(() => setHandoff(null), HANDOFF_MS)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', swallow, true)
    }
  }, [handoff])

  return handoff
}

// Thẻ "6 tuần sau" ngay sau lần tua 01/08 → 15/09 (hanh-trinh 1.7), ở trang đang mở
function useSixWeeksNotice(eventIndex, href) {
  const [show, setShow] = useState(false)
  const prev = useRef(eventIndex)
  const shownAt = useRef(href)
  useEffect(() => {
    if (prev.current === 0 && eventIndex === 1) {
      setShow(true)
      shownAt.current = href
    }
    prev.current = eventIndex
  }, [eventIndex, href])
  // Rời trang thì thôi hiện (Tổng quan luôn có thẻ này sau 15/09)
  const visible = show && shownAt.current === href && eventIndex === 1
  return [visible, () => setShow(false)]
}

export default function App() {
  return (
    <AppStateProvider>
      <AppRoutes />
    </AppStateProvider>
  )
}

function AppRoutes() {
  const { state, dispatch } = useApp()
  const route = useHashRoute(state.role)
  const [helpOpen, setHelpOpen] = useState(false)
  const handoff = useBankHandoff(route.space)
  const [sixWeeks, closeSixWeeks] = useSixWeeksNotice(state.eventIndex, route.href)

  // Ghi nhận trang đã mở tại ngày mô phỏng hiện tại (nhiệm vụ 2 và 5, san-pham.md D.2)
  useEffect(() => {
    dispatch({ type: 'visit', key: `${state.role}:${route.page}` })
  }, [dispatch, state.role, route.page, state.eventIndex])

  const openHelp = () => setHelpOpen((v) => !v)
  // Giai đoạn 3: trang ký A4 là trang của bên được chọn (có thể không phải Techcombank)
  const bankName = (route.page === 'a4' && state.scenario.phase3 && state.application.chosenLender) || 'Techcombank'

  return (
    <>
      {handoff ? (
        <HandoffScreen toBank={handoff.toBank} bankName={bankName} text={handoff.toBank ? `Đang chuyển tới ${bankName}…` : `Quay về ${DISPLAY_NAME}`} />
      ) : (
        <AppShell
          route={route}
          onHelp={openHelp}
          notice={sixWeeks && route.page !== 'tong-quan' && <SixWeeksSummary onClose={closeSixWeeks} />}
        >
          {/* Ba mục cổng ngân hàng dùng chung một trang → không remount khi đổi mục */}
          <Page key={route.space === 'ngan-hang' ? route.space : route.page} route={route} />
        </AppShell>
      )}
      <ScenarioPanel route={route} onHelp={openHelp} />
      {helpOpen && <KeyHint onClose={() => setHelpOpen(false)} />}
    </>
  )
}

function Page({ route }) {
  if (route.space === 'ngan-hang') return <CongNoiBo page={route.page} />
  if ((route.page === 'a1' || route.page === 'a2') && route.params['thao-tac'] === 'rut') {
    return <RutQuyen code={route.page.toUpperCase()} />
  }
  const Component = PAGES[route.page]
  return <Component params={route.params} />
}
