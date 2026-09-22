// Nguồn số liệu duy nhất — chuyển từ docs/du-lieu.md. Không viết cứng số liệu ở nơi khác.
// Đơn vị tiền: triệu đồng. Ngày "hôm nay" trong demo: 15/09/2027.

export const SOLUTION_NAME = 'ĐỪNG ĐÓNG VAI ANH'

// Mục 2 — Hồ sơ nhà bán
export const SELLER_PROFILE = {
  shopName: 'Lan Beauty',
  ownerName: 'Chị Lan',
  industry: 'Mỹ phẩm',
  paymentAccount: 'Techcombank, số giả 1903 **** 8826',
  salesSoftware: 'Shopee',
  connectedDate: '2027-08-01',
  monthlyManualReconciliationHours: 9,
  currentFundingOption: 'Vay tín chấp từ 2%/tháng',
}

export const SALES_CHANNELS = [
  { channel: 'Shopee', monthlyRevenue: 170, settlementCycle: 'Giữ tiền 8–15 ngày' },
  { channel: 'TikTok Shop', monthlyRevenue: 130, settlementCycle: 'Giữ tiền 8–15 ngày' },
  { channel: 'Facebook/Instagram', monthlyRevenue: 120, settlementCycle: 'Khách chuyển khoản trực tiếp' },
  { channel: 'Website', monthlyRevenue: 80, settlementCycle: 'Cổng thanh toán, về sau 1–2 ngày' },
]

export const TOTAL_MONTHLY_REVENUE = 500
export const TOTAL_MARKETPLACE_REVENUE = 300 // qua sàn (Shopee + TikTok Shop)

// Mục 3 — Tiền đang kẹt ở sàn
// Tiền ký quỹ = doanh thu sàn / 30 × số ngày giữ tiền bình quân
export const ESCROW_STUCK = {
  normal: {
    marketplaceRevenue: 300,
    averageHoldDays: 10,
    amount: 100, // 300 / 30 × 10
  },
  megaSale: {
    marketplaceRevenue: 900, // gấp 3
    averageHoldDays: 10,
    amount: 300, // 900 / 30 × 10
  },
}

// Mục 4.2 — Tham số công thức giá trị khả dụng
export const PRICING_PARAMS = {
  normal: {
    sellerReturnRate: 0.08,
    channelReturnRate: 0.08,
    seasonReturnRate: 0.08,
    safetyMargin: 0.07,
    averageMarketplaceRevenue3m: 300,
    debtCap: 150, // 300 × 0,5
  },
  megaSale: {
    sellerReturnRate: 0.15,
    channelReturnRate: 0.15,
    seasonReturnRate: 0.15,
    safetyMargin: 0.12,
    averageMarketplaceRevenue3m: 300, // tính trên 3 tháng trước đợt sale
    debtCap: 150,
  },
}

export const MIN_LOTS_FOR_SCORE = 6

