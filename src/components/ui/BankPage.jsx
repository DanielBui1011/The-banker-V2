import SurfaceFrame, { BankAccent } from './SurfaceFrame.jsx'
import Card from './Card.jsx'

// Trang thao tác trên bề mặt ngân hàng không phải trang cấp quyền (Trả nợ một chạm, Rút
// quyền, thông báo "không thực hiện được") — cùng khung bank với ConsentPage (quy-tac mục 3).
export default function BankPage({ bankName = 'Techcombank', heading, subheading, actions, children }) {
  return (
    <SurfaceFrame variant="bank" bankName={bankName}>
      <div className="px-8 pb-16 pt-8">
        <div className="mx-auto w-full max-w-2xl">
          <BankAccent bankName={bankName} />
          <div className="mb-1 text-section-title font-bold text-slate-900">{bankName}</div>
          <h1 className="mb-1 text-screen-title font-bold text-slate-900">{heading}</h1>
          {subheading && <p className="mb-6 text-body text-slate-600">{subheading}</p>}
          <Card className="space-y-4">
            {children}
            {actions && <div className="flex justify-end gap-3 pt-4">{actions}</div>}
          </Card>
        </div>
      </div>
    </SurfaceFrame>
  )
}

export function BankRow({ label, children }) {
  return (
    <div>
      <div className="text-label font-medium text-slate-600">{label}</div>
      <div className="text-body text-slate-900">{children}</div>
    </div>
  )
}

// Không đủ điều kiện (vd. mở lại trang ký đã ký xong, tải lại trang): nói lý do và đưa
// về app — không để ngõ cụt trên bề mặt ngân hàng (san-pham.md G).
export function BankBlocked({ gate, backHref, backLabel }) {
  return (
    <BankPage
      heading="Không thực hiện được thao tác này"
      actions={
        <a
          href={backHref}
          className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-emphasis font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {backLabel}
        </a>
      }
    >
      <p className="text-body text-slate-900">{gate.reason}</p>
    </BankPage>
  )
}
