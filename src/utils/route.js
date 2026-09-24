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

// Sang hoặc về trang Techcombank từ app nhà bán: dùng màn chuyển tiếp 700ms (L.2) thay chuyển
// trang thường. Đổi vai sang cổng nội bộ không phải "quay về app" → không dùng màn này (Vòng 26).
const spaceOf = (hash) => hash.split('?')[0].split('/')[1]
export function crossesBankSurface(from, to) {
  const spaces = [spaceOf(from), spaceOf(to)]
  return spaces.includes('techcombank') && spaces.includes('nha-ban')
}

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

// Thanh địa chỉ luôn hiện trang đang dựng. Lệnh bấm trong app đã được ScenarioPanel xử lý
// ngay trong sự kiện hashchange; lệnh còn lại ở đây là lệnh mở thẳng khi tải trang → bỏ,
// nếu không, bấm lại đúng lệnh đó không phát hashchange (Vòng 26).
export const addressBarFix = (current, href) => (current === href ? null : href)

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

  // Đồng bộ thanh địa chỉ khi hash rỗng/sai vai/là lệnh (replaceState: không thêm mục Back)
  useEffect(() => {
    const fix = addressBarFix(window.location.hash, route.href)
    if (fix) window.history.replaceState(null, '', fix)
    if (hash !== route.href) setHash(route.href)
  }, [route.href, hash])

  return route
}

// Trang quay về sau trang Techcombank: tham số 've' (trang nhà bán) hoặc mặc định của trang
export const returnHref = (params, fallback) => (params.ve ? `#/nha-ban/${params.ve}` : fallback)
