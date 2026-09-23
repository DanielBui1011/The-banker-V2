import { createContext, useContext, useState } from 'react'
import { useApp } from './appState.jsx'
import {
  RECEIVABLE_UNITS,
  PRICING_PARAMS,
  SETTLEMENT_TIMELINE_NORMAL,
  SETTLEMENT_TIMELINE_LEAK,
} from '../data/mockData.js'
import { computeAvailableValue } from '../logic/pricing.js'
import { simDate, unitStatus, loan, fundingFrozen, availability, resendLock } from '../logic/journey.js'

// ADAPTER TẠM (Vòng 21, gỡ ở Vòng 24 — docs/ban-giao.md): giao diện cũ của useSettlement()
// cho Màn 4/5/6/8/9 cũ. Dữ kiện (ngày, sổ khóa, đã trả, dư nợ) đọc từ store journey.js;
// Provider chỉ còn giữ trạng thái giao diện (hộp trả nợ, hộp giải trình).

const LOCK_UNITS = RECEIVABLE_UNITS.filter((u) => u.code === 'RU-03' || u.code === 'RU-04')
const LOCK_PRICING = computeAvailableValue({ units: LOCK_UNITS, params: PRICING_PARAMS.normal, lockedByOthers: 0 })
const LOCK_AMOUNT = Object.fromEntries(LOCK_PRICING.unitBreakdown.map((u) => [u.code, u.formulaValue]))

const SettlementContext = createContext(null)

export function SettlementProvider({ children }) {
  const [repayModalUnit, setRepayModalUnit] = useState(null)
  const [leakExplainOpen, setLeakExplainOpen] = useState(false)
  const ui = { repayModalUnit, setRepayModalUnit, leakExplainOpen, setLeakExplainOpen }
  return <SettlementContext.Provider value={ui}>{children}</SettlementContext.Provider>
}

export function useSettlement() {
  const ui = useContext(SettlementContext)
  if (!ui) throw new Error('useSettlement phải được gọi bên trong SettlementProvider')
  const { state, dispatch } = useApp()
  const leak = state.scenario.accountChange
  const l = loan(state)
  const timeline = leak ? [...SETTLEMENT_TIMELINE_NORMAL.slice(0, 2), ...SETTLEMENT_TIMELINE_LEAK] : SETTLEMENT_TIMELINE_NORMAL
  // Mốc dòng thời gian cũ = mốc cuối cùng có ngày ≤ ngày mô phỏng ("settled" chỉ khi đã trả hết)
  const today = simDate(state)
  const stepIndex = Math.max(
    0,
    timeline.findLastIndex((m) => m.isoDate <= today && (m.kind !== 'settled' || l.status === 'repaid'))
  )

  return {
    leak,
    timeline,
    stepIndex,
    currentMilestone: timeline[stepIndex],
    atLastStep: !availability(state, 'advance').ok,
    advance: () => dispatch({ type: 'advance' }),
    debt: l.debt,
    initialDebt: LOCK_PRICING.result,
    ru03LockAmount: LOCK_AMOUNT['RU-03'],
    ru04LockAmount: LOCK_AMOUNT['RU-04'],
    ru03Status: unitStatus(state, 'RU-03'),
    ru04Status: unitStatus(state, 'RU-04'),
    repaid: state.repaid,
    repayModalUnit: ui.repayModalUnit,
    openRepayModal: ui.setRepayModalUnit,
    closeRepayModal: () => ui.setRepayModalUnit(null),
    confirmRepay: (unit) => {
      dispatch({ type: 'repay', unit })
      ui.setRepayModalUnit(null)
    },
    leakExplainOpen: ui.leakExplainOpen,
    openLeakExplain: () => ui.setLeakExplainOpen(true),
    closeLeakExplain: () => ui.setLeakExplainOpen(false),
    // Giải trình xong: trả RU-03 từ nguồn khác (hanh-trinh 2.8)
    confirmLeakRemediation: () => {
      dispatch({ type: 'resolveAccountChange' })
      dispatch({ type: 'repay', unit: 'RU-03' })
      ui.setLeakExplainOpen(false)
    },
    leakRemediated: state.accountChangeResolved,
    fundingFrozen: fundingFrozen(state),
    debtFullyRepaid: l.status === 'repaid',
    getActualReceived: (code) => {
      if (!state.repaid[code]) return null
      return timeline.find((m) => m.kind === 'marketplace-payment' && m.unit === code)?.marketplaceAmount ?? null
    },
    lockRegistry: state.registry,
    locksInitialized: state.registry.length > 0,
    totalLocked: l.principal,
    performLocks: () => dispatch({ type: 'submit' }),
    retryLock: () => resendLock(state),
  }
}
