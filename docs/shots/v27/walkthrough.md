# Walkthrough ảnh chụp v27

Công cụ: `npm run shots -- v27` (scripts/shots.mjs, 50 cảnh trong scripts/shots.scenes.js), chạy ngày 24/09/2026 trên
Windows 11, trình duyệt **Google Chrome 153.0.8010.53** có sẵn trên máy (Chromium của Playwright không tải được vì
cdn.playwright.dev hết thời gian chờ — công cụ tự chuyển sang Chrome). Bản chụp: `npm run build` + `vite preview` cổng 4173.

- Ảnh: `docs/shots/v27/png/` (69 file: 50 ảnh 1366 + 19 ảnh 1920 — không commit, có trong .gitignore)
- `contact-sheet.pdf`: 79 trang, 7,3 MB (JPEG chất lượng 0,8)
- `bao-cao.json`: chiều cao ảnh, lỗi thao tác, lỗi console từng cảnh

Cách đọc ảnh 1366: app cao đúng một màn hình và cuộn bên trong, nên công cụ nới chiều cao khung nhìn để chụp hết phần cuộn.
**Phần trên vạch đứt đỏ (y = 768) là phần thấy ở màn hình đầu 1366×768.** Hai sai khác so với màn thật: chân trang "Giao diện
mô phỏng — dữ liệu giả định" (~40px) thật ra che đáy màn đầu; thanh xác nhận dính đáy trên trang ký (A1, A4) thật ra luôn hiện
ở đáy màn đầu. Cảnh có lớp phủ (hộp thoại, ngăn kéo) chụp đúng 1366×768.

## 1. Trạng thái repo

- Nhánh: `vong-27-chup-anh` (tạo từ `main` @ `458580a`)
- Commit lúc chụp: `968b7ae` + thay đổi chưa commit của công cụ (fallback Chrome/Edge, chờ thông báo tắt, sửa cảnh n35/t01) — tất cả vào cùng commit với file này
- Không sửa giao diện hay logic app trong vòng này.

`npm run build` (nguyên văn):

```
npm notice run capix@0.0.1 build
npm notice run vite build
vite v5.4.21 building for production...
transforming...
✓ 1940 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                                                      0.39 kB │ gzip:   0.29 kB
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
dist/assets/index-B06r0E8E.css                                      35.11 kB │ gzip:   7.12 kB
dist/assets/index-DpE0Of1k.js                                    1,352.75 kB │ gzip: 283.96 kB

(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.
✓ built in 4.50s
```

`npm test` (nguyên văn):

```
npm notice run capix@0.0.1 test
npm notice run vitest run

 RUN  v2.1.9 C:/Users/sushi/Downloads/The-banker-V2-repo

 ✓ .claude/worktrees/angry-stonebraker-b6ea85/src/logic/registry.test.js (3 tests) 7ms
 ✓ .claude/worktrees/angry-stonebraker-b6ea85/tests/quy-tac.test.js (5 tests) 84ms
 ✓ src/logic/registry.test.js (3 tests) 7ms
 ✓ src/config/brand.test.js (5 tests) 6ms
 ✓ src/logic/pricing.test.js (12 tests) 8ms
 ✓ .claude/worktrees/angry-stonebraker-b6ea85/src/logic/verification.test.js (4 tests) 4ms
 ✓ .claude/worktrees/angry-stonebraker-b6ea85/src/logic/pricing.test.js (12 tests) 10ms
 ✓ src/logic/verification.test.js (6 tests) 5ms
 ✓ src/utils/route.test.js (6 tests) 7ms
 ✓ tests/quy-tac.test.js (12 tests) 194ms
 ✓ src/logic/reconciliation.test.js (3 tests) 4ms
 ✓ src/components/ui/ConsentPage.test.js (3 tests) 4ms
 ✓ .claude/worktrees/angry-stonebraker-b6ea85/src/logic/reconciliation.test.js (3 tests) 4ms
 ✓ src/utils/format.test.js (5 tests) 31ms
 ✓ .claude/worktrees/angry-stonebraker-b6ea85/src/config/brand.test.js (2 tests) 4ms
 ✓ src/logic/journey.test.js (112 tests) 3596ms
   ✓ Không ngõ cụt (BFS, độ sâu 14) > mọi đường dẫn sửa lỗi trỏ tới hành động bấm được; không NaN 338ms
   ✓ Vòng 26 — chống vỡ > chuỗi thao tác ngẫu nhiên (80 × 30 bước, có đổi vai) → luôn hiển thị được 2943ms

 Test Files  16 passed (16)
      Tests  196 passed (196)
   Start at  15:40:33
   Duration  4.64s (transform 421ms, setup 0ms, collect 1.34s, tests 3.97s, environment 4ms, prepare 3.35s)
```

Ghi chú: Vitest đang quét cả thư mục `.claude/worktrees/…` (worktree cũ, không thuộc repo) — 16 file test gồm 10 file của repo
và 6 file bản cũ trong worktree đó (29 test). Test của riêng repo: 167/167 pass. Không ảnh hưởng kết quả, chỉ làm số tổng bị cộng thêm.

## 2. Bảng cảnh

Chú giải cột vấn đề: **[2 nút chính]** = hai nút nền đặc cùng lúc (AGENTS.md mục 6: mỗi trang một nút chính);
**[dưới vạch]** = phần tử quan trọng nằm dưới y = 768; **[mờ]** = chữ/nút tương phản thấp; **[dàn dựng]** = chữ "mô phỏng"/"prototype"
trong vùng giao diện sản phẩm (AGENTS.md mục 4); **[số]** = số liệu cần đối chiếu docs/du-lieu.md. Mọi cảnh: không có chữ tên cũ
(thanh trên cùng đều là "Capix"), không có lỗi console trừ n01.

