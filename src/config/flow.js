// Cấu hình luồng màn hình — nguồn duy nhất cho thứ tự chuyển màn (mũi tên trái/phải)
// và ánh xạ màn → hồi. Tên 4 hồi lấy nguyên văn từ docs/kich-ban.md, không tự đặt.
// src/state/journeyState.js và src/components/ScreenShell.jsx đọc từ đây.

export const ACT_LABELS = [
  'Hồi 1 — Vấn đề',
  'Hồi 2 — Cấp quyền',
  'Hồi 3 — Nhận giá trị',
  'Hồi 4 — Tất toán và hệ sinh thái',
]

// Thứ tự khi bấm mũi tên phải — docs/man-hinh.md:
// "1 → 2 → 7 → 3 → 4 → 5 → 6 → 8 → (10 nếu Giai đoạn 3 đang bật)"
// Màn 9 không nằm trong chuỗi này: đó là diễn biến thay thế của Màn 6 khi bật rò rỉ
// (phím L), được nối vào từ trạng thái kịch bản, không qua mũi tên trái/phải.
const BASE_SCREEN_ORDER = [1, 2, 7, 3, 4, 5, 6, 8]

// Màn 10 chỉ xuất hiện trong chuỗi mũi tên khi Giai đoạn 3 (phím 3) đang bật.
export function screenOrderFor(phase3) {
  return phase3 ? [...BASE_SCREEN_ORDER, 10] : BASE_SCREEN_ORDER
}

const ACT_BY_SCREEN = {
  1: 1,
  2: 2,
  7: 2,
  3: 3,
  4: 3,
  5: 3,
  6: 4,
  8: 4,
  10: 4,
}

export function actForScreen(screenNumber) {
  return ACT_BY_SCREEN[screenNumber] ?? null
}
