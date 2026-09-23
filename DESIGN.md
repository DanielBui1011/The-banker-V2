# DESIGN.md — Hệ thống thiết kế (rút ra từ code, Vòng 7)

Tài liệu này mô tả ĐÚNG những gì đang tồn tại trong code tại thời điểm Vòng 7
(nhánh `vong-7-ui-audit`). Không phải đề xuất — là ảnh chụp thực tế của
`tailwind.config.js`, `src/components/ui/*`, `src/ui/status.js`, `src/config/brand.js`
và các màn `src/screens/*.jsx`. Nguồn thẩm quyền cấp cao hơn khi có mâu thuẫn:
`docs/quy-tac.md` > `CLAUDE.md` > tài liệu này > `docs/thiet-ke.md`.

## 1. Thang chữ (tailwind.config.js `theme.extend.fontSize`)

Hai thang cùng tồn tại song song:

| Token | Kích thước | Dùng ở |
|---|---|---|
| `text-xs` / `text-sm` | 16px | các màn cũ, chưa migrate |
| `text-base` | 18px | " |
| `text-lg` | 20px | " |
| `text-xl` | 22px | " |
| `text-2xl` | 26px | " |
| `text-3xl` | 34px | tiêu đề màn (thang cũ) |
| `text-label` | 16px | nhãn phụ — **sàn tuyệt đối, không được nhỏ hơn** |
| `text-body` | 20px | thân bài — chuẩn Vòng 7A |
| `text-emphasis` | 24px | nhấn |
| `text-section-title` | 32px | tiêu đề mục |
| `text-screen-title` | 44px | tiêu đề màn — chuẩn Vòng 7A |
| `text-hero` | 64px | con số chủ đạo (vd. Money size="hero") |

Toàn bộ `text-xs/sm/base/lg/xl/2xl/3xl` đã bị ghi đè ở cấp Tailwind config —
kể cả nơi dùng class Tailwind mặc định (ScenarioPanel dùng `text-sm`, `text-base`,
`text-lg`) vẫn tự động ≥16px. Đây là lưới an toàn, không phải giấy phép dùng
thang cũ ở màn mới.

Các màn đã dùng thang `label/body/emphasis/section-title/screen-title/hero`
(Vòng 7A/7C): Screen1–Screen10, ScenarioPanel dùng thang Tailwind mặc định
(đã an toàn nhờ override).

## 2. Font

`fontFamily.sans = ['"Be Vietnam Pro"', 'system-ui', 'sans-serif']`, gói qua
`@fontsource/be-vietnam-pro` (package.json, đã cài, ^5.3.0) — tự host, không gọi
Google Fonts hay CDN nào, hỗ trợ đầy đủ dấu tiếng Việt, tương thích bản
offline single-file (`npm run build:offline`).

## 3. Màu

### 3.1 Màu thương hiệu Nền tảng
`navy` (tailwind.config.js `theme.extend.colors.navy`): `DEFAULT var(--color-navy)`
(mặc định `#0B2545` ở `:root`, `src/index.css`), `50 #E7ECF2`, `600 #123A6B`,
`700 #0B2545`. Dùng cho nút hành động chính, viền nhấn trên khung Nền tảng.

**Màu hành động theo khung (Vòng 8)**: trong khung `bank`/`bankOps`, biến
`--color-navy` bị `SurfaceFrame` ghi đè thành `#0F172A` (slate-900) qua thuộc
tính `data-surface-frame` trên khung ngoài cùng — mọi `bg-navy`/`border-navy`/
`text-navy` hiện có (nút chính, `Stepper`, `ActProgress`, `ConfirmDialog`) tự
động đổi sang màu trung tính khi đang ở trang/cổng Techcombank, vì trang đó
không phải của Nền tảng. Xử lý tập trung ở `tailwind.config.js` +
`src/index.css` + `SurfaceFrame.jsx` — không sửa màu trong từng màn.

### 3.2 Màu ngữ nghĩa (từ `src/ui/status.js`, khớp CLAUDE.md)

