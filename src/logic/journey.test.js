import { describe, it, expect } from 'vitest'
import {
  initialState,
  reducer,
  simDate,
  unitStatus,
  activeUnits,
  loan,
  fundingFrozen,
  accessLog,
  bankView,
  tasks,
  availability,
  nextStep,
  resendLock,
  lockPlan,
  loadState,
  saveState,
  STORAGE_KEY,
} from './journey.js'

// Chạy lần lượt các action từ một trạng thái. Action dạng chuỗi = { type }.
function run(state, ...actions) {
  return actions.reduce((s, a) => reducer(s, typeof a === 'string' ? { type: a } : a), state)
}
const start = () => initialState()

// Các mốc hành trình 1 (docs/hanh-trinh.md)
const connected = () => run(start(), 'grantA1') // 1.6
const at1509 = () => run(connected(), 'advance') // 1.7
const withA2 = () => run(at1509(), 'grantA2') // 1.12
const estimated = () => run(withA2(), 'viewEstimate') // 1.13
const signed = () => run(estimated(), 'signA4') // 1.15
const disbursed = () => run(signed(), 'submit') // 1.16
const at1909 = () => run(disbursed(), 'advance') // 1.18
const repaidRU03 = () => run(at1909(), { type: 'repay', unit: 'RU-03' }) // 1.19
const at2009 = () => run(repaidRU03(), 'advance') // 1.20
const fullyRepaid = () => run(at2009(), { type: 'repay', unit: 'RU-04' }) // 1.21

// Hành trình 2: bật Đổi tài khoản nhận tiền sau giải ngân rồi tua tới 24/09
const accountChangeAt = (n) => {
  let s = run(disbursed(), 'toggleAccountChange')
  for (let i = 0; i < n; i++) s = run(s, 'advance')
  return s
}

// Giai đoạn 3 tới bước chọn chào giá
const phase3Quotes = () =>
  run(
    at1509(),
    'togglePhase3',
    'grantA2',
    { type: 'requestQuotes', recipients: ['Techcombank', 'Ngân hàng B', 'Công ty tài chính C'] }
  )

// ─── Selectors ────────────────────────────────────────────────────────────────

describe('simDate', () => {
  it('bắt đầu ở 01/08/2027 (E0)', () => {
    expect(simDate(start())).toBe('2027-08-01')
  })
  it('tua sau khi cấp A1 → 15/09/2027 (E1)', () => {
    expect(simDate(at1509())).toBe('2027-09-15')
  })
  it('kỳ thường: 19/09 rồi 20/09', () => {
    expect(simDate(at1909())).toBe('2027-09-19')
    expect(simDate(at2009())).toBe('2027-09-20')
  })
  it('Đổi tài khoản nhận tiền: 21/09 (E4) và 24/09 (E5)', () => {
    expect(simDate(accountChangeAt(3))).toBe('2027-09-21')
    expect(simDate(accountChangeAt(4))).toBe('2027-09-24')
  })
})

describe('unitStatus', () => {
  it('01/08: chưa có dữ liệu đơn vị → null', () => {
    expect(unitStatus(connected(), 'RU-03')).toBeNull()
  })
  it('15/09 chưa vay: RU-01/02 đã tất toán, RU-03/04 đã xác thực, RU-05 chưa đủ lịch sử, RU-06 đã hoàn', () => {
    const s = at1509()
    expect(unitStatus(s, 'RU-01')).toBe('settled')
    expect(unitStatus(s, 'RU-02')).toBe('settled')
    expect(unitStatus(s, 'RU-03')).toBe('verified')
    expect(unitStatus(s, 'RU-04')).toBe('verified')
    expect(unitStatus(s, 'RU-05')).toBe('insufficient-history')
    expect(unitStatus(s, 'RU-06')).toBe('reversed')
  })
  it('sau giải ngân: RU-03/04 đã khóa; sau trả: đã tất toán', () => {
    expect(unitStatus(disbursed(), 'RU-03')).toBe('locked')
    expect(unitStatus(repaidRU03(), 'RU-03')).toBe('settled')
    expect(unitStatus(repaidRU03(), 'RU-04')).toBe('locked')
  })
  it('Mùa cao điểm: RU-M1/M2 đã xác thực', () => {
    const s = run(at1509(), 'togglePeakSeason')
    expect(unitStatus(s, 'RU-M1')).toBe('verified')
    expect(unitStatus(s, 'RU-M2')).toBe('verified')
  })
  it('RU-03 giữ "Đứt gãy" trong lịch sử dù đã giải trình và trả', () => {
    const s = run(accountChangeAt(4), { type: 'repay', unit: 'RU-04' }, 'resolveAccountChange', { type: 'repay', unit: 'RU-03' })
    expect(unitStatus(s, 'RU-03')).toBe('broken')
    expect(loan(s).debt).toBe(0)
  })
})

describe('activeUnits', () => {
  it('kỳ thường: RU-03, RU-04', () => {
    expect(activeUnits(at1509()).map((u) => u.code)).toEqual(['RU-03', 'RU-04'])
  })
  it('Mùa cao điểm: RU-M1, RU-M2 thay thế', () => {
    expect(activeUnits(run(at1509(), 'togglePeakSeason')).map((u) => u.code)).toEqual(['RU-M1', 'RU-M2'])
  })
})

describe('loan', () => {
  it('chưa vay → none, dư nợ 0', () => {
    expect(loan(at1509())).toMatchObject({ status: 'none', lender: null, debt: 0 })
  })
  it('giải ngân → Techcombank, gốc 85, dư nợ 85 (tính từ sổ khóa, T1)', () => {
    expect(loan(disbursed())).toMatchObject({ status: 'disbursed', lender: 'Techcombank', principal: 85, debt: 85 })
  })
  it('trả hết → repaid', () => {
    expect(loan(fullyRepaid())).toMatchObject({ status: 'repaid', debt: 0 })
  })
})

describe('fundingFrozen', () => {
  it('kỳ thường không bao giờ đóng băng', () => {
    expect(fundingFrozen(at2009())).toBe(false)
  })
  it('Đổi tài khoản: 21/09 chưa đóng băng, 24/09 đóng băng', () => {
    expect(fundingFrozen(accountChangeAt(3))).toBe(false)
    expect(fundingFrozen(accountChangeAt(4))).toBe(true)
  })
  it('giải trình xong → mở lại', () => {
    expect(fundingFrozen(run(accountChangeAt(4), 'resolveAccountChange'))).toBe(false)
  })
})

