# Vòng 10: Vòng đời khoản phải thu — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to
> implement this plan task-by-task (CLAUDE.md mục "Quy ước plugin" cấm
> brainstorming/git worktree/subagent-driven-development cho vòng này — thực thi
> inline trong phiên hiện tại, không dispatch subagent, không tạo worktree
> riêng). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Làm cho giám khảo NHÌN THẤY một đơn vị khoản phải thu đi qua vòng đời
Dự phóng → Đã xác thực → Đã khóa → Đã tất toán (nhánh: Tất toán thiếu, Đứt gãy)
trên Màn 4, 5, 6, 9 — điểm đổi mới lõi của đề án.

**Architecture:** Chỉnh sửa 3 màn hiện có (`Screen4.jsx`, `Screen5.jsx`,
`Screen6.jsx` — Màn 9 dùng chung cây render của Screen6) và 1 component dùng
chung (`LockCertificate.jsx`), cộng 2 khối `@keyframes` CSS mới trong
`src/index.css`. Không đổi `src/logic/*`, không đổi state shape trong
`src/state/*` — chỉ đọc thêm field đã có (`settlement.initialDebt`) và thêm 2
state nội bộ nhỏ (bộ đếm "thế hệ" đổi trạng thái) trong `Screen6.jsx`.

**Tech Stack:** React + Tailwind (đã có trong repo). Hiệu ứng dùng thuần CSS
`@keyframes`/`animation` + kỹ thuật remount bằng `key` React — không thêm thư
viện animation.

**Spec:** Yêu cầu gốc (đề bài Vòng 10, dán trong hội thoại) + `CLAUDE.md` +
`DESIGN.md` + `docs/kich-ban.md` (Hồi 3, 4) + `docs/man-hinh.md` (Màn 4, 5, 6,
9) + `docs/plans/ui-roadmap.md` (mục Vòng 10) + `docs/du-lieu.md` (mục 4, 6, 7,
10, 12 — công thức và số liệu, không đổi).

## Global Constraints

- Không đổi công thức trong `src/logic/*` (yêu cầu Vòng 10). Mọi số liệu mới
  hiển thị phải tính từ `src/logic/pricing.js`/`verification.js` đã có hoặc
  đọc từ `src/data/mockData.js`, không viết cứng.
- Không thêm dependency (CLAUDE.md, yêu cầu Vòng 10 — không dùng thư viện
  animation).
- Toàn bộ giao diện tiếng Việt; thân chữ ≥16px (`text-label` trở lên), tiêu đề
  ≥24px — dùng thang chữ đã có (`text-label/body/emphasis/section-title/
  screen-title/hero`), không dùng `text-xs`/`text-sm` (CLAUDE.md #7, kiểm bởi
  `tests/quy-tac.test.js` Quy tắc 2).
- Số tiền chỉ qua `Money`/`formatNumberVN` — không viết số có đơn vị "triệu"/
  "nghìn" thành literal trong JSX của `src/screens/*` (kiểm bởi
  `tests/quy-tac.test.js` Quy tắc 4).
- Mọi khối hiện giá trị ước tính có `EstimateDisclaimer` (CLAUDE.md #4,
  `tests/quy-tac.test.js` Quy tắc 5 — áp dụng cho Screen5/Screen10, không đổi
  ở vòng này).
- Màu ngữ nghĩa cố định (CLAUDE.md "Bảng màu theo ngữ nghĩa", DESIGN.md mục
  "Ràng buộc khóa #1"): teal=tầng1/tất toán, violet=tầng2/đã khóa,
  orange=tầng3, amber=tất toán thiếu, red=đứt gãy, slate=trung tính. Hiệu ứng
  mới (viền sáng khi đổi trạng thái) dùng màu **trung tính** (slate), không
  gán ý nghĩa màu mới.
- Chuyển động chỉ dùng CSS `transition`/`animation`, tôn trọng
  `prefers-reduced-motion` — quy tắc toàn cục đã có ở `src/index.css` (rút
  `animation-duration`/`transition-duration` về `0.01ms !important`). Không
  dùng `requestAnimationFrame`/timer thô để dựng animation liên tục.
- Chân trang mọi màn: hằng số `FOOTER_NOTE` (đã có, không đổi).
- Màn liên quan tín dụng hiển thị Techcombank là bên cấp tín dụng (đã đúng ở
  Màn 5/6/9 hiện có, không đổi phần này).

## Review Focus

- **Bấm Space khi đã ở mốc cuối** (`settlement.atLastStep`): nút "Sự kiện tiếp
  theo" đã `disabled` — xác nhận highlight animation không tự kích hoạt lại
  khi `advance()` không đổi `stepIndex` (vì trạng thái RU-03/RU-04 không đổi
  thêm sau mốc cuối).
