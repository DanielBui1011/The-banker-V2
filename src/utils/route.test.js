import { describe, it, expect } from 'vitest'
import { resolveRoute, isCommand, crossesBankSurface, DEFAULT_ROUTE } from './route.js'
import { ROUTES } from '../logic/journey.js'

describe('resolveRoute', () => {
  it('giữ hash hợp lệ với vai', () => {
    expect(resolveRoute(ROUTES.ungVon, 'seller')).toEqual({ href: ROUTES.ungVon, space: 'nha-ban', page: 'ung-von', params: {} })
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

  it('tham số sau "?" giữ nguyên trong href và đọc được qua params', () => {
    const r = resolveRoute(`${ROUTES.traNo}?don-vi=RU-04`, 'seller')
    expect(r).toEqual({ href: `${ROUTES.traNo}?don-vi=RU-04`, space: 'techcombank', page: 'tra-no', params: { 'don-vi': 'RU-04' } })
    expect(resolveRoute(`${ROUTES.a2}?ve=quyen-du-lieu&thao-tac=rut`, 'seller').params).toEqual({ ve: 'quyen-du-lieu', 'thao-tac': 'rut' })
    // đường dẫn gốc sai vai → trang mặc định, bỏ tham số
    expect(resolveRoute(`${ROUTES.traCuu}?x=1`, 'seller')).toEqual({ href: DEFAULT_ROUTE.seller, space: 'nha-ban', page: 'tong-quan', params: {} })
  })

  it('nhận ra lệnh bảng Mô phỏng', () => {
    expect(isCommand(ROUTES.moPhong)).toBe(true)
    expect(isCommand(ROUTES.batDauLai)).toBe(true)
    expect(isCommand(ROUTES.tongQuan)).toBe(false)
    expect(isCommand('#/mo-phongx')).toBe(false)
  })

  it('nhận ra lần đi sang/về trang Techcombank (màn chuyển tiếp thay View Transition)', () => {
    expect(crossesBankSurface(ROUTES.ungVon, ROUTES.a2)).toBe(true)
    expect(crossesBankSurface(`${ROUTES.traNo}?don-vi=RU-03`, ROUTES.khoanVay)).toBe(true)
    expect(crossesBankSurface(ROUTES.a2, ROUTES.a4)).toBe(false)
    expect(crossesBankSurface(ROUTES.tongQuan, ROUTES.doiSoat)).toBe(false)
  })
})
