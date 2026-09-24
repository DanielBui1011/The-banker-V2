// Trạng thái miền và logic hành trình — docs/san-pham.md mục E.1, F, G, D.2, D.3.
// Hàm thuần, không import React. Chỉ lưu dữ kiện gốc; mọi thứ khác suy ra bằng selector.
// Số liệu lấy từ src/data/mockData.js; công thức dùng lại pricing.js / registry.js (không đổi).

import {
  SELLER_PROFILE,
  DEMO_DATE,
  RECEIVABLE_UNITS,
  MEGA_SALE_UNITS,
  PRICING_PARAMS,
  SETTLEMENT_TIMELINE_NORMAL,
  SETTLEMENT_TIMELINE_LEAK,
  ACCESS_LOG,
  CROSS_EXPOSURE_EXAMPLE,
  LENDER_QUOTES,
  LOCK_CERTIFICATE,
} from '../data/mockData.js'
import { computeAvailableValue } from './pricing.js'
import { lockUnit } from './registry.js'
import { formatNumberVN } from '../utils/format.js'

export const STORAGE_KEY = 'ddva-app-v1'
const VERSION = 1
const TCB = LOCK_CERTIFICATE.secured // 'Techcombank'

// Đường dẫn URL hash (san-pham.md mục F). '#/mo-phong/*' là lệnh của bảng Mô phỏng.
export const ROUTES = {
  tongQuan: '#/nha-ban/tong-quan',
  doiSoat: '#/nha-ban/doi-soat',
  khoanPhaiThu: '#/nha-ban/khoan-phai-thu',
  ungVon: '#/nha-ban/ung-von',
  khoanVay: '#/nha-ban/khoan-vay',
  quyen: '#/nha-ban/quyen-du-lieu',
  a1: '#/techcombank/a1',
  a2: '#/techcombank/a2',
  a4: '#/techcombank/a4',
  traNo: '#/techcombank/tra-no',
  traCuu: '#/ngan-hang/tra-cuu',
  danhMucKhoa: '#/ngan-hang/danh-muc-khoa',
  canhBao: '#/ngan-hang/canh-bao',
  moPhong: '#/mo-phong',
  tua: '#/mo-phong/tua',
  batDauLai: '#/mo-phong/bat-dau-lai',
  doiVai: '#/mo-phong/doi-vai',
}

// ─── Chuỗi sự kiện E0–E5 (mục E.1) ────────────────────────────────────────────
const timelineDate = (timeline, id) => timeline.find((m) => m.id === id).isoDate
const E_NORMAL = [
  { id: 'E0', date: SELLER_PROFILE.connectedDate },
  { id: 'E1', date: DEMO_DATE },
  { id: 'E2', date: timelineDate(SETTLEMENT_TIMELINE_NORMAL, 'ru03-pay') },
  { id: 'E3', date: timelineDate(SETTLEMENT_TIMELINE_NORMAL, 'ru04-pay') },
]
const E_ACCOUNT_CHANGE = [
  ...E_NORMAL,
  { id: 'E4', date: timelineDate(SETTLEMENT_TIMELINE_LEAK, 'leak-window-closed') },
  { id: 'E5', date: timelineDate(SETTLEMENT_TIMELINE_LEAK, 'leak-broken') },
]
const E1 = 1
const E2 = 2
const E3 = 3
const E5 = 5

