import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { GLOSSARY } from '../../data/mockData.js'

// Chú giải thuật ngữ tại chỗ (docs/san-pham.md D.4, H): <button> gạch chân chấm + bong bóng một câu.
// Mở khi di chuột hoặc Tab tới, đóng bằng Esc / rời chuột / rời focus. Không dùng title=.
// Chỉ đặt ở LẦN XUẤT HIỆN ĐẦU TIÊN của thuật ngữ trên mỗi trang; không đặt trong nút/liên kết.
// name: khóa trong GLOSSARY; children: chữ hiển thị (mặc định = name).
// Bong bóng vẽ qua portal vào <body> (vùng nội dung cuộn + có view-transition-name, xem Drawer).
const WIDTH = 360

export default function Term({ name, children = name }) {
  const ref = useRef(null)
  const id = useId()
  const [pos, setPos] = useState(null)

  const show = () => {
    const r = ref.current.getBoundingClientRect()
    const below = r.bottom + 140 < window.innerHeight
    setPos({
      left: Math.max(8, Math.min(r.left, window.innerWidth - WIDTH - 8)),
      top: below ? r.bottom + 6 : r.top - 6,
      below,
    })
  }
  const hide = () => setPos(null)

  useEffect(() => {
    if (!pos) return
    const onKey = (e) => e.key === 'Escape' && hide()
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', hide, true) // bong bóng cố định không trôi theo chữ
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', hide, true)
    }
  }, [pos])

  return (
    <>
      <button
        ref={ref}
        type="button"
        aria-describedby={pos ? id : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={show}
        className="cursor-help text-left underline decoration-current decoration-dotted decoration-2 underline-offset-4 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {children}
      </button>
      {pos &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            style={{ left: pos.left, top: pos.top, width: WIDTH, transform: pos.below ? undefined : 'translateY(-100%)' }}
            className="pointer-events-none fixed z-[170] animate-[ru-badge-fade_150ms_var(--ease-out)] rounded-lg bg-slate-900 px-4 py-3 text-label text-slate-50 shadow-lg"
          >
            <span className="font-semibold">{name}: </span>
            {GLOSSARY[name]}
          </span>,
          document.body
        )}
    </>
  )
}
