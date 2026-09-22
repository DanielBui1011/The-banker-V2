# Dữ liệu giả — nguồn số liệu duy nhất

## 1. Quy ước
- Đơn vị tiền: triệu đồng. Dấu phẩy là dấu thập phân (41,3 = 41.3 khi viết code).
- Hiển thị: 1 chữ số thập phân; tỷ lệ phần trăm: 1 chữ số thập phân.
- Ngày "hôm nay" trong demo: 15/09/2027 (Giai đoạn 2, chức năng ứng vốn đã bật).
- Tên bên cho vay khác dùng tên giả: "Ngân hàng B", "Công ty tài chính C".
- Tên hãng vận chuyển dùng tên giả: "Hãng vận chuyển A".

## 2. Hồ sơ nhà bán
| Trường | Giá trị |
|---|---|
| Tên shop | Lan Beauty |
| Chủ shop | Chị Lan |
| Ngành hàng | Mỹ phẩm |
| Tài khoản thanh toán | Techcombank, số giả 1903 **** 8826 |
| Phần mềm bán hàng | [Phần mềm thí điểm] |
| Ngày kết nối | 01/08/2027 |
| Giờ đối soát thủ công trước khi dùng | 9 giờ/tháng |
| Lựa chọn vốn hiện tại | Vay tín chấp từ 2%/tháng |

| Kênh | Doanh thu tháng | Chu kỳ thanh toán |
|---|---|---|
| Shopee | 170 | Giữ tiền 8–15 ngày |
| TikTok Shop | 130 | Giữ tiền 8–15 ngày |
| Facebook/Instagram | 120 | Khách chuyển khoản trực tiếp |
| Website | 80 | Cổng thanh toán, về sau 1–2 ngày |
| **Tổng** | **500** | Trong đó qua sàn: 300 |

## 3. Tiền đang kẹt ở sàn
Tiền ký quỹ = doanh thu sàn / 30 × số ngày giữ tiền bình quân = 300 / 30 × 10 = **100**.
Kỳ Mega Sale: doanh thu sàn gấp 3 = 900/tháng → tiền ký quỹ **300**.

## 4. Công thức và tham số

### 4.1. Điểm xác thực (theo từng cặp nhà bán × kênh)
```
điểm = 100
     × min(độ sát dự phóng, 1)
     × (1 − min(độ dao động, 0,3))
     × (1 − min(sai lệch phí × 5, 0,3))
     × (1 − tỷ lệ rò rỉ × 3)
     × hệ số đúng hạn
hệ số đúng hạn = 1,0 nếu độ trễ P90 ≤ 3 ngày; trừ 0,03 cho mỗi ngày vượt; tối thiểu 0,7
Chỉ tính khi đã có từ 6 lô tất toán; dưới 6 lô → "Chưa đủ lịch sử".
Làm tròn về số nguyên khi hiển thị.
```

### 4.2. Giá trị khả dụng (theo từng đơn vị, sau đó áp trần ở cấp nhà bán)
```
tỷ lệ hoàn gia quyền = 0,4 × tỷ lệ hoàn của nhà bán
                     + 0,3 × tỷ lệ hoàn của kênh
                     + 0,3 × tỷ lệ hoàn theo mùa
biên an toàn = 12% nếu Mega Sale, 7% nếu kỳ thường
chiết khấu xác thực = max(0; (90 − điểm) / 90) × 15%
tỷ lệ ứng = 1 − tỷ lệ hoàn gia quyền − biên an toàn − chiết khấu xác thực
giá trị theo công thức = tổng (giá trị ròng dự phóng × tỷ lệ ứng) của các đơn vị Đã xác thực
trần dư nợ = doanh thu sàn bình quân 3 tháng × 0,5
giá trị khả dụng = max(0; min(giá trị theo công thức; trần dư nợ − phần đã bị bên khác khóa))
Đơn vị chưa có điểm (dưới 6 lô) → không được tính.
```