| Tone | Màu Tailwind | Ý nghĩa |
|---|---|---|
| `tier1` | teal nhạt (nền teal-50) | Tầng 1: đã khớp, hoàn tất, quyền đang hoạt động |
| `tier1Outline` | teal viền, nền trắng | Đã xác thực (Vòng 17) |
| `tier1Solid` | teal-700 đặc, chữ trắng (≈5,5:1) | Đã tất toán (Vòng 17) |
| `tier2` | **violet** | Tầng 2 / đã khóa (đóng vai trò "purple" của CLAUDE.md — xem ràng buộc khóa #1) |
| `tier3` | orange | Tầng 3 |
| `insufficient` | amber | Tất toán thiếu |
| `broken` | red | Đứt gãy |
| `neutral` | slate | Trung tính / dự phóng / hết hiệu lực / đã hoàn |

Bốn bước vòng đời đơn vị khoản phải thu phân biệt được bằng mắt, không bước nào trùng: Dự phóng = slate; Đã xác thực = teal viền; Đã khóa = violet; Đã tất toán = teal đặc. Violet CHỈ nghĩa "đã khóa": nhãn "Đủ điều kiện ứng vốn" và viền thẻ RU-03/RU-04 ở Màn 4 dùng navy/slate đậm kèm icon (`ShieldCheck`), không dùng violet. `LifecycleTrail` (`src/components/ui/`) vẽ vệt 4 chấm trong thẻ, chấm hiện tại được tô bằng màu của bước đó.

Mọi `StatusBadge` (`src/components/ui/StatusBadge.jsx`) đọc từ bảng này —
KHÔNG map màu trực tiếp trong màn. Mỗi trạng thái LUÔN có icon lucide-react +
nhãn chữ, không bao giờ chỉ màu.

## 4. Component dùng chung (`src/components/ui/*`)

- `Card` — `rounded-xl border border-slate-200 bg-white shadow-sm`, `padding` mặc định `p-6`.
- `Money` — luôn qua `formatNumberVN`, luôn `tabular-nums`, đơn vị mặc định "triệu" hiện kèm.
- `StatusBadge` — icon + nhãn chữ, đọc `src/ui/status.js`.
- `Callout` — 3 biến thể `info/warn/danger`; `EstimateDisclaimer` là biến thể cố định bọc `ESTIMATE_DISCLAIMER`.
- `SurfaceFrame` — 4 biến thể `platform/bank/bankOps/tech`, là cơ chế DUY NHẤT phân biệt 3 khung vai trò (xem mục 6).
- `Stepper`, `Timeline`, `DataTable`, `Drawer`, `ConfirmDialog`, `SegmentedControl`, `ToggleSwitch`, `LayerTag`, `TopBar`, `ActProgress`, `Stat`, `KeyHint`.
- `src/components/LockCertificate.jsx`, `src/components/ScenarioPanel.jsx` — component riêng cho một màn/chức năng, không thuộc `ui/`.

## 5. Khung vai trò (`SurfaceFrame`)

| variant | Dùng cho | Dải nhận diện |
|---|---|---|
| `platform` | Ứng dụng Nền tảng (nhà bán) | không có dải, nền `bg-slate-50` |
| `bank` | Trang Techcombank (A1/A2/A4, ký thỏa thuận) | dải tối `bg-slate-800`, icon khóa + "Bạn đang ở trang của {bankName}" |
| `bankOps` | Cổng nghiệp vụ nội bộ ngân hàng (Màn 8) | thanh điều hướng dọc bên trái `bg-slate-700` (không phải strip ngang) — icon `Landmark`, nhãn "Nội bộ — mô phỏng", 3 mục điều hướng bấm được ("Tra cứu nhà bán" mặc định, "Danh mục khóa", "Cảnh báo" có chấm đếm đỏ khi có cảnh báo) — màn truyền qua prop `nav` (Vòng 18) |
| `tech` | Hậu trường kỹ thuật (terminal OAuth Màn 2, JWS Màn 5) | nền đen `bg-slate-950`, font mono |

## 6. Số tiền

`Money` (`src/components/ui/Money.jsx`) + `formatNumberVN` (`src/utils/format.js`)
là đường DUY NHẤT hiển thị số tiền; luôn `tabular-nums`; đơn vị "triệu" đi kèm
mặc định. Bảng (`DataTable`, các bảng viết tay ở Screen1/3/8) căn phải cột số
bằng `text-right`/`align: 'right'` + `tabular-nums`.

## 7. Tên hiển thị pháp lý

`src/config/brand.js`: `DISPLAY_NAME` (thanh trên cùng, không mang tính pháp lý)
vs. `LEGAL_NAME` + `TPP_CODE` (mọi vị trí pháp lý — bên yêu cầu cấp quyền trên
trang ngân hàng, bảng quyền, nhật ký truy cập). `LEGAL_NAME` = `'Công ty [Tên
giải pháp]'` (Vòng 8) — dạng khung vuông có chủ đích, không phải placeholder
chưa điền (không chứa `<`, không trùng `DISPLAY_NAME`, có test ở
`src/config/brand.test.js`).

---

## Ràng buộc khóa — Vòng 7

Các mục dưới đây là ràng buộc CỨNG cho Vòng 8–11. Không được nới lỏng vì lý do
thẩm mỹ; xung đột giải quyết theo thứ tự `docs/quy-tac.md` > đọc được trên máy
chiếu 1920×1080 > ít code (CLAUDE.md mục "Quy ước plugin").

1. **Màu ngữ nghĩa cố định**: teal = Tầng 1/tất toán; purple (hiện thực bằng
   `violet` trong Tailwind) = Tầng 2/đã khóa; orange = Tầng 3; amber = tất toán
   thiếu; red = đứt gãy; gray = trung tính. MỌI trạng thái phải có nhãn chữ +
   biểu tượng đi kèm màu — không bao giờ chỉ dựa vào màu, vì orange/amber dễ
   lẫn trên máy chiếu. `StatusBadge` đã tuân thủ điều này; mọi màn mới hoặc sửa
   lại PHẢI đi qua `StatusBadge`/`src/ui/status.js`, không tự vẽ chip màu rời.

2. **Ba khung vai trò phải phân biệt rõ bằng thị giác**:
   (a) ứng dụng Nền tảng (nhà bán) — nền `slate-50`, không dải nhận diện;
   (b) trang Techcombank — nền sáng riêng, LUÔN có dải "Bạn đang ở trang của
   Techcombank"; KHÔNG dùng đỏ làm màu thương hiệu Techcombank (đỏ đã có nghĩa
   "đứt gãy" trong hệ thống — `SurfaceFrame variant="bank"` hiện dùng
   `slate-800`, đúng quy tắc, phải giữ nguyên);
   (c) bảng điều khiển nội bộ ngân hàng (Màn 8, `variant="bankOps"`) — giao
   diện khác hẳn hai khung kia (Vòng 8: thanh điều hướng dọc bên trái
   `bg-slate-700` + icon `Landmark`, không phải strip ngang như `bank`, không
   dùng đỏ/navy/`slate-800`). Chỉ thay đổi 3 khung này qua `SurfaceFrame`,
   không tạo khung rời trong từng màn.

