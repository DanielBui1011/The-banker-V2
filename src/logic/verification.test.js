import { describe, it, expect } from 'vitest'
import { computeVerificationScore } from './verification.js'
import { VERIFICATION_METRICS } from '../data/mockData.js'

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