describe('accessLog', () => {
  const stamps = (s) => accessLog(s).map((l) => `${l.date} ${l.time}`)
  it('chưa kết nối → trống', () => {
    expect(accessLog(start())).toEqual([])
  })
  it('cấp A1 → 01/08 09:12 và 09:13, chưa có 10/09', () => {
    expect(stamps(connected())).toEqual(['2027-08-01 09:12', '2027-08-01 09:13'])
  })
  it('tua tới 15/09 → thêm 10/09 06:00; chưa có dòng A2', () => {
    expect(stamps(at1509())).toEqual(['2027-08-01 09:12', '2027-08-01 09:13', '2027-09-10 06:00'])
  })
  it('A2 → 10:02, 10:03; ký A4 → 10:05', () => {
    expect(stamps(withA2()).slice(3)).toEqual(['2027-09-15 10:02', '2027-09-15 10:03'])
    expect(stamps(signed()).slice(3)).toEqual(['2027-09-15 10:02', '2027-09-15 10:03', '2027-09-15 10:05'])
  })
  it('19/09 và 20/09 06:00 chỉ hiện khi ngày mô phỏng tới', () => {
    expect(stamps(disbursed())).not.toContain('2027-09-19 06:00')
    expect(stamps(at1909())).toContain('2027-09-19 06:00')
    expect(stamps(at2009())).toContain('2027-09-20 06:00')
  })
  it('Đổi tài khoản: 19/09 và 20/09 vẫn hiện (A1 vẫn đồng bộ)', () => {
    expect(stamps(accountChangeAt(2))).toEqual(expect.arrayContaining(['2027-09-19 06:00', '2027-09-20 06:00']))
  })
  it('rút A2 → dòng của người dùng mang ngày mô phỏng, giờ chưa có số (null), nằm cuối', () => {
    const log = accessLog(run(disbursed(), 'revokeA2'))
    const last = log[log.length - 1]
    expect(last).toMatchObject({ date: '2027-09-15', time: null, source: 'user' })
    expect(last.purpose).toContain('A2')
  })
})

describe('bankView', () => {
  it('trước khi khóa: đã khóa 0, 0 bên, phơi nhiễm 0', () => {
    const v = bankView(at1509())
    expect(v.units.find((u) => u.code === 'RU-03')).toMatchObject({ availableValue: 46.75, lockedAmount: 0, lockerCount: 0 })
    expect(v.totalConsolidatedExposure).toBe(0)
  })
  it('sau giải ngân = du-lieu mục 11', () => {
    const v = bankView(disbursed())
    expect(v.units).toEqual([
      expect.objectContaining({ code: 'RU-03', projectedNetValue: 55, availableValue: 46.75, lockedAmount: 46.75, lockerCount: 1 }),
      expect.objectContaining({ code: 'RU-04', projectedNetValue: 45, availableValue: 38.25, lockedAmount: 38.25, lockerCount: 1 }),
      expect.objectContaining({ code: 'RU-05', projectedNetValue: 12, availableValue: null, lockedAmount: 0, lockerCount: 0 }),
    ])
    expect(v.totalConsolidatedExposure).toBe(85)
    expect(v.lenderCount).toBe(1)
    expect(v.remainingAvailable).toBe(0)
  })
  it('minh họa phơi nhiễm chéo: bên khác khóa 100 → còn 50 (T3)', () => {
    expect(bankView(disbursed()).crossExposureExample).toEqual({ otherLockedAmount: 100, remainingAvailable: 50 })
  })
  it('20/09 sau khi trả hết: đã khóa 0, 0 bên (hanh-trinh 3.8)', () => {
    const v = bankView(fullyRepaid())
    expect(v.totalConsolidatedExposure).toBe(0)
    expect(v.units.every((u) => u.lockedAmount === 0 && u.lockerCount === 0)).toBe(true)
    // đơn vị đã tất toán không còn khóa được
    expect(v.remainingAvailable).toBe(0)
    expect(v.units.map((u) => u.status)).toEqual(['settled', 'settled', 'insufficient-history'])
  })
  it('mỗi đơn vị mang trạng thái của unitStatus (đứt gãy hiện ở cổng ngân hàng)', () => {
    expect(bankView(accountChangeAt(4)).units[0]).toMatchObject({ code: 'RU-03', status: 'broken' })
  })
  it('cảnh báo chỉ khi Đổi tài khoản và ngày ≥ 24/09', () => {
    expect(bankView(accountChangeAt(3)).alerts).toEqual([])
    expect(bankView(accountChangeAt(4)).alerts).toEqual([{ unit: 'RU-03', date: '2027-09-24' }])
  })
  it('hành trình 2: phơi nhiễm = dư nợ trang Khoản vay ở mọi mốc (15/09 → 24/09 → tất toán)', () => {
    const states = [
      accountChangeAt(0),
      accountChangeAt(1),
      run(accountChangeAt(2), { type: 'repay', unit: 'RU-04' }),
      run(accountChangeAt(2), { type: 'repay', unit: 'RU-04' }, 'advance', 'advance'),
      run(accountChangeAt(4), { type: 'repay', unit: 'RU-04' }, 'resolveAccountChange', { type: 'repay', unit: 'RU-03' }),
    ]
    expect(states.map((s) => bankView(s).totalConsolidatedExposure)).toEqual([85, 85, 46.75, 46.75, 0])
    for (const s of states) expect(bankView(s).totalConsolidatedExposure).toBe(loan(s).debt)
  })
  it('không đọc BANK_VIEW tĩnh: mockData không còn xuất BANK_VIEW', async () => {
    const data = await import('../data/mockData.js')
    expect(data.BANK_VIEW).toBeUndefined()
  })
  it('không lộ tên bên đang khóa (quy-tac mục 5)', () => {
    const s = run(phase3Quotes(), { type: 'chooseQuote', lender: 'Ngân hàng B' }, 'signA4')
    const text = JSON.stringify(bankView(s))
    expect(text).not.toContain('Ngân hàng B')
    expect(text).not.toContain('Techcombank')
  })
})

