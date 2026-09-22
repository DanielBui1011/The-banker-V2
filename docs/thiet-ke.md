# Hệ thống thiết kế + khung trình chiếu (Vòng 7A)

Tài liệu này ghi lại hệ thống thiết kế dựng ở Vòng 7A và áp dụng thử trên Màn 1.
Mọi thay đổi giao diện từ vòng này trở đi đọc tài liệu này trước, và chỉ dùng
component trong `src/components/ui/`.

Phạm vi Vòng 7A: dựng nền (Stage, TopBar, token, component dùng chung) và áp đầy đủ
cho Màn 1. Các Màn 2–10 được đặt vào Stage/TopBar (khung sân khấu 1920×1080 và
thanh trên cùng) nhưng KHÔNG đổi nội dung/bố cục bên trong — sẽ migrate từng màn ở
các vòng sau.

## 0. Bốn bề mặt

Đây là yêu cầu pháp lý (docs/quy-tac.md mục 2, 3): nếu mọi thứ trông như app ngân
hàng, người xem sẽ hiểu Nền tảng là bên cho vay. Người xem phải phân biệt được bề
mặt đang đứng trong 1 giây.

| Bề mặt | Dùng ở | Nhận diện | Component |
|---|---|---|---|
| `platform` — Nền tảng | Màn 1, 3, 4, 7; phần của nhà bán ở 5, 6, 9, 10 | Nền slate-50, thanh trên navy, DISPLAY_NAME | `SurfaceFrame variant="platform"` |
| `bank` — Trang ngân hàng | 2b, ký A4, trả nợ một chạm, ký ở Màn 10 | Nền trắng, dải trên tối trung tính + icon khóa + "Bạn đang ở trang của {bankName}" | `SurfaceFrame variant="bank" bankName={...}` |
| `bankOps` — Cổng nghiệp vụ | Màn 8 | Nền trắng, mật độ cao hơn, nhãn "Cổng nghiệp vụ {bankName} — mô phỏng" | `SurfaceFrame variant="bankOps" bankName={...}` |
| `tech` — Hậu trường kỹ thuật | 2c OAuth, dạng kỹ thuật của chứng thư JWS | Panel nền tối, chữ monospace, nhãn "Hậu trường kỹ thuật" | `SurfaceFrame variant="tech"` |

`bankName` là tham số truyền vào, không viết cứng "Techcombank" trong component
dùng chung (màn gọi component mới truyền tên ngân hàng cụ thể).

Tinh thần: rõ ràng, bình tĩnh, đáng tin. Số tiền là điểm nhìn đầu tiên. Xác nhận
tường minh. Che thông tin nhạy cảm. Trạng thái luôn hiển thị. Không dùng: gradient,
neon, glassmorphism, bóng đậm, nhiều thẻ KPI, biểu đồ trang trí.

**Trạng thái migrate ở Vòng 7A:** SurfaceFrame đã dựng đủ 4 biến thể, nhưng Màn
2/5/6/8 hiện tại (trang ngân hàng, cổng nghiệp vụ) vẫn giữ nguyên giao diện tự vẽ
trước đó (nền trắng/xám tách biệt, đã đúng tinh thần "bề mặt khác hẳn" từ trước) —
chưa được migrate sang gọi SurfaceFrame để tránh sửa nội dung ngoài phạm vi Màn 1
của vòng này.

## 1. Sân khấu 1920×1080

`src/components/ui/Stage.jsx` — bọc toàn bộ App (`src/App.jsx`):

- Khung cố định 1920×1080, `scale = min(innerWidth/1920, innerHeight/1080)`, căn
  giữa bằng flexbox, nền ngoài `bg-slate-900`.
