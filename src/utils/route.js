import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { ROUTES } from '../logic/journey.js'

// Điều hướng bằng URL hash (docs/san-pham.md mục F) — không thư viện router.
// '#/<khu>/<trang>'; '#/mo-phong/…' là lệnh bảng Mô phỏng (ScenarioPanel xử lý).
const SPACE_ROLE = { 'nha-ban': 'seller', techcombank: 'seller', 'ngan-hang': 'officer' }
export const DEFAULT_ROUTE = { seller: ROUTES.tongQuan, officer: ROUTES.traCuu }
const VALID = new Set(Object.values(ROUTES).filter((href) => !isCommand(href)))

export function isCommand(hash) {
  return hash === ROUTES.moPhong || hash.startsWith(`${ROUTES.moPhong}/`)
}

// Hash không hợp lệ với vai hiện tại → trang mặc định của vai
export function resolveRoute(hash, role) {
  const [, space] = hash.split('/')
  const href = VALID.has(hash) && SPACE_ROLE[space] === role ? hash : DEFAULT_ROUTE[role]
  const [, s, p] = href.split('/')
  return { href, space: s, page: p }
}

// Chuyển trang bằng View Transitions (L.2 dòng 1): flushSync để trình duyệt chụp đúng
// trạng thái mới. Không hỗ trợ hoặc reduced-motion → đổi ngay.
export function withViewTransition(update) {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduce) return update()
  // Chuyển liên tiếp làm hiệu ứng trước bị bỏ qua — trạng thái vẫn cập nhật, chỉ nuốt lỗi promise
  document.startViewTransition(() => flushSync(update)).ready.catch(() => {})
}

export function useHashRoute(role) {
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    function onHashChange() {
      const next = window.location.hash
      if (!isCommand(next)) withViewTransition(() => setHash(next))
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const route = resolveRoute(hash, role)

  // Đồng bộ thanh địa chỉ khi hash rỗng/sai vai (replaceState: không thêm mục Back)
  useEffect(() => {
    const current = window.location.hash
    if (current !== route.href && !isCommand(current)) window.history.replaceState(null, '', route.href)
    if (hash !== route.href) setHash(route.href)
  }, [route.href, hash])

  return route
}
