import Button from './Button.jsx'
import SimHint, { isSimHref } from './SimHint.jsx'

// Nút có điều kiện (san-pham.md mục G): không đủ điều kiện → vẫn hiện, bị vô hiệu, dưới
// nút có MỘT dòng lý do và MỘT đường dẫn tới bước còn thiếu. gate = availability(state, …)
// → { ok, reason, fix: { label, href } }. stepTarget: đích của liên kết "Đến bước này ↓".
export default function GatedButton({ gate, onClick, variant = 'primary', align = 'end', stepTarget, children }) {
  return (
    <div className={`flex flex-col gap-2 ${align === 'end' ? 'items-end text-right' : 'items-start'}`}>
      <Button type="button" variant={variant} onClick={onClick} disabled={!gate.ok} data-step-target={stepTarget}>
        {children}
      </Button>
      {!gate.ok && <GateReason gate={gate} className={align === 'end' ? 'items-end' : 'items-start'} />}
    </div>
  )
}

// Đường sửa là lệnh mô phỏng (bảng Mô phỏng, Tua) → SimHint, không phải liên kết sản phẩm (Vòng 28, 29)
export function GateReason({ gate, className = '' }) {
  if (isSimHref(gate.fix?.href))
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <p className="text-label text-ink-muted">{gate.reason}</p>
        <SimHint href={gate.fix.href}>{gate.fix.label}</SimHint>
      </div>
    )
  // Đọc hash lúc vẽ (App vẽ lại mỗi lần đổi trang): liên kết về chính trang này không đi đâu
  const here = gate.fix?.href === window.location.hash.split('?')[0]
  return (
    <p className={`text-label text-ink-muted ${className}`}>
      {gate.reason}
      {gate.fix && !here && (
        <>
          {' '}
          →{' '}
          <a href={gate.fix.href} className="font-semibold text-primary underline underline-offset-2">
            {gate.fix.label}
          </a>
        </>
      )}
    </p>
  )
}