- **Bấm M/L/R liên tiếp theo mọi thứ tự** trên Màn 4/5/6: `leak` đổi thì
  `settlementState` tự `resetProgress()` (đã có, effect theo `[leak]`) — xác
  nhận bộ đếm "thế hệ" đổi trạng thái mới thêm ở Task 2 không giữ giá trị cũ
  qua lần reset này gây animate nhầm ngay khi vào lại Màn 6 (nó dùng
  `useState(0)` cục bộ trong `Screen6`, bị mount lại mỗi lần chuyển màn nên tự
  reset — nhưng cần xác nhận bằng tay vì App.jsx có thể giữ Screen6 mounted ẩn
  thay vì unmount khi chuyển màn).
- **Quay lại Màn 4 sau khi đã khóa/tất toán ở Màn 5/6** rồi tiến lại: thanh
  vòng đời dùng chung (Task 3) phải phản ánh `globalStep` mới (tính lại từ
  `settlement` mỗi render, không cache) — không kẹt ở bước cũ.
- **Mega Sale bật khi RU-03 đã Đứt gãy** (bấm L rồi M): điểm Shopee ở dòng
  gọn Task 3 phải vẫn áp `computeLeakAdjustedScore` (logic đã có, chỉ đổi
  cách trình bày) — không hiện điểm gốc 92 nhầm.
- **RU-05 khi `unit.lots` bằng hoặc vượt `MIN_LOTS_FOR_SCORE`** (không xảy ra
  với dữ liệu hiện tại nhưng badge vẫn có thể là `insufficient-history` do
  logic khác): dòng "Chưa đủ lịch sử (x/6 lô)" ở Task 3 chỉ nên hiện khi badge
  thực sự là `insufficient-history`, không phải mọi lúc `unit.lots != null` —
  đã ràng buộc đúng bằng điều kiện kép trong Task 3, ghi chú lại để không bị
  nới lỏng khi sửa sau.

---

## Task 1: Màn 5 — disclaimer cạnh "Chi phí" + phép cộng RU-03/RU-04 ở chứng thư khóa

**Files:**
- Modify: `src/screens/Screen5.jsx` (hàm `EstimateStep`, dòng ~351-381)
- Modify: `src/components/LockCertificate.jsx` (hàm `CertRow` "Giá trị khóa",
  dòng ~29-39)

**Interfaces:**
- Consumes: `EstimateDisclaimer` (đã import ở `Screen5.jsx` dòng 8), `Money`,
  `formatNumberVN` (đã import ở `LockCertificate.jsx`). Không đổi props của
  `LockCertificate` (`amounts`, `secured`, `className`).
- Produces: không có API mới — chỉ đổi JSX hiển thị.

- [ ] **Step 1: Thêm `EstimateDisclaimer` ngay dưới khối "Chi phí" ở bước 5b**

Trong `src/screens/Screen5.jsx`, hàm `EstimateStep`, sau khối `<Card>` "Chi
phí" (kết thúc dòng ~371) và trước nút "Tiếp: Ký thỏa thuận A4 →":

```jsx
      <Card>
        <div className="mb-1 text-emphasis font-semibold text-slate-900">Chi phí</div>
        <div className="divide-y divide-slate-100">
          <CostRow label="Bên cấp tín dụng" value="Techcombank" />
          <CostRow label="Lãi suất" value={`${formatPercentVN(TECHCOMBANK_QUOTE.annualRate)}/năm`} />
          <CostRow
            label={`Tiền lãi ước tính nếu tất toán sau ${INTEREST_DAYS} ngày`}
            value={`≈ ${formatNumberVN(interestEstimate)} triệu`}
          />
        </div>
      </Card>

      <EstimateDisclaimer />

      <button
```

- [ ] **Step 2: Chạy `npm test` — xác nhận Quy tắc 5 (Screen5 có
  `EstimateDisclaimer`) vẫn pass, không có regression**

Run: `npm test`
Expected: toàn bộ test pass, bao gồm `tests/quy-tac.test.js`.

- [ ] **Step 3: Sửa `CertRow` "Giá trị khóa" ở `LockCertificate.jsx` để hiện
  phép cộng có mã đơn vị**

Trong `src/components/LockCertificate.jsx`, thay khối `CertRow
label="Giá trị khóa"`:

```jsx
        <CertRow
          label="Giá trị khóa"
          value={
            <span>
              {Object.entries(amounts)
                .map(([code, value]) => `${code} ${formatNumberVN(value)}`)
                .join(' + ')}{' '}
              = <Money value={total} size="label" className="text-slate-900" />
            </span>
          }
        />
```

