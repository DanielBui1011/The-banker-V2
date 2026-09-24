import { Component, useEffect, useRef, useState } from 'react'
import { AppStateProvider, useApp } from './state/appState.jsx'
import { useHashRoute, crossesBankSurface, DEFAULT_ROUTE } from './utils/route.js'
import { STORAGE_KEY } from './logic/journey.js'
import { FOOTER_NOTE } from './data/mockData.js'
import Card from './components/ui/Card.jsx'
import Button from './components/ui/Button.jsx'
import { DISPLAY_NAME } from './config/brand.js'
import AppShell from './components/ui/AppShell.jsx'
import { HandoffScreen } from './components/ui/SurfaceFrame.jsx'
import { WelcomeDialog, HelpDrawer } from './components/Guide.jsx'
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
    if (crossesBankSurface(`#/${lastSpace}`, `#/${space}`) && !reducedMotion()) setHandoff({ toBank: space === 'techcombank' })
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
    <CrashGuard>
      <AppStateProvider>
        <AppRoutes />
      </AppStateProvider>
    </CrashGuard>
  )
}

// Lưới an toàn cuối (Vòng 26): lỗi hiển thị bất kỳ → màn "Bắt đầu lại" thay vì trang trắng
class CrashGuard extends Component {
  state = { crashed: false }
  static getDerivedStateFromError() {
    return { crashed: true }
  }
  restart = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // localStorage bị chặn: vẫn tải lại từ đầu
    }
    window.location.hash = DEFAULT_ROUTE.seller
    window.location.reload()
  }
  render() {
    if (!this.state.crashed) return this.props.children
    return (
      <main className="flex min-h-screen items-center justify-center bg-white p-8">
        <Card className="max-w-xl space-y-4">
          <h1 className="text-screen-title font-bold text-slate-900">Mô phỏng gặp trạng thái không mong đợi</h1>
          <p className="text-body text-slate-700">Bắt đầu lại để quay về đầu hành trình, trước khi kết nối Techcombank.</p>
          <div className="flex justify-end">
            <Button onClick={this.restart}>Bắt đầu lại</Button>
          </div>
          <p className="text-label text-slate-600">{FOOTER_NOTE}</p>
        </Card>
      </main>
    )
  }
}

function AppRoutes() {
  const { state, dispatch } = useApp()
  const route = useHashRoute(state.role)
  const [helpOpen, setHelpOpen] = useState(false)
  const [replayWelcome, setReplayWelcome] = useState(false)
  const handoff = useBankHandoff(route.space)
  const [sixWeeks, closeSixWeeks] = useSixWeeksNotice(state.eventIndex, route.href)

  // Ghi nhận trang đã mở tại ngày mô phỏng hiện tại (nhiệm vụ 2 và 5, san-pham.md D.2)
  useEffect(() => {
    dispatch({ type: 'visit', key: `${state.role}:${route.page}` })
  }, [dispatch, state.role, route.page, state.eventIndex])

  const openHelp = () => setHelpOpen((v) => !v)
  // Đi tới trang khác từ ngăn Hướng dẫn (nút Đi tới) → đóng ngăn
  useEffect(() => setHelpOpen(false), [route.href])
  const chooseMode = (mode) => {
    dispatch({ type: 'welcome', mode })
    setReplayWelcome(false)
  }
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
          <Page key={route.space === 'ngan-hang' ? route.space : route.page} route={route} onHelp={openHelp} />
        </AppShell>
      )}
      <ScenarioPanel route={route} onHelp={openHelp} />
      <HelpDrawer
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        onReplayWelcome={() => {
          setHelpOpen(false)
          setReplayWelcome(true)
        }}
      />
      {/* Màn chào (D.1): lần đầu hoặc sau Bắt đầu lại (reset → welcomeDone false) */}
      <WelcomeDialog open={!state.guide.welcomeDone || replayWelcome} onChoose={chooseMode} />
    </>
  )
}

function Page({ route, onHelp }) {
  if (route.space === 'ngan-hang') return <CongNoiBo page={route.page} onHelp={onHelp} />
  if ((route.page === 'a1' || route.page === 'a2') && route.params['thao-tac'] === 'rut') {
    return <RutQuyen code={route.page.toUpperCase()} />
  }
  const Component = PAGES[route.page]
  return <Component params={route.params} />
}
