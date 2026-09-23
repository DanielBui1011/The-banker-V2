/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Cỡ chữ gốc: chữ phụ/nhãn/chú thích/chữ trong bảng tối thiểu 16px (quy-tac.md
      // mục 8). Ghi đè ở đây để mọi màn tự đạt sàn 16px mà không chỉnh từng lớp text-*.
      // Code mới không dùng xs/sm/base (AGENTS.md mục 6).
      fontSize: {
        xs: ['1rem', { lineHeight: '1.5rem' }], // 16px
        sm: ['1rem', { lineHeight: '1.5rem' }], // 16px
        base: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        lg: ['1.25rem', { lineHeight: '1.875rem' }], // 20px
        xl: ['1.375rem', { lineHeight: '2rem' }], // 22px
        '2xl': ['1.625rem', { lineHeight: '2.25rem' }], // 26px
        '3xl': ['2.125rem', { lineHeight: '2.5rem' }], // 34px

        // Thang chữ laptop (docs/san-pham.md K.5, Vòng 21): bỏ Stage co giãn nên cỡ chữ
        // là px thật. Giữ tên lớp cũ để các màn chưa chuyển tự đổi cỡ theo.
        label: ['1rem', { lineHeight: '1.5rem' }], // 16px — nhãn, sàn tuyệt đối
        body: ['1.125rem', { lineHeight: '1.75rem' }], // 18px — thân
        emphasis: ['1.25rem', { lineHeight: '1.875rem' }], // 20px — nhấn
        'section-title': ['1.5rem', { lineHeight: '2rem' }], // 24px — tiêu đề mục
        'screen-title': ['1.75rem', { lineHeight: '2.25rem' }], // 28px — tiêu đề trang
        hero: ['3rem', { lineHeight: '3.5rem' }], // 48px — con số chính
      },
      fontFamily: {
        // Be Vietnam Pro tự host qua @fontsource — không gọi Google Fonts CDN
        // (CLAUDE.md #9, docs/quy-tac.md #6: không gọi API/tài nguyên bên ngoài).
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
      },
      // Hệ màu Hướng B (docs/san-pham.md K.2, K.4) — giá trị ở biến CSS trong src/index.css.
      // navy = bí danh của --color-primary cho các màn cũ; SurfaceFrame ghi đè --color-navy
      // trong khung bank/bankOps (cobalt không làm nút chính ở trang ngân hàng).
      // tier*: chỉ nền dải tiêu đề trang và mục điều hướng đang chọn (K.2).
      // tcb-*: chỉ trong SurfaceFrame variant bank (K.3 — tests/quy-tac.test.js Quy tắc 9).
      colors: {
        navy: 'var(--color-navy)',
        app: { bg: 'var(--color-app-bg)', surface: 'var(--color-app-surface)' },
        ink: { DEFAULT: 'var(--color-ink)', muted: 'var(--color-ink-muted)' },
        line: 'var(--color-line)',
        primary: { DEFAULT: 'var(--color-primary)', soft: 'var(--color-primary-soft)' },
        tier1: { bg: 'var(--color-tier1-bg)', fg: 'var(--color-tier1-fg)' },
        tier2: { bg: 'var(--color-tier2-bg)', fg: 'var(--color-tier2-fg)' },
        tier3: { bg: 'var(--color-tier3-bg)', fg: 'var(--color-tier3-fg)' },
        tcb: {
          bar: 'var(--color-tcb-bar)',
          'on-bar': 'var(--color-tcb-on-bar)',
          stripe: 'var(--color-tcb-stripe)',
          gold: 'var(--color-tcb-gold)',
        },
      },
      // Chuyển động (docs/san-pham.md L.1): trần 400ms, trừ handoff 700ms.
      transitionDuration: {
        fast: 'var(--dur-fast)',
        standard: 'var(--dur-standard)',
        slow: 'var(--dur-slow)',
        handoff: 'var(--dur-handoff)',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
        in: 'var(--ease-in)',
        standard: 'var(--ease-standard)',
      },
    },
  },
  plugins: [],
}