// Mục 5 — Giao dịch ngân hàng (tài khoản Techcombank, 01–10/09/2027)
export const BANK_TRANSACTIONS = [
  { code: 'GD01', date: '2027-09-01', amount: 20.5, counterparty: 'Shopee', reference: 'SPE-PAYOUT-0901', channel: 'Shopee', status: 'matched', matchMethod: 'Mã tham chiếu', linkedTo: 'RU-01' },
  { code: 'GD02', date: '2027-09-02', amount: 17.2, counterparty: 'TikTok Shop', reference: 'TTS-STL-0902', channel: 'TikTok Shop', status: 'matched', matchMethod: 'Mã tham chiếu', linkedTo: 'RU-02' },
  { code: 'GD03', date: '2027-09-02', amount: 8.6, counterparty: 'Hãng vận chuyển A', reference: 'COD-LO-0831', channel: 'COD', status: 'matched', matchMethod: 'Mã tham chiếu', linkedTo: 'Lô COD trước' },
  { code: 'GD04', date: '2027-09-02', amount: 0.45, counterparty: 'Nguyễn Thu H.', reference: 'DH FB1021', channel: 'Facebook', status: 'matched', matchMethod: 'Nội dung', linkedTo: 'Đơn FB1021' },
  { code: 'GD05', date: '2027-09-03', amount: 20.8, counterparty: 'Shopee', reference: 'SPE-PAYOUT-0903', channel: 'Shopee', status: 'matched', matchMethod: 'Mã tham chiếu', linkedTo: 'RU-01' },
  { code: 'GD06', date: '2027-09-03', amount: 0.38, counterparty: 'Trần Mai A.', reference: 'DH FB1022', channel: 'Facebook', status: 'matched', matchMethod: 'Nội dung', linkedTo: 'Đơn FB1022' },
  { code: 'GD07', date: '2027-09-03', amount: 0.62, counterparty: 'Lê Hồng N.', reference: 'FB1023 thanh toan', channel: 'Facebook', status: 'matched', matchMethod: 'Nội dung', linkedTo: 'Đơn FB1023' },
  { code: 'GD08', date: '2027-09-04', amount: 17.4, counterparty: 'TikTok Shop', reference: 'TTS-STL-0904', channel: 'TikTok Shop', status: 'matched', matchMethod: 'Mã tham chiếu', linkedTo: 'RU-02' },
  { code: 'GD09', date: '2027-09-04', amount: 0.29, counterparty: 'Phạm Linh', reference: 'DH FB1025', channel: 'Facebook', status: 'matched', matchMethod: 'Nội dung', linkedTo: 'Đơn FB1025' },
  { code: 'GD10', date: '2027-09-04', amount: 1.15, counterparty: 'Đỗ Quỳnh T.', reference: 'FB1024', channel: 'Facebook', status: 'matched', matchMethod: 'Nội dung', linkedTo: 'Đơn FB1024' },
  { code: 'GD11', date: '2027-09-05', amount: 7.9, counterparty: 'Hãng vận chuyển A', reference: 'COD-LO-0903', channel: 'COD', status: 'matched', matchMethod: 'Mã tham chiếu', linkedTo: 'RU-05 (một phần, xem mục 6)' },
  { code: 'GD12', date: '2027-09-05', amount: 0.52, counterparty: 'Vũ Thảo', reference: 'DH FB1027', channel: 'Facebook', status: 'matched', matchMethod: 'Nội dung', linkedTo: 'Đơn FB1027' },
  { code: 'GD13', date: '2027-09-06', amount: -1.2, counterparty: 'Shopee', reference: 'SPE-RFD-0906', channel: 'Shopee', status: 'reversed', matchMethod: 'Mã tham chiếu', linkedTo: 'RU-06', reversalIndicator: true },
  { code: 'GD14', date: '2027-09-06', amount: 0.45, counterparty: '(không rõ)', reference: '(trống)', channel: '—', status: 'exception', matchMethod: 'Không khớp được', linkedTo: '—' },
  { code: 'GD15', date: '2027-09-06', amount: 0.71, counterparty: 'Bùi Hà', reference: 'DH FB1028', channel: 'Facebook', status: 'matched', matchMethod: 'Nội dung', linkedTo: 'Đơn FB1028' },
  { code: 'GD16', date: '2027-09-07', amount: -0.9, counterparty: 'TikTok Shop', reference: 'TTS-RFD-0907', channel: 'TikTok Shop', status: 'reversed', matchMethod: 'Mã tham chiếu', linkedTo: 'Đơn hoàn TikTok', reversalIndicator: true },
  { code: 'GD17', date: '2027-09-07', amount: 12.3, counterparty: 'Cổng thanh toán', reference: 'WEB-SETTLE', channel: 'Website', status: 'matched', matchMethod: 'Số tiền và ngày', linkedTo: 'Doanh thu web 04–06/09' },
  { code: 'GD18', date: '2027-09-07', amount: 0.33, counterparty: 'Hoàng Yến', reference: 'DH FB1030', channel: 'Facebook', status: 'matched', matchMethod: 'Nội dung', linkedTo: 'Đơn FB1030' },
  { code: 'GD19', date: '2027-09-08', amount: -1.1, counterparty: 'Shopee', reference: 'SPE-RFD-0908', channel: 'Shopee', status: 'reversed', matchMethod: 'Mã tham chiếu', linkedTo: 'RU-06', reversalIndicator: true },
  { code: 'GD20', date: '2027-09-08', amount: 2.15, counterparty: 'Ngô Minh K.', reference: 'chuyen tien', channel: '—', status: 'exception', matchMethod: 'Không khớp được', linkedTo: '—' },
  { code: 'GD21', date: '2027-09-08', amount: 0.48, counterparty: 'Đặng Vân', reference: 'DH FB1031', channel: 'Facebook', status: 'matched', matchMethod: 'Nội dung', linkedTo: 'Đơn FB1031' },
  { code: 'GD22', date: '2027-09-09', amount: -15.0, counterparty: 'Công ty mỹ phẩm X', reference: 'Thanh toan nhap hang', channel: '—', status: 'outflow', matchMethod: 'Không đối soát', linkedTo: '—' },
  { code: 'GD23', date: '2027-09-09', amount: 0.8, counterparty: 'Lý Thanh', reference: 'DH FB1033', channel: 'Facebook', status: 'matched', matchMethod: 'Nội dung', linkedTo: 'Đơn FB1033' },
  { code: 'GD24', date: '2027-09-10', amount: 0.57, counterparty: 'Mai Chi', reference: 'DH FB1034', channel: 'Facebook', status: 'matched', matchMethod: 'Nội dung', linkedTo: 'Đơn FB1034' },
  { code: 'GD25', date: '2027-09-10', amount: 0.6, counterparty: 'Tạ Ngọc', reference: 'FB1035', channel: 'Facebook', status: 'matched', matchMethod: 'Nội dung', linkedTo: 'Đơn FB1035' },
]

