// Stepper (docs/thiet-ke.md mục 4) — dùng cho các luồng nhiều bước (ví dụ Màn 5:
// 5a → 5b → 5c → 5d, Màn 2: 2a → 2d). steps là mảng nhãn chữ; currentStep đánh số
// từ 1. tone="light" cho bề mặt sáng (mặc định), tone="dark" cho bề mặt tối
// (vd. SurfaceFrame variant="tech") — cùng quy ước tone với ActProgress.
export default function Stepper({ steps, currentStep, tone = 'light' }) {
  const isDark = tone === 'dark'
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const stepNumber = i + 1
        const isActive = stepNumber === currentStep
        const isDone = stepNumber < currentStep
        return (
          <div key={step} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-label font-semibold ${
                  isDone
                    ? 'bg-navy text-white'
                    : isActive
                      ? `border-2 border-navy ${isDark ? 'text-slate-50' : 'text-navy'}`
                      : isDark
                        ? 'border border-slate-600 text-slate-50'
                        : 'border border-slate-400 text-slate-600'
                }`}
              >
                {stepNumber}
              </div>
              <span
                className={`text-label ${
                  isActive
                    ? `font-semibold ${isDark ? 'text-slate-50' : 'text-slate-900'}`
                    : isDark
                      ? 'text-slate-50'
                      : 'text-slate-600'
                }`}
              >
                {step}
              </span>
            </div>
            {stepNumber !== steps.length && <div className={`mx-3 h-px w-8 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`} />}
          </div>
        )
      })}
    </div>
  )
}
