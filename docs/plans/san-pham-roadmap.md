# Lộ trình sản phẩm — Vòng 20–26

Dựa trên `docs/san-pham.md` và `docs/hanh-trinh.md` (Vòng 19). Thay
`docs/plans/ui-roadmap.md` (Vòng 8–11, đã xong) làm kế hoạch chính thức sau khi người
dùng duyệt Vòng 19.

Điều kiện trước Vòng 20: **đã xong** — người dùng trả lời 4 câu hỏi mở và duyệt các quyết định ở
Vòng 20 (`docs/san-pham.md` mục "Quyết định Vòng 20"; quy-tac mục 7 đã sửa).

Cập nhật ở Vòng 20 theo prompt người dùng: Vòng 20 chỉ chốt tài liệu + lõi logic, **không** sửa
`src/screens`, `src/components`; phần nối reducer vào giao diện dời sang Vòng 21.

Luật chung mọi vòng: một vòng = một nhánh `vong-NN-…` từ main mới nhất = một PR;
`npm run build` và `npm test` pass, dán kết quả thật; test T1–T10 và
`tests/quy-tac.test.js` không được nới; ảnh chụp ở 1366×768, 1536×864, 1920×1080 cho
mọi trang đã đụng; không thêm dependency; không sửa `docs/quy-tac.md`, `docs/du-lieu.md`
(trừ khi người dùng duyệt riêng). Logic mới trong `src/logic/` viết theo TDD.

Mỗi vòng giữ app **chạy được** ở cuối vòng: trang chưa chuyển vẫn là màn cũ bọc trong
khung mới, không để nhánh gãy giữa chừng.

---

## Vòng 20 — Chốt thiết kế + lõi logic sản phẩm (không đổi giao diện) — **xong**

**Phạm vi**
- Tài liệu: AGENTS.md, DESIGN.md, docs/ban-giao.md, docs/quy-tac.md (mục 7), docs/du-lieu.md
  (mục 10, 12), docs/san-pham.md, docs/hanh-trinh.md theo walkthrough Vòng 19 + quyết định
  người dùng (Hướng B cả 4 mẫu, chứng thư dùng chung mã, C khóa 44 + 36, bankOps `#141414`,
  danh sách nhiệm vụ ở cuối thanh điều hướng trái, `DISPLAY_NAME` = "[TÊN APP]").
- `src/logic/journey.js` (TDD): reducer + action, chuỗi sự kiện E0–E5, selector `simDate`,
  `unitStatus`, `activeUnits`, `loan`, `fundingFrozen`, `accessLog`, `bankView`, `tasks`,
  `availability`, `nextStep`; `loadState`/`saveState` (khóa `capix-app-v1`, try/catch, sai
  phiên bản → khởi đầu). Dùng lại pricing.js, verification.js, registry.js — không đổi công thức.

**File**: mới `src/logic/journey.js`, `src/logic/journey.test.js`; sửa `src/config/brand.js`
(`DISPLAY_NAME`) và tài liệu. Không đụng `src/screens`, `src/components`, `src/state`.

**Tiêu chí chấp nhận**
- Mỗi selector có test; mỗi dòng G.1, G.2, G.3 có trường hợp vô hiệu kiểm cả `reason` và `fix`.
- Hành trình 1: dư nợ 85 → 38,25 → 0. Hành trình 2: RU-03 đứt gãy 24/09, `fundingFrozen`, sổ
  khóa không bị xóa. Giai đoạn 3 chọn C: khóa 44 + 36.
- Không ngõ cụt: BFS trên reducer (độ sâu 14) — mọi đường dẫn sửa lỗi trỏ tới hành động bấm được.
- localStorage hỏng / sai phiên bản / bị chặn → khởi đầu. T1–T10 pass; build pass.

---

## Vòng 21 — Nối reducer, khung app, điều hướng, hệ màu Hướng B, token chuyển động

**Phạm vi**
- (Dời từ Vòng 20) Nối các màn hiện có vào reducer `journey.js` qua `src/state/appState.jsx`
  (context cũ thành lớp mỏng đọc `appState`), lưu `localStorage`; sửa 3 lỗi ngầm định trên giao
  diện: L không xóa sổ khóa (0.4.6), Mùa cao điểm không giải ngân lệch (0.4.5), dư nợ tính từ
  sổ khóa (0.4.2). Tải lại trang giữ nguyên tiến trình; `localStorage` bị chặn → app vẫn chạy.
- Bỏ `Stage` co giãn; bố cục theo px thật, rộng tối thiểu 1280 (`san-pham.md` K.5).
- Khung app nhà bán: thanh điều hướng trái 6 trang, thanh trên (tên, "Đối tác:
  Techcombank", ngày mô phỏng, nút "?"), chân trang. Điều hướng bằng URL hash.
- Token màu Hướng B và token chuyển động (K.4, L.1) vào `tailwind.config.js` +
  `src/index.css`; `navy` thành bí danh `--color-primary`.
- `SurfaceFrame variant="bank"`: thanh `#141414` + vạch đỏ 4px + vàng kim + chữ "Mô phỏng"
  (quy-tac mục 7 đã sửa ở Vòng 20); biến thể trung tính cho Ngân hàng B / CTTC C. `bankOps`:
  thanh bên `#141414`.
- Màn chuyển tiếp ngân hàng 700ms; chuyển trang View Transitions 200ms;
  `prefers-reduced-motion`.
- Bỏ `ActProgress`, `flow.js`, `journeyState.js`, nhãn "Màn X", mũi tên ← / →.

**File dự kiến**
- Mới: `src/state/appState.jsx`, `src/components/ui/AppShell.jsx`, `src/components/ui/BankHandoff.jsx`,
  `src/utils/route.js`.
- Sửa: `src/state/permissionState.jsx`, `settlementState.jsx`, `scenarioState.jsx`,
  `tailwind.config.js`, `src/index.css`, `src/components/ui/SurfaceFrame.jsx`,
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
  khung `bank` trung tính cho Ngân hàng B / Công ty tài chính C; chứng thư dùng chung mã
  `LOCK-2027-0915-00318`; chọn C khóa RU-03 44 + RU-04 36 (đã có trong `journey.js`).
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
- Màn chào, danh sách nhiệm vụ (5 + 2) ở cuối thanh điều hướng trái (không nổi đè), thẻ Bước tiếp theo trên mọi trang, chú giải thuật
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
