# Vòng 29 — Trước–sau, xử lý đứt gãy, SimHint cho Tua

Spec: docs/san-pham.md (E.1, F, G, D.2, D.3), DESIGN.md, AGENTS.md, docs/du-lieu.md.
Nhánh: `vong-29-truoc-sau` (từ main `b5ea385`). Nguồn: walkthrough v28 (docs/shots/v28/walkthrough.md).

Global constraints: không đổi công thức pricing.js / verification.js / registry.js; logic mới trong
src/logic/ viết theo TDD; tests/quy-tac.test.js không nới (chỉ cập nhật luật Tua theo yêu cầu);
không thêm dependency; mọi số từ mockData / selector.

## Task 1 — Tổng quan "trước → sau"
- Thẻ "Đối soát": sau A1 và ngày ≥ 15/09 → "Tự động · 76% giao dịch tự khớp", phụ "Trước: thủ công 9 giờ/tháng"
  (tỷ lệ từ selector của trang Đối soát).
- Thẻ "Vốn": sau giải ngân → "Ứng vốn có bảo đảm · 12%/năm (Techcombank)", phụ "Trước: vay tín chấp từ 2%/tháng
  (≈24%/năm danh nghĩa)"; thêm 24%/năm vào docs/du-lieu.md (số dẫn xuất 2% × 12).
- Trước khi kết nối giữ nguyên. Một nút đặc mỗi trang.

## Task 2 — Đứt gãy đã xử lý (t05) — logic TDD + Khoản vay + cổng ngân hàng
- Sau giải trình VÀ trả RU-03 từ nguồn khác: RU-03 "Đã trả từ nguồn khác" (trung tính, icon) + "Từng đứt gãy 24/09";
  khóa giải phóng; điểm Shopee giữ 58.
- Khối đỏ đầu trang → khối trung tính "Đã xử lý", thu gọn được; đỏ chỉ khi còn đứt gãy chưa xử lý.
- Dòng thời gian: "24/09 — Giải trình, trả RU-03 từ nguồn khác".
- Cổng ngân hàng: cảnh báo RU-03 "Đã xử lý"; chấm đếm mất khi không còn cảnh báo mở.
- Test chuỗi đứt gãy → giải trình → trả nguồn khác → trạng thái cuối, vai nhà bán và cán bộ.

## Task 3 — Trạng thái kết thúc (n35)
- Xong 5 nhiệm vụ: thẻ Bước tiếp theo "Bạn đã hoàn thành hành trình chính. Thử thêm:" + 2 SimHint bấm được
  ("Nhà bán đổi tài khoản nhận tiền", "Giai đoạn 3 — nhiều bên chào giá"); bấm → bật tình huống qua availability();
  cần bắt đầu lại thì hỏi xác nhận.

## Task 4 — "Tua tới sự kiện tiếp theo" thành SimHint dạng nút ở mọi trang sản phẩm + cổng ngân hàng;
cập nhật DESIGN.md + tests/quy-tac.test.js.

## Task 5 — Chi tiết: n23 vạch trần 150 + phần "Bị chặn", chip mùa cao điểm một lần; t02 bỏ liên kết tự trỏ;
c04/c07 câu lũy đẳng trên hàng nút, kết quả dưới nút, toast đổi vai ≤3s; n32 cột "Bên" "Capix (TPP)" + tooltip;
DESIGN.md: chấm đỏ bankOps giữ nguyên, luật nút "tối đa một; đúng một khi còn việc".

## Task 6 — Chụp ảnh v29 + walkthrough (mẫu v28), thêm cảnh mới; build + test; PR.
