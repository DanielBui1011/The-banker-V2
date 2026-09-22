import { useCallback, useEffect, useState } from 'react'
import KeyHint from './KeyHint.jsx'
import { isTypingTarget } from '../../utils/keyboard.js'

const STAGE_WIDTH = 1920
const STAGE_HEIGHT = 1080

// Sân khấu cố định 1920×1080 (docs/thiet-ke.md mục 1) — scale = min(innerWidth/1920,
// innerHeight/1080), căn giữa, nền ngoài slate-900. Mọi kích thước bên trong Stage
// tính theo px sân khấu (1920×1080), không theo vw/vh thật, để Màn 1 trông giống hệt
// nhau ở 1920×1080 và 1366×768, chỉ khác tỉ lệ.
//
// Vì box sân khấu có transform, nó trở thành containing block cho mọi phần tử con
// dùng position:fixed — nhờ vậy các lớp phủ toàn màn hình hiện có (ScenarioPanel,
// bảng "Quyền của tôi" dạng peek) tự động giới hạn trong khung 1920×1080 mà không
// cần sửa nội dung của chúng.
export default function Stage({ children }) {
  const [scale, setScale] = useState(1)
  const [hintsOpen, setHintsOpen] = useState(false)

  useEffect(() => {
    function updateScale() {
      setScale(Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT))
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(event) {
      if (isTypingTarget(event.target)) return
      if (event.key.toLowerCase() === 'f') {
        event.preventDefault()
        toggleFullscreen()
        return
      }
      if (event.key === '?') {
        event.preventDefault()
        setHintsOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleFullscreen])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-900">
      <div
        style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT, transform: `scale(${scale})` }}
        className="relative flex-shrink-0 origin-center font-sans"
      >
        {children}
      </div>
      {hintsOpen && <KeyHint onClose={() => setHintsOpen(false)} />}
    </div>
  )
}