export const RECONCILIATION_SUMMARY = {
  matchedCount: 19,
  exceptionCount: 2,
  reversedCount: 3,
  unreconciledOutflowCount: 1,
  note: 'Tỷ lệ ngoại lệ trong bộ demo cao hơn thực tế để có ví dụ minh họa; không dùng làm chỉ số.',
}

// Phát hiện sai lệch phí (quy tắc: cảnh báo khi chênh lệch trên 1,5%)
export const FEE_DEVIATIONS = [
  {
    unit: 'RU-01',
    channel: 'Shopee',
    projected: 42.0,
    actual: 41.3, // 20,5 + 20,8
    deviation: 0.7,
    deviationRate: 0.017,
    flagged: true,
  },
  {
    unit: 'RU-02',
    channel: 'TikTok Shop',
    projected: 35.0,
    actual: 34.6, // 17,2 + 17,4
    deviation: 0.4,
    deviationRate: 0.011,
    flagged: false,
  },
]

// Mục 6 — Đơn vị khoản phải thu (kỳ thường)
export const RECEIVABLE_UNITS = [
  { code: 'RU-01', channel: 'Shopee', group: 'Kỳ thường', projectedNetValue: 42.0, settlementWindow: '01–04/09', status: 'settled', statusColor: 'tier1', actualReceived: 41.3 },
  { code: 'RU-02', channel: 'TikTok Shop', group: 'Kỳ thường', projectedNetValue: 35.0, settlementWindow: '02–05/09', status: 'settled', statusColor: 'tier1', actualReceived: 34.6 },
  { code: 'RU-03', channel: 'Shopee', group: 'Kỳ thường', projectedNetValue: 55.0, settlementWindow: '18–21/09', status: 'verified-then-locked', statusColor: 'neutral2', lockedColor: 'tier2', actualReceived: null, verificationScore: 92 },
  { code: 'RU-04', channel: 'TikTok Shop', group: 'Kỳ thường', projectedNetValue: 45.0, settlementWindow: '19–22/09', status: 'verified-then-locked', statusColor: 'neutral2', lockedColor: 'tier2', actualReceived: null, verificationScore: 90 },
  { code: 'RU-05', channel: 'Hãng vận chuyển A (COD)', group: 'Kỳ thường', projectedNetValue: 12.0, settlementWindow: '16–18/09', status: 'projected-insufficient-history', statusColor: 'neutral2', actualReceived: null, lots: 4 },
  { code: 'RU-06', channel: 'Shopee', group: 'Đơn hoàn', projectedNetValue: 2.3, settlementWindow: '—', status: 'reversed', statusColor: 'neutral2', actualReceived: -2.3 },
]

