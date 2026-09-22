# Đừng Đóng Vai Anh — Prototype Open Banking

Giao diện mô phỏng hành trình khách hàng cho đề án Open Banking, cuộc thi FTU Vòng 3.  
**Không phải sản phẩm thật** — không backend, không gọi API bên ngoài, không lưu dữ liệu thật.

---

## Trình chiếu

### Vercel (online)
Truy cập bản deploy mới nhất qua link Vercel của dự án. Cần kết nối mạng.

### Bản offline (file:// — không cần mạng)
1. Lấy file `dist-offline/index.html` (build từ nhánh, hoặc chạy `npm run build:offline`)
2. Mở trực tiếp bằng trình duyệt: File → Open File… → chọn `index.html`
3. Mọi tài nguyên (font, CSS, JS) đã nhúng inline — không cần server, không cần mạng

> Dung lượng file offline: ~1,77 MB (597 KB gzip).

---

## Bảng phím

| Phím | Tác dụng |
|---|---|
| `→` / `←` | Chuyển màn |
| `Space` | Tiến dòng thời gian (Màn 6) |
| `M` | Bật/tắt kịch bản Mega Sale |
| `L` | Bật/tắt kịch bản Rò rỉ |
| `3` | Bật/tắt Giai đoạn 3 (nhiều bên chào giá) |
| `D` | Mô phỏng Techcombank gửi lại lệnh khóa (Màn 5 sau khi đã khóa, và Màn 8) — minh họa lũy đẳng |
| `R` | Đặt lại toàn bộ kịch bản |
| `?` | Xem/ẩn bảng phím đầy đủ |

---

## Phát triển

```bash
npm ci          # cài phụ thuộc
npm run dev     # chạy thử localhost:5173
npm test        # kiểm thử công thức + quy tắc
npm run build   # build Vercel → dist/
npm run build:offline  # build offline → dist-offline/index.html
```

---

*Giao diện mô phỏng — dữ liệu giả định*