| Tham số | Kỳ thường | Mega Sale |
|---|---|---|
| Tỷ lệ hoàn của nhà bán | 8% | 15% |
| Tỷ lệ hoàn của kênh (Shopee, TikTok Shop) | 8% | 15% |
| Tỷ lệ hoàn theo mùa | 8% | 15% |
| Biên an toàn | 7% | 12% |
| Doanh thu sàn bình quân 3 tháng | 300 | 300 (tính trên 3 tháng trước đợt sale) |
| Trần dư nợ | 150 | 150 |

### 4.3. Kết quả bắt buộc phải ra đúng (viết thành test)
| # | Tình huống | Kết quả |
|---|---|---|
| T1 | Kỳ thường; RU-03 (55, điểm 92) + RU-04 (45, điểm 90); chưa bị khóa | Tỷ lệ ứng 85,0% mỗi đơn vị; giá trị khả dụng **85,0** |
| T2 | Mega Sale; ký quỹ 300 (RU-M1 165 điểm 92 + RU-M2 135 điểm 90) | Tỷ lệ ứng 73,0%; theo công thức **219,0**; bị chặn bởi trần → **150,0** |
| T3 | Như T1 nhưng đã có bên khác khóa 100 | min(85; 150 − 100) = **50,0** |
| T4 | Một đơn vị 100, điểm 70, kỳ thường | Chiết khấu 3,3%; tỷ lệ ứng 81,7%; giá trị **81,7** |
| T5 | Đơn vị chưa có điểm (dưới 6 lô) | Không đủ điều kiện, giá trị **0** |
| T6 | Điểm đúng 90 | Chiết khấu **0** |
| T7 | Điểm Shopee theo mục 7 | **92** |
| T8 | Điểm TikTok Shop theo mục 7 | **90** |
| T9 | Tiền lãi khoản 85 triệu, 12%/năm, tất toán sau 5 ngày | 85 × 12% × 5 / 365 ≈ **0,14** (khoảng 140 nghìn đồng) |

## 5. Giao dịch ngân hàng (tài khoản Techcombank, 01–10/09/2027)
Dấu + là tiền vào, dấu − là tiền ra. "Hoàn" = chỉ báo đảo chuyển (reversalIndicator = true).

