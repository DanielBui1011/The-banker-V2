# Lộ trình UI — Vòng 8-11

Dựa trên `docs/ui-audit.md` (Vòng 7). Nguồn thẩm quyền: `DESIGN.md` > `CLAUDE.md`
> `docs/quy-tac.md` cho nội dung pháp lý > tài liệu này. Vấn đề mức Cao xếp đầu
mỗi vòng tương ứng. Mỗi tác vụ: file cụ thể, tiêu chí chấp nhận kiểm tra được,
cách kiểm tra.

## Vòng 8 — Nền móng thiết kế

Cập nhật theo prompt thực thi Vòng 8 (thay thế 8.1–8.4 cũ — phạm vi rộng hơn:
hợp nhất StatusBadge, khung `bankOps` mới, màu hành động theo khung, kéo sớm
hai tác vụ ScenarioPanel từ Vòng 11).

### 8.1 Điền `LEGAL_NAME` thật (Cao) — Đã xử lý
- File: `src/config/brand.js`, `src/config/brand.test.js` (mới).
- Việc: `LEGAL_NAME = 'Công ty [Tên giải pháp]'` — dạng khung vuông có chủ
  đích (người dùng xác nhận giữ dạng này thay vì tên thật), không phải
  placeholder `<...>` chưa điền. `TPP_CODE` đã ghi rõ "(giả định)" từ trước,
  không cần sửa.
- Tiêu chí chấp nhận: không còn chuỗi `<ĐIỀN` trong repo; test Vitest xác nhận
  `LEGAL_NAME` không chứa `<` và không trùng `DISPLAY_NAME`.
- Kiểm tra: `grep -rn "ĐIỀN TÊN" src/` không có kết quả; `npm test`.

### 8.2 Hợp nhất StatusBadge (mới) — Đã xử lý
- File: `src/components/StatusBadge.jsx` (xóa).
- Việc: Màn 4/6/7/9 đã dùng `src/components/ui/StatusBadge.jsx` từ Vòng 7A/7C
  — bản cũ (tone + children, nền tối) không còn nơi nào import. Xóa file cũ,
  không cần map lại màn nào.
- Tiêu chí chấp nhận: `grep` không còn import `'../components/StatusBadge.jsx'`
  ở đâu trong `src/`; badge luôn nằm trong `Card` nền trắng (đủ tương phản),
  không cần đổi nền.
- Kiểm tra: `npm run build` (build lỗi nếu còn import file đã xóa).