describe('tasks', () => {
  const doneIds = (s) => tasks(s).items.filter((t) => t.done).map((t) => t.id)
  it('bắt đầu 0/5, 7 nhiệm vụ (2 tùy chọn), mỗi nhiệm vụ chưa xong có "Đi tới"', () => {
    const t = tasks(start())
    expect(t.items).toHaveLength(7)
    expect(t.items.filter((i) => i.optional).map((i) => i.id)).toEqual([6, 7])
    expect(t).toMatchObject({ requiredDone: 0, requiredTotal: 5, allRequiredDone: false })
    expect(t.items[0].fix).toEqual({ label: 'Kết nối Techcombank', href: '#/nha-ban/tong-quan' })
  })
  it('nhiệm vụ 1 xong khi cấp A1', () => {
    expect(doneIds(connected())).toEqual([1])
  })
  it('nhiệm vụ 2: mở Khoản phải thu ở 01/08 rồi tua KHÔNG tính; mở lại sau 15/09 mới tính', () => {
    const early = run(connected(), { type: 'visit', key: 'seller:khoan-phai-thu' }, 'advance')
    expect(doneIds(early)).toEqual([1])
    expect(doneIds(run(early, { type: 'visit', key: 'seller:khoan-phai-thu' }))).toEqual([1, 2])
  })
  it('nhiệm vụ 3, 4, 5 theo hành trình 1 → đủ 5/5', () => {
    expect(doneIds(disbursed())).toContain(3)
    const s = run(fullyRepaid(), { type: 'visit', key: 'seller:khoan-phai-thu' }, { type: 'visit', key: 'officer:tra-cuu' })
    expect(tasks(s)).toMatchObject({ requiredDone: 5, allRequiredDone: true })
  })
  it('nhiệm vụ 6: đã giải trình Đổi tài khoản', () => {
    expect(doneIds(run(accountChangeAt(4), 'resolveAccountChange'))).toContain(6)
  })
  it('nhiệm vụ 7: có chứng thư khóa từ luồng chào giá', () => {
    const s = run(phase3Quotes(), { type: 'chooseQuote', lender: 'Ngân hàng B' }, 'signA4')
    expect(doneIds(s)).toContain(7)
    expect(doneIds(s)).not.toContain(3) // khoản vay không phải của Techcombank
  })
})

describe('nextStep', () => {
  it('Giai đoạn 3: không gợi ý mùa cao điểm; ký với B → ở Ứng vốn không có đường dẫn trỏ về chính trang', () => {
    expect(nextStep(phase3Quotes(), 'ung-von')).toEqual({ text: 'So sánh chào giá và chọn một bên.', action: null })
    const s = run(phase3Quotes(), { type: 'chooseQuote', lender: 'Ngân hàng B' }, 'signA4')
    expect(nextStep(s, 'ung-von').action).toBeNull()
    expect(nextStep(s, 'tong-quan').action).toEqual({ label: 'Chọn lại chào giá', href: '#/nha-ban/ung-von' })
  })
  it('hành trình 2.8: sau giải trình, RU-03 trả từ nguồn khác — không nói Shopee đã thanh toán', () => {
    const s = run(accountChangeAt(4), { type: 'repay', unit: 'RU-04' }, 'resolveAccountChange')
    expect(nextStep(s, 'khoan-vay')).toEqual({
      text: 'Đã giải trình. Trả 46,75 triệu cho RU-03 từ nguồn khác trên Techcombank.',
      action: { label: 'Trả nợ trên Techcombank', href: '#/techcombank/tra-no' },
    })
  })
  it('Đối soát, chưa kết nối → Kết nối Techcombank (D.3)', () => {
    expect(nextStep(start(), 'doi-soat')).toEqual({
      text: 'Kết nối tài khoản Techcombank để app đối soát tự động.',
      action: { label: 'Kết nối Techcombank', href: '#/techcombank/a1' },
    })
  })
  it('01/08 đã kết nối → tua tới 15/09 (1.6)', () => {
    expect(nextStep(connected(), 'doi-soat')).toEqual({
      text: 'Tua tới 15/09 để xem 6 tuần đối soát.',
      action: { label: 'Tua tới sự kiện tiếp theo', href: '#/mo-phong/tua' },
    })
  })
  it('Khoản phải thu 15/09 → Đi tới Ứng vốn (D.3)', () => {
    expect(nextStep(at1509(), 'khoan-phai-thu')).toEqual({
      text: 'RU-03 và RU-04 đã xác thực. Xem bạn được ứng bao nhiêu.',
      action: { label: 'Đi tới Ứng vốn', href: '#/nha-ban/ung-von' },
    })
  })
  it('trang khác ở 15/09 khi chưa xem Khoản phải thu → mở Khoản phải thu', () => {
    expect(nextStep(at1509(), 'tong-quan').action).toEqual({ label: 'Mở Khoản phải thu', href: '#/nha-ban/khoan-phai-thu' })
  })
  it('Ứng vốn chưa có A2 → Cấp A2 trên trang Techcombank (1.10), kèm gợi ý mùa cao điểm', () => {
    expect(nextStep(at1509(), 'ung-von')).toEqual({
      text: 'Techcombank cần quyền đánh giá tín dụng (A2).',
      action: { label: 'Cấp A2 trên trang Techcombank', href: '#/techcombank/a2' },
      hint: 'Muốn xem mùa cao điểm? Bật ở bảng Mô phỏng',
    })
  })
  it('Khoản vay sau giải ngân → "Tua tới 19/09" (D.3)', () => {
    expect(nextStep(disbursed(), 'khoan-vay')).toEqual({
      text: 'Khoản vay đang chờ sàn thanh toán. Tua tới 19/09.',
      action: { label: 'Tua tới sự kiện tiếp theo', href: '#/mo-phong/tua' },
    })
  })
  it('19/09 → trả RU-03 trên Techcombank; trang khác dẫn về Khoản vay', () => {
    expect(nextStep(at1909(), 'khoan-vay')).toEqual({
      text: 'Shopee đã thanh toán RU-03. Trả 46,75 triệu trên Techcombank.',
      action: { label: 'Trả nợ trên Techcombank', href: '#/techcombank/tra-no' },
    })
    expect(nextStep(at1909(), 'tong-quan').action).toEqual({ label: 'Xem khoản vay', href: '#/nha-ban/khoan-vay' })
  })
  it('trả xong → xem góc nhìn cán bộ (1.21); xem rồi → không cần làm gì', () => {
    expect(nextStep(fullyRepaid(), 'khoan-vay').action).toEqual({ label: 'Đổi vai', href: '#/mo-phong/doi-vai' })
    const done = run(fullyRepaid(), { type: 'visit', key: 'officer:tra-cuu' })
    expect(nextStep(done, 'khoan-vay')).toEqual({ text: 'Không cần làm gì ở trang này', action: null })
  })
  it('cán bộ, A2 chưa cấp → Đổi sang vai Nhà bán', () => {
    expect(nextStep(at1509(), 'tra-cuu')).toEqual({
      text: 'Nhà bán chưa cấp (hoặc đã rút) quyền A2 — ngân hàng không xem được hồ sơ',
      action: { label: 'Đổi sang vai Nhà bán', href: '#/mo-phong/doi-vai' },
    })
  })
  it('cán bộ, đã xong 5 nhiệm vụ → về vai Nhà bán xem thẻ kết (D.2)', () => {
    const done = run(fullyRepaid(), { type: 'visit', key: 'seller:khoan-phai-thu' }, { type: 'visit', key: 'officer:tra-cuu' })
    expect(nextStep(done, 'tra-cuu')).toEqual({
      text: 'Bạn đã xong 5 nhiệm vụ. Về vai Nhà bán để xem tổng kết.',
      action: { label: 'Đổi sang vai Nhà bán', href: '#/mo-phong/doi-vai' },
    })
  })
  it('cán bộ, chờ nhà bán trả nợ (3.8)', () => {
    expect(nextStep(at1909(), 'tra-cuu')).toEqual({
      text: 'Chờ nhà bán trả nợ',
      action: { label: 'Đổi sang vai Nhà bán', href: '#/mo-phong/doi-vai' },
    })
  })
})

