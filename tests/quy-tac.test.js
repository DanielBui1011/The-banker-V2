// Kiểm tra vi phạm quy tắc nội dung — quét src/pages/** và src/components/**
// docs/quy-tac.md + ràng buộc CLAUDE.md
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'
import { fileURLToPath } from 'url'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const PAGES_DIR = join(ROOT, 'src', 'pages')
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

// Vòng 24: src/screens đã gỡ hết — mọi luật "màn" áp cho src/pages.
const screenFiles = collectJsxFiles(PAGES_DIR)
const allFiles = [...screenFiles, ...collectJsxFiles(COMPONENTS_DIR)]

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
  it('không xuất hiện trong src/pages và src/components', () => {
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
  it('src/pages không có text-xs / text-sm / text-[<16px]', () => {
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

// ─── 4. Số viết cứng kèm đơn vị trong JSX của src/pages ─────────────────────
// Vi phạm: literal như "85 triệu" hoặc "73 nghìn" viết thẳng trong JSX text
// (không qua formatNumberVN). Ngoại lệ khi có // allow-literal: <lý do>
const LITERAL_NUMBER_RE = /\b(\d{2,}(?:[,.]\d+)?)\s+(triệu|nghìn)\b/
describe('Quy tắc 4 — không viết cứng số có đơn vị trong JSX', () => {
  it('src/pages không có số literal kèm "triệu" / "nghìn"', () => {
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
// Các trang có hiển thị giá trị ước tính: Ứng vốn (Màn 5 cũ, bước ước tính/gửi) và Màn 10
const SCREENS_WITH_ESTIMATES = [join(PAGES_DIR, 'UngVon.jsx')]
describe('Quy tắc 5 — màn ước tính phải có EstimateDisclaimer', () => {
  it('UngVon import EstimateDisclaimer', () => {
    const violations = []
    for (const file of SCREENS_WITH_ESTIMATES) {
      const name = relative(ROOT, file)
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
// viết tay trong src/pages phải nằm trong allowlist dưới đây (đúng bảng màu
// ngữ nghĩa DESIGN.md tại thời điểm Vòng 12 — mỗi mục đã được soát thủ công).
// Thêm màu mới ở một màn phải sửa allowlist này một cách có ý thức, không phải
// vô tình sao chép class cũ từ màn khác. StatusBadge/src/ui/status.js và mọi
// component trong src/components/ui/* không bị quét (được phép tự do).
const COLOR_CLASS_RE = /\b(?:red|amber|teal|violet|orange)-\d{2,3}\b/g
// Vòng 22: Screen1–7, 9 đã xóa (thay bằng src/pages) → bỏ khỏi allowlist. Trang mới chỉ
// dùng token Hướng B + StatusBadge; ngoại lệ duy nhất: tỷ lệ khớp Tầng 1 ở Đối soát (teal,
// giữ từ Screen3 đã duyệt).
const ALLOWED_SCREEN_COLOR_CLASSES = {
  'DoiSoat.jsx': ['teal-700'],
}
describe('Quy tắc 6 — màu ngữ nghĩa chỉ qua allowlist đã duyệt', () => {
  it('src/pages không có class red-*/amber-*/teal-*/violet-*/orange-* mới ngoài allowlist', () => {
    const violations = []
    for (const file of screenFiles) {
      const name = file.split(/[\\/]/).pop()
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
// ScenarioPanel. Mọi file thuộc src/pages/src/components chỉ được nhắc "Màn N" trong
// comment (// hoặc /* */), không phải trong chuỗi JSX hiển thị.
const SCREEN_REF_RE = /Màn\s*\d+/
describe('Quy tắc 7 — không lộ "Màn X" ra chuỗi hiển thị', () => {
  it('src/pages và src/components không hiện "Màn N" ngoài comment', () => {
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

// ─── 10. Tên sản phẩm Capix — một nguồn duy nhất (Vòng 19b) ─────────────────────
// Tên cũ không còn trong src/, tests/, index.html; bề mặt hiển thị lấy tên từ brand.js.
const OLD_NAMES = ['đừng đóng vai anh', 'dung dong vai anh', 'dung-dong-vai-anh', 'ddva', 'settlebank', '[tên app]']
const SRC_FILES = collectJsxFiles(join(ROOT, 'src'))
const SELF = fileURLToPath(import.meta.url)

describe('Quy tắc 10 — tên sản phẩm đi qua src/config/brand.js', () => {
  it('không còn tên cũ trong src/, tests/, index.html', () => {
    const files = [...SRC_FILES, ...collectJsxFiles(join(ROOT, 'tests')), join(ROOT, 'index.html')]
    const violations = []
    for (const file of files) {
      if (file === SELF) continue
      const lower = readFileSync(file, 'utf-8').toLowerCase()
      for (const name of OLD_NAMES) if (lower.includes(name)) violations.push(`${relative(ROOT, file)}: "${name}"`)
    }
    expect(violations).toEqual([])
  })

  // Chỉ bề mặt hiển thị; khóa localStorage 'capix-app-v1' ở src/logic không phải chuỗi hiển thị.
  it('không gõ trực tiếp "Capix" trong src/pages, src/components, App.jsx', () => {
    const violations = [...allFiles, join(ROOT, 'src', 'App.jsx')]
      .filter((f) => /capix/i.test(readFileSync(f, 'utf-8')))
      .map((f) => relative(ROOT, f))
    expect(violations).toEqual([])
  })
})

// ─── 11. Chữ "prototype" / "mô phỏng" chỉ ở chỗ được phép (Vòng 28) ─────────────
// Trang sản phẩm không nói về việc dàn dựng. Được phép: SimHint (chip mở bảng Mô phỏng), bảng
// Mô phỏng, chân trang (FOOTER_NOTE ở mockData, không quét), nhãn khung ngân hàng (SurfaceFrame).
// Chuỗi từ src/logic (thẻ Bước tiếp theo, lý do chặn) có test riêng ở journey.test.js.
const STAGED_RE = /prototype|mô phỏng/i
const STAGED_ALLOWED_FILES = ['SimHint.jsx', 'ScenarioPanel.jsx', 'SurfaceFrame.jsx']
describe('Quy tắc 11 — không nhắc "prototype"/"mô phỏng" ngoài SimHint', () => {
  it('src/pages và src/components: chỉ trong comment, trong <SimHint> hoặc file được phép', () => {
    const violations = []
    for (const file of allFiles) {
      if (STAGED_ALLOWED_FILES.includes(file.split(/[\\/]/).pop())) continue
      const lines = getLines(file)
      let inSimHint = false
      for (const { text: raw, num, rel } of lines) {
        const text = raw.replace(/\r$/, '')
        if (text.includes('<SimHint')) inSimHint = true
        const code = text.replace(/\{\/\*.*?\*\/\}/g, '').replace(/(^|\s)\/\/.*$/, '')
        const trimmed = code.trimStart()
        const isComment = trimmed.startsWith('*') || trimmed.startsWith('/*') || trimmed === ''
        if (!inSimHint && !isComment && STAGED_RE.test(code)) violations.push(`${rel}:${num} — "${text.trim().slice(0, 100)}"`)
        if (text.includes('</SimHint>') || /<SimHint[^>]*\/>/.test(text)) inSimHint = false
      }
    }
    expect(violations, violations.join('\n')).toHaveLength(0)
  })
})

// ─── 12. "Tua tới sự kiện tiếp theo" là thao tác mô phỏng (Vòng 29) ─────────────
// Đường dẫn Tua đến từ dữ liệu (nextStep.action, availability.fix, nhiệm vụ) nên không quét được
// theo chữ. Luật: file nào vẽ đường dẫn động (`href={….fix.href}` / `href={….action.href}`) phải
// rẽ nhánh qua isSimHref (SimHint.jsx) — Tua và lệnh mở bảng Mô phỏng thành chip SimHint, không
// thành nút đặc/viền của sản phẩm. Bảng Mô phỏng (ScenarioPanel.jsx) tự là nơi mô phỏng.
const DYNAMIC_HREF_RE = /href=\{[^}]*\.(fix|action)\.href\}/
const SIM_EXEMPT_FILES = ['ScenarioPanel.jsx', 'SimHint.jsx']
describe('Quy tắc 12 — đường dẫn Tua/mô phỏng vẽ bằng SimHint', () => {
  it('file vẽ đường dẫn động phải dùng isSimHref', () => {
    const violations = allFiles
      .filter((f) => !SIM_EXEMPT_FILES.includes(f.split(/[\/]/).pop()))
      .filter((f) => {
        const content = readFileSync(f, 'utf-8')
        return DYNAMIC_HREF_RE.test(content) && !/\bisSimHref\(/.test(content)
      })
      .map((f) => relative(ROOT, f))
    expect(violations, violations.join('\n')).toHaveLength(0)
  })
})
