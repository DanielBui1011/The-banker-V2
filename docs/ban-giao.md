# BÀN GIAO DỰ ÁN — chuyển từ Claude Code sang Antigravity

Tài liệu này ghi lại mọi thứ đã làm trong Claude Code (Vòng 0–14), các quyết định đã chốt kèm lý do,
và việc còn lại. Luật làm việc nằm ở AGENTS.md. Khi mâu thuẫn: docs/quy-tac.md và docs/du-lieu.md thắng tài liệu này.

LƯU Ý QUAN TRỌNG: phần "đã làm" của Vòng 12–14 được viết theo YÊU CẦU đã giao, chưa được kiểm chứng
bằng ảnh chụp. Việc đầu tiên trong Antigravity là Vòng 15 — đối chiếu repo với tài liệu này (mục 6).

---

## 1. Bối cảnh đề án (phần ảnh hưởng tới giao diện)

- Hạ tầng 3 tầng: T1 Doanh thu đã xác thực, T2 Sổ đăng ký khoản phải thu, T3 Giao thức cấp vốn mở.
- Lộ trình: GĐ1 (0–6 tháng) thí điểm 300–500 nhà bán, KHÔNG cấp tín dụng, sổ đăng ký chạy chế độ nền;
  GĐ2 (6–18 tháng) bật ứng vốn, TPP độc lập kết nối AIS với ngân hàng khác; GĐ3 (18–36 tháng) mở cho nhiều bên cho vay.
- Mốc pháp lý: ngân hàng phải tuân thủ đầy đủ Thông tư 64/2024 trước 01/3/2027 → ngày demo 15/09/2027 đã qua mốc,
  nên ở Màn 2a các ngân hàng khác kết nối được (không hiển thị mờ/"chưa hỗ trợ").
- Pháp lý khoản ứng: Phương án B — cho vay có bảo đảm bằng quyền đòi nợ (BLDS 2015, NĐ 21/2021, NĐ 99/2022),
  không phải bao thanh toán. Trả nợ một chạm do Techcombank tự triển khai (tránh giấy phép trung gian thanh toán).
  GĐ3 lưu ý NĐ 58/2021 về thông tin tín dụng.
- Consent: A1 đối soát · A2 đánh giá tín dụng · A3 ủy quyền trích nợ · A4 chuyển giao quyền đòi nợ.

## 2. Bản đồ repo

- `AGENTS.md` (luật chung) · `CLAUDE.md` (luật riêng Claude Code, nên import @AGENTS.md) · `BAT-DAU.md`
- `PRODUCT.md` (bối cảnh sản phẩm, sinh bởi Impeccable) · `DESIGN.md` (hệ thống thiết kế + "Ràng buộc khóa")
- `docs/kich-ban.md` (kịch bản 3 phút, 4 hồi) · `docs/man-hinh.md` (10 màn) · `docs/du-lieu.md` (nguồn số liệu duy nhất,
  công thức, test) · `docs/quy-tac.md` (ràng buộc pháp lý & nội dung) · `docs/ui-audit.md` (audit Vòng 7 + cập nhật)
- `docs/plans/ui-roadmap.md` (kế hoạch Vòng 8–11) · `docs/reference/settlesync_prototype.html` (bản cũ, chỉ tham khảo)
- `src/data/mockData.js` · `src/logic/pricing.js` · `src/logic/verification.js` · `src/utils/format.js`
- `src/config/brand.js` (DISPLAY_NAME, LEGAL_NAME, TPP_CODE) · `src/ui/status.js` (bảng màu/trạng thái)
- `src/components/ui/*`: Card, Money, StatusBadge, Callout, EstimateDisclaimer, SurfaceFrame, Stepper, Timeline,
  DataTable, Drawer, ConfirmDialog, SegmentedControl, ToggleSwitch, LayerTag, TopBar, ActProgress, Stat, KeyHint,
  ConsentPage (thêm ở Vòng 12)
- `src/components/LockCertificate.jsx` · `src/components/ScenarioPanel.jsx` · `src/screens/Screen1–Screen10.jsx` · `src/state/`