// ─── availability: mỗi dòng G.1 / G.2 / G.3 có ít nhất một trường hợp vô hiệu ────

const blocked = (s, action) => {
  const a = availability(s, action)
  expect(a.ok).toBe(false)
  return a
}

describe('availability — G.1 Nhà bán', () => {
  it('Kết nối Techcombank (A1): bật khi chưa kết nối; vô hiệu khi A1 đang hoạt động', () => {
    expect(availability(start(), 'grantA1').ok).toBe(true)
    const a = blocked(connected(), 'grantA1')
    expect(a.reason).toBe('Tài khoản Techcombank đã kết nối')
    expect(a.fix.href).toBe('#/nha-ban/quyen-du-lieu')
  })
  it('Xem dữ liệu Đối soát: "Chưa kết nối" → Kết nối; "Đang tích lũy lịch sử" → Tua tới 15/09', () => {
    let a = blocked(start(), 'viewReconciliation')
    expect(a.reason).toBe('Chưa kết nối')
    expect(a.fix).toEqual({ label: 'Kết nối Techcombank', href: '#/techcombank/a1' })
    a = blocked(connected(), 'viewReconciliation')
    expect(a.reason).toBe('Đang tích lũy lịch sử')
    expect(a.fix).toEqual({ label: 'Tua tới 15/09', href: '#/mo-phong/tua' })
    expect(availability(at1509(), 'viewReconciliation').ok).toBe(true)
  })
  it('Mở Ứng vốn: chưa có khoản phải thu đã xác thực → Tua tới 15/09 (hoặc Kết nối)', () => {
    let a = blocked(connected(), 'openFunding')
    expect(a.reason).toBe('Chưa có khoản phải thu đã xác thực')
    expect(a.fix.href).toBe('#/mo-phong/tua')
    a = blocked(start(), 'openFunding')
    expect(a.fix.href).toBe('#/techcombank/a1')
  })
  it('Cấp A2: cần A1 đang hoạt động → Cấp lại A1', () => {
    const a = blocked(run(at1509(), 'revokeA1'), 'grantA2')
    expect(a.reason).toBe('Cần quyền đối soát A1 đang hoạt động')
    expect(a.fix).toEqual({ label: 'Cấp lại A1', href: '#/techcombank/a1' })
  })
  it('Xem ước tính: cần A2 → Cấp A2 trên trang Techcombank', () => {
    const a = blocked(at1509(), 'viewEstimate')
    expect(a.reason).toBe('Cần quyền đánh giá tín dụng A2')
    expect(a.fix).toEqual({ label: 'Cấp A2 trên trang Techcombank', href: '#/techcombank/a2' })
  })
  it('Ký A4: Mùa cao điểm → Tắt Mùa cao điểm (bảng Mô phỏng)', () => {
    const a = blocked(run(estimated(), 'togglePeakSeason'), 'signA4')
    expect(a.reason).toBe('Mô phỏng mùa cao điểm chỉ minh họa ước tính; chưa có dữ liệu khoản vay mùa cao điểm')
    expect(a.fix).toEqual({ label: 'Tắt Mùa cao điểm', href: '#/mo-phong' })
  })
  it('Ký A4: đóng băng → Giải trình ở Khoản vay', () => {
    const a = blocked(accountChangeAt(4), 'signA4')
    expect(a.reason).toBe('Cấp vốn mới đang tạm dừng')
    expect(a.fix).toEqual({ label: 'Giải trình ở Khoản vay', href: '#/nha-ban/khoan-vay' })
  })
  it('Ký A4: chưa xem ước tính → Xem ước tính', () => {
    const a = blocked(withA2(), 'signA4')
    expect(a.reason).toBe('Cần xem ước tính trước khi ký')
    expect(a.fix.href).toBe('#/nha-ban/ung-von')
  })
  it('Ký A4: đã có khoản vay đang hoạt động → Xem khoản vay', () => {
    const a = blocked(disbursed(), 'signA4')
    expect(a.reason).toBe('Đã có khoản vay đang hoạt động')
    expect(a.fix.href).toBe('#/nha-ban/khoan-vay')
  })
  it('Gửi đề nghị: cần ký A4 → Ký A4; A2 đã bị rút → Cấp lại A2', () => {
    let a = blocked(estimated(), 'submit')
    expect(a.reason).toBe('Cần ký thỏa thuận A4')
    expect(a.fix).toEqual({ label: 'Ký A4', href: '#/techcombank/a4' })
    a = blocked(run(signed(), 'revokeA2'), 'submit')
    expect(a.reason).toBe('A2 đã bị rút')
    expect(a.fix).toEqual({ label: 'Cấp lại A2', href: '#/techcombank/a2' })
  })
  it('Trả nợ một chạm: tiền sàn chưa về → Tua tới sự kiện tiếp theo', () => {
    let a = blocked(disbursed(), { type: 'repay', unit: 'RU-03' })
    expect(a.reason).toBe('Shopee chưa thanh toán RU-03 (cửa sổ 18–21/09)')
    expect(a.fix).toEqual({ label: 'Tua tới sự kiện tiếp theo', href: '#/mo-phong/tua' })
    a = blocked(at1909(), { type: 'repay', unit: 'RU-04' })
    expect(a.reason).toBe('TikTok Shop chưa thanh toán RU-04 (cửa sổ 19–22/09)')
    expect(availability(at1909(), { type: 'repay', unit: 'RU-03' }).ok).toBe(true)
  })
  it('Trả nợ một chạm: Đổi tài khoản, 19/09 RU-03 vẫn chưa về (2.2)', () => {
    const a = blocked(accountChangeAt(1), { type: 'repay', unit: 'RU-03' })
    expect(a.reason).toBe('Shopee chưa thanh toán RU-03 (cửa sổ 18–21/09)')
    expect(a.fix.href).toBe('#/mo-phong/tua')
  })
  it('Giải trình: chỉ khi RU-03 đứt gãy và chưa giải trình', () => {
    const a = blocked(accountChangeAt(3), 'resolveAccountChange')
    expect(a.reason).toBe('Chỉ giải trình khi RU-03 đứt gãy')
    expect(a.fix).toBeNull()
    expect(availability(accountChangeAt(4), 'resolveAccountChange').ok).toBe(true)
  })
  it('Rút A1: chỉ khi A1 đang hoạt động', () => {
    const a = blocked(start(), 'revokeA1')
    expect(a.reason).toBe('Quyền A1 không ở trạng thái đang hoạt động')
    expect(a.fix).toBeNull()
  })
  it('Rút A2: chỉ khi A2 đang hoạt động', () => {
    const a = blocked(at1509(), 'revokeA2')
    expect(a.reason).toBe('Quyền A2 không ở trạng thái đang hoạt động')
    expect(a.fix).toBeNull()
  })
  it('Rút A4: không bao giờ khi còn dư nợ (quy-tac mục 3)', () => {
    const a = blocked(disbursed(), 'revokeA4')
    expect(a.reason).toBe('Không rút được khi còn dư nợ — thỏa thuận chấm dứt khi khoản vay tất toán')
    expect(a.fix).toBeNull()
    expect(availability(signed(), 'revokeA4').ok).toBe(true)
  })
  it('Xuất hồ sơ doanh thu đã xác thực: chưa có → Tua tới 15/09', () => {
    const a = blocked(connected(), 'exportProfile')
    expect(a.reason).toBe('Chưa có doanh thu đã xác thực')
    expect(a.fix).toEqual({ label: 'Tua tới 15/09', href: '#/mo-phong/tua' })
  })
})

