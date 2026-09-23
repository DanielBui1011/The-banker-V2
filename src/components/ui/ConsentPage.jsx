import { useState } from 'react'
import { Ban, ShieldCheck } from 'lucide-react'
import SurfaceFrame from './SurfaceFrame.jsx'
import Card from './Card.jsx'
import Stepper from './Stepper.jsx'
import Button from './Button.jsx'
import { FOOTER_NOTE } from '../../data/mockData.js'

// ConsentPage (Vòng 12 mục 2) — khung dùng chung cho 3 trang cấp quyền/ký thỏa
// thuận trên bề mặt Techcombank: A1 (Màn 2b), A2 (Màn 5a), A4 (Màn 5c).
// Cấu trúc cố định: Bên yêu cầu → Mục đích → Phạm vi → Bên nhận → Thời hạn →
// "KHÔNG cho phép" → cách rút lại → MỘT ô xác nhận (mặc định chưa tích) → nút.
// Thanh bước của Nền tảng nằm NGOÀI SurfaceFrame variant="bank", phía trên —
// dải "Bạn đang ở trang của Techcombank" chỉ bọc phần nội dung của ngân hàng.
//
// A4 là thỏa thuận bảo đảm với Techcombank, không phải quyền xử lý dữ liệu
// (docs/quy-tac.md mục 3) — nhãn từng khối (requesterLabel, scopeLabel,
// recipientLabel, durationLabel) truyền riêng theo màn gọi để nội dung đúng
// bản chất pháp lý, dù bố cục/khung dùng chung.
export default function ConsentPage({
  steps,
  currentStep,
  bankName = 'Techcombank',
  heading,
  subheading,
  requesterLabel = 'Bên yêu cầu',
  requesterName,
  requesterCode,
  purposeLabel = 'Mục đích',
  purpose,
  scopeLabel = 'Phạm vi dữ liệu',
  scopeItems,
  recipientLabel = 'Bên nhận dữ liệu',
  recipient,
  durationLabel = 'Thời hạn',
  duration,
  notAllowedText,
  withdrawalText,
  confirmLabel,
  approveLabel,
  rejectLabel = 'Từ chối',
  onApprove,
  onReject,
}) {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 bg-slate-50 px-12 py-4">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>
      <SurfaceFrame variant="bank" bankName={bankName} className="flex-1 min-h-0">
        <div className="flex h-full flex-col">
          <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-8 pt-8 pb-24">
            <div className="mx-auto w-full max-w-3xl">
              <div className="mb-1 text-section-title font-bold text-slate-900">{bankName}</div>
              <h1 className="mb-1 text-screen-title font-bold text-slate-900">{heading}</h1>
              {subheading && <p className="mb-6 text-body text-slate-600">{subheading}</p>}

              <Card className="space-y-5">
                <div>
                  <div className="text-label font-medium text-slate-600">{requesterLabel}</div>
                  <div className="text-body text-slate-900">{requesterName}</div>
                  {requesterCode && <div className="text-label text-slate-600">Mã TPP đã đăng ký: {requesterCode}</div>}
                </div>

                <div>
                  <div className="text-label font-medium text-slate-600">{purposeLabel}</div>
                  <div className="text-body text-slate-900">{purpose}</div>
                </div>

                <div>
                  <div className="mb-2 text-label font-medium text-slate-600">{scopeLabel}</div>
                  <ul className="space-y-2">
                    {scopeItems.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-body text-slate-800">
                        <ShieldCheck size={18} className="mt-0.5 flex-shrink-0 text-teal-600" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-label font-medium text-slate-600">{recipientLabel}</div>
                  <div className="text-body text-slate-900">{recipient}</div>
                </div>

                <div>
                  <div className="text-label font-medium text-slate-600">{durationLabel}</div>
                  <div className="text-body text-slate-900">{duration}</div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-slate-100 p-4">
                  <Ban size={20} className="mt-0.5 flex-shrink-0 text-slate-600" aria-hidden="true" />
                  <div className="text-label text-slate-600">{notAllowedText}</div>
                </div>

                <p className="text-label text-slate-600">{withdrawalText}</p>

                <label className="flex items-start gap-3 text-body text-slate-800">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-slate-300"
                  />
                  <span>{confirmLabel}</span>
                </label>

                <div className="flex justify-end gap-3">
                  {onReject && (
                    <Button type="button" variant="secondary" onClick={onReject}>
                      {rejectLabel}
                    </Button>
                  )}
                  <Button type="button" variant="primary" onClick={onApprove} disabled={!confirmed}>
                    {approveLabel}
                  </Button>
                </div>
              </Card>
            </div>
          </main>
          <footer className="border-t border-slate-200 px-8 py-3 text-label text-slate-600">{FOOTER_NOTE}</footer>
        </div>
      </SurfaceFrame>
    </div>
  )
}
