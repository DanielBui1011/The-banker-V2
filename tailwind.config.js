/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Cỡ chữ gốc tăng theo CLAUDE.md mục #7 / quy-tac.md mục 8 (trình chiếu
      // 1920×1080): chữ phụ/nhãn/chú thích/chữ trong bảng tối thiểu 16px, tiêu đề
      // màn tối thiểu 32px. Ghi đè ở đây để mọi màn — kể cả các màn chưa xây —
      // tự động đạt quy tắc mà không cần chỉnh từng lớp text-* riêng lẻ.
      fontSize: {
        xs: ['1rem', { lineHeight: '1.5rem' }], // 16px
        sm: ['1rem', { lineHeight: '1.5rem' }], // 16px
        base: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
        lg: ['1.25rem', { lineHeight: '1.875rem' }], // 20px
        xl: ['1.375rem', { lineHeight: '2rem' }], // 22px
        '2xl': ['1.625rem', { lineHeight: '2.25rem' }], // 26px
        '3xl': ['2.125rem', { lineHeight: '2.5rem' }], // 34px — tiêu đề màn

        // Thang chữ hệ thống thiết kế Vòng 7A (docs/thiet-ke.md mục 2) — dùng cho
        // src/components/ui/* và các màn áp chuẩn mới. Đặt tên riêng, không đụng
        // thang xs..3xl ở trên để các màn 2–10 chưa migrate không bị đổi cỡ chữ.
        label: ['1rem', { lineHeight: '1.5rem' }], // 16px — nhãn phụ, tối thiểu tuyệt đối
        body: ['1.25rem', { lineHeight: '1.75rem' }], // 20px — thân bài
        emphasis: ['1.5rem', { lineHeight: '2rem' }], // 24px — nhấn
        'section-title': ['2rem', { lineHeight: '2.5rem' }], // 32px — tiêu đề mục
        'screen-title': ['2.75rem', { lineHeight: '3.25rem' }], // 44px — tiêu đề màn
        hero: ['4rem', { lineHeight: '4.25rem' }], // 64px — con số chủ đạo
      },
      fontFamily: {
        // Be Vietnam Pro tự host qua @fontsource — không gọi Google Fonts CDN
        // (CLAUDE.md #9, docs/quy-tac.md #6: không gọi API/tài nguyên bên ngoài).
        sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Primary của Nền tảng (docs/thiet-ke.md mục 2). Không dùng đỏ cho ngân
        // hàng vì đỏ đã là màu ngữ nghĩa "đứt gãy".
        navy: {
          DEFAULT: '#0B2545',
          50: '#E7ECF2',
          600: '#123A6B',
          700: '#0B2545',
        },
      },
    },
  },
  plugins: [],
}
