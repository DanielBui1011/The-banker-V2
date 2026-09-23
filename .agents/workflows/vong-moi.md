---
description: Chạy một vòng sửa prototype theo quy trình chuẩn (nhánh mới, kế hoạch, build/test, ảnh 2 kích thước, PR)
---

1. Đọc AGENTS.md và docs/ban-giao.md (mục 5 "Quyết định đã chốt" và mục 7 "Việc còn lại"). Chỉ đọc thêm DESIGN.md, docs/quy-tac.md và file của các màn liên quan tới yêu cầu vòng này.
2. `git checkout main && git pull`, rồi tạo nhánh `vong-NN-mo-ta-ngan` (NN = số vòng người dùng đưa).
3. Lập Implementation Plan: danh sách file sẽ sửa, tiêu chí chấp nhận cho từng việc, cách kiểm tra. Nêu rõ nếu việc nào đụng tới "Quyết định đã chốt" hoặc src/logic. Dừng lại chờ người dùng duyệt.
4. Thực hiện theo kế hoạch. Ưu tiên sửa ở component dùng chung. Không thêm dependency. Không sửa kỳ vọng test.
5. Chạy `npm run build` và `npm test`. Nếu lỗi: tìm nguyên nhân gốc, sửa, chạy lại. Không đi tiếp khi còn đỏ.
6. Chạy `npm run dev`, dùng browser agent chụp các màn đã sửa ở 1920×1080 và 1536×864 (kèm các trạng thái M/L/3 nếu liên quan). Tự so ảnh với tiêu chí chấp nhận; sửa nếu chưa đạt.
7. Cập nhật docs/ban-giao.md: thêm một dòng vào bảng mục 4 (lịch sử) và đánh dấu mục đã xong ở mục 7. Nếu có quyết định thiết kế mới được người dùng duyệt, thêm vào mục 5.
8. Commit, push nhánh, tạo PR. Walkthrough gồm: tóm tắt thay đổi, kết quả build/test thật, ảnh chụp 2 kích thước, việc còn tồn.
