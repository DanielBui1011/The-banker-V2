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

// ─── 6. Màu ngữ nghĩa — chỉ qua allowlist đã duyệt (Vòng 12 mục 3) ─────────────
// Chốt chặn chống tái phạm: class Tailwind red-*/amber-*/teal-*/violet-*/orange-*
// viết tay trong src/screens phải nằm trong allowlist dưới đây (đúng bảng màu
// ngữ nghĩa DESIGN.md tại thời điểm Vòng 12 — mỗi mục đã được soát thủ công).
// Thêm màu mới ở một màn phải sửa allowlist này một cách có ý thức, không phải
// vô tình sao chép class cũ từ màn khác. StatusBadge/src/ui/status.js và mọi
// component trong src/components/ui/* không bị quét (được phép tự do).
const COLOR_CLASS_RE = /\b(?:red|amber|teal|violet|orange)-\d{2,3}\b/g
const ALLOWED_SCREEN_COLOR_CLASSES = {
  'Screen1.jsx': ['teal-700', 'amber-700', 'amber-50'],
  'Screen2.jsx': ['red-500', 'amber-400'],
  'Screen3.jsx': ['teal-700', 'teal-200', 'teal-50', 'amber-700'],
  'Screen4.jsx': ['teal-700', 'teal-200', 'teal-50', 'amber-50', 'amber-300', 'amber-700'],
  'Screen5.jsx': ['teal-600', 'red-400', 'red-50', 'red-600', 'teal-50', 'teal-800', 'amber-700'],
  'Screen6.jsx': ['teal-500', 'teal-600', 'teal-50', 'violet-50', 'violet-600', 'violet-900', 'teal-700', 'teal-800'],
  'Screen7.jsx': ['teal-100', 'teal-50', 'teal-600', 'teal-700'],
  'Screen9.jsx': ['red-50', 'red-600', 'red-800', 'red-700'],
  'Screen10.jsx': [
    'teal-50', 'teal-600', 'teal-700', 'teal-100',
    'violet-50', 'violet-600', 'violet-900', 'violet-100', 'violet-300', 'violet-700',
  ],
}
describe('Quy tắc 6 — màu ngữ nghĩa chỉ qua allowlist đã duyệt', () => {
  it('src/screens không có class red-*/amber-*/teal-*/violet-*/orange-* mới ngoài allowlist', () => {
    const violations = []
    for (const file of screenFiles) {
      const name = relative(SCREENS_DIR, file)
      const allowed = new Set(ALLOWED_SCREEN_COLOR_CLASSES[name] ?? [])
      const content = readFileSync(file, 'utf-8')
      const found = new Set(content.match(COLOR_CLASS_RE) ?? [])
      for (const cls of found) {
        if (!allowed.has(cls)) {
          violations.push(`${name}: class "${cls}" chưa duyệt — dùng StatusBadge/src/ui/status.js, hoặc thêm có ý thức vào ALLOWED_SCREEN_COLOR_CLASSES`)
        }
      }
    }
    expect(violations, violations.join('\n')).toHaveLength(0)
  })
})

// ─── 7. Không lộ "Màn X" trong chuỗi hiển thị cho nhà bán/ngân hàng ────────────
// Vòng 21: không còn "màn" (san-pham.md mục J) — bỏ miễn trừ cũ cho TopBar/KeyHint/
// ScenarioPanel. Mọi file thuộc src/screens/src/components chỉ được nhắc "Màn N" trong
// comment (// hoặc /* */), không phải trong chuỗi JSX hiển thị.
const SCREEN_REF_RE = /Màn\s*\d+/
describe('Quy tắc 7 — không lộ "Màn X" ra chuỗi hiển thị', () => {
  it('src/screens và src/components không hiện "Màn N" ngoài comment', () => {
    const violations = []
    for (const file of allFiles) {
      for (const { text, num, rel } of getLines(file)) {
        const trimmed = text.trimStart()
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) continue
        if (SCREEN_REF_RE.test(text)) {
          violations.push(`${rel}:${num} — "${text.trim().slice(0, 100)}"`)
        }
      }
    }
    expect(violations, violations.join('\n')).toHaveLength(0)
  })
})

