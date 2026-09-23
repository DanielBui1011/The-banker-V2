import BankPage, { BankRow, BankBlocked } from '../../components/ui/BankPage.jsx'
import Button from '../../components/ui/Button.jsx'
import { SELLER_PROFILE, SETTLEMENT_TIMELINE_NORMAL } from '../../data/mockData.js'
import { ROUTES, availability } from '../../logic/journey.js'
import { go } from '../../utils/route.js'
import { formatNumberVN } from '../../utils/format.js'
import { useApp } from '../../state/appState.jsx'

// Trang Techcombank "Trả nợ một chạm" (san-pham.md B.2, hanh-trinh 1.19, 1.21). Nền tảng
// chỉ dẫn sang đây — Techcombank thực hiện giao dịch (quy-tac mục 2). Đơn vị lấy từ tham
// số 'don-vi'; thiếu thì lấy đơn vị đầu tiên đang trả được.
const PAYMENT = Object.fromEntries(
  SETTLEMENT_TIMELINE_NORMAL.filter((m) => m.kind === 'marketplace-payment').map((m) => [m.unit, m])
)

export default function TraNo({ params }) {
  const { state, dispatch } = useApp()
  const payable = (code) => availability(state, { type: 'repay', unit: code })
  const unit = params['don-vi'] ?? Object.keys(PAYMENT).find((code) => payable(code).ok) ?? 'RU-03'
  const gate = payable(unit)
  if (!gate.ok) return <BankBlocked gate={gate} backHref={ROUTES.khoanVay} backLabel="Quay về Khoản vay" />

  const amount = state.registry.find((e) => e.unitId === unit).amount
  const pay = PAYMENT[unit]
  // Đổi tài khoản nhận tiền: tiền Shopee không về — trả từ nguồn khác sau khi giải trình (hanh-trinh 2.8)
  const otherSource = unit === 'RU-03' && state.scenario.accountChange

  return (
    <BankPage
      heading="Trả nợ một chạm"
      subheading="Techcombank trích tiền từ tài khoản của bạn để trả phần khoản vay gắn với khoản phải thu này."
      actions={
        <>
          <Button variant="secondary" onClick={() => go(ROUTES.khoanVay)}>
            Hủy
          </Button>
          <Button
            onClick={() => {
              dispatch({ type: 'repay', unit })
              go(ROUTES.khoanVay)
            }}
          >
            Xác nhận trả nợ
          </Button>
        </>
      }
    >
      <BankRow label="Bên cho vay">Techcombank</BankRow>
      <BankRow label="Khoản vay">Khoản vay có bảo đảm bằng khoản phải thu {unit}</BankRow>
      <BankRow label="Nguồn tiền">
        {otherSource
          ? 'Tài khoản khác của bạn tại Techcombank'
          : `${pay.marketplace} đã thanh toán ${formatNumberVN(pay.marketplaceAmount)} triệu cho ${unit} về tài khoản Techcombank`}
      </BankRow>
      <BankRow label="Số tiền trả">
        <span className="text-section-title font-bold tabular-nums">{formatNumberVN(amount)} triệu</span>
      </BankRow>
      <BankRow label="Tài khoản trích">{SELLER_PROFILE.paymentAccount}</BankRow>
    </BankPage>
  )
}
