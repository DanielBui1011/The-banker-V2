import { SlidersHorizontal } from 'lucide-react'
import { ROUTES } from '../../logic/journey.js'

// SimHint (Vòng 28): chip tối cùng kiểu bảng Mô phỏng — chỗ DUY NHẤT trong trang sản phẩm
// được nhắc tới mô phỏng (tests/quy-tac.test.js quy tắc 11). Bấm → mở bảng Mô phỏng
// (lệnh '#/mo-phong', ScenarioPanel xử lý). Chữ ngắn, một dòng.
export default function SimHint({ children, className = '' }) {
  return (
    <a
      href={ROUTES.moPhong}
      className={`inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full bg-slate-900 px-3 py-1 text-label font-medium text-slate-50 transition duration-fast hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${className}`}
    >
      <SlidersHorizontal size={16} aria-hidden="true" className="flex-shrink-0" />
      {children}
    </a>
  )
}
