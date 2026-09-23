import { FOOTER_NOTE } from '../data/mockData.js'
import { actForScreen } from '../config/flow.js'
import { usePermissions } from '../state/permissionState.jsx'
import TopBar from './ui/TopBar.jsx'
import ActProgress from './ui/ActProgress.jsx'

// Khung dùng chung cho bề mặt Nền tảng (Màn 1, 3, 4, 5b/5d, 6, 7, 10) — Vòng 7A
// thay phần đầu trang tự vẽ trước đây bằng TopBar + ActProgress dùng chung
// (docs/thiet-ke.md mục 4), sống bên trong Stage (App.jsx). Phần thân màn (bg tối,
// bố cục) giữ nguyên như trước để không đổi nội dung Màn 2–10 ngoài việc đặt
// chúng vào Stage/TopBar (yêu cầu "Không làm" của Vòng 7A).
export default function ScreenShell({ screenNumber, title, children, maxWidth = 'max-w-[1536px]' }) {
  const currentAct = actForScreen(screenNumber)
  const { openPeek } = usePermissions()

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-50">
      <TopBar screenNumber={screenNumber} onOpenPeek={() => openPeek(screenNumber)} showPeekButton={screenNumber !== 7} />
      <div className="border-b border-slate-800 px-12 pb-3 pt-3">
        <ActProgress currentAct={currentAct} tone="dark" />
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-8 pt-8 pb-24">
        <div className={`mx-auto ${maxWidth} w-full`}>
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          {children}
        </div>
      </main>

      <footer className="border-t border-slate-800 px-8 py-3 text-base text-slate-50">{FOOTER_NOTE}</footer>
    </div>
  )
}
