import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'

// Không có React Testing Library trong dự án (CLAUDE.md: không thêm thư viện
// nếu chưa hỏi) — kiểm tra bằng quét mã nguồn, cùng cách tests/quy-tac.test.js
// đã dùng, thay vì render component.
const SOURCE = readFileSync(fileURLToPath(new URL('./ConsentPage.jsx', import.meta.url)), 'utf-8')

describe('ConsentPage — ô xác nhận mặc định chưa tích (Vòng 12 mục 2)', () => {
  it('state confirmed khởi tạo false', () => {
    expect(SOURCE).toMatch(/useState\(false\)/)
  })

  it('nút Đồng ý vô hiệu khi chưa tích (disabled={!confirmed})', () => {
    expect(SOURCE).toMatch(/disabled=\{!confirmed\}/)
  })

  it('checkbox không tích sẵn (checked={confirmed}, không có defaultChecked/checked={true})', () => {
    expect(SOURCE).toMatch(/checked=\{confirmed\}/)
    expect(SOURCE).not.toMatch(/defaultChecked/)
  })
})
