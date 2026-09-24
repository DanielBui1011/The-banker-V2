# AGENTS.md — Prototype đề án Open Banking (repo The-banker-V2)

Luật cho MỌI agent làm việc trong repo này (Antigravity/Gemini, Claude Code…). Đọc hết trước khi làm.
Lịch sử, quyết định đã chốt và việc còn lại: docs/ban-giao.md (đọc khi bắt đầu mỗi vòng; không nhúng vào rules vì dài).
Thứ tự thẩm quyền khi mâu thuẫn: docs/quy-tac.md > docs/du-lieu.md > AGENTS.md > docs/san-pham.md > DESIGN.md > docs/hanh-trinh.md > code hiện có.
Từ Vòng 19–20: sản phẩm là **app tự dùng trên laptop** (docs/san-pham.md, docs/hanh-trinh.md; kế hoạch docs/plans/san-pham-roadmap.md). docs/man-hinh.md và docs/kich-ban.md chỉ còn là tư liệu, không quyết định luồng.
Trả lời người dùng bằng tiếng Việt. Giữ nguyên dấu tiếng Việt (UTF-8) trong mọi chuỗi và tài liệu.

## 1. Dự án (đọc 30 giây)
- Prototype bấm được cho đề án cuộc thi FTU vòng 3. Từ Vòng 19: giám khảo **tự mở app trên laptop**, không ai giải thích — app tự dẫn đường (màn chào, danh sách nhiệm vụ, thẻ Bước tiếp theo, chú giải thuật ngữ; docs/san-pham.md mục D).
- Bài toán: nhà bán TMĐT đa kênh (thời trang–mỹ phẩm) bị sàn giữ tiền 8–15 ngày, đối soát thủ công, chỉ vay được tín chấp từ 2%/tháng.
- Giải pháp — hạ tầng 3 tầng: T1 Doanh thu đã xác thực (AIS theo Thông tư 64/2024 đối chứng dữ liệu đơn hàng → điểm xác thực); T2 Sổ đăng ký khoản phải thu (đơn vị có trạng thái, khóa được, thứ tự ưu tiên, chứng thư ký số); T3 Giao thức cấp vốn mở (nhiều bên chào giá).
- Nguyên lý: AIS dùng để XÁC THỰC, không dùng để định giá. Nền tảng KHÔNG chạm dòng tiền.
- Techcombank = ngân hàng bảo trợ, bên cho vay DUY NHẤT ở GĐ1–GĐ2.
- Nhân vật: chị Lan, shop Lan Beauty. App bắt đầu ở 01/08/2027 (chưa kết nối) và dừng ở 15/09/2027 chờ đề nghị ứng vốn; ngày mô phỏng đi theo chuỗi sự kiện E0–E5 (docs/san-pham.md mục E.1).
- Hai vai: Nhà bán (mặc định) và Cán bộ Techcombank (cổng nội bộ). Đổi vai ở bảng Mô phỏng; đổi vai không đổi dữ liệu.
- Người dùng: giám khảo ngân hàng/kinh tế tự thao tác. Mỗi trang trả lời MỘT câu hỏi, hiểu được trong ≤10 giây.

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
- Logic mới trong `src/logic/` viết theo TDD (test trước). Test T1–T10 và `tests/quy-tac.test.js` không được nới.
- Kiểm tra bằng mắt ở 1366×768, 1536×864 VÀ 1920×1080 (laptop). Nếu có browser agent: mở `npm run dev`, chụp các trang đã sửa ở cả ba kích thước, đính kèm walkthrough. Không tràn ngang; nội dung chính của mỗi trang nằm trong màn hình đầu ở 1366×768.
- Tiết kiệm ngữ cảnh: chỉ đọc file của trang đang sửa và các component nó import.
- Không xóa, đổi tên hay "dọn dẹp" file trong docs/ nếu không được yêu cầu.
- PR báo out-of-date: cập nhật nhánh theo main, build + test lại.

