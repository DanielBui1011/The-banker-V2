import ConsentPage from '../../components/ui/ConsentPage.jsx'
import { BankBlocked } from '../../components/ui/BankPage.jsx'
import { A4_AGREEMENT, LOCK_CERTIFICATE, PRICING_PARAMS } from '../../data/mockData.js'
import { ROUTES, availability, activeUnits } from '../../logic/journey.js'
import { computeAvailableValue } from '../../logic/pricing.js'
import { go } from '../../utils/route.js'
import { formatNumberVN } from '../../utils/format.js'
import { useApp } from '../../state/appState.jsx'
import { FUNDING_STEPS } from '../UngVon.jsx'

// Trang Techcombank A4 — thỏa thuận chuyển giao quyền đòi nợ (hanh-trinh 1.14–1.15).
// A4 là thỏa thuận bảo đảm, không phải quyền xử lý dữ liệu (quy-tac mục 3).
export default function A4() {
  const { state, dispatch } = useApp()
  const gate = availability(state, 'signA4')
  if (!gate.ok) return <BankBlocked gate={gate} backHref={ROUTES.ungVon} backLabel="Quay về Ứng vốn" />

  const units = activeUnits(state)
  const lock = computeAvailableValue({ units, params: PRICING_PARAMS.normal }).unitBreakdown
  const channel = (code) => units.find((u) => u.code === code).channel

  return (
    <ConsentPage
      steps={FUNDING_STEPS}
      stepperId="ung-von"
      currentStep={3}
      heading="Thỏa thuận chuyển giao quyền đòi nợ"
      subheading="Vui lòng đọc kỹ nội dung trước khi ký."
      requesterLabel="Bên nhận bảo đảm"
      requesterName="Techcombank"
      purpose="Bảo đảm cho khoản vay của Techcombank bằng quyền đòi nợ đối với khoản phải thu, đăng ký theo Nghị định 99/2022/NĐ-CP."
      scopeLabel="Tài sản bảo đảm"
      scopeItems={lock.map((u) => `${u.code} — ${channel(u.code)}, khóa ${formatNumberVN(u.formulaValue)} triệu cho Techcombank tại sổ đăng ký`)}
      recipientLabel="Đăng ký biện pháp bảo đảm"
      recipient={`${A4_AGREEMENT.registrationNote} Mã đăng ký giả định: ${LOCK_CERTIFICATE.registrationId}.`}
      durationLabel="Dòng tiền"
      duration={A4_AGREEMENT.settlementNote}
      notAllowedText="Thỏa thuận này KHÔNG cho phép Techcombank truy cập hay xử lý dữ liệu ngoài phạm vi tài sản bảo đảm nêu trên."
      withdrawalText="Không thể rút khi còn dư nợ — thỏa thuận tự động chấm dứt sau khi khoản vay tất toán."
      confirmLabel="Tôi đã đọc và đồng ý ký thỏa thuận chuyển giao quyền đòi nợ nêu trên"
      approveLabel="Ký thỏa thuận"
      onApprove={() => {
        dispatch({ type: 'signA4' })
        go(ROUTES.ungVon)
      }}
      onReject={() => go(ROUTES.ungVon)}
    />
  )
}
