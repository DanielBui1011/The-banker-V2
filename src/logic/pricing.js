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

// Bậc thang cho Màn 5, bước 5b (docs/man-hinh.md, docs/du-lieu.md mục 4.2):
// giá trị ròng dự phóng → − tỷ lệ hoàn gia quyền → − biên an toàn → − chiết khấu
// xác thực → = giá trị theo công thức, sau đó áp trần dư nợ. Hàm thuần này KHÔNG
// đổi công thức — chỉ tách computeAvailableValue thành từng bậc để hiển thị từng
// dòng (quy-tac.md mục 4: "Bảng tính giá trị khả dụng hiện từng bước").
// Đúng về đại số vì tỷ lệ hoàn gia quyền và biên an toàn giống nhau cho mọi đơn vị
// (chỉ phụ thuộc params), nên có thể gộp ở cấp tổng: tổng(giá trị ròng × tỷ lệ ứng)
// = tổng(giá trị ròng) × (1 − tỷ lệ hoàn gia quyền − biên an toàn) − tổng(giá trị
// ròng × chiết khấu xác thực từng đơn vị).
export function computeAvailableValueStaircase({ units, params, lockedByOthers = 0 }) {
  const pricing = computeAvailableValue({ units, params, lockedByOthers })
  const eligibleUnits = units.filter((u) => isScoreAvailable(u.verificationScore))
  const totalProjectedNetValue = eligibleUnits.reduce((sum, u) => sum + u.projectedNetValue, 0)

  const returnRateDeduction = totalProjectedNetValue * pricing.weightedReturnRate
  const safetyMarginDeduction = totalProjectedNetValue * pricing.safetyMargin
  const verificationDiscountDeduction = pricing.unitBreakdown.reduce((sum, b) => {
    const unit = eligibleUnits.find((u) => u.code === b.code)
    return sum + unit.projectedNetValue * b.verificationDiscount
  }, 0)

  const steps = [
    { key: 'projected', label: 'Giá trị ròng dự phóng', value: totalProjectedNetValue },
    { key: 'weightedReturnRate', label: 'Tỷ lệ hoàn gia quyền', value: -returnRateDeduction },
    { key: 'safetyMargin', label: 'Biên an toàn', value: -safetyMarginDeduction },
    { key: 'verificationDiscount', label: 'Chiết khấu xác thực', value: -verificationDiscountDeduction },
  ]

  return {
    steps,
    totalProjectedNetValue,
    formulaValueTotal: pricing.formulaValueTotal,
    debtCap: pricing.debtCap,
    lockedByOthers: pricing.lockedByOthers,
    capAfterLock: pricing.capAfterLock,
    cappedByDebtCap: pricing.cappedByDebtCap,
    result: pricing.result,
  }
}

// Màn 10 — so sánh chào giá cùng một khoản vay và cùng số ngày (quy-tac.md mục 4:
// "Chào giá hiện cả lãi suất năm lẫn tiền lãi ước tính theo số ngày thực tế").
// quotes: [{ lender, annualRate, ... }]. Trả về mỗi chào giá kèm tiền lãi ước tính
// cho cùng principal/days, để so sánh công bằng dù các bên chào giá trị gốc khác nhau.
export function computeQuoteComparison(quotes, principal, days) {
  return quotes.map((q) => ({
    ...q,
    estimatedCost: computeAdvanceInterest(principal, q.annualRate, days),
  }))
}
