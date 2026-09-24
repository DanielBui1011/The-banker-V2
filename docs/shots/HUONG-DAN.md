# Chụp toàn bộ giao diện — hướng dẫn chạy trên máy của bạn

Công cụ: `scripts/shots.mjs` (Playwright), danh sách cảnh: `scripts/shots.scenes.js` (69 cảnh, Vòng 29).
Trình duyệt: Chromium của Playwright nếu đã tải; nếu không (mạng chặn cdn.playwright.dev), công cụ tự dùng
Google Chrome hoặc Microsoft Edge đã cài trên máy — cùng lõi Chromium, không phải tải gì thêm.

## 1. Cài đặt (một lần)

1. Cài Node.js 20 trở lên (https://nodejs.org, bản LTS). Kiểm tra: `node -v`.
2. Trong thư mục repo:

   ```bash
   npm install
   npx playwright install chromium
   ```

   Lệnh thứ hai tải Chromium (khoảng 150 MB) vào `%LOCALAPPDATA%\ms-playwright`.

   Nếu PowerShell báo `npm.ps1 cannot be loaded because running scripts is disabled on this system`, thêm đuôi
   `.cmd` vào lệnh (`npm.cmd install`, `npx.cmd playwright install chromium`, `npm.cmd run shots -- v27`), hoặc chạy
   các lệnh trong Command Prompt (cmd). Cách này không phải đổi Execution Policy của máy.

## 2. Chụp

`<nhan>` là tên đợt chụp, ví dụ `v27`. Ảnh ghi vào `docs/shots/<nhan>/`.

**Cách A — chụp bản build trên máy** (tự chạy `npm run build` rồi `vite preview` ở cổng 4173, chụp xong tự tắt):

```bash
npm run shots -- v27
```

Cổng 4173 phải đang trống.

**Cách B — chụp đường dẫn xem trước trên Vercel** (không cần build):

```bash
BASE_URL=https://<duong-dan-xem-truoc>.vercel.app/ npm run shots -- v27
```

Trên PowerShell: `$env:BASE_URL='https://<duong-dan-xem-truoc>.vercel.app/'; npm run shots -- v27`

Chạy hết mất vài phút. Màn hình in từng cảnh với ✓ (chụp được) hoặc ✗ (có lỗi và lý do).

## 3. Kết quả

| File | Nội dung | Commit? |
|---|---|---|
| `docs/shots/<nhan>/png/<id>-1366.png` | Mỗi cảnh chụp cả trang ở 1366×768. Vạch đứt đỏ ở y = 768 đánh dấu hết màn hình đầu | Không (đã có trong .gitignore) |
| `docs/shots/<nhan>/png/<id>-1920.png` | Trang chính (`man1920: true`), chỉ phần trong khung nhìn 1920×1080 | Không |
| `docs/shots/<nhan>/bao-cao.json` | Từng cảnh: file ảnh, chiều cao, lỗi thao tác, lỗi console | Có |
| `docs/shots/<nhan>/contact-sheet.pdf` | Mỗi trang một ảnh, tiêu đề là id + tên cảnh; ảnh cao hơn 1100px được cắt thành "phần 1/2…"; JPEG khoảng 80%, dưới 25 MB | Có |

Sau khi chụp xong, nhờ Claude Code viết `docs/shots/<nhan>/walkthrough.md`: Claude mở từng ảnh, tả những gì thấy
trên ảnh và ghi các vấn đề tìm được.

## 4. Cách công cụ chụp

- Mỗi cảnh bắt đầu từ trạng thái sạch: xóa localStorage rồi tải lại trang, sau đó làm các bước của cảnh.
  Các bước gồm: `goto` (đặt hash), `press` (phím tắt), `click` (theo tên nút/liên kết/ô chọn hoặc bộ chọn CSS), `wait`.
- Bật reducedMotion `reduce`, nên màn chuyển tiếp 700ms sang trang Techcombank bị bỏ qua (đúng như hành vi thật của app).
  Trước khi chụp, công cụ chờ networkidle, chờ thông báo ngắn (4 giây) của bước Tua trước đó tự tắt — trừ cảnh
  có `giuThongBao: true` — rồi thêm 300ms.
- App chỉ cao đúng một màn hình và cuộn bên trong. Để chụp được phần nằm dưới màn hình đầu, công cụ tăng chiều cao
  khung nhìn tới khi không còn vùng nào phải cuộn. Phần nằm trên vạch đỏ là phần thấy được ở 1366×768. Riêng chân trang
  "Giao diện mô phỏng…" (cao khoảng 40px) lúc chụp nằm dưới đáy ảnh, còn trên màn thật nó che đáy màn hình đầu.
  Phần tử dính đáy (nút Đồng ý trên trang ký) nằm ở cuối nội dung trong ảnh, còn trên màn 768 nó luôn hiện.
- Nếu đang có lớp phủ (hộp thoại, ngăn kéo, hộp Hậu trường kỹ thuật), công cụ giữ nguyên khung 1366×768, vì lớp phủ căn
  theo khung nhìn.
- Nếu một bước không tìm thấy phần tử sau 5 giây, công cụ bỏ các bước còn lại, vẫn chụp hiện trạng và ghi lỗi vào
  bao-cao.json. Cả script không dừng.

## 5. Thêm hoặc sửa cảnh

Sửa `scripts/shots.scenes.js`. Mỗi cảnh có dạng `{ id, tieuDe, buoc: [...], ghiChu, man1920 }`. Các chuỗi bước dùng lại
(kết nối A1, tua, cấp A2, ký A4, giải ngân, trả nợ…) đã khai báo sẵn ở đầu file.

Các biến thể đã gộp vì giao diện gần như giống nhau:

- trang cấp quyền A2: cùng khuôn ConsentPage với A1 (cảnh n09);
- Khoản vay ngày 20/09: giống n27, chỉ khác nút Trả RU-03 đã bấm được;
- Tổng quan ngày 01/08 sau khi kết nối: thẻ "Đã kết nối" đã có trong n14;
- bong bóng chú giải thuật ngữ;
- trạng thái "Techcombank đang thẩm định…" (chỉ hiện 1,2 giây);
- Đổi tài khoản nhận tiền ở mốc hết cửa sổ thanh toán (E4).

Các giao diện không có cảnh:

- màn "Mô phỏng gặp trạng thái không mong đợi" (CrashGuard): chỉ hiện khi có lỗi hiển thị, không gây ra được mà không sửa app;
- màn chuyển tiếp 700ms sang/về Techcombank: bị tắt vì chụp ở chế độ reducedMotion;
- phím F (toàn màn hình): trình duyệt chạy ẩn (headless) không có chế độ toàn màn hình.
