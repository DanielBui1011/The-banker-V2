# Walkthrough ảnh chụp v28

Công cụ: `npm run shots -- v28` (scripts/shots.mjs, 57 cảnh trong scripts/shots.scenes.js — 50 cảnh v27 + 7 cảnh mới), chạy
ngày 24/09/2026 trên Windows 11, trình duyệt **Google Chrome 153.0.8010.53** có sẵn trên máy (như v27). Bản chụp: `npm run build`
+ `vite preview` cổng 4173, commit `a6aef6c`.

- Ảnh: `docs/shots/v28/png/` (77 file: 57 ảnh 1366 + 20 ảnh 1920 — không commit, có trong .gitignore)
- `contact-sheet.pdf`: 88 trang, 8,3 MB (JPEG chất lượng 0,8)
- `bao-cao.json`: chiều cao ảnh, lỗi thao tác, lỗi console từng cảnh

Cách đọc ảnh 1366 giống v27: **phần trên vạch đứt đỏ (y = 768) là phần thấy ở màn hình đầu 1366×768**. Chân trang (~40px) thật ra
che đáy màn đầu; thanh ký dính đáy trên trang ký luôn hiện ở đáy màn đầu. Công cụ chụp ở chế độ `reducedMotion`, nên viền nổi
800ms của "Đến bước này ↓" không lưu vào ảnh (n38) — đã kiểm riêng trong trình duyệt (xem mục 4, ý 3).

## 1. Trạng thái repo

- Nhánh: `vong-28-sua-walkthrough` (tạo từ `main` @ `4193b4d`)
- Commit lúc chụp: `a6aef6c` (3 commit: logic `93df133`, giao diện `33470b2`, sửa bố cục sau lần chụp đầu `a6aef6c`)
- Lần chụp đầu (ở `33470b2`) lộ 2 lỗi bố cục — chip SimHint và cặp nút tràn khỏi thẻ ở g05; chip dưới nút vô hiệu căn lệch ở n23.
  Đã sửa ở `a6aef6c` rồi chụp lại toàn bộ; ảnh trong thư mục là của lần chụp lại.
- `src/logic/journey.js` đổi theo yêu cầu vòng này (nhiệm vụ, nextStep, chữ lý do chặn); **không đổi công thức** (pricing.js,
  verification.js, registry.js không động tới; T1–T10 vẫn pass).

`npm run build` (nguyên văn):

```
npm notice run capix@0.0.1 build
npm notice run vite build
vite v5.4.21 building for production...
transforming...
✓ 1941 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                                      0.70 kB │ gzip:   0.47 kB
dist/assets/be-vietnam-pro-vietnamese-400-normal-BuGn0gnm.woff       6.57 kB
dist/assets/be-vietnam-pro-vietnamese-600-normal-DkpCIyan.woff       6.88 kB
dist/assets/be-vietnam-pro-vietnamese-500-normal-CfdwVo8-.woff       6.88 kB
dist/assets/be-vietnam-pro-vietnamese-700-normal-By_5yT39.woff       6.89 kB
dist/assets/be-vietnam-pro-latin-ext-400-normal-DYBYyMQr.woff        8.90 kB
dist/assets/be-vietnam-pro-latin-ext-700-normal-4Hjo2OtD.woff        9.19 kB
dist/assets/be-vietnam-pro-latin-ext-500-normal-CK0UkkKf.woff        9.20 kB
dist/assets/be-vietnam-pro-latin-ext-600-normal-BeUwKxhG.woff        9.22 kB
dist/assets/be-vietnam-pro-vietnamese-400-normal-CRcqvyg1.woff2     11.53 kB
dist/assets/be-vietnam-pro-vietnamese-500-normal-DREgrEoJ.woff2     12.17 kB
dist/assets/be-vietnam-pro-vietnamese-600-normal-nyU-ZL2p.woff2     12.18 kB
dist/assets/be-vietnam-pro-vietnamese-700-normal-Csr0PCuG.woff2     12.47 kB
dist/assets/be-vietnam-pro-latin-ext-400-normal-CiZNW1ec.woff2      13.06 kB
dist/assets/be-vietnam-pro-latin-ext-500-normal-h0Fp6aX0.woff2      13.55 kB
dist/assets/be-vietnam-pro-latin-ext-600-normal-BNd8euf0.woff2      13.61 kB
dist/assets/be-vietnam-pro-latin-ext-700-normal-C8_gqRu2.woff2      13.85 kB
dist/assets/be-vietnam-pro-latin-400-normal-bXgqVju9.woff           16.43 kB
dist/assets/be-vietnam-pro-latin-700-normal-C2EtzaOi.woff           16.91 kB
dist/assets/be-vietnam-pro-latin-500-normal-BJkVuMHw.woff           17.00 kB
dist/assets/be-vietnam-pro-latin-600-normal-5IO4e7bK.woff           17.02 kB
dist/assets/be-vietnam-pro-latin-400-normal-PpnXBOrz.woff2          21.17 kB
dist/assets/be-vietnam-pro-latin-500-normal-B6LVzGNe.woff2          21.89 kB
dist/assets/be-vietnam-pro-latin-600-normal-BZDkUTrt.woff2          22.03 kB
dist/assets/be-vietnam-pro-latin-700-normal-DlW1Zbsh.woff2          22.15 kB
dist/assets/index-BMLmxd0W.css                                      35.39 kB │ gzip:   7.20 kB
dist/assets/index-DYqPlLkv.js                                    1,356.71 kB │ gzip: 285.01 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 10.89s
```