3. **Thang chữ cho máy chiếu 1920×1080**: thân chữ khuyến nghị 20px
   (`text-body`), tối thiểu 16px (`text-label`, theo CLAUDE.md). Tiêu đề màn
   tối thiểu 32px (`text-section-title`) — cao hơn mức tối thiểu 24px của
   CLAUDE.md vì đây là khuyến nghị mới cho trình chiếu; `text-screen-title`
   (44px) là chuẩn hiện tại cho `<h1>` mỗi màn, giữ nguyên. Số tiền dùng
   `tabular-nums`, căn phải trong bảng, đơn vị "triệu" nhất quán mọi nơi — chỉ
   qua component `Money`.

4. **Font**: phải hỗ trợ đầy đủ dấu tiếng Việt, đóng gói cục bộ (bản offline
   single-file không được phụ thuộc Google Fonts hay CDN nào). Dự án ĐÃ dùng
   `@fontsource/be-vietnam-pro` (đã trong package.json, đã đóng gói cục bộ, hỗ
   trợ tiếng Việt) — đây là lựa chọn HIỆN TẠI, không phải đề xuất mới, không
   được đổi. Phương án tham khảo (CHƯA CÀI, không tự ý đổi font):
   - Be Vietnam Pro variable font (đang dùng) — ước lượng ~200–350KB cho bộ
     variable Latin+Vietnamese đầy đủ, đã đóng gói cục bộ, không cần subset thủ công.
   - Inter + subset tiếng Việt riêng — ước lượng nhỏ hơn nếu subset kỹ
     (~80–150KB cho 2–3 trọng lượng), nhưng cần tự làm subset tiếng Việt (Inter
     mặc định không đảm bảo phủ đủ dấu) và tốn công đóng gói thêm; không có lý
     do để đổi trong phạm vi vòng 7-11.

