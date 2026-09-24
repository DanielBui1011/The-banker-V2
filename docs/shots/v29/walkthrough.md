# Walkthrough ảnh chụp v29

Công cụ: `npm run shots -- v29` (scripts/shots.mjs, 69 cảnh trong scripts/shots.scenes.js — 57 cảnh v28 + 12 cảnh mới), chạy
ngày 24/09/2026 trên Windows 11, trình duyệt **Google Chrome 153.0.8010.53** có sẵn trên máy (như v28). Bản chụp: `npm run build`
+ `vite preview` cổng 4173, commit `bb6f1e2`.

- Ảnh: `docs/shots/v29/png/` (101 file: 69 ảnh 1366 + 32 ảnh 1920 — không commit, có trong .gitignore)
- `contact-sheet.pdf`: 118 trang, 10,8 MB (JPEG chất lượng 0,8)
- `bao-cao.json`: chiều cao ảnh, lỗi thao tác, lỗi console từng cảnh

Cách đọc ảnh 1366 giống v28: **phần trên vạch đứt đỏ (y = 768) là phần thấy ở màn hình đầu 1366×768**. Công cụ chụp ở chế độ
`reducedMotion`.

## 1. Trạng thái repo

- Nhánh: `vong-29-truoc-sau` (tạo từ `main` @ `b5ea385`)
- 3 commit: logic `8e4d9ca` (TDD), giao diện `2c2f0a3`, cảnh chụp + sửa sau lần chụp đầu `bb6f1e2`
- Lần chụp đầu (ở `2c2f0a3` + cảnh mới) lộ 1 lỗi bố cục: ở c09 badge "Đã trả từ nguồn khác" rộng làm cột "Đơn vị" / "Đã bị khóa"
  của bảng Tra cứu gãy dòng ("RU-⏎04", "38,25⏎triệu"). Đã sửa ở `bb6f1e2` (ô mã và ô số `whitespace-nowrap`) rồi chụp lại toàn bộ;
  ảnh trong thư mục là của lần chụp lại.
- `src/logic/journey.js` đổi theo yêu cầu vòng này (trạng thái `repaid-other`, `breakResolved`, `ru03Broke`,
  `bankView.resolvedAlerts`, thẻ kết `tryScenarios`, hành động `tryScenario`); `src/logic/reconciliation.js` thêm `autoMatchRate`.
  **Không đổi công thức** (pricing.js, verification.js, registry.js không động tới; T1–T10 vẫn pass).

`npm run build` (nguyên văn, bỏ các dòng font):

```
vite v5.4.21 building for production...
✓ 1941 modules transformed.
dist/index.html                                                      0.70 kB │ gzip:   0.47 kB
dist/assets/index-DBTmErU6.css                                      35.96 kB │ gzip:   7.29 kB
dist/assets/index-DTB2wPlF.js                                    1,363.51 kB │ gzip: 286.83 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 9.05s
```

`npm test` (nguyên văn, bỏ các dòng test con):

```
 ✓ src/logic/registry.test.js (3 tests) 7ms
 ✓ src/config/brand.test.js (5 tests) 5ms
 ✓ src/logic/reconciliation.test.js (4 tests) 5ms
 ✓ src/logic/verification.test.js (6 tests) 7ms
 ✓ src/components/ui/ConsentPage.test.js (3 tests) 5ms
 ✓ src/logic/pricing.test.js (12 tests) 9ms
 ✓ src/utils/format.test.js (5 tests) 31ms
 ✓ src/utils/route.test.js (6 tests) 7ms
 ✓ tests/quy-tac.test.js (14 tests) 301ms
 ✓ src/logic/journey.test.js (124 tests) 7604ms

 Test Files  10 passed (10)
      Tests  182 passed (182)
   Start at  20:47:21
   Duration  8.95s (transform 448ms, setup 0ms, collect 1.29s, tests 7.98s, environment 3ms, prepare 2.54s)
```

