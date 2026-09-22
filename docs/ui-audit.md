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
| Toàn cục | `LEGAL_NAME` trong `src/config/brand.js:7` là placeholder `'<ĐIỀN TÊN PHÁP NHÂN>'`, hiển thị nguyên văn ở "Bên yêu cầu" trên trang Techcombank (Màn 2, Màn 5a/5c) | Cao | quy-tac.md mục 3 (bên yêu cầu phải rõ ràng); PRODUCT.md "Brand Commitments" (Công ty [tên giải pháp]) | Điền `LEGAL_NAME = 'Công ty [tên giải pháp]'` thật trước khi trình chiếu | 5 phút |
| Màn 5 | `TECHCOMBANK_QUOTE.annualRate`/lãi suất hiển thị ở bước 5b nhưng không có dòng "Ước tính, chưa phải đề nghị cấp tín dụng" ngay cạnh mục "Chi phí" (chỉ `EstimateDisclaimer` đặt trong `StaircaseCard`, cách xa khối "Chi phí" — xem `Screen5.jsx:361-371`) | TB | quy-tac.md mục 4 | Thêm `EstimateDisclaimer` (hoặc dòng chữ ngắn) ngay dưới khối "Chi phí" ở bước 5b, không chỉ ở khối bậc thang | 15 phút |
| Màn 1 | Một màn nhưng có 4 khối thông tin cùng mức nhấn (số tiền "Đang kẹt ở sàn", cơ cấu doanh thu, 2 Stat phụ, bảng Excel mô phỏng) — không rõ đâu là "MỘT con số chính" khi nhìn từ xa; `hero` chỉ áp cho khối đầu, đúng, nhưng 2 Stat phụ + bảng Excel kéo dài trang khiến câu hỏi cốt lõi ("tiền đang kẹt ở đâu, bao nhiêu") bị loãng | TB | PRODUCT.md nguyên tắc 2 (mỗi màn 1 câu hỏi) | Cân nhắc gộp bảng Excel mô phỏng vào một Drawer/toggle thay vì luôn chiếm chỗ trong luồng chính | 1-2 giờ |
| Màn 2 | Bước 2a "BankPicker" liệt kê các ngân hàng khác ở trạng thái "Đang kết nối" (`opacity-60`, `cursor-not-allowed`) — dùng đúng semantics nhưng chữ "Đang kết nối" dễ đọc nhầm là đang xử lý thật, không phải "chưa hỗ trợ" | Thấp | Đọc từ xa — rõ nghĩa | Đổi nhãn thành "Chưa hỗ trợ" hoặc tương tự để tránh hiểu nhầm có tiến trình đang chạy | 5 phút |
| Màn 3 | Màn có 4 Stat (Đã khớp/Ngoại lệ/Hoàn/Chi ra) đồng cấp — không có "một con số chính" rõ ràng; đây là màn tổng hợp nên chấp nhận được nhưng nên xác nhận với kịch bản 4 hồi rằng câu hỏi của màn là "đối soát có tự động không", không phải một con số | Thấp | PRODUCT.md nguyên tắc 2 | Không bắt buộc sửa — ghi nhận để cân nhắc ở Vòng 9 nếu giám khảo phản hồi rối | 0 (theo dõi) |
| Màn 4 | `RECEIVABLE_UNITS.map` hiển thị 3+ thẻ đơn vị cùng lúc, cộng thêm khối Mega Sale (khi bật) và khối điểm xác thực theo kênh — nhiều tầng thông tin trên một màn, tương tự Màn 1 | TB | PRODUCT.md nguyên tắc 2, 3 | Xem xét tách "Điểm xác thực theo kênh" ra khỏi luồng chính (đã ở dạng thẻ bấm mở Drawer — có thể thu gọn hơn nữa nếu giám khảo thấy rối) | 1 giờ (chỉ nếu cần) |
| Màn 6 | `interestThousandVN` tính bằng `Math.round(... * 100) / 100` rồi nhân 1000 để ra "nghìn đồng" — đơn vị hiển thị đổi từ "triệu" sang "nghìn đồng" ngay trong cùng một màn dùng `Money` (đơn vị mặc định "triệu") ở mọi nơi khác | TB | DESIGN.md ràng buộc khóa #3 (đơn vị "triệu" nhất quán mọi nơi) | Giữ đơn vị "triệu" (số thập phân nhỏ) thay vì đổi sang "nghìn đồng", hoặc nếu cố ý đổi để tránh số 0 dài thì cần chú thích rõ đơn vị ngay cạnh số, hiện chỉ có chữ "nghìn đồng" đặt sau — dễ bị đọc nhầm khi lướt nhanh trên máy chiếu | 30 phút |
| Màn 7 | Ổn — dùng `StatusBadge`, `Timeline`, `ConfirmDialog`; nhãn nút xác nhận nêu rõ hành động; không phát hiện vấn đề mới | — | — | — | — |
| Màn 8 | Tiêu đề "Techcombank" (`text-screen-title`) và phụ đề "Cổng nghiệp vụ — tra cứu nhà bán Lan Beauty" đọc được, nhưng SurfaceFrame `bankOps` KHÔNG có icon hay dấu hiệu thị giác nào khác khung `platform` ngoài dải chữ mỏng phía trên — nếu giám khảo lỡ màn dải chữ (nhìn xa), khung 8 dễ bị nhầm với khung Nền tảng vì cả hai đều nền trắng/slate-50 | Cao | PRODUCT.md nguyên tắc 4 (3 khung phải phân biệt ngay bằng thị giác, không chỉ chữ); DESIGN.md ràng buộc khóa #2 | Thêm icon/màu nhận diện riêng cho `bankOps` (khác `bank` và `platform`) — ví dụ icon tòa nhà/ngân hàng nội bộ, hoặc viền màu khác | 1-2 giờ |
| Màn 9 | Là nội dung thay thế của Màn 6 (không phải điểm dừng riêng) — ổn theo thiết kế, `BrokenPanel` dùng đúng `red`/`StatusBadge status="broken"`; không phát hiện vấn đề mới | — | — | — | — |
| Màn 10 | Bước "sign" dùng `SurfaceFrame variant="bank"` với `bankName={quote.lender}` động — đúng khi lender khác Techcombank (Ngân hàng B) nhưng cần xác nhận `LENDER_QUOTES` không chứa tên ngân hàng thật ngoài Techcombank (đã dùng tên giả theo quy-tac.md mục 7 — xác nhận qua `mockData.js`, không đọc lại trong vòng này vì nằm ngoài src/screens) | Thấp | quy-tac.md mục 7 (cần xác nhận, không phải lỗi đã thấy) | Xác nhận `LENDER_QUOTES` trong `src/data/mockData.js` chỉ dùng tên giả cho bên cho vay khác Techcombank | 5 phút xác nhận |
| ScenarioPanel | Dùng `text-sm/text-base/text-lg/text-xl` (thang Tailwind mặc định) thay vì thang `label/body/emphasis` như các màn — về mặt cỡ chữ vẫn an toàn nhờ `tailwind.config.js` ghi đè toàn cục (16/18/20/22px), nhưng không nhất quán với quy ước "áp DESIGN.md" của các màn đã migrate | Thấp | Nhất quán hệ thống thiết kế (không phải vi phạm cỡ chữ) | Đổi sang thang `label/body/emphasis` khi có dịp sửa panel này (Vòng 11) — không cấp bách vì đây là công cụ trình diễn, không phải màn giám khảo xem trực tiếp | 30 phút |
| ScenarioPanel | Nhãn kịch bản đang bật (`activeLabel`) dùng nền cam `bg-orange-950/90` + chữ cam — orange là màu ngữ nghĩa "Tầng 3" theo CLAUDE.md; dùng lại cho một nhãn không liên quan tới Tầng 3 có thể gây hiểu nhầm cho người xem quen với bảng màu, dù panel này chủ yếu người trình bày thấy | Thấp | CLAUDE.md bảng màu ngữ nghĩa (rủi ro lẫn nghĩa, không phải lỗi nặng vì panel ẩn mặc định và không phải nội dung trình chiếu chính) | Đổi màu nhãn kịch bản sang màu trung tính (slate/navy) để tránh trùng nghĩa Tầng 3 | 10 phút |

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

- **`LEGAL_NAME` placeholder** (`src/config/brand.js:7`): không phải vi phạm
  quy-tac.md trực tiếp (không dùng tên Nền tảng ở vị trí pháp lý — đúng cơ
  chế), nhưng placeholder chưa điền là rủi ro trình diễn thật — xem hàng "Toàn
  cục" mức Cao ở bảng trên, và PRODUCT.md "Brand Commitments" (phải là "Công ty
  [tên giải pháp]").

## Tổng hợp mức độ

- Cao: 2 (placeholder `LEGAL_NAME`; Màn 8 thiếu dấu hiệu thị giác phân biệt `bankOps`)
- Trung bình: 4 (Màn 5 disclaimer đặt xa khối chi phí; Màn 1 mật độ thông tin;
  Màn 4 mật độ thông tin; Màn 6 đổi đơn vị "nghìn đồng")
- Thấp: 6 (Màn 2 nhãn "Đang kết nối"; Màn 3 không có con số chính — chỉ ghi
  nhận; Màn 10 xác nhận tên giả; ScenarioPanel thang chữ không nhất quán;
  ScenarioPanel màu cam trùng nghĩa Tầng 3; Màn 3 theo dõi)
