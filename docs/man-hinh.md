# Đặc tả 10 màn hình

Số liệu của mọi màn lấy từ docs/du-lieu.md. Thứ tự màn khi bấm mũi tên phải:
1 → 2 → 7 → 3 → 4 → 5 → 6 → 8 → (10 nếu Giai đoạn 3 đang bật).
Màn 9 không phải màn riêng: là diễn biến thay thế của màn 6 khi bật rò rỉ.

Thanh trên cùng mọi màn: tên giải pháp, thanh tiến trình 4 hồi.
Chân trang mọi màn: "Giao diện mô phỏng — dữ liệu giả định".

---

## Màn 1 — Trạng thái hiện tại (BẮT BUỘC)
Tái sử dụng: Màn 1 của bản cũ.

Khối nội dung:
- 4 thẻ kênh bán: tên kênh, doanh thu tháng, chu kỳ thanh toán.
- Khối nổi bật: "100 triệu đang kẹt ở sàn" (tính từ du-lieu.md, mục 3).
- Đồng hồ: "9 giờ đối soát tháng này".
- Mô phỏng bảng Excel đối soát thủ công, vài dòng đang được tô màu bằng tay.
- Khối phụ: "Lựa chọn hiện tại: vay tín chấp từ 2%/tháng".

Nút: "Kết nối ngân hàng" → Màn 2.

## Màn 2 — Cấp quyền A1 (BẮT BUỘC)
Tái sử dụng: Màn 2 của bản cũ (hiệu ứng terminal luồng OAuth).

Bước 2a — Trang Nền tảng: chọn ngân hàng nơi nhà bán nhận tiền (Techcombank; vài ngân hàng khác hiện dạng "Đang kết nối").
Bước 2b — Trang mô phỏng Techcombank: phải khác hẳn giao diện Nền tảng
(màu, bố cục, dòng "Bạn đang ở trang của Techcombank").
  - Bên yêu cầu: [Tên giải pháp]
  - Mục đích: Đối soát dòng tiền (A1)
  - Phạm vi: danh sách tài khoản; số dư; lịch sử giao dịch trong kỳ đối soát hiện hành
  - Thời hạn: 90 ngày, tự gia hạn khi nhà bán xác nhận
  - Dòng: "Bạn có thể rút lại quyền này bất cứ lúc nào"
  - Nút: "Đồng ý" / "Từ chối"
Bước 2c — Hiệu ứng luồng: GET /authorize (PKCE) → xác thực → POST /token →
access_token (3.600 giây) → quay về Nền tảng.
Bước 2d — Trang Nền tảng: "Đang tải 90 ngày lịch sử..." rồi "Hoàn tất".

Nút cuối: "Xem quyền của tôi" → Màn 7; "Xem đối soát" → Màn 3.

## Màn 3 — Đối soát tự động (BẮT BUỘC)
Tái sử dụng: Màn 3 của bản cũ.

Khối nội dung:
- Bảng giao dịch (du-lieu.md, mục 5), cột trạng thái có màu:
  Đã khớp (teal), Ngoại lệ (amber), Hoàn/đảo chuyển (gray), Chi ra (không đối soát).
- Cột "Phương pháp khớp": theo mã tham chiếu / theo nội dung / theo số tiền và ngày.
- Khối tóm tắt: số giao dịch đã khớp, số ngoại lệ, tổng tiền đã khớp.
- Khối "Phát hiện sai lệch phí": Shopee lô 01–03/09, dự phóng 42,0, thực nhận 41,3,
  chênh 0,7 triệu.
- Khối so sánh trước/sau: 9 giờ/tháng → dưới 1 giờ/tháng.

Nút: "Xử lý ngoại lệ" mở danh sách 2 ngoại lệ; "Tiếp" → Màn 4.

## Màn 4 — Khoản phải thu và điểm xác thực (BẮT BUỘC)
Mới hoàn toàn.

Khối nội dung:
- Danh sách 6 đơn vị khoản phải thu (du-lieu.md, mục 6), mỗi đơn vị một thẻ:
  mã, kênh, giá trị ròng dự phóng, cửa sổ thanh toán, trạng thái có màu.
- Dòng tổng: "Đang chờ sàn thanh toán: 100 triệu (2 đơn vị đã xác thực)".
- Thẻ điểm xác thực theo kênh (du-lieu.md, mục 7): Shopee 92, TikTok Shop 90,
  Hãng vận chuyển A "Chưa đủ lịch sử (4/6 lô)".
  Bấm vào một thẻ thì mở phân rã 5 chỉ số.
- Chú thích ngắn: "Điểm xác thực đo mức độ dự phóng khớp với tiền thật về tài khoản."

Nút: "Xem khả năng ứng vốn" → Màn 5.

## Màn 5 — Đề nghị ứng vốn (BẮT BUỘC)
Tái sử dụng: khung Màn 4 của bản cũ. BỎ phần gọi Claude API.

Thứ tự bước (nhà bán phải biết giá trị và chi phí trước khi ký chuyển giao quyền
đòi nợ, nên đổi so với bản trước): 5a cấp A2 → 5b xem ước tính → 5c ký A4 →
5d gửi đề nghị và nhận kết quả.