Số test tăng 174 → 182 so với v28. Test mới trong vòng này (viết trước, đã thấy đỏ rồi mới viết logic):
- `journey.test.js` **"Vòng 29 — đứt gãy → giải trình → trả RU-03 từ nguồn khác"**: vai nhà bán (broken → vẫn broken sau giải trình →
  `repaid-other` sau khi trả; `breakResolved`; điểm Shopee giữ 58 qua `ru03Broke`; hết đóng băng; dư nợ 38,25) và vai cán bộ
  (`alerts` mở → rỗng; `resolvedAlerts` có RU-03; RU-03 khóa 0, 0 bên).
- `journey.test.js` **"Vòng 29 — xong 5 nhiệm vụ"**: thẻ kết ở cả 6 trang nhà bán; `tryScenario` khi phải bắt đầu lại (về 01/08, bật
  tình huống, giữ chế độ hướng dẫn) và khi bật được ngay (giữ tiến trình); tình huống đã làm không gợi ý lại.
- `reconciliation.test.js` `autoMatchRate` = 0,76 (dùng chung cho Đối soát và Tổng quan).
- `journey.test.js` "một nút đặc mỗi trang" không đếm Tua (thao tác mô phỏng).
- `tests/quy-tac.test.js` **quy tắc 12**: file vẽ đường dẫn động (`href={….fix.href}` / `href={….action.href}`) phải rẽ nhánh qua
  `isSimHref`. Đã thử bỏ nhánh ở EmptyState → test đỏ đúng file.
- Hai kỳ vọng cũ đổi theo yêu cầu vòng này (ghi rõ trong test): RU-03 sau giải trình + trả là `repaid-other` (không còn `broken`);
  xong hết nhiệm vụ → thẻ kết (không còn "Không cần làm gì").

Kiểm tra bổ sung ngoài test (trình duyệt dev 1366×768, dựng trạng thái bằng reducer): thẻ kết → bấm "Nhà bán đổi tài khoản nhận tiền" →
hộp xác nhận → "Bắt đầu lại" → 01/08, tình huống bật, không hiện lại màn chào; phím D ở Danh mục khóa khi chưa có khóa hiện "Chưa có
khóa để gửi lại" ngay dưới thẻ (lỗi tìm ra khi tự rà diff, đã sửa ở `bb6f1e2`).

## 2. Bảng cảnh

Chú giải cột vấn đề như v28: **[2 nút chính]**, **[dưới vạch]**, **[mờ]**, **[dàn dựng]**, **[số]**. Mọi cảnh: `bao-cao.json` không có
lỗi thao tác và **không có lỗi console**. Mới ở vòng này, áp cho mọi cảnh có Tua: nút/đường dẫn "Tua tới sự kiện tiếp theo" là **chip tối
SimHint có icon đồng hồ** (thẻ Bước tiếp theo, dòng lý do dưới nút vô hiệu, trạng thái trống, "Đi tới" của nhiệm vụ, cổng ngân hàng).

Cột "Xem ảnh": ✓ = đã mở ảnh của lần chụp này để mô tả; — = không mở từng ảnh (trang không bị vòng này sửa ngoài phần dùng chung ở
trên; mô tả nội dung giữ như v28).

