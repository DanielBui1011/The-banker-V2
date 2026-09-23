import Button from './Button.jsx'

// Nút có điều kiện (san-pham.md mục G): không đủ điều kiện → vẫn hiện, bị vô hiệu, dưới
// nút có MỘT dòng lý do và MỘT đường dẫn tới bước còn thiếu. gate = availability(state, …)
// → { ok, reason, fix: { label, href } }.
export default function GatedButton({ gate, onClick, variant = 'primary', align = 'end', children }) {
  return (
    <div className={`flex flex-col gap-2 ${align === 'end' ? 'items-end text-right' : 'items-start'}`}>
      <Button type="button" variant={variant} onClick={onClick} disabled={!gate.ok}>
        {children}
      </Button>
      {!gate.ok && <GateReason gate={gate} />}
    </div>
  )
}

export function GateReason({ gate, className = '' }) {
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
