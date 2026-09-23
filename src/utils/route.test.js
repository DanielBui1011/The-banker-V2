import { describe, it, expect } from 'vitest'
import { resolveRoute, isCommand, DEFAULT_ROUTE } from './route.js'
import { ROUTES } from '../logic/journey.js'

describe('resolveRoute', () => {
  it('giữ hash hợp lệ với vai', () => {
    expect(resolveRoute(ROUTES.ungVon, 'seller')).toEqual({ href: ROUTES.ungVon, space: 'nha-ban', page: 'ung-von' })
    expect(resolveRoute(ROUTES.a2, 'seller').page).toBe('a2')
    expect(resolveRoute(ROUTES.canhBao, 'officer').page).toBe('canh-bao')
  })

  it('hash sai vai, rỗng, lạ hoặc là lệnh → trang mặc định của vai', () => {
    expect(resolveRoute(ROUTES.traCuu, 'seller').href).toBe(DEFAULT_ROUTE.seller)
    expect(resolveRoute(ROUTES.khoanVay, 'officer').href).toBe(DEFAULT_ROUTE.officer)
    expect(resolveRoute(ROUTES.a1, 'officer').href).toBe(DEFAULT_ROUTE.officer)
    expect(resolveRoute('', 'seller').href).toBe(ROUTES.tongQuan)
    expect(resolveRoute('#/nha-ban/khong-co', 'seller').href).toBe(ROUTES.tongQuan)
    expect(resolveRoute(ROUTES.tua, 'seller').href).toBe(ROUTES.tongQuan)
  })

  it('nhận ra lệnh bảng Mô phỏng', () => {
    expect(isCommand(ROUTES.moPhong)).toBe(true)
    expect(isCommand(ROUTES.batDauLai)).toBe(true)
    expect(isCommand(ROUTES.tongQuan)).toBe(false)
    expect(isCommand('#/mo-phongx')).toBe(false)
  })
})
