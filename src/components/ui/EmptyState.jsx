import Card from './Card.jsx'

// Trạng thái trống có hướng dẫn (san-pham.md B.1): trang chưa dùng được vẫn mở được, nói
// rõ vì sao chưa có dữ liệu và có nút dẫn tới bước còn thiếu. gate = availability(…) —
// lý do và đường dẫn lấy từ đó, không viết riêng ở từng trang. Nút VIỀN: trang trống luôn đi
// kèm thẻ Bước tiếp theo có nút đặc (Vòng 28, test "một nút đặc mỗi trang").
export default function EmptyState({ icon: Icon, title, gate, children }) {
  return (
    <Card padding="p-8" className="flex flex-col items-start gap-4">
      {Icon && <Icon size={32} className="text-ink-muted" aria-hidden="true" />}
      <div>
        <h2 className="text-section-title font-semibold text-ink">{title ?? gate?.reason}</h2>
        {children && <div className="mt-2 space-y-2 text-body text-ink-muted">{children}</div>}
      </div>
      {gate?.fix && (
        <a
          href={gate.fix.href}
          className="rounded-xl border border-primary bg-app-surface px-6 py-3 text-emphasis font-semibold text-primary transition duration-fast hover:bg-primary-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {gate.fix.label}
        </a>
      )}
    </Card>
  )
}
