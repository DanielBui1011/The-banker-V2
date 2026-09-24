# Đặc tả sản phẩm — từ prototype trình chiếu sang app tự dùng (Vòng 19)

Trạng thái: **đã duyệt ở Vòng 20** (quyết định của người dùng ghi ở mục "Quyết định Vòng 20" cuối file).
Lõi logic mục E.1, F, G, D.2, D.3 nằm ở `src/logic/journey.js` (có test); giao diện chưa nối.

Bối cảnh mới: giám khảo tự mở app trên **laptop**, không ai giải thích. App phải tự
dẫn đường, có hướng dẫn tích hợp, màu sắc phong phú hơn và gắn với Techcombank đúng
chỗ, chuyển bước có hiệu ứng nhẹ. Kích thước kiểm tra: 1366×768, 1536×864,
1920×1080. Không làm cho điện thoại.

Giữ nguyên về chức năng: `docs/quy-tac.md`, `docs/du-lieu.md`, `ConsentPage`,
`SurfaceFrame`. `docs/kich-ban.md` không còn quyết định luồng — luồng nay do mục G
(ràng buộc hành động) quyết định.

Tài liệu đi kèm: `docs/hanh-trinh.md` (3 hành trình từng bước), `docs/palette.html`
(xem trước màu), `docs/plans/san-pham-roadmap.md` (Vòng 20–26).

---

## 0. Kết quả đọc code (Vòng 18, nhánh main `bd66ed4`)

### 0.1 Điều hướng hiện tại
- `src/config/flow.js`: thứ tự cố định `[1, 2, 7, 3, 4, 5, 6, 8]`, thêm `10` khi
  bật Giai đoạn 3. Màn 9 không phải màn riêng: `Screen6` thay nội dung bằng
  `Screen9` khi bật rò rỉ.
- `src/state/journeyState.js`: chỉ lưu `position` và `maxPosition` (chỉ số trong
  mảng thứ tự). `hasPassedScreen` được định nghĩa nhưng **không nơi nào dùng**.
- `App.jsx`: một màn tại một thời điểm; "Quyền của tôi" mở dạng lớp phủ (peek)
  bằng `openPeek(fromScreen)`.
- `Stage.jsx`: sân khấu cố định 1920×1080 co giãn theo `min(innerWidth/1920,
  innerHeight/1080)`. Ở 1366×768, hệ số là 0,71 → chữ 16px hiện ra khoảng 11px
  trên màn laptop.

### 0.2 Phím tắt hiện tại
| Phím | Nơi xử lý | Hành vi |
|---|---|---|
| ← / → | `App.jsx` | Lùi/tiến màn theo `flow.js` (tắt khi đang peek) |
| M | `App.jsx` | Bật/tắt Mega Sale, bất kể đang ở màn nào |
| L | `App.jsx` | Bật/tắt rò rỉ; **đặt lại toàn bộ tiến trình tất toán và sổ khóa** |
| 3 | `App.jsx` | Bật/tắt Giai đoạn 3 (thêm/bớt Màn 10 khỏi chuỗi) |
| R | `App.jsx` | Đặt lại mọi state, về Màn 1, tăng `resetSignal` |
| Space | `App.jsx` | Chỉ ở Màn 6: tiến một mốc dòng thời gian |
| ← / → / Space | `Screen2.jsx` | Ở bước 2d: bỏ qua hiệu ứng tải lịch sử (chồng với phím chuyển màn) |
| D | `Screen5.jsx`, `Screen8.jsx` | Mô phỏng gửi lại lệnh khóa (khi đã khóa) |
| F | `Stage.jsx` | Toàn màn hình |
| ? | `Stage.jsx` | Bảng phím tắt |

### 0.3 Trạng thái đang lưu
Không có gì được lưu bền: tải lại trang = mất hết. Bốn nguồn state tách rời:

| Nơi | Trường | Ghi chú |
|---|---|---|
| `scenarioState.jsx` | `megaSale`, `leak`, `phase3`, `panelOpen`, `resetSignal` | Cờ bật/tắt tự do, không có điều kiện |
| `permissionState.jsx` | `a1Status` (not-granted/active/revoked), `a2Revoked`, `a2a4Granted`, `extraLogLines`, `peekReturnScreen`, `reauthRequested` | A2 và A4 chung một cờ `a2a4Granted` |
| `settlementState.jsx` | `stepIndex`, `lockRegistry`, `repaid{}`, `repayModalUnit`, `leakExplainOpen`, `leakRemediated`, `everBroken` | Dư nợ ban đầu là hằng số 85 |
| `journeyState.js` | `position`, `maxPosition` | Chỉ số màn |
| State cục bộ trong màn | Màn 2 `step`, Màn 5 `step`/`submitPhase`, Màn 8 `section`/`timepoint`/`crossExposureOn`, Màn 10 `step`/`recipients`/`selectedQuote` | Mất khi rời màn; Màn 8/10 nghe `resetSignal` |

### 0.4 Trạng thái đang ngầm định theo thứ tự màn
Đây là những chỗ sẽ vỡ khi người dùng tự đi theo thứ tự bất kỳ:

1. **Màn 3 và Màn 4 luôn hiện dữ liệu 01–10/09** dù A1 chưa cấp — ngầm định đã qua Màn 2.
2. **Màn 6 luôn hiện dư nợ 85 và RU-03/RU-04 "Đã khóa"** dù chưa giải ngân — `INITIAL_DEBT`
   là hằng số, `stepIndex = 0` chính là mốc "15/09 giải ngân". Ngầm định đã qua Màn 5.
3. **A2 và A4 cấp cùng lúc** ở bước 5d (`grantA2A4`), không theo từng trang ký. Ngầm định
   người dùng đi hết 5a → 5d trong một lần.
4. **Cấp lại A2 ở Màn 7 không qua trang Techcombank** (`regrantA2` kích hoạt ngay).
5. **Mega Sale lệch số**: Màn 5 ước tính 150 (RU-M1/RU-M2) nhưng `performLocks` luôn khóa
   RU-03/RU-04 = 85 và Màn 6 giải ngân 85. Ngầm định không ai gửi đề nghị khi bật M.
6. **Bấm L xóa sổ khóa** (`resetProgress` khi `leak` đổi) — Màn 4/8 quay về "Đã xác thực"
   trong khi màn khác vẫn coi là đã vay (đã ghi ở `docs/ban-giao.md` mục 7).
7. **Nhật ký truy cập không có khái niệm ngày**: mọi dòng trước 15/09 (kể cả 10/09) hiện
   ngay khi cấp A1; dòng do người dùng tạo lấy giờ thật nhưng ngày cố định 15/09.
8. **Màn 8 có bộ chọn thời điểm riêng** (15/09 / 20/09), độc lập với tiến trình Màn 6;
   `BANK_VIEW` là số tĩnh (luôn khóa 46,75 / 38,25) chứ không đọc sổ khóa; cảnh báo đứt
   gãy hiện ngay khi bật L, chưa cần tới 24/09.
9. **Màn 10 là hộp cát**: ký và chứng thư không ghi vào sổ khóa, không đổi trạng thái
   đơn vị; tắt phím 3 khi đang ở Màn 10 thì kẹp vị trí.
10. **Space chỉ chạy ở Màn 6**; không có khái niệm "ngày mô phỏng" chung cho cả app.

Kết luận: cần **một** trạng thái miền duy nhất có **ngày mô phỏng**, mọi trạng thái đơn
vị/khoản vay/nhật ký **suy ra** từ đó (mục F), và mọi nút đọc điều kiện từ **một** hàm
(mục G).

---

## A. Vai trò

