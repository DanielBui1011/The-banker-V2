import { useState, useCallback } from 'react'

// Thứ tự khi bấm mũi tên phải — docs/man-hinh.md:
// "1 → 2 → 7 → 3 → 4 → 5 → 6 → 8 → (10 nếu Giai đoạn 3 đang bật)"
// Màn 9 không nằm trong chuỗi này: đó là diễn biến thay thế của Màn 6 khi bật rò rỉ (phím L),
// sẽ được nối vào từ trạng thái kịch bản, không qua mũi tên trái/phải.
// TODO: khi trạng thái "Giai đoạn 3" (phím 3) được cài đặt, Màn 10 sẽ chỉ xuất hiện trong
// chuỗi này lúc cờ đó bật; hiện để tạm trong chuỗi cho khung điều hướng.
export const SCREEN_ORDER = [1, 2, 7, 3, 4, 5, 6, 8, 10]

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

export function useJourneyState() {
  const [position, setPosition] = useState(0)
  // Vị trí xa nhất từng đạt tới — dùng để suy ra "đã qua Màn X" một chiều,
  // không bị lùi lại khi người trình bày bấm mũi tên trái để xem lại màn trước.
  const [maxPosition, setMaxPosition] = useState(0)

  const goNext = useCallback(() => {
    setPosition((p) => {
      const next = Math.min(p + 1, SCREEN_ORDER.length - 1)
      setMaxPosition((m) => Math.max(m, next))
      return next
    })
  }, [])

  const goPrev = useCallback(() => {
    setPosition((p) => Math.max(p - 1, 0))
  }, [])

  const goToScreen = useCallback((screenNumber) => {
    const index = SCREEN_ORDER.indexOf(screenNumber)
    if (index === -1) return
    setPosition(index)
    setMaxPosition((m) => Math.max(m, index))
  }, [])

  // "Đã qua Màn N": vị trí xa nhất đã vượt qua chỗ của Màn N trong SCREEN_ORDER.
  const hasPassedScreen = useCallback(
    (screenNumber) => maxPosition > SCREEN_ORDER.indexOf(screenNumber),
    [maxPosition]
  )

  return {
    currentScreen: SCREEN_ORDER[position],
    position,
    totalSteps: SCREEN_ORDER.length,
    goNext,
    goPrev,
    goToScreen,
    hasPassedScreen,
  }
}