describe('availability — G.2 Cán bộ Techcombank', () => {
  const noA2 = 'Nhà bán chưa cấp (hoặc đã rút) quyền A2 — ngân hàng không xem được hồ sơ'
  it('Xem hồ sơ trong Tra cứu: cần A2 → Đổi sang vai Nhà bán', () => {
    const a = blocked(run(disbursed(), 'revokeA2'), 'viewProfile')
    expect(a.reason).toBe(noA2)
    expect(a.fix).toEqual({ label: 'Đổi sang vai Nhà bán', href: '#/mo-phong/doi-vai' })
  })
  it('Xem chứng thư khóa: chưa có khóa → thông tin, không nút', () => {
    const a = blocked(withA2(), 'viewCertificate')
    expect(a.reason).toBe('Chưa có khóa nào')
    expect(a.fix).toBeNull()
    expect(availability(disbursed(), 'viewCertificate').ok).toBe(true)
  })
  it('Gửi lại lệnh khóa (D): chưa có khóa', () => {
    const a = blocked(withA2(), 'resendLock')
    expect(a.reason).toBe('Chưa có khóa để gửi lại')
    expect(a.fix).toBeNull()
  })
  it('Minh họa phơi nhiễm chéo: cần A2', () => {
    const a = blocked(at1509(), 'crossExposure')
    expect(a.reason).toBe(noA2)
    expect(a.fix.href).toBe('#/mo-phong/doi-vai')
  })
  it('Danh mục khóa của Techcombank trống khi bên khóa là Ngân hàng B (3.16)', () => {
    const s = run(phase3Quotes(), { type: 'chooseQuote', lender: 'Ngân hàng B' }, 'signA4')
    expect(availability(s, 'viewCertificate').ok).toBe(false)
  })
})