5. **Chuyển động**: CHỈ dùng để thể hiện đổi trạng thái đơn vị khoản phải thu
   (vd. Đã khóa → Đã tất toán, hay hiệu ứng luồng OAuth ở Màn 2/terminal). Phải
   tôn trọng `prefers-reduced-motion` — đã có `@media (prefers-reduced-motion:
   reduce)` toàn cục trong `src/index.css` (rút animation/transition về 0.01ms),
   giữ nguyên cơ chế này, không thêm animation nào bỏ qua nó (vd. animation
   dựng bằng `requestAnimationFrame`/JS timer thô sẽ không tự động bị chặn bởi
   CSS media query — Màn 1/2/5/6/9 hiện dùng `setTimeout` để dựng hiệu ứng theo
   bước, không phải animation liên tục, nên rủi ro thấp nhưng cần soát lại nếu
   thêm hiệu ứng mới ở Vòng 8-11). KHÔNG dùng easing kiểu bounce/elastic — chỉ
   ease chuẩn (`transition` mặc định Tailwind = ease-in-out, hoặc linear ngắn
   cho hiệu ứng terminal/stepper).

6. **Tên hiển thị ở vị trí pháp lý** (bên yêu cầu cấp quyền A1/A2, bên ký thỏa
   thuận A4) dùng "Công ty [tên giải pháp]" — KHÔNG dùng tên thương hiệu Nền
   tảng ở đó, kể cả trên thanh tiêu đề khi đang ở khung Techcombank. Cơ chế:
   `LEGAL_NAME` trong `src/config/brand.js`, dùng ở Screen2/Screen5
   (`Bên yêu cầu`) — đã điền `'Công ty [Tên giải pháp]'` (Vòng 8), không còn
   placeholder `<...>`. Không dùng `DISPLAY_NAME` ("Đừng Đóng Vai Anh") ở các
   vị trí pháp lý; `TopBar` (mang `DISPLAY_NAME`) không render bên trong
   `SurfaceFrame` variant `bank`/`bankOps` ở bất kỳ màn nào (rà `src/screens/`).

7. **Màu hành động theo khung**: trong khung `bank`/`bankOps`, nút hành động
   chính và mọi chi tiết khác đọc token `navy` (`Stepper`, `ActProgress`,
   `ConfirmDialog`, các nút viết tay trong màn) KHÔNG được hiện màu thương
   hiệu Nền tảng, vì đó là trang/cổng của Techcombank. Cơ chế (Vòng 8):
   `--color-navy` là biến CSS (`src/index.css`), `SurfaceFrame` gắn
   `data-surface-frame` trên khung ngoài cùng và selector
   `[data-surface-frame='bank'], [data-surface-frame='bankOps']` ghi đè biến
   này thành `#0F172A` (slate-900). Sửa màu ở đây, không sửa từng màn.

8. **Tương phản chữ (Vòng 16)**: mọi chữ mang nội dung đạt ≥4,5:1 so với nền
   (WCAG AA). Không làm mờ nội dung bằng `opacity-*` hay `text-slate-100…400`;
   chữ phụ tối thiểu `slate-600` trên nền trắng, chữ trên nền tối dùng
   `text-slate-50`/`text-white`. Hiệu ứng hiện dần phải kết thúc ở opacity 1
   (và hiện ngay khi `prefers-reduced-motion`). `tests/quy-tac.test.js` quy tắc 8
   chặn tái phạm; chỉ biến thể trạng thái (`disabled:`, `hover:`) được phép.
