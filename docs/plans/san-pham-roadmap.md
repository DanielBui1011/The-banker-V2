# Lộ trình sản phẩm — Vòng 20–26

Dựa trên `docs/san-pham.md` và `docs/hanh-trinh.md` (Vòng 19). Thay
`docs/plans/ui-roadmap.md` (Vòng 8–11, đã xong) làm kế hoạch chính thức sau khi người
dùng duyệt Vòng 19.

Điều kiện trước Vòng 20: người dùng duyệt các đề xuất sửa `AGENTS.md`, `DESIGN.md`,
`docs/ban-giao.md`, `PRODUCT.md`, `CLAUDE.md` và trả lời 4 câu hỏi mở cuối
`docs/san-pham.md` — đặc biệt câu 1 (quy-tac mục 7), vì nó chặn phần khung Techcombank
ở Vòng 21.

Luật chung mọi vòng: một vòng = một nhánh `vong-NN-…` từ main mới nhất = một PR;
`npm run build` và `npm test` pass, dán kết quả thật; test T1–T10 và
`tests/quy-tac.test.js` không được nới; ảnh chụp ở 1366×768, 1536×864, 1920×1080 cho
mọi trang đã đụng; không thêm dependency; không sửa `docs/quy-tac.md`, `docs/du-lieu.md`
(trừ khi người dùng duyệt riêng). Logic mới trong `src/logic/` viết theo TDD.

Mỗi vòng giữ app **chạy được** ở cuối vòng: trang chưa chuyển vẫn là màn cũ bọc trong
khung mới, không để nhánh gãy giữa chừng.

---

## Vòng 20 — Trạng thái miền và logic hành trình (không đổi giao diện)

**Phạm vi**
- Hàm thuần mới: `simDate`, `unitStatus`, `activeUnits`, `loan`, `fundingFrozen`,
  `accessLog`, `bankView`, `tasks`, `availability`, `nextStep`, chuỗi sự kiện E0–E5
  (`docs/san-pham.md` mục E.1, F, G, D.2, D.3).
- Reducer duy nhất + lưu `localStorage` (khóa `ddva-app-v1`, `try/catch`, sai phiên bản →
  khởi đầu).
- Nối các màn hiện có vào reducer mới qua lớp tương thích (context cũ đọc từ reducer),
  sửa 3 lỗi ngầm định: L không xóa sổ khóa (0.4.6), Mega Sale không giải ngân lệch
  (0.4.5), dư nợ tính từ sổ khóa (0.4.2).

**File dự kiến**
- Mới: `src/logic/journey.js`, `src/logic/journey.test.js`, `src/state/appState.jsx`.
- Sửa: `src/state/permissionState.jsx`, `src/state/settlementState.jsx`,
  `src/state/scenarioState.jsx` (thành lớp mỏng đọc `appState`), `src/App.jsx`.
- Không đụng: `src/logic/pricing.js`, `verification.js`, `registry.js`,
  `src/data/mockData.js` (chỉ thêm chuỗi sự kiện nếu cần, số lấy từ du-lieu).

**Tiêu chí chấp nhận**
- Test cho từng selector: 01/08 chưa A1 → không tua được; A1 → tua tới 15/09; 15/09 chưa
  giải ngân → không tua được, lý do đúng câu mục G; giải ngân → dư nợ 85; trả RU-03 →
  38,25; trả RU-04 → 0, A4 chấm dứt; Đổi tài khoản → 24/09 RU-03 đứt gãy, điểm Shopee 58;
  Mùa cao điểm → Ký A4 vô hiệu; mọi `availability` trả `reason` + `fix` khi `ok = false`.
- Test "không ngõ cụt": duyệt mọi trạng thái đạt được bằng các hành động hợp lệ (BFS trên
  reducer, giới hạn độ sâu) → mỗi trạng thái có ≥ 1 hành động `ok` ngoài "Bắt đầu lại".
- Tải lại trang giữ nguyên tiến trình; `localStorage` bị chặn → app vẫn chạy.
- T1–T10 pass; build pass.

---

## Vòng 21 — Khung app, điều hướng, hệ màu Hướng B, token chuyển động

