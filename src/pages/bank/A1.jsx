import ConsentPage from '../../components/ui/ConsentPage.jsx'
import { BankBlocked } from '../../components/ui/BankPage.jsx'
import { A1_CONSENT, GRANTED_PERMISSIONS } from '../../data/mockData.js'
import { LEGAL_NAME, TPP_CODE } from '../../config/brand.js'
import { ROUTES, availability } from '../../logic/journey.js'
import { go, returnHref } from '../../utils/route.js'
import { formatDateVN } from '../../utils/format.js'
import { useApp } from '../../state/appState.jsx'

// Trang Techcombank A1 — cấp quyền đối soát (san-pham.md B.2, hanh-trinh 1.4–1.6).
// Quay về: Đối soát (lần đầu) hoặc Quyền & dữ liệu (cấp lại); tham số 've' ghi đè.
const A1_EXPIRY = GRANTED_PERMISSIONS.find((p) => p.code === 'A1').expiryDate
const STEPS = ['Chọn ngân hàng', 'Cấp quyền trên Techcombank', 'Quay về đối soát']

export default function A1({ params }) {
  const { state, dispatch } = useApp()
  const firstTime = state.consents.A1 === 'none'
  const back = returnHref(params, firstTime ? ROUTES.doiSoat : ROUTES.quyen)
  const gate = availability(state, 'grantA1')
  if (!gate.ok) return <BankBlocked gate={gate} backHref={back} backLabel="Quay về ứng dụng" />

  return (
    <ConsentPage
      steps={STEPS}
      currentStep={2}
      heading="Yêu cầu cấp quyền truy cập dữ liệu"
      subheading="Vui lòng xem lại phạm vi trước khi quyết định."
      requesterName={LEGAL_NAME}
      requesterCode={TPP_CODE}
      purpose={A1_CONSENT.purposeLabel}
      scopeItems={A1_CONSENT.dataScopes}
      recipient={A1_CONSENT.dataRecipient}
      duration={`${A1_CONSENT.durationDays} ngày, đến ${formatDateVN(A1_EXPIRY)} — ${A1_CONSENT.renewalNote}`}
      notAllowedText="Quyền này KHÔNG cho phép: chuyển tiền, thay đổi thông tin tài khoản, xem mật khẩu hoặc mã OTP."
      withdrawalText="Bạn có thể rút lại quyền này bất cứ lúc nào trong ứng dụng Techcombank hoặc ở trang Quyền & dữ liệu."
      confirmLabel="Tôi đã đọc và đồng ý cấp quyền cho mục đích trên"
      approveLabel="Đồng ý cấp quyền"
      onApprove={() => {
        dispatch({ type: 'grantA1' })
        go(back)
      }}
      onReject={() => go(returnHref(params, firstTime ? ROUTES.tongQuan : ROUTES.quyen))}
    />
  )
}
