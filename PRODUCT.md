# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Giám khảo cuộc thi đề án Open Banking (FTU, Vòng 3) — chuyên gia ngân hàng/kinh tế,
không phải người dùng cuối thật. Họ xem một buổi trình diễn 3 phút trên máy chiếu
1920×1080, không tự thao tác. Nhân vật mô phỏng trong kịch bản: chị Lan, chủ shop mỹ
phẩm bán trên Shopee, TikTok Shop, Facebook và website riêng, doanh thu 500 triệu/tháng,
khách hàng hiện hữu của Techcombank.

## Product Purpose

Prototype trình diễn (không phải sản phẩm thật) kể câu chuyện Open Banking: khoản phải
thu của nhà bán trên các sàn thương mại điện tử trở thành tài sản bảo đảm minh bạch để
Techcombank cấp vốn ứng trước, thay vì nhà bán phải đối soát thủ công và vay tín chấp lãi
cao. Thành công = giám khảo hiểu đúng câu chuyện 4 hồi trong ≤10 giây mỗi màn, và tin
tưởng vào tính đúng đắn pháp lý/ngân hàng của mô hình.

## Positioning

Nền tảng chỉ đóng vai trò hạ tầng đối soát và sổ đăng ký khóa liên ngân hàng (registry),
KHÔNG phải bên cho vay. Techcombank là bên duy nhất cấp tín dụng, ký thỏa thuận bảo đảm và
giải ngân. Điểm khác biệt với mô hình quen thuộc (vd. MSB–Sapo) là sổ đăng ký dùng chung
cho phép nhiều bên cấp tín dụng cùng nhìn thấy phần khoản phải thu đã bị khóa, tránh vay
chồng vượt sức trả nợ (Giai đoạn 3: nhiều bên chào giá trên cùng một đường ray).

## Operating Context

- Trình chiếu trực tiếp trên máy chiếu 1920×1080 trước ban giám khảo, không phải một
  người dùng tự thao tác trên máy cá nhân.
- Bản offline single-file (không phụ thuộc mạng khi trình chiếu) và bản online (Vercel).
- Điều khiển bằng bàn phím khi trình bày: mũi tên trái/phải chuyển màn; M = Mega Sale;
  L = rò rỉ; 3 = Giai đoạn 3; R = đặt lại (xem docs/kich-ban.md).
- 10 màn hình theo thứ tự cố định (docs/man-hinh.md), tương ứng 4 hồi kịch bản
  (docs/kich-ban.md): Vấn đề → Cấp quyền → Nhận giá trị → Tất toán và hệ sinh thái.
- Ba khung vai trò xuất hiện xen kẽ và phải phân biệt được ngay: (a) ứng dụng Nền tảng
  của nhà bán, (b) trang mô phỏng Techcombank (giao diện tách biệt hẳn), (c) bảng điều
  khiển nội bộ ngân hàng (Màn 8).

## Capabilities and Constraints

- Không backend thật, không gọi API bên ngoài (kể cả API của Claude), không lưu dữ liệu
  thật — toàn bộ số liệu là giả định, lấy từ docs/du-lieu.md hoặc tính từ src/logic/.
  Không viết cứng số liệu trong component.
- Bốn con số phải đúng tuyệt đối trong mọi màn: 85 triệu (kỳ thường), 73% (tỷ lệ ứng
  Mega Sale), 150 triệu (trần dư nợ), 6 lô (điều kiện có điểm xác thực).
- Ràng buộc pháp lý/nội dung bắt buộc theo docs/quy-tac.md — không thể nới lỏng vì lý do
  thẩm mỹ: Techcombank là bên duy nhất cấp tín dụng/giải ngân; Nền tảng không được ngụ ý
  cho vay, ứng tiền, giữ tiền hay có "ví"/"tài khoản trung gian"; góc nhìn ngân hàng không
  hiện tên bên đang khóa, chỉ hiện số lượng; mọi giá trị ứng ước tính phải có dòng "Ước
  tính, chưa phải đề nghị cấp tín dụng"; tên thương hiệu bên thứ ba (Techcombank, Shopee,
  TikTok Shop, Facebook) chỉ ở dạng chữ, không logo, không màu thương hiệu riêng.
- Chữ nội dung chính tối thiểu 16px, tiêu đề tối thiểu 24px (đọc được từ cuối phòng).
  Kiểm tra ở đúng 1920×1080, không cuộn ngang, không chữ bị cắt.
- Chân trang mọi màn: "Giao diện mô phỏng — dữ liệu giả định".
- Stack hiện có: Vite + React + Tailwind CSS, Vitest cho kiểm thử công thức. Font
  @fontsource/be-vietnam-pro đã đóng gói cục bộ (hỗ trợ dấu tiếng Việt, không phụ thuộc
  Google Fonts) — phù hợp yêu cầu bản offline single-file. Không thêm thư viện khác nếu
  chưa hỏi.
- Component chỉ trong src/components/ui/; mọi thay đổi giao diện phải theo hệ thống
  thiết kế (docs/thiet-ke.md, sẽ được DESIGN.md bổ sung ràng buộc khóa).

## Brand Commitments

- Tên sản phẩm/giải pháp hiển thị trên thanh trên cùng và ở vị trí pháp lý (bên yêu cầu
  cấp quyền, bên ký) dùng "Công ty [tên giải pháp]" — không dùng tên thương hiệu bên thứ
  ba ở đó.
- Bảng màu ngữ nghĩa cố định, không đổi ý nghĩa: teal = Tầng 1/tất toán, purple = Tầng
  2/đã khóa, orange = Tầng 3, amber = tất toán thiếu, red = đứt gãy, gray = trung tính/dự
  phóng/hết hiệu lực/đã hoàn.
- Giọng điệu: điềm tĩnh, đáng tin, chuẩn ngân hàng — không "startup vui nhộn".

## Evidence on Hand

- docs/du-lieu.md — nguồn số liệu duy nhất, kèm công thức và kết quả bắt buộc.
- docs/reference/settlesync_prototype.html — bản cũ, tham khảo để tái sử dụng bố cục màn
  1–4 khi phù hợp; không phải nguồn sự thật cho nội dung hay số liệu.
- Không có testimonial, case study hay số liệu khách hàng thật nào khác; không được bịa
  thêm ngoài docs/du-lieu.md.

## Product Principles

1. Tính đúng đắn pháp lý (docs/quy-tac.md) luôn thắng thẩm mỹ — không có ngoại lệ cho
   một màn đẹp hơn nếu nó làm mờ vai trò Techcombank hay lộ tên bên khóa.
2. Mỗi màn trả lời đúng một câu hỏi của người xem trong kịch bản 4 hồi, không nhồi thêm
   thông tin không phục vụ câu chuyện 3 phút.
3. Đọc được từ cuối phòng trên máy chiếu 1920×1080 quan trọng hơn mật độ thông tin.
4. Ba khung vai trò (nhà bán / Techcombank / ngân hàng nội bộ) phải phân biệt được ngay
   bằng thị giác, không chỉ bằng chữ.
5. Không thêm phụ thuộc hay component mới ngoài phạm vi cần thiết cho một vòng làm việc.

## Accessibility & Inclusion

- Không có yêu cầu accessibility cụ thể ngoài khả năng đọc trên máy chiếu (cỡ chữ tối
  thiểu, độ tương phản, không phụ thuộc riêng vào màu để phân biệt trạng thái — vì màu có
  thể khó phân biệt qua máy chiếu và với người khiếm thị màu).