Bước 5a — Cấp quyền A2 (trang mô phỏng Techcombank, cùng khuôn Bước 2b): mục đích
đánh giá tín dụng (A2); phạm vi lịch sử giao dịch 180 ngày và hồ sơ doanh thu đã
xác thực; thời hạn 90 ngày; một ô xác nhận không tích sẵn; dòng "Rút lại quyền này
không ảnh hưởng đến đối soát (A1)."
Bước 5b — Xem ước tính (trang Nền tảng): bảng tính giá trị khả dụng hiện TỪNG DÒNG
(du-lieu.md, mục 4): giá trị ròng dự phóng từng đơn vị → tỷ lệ hoàn gia quyền →
biên an toàn → chiết khấu xác thực → tỷ lệ ứng → giá trị theo công thức → trần dư
nợ → phần đã bị bên khác khóa → GIÁ TRỊ KHẢ DỤNG. Nếu bị chặn bởi trần: hiện rõ
dòng "Bị chặn bởi trần dư nợ". Khối chi phí: bên cấp tín dụng Techcombank, lãi
suất năm, tiền lãi ước tính nếu tất toán sau 5 ngày. Dòng bắt buộc: "Ước tính,
chưa phải đề nghị cấp tín dụng".
Bước 5c — Ký thỏa thuận A4 (trang mô phỏng Techcombank, cùng khuôn Bước 2b):
"Chuyển giao quyền đòi nợ đối với RU-03 và RU-04, làm tài sản bảo đảm cho khoản
vay của Techcombank. Thỏa thuận được đăng ký theo Nghị định 99/2022/NĐ-CP; tiền
sàn về tài khoản Techcombank dùng để trả khoản vay." Một ô xác nhận không tích
sẵn; nút "Ký thỏa thuận" chỉ bấm được khi đã tích.
Bước 5d — Nút "Gửi đề nghị tới Techcombank" → hiệu ứng ngắn "Techcombank đang thẩm
định" → thông báo "Techcombank đã phê duyệt và giải ngân 85 triệu vào tài khoản
của bạn" → cập nhật state dùng chung (RU-03, RU-04 sang "Đã khóa" ở Màn 4; A2, A4
sang hiệu lực ở Màn 7) → Màn 6.

Khi Mega Sale bật (phím M): bảng tính ở Bước 5b dùng RU-M1, RU-M2 và tham số Mega
Sale, cập nhật theo du-lieu.md mục 4; hiện nhãn nhỏ "Kịch bản: Mega Sale" ở góc
màn. Phím R đặt lại trạng thái Mega Sale.

## Màn 6 — Tất toán (BẮT BUỘC)
Mới hoàn toàn.

Dòng thời gian ngang (du-lieu.md, mục 10):
15/09 Techcombank giải ngân 85 triệu → 15–18/09 nhập hàng, bán tiếp →
19/09 Shopee thanh toán RU-03 → 20/09 TikTok Shop thanh toán RU-04 →
khoản ứng tự tất toán.
Hai thẻ RU-03, RU-04 chuyển từ tím (Đã khóa) sang teal (Đã tất toán) khi tiền về.
Khối cuối: "Điểm xác thực được cập nhật sau lô tất toán".

Khi rò rỉ bật (phím L) — đây là Màn 9: xem mục Màn 9.

## Màn 7 — Trung tâm quyền riêng tư (BẮT BUỘC)
Mới hoàn toàn.

Khối nội dung:
- Danh sách quyền (du-lieu.md, mục 8): A1, A2, A4 — trạng thái, ngày cấp, hạn,
  nút "Rút lại" (A4 không rút được khi đang có khoản vay, hiện lý do).
- Nhật ký truy cập (du-lieu.md, mục 9): thời gian, bên truy cập, mục đích, dữ liệu.
- Nút "Xuất hồ sơ doanh thu đã xác thực của tôi".

Hành vi: bấm "Rút lại" ở A2 → A2 chuyển "Đã thu hồi", A1 vẫn "Đang hoạt động",
nhật ký thêm dòng "Nhà bán rút quyền A2". Màn 3 vẫn chạy bình thường.

## Màn 8 — Góc nhìn ngân hàng (NÊN CÓ)
Mới hoàn toàn. Đổi sang giao diện nội bộ ngân hàng.

Khối nội dung (du-lieu.md, mục 11):
- Ô tra cứu nhà bán (điền sẵn chị Lan).
- Bảng đơn vị khoản phải thu: giá trị khả dụng, giá trị đã bị khóa,
  SỐ LƯỢNG bên đang khóa. TUYỆT ĐỐI không hiện tên bên khóa.
- Khối "Tổng phơi nhiễm hợp nhất".
- Ví dụ minh họa: nếu đã có bên khác khóa 100 triệu thì chỉ còn 50 triệu khả dụng.

## Màn 9 — Kịch bản rò rỉ (NÊN CÓ, là biến thể của Màn 6)
Khi phím L bật: dòng thời gian màn 6 đổi thành:
19/09 Shopee không thanh toán về tài khoản Techcombank → 21/09 hết cửa sổ thanh toán →
24/09 hết 3 ngày ân hạn →
RU-03 chuyển Đứt gãy (đỏ) → cảnh báo "Tiền không về tài khoản neo" →
đóng băng cấp vốn mới → nhà bán nhận yêu cầu "Vui lòng xác nhận tài khoản nhận
tiền trên sàn". Nút "Tôi đã đổi tài khoản — giải trình" để minh họa quy trình
khôi phục.

## Màn 10 — Giai đoạn 3: nhiều bên chào giá (NÊN CÓ)
Chỉ hiện khi phím 3 bật.

Bước 10a: nhà bán gửi yêu cầu báo giá cho RU-03 và RU-04; chọn bên được nhận dữ liệu
(3 ô tích, có thể bỏ bớt).
Bước 10b: 3 chào giá (du-lieu.md, mục 12), sắp theo lãi suất.
Bước 10c: chọn một chào giá → hiện "Chứng thư khóa" (du-lieu.md, mục 12):
mã đơn vị, bên nhận bảo đảm, giá trị, thứ tự ưu tiên, thời điểm, dòng
"Ký số JWS — kiểm chứng độc lập".
