import { SOLUTION_NAME, FOOTER_NOTE } from '../data/mockData.js'
import { actForScreen } from '../state/journeyState.js'
import { usePermissions } from '../state/permissionState.jsx'

const ACT_LABELS = ['Hồi 1 — Vấn đề', 'Hồi 2 — Cấp quyền', 'Hồi 3 — Nhận giá trị', 'Hồi 4 — Tất toán và hệ sinh thái']

// Vùng nội dung chính rộng ~80% màn hình ở độ phân giải trình chiếu 1920×1080
// (CLAUDE.md mục #7 / quy-tac.md mục 8): 1920 × 0,8 = 1536px.
export default function ScreenShell({ screenNumber, title, children, maxWidth = 'max-w-[1536px]' }) {
  const currentAct = actForScreen(screenNumber)
  const { openPeek } = usePermissions()

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-8 py-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">{SOLUTION_NAME}</span>
          <div className="flex items-center gap-4">
            {screenNumber !== 7 && (
              <button
                onClick={() => openPeek(screenNumber)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-base font-medium text-slate-300 hover:bg-slate-800"
              >
                Quyền của tôi
              </button>
            )}
            <span className="text-base text-slate-400">Màn {screenNumber}</span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {ACT_LABELS.map((label, i) => {
            const actNumber = i + 1
            const isActive = actNumber === currentAct
            return (
              <div
                key={label}
                className={`h-1.5 rounded-full ${isActive ? 'bg-blue-500' : 'bg-slate-800'}`}
                title={label}
              />
            )
          })}
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-8 py-10">
        <div className={`${maxWidth} w-full`}>
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          {children}
        </div>
      </main>

      <footer className="border-t border-slate-800 px-8 py-3 text-base text-slate-500">
        {FOOTER_NOTE}
      </footer>
    </div>
  )
}
