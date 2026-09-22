import { SOLUTION_NAME, FOOTER_NOTE } from '../data/mockData.js'
import { actForScreen } from '../state/journeyState.js'

const ACT_LABELS = ['Hồi 1 — Vấn đề', 'Hồi 2 — Cấp quyền', 'Hồi 3 — Nhận giá trị', 'Hồi 4 — Tất toán và hệ sinh thái']

export default function ScreenShell({ screenNumber, title, children }) {
  const currentAct = actForScreen(screenNumber)

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-8 py-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">{SOLUTION_NAME}</span>
          <span className="text-base text-slate-400">Màn {screenNumber}</span>
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
        <div className="max-w-3xl w-full">
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
