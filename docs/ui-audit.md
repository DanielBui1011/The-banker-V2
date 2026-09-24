# Vòng 7 — Chẩn đoán UI

Đọc code, không sửa. Áp `DESIGN.md`, `CLAUDE.md`, `docs/quy-tac.md`. Tiêu chí
riêng cho vòng này: (1) mỗi màn trả lời đúng một câu hỏi + một con số chính nổi
bật nhất; (2) vai trò đang xem nhận ra được trong ≤10 giây; (3) đọc được từ
cuối phòng, giả lập máy chiếu 1920×1080.

Nhận xét chung: codebase đã qua nhiều vòng làm việc trước đó (Vòng 7A/7C ghi
trong comment) — phần lớn 10 màn đã dùng `SurfaceFrame`, `StatusBadge`,
`Money`, thang chữ `label/body/emphasis/section-title/screen-title/hero`. Các
vấn đề dưới đây là phần còn lại, không phải toàn bộ hệ thống.

## Bảng vấn đề

| Màn | Vấn đề | Mức | Nguyên tắc vi phạm | Đề xuất | Ước lượng công |
|---|---|---|---|---|---|
| Toàn cục | `LEGAL_NAME` trong `src/config/brand.js:7` là placeholder `'<ĐIỀN TÊN PHÁP NHÂN>'`, hiển thị nguyên văn ở "Bên yêu cầu" trên trang Techcombank (Màn 2, Màn 5a/5c) | Cao | quy-tac.md mục 3 (bên yêu cầu phải rõ ràng); PRODUCT.md "Brand Commitments" (Công ty [tên giải pháp]) | **Đã xử lý (Vòng 8)** — `LEGAL_NAME = 'Công ty [Tên giải pháp]'`, test ở `src/config/brand.test.js` | 5 phút |
| Màn 5 | `TECHCOMBANK_QUOTE.annualRate`/lãi suất hiển thị ở bước 5b nhưng không có dòng "Ước tính, chưa phải đề nghị cấp tín dụng" ngay cạnh mục "Chi phí" (chỉ `EstimateDisclaimer` đặt trong `StaircaseCard`, cách xa khối "Chi phí" — xem `Screen5.jsx:361-371`) | TB | quy-tac.md mục 4 | Thêm `EstimateDisclaimer` (hoặc dòng chữ ngắn) ngay dưới khối "Chi phí" ở bước 5b, không chỉ ở khối bậc thang | 15 phút |
| Màn 1 | Một màn nhưng có 4 khối thông tin cùng mức nhấn (số tiền "Đang kẹt ở sàn", cơ cấu doanh thu, 2 Stat phụ, bảng Excel mô phỏng) — không rõ đâu là "MỘT con số chính" khi nhìn từ xa; `hero` chỉ áp cho khối đầu, đúng, nhưng 2 Stat phụ + bảng Excel kéo dài trang khiến câu hỏi cốt lõi ("tiền đang kẹt ở đâu, bao nhiêu") bị loãng | TB | PRODUCT.md nguyên tắc 2 (mỗi màn 1 câu hỏi) | Cân nhắc gộp bảng Excel mô phỏng vào một Drawer/toggle thay vì luôn chiếm chỗ trong luồng chính | 1-2 giờ |
| Màn 2 | Bước 2a "BankPicker" liệt kê các ngân hàng khác ở trạng thái "Đang kết nối" (`opacity-60`, `cursor-not-allowed`) — dùng đúng semantics nhưng chữ "Đang kết nối" dễ đọc nhầm là đang xử lý thật, không phải "chưa hỗ trợ" | Thấp | Đọc từ xa — rõ nghĩa | Đổi nhãn thành "Chưa hỗ trợ" hoặc tương tự để tránh hiểu nhầm có tiến trình đang chạy | 5 phút |
| Màn 3 | Màn có 4 Stat (Đã khớp/Ngoại lệ/Hoàn/Chi ra) đồng cấp — không có "một con số chính" rõ ràng; đây là màn tổng hợp nên chấp nhận được nhưng nên xác nhận với kịch bản 4 hồi rằng câu hỏi của màn là "đối soát có tự động không", không phải một con số | Thấp | PRODUCT.md nguyên tắc 2 | Không bắt buộc sửa — ghi nhận để cân nhắc ở Vòng 9 nếu giám khảo phản hồi rối | 0 (theo dõi) |
| Màn 4 | `RECEIVABLE_UNITS.map` hiển thị 3+ thẻ đơn vị cùng lúc, cộng thêm khối Mega Sale (khi bật) và khối điểm xác thực theo kênh — nhiều tầng thông tin trên một màn, tương tự Màn 1 | TB | PRODUCT.md nguyên tắc 2, 3 | Xem xét tách "Điểm xác thực theo kênh" ra khỏi luồng chính (đã ở dạng thẻ bấm mở Drawer — có thể thu gọn hơn nữa nếu giám khảo thấy rối) | 1 giờ (chỉ nếu cần) |
| Màn 6 | `interestThousandVN` tính bằng `Math.round(... * 100) / 100` rồi nhân 1000 để ra "nghìn đồng" — đơn vị hiển thị đổi từ "triệu" sang "nghìn đồng" ngay trong cùng một màn dùng `Money` (đơn vị mặc định "triệu") ở mọi nơi khác | TB | DESIGN.md ràng buộc khóa #3 (đơn vị "triệu" nhất quán mọi nơi) | Giữ đơn vị "triệu" (số thập phân nhỏ) thay vì đổi sang "nghìn đồng", hoặc nếu cố ý đổi để tránh số 0 dài thì cần chú thích rõ đơn vị ngay cạnh số, hiện chỉ có chữ "nghìn đồng" đặt sau — dễ bị đọc nhầm khi lướt nhanh trên máy chiếu | 30 phút |
| Màn 7 | Ổn — dùng `StatusBadge`, `Timeline`, `ConfirmDialog`; nhãn nút xác nhận nêu rõ hành động; không phát hiện vấn đề mới | — | — | — | — |
| Màn 8 | Tiêu đề "Techcombank" (`text-screen-title`) và phụ đề "Cổng nghiệp vụ — tra cứu nhà bán Lan Beauty" đọc được, nhưng SurfaceFrame `bankOps` KHÔNG có icon hay dấu hiệu thị giác nào khác khung `platform` ngoài dải chữ mỏng phía trên — nếu giám khảo lỡ màn dải chữ (nhìn xa), khung 8 dễ bị nhầm với khung Nền tảng vì cả hai đều nền trắng/slate-50 | Cao | PRODUCT.md nguyên tắc 4 (3 khung phải phân biệt ngay bằng thị giác, không chỉ chữ); DESIGN.md ràng buộc khóa #2 | **Đã xử lý (Vòng 8)** — `bankOps` đổi sang thanh điều hướng dọc bên trái (icon `Landmark`, nhãn "Nội bộ — mô phỏng", 3 mục giả trang trí), phân biệt bằng bố cục không cần đọc chữ | 1-2 giờ |
| Màn 9 | Là nội dung thay thế của Màn 6 (không phải điểm dừng riêng) — ổn theo thiết kế, `BrokenPanel` dùng đúng `red`/`StatusBadge status="broken"`; không phát hiện vấn đề mới | — | — | — | — |
| Màn 10 | Bước "sign" dùng `SurfaceFrame variant="bank"` với `bankName={quote.lender}` động — đúng khi lender khác Techcombank (Ngân hàng B) nhưng cần xác nhận `LENDER_QUOTES` không chứa tên ngân hàng thật ngoài Techcombank (đã dùng tên giả theo quy-tac.md mục 7 — xác nhận qua `mockData.js`, không đọc lại trong vòng này vì nằm ngoài src/screens) | Thấp | quy-tac.md mục 7 (cần xác nhận, không phải lỗi đã thấy) | Xác nhận `LENDER_QUOTES` trong `src/data/mockData.js` chỉ dùng tên giả cho bên cho vay khác Techcombank | 5 phút xác nhận |
| ScenarioPanel | Dùng `text-sm/text-base/text-lg/text-xl` (thang Tailwind mặc định) thay vì thang `label/body/emphasis` như các màn — về mặt cỡ chữ vẫn an toàn nhờ `tailwind.config.js` ghi đè toàn cục (16/18/20/22px), nhưng không nhất quán với quy ước "áp DESIGN.md" của các màn đã migrate | Thấp | Nhất quán hệ thống thiết kế (không phải vi phạm cỡ chữ) | **Đã xử lý (Vòng 8, sớm hơn kế hoạch Vòng 11)** — đổi toàn bộ sang thang `label/body/emphasis` | 30 phút |
| ScenarioPanel | Nhãn kịch bản đang bật (`activeLabel`) dùng nền cam `bg-orange-950/90` + chữ cam — orange là màu ngữ nghĩa "Tầng 3" theo CLAUDE.md; dùng lại cho một nhãn không liên quan tới Tầng 3 có thể gây hiểu nhầm cho người xem quen với bảng màu, dù panel này chủ yếu người trình bày thấy | Thấp | CLAUDE.md bảng màu ngữ nghĩa (rủi ro lẫn nghĩa, không phải lỗi nặng vì panel ẩn mặc định và không phải nội dung trình chiếu chính) | **Đã xử lý (Vòng 8, sớm hơn kế hoạch Vòng 11)** — đổi sang `border-slate-600 bg-slate-900/90 text-slate-100` | 10 phút |