// ─── 8. Tương phản chữ (Vòng 16) ────────────────────────────────────────────────
// Chữ nội dung phải đạt ≥4,5:1 (WCAG AA): cấm text-slate/gray-100…400 (chữ sáng trên
// nền tối dùng text-slate-50 hoặc text-white) và opacity-* gắn thẳng lên phần tử (làm
// mờ chữ). Biến thể trạng thái (disabled:, hover:) được phép — nút disabled cần mờ.
const LOW_CONTRAST_TEXT_RE = /\btext-(?:slate|gray)-[1-4]00\b/
const BASE_OPACITY_RE = /(?:^|[\s"'`{])opacity-\d+\b/
describe('Quy tắc 8 — tương phản chữ', () => {
  it('không có text-slate/gray-100…400 hay opacity-* trên phần tử', () => {
    const violations = []
    for (const file of allFiles) {
      for (const { text, num, rel } of getLines(file)) {
        const trimmed = text.trimStart()
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue
        if (LOW_CONTRAST_TEXT_RE.test(text) || BASE_OPACITY_RE.test(text)) {
          violations.push(`${rel}:${num} — "${text.trim().slice(0, 100)}"`)
        }
      }
    }
    expect(violations, violations.join('\n')).toHaveLength(0)
  })
})

// ─── 9. Token tầng và token Techcombank đúng chỗ (docs/san-pham.md K.2, K.3 — Vòng 21) ──
// K.3 mục 1: đỏ thương hiệu Techcombank chỉ ở vạch khung trang Techcombank → mọi token
// tcb-* (và mã màu gốc của chúng) chỉ được dùng trong SurfaceFrame (variant bank).
// K.2: nền tầng chỉ ở dải tiêu đề trang và mục điều hướng đang chọn — không dùng cho thẻ
// đơn vị (trạng thái chỉ qua StatusBadge) → token tier*-* chỉ trong các file đã duyệt.
// Mở rộng allowlist có ý thức khi dựng dải tiêu đề trang (Vòng 22+), không nới luật.
const TCB_TOKEN_RE = /\btcb-(?:bar|on-bar|stripe|gold)\b|--color-tcb-|#(?:E3262B|D4AF37|141414)\b/i
const TCB_ALLOWED_FILES = ['SurfaceFrame.jsx']
const TIER_TOKEN_RE = /\btier[123]-(?:bg|fg)\b/
const TIER_ALLOWED_FILES = ['AppShell.jsx']
describe('Quy tắc 9 — token Techcombank và token tầng đúng chỗ', () => {
  it('token tcb-* chỉ trong SurfaceFrame; token tier*-* chỉ trong file đã duyệt', () => {
    const violations = []
    for (const file of allFiles) {
      const base = file.split(/[\\/]/).pop()
      for (const { text, num, rel } of getLines(file)) {
        const trimmed = text.trimStart()
        if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue
        if (TCB_TOKEN_RE.test(text) && !TCB_ALLOWED_FILES.includes(base))
          violations.push(`${rel}:${num} — token Techcombank ngoài SurfaceFrame: "${text.trim().slice(0, 100)}"`)
        if (TIER_TOKEN_RE.test(text) && !TIER_ALLOWED_FILES.includes(base))
          violations.push(`${rel}:${num} — token tầng ngoài file đã duyệt: "${text.trim().slice(0, 100)}"`)
      }
    }
    expect(violations, violations.join('\n')).toHaveLength(0)
  })

  it('SurfaceFrame chỉ dùng token tcb-* trong nhánh variant bank', () => {
    const content = readFileSync(join(COMPONENTS_DIR, 'ui', 'SurfaceFrame.jsx'), 'utf-8')
    const bankOps = content.slice(content.indexOf("variant === 'bankOps'"), content.indexOf('return (', content.indexOf("variant === 'bankOps'") + 1) + 1)
    const [platform, tech] = [/platform:\s*{[^}]*}/.exec(content)?.[0] ?? '', /tech:\s*{[^}]*}/.exec(content)?.[0] ?? '']
    for (const part of [platform, tech, bankOps]) expect(TCB_TOKEN_RE.test(part)).toBe(false)
  })
})
