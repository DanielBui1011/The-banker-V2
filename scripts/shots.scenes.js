// Kiểm kê giao diện cho công cụ chụp ảnh (scripts/shots.mjs). Mỗi cảnh chạy từ trạng thái sạch
// (xóa localStorage + tải lại), rồi làm lần lượt các bước:
//   { goto: '#/…' }                 đặt URL hash ('#/mo-phong/…' là lệnh bảng Mô phỏng)
//   { press: 'Space' }              bấm phím (bỏ focus khỏi nút trước để phím tắt chạy)
//   { click: 'chữ', role?, css? }   bấm theo tên nút/liên kết/ô chọn (khớp đúng trước, rồi khớp một phần)
//                                   hoặc theo bộ chọn CSS khi có css
//   { wait: ms }
// man1920: true → chụp thêm ảnh khung nhìn 1920×1080 (trang chính).
// giuThongBao: true → chụp cả thông báo ngắn (mặc định chờ thông báo tự tắt rồi mới chụp).

const CHAO = [{ click: 'Bắt đầu có hướng dẫn' }]
const DONG_Y = { click: 'Tôi đã đọc', role: 'checkbox' }
const KET_NOI = [{ goto: '#/techcombank/a1' }, DONG_Y, { click: 'Đồng ý cấp quyền' }]
const TUA = { goto: '#/mo-phong/tua' }
const DOI_VAI = { goto: '#/mo-phong/doi-vai' }
const CAP_A2 = [{ goto: '#/techcombank/a2' }, DONG_Y, { click: 'Đồng ý cấp quyền' }]
const KY_A4 = [{ goto: '#/nha-ban/ung-von' }, { click: 'Tiếp: ký thỏa thuận A4' }, DONG_Y, { click: 'Ký thỏa thuận' }]
const TRA = (don) => [{ goto: `#/techcombank/tra-no?don-vi=${don}` }, { click: 'Xác nhận trả nợ' }]

// Mốc hành trình chính (01/08 → 15/09 → giải ngân → trả hết)
const DA_KET_NOI = [...CHAO, ...KET_NOI]
const DEN_1509 = [...DA_KET_NOI, TUA]
const DA_A2 = [...DEN_1509, ...CAP_A2]
const DA_KY_A4 = [...DA_A2, ...KY_A4]
const DA_VAY = [...DA_KY_A4, { click: 'Gửi đề nghị tới Techcombank' }, { wait: 1600 }]
const DA_TRA_HET = [...DA_VAY, TUA, ...TRA('RU-03'), TUA, ...TRA('RU-04')]
// Tình huống Đổi tài khoản nhận tiền: bật trước 20/09, tua tới hết ân hạn (E5)
const DOI_TK = [...DA_VAY, { press: 'l' }]
const DUT_GAY = [...DOI_TK, TUA, TUA, TUA, TUA]
// Giai đoạn 3: bật ở 15/09, cấp A2, gửi yêu cầu cho cả ba bên
const GD3 = [...DEN_1509, { press: '3' }, ...CAP_A2, { goto: '#/nha-ban/ung-von' }]
const GD3_CHAO_GIA = [
  ...GD3,
  { click: 'Techcombank', role: 'checkbox' },
  { click: 'Ngân hàng B', role: 'checkbox' },
  { click: 'Công ty tài chính C', role: 'checkbox' },
  { click: 'Gửi yêu cầu chào giá' },
]