| Mã | Ngày | Số tiền | Bên chuyển / nhận | Nội dung / mã tham chiếu | Kênh | Trạng thái | Phương pháp khớp | Gắn với |
|---|---|---|---|---|---|---|---|---|
| GD01 | 01/09 | +20,5 | Shopee | SPE-PAYOUT-0901 | Shopee | Đã khớp | Mã tham chiếu | RU-01 |
| GD02 | 02/09 | +17,2 | TikTok Shop | TTS-STL-0902 | TikTok Shop | Đã khớp | Mã tham chiếu | RU-02 |
| GD03 | 02/09 | +8,6 | Hãng vận chuyển A | COD-LO-0831 | COD | Đã khớp | Mã tham chiếu | Lô COD trước |
| GD04 | 02/09 | +0,45 | Nguyễn Thu H. | DH FB1021 | Facebook | Đã khớp | Nội dung | Đơn FB1021 |
| GD05 | 03/09 | +20,8 | Shopee | SPE-PAYOUT-0903 | Shopee | Đã khớp | Mã tham chiếu | RU-01 |
| GD06 | 03/09 | +0,38 | Trần Mai A. | DH FB1022 | Facebook | Đã khớp | Nội dung | Đơn FB1022 |
| GD07 | 03/09 | +0,62 | Lê Hồng N. | FB1023 thanh toan | Facebook | Đã khớp | Nội dung | Đơn FB1023 |
| GD08 | 04/09 | +17,4 | TikTok Shop | TTS-STL-0904 | TikTok Shop | Đã khớp | Mã tham chiếu | RU-02 |
| GD09 | 04/09 | +0,29 | Phạm Linh | DH FB1025 | Facebook | Đã khớp | Nội dung | Đơn FB1025 |
| GD10 | 04/09 | +1,15 | Đỗ Quỳnh T. | FB1024 | Facebook | Đã khớp | Nội dung | Đơn FB1024 |
| GD11 | 05/09 | +7,9 | Hãng vận chuyển A | COD-LO-0903 | COD | Đã khớp | Mã tham chiếu | RU-05 (một phần, xem mục 6) |
| GD12 | 05/09 | +0,52 | Vũ Thảo | DH FB1027 | Facebook | Đã khớp | Nội dung | Đơn FB1027 |
| GD13 | 06/09 | −1,2 | Shopee | SPE-RFD-0906 | Shopee | Hoàn | Mã tham chiếu | RU-06 |
| GD14 | 06/09 | +0,45 | (không rõ) | (trống) | — | Ngoại lệ | Không khớp được | — |
| GD15 | 06/09 | +0,71 | Bùi Hà | DH FB1028 | Facebook | Đã khớp | Nội dung | Đơn FB1028 |
| GD16 | 07/09 | −0,9 | TikTok Shop | TTS-RFD-0907 | TikTok Shop | Hoàn | Mã tham chiếu | Đơn hoàn TikTok |
| GD17 | 07/09 | +12,3 | Cổng thanh toán | WEB-SETTLE | Website | Đã khớp | Số tiền và ngày | Doanh thu web 04–06/09 |
| GD18 | 07/09 | +0,33 | Hoàng Yến | DH FB1030 | Facebook | Đã khớp | Nội dung | Đơn FB1030 |
| GD19 | 08/09 | −1,1 | Shopee | SPE-RFD-0908 | Shopee | Hoàn | Mã tham chiếu | RU-06 |
| GD20 | 08/09 | +2,15 | Ngô Minh K. | chuyen tien | — | Ngoại lệ | Không khớp được | — |
| GD21 | 08/09 | +0,48 | Đặng Vân | DH FB1031 | Facebook | Đã khớp | Nội dung | Đơn FB1031 |
| GD22 | 09/09 | −15,0 | Công ty mỹ phẩm X | Thanh toan nhap hang | — | Chi ra | Không đối soát | — |
| GD23 | 09/09 | +0,80 | Lý Thanh | DH FB1033 | Facebook | Đã khớp | Nội dung | Đơn FB1033 |
| GD24 | 10/09 | +0,57 | Mai Chi | DH FB1034 | Facebook | Đã khớp | Nội dung | Đơn FB1034 |
| GD25 | 10/09 | +0,60 | Tạ Ngọc | FB1035 | Facebook | Đã khớp | Nội dung | Đơn FB1035 |

Tóm tắt cho màn 3: 19 giao dịch vào đã khớp; 2 ngoại lệ (GD14, GD20);
3 giao dịch hoàn (GD13, GD16, GD19); 1 giao dịch chi ra không đối soát (GD22).
Tỷ lệ ngoại lệ trong bộ demo cao hơn thực tế để có ví dụ minh họa; không dùng làm chỉ số.

Phát hiện sai lệch phí (quy tắc: cảnh báo khi chênh lệch trên 1,5%):
- RU-01 Shopee: dự phóng 42,0, thực nhận 20,5 + 20,8 = 41,3 → chênh 0,7 (1,7%) → **cảnh báo**.
- RU-02 TikTok Shop: dự phóng 35,0, thực nhận 17,2 + 17,4 = 34,6 → chênh 0,4 (1,1%) → bình thường.

## 6. Đơn vị khoản phải thu
| Mã | Kênh | Nhóm đơn | Giá trị ròng dự phóng | Cửa sổ thanh toán | Trạng thái | Thực nhận |
|---|---|---|---|---|---|---|
| RU-01 | Shopee | Kỳ thường | 42,0 | 01–04/09 | Đã tất toán (teal) | 41,3 |
| RU-02 | TikTok Shop | Kỳ thường | 35,0 | 02–05/09 | Đã tất toán (teal) | 34,6 |
| RU-03 | Shopee | Kỳ thường | 55,0 | 18–21/09 | Đã xác thực (gray) → Đã khóa sau Màn 5 (purple) | — |
| RU-04 | TikTok Shop | Kỳ thường | 45,0 | 19–22/09 | Đã xác thực (gray) → Đã khóa sau Màn 5 (purple) | — |
| RU-05 | Hãng vận chuyển A (COD) | Kỳ thường | 12,0 | 16–18/09 | Dự phóng — chưa đủ lịch sử (4/6 lô) | — |
| RU-06 | Shopee | Đơn hoàn | 2,3 | — | Đã hoàn (gray) | −2,3 (GD13 + GD19) |

