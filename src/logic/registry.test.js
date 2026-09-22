import { describe, it, expect } from 'vitest'
import { lockUnit } from './registry.js'

// Giá trị khả dụng từ T1 (docs/du-lieu.md mục 4.3): RU-03 = 46,75; RU-04 = 38,25
const AVAILABLE_RU03 = 46.75
const AVAILABLE_RU04 = 38.25

describe('lockUnit — lũy đẳng và kiểm soát khả dụng', () => {
  it('T11 — gửi lại cùng requestId: vẫn 1 sự kiện, tổng 85', () => {
    let reg = []
    const req = { lenderId: 'TCB', unitId: 'RU-03', requestId: 'REQ-001', amount: AVAILABLE_RU03, availableValue: AVAILABLE_RU03 }

    const r1 = lockUnit(reg, req)
    expect(r1.result.status).toBe('OK')
    reg = r1.registry
    expect(reg).toHaveLength(1)

    // Gửi lại cùng requestId
    const r2 = lockUnit(reg, req)
    expect(r2.result.status).toBe('DA_GHI_NHAN')
    expect(r2.registry).toHaveLength(1) // không thêm sự kiện mới
    expect(r2.result.certificate).toEqual(r1.result.certificate)
  })

  it('T12 — khóa vượt khả dụng bị từ chối, trả phần còn trống', () => {
    let reg = []
    const r1 = lockUnit(reg, {
      lenderId: 'TCB', unitId: 'RU-03', requestId: 'REQ-001', amount: 30, availableValue: AVAILABLE_RU03,
    })
    expect(r1.result.status).toBe('OK')
    reg = r1.registry

    // Yêu cầu khóa thêm 20 nhưng chỉ còn 16,75
    const r2 = lockUnit(reg, {
      lenderId: 'BNB', unitId: 'RU-03', requestId: 'REQ-002', amount: 20, availableValue: AVAILABLE_RU03,
    })
    expect(r2.result.status).toBe('TU_CHOI')
    expect(r2.result.availableRemaining).toBeCloseTo(AVAILABLE_RU03 - 30, 5)
    expect(r2.registry).toHaveLength(1) // không thêm sự kiện
  })

  it('T13 — requestId mới trên đơn vị đã khóa hết bị từ chối', () => {
    let reg = []
    const r1 = lockUnit(reg, {
      lenderId: 'TCB', unitId: 'RU-03', requestId: 'REQ-001', amount: AVAILABLE_RU03, availableValue: AVAILABLE_RU03,
    })
    expect(r1.result.status).toBe('OK')
    reg = r1.registry

    // requestId mới, đơn vị đã khóa hết
    const r2 = lockUnit(reg, {
      lenderId: 'BNB', unitId: 'RU-03', requestId: 'REQ-002', amount: 1, availableValue: AVAILABLE_RU03,
    })
    expect(r2.result.status).toBe('TU_CHOI')
    expect(r2.result.availableRemaining).toBeCloseTo(0, 5)
  })
})