## 3. Số liệu bắt buộc (bản sao để đối chiếu — docs/du-lieu.md là bản gốc)

- Doanh thu 500 triệu/tháng: Shopee 170, TikTok Shop 130, Facebook 120, Website 80; qua sàn 300.
- Tiền kẹt ở sàn = 300/30 × 10 = 100 triệu. Đối soát thủ công 9 giờ/tháng. Vay tín chấp từ 2%/tháng.
- Đơn vị khoản phải thu: RU-01 Shopee 42 (thực nhận 41,3, đã tất toán) · RU-02 TikTok 35 (34,6, đã tất toán) ·
  RU-03 Shopee 55 · RU-04 TikTok 45 (đã xác thực → khóa sau Màn 5) · RU-05 COD 12 (chưa đủ lịch sử 4/6 lô) ·
  RU-06 đơn hoàn 2,3. Mega Sale: RU-M1 165, RU-M2 135.
- Điểm xác thực: Shopee 92, TikTok Shop 90, COD chưa đủ lịch sử.
- Giá trị khả dụng: tỷ lệ hoàn gia quyền (0,4 nhà bán + 0,3 kênh + 0,3 mùa); biên an toàn 7% (12% Mega Sale);
  chiết khấu xác thực = max(0; (90 − điểm)/90) × 15%; trần dư nợ = 0,5 × doanh thu SÀN bình quân 3 tháng = 150;
  trừ phần đã bị bên khác khóa.
- Test: T1 kỳ thường = 85 · T2 Mega Sale 73% → 219 → chặn 150 · T3 bị khóa 100 → còn 50 · T4 điểm 70 → 81,7 ·
  T5 chưa có điểm → 0 · T6 điểm 90 không chiết khấu · T7 Shopee 92 · T8 TikTok 90 · T9 lãi 85 × 12% × 5/365 ≈ 0,14 triệu
  (hiển thị 140 nghìn đồng) · T10 rò rỉ 1/8 lô → Shopee 58.
- Khóa: RU-03 46,75 + RU-04 38,25 = 85. Tất toán: 19/09 Shopee về 54,6; 20/09 TikTok về 44,7. Dư nợ 85 → 38,25 → 0.
- Màn 3: 25 giao dịch; 19 khớp / 2 ngoại lệ / 3 hoàn / 1 chi ra → 76%; sai lệch phí RU-01 1,7% ("Từ GD01 + GD05").
- Màn 9: RU-03 đứt gãy 24/09; điểm Shopee 92 → 58.
- Màn 10: chào giá Techcombank 12%, Ngân hàng B 13,2%, CTTC C 15,6%.
- Quyền: A1 cấp 01/08/2027, hạn 30/10/2027; A2 90 ngày (hiệu lực đến 14/12/2027).

## 4. Lịch sử các vòng (Claude Code)