## Vi phạm docs/quy-tac.md

- **Mục 2 (Nền tảng không cho vay/giữ tiền/có ví/tài khoản trung gian)**: rà
  toàn bộ `src/screens/*.jsx` và `src/components/*.jsx` cho các cụm cấm
  ("Nền tảng ứng tiền", "bán khoản phải thu", "Nền tảng giải ngân", "ví của
  Nền tảng", "tài khoản trung gian") — không tìm thấy vi phạm. Các câu chữ
  liên quan giải ngân/trả nợ đều gắn rõ "Techcombank" (`Screen5.jsx:422`
  "Techcombank đã phê duyệt và giải ngân...", `Screen6.jsx:191`
  "Trả nợ một chạm — sang trang Techcombank", `Screen6.jsx:285`
  "Khoản vay có bảo đảm bằng khoản phải thu").

- **Mục 5 (góc nhìn ngân hàng — Màn 8 không hiện tên bên khóa)**: rà
  `src/screens/Screen8.jsx` toàn bộ — chỉ hiện `lockerCount` (số lượng, dòng
  237, 182) và `Callout` dòng 144-146 nói rõ "không tiết lộ danh tính bên khóa
  khác". Không tìm thấy tên bên khóa nào bị lộ. Không tìm thấy vi phạm.

- **Mục 4 (dòng "Ước tính, chưa phải đề nghị cấp tín dụng" ở mọi giá trị ứng
  ước tính)**: có ở `Screen5.jsx:346` (`EstimateDisclaimer` trong
  `StaircaseCard`, bước 5b) và `Screen5.jsx:399` (bước 5d, trước khi gửi đề
  nghị) và `Screen10.jsx:150` (bảng chào giá nhiều bên). **Thiếu** ngay cạnh
  khối "Chi phí" (lãi suất + tiền lãi ước tính) ở `Screen5.jsx:361-371` — xem
  hàng Màn 5 mức TB ở bảng trên. Đây là vi phạm một phần: dòng disclaimer tồn
  tại trên màn nhưng đặt cách xa khối số liệu ước tính thứ hai trong cùng bước.

- **Cỡ chữ dưới 16px**: grep `text-xs`/`text-sm` trong `src/` (Tailwind mặc
  định, trước khi bị ghi đè) chỉ khớp `src/components/ScenarioPanel.jsx`; vì
  `tailwind.config.js` ghi đè `xs`/`sm` thành 16px trên toàn cục, không có cỡ
  chữ nào dưới 16px trong bundle đã build. Không tìm thấy vi phạm cỡ chữ thực tế.

- **Số liệu viết cứng trong component thay vì lấy từ `src/data/mockData.js`
  hoặc tính từ `src/logic/`**: grep các số 85/150/73/100 trong `src/screens/`
  — mọi kết quả khớp đều là: (a) chú thích code tham chiếu công thức
  (`Screen5.jsx:59`, `Screen8.jsx:28`, `Screen10.jsx:21`), (b) giá trị CSS/bố
  cục không phải số liệu nghiệp vụ (`100%` trong `style={{ width: ... }}`,
  `divide-slate-100`, `border-slate-100`, `bg-teal-100`), hoặc (c) phép tính
  runtime (`* 100` để đổi tỷ lệ thập phân sang phần trăm hiển thị, luôn có
  `formatNumberVN`/`formatPercentVN` bọc ngoài). Không tìm thấy số liệu nghiệp
  vụ viết cứng trực tiếp trong JSX của `src/screens/`.

- **`LEGAL_NAME` placeholder** (`src/config/brand.js:7`): **Đã xử lý (Vòng
  8)** — không còn placeholder `<...>` chưa điền; xem hàng "Toàn cục" mức Cao
  ở bảng trên.

## Tổng hợp mức độ

- Cao: 2 (placeholder `LEGAL_NAME`; Màn 8 thiếu dấu hiệu thị giác phân biệt `bankOps`)
- Trung bình: 4 (Màn 5 disclaimer đặt xa khối chi phí; Màn 1 mật độ thông tin;
  Màn 4 mật độ thông tin; Màn 6 đổi đơn vị "nghìn đồng")
- Thấp: 6 (Màn 2 nhãn "Đang kết nối"; Màn 3 không có con số chính — chỉ ghi
  nhận; Màn 10 xác nhận tên giả; ScenarioPanel thang chữ không nhất quán;
  ScenarioPanel màu cam trùng nghĩa Tầng 3; Màn 3 theo dõi)

## Sau Vòng 11

Vòng 11 hoàn tất Màn 8, Màn 10, ScenarioPanel theo `docs/plans/ui-roadmap.md`
mục 11.1–11.4 và prompt thực thi Vòng 11 (mở rộng hơn roadmap gốc):

- **Màn 8**: thêm con số chính "Giá trị khả dụng còn lại để khóa" (cỡ `hero`)
  ngay đầu màn, trả lời câu hỏi "Ngân hàng thấy gì, và KHÔNG thấy gì?"; bảng
  đơn vị trong `LayerGroup` đổi sang `table-fixed` với cột số có bề rộng cố
  định (đổi mốc 15/09 ↔ 20/09 không còn làm bố cục nhảy); thêm chú thích
  "Danh tính bên khóa được ẩn theo quy chế thành viên" cạnh khối minh họa
  phơi nhiễm chéo. Trạng thái trống khi rút A2 đã đạt yêu cầu từ trước, không
  cần sửa.
- **Màn 10**: chào giá thấp nhất giờ có nhãn chữ "Lãi thấp nhất" (không chỉ
  dựa màu — quy tắc bắt buộc mọi trạng thái có nhãn + màu); Chứng thư khóa
  thêm dòng "Giá trị" (lấy đúng theo chào giá đã chọn, không còn cố định theo
  Techcombank), "Thứ tự ưu tiên" trình bày nổi bật nhất bằng cỡ chữ lớn hơn
  hẳn các dòng khác, và thêm "Chuỗi JWS (rút gọn)" hiện trực tiếp (không cần
  bấm mở) — có ghi chú minh họa, không phải chữ ký thật. Đã xác nhận
  `LENDER_QUOTES` trong `mockData.js` chỉ dùng tên giả cho bên ngoài
  Techcombank (Ngân hàng B, Công ty tài chính C) — không có vi phạm.
- **ScenarioPanel**: mọi gợi ý phím tắt (trong từng công tắc kịch bản và mục
  "Phím tắt khác") giờ hiện qua component `KeyHint` dùng chung (thêm prop
  `className` tuỳ chọn để dùng được trên nền tối của panel, mặc định giữ
  nguyên style sáng cho mọi nơi khác) thay vì chữ/`<span>` viết tay. Đã kiểm
  tra ở 1920×1080: nút mở panel (góc dưới phải) và nhãn kịch bản đang bật
  (góc trên phải) không che nội dung chính ở trạng thái mặc định (đóng); khi
  mở panel, panel che một phần góc phải màn — chấp nhận được vì đây là công
  cụ của người trình bày, chỉ mở khi chủ động bấm, không phải nội dung trình
  chiếu chính.

### Rà lại Màn 2–7, 9 (chưa rà từ Vòng 7)

Theo yêu cầu "/impeccable critique toàn bộ 10 màn — chỉ báo cáo, không sửa"
cuối Vòng 11. Không lặp lại các mục đã "Đã xử lý" ở Vòng 8–10.

| Màn | Vấn đề | Mức | Nguyên tắc vi phạm | Đề xuất |
|---|---|---|---|---|
| Màn 4 | `Screen4.jsx:137` — viền thẻ RU-03/RU-04 tô tím (`border-violet-300 ring-1 ring-violet-100`) chỉ dựa vào **mã đơn vị tĩnh** (`isRU0304`), không theo `lifecycle.badge` thực tế. Khi đơn vị đã "Đã tất toán" (teal) hoặc "Đứt gãy" (đỏ, kịch bản rò rỉ phím L) thì viền thẻ vẫn hiện tím, mâu thuẫn trực tiếp với `StatusBadge` màu khác ngay trong cùng thẻ | Cao | DESIGN.md "Ràng buộc khóa #1" — màu ngữ nghĩa cố định, không được gây hiểu nhầm; rủi ro lộ ngay trong demo vì Hồi 4 bấm L để minh họa Màn 9 | Đổi điều kiện viền theo `lifecycle.badge` (chỉ tím khi badge đang ở trạng thái "đã khóa"/"sẽ khóa"), không theo mã đơn vị |
| Màn 2 | `Screen2.jsx` bước 2d (`HistoryLoading`) dùng `Card`/nút tông tối (`slate-800/900`) ngay sau khi `SurfaceFrame` đã chuyển về `platform` (nền sáng) — ranh giới khung platform/tech hơi mờ trong vài giây chuyển tiếp | Thấp | Nhận diện khung vai trò trong ≤10 giây (tinh thần DESIGN.md mục 5) | Đổi tông khối bước 2d sang sáng khớp nền `platform`, giữ hiệu ứng chuyển tiếp bằng cách khác |
| Màn 9 | Hai nút "Giải trình tài khoản nhận tiền" và "Trả nợ từ nguồn khác" đều mở cùng một modal `settlement.openLeakExplain` — có chủ đích nhưng dễ bị hiểu là lỗi khi trình chiếu trực tiếp | Thấp | Không phải quy tắc cứng — rủi ro khi trình diễn | Nếu còn thời gian: đổi tiêu đề/nội dung modal theo lựa chọn đã bấm, giữ chung logic xác nhận |
| Màn 3, 5, 6, 7 | Ổn — không phát hiện vấn đề mới so với Vòng 7 | — | — | — |

**Chuyển tiếp**: mục Cao ở Màn 4 nên xử lý sớm ở **Vòng 12** (trước khi vào
chế độ trình chiếu, vì va chạm trực tiếp với kịch bản rò rỉ dùng trong Hồi 4).
Hai mục Thấp (Màn 2, Màn 9) chuyển cho **Vòng 13** (rà soát) nếu còn thời
gian — không chặn tiến độ trình chiếu.

## Vòng 25

`/impeccable critique` toàn app sau khi thêm lớp hướng dẫn (màn chào, danh sách nhiệm vụ,
chú giải thuật ngữ, ngăn Hướng dẫn). Chạy hai đánh giá độc lập: A — đánh giá thiết kế
(nguồn + app ở 1366×768 và 1920×1080); B — bộ dò `impeccable detect` + dò trong trình duyệt
trên 6 khung nhìn. Điểm Nielsen: **27/40**. Tải nhận thức: trượt 4/8 mục (một trọng tâm, thứ
bậc thị giác, một việc một lúc, trí nhớ làm việc).

| Khu vực | Vấn đề | Mức | Nguồn | Xử lý |
|---|---|---|---|---|
| Trang Techcombank A1/A2/A4 | Nút "Đồng ý cấp quyền" nằm ở y≈1001 ở 1366×768 — dưới màn hình đầu, đúng lúc người dùng lo nhất (vi phạm K.5) | Cao | A | **Đã xử lý** — `ConsentPage.jsx`: ô xác nhận + nút dính đáy vùng cuộn (đo lại: đáy nút 703/768) |
| Danh sách nhiệm vụ | Nhiệm vụ 1 "Đi tới" trỏ về Tổng quan — bấm khi đang ở Tổng quan không đi đâu (kẹt ngay bước đầu của người mới) | Cao | A | **Đã xử lý** — `Guide.jsx` `guideTasks`: đường trỏ đúng trang đang mở thì dùng hành động của thẻ Bước tiếp theo (→ A1). Không sửa `journey.js` (test ghim href) |
| Toàn cục | Thanh trên hiện `[TÊN APP]` (placeholder) ở mọi trang và màn "Quay về …" | Cao | A | **Đã xử lý (Vòng 19b)** — `DISPLAY_NAME` = "Capix", `LEGAL_NAME` = "Công ty Capix" (src/config/brand.js) |
| Ứng vốn bước 1 | Nút chính là "Xem ước tính" vô hiệu trong khi việc cần làm là cấp A2 | Trung bình | A | Chuyển vòng sau: đổi nút chính thành "Cấp A2 trên trang Techcombank" |
| Tổng quan / Đối soát | Cùng một hành động lặp 2–3 lần trên màn (thẻ Bước tiếp theo, nút trong trang, danh sách nhiệm vụ) | Trung bình | A | Chuyển vòng sau (distill): giữ một lời gọi hành động chính |
| Phím tắt | Space/M/L/3 một phím đổi trạng thái mô phỏng — Space hay dùng để cuộn trên laptop (WCAG 2.1.4) | Trung bình | A | Chuyển vòng sau: chỉ nhận Space khi không có vùng cuộn đang focus, hoặc liệt kê phím trên màn chào |
| Drawer | `aria-modal` nhưng không giữ focus bên trong; đóng không trả focus về nút mở | Trung bình | A | Chuyển vòng sau: dùng `<dialog>` + `showModal()` như màn chào |
| Dải tiêu đề | "Tầng 1/2/3" chưa có chú giải tại chỗ | Thấp | A | Thuật ngữ "Tầng 1 / 2 / 3" đã có trong ngăn Hướng dẫn; gắn Term vào dải tiêu đề ở vòng sau |
| Term | Bong bóng `pointer-events-none` — không rê chuột vào bong bóng được (WCAG 1.4.13) | Thấp | A | Chuyển vòng sau |
| Danh sách nhiệm vụ, Stepper | Thanh tiến độ tạo hiệu ứng bằng `width` (layout) | Thấp | B | Chuyển vòng sau: `transform: scaleX` |
| Khoản phải thu | Nút "Điểm xác thực …" đệm dọc 4px (`py-1`) | Thấp | B | Chuyển vòng sau |
| Tổng quan | Đoạn "6 tuần sau" ~100 ký tự/dòng | Thấp | B | Chuyển vòng sau: `max-w-prose` |
| Toàn cục | cream-palette, Callout lồng trong Card, SurfaceFrame sát mép | — | B | Dương tính giả: nền ngà là token DESIGN.md; dòng "Ước tính…" bắt buộc (quy-tac mục 4); khung app chạy sát mép có chủ đích |

Bộ dò CLI (`src/pages`, `src/components`): 0 phát hiện. Không có lỗi console.

### Vòng 25 — Kiểm thử người mới (browser agent)

Cách chạy: agent không đọc mã, xóa localStorage, mở app ở 1366×768, chọn "Bắt đầu có hướng dẫn",
**chỉ** làm theo thẻ Bước tiếp theo và nút "Đi tới" (được làm thao tác chính trên trang
Techcombank). Kết quả: **đạt 5/5 sau 23 cú bấm**, không kẹt hẳn chỗ nào, không phải mở bảng Mô
phỏng hay dùng phím tắt. (Ghi chép người lạ thật chưa có — ô `[DÁN GHI CHÉP]` của yêu cầu để
trống; bảng dưới dùng kết quả agent.)

Chú thích cột "Lớp xử lý": D.1 màn chào · D.2 danh sách nhiệm vụ · D.3 thẻ Bước tiếp theo ·
D.4 chú giải thuật ngữ · D.5 ngăn Hướng dẫn.

| # | Chỗ phải đoán | Mức | Lớp xử lý | Trạng thái |
|---|---|---|---|---|
| 1 | Ứng vốn, bước Gửi đề nghị: thẻ ghi "Gửi đề nghị tới Techcombank." nhưng không có nút — phải tìm nút trong trang | Chậm | D.3 | **Còn mở** — `nextStep` (fundingStep) trả `action: null` cho bước này; cần nút dẫn tới nút Gửi (sửa `src/logic/journey.js`, TDD) |
| 2 | Ứng vốn 19/09: thẻ nói "Trả 46,75 triệu trên Techcombank" nhưng nút là "Xem khoản vay" — thêm một bước trung gian | Khó chịu nhẹ | D.3 | Có chủ đích (hành động trả nằm ở Khoản vay); cân nhắc dẫn thẳng tới trang Trả nợ |
| 3 | Đối soát 01/08: thẻ "Tua tới 15/09…", nút "Tua tới sự kiện tiếp theo" — hai tên cho một việc | Khó chịu nhẹ | D.3 | **Còn mở** — thống nhất nhãn nút theo ngày ("Tua tới 15/09") |
| 4 | Góc nhìn cán bộ hứa "xem tổng kết", về Tổng quan thẻ lại ghi "Không cần làm gì ở trang này"; tổng kết chỉ là thẻ nhỏ ở thanh bên | Khó chịu nhẹ | D.2 + D.3 | **Còn mở** — khi xong 5/5, thẻ Bước tiếp theo nên trỏ tới thẻ kết / hai nhiệm vụ tùy chọn |
| 5 | Nhiệm vụ 2 vẫn "Chưa xong" sau khi tua; tên đổi giữa chừng ("Tua tới 15/09 và xem…" → "Xem khoản phải thu") | Khó chịu nhẹ | D.2 | Điều kiện đúng spec D.2 (phải mở Khoản phải thu); tên ngắn gây lệch — dùng tên ngắn "Tua và xem khoản phải thu" |

Lỗi hiển thị agent ghi nhận:

| Vấn đề | Đánh giá |
|---|---|
| Thanh bước của app nằm phía trên dải "Bạn đang ở trang của Techcombank" ở A2/A4 | Đúng thiết kế — san-pham.md B.2 và AGENTS.md mục 4: "thanh bước của Nền tảng nằm NGOÀI khung ngân hàng" |
| Sau giải ngân, bước 4 "Gửi đề nghị" trên thanh bước vẫn hiện số 4, không có dấu tích | Còn mở — kiểm lại `Stepper` khi `currentStep = steps.length + 1` |
| Tổng quan ngày 20/09 vẫn hiện thẻ "6 tuần sau" | Còn mở — thẻ nên chỉ hiện ở 15/09 |
| Chuyển trang mờ dần > 1 giây, trang cũ và mới chồng nhau | Cần kiểm lại trên máy thật — khung trình duyệt bị ẩn làm trình duyệt hãm khung hình; token là 200ms |
| Trang Trả nợ: nút "Hủy"/"Xác nhận trả nợ" sát mép dưới ở 1366×768 | Còn mở — cùng cách sửa như ConsentPage (dính đáy) |
| Ô xác nhận + nút Đồng ý/Ký ở A1/A2/A4 nằm trong 768px | Xác nhận sửa mức Cao ở trên có hiệu lực |
