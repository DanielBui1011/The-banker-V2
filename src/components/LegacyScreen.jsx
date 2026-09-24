import { ROUTES } from '../logic/journey.js'
import { go } from '../utils/route.js'
import Screen10 from '../screens/Screen10.jsx'

// ADAPTER TẠM (gỡ ở Vòng 25 — docs/ban-giao.md mục 7a): Ứng vốn ở Giai đoạn 3 (Màn 10)
// chưa viết lại, chạy trong khung app.
export default function LegacyScreen() {
  return <Screen10 onGoToScreen={() => go(ROUTES.doiVai)} />
}