| Vòng | Nội dung |
|---|---|
| 0 | Khung dự án, điều hướng, test T1–T9 |
| 1 | Màn 1 Trạng thái hiện tại (sửa định dạng số, cỡ chữ) |
| 2 | Màn 2 cấp quyền A1 (2a chọn ngân hàng, 2b trang Techcombank, 2c luồng OAuth scope=AIS + refresh_token, 2d tải lịch sử) + Màn 7 Trung tâm quyền riêng tư (rút/cấp lại có hộp xác nhận, nhật ký dd/mm/yyyy, nút "Quyền của tôi" mọi màn) |
| 3 | Màn 3 đối soát (25 giao dịch, bộ lọc, cảnh báo sai lệch phí RU-01) + Màn 4 khoản phải thu |
| 4 | Màn 5 ứng vốn: A2 → xem ước tính → ký A4 → gửi đề nghị; phím M; cập nhật chéo Màn 4 và 7 |
| 5 | Màn 6 tất toán (trả nợ một chạm trên trang Techcombank), Màn 9 rò rỉ (phím L), ScenarioPanel (M, L, 3, R) |
| 6 | Màn 8 góc nhìn ngân hàng (bộ chọn 15/09–20/09, ẩn dữ liệu khi rút A2, công tắc bị khóa 100 → 50) + Màn 10 Giai đoạn 3 (chọn bên nhận dữ liệu, 3 chào giá, ký với bên được chọn, chứng thư khóa) |
| 7 | Chẩn đoán UI: PRODUCT.md, DESIGN.md, docs/ui-audit.md, docs/plans/ui-roadmap.md. Không đổi giao diện |
| 8 | Nền móng: điền LEGAL_NAME; hợp nhất StatusBadge (xóa bản cũ); khung bankOps có thanh bên; màu nút theo khung; Money hỗ trợ "nghìn đồng"; ScenarioPanel đổi nhãn cam → trung tính |
| 9 | Màn 1, 2, 7, 3 theo nguyên tắc một câu hỏi – một con số chính (Màn 3 con số chính = tỷ lệ khớp tự động) |
| 10 | Màn 4, 5, 6, 9: thanh vòng đời, Mega Sale dạng phép tính, hiệu ứng đổi trạng thái có kiểm soát, harden phím |
| 11 | Màn 8, 10, ScenarioPanel; critique cuối vòng ghi vào docs/ui-audit.md |
| 12 | Sửa xuyên suốt sau ảnh chụp: tên pháp nhân + mã TPP đủ số; ConsentPage dùng chung A1/A2/A4; A2 bên nhận Techcombank; sửa màu ngữ nghĩa sai (Màn 1, 3, 5) + test quét màu; formatter phần trăm bỏ 0 thừa; 140 nghìn đồng; bỏ "Màn X" khỏi giao diện nhân vật; nút không rộng hết trang; chân trang không che nội dung |
| 13 | Màn 1 (tách 2 chỉ số), 2a (bỏ CTTC C), 2c (chữ terminal ≥16px, refresh_token), 2d (màn hoàn tất có kết quả), 3 (bảng không cuộn lồng, StatusBadge, Trước/Sau cạnh con số chính, xử lý "Dưới 1 giờ"), 7 (thẻ, nhật ký, khối "Dữ liệu của tôi") |
| 14 | Màn 4 (chú giải bằng StatusBadge, tổng 100 lên đầu, RU-06 dòng mảnh, nút Đóng Drawer), 5b (một thanh xếp chồng + bảng phép tính + dòng kiểm tra trần), 8 (tiêu đề, lưới, con số chính 85 phơi nhiễm, khối Thấy/Không thấy, cột tiền căn phải) |
| 17 | Màn 4 tái cấu trúc 4 vùng A–D (câu dẫn, sẵn sàng làm tài sản bảo đảm, vì sao tin được, chưa dùng được); vệt vòng đời 4 chấm trong thẻ (LifecycleTrail); màu trạng thái: Đã xác thực = teal viền, Đã tất toán = teal đặc, Đủ điều kiện ứng vốn dùng navy thay violet; phím M đưa RU-M1/M2 vào vùng B; thêm computeMatchRate (98,3%). Ảnh: docs/shots/v17/ |

## 5. Quyết định đã chốt — KHÔNG tự ý đảo