export const events = (state) => (state.scenario.accountChange ? E_ACCOUNT_CHANGE : E_NORMAL)
const ddmm = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`

// ─── Trạng thái khởi đầu (mục F) ──────────────────────────────────────────────
export function initialState() {
  return {
    version: VERSION,
    role: 'seller',
    eventIndex: 0,
    scenario: { peakSeason: false, accountChange: false, phase3: false },
    consents: { A1: 'none', A2: 'none', A4: 'none' },
    application: { estimateViewed: false, quoteRequest: null, chosenLender: null, submitted: false },
    registry: [],
    repaid: { 'RU-03': false, 'RU-04': false },
    accountChangeResolved: false,
    userLog: [],
    visited: {}, // khóa trang → eventIndex của lần mở gần nhất
    guide: { welcomeDone: false, mode: 'guided', checklistOpen: true },
  }
}

const round2 = (n) => Math.round(n * 100) / 100

// ─── Định giá và khóa ────────────────────────────────────────────────────────
const NORMAL_UNITS = RECEIVABLE_UNITS.filter((u) => u.code === 'RU-03' || u.code === 'RU-04')
// Giá trị khả dụng từng đơn vị = kết quả T1 (46,75 / 38,25), tính bằng computeAvailableValue
const NORMAL_PRICING = computeAvailableValue({ units: NORMAL_UNITS, params: PRICING_PARAMS.normal })
const UNIT_AVAILABLE = Object.fromEntries(NORMAL_PRICING.unitBreakdown.map((u) => [u.code, u.formulaValue]))
const TOTAL_AVAILABLE = NORMAL_PRICING.result

// Khóa theo tỷ lệ giá trị khả dụng (du-lieu.md mục 12): khoản = giá trị chào × khả dụng đơn vị / 85
function lockAll(registry, lender, value) {
  return NORMAL_UNITS.reduce(
    (reg, u) =>
      lockUnit(reg, {
        lenderId: lender,
        unitId: u.code,
        requestId: `${LOCK_CERTIFICATE.certificateId}-${u.code.replace('-', '')}`,
        amount: round2((value * UNIT_AVAILABLE[u.code]) / TOTAL_AVAILABLE),
        availableValue: UNIT_AVAILABLE[u.code],
      }).registry,
    registry
  )
}

// Techcombank gửi lại lệnh khóa (phím D) — lũy đẳng, không thêm sự kiện
export function resendLock(state) {
  const event = state.registry.find((e) => e.lenderId === TCB)
  if (!event) return null
  return lockUnit(state.registry, { ...event, availableValue: event.amount }).result
}

// ─── Selectors (mục F) ───────────────────────────────────────────────────────
export const simDate = (state) => events(state)[state.eventIndex].date

export function activeUnits(state) {
  return state.scenario.peakSeason ? MEGA_SALE_UNITS : NORMAL_UNITS
}

const isBroken = (state) => state.scenario.accountChange && state.eventIndex >= E5

export function unitStatus(state, code) {
  if (state.eventIndex < E1) return null // 01/08: chưa có lô, chưa có đơn vị (mục E)
  if (code === 'RU-03' && isBroken(state)) return 'broken' // giữ trong lịch sử dù đã trả
  if (state.repaid[code]) return 'settled'
  if (state.registry.some((e) => e.unitId === code)) return 'locked'
  const unit = [...RECEIVABLE_UNITS, ...MEGA_SALE_UNITS].find((u) => u.code === code)
  if (!unit) return null
  if (unit.status === 'settled') return 'settled'
  if (unit.status === 'reversed') return 'reversed'
  if (unit.status === 'projected-insufficient-history') return 'insufficient-history'
  return 'verified'
}

export function loan(state) {
  const reg = state.registry
  if (reg.length === 0) return { status: 'none', lender: null, principal: 0, debt: 0 }
  const principal = round2(reg.reduce((sum, e) => sum + e.amount, 0))
  const debt = Math.max(0, round2(reg.reduce((sum, e) => sum + (state.repaid[e.unitId] ? 0 : e.amount), 0)))
  return { status: debt === 0 ? 'repaid' : 'disbursed', lender: reg[0].lenderId, principal, debt }
}

export const fundingFrozen = (state) => isBroken(state) && !state.accountChangeResolved

// Loại dòng du-lieu mục 9 theo điều kiện hành động đã xảy ra
function logLineHappened(state, line) {
  if (line.purpose.startsWith('A1')) return state.consents.A1 !== 'none'
  if (line.purpose.startsWith('A2')) return state.consents.A2 !== 'none'
  // A4 — đăng ký bảo đảm với Techcombank: đã ký A4 với Techcombank
  const a4Lender = state.scenario.phase3 ? state.application.chosenLender : TCB
  return state.consents.A4 === 'signed' && a4Lender === TCB
}

export function accessLog(state) {
  const today = simDate(state)
  const fixed = ACCESS_LOG.map((l) => {
    const [date, time] = l.timestamp.split(' ')
    return { date, time, actor: l.actor, purpose: l.purpose, data: l.data, source: 'data' }
  }).filter((l) => l.date <= today && logLineHappened(state, l))
  // ponytail: giờ của dòng do người dùng tạo chưa có số trong du-lieu.md → time: null (chờ nhóm quyết)
  const user = state.userLog.map((l) => ({
    date: events(state)[l.eventIndex].date,
    time: null,
    actor: l.actor,
    purpose: l.purpose,
    data: l.data,
    source: 'user',
  }))
  return [...fixed, ...user].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
}

// Góc nhìn ngân hàng tại ngày mô phỏng — không bao giờ chứa tên bên khóa (quy-tac mục 5).
// Mùa cao điểm không áp: du-lieu.md chưa có khả dụng từng đơn vị khi bị chặn trần.
// Đơn vị ngân hàng tra cứu được (du-lieu mục 11): chưa tất toán, chưa hoàn — RU-03, RU-04, RU-05
const BANK_UNITS = RECEIVABLE_UNITS.filter((u) => u.status !== 'settled' && u.status !== 'reversed')

export function bankView(state) {
  const units =
    state.eventIndex < E1
      ? []
      : BANK_UNITS.map((u) => {
          const live = state.registry.filter((e) => e.unitId === u.code && !state.repaid[u.code])
          return {
            code: u.code,
            status: unitStatus(state, u.code),
            projectedNetValue: u.projectedNetValue,
            availableValue: u.code in UNIT_AVAILABLE ? round2(UNIT_AVAILABLE[u.code]) : null,
            lockedAmount: round2(live.reduce((sum, e) => sum + e.amount, 0)),
            lockerCount: new Set(live.map((e) => e.lenderId)).size,
          }
        })
  const liveLocks = state.registry.filter((e) => !state.repaid[e.unitId])
  const cross = computeAvailableValue({
    units: NORMAL_UNITS,
    params: PRICING_PARAMS.normal,
    lockedByOthers: CROSS_EXPOSURE_EXAMPLE.otherLockedAmount,
  })
  return {
    units,
    totalConsolidatedExposure: round2(units.reduce((sum, u) => sum + u.lockedAmount, 0)),
    lenderCount: new Set(liveLocks.map((e) => e.lenderId)).size,
    // Phần còn trống trên sổ = khả dụng − đã khóa (cùng quy tắc lockUnit); đơn vị đã tất toán/đứt gãy không khóa được
    remainingAvailable: round2(
      units
        .filter((u) => u.status === 'verified' || u.status === 'locked')
        .reduce((sum, u) => sum + Math.max(0, (u.availableValue ?? 0) - u.lockedAmount), 0)
    ),
    crossExposureExample: { otherLockedAmount: cross.lockedByOthers, remainingAvailable: cross.result },
    alerts: isBroken(state) ? [{ unit: 'RU-03', date: E_ACCOUNT_CHANGE[E5].date }] : [],
  }
}

// ─── availability (mục G) ────────────────────────────────────────────────────
const OK = { ok: true, reason: null, fix: null }
const no = (reason, fix = null) => ({ ok: false, reason, fix })
const link = (label, href) => ({ label, href })
const TO_RESET = link('Bắt đầu lại', ROUTES.batDauLai)
const TO_SELLER = link('Đổi sang vai Nhà bán', ROUTES.doiVai)
const NO_A2_BANK = 'Nhà bán chưa cấp (hoặc đã rút) quyền A2 — ngân hàng không xem được hồ sơ'

const a1Fix = (state) =>
  state.consents.A1 === 'none' ? link('Kết nối Techcombank', ROUTES.a1) : link('Cấp lại A1', ROUTES.a1)

// Đường dẫn tới trang A2 — nếu chưa cấp được thì dùng đường sửa của Cấp A2
const a2Fix = (state, label) => {
  const grant = availability(state, 'grantA2')
  return grant.ok ? link(label, ROUTES.a2) : grant.fix
}

// Đường dẫn "Tua tới 15/09" — nếu chưa tua được thì dùng luôn đường sửa của nút Tua
function toE1Fix(state) {
  const adv = availability(state, 'advance')
  return adv.ok ? link(`Tua tới ${ddmm(E_NORMAL[E1].date)}`, ROUTES.tua) : adv.fix
}
function toNextEventFix(state) {
  const adv = availability(state, 'advance')
  return adv.ok ? link('Tua tới sự kiện tiếp theo', ROUTES.tua) : adv.fix
}

const paymentArrived = (state, code) =>
  code === 'RU-04'
    ? state.eventIndex >= E3
    : state.scenario.accountChange
      ? state.accountChangeResolved // trả từ nguồn khác sau khi giải trình (hanh-trinh 2.8)
      : state.eventIndex >= E2

const RULES = {
  // G.1 — Nhà bán
  grantA1: (s) =>
    s.consents.A1 !== 'active' ? OK : no('Tài khoản Techcombank đã kết nối', link('Xem Quyền & dữ liệu', ROUTES.quyen)),
  viewReconciliation: (s) => {
    if (s.consents.A1 === 'none') return no('Chưa kết nối', link('Kết nối Techcombank', ROUTES.a1))
    if (s.eventIndex < E1) return no('Đang tích lũy lịch sử', toE1Fix(s))
    return OK
  },
  openFunding: (s) => (s.eventIndex >= E1 ? OK : no('Chưa có khoản phải thu đã xác thực', toE1Fix(s))),
  exportProfile: (s) => (s.eventIndex >= E1 ? OK : no('Chưa có doanh thu đã xác thực', toE1Fix(s))),
  grantA2: (s) => {
    const open = RULES.openFunding(s)
    if (!open.ok) return open
    if (s.consents.A1 !== 'active') return no('Cần quyền đối soát A1 đang hoạt động', a1Fix(s))
    if (s.consents.A2 === 'active') return no('Quyền A2 đang hoạt động')
    return OK
  },
  viewEstimate: (s) => {
    const open = RULES.openFunding(s)
    if (!open.ok) return open
    return s.consents.A2 === 'active'
      ? OK
      : no('Cần quyền đánh giá tín dụng A2', a2Fix(s, 'Cấp A2 trên trang Techcombank'))
  },
  signA4: (s) => {
    if (s.scenario.peakSeason)
      return no(
        'Mô phỏng mùa cao điểm chỉ minh họa ước tính; chưa có dữ liệu khoản vay mùa cao điểm',
        link('Tắt Mùa cao điểm', ROUTES.moPhong)
      )
    if (fundingFrozen(s)) return no('Cấp vốn mới đang tạm dừng', link('Giải trình ở Khoản vay', ROUTES.khoanVay))
    if (s.registry.length > 0) return no('Đã có khoản vay đang hoạt động', link('Xem khoản vay', ROUTES.khoanVay))
    if (s.consents.A4 === 'signed') return no('Đã ký thỏa thuận A4', link('Đi tới Ứng vốn', ROUTES.ungVon))
    if (s.scenario.phase3) {
      if (!s.application.chosenLender) return no('Chọn một chào giá trước khi ký', link('Đi tới Ứng vốn', ROUTES.ungVon))
      return s.consents.A2 === 'active' ? OK : no('A2 đã bị rút', a2Fix(s, 'Cấp lại A2'))
    }
    if (!s.application.estimateViewed) return no('Cần xem ước tính trước khi ký', link('Xem ước tính', ROUTES.ungVon))
    return OK
  },
  submit: (s) => {
    if (s.scenario.phase3)
      return no('Ở Giai đoạn 3, đề nghị hoàn tất khi ký với bên được chọn', link('Đi tới Ứng vốn', ROUTES.ungVon))
    if (s.application.submitted) return no('Đã gửi đề nghị', link('Xem khoản vay', ROUTES.khoanVay))
    if (s.consents.A4 !== 'signed') {
      const sign = RULES.signA4(s)
      return no('Cần ký thỏa thuận A4', sign.ok ? link('Ký A4', ROUTES.a4) : sign.fix)
    }
    if (s.consents.A2 !== 'active') return no('A2 đã bị rút', a2Fix(s, 'Cấp lại A2'))
    return OK
  },
  repay: (s, { unit: code }) => {
    const l = loan(s)
    if (l.status === 'none') return no('Chưa có khoản vay', link('Đi tới Ứng vốn', ROUTES.ungVon))
    if (l.lender !== TCB)
      return no('Dòng tất toán trong mô phỏng chỉ dựng cho Techcombank', link('Chọn lại chào giá', ROUTES.ungVon))
    if (s.repaid[code]) return no(`Đã trả ${code}`)
    if (code === 'RU-03' && isBroken(s) && !s.accountChangeResolved)
      return no('RU-03 đứt gãy — tiền Shopee không về tài khoản Techcombank', link('Giải trình ở Khoản vay', ROUTES.khoanVay))
    if (!paymentArrived(s, code)) {
      const u = NORMAL_UNITS.find((x) => x.code === code)
      return no(`${u.channel} chưa thanh toán ${code} (cửa sổ ${u.settlementWindow})`, toNextEventFix(s))
    }
    return OK
  },
  resolveAccountChange: (s) => (fundingFrozen(s) ? OK : no('Chỉ giải trình khi RU-03 đứt gãy')),
  revokeA1: (s) => (s.consents.A1 === 'active' ? OK : no('Quyền A1 không ở trạng thái đang hoạt động')),
  revokeA2: (s) => (s.consents.A2 === 'active' ? OK : no('Quyền A2 không ở trạng thái đang hoạt động')),
  revokeA4: (s) => {
    const l = loan(s)
    if (l.status === 'disbursed') return no('Không rút được khi còn dư nợ — thỏa thuận chấm dứt khi khoản vay tất toán')
    if (l.status === 'repaid') return no('Thỏa thuận đã chấm dứt khi khoản vay tất toán')
    return s.consents.A4 === 'signed' ? OK : no('Chưa ký thỏa thuận A4')
  },

  // Giai đoạn 3 — chọn bên nhận, chào giá, chọn lại
  requestQuotes: (s, { recipients = [] }) => {
    if (!s.scenario.phase3) return no('Chỉ có ở Giai đoạn 3', link('Bật Giai đoạn 3', ROUTES.moPhong))
    if (s.consents.A2 !== 'active') return no('Cần quyền đánh giá tín dụng A2', a2Fix(s, 'Cấp A2 trên trang Techcombank'))
    if (s.registry.length > 0) return no('Đã có khoản vay đang hoạt động', link('Xem khoản vay', ROUTES.khoanVay))
    return recipients.length > 0 ? OK : no('Chọn ít nhất một bên nhận')
  },
  chooseQuote: (s, { lender }) => {
    if (!s.application.quoteRequest?.recipients.includes(lender))
      return no('Chưa có chào giá của bên này', link('Đi tới Ứng vốn', ROUTES.ungVon))
    if (s.registry.length > 0) return no('Đã ký với bên được chọn', link('Chọn lại chào giá', ROUTES.ungVon))
    return OK
  },
  rechooseQuote: (s) => {
    if (!s.application.chosenLender) return no('Chưa chọn chào giá nào')
    if (loan(s).lender === TCB) return no('Đã có khoản vay với Techcombank', TO_RESET)
    return OK
  },

  // G.2 — Cán bộ Techcombank
  viewProfile: (s) => (s.consents.A2 === 'active' ? OK : no(NO_A2_BANK, TO_SELLER)),
  crossExposure: (s) => (s.consents.A2 === 'active' ? OK : no(NO_A2_BANK, TO_SELLER)),
  viewCertificate: (s) => (s.registry.some((e) => e.lenderId === TCB) ? OK : no('Chưa có khóa nào')),
  resendLock: (s) => (s.registry.some((e) => e.lenderId === TCB) ? OK : no('Chưa có khóa để gửi lại')),

  // G.3 — Bảng điều khiển mô phỏng
  advance: (s) => {
    if (s.eventIndex + 1 >= events(s).length) return no('Không còn sự kiện', TO_RESET)
    if (s.consents.A1 === 'none') return no('Cần kết nối A1', a1Fix(s))
    if (s.consents.A1 !== 'active') return no('Nền tảng không nhận dữ liệu khi A1 đã rút', a1Fix(s))
    if (s.eventIndex + 1 === E2) {
      const l = loan(s)
      if (l.status === 'none')
        return no(`Mô phỏng dừng ở ${ddmm(E_NORMAL[E1].date)} tới khi bạn nhận giải ngân`, link('Đi tới Ứng vốn', ROUTES.ungVon))
      if (l.lender !== TCB)
        return no('Dòng tất toán trong mô phỏng chỉ dựng cho Techcombank', link('Chọn lại chào giá', ROUTES.ungVon))
    }
    return OK
  },
  togglePeakSeason: (s) =>
    s.consents.A4 === 'none' && s.registry.length === 0 ? OK : no('Đã có khoản vay kỳ thường', TO_RESET),
  toggleAccountChange: (s) =>
    s.eventIndex < E2 ? OK : no(`Sự kiện ${ddmm(E_NORMAL[E2].date)} đã diễn ra`, TO_RESET),
  togglePhase3: (s) => {
    if (s.registry.length > 0) return no(`Đã có khoản vay với ${loan(s).lender}`, TO_RESET)
    if (s.consents.A4 === 'signed') return no(`Đã có khoản vay với ${TCB}`, TO_RESET)
    return OK
  },
  switchRole: () => OK,
  reset: () => OK,
  // Không có điều kiện: ghi nhận trang đã mở, màn chào, danh sách nhiệm vụ
  visit: () => OK,
  welcome: () => OK,
  toggleChecklist: () => OK,
}

// availability(state, 'advance') hoặc availability(state, { type: 'repay', unit: 'RU-03' })
export function availability(state, action) {
  const { type, ...args } = typeof action === 'string' ? { type: action } : action
  const rule = RULES[type]
  return rule ? rule(state, args) : no('Hành động không xác định')
}

// ─── Reducer ─────────────────────────────────────────────────────────────────
const logLine = (state, purpose, data) => [
  ...state.userLog,
  { eventIndex: state.eventIndex, seq: state.userLog.length + 1, actor: SELLER_PROFILE.ownerName, purpose, data },
]

const APPLY = {
  grantA1: (s) => ({
    ...s,
    consents: { ...s.consents, A1: 'active' },
    userLog: s.consents.A1 === 'revoked' ? logLine(s, 'A1 — đối soát', 'Cấp lại quyền') : s.userLog,
  }),
  revokeA1: (s) => ({ ...s, consents: { ...s.consents, A1: 'revoked' }, userLog: logLine(s, 'A1 — đối soát', 'Rút quyền') }),
  grantA2: (s) => ({
    ...s,
    consents: { ...s.consents, A2: 'active' },
    userLog: s.consents.A2 === 'revoked' ? logLine(s, 'A2 — đánh giá tín dụng', 'Cấp lại quyền') : s.userLog,
  }),
  revokeA2: (s) => ({
    ...s,
    consents: { ...s.consents, A2: 'revoked' },
    userLog: logLine(s, 'A2 — đánh giá tín dụng', 'Rút quyền'),
  }),
  viewEstimate: (s) => ({ ...s, application: { ...s.application, estimateViewed: true } }),
  signA4: (s) => {
    const signedState = { ...s, consents: { ...s.consents, A4: 'signed' } }
    if (!s.scenario.phase3) return signedState
    // Giai đoạn 3: ký với bên được chọn → ghi sổ khóa ngay theo giá trị chào
    const quote = LENDER_QUOTES.find((q) => q.lender === s.application.chosenLender)
    return {
      ...signedState,
      registry: lockAll(s.registry, quote.lender, quote.value),
      application: { ...s.application, submitted: true },
    }
  },
  revokeA4: (s) => ({ ...s, consents: { ...s.consents, A4: 'none' } }),
  submit: (s) => ({
    ...s,
    registry: lockAll(s.registry, TCB, TOTAL_AVAILABLE),
    application: { ...s.application, submitted: true },
  }),
  repay: (s, { unit }) => ({ ...s, repaid: { ...s.repaid, [unit]: true } }),
  resolveAccountChange: (s) => ({ ...s, accountChangeResolved: true }),
  advance: (s) => ({ ...s, eventIndex: s.eventIndex + 1 }),
  togglePeakSeason: (s) => ({ ...s, scenario: { ...s.scenario, peakSeason: !s.scenario.peakSeason } }),
  // Không xóa sổ khóa (sửa điểm 0.4.6) — chỉ đổi nhánh sự kiện từ E2
  toggleAccountChange: (s) => ({ ...s, scenario: { ...s.scenario, accountChange: !s.scenario.accountChange } }),
  togglePhase3: (s) => ({
    ...s,
    scenario: { ...s.scenario, phase3: !s.scenario.phase3 },
    application: initialState().application,
  }),
  requestQuotes: (s, { recipients }) => ({
    ...s,
    application: { ...s.application, quoteRequest: { recipients: [...recipients] }, chosenLender: null },
  }),
  chooseQuote: (s, { lender }) => ({ ...s, application: { ...s.application, chosenLender: lender } }),
  // ponytail: gỡ sự kiện khỏi sổ là "tua ngược" của mô phỏng, không phải thao tác sổ thật
  rechooseQuote: (s) => ({
    ...s,
    registry: s.registry.filter((e) => e.lenderId !== s.application.chosenLender),
    consents: { ...s.consents, A4: 'none' },
    application: { ...s.application, chosenLender: null, submitted: false },
  }),
  switchRole: (s) => ({ ...s, role: s.role === 'seller' ? 'officer' : 'seller' }),
  reset: () => initialState(),
  visit: (s, { key }) => ({ ...s, visited: { ...s.visited, [key]: s.eventIndex } }),
  welcome: (s, { mode }) => ({ ...s, guide: { ...s.guide, welcomeDone: true, mode, checklistOpen: mode === 'guided' } }),
  toggleChecklist: (s) => ({ ...s, guide: { ...s.guide, checklistOpen: !s.guide.checklistOpen } }),
}

// Mọi action đi qua availability: không đủ điều kiện → trả về đúng state cũ
export function reducer(state, action) {
  const apply = APPLY[action.type]
  if (!apply || !availability(state, action).ok) return state
  return apply(state, action)
}

// ─── Nhiệm vụ (mục D.2) ──────────────────────────────────────────────────────
const seenAfterE1 = (state, key) => (state.visited[key] ?? -1) >= E1

export function tasks(state) {
  const l = loan(state)
  const tcbLoan = l.lender === TCB
  const items = [
    { id: 1, label: 'Kết nối tài khoản Techcombank', done: state.consents.A1 !== 'none', fix: link('Kết nối Techcombank', ROUTES.tongQuan) },
    {
      id: 2,
      label: 'Tua tới 15/09 và xem khoản phải thu đã xác thực',
      done: state.eventIndex >= E1 && seenAfterE1(state, 'seller:khoan-phai-thu'),
      fix: state.eventIndex >= E1 ? link('Mở Khoản phải thu', ROUTES.khoanPhaiThu) : toE1Fix(state),
    },
    { id: 3, label: 'Đề nghị ứng vốn và nhận giải ngân từ Techcombank', done: tcbLoan, fix: link('Đi tới Ứng vốn', ROUTES.ungVon) },
    { id: 4, label: 'Trả hết khoản vay khi sàn thanh toán', done: tcbLoan && l.status === 'repaid', fix: link('Xem khoản vay', ROUTES.khoanVay) },
    { id: 5, label: 'Xem hồ sơ dưới góc nhìn cán bộ Techcombank', done: 'officer:tra-cuu' in state.visited, fix: link('Đổi vai', ROUTES.doiVai) },
    {
      id: 6,
      label: 'Thử tình huống: Đổi tài khoản nhận tiền',
      optional: true,
      done: state.accountChangeResolved,
      fix: state.scenario.accountChange ? link('Xem khoản vay', ROUTES.khoanVay) : link('Mở bảng Mô phỏng', ROUTES.moPhong),
    },
    {
      id: 7,
      label: 'Thử Giai đoạn 3: nhiều bên chào giá',
      optional: true,
      done: state.scenario.phase3 && state.registry.length > 0,
      fix: state.scenario.phase3 ? link('Đi tới Ứng vốn', ROUTES.ungVon) : link('Mở bảng Mô phỏng', ROUTES.moPhong),
    },
  ].map((t) => ({ optional: false, ...t, fix: t.done ? null : t.fix }))
  const required = items.filter((t) => !t.optional)
  const requiredDone = required.filter((t) => t.done).length
  return { items, requiredDone, requiredTotal: required.length, allRequiredDone: requiredDone === required.length }
}

// ─── Thẻ "Bước tiếp theo" (mục D.3) ──────────────────────────────────────────
const OFFICER_PAGES = ['tra-cuu', 'danh-muc-khoa', 'canh-bao']
const NOTHING = { text: 'Không cần làm gì ở trang này', action: null }
const step = (text, action = null) => ({ text, action })

function fundingStep(state) {
  const { consents, application, scenario } = state
  if (consents.A2 !== 'active')
    return step('Techcombank cần quyền đánh giá tín dụng (A2).', link('Cấp A2 trên trang Techcombank', ROUTES.a2))
  if (scenario.phase3) {
    if (!application.quoteRequest) return step('Chọn bên nhận yêu cầu chào giá.')
    if (!application.chosenLender) return step('So sánh chào giá và chọn một bên.')
    return step(`Ký thỏa thuận với ${application.chosenLender}.`)
  }
  if (!application.estimateViewed) return step('Xem ước tính giá trị khả dụng.')
  const sign = availability(state, 'signA4')
  if (consents.A4 !== 'signed')
    return sign.ok
      ? step('Ký thỏa thuận A4 để dùng khoản phải thu làm tài sản bảo đảm.', link('Ký A4 trên trang Techcombank', ROUTES.a4))
      : step(sign.reason, sign.fix)
  const submit = availability(state, 'submit')
  return submit.ok ? step('Gửi đề nghị tới Techcombank.') : step(submit.reason, submit.fix)
}

function loanStep(state) {
  if (availability(state, 'resolveAccountChange').ok)
    return step('RU-03 đứt gãy — xác nhận tài khoản nhận tiền và giải trình.')
  for (const u of NORMAL_UNITS) {
    if (availability(state, { type: 'repay', unit: u.code }).ok)
      return step(
        u.code === 'RU-03' && state.scenario.accountChange
          ? `Đã giải trình. Trả ${formatNumberVN(UNIT_AVAILABLE[u.code])} triệu cho ${u.code} từ nguồn khác trên Techcombank.`
          : `${u.channel} đã thanh toán ${u.code}. Trả ${formatNumberVN(UNIT_AVAILABLE[u.code])} triệu trên Techcombank.`,
        link('Trả nợ trên Techcombank', ROUTES.traNo)
      )
  }
  if (availability(state, 'advance').ok)
    return step(
      `Khoản vay đang chờ sàn thanh toán. Tua tới ${ddmm(events(state)[state.eventIndex + 1].date)}.`,
      link('Tua tới sự kiện tiếp theo', ROUTES.tua)
    )
  return NOTHING
}

function officerStep(state) {
  const view = availability(state, 'viewProfile')
  if (!view.ok) return step(view.reason, view.fix)
  const sellerPending =
    availability(state, 'resolveAccountChange').ok ||
    NORMAL_UNITS.some((u) => availability(state, { type: 'repay', unit: u.code }).ok)
  if (sellerPending) return step('Chờ nhà bán trả nợ', TO_SELLER)
  if (availability(state, 'advance').ok)
    return step(`Tua tới ${ddmm(events(state)[state.eventIndex + 1].date)} để xem sổ khóa cập nhật.`, link('Tua tới sự kiện tiếp theo', ROUTES.tua))
  return NOTHING
}

// page: 'tong-quan' | 'doi-soat' | 'khoan-phai-thu' | 'ung-von' | 'khoan-vay' | 'quyen-du-lieu'
//       | 'tra-cuu' | 'danh-muc-khoa' | 'canh-bao'
export function nextStep(state, page) {
  if (OFFICER_PAGES.includes(page)) return officerStep(state)
  const { consents } = state
  if (consents.A1 === 'none')
    return step('Kết nối tài khoản Techcombank để app đối soát tự động.', link('Kết nối Techcombank', ROUTES.a1))
  if (consents.A1 === 'revoked' && loan(state).status !== 'repaid')
    return step('Quyền đối soát A1 đã rút — cấp lại để app tiếp tục đồng bộ.', link('Cấp lại A1', ROUTES.a1))
  if (state.eventIndex < E1)
    return step(`Tua tới ${ddmm(E_NORMAL[E1].date)} để xem 6 tuần đối soát.`, link('Tua tới sự kiện tiếp theo', ROUTES.tua))

  const l = loan(state)
  if (l.status === 'none') {
    if (page === 'ung-von') {
      const s = fundingStep(state)
      return availability(state, 'togglePeakSeason').ok && !state.scenario.peakSeason
        ? { ...s, hint: 'Muốn xem mùa cao điểm? Bật ở bảng Mô phỏng' }
        : s
    }
    if (page !== 'khoan-phai-thu' && !seenAfterE1(state, 'seller:khoan-phai-thu'))
      return step('Sáu tuần đối soát đã xong. Xem khoản phải thu đã xác thực.', link('Mở Khoản phải thu', ROUTES.khoanPhaiThu))
    const codes = activeUnits(state).map((u) => u.code).join(' và ')
    return step(`${codes} đã xác thực. Xem bạn được ứng bao nhiêu.`, link('Đi tới Ứng vốn', ROUTES.ungVon))
  }
  if (l.lender !== TCB)
    return step('Dòng tất toán trong mô phỏng chỉ dựng cho Techcombank.', link('Chọn lại chào giá', ROUTES.ungVon))
  if (l.status === 'repaid')
    return 'officer:tra-cuu' in state.visited
      ? NOTHING
      : step('Xem hồ sơ dưới góc nhìn cán bộ Techcombank.', link('Đổi vai', ROUTES.doiVai))

  const s = loanStep(state)
  // Hành động nằm ở trang Khoản vay → trang khác chỉ dẫn về đó (trừ Tua, bấm được ở mọi nơi)
  if (page !== 'khoan-vay' && s.action?.href !== ROUTES.tua && s !== NOTHING)
    return step(s.text, link('Xem khoản vay', ROUTES.khoanVay))
  return s
}

// ─── localStorage (mục F): mọi đọc/ghi bọc try/catch; hỏng/sai version → khởi đầu ──
export function loadState(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY))
    if (!parsed || typeof parsed !== 'object' || parsed.version !== VERSION) return initialState()
    return { ...initialState(), ...parsed }
  } catch {
    return initialState()
  }
}

export function saveState(state, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage bị chặn/đầy: app vẫn chạy, chỉ không lưu bền
  }
}