## 4. Luật nội dung và pháp lý (tóm tắt docs/quy-tac.md — bản gốc thắng)
- Nền tảng KHÔNG cho vay, KHÔNG giữ tiền, không ví, không tài khoản trung gian. Techcombank là bên DUY NHẤT ký hợp đồng tín dụng, nhận bảo đảm, giải ngân. Cấm các cụm: "Nền tảng ứng tiền", "bán khoản phải thu", "Nền tảng giải ngân", "ví của Nền tảng".
- Khoản ứng = "khoản vay có bảo đảm bằng khoản phải thu" (Phương án B), không phải bao thanh toán. Trả nợ: nhà bán trả một chạm trên trang Techcombank (không viết "tự tất toán").
- Quyền (consent): A1 đối soát; A2 đánh giá tín dụng (bên nhận dữ liệu ghi rõ Techcombank); A3 ủy quyền trích nợ (điều khoản hợp đồng tín dụng); A4 chuyển giao quyền đòi nợ (đăng ký theo NĐ 99/2022). A2 và A4 cấp/ký riêng, mỗi cái trên trang ký của nó.
- Trang cấp quyền/ký = trang của ngân hàng: dùng component ConsentPage trong SurfaceFrame variant `bank`, mở dạng chuyển hướng (màn chuyển tiếp 700ms); LUÔN có dải "Bạn đang ở trang của Techcombank"; thanh bước của Nền tảng nằm NGOÀI khung ngân hàng; bên yêu cầu = LEGAL_NAME + TPP_CODE; phạm vi dạng danh sách; khối "Quyền này KHÔNG cho phép"; MỘT ô xác nhận KHÔNG tích sẵn; nút đồng ý vô hiệu cho tới khi tích.
- Mọi giá trị ứng ước tính có dòng "Ước tính, chưa phải đề nghị cấp tín dụng" đặt ngay cạnh con số.
- Cổng nội bộ ngân hàng (vai Cán bộ Techcombank; trước là Màn 8) chỉ hiện SỐ bên đang khóa, không bao giờ hiện tên. Số liệu đọc `bankView(state)` (src/logic/journey.js).
- Bên cho vay ngoài Techcombank dùng tên giả (Ngân hàng B, CTTC C) và khung `bank` trung tính. Công ty tài chính KHÔNG xuất hiện trong danh sách ngân hàng nhận tiền/AIS (không mở tài khoản thanh toán).
- Tên thương hiệu chỉ dạng chữ: không logo, không kiểu chữ, không bộ nhận diện. Ngoại lệ duy nhất (quy-tac mục 7, Vòng 20): khung trang Techcombank dùng màu xấp xỉ — thanh đen `#141414`, vạch đỏ 4px `#E3262B`, vàng kim `#D4AF37` — luôn kèm chữ "Mô phỏng".
- `DISPLAY_NAME` (hiện là "Capix", Vòng 19b) chỉ ở thanh trên cùng của khung Nền tảng và màn chuyển tiếp "Quay về …". Mọi vị trí pháp lý dùng `LEGAL_NAME` và `TPP_CODE` (src/config/brand.js).
- Không hiện ngôn ngữ dàn dựng ("Màn 5", "kịch bản", "Giai đoạn 2") trong giao diện sản phẩm; thứ mô phỏng chỉ ở bảng điều khiển Mô phỏng (nền tối, ghi "Mô phỏng").

## 5. Số liệu và trạng thái
- Nguồn duy nhất: docs/du-lieu.md → src/data/mockData.js; công thức ở src/logic/pricing.js, verification.js, registry.js (không đổi công thức). KHÔNG viết cứng số nghiệp vụ trong JSX. Vòng chỉ làm giao diện thì KHÔNG sửa src/logic.
- Trạng thái hành trình là MỘT reducer + selector thuần trong src/logic/journey.js (ngày mô phỏng, trạng thái đơn vị, khoản vay, nhật ký, góc nhìn ngân hàng, nhiệm vụ, Bước tiếp theo). Mọi nút, phím tắt và thẻ Bước tiếp theo đọc điều kiện từ `availability(state, action)` → `{ ok, reason, fix: { label, href } }`; nút không đủ điều kiện vẫn hiện, vô hiệu, kèm lý do + đường dẫn.
- Spec cần số mà du-lieu.md không có → DỪNG hỏi người dùng, không tự đặt số.
- Định dạng: số nguyên không có phần thập phân; số lẻ tối đa 2 chữ số, bỏ số 0 thừa (76%, 12%/năm, 1,7%, 38,25).
- Tiền chỉ hiển thị qua component `Money` + `formatNumberVN`; đơn vị "triệu"; riêng tiền lãi dùng "nghìn đồng" (140 nghìn đồng — KHÔNG đổi sang "0,14 triệu").
- Test T1–T10 (docs/du-lieu.md) phải luôn pass.