| id | Tiêu đề | File | Mô tả điều nhìn thấy | Vấn đề tự phát hiện |
|---|---|---|---|---|
| n01 | Màn chào | n01-1366 | Hộp thoại trắng giữa màn, nền Tổng quan phía sau bị làm mờ. Tiêu đề "Chào mừng — hãy thử app trong vai chị Lan"; ba mục Vai của bạn / Mục tiêu ("khoảng 100 triệu tiền hàng nằm ở sàn…") / Thời lượng "Khoảng 3 phút · 5 nhiệm vụ". Nút đặc "Bắt đầu có hướng dẫn" (có viền focus) và nút viền "Tự khám phá"; dòng chân "Giao diện mô phỏng — dữ liệu giả định…". | Console: 2 lỗi `404 (Not Found)` khi tải trang — Playwright không ghi được URL; gần như chắc chắn là `/favicon.ico` (index.html không khai báo icon). Nhãn vạch đỏ bị lớp mờ của hộp thoại phủ. |
| n02 | Tổng quan — chưa kết nối | n02-1366, n02-1920 | Thanh trên: "Capix", "Đối tác: Techcombank", "Ngày mô phỏng 01/08/2027", nút ?. Trái: 6 mục điều hướng, khối "Nhiệm vụ 0/5" (mục 1 nền xanh nhạt + nút "Đi tới"). Thẻ Bước tiếp theo + nút "Kết nối Techcombank". Thẻ "Tiền đang chờ sàn thanh toán" **100** triệu, "= doanh thu sàn 300 triệu / 30 × 10 ngày…", 9 giờ/tháng, "Vay tín chấp từ 2%/tháng"; thẻ "Chưa kết nối ngân hàng nhận tiền" với nút lớn "Kết nối Techcombank"; thanh doanh thu Shopee 170 / TikTok Shop 130 / Facebook/Instagram 120 / Website 80. Ảnh 1920: bố cục gói trong ~1440px, lề trống hai bên. | [2 nút chính] hai nút "Kết nối Techcombank" nền đặc. Mục nhiệm vụ 5 ("Góc nhìn cán bộ") nằm đúng vạch 768. Số khớp du-lieu mục 2–3. |
| n03 | Ngăn chọn ngân hàng | n03-1366 | Ngăn phải "Chọn ngân hàng nhận tiền": thẻ Techcombank viền xanh ("Tài khoản nhận tiền sàn của chị Lan"), Ngân hàng B, Ngân hàng D ("Hỗ trợ kết nối qua Open API"), khung thông tin "Tiền sàn của chị Lan về Techcombank — mô phỏng đi theo tài khoản này, không theo Ngân hàng B." | [dàn dựng] "mô phỏng đi theo…" trong ghi chú của ngăn (vùng sản phẩm). |
| n04 | Đối soát — trống + Space bị chặn | n04-1366, n04-1920 | Dải tiêu đề nền teal nhạt "Đối soát · Tầng 1 · Tiền về đã khớp với đơn chưa?". Thẻ trống biểu tượng liên kết "Chưa có dữ liệu" + nút "Kết nối Techcombank". Thông báo đen dưới đáy "Không tua được: Cần kết nối A1". | [2 nút chính] Bước tiếp theo và thẻ trống cùng nút đặc "Kết nối Techcombank". |
| n05 | Khoản phải thu — trống | n05-1366, n05-1920 | Dải tím nhạt "Khoản phải thu · Tầng 2". Thẻ "Chưa có khoản phải thu đã xác thực", giải thích cần đủ 6 lô tất toán, nút "Kết nối Techcombank". | [2 nút chính] như n04. |
| n06 | Ứng vốn — trống | n06-1366, n06-1920 | Dải cam nhạt "Ứng vốn · Tầng 3". Thẻ "Chưa có khoản phải thu đã xác thực — …Chúng có từ 15/09, sau 6 tuần đối soát", nút "Kết nối Techcombank". | [2 nút chính] như n04. |
| n07 | Khoản vay — trống | n07-1366, n07-1920 | Dải tím nhạt "Khoản vay · Tầng 2". Thẻ "Chưa có khoản vay", nút "Đi tới Ứng vốn"; Bước tiếp theo vẫn là "Kết nối Techcombank". | [2 nút chính] "Kết nối Techcombank" (thẻ Bước tiếp theo) và "Đi tới Ứng vốn" (thẻ trống) — hai hướng khác nhau. |
| n08 | Quyền & dữ liệu — chưa kết nối | n08-1366, n08-1920 | "0 quyền đang hiệu lực"; ba thẻ A1 / A2 / A4 (RU-03, RU-04) đều nhãn "Chưa cấp", A1 có nút "Kết nối Techcombank". Nhật ký: "Chưa có hoạt động truy cập nào", liên kết "Xem hậu trường kỹ thuật". Khối "Dữ liệu của tôi" với nút xám "Xuất hồ sơ" và dòng "Chưa có doanh thu đã xác thực → Kết nối Techcombank". | [2 nút chính] (Bước tiếp theo + thẻ A1). [dưới vạch] khối "Dữ liệu của tôi" ở 1366. [mờ] nút "Xuất hồ sơ" vô hiệu: chữ xám trên nền be. |
| n09 | Trang Techcombank — A1 | n09-1366, n09-1920 | Thanh bước nền be ngoài khung (Chọn ngân hàng ✓ → 2 Cấp quyền trên Techcombank → 3 Quay về đối soát). Dải đen "Bạn đang ở trang của **Techcombank**" (chữ vàng kim), vạch đỏ, "Mô phỏng" bên phải. Tiêu đề "Yêu cầu cấp quyền truy cập dữ liệu"; Bên yêu cầu "Công ty Capix", "Mã TPP đã đăng ký: 0318 000 001 (giả định)"; Mục đích; Phạm vi 3 dòng có icon khiên; Bên nhận; Thời hạn "90 ngày, đến 30/10/2027"; khối "Quyền này KHÔNG cho phép…"; ô xác nhận chưa tích; "Từ chối" viền + "Đồng ý cấp quyền" xám (vô hiệu). Ảnh 1920: thanh xác nhận dính đáy che một phần câu "Bạn có thể rút lại quyền này…". | Không. (Thanh xác nhận nằm dưới vạch trong ảnh nới, nhưng dính đáy nên thật ra luôn hiện.) |
| n10 | Ngăn Hướng dẫn | n10-1366 | Ngăn phải "Hướng dẫn": đoạn vai + mục tiêu, nút viền "Xem lại màn chào", "Nhiệm vụ 0/5" dạng danh sách có nút "Đi tới" cho từng nhiệm vụ; nhiệm vụ 5 bị cắt ở đáy (ngăn cuộn được). | Không. |
| n11 | Bảng Mô phỏng — 01/08 | n11-1366 | Bảng tối cạnh phải: Vai (Nhà bán đang chọn / Cán bộ Techcombank), "NGÀY MÔ PHỎNG 01/08/2027" chữ rất lớn, nút "Tua tới sự kiện tiếp theo", dòng "Cần kết nối A1 → Kết nối Techcombank"; Tình huống: Mùa cao điểm / Đổi tài khoản nhận tiền / Giai đoạn 3 đều "Tắt"; nút "Bắt đầu lại"; mục "Phím tắt" thu gọn. Bảng che mất ngày ở thanh trên. | [mờ] nút Tua đang vô hiệu nhưng trông như nút tối bình thường (nền slate-800, chữ trắng) — khó nhận ra là không bấm được. [dưới vạch] Giai đoạn 3 và "Bắt đầu lại" (bảng cuộn được). |
| n12 | Hộp xác nhận Bắt đầu lại | n12-1366 | Hộp trắng nhỏ giữa màn "Bắt đầu lại — Xóa toàn bộ tiến trình và quay về 01/08/2027?", nút "Hủy" viền và "Bắt đầu lại" đặc. | Không. |
| n13 | Đối soát — đang tích lũy (01/08) | n13-1366 | Nhiệm vụ 1/5 (mục 1 đã tích). Thẻ đồng hồ cát "Đang tích lũy lịch sử — cần 6 lô tất toán mỗi kênh", "Đã kết nối tài khoản Techcombank, số giả 1903 **** 8826", "Shopee: 0/6 lô · TikTok Shop: 0/6 lô · Hãng vận chuyển A: 0/6 lô", nút "Tua tới 15/09". | [2 nút chính] "Tua tới sự kiện tiếp theo" (Bước tiếp theo) và "Tua tới 15/09" — cùng một hành động, hai tên. |
| n14 | Tổng quan — 15/09 | n14-1366, n14-1920 | Ngày 15/09/2027. Bước tiếp theo "Sáu tuần đối soát đã xong…" + "Mở Khoản phải thu". Thẻ "6 tuần sau: Shopee 7 lô, TikTok Shop 6 lô, Hãng vận chuyển A 4 lô; 25 giao dịch 01–10/09 đã đối soát". Thẻ 100 triệu như n02; thẻ "Đã kết nối — Techcombank, số giả 1903 **** 8826", bảng lô "Shopee 7/6 lô, TikTok Shop 6/6 lô, Hãng vận chuyển A 4/6 lô". | "7/6 lô" đọc như phân số lỗi (7 trên 6). Thanh doanh thu nằm cắt ngang vạch 768. Số khớp du-lieu mục 7. |
| n15 | Đối soát — ngay sau khi tua | n15-1366, n15-1920 | Thẻ "6 tuần sau" có nút "Đã hiểu". Chỉ số "Tỷ lệ giao dịch khớp tự động **76%**" (xanh teal) "19/25 giao dịch 01/09–10/09"; Trước 9 giờ/tháng → Sau "Tự động — không cần thao tác tay"; Đã khớp 19 (111,6 triệu), Ngoại lệ 2 (nút viền "Xử lý ngoại lệ"), Hoàn 3, Chi ra 1. Dải cảnh báo "Sai lệch phí RU-01 — Shopee: dự phóng 42, thực nhận 41,3 (lệch 1,7%…)" + "Xem chi tiết". Bộ lọc Tất cả (25)…, bảng giao dịch với nhãn cam "Ngoại lệ — cần tra thủ công", xám "Đã hoàn", teal "Đã khớp". Thông báo đen "Đã tua tới 15/09: Sáu tuần đối soát xong, RU-03 và RU-04 đã xác thực" che dòng cuối bảng. | [dưới vạch] bảng giao dịch bắt đầu dưới 768. Số 42/41,3/1,7% khớp du-lieu mục 5–6; 76% không có trực tiếp trong du-lieu. |
| n16 | Ngăn Ngoại lệ | n16-1366 | Ngăn phải "Ngoại lệ cần tra thủ công (2)": GD14 06/09/2027 +0,45 triệu, bên chuyển "(không rõ)", nội dung "(trống)"; GD20 08/09/2027 +2,15 triệu "Ngô Minh K." "chuyen tien"; mỗi thẻ có nhãn cam. | Không. |
| n17 | Ngăn Sai lệch phí | n17-1366 | Ngăn "Sai lệch phí RU-01": khung "Từ GD01 + GD05", RU-01 — Shopee, Dự phóng 42 triệu, Thực nhận 41,3 triệu, Chênh lệch 0,7 triệu (1,7%). | Không. Số khớp du-lieu mục 5. |
| n18 | Xem tất cả + chi tiết giao dịch | n18-1366 | Bảng đã mở rộng (thấy tới dòng 02/09 "Hãng vận chuyển…"), ngăn phải "Giao dịch GD14": Ngày, Bên chuyển/nhận (không rõ), Nội dung (trống), Kênh —, Số tiền +0,45 triệu, Trạng thái Ngoại lệ, Phương pháp khớp "Không khớp được", Liên kết đơn vị —. | Tiêu đề cột "Số tiền (triệu)" và ô "Hãng vận chuyển A" xuống 2 dòng khi ngăn mở. |
| n19 | Khoản phải thu — 15/09 | n19-1366, n19-1920 | Câu đầu "**100** triệu đang ở sàn nay là 2 đơn vị tài sản đã xác thực". Hai thẻ RU-03 Shopee 55 triệu (cửa sổ 18–21/09) và RU-04 TikTok Shop 45 triệu (19–22/09), nhãn teal "Đã xác thực", trục 4 bước Dự phóng → Đã xác thực → Đã khóa → Đã tất toán, dòng "Đủ điều kiện làm tài sản bảo đảm"; "55 + 45 = 100 triệu". "Vì sao tin được": RU-01 dự phóng 42 → 41,3 (khớp 98,3%) nhãn "Đã tất toán", nút "Điểm xác thực Shopee: 92"; RU-02 35 → 34,6, "Điểm xác thực TikTok Shop: 90". "Chưa dùng được": RU-05 COD 12 triệu "Chưa đủ lịch sử (4/6 lô)"; RU-06 Shopee đơn hoàn −2,3 triệu "Đã hoàn". Nhiệm vụ 2/5. | [dưới vạch] RU-02 và khối "Chưa dùng được". Số khớp du-lieu mục 6–7. |
| n20 | Ngăn điểm xác thực Shopee | n20-1366 | Ngăn "Shopee — Phân rã điểm xác thực": ô nền be "Điểm xác thực **92**"; Độ sát dự phóng 98,3%, Độ dao động 2,1%, Sai lệch phí 0,8%, Tỷ lệ rò rỉ 0%, Độ trễ P90 2 ngày; "Cơ sở tính điểm — số lô đã tất toán: 7". | Không. Khớp du-lieu mục 7 (T7). |
| n21 | Ứng vốn bước 1 — cần A2 | n21-1366, n21-1920 | Bước tiếp theo "Techcombank cần quyền đánh giá tín dụng (A2)" + dòng nhỏ "Muốn xem mùa cao điểm? Bật ở bảng Mô phỏng", nút "Cấp A2 trên trang Techcombank". Thanh bước 1 Cấp A2 · 2 Xem ước tính · 3 Ký A4 · 4 Gửi đề nghị. Thẻ chìa khóa giải thích A2 (lịch sử giao dịch 180 ngày, hồ sơ doanh thu đã xác thực; rút không ảnh hưởng A1), nút xám "Xem ước tính" + dòng lý do có liên kết. | [dàn dựng] "Bật ở bảng Mô phỏng" trong thẻ Bước tiếp theo. [mờ] nút vô hiệu. |
| n22 | Ứng vốn bước 2 — ước tính | n22-1366, n22-1920 | "Bảng tính giá trị khả dụng": thanh ngang xanh/xám; Giá trị ròng dự phóng (RU-03 55 + RU-04 45) 100 triệu; − Tỷ lệ hoàn gia quyền (8%) 8; − Biên an toàn (7%) 7; − Chiết khấu xác thực 0; = Theo công thức (tỷ lệ ứng 85%) 85; Trần dư nợ 150; − Đã bị bên khác khóa 0; "85 ≤ trần 150 → giá trị khả dụng 85 triệu". Bên phải: "Giá trị khả dụng ước tính **85** triệu" + khung "Ước tính, chưa phải đề nghị cấp tín dụng", nút đặc "Tiếp: ký thỏa thuận A4", thẻ Bên cấp tín dụng Techcombank · Lãi suất 12%/năm · Tiền lãi nếu tất toán sau 5 ngày 140 nghìn đồng. Bước tiếp theo có nút "Ký A4 trên trang Techcombank". | [2 nút chính] "Ký A4 trên trang Techcombank" và "Tiếp: ký thỏa thuận A4". [dưới vạch] dòng Lãi suất bị vạch cắt ngang; Tiền lãi dưới vạch. Câu "Ước tính, chưa phải…" xuống 2 dòng ở 1366. [dàn dựng] như n21. Số khớp T1, T9. |
| n23 | Ước tính mùa cao điểm | n23-1366 | Bảng: RU-M1 165 + RU-M2 135 = 300; hoàn 15% 45; biên 12% 36; tỷ lệ ứng 73% → 219; trần 150; "Bị chặn bởi trần dư nợ: 219 → 150 triệu". Bên phải "**150** triệu", nút xám "Tiếp: ký thỏa thuận A4" + lý do "Mô phỏng mùa cao điểm chỉ minh họa ước tính; chưa có dữ liệu khoản vay mùa cao điểm → Tắt Mùa cao điểm"; Lãi 12%/năm, Tiền lãi 247 nghìn đồng. Bước tiếp theo lặp lại câu đó + nút "Tắt Mùa cao điểm". | [dàn dựng] "Mô phỏng mùa cao điểm…" và nút "Tắt Mùa cao điểm" trong thẻ Bước tiếp theo (điều khiển mô phỏng nằm trong vùng sản phẩm). [số] 247 nghìn đồng không có trong du-lieu (tính theo công thức T9 trên 150). Số 300/219/150 khớp T2. [dưới vạch] dòng Bên cấp tín dụng. |
| n24 | Trang Techcombank — A4 | n24-1366, n24-1920 | Thanh bước (Cấp A2 ✓, Xem ước tính ✓, 3 Ký A4, 4 Gửi đề nghị) ngoài khung đen. "Thỏa thuận chuyển giao quyền đòi nợ"; Bên nhận bảo đảm Techcombank; Mục đích "Bảo đảm cho khoản vay 85 triệu của Techcombank… Nghị định 99/2022/NĐ-CP"; Tài sản bảo đảm RU-03 khóa 46,75 / RU-04 khóa 38,25; mã "DKBĐ-GIẢ-2027-004512"; Dòng tiền; khối KHÔNG cho phép; "Không thể rút khi còn dư nợ…"; ô xác nhận + "Từ chối" / "Ký thỏa thuận" (vô hiệu). | Không (thanh ký dính đáy). Số khớp du-lieu mục 12. |
| n25 | Ứng vốn bước 4 — gửi đề nghị | n25-1366 | Bước tiếp theo chỉ có chữ "Gửi đề nghị tới Techcombank." (không nút). Thanh bước 1–3 đã tích. Thẻ "Đề nghị ứng vốn gửi tới Techcombank **85** triệu" + khung ước tính; bên phải "Quyền đánh giá tín dụng A2: đang hoạt động · Thỏa thuận A4: đã ký với Techcombank · Techcombank tự thẩm định và giải ngân…", nút đặc "Gửi đề nghị tới Techcombank". | Không. |
| n26 | Ứng vốn bước 5 — đã giải ngân | n26-1366 | Bước tiếp theo "Khoản vay đang chờ sàn thanh toán. Tua tới 19/09." + nút "Tua tới sự kiện tiếp theo". Thanh bước tích đủ 4. Thẻ trái "Techcombank đã phê duyệt và giải ngân 85 triệu vào tài khoản của bạn", RU-03 khóa 46,75 / RU-04 khóa 38,25 nhãn tím "Đã khóa", nút "Xem khoản vay". Thẻ phải "Chứng thư khóa — Mã LOCK-2027-0915-00318", Đơn vị, Bên nhận bảo đảm Techcombank, Giá trị khóa "RU-03 46,75 + RU-04 38,25 = 85 triệu", Thứ tự ưu tiên #1, Thời điểm khóa 15/09/2027 10:05:12, Mã đăng ký, "RS256 (JWS) — kiểm chứng độc lập", chữ nghiêng "Chữ ký minh họa trong prototype.", nút "Xem dạng kỹ thuật". | [2 nút chính] "Tua tới sự kiện tiếp theo" và "Xem khoản vay". [dàn dựng] "prototype". [dưới vạch] nút "Xem dạng kỹ thuật". Số khớp du-lieu mục 12. |
| n27 | Khoản vay — 15/09 | n27-1366, n27-1920 | "Dư nợ còn lại **85** triệu", "Khoản vay có bảo đảm bằng khoản phải thu · Techcombank giải ngân 85 triệu ngày 15/09", nút viền "Xem chứng thư khóa". Hai thẻ RU-03 / RU-04 nhãn "Đã khóa", nút xám "Trả 46,75 triệu trên Techcombank" / "Trả 38,25 triệu…" kèm lý do "Shopee chưa thanh toán RU-03 (cửa sổ 18–21/09) → Tua tới sự kiện tiếp theo". "Dòng thời gian": 15/09 giải ngân · 15–18/09 nhập hàng · 19/09 Shopee thanh toán RU-03: 54,6 triệu · 20/09 TikTok Shop thanh toán RU-04: 44,7 triệu. | [dưới vạch] gần hết "Dòng thời gian". [mờ] hai nút Trả vô hiệu. Số khớp du-lieu mục 10. |
| n28 | Ngăn Chứng thư khóa | n28-1366 | Ngăn phải "Chứng thư khóa" chứa cùng thẻ như n26, bố cục hẹp: "Chứng thư khóa" và mã LOCK-… xuống dòng, "Giá trị khóa", "Mã đăng ký bảo đảm", "Thuật toán chữ ký" đều gãy 2 dòng. | Nhãn và giá trị gãy dòng nhiều trong ngăn 480px. [dàn dựng] "prototype". |
| n29 | Trang Techcombank — Trả nợ RU-03 | n29-1366, n29-1920 | Không có thanh bước. Dải đen Techcombank. "Trả nợ một chạm"; Bên cho vay Techcombank; Khoản vay "…khoản phải thu RU-03"; Nguồn tiền "Shopee đã thanh toán 54,6 triệu cho RU-03 về tài khoản Techcombank"; Số tiền trả **46,75 triệu**; Tài khoản trích "Techcombank, số giả 1903 **** 8826"; "Hủy" viền + "Xác nhận trả nợ" nền đen. Ngày 19/09/2027 trên mấu Mô phỏng. | Không. Số khớp du-lieu mục 10. |
| n30 | Khoản vay — đã trả hết | n30-1366 | Ngày 20/09/2027. "Dư nợ còn lại **0** triệu"; RU-03, RU-04 nhãn teal "Đã tất toán"; thẻ "Khoản vay đã tất toán — tiền lãi khoảng 140 nghìn đồng · Điểm xác thực đã cập nhật sau lô tất toán. Thỏa thuận A4 đã chấm dứt…"; dòng thời gian tô đủ 4 mốc. Bước tiếp theo "Xem hồ sơ dưới góc nhìn cán bộ Techcombank" + "Đổi vai". Nhiệm vụ 3/5 — mục 2 vẫn là mục hiện tại. | Nhiệm vụ 2 chưa xong dù hành trình đã tới trả nợ (xem mục 4, ý 1). Nhãn ngày dòng thời gian bị vạch cắt. Số khớp T9 và du-lieu mục 10. |
| n31 | Trang Techcombank — bị chặn | n31-1366 | Dải đen Techcombank, "Không thực hiện được thao tác này", thẻ "Chưa có khoản vay" và nút viền "Quay về Khoản vay". | Trang không có nút chính nào (chỉ nút viền) — chấp nhận được. |
| n32 | Quyền & dữ liệu — sau trả hết | n32-1366, n32-1920 | "2 quyền đang hiệu lực": A1 và A2 nhãn teal "Đang hoạt động" (cấp 01/08/2027 hạn 30/10/2027; cấp 15/09/2027 hạn 14/12/2027) với nút viền "Rút quyền A1/A2 trên Techcombank"; A4 nhãn xám "Đã chấm dứt — khoản vay đã tất toán". Nhật ký 8 dòng từ 20/09 06:00 xuống 01/08 09:12, bên "Công ty Capix — mã TPP 0318 000 001 (giả định)" hoặc "Techcombank". "Dữ liệu của tôi" + nút viền "Xuất hồ sơ". | [dưới vạch] toàn bộ nhật ký (trừ tiêu đề cột) và "Dữ liệu của tôi" ở 1366. Cột "Bên" gãy 2 dòng ở 1366. Nhật ký khớp du-lieu mục 9. |
| n33 | Hộp Hậu trường kỹ thuật | n33-1366 | Hộp tối chữ đơn cách giữa màn: luồng OAuth "GET /authorize?response_type=code&**scope=AIS** (PKCE)", code_challenge, "POST /token", "access_token: eyJhbGci•••• hạn **3.600 giây**", "**refresh_token: rt_9f3a7••••**", "# Token chỉ đọc giao dịch — không chuyển tiền được. Rút A1 = thu hồi token."; chân "Chuỗi token là mẫu minh họa, không phải token thật." | Không. |
| n34 | Trang Techcombank — Rút A2 | n34-1366 | "Rút quyền A2 — đánh giá tín dụng", "Sau khi rút, bạn có thể cấp lại bất cứ lúc nào."; Bên đang được cấp quyền "Công ty Capix"; Hệ quả: "Nền tảng không gửi đề nghị ứng vốn mới; Techcombank không xem được hồ sơ…", "Khoản vay hiện có không thay đổi. Đối soát (A1) vẫn hoạt động."; "Giữ quyền" viền + "Rút quyền A2" đen. | Không. |
| n35 | Tổng quan — thẻ kết | n35-1366 | Ngày 20/09/2027. Bước tiếp theo "Không cần làm gì ở trang này" (không nút). Khối trái "Nhiệm vụ 5/5" thanh tiến độ đầy, thẻ "Bạn đã đi hết hành trình — Muốn xem thêm? Thử hai tình huống: 6 Đổi tài khoản nhậ… / 7 Nhiều bên chào giá", nút viền "Bắt đầu lại". Phần giữa giống n14. | Tên tình huống 6 bị cắt "Đổi tài khoản nhậ…". [dưới vạch] tình huống 7 và nút "Bắt đầu lại" của thẻ kết. |
| c01 | Cán bộ — chưa có A2 | c01-1366 | Khung cổng nội bộ: cột trái đen "Techcombank · Nội bộ — mô phỏng", mục Tra cứu nhà bán / Danh mục khóa / Cảnh báo. "Tra cứu nhà bán — Lan Beauty", ngày 15/09/2027, nút ?. Thẻ ổ khóa "Nhà bán chưa cấp (hoặc đã rút) quyền A2 — ngân hàng không xem được hồ sơ" + liên kết "Đổi sang vai Nhà bán". | Không. |
| c02 | Cán bộ — Tra cứu sau giải ngân | c02-1366, c02-1920 | Bước tiếp theo xám "Tua tới 19/09 để xem sổ khóa cập nhật." + nút viền "Tua tới sự kiện tiếp theo". "Tổng phơi nhiễm hợp nhất **85** triệu trên 1 bên cho vay"; "Khả dụng còn lại để khóa: 0 triệu"; "Truy cập theo quyền A2… hiệu lực đến 14/12/2027". Bảng: RU-03 55 / 46,75 / 46,75 / 1 "Đã khóa"; RU-04 45 / 38,25 / 38,25 / 1 "Đã khóa"; RU-05 12 / "Chưa đủ điều kiện" / 0 / 0 "Chưa đủ lịch sử". Điểm theo kênh Shopee 92, TikTok Shop 90; "Ngân hàng thấy / Ngân hàng KHÔNG thấy" (có "Danh tính bên khóa"). Khối "Minh họa: đã có bên khác khóa 100 triệu" công tắc tắt. Không có tên bên khóa. | [dưới vạch] điểm theo kênh, danh sách thấy/không thấy, khối minh họa. Số khớp du-lieu mục 11. |
| c03 | Cán bộ — minh họa bên khác khóa | c03-1366 | Như c02; công tắc bật (đen), khung vàng "Đã bị khóa bởi 1 bên khác: 100 triệu — giá trị khả dụng đã được trừ.", "Giá trị khả dụng còn lại (RU-03 + RU-04) **50** triệu", "Danh tính bên khóa được ẩn theo quy chế thành viên." | Khối kết quả nằm hẳn dưới vạch (người bật công tắc phải cuộn mới thấy). Số khớp T3. |
| c04 | Cán bộ — Danh mục khóa + phím D | c04-1366, c04-1920 | "Danh mục khóa — Lan Beauty"; khung thông tin "Lệnh khóa này đã được ghi nhận lúc 10:05 — không tạo khóa mới. Thứ tự ưu tiên #1 giữ nguyên. Tổng đã khóa: 85 triệu."; bảng RU-03 46,75 / RU-04 38,25, #1, 15/09/2027 10:05:12, "Đã khóa"; nút viền "Xem chứng thư"; chú thích "Khóa của bên khác… chỉ hiện số bên ở mục Tra cứu nhà bán." Thông báo đen "Đã đổi sang vai Cán bộ Techcombank". | Không. (Thông báo là của bước đổi vai trước đó, không phải của phím D.) |
| c05 | Cán bộ — ngăn Chứng thư | c05-1366 | Ngăn phải "Chứng thư khóa" giống n28 (Bên nhận bảo đảm Techcombank, #1, 10:05:12, "Chữ ký minh họa trong prototype.", "Xem dạng kỹ thuật"). | [dàn dựng] "prototype". Gãy dòng như n28. |
| c06 | Cán bộ — Cảnh báo (không có) | c06-1366 | "Cảnh báo — Lan Beauty"; thẻ "Không có cảnh báo — Hệ thống kiểm tra mỗi giờ; cảnh báo đứt gãy được gửi trong 15 phút." | Không. |
| t01 | Đổi TK — 19/09 | t01-1366 | Ngày 19/09/2027. Khoản vay 85 triệu, RU-03 / RU-04 "Đã khóa" với nút Trả vô hiệu; khung thông tin "Không có khoản thanh toán Shopee nào về tài khoản Techcombank cho RU-03."; dòng thời gian 6 mốc: 15/09, 15–18/09, 19/09 "Shopee không thanh toán RU-03 về Techcombank", 20/09, 21/09 "Hết cửa sổ thanh toán RU-03", 24/09 "Hết ân hạn — RU-03 đứt gãy". | [dưới vạch] dòng thời gian. Mốc khớp du-lieu mục 10 (kịch bản rò rỉ). |
| t02 | Đổi TK — RU-03 đứt gãy | t02-1366, t02-1920 | Ngày 24/09/2027. Bước tiếp theo chỉ chữ "RU-03 đứt gãy — xác nhận tài khoản nhận tiền và giải trình." RU-03 nhãn đỏ đặc "Đứt gãy", nút Trả xám + lý do "→ Giải trình ở Khoản vay"; RU-04 "Đã khóa" với nút đặc cobalt "Trả 38,25 triệu trên Techcombank". Thẻ "RU-03 — tiền không về tài khoản neo" nhãn đỏ, "Điểm xác thực Shopee: 92 → 58. Cấp vốn mới đang tạm dừng.", "Vui lòng xác nhận tài khoản nhận tiền trên sàn.", nút đặc "Tôi đã đổi tài khoản — giải trình". Dòng thời gian tô đủ 6 mốc. | [dưới vạch] **nút chính "Tôi đã đổi tài khoản — giải trình" ở y ≈ 808** — ở 1366×768 không thấy việc cần làm nhất. [2 nút chính] Trả RU-04 và Giải trình. [số] Dư nợ 85 vì cảnh không bấm trả RU-04; du-lieu mục 10 ghi 24/09 dư nợ 46,75 (giả định RU-04 đã trả). Điểm 58 khớp T10. |
| t03 | Đổi TK — hộp giải trình | t03-1366 | Hộp giữa màn "Giải trình tài khoản nhận tiền — Xác nhận đã đổi lại tài khoản nhận tiền trên Shopee về Techcombank, số giả 1903 **** 8826 và sẽ trả RU-03 từ nguồn khác.", "Hủy" / "Xác nhận". | Không. |
| t04 | Đổi TK — Cán bộ, Cảnh báo | t04-1366 | Mục "Cảnh báo" ở cột trái có chấm đỏ số 1. Bước tiếp theo "Chờ nhà bán trả nợ" + "Đổi sang vai Nhà bán". Thẻ cảnh báo nhãn đỏ "Đứt gãy" RU-03, 24/09/2027: "Tiền sàn của RU-03 không về tài khoản neo sau 3 ngày ân hạn. **Hệ quả:** đóng băng cấp vốn mới cho nhà bán tới khi nhà bán giải trình." | Chấm đỏ đếm số trên cột trái của khung `bankOps` — AGENTS.md mục 6 ghi khung bankOps "không đỏ/vàng kim"; cần xác nhận chấm đỏ ngữ nghĩa (đứt gãy) có được phép ở đây. |
| g01 | GĐ3 — chọn bên nhận | g01-1366 | Thanh bước GĐ3: Cấp A2 ✓ · 2 Chọn bên nhận · 3 Chọn chào giá · 4 Ký thỏa thuận. "Gửi yêu cầu chào giá — Cho RU-03 (55 triệu) và RU-04 (45 triệu)…"; ba ô chọn Techcombank / Ngân hàng B / Công ty tài chính C chưa tích; nút xám "Gửi yêu cầu chào giá" + "Chọn ít nhất một bên nhận". | Không. |
| g02 | GĐ3 — bảng chào giá | g02-1366 | "Chào giá cho RU-03 và RU-04 — Mỗi bên cho vay tự thẩm định và tự giải ngân; ứng dụng chỉ chuyển yêu cầu và chào giá." Bảng: Techcombank (nhãn "Lãi thấp nhất") 85 triệu 12% 140 nghìn đồng, tối đa 20 ngày; Ngân hàng B 85 / 13,2% / **154** nghìn / 20 ngày; Công ty tài chính C 80 / 15,6% / **171** nghìn / 15 ngày; mỗi dòng nút viền "Chọn"; khung "Ước tính, chưa phải đề nghị cấp tín dụng". | [số] du-lieu mục 12 ghi tiền lãi 0,15 và 0,17 (triệu) — app hiện 154 và 171 nghìn (tính lại từ công thức); Techcombank 140 khớp 0,14. Cần chốt cách làm tròn. |
| g03 | GĐ3 — trang ký của Ngân hàng B | g03-1366 | Thanh bước tích 3, bước 4 "Ký thỏa thuận". Dải xám đậm trung tính "Bạn đang ở trang của Ngân hàng B" (không vạch đỏ, không vàng kim). "Ngân hàng B — Thỏa thuận chuyển giao quyền đòi nợ", nội dung như n24 nhưng bên nhận bảo đảm Ngân hàng B, RU-03 46,75 / RU-04 38,25 "cho Ngân hàng B", dòng tiền "…dùng để trả khoản vay của Ngân hàng B". | Không. Phân bổ khóa khớp du-lieu mục 12. |
| g04 | GĐ3 — đã chọn, chờ ký | g04-1366 | "Bạn đã chọn chào giá của Ngân hàng B — 85 triệu, lãi suất 13,2%/năm. Thỏa thuận… được ký trên trang của Ngân hàng B." khung ước tính; "Chọn chào giá khác" viền + "Ký trên trang Ngân hàng B" đặc. | Không. |
| g05 | GĐ3 — đã ký với Ngân hàng B | g05-1366 | Bước tiếp theo "Dòng tất toán trong mô phỏng chỉ dựng cho Techcombank." Thẻ "Đã ký thỏa thuận với Ngân hàng B. Sổ đăng ký đã ghi khóa 85 triệu.", RU-03 / RU-04 "Đã khóa", khung "Dòng tất toán trong mô phỏng dựng cho Techcombank.", nút viền "Bắt đầu lại" (chữ gãy 2 dòng) và nút đặc "Chọn lại chào giá". Chứng thư khóa bên nhận bảo đảm Ngân hàng B, cùng mã LOCK-2027-0915-00318. | [dàn dựng] "mô phỏng" hai lần + "prototype". Nút "Bắt đầu lại" quá hẹp, chữ gãy 2 dòng. |

## 3. Cảnh không chụp được

Không có — 50/50 cảnh chạy hết các bước, không cảnh nào lỗi thao tác hay trang trắng (bao-cao.json).

Giao diện có trong app nhưng cố ý không có cảnh (đã ghi trong docs/shots/HUONG-DAN.md):
- Màn "Mô phỏng gặp trạng thái không mong đợi" (CrashGuard): chỉ hiện khi có lỗi hiển thị, không gây ra được mà không sửa app.
- Màn chuyển tiếp 700ms sang/về trang ngân hàng: bị tắt vì chụp ở chế độ reducedMotion.
- Phím F (toàn màn hình): trình duyệt headless không có chế độ này.

## 4. Vấn đề cần người quyết (tổng hợp)

1. **Nhiệm vụ 2 dễ bị bỏ sót, thẻ Bước tiếp theo không nhắc.** Nhiệm vụ 2 chỉ xong khi mở trang Khoản phải thu sau 15/09. Đi thẳng
   Tổng quan → Ứng vốn → … → trả hết (n30, n32) vẫn còn 3–4/5. Ở lần chụp đầu của n35 (trước khi thêm bước mở Khoản phải thu),
   Tổng quan ghi "Bước tiếp theo: Không cần làm gì ở trang này" trong khi khung nhiệm vụ là 4/5 — người dùng không biết còn thiếu gì.
2. **Nút chính của tình huống đứt gãy nằm dưới màn đầu** (t02): "Tôi đã đổi tài khoản — giải trình" ở y ≈ 808, thẻ Bước tiếp theo
   phía trên không có nút.
3. **Hai nút chính cùng lúc** ở n02, n04–n08, n13, n22, n26, t02 — phần lớn do thẻ Bước tiếp theo lặp nút của thân trang.
4. **Chữ dàn dựng trong vùng sản phẩm**: "Bật ở bảng Mô phỏng" (n21, n22), "Mô phỏng mùa cao điểm… / Tắt Mùa cao điểm" (n23),
   "Chữ ký minh họa trong prototype" (n26, n28, c05, g05), "Dòng tất toán trong mô phỏng…" (g05), "mô phỏng đi theo tài khoản này" (n03).
5. **Số liệu cần chốt**: tiền lãi GĐ3 154 / 171 nghìn đồng so với du-lieu 0,15 / 0,17 (g02); 247 nghìn đồng mùa cao điểm không có
   trong du-lieu (n23).
6. **Nhỏ**: "7/6 lô" (n14, n35); nút Tua vô hiệu trên bảng Mô phỏng trông như đang bấm được (n11); tên tình huống bị cắt trong thẻ kết
   (n35); "Bắt đầu lại" gãy dòng (g05); chấm đỏ trong khung bankOps (t04); 404 favicon (n01); Vitest quét cả `.claude/worktrees`.

Không thấy: chữ tràn ngang trang, chữ còn tên cũ, số liệu sai so với các test T1–T10.

## 5. Giao diện nghi còn thiếu trong kiểm kê

- Chứng thư khóa → "Xem dạng kỹ thuật" (n26, n28, c05 có nút nhưng chưa có cảnh mở).
- Đối soát: các bộ lọc Đã khớp / Ngoại lệ / Hoàn / Chi ra.
- Quyền & dữ liệu sau khi rút A1 hoặc A2 (trạng thái "đã rút", nút "Cấp lại", Bước tiếp theo "Cấp lại A1"); trang Rút quyền A1;
  nút rút A4 khi đã ký nhưng chưa giải ngân; kết quả sau "Xuất hồ sơ".
- Ứng vốn khi A2 bị rút sau khi ký A4 ("A2 đã bị rút").
- Tổng quan khi bật Mùa cao điểm (tiền đang chờ sàn 300).
- Đổi tài khoản nhận tiền sau khi giải trình (trả RU-03 từ nguồn khác, nhiệm vụ 6 xong); cán bộ tra cứu ở mốc RU-03 đứt gãy.
- GĐ3: chọn Techcombank (nhánh giải ngân), trang ký của Công ty tài chính C.
- Chế độ "Tự khám phá" ở màn chào; khung nhiệm vụ thu gọn; mục "Phím tắt" mở trên bảng Mô phỏng.
- Bong bóng chú giải thuật ngữ (gộp khỏi kiểm kê để giữ 50 cảnh).