### 8.3 Phân biệt thị giác khung `bankOps` (Cao) — Đã xử lý
- File: `src/components/ui/SurfaceFrame.jsx` (chỉ sửa file này).
- Việc: `bankOps` đổi từ strip ngang sang thanh điều hướng dọc bên trái kiểu
  phần mềm nghiệp vụ nội bộ — icon `Landmark` (không dùng `Lock` đã gán cho
  `bank`), nhãn "Nội bộ — mô phỏng", 3 mục điều hướng giả trang trí ("Tra cứu
  nhà bán" đang chọn, "Danh mục khóa", "Cảnh báo" — không bấm được). Nền
  `bg-slate-700`, không dùng đỏ/navy/`slate-800` (đã dùng cho strip `bank`).
- Tiêu chí chấp nhận: `bankOps` nhận ra được bằng BỐ CỤC (thanh dọc bên trái),
  không cần đọc chữ; không trùng `platform`/`bank`.
- Kiểm tra: xem Màn 1 (platform), Màn 2 bước b (bank), Màn 8 (bankOps) liên
  tiếp ở 1920×1080.

### 8.4 Màu hành động theo khung (mới) — Đã xử lý
- File: `tailwind.config.js` (`navy.DEFAULT` → `var(--color-navy)`),
  `src/index.css` (khai báo `--color-navy` ở `:root`, ghi đè trong
  `[data-surface-frame='bank'], [data-surface-frame='bankOps']`),
  `src/components/ui/SurfaceFrame.jsx` (gắn `data-surface-frame` trên khung
  ngoài cùng mọi variant).
- Việc: nút chính/Stepper/ActProgress/ConfirmDialog trong khung `bank`/
  `bankOps` không còn hiện `navy` (thương hiệu Nền tảng) — đổi tập trung qua
  biến CSS, không sửa từng màn.
- Tiêu chí chấp nhận: xem Màn 2 bước b (nút "Đồng ý cấp quyền..."), Màn 5 bước
  a/c (Stepper bước hiện tại), Màn 8 (nút "Tiếp: Giai đoạn 3") — không còn màu
  navy; Màn 1/6/9 (platform) vẫn giữ navy như cũ.
- Kiểm tra: `npm run build`; xem trực tiếp ở 1920×1080.

### 8.5 Money — xác nhận đã hỗ trợ đơn vị "nghìn đồng" — Đã xử lý (không cần sửa)
- File: không sửa. `src/components/ui/Money.jsx` đã nhận prop `unit` tuỳ ý
  (mặc định `'triệu'`) — truyền `unit="nghìn đồng"` đã hoạt động, không cần
  thêm gì. Màn 6 (`interestThousandVN`) KHÔNG được sửa ở vòng này (ngoài phạm
  vi prompt).
- Tiêu chí chấp nhận: không có diff ở `Money.jsx`.

### 8.6 ScenarioPanel — kéo sớm từ Vòng 11 — Đã xử lý
- File: `src/components/ScenarioPanel.jsx`.
- Việc: (a) nhãn kịch bản đang bật đổi từ `orange` sang
  `border-slate-600 bg-slate-900/90 text-slate-100`; (b) toàn bộ
  `text-sm/text-base/text-lg/text-xl` đổi sang `text-label/text-body/text-emphasis`.
- Tiêu chí chấp nhận: không còn `orange` hay `text-sm/base/lg/xl` (thang
  Tailwind mặc định) trong file.
- Kiểm tra: `grep -n "text-\(sm\|base\|lg\|xl\)\b\|orange" src/components/ScenarioPanel.jsx`
  không có kết quả (ngoại trừ class không phải font-size/màu, ví dụ `rounded-lg`).

## Vòng 9 — Màn 1, 2, 7, 3

### 9.1 Màn 2 — đổi nhãn "Đang kết nối" (Thấp, xếp đầu vì rẻ)
- File: `src/screens/Screen2.jsx` (`BankPicker`, dòng ~152)
- Việc: đổi "Đang kết nối" thành nhãn không gợi ý có tiến trình chạy (vd.
  "Chưa hỗ trợ").
- Tiêu chí chấp nhận: nhãn mới không dùng từ ngụ ý đang xử lý.
- Kiểm tra: đọc Màn 2 bước 2a, xác nhận nhãn rõ nghĩa.

### 9.2 Màn 1 — giảm mật độ thông tin (TB)
- File: `src/screens/Screen1.jsx`
- Việc: cân nhắc đưa bảng Excel mô phỏng đối soát thủ công vào trạng thái thu
  gọn mặc định hoặc Drawer, giữ "Đang kẹt ở sàn" (hero) là tâm điểm duy nhất
  khi màn vừa mở.
- Tiêu chí chấp nhận: khi màn 1 vừa load (trước khi bấm "Mô phỏng"), chỉ có
  MỘT con số cỡ `hero` nổi bật; không cuộn ngang ở 1920×1080.
- Kiểm tra: xem Màn 1 ở 1920×1080 khi vừa vào màn, xác nhận không cuộn ngang;
  `npm test` vẫn pass (không đổi logic).

### 9.3 Màn 7 — không có tác vụ
- Đã đạt tiêu chí Vòng 7 audit. Bỏ qua trừ khi phát sinh vấn đề mới ở Vòng 8.

### 9.4 Màn 3 — theo dõi, không bắt buộc sửa
- File: `src/screens/Screen3.jsx`
- Việc: nếu sau khi trình thử thấy giám khảo bối rối vì 4 Stat đồng cấp,
  nhấn mạnh 1 Stat chính (vd. "Đã khớp") bằng cỡ chữ lớn hơn 3 Stat còn lại.
- Tiêu chí chấp nhận (nếu thực hiện): 1 trong 4 Stat dùng `size="hero"` hoặc
  tương đương, 3 Stat còn lại giữ nguyên cỡ nhỏ hơn.
- Kiểm tra: xem Màn 3 ở 1920×1080, xác nhận có điểm nhìn ưu tiên rõ.

## Vòng 10 — Màn 4, 5, 6, 9

### 10.1 Màn 5 — disclaimer cạnh khối "Chi phí" (TB, ưu tiên vì gắn quy-tac.md mục 4)
- File: `src/screens/Screen5.jsx` (`EstimateStep`, sau khối `Card` "Chi phí" dòng ~371)
- Việc: thêm `<EstimateDisclaimer />` ngay dưới khối "Chi phí" ở bước 5b (hiện
  chỉ có ở `StaircaseCard` phía trên).
- Tiêu chí chấp nhận: mọi khối hiển thị số tiền ước tính ở bước 5b có
  `EstimateDisclaimer` trong cùng viewport (không cần cuộn để thấy).
- Kiểm tra: `npm test` pass (không đổi logic); xem Màn 5 bước 5b ở
  1920×1080, xác nhận dòng "Ước tính, chưa phải đề nghị cấp tín dụng" hiện
  gần khối "Chi phí".

### 10.2 Màn 6 — thống nhất đơn vị tiền (TB)
- File: `src/screens/Screen6.jsx` (`NormalMilestoneDetail`, biến
  `interestThousandVN`, dòng ~29-30, 222)
- Việc: hiển thị tiền lãi bằng đơn vị "triệu" (số thập phân, qua `Money`)
  thay vì đổi sang "nghìn đồng" viết tay, HOẶC nếu giữ "nghìn đồng" thì bọc
  bằng component rõ đơn vị (không phải nối chuỗi thủ công).
- Tiêu chí chấp nhận: không còn phép tính `* 1000` đổi đơn vị viết tay trong
  `Screen6.jsx`; đơn vị hiển thị nhất quán "triệu" như mọi nơi khác, hoặc có
  lý do ghi rõ trong comment nếu buộc phải khác.
- Kiểm tra: `npm test` pass; grep `interestThousandVN` không còn trong
  `Screen6.jsx` (nếu chọn phương án bỏ hẳn) hoặc đọc lại comment giải thích.

### 10.3 Màn 4 — giảm mật độ thông tin (TB, theo dõi)
- File: `src/screens/Screen4.jsx`
- Việc: nếu Mega Sale + điểm xác thực theo kênh cùng hiện khiến màn quá dài,
  cân nhắc thu gọn "Điểm xác thực theo kênh" thành hàng ngang nhỏ hơn khi
  Mega Sale đang bật.
- Tiêu chí chấp nhận (nếu thực hiện): ở chế độ Mega Sale bật, Màn 4 không
  cuộn quá 1.5 lần chiều cao viewport ở 1920×1080.
- Kiểm tra: bật Mega Sale (phím M), xem Màn 4 ở 1920×1080.

### 10.4 Màn 9 — không có tác vụ
- Đã đạt tiêu chí Vòng 7 audit.

## Vòng 11 — Màn 8, 10, ScenarioPanel

### 11.1 Màn 8 — xác nhận 8.2 hiển thị đúng trong mọi trạng thái (phụ thuộc Vòng 8)
- File: `src/screens/Screen8.jsx`
- Việc: xác nhận khung `bankOps` (đã sửa ở 8.2) hiển thị đúng ở cả 2 mốc thời
  gian (`15-09`/`20-09`) và khi `crossExposureOn` bật/tắt.
- Tiêu chí chấp nhận: dấu hiệu thị giác `bankOps` không biến mất ở bất kỳ
  trạng thái nào của Màn 8.
- Kiểm tra: đổi `SegmentedControl` và `ToggleSwitch` trên Màn 8, xem dải nhận
  diện luôn hiện.

### 11.2 Màn 10 — xác nhận tên bên cho vay khác là tên giả (Thấp)
- File: `src/data/mockData.js` (đọc `LENDER_QUOTES`)
- Việc: xác nhận mọi `lender` khác "Techcombank" là tên giả kiểu "Ngân hàng B"
  theo quy-tac.md mục 7; sửa nếu phát hiện tên thật.
- Tiêu chí chấp nhận: `grep` `LENDER_QUOTES` trong `mockData.js` không chứa
  tên ngân hàng thật ngoài Techcombank.
- Kiểm tra: đọc `src/data/mockData.js`, xác nhận bằng mắt.

### 11.3 ScenarioPanel — thang chữ nhất quán (Thấp) — Đã xử lý ở Vòng 8 mục 8.6
Kéo sớm vì cùng file với 11.4 và rẻ để làm chung.

### 11.4 ScenarioPanel — đổi màu nhãn kịch bản (Thấp) — Đã xử lý ở Vòng 8 mục 8.6
Kéo sớm cùng 11.3.

## Kiểm tra chung mọi vòng
- `npm run build` và `npm test` pass, dán kết quả thật (CLAUDE.md "Quy ước plugin").
- Xem ở 1920×1080 (giả lập máy chiếu), không cuộn ngang, không chữ bị cắt.
- Không thêm dependency mới trừ khi `DESIGN.md` yêu cầu (không có yêu cầu nào
  trong roadmap này).
