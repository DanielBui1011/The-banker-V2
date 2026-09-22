# Lộ trình UI — Vòng 8-11

Dựa trên `docs/ui-audit.md` (Vòng 7). Nguồn thẩm quyền: `DESIGN.md` > `CLAUDE.md`
> `docs/quy-tac.md` cho nội dung pháp lý > tài liệu này. Vấn đề mức Cao xếp đầu
mỗi vòng tương ứng. Mỗi tác vụ: file cụ thể, tiêu chí chấp nhận kiểm tra được,
cách kiểm tra.

## Vòng 8 — Nền móng

### 8.1 Điền `LEGAL_NAME` thật (Cao)
- File: `src/config/brand.js`
- Việc: thay `'<ĐIỀN TÊN PHÁP NHÂN>'` bằng "Công ty [tên giải pháp]" thật (hỏi
  lại nếu chưa chốt tên, theo CLAUDE.md "Cách làm việc").
- Tiêu chí chấp nhận: không còn chuỗi `<ĐIỀN` trong repo; Màn 2 bước 2b và Màn
  5 bước 5a/5c hiện tên công ty thật ở "Bên yêu cầu".
- Kiểm tra: `grep -rn "ĐIỀN TÊN" src/` không có kết quả; xem Màn 2/5 ở
  1920×1080, đọc được dòng "Bên yêu cầu".

### 8.2 Phân biệt thị giác khung `bankOps` (Cao)
- File: `src/components/ui/SurfaceFrame.jsx` (thêm icon/màu riêng cho variant
  `bankOps`, tương tự `icon: true` đã có ở `bank`)
- Việc: thêm icon lucide riêng (không dùng `Lock` đã gán cho `bank`) và/hoặc
  màu dải khác hẳn `platform`/`bank` cho `bankOps`, để Màn 8 nhận ra được
  trong ≤10 giây kể cả khi nhìn xa.
- Tiêu chí chấp nhận: `bankOps` có dấu hiệu thị giác (icon hoặc màu dải) không
  trùng `platform` và không trùng `bank`; DESIGN.md ràng buộc khóa #2 vẫn đúng
  (không dùng đỏ).
- Kiểm tra: xem Màn 1 (platform), Màn 2 bước b (bank), Màn 8 (bankOps) liên
  tiếp ở 1920×1080 — phân biệt được không cần đọc chữ.

### 8.3 Font, tokens, số tiền chuẩn — xác nhận không cần sửa
- File: không sửa (đã đúng: `@fontsource/be-vietnam-pro`, `Money` component,
  `tabular-nums`). Việc của vòng này chỉ là XÁC NHẬN không có nơi nào bỏ qua
  `Money`/`formatNumberVN` khi thêm code mới trong 8.1/8.2.
- Tiêu chí chấp nhận: `npm run build` và `npm test` pass sau 8.1/8.2.
- Kiểm tra: `npm run build`, `npm test`.

### 8.4 Nhãn trạng thái chữ+icon — xác nhận không cần sửa
- Đã đúng qua `StatusBadge`/`src/ui/status.js`. Không có tác vụ, chỉ nhắc
  người thực hiện Vòng 9-11 không tự vẽ badge màu rời khỏi `StatusBadge`.

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

### 11.3 ScenarioPanel — thang chữ nhất quán (Thấp)
- File: `src/components/ScenarioPanel.jsx`
- Việc: đổi `text-sm/text-base/text-lg/text-xl` sang `text-label/text-body/text-emphasis`
  cho nhất quán với các màn đã migrate (không bắt buộc vì panel không phải nội
  dung trình chiếu chính).
- Tiêu chí chấp nhận: không còn `text-sm/text-base/text-lg/text-xl` (thang
  Tailwind mặc định) trong file, chỉ dùng thang `label/body/emphasis/...`.
- Kiểm tra: `grep -n "text-\(sm\|base\|lg\|xl\)\b" src/components/ScenarioPanel.jsx`
  không có kết quả (ngoại trừ các class không phải font-size như `rounded-lg`).

### 11.4 ScenarioPanel — đổi màu nhãn kịch bản (Thấp)
- File: `src/components/ScenarioPanel.jsx` (dòng ~21, `bg-orange-950/90`,
  `text-orange-200`, `border-orange-600`)
- Việc: đổi sang màu trung tính (slate/navy) để không trùng nghĩa "Tầng 3"
  (orange) trong bảng màu ngữ nghĩa CLAUDE.md.
- Tiêu chí chấp nhận: nhãn kịch bản không dùng `orange`; các toggle vẫn dùng
  `teal` cho trạng thái bật (đã đúng, không đổi).
- Kiểm tra: đọc lại `ScenarioPanel.jsx`, xác nhận không còn `orange`.

## Kiểm tra chung mọi vòng
- `npm run build` và `npm test` pass, dán kết quả thật (CLAUDE.md "Quy ước plugin").
- Xem ở 1920×1080 (giả lập máy chiếu), không cuộn ngang, không chữ bị cắt.
- Không thêm dependency mới trừ khi `DESIGN.md` yêu cầu (không có yêu cầu nào
  trong roadmap này).