| id | Tiêu đề | File | Xem ảnh | Mô tả điều nhìn thấy | Vấn đề tự phát hiện |
|---|---|---|---|---|---|
| n01–n12 | Màn chào, trang trống, A1, Hướng dẫn, bảng Mô phỏng | n01…n12 | — | Như v28. | Không. |
| n13 | Đối soát — đang tích lũy (01/08) | n13-1366 | — | "Tua tới 15/09" ở thẻ Bước tiếp theo và trong thẻ trống là chip SimHint đồng hồ (không còn nút đặc/viền cobalt). | Trang có 0 nút đặc — đúng luật mới (việc duy nhất là Tua). |
| n14 | Tổng quan — 15/09 | n14-1366, n14-1920 | — | Như n39. | Như v28. |
| n15–n22 | Đối soát, Khoản phải thu, Ứng vốn bước 1–2 | … | — | Như v28. | Như v28. |
| n23 | Ước tính mùa cao điểm | n23-1366, n23-1920 | ✓ | Thanh xếp chồng: đoạn "Trong trần 150" cobalt đặc, đoạn "Bị chặn 69" nền nhạt sọc chéo cobalt, vạch dọc đen có nhãn "Trần dư nợ 150" phía trên đúng mốc 50%. Chú thích: "Trong trần 150 · Bị chặn 69 · Tỷ lệ hoàn 45 · Biên an toàn 36". Chip "Tắt Mùa cao điểm" chỉ còn ở thẻ Bước tiếp theo; dưới nút vô hiệu chỉ còn dòng lý do. | [dưới vạch] dòng chi phí (như v28). |
| n24–n26 | A4, gửi đề nghị, đã giải ngân | … | — | n26: thẻ Bước tiếp theo mang chip Tua (không còn nút đặc). | Không. |
| n27 | Khoản vay — 15/09 | n27-1366, n27-1920 | ✓ | Thẻ: "Khoản vay đang chờ sàn thanh toán. Tua tới 19/09." + chip đồng hồ "Tua tới sự kiện tiếp theo". Hai nút Trả vô hiệu, dưới mỗi nút lý do + chip Tua. Nhiệm vụ 4 "Đi tới" là chip Tua. | Chip Tua lặp 4 lần trên trang (thẻ, 2 dòng lý do, nhiệm vụ) — xem mục 4 "Vấn đề mới". |
| n28–n31 | Chứng thư, trả nợ, đã trả hết, bị chặn | … | — | Như v28. | Như v28. |
| n32 | Quyền & dữ liệu — sau trả hết | n32-1366, n32-1920 | ✓ | Cột "Bên" một dòng: "Công ty Capix (TPP)" / "Techcombank", gạch chân chấm (di chuột → tooltip mã TPP đầy đủ; bấm → ngăn chi tiết, n47). | [dưới vạch] nhật ký, "Dữ liệu của tôi" (như v28). |
| n33, n34 | Hậu trường kỹ thuật, Rút A2 | … | — | Như v28. | Không. |
| n35 | **Trạng thái kết thúc** | n35-1366, n35-1920 | ✓ | Thẻ Bước tiếp theo: "Bạn đã hoàn thành hành trình chính. Thử thêm:" + 2 chip SimHint "Nhà bán đổi tài khoản nhận tiền", "Giai đoạn 3 — nhiều bên chào giá". Tổng quan có "trước → sau" (Đối soát tự động 76%, Vốn 12%/năm). Thanh trái giữ khung "Bạn đã đi hết hành trình". | Thẻ kết ở thanh trái lặp ý với thẻ Bước tiếp theo (xem mục 4). |
| n36–n38 | Tự khám phá, chú giải, "Đến bước này ↓" | … | — | Như v28. | Không. |
| n39 | **Mới** — Tổng quan 15/09 sau khi kết nối | n39-1366, n39-1920 | ✓ | Thẻ "Đối soát — Tự động · 76% giao dịch tự khớp", dòng phụ "Trước: thủ công 9 giờ/tháng"; thẻ vốn vẫn "Lựa chọn vốn hiện tại — Vay tín chấp từ 2%/tháng" (chưa giải ngân). | Thanh doanh thu cắt ngang vạch 768 (như v28). |
| n40 | **Mới** — Tổng quan 20/09 sau khi trả hết | n40-1366, n40-1920 | ✓ | Hai cột trước → sau: "Đối soát — Tự động · 76% giao dịch tự khớp / Trước: thủ công 9 giờ/tháng"; "Vốn — Ứng vốn có bảo đảm · 12%/năm (Techcombank) / Trước: vay tín chấp từ 2%/tháng (≈24%/năm danh nghĩa)". Nút đặc duy nhất "Đổi vai". | Chữ cột Vốn xuống 3 dòng ở 1366 (đọc được, nhưng dày). |
| n41 | **Mới** — bấm SimHint tình huống ở thẻ kết | n41-1366 | ✓ | Hộp "Bắt đầu lại": ""Nhà bán đổi tài khoản nhận tiền" bắt đầu từ 01/08/2027. Xóa tiến trình hiện tại và bắt đầu lại?" [Hủy] [Bắt đầu lại]. | Không. |
| n42–n45 | **Mới** — Đối soát, 4 bộ lọc | n42…n45 (-1366, -1920) | ✓ (n43) | Chip đang chọn nền nhạt + viền; bảng chỉ còn dòng đúng loại (Ngoại lệ: 2 dòng 06/09 +0,45 và 08/09 +2,15, badge amber "Ngoại lệ — cần tra thủ công"). | [dưới vạch] bảng giao dịch (như n15). |
| n46 | **Mới** — Quyền & dữ liệu sau khi rút rồi cấp lại A2 | n46-1366, n46-1920 | ✓ | A2 "Đang hoạt động", cấp ngày 15/09. Nhật ký có 2 dòng mới của "Chị Lan": "A2 — Rút quyền", "A2 — Cấp lại quyền". | Hai dòng do người dùng tạo không có giờ (đã biết — `ponytail:` trong journey.js, du-lieu chưa có số; chờ nhóm quyết). |
| n47 | **Mới** — ngăn Chi tiết truy cập | n47-1366 | ✓ | Ngăn phải "Chi tiết truy cập" (dòng 20/09/2027 06:00): Thời điểm, Bên "Công ty Capix — mã TPP 0318 000 001 (giả định)", Mục đích, Dữ liệu. | Không. |
| c01–c03 | Cán bộ — Tra cứu | … | — | Như v28. | Như v28. |
| c04 | Danh mục khóa, TRƯỚC khi bấm | c04-1366, c04-1920 | — | Câu lũy đẳng nằm trên hàng nút; "Thử gửi lại lệnh khóa" + "Xem chứng thư" cùng một hàng. Thẻ bước: chip Tua. | Không (v28: 2 hàng nút). |
| c07 | Danh mục khóa, SAU khi bấm | c07-1366 | ✓ | Khung thông tin "Lệnh khóa này đã được ghi nhận lúc 10:05 — không tạo khóa mới. Thứ tự ưu tiên #1 giữ nguyên. Tổng đã khóa: 85 triệu." nằm **ngay dưới hàng nút**, trong thẻ bảng. | Thông báo đen "Đã đổi sang vai Cán bộ Techcombank" còn trong ảnh vì cảnh chụp giữ thông báo (`giuThongBao`); trong app nó tự tắt sau 3 giây. |
| c05, c06 | Chứng thư, Cảnh báo trống | … | — | Như v28. | Không. |
| c08 | **Mới** — Cán bộ Tra cứu 24/09, trước khi xử lý | c08-1366, c08-1920 | ✓ | Chấm đỏ số 1 ở mục Cảnh báo; phơi nhiễm 85; RU-03 badge đỏ "Đứt gãy", khóa 46,75, 1 bên; Shopee 92 → 58. | [dưới vạch] điểm theo kênh (như c02). |
| c09 | **Mới** — Cán bộ Tra cứu 24/09, sau khi xử lý | c09-1366, c09-1920 | ✓ | Không còn chấm đỏ; phơi nhiễm 38,25; RU-03 "Đã trả từ nguồn khác" (trung tính, icon ví), khóa 0, 0 bên; Shopee vẫn 92 → 58. Ô mã/số một dòng (sau sửa). | "Chưa đủ điều kiện" (RU-05) xuống 2 dòng — chữ, chấp nhận được. |
| c10 | **Mới** — Cán bộ Cảnh báo 24/09, sau khi xử lý | c10-1366, c10-1920 | ✓ | Thẻ RU-03 badge xám "Đã xử lý", 24/09/2027: "Từng đứt gãy 24/09. Nhà bán đã giải trình và trả RU-03 từ nguồn khác; khóa trên RU-03 đã giải phóng, cấp vốn mới đã mở lại." Mục Cảnh báo không còn chấm đếm. | Không. |
| t01 | Đổi TK — 19/09 | t01-1366 | — | Như v28. | [dưới vạch] dòng thời gian. |
| t02 | Đổi TK — RU-03 đứt gãy | t02-1366, t02-1920 | — | Như v28; dưới nút Trả RU-03 vô hiệu chỉ còn lý do "RU-03 đứt gãy — tiền Shopee không về tài khoản Techcombank" (bỏ liên kết "Giải trình ở Khoản vay" trỏ về chính trang). | Không. |
| t03, t04 | Hộp giải trình, Cán bộ Cảnh báo (còn mở) | … | — | t04: chấm đỏ số 1, thẻ đỏ "Đứt gãy" (cảnh báo mở). | Không. |
| t05 | Đổi TK — sau giải trình + trả RU-03 từ nguồn khác | t05-1366, t05-1920 | ✓ | Đầu trang: khối trung tính thu gọn "Đã xử lý · RU-03 từng đứt gãy 24/09 — đã giải trình và trả từ nguồn khác." + mũi tên mở (bên trong: 92 → 58, khóa giải phóng, cấp vốn mở lại). Dư nợ 38,25. RU-03 "Đã trả từ nguồn khác" + "Từng đứt gãy 24/09". RU-04 nút đặc "Trả 38,25 triệu". Dòng thời gian thêm mốc "24/09 — Giải trình, trả RU-03 từ nguồn khác". Không còn màu đỏ. | [dưới vạch] dòng thời gian (như v28). |
| g01–g07 | Giai đoạn 3 | … | — | Như v28; g06 thẻ bước mang chip Tua. | Như v28. |

