import { describe, it, expect } from 'vitest'
import {
  computeVerificationDiscount,
  computeAvailableValue,
  computeAdvanceInterest,
} from './pricing.js'
import { RECEIVABLE_UNITS, MEGA_SALE_UNITS, PRICING_PARAMS } from '../data/mockData.js'

function unitByCode(code) {
  const u = RECEIVABLE_UNITS.find((r) => r.code === code)
  return { code: u.code, projectedNetValue: u.projectedNetValue, verificationScore: u.verificationScore }
}

describe('computeAvailableValue', () => {
  // T1 — Kỳ thường; RU-03 (55, điểm 92) + RU-04 (45, điểm 90); chưa bị khóa
  // → Tỷ lệ ứng 85,0% mỗi đơn vị; giá trị khả dụng 85,0
  it('T1: kỳ thường, chưa khóa → 85,0', () => {
    const units = [unitByCode('RU-03'), unitByCode('RU-04')]
    const out = computeAvailableValue({ units, params: PRICING_PARAMS.normal })
    out.unitBreakdown.forEach((u) => expect(u.advanceRate).toBeCloseTo(0.85, 3))
    expect(out.result).toBeCloseTo(85.0, 1)
    expect(out.cappedByDebtCap).toBe(false)
  })

  // T2 — Mega Sale; ký quỹ 300 (RU-M1 165 điểm 92 + RU-M2 135 điểm 90)
  // → Tỷ lệ ứng 73,0%; theo công thức 219,0; bị chặn bởi trần → 150,0
  it('T2: Mega Sale → theo công thức 219,0, bị chặn còn 150,0', () => {
    const units = MEGA_SALE_UNITS.map((u) => ({
      code: u.code,
      projectedNetValue: u.projectedNetValue,
      verificationScore: u.verificationScore,
    }))
    const out = computeAvailableValue({ units, params: PRICING_PARAMS.megaSale })
    out.unitBreakdown.forEach((u) => expect(u.advanceRate).toBeCloseTo(0.73, 3))
    expect(out.formulaValueTotal).toBeCloseTo(219.0, 1)
    expect(out.cappedByDebtCap).toBe(true)
    expect(out.result).toBeCloseTo(150.0, 1)
  })

  // T3 — Như T1 nhưng đã có bên khác khóa 100 → min(85; 150 − 100) = 50,0
  it('T3: như T1 nhưng đã bị khóa 100 → 50,0', () => {
    const units = [unitByCode('RU-03'), unitByCode('RU-04')]
    const out = computeAvailableValue({ units, params: PRICING_PARAMS.normal, lockedByOthers: 100 })
    expect(out.capAfterLock).toBeCloseTo(50.0, 1)
    expect(out.result).toBeCloseTo(50.0, 1)
  })

  // T4 — Một đơn vị 100, điểm 70, kỳ thường → Chiết khấu 3,3%; tỷ lệ ứng 81,7%; giá trị 81,7
  it('T4: một đơn vị 100, điểm 70, kỳ thường → giá trị 81,7', () => {
    const units = [{ code: 'TEST-4', projectedNetValue: 100, verificationScore: 70 }]
    const out = computeAvailableValue({ units, params: PRICING_PARAMS.normal })
    expect(out.unitBreakdown[0].verificationDiscount).toBeCloseTo(0.0333, 3)
    expect(out.unitBreakdown[0].advanceRate).toBeCloseTo(0.8167, 3)
    expect(out.result).toBeCloseTo(81.7, 1)
  })

  // T5 — Đơn vị chưa có điểm (dưới 6 lô) → Không đủ điều kiện, giá trị 0
  it('T5: RU-05 chưa đủ 6 lô → giá trị 0', () => {
    const units = [unitByCode('RU-05')]
    const out = computeAvailableValue({ units, params: PRICING_PARAMS.normal })
    expect(out.unitBreakdown).toHaveLength(0)
    expect(out.result).toBe(0)
  })
})

describe('computeVerificationDiscount', () => {
  // T6 — Điểm đúng 90 → Chiết khấu 0
  it('T6: điểm đúng 90 → chiết khấu 0', () => {
    expect(computeVerificationDiscount(90)).toBe(0)
  })
})

describe('computeAdvanceInterest', () => {
  // T9 — Tiền lãi khoản 85 triệu, 12%/năm, tất toán sau 5 ngày ≈ 0,14
  it('T9: 85 × 12%/năm × 5 ngày ≈ 0,14', () => {
    expect(computeAdvanceInterest(85, 0.12, 5)).toBeCloseTo(0.14, 2)
  })
})
