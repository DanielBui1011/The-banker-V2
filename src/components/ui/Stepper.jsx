import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'

// Stepper (docs/thiet-ke.md mục 4) — thanh bước của một luồng nhiều bước. steps là mảng
// nhãn chữ; currentStep đánh số từ 1 (steps.length + 1 = xong hết).
// Vòng 22 (san-pham.md L.2): đoạn nối giữa các bước tô đầy dần 300ms khi sang bước mới.
// `id` cho biết các thanh bước cùng một luồng (vd. Ứng vốn và trang A2/A4 của nó): bước
// đã hiện lần trước được nhớ theo id, nên khi quay về từ trang Techcombank thanh bước tô
// tiếp từ bước cũ tới bước mới thay vì hiện ngay. Không có id → không nhớ.
const lastShown = new Map()

export default function Stepper({ steps, currentStep, id }) {
  const [shown, setShown] = useState(() => (id && lastShown.get(id)) || currentStep)

  useEffect(() => {
    if (id) lastShown.set(id, currentStep)
    // Khung hình kế tiếp: đổi bước để transition CSS chạy (reduced-motion → 0,01ms)
    const frame = requestAnimationFrame(() => setShown(currentStep))
    return () => cancelAnimationFrame(frame)
  }, [id, currentStep])

  return (
    <ol className="flex items-center" aria-label="Các bước">
      {steps.map((step, i) => {
        const n = i + 1
        const done = n < shown
        const active = n === shown
        return (
          <li key={step} className="flex items-center" aria-current={n === currentStep ? 'step' : undefined}>
            {i > 0 && (
              <span className="mx-3 h-1 w-10 overflow-hidden rounded-full bg-line" aria-hidden="true">
                <span
                  className={`block h-full bg-primary transition-[width] duration-slow ease-standard ${n <= shown ? 'w-full' : 'w-0'}`}
                />
              </span>
            )}
            <span className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-label font-semibold transition-colors duration-slow ${
                  done
                    ? 'border-primary bg-primary text-white'
                    : active
                      ? 'border-primary bg-app-surface text-primary'
                      : 'border-line bg-app-surface text-ink-muted'
                }`}
              >
                {done ? <Check size={16} aria-label="Đã xong" /> : n}
              </span>
              <span className={`text-label ${active ? 'font-semibold text-ink' : 'text-ink-muted'}`}>{step}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}