## 6. Hệ thống thiết kế (chi tiết: DESIGN.md mục "Vòng 20", docs/san-pham.md mục K, L)
- Bố cục theo px thật cho laptop (không co giãn sân khấu), rộng tối thiểu 1280. Chữ: nhãn 16px (sàn), thân 18px, nhấn 20px, tiêu đề trang 28px, con số chính 48px. Code mới không dùng text-xs/sm/base.
- Font Be Vietnam Pro qua @fontsource (tự host). Không đổi font, không gọi Google Fonts/CDN.
- Hệ màu Hướng B: app nhà bán có nhận diện riêng (nền ngà `#FBF8F2`, màu chính cobalt `#1E47C8`); mỗi trang mang nền nhạt của Tầng nó thuộc (chỉ ở dải tiêu đề và mục điều hướng đang chọn).
- Màu ngữ nghĩa CỐ ĐỊNH, chỉ đi qua src/ui/status.js + `StatusBadge`: teal = Tầng 1/đã tất toán; violet = Tầng 2/đã khóa; orange = Tầng 3; amber = tất toán thiếu; red = đứt gãy (badge đỏ đặc `#B91C1C`, cú sốc đỏ duy nhất); slate = trung tính. Mọi trạng thái có icon + chữ, không chỉ màu. Đỏ thương hiệu `#E3262B` CHỈ ở vạch khung trang Techcombank. Có test quét chặn class màu ngữ nghĩa dùng rời — không tắt, không nới.
- Cobalt = màu chính của Nền tảng; KHÔNG dùng làm nút chính trong khung `bank`/`bankOps`.
- Khung vai trò chỉ qua `SurfaceFrame`: `platform` (app nhà bán), `bank` (trang Techcombank / bên cho vay khác ở dạng trung tính), `bankOps` (cổng nội bộ ngân hàng, thanh bên trái `#141414`, không đỏ/vàng kim), `tech` (hậu trường kỹ thuật). Không tạo khung rời trong từng trang.
- Mỗi trang: MỘT câu hỏi, MỘT con số chính. Nút chính không rộng hết trang; mỗi trang một nút chính, nút phụ kiểu viền.
- Chuyển động (docs/san-pham.md mục L): cho người dùng biết mình vừa đi đâu và việc gì vừa xong. Token 150/200/300ms; không hiệu ứng nào > 400ms trừ màn chuyển tiếp ngân hàng 700ms. CSS transition + View Transitions API, không thư viện. `prefers-reduced-motion` → hiện ngay, bỏ màn chuyển tiếp (kể cả khi dùng setTimeout: kiểm matchMedia). KHÔNG tween số; không bounce/elastic.
- Tối giản: không thêm dependency trừ khi DESIGN.md yêu cầu; không thêm thư viện UI/animation/router/tour; chỉ tách component dùng chung khi ≥3 trang dùng; ưu tiên sửa ở component dùng chung.
- Ngoại lệ cho công cụ (Vòng 27): `playwright` là devDependency, chỉ dùng cho `npm run shots -- <nhan>` (scripts/shots.mjs — chụp toàn bộ giao diện để gửi feedback; hướng dẫn: docs/shots/HUONG-DAN.md). Không import vào src/, không dùng làm test của app.

## 7. Điều hướng và mô phỏng
- Không còn thứ tự tuyến tính. Thanh điều hướng trái 6 trang (Tổng quan, Đối soát, Khoản phải thu, Ứng vốn, Khoản vay, Quyền & dữ liệu); danh sách nhiệm vụ đặt ở cuối thanh điều hướng trái. Điều hướng bằng URL hash (`#/nha-ban/…`, `#/techcombank/…`, `#/ngan-hang/…`; `#/mo-phong/…` là lệnh bảng Mô phỏng) — hằng `ROUTES` trong src/logic/journey.js.
- Bảng điều khiển Mô phỏng (cạnh phải, nền tối): Vai · Ngày mô phỏng + "Tua tới sự kiện tiếp theo" · Tình huống (Mùa cao điểm, Đổi tài khoản nhận tiền, Giai đoạn 3) · Bắt đầu lại (có xác nhận).
- Phím tắt giữ làm lối tắt, CÙNG điều kiện với nút (qua `availability`): Space = Tua; M = Mùa cao điểm; L = Đổi tài khoản nhận tiền; 3 = Giai đoạn 3; R = Bắt đầu lại (qua hộp xác nhận); D = gửi lại lệnh khóa (cổng ngân hàng); F = toàn màn hình; ? = hướng dẫn. Phím bị chặn → thông báo ngắn nêu lý do, không đổi state. ← / → không còn chuyển trang.
- Tiến trình lưu `localStorage` (khóa `capix-app-v1`, try/catch, sai phiên bản → khởi đầu). Bấm mọi tổ hợp phím, tua quá số sự kiện không được làm vỡ trạng thái hay hiện NaN/undefined.

## 8. Khi các ưu tiên xung đột
Đúng pháp lý (quy-tac.md) > đọc rõ trên laptop 1366×768 > ít code > thẩm mỹ.
Không tự ý đảo các "Quyết định đã chốt" trong docs/ban-giao.md — nếu thấy cần đảo, hỏi người dùng trước.
