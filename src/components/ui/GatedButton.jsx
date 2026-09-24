import Button from './Button.jsx'
import SimHint from './SimHint.jsx'
import { ROUTES } from '../../logic/journey.js'

// Nút có điều kiện (san-pham.md mục G): không đủ điều kiện → vẫn hiện, bị vô hiệu, dưới
// nút có MỘT dòng lý do và MỘT đường dẫn tới bước còn thiếu. gate = availability(state, …)
// → { ok, reason, fix: { label, href } }. stepTarget: đích của liên kết "Đến bước này ↓".
export default function GatedButton({ gate, onClick, variant = 'primary', align = 'end', stepTarget, children }) {
  return (
    <div className={`flex flex-col gap-2 ${align === 'end' ? 'items-end text-right' : 'items-start'}`}>
      <Button type="button" variant={variant} onClick={onClick} disabled={!gate.ok} data-step-target={stepTarget}>
        {children}
      </Button>
      {!gate.ok && <GateReason gate={gate} />}
    </div>
  )
}

// Đường sửa trỏ bảng Mô phỏng → SimHint, không phải liên kết sản phẩm (Vòng 28)
export function GateReason({ gate, className = '' }) {
  if (gate.fix?.href === ROUTES.moPhong)
    return (
      <div className={`flex flex-col gap-1.5 ${className}`}>
        <p className="text-label text-ink-muted">{gate.reason}</p>
        <SimHint>{gate.fix.label}</SimHint>
      </div>
    )
  return (
    <p className={`text-label text-ink-muted ${className}`}>
      {gate.reason}
      {gate.fix && (
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
