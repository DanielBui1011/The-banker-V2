import { useState, useCallback, useEffect, useMemo } from 'react'

// Thứ tự khi bấm mũi tên phải — docs/man-hinh.md:
// "1 → 2 → 7 → 3 → 4 → 5 → 6 → 8 → (10 nếu Giai đoạn 3 đang bật)"
// Màn 9 không nằm trong chuỗi này: đó là diễn biến thay thế của Màn 6 khi bật rò rỉ (phím L),
// sẽ được nối vào từ trạng thái kịch bản, không qua mũi tên trái/phải.
const BASE_SCREEN_ORDER = [1, 2, 7, 3, 4, 5, 6, 8]

// Màn 10 chỉ xuất hiện trong chuỗi mũi tên khi Giai đoạn 3 (phím 3) đang bật.
export function screenOrderFor(phase3) {
  return phase3 ? [...BASE_SCREEN_ORDER, 10] : BASE_SCREEN_ORDER
}

const ACT_BY_SCREEN = {
  1: 1,
  2: 2,
  7: 2,
  3: 3,
  4: 3,
  5: 3,
  6: 4,
  8: 4,
  10: 4,
}

export function actForScreen(screenNumber) {
  return ACT_BY_SCREEN[screenNumber] ?? null
}

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