(chỉ đổi hàm map bên trong — từ `.map(([, value]) => formatNumberVN(value))`
thành `.map(([code, value]) => \`${code} ${formatNumberVN(value)}\`)`, giữ
nguyên phần còn lại của component).

- [ ] **Step 4: Chạy `npm test` lần nữa — xác nhận vẫn pass**

Run: `npm test`
Expected: toàn bộ test pass (không có test riêng cho `LockCertificate.jsx`,
đây là kiểm tra hồi quy qua `tests/quy-tac.test.js` + build).

- [ ] **Step 5: Commit**

```bash
git add src/screens/Screen5.jsx src/components/LockCertificate.jsx
git commit -m "Vong 10: Man 5 - disclaimer canh Chi phi, phep cong RU-03/RU-04 o chung thu khoa"
```

---

## Task 2: Màn 6 & Màn 9 — tiền lãi dùng Money("nghìn đồng") + hiệu ứng đổi trạng thái có kiểm soát

**Files:**
- Modify: `src/screens/Screen6.jsx` (imports, hàm `Screen6`, `DebtBlock`,
  `RuChip`, `NormalMilestoneDetail`)
- Modify: `src/index.css` (thêm 2 khối `@keyframes` sau khối
  `prefers-reduced-motion` hiện có, dòng ~41)

**Interfaces:**
- Consumes: `settlement.ru03Status`, `settlement.ru04Status`,
  `settlement.initialDebt` (đã có trong `useSettlement()`, không đổi shape).
- Produces: 2 class CSS mới dùng chung nếu cần ở màn khác sau này:
  `.animate-ru-badge-fade` (300ms, opacity 0→1), `.animate-ru-card-glow`
  (800ms, box-shadow mờ dần, màu slate trung tính).

- [ ] **Step 1: Thêm 2 khối `@keyframes` vào `src/index.css`**

Sau khối `@media (prefers-reduced-motion: reduce) { ... }` hiện có (kết thúc
dòng 41), thêm:

```css

/* Vòng 10 — hiệu ứng đổi trạng thái một đơn vị khoản phải thu (Màn 6/9).
   Dùng animation CSS thuần để bị chặn tự động bởi khối
   prefers-reduced-motion ở trên (animation-duration → 0.01ms !important) —
   không cần kiểm matchMedia thủ công vì không dùng setTimeout để dựng hiệu
   ứng, chỉ remount phần tử bằng key React khi trạng thái đổi. */
@keyframes ru-badge-fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes ru-card-glow {
  0% {
    box-shadow: 0 0 0 3px rgba(51, 65, 85, 0.45);
  }
  100% {
    box-shadow: 0 0 0 3px rgba(51, 65, 85, 0);
  }
}

.animate-ru-badge-fade {
  animation: ru-badge-fade 300ms ease-in-out;
}

.animate-ru-card-glow {
  animation: ru-card-glow 800ms ease-out;
}
```

- [ ] **Step 2: Thêm hook đếm "thế hệ" đổi trạng thái trong `Screen6.jsx`**

Đổi dòng import đầu file từ:

```jsx
import TopBar from '../components/ui/TopBar.jsx'
```

thành (thêm import React hooks):

```jsx
import { useEffect, useRef, useState } from 'react'
import TopBar from '../components/ui/TopBar.jsx'
```

Thêm hàm nội bộ (không export) ngay trước `export default function Screen6`:

```jsx
// Đếm số lần trạng thái RU-03/RU-04 đổi để remount RuChip theo key — animation
// CSS (ru-badge-fade, ru-card-glow ở src/index.css) tự chạy một lần khi phần tử
// được mount lại. Không dùng setTimeout để xếp trình tự nên không cần kiểm
// matchMedia thủ công: quy tắc prefers-reduced-motion toàn cục đã rút
// animation-duration về gần 0 khi người dùng bật giảm chuyển động.
function useStatusChangeGen(status) {
  const prev = useRef(status)
  const [gen, setGen] = useState(0)
  useEffect(() => {
    if (prev.current !== status) {
      prev.current = status
      setGen((g) => g + 1)
    }
  }, [status])
  return gen
}
```

- [ ] **Step 3: Dùng hook trong `Screen6` và truyền xuống `DebtBlock`**

Trong `export default function Screen6({ onNext })`, sau dòng
`const settlement = useSettlement()`, thêm:

```jsx
  const ru03Gen = useStatusChangeGen(settlement.ru03Status)
  const ru04Gen = useStatusChangeGen(settlement.ru04Status)
```

Đổi lời gọi `<DebtBlock ... />` (trong JSX return) từ:

```jsx
              <DebtBlock debt={settlement.debt} ru03Status={settlement.ru03Status} ru04Status={settlement.ru04Status} />
```

thành:

```jsx
              <DebtBlock
                debt={settlement.debt}
                ru03Status={settlement.ru03Status}
                ru04Status={settlement.ru04Status}
                ru03Gen={ru03Gen}
                ru04Gen={ru04Gen}
              />
```

- [ ] **Step 4: Sửa `DebtBlock`/`RuChip` để nhận và dùng `gen`**

Thay toàn bộ 2 hàm `DebtBlock` và `RuChip` hiện có bằng:

```jsx
function DebtBlock({ debt, ru03Status, ru04Status, ru03Gen, ru04Gen }) {
  return (
    <Card padding="p-8">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <div className="text-label font-medium text-slate-500">Dư nợ còn lại</div>
          <Money value={debt} size="hero" className="mt-1 block text-slate-900" />
        </div>
        <div className="flex gap-6">
          <RuChip code="RU-03" status={ru03Status} gen={ru03Gen} />
          <RuChip code="RU-04" status={ru04Status} gen={ru04Gen} />
        </div>
      </div>
    </Card>
  )
}

// gen > 0 nghĩa là trạng thái đã đổi ít nhất một lần kể từ khi Màn 6 mount —
// key={gen} buộc React remount div này mỗi lần đổi, animation CSS tự chạy lại.
function RuChip({ code, status, gen }) {
  const highlighted = gen > 0
  return (
    <div
      key={gen}
      className={`rounded-xl border-2 px-3 py-2 text-center ${
        highlighted ? 'animate-ru-card-glow border-slate-400' : 'border-transparent'
      }`}
    >
      <div className="mb-1 text-label font-semibold text-slate-900">{code}</div>
      <StatusBadge status={RU_STATUS[status]} className={highlighted ? 'animate-ru-badge-fade' : ''} />
    </div>
  )
}
```

- [ ] **Step 5: Đổi hiển thị tiền lãi trong `NormalMilestoneDetail` sang
  `Money` với đơn vị "nghìn đồng" + dòng phụ**

Thay khối `if (m.kind === 'settled') { ... }` hiện có bằng:

```jsx
  if (m.kind === 'settled') {
    return (
      <Card className="border-teal-600 bg-teal-50">
        <div className="text-body font-semibold text-teal-800">
          Khoản vay đã tất toán — tiền lãi{' '}
          <Money value={interestThousandVN} unit="nghìn đồng" size="body" className="text-teal-800" />
        </div>
        <div className="mt-1 text-label text-teal-700">
          trên khoản {formatNumberVN(settlement.initialDebt)} triệu, {INTEREST_DAYS} ngày
        </div>
        <div className="mt-1 text-label text-teal-700">Điểm xác thực được cập nhật sau lô tất toán.</div>
      </Card>
    )
  }
```

Ghi chú: `settlement` đã có sẵn trong tham số `NormalMilestoneDetail({
settlement, interestThousandVN })` — không cần thêm prop.

- [ ] **Step 6: Chạy `npm test` — xác nhận không có regression (không đổi
  logic, chỉ UI)**

Run: `npm test`
Expected: toàn bộ test pass.

- [ ] **Step 7: Commit**

```bash
git add src/screens/Screen6.jsx src/index.css
git commit -m "Vong 10: Man 6/9 - tien lai dung Money(nghin dong), hieu ung doi trang thai co kiem soat"
```

---

## Task 3: Màn 4 — thanh vòng đời dùng chung, sắp thẻ theo trạng thái, dòng điểm xác thực gọn, phép tính Mega Sale

**Files:**
- Modify: `src/screens/Screen4.jsx` (viết lại toàn bộ nội dung JSX của
  `export default function Screen4`, thêm 2 hàm nội bộ mới, giữ nguyên
  `settlementStatusFor`, `lifecycleFor`, `ScoreBreakdown`, `METRIC_ROWS`,
  `LIFECYCLE_STEPS`, `VERIFICATION_CHANNELS`)

**Interfaces:**
- Consumes: `computeAvailableValue` (từ `src/logic/pricing.js`, đã có, chữ ký
  `({ units, params, lockedByOthers }) => { unitBreakdown, formulaValueTotal,
  result, ... }`), `PRICING_PARAMS.megaSale` (từ `mockData.js`, đã có).
- Produces: không có API mới cho màn khác — thay đổi cục bộ trong
  `Screen4.jsx`.

- [ ] **Step 1: Thêm import còn thiếu**

Đổi khối import mockData từ:

```jsx
import {
  RECEIVABLE_UNITS,
  MEGA_SALE_UNITS,
  VERIFICATION_METRICS,
  MIN_LOTS_FOR_SCORE,
  LEAK_BATCH_RATE,
  FOOTER_NOTE,
} from '../data/mockData.js'
```

thành:

```jsx
import {
  RECEIVABLE_UNITS,
  MEGA_SALE_UNITS,
  VERIFICATION_METRICS,
  MIN_LOTS_FOR_SCORE,
  LEAK_BATCH_RATE,
  FOOTER_NOTE,
  PRICING_PARAMS,
} from '../data/mockData.js'
```

Đổi dòng import `useState` từ:

```jsx
import { useState } from 'react'
```

thành:

```jsx
import { useMemo, useState } from 'react'
```

Đổi dòng import `verification.js` — giữ nguyên (đã đủ
`computeVerificationScore, computeLeakAdjustedScore, isScoreAvailable`).

Thêm dòng import mới sau dòng import `verification.js`:

```jsx
import { computeAvailableValue } from '../logic/pricing.js'
```

- [ ] **Step 2: Thêm 2 hằng số mới sau `const METRIC_ROWS = [...]`**

```jsx
// Nhãn gọn cho dòng "Điểm xác thực theo kênh" (yêu cầu Vòng 10) — chỉ đổi
// cách hiển thị, không đổi khóa VERIFICATION_METRICS.
const CHANNEL_SHORT_LABEL = { 'Hãng vận chuyển A': 'COD' }

// Sắp thẻ đơn vị theo mức độ liên quan tới câu chuyện demo (yêu cầu Vòng 10):
// RU-03/RU-04 (sẽ khóa ở Màn 5) nổi bật nhất, rồi các đơn vị đã tất toán,
// rồi RU-05 (chưa đủ lịch sử), cuối cùng RU-06 (đơn hoàn, hiển thị gọn).
const UNIT_SORT_PRIORITY = { 'RU-03': 0, 'RU-04': 0, 'RU-01': 1, 'RU-02': 1, 'RU-05': 2, 'RU-06': 3 }
```

- [ ] **Step 3: Chạy `npm test` để xác nhận file vẫn parse được sau khi thêm
  import/hằng số chưa dùng tới (sanity check trung gian)**

Run: `npm test`
Expected: toàn bộ test pass (import/hằng số mới chưa được dùng nhưng hợp lệ
cú pháp).

- [ ] **Step 4: Viết lại thân `export default function Screen4({ onNext })`**

Thay toàn bộ nội dung hàm (từ `export default function Screen4({ onNext }) {`
tới dấu `}` đóng hàm, ngay trước `function ScoreBreakdown`) bằng:

