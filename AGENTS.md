# AGENTS.md — Prototype đề án Open Banking (repo The-banker-V2)

Luật cho MỌI agent làm việc trong repo này (Antigravity/Gemini, Claude Code…). Đọc hết trước khi làm.
Lịch sử, quyết định đã chốt và việc còn lại: docs/ban-giao.md (đọc khi bắt đầu mỗi vòng; không nhúng vào rules vì dài).
Thứ tự thẩm quyền khi mâu thuẫn: docs/quy-tac.md > AGENTS.md > DESIGN.md > docs/man-hinh.md > docs/kich-ban.md > code hiện có.
Trả lời người dùng bằng tiếng Việt. Giữ nguyên dấu tiếng Việt (UTF-8) trong mọi chuỗi và tài liệu.

## 1. Dự án (đọc 30 giây)
- Prototype bấm được, demo 3 phút trên máy chiếu, cho đề án cuộc thi FTU vòng 3.
- Bài toán: nhà bán TMĐT đa kênh (thời trang–mỹ phẩm) bị sàn giữ tiền 8–15 ngày, đối soát thủ công, chỉ vay được tín chấp từ 2%/tháng.
- Giải pháp — hạ tầng 3 tầng: T1 Doanh thu đã xác thực (AIS theo Thông tư 64/2024 đối chứng dữ liệu đơn hàng → điểm xác thực); T2 Sổ đăng ký khoản phải thu (đơn vị có trạng thái, khóa được, thứ tự ưu tiên, chứng thư ký số); T3 Giao thức cấp vốn mở (nhiều bên chào giá).
- Nguyên lý: AIS dùng để XÁC THỰC, không dùng để định giá. Nền tảng KHÔNG chạm dòng tiền.
- Techcombank = ngân hàng bảo trợ, bên cho vay DUY NHẤT ở GĐ1–GĐ2.
- Nhân vật: chị Lan, shop Lan Beauty. Ngày demo 15/09/2027 (Giai đoạn 2, đã bật ứng vốn); kết nối từ 01/08/2027.
- Người xem: giám khảo ngân hàng/kinh tế. Mỗi màn phải hiểu được trong ≤10 giây, đọc được từ cuối phòng.

## 2. Stack và lệnh
- Vite + React + Tailwind + Vitest. Không backend. Không gọi bất kỳ API ngoài nào (kể cả API AI).
- `npm run dev` · `npm run build` · `npm test` · `npm run build:offline` (bản một file HTML).
- Vercel tự deploy: nhánh main = bản chính; mỗi nhánh khác có đường dẫn xem trước.

## 3. Quy trình bắt buộc
- Một vòng = một nhánh mới tạo từ main mới nhất = một PR. KHÔNG commit hay push thẳng vào main. Tên nhánh: `vong-NN-mo-ta-ngan`.
- Bắt đầu vòng: `git checkout main && git pull`, rồi tạo nhánh.
- Lập kế hoạch trước khi sửa (Planning mode): liệt kê file sẽ sửa, tiêu chí chấp nhận, cách kiểm tra; chờ người dùng duyệt.
- Chỉ push/tạo PR khi `npm run build` VÀ `npm test` đều pass. Dán kết quả thật vào walkthrough/mô tả PR. Chưa chạy thì không được báo "xong".
- KHÔNG sửa kỳ vọng trong test để test pass. Test đỏ = code sai, trừ khi người dùng xác nhận số liệu thay đổi.
- Kiểm tra bằng mắt ở 1920×1080 VÀ 1536×864 (laptop Windows 125%). Nếu có browser agent: mở `npm run dev`, chụp các màn đã sửa ở cả hai kích thước, đính kèm walkthrough. Không tràn ngang; nội dung chính của mỗi màn nằm trong màn hình đầu ở 1536×864.
- Tiết kiệm ngữ cảnh: chỉ đọc file của màn đang sửa và các component nó import.
- Không xóa, đổi tên hay "dọn dẹp" file trong docs/ nếu không được yêu cầu.
- PR báo out-of-date: cập nhật nhánh theo main, build + test lại.