Dòng tổng trên Màn 4: "Đang chờ sàn thanh toán: 100 triệu (RU-03 + RU-04)".

Dữ liệu khi bật Mega Sale (thay RU-03, RU-04):
| Mã | Kênh | Nhóm đơn | Giá trị ròng dự phóng | Điểm |
|---|---|---|---|---|
| RU-M1 | Shopee | Mega Sale | 165,0 | 92 |
| RU-M2 | TikTok Shop | Mega Sale | 135,0 | 90 |

## 7. Điểm xác thực
| Chỉ số | Shopee | TikTok Shop | Hãng vận chuyển A |
|---|---|---|---|
| Số lô đã tất toán | 7 | 6 | 4 |
| Độ sát dự phóng | 98,3% | 97,5% | — |
| Độ dao động | 2,1% | 2,8% | — |
| Sai lệch phí | 0,8% | 0,9% | — |
| Tỷ lệ rò rỉ | 0% | 0% | — |
| Độ trễ P90 | 2 ngày | 3 ngày | — |
| **Điểm** | **92** | **90** | **Chưa đủ lịch sử** |

Kiểm tra: 100 × 0,983 × 0,979 × 0,96 × 1 × 1 ≈ 92,4 → 92;
100 × 0,975 × 0,972 × 0,955 × 1 × 1 ≈ 90,5 → 90.

## 8. Quyền đã cấp (trạng thái sau Màn 5)
| Quyền | Mục đích | Bên | Ngày cấp | Hạn | Trạng thái | Rút lại |
|---|---|---|---|---|---|---|
| A1 | Đối soát dòng tiền | Techcombank → [Tên giải pháp] | 01/08/2027 | 30/10/2027 | Đang hoạt động | Được |
| A2 | Đánh giá tín dụng | Techcombank → [Tên giải pháp] | 15/09/2027 | 14/12/2027 | Đang hoạt động | Được, không ảnh hưởng A1 |
| A4 | Chuyển giao quyền đòi nợ (RU-03, RU-04) | Chị Lan → Techcombank | 15/09/2027 | Đến khi tất toán | Đang hiệu lực | Không, khi còn dư nợ |

Trạng thái ban đầu khi bắt đầu demo (trước Màn 2): chưa có quyền nào.

## 9. Nhật ký truy cập
| Thời gian | Bên truy cập | Mục đích | Dữ liệu |
|---|---|---|---|
| 01/08/2027 09:12 | [Tên giải pháp] | A1 — đối soát | Danh sách tài khoản, số dư |
| 01/08/2027 09:13 | [Tên giải pháp] | A1 — đối soát | Lịch sử giao dịch 90 ngày (lần đầu) |
| 10/09/2027 06:00 | [Tên giải pháp] | A1 — đối soát | Giao dịch 01–10/09 |
| 15/09/2027 10:02 | [Tên giải pháp] | A2 — đánh giá tín dụng | Lịch sử giao dịch 180 ngày |
| 15/09/2027 10:03 | Techcombank | A2 — đánh giá tín dụng | Hồ sơ doanh thu đã xác thực |
| 15/09/2027 10:05 | Techcombank | A4 — đăng ký bảo đảm | RU-03, RU-04 |
| 19/09/2027 06:00 | [Tên giải pháp] | A1 — đối soát | Giao dịch 11–19/09 |
| 20/09/2027 06:00 | [Tên giải pháp] | A1 — đối soát | Giao dịch 20/09 |