| Quyết định | Lý do |
|---|---|
| Tiền lãi hiển thị "140 nghìn đồng", không "0,14 triệu" | Dễ đọc hơn và giữ thông điệp "rẻ" |
| Không tween (chạy số) khi dư nợ đổi 85 → 38,25 → 0 | Số trung gian nhấp nháy trên màn tài chính dễ bị đọc nhầm |
| Đỏ chỉ dùng cho "đứt gãy" (Màn 9) | Là cú sốc thị giác duy nhất; trần dư nợ vẽ slate nét đứt |
| Thanh doanh thu Màn 1: sàn navy/slate đậm, ngoài sàn slate nhạt | Teal là màu của Tầng 1/tất toán |
| Thẻ sai lệch phí RU-01 (Màn 3) màu trung tính + icon cảnh báo | Amber = tất toán thiếu; RU-01 thực tế đã tất toán |
| Trang Techcombank không dùng đỏ làm màu thương hiệu, dải nhận diện slate-800 | Đỏ đã có nghĩa đứt gãy |
| Khung bankOps phân biệt bằng BỐ CỤC (thanh bên trái), không chỉ màu | Nhận ra từ cuối phòng mà không cần đọc chữ |
| Màn 8: con số chính = tổng phơi nhiễm 85 triệu; "khả dụng còn lại" là chỉ số phụ | Ngày 15/09 khả dụng còn lại = 0, không thể làm con số chính |
| Màn 8 không in câu hỏi "Ngân hàng thấy gì…" làm tiêu đề; trả lời bằng khối Thấy/Không thấy | Công cụ nội bộ thật không hiển thị câu hỏi thiết kế |
| Màn 2a: không có công ty tài chính trong danh sách nguồn AIS; các ngân hàng khác không mờ | CTTC không mở tài khoản thanh toán; demo ở GĐ2 sau mốc TT 64 |
| A2: bên nhận dữ liệu ghi rõ Techcombank | Khớp Màn 8 (ngân hàng truy cập theo A2) và yêu cầu nêu cụ thể bên nhận của Luật 91/2025 |
| ~~Chú giải vòng đời Màn 4 là dãy StatusBadge, không có "bước hiện tại"~~ — ĐẢO ở Vòng 17: mỗi thẻ RU-03/04 có vệt 4 chấm với chấm hiện tại được tô; khối chú giải rời bị bỏ | Người dùng duyệt: vệt trong thẻ cho biết đơn vị đang ở đâu; không còn khối chú giải chung nên không đọc nhầm |
| Vòng đời: Dự phóng slate · Đã xác thực teal viền · Đã khóa violet · Đã tất toán teal đặc; violet chỉ nghĩa "đã khóa" | Bốn bước phải phân biệt bằng mắt; "Đủ điều kiện ứng vốn" dùng navy + icon |
| Màn 4 chỉ hiện % khớp cho RU-01 (98,3%); RU-02 chỉ "35 → 34,6" | 98,9% của RU-02 lệch với điểm chỉ số 97,5% của TikTok Shop, dễ gây hỏi |
| Bật M: RU-M1/M2 thay RU-03/04 ở vùng B (300 triệu), không cộng dồn vào 100 | mockData ghi "thay RU-03, RU-04"; giữ câu dẫn nhất quán với số đang hiển thị |
| Màn 5b: một thanh xếp chồng duy nhất 85 + 8 + 7 = 100, kèm bảng phép tính có đơn vị | Các thanh rời khác tỷ lệ từng gây tràn và khó hiểu |
| Font Be Vietnam Pro tự host | Đủ dấu tiếng Việt, chạy được bản offline |
| Kiểm tra ở cả 1920×1080 và 1536×864 | Laptop Windows 125% chỉ còn 1536×864 khi nối máy chiếu |

## 6. Vòng 15 — Đối chiếu (việc đầu tiên trong Antigravity, CHỈ ĐỌC + CHỤP, không sửa)

Chạy `npm run build` và `npm test`, mở `npm run dev`, chụp TẤT CẢ màn ở 1920×1080 và 1536×864
(gồm các trạng thái: M bật, L bật, 3 bật, Drawer mở, trước/sau từng Space ở Màn 6).
Ghi kết quả vào `docs/doi-chieu-v15.md`: mục | Đạt / Không đạt / Không rõ | bằng chứng (file:dòng hoặc ảnh).

