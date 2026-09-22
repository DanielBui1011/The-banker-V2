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
      },
    },
  },
  plugins: [],
}
