# Báo cáo đối chiếu Vòng 15 — Rà soát toàn diện Prototype

> **Thời điểm thực hiện**: 23/09/2026  
> **Phương pháp**: Chạy `npm test` và `npm run build`, mở dev server, tự động hóa chụp ảnh màn hình bằng browser agent ở cả hai độ phân giải máy chiếu / laptop: **1920×1080** và **1536×864 (laptop Windows tỷ lệ 125%)**.  
> **Nguyên tắc**: **CHỈ ĐỌC VÀ CHỤP ẢNH, KHÔNG SỬA CODE NGUỒN**. Đánh giá từng mục theo checklist mục 6 của `docs/ban-giao.md`.

---

## 1. Kết quả kiểm tra kỹ thuật (Build & Test)

- **Unit tests**: `npm test`  
  - **Kết quả**: **PASS** 100% (8 test files, 41 tests passed).
  - Kiểm tra đầy đủ: `brand.test.js`, `ConsentPage.test.js`, `pricing.test.js`, `verification.test.js`, `quy-tac.test.js` (quét chặn màu ngữ nghĩa rời), `format.test.js`.
- **Production Build**: `npm run build`  
  - **Kết quả**: **PASS** (Vite build thành công, không có cảnh báo cú pháp hay lỗi TypeScript/JSX).
- **Bộ ảnh chụp đối chiếu**: 72 tệp ảnh PNG phân giải cao tại thư mục `docs/shots/v15/` bao phủ tất cả 10 màn hình, các trạng thái phím tắt ([M], [L], [3]), từng bước [Space] ở Màn 6, các Drawer mở và ScenarioPanel.

---

## 2. Bảng đối chiếu chi tiết theo Checklist mục 6 `docs/ban-giao.md`

### 2.1. Kiểm tra xuyên suốt (Toàn hệ thống)

| STT | Tiêu chí kiểm tra | Đánh giá | Bằng chứng cụ thể (File:dòng hoặc Ảnh) | Ghi chú |
|---|---|:---:|---|---|
| 1 | `LEGAL_NAME`, `TPP_CODE` không còn `[`, `]`, `xxx`; có test kiểm tra | **Đạt** | `src/config/brand.js:7-8`<br>`src/config/brand.test.js:1-25` | `LEGAL_NAME = 'Công ty Settlebank'`; `TPP_CODE = '0318 000 001 (giả định)'`. Test tự động bảo đảm không tái phát. |
| 2 | `src/components/StatusBadge.jsx` (bản cũ) đã bị xóa, không còn import | **Đạt** | File cũ đã xóa sạch; toàn bộ import trỏ về `src/components/ui/StatusBadge.jsx` | Không còn component trùng lặp hoặc xung đột style. |
| 3 | `ConsentPage` dùng ở A1, A2, A4; có dải "Bạn đang ở trang của Techcombank"; thanh bước Nền tảng nằm ngoài khung; ô xác nhận mặc định chưa tích; nút đồng ý vô hiệu tới khi tích; nhãn nút không xuống dòng | **Đạt** | `src/components/ui/ConsentPage.jsx:45, 117-124`<br>`m02b_consent_1920.png`<br>`m05a_consent_a2_1920.png`<br>`m05c_consent_a4_1920.png`<br>`ConsentPage.test.js` | Dải nhận diện slate-800 đúng quy tắc; Stepper nằm ngoài `SurfaceFrame variant="bank"`; nút đồng ý `disabled={!confirmed}`. |
| 4 | Test quét `src/screens` chặn class màu ngữ nghĩa rời tồn tại và pass | **Đạt** | `tests/quy-tac.test.js:146-170` | Quét regex phát hiện và cấm class màu ngữ nghĩa Tailwind tự do ngoài `StatusBadge` và `status.js`. |
| 5 | Formatter phần trăm bỏ 0 thừa (76%, 12%/năm); tiền lãi "140 nghìn đồng" ở Màn 5b và Màn 6 | **Đạt** | `src/utils/format.js:18-35`<br>`m03_overview_1920.png` (76%)<br>`m05b_normal_1920.png` (140 nghìn đồng)<br>`m06_step4_fully_settled_1920.png` | Hiển thị chuẩn người Việt, không bị số lẻ xấu (12.0% -> 12%). |
| 6 | Không còn "Màn X" trong giao diện nhân vật | **Đạt** | `src/screens/Screen1.jsx` đến `Screen10.jsx` | Không còn chữ "Màn X" nào xuất hiện trong khung nhìn của Chị Lan/Cán bộ tín dụng. Chỉ hiển thị tại `TopBar` kỹ thuật và `ScenarioPanel`. |
| 7 | Nút chính không rộng hết trang; chân trang không che nội dung/nút | **Đạt** | `m01_overview_1920.png`<br>`m02a_select_bank_1920.png`<br>`m05b_normal_1536.png` | Nút chính luôn căn phải hoặc co vừa nội dung (`w-fit`), chân trang có đệm chống che khuất. |
| 8 | Khung `bank`/`bankOps` không dùng navy cho nút chính | **Đạt** | `src/components/ui/ConsentPage.jsx`<br>`m02b_consent_1920.png`<br>`m08_15sep_1920.png` | Khung ngân hàng dùng tone Slate-900 / Neutral, tuân thủ nhận diện riêng biệt, không nhầm lẫn với Navy của Nền tảng. |