export default [
  // ─── Nhà bán, 01/08 — chưa kết nối ────────────────────────────────────────
  { id: 'n01', tieuDe: 'Màn chào (lần đầu mở app)', buoc: [], ghiChu: 'Hộp thoại chào, 01/08' },
  { id: 'n02', tieuDe: 'Tổng quan — chưa kết nối', buoc: [...CHAO], man1920: true },
  {
    id: 'n03',
    tieuDe: 'Tổng quan — ngăn chọn ngân hàng nhận tiền',
    buoc: [...CHAO, { click: 'Kết nối Techcombank' }, { click: 'Hỗ trợ kết nối qua Open API' }],
    ghiChu: 'Đã bấm một ngân hàng khác để hiện ghi chú "Tiền sàn của chị Lan về tài khoản Techcombank."',
  },
  {
    id: 'n04',
    tieuDe: 'Đối soát — trống (chưa kết nối) + thông báo phím Space bị chặn',
    buoc: [...CHAO, { goto: '#/nha-ban/doi-soat' }, { press: 'Space' }],
    giuThongBao: true,
    man1920: true,
  },
  { id: 'n05', tieuDe: 'Khoản phải thu — trống (chưa kết nối)', buoc: [...CHAO, { goto: '#/nha-ban/khoan-phai-thu' }], man1920: true },
  { id: 'n06', tieuDe: 'Ứng vốn — trống (chưa có khoản phải thu)', buoc: [...CHAO, { goto: '#/nha-ban/ung-von' }], man1920: true },
  { id: 'n07', tieuDe: 'Khoản vay — trống (chưa có khoản vay)', buoc: [...CHAO, { goto: '#/nha-ban/khoan-vay' }], man1920: true },
  { id: 'n08', tieuDe: 'Quyền & dữ liệu — chưa kết nối', buoc: [...CHAO, { goto: '#/nha-ban/quyen-du-lieu' }], man1920: true },
  { id: 'n09', tieuDe: 'Trang Techcombank — cấp quyền A1', buoc: [...CHAO, { goto: '#/techcombank/a1' }], man1920: true },
  { id: 'n10', tieuDe: 'Ngăn Hướng dẫn (phím ?)', buoc: [...CHAO, { press: '?' }] },
  { id: 'n11', tieuDe: 'Bảng Mô phỏng mở — 01/08, các nút bị chặn', buoc: [...CHAO, { click: 'Mở bảng Mô phỏng' }] },
  { id: 'n12', tieuDe: 'Hộp xác nhận Bắt đầu lại (phím R)', buoc: [...CHAO, { press: 'r' }] },

  // ─── Nhà bán, 01/08 — đã kết nối ──────────────────────────────────────────
  { id: 'n13', tieuDe: 'Đối soát — đang tích lũy lịch sử, 01/08', buoc: [...DA_KET_NOI, { goto: '#/nha-ban/doi-soat' }] },

  // ─── Nhà bán, 15/09 — sáu tuần đối soát xong ──────────────────────────────
  { id: 'n14', tieuDe: 'Tổng quan — 15/09 (thẻ 6 tuần sau)', buoc: [...DEN_1509, { goto: '#/nha-ban/tong-quan' }], man1920: true },
  {
    id: 'n15',
    tieuDe: 'Đối soát — ngay sau khi tua tới 15/09 (thẻ 6 tuần sau + thông báo)',
    buoc: [...DA_KET_NOI, { goto: '#/nha-ban/doi-soat' }, TUA],
    giuThongBao: true,
    man1920: true,
  },
  { id: 'n16', tieuDe: 'Đối soát — ngăn Ngoại lệ', buoc: [...DEN_1509, { goto: '#/nha-ban/doi-soat' }, { click: 'Xử lý ngoại lệ' }] },
  { id: 'n17', tieuDe: 'Đối soát — ngăn Sai lệch phí', buoc: [...DEN_1509, { goto: '#/nha-ban/doi-soat' }, { click: 'Xem chi tiết' }] },
  {
    id: 'n18',
    tieuDe: 'Đối soát — xem tất cả giao dịch + ngăn chi tiết giao dịch',
    buoc: [...DEN_1509, { goto: '#/nha-ban/doi-soat' }, { click: 'Xem tất cả' }, { click: 'tbody tr', css: true }],
  },
  { id: 'n19', tieuDe: 'Khoản phải thu — 15/09', buoc: [...DEN_1509, { goto: '#/nha-ban/khoan-phai-thu' }], man1920: true },
  {
    id: 'n20',
    tieuDe: 'Khoản phải thu — ngăn phân rã điểm xác thực Shopee',
    buoc: [...DEN_1509, { goto: '#/nha-ban/khoan-phai-thu' }, { click: 'Điểm xác thực Shopee' }],
  },

  // ─── Ứng vốn (kỳ thường) ─────────────────────────────────────────────────
  { id: 'n21', tieuDe: 'Ứng vốn bước 1 — cần quyền A2', buoc: [...DEN_1509, { goto: '#/nha-ban/ung-von' }], man1920: true },
  { id: 'n22', tieuDe: 'Ứng vốn bước 2 — ước tính giá trị khả dụng', buoc: [...DA_A2, { goto: '#/nha-ban/ung-von' }], man1920: true },
  {
    id: 'n23',
    tieuDe: 'Ứng vốn — ước tính mùa cao điểm (phím M)',
    buoc: [...DA_A2, { goto: '#/nha-ban/ung-von' }, { press: 'm' }],
  },
  {
    id: 'n24',
    tieuDe: 'Trang Techcombank — ký thỏa thuận A4',
    buoc: [...DA_A2, { goto: '#/nha-ban/ung-von' }, { click: 'Tiếp: ký thỏa thuận A4' }],
    man1920: true,
  },
  { id: 'n25', tieuDe: 'Ứng vốn bước 4 — gửi đề nghị', buoc: [...DA_KY_A4] },
  { id: 'n26', tieuDe: 'Ứng vốn bước 5 — đã giải ngân', buoc: [...DA_VAY] },

  // ─── Khoản vay và trả nợ ─────────────────────────────────────────────────
  { id: 'n27', tieuDe: 'Khoản vay — 15/09, chờ sàn thanh toán', buoc: [...DA_VAY, { goto: '#/nha-ban/khoan-vay' }], man1920: true },
  { id: 'n28', tieuDe: 'Khoản vay — ngăn Chứng thư khóa', buoc: [...DA_VAY, { goto: '#/nha-ban/khoan-vay' }, { click: 'Xem chứng thư khóa' }] },
  { id: 'n29', tieuDe: 'Trang Techcombank — trả nợ một chạm RU-03', buoc: [...DA_VAY, TUA, { goto: '#/techcombank/tra-no?don-vi=RU-03' }], man1920: true },
  { id: 'n30', tieuDe: 'Khoản vay — đã trả hết', buoc: [...DA_TRA_HET, { goto: '#/nha-ban/khoan-vay' }] },
  {
    id: 'n31',
    tieuDe: 'Trang Techcombank — bị chặn (trả nợ khi chưa có khoản vay)',
    buoc: [...DEN_1509, { goto: '#/techcombank/tra-no?don-vi=RU-03' }],
  },

  // ─── Quyền & dữ liệu ─────────────────────────────────────────────────────
  { id: 'n32', tieuDe: 'Quyền & dữ liệu — sau khi trả hết (nhật ký đầy đủ)', buoc: [...DA_TRA_HET, { goto: '#/nha-ban/quyen-du-lieu' }], man1920: true },
  {
    id: 'n33',
    tieuDe: 'Quyền & dữ liệu — hộp Hậu trường kỹ thuật',
    buoc: [...DA_VAY, { goto: '#/nha-ban/quyen-du-lieu' }, { click: 'Xem hậu trường kỹ thuật' }],
  },
  { id: 'n34', tieuDe: 'Trang Techcombank — rút quyền A2', buoc: [...DA_A2, { goto: '#/techcombank/a2?thao-tac=rut' }] },
  {
    id: 'n35',
    tieuDe: 'Tổng quan — thẻ kết "Bạn đã đi hết hành trình"',
    buoc: [...DA_TRA_HET, DOI_VAI, { wait: 300 }, DOI_VAI, { goto: '#/nha-ban/tong-quan' }],
    ghiChu: 'Vòng 28: KHÔNG mở Khoản phải thu — nhiệm vụ 2 xong nhờ bước ước tính; đổi vai cán bộ rồi đổi lại (nhiệm vụ 5)',
  },

  // ─── Vai Cán bộ Techcombank ──────────────────────────────────────────────
  { id: 'c01', tieuDe: 'Cán bộ — Tra cứu nhà bán khi chưa có A2', buoc: [...DEN_1509, DOI_VAI] },
  { id: 'c02', tieuDe: 'Cán bộ — Tra cứu nhà bán sau giải ngân', buoc: [...DA_VAY, DOI_VAI], man1920: true },
  { id: 'c03', tieuDe: 'Cán bộ — Minh họa bên khác khóa (bật)', buoc: [...DA_VAY, DOI_VAI, { click: 'Minh họa bên khác khóa' }] },
  {
    id: 'c04',
    tieuDe: 'Cán bộ — Danh mục khóa, TRƯỚC khi bấm "Thử gửi lại lệnh khóa"',
    buoc: [...DA_VAY, DOI_VAI, { goto: '#/ngan-hang/danh-muc-khoa' }],
    man1920: true,
    ghiChu: 'Vòng 28: thông báo lũy đẳng chưa hiện',
  },
  {
    id: 'c07',
    tieuDe: 'Cán bộ — Danh mục khóa, SAU khi bấm "Thử gửi lại lệnh khóa"',
    buoc: [...DA_VAY, DOI_VAI, { goto: '#/ngan-hang/danh-muc-khoa' }, { click: 'Thử gửi lại lệnh khóa' }],
    giuThongBao: true,
  },
  { id: 'c05', tieuDe: 'Cán bộ — ngăn Chứng thư', buoc: [...DA_VAY, DOI_VAI, { goto: '#/ngan-hang/danh-muc-khoa' }, { click: 'Xem chứng thư' }] },
  { id: 'c06', tieuDe: 'Cán bộ — Cảnh báo (không có)', buoc: [...DA_VAY, DOI_VAI, { goto: '#/ngan-hang/canh-bao' }] },

  // ─── Tình huống Đổi tài khoản nhận tiền ──────────────────────────────────
  { id: 't01', tieuDe: 'Đổi TK — Khoản vay 19/09, Shopee không thanh toán về Techcombank', buoc: [...DOI_TK, TUA, { goto: '#/nha-ban/khoan-vay' }] },
  { id: 't02', tieuDe: 'Đổi TK — Khoản vay, RU-03 đứt gãy', buoc: [...DUT_GAY, { goto: '#/nha-ban/khoan-vay' }], man1920: true },
  {
    id: 't03',
    tieuDe: 'Đổi TK — hộp xác nhận giải trình',
    buoc: [...DUT_GAY, { goto: '#/nha-ban/khoan-vay' }, { click: 'Tôi đã đổi tài khoản — giải trình' }],
  },
  { id: 't04', tieuDe: 'Đổi TK — Cán bộ, trang Cảnh báo có cảnh báo đứt gãy', buoc: [...DUT_GAY, DOI_VAI, { goto: '#/ngan-hang/canh-bao' }] },
  {
    id: 't05',
    tieuDe: 'Đổi TK — sau giải trình, đã trả RU-03 từ nguồn khác',
    buoc: [
      ...DUT_GAY,
      { goto: '#/nha-ban/khoan-vay' },
      { click: 'Tôi đã đổi tài khoản — giải trình' },
      { click: 'Xác nhận' },
      ...TRA('RU-03'),
      { goto: '#/nha-ban/khoan-vay' },
    ],
    man1920: true,
  },

  // ─── Tình huống Giai đoạn 3 ──────────────────────────────────────────────
  { id: 'g01', tieuDe: 'GĐ3 — chọn bên nhận yêu cầu chào giá', buoc: [...GD3] },
  { id: 'g02', tieuDe: 'GĐ3 — bảng chào giá', buoc: [...GD3_CHAO_GIA] },
  {
    id: 'g03',
    tieuDe: 'GĐ3 — trang ký A4 của Ngân hàng B (khung trung tính)',
    buoc: [...GD3_CHAO_GIA, { click: 'Chọn chào giá của Ngân hàng B' }],
  },
  {
    id: 'g04',
    tieuDe: 'GĐ3 — đã chọn chào giá, chờ ký',
    buoc: [...GD3_CHAO_GIA, { click: 'Chọn chào giá của Ngân hàng B' }, { goto: '#/nha-ban/ung-von' }],
  },
  {
    id: 'g05',
    tieuDe: 'GĐ3 — đã ký với Ngân hàng B (kết thúc nhánh bên khác)',
    buoc: [...GD3_CHAO_GIA, { click: 'Chọn chào giá của Ngân hàng B' }, DONG_Y, { click: 'Ký thỏa thuận' }],
  },
  {
    id: 'g06',
    tieuDe: 'GĐ3 — chọn Techcombank, ký tới giải ngân',
    buoc: [...GD3_CHAO_GIA, { click: 'Chọn chào giá của Techcombank' }, DONG_Y, { click: 'Ký thỏa thuận' }, { goto: '#/nha-ban/ung-von' }],
  },
  {
    id: 'g07',
    tieuDe: 'GĐ3 — trang ký của Công ty tài chính C (khóa 44 + 36)',
    buoc: [...GD3_CHAO_GIA, { click: 'Chọn chào giá của Công ty tài chính C' }],
  },

  // ─── Vòng 28: cảnh còn thiếu ở walkthrough v27 mục 5 ─────────────────────
  { id: 'n36', tieuDe: 'Chế độ "Tự khám phá" (bỏ qua hướng dẫn)', buoc: [{ click: 'Tự khám phá' }] },
  {
    id: 'n37',
    tieuDe: 'Bong bóng chú giải thuật ngữ (Lô tất toán, Tổng quan 15/09)',
    buoc: [...DEN_1509, { goto: '#/nha-ban/tong-quan' }, { click: 'Lô tất toán' }],
  },
  {
    id: 'n38',
    tieuDe: 'Ứng vốn bước 1 — bấm "Đến bước này ↓" (viền nổi quanh nút chính)',
    buoc: [...DEN_1509, { goto: '#/nha-ban/ung-von' }, { click: 'Đến bước này ↓' }],
  },
]
