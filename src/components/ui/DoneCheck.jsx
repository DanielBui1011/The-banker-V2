// Dấu tích tự vẽ (san-pham.md L.2: hoàn tất hành động — cấp quyền, giải ngân, trả nợ):
// vòng tròn + nét tích vẽ bằng stroke-dashoffset 300ms khi phần tử được mount.
// Màu theo currentColor của nơi gọi. reduced-motion → hiện ngay (khối CSS toàn cục).
export default function DoneCheck({ size = 28, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`flex-shrink-0 ${className}`} aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M7 12.5l3.2 3.2L17 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-check-draw" />
    </svg>
  )
}
