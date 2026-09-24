import { Clock, SlidersHorizontal } from 'lucide-react'
import { ROUTES } from '../../logic/journey.js'

// SimHint (Vòng 28): chip tối cùng kiểu bảng Mô phỏng — chỗ DUY NHẤT trong trang sản phẩm
// được nhắc tới mô phỏng (tests/quy-tac.test.js quy tắc 11). Mặc định bấm → mở bảng Mô phỏng
// (lệnh '#/mo-phong', ScenarioPanel xử lý). Vòng 29: cũng là kiểu của nút Tua (href = lệnh Tua,
// icon đồng hồ) và của nút bật tình huống ở thẻ kết (onClick). Chữ ngắn; khung hẹp thì xuống dòng.
export const isSimHref = (href) => href === ROUTES.moPhong || href === ROUTES.tua

const CLASS =
  'inline-flex w-fit max-w-full items-center gap-2 rounded-2xl bg-slate-900 px-3 py-1 text-left text-label font-medium text-slate-50 transition duration-fast hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900'

export default function SimHint({ children, href = ROUTES.moPhong, onClick, className = '' }) {
  const Icon = href === ROUTES.tua ? Clock : SlidersHorizontal
  const body = (
    <>
      <Icon size={16} aria-hidden="true" className="flex-shrink-0" />
      {children}
    </>
  )
  return onClick ? (
    <button type="button" onClick={onClick} className={`${CLASS} ${className}`}>
      {body}
    </button>
  ) : (
    <a href={href} className={`${CLASS} ${className}`}>
      {body}
    </a>
  )
}
