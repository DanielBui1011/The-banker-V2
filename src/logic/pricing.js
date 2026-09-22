// Công thức giá trị khả dụng — docs/du-lieu.md mục 4.2
import { isScoreAvailable } from './verification.js'

export function computeWeightedReturnRate({ sellerReturnRate, channelReturnRate, seasonReturnRate }) {
  return 0.4 * sellerReturnRate + 0.3 * channelReturnRate + 0.3 * seasonReturnRate
}

// Chiết khấu xác thực = max(0; (90 − điểm) / 90) × 15%
export function computeVerificationDiscount(score) {
  if (!isScoreAvailable(score)) return null
  return Math.max(0, (90 - score) / 90) * 0.15
}

export function computeAdvanceRate({ weightedReturnRate, safetyMargin, verificationDiscount }) {
  return 1 - weightedReturnRate - safetyMargin - verificationDiscount
}

export function computeUnitFormulaValue(projectedNetValue, advanceRate) {
  return projectedNetValue * advanceRate
}

// units: [{ code, projectedNetValue, verificationScore }], chỉ đơn vị Đã xác thực (có điểm) mới được tính.
// params: { sellerReturnRate, channelReturnRate, seasonReturnRate, safetyMargin, debtCap }
// lockedByOthers: phần dư nợ đã bị bên khác khóa (mặc định 0)
export function computeAvailableValue({ units, params, lockedByOthers = 0 }) {
  const weightedReturnRate = computeWeightedReturnRate(params)
  const eligibleUnits = units.filter((u) => isScoreAvailable(u.verificationScore))

  const unitBreakdown = eligibleUnits.map((u) => {
    const verificationDiscount = computeVerificationDiscount(u.verificationScore)
    const advanceRate = computeAdvanceRate({
      weightedReturnRate,
      safetyMargin: params.safetyMargin,
      verificationDiscount,
    })
    const formulaValue = computeUnitFormulaValue(u.projectedNetValue, advanceRate)
    return {
      code: u.code,
      verificationScore: u.verificationScore,
      verificationDiscount,
      advanceRate,
      formulaValue,
    }
  })

  const formulaValueTotal = unitBreakdown.reduce((sum, u) => sum + u.formulaValue, 0)
  const capAfterLock = params.debtCap - lockedByOthers
  const cappedByDebtCap = formulaValueTotal > capAfterLock
  const result = Math.max(0, Math.min(formulaValueTotal, capAfterLock))

  return {
    weightedReturnRate,
    safetyMargin: params.safetyMargin,
    unitBreakdown,
    formulaValueTotal,
    debtCap: params.debtCap,
    lockedByOthers,
    capAfterLock,
    cappedByDebtCap,
    result,
  }
}

// Tiền lãi = gốc × lãi suất năm × số ngày / 365
export function computeAdvanceInterest(principal, annualRate, days) {
  return (principal * annualRate * days) / 365
}

// Mục 3 — Tiền đang kẹt ở sàn = doanh thu sàn / 30 × số ngày giữ tiền bình quân
export function computeEscrowStuck(marketplaceRevenue, averageHoldDays) {
  return (marketplaceRevenue / 30) * averageHoldDays
}