| Vai | Là ai | Thấy gì | Không thấy gì |
|---|---|---|---|
| **Nhà bán — chị Lan** (mặc định) | Chủ shop Lan Beauty, khách hàng Techcombank | App nhà bán; các trang Techcombank mở dạng chuyển hướng | Cổng nội bộ ngân hàng |
| **Cán bộ Techcombank** | Cán bộ tín dụng/thẩm định | Cổng nội bộ: Tra cứu nhà bán, Danh mục khóa, Cảnh báo | App nhà bán; **tên** bên đang khóa (chỉ số lượng, quy-tac mục 5) |

Đổi vai ở bảng điều khiển mô phỏng (mục C). Đổi vai **không** đổi dữ liệu: cả hai vai
nhìn cùng một trạng thái miền tại cùng một ngày mô phỏng.

Người dùng thật của app là giám khảo. Màn chào (mục D) cho họ biết họ đang đóng vai
chị Lan, và có thể đổi vai bất cứ lúc nào.

---

## B. Kiến trúc thông tin

### B.1 App nhà bán (khung `platform`) — 6 trang, thanh điều hướng trái cố định

| Trang | Câu hỏi trang trả lời | Con số chính | Tầng |
|---|---|---|---|
| **Tổng quan** | "Tiền của tôi đang ở đâu, tôi nên làm gì tiếp?" | Tiền đang chờ sàn thanh toán (100 / 300 mùa cao điểm) | — |
| **Đối soát** | "Tiền về đã khớp với đơn chưa?" | Tỷ lệ khớp tự động (76%) | Tầng 1 |
| **Khoản phải thu** | "Khoản nào đủ tin cậy để làm tài sản bảo đảm?" | 2 đơn vị đã xác thực = 100 | Tầng 2 |
| **Ứng vốn** | "Tôi được ứng bao nhiêu, chi phí bao nhiêu?" | Giá trị khả dụng ước tính (85) | Tầng 3 |
| **Khoản vay** | "Còn nợ bao nhiêu, trả khi nào?" | Dư nợ (85 → 38,25 → 0) | Tầng 2 (khóa) |
| **Quyền & dữ liệu** | "Ai được xem dữ liệu của tôi?" | Số quyền đang hiệu lực | — |

Thanh trên cùng app: tên hiển thị (`DISPLAY_NAME` = "Capix", Vòng 19b), dòng chữ "Đối tác: Techcombank",
ngày mô phỏng, nút "?" (hướng dẫn). Chân trang mọi trang: "Giao diện mô phỏng — dữ liệu
giả định".

Trang chưa dùng được **vẫn mở được** và hiện trạng thái trống có hướng dẫn (vd. Đối soát
trước khi kết nối: "Chưa có dữ liệu. Kết nối tài khoản Techcombank để bắt đầu." + nút
dẫn tới bước còn thiếu). Không ẩn mục điều hướng.

### B.2 Trang Techcombank (khung `bank`, mở dạng chuyển hướng)

| Trang | Mở từ | Quay về |
|---|---|---|
| **A1 — Cấp quyền đối soát** | Tổng quan / Quyền & dữ liệu / trạng thái trống bất kỳ | Đối soát (lần đầu) hoặc Quyền & dữ liệu (cấp lại) |
| **A2 — Cấp quyền đánh giá tín dụng** | Ứng vốn / Quyền & dữ liệu (cấp lại) | Ứng vốn hoặc Quyền & dữ liệu |
| **A4 — Ký thỏa thuận chuyển giao quyền đòi nợ** | Ứng vốn, sau khi xem ước tính | Ứng vốn (bước gửi đề nghị) |
| **Trả nợ một chạm** | Khoản vay, khi tiền sàn đã về | Khoản vay |

Cả bốn dùng `ConsentPage` / `SurfaceFrame variant="bank"` hiện có. Mỗi lần vào/ra có
màn chuyển tiếp 700ms (mục L). Thanh bước của app nằm ngoài khung ngân hàng.

