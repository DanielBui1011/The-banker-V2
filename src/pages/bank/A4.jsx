import ConsentPage from '../../components/ui/ConsentPage.jsx'
import { BankBlocked } from '../../components/ui/BankPage.jsx'
import { A4_AGREEMENT, LENDER_QUOTES, LOCK_CERTIFICATE } from '../../data/mockData.js'
import { ROUTES, availability, lockPlan } from '../../logic/journey.js'
import { go } from '../../utils/route.js'
import { formatNumberVN } from '../../utils/format.js'
import { useApp } from '../../state/appState.jsx'
import { fundingSteps } from '../UngVon.jsx'

// Trang ký A4 — thỏa thuận chuyển giao quyền đòi nợ (hanh-trinh 1.14–1.15).
// A4 là thỏa thuận bảo đảm, không phải quyền xử lý dữ liệu (quy-tac mục 3).
// Giai đoạn 3: trang của bên được chọn — Techcombank dùng khung Techcombank, Ngân hàng B /
// Công ty tài chính C dùng khung trung tính (SurfaceFrame theo bankName, san-pham.md K.3.6).
export default function A4() {
  const { state, dispatch } = useApp()
  const gate = availability(state, 'signA4')
  if (!gate.ok) return <BankBlocked gate={gate} backHref={ROUTES.ungVon} backLabel="Quay về Ứng vốn" />

  const phase3 = state.scenario.phase3
  const quote = LENDER_QUOTES.find((q) => q.lender === (phase3 ? state.application.chosenLender : LOCK_CERTIFICATE.secured))
  const lender = quote.lender
  const units = lockPlan(quote.value)

  return (
    <ConsentPage
      steps={fundingSteps(state)}
      stepperId="ung-von"
      currentStep={phase3 ? 4 : 3}
      bankName={lender}
      heading="Thỏa thuận chuyển giao quyền đòi nợ"
      subheading="Vui lòng đọc kỹ nội dung trước khi ký."
      requesterLabel="Bên nhận bảo đảm"
      requesterName={lender}
      purpose={`Bảo đảm cho khoản vay ${formatNumberVN(quote.value)} triệu của ${lender} bằng quyền đòi nợ đối với khoản phải thu, đăng ký theo Nghị định 99/2022/NĐ-CP.`}
      scopeLabel="Tài sản bảo đảm"
      scopeItems={units.map((u) => `${u.code} — ${u.channel}, khóa ${formatNumberVN(u.amount)} triệu cho ${lender} tại sổ đăng ký`)}
      recipientLabel="Đăng ký biện pháp bảo đảm"
      recipient={`${A4_AGREEMENT.registrationNote} Mã đăng ký giả định: ${LOCK_CERTIFICATE.registrationId}.`}
      durationLabel="Dòng tiền"
      duration={
        lender === LOCK_CERTIFICATE.secured
          ? A4_AGREEMENT.settlementNote
          : `Tiền sàn thanh toán ${units.map((u) => u.code).join(' và ')} dùng để trả khoản vay của ${lender}.`
      }
      notAllowedText={`Thỏa thuận này KHÔNG cho phép ${lender} truy cập hay xử lý dữ liệu ngoài phạm vi tài sản bảo đảm nêu trên.`}
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
