# Hành trình người dùng — app tự dùng (Vòng 19)

Trạng thái: **đề xuất, chờ duyệt**. Đi kèm `docs/san-pham.md` (mục E: chuỗi sự kiện,
mục G: điều kiện nút, mục L: chuyển động). Số liệu lấy từ `docs/du-lieu.md`; mục tham
chiếu ghi trong ngoặc.

Mỗi bước: **hành động người dùng → phản hồi hệ thống → hiệu ứng**. "Tua" = nút "Tua tới
sự kiện tiếp theo" trên bảng Mô phỏng (hoặc phím Space, hoặc nút trong thẻ Bước tiếp
theo). "Chuyển tiếp ngân hàng" = màn chuyển tiếp 700ms (bỏ qua khi
`prefers-reduced-motion`).

---

## Hành trình 1 — Nhà bán: từ kết nối tới khi trả xong khoản vay

Vai: Nhà bán. Tình huống: tắt hết. Bắt đầu 01/08/2027.

| # | Ngày | Hành động người dùng | Phản hồi hệ thống | Hiệu ứng |
|---|---|---|---|---|
| 1.1 | 01/08 | Mở app lần đầu | Màn chào: vai chị Lan, mục tiêu, "Khoảng 3 phút · 5 nhiệm vụ"; hai nút "Bắt đầu có hướng dẫn" / "Tự khám phá" | Hộp thoại mờ + thu từ 98%, 250ms |
| 1.2 | 01/08 | Bấm "Bắt đầu có hướng dẫn" | Đóng màn chào; Tổng quan: 4 kênh và doanh thu tháng (mục 2), "100 triệu đang ở sàn" (mục 3), 9 giờ đối soát/tháng, vay tín chấp từ 2%/tháng. Danh sách nhiệm vụ mở, 0/5. Thẻ Bước tiếp theo: "Kết nối tài khoản Techcombank để app đối soát tự động." | Hộp thoại mờ ra 200ms; danh sách nhiệm vụ trượt vào 250ms |
| 1.3 | 01/08 | Bấm "Kết nối Techcombank" | Drawer chọn ngân hàng nhận tiền: Techcombank nổi bật "Tài khoản nhận tiền sàn của chị Lan"; Ngân hàng B, Ngân hàng D (không có công ty tài chính) | Drawer trượt từ phải 250ms |
| 1.4 | 01/08 | Chọn Techcombank | "Đang chuyển tới Techcombank…" rồi trang A1: bên yêu cầu (tên pháp nhân + mã TPP), mục đích đối soát, phạm vi dạng danh sách, thời hạn 90 ngày, khối "Quyền này KHÔNG cho phép", một ô xác nhận chưa tích, nút "Đồng ý" vô hiệu | Chuyển tiếp ngân hàng 700ms |
| 1.5 | 01/08 | Tích ô xác nhận | Nút "Đồng ý" bật | Đổi màu nút 150ms |
| 1.6 | 01/08 | Bấm "Đồng ý" | "Quay về Đừng Đóng Vai Anh" rồi Đối soát (trạng thái trống): "Đã kết nối tài khoản Techcombank 1903 **** 8826", "Đang tích lũy lịch sử — cần 6 lô tất toán mỗi kênh", số lô 0/6. Nhật ký thêm 01/08 09:12 và 09:13 (mục 9). A1 = Đang hoạt động, hạn 30/10/2027 (mục 8). Nhiệm vụ 1 xong. Bước tiếp theo: "Tua tới 15/09 để xem 6 tuần đối soát." | Chuyển tiếp 700ms; dấu tích tự vẽ 300ms cạnh câu xác nhận và ở nhiệm vụ 1 |
| 1.7 | 01/08 → 15/09 | Tua | Ngày đổi thành 15/09/2027. Thẻ tóm tắt: "6 tuần sau: Shopee 7 lô, TikTok Shop 6 lô, Hãng vận chuyển A 4 lô; 25 giao dịch 01–10/09 đã đối soát". Đối soát: tỷ lệ khớp tự động 76%, 19 khớp / 2 ngoại lệ / 3 hoàn / 1 chi ra (mục 5); cảnh báo sai lệch phí RU-01 1,7%. Nhật ký thêm dòng 10/09 06:00 | Ngày trên thanh mờ dần đổi 200ms; nội dung trang chuyển trang 200ms |
| 1.8 | 15/09 | *(tùy chọn)* Bấm "Xử lý ngoại lệ" | Drawer 2 ngoại lệ GD14, GD20 | Drawer 250ms |
| 1.9 | 15/09 | Mở Khoản phải thu | "100 triệu đang ở sàn nay là 2 đơn vị tài sản đã xác thực": RU-03 Shopee 55, RU-04 TikTok Shop 45 — badge "Đã xác thực", vệt vòng đời ở chấm 2. Vùng "Vì sao tin được": RU-01 42 → 41,3 (khớp 98,3%), RU-02 35 → 34,6; điểm Shopee 92, TikTok Shop 90 (mục 7). Vùng "Chưa dùng được": RU-05 chưa đủ lịch sử 4/6 lô, RU-06 đã hoàn −2,3. Nhiệm vụ 2 xong | Chuyển trang 200ms (nền nhạt Tầng 2); dấu tích nhiệm vụ 300ms |
| 1.10 | 15/09 | Mở Ứng vốn | Thanh bước 4 bước: Cấp A2 → Xem ước tính → Ký A4 → Gửi đề nghị. Bước 1: "Techcombank cần quyền đánh giá tín dụng (A2)". Nút "Xem ước tính" vô hiệu, lý do "Cần quyền A2" + đường dẫn | Chuyển trang 200ms (nền nhạt Tầng 3) |
| 1.11 | 15/09 | Bấm "Cấp A2 trên trang Techcombank" | Trang A2: bên nhận dữ liệu Techcombank, lịch sử 180 ngày + hồ sơ doanh thu đã xác thực, 90 ngày, "Rút lại quyền này không ảnh hưởng đến đối soát (A1)", ô xác nhận chưa tích | Chuyển tiếp ngân hàng 700ms |
| 1.12 | 15/09 | Tích, "Đồng ý" | Về Ứng vốn bước 2. A2 = Đang hoạt động, hạn 14/12/2027. Nhật ký 15/09 10:02, 10:03 | Chuyển tiếp 700ms; thanh bước tô đầy tới bước 2 (300ms); nội dung bước trượt ngang 12px 250ms |
| 1.13 | 15/09 | Đọc ước tính | Bảng tính từng dòng (mục 4.2): 55 và 45 → tỷ lệ hoàn gia quyền 8% → biên an toàn 7% → chiết khấu 0 → tỷ lệ ứng 85% → 85 → trần 150 → đã bị khóa 0 → **85 triệu**. Chi phí: Techcombank, 12%/năm, khoảng 140 nghìn đồng nếu tất toán sau 5 ngày. Dòng "Ước tính, chưa phải đề nghị cấp tín dụng" cạnh con số | — |
| 1.14 | 15/09 | Bấm "Tiếp: ký thỏa thuận A4" | Trang A4: chuyển giao quyền đòi nợ RU-03, RU-04 làm tài sản bảo đảm cho khoản vay của Techcombank, đăng ký theo NĐ 99/2022; nút "Ký thỏa thuận" vô hiệu tới khi tích | Chuyển tiếp ngân hàng 700ms |
| 1.15 | 15/09 | Tích, "Ký thỏa thuận" | Về Ứng vốn bước 4. A4 = Đang hiệu lực. Nhật ký 15/09 10:05 | Chuyển tiếp 700ms; thanh bước tô tới bước 4 |
| 1.16 | 15/09 | Bấm "Gửi đề nghị tới Techcombank" | "Techcombank đang thẩm định" (1,2 giây) → "Techcombank đã phê duyệt và giải ngân 85 triệu vào tài khoản của bạn". Sổ khóa ghi RU-03 46,75 và RU-04 38,25, thứ tự ưu tiên 1 (T1). RU-03, RU-04 → "Đã khóa". Nhiệm vụ 3 xong. Bước tiếp theo: "Xem khoản vay" | Dấu tích tự vẽ 300ms; badge mới mờ dần 300ms |
| 1.17 | 15/09 | Mở Khoản vay | Dư nợ 85 triệu; dòng thời gian: 15/09 giải ngân → 15–18/09 nhập hàng, bán tiếp → 19/09 → 20/09; nút "Xem chứng thư khóa". Hai nút trả nợ vô hiệu, lý do "Shopee chưa thanh toán RU-03 (cửa sổ 18–21/09)" + "Tua tới sự kiện tiếp theo" | Chuyển trang 200ms |
| 1.18 | 15/09 → 19/09 | Tua | "Shopee thanh toán RU-03: 54,6 triệu về tài khoản Techcombank". Nút "Trả 46,75 triệu trên Techcombank" bật. Nhật ký 19/09 06:00 | Mốc 19/09 trên dòng thời gian tô đầy 300ms |
| 1.19 | 19/09 | Bấm "Trả 46,75 triệu trên Techcombank" | Trang Trả nợ một chạm (Techcombank) → xác nhận → về Khoản vay: dư nợ **38,25** (đổi ngay, không chạy số); RU-03 → "Đã tất toán" | Chuyển tiếp 700ms hai chiều; badge mờ dần 300ms; viền thẻ nổi ≤ 400ms |
| 1.20 | 19/09 → 20/09 | Tua | "TikTok Shop thanh toán RU-04: 44,7 triệu". Nút trả 38,25 bật. Nhật ký 20/09 06:00 | Mốc 20/09 tô đầy |
| 1.21 | 20/09 | Trả 38,25 trên Techcombank | Dư nợ **0**; RU-04 → "Đã tất toán"; "Khoản vay đã tất toán — tiền lãi khoảng 140 nghìn đồng"; "Điểm xác thực đã cập nhật sau lô tất toán"; A4 → "Đã chấm dứt — khoản vay đã tất toán". Nhiệm vụ 4 xong. Bước tiếp theo: "Xem hồ sơ dưới góc nhìn cán bộ Techcombank" → Đổi vai | Chuyển tiếp 700ms; dấu tích tự vẽ; badge 300ms |
| 1.22 | 20/09 | Mở bảng Mô phỏng | "Tua tới" vô hiệu: "Không còn sự kiện" + "Bắt đầu lại" / "Đổi vai" | — |