describe('availability — G.3 Bảng điều khiển mô phỏng', () => {
  it('Tua: cần kết nối A1', () => {
    const a = blocked(start(), 'advance')
    expect(a.reason).toBe('Cần kết nối A1')
    expect(a.fix).toEqual({ label: 'Kết nối Techcombank', href: '#/techcombank/a1' })
  })
  it('Tua: A1 đã rút → Cấp lại A1', () => {
    const a = blocked(run(connected(), 'revokeA1'), 'advance')
    expect(a.reason).toBe('Nền tảng không nhận dữ liệu khi A1 đã rút')
    expect(a.fix).toEqual({ label: 'Cấp lại A1', href: '#/techcombank/a1' })
  })
  it('Tua: 15/09 chưa giải ngân → Đi tới Ứng vốn', () => {
    const a = blocked(at1509(), 'advance')
    expect(a.reason).toBe('Mô phỏng dừng ở 15/09 tới khi bạn nhận giải ngân')
    expect(a.fix).toEqual({ label: 'Đi tới Ứng vốn', href: '#/nha-ban/ung-von' })
  })
  it('Tua: khoản vay với bên khác Techcombank → Chọn lại chào giá', () => {
    const s = run(phase3Quotes(), { type: 'chooseQuote', lender: 'Ngân hàng B' }, 'signA4')
    const a = blocked(s, 'advance')
    expect(a.reason).toBe('Dòng tất toán trong mô phỏng chỉ dựng cho Techcombank')
    expect(a.fix).toEqual({ label: 'Chọn lại chào giá', href: '#/nha-ban/ung-von' })
  })
  it('Tua: không còn sự kiện → Bắt đầu lại (1.22, 2.9)', () => {
    for (const s of [fullyRepaid(), accountChangeAt(4)]) {
      const a = blocked(s, 'advance')
      expect(a.reason).toBe('Không còn sự kiện')
      expect(a.fix).toEqual({ label: 'Bắt đầu lại', href: '#/mo-phong/bat-dau-lai' })
    }
  })
  it('Mùa cao điểm: đã có khoản vay → Bắt đầu lại', () => {
    const a = blocked(signed(), 'togglePeakSeason')
    expect(a.reason).toBe('Đã có khoản vay kỳ thường')
    expect(a.fix.href).toBe('#/mo-phong/bat-dau-lai')
  })
  it('Đổi tài khoản nhận tiền: sự kiện 19/09 đã diễn ra → Bắt đầu lại', () => {
    const a = blocked(at1909(), 'toggleAccountChange')
    expect(a.reason).toBe('Sự kiện 19/09 đã diễn ra')
    expect(a.fix.href).toBe('#/mo-phong/bat-dau-lai')
    expect(availability(disbursed(), 'toggleAccountChange').ok).toBe(true)
  })
  it('Giai đoạn 3: đã có khoản vay với Techcombank → Bắt đầu lại', () => {
    const a = blocked(disbursed(), 'togglePhase3')
    expect(a.reason).toBe('Đã có khoản vay với Techcombank')
    expect(a.fix.href).toBe('#/mo-phong/bat-dau-lai')
  })
  it('Đổi vai và Bắt đầu lại: luôn bấm được (không có trường hợp vô hiệu)', () => {
    for (const s of [start(), disbursed(), accountChangeAt(4), fullyRepaid()]) {
      expect(availability(s, 'switchRole').ok).toBe(true)
      expect(availability(s, 'reset').ok).toBe(true)
    }
  })
})

// ─── Reducer ──────────────────────────────────────────────────────────────────

describe('reducer', () => {
  it('hành động không đủ điều kiện → trả về đúng trạng thái cũ (phím bị chặn không đổi gì)', () => {
    const s = at1509()
    expect(reducer(s, { type: 'advance' })).toBe(s)
    expect(reducer(s, { type: 'submit' })).toBe(s)
  })
  it('action lạ → giữ nguyên', () => {
    const s = start()
    expect(reducer(s, { type: 'khong-co' })).toBe(s)
  })
  it('Bắt đầu lại → trạng thái khởi đầu, hiện lại màn chào', () => {
    const s = run(fullyRepaid(), { type: 'welcome', mode: 'guided' }, 'reset')
    expect(s).toEqual(initialState())
    expect(s.guide.welcomeDone).toBe(false)
  })
  it('Đổi vai không đổi dữ liệu', () => {
    const s = run(disbursed(), 'switchRole')
    expect(s.role).toBe('officer')
    expect(loan(s).debt).toBe(85)
    expect(run(s, 'switchRole').role).toBe('seller')
  })
  it('gửi lại lệnh khóa: DA_GHI_NHAN, sổ không thêm sự kiện', () => {
    const s = disbursed()
    expect(resendLock(s).status).toBe('DA_GHI_NHAN')
    expect(s.registry).toHaveLength(2)
  })
})

// ─── Hành trình tích hợp ─────────────────────────────────────────────────────

describe('Hành trình 1 — dư nợ 85 → 38,25 → 0', () => {
  it('đi hết hành trình', () => {
    expect(loan(disbursed()).debt).toBe(85)
    expect(loan(repaidRU03()).debt).toBe(38.25)
    const end = fullyRepaid()
    expect(loan(end)).toMatchObject({ status: 'repaid', debt: 0 })
    expect(unitStatus(end, 'RU-03')).toBe('settled')
    expect(unitStatus(end, 'RU-04')).toBe('settled')
    expect(availability(end, 'revokeA4').reason).toBe('Thỏa thuận đã chấm dứt khi khoản vay tất toán')
  })
})

describe('Hành trình 2 — Đổi tài khoản nhận tiền', () => {
  it('RU-03 đứt gãy 24/09, đóng băng, sổ khóa KHÔNG bị xóa', () => {
    const before = disbursed().registry
    let s = run(disbursed(), 'toggleAccountChange')
    expect(s.registry).toEqual(before) // bật tình huống không đụng sổ khóa
    s = run(s, 'advance', 'advance', { type: 'repay', unit: 'RU-04' }, 'advance', 'advance')
    expect(simDate(s)).toBe('2027-09-24')
    expect(unitStatus(s, 'RU-03')).toBe('broken')
    expect(fundingFrozen(s)).toBe(true)
    expect(s.registry).toEqual(before)
    expect(loan(s).debt).toBe(46.75)
  })
  it('giải trình + trả 46,75 từ nguồn khác → dư nợ 0, mở lại cấp vốn', () => {
    const s = run(accountChangeAt(4), { type: 'repay', unit: 'RU-04' }, 'resolveAccountChange', { type: 'repay', unit: 'RU-03' })
    expect(loan(s).debt).toBe(0)
    expect(fundingFrozen(s)).toBe(false)
  })
})

