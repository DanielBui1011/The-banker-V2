# Vòng 23 — Hành trình 2: cổng ngân hàng ↔ trang Khoản vay cùng ngày

Đổi vai bằng lệnh trong app (`#/mo-phong/doi-vai`); trước và sau khi đổi, `eventIndex`,
`registry`, `repaid` trong localStorage giống hệt nhau. Ảnh 1920×1080, `prefers-reduced-motion`.

| Ngày | Dư nợ (Khoản vay, nhà bán) | Tổng phơi nhiễm hợp nhất (cán bộ) | Số bên khóa | RU-03 đã khóa | RU-03 trạng thái | Cảnh báo | Ảnh |
|---|---|---|---|---|---|---|---|
| 15/09 | 85 | 85 | 1 | 46,75 | Đã khóa | 0 | `j2-15-09-*` |
| 20/09 (đã trả RU-04) | 46,75 | 46,75 | 1 | 46,75 | Đã khóa | 0 | `j2-20-09-*` |
| 24/09 | 46,75 | 46,75 | 1 | 46,75 | Đứt gãy | 1 | `j2-24-09-*` |
| 24/09 sau giải trình + trả 46,75 | 0 | 0 | 0 | 0 | Đứt gãy (giữ trong lịch sử) | 1 | `j2-24-09-tat-toan-*` |

Khớp ở cả 4 mốc. Test tự động: `journey.test.js` → "hành trình 2: phơi nhiễm = dư nợ trang
Khoản vay ở mọi mốc".
