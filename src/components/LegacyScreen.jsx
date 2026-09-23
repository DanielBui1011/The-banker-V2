import { ROUTES } from '../logic/journey.js'
import { go } from '../utils/route.js'
import Screen8 from '../screens/Screen8.jsx'
import Screen10 from '../screens/Screen10.jsx'

// ADAPTER TẠM (Vòng 21–22, gỡ ở Vòng 25 — docs/ban-giao.md mục 7a): hai màn chưa viết lại
// chạy trong khung app — cổng nội bộ ngân hàng (Màn 8) và Ứng vốn ở Giai đoạn 3 (Màn 10).
const OFFICER_SECTION = { 'tra-cuu': 'lookup', 'danh-muc-khoa': 'portfolio', 'canh-bao': 'alerts' }
const SECTION_HREF = { lookup: ROUTES.traCuu, portfolio: ROUTES.danhMucKhoa, alerts: ROUTES.canhBao }

export default function LegacyScreen({ route }) {
  if (route.space === 'ngan-hang') {
    return <Screen8 section={OFFICER_SECTION[route.page]} onSection={(id) => go(SECTION_HREF[id])} />
  }
  return <Screen10 onGoToScreen={() => go(ROUTES.doiVai)} />
}
