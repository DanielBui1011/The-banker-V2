import BankPage, { BankRow, BankBlocked } from '../../components/ui/BankPage.jsx'
import Button from '../../components/ui/Button.jsx'
import { GRANTED_PERMISSIONS } from '../../data/mockData.js'
import { ROUTES, availability } from '../../logic/journey.js'
import { go } from '../../utils/route.js'
import { useApp } from '../../state/appState.jsx'

// Rút quyền A1/A2 trên trang Techcombank (Vòng 22: rút và cấp lại đều qua trang ngân
// hàng). Hệ quả theo san-pham.md G.1; mở từ Quyền & dữ liệu, quay về đó.
const CONSEQUENCE = {
  A1: [
    'Nền tảng ngừng đọc giao dịch tài khoản — đối soát tự động dừng cập nhật.',
    'Hồ sơ doanh thu đã xác thực không có dữ liệu mới cho tới khi bạn cấp lại A1.',
  ],
  A2: [
    'Nền tảng không gửi đề nghị ứng vốn mới; Techcombank không xem được hồ sơ doanh thu đã xác thực.',
    'Khoản vay hiện có không thay đổi. Đối soát (A1) vẫn hoạt động.',
  ],
}

export default function RutQuyen({ code }) {
  const { state, dispatch } = useApp()
  const action = code === 'A1' ? 'revokeA1' : 'revokeA2'
  const gate = availability(state, action)
  if (!gate.ok) return <BankBlocked gate={gate} backHref={ROUTES.quyen} backLabel="Quay về Quyền & dữ liệu" />
  const permission = GRANTED_PERMISSIONS.find((p) => p.code === code)

  return (
    <BankPage
      heading={`Rút quyền ${code} — ${permission.purpose.toLowerCase()}`}
      subheading="Sau khi rút, bạn có thể cấp lại bất cứ lúc nào."
      actions={
        <>
          <Button variant="secondary" onClick={() => go(ROUTES.quyen)}>
            Giữ quyền
          </Button>
          <Button
            onClick={() => {
              dispatch({ type: action })
              go(ROUTES.quyen)
            }}
          >
            Rút quyền {code}
          </Button>
        </>
      }
    >
      <BankRow label="Bên đang được cấp quyền">{permission.to}</BankRow>
      <BankRow label="Hệ quả khi rút">
        <ul className="list-disc space-y-1 pl-5">
          {CONSEQUENCE[code].map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </BankRow>
    </BankPage>
  )
}