describe('Giai đoạn 3', () => {
  it('lockPlan: phân bổ khóa theo tỷ lệ giá trị khả dụng (du-lieu mục 12) — trang ký A4 dùng', () => {
    expect(lockPlan(80).map((u) => [u.code, u.amount])).toEqual([['RU-03', 44], ['RU-04', 36]])
    expect(lockPlan(85).map((u) => u.amount)).toEqual([46.75, 38.25])
  })
  it('chọn bên nhận: chưa chọn ai → "Chọn ít nhất một bên nhận" (3.13)', () => {
    const s = run(at1509(), 'togglePhase3', 'grantA2')
    const a = blocked(s, { type: 'requestQuotes', recipients: [] })
    expect(a.reason).toBe('Chọn ít nhất một bên nhận')
  })
  it('chọn Công ty tài chính C (80): khóa RU-03 44 + RU-04 36', () => {
    const s = run(phase3Quotes(), { type: 'chooseQuote', lender: 'Công ty tài chính C' }, 'signA4')
    expect(s.registry.map((e) => [e.unitId, e.lenderId, e.amount])).toEqual([
      ['RU-03', 'Công ty tài chính C', 44],
      ['RU-04', 'Công ty tài chính C', 36],
    ])
    expect(loan(s)).toMatchObject({ lender: 'Công ty tài chính C', principal: 80 })
    expect(bankView(s).remainingAvailable).toBe(5) // 2,75 + 2,25 còn trống trên sổ
  })
  it('chọn Ngân hàng B (85): khóa theo T1 46,75 + 38,25', () => {
    const s = run(phase3Quotes(), { type: 'chooseQuote', lender: 'Ngân hàng B' }, 'signA4')
    expect(s.registry.map((e) => e.amount)).toEqual([46.75, 38.25])
    expect(bankView(s)).toMatchObject({ totalConsolidatedExposure: 85, lenderCount: 1, remainingAvailable: 0 })
  })
  it('chọn Techcombank: khoản vay đi tiếp như Giai đoạn 2', () => {
    const s = run(phase3Quotes(), { type: 'chooseQuote', lender: 'Techcombank' }, 'signA4', 'advance')
    expect(loan(s)).toMatchObject({ lender: 'Techcombank', debt: 85 })
    expect(simDate(s)).toBe('2027-09-19')
  })
  it('Chọn lại chào giá sau khi ký với B → gỡ khóa mô phỏng, chọn lại được', () => {
    const s = run(phase3Quotes(), { type: 'chooseQuote', lender: 'Ngân hàng B' }, 'signA4', 'rechooseQuote')
    expect(s.registry).toEqual([])
    expect(s.application.chosenLender).toBeNull()
    expect(availability(s, { type: 'chooseQuote', lender: 'Techcombank' }).ok).toBe(true)
  })
})

// ─── Không ngõ cụt: BFS trên reducer ──────────────────────────────────────────

const ALL_ACTIONS = [
  'grantA1', 'revokeA1', 'advance', 'grantA2', 'revokeA2', 'viewEstimate', 'signA4', 'revokeA4', 'submit',
  { type: 'repay', unit: 'RU-03' }, { type: 'repay', unit: 'RU-04' }, 'resolveAccountChange',
  'togglePeakSeason', 'toggleAccountChange', 'togglePhase3',
  { type: 'requestQuotes', recipients: ['Techcombank', 'Ngân hàng B', 'Công ty tài chính C'] },
  { type: 'chooseQuote', lender: 'Techcombank' }, { type: 'chooseQuote', lender: 'Ngân hàng B' },
  { type: 'chooseQuote', lender: 'Công ty tài chính C' }, 'rechooseQuote',
]
const CHECKED = [...ALL_ACTIONS, 'viewReconciliation', 'openFunding', 'exportProfile', 'viewProfile', 'viewCertificate', 'resendLock', 'crossExposure']
// Đường dẫn sửa lỗi phải dẫn tới một hành động làm được ngay
const FIX_TARGET = {
  '#/mo-phong/tua': 'advance',
  '#/techcombank/a1': 'grantA1',
  '#/techcombank/a2': 'grantA2',
  '#/techcombank/a4': 'signA4',
}

describe('Không ngõ cụt (BFS, độ sâu 14)', () => {
  it('mọi đường dẫn sửa lỗi trỏ tới hành động bấm được; không NaN', () => {
    const key = (s) => JSON.stringify({ ...s, userLog: [], visited: {} })
    const seen = new Set([key(start())])
    let frontier = [start()]
    for (let depth = 0; depth < 14 && frontier.length; depth++) {
      const next = []
      for (const s of frontier) {
        for (const action of CHECKED) {
          const a = availability(s, action)
          if (!a.ok) {
            expect(a.reason, JSON.stringify(action)).toBeTruthy()
            const target = a.fix && FIX_TARGET[a.fix.href]
            if (target) expect(availability(s, target).ok, `${JSON.stringify(action)} → ${a.fix.href}`).toBe(true)
          }
        }
        expect(Number.isNaN(loan(s).debt)).toBe(false)
        expect(Number.isNaN(bankView(s).totalConsolidatedExposure)).toBe(false)
        for (const action of ALL_ACTIONS) {
          const n = reducer(s, typeof action === 'string' ? { type: action } : action)
          const k = key(n)
          if (!seen.has(k)) {
            seen.add(k)
            next.push(n)
          }
        }
      }
      frontier = next
    }
    expect(seen.size).toBeGreaterThan(50)
  })
})

// ─── localStorage ─────────────────────────────────────────────────────────────

function memoryStorage(initial = {}) {
  const data = { ...initial }
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v)
    },
  }
}

describe('loadState / saveState', () => {
  it('lưu rồi đọc lại → giữ nguyên tiến trình', () => {
    const storage = memoryStorage()
    saveState(disbursed(), storage)
    expect(loadState(storage)).toEqual(disbursed())
    expect(STORAGE_KEY).toBe('ddva-app-v1')
  })
  it('chưa có gì → trạng thái khởi đầu', () => {
    expect(loadState(memoryStorage())).toEqual(initialState())
  })
  it('JSON hỏng → trạng thái khởi đầu', () => {
    expect(loadState(memoryStorage({ [STORAGE_KEY]: '{hỏng' }))).toEqual(initialState())
  })
  it('sai version → trạng thái khởi đầu', () => {
    const old = JSON.stringify({ ...disbursed(), version: 0 })
    expect(loadState(memoryStorage({ [STORAGE_KEY]: old }))).toEqual(initialState())
  })
  it('không phải object → trạng thái khởi đầu', () => {
    expect(loadState(memoryStorage({ [STORAGE_KEY]: '42' }))).toEqual(initialState())
    expect(loadState(memoryStorage({ [STORAGE_KEY]: 'null' }))).toEqual(initialState())
  })
  it('localStorage bị chặn (ném lỗi) → đọc ra khởi đầu, ghi không ném', () => {
    const broken = {
      getItem: () => {
        throw new Error('SecurityError')
      },
      setItem: () => {
        throw new Error('QuotaExceeded')
      },
    }
    expect(loadState(broken)).toEqual(initialState())
    expect(() => saveState(disbursed(), broken)).not.toThrow()
  })
  it('không có localStorage (môi trường node) → khởi đầu', () => {
    expect(loadState(undefined)).toEqual(initialState())
  })
})

