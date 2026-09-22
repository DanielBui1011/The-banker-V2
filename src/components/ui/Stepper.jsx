// Stepper (docs/thiet-ke.md mục 4) — dùng cho các luồng nhiều bước (ví dụ Màn 5:
// 5a → 5b → 5c → 5d). steps là mảng nhãn chữ; currentStep đánh số từ 1.
export default function Stepper({ steps, currentStep }) {
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
                      ? 'border-2 border-navy text-navy'
                      : 'border border-slate-300 text-slate-400'
                }`}
              >
                {stepNumber}
              </div>
              <span className={`text-label ${isActive ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>{step}</span>
            </div>
            {stepNumber !== steps.length && <div className="mx-3 h-px w-8 bg-slate-300" />}
          </div>
        )
      })}
    </div>
  )
}
