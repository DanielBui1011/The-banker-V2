import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useScenario } from './scenarioState.jsx'
import {
  RECEIVABLE_UNITS,
  PRICING_PARAMS,
  SETTLEMENT_TIMELINE_NORMAL,
  SETTLEMENT_TIMELINE_LEAK,
  LOCK_CERTIFICATE,
} from '../data/mockData.js'
import { computeAvailableValue } from '../logic/pricing.js'
import { lockUnit } from '../logic/registry.js'

// Trạng thái tất toán dùng chung — Màn 6 (dòng thời gian, dư nợ, nút "Trả nợ trên
// Techcombank") và Màn 9 (biến thể rò rỉ) đọc/ghi cùng một nguồn; Màn 4 và Màn 7 đọc
// để cập nhật trạng thái RU-03, RU-04, quyền A4 và nhật ký truy cập theo mốc đã đi qua.

const LOCK_UNITS = RECEIVABLE_UNITS.filter((u) => u.code === 'RU-03' || u.code === 'RU-04')
// Số tiền khóa RU-03 (46,75) và RU-04 (38,25) = kết quả T1 của computeAvailableValue —
// không lặp lại số liệu, tính đúng bằng công thức mục 4.2.
const LOCK_PRICING = computeAvailableValue({ units: LOCK_UNITS, params: PRICING_PARAMS.normal, lockedByOthers: 0 })
const LOCK_AMOUNT = Object.fromEntries(LOCK_PRICING.unitBreakdown.map((u) => [u.code, u.formulaValue]))
const INITIAL_DEBT = LOCK_PRICING.result

const SettlementContext = createContext(null)

// requestId cho mỗi đơn vị = mã chứng thư + mã đơn vị (duy nhất, ổn định)
const REQ_ID = {
  'RU-03': `${LOCK_CERTIFICATE.certificateId}-RU03`,
  'RU-04': `${LOCK_CERTIFICATE.certificateId}-RU04`,
}