Xuyên suốt:
- [ ] LEGAL_NAME, TPP_CODE không còn "[", "]", "xxx"; có test kiểm tra
- [ ] src/components/StatusBadge.jsx (bản cũ) đã bị xóa, không còn import
- [ ] ConsentPage dùng ở A1, A2, A4; có dải "Bạn đang ở trang của Techcombank"; thanh bước Nền tảng nằm ngoài khung; ô xác nhận mặc định chưa tích; nút đồng ý vô hiệu tới khi tích; nhãn nút không xuống dòng
- [ ] Test quét src/screens chặn class màu ngữ nghĩa rời tồn tại và pass
- [ ] Formatter phần trăm bỏ 0 thừa (76%, 12%/năm); tiền lãi "140 nghìn đồng" ở Màn 5b và Màn 6
- [ ] Không còn "Màn X" trong giao diện nhân vật
- [ ] Nút chính không rộng hết trang; chân trang không che nội dung/nút
- [ ] Khung bank/bankOps không dùng navy cho nút chính

Theo màn:
- [ ] Màn 1: con số 100 đọc được trong 3 giây; hai chỉ số 9 giờ | từ 2%/tháng; thanh doanh thu không dùng teal; không vệt lạ giữa trang; nút kết nối trong màn hình đầu ở 1536×864
- [ ] Màn 2a: không có công ty tài chính; Techcombank nổi bật "Tài khoản nhận tiền sàn của chị Lan"
- [ ] Màn 2c: chữ terminal ≥16px; có scope=AIS, thời hạn 3.600 giây, refresh_token; không còn 2/3 màn trống
- [ ] Màn 2d: không còn thanh bước lồng; hiện kết quả tải/khớp thử; một nút chính
- [ ] Màn 3: 76%; Trước/Sau cạnh con số chính; "Dưới 1 giờ/tháng" đã được xử lý có nguồn (ghi nguồn hoặc đã bỏ); bảng không cuộn lồng, ngoại lệ lên đầu; StatusBadge; tiêu đề "Số tiền (triệu)"
- [ ] Màn 4: chú giải bằng StatusBadge; tổng 100 ở đầu; RU-06 dòng mảnh; nút Đóng Drawer tách khỏi tiêu đề
- [ ] Màn 5b: một thanh xếp chồng; bảng phép tính có đơn vị; dòng "85 ≤ trần 150"; Mega Sale "219 → bị chặn ở trần 150"; không phần tử tràn thẻ; EstimateDisclaimer dưới khối Chi phí
- [ ] Màn 7: tiêu đề thẻ không xuống dòng vì badge; A2 bên nhận Techcombank; nhật ký gọn; khối "Dữ liệu của tôi"
- [ ] Màn 8: thanh bên "Techcombank · Nội bộ — mô phỏng"; tiêu đề "Tra cứu nhà bán — Lan Beauty"; con số chính 85; khối Thấy/Không thấy; cột tiền căn phải; một lưới thẳng; không lộ tên bên khóa

CHƯA TỪNG ĐƯỢC SOÁT BẰNG ẢNH — đánh giá kỹ:
- [ ] Màn 6: mỗi Space đổi đúng một đơn vị; badge chuyển ≤300ms, viền nổi ≤800ms; không tween số; dư nợ 85 → 38,25 → 0; lãi 140 nghìn đồng; trả nợ một chạm trên khung bank
- [ ] Màn 9: đỏ là màu duy nhất gây sốc; RU-03 đứt gãy 24/09; điểm 92 → 58 đặt trước/sau cạnh nhau; dòng "Đóng băng cấp khóa mới"; bước giải trình và trả từ nguồn khác rõ ràng
- [ ] Màn 10: ô chọn bên nhận không tích sẵn, nút tiếp tục vô hiệu tới khi chọn; bảng chào giá căn phải tabular; nhãn chữ "Lãi thấp nhất"; tiền lãi ước tính + dòng "Ước tính…"; bước ký đúng bên được chọn; chứng thư khóa với THỨ TỰ ƯU TIÊN nổi nhất
- [ ] ScenarioPanel: không che nội dung chính ở cả hai kích thước; không dùng màu cam; phím tắt qua KeyHint
- [ ] Harden: bấm M, L, 3, R theo mọi thứ tự, Space quá số sự kiện, lùi/tiến màn — không vỡ trạng thái, không NaN/undefined

## 7. Việc còn lại (theo thứ tự)