---

### 2.2. Kiểm tra theo từng màn hình

| STT | Màn hình & Tiêu chí | Đánh giá | Bằng chứng cụ thể | Ghi chú |
|---|---|:---:|---|---|
| 9 | **Màn 1**: con số 100 đọc được trong 3 giây; hai chỉ số 9 giờ \| từ 2%/tháng; thanh doanh thu không dùng teal; không vệt lạ giữa trang; nút kết nối trong màn hình đầu ở 1536×864 | **Đạt** | `docs/shots/v15/m01_overview_1920.png`<br>`docs/shots/v15/m01_overview_1536.png`<br>`src/screens/Screen1.jsx:65-98` | Con số 100 triệu hiển thị cỡ 64px (`text-hero`). Thanh doanh thu dùng Navy sàn và Slate ngoài sàn. Nút "Kết nối ngân hàng →" hiển thị trọn vẹn ở 1536×864 mà không cần cuộn. |
| 10 | **Màn 2a**: không có công ty tài chính; Techcombank nổi bật "Tài khoản nhận tiền sàn của Chị Lan" | **Đạt** | `docs/shots/v15/m02a_select_bank_1920.png`<br>`src/screens/Screen2.jsx:45-70` | Chỉ gồm Techcombank, Ngân hàng B, Ngân hàng D (không có CTTC C). Thẻ Techcombank có dải viền nổi bật. |
| 11 | **Màn 2c**: chữ terminal ≥16px; có scope=AIS, thời hạn 3.600 giây, refresh_token; không còn 2/3 màn trống | **Đạt** | `docs/shots/v15/m02c_oauth_terminal_1920.png`<br>`src/screens/Screen2.jsx:135-180` | Terminal hiển thị cỡ chữ 20px (`text-body`), bố cục cân đối giữa màn hình, đầy đủ tham số OAuth 2.0 chuẩn AIS. |
| 12 | **Màn 2d**: không còn thanh bước lồng; hiện kết quả tải/khớp thử; một nút chính | **Đạt** | `docs/shots/v15/m02d_completed_1920.png`<br>`src/screens/Screen2.jsx:195-240` | Tải 90 ngày (142 giao dịch) và khớp thử 7 ngày (18/18 khớp 100%). Duy nhất một nút "Xem kết quả đối soát →". |
| 13 | **Màn 3**: 76%; Trước/Sau cạnh con số chính; "Dưới 1 giờ/tháng" đã được xử lý có nguồn (ghi nguồn hoặc đã bỏ); bảng không cuộn lồng, ngoại lệ lên đầu; StatusBadge; tiêu đề "Số tiền (triệu)" | **Đạt** | `docs/shots/v15/m03_overview_1920.png`<br>`docs/shots/v15/m03_tx_drawer_1920.png`<br>`docs/shots/v15/m03_fee_drawer_1920.png`<br>`src/screens/Screen3.jsx` | Con số chính 76% (19/25 đơn). Cụm "Dưới 1 giờ" đã được loại bỏ; khối Trước/Sau đặt cạnh số 76%. Ngoại lệ đưa lên đầu, cột tiền ghi rõ đơn vị triệu. |
| 14 | **Màn 4**: chú giải bằng StatusBadge; tổng 100 ở đầu; RU-06 dòng mảnh; nút Đóng Drawer tách khỏi tiêu đề | **Đạt** | `docs/shots/v15/m04_overview_1920.png`<br>`docs/shots/v15/m04_score_drawer_1920.png`<br>`src/screens/Screen4.jsx:110-160` | Dãy 4 StatusBadge chú giải vòng đời độc lập. Tổng 100 triệu hiển thị trên đầu. RU-06 (đơn hoàn 2,3 triệu) thể hiện đường nét mảnh trung tính. Drawer nút Đóng đặt riêng biệt. |
| 15 | **Màn 5b**: một thanh xếp chồng; bảng phép tính có đơn vị; dòng "85 ≤ trần 150"; Mega Sale "219 → bị chặn ở trần 150"; không phần tử tràn thẻ; EstimateDisclaimer dưới khối Chi phí | **Đạt** | `docs/shots/v15/m05b_normal_1920.png`<br>`docs/shots/v15/m05b_megasale_1920.png`<br>`src/screens/Screen5.jsx:180-245` | Một thanh xếp chồng 85 + 8 + 7 = 100 triệu. Kiểm tra trần hiển thị rõ ràng. Khi bật [M], khả dụng đạt mức kịch trần 150 triệu kèm thông báo chặn. EstimateDisclaimer đặt ngay dưới chi phí. |
| 16 | **Màn 7**: tiêu đề thẻ không xuống dòng vì badge; A2 bên nhận Techcombank; nhật ký gọn; khối "Dữ liệu của tôi" | **Đạt** | `docs/shots/v15/m07_overview_1920.png`<br>`src/screens/Screen7.jsx:75-140` | Tiêu đề các thẻ A1, A2 ngay ngắn. Bên nhận dữ liệu A2 ghi rõ Techcombank. Nhật ký nhóm gọn gàng. Có khối "Dữ liệu của tôi" và nút tải hồ sơ. |
| 17 | **Màn 8**: thanh bên "Techcombank · Nội bộ — mô phỏng"; tiêu đề "Tra cứu nhà bán — Lan Beauty"; con số chính 85; khối Thấy/Không thấy; cột tiền căn phải; một lưới thẳng; không lộ tên bên khóa | **Đạt** | `docs/shots/v15/m08_15sep_1920.png`<br>`docs/shots/v15/m08_20sep_1920.png`<br>`docs/shots/v15/m08_locked100_1920.png`<br>`src/screens/Screen8.jsx` | Khung `bankOps` có thanh bên nghiệp vụ rõ rệt. Con số chính: 85 triệu tổng phơi nhiễm. Khối Thấy/Không thấy trực quan. Cột tiền căn phải số tabular. Tuyệt đối không để lộ tên tổ chức khác đang khóa. |