`npm test` (nguyên văn, bỏ các dòng test con):

```
npm notice run capix@0.0.1 test
npm notice run vitest run

 RUN  v2.1.9 C:/Users/sushi/Downloads/The-banker-V2-repo

 ✓ src/logic/registry.test.js (3 tests) 9ms
 ✓ src/components/ui/ConsentPage.test.js (3 tests) 5ms
 ✓ src/config/brand.test.js (5 tests) 7ms
 ✓ src/logic/pricing.test.js (12 tests) 14ms
 ✓ src/logic/verification.test.js (6 tests) 7ms
 ✓ src/utils/format.test.js (5 tests) 42ms
 ✓ src/logic/reconciliation.test.js (3 tests) 6ms
 ✓ src/utils/route.test.js (6 tests) 9ms
 ✓ tests/quy-tac.test.js (13 tests) 312ms
 ✓ src/logic/journey.test.js (118 tests) 8808ms

 Test Files  10 passed (10)
      Tests  174 passed (174)
   Start at  19:38:10
   Duration  9.80s (transform 592ms, setup 0ms, collect 1.63s, tests 9.22s, environment 4ms, prepare 2.54s)
```

Vitest không còn quét `.claude/**` (vite.config.js `test.exclude`); worktree `.claude/worktrees/angry-stonebraker-b6ea85` đã gỡ
(`git worktree remove` — sạch, commit của nó đã nằm trong main). Số test tăng 167 → 174 so với v27 (của riêng repo).

Test mới trong vòng này:
- `journey.test.js`: nhiệm vụ 2 xong nhờ bước ước tính; nhiệm vụ theo chuỗi (n không xong khi n−1 chưa xong, xong ngay khi n−1 xong);
  một bộ nhãn duy nhất; **"Vòng 28 — một nút đặc mỗi trang"** (13 trạng thái hành trình 1 × 6 trang: ≤ 1 nút đặc, nút đặc trong
  thân trang luôn bấm được theo `availability`, trang trống không mang nút đặc); đích "Đến bước này" ở n21/n22/n25/t02/khoản vay 19/09;
  chữ thẻ Bước tiếp theo và lý do chặn của thao tác sản phẩm không chứa "mô phỏng"/"prototype".
- `tests/quy-tac.test.js` **quy tắc 11**: "prototype"/"mô phỏng" trong src/pages, src/components chỉ được ở comment, trong
  `<SimHint>`, trong SimHint.jsx, ScenarioPanel.jsx (bảng Mô phỏng), SurfaceFrame.jsx (nhãn khung ngân hàng); chân trang là
  `FOOTER_NOTE` ở mockData (không quét). Đã thử đảo lại một chuỗi cũ ("Chữ ký minh họa trong prototype.") → test đỏ đúng dòng.

