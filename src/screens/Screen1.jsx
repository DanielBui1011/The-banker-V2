import { useEffect, useState } from 'react'
import ScreenShell from '../components/ScreenShell.jsx'
import { SALES_CHANNELS, ESCROW_STUCK, SELLER_PROFILE, BANK_TRANSACTIONS } from '../data/mockData.js'
import { computeEscrowStuck } from '../logic/pricing.js'
import { formatNumberVN } from '../utils/format.js'

const STATUS_LABEL = {
  matched: 'Đã khớp',
  exception: 'Ngoại lệ — cần tra thủ công',
  reversed: 'Hoàn',
  outflow: 'Chi ra',
}

const STATUS_STYLE = {
  matched: 'text-emerald-400',
  exception: 'text-amber-300 font-semibold',
  reversed: 'text-slate-500',
  outflow: 'text-slate-500',
}

// Mẫu dòng cho mô phỏng bảng Excel đối soát thủ công (docs/du-lieu.md mục 5)
const MANUAL_SHEET_CODES = ['GD01', 'GD02', 'GD05', 'GD13', 'GD14', 'GD17', 'GD20']
const MANUAL_SHEET_ROWS = MANUAL_SHEET_CODES.map((code) => BANK_TRANSACTIONS.find((tx) => tx.code === code))

export default function Screen1({ onNext }) {
  const escrowStuck = computeEscrowStuck(ESCROW_STUCK.normal.marketplaceRevenue, ESCROW_STUCK.normal.averageHoldDays)
  const targetHours = SELLER_PROFILE.monthlyManualReconciliationHours

  const [displayedHours, setDisplayedHours] = useState(0)
  useEffect(() => {
    let current = 0
    const step = targetHours / 15
    const interval = setInterval(() => {
      current = Math.min(current + step, targetHours)
      setDisplayedHours(current)
      if (current >= targetHours) clearInterval(interval)
    }, 80)
    return () => clearInterval(interval)
  }, [targetHours])

  const [revealedCount, setRevealedCount] = useState(0)
  const [isSimulating, setIsSimulating] = useState(false)

  function runSimulation() {
    setIsSimulating(true)
    setRevealedCount(0)
  }

  useEffect(() => {
    if (!isSimulating) return
    if (revealedCount >= MANUAL_SHEET_ROWS.length) {
      setIsSimulating(false)
      return
    }
    const timer = setTimeout(() => setRevealedCount((c) => c + 1), 450)
    return () => clearTimeout(timer)
  }, [isSimulating, revealedCount])

  return (
    <ScreenShell screenNumber={1} title="Trạng thái hiện tại">
      <div className="space-y-6">
        <span className="inline-block rounded-full border border-amber-800 bg-amber-950/50 px-3 py-1 text-base font-medium text-amber-300">
          Tình trạng hiện tại
        </span>
        <p className="text-lg text-slate-400">
          {SELLER_PROFILE.ownerName} đã bán xong hàng, nhưng doanh thu thật vẫn đang nằm rải rác ở từng kênh, chưa thể dùng ngay.
        </p>

        {/* 4 thẻ kênh bán — docs/du-lieu.md mục 2 */}
        <div className="grid grid-cols-2 gap-4">
          {SALES_CHANNELS.map((c) => (
            <div key={c.channel} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="text-xl font-semibold text-slate-100">{c.channel}</div>
              <div className="mt-1 text-2xl font-bold text-white">
                {formatNumberVN(c.monthlyRevenue)} triệu
                <span className="text-base font-normal text-slate-500"> /tháng</span>
              </div>
              <div className="mt-2 text-base text-slate-400">{c.settlementCycle}</div>
            </div>
          ))}
        </div>

        {/* Khối nổi bật + đồng hồ đối soát */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-amber-700/60 bg-amber-950/30 p-5">
            <div className="text-base text-amber-300">Đang kẹt ở sàn</div>
            <div className="mt-1 text-4xl font-bold text-amber-200">{formatNumberVN(escrowStuck)} triệu</div>
            <div className="mt-2 text-base text-slate-400">
              = doanh thu sàn {formatNumberVN(ESCROW_STUCK.normal.marketplaceRevenue)} triệu / 30 × {ESCROW_STUCK.normal.averageHoldDays} ngày giữ tiền bình quân
            </div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="text-base text-slate-400">Đối soát tháng này</div>
            <div className="mt-1 text-4xl font-bold text-white">{formatNumberVN(displayedHours)} giờ</div>
            <div className="mt-2 text-base text-slate-400">Ngồi đối chiếu Excel thủ công mỗi tháng</div>
          </div>
        </div>

        {/* Mô phỏng bảng Excel đối soát thủ công */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xl font-semibold text-slate-200">Đối soát thủ công — bảng Excel</span>
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-base font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-60"
            >
              {isSimulating ? 'Đang tô màu…' : 'Mô phỏng ▶'}
            </button>
          </div>

          {revealedCount === 0 ? (
            <p className="text-base italic text-slate-500">
              Bấm "Mô phỏng ▶" để xem từng dòng được đối chiếu và tô màu bằng tay.
            </p>
          ) : (
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-slate-800 text-left text-slate-500">
                  <th className="py-2 pr-3 font-medium">Ngày</th>
                  <th className="py-2 pr-3 font-medium">Bên chuyển / nhận</th>
                  <th className="py-2 pr-3 font-medium">Nội dung</th>
                  <th className="py-2 pr-3 text-right font-medium">Số tiền</th>
                  <th className="py-2 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {MANUAL_SHEET_ROWS.slice(0, revealedCount).map((tx) => (
                  <tr
                    key={tx.code}
                    className={`border-b border-slate-800/60 ${tx.status === 'exception' ? 'bg-amber-950/40' : ''}`}
                  >
                    <td className="py-2 pr-3 text-slate-300">{tx.date.slice(8, 10)}/{tx.date.slice(5, 7)}</td>
                    <td className="py-2 pr-3 text-slate-300">{tx.counterparty}</td>
                    <td className="py-2 pr-3 text-slate-400">{tx.reference}</td>
                    <td className={`py-2 pr-3 text-right ${tx.amount >= 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {tx.amount >= 0 ? '+' : ''}
                      {formatNumberVN(tx.amount)}
                    </td>
                    <td className={`py-2 ${STATUS_STYLE[tx.status]}`}>{STATUS_LABEL[tx.status]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Khối phụ — lựa chọn vốn hiện tại */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="text-base text-slate-400">Lựa chọn hiện tại</div>
          <div className="text-xl font-semibold text-slate-100">{SELLER_PROFILE.currentFundingOption}</div>
        </div>

        <button
          onClick={onNext}
          className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white transition hover:bg-blue-500"
        >
          Kết nối ngân hàng →
        </button>
      </div>
    </ScreenShell>
  )
}