// ─── Vòng 26: chống vỡ ────────────────────────────────────────────────────────

// Mọi giá trị trong kết quả selector: không NaN/Infinity, không undefined, không chữ "undefined"/"NaN"
function assertClean(value, path) {
  if (value === undefined) throw new Error(`undefined tại ${path}`)
  if (typeof value === 'number') expect(Number.isFinite(value), path).toBe(true)
  else if (typeof value === 'string') expect(/undefined|NaN/.test(value), `${path}: ${value}`).toBe(false)
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) assertClean(v, `${path}.${k}`)
}
const PAGES_ALL = ['tong-quan', 'doi-soat', 'khoan-phai-thu', 'ung-von', 'khoan-vay', 'quyen-du-lieu', 'tra-cuu', 'danh-muc-khoa', 'canh-bao']
function assertRenderable(s) {
  assertClean(simDate(s), 'simDate')
  assertClean(loan(s), 'loan')
  assertClean(bankView(s), 'bankView')
  assertClean(accessLog(s), 'accessLog')
  assertClean(tasks(s), 'tasks')
  assertClean(activeUnits(s), 'activeUnits')
  for (const page of PAGES_ALL) assertClean(nextStep(s, page), `nextStep(${page})`)
  for (const code of ['RU-01', 'RU-02', 'RU-03', 'RU-04', 'RU-05']) unitStatus(s, code)
  for (const action of CHECKED) assertClean(availability(s, action), `availability(${JSON.stringify(action)})`)
}

describe('Vòng 26 — chống vỡ', () => {
  it('trả nợ đơn vị không thuộc khoản vay (sửa ?don-vi= bằng tay) → chặn, không ném', () => {
    for (const s of [start(), disbursed(), at1909(), at2009(), fullyRepaid(), accountChangeAt(3)]) {
      for (const unit of ['RU-05', 'XYZ', undefined]) {
        const a = availability(s, { type: 'repay', unit })
        expect(a.ok).toBe(false)
        expect(a.reason).toBeTruthy()
        expect(reducer(s, { type: 'repay', unit })).toBe(s)
      }
    }
  })

  it('bấm nhanh nhiều lần: action lặp lại không đổi kết quả', () => {
    const twice = (s, a) => run(s, a, a, a)
    expect(twice(estimated(), 'signA4')).toEqual(signed())
    expect(twice(signed(), 'submit')).toEqual(disbursed())
    expect(twice(at1909(), { type: 'repay', unit: 'RU-03' })).toEqual(repaidRU03())
    expect(twice(connected(), 'grantA1')).toEqual(connected())
  })

  it('bật/tắt từng tình huống ở mọi ngày mô phỏng: không ném, không NaN/undefined', () => {
    const TOGGLES = ['togglePeakSeason', 'toggleAccountChange', 'togglePhase3']
    const days = [start(), connected(), at1509(), estimated(), signed(), disbursed(), at1909(), repaidRU03(), at2009(), fullyRepaid(),
      accountChangeAt(1), accountChangeAt(2), accountChangeAt(3), accountChangeAt(4), phase3Quotes()]
    for (const day of days) {
      for (const t of TOGGLES) {
        const once = run(day, t)
        const back = run(once, t)
        assertRenderable(once)
        assertRenderable(back)
        // Bật rồi tắt được thì về đúng như cũ (trừ Giai đoạn 3: xóa hồ sơ đề nghị theo thiết kế)
        if (t !== 'togglePhase3' && once !== day) expect(back).toEqual(day)
      }
    }
  })

  it('chuỗi thao tác ngẫu nhiên (80 × 30 bước, có đổi vai) → luôn hiển thị được', () => {
    let seed = 26
    const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31)
    const pool = [...ALL_ACTIONS, 'switchRole', { type: 'repay', unit: 'RU-05' }, { type: 'visit', key: 'officer:tra-cuu' }]
    for (let i = 0; i < 80; i++) {
      let s = start()
      for (let j = 0; j < 30; j++) {
        const a = pool[Math.floor(rand() * pool.length)]
        s = reducer(s, typeof a === 'string' ? { type: a } : a)
        assertRenderable(s)
      }
    }
  })

  it('localStorage đúng version nhưng sai cấu trúc → trạng thái khởi đầu', () => {
    const base = disbursed()
    const broken = [
      { scenario: null },
      { scenario: { peakSeason: 'có' } },
      { consents: {} },
      { consents: { A1: 'active', A2: 'active', A4: 'hỏng' } },
      { eventIndex: 99 },
      { eventIndex: -1 },
      { eventIndex: '1' },
      { role: 'admin' },
      { registry: 'x' },
      { registry: [{}] },
      { registry: [{ lenderId: 'Techcombank', unitId: 'RU-03', amount: 'nhiều' }] },
      { repaid: null },
      { userLog: [{ eventIndex: 42, actor: 'a', purpose: 'b', data: 'c' }] },
      { visited: null },
      { guide: null },
      { application: null },
      { application: { ...base.application, chosenLender: 'Ngân hàng X' } },
      { application: { ...base.application, quoteRequest: { recipients: 'Techcombank' } } },
      { accountChangeResolved: 'rồi' },
    ]
    for (const patch of broken) {
      const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify({ ...base, ...patch }) })
      expect(loadState(storage), JSON.stringify(patch)).toEqual(initialState())
    }
  })

  it('bản lưu thiếu trường mới (cùng version) → bổ sung mặc định, giữ tiến trình', () => {
    const { guide, visited, ...old } = disbursed()
    const loaded = loadState(memoryStorage({ [STORAGE_KEY]: JSON.stringify(old) }))
    expect(loaded.registry).toEqual(disbursed().registry)
    expect(loaded.guide).toEqual(initialState().guide)
  })

  it('mọi trạng thái của hành trình lưu rồi đọc lại → giữ nguyên', () => {
    for (const s of [fullyRepaid(), accountChangeAt(4), run(phase3Quotes(), { type: 'chooseQuote', lender: 'Ngân hàng B' }, 'signA4'), run(start(), 'switchRole', { type: 'welcome', mode: 'explore' })]) {
      const storage = memoryStorage()
      saveState(s, storage)
      expect(loadState(storage)).toEqual(s)
    }
  })
})