Kiểm tra bổ sung ngoài test (trình duyệt dev, iframe 1366×768): vẽ thật 16 trạng thái (13 của hành trình 1 + mùa cao điểm, đứt gãy,
GĐ3 ký với Ngân hàng B) × 6 trang nhà bán = 96 trang, đếm nút/liên kết nền cobalt. Lần đầu tìm ra chip lọc đang chọn "Tất cả (25)"
ở Đối soát là khối cobalt đặc thứ hai → đã đổi sang nền nhạt + viền. Sau sửa: mọi trang có đúng 1 nút đặc, trừ các trang không còn
việc gì để làm (0 nút đặc, thẻ "Không cần làm gì ở trang này") và Ứng vốn khi bật mùa cao điểm (0 nút đặc — không ký được, chỉ có SimHint).

## 2. Bảng cảnh

Chú giải cột vấn đề như v27: **[2 nút chính]**, **[dưới vạch]**, **[mờ]**, **[dàn dựng]**, **[số]**. Mọi cảnh: `bao-cao.json` không có
lỗi thao tác và **không có lỗi console** (v27 có 2 lỗi 404 favicon ở n01). Thanh trên của app nhà bán và cổng ngân hàng: ngày nằm
trong chip tối SimHint "Ngày mô phỏng dd/mm/yyyy". Thanh nhiệm vụ: nhãn ngắn duy nhất, nút "Đi tới" luôn là nút viền.

Cột "Xem ảnh": ✓ = đã mở ảnh của lần chụp này để mô tả; — = không mở từng ảnh (trang không bị vòng này sửa ngoài phần dùng chung
ở trên; mô tả nội dung giữ như v27).