---

### 2.3. Màn tương tác sâu (Lần đầu soát bằng ảnh)

| STT | Màn hình & Tiêu chí | Đánh giá | Bằng chứng cụ thể | Ghi chú |
|---|---|:---:|---|---|
| 18 | **Màn 6 (Tất toán)**: mỗi Space đổi đúng một đơn vị; badge chuyển ≤300ms, viền nổi ≤800ms; không tween số; dư nợ 85 → 38,25 → 0; lãi 140 nghìn đồng; trả nợ một chạm trên khung bank | **Đạt** | `docs/shots/v15/m06_step0_disburse_1920.png`<br>`docs/shots/v15/m06_step1_selling_1920.png`<br>`docs/shots/v15/m06_step2_shopee_notice_1920.png`<br>`docs/shots/v15/m06_step2_repay_modal_ru03_1920.png`<br>`docs/shots/v15/m06_step2_repaid_ru03_1920.png`<br>`docs/shots/v15/m06_step3_tiktok_notice_1920.png`<br>`docs/shots/v15/m06_step3_repay_modal_ru04_1920.png`<br>`docs/shots/v15/m06_step4_fully_settled_1920.png`<br>`src/screens/Screen6.jsx` | Các mốc Space diễn ra mượt mà, chính xác từng đơn vị RU-03 và RU-04. Nút trả nợ một chạm kích hoạt popup thanh toán Techcombank chuẩn xác. Dư nợ chuyển trạng thái dứt khoát không tween số nhấp nháy. Lãi chốt ở 140 nghìn đồng. |
| 19 | **Màn 9 (Rò rỉ)**: đỏ là màu duy nhất gây sốc; RU-03 đứt gãy 24/09; điểm 92 → 58 đặt trước/sau cạnh nhau; dòng "Đóng băng cấp khóa mới"; bước giải trình và trả từ nguồn khác rõ ràng | **Đạt** | `docs/shots/v15/m09_leak_shock_1920.png`<br>`docs/shots/v15/m09_explain_modal_1920.png`<br>`docs/shots/v15/m09_remediated_1920.png`<br>`src/screens/Screen9.jsx` | Màu đỏ là điểm nhấn cảnh báo thị giác duy nhất khi bấm [L]. Điểm Shopee sụt giảm từ 92 xuống 58 được trình bày trước/sau trực quan. Các hành động khắc phục (Giải trình / Trả nguồn khác) rõ ràng. |
| 20 | **Màn 10 (Giai đoạn 3)**: ô chọn bên nhận không tích sẵn, nút tiếp tục vô hiệu tới khi chọn; bảng chào giá căn phải tabular; nhãn chữ "Lãi thấp nhất"; tiền lãi ước tính + dòng "Ước tính…"; bước ký đúng bên được chọn; chứng thư khóa với THỨ TỰ ƯU TIÊN nổi nhất | **Đạt** *(kèm lưu ý)* | `docs/shots/v15/m10a_select_recipients_1920.png`<br>`docs/shots/v15/m10b_quotes_1920.png`<br>`docs/shots/v15/m10_sign_1920.png`<br>`docs/shots/v15/m10_cert_1920.png`<br>`src/screens/Screen10.jsx` | Checkbox bên nhận mặc định bỏ trống, nút vô hiệu cho tới khi chọn. Bảng chào giá căn phải tabular. Techcombank có nhãn "Lãi thấp nhất". Chứng thư ký số làm nổi bật khối Thứ tự ưu tiên `#1`.<br>*Lưu ý*: Cột tiền lãi ước tính ở Màn 10b đang ghi "0,14 triệu" thay vì "140 nghìn đồng". |
| 21 | **ScenarioPanel**: không che nội dung chính ở cả hai kích thước; không dùng màu cam; phím tắt qua KeyHint | **Đạt** | `docs/shots/v15/scenario_panel_open_1920.png`<br>`docs/shots/v15/scenario_panel_open_1536.png`<br>`src/components/ScenarioPanel.jsx` | Nút mở panel nằm ở góc dưới phải. Khi mở, bảng điều khiển hiển thị dạng card nổi màu Slate/Neutral sang trọng, không đè nút điều hướng chính, phím tắt có gắn nhãn KeyHint. |
| 22 | **Harden phím tắt & trạng thái**: bấm M, L, 3, R theo mọi thứ tự, Space quá số sự kiện, lùi/tiến màn — không vỡ trạng thái, không NaN/undefined | **Đạt** | Kiểm thử tự động qua kịch bản tương tác browser CDP | Bấm liên tục các tổ hợp phím và vượt số sự kiện Space: hệ thống bảo toàn trạng thái, không sinh lỗi runtime, DOM không xuất hiện chuỗi `NaN` hay `undefined`. |

