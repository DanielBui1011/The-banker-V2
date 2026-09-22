import { useState, useCallback, useEffect, useMemo } from 'react'
import { screenOrderFor } from '../config/flow.js'

// Thứ tự màn và ánh xạ màn → hồi nay sống ở src/config/flow.js (nguồn duy nhất) —
// re-export screenOrderFor để các nơi đã import từ đây không phải đổi đường dẫn.
export { screenOrderFor }

export function useJourneyState(phase3) {
  const screenOrder = useMemo(() => screenOrderFor(phase3), [phase3])
  const [position, setPosition] = useState(0)
  // Vị trí xa nhất từng đạt tới — dùng để suy ra "đã qua Màn X" một chiều,
  // không bị lùi lại khi người trình bày bấm mũi tên trái để xem lại màn trước.
  const [maxPosition, setMaxPosition] = useState(0)

  // Tắt Giai đoạn 3 khi đang ở Màn 10 (hoặc đã từng đi xa hơn vị trí của Màn 10) làm chuỗi
  // ngắn lại — kẹp vị trí ngay khi đọc (clampedPosition/clampedMaxPosition dưới đây) để
  // không bao giờ render với chỉ số vượt quá độ dài mới; effect này chỉ đồng bộ lại state
  // lưu trữ cho các lần render sau.
  const clampedPosition = Math.min(position, screenOrder.length - 1)
  const clampedMaxPosition = Math.min(maxPosition, screenOrder.length - 1)

  useEffect(() => {
    setPosition((p) => Math.min(p, screenOrder.length - 1))
    setMaxPosition((m) => Math.min(m, screenOrder.length - 1))
  }, [screenOrder])

  const goNext = useCallback(() => {
    setPosition((p) => {
      const next = Math.min(p + 1, screenOrder.length - 1)
      setMaxPosition((m) => Math.max(m, next))
      return next
    })
  }, [screenOrder])

  const goPrev = useCallback(() => {
    setPosition((p) => Math.max(p - 1, 0))
  }, [])

  const goToScreen = useCallback(
    (screenNumber) => {
      const index = screenOrder.indexOf(screenNumber)
      if (index === -1) return
      setPosition(index)
      setMaxPosition((m) => Math.max(m, index))
    },
    [screenOrder]
  )

  // "Đã qua Màn N": vị trí xa nhất đã vượt qua chỗ của Màn N trong screenOrder.
  const hasPassedScreen = useCallback(
    (screenNumber) => clampedMaxPosition > screenOrder.indexOf(screenNumber),
    [clampedMaxPosition, screenOrder]
  )

  return {
    currentScreen: screenOrder[clampedPosition],
    position: clampedPosition,
    totalSteps: screenOrder.length,
    goNext,
    goPrev,
    goToScreen,
    hasPassedScreen,
  }
}
