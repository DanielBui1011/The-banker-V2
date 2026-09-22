import Card from '../components/ui/Card.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import Callout from '../components/ui/Callout.jsx'
import { formatNumberVN } from '../utils/format.js'
import { MarketplacePaymentNotice, TechcombankPageFrame, TechRow } from './Screen6.jsx'

// Không phải điểm dừng riêng trong chuỗi mũi tên trái/phải — đây là diễn biến thay thế
// của Màn 6 khi bật kịch bản rò rỉ (phím L), được Màn 6 gọi tới theo mốc hiện tại.
// Vòng 7C: giọng điệu bình tĩnh, không trình bày như lỗi hệ thống — chỉ đổi cách
// trình bày bằng component chung, giữ nguyên logic (src/state/settlementState.jsx).
export default function LeakScenarioContent({ settlement }) {
  const m = settlement.currentMilestone
  if (!m) return null

  if (m.kind === 'leak-no-payment') {
    return (
      <Callout variant="warn">
        {m.marketplace} không có khoản thanh toán nào về tài khoản Techcombank cho {m.unit} trong cửa sổ thanh toán.
      </Callout>
    )
  }

  if (m.kind === 'marketplace-payment') {
    return <MarketplacePaymentNotice milestone={m} settlement={settlement} />
  }

  if (m.kind === 'leak-window-closed') {
    return <Callout variant="warn">Đã hết cửa sổ thanh toán {m.unit}. Đang trong 3 ngày ân hạn.</Callout>
  }

  if (m.kind === 'leak-broken') {
    return <BrokenPanel settlement={settlement} unit={m.unit} amount={settlement.ru03LockAmount} />
  }

  return null
}

function BrokenPanel({ settlement, unit, amount }) {
  return (
    <div className="space-y-4">
      <Card className="border-red-600 bg-red-50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-emphasis font-semibold text-red-800">{unit} — đơn vị khoản phải thu đứt gãy</div>
            <p className="mt-1 text-label text-red-700">
              1/8 lô hàng không về tài khoản neo sau hết 3 ngày ân hạn — đã tự động thông báo tới Techcombank.
            </p>
          </div>
          <StatusBadge status="broken" />
        </div>
      </Card>

      {settlement.fundingFrozen && (
        <Callout variant="warn">Đang tạm dừng cấp vốn mới cho tới khi xử lý xong.</Callout>
      )}

      {!settlement.leakRemediated ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <OptionCard
            title="Giải trình tài khoản nhận tiền"
            description="Xác nhận với Techcombank tài khoản đã dùng để nhận tiền từ Shopee cho lô hàng này."
            actionLabel="Giải trình →"
            onClick={settlement.openLeakExplain}
          />
          <OptionCard
            title="Trả nợ từ nguồn khác"
            description={`Trả ${formatNumberVN(amount)} triệu cho khoản vay bằng tài khoản khác của chị Lan tại Techcombank.`}
            actionLabel="Trả từ nguồn khác →"
            onClick={settlement.openLeakExplain}
          />
        </div>
      ) : (
        <Callout variant="info">
          Đã giải trình và trả {formatNumberVN(amount)} triệu từ nguồn khác. Dư nợ về 0, đã gỡ tạm dừng cấp vốn mới.{' '}
          {unit} vẫn giữ trạng thái "Đứt gãy" trong lịch sử.
        </Callout>
      )}

      {settlement.leakExplainOpen && <LeakExplainModal settlement={settlement} amount={amount} />}
    </div>
  )
}

// Hai lựa chọn xử lý trình bày tách biệt (man-hinh.md Màn 9) — cùng dẫn tới một bước
// xác nhận trên trang Techcombank vì đây là một quy trình khôi phục duy nhất trong
// state hiện có (settlementState.jsx); không đổi logic nghiệp vụ, chỉ đổi trình bày.
function OptionCard({ title, description, actionLabel, onClick }) {
  return (
    <Card className="flex flex-col justify-between">
      <div>
        <div className="text-emphasis font-semibold text-slate-900">{title}</div>
        <p className="mt-2 text-label text-slate-600">{description}</p>
      </div>
      <button
        onClick={onClick}
        className="mt-4 rounded-xl bg-navy px-5 py-2.5 text-body font-semibold text-white transition hover:opacity-90"
      >
        {actionLabel}
      </button>
    </Card>
  )
}

function LeakExplainModal({ settlement, amount }) {
  return (
    <TechcombankPageFrame
      heading="Giải trình và trả nợ"
      subheading="Xác nhận tài khoản nhận tiền trên sàn và trả nợ từ nguồn khác."
      confirmLabel="Xác nhận trả nợ"
      onConfirm={settlement.confirmLeakRemediation}
    >
      <TechRow label="Số tiền trả" value={`${formatNumberVN(amount)} triệu`} />
      <TechRow label="Nguồn trả nợ" value="Tài khoản khác của chị Lan tại Techcombank" />
    </TechcombankPageFrame>
  )
}