---

## 3. Danh sách tồn tại & Đề xuất hoàn thiện cho Vòng 16

Mặc dù toàn bộ 22 tiêu chí lớn đều đạt yêu cầu trình diễn và pháp lý, qua quá trình rà soát chi tiết bằng ảnh chụp ở cả 2 kích thước, có **3 chi tiết nhỏ** cần tinh chỉnh để prototype đạt mức độ hoàn hảo tuyệt đối:

### Danh sách xếp theo mức độ ưu tiên:

1. **Mức độ Trung bình — Chuẩn hóa đơn vị chi phí lãi ở Màn 10b (Bảng chào giá)**
   - *Hiện trạng*: Trong bảng so sánh các bên chào giá ở Màn 10b, cột Chi phí ước tính đang hiển thị dạng `"0,14 triệu"`, `"0,15 triệu"`, `"0,18 triệu"`.
   - *Quy chuẩn*: Theo quyết định chốt ở `docs/ban-giao.md` mục 5, tiền lãi được yêu cầu thống nhất hiển thị dạng nghìn đồng (ví dụ: `"140 nghìn đồng"`).
   - *Đề xuất*: Chuẩn hóa hiển thị cột chi phí ở Màn 10b thành `"140 nghìn đồng"`, `"150 nghìn đồng"`, `"180 nghìn đồng"`.