export const PENDING_SETTLEMENT_TOTAL_NORMAL = 100 // RU-03 + RU-04

// Mục 6 — Dữ liệu khi bật Mega Sale (thay RU-03, RU-04)
export const MEGA_SALE_UNITS = [
  { code: 'RU-M1', channel: 'Shopee', group: 'Mega Sale', projectedNetValue: 165.0, verificationScore: 92 },
  { code: 'RU-M2', channel: 'TikTok Shop', group: 'Mega Sale', projectedNetValue: 135.0, verificationScore: 90 },
]

// Mục 7 — Điểm xác thực, chỉ số nguồn theo kênh
export const VERIFICATION_METRICS = {
  Shopee: {
    settledLots: 7,
    projectionAccuracy: 0.983,
    volatility: 0.021,
    feeDeviation: 0.008,
    leakRate: 0,
    p90DelayDays: 2,
  },
  'TikTok Shop': {
    settledLots: 6,
    projectionAccuracy: 0.975,
    volatility: 0.028,
    feeDeviation: 0.009,
    leakRate: 0,
    p90DelayDays: 3,
  },
  'Hãng vận chuyển A': {
    settledLots: 4,
    projectionAccuracy: null,
    volatility: null,
    feeDeviation: null,
    leakRate: null,
    p90DelayDays: null,
  },
}

// Mục 8 — Quyền đã cấp (trạng thái sau Màn 5)
export const GRANTED_PERMISSIONS = [
  {
    code: 'A1',
    purpose: 'Đối soát dòng tiền',
    from: 'Techcombank',
    to: SOLUTION_NAME,
    grantedDate: '2027-08-01',
    expiryDate: '2027-10-30',
    status: 'active',
    revocable: true,
    revokeNote: null,
  },
  {
    code: 'A2',
    purpose: 'Đánh giá tín dụng',
    from: 'Techcombank',
    to: SOLUTION_NAME,
    grantedDate: '2027-09-15',
    expiryDate: '2027-12-14',
    status: 'active',
    revocable: true,
    revokeNote: 'Được, không ảnh hưởng A1',
  },
  {
    code: 'A4',
    purpose: 'Chuyển giao quyền đòi nợ (RU-03, RU-04)',
    from: 'Chị Lan',
    to: 'Techcombank',
    grantedDate: '2027-09-15',
    expiryDate: 'Đến khi tất toán',
    status: 'in-effect',
    revocable: false,
    revokeNote: 'Không, khi còn dư nợ',
  },
]

// Mục 9 — Nhật ký truy cập
export const ACCESS_LOG = [
  { timestamp: '2027-08-01 09:12', actor: SOLUTION_NAME, purpose: 'A1 — đối soát', data: 'Danh sách tài khoản, số dư' },
  { timestamp: '2027-08-01 09:13', actor: SOLUTION_NAME, purpose: 'A1 — đối soát', data: 'Lịch sử giao dịch 90 ngày (lần đầu)' },
  { timestamp: '2027-09-10 06:00', actor: SOLUTION_NAME, purpose: 'A1 — đối soát', data: 'Giao dịch 01–10/09' },
  { timestamp: '2027-09-15 10:02', actor: SOLUTION_NAME, purpose: 'A2 — đánh giá tín dụng', data: 'Lịch sử giao dịch 180 ngày' },
  { timestamp: '2027-09-15 10:03', actor: 'Techcombank', purpose: 'A2 — đánh giá tín dụng', data: 'Hồ sơ doanh thu đã xác thực' },
  { timestamp: '2027-09-15 10:05', actor: 'Techcombank', purpose: 'A4 — đăng ký bảo đảm', data: 'RU-03, RU-04' },
  { timestamp: '2027-09-19 06:00', actor: SOLUTION_NAME, purpose: 'A1 — đối soát', data: 'Giao dịch 11–19/09' },
  { timestamp: '2027-09-20 06:00', actor: SOLUTION_NAME, purpose: 'A1 — đối soát', data: 'Giao dịch 20/09' },
]