```jsx
export default function Screen4({ onNext }) {
  const [openChannel, setOpenChannel] = useState(null)
  const { a2a4Granted } = usePermissions()
  const settlement = useSettlement()
  const { megaSale } = useScenario()

  const verifiedUnits = RECEIVABLE_UNITS.filter((u) => u.status === 'verified-then-locked')
  const pendingTotal = verifiedUnits.reduce((sum, u) => sum + u.projectedNetValue, 0)

  const sortedUnits = useMemo(
    () => [...RECEIVABLE_UNITS].sort((a, b) => (UNIT_SORT_PRIORITY[a.code] ?? 9) - (UNIT_SORT_PRIORITY[b.code] ?? 9)),
    []
  )

  // Thanh vòng đời dùng chung ở đầu màn (yêu cầu Vòng 10) — hiện bước xa nhất
  // mà bất kỳ đơn vị nào đã đạt tới, tính lại mỗi render từ settlement (không
  // cache) để phản ánh đúng khi quay lại màn này sau Màn 5/6.
  const globalStep = useMemo(() => {
    const steps = RECEIVABLE_UNITS.map((u) => {
      const s = settlementStatusFor(u, a2a4Granted, settlement)
      return lifecycleFor(u, a2a4Granted, s).step ?? 0
    })
    return Math.max(1, ...steps)
  }, [a2a4Granted, settlement])

  return (
    <div className="flex h-full flex-col">
      <TopBar screenNumber={4} />
      <div className="min-h-0 flex-1">
        <SurfaceFrame variant="platform">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 px-12 pb-3 pt-3">
              <ActProgress currentAct={actForScreen(4)} tone="light" />
            </div>

            <main className="flex-1 overflow-y-auto px-12 py-10">
              <div className="mx-auto max-w-[1536px] space-y-6">
                <h1 className="text-screen-title font-bold text-slate-900">Khoản phải thu và điểm xác thực</h1>
                <p className="text-body text-slate-600">
                  Đơn hàng đã giao nhưng sàn chưa thanh toán được gom theo kênh và cửa sổ thanh toán thành đơn vị
                  khoản phải thu.
                </p>

                <Card>
                  <div className="mb-3 text-label font-medium text-slate-500">Vòng đời một đơn vị khoản phải thu</div>
                  <div className="overflow-x-auto">
                    <Stepper steps={LIFECYCLE_STEPS} currentStep={globalStep} />
                  </div>
                </Card>

                <div className="grid grid-cols-3 gap-4">
                  {sortedUnits.map((unit) => {
                    if (unit.code === 'RU-06') return <ReversedUnitCard key={unit.code} unit={unit} />

                    const settlementStatus = settlementStatusFor(unit, a2a4Granted, settlement)
                    const lifecycle = lifecycleFor(unit, a2a4Granted, settlementStatus)
                    const isRU0304 = unit.code === 'RU-03' || unit.code === 'RU-04'
                    const willLock = isRU0304 && lifecycle.badge === 'verified'
                    const actualReceived = isRU0304
                      ? settlement.getActualReceived(unit.code)
                      : unit.status === 'settled' || unit.status === 'reversed'
                        ? unit.actualReceived
                        : null

                    return (
                      <Card key={unit.code} className={isRU0304 ? 'border-violet-300 ring-1 ring-violet-100' : ''}>
                        <div className="flex items-center justify-between">
                          <div className="text-emphasis font-semibold text-slate-900">{unit.code}</div>
                          <StatusBadge status={lifecycle.badge} />
                        </div>
                        <div className="mt-1 text-label text-slate-500">{unit.channel}</div>
                        <Money value={unit.projectedNetValue} size="section-title" className="mt-2 block text-slate-900" />
                        <div className="mt-1 text-label text-slate-500">Cửa sổ thanh toán: {unit.settlementWindow}</div>
                        {actualReceived != null && (
                          <div className="mt-1 text-label font-medium text-teal-700">
                            Thực nhận: {formatNumberVN(actualReceived)} triệu
                          </div>
                        )}
                        {willLock && <div className="mt-2 text-label font-medium text-violet-700">Sẽ khóa ở Màn 5</div>}
                        {lifecycle.badge === 'insufficient-history' && unit.lots != null && (
                          <div className="mt-2 text-label text-slate-500">
                            Chưa đủ lịch sử ({unit.lots}/{MIN_LOTS_FOR_SCORE} lô)
                          </div>
                        )}
                        {lifecycle.broken && (
                          <Callout variant="danger" className="mt-3">
                            Đứt gãy — sàn chưa thanh toán đúng hạn cho khoản này.
                          </Callout>
                        )}
                      </Card>
                    )
                  })}
                </div>

                {megaSale && (
                  <Card className="border-amber-200 bg-amber-50/40">
                    <div className="mb-3 flex items-center gap-2 text-section-title font-semibold text-slate-900">
                      Đơn vị Mega Sale
                    </div>
                    <MegaSaleCalculation />
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {MEGA_SALE_UNITS.map((unit) => (
                        <Card key={unit.code}>
                          <div className="flex items-center justify-between">
                            <div className="text-emphasis font-semibold text-slate-900">{unit.code}</div>
                            <StatusBadge status="verified" />
                          </div>
                          <div className="mt-1 text-label text-slate-500">
                            {unit.channel} · {unit.group}
                          </div>
                          <Money value={unit.projectedNetValue} size="section-title" className="mt-2 block text-slate-900" />
                          <div className="mt-1 text-label text-slate-500">Điểm xác thực: {unit.verificationScore}</div>
                        </Card>
                      ))}
                    </div>
                  </Card>
                )}

                <Card className="border-teal-200 bg-teal-50">
                  <div className="text-label font-medium text-teal-700">Đang chờ sàn thanh toán</div>
                  <div className="mt-1">
                    <Money value={pendingTotal} size="section-title" className="text-teal-700" />{' '}
                    <span className="text-body font-normal text-teal-700">
                      ({verifiedUnits.length} đơn vị đã xác thực)
                    </span>
                  </div>
                </Card>

                <Card>
                  <div className="mb-3 text-section-title font-semibold text-slate-900">Điểm xác thực theo kênh</div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-body">
                    {VERIFICATION_CHANNELS.map((channel, i) => {
                      const metrics = VERIFICATION_METRICS[channel]
                      const baseScore = computeVerificationScore(metrics)
                      const score =
                        channel === 'Shopee' && settlement.ru03Status === 'broken'
                          ? computeLeakAdjustedScore(baseScore, LEAK_BATCH_RATE)
                          : baseScore
                      const available = isScoreAvailable(score)
                      const label = CHANNEL_SHORT_LABEL[channel] ?? channel
                      return (
                        <span key={channel} className="flex items-center gap-2">
                          {i > 0 && <span className="text-slate-300">·</span>}
                          <button
                            onClick={() => setOpenChannel(channel)}
                            className="font-semibold text-slate-900 underline decoration-dotted underline-offset-4 transition hover:text-navy"
                          >
                            {label} {available ? score : 'chưa đủ lịch sử'}
                          </button>
                        </span>
                      )
                    })}
                  </div>
                  <p className="mt-3 text-label text-slate-500">
                    Điểm xác thực đo mức độ dự phóng khớp với tiền thật về tài khoản.
                  </p>
                </Card>

                <button
                  onClick={onNext}
                  className="w-full rounded-xl bg-navy py-4 text-emphasis font-semibold text-white transition hover:opacity-90"
                >
                  Xem khả năng ứng vốn →
                </button>
              </div>
            </main>

            <footer className="border-t border-slate-200 px-12 py-3 text-label text-slate-500">{FOOTER_NOTE}</footer>
          </div>
        </SurfaceFrame>
      </div>

      <Drawer open={openChannel != null} onClose={() => setOpenChannel(null)} title={openChannel ? `${openChannel} — Phân rã điểm xác thực` : ''}>
        {openChannel && (
          <ScoreBreakdown
            metrics={
              openChannel === 'Shopee' && settlement.ru03Status === 'broken'
                ? { ...VERIFICATION_METRICS[openChannel], leakRate: LEAK_BATCH_RATE }
                : VERIFICATION_METRICS[openChannel]
            }
            score={
              openChannel === 'Shopee' && settlement.ru03Status === 'broken'
                ? computeLeakAdjustedScore(computeVerificationScore(VERIFICATION_METRICS[openChannel]), LEAK_BATCH_RATE)
                : computeVerificationScore(VERIFICATION_METRICS[openChannel])
            }
          />
        )}
      </Drawer>
    </div>
  )
}

// RU-06 (đơn hoàn) hiển thị gọn — không có Stepper/cửa sổ thanh toán, chỉ
// mã, kênh, số tiền hoàn và badge (yêu cầu Vòng 10).
function ReversedUnitCard({ unit }) {
  return (
    <Card className="flex items-center justify-between">
      <div>
        <div className="text-body font-semibold text-slate-700">
          {unit.code} · {unit.channel}
        </div>
        <div className="text-label text-slate-500">Đơn hoàn</div>
      </div>
      <div className="flex items-center gap-3">
        <Money value={unit.actualReceived} size="body" className="text-slate-500" />
        <StatusBadge status="reversed" />
      </div>
    </Card>
  )
}

// Phép tính Mega Sale hiển thị như một chuỗi: tỷ lệ ứng → giá trị theo công
// thức → giá trị bị chặn bởi trần dư nợ (yêu cầu Vòng 10: "phần thay đổi phải
// thấy ngay"). Tính từ src/logic/pricing.js, không viết cứng số liệu.
function MegaSaleCalculation() {
  const pricing = useMemo(
    () => computeAvailableValue({ units: MEGA_SALE_UNITS, params: PRICING_PARAMS.megaSale, lockedByOthers: 0 }),
    []
  )
  const rate = pricing.unitBreakdown[0]?.advanceRate ?? 0

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-300 bg-white px-5 py-4 text-body">
      <span className="font-semibold text-slate-900">{formatPercentVN(rate)}</span>
      <span className="text-slate-400">→</span>
      <Money value={pricing.formulaValueTotal} size="emphasis" className="text-slate-900" />
      <span className="text-slate-400">→</span>
      <span className="font-semibold text-amber-700">
        bị chặn bởi trần dư nợ <Money value={pricing.result} size="emphasis" className="text-amber-700" />
      </span>
    </div>
  )
}
```

