import { describe, it, expect } from 'vitest'
import { computeVerificationScore, computeLeakAdjustedScore } from './verification.js'
import { VERIFICATION_METRICS, LEAK_BATCH_RATE } from '../data/mockData.js'

describe('computeVerificationScore', () => {
  // T7 — Điểm Shopee theo mục 7 → 92
  it('T7: tính đúng điểm Shopee = 92', () => {
    expect(computeVerificationScore(VERIFICATION_METRICS.Shopee)).toBe(92)
  })

  // T8 — Điểm TikTok Shop theo mục 7 → 90
  it('T8: tính đúng điểm TikTok Shop = 90', () => {
    expect(computeVerificationScore(VERIFICATION_METRICS['TikTok Shop'])).toBe(90)
  })

  it('trả về "Chưa đủ lịch sử" khi dưới 6 lô (Hãng vận chuyển A, 4 lô)', () => {
    expect(computeVerificationScore(VERIFICATION_METRICS['Hãng vận chuyển A'])).toBe('Chưa đủ lịch sử')
  })
})

describe('computeLeakAdjustedScore', () => {
  // T10 — Kịch bản rò rỉ: điểm Shopee 92, tỷ lệ rò rỉ 1/8 lô → 58
  it('T10: điểm Shopee 92 → 58 khi tỷ lệ rò rỉ 1/8 lô', () => {
    const base = computeVerificationScore(VERIFICATION_METRICS.Shopee)
    expect(base).toBe(92)
    expect(computeLeakAdjustedScore(base, LEAK_BATCH_RATE)).toBe(58)
  })
})
