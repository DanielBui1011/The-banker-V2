# Vòng 25 — Hướng dẫn người dùng + hoàn thiện chuyển động

Spec: docs/san-pham.md mục D (D.1–D.5), H (thuật ngữ), L (chuyển động).
Nhánh: `vong-25-huong-dan` (từ main `313ea7d`).

Global constraints: CLAUDE.md, AGENTS.md, docs/quy-tac.md; test `tests/quy-tac.test.js` không nới;
không thêm dependency; `src/logic/` chỉ sửa theo TDD.

## Task 1 — Logic: đường "Đi tới" và bước tiếp theo ở vai cán bộ (TDD, src/logic/journey.js)
- Nhiệm vụ 1 "Đi tới" dẫn thẳng tới trang A1 (bước còn thiếu), không phải Tổng quan.
- `nextStep` ở cổng ngân hàng: xong cả 5 nhiệm vụ → "Bạn đã xong 5 nhiệm vụ…" + Đổi sang vai Nhà bán
  (không bỏ người dùng ở "Không cần làm gì").
- Test: `npm test -- journey`.

## Task 2 — Màn chào (D.1), danh sách nhiệm vụ đầy đủ (D.2), ngăn Hướng dẫn (D.5)
- `src/components/Guide.jsx`: WelcomeDialog (`<dialog>` gốc), TaskChecklist, HelpDrawer.
- AppShell dùng TaskChecklist; App.jsx thay bảng phím tắt bằng HelpDrawer; cổng nội bộ có nút "?".

## Task 3 — Chú giải thuật ngữ (H, D.4)
- `GLOSSARY` trong `src/data/mockData.js` (số lấy từ hằng có sẵn).
- `src/components/ui/Term.jsx`: `<button>` + bong bóng (portal), mở khi hover/focus, đóng bằng Esc.
- Gạch chân lần xuất hiện đầu tiên trên mỗi trang.

## Task 4 — Rà chuyển động theo L.2
- Chuyển bước tiến/lùi trượt đúng hướng; mọi hiệu ứng kết thúc ở opacity 1; reduced-motion hiện ngay.

## Task 5 — impeccable critique toàn app → docs/ui-audit.md mục "Vòng 25"; sửa mức Cao.

## Task 6 — Kiểm tra người mới bằng browser agent (xóa localStorage, "Bắt đầu có hướng dẫn",
chỉ theo thẻ Bước tiếp theo + nút "Đi tới", phải xong 5 nhiệm vụ). Ghi mọi chỗ phải đoán.