## 3. Cảnh không chụp được

Không có — 69/69 cảnh chạy hết các bước, không lỗi thao tác, không lỗi console (bao-cao.json).

Cố ý không có cảnh (như v28): CrashGuard, màn chuyển tiếp 700ms và viền nổi 800ms (tắt vì reducedMotion), phím F.

## 4. Vấn đề của v28 — đã sửa / còn lại

1. **Tổng quan "trước → sau"** (yêu cầu chính vòng 29) — **đã sửa.** Sau A1 + 15/09: thẻ "Đối soát — Tự động · 76% giao dịch tự khớp",
   phụ "Trước: thủ công 9 giờ/tháng" (tỷ lệ từ `autoMatchRate`, cùng hàm với trang Đối soát). Sau giải ngân Techcombank: thẻ "Vốn — Ứng vốn
   có bảo đảm · 12%/năm (Techcombank)", phụ "Trước: vay tín chấp từ 2%/tháng (≈24%/năm danh nghĩa)". docs/du-lieu.md mục 2 thêm 24%/năm là
   số dẫn xuất (2% × 12, danh nghĩa, không lãi kép). Trước khi kết nối giữ nguyên. Dùng lại `Stat`. Bằng chứng: n39, n40, n35.
2. **Đứt gãy đã xử lý (t05)** — **đã sửa.** Đối chiếu san-pham.md E/F/G: F ghi "RU-03 giữ 'Đứt gãy' trong lịch sử dù đã giải trình" —
   giữ lịch sử bằng dòng phụ "Từng đứt gãy 24/09" + mốc dòng thời gian, trạng thái hiện tại "Đã trả từ nguồn khác" theo yêu cầu vòng này.
   Khối đỏ → khối trung tính `<details>` "Đã xử lý" thu gọn được; đỏ chỉ khi còn đứt gãy chưa xử lý (sau giải trình mà chưa trả vẫn đỏ).
   Cổng ngân hàng: thẻ "Đã xử lý", chấm đếm mất. Test chuỗi ở cả hai vai. Bằng chứng: t05, c08 → c09, t04 → c10.