- [ ] **Step 5: Chạy `npm test` — xác nhận pass, đặc biệt
  `tests/quy-tac.test.js` (Quy tắc 2, 4 — không literal số có đơn vị, không
  chữ <16px)**

Run: `npm test`
Expected: toàn bộ test pass.

- [ ] **Step 6: Chạy `npm run build` — xác nhận không lỗi import/parse**

Run: `npm run build`
Expected: build thành công, không lỗi.

- [ ] **Step 7: Commit**

```bash
git add src/screens/Screen4.jsx
git commit -m "Vong 10: Man 4 - thanh vong doi dung chung, sap the theo trang thai, dong diem xac thuc gon, phep tinh Mega Sale"
```

---

## Task 4: Hardening — M/L/R mọi thứ tự, Space quá số sự kiện, quay lại rồi tiến — xác nhận trong trình duyệt

**Files:**
- Không có file bắt buộc phải sửa trước — task này XÁC NHẬN Task 1-3 không vỡ
  trạng thái. Nếu phát hiện lỗi, sửa trực tiếp trong
  `src/screens/Screen4.jsx`/`Screen6.jsx` và ghi lại là Ruling trong phần
  tổng kết (không có file kiểm thử component nào trong repo — dự án chỉ có
  test cho `src/logic/*` và `tests/quy-tac.test.js`; đây là quy ước đã có,
  không tạo test framework mới cho component).

