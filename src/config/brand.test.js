import { describe, it, expect } from 'vitest'
import { DISPLAY_NAME, LEGAL_NAME, TPP_CODE } from './brand.js'

describe('LEGAL_NAME', () => {
  it('không còn placeholder dạng "<...>" chưa điền', () => {
    expect(LEGAL_NAME).not.toContain('<')
  })

  it('không trùng DISPLAY_NAME (Vòng 7 ràng buộc khóa #6)', () => {
    expect(LEGAL_NAME).not.toBe(DISPLAY_NAME)
  })
})

// Vòng 12 mục 1 — LEGAL_NAME/TPP_CODE không còn dạng khung vuông "[...]" hay "xxx"
// chưa điền; TPP_CODE là mã đủ số (giả định), không phải placeholder.
describe('LEGAL_NAME và TPP_CODE — không còn placeholder (Vòng 12)', () => {
  it.each([
    ['LEGAL_NAME', LEGAL_NAME],
    ['TPP_CODE', TPP_CODE],
  ])('%s không chứa "[", "]" hay "xxx"', (_name, value) => {
    expect(value).not.toContain('[')
    expect(value).not.toContain(']')
    expect(value.toLowerCase()).not.toContain('xxx')
  })
})
