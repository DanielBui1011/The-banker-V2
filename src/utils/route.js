import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { ROUTES } from '../logic/journey.js'

// Điều hướng bằng URL hash (docs/san-pham.md mục F) — không thư viện router.
// '#/<khu>/<trang>[?khóa=giá-trị]'; '#/mo-phong/…' là lệnh bảng Mô phỏng (ScenarioPanel xử lý).
// Tham số (Vòng 22): 'don-vi' (trang Trả nợ), 've' (trang quay về sau trang Techcombank),
// 'thao-tac=rut' (rút quyền trên trang Techcombank).
const SPACE_ROLE = { 'nha-ban': 'seller', techcombank: 'seller', 'ngan-hang': 'officer' }
export const DEFAULT_ROUTE = { seller: ROUTES.tongQuan, officer: ROUTES.traCuu }
const VALID = new Set(Object.values(ROUTES).filter((href) => !isCommand(href)))

export function isCommand(hash) {
  return hash === ROUTES.moPhong || hash.startsWith(`${ROUTES.moPhong}/`)
}

// Hash không hợp lệ với vai hiện tại → trang mặc định của vai
export function resolveRoute(hash, role) {
  const [base, query = ''] = hash.split('?')
  const ok = VALID.has(base) && SPACE_ROLE[base.split('/')[1]] === role
  const href = ok ? hash : DEFAULT_ROUTE[role]
  const [, space, page] = href.split('?')[0].split('/')
  return { href, space, page, params: ok ? Object.fromEntries(new URLSearchParams(query)) : {} }
}

// Sang hoặc về trang Techcombank: dùng màn chuyển tiếp 700ms (L.2) thay chuyển trang thường
const isBank = (hash) => hash.split('/')[1] === 'techcombank'
export const crossesBankSurface = (from, to) => isBank(from) !== isBank(to)

export const go = (href) => {
  window.location.hash = href
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
    function onHashChange(event) {
      const next = window.location.hash
      if (isCommand(next)) return
      const prev = event?.oldURL ? new URL(event.oldURL).hash : ''
      if (crossesBankSurface(prev, next)) setHash(next)
      else withViewTransition(() => setHash(next))
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

// Trang quay về sau trang Techcombank: tham số 've' (trang nhà bán) hoặc mặc định của trang
export const returnHref = (params, fallback) => (params.ve ? `#/nha-ban/${params.ve}` : fallback)
