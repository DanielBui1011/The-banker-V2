// Công thức đối soát tự động (Màn 3) — docs/du-lieu.md mục 5

// Ngưỡng cảnh báo sai lệch phí: cảnh báo khi chênh lệch trên 1,5%.
export const FEE_DEVIATION_ALERT_THRESHOLD = 0.015

export function isFeeDeviationFlagged(deviationRate) {
  return deviationRate > FEE_DEVIATION_ALERT_THRESHOLD
}

// transactions: BANK_TRANSACTIONS — trả về số liệu tóm tắt tính trực tiếp từ mảng
// giao dịch, không đọc số đếm có sẵn, để khối tóm tắt luôn khớp với bảng hiển thị.
export function summarizeTransactions(transactions) {
  const summary = transactions.reduce(
    (acc, tx) => {
      if (tx.status === 'matched') {
        acc.matchedCount += 1
        acc.matchedTotal += tx.amount
      } else if (tx.status === 'exception') {
        acc.exceptionCount += 1
      } else if (tx.status === 'reversed') {
        acc.reversedCount += 1
      } else if (tx.status === 'outflow') {
        acc.outflowCount += 1
      }
      return acc
    },
    { matchedCount: 0, matchedTotal: 0, exceptionCount: 0, reversedCount: 0, outflowCount: 0 }
  )
  return summary
}
