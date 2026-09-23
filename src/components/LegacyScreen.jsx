import { ROUTES } from '../logic/journey.js'
import Screen1 from '../screens/Screen1.jsx'
import Screen2 from '../screens/Screen2.jsx'
import Screen3 from '../screens/Screen3.jsx'
import Screen4 from '../screens/Screen4.jsx'
import Screen5 from '../screens/Screen5.jsx'
import Screen6 from '../screens/Screen6.jsx'
import Screen7 from '../screens/Screen7.jsx'
import Screen8 from '../screens/Screen8.jsx'
import Screen10 from '../screens/Screen10.jsx'

// ADAPTER TẠM (Vòng 21, gỡ ở Vòng 24 — docs/ban-giao.md): mỗi route render màn cũ tương
// ứng theo docs/san-pham.md mục I. Các nút chuyển màn cũ (onNext/onPrev/onGoToScreen)
// được đổi thành điều hướng hash.
const PAGE_SCREEN = {
  'tong-quan': Screen1,
  'doi-soat': Screen3,
  'khoan-phai-thu': Screen4,
  'ung-von': Screen5,
  'khoan-vay': Screen6,
  'quyen-du-lieu': Screen7,
  a1: Screen2,
  a2: Screen5,
  a4: Screen5,
  'tra-no': Screen6,
}
const SCREEN_HREF = {
  1: ROUTES.tongQuan,
  2: ROUTES.a1,
  3: ROUTES.doiSoat,
  4: ROUTES.khoanPhaiThu,
  5: ROUTES.ungVon,
  6: ROUTES.khoanVay,
  7: ROUTES.quyen,
  8: ROUTES.traCuu,
  10: ROUTES.ungVon,
}
// "Tiếp →" của màn cũ theo thứ tự cũ 1 → 2 → 7 → 3 → 4 → 5 → 6 → 8; 6 → 8 là đổi vai
const NEXT_HREF = new Map([
  [Screen1, ROUTES.a1],
  [Screen2, ROUTES.quyen],
  [Screen7, ROUTES.doiSoat],
  [Screen3, ROUTES.khoanPhaiThu],
  [Screen4, ROUTES.ungVon],
  [Screen5, ROUTES.khoanVay],
  [Screen6, ROUTES.doiVai],
])
const OFFICER_SECTION = { 'tra-cuu': 'lookup', 'danh-muc-khoa': 'portfolio', 'canh-bao': 'alerts' }
const SECTION_HREF = { lookup: ROUTES.traCuu, portfolio: ROUTES.danhMucKhoa, alerts: ROUTES.canhBao }

const go = (href) => {
  window.location.hash = href
}

export default function LegacyScreen({ route, phase3 }) {
  if (route.space === 'ngan-hang') {
    return <Screen8 section={OFFICER_SECTION[route.page]} onSection={(id) => go(SECTION_HREF[id])} />
  }
  const Screen = route.page === 'ung-von' && phase3 ? Screen10 : PAGE_SCREEN[route.page]
  const next = NEXT_HREF.get(Screen)
  return (
    <Screen
      onNext={next ? () => go(next) : undefined}
      onPrev={() => window.history.back()}
      onGoToScreen={(n) => go(SCREEN_HREF[n])}
    />
  )
}