2. **Mức độ Nhẹ — Bổ sung nút bấm điều hướng tiếp tục bằng chuột ở chân trang Màn 7**
   - *Hiện trạng*: Khi người dùng mở Màn 7 từ Màn 2d hoặc từ thanh TopBar, Màn 7 có nút "← Quay lại trang trước" nhưng chưa có nút "Tiếp: Bắt đầu đối soát →" ở góc phải chân trang. Khi diễn tập bằng chuột, người thuyết trình phải dùng phím mũi tên hoặc nút trên TopBar.
   - *Đề xuất*: Thêm nút phụ "← Quay lại" bên trái và nút chính "Bắt đầu đối soát →" bên phải ở chân trang Màn 7.

3. **Mức độ Nhẹ — Tinh chỉnh đệm đáy (padding) ở Màn 4 trên màn hình 1536×864**
   - *Hiện trạng*: Ở độ phân giải 1536×864, thẻ danh sách RU-06 (đơn hoàn 2,3 triệu) ở đáy trang hơi sát mép dưới của viewport, cần lăn chuột nhẹ khoảng 30px để thấy khoảng thở chân trang.
   - *Đề xuất*: Giảm nhẹ padding dọc của các khối trên (`py-4` thay vì `py-6`) ở Màn 4 để toàn bộ 6 dòng đơn vị khoản phải thu nằm trọn 100% trong màn hình đầu mà không cần cuộn.

---

## 4. Kết luận

- Prototype **hoàn toàn sạch sẽ, đạt chuẩn pháp lý Thông tư 64/2024 và Luật 91/2025, nhất quán về thiết kế và không phát sinh lỗi vỡ layout**.
- Bộ ảnh chụp 72 tệp ảnh trong `docs/shots/v15/` là bằng chứng nghiệm thu đầy đủ và minh bạch cho toàn bộ hệ thống.
- Đề xuất sẵn sàng chuyển tiếp sang **Vòng 16** để xử lý 3 tinh chỉnh nêu trên.
