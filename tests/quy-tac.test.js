// Kiểm tra vi phạm quy tắc nội dung — quét src/screens/** và src/components/**
// docs/quy-tac.md + ràng buộc CLAUDE.md
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'
import { fileURLToPath } from 'url'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const SCREENS_DIR = join(ROOT, 'src', 'screens')
const COMPONENTS_DIR = join(ROOT, 'src', 'components')

function collectJsxFiles(dir) {
  const results = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) results.push(...collectJsxFiles(full))
    else if (/\.[jt]sx?$/.test(entry)) results.push(full)
  }
  return results
}

function getLines(filepath) {
  return readFileSync(filepath, 'utf-8')
    .split('\n')
    .map((line, i) => ({ text: line, num: i + 1, rel: relative(ROOT, filepath) }))
}

const allFiles = [...collectJsxFiles(SCREENS_DIR), ...collectJsxFiles(COMPONENTS_DIR)]
const screenFiles = collectJsxFiles(SCREENS_DIR)

// ─── 1. Cụm từ cấm ─────────────────────────────────────────────────────────────
const BANNED_PHRASES = [
  'Nền tảng cho vay',
  'Nền tảng ứng',       // bắt cả "Nền tảng ứng tiền"
  'Nền tảng giải ngân',
  'Nền tảng giữ tiền',
  'mua khoản phải thu',
  'bán khoản phải thu',
  'ví của Nền tảng',
  'tài khoản trung gian',
]

describe('Quy tắc 1 — cụm từ cấm', () => {
  it('không xuất hiện trong src/screens và src/components', () => {
    const violations = []
    for (const file of allFiles) {
      const content = readFileSync(file, 'utf-8')
      for (const phrase of BANNED_PHRASES) {
        const lower = content.toLowerCase()
        const idx = lower.indexOf(phrase.toLowerCase())
        if (idx === -1) continue
        // Cho phép trong comment giải thích quy tắc (dòng chứa "không dùng" hoặc "cụm từ không được")
        const lineStart = content.lastIndexOf('\n', idx) + 1
        const lineText = content.slice(lineStart, content.indexOf('\n', idx))
        const isRuleComment =
          lineText.trimStart().startsWith('//') ||
          lineText.trimStart().startsWith('*') ||
          lineText.includes('không dùng') ||
          lineText.includes('không được dùng')
        if (!isRuleComment) {
          violations.push(`${relative(ROOT, file)}: cụm "${phrase}" — "${lineText.trim().slice(0, 80)}"`)
        }
      }
    }
    expect(violations, violations.join('\n')).toHaveLength(0)
  })
})

// ─── 2. Kích thước chữ < 16px ──────────────────────────────────────────────────
const SMALL_FONT_PATTERNS = [
  /\btext-xs\b/,
  /\btext-sm\b/,
  /\btext-\[(?:[1-9]|1[0-5])px\]/,
]
// Các class Tailwind này được dùng hợp lệ trong component UI nội bộ (KeyHint, badge phụ)
// chỉ khi có chú thích // allow-small-text
describe('Quy tắc 2 — không dùng chữ < 16px', () => {
  it('src/screens không có text-xs / text-sm / text-[<16px]', () => {
    const violations = []
    for (const file of screenFiles) {
      for (const { text, num, rel } of getLines(file)) {
        const trimmed = text.trimStart()
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue
        if (text.includes('// allow-small-text')) continue
        for (const pat of SMALL_FONT_PATTERNS) {
          if (pat.test(text)) {
            violations.push(`${rel}:${num} — "${text.trim().slice(0, 80)}"`)
          }
        }
      }
    }
    expect(violations, violations.join('\n')).toHaveLength(0)
  })
})

// ─── 3. DISPLAY_NAME không xuất hiện trong bề mặt bank/bankOps ─────────────────
describe('Quy tắc 3 — DISPLAY_NAME không ở bề mặt ngân hàng', () => {
  it('file có SurfaceFrame bank/bankOps không import hay dùng DISPLAY_NAME', () => {
    const violations = []
    for (const file of allFiles) {
      const content = readFileSync(file, 'utf-8')
      const hasBankSurface =
        /SurfaceFrame[^>]*variant=["']bank(?:Ops)?["']/.test(content) ||
        /variant=\{["']bank(?:Ops)?["']\}/.test(content)
      if (!hasBankSurface) continue
      if (/\bDISPLAY_NAME\b/.test(content)) {
        violations.push(`${relative(ROOT, file)} dùng DISPLAY_NAME trong bề mặt bank/bankOps`)
      }
    }
    expect(violations, violations.join('\n')).toHaveLength(0)
  })
})

// ─── 4. Số viết cứng kèm đơn vị trong JSX của src/screens ─────────────────────
// Vi phạm: literal như "85 triệu" hoặc "73 nghìn" viết thẳng trong JSX text
// (không qua formatNumberVN). Ngoại lệ khi có // allow-literal: <lý do>
const LITERAL_NUMBER_RE = /\b(\d{2,}(?:[,.]\d+)?)\s+(triệu|nghìn)\b/
describe('Quy tắc 4 — không viết cứng số có đơn vị trong JSX', () => {
  it('src/screens không có số literal kèm "triệu" / "nghìn"', () => {
    const violations = []
    for (const file of screenFiles) {
      for (const { text, num, rel } of getLines(file)) {
        const trimmed = text.trimStart()
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue
        if (text.includes('// allow-literal:')) continue
        // Bỏ qua phần bên trong template expression ${...} bằng cách xoá chúng trước khi test
        const stripped = text.replace(/\$\{[^}]*\}/g, '').replace(/formatNumberVN\([^)]*\)/g, '')
        if (LITERAL_NUMBER_RE.test(stripped)) {
          violations.push(`${rel}:${num} — "${text.trim().slice(0, 100)}"`)
        }
      }
    }
    expect(violations, violations.join('\n')).toHaveLength(0)
  })
})

// ─── 5. Màn hiện giá trị ước tính phải có EstimateDisclaimer ───────────────────
// Các màn biết có hiển thị giá trị ước tính (theo man-hinh.md): Màn 5 (bước 5b/5d), Màn 10
const SCREENS_WITH_ESTIMATES = ['Screen5.jsx', 'Screen10.jsx']
describe('Quy tắc 5 — màn ước tính phải có EstimateDisclaimer', () => {
  it('Screen5 và Screen10 import EstimateDisclaimer', () => {
    const violations = []
    for (const name of SCREENS_WITH_ESTIMATES) {
      const file = join(SCREENS_DIR, name)
      const content = readFileSync(file, 'utf-8')
      if (!content.includes('EstimateDisclaimer')) {
        violations.push(`${name} thiếu EstimateDisclaimer`)
      }
    }
    expect(violations, violations.join('\n')).toHaveLength(0)
  })
})