## 10. Dòng thời gian tất toán
Kịch bản bình thường:
| Ngày | Sự kiện | Dư nợ còn lại |
|---|---|---|
| 15/09 | Techcombank giải ngân 85,0; khóa RU-03 (46,75) và RU-04 (38,25) | 85,0 |
| 15–18/09 | Nhập hàng, bán tiếp | 85,0 |
| 19/09 | Shopee thanh toán RU-03: 54,6 về tài khoản Techcombank; trả 46,75 | 38,25 |
| 20/09 | TikTok Shop thanh toán RU-04: 44,7 về tài khoản; trả 38,25 | 0 |
| 20/09 | Khoản ứng tất toán; tiền lãi ≈ 0,14; điểm xác thực cập nhật | — |

Kịch bản rò rỉ (phím L):
| Ngày | Sự kiện |
|---|---|
| 19/09 | Không có khoản thanh toán Shopee nào về tài khoản Techcombank |
| 20/09 | RU-04 vẫn tất toán bình thường (TikTok Shop không bị ảnh hưởng); dư nợ còn 46,75 |
| 21/09 | Hết cửa sổ thanh toán RU-03 |
| 24/09 | Hết 3 ngày ân hạn → RU-03 chuyển Đứt gãy (đỏ); cảnh báo tới Techcombank; đóng băng cấp vốn mới; yêu cầu chị Lan xác nhận tài khoản nhận tiền |

## 11. Góc nhìn ngân hàng
| Đơn vị | Giá trị ròng dự phóng | Giá trị khả dụng | Đã bị khóa | Số bên đang khóa |
|---|---|---|---|---|
| RU-03 | 55,0 | 46,75 | 46,75 | 1 |
| RU-04 | 45,0 | 38,25 | 38,25 | 1 |
| RU-05 | 12,0 | Chưa đủ điều kiện | 0 | 0 |
Tổng phơi nhiễm hợp nhất của nhà bán: 85,0 — trên 1 bên cho vay.
Ví dụ minh họa phơi nhiễm chéo: nếu đã có bên khác khóa 100 → chỉ còn 50 khả dụng (T3).
KHÔNG hiển thị tên bên đang khóa.

## 12. Giai đoạn 3 — chào giá cho RU-03 và RU-04
| Bên cho vay | Giá trị | Lãi suất/năm | Kỳ hạn | Tiền lãi ước tính nếu tất toán sau 5 ngày |
|---|---|---|---|---|
| Techcombank | 85,0 | 12,0% | Đến khi tất toán, tối đa 20 ngày | 0,14 |
| Ngân hàng B | 85,0 | 13,2% | Đến khi tất toán, tối đa 20 ngày | 0,15 |
| Công ty tài chính C | 80,0 | 15,6% | Đến khi tất toán, tối đa 15 ngày | 0,17 |

Chứng thư khóa (khi chọn Techcombank):
| Trường | Giá trị |
|---|---|
| Mã chứng thư | LOCK-2027-0915-00318 |
| Đơn vị | RU-03 (46,75), RU-04 (38,25) |
| Bên nhận bảo đảm | Techcombank |
| Thứ tự ưu tiên | 1 |
| Thời điểm khóa | 15/09/2027 10:05:12 |
| Mã đăng ký bảo đảm | DKBĐ-GIẢ-2027-004512 |
| Ký số | JWS, RS256 — kiểm chứng độc lập |

## 13. Điều chỉnh so với đề án (nhóm cần cập nhật bản viết)
1. **Chiết khấu xác thực** dùng max(0; (90 − điểm)/90) × 15% thay cho (100 − điểm)/100 × 15%
   ở Phần III. Lý do: với công thức cũ, nhà bán chỉ đạt đúng 85% khi điểm 100/100,
   gần như không thể; công thức mới giữ nguyên các con số 85% và 73% của phần tài chính.
2. **Trần dư nợ** ghi rõ là 0,5 lần doanh thu *qua sàn* bình quân 3 tháng
   (300 × 0,5 = 150), khớp với ví dụ ở phần hiệu quả tài chính.
3. **Tỷ lệ hoàn Mega Sale 15%** áp dụng cho cả ba chiều (nhà bán, kênh, mùa) trong kỳ
   sale để ra đúng tỷ lệ ứng 73% như đề án.
