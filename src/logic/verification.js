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

  // Làm tròn xuống — theo ví dụ kiểm tra ở docs/du-lieu.md mục 7:
  // TikTok Shop ≈ 90,505 → 90 (không làm tròn lên theo quy tắc thông thường).
  return Math.floor(raw)
}

export function isScoreAvailable(score) {
  return typeof score === 'number'
}

// Chiết khấu điểm khi có rò rỉ (Màn 9, docs/du-lieu.md mục 4.3 T10): áp hệ số
// (1 − tỷ lệ rò rỉ × 3) lên điểm đã có, làm tròn thường — khác computeVerificationScore
// (làm tròn xuống từ 5 chỉ số gốc) vì đây là chiết khấu áp thêm lên điểm đã công bố,
// không phải tính lại toàn bộ công thức từ đầu.
export function computeLeakAdjustedScore(baseScore, leakRate) {
  if (!isScoreAvailable(baseScore)) return baseScore
  return Math.round(baseScore * (1 - leakRate * 3))
}

// Tỷ lệ khớp của một đơn vị đã tất toán: thực nhận / dự phóng ròng (Màn 4, vùng "Vì sao tin được").
export function computeMatchRate(projected, actual) {
  return projected > 0 ? actual / projected : 0
}