Nhánh phụ trong hành trình 1:
- **Rút A2** ở Quyền & dữ liệu (bất kỳ lúc nào sau 1.12): hộp xác nhận nêu hệ quả →
  A2 "Đã thu hồi", A1 vẫn hoạt động, nhật ký thêm "Nhà bán rút quyền A2". Đối soát vẫn
  chạy. Nút "Gửi đề nghị" (nếu chưa gửi) vô hiệu: "A2 đã bị rút" → "Cấp lại A2" (mở trang
  Techcombank A2, không kích hoạt ngay). Khoản vay đã có không đổi.
- **Rút A1**: hộp xác nhận → "Tua" vô hiệu: "Nền tảng không nhận dữ liệu khi A1 đã rút"
  → "Cấp lại A1".
- **Rút A4 khi còn dư nợ**: nút vô hiệu, lý do "Không rút được khi còn dư nợ — thỏa thuận
  chấm dứt khi khoản vay tất toán".
- **Tua ở 15/09 trước khi vay**: vô hiệu, "Mô phỏng dừng ở 15/09 tới khi bạn nhận giải
  ngân" → "Đi tới Ứng vốn".

---

## Hành trình 2 — Tình huống: Đổi tài khoản nhận tiền

Tiền đề: bất kỳ lúc nào **trước 19/09** (thường là sau bước 1.16). Nếu đã qua 19/09,
công tắc bị khóa: "Sự kiện 19/09 đã diễn ra" → "Bắt đầu lại".

