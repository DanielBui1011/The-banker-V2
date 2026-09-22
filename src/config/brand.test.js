import { describe, it, expect } from 'vitest'
import { DISPLAY_NAME, LEGAL_NAME } from './brand.js'

describe('LEGAL_NAME', () => {
  it('không còn placeholder dạng "<...>" chưa điền', () => {
    expect(LEGAL_NAME).not.toContain('<')
  })

  it('không trùng DISPLAY_NAME (Vòng 7 ràng buộc khóa #6)', () => {
    expect(LEGAL_NAME).not.toBe(DISPLAY_NAME)
  })
})