| id | Tiêu đề | File | Xem ảnh | Mô tả điều nhìn thấy | Vấn đề tự phát hiện |
|---|---|---|---|---|---|
| n01 | Màn chào | n01-1366 | — | Như v27; câu cuối đổi thành "…ở bảng tối bên phải" (không còn chữ "bảng Mô phỏng"). | Không (hết 404 favicon). |
| n02 | Tổng quan — chưa kết nối | n02-1366, n02-1920 | ✓ | Thẻ Bước tiếp theo chỉ có chữ + liên kết "Đến bước này ↓"; nút đặc duy nhất "Kết nối Techcombank" trong thẻ "Chưa kết nối ngân hàng nhận tiền". Nhiệm vụ 0/5, nhãn ngắn. | Nhiệm vụ 5 sát vạch 768 (như v27). |
| n03 | Ngăn chọn ngân hàng | n03-1366 | ✓ | Sau khi bấm Ngân hàng B: khung "Tiền sàn của chị Lan về tài khoản Techcombank." | Không. |
| n04 | Đối soát — trống + Space bị chặn | n04-1366, n04-1920 | — | Thẻ Bước tiếp theo nút đặc "Kết nối Techcombank"; thẻ trống "Chưa có dữ liệu" nút **viền** "Kết nối Techcombank". | Không. |
| n05 | Khoản phải thu — trống | n05-1366, n05-1920 | — | Như n04 (thẻ trống nút viền). | Không. |
| n06 | Ứng vốn — trống | n06-1366, n06-1920 | — | Như n04 (thẻ trống nút viền). | Không. |
| n07 | Khoản vay — trống | n07-1366, n07-1920 | ✓ | Thẻ Bước tiếp theo nút đặc "Kết nối Techcombank"; thẻ "Chưa có khoản vay" nút viền "Đi tới Ứng vốn". | Không. |
| n08 | Quyền & dữ liệu — chưa kết nối | n08-1366, n08-1920 | ✓ | Thẻ Bước tiếp theo "Đến bước này ↓"; nút đặc duy nhất "Kết nối Techcombank" ở thẻ A1. | [dưới vạch] "Dữ liệu của tôi" (như v27). [mờ] "Xuất hồ sơ" vô hiệu dùng kiểu chuẩn #ECE8E0 / #545B69. |
| n09 | Trang Techcombank — A1 | n09-1366, n09-1920 | — | Như v27. | Không. |
| n10 | Ngăn Hướng dẫn | n10-1366 | ✓ | Nhiệm vụ 0/5 với cùng nhãn ngắn như thanh trái; mọi "Đi tới" là nút viền. | Không. |
| n11 | Bảng Mô phỏng — 01/08 | n11-1366 | ✓ | Nút "Tua tới sự kiện tiếp theo" vô hiệu: nền #ECE8E0, chữ #545B69, viền đứt — khác hẳn nút bật; dòng "Cần kết nối A1 → Kết nối Techcombank". | [dưới vạch] Giai đoạn 3, Bắt đầu lại (bảng cuộn được — như v27). |
| n12 | Hộp xác nhận Bắt đầu lại | n12-1366 | — | Như v27. | Không. |
| n13 | Đối soát — đang tích lũy (01/08) | n13-1366 | ✓ | Nút đặc "Tua tới sự kiện tiếp theo" ở thẻ Bước tiếp theo; "Tua tới 15/09" trong thẻ trống là nút viền. | Không (v27: 2 nút chính). |
| n14 | Tổng quan — 15/09 | n14-1366, n14-1920 | ✓ | Bảng lô: "Shopee Đủ · 7 lô", "TikTok Shop Đủ · 6 lô", "Hãng vận chuyển A 4/6 lô". Nút đặc "Mở Khoản phải thu". | Thanh doanh thu cắt ngang vạch 768 (như v27). |
| n15 | Đối soát — ngay sau khi tua | n15-1366, n15-1920 | ✓ | Thông báo "Đã tua tới 15/09…"; chip lọc đang chọn "Tất cả (25)" nền nhạt + viền (không còn nền cobalt đặc). | [dưới vạch] bảng giao dịch (như v27). |
| n16–n18 | Đối soát — các ngăn | n16/n17/n18-1366 | — | Như v27. | Không. |
| n19 | Khoản phải thu — 15/09 | n19-1366, n19-1920 | ✓ | Như v27; một nút đặc "Đi tới Ứng vốn"; nhiệm vụ 2/5 (mở trang này làm xong nhiệm vụ 2). | [dưới vạch] RU-02, "Chưa dùng được" (như v27). |
| n20 | Ngăn điểm xác thực Shopee | n20-1366 | — | Như v27. | Không. |
| n21 | Ứng vốn bước 1 — cần A2 | n21-1366, n21-1920 | ✓ | Thẻ Bước tiếp theo: chữ + chip SimHint "Muốn xem mùa cao điểm? Bật ở bảng Mô phỏng" + "Đến bước này ↓". Thân trang: nút đặc "Cấp A2 trên trang Techcombank" (bỏ nút xám "Xem ước tính"). | Không. |
| n22 | Ứng vốn bước 2 — ước tính | n22-1366, n22-1920 | ✓ | Thanh xếp chồng có chú thích từng đoạn: "Khả dụng theo công thức 85 triệu · Tỷ lệ hoàn 8 triệu · Biên an toàn 7 triệu"; số + đơn vị không xuống dòng. Nút đặc duy nhất "Tiếp: ký thỏa thuận A4"; thẻ có "Đến bước này ↓". Nhiệm vụ 2/5 — nhiệm vụ 2 xong mà chưa mở Khoản phải thu. | [dưới vạch] Tiền lãi 140 nghìn đồng (như v27). |
| n23 | Ước tính mùa cao điểm | n23-1366 | ✓ | Thẻ Bước tiếp theo: "Ước tính mùa cao điểm chỉ để tham khảo; chưa có dữ liệu khoản vay mùa cao điểm" + SimHint "Tắt Mùa cao điểm". Nút "Tiếp: ký thỏa thuận A4" vô hiệu, lý do + SimHint căn phải thẳng nút. Chú thích "219 · 45 · 36". 247 nghìn đồng. | Hai chip "Tắt Mùa cao điểm" (thẻ + dưới nút) — lặp, xem mục 4. [dưới vạch] dòng chi phí. |
| n24 | Trang Techcombank — A4 | n24-1366, n24-1920 | — | Như v27. | Không. |
| n25 | Ứng vốn bước 4 — gửi đề nghị | n25-1366 | ✓ | Thẻ "Gửi đề nghị tới Techcombank." + "Đến bước này ↓"; nút đặc duy nhất "Gửi đề nghị tới Techcombank". | Không. |
| n26 | Ứng vốn bước 5 — đã giải ngân | n26-1366 | ✓ | Nút đặc "Tua tới sự kiện tiếp theo" (thẻ); "Xem khoản vay" thành nút viền. Chứng thư: "Chữ ký hiển thị rút gọn." | Không (v27: 2 nút chính + "prototype"). |
| n27 | Khoản vay — 15/09 | n27-1366, n27-1920 | ✓ | Nút đặc "Tua tới sự kiện tiếp theo"; hai nút Trả vô hiệu (kiểu chuẩn) kèm lý do + liên kết. | [dưới vạch] dòng thời gian (như v27). |
| n28 | Ngăn Chứng thư khóa | n28-1366 | — | Như v27, dòng cuối "Chữ ký hiển thị rút gọn." | Không. |
| n29 | Trang Techcombank — trả nợ RU-03 | n29-1366, n29-1920 | — | Như v27. | Không. |
| n30 | Khoản vay — đã trả hết | n30-1366 | ✓ | Dư nợ 0; RU-03/RU-04 "Đã tất toán"; nút đặc "Đổi vai". **Nhiệm vụ 4/5** — mục 2 đã tích (v27: 3/5, mục 2 bị bỏ sót). | Nhãn ngày dòng thời gian bị vạch cắt (như v27). |
| n31 | Trang Techcombank — bị chặn | n31-1366 | — | Như v27. | Không. |
| n32 | Quyền & dữ liệu — sau trả hết | n32-1366, n32-1920 | ✓ | A4: nhãn xám ngắn "Đã chấm dứt" + dòng phụ "Lý do: khoản vay đã tất toán". "Rút quyền A1/A2 trên Techcombank" cùng kiểu viền cobalt. Nút đặc duy nhất "Đổi vai". | [dưới vạch] nhật ký, "Dữ liệu của tôi"; cột "Bên" gãy 2 dòng (như v27). |
| n33 | Hậu trường kỹ thuật | n33-1366 | — | Như v27. | Không. |
| n34 | Trang Techcombank — Rút A2 | n34-1366 | — | Như v27. | Không. |
| n35 | Tổng quan — thẻ kết | n35-1366 | ✓ | **Không mở Khoản phải thu** trong kịch bản mà vẫn 5/5. Thẻ kết: "6 Đổi tài khoản nhận tiền" xuống 2 dòng (không bị cắt), "7 Nhiều bên chào giá"; "Bắt đầu lại" một dòng. | [dưới vạch] tình huống 7 và "Bắt đầu lại" (như v27). |
| n36 | **Mới** — chế độ "Tự khám phá" | n36-1366 | ✓ | Như n02 nhưng khung nhiệm vụ thu gọn thành một dòng "Nhiệm vụ 0/5" + thanh tiến độ. | Không. |
| n37 | **Mới** — bong bóng chú giải | n37-1366 | ✓ | Tổng quan 15/09, bong bóng tối "Lô tất toán: Một lần sàn trả tiền cho một đơn vị và tiền đó đã về tài khoản." dưới thuật ngữ. | Bong bóng che dòng Shopee/TikTok Shop của bảng lô khi mở (chấp nhận được — đóng khi rời chuột). |
| n38 | **Mới** — bấm "Đến bước này ↓" | n38-1366 | ✓ | Như n21, liên kết ở trạng thái đã bấm. Viền nổi không lưu vào ảnh (reducedMotion). | Xem mục 4 ý 3 về kiểm tra hiệu ứng. |
| c01 | Cán bộ — chưa có A2 | c01-1366 | — | Như v27; ngày trong SimHint. | Không. |
| c02 | Cán bộ — Tra cứu sau giải ngân | c02-1366, c02-1920 | ✓ | Như v27; ngày trong SimHint. | [dưới vạch] điểm theo kênh, thấy/không thấy (như v27). |
| c03 | Cán bộ — minh họa bên khác khóa | c03-1366 | — | Như v27. | Khối kết quả dưới vạch (như v27). |
| c04 | Cán bộ — Danh mục khóa, TRƯỚC khi bấm | c04-1366, c04-1920 | ✓ | Chưa có thông báo lũy đẳng. Dưới bảng: câu "Lệnh trùng không tạo khóa mới và không đổi thứ tự ưu tiên (lũy đẳng)." + nút viền "Thử gửi lại lệnh khóa" (phím tắt D hiển thị trên nút) + "Xem chứng thư". | Ở 1366 hai nút xuống hai hàng (câu chiếm chỗ) — gọn được, xem mục 4. |
| c07 | **Mới** — Danh mục khóa, SAU khi bấm | c07-1366 | ✓ | Khung thông tin "Lệnh khóa này đã được ghi nhận lúc 10:05 — không tạo khóa mới. Thứ tự ưu tiên #1 giữ nguyên. Tổng đã khóa: 85 triệu."; bảng không đổi (vẫn 2 dòng, #1, 10:05:12). | Thông báo đen "Đã đổi sang vai…" là của bước đổi vai trước đó. |
| c05, c06 | Cán bộ — Chứng thư, Cảnh báo trống | c05/c06-1366 | — | Như v27; chứng thư "Chữ ký hiển thị rút gọn." | Không. |
| t01 | Đổi TK — 19/09 | t01-1366 | — | Như v27. | [dưới vạch] dòng thời gian (như v27). |
| t02 | Đổi TK — RU-03 đứt gãy | t02-1366, t02-1920 | ✓ | Khối "RU-03 — tiền không về tài khoản neo" + badge Đứt gãy **lên đầu trang**, trên thẻ dư nợ; nút đặc "Tôi đã đổi tài khoản — giải trình" ở **y ≈ 317–371** (v27: y ≈ 808). Thẻ có "Đến bước này ↓". "Trả 38,25 triệu" RU-04 thành nút viền. | Không (v27: dưới vạch + 2 nút chính). |
| t03 | Đổi TK — hộp giải trình | t03-1366 | — | Như v27. | Không. |
| t04 | Đổi TK — Cán bộ, Cảnh báo | t04-1366 | ✓ | Như v27; chấm đỏ số 1 ở mục Cảnh báo. | Chấm đỏ trong khung bankOps — vẫn chờ quyết (mục 4). |
| t05 | **Mới** — Đổi TK sau giải trình, đã trả RU-03 từ nguồn khác | t05-1366, t05-1920 | ✓ | Ngày 24/09. Khối đứt gãy vẫn ở đầu: "Điểm xác thực Shopee: 92 → 58. Cấp vốn mới đã mở lại." (không còn nút). Dư nợ 38,25; RU-03 "Đứt gãy" (giữ trong lịch sử, không còn nút trả); RU-04 nút đặc "Trả 38,25 triệu trên Techcombank"; thẻ "TikTok Shop đã thanh toán RU-04…" + "Đến bước này ↓". | [dưới vạch] dòng thời gian. |
| g01 | GĐ3 — chọn bên nhận | g01-1366 | ✓ | Thẻ "Chọn bên nhận yêu cầu chào giá." + "Đến bước này ↓"; nút "Gửi yêu cầu chào giá" vô hiệu (chưa tích bên nào). | Không. |
| g02 | GĐ3 — bảng chào giá | g02-1366 | ✓ | Techcombank 140 / Ngân hàng B 154 / Công ty tài chính C 171 nghìn đồng — nay khớp du-lieu mục 12 (số dẫn xuất). Ba nút "Chọn" viền; thẻ chỉ chữ. | Không. |
| g03 | GĐ3 — trang ký Ngân hàng B | g03-1366 | — | Như v27. | Không. |
| g04 | GĐ3 — đã chọn, chờ ký | g04-1366 | ✓ | Thẻ "Ký thỏa thuận với Ngân hàng B." + "Đến bước này ↓"; "Chọn chào giá khác" viền, "Ký trên trang Ngân hàng B" đặc. | Không. |
| g05 | GĐ3 — đã ký với Ngân hàng B | g05-1366 | ✓ | Thẻ: "Đã ký thỏa thuận với Ngân hàng B. Muốn đi tiếp tới trả nợ? Chọn lại chào giá." + SimHint "Dòng tất toán trong mô phỏng dựng cho Techcombank". Trong thẻ trái: SimHint cùng câu (xuống 2 dòng trong khung hẹp), "Bắt đầu lại" viền một dòng, "Chọn lại chào giá" đặc — nằm trong thẻ. | Hai nút xếp hai hàng ở 1366; nút đặc cắt ngang vạch 768. |
| g06 | **Mới** — GĐ3 chọn Techcombank tới giải ngân | g06-1366 | ✓ | Thanh bước GĐ3 tích đủ 4; "Techcombank đã phê duyệt và giải ngân 85 triệu…", RU-03 46,75 / RU-04 38,25 "Đã khóa", chứng thư Techcombank; thẻ nút đặc "Tua tới sự kiện tiếp theo"; nhiệm vụ 3/5. | Không. |
| g07 | **Mới** — trang ký Công ty tài chính C | g07-1366 | ✓ | Dải trung tính "Bạn đang ở trang của Công ty tài chính C" + "Mô phỏng"; "Bảo đảm cho khoản vay 80 triệu của Công ty tài chính C"; "RU-03 — khóa 44 triệu", "RU-04 — khóa 36 triệu" (du-lieu mục 12); ô xác nhận chưa tích, "Ký thỏa thuận" vô hiệu. | [dưới vạch] khối KHÔNG cho phép, ô xác nhận (thanh ký dính đáy ở màn thật). |

## 3. Cảnh không chụp được

Không có — 57/57 cảnh chạy hết các bước, không cảnh nào lỗi thao tác, không lỗi console (bao-cao.json).

Giao diện có trong app nhưng cố ý không có cảnh (như v27, docs/shots/HUONG-DAN.md): màn CrashGuard; màn chuyển tiếp 700ms (tắt vì
reducedMotion); phím F. Thêm: viền nổi 800ms của "Đến bước này ↓" (tắt vì reducedMotion — kiểm bằng trình duyệt, mục 4 ý 3).

## 4. Vấn đề của v27 — đã sửa / còn lại

1. **Nhiệm vụ 2 dễ bị bỏ sót** — **đã sửa.** Nhiệm vụ 2 xong khi ngày ≥ 15/09 VÀ (đã mở Khoản phải thu HOẶC đã tới bước ước tính ở
   Ứng vốn; ở GĐ3 là bảng chào giá). Nhiệm vụ theo chuỗi: n không xong khi n−1 chưa xong; điều kiện của n thỏa trước thì hiện xong
   ngay khi n−1 xong. Bằng chứng: n22 (2/5 mà chưa mở Khoản phải thu), n30 (4/5), n35 (5/5, kịch bản không mở Khoản phải thu).
2. **Nút chính của đứt gãy dưới màn đầu (t02)** — **đã sửa.** Khối cảnh báo lên đầu trang Khoản vay; nút ở y ≈ 317–371.
3. **Hai nút chính cùng lúc** — **đã sửa.** Luật mới trong DESIGN.md ("Vòng 28 — Thứ bậc nút"): hành động trên cùng trang → thẻ chỉ có
   "Đến bước này ↓" (cuộn tới nút, focus, viền nổi `.step-flash` 800ms; reduced-motion → cuộn ngay); hành động ở trang khác → thẻ giữ
   nút đặc; trạng thái trống và "Đi tới" luôn là nút viền. Test logic + kiểm vẽ thật 96 trang (mục 1). Kiểm hiệu ứng trong trình
   duyệt dev: bấm liên kết ở n21 → nút "Cấp A2…" nhận focus, `animationName = step-flash`, `animationDuration = 0.8s`.
4. **Chữ dàn dựng trong vùng sản phẩm** — **đã sửa.** Component `SimHint` (chip tối, icon riêng, bấm mở bảng Mô phỏng) cho: gợi ý mùa
   cao điểm (n21, n22), thông điệp mùa cao điểm (n23), "Dòng tất toán trong mô phỏng dựng cho Techcombank" (g05), ngày mô phỏng ở thanh
   trên và cổng ngân hàng, mọi đường sửa trỏ bảng Mô phỏng trong lý do chặn. "Chữ ký minh họa trong prototype" → "Chữ ký hiển thị rút
   gọn"; n03 → "Tiền sàn của chị Lan về tài khoản Techcombank."; bỏ "(mô phỏng)" ở Xuất hồ sơ; câu hệ quả trên trang Rút A1 viết lại.
   Chặn tái phạm: quy tắc 11 + test logic (mục 1).
5. **Số liệu cần chốt** — **đã sửa.** docs/du-lieu.md mục 12: 140 / 154 / 171 và 247 nghìn đồng ghi là số dẫn xuất, kèm công thức
   (giá trị × lãi suất × 5 / 365, đổi nghìn đồng, làm tròn) và đầu vào; thay 0,15 / 0,17.
6. **Nhỏ:**
   - "7/6 lô" (n14, n35) — **đã sửa**: "Đủ · 7 lô"; kênh chưa đủ giữ "4/6 lô".
   - Nút Tua vô hiệu trông như bấm được (n11) — **đã sửa**: kiểu vô hiệu chuẩn + viền đứt, `cursor: not-allowed`.
   - Tên tình huống bị cắt trong thẻ kết (n35) — **đã sửa**: một bộ nhãn duy nhất, chữ xuống dòng thay vì cắt.
   - "Bắt đầu lại" gãy dòng (g05) — **đã sửa** (whitespace-nowrap; hai nút xếp hai hàng khi thẻ hẹp).
   - 404 favicon (n01) — **đã sửa**: favicon SVG chữ "C" màu primary trong index.html; console n01 sạch.
   - Vitest quét `.claude/worktrees` — **đã sửa**: `exclude: '.claude/**'`, worktree cũ đã gỡ.
   - Chấm đỏ trong khung bankOps (t04) — **còn lại**: không thuộc yêu cầu vòng 28, vẫn cần người quyết.
7. Các ghi chú [dưới vạch] khác của v27 (nhật ký n32, cột "Bên" gãy dòng, khối kết quả c03, thanh doanh thu n14, dòng thời gian
   n27/n30/t01) — **còn lại**, không thuộc yêu cầu vòng 28.

Vấn đề mới thấy ở v28 (chưa sửa, cần người quyết):
- n23: chip "Tắt Mùa cao điểm" xuất hiện hai lần (thẻ Bước tiếp theo và dưới nút vô hiệu).
- c04/c07: câu lũy đẳng + hai nút viền dàn thành hai hàng ở 1366; có thể đặt câu lên trên hàng nút.
- Trang không còn việc gì (sau khi trả hết và đã xem góc nhìn cán bộ) có 0 nút đặc — luật "đúng MỘT nút đặc" hiện được hiểu là
  "tối đa một, và đúng một khi còn việc để làm".

## 5. Giao diện nghi còn thiếu trong kiểm kê

Đã bổ sung trong v28 (từ danh sách v27): sau giải trình đứt gãy (t05), GĐ3 chọn Techcombank tới giải ngân (g06), trang ký Công ty tài
chính C (g07), chế độ "Tự khám phá" (n36 — cũng là cảnh khung nhiệm vụ thu gọn), bong bóng chú giải (n37), Danh mục khóa trước/sau
khi bấm "Thử gửi lại lệnh khóa" (c04/c07), "Đến bước này ↓" (n38).

Còn thiếu:
- Chứng thư khóa → "Xem dạng kỹ thuật".
- Đối soát: các bộ lọc Đã khớp / Ngoại lệ / Hoàn / Chi ra.
- Quyền & dữ liệu sau khi rút A1 hoặc A2 ("Cấp lại"), trang Rút quyền A1, nút rút A4 khi đã ký chưa giải ngân, kết quả "Xuất hồ sơ".
- Ứng vốn khi A2 bị rút sau khi ký A4.
- Tổng quan khi bật Mùa cao điểm.
- Cán bộ tra cứu ở mốc RU-03 đứt gãy.
- Mục "Phím tắt" mở trên bảng Mô phỏng.
- Ảnh 1920 cho các cảnh mới ngoài t05.