| # | Ngày | Hành động người dùng | Phản hồi hệ thống | Hiệu ứng |
|---|---|---|---|---|
| 2.1 | 15/09 | Bảng Mô phỏng → bật "Đổi tài khoản nhận tiền" (hoặc phím L) | Mô tả dưới công tắc: "Chị Lan đổi tài khoản nhận tiền trên Shopee sang ngân hàng khác mà chưa cập nhật." Thông báo ngắn "Đã bật tình huống: Đổi tài khoản nhận tiền". **Sổ khóa giữ nguyên**; sự kiện kế tiếp đổi thành "→ 19/09: Shopee không thanh toán về tài khoản Techcombank" | Công tắc trượt 150ms; thông báo mờ vào 200ms, tự tắt sau 4 giây |
| 2.2 | 15/09 → 19/09 | Tua | Khoản vay: "Không có khoản thanh toán Shopee nào về tài khoản Techcombank". RU-03 vẫn "Đã khóa". Nút trả RU-03 vô hiệu: "Shopee chưa thanh toán RU-03 (cửa sổ 18–21/09)" | Mốc 19/09 tô đầy; không có đỏ |
| 2.3 | 19/09 → 20/09 | Tua | "TikTok Shop thanh toán RU-04: 44,7 triệu" (TikTok Shop không bị ảnh hưởng) | Mốc tô đầy |
| 2.4 | 20/09 | Trả 38,25 trên Techcombank | Dư nợ **46,75**; RU-04 "Đã tất toán" | Chuyển tiếp 700ms; badge 300ms |
| 2.5 | 20/09 → 21/09 | Tua | "Hết cửa sổ thanh toán RU-03 — đang trong 3 ngày ân hạn, tới 24/09" (thẻ trung tính, icon đồng hồ) | Mốc tô đầy |
| 2.6 | 21/09 → 24/09 | Tua | RU-03 → **"Đứt gãy"** (badge đỏ đặc + icon X) ở Khoản vay và Khoản phải thu. Khối "Tiền không về tài khoản neo"; điểm xác thực Shopee **92 → 58** đặt trước/sau (T10); "Cấp vốn mới đang tạm dừng"; yêu cầu "Vui lòng xác nhận tài khoản nhận tiền trên sàn". Ở Ứng vốn: "Ký A4" vô hiệu, lý do "Cấp vốn mới đang tạm dừng" → "Giải trình ở Khoản vay". Phía ngân hàng: mục Cảnh báo có chấm đếm 1 | Badge đỏ mờ dần 300ms + viền thẻ nổi ≤ 400ms — cú sốc đỏ duy nhất của app |
| 2.7 | 24/09 | Bấm "Tôi đã đổi tài khoản — giải trình" | Hộp thoại: xác nhận đã đổi lại tài khoản nhận tiền về Techcombank 1903 **** 8826 và sẽ trả 46,75 từ nguồn khác | Hộp thoại 250ms |
| 2.8 | 24/09 | Xác nhận → "Trả 46,75 triệu trên Techcombank" | Trang Trả nợ một chạm → về: dư nợ **0**; khoản vay tất toán; "Cấp vốn mới đã mở lại". RU-03 **giữ "Đứt gãy" trong lịch sử** (không đổi thành tất toán). Nhiệm vụ 6 xong | Chuyển tiếp 700ms; dấu tích tự vẽ |
| 2.9 | 24/09 | Mở bảng Mô phỏng | "Tua tới" vô hiệu: "Không còn sự kiện" | — |

