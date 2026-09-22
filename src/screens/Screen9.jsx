import { formatNumberVN } from '../utils/format.js'
import { MarketplacePaymentNotice, TechcombankPageFrame, TechRow } from './Screen6.jsx'

// Không phải điểm dừng riêng trong chuỗi mũi tên trái/phải — đây là diễn biến thay thế
// của Màn 6 khi bật kịch bản rò rỉ (phím L), được Màn 6 gọi tới theo mốc hiện tại.
export default function LeakScenarioContent({ settlement }) {
  const m = settlement.currentMilestone
  if (!m) return null

  if (m.kind === 'leak-no-payment') {
    return (
      <InfoBox tone="amber">
        {m.marketplace} không có khoản thanh toán nào về tài khoản Techcombank cho {m.unit}.
      </InfoBox>
    )
  }

  if (m.kind === 'marketplace-payment') {
    return <MarketplacePaymentNotice milestone={m} settlement={settlement} />
  }

  if (m.kind === 'leak-window-closed') {
    return <InfoBox tone="amber">Đã hết cửa sổ thanh toán {m.unit}.</InfoBox>
  }

  if (m.kind === 'leak-broken') {
    return <BrokenPanel settlement={settlement} unit={m.unit} amount={settlement.ru03LockAmount} />
  }

  return null
}

function InfoBox({ tone = 'slate', children }) {
  const toneClass =
    tone === 'amber'
      ? 'border-amber-700/60 bg-amber-950/20 text-amber-200'
      : 'border-slate-800 bg-slate-900/60 text-slate-200'
  return <div className={`rounded-xl border p-5 text-lg ${toneClass}`}>{children}</div>
}

function BrokenPanel({ settlement, unit, amount }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-red-700/60 bg-red-950/20 p-5 text-lg font-semibold text-red-300">
        Tiền không về tài khoản neo — đã thông báo Techcombank.
      </div>

      {settlement.fundingFrozen && (
        <div className="inline-block rounded-full border border-amber-700 bg-amber-950/40 px-4 py-1.5 text-base font-medium text-amber-300">
          Tạm dừng cấp vốn mới
        </div>
      )}

      {!settlement.leakRemediated ? (
        <>
          <p className="text-lg text-slate-300">Vui lòng xác nhận tài khoản nhận tiền trên sàn.</p>
          <button
            onClick={settlement.openLeakExplain}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-lg font-semibold text-white transition hover:bg-blue-500"
          >
            Tôi đã đổi tài khoản — giải trình
          </button>
        </>
      ) : (
        <div className="rounded-xl border border-teal-800/60 bg-teal-950/20 p-5 text-lg text-teal-200">
          Đã giải trình và trả {formatNumberVN(amount)} triệu từ nguồn khác. Dư nợ về 0, đã gỡ tạm dừng cấp vốn mới.{' '}
          {unit} vẫn giữ trạng thái "Đứt gãy" trong lịch sử.
        </div>
      )}

      {settlement.leakExplainOpen && <LeakExplainModal settlement={settlement} amount={amount} />}
    </div>
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
