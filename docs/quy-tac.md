# Quy tắc nội dung — bắt buộc tuân thủ

Prototype phải nhất quán với đề án. Mỗi quy tắc dưới đây gắn với một phần của đề án;
vi phạm quy tắc nghĩa là prototype nói khác bản viết.

## 1. Nhất quán số liệu
- Mọi con số lấy từ docs/du-lieu.md hoặc tính bằng công thức ở mục 4 của file đó.
- Không viết cứng số trong giao diện.
- Bốn con số phải đúng tuyệt đối: 85 triệu (kỳ thường), 73% (tỷ lệ ứng Mega Sale),
  150 triệu (trần dư nợ), 6 lô (điều kiện có điểm xác thực).

## 2. Nhất quán pháp lý — vai trò các bên
- Techcombank là bên DUY NHẤT cấp tín dụng, ký thỏa thuận bảo đảm và giải ngân.
  Mọi màn liên quan tín dụng (A2, A4, chào giá, giải ngân) phải hiện rõ điều này.
- Nền tảng chỉ là hạ tầng: đối soát, sổ đăng ký, giao thức. Không có câu chữ, nút bấm
  hay luồng nào cho thấy Nền tảng cho vay, ứng tiền, mua khoản phải thu, giữ tiền
  hoặc chuyển tiền hộ.
- Cụm từ được dùng: "khoản vay có bảo đảm bằng khoản phải thu", "Techcombank giải ngân".
- Cụm từ không được dùng: "Nền tảng ứng tiền", "bán khoản phải thu", "Nền tảng giải ngân",
  "ví của Nền tảng", "tài khoản trung gian".
- Tiền giải ngân và thu hồi đi thẳng giữa Techcombank và tài khoản nhà bán.

## 3. Nhất quán pháp lý — cấp quyền
- Trang cấp quyền A1 và A2 là trang của ngân hàng, giao diện tách biệt hẳn với Nền tảng,
  có dòng "Bạn đang ở trang của Techcombank".
- Mỗi quyền ghi rõ: mục đích, phạm vi dữ liệu, thời hạn, quyền rút lại.
- Rút A2 không ảnh hưởng A1.
- A4 là thỏa thuận với Techcombank, không phải quyền xử lý dữ liệu; không rút được
  khi còn dư nợ (hiện lý do).
- Không có ô nào được tích sẵn.

## 4. Minh bạch với nhà bán
- Mọi giá trị ứng ước tính có dòng: "Ước tính, chưa phải đề nghị cấp tín dụng".
- Bảng tính giá trị khả dụng hiện từng bước, không chỉ hiện kết quả cuối.
- Khi bị chặn bởi trần dư nợ, hiện rõ dòng "Bị chặn bởi trần dư nợ".
- Chào giá hiện cả lãi suất năm lẫn tiền lãi ước tính theo số ngày thực tế.

## 5. Sổ đăng ký và góc nhìn ngân hàng
- Màn góc nhìn ngân hàng hiện giá trị đã bị khóa và SỐ LƯỢNG bên đang khóa.
  TUYỆT ĐỐI không hiện tên bên đang khóa.
- Chứng thư khóa có dòng "Ký số — kiểm chứng độc lập".

## 6. Phạm vi mô phỏng
- Không gọi bất kỳ API bên ngoài nào, kể cả API của Claude.
- Bỏ hoàn toàn phần "Claude API live credit analysis" của bản cũ: quyết định tín dụng
  thuộc Techcombank, không thuộc Nền tảng.
- Chân trang mọi màn: "Giao diện mô phỏng — dữ liệu giả định".

## 7. Sở hữu trí tuệ
- Tên Techcombank, Shopee, TikTok Shop, Facebook chỉ dạng chữ.
- Không dùng logo, kiểu chữ hay bộ nhận diện của các đơn vị này. Ngoại lệ duy nhất: khung
  trang Techcombank được dùng màu xấp xỉ (thanh đen, vạch đỏ 4px, điểm nhấn vàng kim) theo
  docs/san-pham.md mục K.2–K.3, luôn kèm chữ 'Mô phỏng'. Bên cho vay khác dùng khung trung
  tính. *(Sửa ở Vòng 20, người dùng duyệt.)*
- Bên cho vay khác và hãng vận chuyển dùng tên giả ("Ngân hàng B", "Hãng vận chuyển A").

## 8. Trình chiếu
- Chữ nội dung chính tối thiểu 16px, tiêu đề tối thiểu 24px.
- Kiểm tra ở độ phân giải 1920×1080; không có chữ bị cắt, không cuộn ngang.
- Màu theo ngữ nghĩa trong CLAUDE.md, thống nhất với sơ đồ trong đề án.