## 4. Luật nội dung và pháp lý (tóm tắt docs/quy-tac.md — bản gốc thắng)
- Nền tảng KHÔNG cho vay, KHÔNG giữ tiền, không ví, không tài khoản trung gian. Techcombank là bên DUY NHẤT ký hợp đồng tín dụng, nhận bảo đảm, giải ngân. Cấm các cụm: "Nền tảng ứng tiền", "bán khoản phải thu", "Nền tảng giải ngân", "ví của Nền tảng".
- Khoản ứng = "khoản vay có bảo đảm bằng khoản phải thu" (Phương án B), không phải bao thanh toán. Trả nợ: nhà bán trả một chạm trên trang Techcombank (không viết "tự tất toán").
- Quyền (consent): A1 đối soát; A2 đánh giá tín dụng (bên nhận dữ liệu ghi rõ Techcombank); A3 ủy quyền trích nợ (điều khoản hợp đồng tín dụng); A4 chuyển giao quyền đòi nợ (đăng ký theo NĐ 99/2022).
- Trang cấp quyền/ký = trang của ngân hàng: dùng component ConsentPage trong SurfaceFrame variant `bank`; LUÔN có dải "Bạn đang ở trang của Techcombank"; thanh bước của Nền tảng nằm NGOÀI khung ngân hàng; bên yêu cầu = LEGAL_NAME + TPP_CODE; phạm vi dạng danh sách; khối "Quyền này KHÔNG cho phép"; MỘT ô xác nhận KHÔNG tích sẵn; nút đồng ý vô hiệu cho tới khi tích.
- Mọi giá trị ứng ước tính có dòng "Ước tính, chưa phải đề nghị cấp tín dụng" đặt ngay cạnh con số.
- Góc nhìn ngân hàng (Màn 8) chỉ hiện SỐ bên đang khóa, không bao giờ hiện tên.
- Bên cho vay ngoài Techcombank dùng tên giả (Ngân hàng B, CTTC C). Công ty tài chính KHÔNG xuất hiện trong danh sách ngân hàng nhận tiền/AIS (không mở tài khoản thanh toán). Tên thương hiệu chỉ dạng chữ, không logo.
- `DISPLAY_NAME` ("Đừng Đóng Vai Anh") chỉ ở thanh trên cùng của khung Nền tảng. Mọi vị trí pháp lý dùng `LEGAL_NAME` và `TPP_CODE` (src/config/brand.js).
- Không hiện ngôn ngữ dàn dựng demo ("Màn 5", "kịch bản") trong giao diện của nhân vật; chỉ được ở TopBar, KeyHint, ScenarioPanel.

## 5. Số liệu
- Nguồn duy nhất: docs/du-lieu.md → src/data/mockData.js; công thức ở src/logic/pricing.js và src/logic/verification.js. KHÔNG viết cứng số nghiệp vụ trong JSX. Vòng chỉ làm giao diện thì KHÔNG sửa src/logic.
- Định dạng: số nguyên không có phần thập phân; số lẻ tối đa 2 chữ số, bỏ số 0 thừa (76%, 12%/năm, 1,7%, 38,25).
- Tiền chỉ hiển thị qua component `Money` + `formatNumberVN`; đơn vị "triệu"; riêng tiền lãi dùng "nghìn đồng" (140 nghìn đồng — KHÔNG đổi sang "0,14 triệu").
- Test T1–T10 (docs/du-lieu.md) phải luôn pass.

## 6. Hệ thống thiết kế (chi tiết: DESIGN.md)
- Chữ: tối thiểu 16px (`text-label`); thân 20px (`text-body`); nhấn 24px; tiêu đề mục 32px; tiêu đề màn `text-screen-title` 44px; con số chính `text-hero` 64px. Code mới không dùng text-xs/sm/base.
- Font Be Vietnam Pro qua @fontsource (tự host). Không đổi font, không gọi Google Fonts/CDN.
- Màu ngữ nghĩa CỐ ĐỊNH, chỉ đi qua src/ui/status.js + `StatusBadge`: teal = Tầng 1/đã tất toán; violet = Tầng 2/đã khóa; orange = Tầng 3; amber = tất toán thiếu; red = đứt gãy (cú sốc đỏ duy nhất của demo, ở Màn 9); slate = trung tính. Mọi trạng thái có icon + chữ, không chỉ màu. Có test quét src/screens chặn class màu ngữ nghĩa dùng rời — không tắt, không nới test này.
- Navy = thương hiệu Nền tảng; KHÔNG dùng làm nút chính trong khung `bank`/`bankOps`.
- Khung vai trò chỉ qua `SurfaceFrame`: `platform` (ứng dụng nhà bán), `bank` (trang Techcombank), `bankOps` (cổng nội bộ ngân hàng, có thanh điều hướng trái), `tech` (hậu trường kỹ thuật, terminal). Không tạo khung rời trong từng màn.
- Mỗi màn: MỘT câu hỏi, MỘT con số chính. Nút chính không rộng hết trang, căn phải; mỗi màn một nút chính, nút phụ kiểu viền.
- Chuyển động chỉ để thể hiện đổi trạng thái đơn vị khoản phải thu: CSS transition ≤300ms, viền nổi ≤800ms; tôn trọng `prefers-reduced-motion` (kể cả khi dùng setTimeout: kiểm matchMedia); KHÔNG tween số; không bounce/elastic.
- Tối giản: không thêm dependency trừ khi DESIGN.md yêu cầu; không thêm thư viện UI/animation; chỉ tách component dùng chung khi ≥3 màn dùng; ưu tiên sửa ở component dùng chung thay vì sửa rời từng màn.

## 7. Điều hướng demo
- Thứ tự khi bấm mũi tên: 1 → 2 → 7 → 3 → 4 → 5 → 6 → 8 → (10 nếu đã bật phím 3).
- Phím: M = Mega Sale; L = rò rỉ (Màn 9 thay nội dung Màn 6); 3 = Giai đoạn 3; R = đặt lại toàn bộ; Space = sự kiện tiếp theo ở Màn 6.
- Mọi tổ hợp M/L/3/R và Space bấm quá số sự kiện không được làm vỡ trạng thái hay hiện NaN/undefined.

## 8. Khi các ưu tiên xung đột
Đúng pháp lý (quy-tac.md) > đọc rõ trên máy chiếu > ít code > thẩm mỹ.
Không tự ý đảo các "Quyết định đã chốt" trong docs/ban-giao.md — nếu thấy cần đảo, hỏi người dùng trước.