**Interfaces:**
- Consumes: toàn bộ state đã build ở Task 1-3.
- Produces: không có.

- [ ] **Step 1: Mở dev server và duyệt qua Màn 4 → 5 → 6**

Run: `npm run dev` (hoặc dùng preview tool), mở trình duyệt ở khổ 1920×1080,
đi qua Màn 1→6 bằng phím mũi tên phải, xác nhận Màn 4 hiện thanh vòng đời một
lần + thẻ sắp theo thứ tự RU-03/RU-04 nổi bật, Màn 5 bước 5b có
`EstimateDisclaimer` ngay dưới "Chi phí", Màn 5 bước 5d chứng thư khóa hiện
"RU-03 46,75 + RU-04 38,25 = 85", Màn 6 hiện tiền lãi dạng "X nghìn đồng" kèm
dòng phụ.
Expected: không có NaN/undefined/lỗi console; mọi con số khớp
`docs/du-lieu.md`.

- [ ] **Step 2: Bấm phím M (Mega Sale) ở Màn 4, xác nhận phép tính hiện
  73,0% → 219 → "bị chặn bởi trần dư nợ 150"**

Expected: đúng 3 số theo `docs/du-lieu.md` mục 4 (advanceRate 0,73,
formulaValueTotal 219, result 150 sau trần 150); bấm M lần nữa tắt Mega Sale,
khối biến mất, không lỗi.

- [ ] **Step 3: Ở Màn 6, bấm phím Space liên tục tới hết dòng thời gian, rồi
  bấm thêm Space nhiều lần nữa sau khi đã ở mốc cuối**

Expected: nút "Sự kiện tiếp theo" tự `disabled` ở mốc cuối; bấm Space thêm sau
đó không đổi trạng thái, không kích hoạt lại animation viền sáng/badge mờ dần
(vì `ru03Status`/`ru04Status` không đổi thêm).

- [ ] **Step 4: Bấm phím L (bật rò rỉ) ở Màn 6, xác nhận dòng thời gian đổi
  sang nhánh Đứt gãy, RU-03 chuyển đỏ có animation viền sáng đúng một lần khi
  chuyển; bấm L lần nữa (tắt), rồi M, rồi R, theo nhiều thứ tự khác nhau**

Expected: không có trạng thái kẹt, không NaN/undefined; mỗi lần đổi `leak`
dòng thời gian reset về đầu (đã có logic sẵn qua `resetProgress`); bấm R từ
`ScenarioPanel`/App.jsx đưa `megaSale`/`leak`/`phase3` về false.

- [ ] **Step 5: Từ Màn 6 (đã bấm Space vài lần), bấm mũi tên trái quay lại
  Màn 5, rồi Màn 4 — xác nhận thanh vòng đời Màn 4 phản ánh đúng bước hiện
  tại (không kẹt ở bước cũ trước khi khóa)**

Expected: `globalStep` tính lại đúng theo `settlement` hiện tại — nếu RU-03/
RU-04 đã "Đã khóa" hoặc "Đã tất toán", thanh vòng đời Màn 4 hiện bước 3/4
tương ứng, không còn hiện bước 2 ("Đã xác thực") của lúc mới vào demo.

- [ ] **Step 6: Nếu Step 1-5 phát hiện lỗi, sửa và lặp lại bước liên quan cho
  tới khi sạch; nếu không phát hiện lỗi, không sửa gì**

- [ ] **Step 7: Chạy `npm test` và `npm run build` lần cuối, dán kết quả
  thật (CLAUDE.md "Quy ước plugin")**

Run: `npm test && npm run build`
Expected: cả hai lệnh thành công, 0 lỗi.

- [ ] **Step 8: Commit (chỉ nếu Step 6 có sửa gì)**

```bash
git add -A
git commit -m "Vong 10: harden - sua loi phat hien khi bam M/L/R/Space/quay lai man truoc"
```

(Bỏ qua nếu không có thay đổi nào.)

---

## Hoàn tất

Sau Task 4: tạo Pull Request tiêu đề "Vòng 10: vòng đời khoản phải thu" —
CHỈ SAU KHI `npm run build` không lỗi (CLAUDE.md "Cách làm việc").