3. **Trạng thái kết thúc (n35)** — **đã sửa.** Thẻ Bước tiếp theo "Bạn đã hoàn thành hành trình chính. Thử thêm:" + 2 SimHint bấm được;
   bấm → `tryScenario` (bật qua `availability`; không bật ngay được thì hộp xác nhận rồi bắt đầu lại với tình huống đã bật). Bằng chứng:
   n35, n41 + kiểm tay mục 1.
4. **"Tua tới sự kiện tiếp theo" là SimHint** — **đã sửa.** Chip tối icon đồng hồ ở mọi trang nhà bán, cổng ngân hàng, trạng thái trống,
   dòng lý do, nhiệm vụ. Luật mới trong DESIGN.md (mục "Vòng 29") + `tests/quy-tac.test.js` quy tắc 12. Bằng chứng: n13, n27, c04/c07.
5. **Chi tiết:**
   - n23 vạch trần 150 + phần vượt trần sọc "Bị chặn" — **đã sửa**; chip "Tắt Mùa cao điểm" chỉ còn một (thẻ Bước tiếp theo) — **đã sửa**.
   - t02 bỏ liên kết "Giải trình ở Khoản vay" khi đang ở Khoản vay — **đã sửa** (sửa ở `GateReason` dùng chung: liên kết trỏ chính trang
     đang mở thì không vẽ).
   - c04/c07 câu lũy đẳng trên hàng nút, kết quả ngay dưới nút — **đã sửa**; "Đã đổi sang vai…" tự tắt sau 3 giây — **đã sửa**
     (các thông báo khác giữ 4 giây theo hanh-trinh 2.1).
   - n32 cột "Bên" không gãy dòng, mã TPP đầy đủ ở tooltip + ngăn chi tiết — **đã sửa**, nhưng hiện **"Công ty Capix (TPP)"** chứ không
     phải "Capix (TPP)": nhật ký là vị trí pháp lý (AGENTS.md mục 4, brand.js) nên giữ `LEGAL_NAME`; quy tắc 10 cũng cấm gõ "Capix" trong
     trang. **Cần người quyết** nếu muốn đúng chữ "Capix (TPP)".
   - DESIGN.md: chấm đỏ đếm cảnh báo trong `bankOps` là đúng nghĩa, giữ nguyên (đếm cảnh báo MỞ) — **đã ghi**; luật nút "tối đa một nút
     đặc; đúng một khi còn việc cần làm" — **đã ghi**.
