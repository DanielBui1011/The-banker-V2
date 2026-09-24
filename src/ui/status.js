// Bảng trạng thái duy nhất — mọi StatusBadge trong src/components/ui/ đọc từ đây
// (docs/thiet-ke.md mục 4). Trạng thái KHÔNG BAO GIỜ chỉ dựa vào màu: mỗi dòng có
// tone (màu ngữ nghĩa theo CLAUDE.md), icon (tên icon lucide-react) và label (chữ).
//
// tone → CLAUDE.md "Bảng màu theo ngữ nghĩa":
//   tier1 = Tầng 1 (teal nhạt: đã khớp, hoàn tất, quyền đang hoạt động)
//   tier1Outline = đã xác thực (teal viền, nền trắng)
//   tier1Solid = đã tất toán (teal đặc, chữ trắng)
//   tier2 = Tầng 2 / đã khóa (violet — cùng vai trò "purple" trong CLAUDE.md)
//   tier3 = Tầng 3 (orange)
//   insufficient = tất toán thiếu (amber)
//   broken = đứt gãy (red)
//   neutral = trung tính / dự phóng / hết hiệu lực / đã hoàn / chưa đủ lịch sử (slate)

export const STATUS_TABLE = {
  // Trạng thái quyền (Màn 7, docs/man-hinh.md) — đọc từ state.consents (src/logic/journey.js).
  'not-granted': { tone: 'neutral', icon: 'Clock', label: 'Chưa cấp' },
  'granted-active': { tone: 'tier1', icon: 'ShieldCheck', label: 'Đang hoạt động' },
  'granted-revoked': { tone: 'neutral', icon: 'CircleSlash', label: 'Đã thu hồi' },
  'granted-in-effect': { tone: 'tier2', icon: 'Lock', label: 'Đang hiệu lực' },
  'granted-terminated': { tone: 'neutral', icon: 'CheckCircle2', label: 'Đã chấm dứt' }, // lý do ở dòng phụ của trang (Vòng 28)
  projected: { tone: 'neutral', icon: 'Clock', label: 'Dự phóng' },
  'insufficient-history': { tone: 'neutral', icon: 'FileQuestion', label: 'Chưa đủ lịch sử' },
  verified: { tone: 'tier1Outline', icon: 'ShieldCheck', label: 'Đã xác thực' },
  locked: { tone: 'tier2', icon: 'Lock', label: 'Đã khóa' },
  settled: { tone: 'tier1Solid', icon: 'CheckCircle2', label: 'Đã tất toán' },
  'settled-short': { tone: 'insufficient', icon: 'AlertTriangle', label: 'Tất toán thiếu' },
  broken: { tone: 'broken', icon: 'XCircle', label: 'Đứt gãy' },
  reversed: { tone: 'neutral', icon: 'RotateCcw', label: 'Đã hoàn' },
  expired: { tone: 'neutral', icon: 'CircleSlash', label: 'Hết hiệu lực' },

  // Trạng thái giao dịch ngân hàng (Màn 3, docs/du-lieu.md mục 5).
  complete: { tone: 'tier1', icon: 'CheckCircle2', label: 'Hoàn tất' },
  matched: { tone: 'tier1', icon: 'CheckCircle2', label: 'Đã khớp' },
  exception: { tone: 'insufficient', icon: 'AlertTriangle', label: 'Ngoại lệ — cần tra thủ công' },
  outflow: { tone: 'neutral', icon: 'ArrowUpRight', label: 'Chi ra' },
}
