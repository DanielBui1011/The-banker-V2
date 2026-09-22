// Công thức điểm xác thực — docs/du-lieu.md mục 4.1
import { MIN_LOTS_FOR_SCORE } from '../data/mockData.js'

const NOT_ENOUGH_HISTORY = 'Chưa đủ lịch sử'

function computeOnTimeFactor(p90DelayDays) {
  if (p90DelayDays <= 3) return 1.0
  const factor = 1.0 - 0.03 * (p90DelayDays - 3)
  return Math.max(factor, 0.7)
}

// metrics: { settledLots, projectionAccuracy, volatility, feeDeviation, leakRate, p90DelayDays }
// Trả về số nguyên đã làm tròn, hoặc chuỗi "Chưa đủ lịch sử" nếu dưới 6 lô.
export function computeVerificationScore(metrics) {
  if (metrics.settledLots < MIN_LOTS_FOR_SCORE) return NOT_ENOUGH_HISTORY

  const { projectionAccuracy, volatility, feeDeviation, leakRate, p90DelayDays } = metrics
  const raw =
    100 *
    Math.min(projectionAccuracy, 1) *
    (1 - Math.min(volatility, 0.3)) *
    (1 - Math.min(feeDeviation * 5, 0.3)) *
    (1 - leakRate * 3) *
    computeOnTimeFactor(p90DelayDays)

  return Math.round(raw)
}

export function isScoreAvailable(score) {
  return typeof score === 'number'
}