Giai đoạn 3: bên cho vay khác (Ngân hàng B, Công ty tài chính C) cũng có trang ký dạng
chuyển hướng, dùng khung `bank` **trung tính** (không mang màu Techcombank, dải "Bạn
đang ở trang của Ngân hàng B").

### B.3 Cổng nội bộ ngân hàng (khung `bankOps`)

| Mục | Nội dung | Nguồn |
|---|---|---|
| **Tra cứu nhà bán** (mặc định) | Hồ sơ Lan Beauty: tổng phơi nhiễm hợp nhất, bảng đơn vị (giá trị khả dụng, đã khóa, **số** bên khóa), khối Thấy/Không thấy, công tắc minh họa phơi nhiễm chéo (T3) | Suy ra từ sổ khóa tại ngày mô phỏng (không còn `BANK_VIEW` tĩnh) |
| **Danh mục khóa** | Các khóa Techcombank đang giữ, thứ tự ưu tiên, chứng thư | Sổ khóa |
| **Cảnh báo** | Đơn vị đứt gãy, thời điểm, chính sách cảnh báo | Chỉ có khi ngày mô phỏng ≥ 24/09 và tình huống Đổi tài khoản bật |

Bộ chọn thời điểm cục bộ của Màn 8 bị bỏ: cổng đọc ngày mô phỏng chung.

---

## C. Bảng điều khiển mô phỏng

Tách hẳn khỏi sản phẩm: nền tối (`slate-900`), chữ "Mô phỏng" ở đầu, gắn cạnh phải
màn hình dạng ngăn kéo thu gọn được, **không** dùng màu Nền tảng hay Techcombank. Khi thu
gọn còn một mấu dọc ghi "Mô phỏng · 15/09/2027".

| Khối | Điều khiển | Lối tắt cũ |
|---|---|---|
| **Vai** | Nhà bán / Cán bộ Techcombank (nút chia đôi) | — |
| **Ngày mô phỏng** | Ngày hiện tại (chỉ đọc) + nút **"Tua tới sự kiện tiếp theo"** kèm tên sự kiện kế tiếp ("→ 19/09: Shopee thanh toán RU-03"). Vô hiệu thì hiện lý do + đường dẫn (mục G). | Space |
| **Tình huống** | Mùa cao điểm · Đổi tài khoản nhận tiền · Giai đoạn 3 — mỗi dòng một công tắc có câu mô tả; công tắc bị khóa hiện lý do. | M · L · 3 |
| **Bắt đầu lại** | Nút viền, có hộp xác nhận ("Xóa toàn bộ tiến trình và quay về 01/08/2027?") | R (cũng qua hộp xác nhận) |
| Phím tắt | Danh sách phím, thu gọn mặc định | — |

Phím tắt cũ giữ làm lối tắt, **cùng điều kiện** với nút trên bảng (phím bị chặn thì
hiện thông báo ngắn nêu lý do, không đổi gì). Mỗi lần phím đổi trạng thái đều hiện
thông báo ngắn ("Đã bật tình huống: Mùa cao điểm") để người dùng laptop bấm nhầm vẫn
biết chuyện gì vừa xảy ra. Mũi tên ← / → không còn chuyển trang (không còn thứ tự
tuyến tính). F giữ nguyên. D giữ cho cổng ngân hàng. ? mở hướng dẫn (mục D).

Tên tình huống mới thay tên cũ trong giao diện: "Mega Sale" → **Mùa cao điểm**; "Rò rỉ"
→ **Đổi tài khoản nhận tiền** (đúng điều xảy ra với chị Lan, không mang tính buộc tội).

---

## D. Hướng dẫn người dùng — 5 lớp

Không dùng thư viện tour. Mọi lớp đọc cùng trạng thái miền (mục F), không có kịch bản
viết cứng theo thứ tự trang.

### D.1 Màn chào (lần đầu, hoặc sau "Bắt đầu lại")
Hộp thoại giữa màn, nền app mờ phía sau:
- **Vai của bạn:** "Bạn là chị Lan, chủ shop mỹ phẩm Lan Beauty, bán trên Shopee,
  TikTok Shop, Facebook và website."
- **Mục tiêu:** "Lúc nào cũng có khoảng 100 triệu tiền hàng nằm ở sàn. Hãy dùng app để
  biến số tiền đó thành tài sản bảo đảm và nhận vốn từ Techcombank — rồi trả nợ khi
  sàn thanh toán."
- **Thời lượng:** "Khoảng 3 phút · 5 nhiệm vụ."
- Hai nút: **"Bắt đầu có hướng dẫn"** (chính) / **"Tự khám phá"** (phụ).
- Dòng nhỏ: "Giao diện mô phỏng — dữ liệu giả định. Bạn có thể đổi sang vai cán bộ
  Techcombank ở bảng Mô phỏng bên phải."

"Có hướng dẫn" = danh sách nhiệm vụ mở + thẻ Bước tiếp theo bật. "Tự khám phá" = danh
sách nhiệm vụ thu gọn, thẻ Bước tiếp theo vẫn bật (chúng là một phần sản phẩm).

### D.2 Danh sách nhiệm vụ
Đặt ở **cuối thanh điều hướng trái** (không nổi đè lên nội dung — Vòng 20), thu gọn được thành
một dòng "Nhiệm vụ 2/5". Tự đánh dấu khi điều
kiện thỏa (suy ra từ state, không phải người dùng tự tích).

| # | Nhiệm vụ | Tự đánh dấu khi |
|---|---|---|
| 1 | Kết nối tài khoản Techcombank | A1 = đang hoạt động (lần đầu) |
| 2 | Tua tới 15/09 và xem khoản phải thu đã xác thực | Ngày ≥ 15/09 **và** đã mở trang Khoản phải thu |
| 3 | Đề nghị ứng vốn và nhận giải ngân từ Techcombank | Khoản vay = đã giải ngân |
| 4 | Trả hết khoản vay khi sàn thanh toán | Dư nợ = 0 |
| 5 | Xem hồ sơ dưới góc nhìn cán bộ Techcombank | Đã mở Tra cứu nhà bán ở vai cán bộ |
| 6 *(tùy chọn)* | Thử tình huống: Đổi tài khoản nhận tiền | Đã thấy RU-03 đứt gãy **và** đã giải trình |
| 7 *(tùy chọn)* | Thử Giai đoạn 3: nhiều bên chào giá | Đã có chứng thư khóa từ luồng chào giá |

Mỗi nhiệm vụ chưa xong có nút "Đi tới" dẫn thẳng tới trang/bước còn thiếu. Thanh tiến
độ chỉ tính 5 nhiệm vụ bắt buộc. Xong cả 5: thẻ kết "Bạn đã đi hết hành trình" + gợi ý
2 nhiệm vụ tùy chọn + "Bắt đầu lại".

Mùa cao điểm không là nhiệm vụ riêng; nó là gợi ý trong thẻ Bước tiếp theo ở trang Ứng
vốn ("Muốn xem mùa cao điểm? Bật ở bảng Mô phỏng").

### D.3 Thẻ "Bước tiếp theo" đầu mỗi trang
Một dải mỏng ngay dưới tiêu đề trang, **một** câu + **một** nút (hoặc chữ "Không cần
làm gì ở trang này"). Nội dung từ một hàm thuần `nextStep(state, page)`. Ví dụ:
- Đối soát, chưa kết nối: "Kết nối tài khoản Techcombank để app đối soát tự động." →
  [Kết nối Techcombank]
- Khoản phải thu, 15/09: "RU-03 và RU-04 đã xác thực. Xem bạn được ứng bao nhiêu." →
  [Đi tới Ứng vốn]
- Khoản vay, 15/09 sau giải ngân: "Khoản vay đang chờ sàn thanh toán. Tua tới 19/09."
  → [Tua tới sự kiện tiếp theo]

### D.4 Chú giải thuật ngữ tại chỗ
Thuật ngữ trong mục H được gạch chân chấm lần đầu xuất hiện trên mỗi trang; di chuột
hoặc Tab tới → bong bóng một câu định nghĩa (phần tử `<button>` + popover, đóng bằng
Esc). Không dùng `title=` (không đọc được bằng bàn phím).

### D.5 Nút "?"
Ở thanh trên cùng app và cổng ngân hàng. Mở ngăn Hướng dẫn gồm: nhắc lại vai + mục tiêu,
danh sách nhiệm vụ, bảng thuật ngữ đầy đủ, bảng phím tắt, nút "Xem lại màn chào".

---

## E. Điểm bắt đầu thời gian — kiểm chứng phương án "01/08 → A1 → tua tới 15/09"

**Kết luận: khớp với `docs/du-lieu.md`, với một điều kiện: từ 01/08 tua thẳng tới 15/09
trong một bước.**

| Kiểm tra | Nguồn | Kết quả |
|---|---|---|
| Ngày kết nối 01/08/2027 | du-lieu mục 2; kich-ban đầu file | Khớp |
| A1 cấp 01/08, hạn 30/10 (90 ngày) | du-lieu mục 8 | Khớp |
| Nhật ký 01/08 09:12 (tài khoản, số dư) và 09:13 (lịch sử 90 ngày lần đầu) | du-lieu mục 9 | Khớp — đây chính là lúc người dùng bấm "Đồng ý" A1 |
| Điểm xác thực cần ≥ 6 lô tất toán | du-lieu mục 4.1 | Shopee 7, TikTok Shop 6, COD 4 lô **tại 15/09** (mục 7) |
| Lịch sử 90 ngày có tạo lô tính điểm không? | du-lieu mục 4.1, 7 | **Không.** Điểm đo "độ sát dự phóng": cần dự phóng lập *trước* khi tiền về, mà dự phóng chỉ có sau khi kết nối. Nếu lịch sử 90 ngày được tính lô thì COD đã có hơn 4 lô. Vậy 01/08 bắt đầu với 0 lô, "Chưa đủ lịch sử" ở mọi kênh — đúng tinh thần "phải chờ". |
| 45 ngày (01/08–15/09) đủ ra 7/6/4 lô không? | suy luận | Hợp lý: Shopee khoảng 6 ngày/lô, TikTok Shop khoảng 7–8 ngày/lô, COD khoảng 11 ngày/lô |
| Giao dịch chi tiết | du-lieu mục 5 | Chỉ có 01–10/09. **Không có dữ liệu cho 02/08–31/08** |
| Các mốc sau 15/09 | du-lieu mục 9, 10 | 15/09 10:02–10:05 (A2, A4), 19/09, 20/09; rò rỉ thêm 21/09, 24/09 |

Hệ quả thiết kế:
1. **Không dừng giữa 01/08 và 15/09.** Không có số liệu cho ngày nào ở giữa (kể cả 10/09:
   có dòng nhật ký nhưng không có số lô tại ngày đó). Tua từ 01/08 nhảy thẳng tới 15/09,
   kèm thẻ tóm tắt "6 tuần sau: Shopee 7 lô, TikTok Shop 6 lô, Hãng vận chuyển A 4 lô;
   25 giao dịch 01–10/09 đã đối soát."
2. **Trang ở ngày 01/08 sau khi cấp A1** chỉ hiện dữ liệu hồ sơ (4 kênh, doanh thu tháng,
   100 triệu đang ở sàn, 9 giờ đối soát thủ công) và số lô 0/6. Đối soát và Khoản phải
   thu là trạng thái trống "Đang tích lũy lịch sử — cần 6 lô tất toán mỗi kênh" + nút tua.
3. **Giờ trong nhật ký lấy từ du-lieu mục 9**, không lấy giờ thật (sửa điểm 0.4.7). Hành
   động phát sinh ngoài bảng (rút/cấp lại quyền) đóng dấu ngày mô phỏng + giờ kế tiếp sau
   dòng cuối cùng trong ngày.
4. **"Hôm nay 15/09/2027" của du-lieu mục 1** vẫn đúng: đó là ngày app dừng lại chờ chị
   Lan đề nghị ứng vốn. Không cần sửa `du-lieu.md`.

Phương án dự phòng (nếu nhóm thấy bước 01/08 thừa): bắt đầu ở 15/09 với A1 đã cấp —
mất trải nghiệm tự cấp quyền A1, nên **không đề xuất**.

### E.1 Chuỗi sự kiện cho "Tua tới sự kiện tiếp theo"

| # | Ngày | Sự kiện (bình thường) | Sự kiện (Đổi tài khoản nhận tiền) | Điều kiện để tua **tới** sự kiện này |
|---|---|---|---|---|
| E0 | 01/08/2027 | Bắt đầu — chưa kết nối | như bên trái | — |
| E1 | 15/09/2027 | 6 tuần đối soát; RU-01, RU-02 đã tất toán; RU-03, RU-04 đã xác thực | như bên trái | A1 đang hoạt động |
| E2 | 19/09/2027 | Shopee thanh toán RU-03: 54,6 về tài khoản Techcombank | Không có khoản Shopee nào về tài khoản Techcombank | A1 đang hoạt động **và** khoản vay đã giải ngân |
| E3 | 20/09/2027 | TikTok Shop thanh toán RU-04: 44,7 | như bên trái; dư nợ còn 46,75 sau khi trả RU-04 | A1 đang hoạt động |
| E4 | 21/09/2027 | — (hết sự kiện) | Hết cửa sổ thanh toán RU-03 | chỉ trong tình huống |
| E5 | 24/09/2027 | — | Hết 3 ngày ân hạn → RU-03 **Đứt gãy**; cảnh báo tới Techcombank; đóng băng cấp vốn mới; yêu cầu xác nhận tài khoản nhận tiền | chỉ trong tình huống |

Khoản vay tất toán **không** là sự kiện tua: nó xảy ra khi người dùng trả phần cuối
(trả nợ là hành động của chị Lan trên trang Techcombank, quy-tac mục 2).

Ghi chú dữ liệu (đã chốt Vòng 20): sau tất toán app hiện "Đã cập nhật sau lô tất toán",
**không** kèm điểm mới (du-lieu mục 10).

---

## F. Mô hình trạng thái miền

Một reducer duy nhất thay 4 context hiện tại. **Chỉ lưu dữ kiện gốc; mọi thứ khác suy ra
bằng hàm thuần** (đặt ở `src/logic/journey.js`, có test Vitest). Lưu `localStorage`,
mọi đọc/ghi bọc `try/catch`; hỏng hoặc thiếu → trạng thái khởi đầu.

```js
// Lưu bền — khóa localStorage: 'capix-app-v1'
{
  version: 1,
  role: 'seller' | 'officer',
  eventIndex: 0,                  // chỉ số trong chuỗi E0..E5 (mục E.1) → ngày mô phỏng
  scenario: { peakSeason: false, accountChange: false, phase3: false },
  consents: {
    A1: 'none' | 'active' | 'revoked',
    A2: 'none' | 'active' | 'revoked',
    A4: 'none' | 'signed',        // 'terminated' suy ra khi dư nợ = 0
  },
  application: {                  // đề nghị ứng vốn đang làm
    estimateViewed: false,
    quoteRequest: null | { recipients: ['Techcombank', ...] },   // chỉ Giai đoạn 3
    chosenLender: null | 'Techcombank' | 'Ngân hàng B' | 'Công ty tài chính C',
    submitted: false,
  },
  registry: [/* sự kiện lockUnit() — giữ nguyên src/logic/registry.js */],
  repaid: { 'RU-03': false, 'RU-04': false },
  accountChangeResolved: false,   // đã giải trình + trả từ nguồn khác
  userLog: [/* dòng nhật ký do người dùng tạo: { eventIndex, seq, actor, purpose, data } */],
  visited: { /* 'seller:khoan-phai-thu': 1, 'officer:tra-cuu': 3 — eventIndex của lần mở gần nhất */ },
  guide: { welcomeDone: false, mode: 'guided' | 'free', checklistOpen: true },
}
```

Không lưu: trang hiện tại (nằm ở URL hash, xem dưới), hộp thoại đang mở, bước con của
một trang Techcombank đang dở (mở lại thì làm lại từ đầu trang ký — đúng tinh thần
"không tích sẵn").

**Suy ra (selector thuần):**

| Selector | Từ đâu |
|---|---|
| `simDate(state)` | `eventIndex` + `scenario.accountChange` → ngày của sự kiện (mục E.1) |
| `unitStatus(state, code)` | ngày + `registry` + `repaid` + tình huống → Dự phóng / Chưa đủ lịch sử / Đã xác thực / Đã khóa / Đã tất toán / Đứt gãy / Đã hoàn. RU-03 giữ "Đứt gãy" trong lịch sử dù đã giải trình (như hiện tại). |
| `activeUnits(state)` | Mùa cao điểm → RU-M1/RU-M2, ngược lại RU-03/RU-04 (du-lieu mục 6) |
| `loan(state)` | `registry` + `repaid` → `none / disbursed / repaid`, bên cho vay, dư nợ (tính bằng `computeAvailableValue`, không hằng số) |
| `fundingFrozen(state)` | ngày ≥ 24/09 + Đổi tài khoản + chưa giải trình |
| `accessLog(state)` | dòng du-lieu mục 9 có ngày ≤ `simDate` **và** có hành động tương ứng đã xảy ra, + `userLog` |
| `bankView(state)` | `registry` tại `simDate` → khả dụng, đã khóa, số bên khóa (thay `BANK_VIEW` tĩnh) |
| `tasks(state)` | mục D.2 |
| `availability(state, action)` | mục G |
| `nextStep(state, page)` | mục D.3 |

**Điều hướng**: URL hash (`#/nha-ban/ung-von`, `#/techcombank/a2`, `#/ngan-hang/tra-cuu`)
— tải lại trang giữ đúng chỗ, nút Back của trình duyệt dùng được, không cần thư viện
router. Hash trỏ tới trang không hợp lệ với vai hiện tại → về trang mặc định của vai.

**Di trú**: `version` khác → bỏ dữ liệu cũ, về trạng thái khởi đầu (không viết code di
trú cho bản mô phỏng).

---

## G. Ràng buộc luồng

Nguyên tắc: nút không đủ điều kiện **vẫn hiện**, bị vô hiệu, dưới nút có **một dòng lý
do** và **một đường dẫn** tới bước còn thiếu. Không có trạng thái nào mà không còn hành
động hợp lệ: tệ nhất vẫn còn "Bắt đầu lại", "Đổi vai" và nút "?". Mọi điều kiện đọc từ
một hàm `availability(state, action)` → `{ ok, reason, fix: { label, href } }`, dùng
chung cho nút, phím tắt và thẻ Bước tiếp theo.

### G.1 Nhà bán

| Hành động | Điều kiện | Lý do khi vô hiệu → đường dẫn |
|---|---|---|
| Kết nối Techcombank (A1) | A1 ≠ đang hoạt động | (luôn bấm được khi hiện) |
| Xem dữ liệu Đối soát | A1 từng được cấp **và** ngày ≥ 15/09 | "Chưa kết nối" → Kết nối Techcombank · "Đang tích lũy lịch sử" → Tua tới 15/09 |
| Mở Ứng vốn | Có ≥ 1 đơn vị Đã xác thực (ngày ≥ 15/09) | "Chưa có khoản phải thu đã xác thực" → Tua tới 15/09 (hoặc Kết nối, nếu chưa) |
| Cấp A2 | A1 đang hoạt động; A2 ≠ đang hoạt động | "Cần quyền đối soát A1 đang hoạt động" → Cấp lại A1 |
| Xem ước tính | A2 đang hoạt động | "Cần quyền đánh giá tín dụng A2" → Cấp A2 trên trang Techcombank |
| Ký A4 | Đã xem ước tính; chưa có khoản vay đang hoạt động; **Mùa cao điểm tắt**; không bị đóng băng | "Mô phỏng mùa cao điểm chỉ minh họa ước tính; chưa có dữ liệu khoản vay mùa cao điểm" → Tắt Mùa cao điểm (mở bảng Mô phỏng) · "Cấp vốn mới đang tạm dừng" → Giải trình ở Khoản vay |
| Gửi đề nghị tới Techcombank | A4 đã ký; A2 đang hoạt động | "Cần ký thỏa thuận A4" → Ký A4 · "A2 đã bị rút" → Cấp lại A2 |
| Trả nợ một chạm (RU-03 / RU-04) | Tiền sàn của đơn vị đó đã về (E2 / E3, tình huống bình thường cho RU-03); chưa trả | "Shopee chưa thanh toán RU-03 (cửa sổ 18–21/09)" → Tua tới sự kiện tiếp theo |
| Giải trình "Tôi đã đổi tài khoản" | RU-03 Đứt gãy; chưa giải trình | (chỉ hiện khi đủ điều kiện) |
| Rút A1 | A1 đang hoạt động | — (hộp xác nhận nêu hệ quả: dừng đồng bộ, không tua tiếp được) |
| Rút A2 | A2 đang hoạt động | — (hệ quả: không gửi đề nghị mới; ngân hàng không xem hồ sơ; khoản vay hiện có không đổi) |
| Rút A4 | Không bao giờ khi dư nợ > 0 | "Không rút được khi còn dư nợ — thỏa thuận chấm dứt khi khoản vay tất toán" (quy-tac mục 3) |
| Xuất hồ sơ doanh thu đã xác thực | A1 từng được cấp, ngày ≥ 15/09 | "Chưa có doanh thu đã xác thực" → Tua tới 15/09 |

### G.2 Cán bộ Techcombank

| Hành động | Điều kiện | Lý do → đường dẫn |
|---|---|---|
| Xem hồ sơ trong Tra cứu | A2 đang hoạt động | "Nhà bán chưa cấp (hoặc đã rút) quyền A2 — ngân hàng không xem được hồ sơ" → Đổi sang vai Nhà bán |
| Xem chứng thư khóa | Có khóa trong sổ | "Chưa có khóa nào" → (thông tin, không nút) |
| Gửi lại lệnh khóa (phím D) | Có khóa trong sổ | thông báo ngắn "Chưa có khóa để gửi lại" |
| Minh họa phơi nhiễm chéo (T3) | A2 đang hoạt động | như dòng đầu |

### G.3 Bảng điều khiển mô phỏng

| Điều khiển | Điều kiện | Lý do khi khóa → đường dẫn |
|---|---|---|
| Tua tới sự kiện tiếp theo | Điều kiện cột cuối mục E.1; còn sự kiện | "Cần kết nối A1" → Kết nối · "Mô phỏng dừng ở 15/09 tới khi bạn nhận giải ngân" → Đi tới Ứng vốn · "Không còn sự kiện" → Bắt đầu lại / Đổi vai |
| Mùa cao điểm | Chưa có khoản vay (A4 chưa ký) | "Đã có khoản vay kỳ thường" → Bắt đầu lại |
| Đổi tài khoản nhận tiền | Ngày < 19/09 (chưa qua E2) | "Sự kiện 19/09 đã diễn ra" → Bắt đầu lại |
| Giai đoạn 3 | Chưa có khoản vay | "Đã có khoản vay với Techcombank" → Bắt đầu lại |
| Đổi vai | Luôn | — |
| Bắt đầu lại | Luôn (hộp xác nhận) | — |

Quyết định đi kèm:
- **Tua qua 15/09 cần có giải ngân.** Không có dữ liệu cho nhánh "không vay" sau 15/09;
  cho phép tua sẽ tạo trạng thái không có số liệu. Đường dẫn trong lý do đưa thẳng tới
  Ứng vốn, nên không phải ngõ cụt.
- **Mùa cao điểm là chế độ "xem ước tính"**, không tạo khoản vay: du-lieu không có số
  khóa từng đơn vị khi bị chặn ở trần 150, cũng không có dòng thời gian tất toán mùa cao
  điểm. Sửa luôn điểm 0.4.5 (hiện tại ước tính 150 mà giải ngân 85).
- **Giai đoạn 3 thay luồng Ứng vốn**: A2 → chọn bên nhận yêu cầu → 3 chào giá → chọn →
  ký A4 trên trang bên được chọn → ghi sổ khóa → chứng thư. Chọn **Techcombank**: khoản vay
  đi tiếp y như Giai đoạn 2 (cùng 85 triệu, 12%/năm). Chọn **Ngân hàng B** (cùng 85 triệu
  nên khóa theo đúng T1: 46,75 + 38,25): dừng ở chứng thư khóa, thẻ kết nêu "Dòng tất toán
  trong mô phỏng chỉ dựng cho Techcombank" + [Chọn lại chào giá] + [Bắt đầu lại]. Chọn
  **Công ty tài chính C** (80 triệu): khóa theo tỷ lệ giá trị khả dụng (du-lieu mục 12) —
  RU-03 = 80 × 46,75 / 85 = 44; RU-04 = 80 × 38,25 / 85 = 36; dừng ở chứng thư như Ngân hàng B.
  Chứng thư mọi bên dùng chung mã `LOCK-2027-0915-00318` (Vòng 20). "Chọn lại chào giá" sau
  khi đã ký với B/C gỡ khóa mô phỏng khỏi sổ (tua ngược của mô phỏng, không phải thao tác sổ
  thật).
- **Tua cần A1 đang hoạt động**: rút A1 thì Nền tảng không còn dữ liệu để cập nhật; đường
  dẫn "Cấp lại A1" mở trang Techcombank A1.
- **Bấm Đổi tài khoản nhận tiền không còn xóa sổ khóa** (sửa điểm 0.4.6): tình huống chỉ
  đổi nhánh sự kiện từ E2 trở đi.

---

## H. Thuật ngữ

| Thuật ngữ | Định nghĩa một câu |
|---|---|
| Đối soát | Khớp từng khoản tiền về tài khoản ngân hàng với đơn hàng hoặc lô thanh toán của sàn. |
| Ngoại lệ | Khoản tiền về không tự khớp được với đơn nào, cần chị Lan tra tay. |
| Sai lệch phí | Chênh lệch giữa tiền sàn dự kiến trả và tiền thực nhận; cảnh báo khi quá 1,5%. |
| Khoản phải thu | Tiền sàn còn nợ chị Lan cho những đơn đã giao xong. |
| Đơn vị khoản phải thu | Một nhóm khoản phải thu cùng kênh và cùng cửa sổ thanh toán, được theo dõi như một tài sản (vd. RU-03). |
| Giá trị ròng dự phóng | Số tiền dự kiến sàn sẽ trả cho một đơn vị, sau phí và hoàn. |
| Cửa sổ thanh toán | Khoảng ngày sàn dự kiến trả tiền cho một đơn vị. |
| Lô tất toán | Một lần sàn trả tiền cho một đơn vị và tiền đó đã về tài khoản. |
| Điểm xác thực | Điểm 0–100 đo mức dự phóng khớp với tiền thật về tài khoản; chỉ tính khi có từ 6 lô. |
| Dự phóng | Trạng thái đơn vị mới được ước tính, chưa đủ căn cứ để tin. |
| Chưa đủ lịch sử | Kênh có dưới 6 lô tất toán nên chưa có điểm xác thực. |
| Đã xác thực | Đơn vị thuộc kênh có điểm xác thực, đủ điều kiện làm tài sản bảo đảm. |
| Đã khóa | Đơn vị đang làm tài sản bảo đảm cho một khoản vay, được ghi trong sổ đăng ký. |
| Đã tất toán | Tiền sàn của đơn vị đã về và phần nợ gắn với đơn vị đã được trả. |
| Tất toán thiếu | Tiền về ít hơn phần nợ gắn với đơn vị. |
| Đứt gãy | Hết cửa sổ thanh toán và thời gian ân hạn mà tiền không về tài khoản nhận tiền đã đăng ký. |
| Tài khoản nhận tiền | Tài khoản Techcombank chị Lan đăng ký để sàn chuyển tiền hàng về. |
| Ân hạn | Số ngày chờ thêm sau cửa sổ thanh toán trước khi coi là đứt gãy (3 ngày). |
| Tỷ lệ hoàn gia quyền | Tỷ lệ hàng bị trả lại, gộp từ lịch sử của nhà bán, của kênh và theo mùa. |
| Biên an toàn | Phần giữ lại để phòng rủi ro (7% kỳ thường, 12% mùa cao điểm). |
| Chiết khấu xác thực | Phần trừ thêm khi điểm xác thực dưới 90. |
| Tỷ lệ ứng | Phần trăm giá trị đơn vị có thể dùng để vay sau khi trừ hoàn, biên an toàn và chiết khấu. |
| Giá trị khả dụng | Số tiền tối đa có thể vay dựa trên các đơn vị đã xác thực, sau khi áp trần và trừ phần đã bị khóa. |
| Trần dư nợ | Mức dư nợ tối đa: một nửa doanh thu qua sàn bình quân 3 tháng. |
| Sổ đăng ký khoản phải thu | Sổ dùng chung ghi đơn vị nào đã bị khóa, bởi bao nhiêu bên, theo thứ tự nào. |
| Chứng thư khóa | Bản ghi có ký số xác nhận một lần khóa đơn vị; ai cũng kiểm chứng độc lập được. |
| Thứ tự ưu tiên | Thứ tự các bên được thu tiền từ một đơn vị khi có nhiều bên cùng khóa. |
| Phơi nhiễm hợp nhất | Tổng số tiền mọi bên cho vay đang khóa trên khoản phải thu của một nhà bán. |
| Quyền A1 | Quyền cho Nền tảng đọc giao dịch tài khoản để đối soát. |
| Quyền A2 | Quyền cho Nền tảng chia sẻ hồ sơ doanh thu đã xác thực với Techcombank để đánh giá tín dụng. |
| Quyền A3 | Ủy quyền trích nợ — điều khoản trong hợp đồng tín dụng với Techcombank. |
| Thỏa thuận A4 | Thỏa thuận chuyển giao quyền đòi nợ với Techcombank, đăng ký theo Nghị định 99/2022. |
| TPP | Bên thứ ba được ngân hàng cấp quyền truy cập dữ liệu qua Open API. |
| Tầng 1 / 2 / 3 | Doanh thu đã xác thực / Sổ đăng ký khoản phải thu / Giao thức cấp vốn mở. |
| Mùa cao điểm | Đợt sale lớn, doanh thu sàn gấp 3 nên tỷ lệ hoàn và biên an toàn cao hơn. |
| Giai đoạn 3 | Giai đoạn nhiều bên cho vay cùng chào giá trên một sổ đăng ký. |
| Ký số JWS | Chữ ký số chuẩn mở gắn vào chứng thư, kiểm chứng được mà không cần hỏi Nền tảng. |

---

## I. Ánh xạ Màn 1–10 → trang mới

| Màn cũ | Quyết định | Trang mới | Ghi chú |
|---|---|---|---|
| 1 — Trạng thái hiện tại | **Gộp** | Tổng quan (trạng thái 01/08, trước/sau kết nối) | Giữ 4 kênh, 100 triệu ở sàn, 9 giờ, vay từ 2%/tháng. **Bỏ** bảng Excel động (hiệu ứng trình diễn). |
| 2a — Chọn ngân hàng | **Gộp** | Tổng quan → hộp chọn ngân hàng (hoặc Quyền & dữ liệu) | Giữ danh sách AIS (không CTTC). |
| 2b — Trang A1 Techcombank | **Giữ** | Trang Techcombank A1 (`ConsentPage`) | Không đổi chức năng. |
| 2c — Terminal OAuth | **Bỏ khỏi luồng chính** | Liên kết "Xem hậu trường kỹ thuật" trong Quyền & dữ liệu (khung `tech`) | Người dùng tự thao tác không cần chờ 5 giây terminal. |
| 2d — Tải lịch sử | **Gộp** | Màn chuyển tiếp "Quay về …" + trạng thái trống Đối soát | |
| 3 — Đối soát | **Giữ** | Đối soát | Chỉ có dữ liệu từ 15/09. |
| 4 — Khoản phải thu | **Giữ** | Khoản phải thu | Vùng A–D giữ; vệt vòng đời đọc `unitStatus`. |
| 5a — A2 | **Giữ** | Trang Techcombank A2 | A2 cấp riêng, không chung cờ với A4. |
| 5b — Ước tính | **Giữ** | Ứng vốn | Bảng tính từng dòng + "Ước tính, chưa phải đề nghị cấp tín dụng". |
| 5c — A4 | **Giữ** | Trang Techcombank A4 | |
| 5d — Gửi đề nghị | **Gộp** | Ứng vốn (bước cuối) → Khoản vay | Trạng thái chờ "Techcombank đang thẩm định" giữ 1,2 giây — là trạng thái giao diện (có chữ), không phải hiệu ứng, nên không tính vào trần 400ms; `prefers-reduced-motion` không rút ngắn vì nó mang nội dung. |
| 6 — Tất toán | **Gộp** | Khoản vay | Dòng thời gian theo ngày mô phỏng; Space → "Tua tới". |
| 6 — Trả nợ trên Techcombank | **Giữ** | Trang Techcombank Trả nợ một chạm | |
| 7 — Quyền riêng tư | **Giữ** | Quyền & dữ liệu | Không còn lớp phủ peek; là trang thường. |
| 8 — Góc nhìn ngân hàng | **Giữ** | Cổng nội bộ (3 mục) | **Bỏ** bộ chọn thời điểm; `BANK_VIEW` tĩnh → `bankView(state)`. Nút "Tiếp: Giai đoạn 3" bỏ. |
| 9 — Rò rỉ | **Bỏ màn** | Trạng thái của Khoản vay + Khoản phải thu + Cảnh báo khi bật "Đổi tài khoản nhận tiền" | |
| 10 — Giai đoạn 3 | **Gộp** | Ứng vốn ở chế độ Giai đoạn 3 + trang ký của bên được chọn | Ghi sổ khóa thật (sửa điểm 0.4.9). |

---

## J. Thứ bị bỏ

| Bỏ | Lý do | Thay bằng |
|---|---|---|
| Điều hướng tuyến tính (`src/config/flow.js`, `journeyState.js`, mũi tên ← / →) | Người dùng tự khám phá theo thứ tự bất kỳ | Thanh điều hướng trái + URL hash + mục G |
| `ActProgress` (thanh 4 hồi) | Hồi là cấu trúc kịch bản, không phải cấu trúc sản phẩm | Danh sách nhiệm vụ (D.2) |
| Nhãn "Màn X" ở `TopBar`, `KeyHint`, ScenarioPanel | Không còn màn | Tên trang |
| Nhãn "Giai đoạn 2" trong giao diện sản phẩm | Nhà bán không quan tâm giai đoạn triển khai | Chỉ còn công tắc "Giai đoạn 3" trong bảng Mô phỏng |
| `Stage` co giãn 1920×1080 | Ở laptop chữ 16px thành 11px | Bố cục đáp ứng theo px thật, rộng tối thiểu 1280 (mục K.5) |
| Lớp phủ "Quyền của tôi" (peek) | Quyền & dữ liệu là trang thường | Liên kết điều hướng |
| `resetSignal` | State cục bộ không còn giữ tiến trình | Reducer chung + "Bắt đầu lại" |
| Hiệu ứng Excel Màn 1, terminal Màn 2c trong luồng chính | Là hiệu ứng trình diễn | (2c chuyển thành liên kết tùy chọn) |
| Hằng `BANK_VIEW`, `INITIAL_DEBT` dùng như trạng thái | Sai khi đi khác thứ tự | Selector (mục F) |

`docs/kich-ban.md` giữ trong repo làm tư liệu, không còn là nguồn quyết định.

---

## K. Hệ màu

Xem trực quan: `docs/palette.html` (mở bằng trình duyệt, không cần mạng). Tỷ lệ tương phản
trên trang đó do script **đo** từ màu tính toán, không gõ tay.

### K.0 Xung đột với quy-tac mục 7 — **đã giải quyết ở Vòng 20**
Người dùng chọn **Hướng B cho cả 4 mẫu** trong `palette.html` (thẻ Tổng quan, đầu trang A1,
dãy StatusBadge, nút) và sửa quy-tac mục 7: khung trang Techcombank được dùng màu xấp xỉ
(thanh đen, vạch đỏ 4px, vàng kim) theo K.2–K.3, luôn kèm chữ "Mô phỏng"; bên cho vay khác
dùng khung trung tính. Đoạn dưới giữ làm lịch sử.

Nội dung cũ (lịch sử):
`docs/quy-tac.md` mục 7 viết: "Không dùng logo, bộ nhận diện **hay màu thương hiệu riêng**
của các đơn vị này." Cả hai hướng dưới đây đều dùng màu Techcombank (dù xấp xỉ) → **trái
mục 7 nguyên văn**. Vòng 19 dựng cả hai theo yêu cầu, nhưng **không áp vào `src/` cho tới
khi quy-tac mục 7 được sửa** (đề xuất câu chữ ở walkthrough/PR). Nếu nhóm quyết giữ nguyên
mục 7: dùng Hướng B cho app, còn khung Techcombank giữ `slate-800` như hiện tại — Hướng B
vẫn đứng được vì phần nhận diện riêng của app không phụ thuộc màu Techcombank.

### K.1 Hướng A — app nhà bán mang màu Techcombank (đen/đỏ/trắng)
- Nền `#F5F5F5`, thẻ trắng, chữ `#111111`, chữ phụ `#4B4B4B`; thanh trên đen `#141414`
  + vạch đỏ `#E3262B`; nút chính đen.
- **Không đề xuất.** App và trang Techcombank trùng nhận diện (thanh đen + vạch đỏ ở cả
  hai) → người xem không phân biệt Nền tảng với ngân hàng, trái quy-tac mục 2 ("Nền tảng
  chỉ là hạ tầng") và mục 3 ("giao diện tách biệt hẳn với Nền tảng"). Ngoài ra đặt thương
  hiệu ngân hàng lên toàn app làm tăng rủi ro mục 7.

### K.2 Hướng B — app có nhận diện riêng (**đã chọn, Vòng 20**)
App nhà bán:
| Vai trò | Màu | Tương phản đo được |
|---|---|---|
| Nền trang (trắng ngà ấm) | `#FBF8F2` | — |
| Thẻ | `#FFFFFF`, viền `#E4DED2` | — |
| Chữ chính | `#1A1D24` | 15,91:1 trên nền ngà |
| Chữ phụ | `#545B69` | 6,44:1 trên nền ngà |
| Màu chính — cobalt (nút chính, liên kết, trang đang chọn) | `#1E47C8` | chữ trắng trên cobalt 7,53:1; cobalt trên ngà 7,10:1 |
| Nền nhấn cobalt nhạt (nhãn trang) | `#EEF2FC` | cobalt trên nền này 6,72:1 |
| Nút vô hiệu | nền `#ECE8E0`, chữ `#545B69` | 5,58:1 |
| Tầng 1 — Đối soát | nền `#E6F4F1`, chữ `#0F766E` | 4,84:1 |
| Tầng 2 — Khoản phải thu, Khoản vay | nền `#F1ECFD`, chữ `#6D28D9` | 6,14:1 |
| Tầng 3 — Ứng vốn | nền `#FFF1E6`, chữ `#9A3412` | 6,60:1 |
| Dòng "Đối tác: Techcombank" | chữ thường, màu chữ chính | 16,87:1 trên trắng |

"Tầng tô màu rõ hơn": mỗi trang thuộc một tầng mang **nền nhạt** của tầng đó ở dải tiêu đề
trang và ở mục đang chọn trên thanh điều hướng. Nền tầng **không** dùng cho thẻ đơn vị
(tránh đọc nhầm "trang tím = mọi đơn vị đã khóa"); trạng thái vẫn chỉ qua `StatusBadge`.
Cam Tầng 3 chỉ là nền trang/nhãn tầng; hổ phách "Tất toán thiếu" chỉ ở badge có icon.

Trang Techcombank (xấp xỉ, ghi "Mô phỏng" trên thanh):
| Vai trò | Màu | Tương phản |
|---|---|---|
| Thanh trên (chữ "Techcombank", không logo) | nền `#141414`, chữ `#F4F1EA` | 16,33:1 |
| Chữ "Mô phỏng" trên thanh | `#B8BEC9` | 9,87:1 |
| Vạch đỏ thương hiệu dưới thanh (4px, không mang chữ) | `#E3262B` | không áp (không phải chữ) |
| Điểm nhấn vàng kim (vạch 48×3px trên tiêu đề; chữ "Techcombank" trong dải "Bạn đang ở trang của…") | `#D4AF37` | 8,76:1 trên đen; **không** dùng làm chữ trên nền trắng |
| Nút chính | nền `#141414`, chữ trắng | 18,42:1 |
| Nút phụ | viền + chữ `#141414` trên trắng | 18,42:1 |

### K.3 Luật cho mọi hướng
1. Đỏ thương hiệu Techcombank (`#E3262B`) chỉ xuất hiện ở **vạch khung** trang Techcombank.
   Không mang chữ, không tô số liệu, không tô trạng thái, không làm nút.
2. **Đứt gãy giữ đỏ, dạng badge nền đặc** `#B91C1C` + chữ trắng (6,47:1) + icon X, chữ
   đậm. Khác vạch thương hiệu cả về hình dạng (badge vs vạch), độ đậm và sắc (tối hơn).
3. Mọi cặp chữ/nền ≥ 4,5:1 (kể cả nút vô hiệu). Cặp thấp nhất trên `palette.html`:
   teal `#0F766E` trên `#E6F4F1` = 4,84:1.
4. Ý nghĩa màu trạng thái giữ nguyên (quy-tac, `src/ui/status.js`): Dự phóng xám · Đã
   xác thực teal viền · Đã khóa violet · Đã tất toán teal đặc · Tất toán thiếu hổ phách ·
   Đứt gãy đỏ đặc. Luôn có icon + chữ.
5. Màu Techcombank là xấp xỉ, luôn kèm chữ "Mô phỏng" trên thanh. Tên thương hiệu chỉ dạng
   chữ, không logo, không dựng lại kiểu chữ của Techcombank.
6. Bên cho vay khác (Giai đoạn 3) dùng khung `bank` trung tính, không mượn màu thật của
   bất kỳ ngân hàng nào.
7. Cổng nội bộ ngân hàng (`bankOps`) **không** mang đỏ/vàng kim: đó là công cụ nội bộ,
   phân biệt bằng bố cục thanh bên trái (giữ quyết định Vòng 8). Điểm nhấn: thanh bên
   `#141414` thay `slate-700` để nhận ra là "phía Techcombank" — **đã duyệt Vòng 20**.

### K.4 Token đề xuất (Vòng 21 đưa vào `tailwind.config.js` + `src/index.css`)
`--color-app-bg`, `--color-app-surface`, `--color-ink`, `--color-ink-muted`,
`--color-line`, `--color-primary`, `--color-primary-soft`, `--color-tier1-bg/fg`,
`--color-tier2-bg/fg`, `--color-tier3-bg/fg`, `--color-tcb-bar`, `--color-tcb-on-bar`,
`--color-tcb-stripe`, `--color-tcb-gold`. `navy` hiện có đổi thành bí danh của
`--color-primary` để các màn cũ không vỡ trong lúc chuyển.

### K.5 Chữ và bố cục cho laptop
Bỏ co giãn sân khấu (mục J). Bố cục theo px thật, rộng tối thiểu 1280, không cuộn ngang
ở 1366×768. Thang chữ: nhãn 16px (sàn, giữ), thân 18px, nhấn 20px, tiêu đề trang 28px,
con số chính 48px. 1920×1080: nội dung giới hạn rộng 1440px, căn giữa. Nội dung chính mỗi
trang nằm trong màn hình đầu ở 1366×768.

---

## L. Chuyển động (thay ràng buộc chuyển động cũ)

Thay `DESIGN.md` ràng buộc khóa #5 và `AGENTS.md` mục 6 ("chỉ để thể hiện đổi trạng thái
đơn vị; ≤300ms"). Mục đích mới: chuyển động cho người dùng biết **mình vừa đi đâu** và
**việc gì vừa xong**.

### L.1 Token
| Token | Giá trị | Dùng cho |
|---|---|---|
| `--dur-fast` | 150ms | hover, đổi màu nút, bong bóng thuật ngữ |
| `--dur-standard` | 200ms | chuyển trang, badge đổi màu |
| `--dur-slow` | 300ms | chuyển bước, drawer/hộp thoại (250ms), badge mờ dần, dấu tích |
| `--dur-handoff` | 700ms | **chỉ** màn chuyển tiếp sang/về trang Techcombank |
| `--ease-out` | `cubic-bezier(0.2, 0, 0, 1)` | phần tử đi vào (mặc định) |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | phần tử đi ra |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | thanh bước tô đầy, đổi màu |

Trần: không hiệu ứng nào > 400ms trừ `--dur-handoff`. Không bounce, không elastic, không
chạy số tiền (giữ quyết định đã chốt "không tween dư nợ").

### L.2 Từng loại
| Khi | Hiệu ứng | Thời lượng |
|---|---|---|
| Chuyển trang trong app | Trang cũ mờ đi; trang mới mờ dần vào + trượt lên 8px | 200ms, `--ease-out` |
| Chuyển bước trong một luồng (vd. Ứng vốn: A2 → ước tính → A4 → gửi) | Nội dung bước trượt ngang 12px (tiến: từ phải; lùi: từ trái) + mờ dần; thanh bước tô đầy dần tới bước mới | 250ms nội dung, 300ms thanh bước |
| Sang trang Techcombank | Màn chuyển tiếp: nền `#141414`, chữ "Đang chuyển tới Techcombank…", vạch đỏ chạy từ trái sang phải một lần | 700ms |
| Về app | Màn chuyển tiếp nền app: "Quay về {DISPLAY_NAME}", vạch cobalt chạy một lần | 700ms |
| Hoàn tất hành động (cấp quyền, giải ngân, trả nợ) | Dấu tích tự vẽ (`stroke-dashoffset`) cạnh câu xác nhận | 300ms |
| Đơn vị đổi trạng thái | Badge mới mờ dần vào; viền thẻ nổi nhẹ rồi tắt | badge 300–400ms; viền ≤ 400ms (giảm từ 800ms cũ) |
| Drawer, hộp thoại | Trượt vào từ cạnh (drawer) / mờ + thu từ 98% (hộp thoại) | 250ms vào, 200ms ra |
| Danh sách nhiệm vụ đánh dấu xong | Dấu tích tự vẽ + dòng chuyển màu | 300ms |

### L.3 Cơ chế
- CSS `transition`/`@keyframes` + **View Transitions API** (`document.startViewTransition`)
  cho chuyển trang và chuyển bước. Trình duyệt không hỗ trợ → đổi trang ngay, không hiệu
  ứng, không polyfill. Không thêm thư viện.
- Màn chuyển tiếp ngân hàng là một trạng thái giao diện (không phải animation), chặn nhập
  trong 700ms rồi tự đi tiếp.
- `prefers-reduced-motion: reduce` → mọi thứ hiện ngay: giữ khối CSS toàn cục hiện có,
  thêm `::view-transition-group(*) { animation: none }`, **bỏ qua** màn chuyển tiếp ngân
  hàng (dải "Bạn đang ở trang của Techcombank" đã đủ báo đổi bề mặt). Mọi `setTimeout` dựng
  hiệu ứng phải kiểm `matchMedia` trước.
- Hiệu ứng kết thúc ở opacity 1 (giữ ràng buộc tương phản Vòng 16).

---

## Quyết định Vòng 20 (trả lời câu hỏi mở)
1. quy-tac mục 7 đã sửa (xem K.0); Hướng B cho cả 4 mẫu.
2. Chứng thư dùng chung mã `LOCK-2027-0915-00318` cho mọi bên cho vay (mã là số thứ tự trong
   sổ; mỗi phiên chỉ có một lần khóa đầu tiên). Chào giá C 80 triệu khóa theo tỷ lệ giá trị
   khả dụng: RU-03 44, RU-04 36 (du-lieu mục 12).
3. Thanh bên cổng nội bộ ngân hàng: `#141414`.
4. Sau tất toán: "Đã cập nhật sau lô tất toán", không kèm điểm mới.
5. Danh sách nhiệm vụ đặt ở cuối thanh điều hướng trái (không nổi đè).
6. `DISPLAY_NAME` = "Capix", `LEGAL_NAME` = "Công ty Capix" (Vòng 19b; trước là "[TÊN APP]").

### Câu hỏi mở cũ (Vòng 19)
1. Sửa `docs/quy-tac.md` mục 7 để cho phép màu Techcombank xấp xỉ **chỉ** trên khung trang
   Techcombank? (K.0) — chặn Vòng 21 phần khung ngân hàng.
2. Chứng thư khóa khi chọn Ngân hàng B / Công ty tài chính C ở Giai đoạn 3: dùng chung mã
   `LOCK-2027-0915-00318` hay cần mã riêng? Chào giá C 80 triệu phân bổ khóa thế nào? (G)
3. Thanh bên cổng nội bộ đổi `slate-700` → `#141414`? (K.3 luật 7)
4. Nhân vật có cần điểm xác thực mới sau tất toán (du-lieu mục 10 chỉ nói "cập nhật")? (E)