Ghi chú: dòng nhật ký 19/09 và 20/09 (mục 9) vẫn hiện — A1 vẫn đồng bộ giao dịch, chỉ là
không có tiền Shopee.

---

## Hành trình 3 — Cán bộ Techcombank tra cứu + Giai đoạn 3

### 3A. Tra cứu sau khi chị Lan đã vay (tiếp sau bước 1.16, ngày 15/09)

| # | Ngày | Hành động người dùng | Phản hồi hệ thống | Hiệu ứng |
|---|---|---|---|---|
| 3.1 | 15/09 | Bảng Mô phỏng → Vai: "Cán bộ Techcombank" | Chuyển sang cổng nội bộ (thanh bên trái "Techcombank · Nội bộ — mô phỏng"), mục "Tra cứu nhà bán", ô tra cứu điền sẵn Lan Beauty | Chuyển trang 200ms (không dùng màn chuyển tiếp ngân hàng: đây là đổi vai, không phải chuyển hướng) |
| 3.2 | 15/09 | Xem hồ sơ | Con số chính: tổng phơi nhiễm hợp nhất **85 triệu — trên 1 bên cho vay** (mục 11). Bảng: RU-03 55 / 46,75 / 46,75 / 1 bên; RU-04 45 / 38,25 / 38,25 / 1 bên; RU-05 12 / Chưa đủ điều kiện / 0 / 0. Khối Thấy / Không thấy — **không có tên bên khóa**. Nhiệm vụ 5 xong | Dấu tích nhiệm vụ 300ms |
| 3.3 | 15/09 | Bật "Minh họa: đã có bên khác khóa 100 triệu" | "Đã bị khóa bởi 1 bên khác: 100 triệu — giá trị khả dụng đã được trừ"; khả dụng còn **50** (T3) | Công tắc 150ms; khối mới mờ vào 200ms |
| 3.4 | 15/09 | Mở "Danh mục khóa" | Hai khóa của Techcombank: RU-03 46,75, RU-04 38,25, thứ tự ưu tiên 1; nút "Xem chứng thư" | Chuyển mục 200ms |
| 3.5 | 15/09 | Bấm "Xem chứng thư" | Drawer: LOCK-2027-0915-00318, bên nhận bảo đảm Techcombank, ưu tiên 1, 15/09/2027 10:05:12, mã đăng ký bảo đảm, "Ký số — kiểm chứng độc lập" (mục 12) | Drawer 250ms |
| 3.6 | 15/09 | Phím D (gửi lại lệnh khóa) | "Lệnh khóa này đã được ghi nhận lúc 10:05 — không tạo khóa mới. Thứ tự ưu tiên #1 giữ nguyên. Tổng đã khóa: 85 triệu." Sổ khóa không thêm sự kiện | Callout mờ vào 200ms, tự tắt sau 6 giây |
| 3.7 | 15/09 | Mở "Cảnh báo" | "Không có cảnh báo" (nếu đang ở hành trình 2 và ngày ≥ 24/09: RU-03 đứt gãy 24/09, chính sách kiểm tra mỗi giờ) | Chuyển mục 200ms |
| 3.8 | 15/09 | Tua (vẫn ở vai cán bộ) | Ngày đổi; bảng tra cứu cập nhật theo sổ khóa (vd. 20/09 sau khi nhà bán trả: đã khóa 0, số bên khóa 0). Nếu tua cần hành động của nhà bán (trả nợ), thẻ Bước tiếp theo trong cổng nói rõ "Chờ nhà bán trả nợ" → "Đổi sang vai Nhà bán" | Chuyển trang 200ms |

