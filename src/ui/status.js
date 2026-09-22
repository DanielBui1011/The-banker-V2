// Bảng trạng thái duy nhất — mọi StatusBadge trong src/components/ui/ đọc từ đây
// (docs/thiet-ke.md mục 4). Trạng thái KHÔNG BAO GIỜ chỉ dựa vào màu: mỗi dòng có
// tone (màu ngữ nghĩa theo CLAUDE.md), icon (tên icon lucide-react) và label (chữ).
//
// tone → CLAUDE.md "Bảng màu theo ngữ nghĩa":
//   tier1 = Tầng 1 / đã xác thực / tất toán (teal)
//   tier2 = Tầng 2 / đã khóa (violet — cùng vai trò "purple" trong CLAUDE.md)
//   tier3 = Tầng 3 (orange)
//   insufficient = tất toán thiếu (amber)
//   broken = đứt gãy (red)
//   neutral = trung tính / dự phóng / hết hiệu lực / đã hoàn / chưa đủ lịch sử (slate)

export const STATUS_TABLE = {
  projected: { tone: 'neutral', icon: 'Clock', label: 'Dự phóng' },
  'insufficient-history': { tone: 'neutral', icon: 'FileQuestion', label: 'Chưa đủ lịch sử' },
  verified: { tone: 'neutral', icon: 'ShieldCheck', label: 'Đã xác thực' },
  locked: { tone: 'tier2', icon: 'Lock', label: 'Đã khóa' },
  settled: { tone: 'tier1', icon: 'CheckCircle2', label: 'Đã tất toán' },
  'settled-short': { tone: 'insufficient', icon: 'AlertTriangle', label: 'Tất toán thiếu' },
  broken: { tone: 'broken', icon: 'XCircle', label: 'Đứt gãy' },
  reversed: { tone: 'neutral', icon: 'RotateCcw', label: 'Đã hoàn' },
  expired: { tone: 'neutral', icon: 'CircleSlash', label: 'Hết hiệu lực' },
}
