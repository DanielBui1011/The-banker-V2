import { describe, it, expect } from 'vitest'
import { formatPercentVN } from './format.js'

// Vòng 12 mục 4 — phần trăm bỏ số 0 thừa (76%, 12%/năm) nhưng giữ số thập phân
// có nghĩa (1,7%).
describe('formatPercentVN', () => {
  it('bỏ ".0" khi tròn phần trăm (0,76 → "76%")', () => {
    expect(formatPercentVN(0.76)).toBe('76%')
  })

  it('bỏ ".0" cho lãi suất tròn (0,12 → "12%")', () => {
    expect(formatPercentVN(0.12)).toBe('12%')
  })

  it('giữ 1 chữ số thập phân khi có nghĩa (0,017 → "1,7%")', () => {
    expect(formatPercentVN(0.017)).toBe('1,7%')
  })

  it('giữ 1 chữ số thập phân cho lãi suất lẻ (0,132 → "13,2%")', () => {
    expect(formatPercentVN(0.132)).toBe('13,2%')
  })

  it('100% không có chữ số thập phân thừa', () => {
    expect(formatPercentVN(1)).toBe('100%')
  })
})