export function SettlementProvider({ children }) {
  const { leak } = useScenario()
  const [stepIndex, setStepIndex] = useState(0)
  const [lockRegistry, setLockRegistry] = useState([])
  const [repaid, setRepaid] = useState({}) // { 'RU-03': true, 'RU-04': true }
  const [repayModalUnit, setRepayModalUnit] = useState(null)
  const [leakExplainOpen, setLeakExplainOpen] = useState(false)
  const [leakRemediated, setLeakRemediated] = useState(false)
  const [everBroken, setEverBroken] = useState(false)

  const resetProgress = useCallback(() => {
    setStepIndex(0)
    setRepaid({})
    setRepayModalUnit(null)
    setLeakExplainOpen(false)
    setLeakRemediated(false)
    setEverBroken(false)
    setLockRegistry([])
  }, [])

  // Khởi tạo registry khi Techcombank phê duyệt và giải ngân (bước 5d Màn 5).
  // Ghi hai sự kiện khóa: RU-03 (46,75) và RU-04 (38,25).
  const performLocks = useCallback(() => {
    let reg = []
    for (const code of ['RU-03', 'RU-04']) {
      const avail = LOCK_PRICING.unitBreakdown.find((u) => u.code === code).formulaValue
      const r = lockUnit(reg, {
        lenderId: LOCK_CERTIFICATE.secured,
        unitId: code,
        requestId: REQ_ID[code],
        amount: avail,
        availableValue: avail,
      })
      reg = r.registry
    }
    setLockRegistry(reg)
  }, [])

  // Mô phỏng Techcombank gửi lại lệnh khóa (phím D) — trả DA_GHI_NHAN cho đơn vị đầu tiên.
  const retryLock = useCallback(
    (unitId = 'RU-03') => {
      if (lockRegistry.length === 0) return null
      const event = lockRegistry.find((e) => e.unitId === unitId)
      if (!event) return null
      const { result } = lockUnit(lockRegistry, {
        lenderId: event.lenderId,
        unitId: event.unitId,
        requestId: event.requestId,
        amount: event.amount,
        availableValue: event.amount,
      })
      return result
    },
    [lockRegistry]
  )

  const locksInitialized = lockRegistry.length > 0
  const totalLocked = lockRegistry.reduce((sum, e) => sum + e.amount, 0)

  // Đổi kịch bản (bật/tắt rò rỉ) thì tiến trình dòng thời gian đặt lại từ đầu — hai
  // kịch bản có số mốc khác nhau, giữ nguyên stepIndex cũ sẽ trỏ sai mốc.
  useEffect(() => {
    resetProgress()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leak])

  const timeline = useMemo(
    () => (leak ? [...SETTLEMENT_TIMELINE_NORMAL.slice(0, 2), ...SETTLEMENT_TIMELINE_LEAK] : SETTLEMENT_TIMELINE_NORMAL),
    [leak]
  )

  const atLastStep = stepIndex >= timeline.length - 1
  const currentMilestone = timeline[stepIndex] ?? null

  const advance = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, timeline.length - 1))
  }, [timeline.length])

  const openRepayModal = useCallback((unit) => setRepayModalUnit(unit), [])
  const closeRepayModal = useCallback(() => setRepayModalUnit(null), [])
  const confirmRepay = useCallback((unit) => {
    setRepaid((r) => ({ ...r, [unit]: true }))
    setRepayModalUnit(null)
  }, [])

  const openLeakExplain = useCallback(() => setLeakExplainOpen(true), [])
  const closeLeakExplain = useCallback(() => setLeakExplainOpen(false), [])
  // Giải trình xong: chị Lan trả 46,75 từ nguồn khác — cùng cơ chế "trả nợ" như
  // RU-04, chỉ khác kênh xác nhận (hộp giải trình thay vì thông báo Nền tảng).
  const confirmLeakRemediation = useCallback(() => {
    setRepaid((r) => ({ ...r, 'RU-03': true }))
    setLeakRemediated(true)
    setLeakExplainOpen(false)
  }, [])

  useEffect(() => {
    if (leak && currentMilestone?.id === 'leak-broken') setEverBroken(true)
  }, [leak, currentMilestone])

  // RU-03 vẫn giữ trạng thái "Đứt gãy" trong lịch sử dù đã giải trình và trả nợ xong.
  const ru03Status = !leak ? (repaid['RU-03'] ? 'settled' : 'locked') : everBroken ? 'broken' : 'locked'
  const ru04Status = repaid['RU-04'] ? 'settled' : 'locked'

  const debt = useMemo(() => {
    let d = INITIAL_DEBT
    if (repaid['RU-03']) d -= LOCK_AMOUNT['RU-03']
    if (repaid['RU-04']) d -= LOCK_AMOUNT['RU-04']
    return Math.max(0, Math.round(d * 100) / 100)
  }, [repaid])

  const fundingFrozen = leak && everBroken && !leakRemediated
  const debtFullyRepaid = debt === 0

  // Nhật ký truy cập (Màn 7) chỉ hiện các dòng của những ngày đã đi qua trong dòng
  // thời gian — không phải cứ "đã rời Màn 6" là hiện hết.
  const visibleLogDates = useMemo(
    () => timeline.slice(0, stepIndex + 1).map((m) => m.isoDate),
    [timeline, stepIndex]
  )

  const getActualReceived = useCallback(
    (code) => {
      if (!repaid[code]) return null
      const entry = timeline.find((m) => m.kind === 'marketplace-payment' && m.unit === code)
      return entry ? entry.marketplaceAmount : null
    },
    [timeline, repaid]
  )

  const value = useMemo(
    () => ({
      leak,
      timeline,
      stepIndex,
      currentMilestone,
      atLastStep,
      advance,
      debt,
      initialDebt: INITIAL_DEBT,
      ru03LockAmount: LOCK_AMOUNT['RU-03'],
      ru04LockAmount: LOCK_AMOUNT['RU-04'],
      ru03Status,
      ru04Status,
      repaid,
      repayModalUnit,
      openRepayModal,
      closeRepayModal,
      confirmRepay,
      leakExplainOpen,
      openLeakExplain,
      closeLeakExplain,
      confirmLeakRemediation,
      leakRemediated,
      fundingFrozen,
      debtFullyRepaid,
      visibleLogDates,
      getActualReceived,
      lockRegistry,
      locksInitialized,
      totalLocked,
      performLocks,
      retryLock,
      reset: resetProgress,
    }),
    [
      leak,
      timeline,
      stepIndex,
      currentMilestone,
      atLastStep,
      advance,
      debt,
      ru03Status,
      ru04Status,
      repaid,
      repayModalUnit,
      openRepayModal,
      closeRepayModal,
      confirmRepay,
      leakExplainOpen,
      openLeakExplain,
      closeLeakExplain,
      confirmLeakRemediation,
      leakRemediated,
      fundingFrozen,
      debtFullyRepaid,
      visibleLogDates,
      getActualReceived,
      lockRegistry,
      locksInitialized,
      totalLocked,
      performLocks,
      retryLock,
      resetProgress,
    ]
  )

  return <SettlementContext.Provider value={value}>{children}</SettlementContext.Provider>
}

export function useSettlement() {
  const ctx = useContext(SettlementContext)
  if (!ctx) throw new Error('useSettlement phải được gọi bên trong SettlementProvider')
  return ctx
}
