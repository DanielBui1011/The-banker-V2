import { describe, it, expect } from 'vitest'
import { summarizeTransactions, isFeeDeviationFlagged, autoMatchRate } from './reconciliation.js'
import { BANK_TRANSACTIONS, FEE_DEVIATIONS } from '../data/mockData.js'

describe('summarizeTransactions', () => {
  it('tính đúng số liệu tóm tắt Màn 3: 19 đã khớp, 2 ngoại lệ, 3 hoàn, 1 chi ra', () => {
    const summary = summarizeTransactions(BANK_TRANSACTIONS)
    expect(summary.matchedCount).toBe(19)
    expect(summary.exceptionCount).toBe(2)
    expect(summary.reversedCount).toBe(3)
    expect(summary.outflowCount).toBe(1)
    expect(summary.matchedTotal).toBeCloseTo(111.6, 1)
  })
})

describe('isFeeDeviationFlagged', () => {
  it('RU-01 chênh 1,7% → cảnh báo', () => {
    const ru01 = FEE_DEVIATIONS.find((f) => f.unit === 'RU-01')
    expect(isFeeDeviationFlagged(ru01.deviationRate)).toBe(true)
  })

  it('RU-02 chênh 1,1% → trong ngưỡng', () => {
    const ru02 = FEE_DEVIATIONS.find((f) => f.unit === 'RU-02')
    expect(isFeeDeviationFlagged(ru02.deviationRate)).toBe(false)
  })
})

describe('autoMatchRate', () => {
  it('19 / 25 giao dịch tự khớp = 76% (Đối soát, Tổng quan)', () => {
    expect(autoMatchRate(BANK_TRANSACTIONS)).toBe(0.76)
    expect(autoMatchRate([])).toBe(0)
  })
})