Nhánh: cán bộ mở Tra cứu khi A2 chưa cấp hoặc đã rút → khối khóa "Nhà bán chưa cấp
(hoặc đã rút) quyền A2 — ngân hàng không xem được hồ sơ" + "Đổi sang vai Nhà bán".

### 3B. Giai đoạn 3 — nhiều bên chào giá

Tiền đề: chưa có khoản vay. Nếu đang có, công tắc bị khóa: "Đã có khoản vay với
Techcombank" → "Bắt đầu lại".

| # | Ngày | Hành động người dùng | Phản hồi hệ thống | Hiệu ứng |
|---|---|---|---|---|
| 3.9 | — | "Bắt đầu lại" → xác nhận | Về 01/08, xóa tiến trình, hiện lại màn chào | Hộp thoại xác nhận 250ms; màn chào 250ms |
| 3.10 | 01/08 → 15/09 | Làm lại 1.3–1.7 (kết nối A1, tua) | Như hành trình 1 | Như hành trình 1 |
| 3.11 | 15/09 | Bảng Mô phỏng → bật "Giai đoạn 3" (hoặc phím 3) | Trang Ứng vốn đổi thanh bước: Cấp A2 → Chọn bên nhận yêu cầu → So sánh chào giá → Ký với bên được chọn. Thông báo ngắn "Đã bật tình huống: Giai đoạn 3" | Công tắc 150ms; thông báo 200ms |
| 3.12 | 15/09 | Cấp A2 (như 1.11–1.12) | Về Ứng vốn bước 2 | Chuyển tiếp 700ms |
| 3.13 | 15/09 | Xem ô chọn bên nhận | 3 ô Techcombank, Ngân hàng B, Công ty tài chính C — **không tích sẵn**; "Gửi yêu cầu chào giá" vô hiệu, lý do "Chọn ít nhất một bên nhận" | — |
| 3.14 | 15/09 | Tích cả 3, "Gửi yêu cầu chào giá" | Bảng chào giá sắp theo lãi suất (mục 12): Techcombank 12%/năm, Ngân hàng B 13,2%, Công ty tài chính C 15,6%; nhãn chữ "Lãi thấp nhất"; tiền lãi ước tính theo số ngày; "Mỗi bên cho vay tự thẩm định và tự giải ngân; Nền tảng chỉ chuyển yêu cầu và chào giá."; dòng "Ước tính, chưa phải đề nghị cấp tín dụng" | Thanh bước tô tới bước 3; nội dung trượt 12px 250ms |
| 3.15a | 15/09 | Chọn **Techcombank** | Trang A4 Techcombank → ký → sổ khóa ghi → chứng thư → khoản vay đi tiếp y như 1.16–1.21. Nhiệm vụ 7 xong | Chuyển tiếp ngân hàng 700ms; dấu tích |
| 3.15b | 15/09 | Chọn **Ngân hàng B** | "Đang chuyển tới Ngân hàng B…" → trang ký khung ngân hàng **trung tính** ("Bạn đang ở trang của Ngân hàng B") → ký → sổ khóa ghi với bên nhận là Ngân hàng B → chứng thư khóa. Thẻ kết: "Dòng tất toán trong mô phỏng chỉ dựng cho Techcombank" + "Chọn lại chào giá" + "Bắt đầu lại". Nhiệm vụ 7 xong | Chuyển tiếp 700ms (nền trung tính, không vạch đỏ) |
| 3.15c | 15/09 | Chọn **Công ty tài chính C** (80 triệu) | Như 3.15b tới trang ký. Phân bổ khóa 80 triệu giữa RU-03/RU-04 chưa có trong du-lieu.md → chờ nhóm quyết (câu hỏi mở 2). Tạm thời: nút "Ký" vô hiệu, lý do "Mô phỏng chưa có dữ liệu khóa cho chào giá này" + "Chọn lại chào giá" | Chuyển tiếp 700ms |
| 3.16 | 15/09 | *(sau 3.15b)* Đổi vai Cán bộ Techcombank → Tra cứu | Phơi nhiễm hợp nhất 85 triệu — trên **1 bên** cho vay; đã khóa 46,75 và 38,25; **không hiện tên bên** (Techcombank không biết đó là Ngân hàng B). Danh mục khóa của Techcombank: trống. Khả dụng còn lại cho Techcombank: 0 | Chuyển trang 200ms |

Bước 3.16 là khoảnh khắc chính của Giai đoạn 3: Techcombank thấy khoản phải thu đã bị
một bên khác khóa hết mà không biết bên đó là ai — sổ đăng ký chặn vay chồng mà vẫn giữ
bí mật kinh doanh (quy-tac mục 5).

Câu hỏi mở (xem `docs/san-pham.md` cuối file): mã chứng thư và phân bổ khóa khi chọn
Ngân hàng B / Công ty tài chính C chưa có trong `docs/du-lieu.md`.
