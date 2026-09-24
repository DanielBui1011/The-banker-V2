# ĐỪNG ĐÓNG VAI ANH — Prototype mô phỏng

## Mục đích
Giao diện mô phỏng hành trình khách hàng cho đề án Open Banking (cuộc thi FTU, Vòng 3).
Dùng để trình bày trước ban giám khảo. KHÔNG phải sản phẩm thật: không backend,
không gọi API bên ngoài, không lưu dữ liệu thật.

## Tài liệu nguồn — đọc trước khi sửa bất kỳ màn nào
- docs/kich-ban.md — kịch bản 3 phút, 4 hồi
- docs/man-hinh.md — đặc tả 10 màn
- docs/du-lieu.md — nguồn số liệu duy nhất, kèm công thức và kết quả bắt buộc
- docs/quy-tac.md — ràng buộc pháp lý và nội dung
- docs/thiet-ke.md — hệ thống thiết kế và khung trình chiếu (Stage/TopBar/token)
- docs/reference/settlesync_prototype.html — bản cũ, tham khảo để tái sử dụng

Mọi thay đổi giao diện theo docs/thiet-ke.md và chỉ dùng component trong
src/components/ui/.

## Công nghệ
Vite + React + Tailwind CSS. Vitest cho kiểm thử công thức.
Không thêm thư viện khác nếu chưa hỏi.

## Cấu trúc
- src/data/mockData.js — toàn bộ số liệu, chuyển từ docs/du-lieu.md
- src/logic/pricing.js — công thức giá trị khả dụng
- src/logic/verification.js — công thức điểm xác thực
- src/logic/registry.js — hàm thuần lockUnit() event-sourced; lũy đẳng theo requestId
- src/logic/journey.js — reducer + selector hành trình (availability, nextStep, loan, accessLog…)
- src/state/appState.jsx — store duy nhất bọc journey.js, lưu localStorage
- src/pages/ — 6 trang nhà bán; src/pages/bank/ — trang Techcombank (A1, A2, A4, Trả nợ, Rút quyền)
- src/pages/ngan-hang/CongNoiBo.jsx — cổng nội bộ Techcombank (vai cán bộ), đọc bankView(state)
- src/components/ — thành phần dùng chung
- src/components/ScenarioPanel.jsx — bảng điều khiển Mô phỏng
- tests/quy-tac.test.js — kiểm tra vi phạm quy tắc nội dung (quét src/pages và src/components)

## Quy tắc bắt buộc
1. Không viết cứng số liệu trong component. Mọi con số lấy từ mockData.js
   hoặc tính từ src/logic/.
2. Mọi màn liên quan tín dụng (A2, A4, chào giá, giải ngân) hiển thị
   Techcombank là bên cấp tín dụng. Nền tảng chỉ xuất hiện với vai trò hạ tầng.
3. Trang cấp quyền A1 là trang của ngân hàng, giao diện tách biệt hẳn với Nền tảng.
4. Mọi giá trị ứng ước tính có dòng "Ước tính, chưa phải đề nghị cấp tín dụng".
5. Màn góc nhìn ngân hàng không hiển thị tên bên đang khóa.
6. Tên thương hiệu (Techcombank, Shopee, TikTok Shop) chỉ dạng chữ, không dùng logo.
7. Toàn bộ giao diện tiếng Việt. Chữ nội dung chính tối thiểu 16px, tiêu đề tối
   thiểu 24px, vì trình chiếu trên máy chiếu 1920×1080.
8. Chân trang: "Giao diện mô phỏng — dữ liệu giả định".
9. Không gọi bất kỳ API bên ngoài nào, kể cả API của Claude.

## Bảng màu theo ngữ nghĩa
- Tầng 1, trạng thái tất toán: teal
- Tầng 2, trạng thái đã khóa: purple
- Tầng 3: orange
- Tất toán thiếu: amber
- Đứt gãy: red
- Trung tính, dự phóng, hết hiệu lực, đã hoàn: gray

## Lệnh
- npm run dev — chạy thử
- npm test — kiểm thử công thức + quy tắc (src/logic/*.test.js + tests/quy-tac.test.js)
- npm run build — đóng gói (Vercel)
- npm run build:offline — xuất dist-offline/index.html (font nhúng inline, mở bằng file://)

## Cách làm việc
- Chỉ sửa trong phạm vi được yêu cầu, không tự ý sửa màn khác.
- Sau mọi thay đổi ở src/logic/, chạy npm test.
- Khi không chắc về nội dung, hỏi lại thay vì tự đoán.
- Trước khi bắt đầu, cập nhật nhánh theo main mới nhất. Trước khi tạo pull request,
  chạy npm run build; không tạo pull request nếu build lỗi.
## Quy ước plugin (mọi vòng)
- Superpowers: thực thi bằng executing-plans; KHÔNG dùng brainstorming, git worktree, subagent-driven-development. TDD chỉ bắt buộc cho src/logic/*. Trước khi báo xong: chạy npm run build và npm test, dán kết quả thật.
- Impeccable: mọi quyết định thị giác theo DESIGN.md; không đổi ý nghĩa màu trong docs/quy-tac.md; không dùng lệnh bolder.
- Ponytail: không thêm dependency trừ khi DESIGN.md yêu cầu; chỉ tách component dùng chung khi ≥3 màn dùng; không sửa src/logic khi vòng chỉ làm giao diện.
- Xung đột: quy-tac.md > đọc rõ trên máy chiếu 1920×1080 > ít code.
- Tiết kiệm ngữ cảnh: chỉ đọc file màn đang sửa và các component nó import.
- Vòng 7: DESIGN.md (rút từ code hiện có) là nguồn thẩm quyền thị giác cho các
  vòng 8-11 tiếp theo; docs/plans/ui-roadmap.md là kế hoạch chính thức cho các
  vòng đó. Xem thêm docs/ui-audit.md cho danh sách vấn đề đã tìm thấy.