// Mục 10 — Dòng thời gian tất toán
export const SETTLEMENT_TIMELINE_NORMAL = [
  { date: '15/09', event: 'Techcombank giải ngân 85,0; khóa RU-03 (46,75) và RU-04 (38,25)', remainingDebt: 85.0 },
  { date: '15–18/09', event: 'Nhập hàng, bán tiếp', remainingDebt: 85.0 },
  { date: '19/09', event: 'Shopee thanh toán RU-03: 54,6 về tài khoản Techcombank; trả 46,75', remainingDebt: 38.25 },
  { date: '20/09', event: 'TikTok Shop thanh toán RU-04: 44,7 về tài khoản; trả 38,25', remainingDebt: 0 },
  { date: '20/09', event: 'Khoản ứng tất toán; tiền lãi ≈ 0,14; điểm xác thực cập nhật', remainingDebt: null },
]

export const SETTLEMENT_TIMELINE_LEAK = [
  { date: '19/09', event: 'Không có khoản thanh toán Shopee nào về tài khoản Techcombank' },
  { date: '20/09', event: 'RU-04 vẫn tất toán bình thường (TikTok Shop không bị ảnh hưởng); dư nợ còn 46,75' },
  { date: '21/09', event: 'Hết cửa sổ thanh toán RU-03' },
  { date: '24/09', event: 'Hết 3 ngày ân hạn → RU-03 chuyển Đứt gãy (đỏ); cảnh báo tới Techcombank; đóng băng cấp vốn mới; yêu cầu chị Lan xác nhận tài khoản nhận tiền' },
]

// Mục 11 — Góc nhìn ngân hàng
export const BANK_VIEW = {
  units: [
    { code: 'RU-03', projectedNetValue: 55.0, availableValue: 46.75, lockedAmount: 46.75, lockerCount: 1 },
    { code: 'RU-04', projectedNetValue: 45.0, availableValue: 38.25, lockedAmount: 38.25, lockerCount: 1 },
    { code: 'RU-05', projectedNetValue: 12.0, availableValue: null, availableValueNote: 'Chưa đủ điều kiện', lockedAmount: 0, lockerCount: 0 },
  ],
  totalConsolidatedExposure: 85.0,
  crossExposureExample: {
    otherLockedAmount: 100,
    remainingAvailable: 50.0,
  },
}

// Mục 12 — Giai đoạn 3: chào giá cho RU-03 và RU-04
export const LENDER_QUOTES = [
  { lender: 'Techcombank', value: 85.0, annualRate: 0.12, term: 'Đến khi tất toán, tối đa 20 ngày', estimatedInterest5Days: 0.14 },
  { lender: 'Ngân hàng B', value: 85.0, annualRate: 0.132, term: 'Đến khi tất toán, tối đa 20 ngày', estimatedInterest5Days: 0.15 },
  { lender: 'Công ty tài chính C', value: 80.0, annualRate: 0.156, term: 'Đến khi tất toán, tối đa 15 ngày', estimatedInterest5Days: 0.17 },
]

export const LOCK_CERTIFICATE = {
  certificateId: 'LOCK-2027-0915-00318',
  units: ['RU-03 (46,75)', 'RU-04 (38,25)'],
  secured: 'Techcombank',
  priority: 1,
  lockedAt: '2027-09-15 10:05:12',
  registrationId: 'DKBĐ-GIẢ-2027-004512',
  signature: 'JWS, RS256 — kiểm chứng độc lập',
}

// Chân trang mọi màn (CLAUDE.md mục Quy tắc bắt buộc #8)
export const FOOTER_NOTE = 'Giao diện mô phỏng — dữ liệu giả định'

// Dòng bắt buộc mọi màn liên quan giá trị ứng ước tính (CLAUDE.md mục #4, quy-tac.md mục 4)
export const ESTIMATE_DISCLAIMER = 'Ước tính, chưa phải đề nghị cấp tín dụng'
