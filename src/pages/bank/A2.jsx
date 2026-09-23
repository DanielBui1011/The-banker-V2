import ConsentPage from '../../components/ui/ConsentPage.jsx'
import { BankBlocked } from '../../components/ui/BankPage.jsx'
import { A2_CONSENT, GRANTED_PERMISSIONS } from '../../data/mockData.js'
import { LEGAL_NAME, TPP_CODE } from '../../config/brand.js'
import { ROUTES, availability } from '../../logic/journey.js'
import { go, returnHref } from '../../utils/route.js'
import { formatDateVN } from '../../utils/format.js'
import { useApp } from '../../state/appState.jsx'
import { FUNDING_STEPS } from '../UngVon.jsx'

// Trang Techcombank A2 — quyền đánh giá tín dụng, trang riêng (không chung cờ với A4).
// Quay về Ứng vốn (bước 2) hoặc Quyền & dữ liệu khi cấp lại từ đó ('ve').
const A2_EXPIRY = GRANTED_PERMISSIONS.find((p) => p.code === 'A2').expiryDate

export default function A2({ params }) {
  const { state, dispatch } = useApp()
  const back = returnHref(params, ROUTES.ungVon)
  const gate = availability(state, 'grantA2')
  if (!gate.ok) return <BankBlocked gate={gate} backHref={back} backLabel="Quay về ứng dụng" />

  return (
    <ConsentPage
      steps={params.ve ? undefined : FUNDING_STEPS}
      stepperId="ung-von"
      currentStep={1}
      heading="Yêu cầu cấp quyền đánh giá tín dụng"
      subheading="Vui lòng xem lại phạm vi trước khi quyết định."
      requesterName={LEGAL_NAME}
      requesterCode={TPP_CODE}
      purpose={A2_CONSENT.purposeLabel}
      scopeItems={A2_CONSENT.dataScopes}
      recipient={A2_CONSENT.dataRecipient}
      duration={`${A2_CONSENT.durationDays} ngày, đến ${formatDateVN(A2_EXPIRY)}`}
      notAllowedText="Quyền này KHÔNG cho phép: chuyển tiền, thay đổi thông tin tài khoản, xem mật khẩu hoặc mã OTP."
      withdrawalText={A2_CONSENT.independenceNote}
      confirmLabel="Tôi đã đọc và đồng ý cấp quyền cho mục đích trên"
      approveLabel="Đồng ý cấp quyền"
      onApprove={() => {
        dispatch({ type: 'grantA2' })
        go(back)
      }}
      onReject={() => go(back)}
    />
  )
}