1. Vòng 15 — Đối chiếu (mục 6).
2. Vòng 16 — Sửa mọi mục "Không đạt" của Vòng 15, ưu tiên Màn 6, 9, 10, ScenarioPanel.
3. (Dời sang vòng sau; số Vòng 17 đã dùng cho Màn 4) Chế độ trình chiếu: thanh 4 hồi CÓ NHÃN (theo docs/kich-ban.md); ẩn gợi ý phím khi trình chiếu; mọi màn không cần cuộn ở 1536×864 hoặc phần cuộn không chứa nội dung chính; kiểm tra lại toàn bộ phím M/L/3/R/Space.
4. Người dùng — kiểm thử với người lạ; diễn tập 3 phút; luyện 3 thao tác trả lời câu hỏi (M, L, 3).
5. Vòng 18 — Rà soát cuối theo docs/quy-tac.md (câu chữ ngụ ý Nền tảng cho vay/giữ tiền, tên bên khóa, dòng "Ước tính…", cỡ chữ, số viết cứng) + gỡ code/component thừa + critique toàn bộ lần cuối.
6. Vòng 19 — Đóng gói: đường dẫn Vercel bản chính; `npm run build:offline` (kiểm tra font đã nhúng, không có request mạng khi mở file); video dự phòng quay đủ 3 phút.

Việc tồn sau Vòng 17:
- Bấm L (rò rỉ) khi đang ở Màn 6 gọi resetProgress làm sổ khóa rỗng (`locksInitialized` = false), nên Màn 4/8 quay về "Đã xác thực" và không còn số khóa trong khi Màn 6 vẫn hiện "Đã khóa". Không phát sinh ở Vòng 17 (cổng cũ giữ nguyên); nên bật L trước khi vào Màn 5 hoặc sửa settlementState.

## 8. Cập nhật ngược vào bản viết đề án (không phải việc của code, người dùng tự làm)

Từ trước:
- Phần III: chiết khấu xác thực có ngưỡng 90 điểm; trần dư nợ tính trên doanh thu qua sàn; tỷ lệ hoàn Mega Sale 15% cho cả ba chiều.
- Phần giải pháp/lộ trình: bỏ yêu cầu giấy phép TGTT ở GĐ3 cho trả nợ một chạm (Techcombank tự triển khai); "tự tất toán" → "nhà bán trả nợ một chạm trên Techcombank".
- Mục IV tài chính: NPV cơ sở 11,48 tỷ (không phải 11,08); IRR ≈ 35,7%; IRR tích cực ≈ 209%; NPV thận trọng ≈ −18,73; đưa CAPEX phân kỳ 6,5 / 10,5 / 3,0 vào bảng dòng tiền; bỏ bảng P&L toàn ngân hàng.
- Kiểm chứng nguyên văn các văn bản pháp lý đã liệt kê cuối phần pháp lý.

Phát sinh từ các vòng giao diện:
- Bảng consent (Phần III mục 5.1, phần pháp lý 2.4): A2 ghi rõ bên nhận dữ liệu là Techcombank.
- Dùng đúng tên pháp nhân và mã TPP giả định như trong prototype.
- Nếu Vòng 13 đã bỏ "Dưới 1 giờ/tháng", bản viết cũng không được dùng con số này; chỉ dùng số có nguồn (kế hoạch thí điểm: tiết kiệm từ 5 giờ/tháng).

## 9. Ghi chú công cụ

- Superpowers (Claude Code) → thay bằng Planning mode + Implementation Plan + Walkthrough của Antigravity.
- Impeccable: nếu repo có `.claude/skills/impeccable`, liên kết sang `.agents/skills/impeccable` để Antigravity dùng; gọi bằng mô tả ("dùng skill impeccable, chế độ critique/polish/audit"), không có lệnh `/impeccable`.
- Ponytail: luật tối giản đã tóm trong AGENTS.md mục 6; nếu có file luật gốc, đặt vào `.agents/rules/`.
- Browser agent của Antigravity thay cho việc người dùng tự chụp ảnh — luôn đính kèm ảnh 2 kích thước trong walkthrough.
