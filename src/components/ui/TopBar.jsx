import { DISPLAY_NAME } from '../../config/brand.js'
import { DEMO_DATE } from '../../data/mockData.js'
import { formatDateVN } from '../../utils/format.js'

// TopBar (docs/thiet-ke.md mục 4): DISPLAY_NAME · "Giai đoạn 2" · ngày demo · nút
// "Quyền của tôi". Luôn nền navy bất kể bề mặt bên dưới sáng hay tối, nên dùng
// chung được cho mọi màn dùng ScreenShell (Màn 1, 3, 4, 5b/5d, 6, 7, 10).
export default function TopBar({ screenNumber, phaseLabel = 'Giai đoạn 2', onOpenPeek, showPeekButton = true }) {
  return (
    <header className="flex items-center justify-between bg-navy px-12 py-4 text-slate-50">
      <div className="flex items-center gap-4">
        <span className="text-emphasis font-semibold">{DISPLAY_NAME}</span>
        <span className="rounded-full border border-white/30 px-3 py-1 text-label text-slate-50">{phaseLabel}</span>
        <span className="text-label text-slate-50">{formatDateVN(DEMO_DATE)}</span>
      </div>
      <div className="flex items-center gap-4">
        {showPeekButton && (
          <button
            onClick={onOpenPeek}
            className="rounded-lg border border-white/30 bg-white/5 px-3 py-1.5 text-label font-medium text-slate-50 transition hover:bg-white/10"
          >
            Quyền của tôi
          </button>
        )}
        {screenNumber != null && <span className="text-label text-slate-50">Màn {screenNumber}</span>}
      </div>
    </header>
  )
}