**Phạm vi**
- Bỏ `Stage` co giãn; bố cục theo px thật, rộng tối thiểu 1280 (`san-pham.md` K.5).
- Khung app nhà bán: thanh điều hướng trái 6 trang, thanh trên (tên, "Đối tác:
  Techcombank", ngày mô phỏng, nút "?"), chân trang. Điều hướng bằng URL hash.
- Token màu Hướng B và token chuyển động (K.4, L.1) vào `tailwind.config.js` +
  `src/index.css`; `navy` thành bí danh `--color-primary`.
- `SurfaceFrame variant="bank"`: thanh đen + vạch đỏ + vàng kim **chỉ khi** quy-tac mục 7
  đã được sửa; nếu chưa, giữ `slate-800`.
- Màn chuyển tiếp ngân hàng 700ms; chuyển trang View Transitions 200ms;
  `prefers-reduced-motion`.
- Bỏ `ActProgress`, `flow.js`, `journeyState.js`, nhãn "Màn X", mũi tên ← / →.

**File dự kiến**
- Mới: `src/components/ui/AppShell.jsx`, `src/components/ui/BankHandoff.jsx`,
  `src/utils/route.js`.
- Sửa: `tailwind.config.js`, `src/index.css`, `src/components/ui/SurfaceFrame.jsx`,
  `src/components/ui/TopBar.jsx`, `src/App.jsx`, `src/ui/status.js` (chỉ `broken` →
  nền đặc), `src/components/ui/StatusBadge.jsx`, `tests/quy-tac.test.js` (cập nhật quét
  cho token mới, **không nới** luật màu ngữ nghĩa).
- Xóa: `src/components/ui/Stage.jsx`, `src/components/ui/ActProgress.jsx`,
  `src/config/flow.js`, `src/state/journeyState.js`.

**Tiêu chí chấp nhận**
- Ở 1366×768 chữ nhỏ nhất đo được ≥ 16px thật; không cuộn ngang ở cả 3 kích thước.
- Mọi cặp chữ/nền ≥ 4,5:1 (đo bằng script như `docs/palette.html`).
- Đỏ `#E3262B` chỉ xuất hiện trong `SurfaceFrame variant="bank"` (test quét).
- Không còn chuỗi "Màn " trong `src/components/`, `src/screens/`.
- Tắt `prefers-reduced-motion` / bật: có / không có hiệu ứng; không hiệu ứng > 400ms trừ
  màn chuyển tiếp.

---

## Vòng 22 — Tổng quan, Quyền & dữ liệu, luồng A1

**Phạm vi**
- Tổng quan (gộp Màn 1 + 2a), trạng thái trước/sau kết nối, thẻ Bước tiếp theo.
- Trang Techcombank A1 dạng chuyển hướng (giữ `ConsentPage`); quay về Đối soát.
- Quyền & dữ liệu (Màn 7 thành trang thường): rút/cấp lại qua trang Techcombank thật (A2
  cấp lại không còn kích hoạt ngay), nhật ký theo ngày mô phỏng, liên kết "Xem hậu trường
  kỹ thuật" (terminal 2c, khung `tech`).
- Trạng thái trống có hướng dẫn cho Đối soát / Khoản phải thu / Ứng vốn / Khoản vay.

**File dự kiến**
- Mới: `src/pages/TongQuan.jsx`, `src/pages/QuyenDuLieu.jsx`, `src/pages/bank/A1.jsx`,
  `src/components/ui/NextStepCard.jsx`, `src/components/ui/EmptyState.jsx`.
- Sửa: `src/components/ui/ConsentPage.jsx` (chỉ nhận `onApprove` điều hướng, không đổi bố
  cục pháp lý), `src/screens/Screen1.jsx`, `Screen2.jsx`, `Screen7.jsx` (tách phần tái
  dùng rồi xóa).
- Đổi tên thư mục `src/screens/` → `src/pages/` dần; cập nhật đường quét trong
  `tests/quy-tac.test.js` và `CLAUDE.md`.

**Tiêu chí chấp nhận**
- Hành trình 1 bước 1.1–1.6 chạy đúng từng dòng của `docs/hanh-trinh.md`.
- Ô xác nhận A1 không tích sẵn; "Bạn đang ở trang của Techcombank" luôn hiện; bên yêu cầu
  = `LEGAL_NAME` + `TPP_CODE`.
- Rút A2 → A1 vẫn "Đang hoạt động"; nhật ký thêm đúng dòng với ngày mô phỏng.

---

## Vòng 23 — Đối soát, Khoản phải thu, bảng điều khiển mô phỏng

**Phạm vi**
- Đối soát (Màn 3) và Khoản phải thu (Màn 4) đọc selector; thẻ tóm tắt "6 tuần sau".
- Bảng điều khiển mô phỏng mới (`san-pham.md` mục C): vai, ngày + Tua, 3 tình huống có
  điều kiện, Bắt đầu lại có xác nhận, phím tắt dùng chung `availability`, thông báo ngắn.
- Cổng nội bộ ngân hàng tối thiểu để đổi vai được (khung + Tra cứu đọc `bankView`).

**File dự kiến**
- Mới: `src/pages/DoiSoat.jsx`, `src/pages/KhoanPhaiThu.jsx`,
  `src/components/SimPanel.jsx`, `src/components/ui/Toast.jsx`.
- Sửa/xóa: `src/components/ScenarioPanel.jsx` (thay bằng `SimPanel`),
  `src/components/ui/KeyHint.jsx`, `src/screens/Screen3.jsx`, `Screen4.jsx`.

**Tiêu chí chấp nhận**
- Hành trình 1 bước 1.7–1.9 đúng; 76%, 98,3%, điểm 92/90, 4/6 lô hiện đúng.
- Mọi phím M/L/3/R/Space bị chặn khi không đủ điều kiện, hiện lý do, không đổi state.
- Bấm mọi tổ hợp phím và tua quá số sự kiện: không NaN/undefined (test reducer + kiểm tay).

---

## Vòng 24 — Ứng vốn, Khoản vay, trả nợ

**Phạm vi**
- Ứng vốn 4 bước (A2 → ước tính → A4 → gửi), chuyển bước trượt 12px, thanh bước tô dần.
- Trang Techcombank A2, A4, Trả nợ một chạm dạng chuyển hướng.
- Khoản vay (Màn 6): dòng thời gian theo ngày mô phỏng, trả nợ, chứng thư khóa, dấu tích
  hoàn tất, badge mờ dần.
- Mẫu nút vô hiệu + lý do + đường dẫn dùng chung.

**File dự kiến**
- Mới: `src/pages/UngVon.jsx`, `src/pages/KhoanVay.jsx`, `src/pages/bank/A2.jsx`,
  `src/pages/bank/A4.jsx`, `src/pages/bank/TraNo.jsx`,
  `src/components/ui/GatedButton.jsx`, `src/components/ui/DoneCheck.jsx`.
- Sửa/xóa: `src/screens/Screen5.jsx`, `Screen6.jsx`, `src/components/LockCertificate.jsx`,
  `src/components/ui/Stepper.jsx`.

**Tiêu chí chấp nhận**
- Hành trình 1 bước 1.10–1.22 đúng từng dòng; 85, 46,75, 38,25, 140 nghìn đồng.
- "Ước tính, chưa phải đề nghị cấp tín dụng" cạnh mọi giá trị ước tính; Techcombank là
  bên cấp tín dụng ở mọi bước tín dụng; không cụm từ cấm (test quy-tac).
- Dư nợ đổi ngay, không chạy số.

---

## Vòng 25 — Tình huống: Đổi tài khoản nhận tiền, Mùa cao điểm, Giai đoạn 3; cổng ngân hàng đầy đủ

**Phạm vi**
- Đổi tài khoản nhận tiền (thay Màn 9): nhánh E2–E5, đứt gãy, giải trình, trả từ nguồn
  khác, đóng băng/mở lại.
- Mùa cao điểm: RU-M1/RU-M2, 73% → 219 → 150, Ký A4 vô hiệu có lý do.
- Giai đoạn 3 (thay Màn 10): chọn bên nhận, 3 chào giá, ký với bên được chọn, ghi sổ khóa;
  khung `bank` trung tính cho Ngân hàng B / Công ty tài chính C; xử lý theo câu trả lời
  câu hỏi mở 2.
- Cổng nội bộ: Danh mục khóa, Cảnh báo, phím D, phơi nhiễm chéo T3 — đọc sổ khóa theo
  ngày.

**File dự kiến**
- Mới: `src/pages/ngan-hang/TraCuu.jsx`, `DanhMucKhoa.jsx`, `CanhBao.jsx`,
  `src/pages/bank/LenderSign.jsx`.
- Sửa/xóa: `src/screens/Screen8.jsx`, `Screen9.jsx`, `Screen10.jsx`,
  `src/data/mockData.js` (xóa `BANK_VIEW` nếu `bankView` thay hết).

**Tiêu chí chấp nhận**
- Hành trình 2 và 3 đúng từng dòng; điểm 92 → 58 (T10); 85 → 50 (T3).
- Không nơi nào trong cổng ngân hàng hiện tên bên khóa (test quét + kiểm bước 3.16).
- Đỏ chỉ xuất hiện ở RU-03 đứt gãy và vạch khung Techcombank.

---

## Vòng 26 — Hướng dẫn 5 lớp, kiểm thử người lạ, đóng gói

**Phạm vi**
- Màn chào, danh sách nhiệm vụ (5 + 2), thẻ Bước tiếp theo trên mọi trang, chú giải thuật
  ngữ tại chỗ (popover, bàn phím dùng được), nút "?" và ngăn Hướng dẫn.
- Kiểm thử với 3 người chưa từng xem: tự làm 5 nhiệm vụ không được giúp, ghi thời gian và
  chỗ vấp; sửa những chỗ vấp nằm trong phạm vi.
- `npm run build:offline` (font nhúng, không request mạng); đường dẫn Vercel.

**File dự kiến**
- Mới: `src/components/guide/Welcome.jsx`, `Checklist.jsx`, `GlossaryTerm.jsx`,
  `HelpDrawer.jsx`, `src/data/glossary.js` (từ `san-pham.md` mục H).
- Sửa: `src/components/ui/AppShell.jsx`, các trang (bọc thuật ngữ).
- Tài liệu: `docs/kiem-thu-nguoi-la.md` (kết quả).

**Tiêu chí chấp nhận**
- Người lạ hoàn thành 5 nhiệm vụ bắt buộc trong ≤ 5 phút, không hỏi ai.
- Mọi thuật ngữ mục H có chú giải ở lần xuất hiện đầu mỗi trang; mở/đóng bằng bàn phím.
- Không dùng thư viện tour; không thêm dependency.
- Bản offline mở bằng `file://` chạy hết 3 hành trình.