6. Vấn đề v28 còn treo: "Trang không còn việc có 0 nút đặc" — **đã chốt** bằng luật nút mới. Các ghi chú [dưới vạch] khác (nhật ký n32,
   khối kết quả c03, thanh doanh thu n14, dòng thời gian n27/n30/t01) — **còn lại**, không thuộc yêu cầu vòng 29.

Vấn đề mới thấy ở v29 (chưa sửa, cần người quyết):
- n27: chip Tua lặp 4 lần trên một trang (thẻ Bước tiếp theo, dòng lý do dưới 2 nút Trả, "Đi tới" nhiệm vụ). Cùng tinh thần n23 ("chip chỉ
  một lần") thì có thể bỏ chip Tua ở dòng lý do khi thẻ đã có.
- n35: thẻ kết ở thanh trái ("Bạn đã đi hết hành trình" + 2 tình huống dẫn "Mở bảng Mô phỏng") lặp ý với thẻ Bước tiếp theo mới; có thể
  cho thanh trái dùng cùng `tryScenarios`.
- n40: chữ cột "Vốn" xuống 3 dòng ở 1366.
- n46: dòng nhật ký do người dùng tạo (rút/cấp lại) chưa có giờ — chờ số từ du-lieu.md.

## 5. Giao diện nghi còn thiếu trong kiểm kê

Đã bổ sung trong v29 (từ danh sách v28): các bộ lọc Đối soát (n42–n45), Quyền & dữ liệu sau khi rút rồi cấp lại A2 (n46), Cán bộ tra
cứu ở mốc RU-03 đứt gãy (c08), ảnh 1920 cho các cảnh mới (n23, n35, n39–n46, c08–c10).

Còn thiếu:
- Chứng thư khóa → "Xem dạng kỹ thuật".
- Rút A1 (trang Rút quyền A1 và Quyền & dữ liệu sau khi rút A1), nút rút A4 khi đã ký chưa giải ngân, kết quả "Xuất hồ sơ".
- Ứng vốn khi A2 bị rút sau khi ký A4.
- Tổng quan khi bật Mùa cao điểm.
- Mục "Phím tắt" mở trên bảng Mô phỏng.
- Khối "Đã xử lý" ở t05 khi mở ra (ảnh chụp ở trạng thái thu gọn).