- Mọi kích thước bên trong Stage tính theo px sân khấu (1920×1080) — vì Stage box
  có `transform: scale(...)`, nó trở thành containing block cho mọi phần tử con
  dùng `position: fixed`, nên các lớp phủ hiện có (ScenarioPanel, bảng "Quyền của
  tôi") tự động giới hạn trong khung sân khấu mà không cần sửa.
- Phím **F**: bật/tắt toàn màn hình (`requestFullscreen`/`exitFullscreen`).
- Phím **?**: hiện/ẩn bảng phím tắt (component `KeyHint`, chế độ panel).
- Chặn mọi phím tắt (F, ?, và các phím ở `src/App.jsx`: mũi tên, M, L, 3, R) khi
  focus đang ở input/textarea/select — dùng `src/utils/keyboard.js#isTypingTarget`.

Các màn dùng `min-h-screen`/`100vh` trước đây (trang ngân hàng ở Màn 2, 5, 6, 8)
đã đổi sang `h-full` để tính theo chiều cao 1080px của Stage thay vì chiều cao
viewport thật — nếu không, ở cửa sổ khác 1920×1080 các trang này sẽ không lấp đầy
đúng khung sân khấu.

## 1.1 Cấu trúc khung (Vòng 7A-FIX)

Mọi màn, mọi bề mặt (platform/bank/bankOps/tech) dùng đúng MỘT cấu trúc:

```
Stage (1920×1080, overflow-hidden, flex flex-col)
├─ Chrome cố định (shrink-0): TopBar nếu là bề mặt platform, hoặc header của
│   frame bank/bankOps; sau đó là ActProgress
├─ <main> (flex-1 min-h-0 overflow-y-auto overscroll-contain)  ← vùng cuộn
│   DUY NHẤT của màn
│   └─ Nội dung: căn TRÊN (không flex items-center dọc), lề trên 32px
│       (pt-8), lề dưới ≥ 96px (pb-24) để không bị chip ScenarioPanel che
└─ Footer "Giao diện mô phỏng — dữ liệu giả định" (shrink-0)
```

Quy tắc bắt buộc:

- Tuyệt đối không căn giữa dọc bên trong vùng cuộn (không `items-center` trên
  trục cuộn). Nếu một màn ngắn cần cân đối thị giác, dùng
  `justify-content: safe center` (Tailwind: `justify-[safe_center]`), không
  bao giờ dùng `items-center`/`justify-center` thường trên trục có thể tràn —
  khi nội dung cao hơn khung, cách căn giữa thường sẽ cắt đều phần đầu và
  phần cuối, khiến cuộn lên hết vẫn không thấy được đầu nội dung.
- `<main>` phải có cả `flex-1` LẪN `min-h-0`: thiếu `min-h-0`, chiều cao tối
  thiểu mặc định (`auto`) của flex item khiến nó phình theo nội dung thay vì
  co lại và cuộn — dẫn tới tràn khỏi Stage mà không có thanh cuộn.
- Không dùng `position: fixed` cho phần chrome bên trong Stage, vì
  `transform: scale` trên Stage biến `fixed` thành hoạt động như `absolute`
  (đây là điều Stage cố tình khai thác cho các lớp phủ toàn màn hình như
  ScenarioPanel, không phải để dựng chrome). Chrome (TopBar/ActProgress/header
  ngân hàng) phải là phần tử nằm trong luồng flex phía trên `<main>`.
- Bỏ các vùng cuộn lồng nhau không cần thiết: chỉ `<main>` được
  `overflow-y-auto`. Một khung dùng `position: fixed inset-0` bọc ngoài
  (như overlay Màn 6/9) phải dùng `overflow-hidden` ở lớp ngoài và để
  `<main>` bên trong làm chủ việc cuộn.
- Khi chuyển màn (Stage đổi component màn), `<main>` mới luôn được mount lại
  từ đầu nên `scrollTop` tự về 0 — không cần xử lý thêm, miễn là mỗi màn vẫn
  là một component React riêng như hiện tại (không tái dùng cùng một `<main>`
  giữa các màn khác nhau).
- `SurfaceFrame` (bên trong platform/bank/bankOps/tech) và `ScreenShell`
  (platform) đều theo đúng cấu trúc này; mọi màn mới thêm sau 7B/7C phải tái
  dùng hai component này thay vì tự dựng lại `<main>`.

## 2. Token

- **Font**: Be Vietnam Pro qua `@fontsource/be-vietnam-pro` (400/500/600/700), tự
  host — nạp bằng `@import` trong `src/index.css`, không gọi Google Fonts CDN
  (CLAUDE.md #9 / docs/quy-tac.md #6). Số tiền luôn `tabular-nums` (class Tailwind
  có sẵn).
- **Thang chữ** (`tailwind.config.js` → `theme.extend.fontSize`, đặt tên riêng để
  không đụng thang `xs`..`3xl` mà các màn 2–10 chưa migrate đang dùng):

  | Token | Cỡ | Dùng cho |
  |---|---|---|
  | `text-label` | 16px | Nhãn phụ — tối thiểu tuyệt đối |
  | `text-body` | 20px | Thân bài |
  | `text-emphasis` | 24px | Nhấn |
  | `text-section-title` | 32px | Tiêu đề mục |
  | `text-screen-title` | 44px | Tiêu đề màn |
  | `text-hero` | 64px | Con số chủ đạo |

- **Lưới 8px**: dùng thang spacing mặc định của Tailwind (bội số của 4px, các giá
  trị chẵn = bội số 8px) — lề nội dung `px-12` (48px), khoảng giữa thẻ `gap-6`
  (24px).
- **Bo góc**: `rounded-xl` (12px) cho thẻ, `rounded-lg` (8px) cho nút/ô nhập —
  khớp sẵn với giá trị mặc định của Tailwind, không cần ghi đè.
- **Bóng**: tối đa `shadow-sm` — kỷ luật khi viết class, không có token riêng.
- **Chữ**: `slate-900` chính, `slate-600` phụ trên nền sáng. Không dùng chữ nhạt
  hơn `slate-600` vì máy chiếu làm mất tương phản. Tương phản ≥ 4.5:1.
- **Màu ngữ nghĩa** (giữ quy ước CLAUDE.md), mỗi màu có bộ chữ-700 / nền-50 /
  viền-600 — dùng trực tiếp bảng màu Tailwind có sẵn (teal/orange/amber/red/slate),
  riêng "Tầng 2 / đã khóa" dùng palette `violet` của Tailwind (cùng vai trò với
  "purple" trong CLAUDE.md — tên gọi khác nhau, cùng một sắc tím):
  - `teal` = Tầng 1 / đã xác thực / tất toán
  - `violet` = Tầng 2 / đã khóa
  - `orange` = Tầng 3
  - `amber` = tất toán thiếu
  - `red` = đứt gãy
  - `slate` = trung tính / dự phóng / hết hiệu lực / đã hoàn / chưa đủ lịch sử
- **Primary của Nền tảng**: `navy` (`#0B2545`, `tailwind.config.js` →
  `theme.colors.navy`). Không dùng đỏ cho ngân hàng vì đỏ đã là màu "đứt gãy".
- Trạng thái KHÔNG BAO GIỜ chỉ dựa vào màu: `StatusBadge` luôn kèm icon lucide-react
  + nhãn chữ (xem mục "Bảng trạng thái" bên dưới).
- **Chuyển động**: ≤ 200ms, không có chờ giả (trừ Màn 2d, đã có từ trước, ≤ 1,5s,
  bỏ qua được). `src/index.css` tắt animation/transition khi
  `prefers-reduced-motion: reduce`.

## 3. Cấu hình tập trung

- `src/config/brand.js`:
  - `DISPLAY_NAME` — tên hiển thị cho người dùng (TopBar, tiêu đề).
  - `LEGAL_NAME`, `TPP_CODE` — dùng ở MỌI vị trí pháp lý: bên yêu cầu cấp quyền
    trên trang ngân hàng (Màn 2, Màn 5 bước 5a), bên xử lý dữ liệu trong bảng
    quyền (`GRANTED_PERMISSIONS`), và cột "Bên truy cập" trong nhật ký quyền
    (`ACCESS_LOG`, qua `displayActor()` ở `src/state/permissionState.jsx`).
    `LEGAL_NAME` hiện là giá trị giữ chỗ `"<ĐIỀN TÊN PHÁP NHÂN>"` — điền tên pháp
    nhân thật khi nhóm quyết định, không cần sửa ở nơi nào khác.
- `src/config/flow.js`: `ACT_LABELS` (tên 4 hồi, lấy nguyên văn từ
  docs/kich-ban.md), `screenOrderFor(phase3)` và `actForScreen(screenNumber)`.
  `src/state/journeyState.js` (điều hướng mũi tên trái/phải) và
  `src/components/ScreenShell.jsx` (ActProgress) đọc từ đây — hành vi chuyển màn
  không đổi so với trước vòng này.

## 4. Component (`src/components/ui/`)

| Component | Vai trò |
|---|---|
| `Stage` | Khung sân khấu 1920×1080, phím F/?, chặn phím khi đang gõ. Bọc toàn App. |
| `TopBar` | DISPLAY_NAME · nhãn giai đoạn · ngày demo (từ mockData) · nút "Quyền của tôi" · "Màn N". Luôn nền navy. |
| `ActProgress` | 4 hồi, hồi hiện tại nổi bật. `tone="light"` (nền sáng) hoặc `tone="dark"` (màn 2–10 hiện có). |
| `SurfaceFrame` | 4 biến thể bề mặt — xem mục 0. |
| `Card` | Thẻ nền trắng, bo góc 12, `shadow-sm`. |
| `Money` | Số tiền, luôn qua `format.js`, luôn `tabular-nums`. `size`: label/body/emphasis/section-title/hero. |
| `StatusBadge` (mới, trong `ui/`) | Đọc từ bảng duy nhất `src/ui/status.js` — icon lucide + nhãn, không chỉ màu. Dùng cho các màn đã migrate; `src/components/StatusBadge.jsx` (tone + children, nền tối) vẫn phục vụ Màn 4/6/9 hiện có cho tới khi migrate. |
| `LayerTag` | Tầng 1 / 2 / 3. |
| `Stat` | Một số liệu phụ — tối đa 3 Stat mỗi hàng (do nơi gọi bố trí, ví dụ `grid-cols-3`). |
| `Stepper` | Luồng nhiều bước (ví dụ Màn 5: 5a → 5b → 5c → 5d). |
| `DataTable` | Bảng dữ liệu, hàng cao ≥ 56px (`h-14`), số căn phải. |
| `Callout` / `EstimateDisclaimer` | info / warn / danger; `EstimateDisclaimer` là biến thể cố định "Ước tính, chưa phải đề nghị cấp tín dụng" (CLAUDE.md #4). |
| `ConfirmDialog` | Hộp thoại xác nhận. |
| `Drawer` | Panel trượt từ phải. |
| `Timeline` | Chỉ-thêm-mới, ngày dạng dd/mm/yyyy. |
| `KeyHint` | Gợi ý phím dạng chip nhỏ, hoặc bảng phím tắt đầy đủ (phím ?). |

`ScenarioPanel` (`src/components/ScenarioPanel.jsx`) đã ở dạng chip góc dưới phải
từ trước vòng này, hành vi M/L/3/R giữ nguyên — không cần đổi cho Vòng 7A.

### Bảng trạng thái (`src/ui/status.js`)

Nguồn duy nhất cho `StatusBadge` mới: mỗi khóa trạng thái map tới
`{ tone, icon, label }` — `tone` là 1 trong 6 màu ngữ nghĩa ở mục 2, `icon` là tên
icon `lucide-react`, `label` là chữ tiếng Việt hiển thị cạnh icon.

## 5. Áp cho Màn 1

`src/screens/Screen1.jsx` viết lại hoàn toàn bằng component ở `src/components/ui/`:

- `TopBar` + `SurfaceFrame variant="platform"` + `ActProgress tone="light"`.
- Con số chủ đạo cỡ 64 (`Money size="hero"`): tiền đang kẹt ở sàn, tính bằng
  `computeEscrowStuck()` từ `ESCROW_STUCK.normal` (mockData) — không viết cứng
  100 triệu; kèm chú thích cách tính "= doanh thu sàn / 30 × số ngày giữ tiền".
- Thanh ngang cơ cấu doanh thu theo 4 kênh (`SALES_CHANNELS`), tô đậm phần qua
  sàn (Shopee + TikTok Shop, khớp `TOTAL_MARKETPLACE_REVENUE`) so với tổng
  `TOTAL_MONTHLY_REVENUE`.
- Hai `Stat` phụ: giờ đối soát thủ công/tháng (`SELLER_PROFILE`), lựa chọn vốn
  hiện tại (`SELLER_PROFILE.currentFundingOption`, đã chứa "2%/tháng" trong dữ
  liệu — không lặp lại số này trong component).
- Giữ nguyên khối mô phỏng bảng Excel đối soát thủ công (tái sử dụng từ bản cũ,
  theo docs/man-hinh.md) và nút "Kết nối ngân hàng" → Màn 2, chỉ đổi sang
  component/token mới.

Mọi con số trên Màn 1 lấy từ `src/data/mockData.js` hoặc tính bằng
`src/logic/pricing.js`, định dạng qua `src/utils/format.js` — không viết cứng số
trong JSX.

## Việc chưa làm ở Vòng 7A (cố ý)

- Màn 2–10 chưa migrate sang `SurfaceFrame`/component mới — chỉ được đặt vào
  Stage/TopBar (bọc ngoài), nội dung bên trong giữ nguyên.
- `src/components/StatusBadge.jsx` (bản cũ) và `src/components/ui/StatusBadge.jsx`
  (bản mới) cùng tồn tại — hợp nhất khi Màn 4/6/9 migrate.
- `SurfaceFrame variant="bank"/"bankOps"/"tech"` đã dựng nhưng chưa được các màn
  ngân hàng hiện có gọi tới (Màn 2 bước 2b/2c, Màn 5 bước 5a/5c, Màn 6 trả nợ một
  chạm, Màn 8) — các màn đó tự vẽ giao diện tách biệt riêng, đúng tinh thần nhưng
  chưa dùng chung component.
