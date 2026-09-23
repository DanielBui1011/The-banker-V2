// KeyHint phục vụ hai vai trò (docs/thiet-ke.md mục 4):
// - Gợi ý phím nhỏ dạng chip (label): dùng cạnh nút/công tắc, ví dụ "Phím M".
// - Bảng phím tắt đầy đủ (onClose): mở/đóng bằng phím ? hoặc nút "?" trên thanh trên
//   (tạm thay ngăn Hướng dẫn đầy đủ ở Vòng 26 — san-pham.md D.5).
const SHORTCUTS = [
  { key: 'Space', desc: 'Tua tới sự kiện tiếp theo' },
  { key: 'M', desc: 'Bật/tắt Mùa cao điểm' },
  { key: 'L', desc: 'Bật/tắt Đổi tài khoản nhận tiền' },
  { key: '3', desc: 'Bật/tắt Giai đoạn 3' },
  { key: 'R', desc: 'Bắt đầu lại (có xác nhận)' },
  { key: 'D', desc: 'Gửi lại lệnh khóa (cổng ngân hàng)' },
  { key: 'F', desc: 'Bật/tắt toàn màn hình' },
  { key: '?', desc: 'Hiện/ẩn bảng phím tắt' },
]

export default function KeyHint({ label, onClose, className = 'border-slate-300 bg-slate-100 text-slate-50' }) {
  if (onClose) {
    return (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70"
        onClick={onClose}
        role="dialog"
        aria-label="Bảng phím tắt"
      >
        <div
          className="w-[440px] rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-sm"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-emphasis font-semibold text-slate-50">Phím tắt</span>
            <button onClick={onClose} className="text-label text-slate-50 hover:text-slate-50">
              Đóng
            </button>
          </div>
          <div className="space-y-2">
            {SHORTCUTS.map((s) => (
              <div key={s.key} className="flex items-center justify-between gap-4">
                <kbd className="rounded border border-slate-600 bg-slate-800 px-2 py-0.5 font-mono text-label text-slate-50">
                  {s.key}
                </kbd>
                <span className="text-label text-slate-50">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <span className={`inline-block rounded border px-1.5 py-0.5 font-mono text-label ${className}`}>
      {label}
    </span>
  )
}
