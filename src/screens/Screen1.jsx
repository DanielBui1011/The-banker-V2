import { useEffect, useState } from 'react'
import TopBar from '../components/ui/TopBar.jsx'
import ActProgress from '../components/ui/ActProgress.jsx'
import SurfaceFrame from '../components/ui/SurfaceFrame.jsx'
import Card from '../components/ui/Card.jsx'
import Money from '../components/ui/Money.jsx'
import Stat from '../components/ui/Stat.jsx'
import Button from '../components/ui/Button.jsx'
import { actForScreen } from '../config/flow.js'
import { usePermissions } from '../state/permissionState.jsx'
import {
  SALES_CHANNELS,
  ESCROW_STUCK,
  SELLER_PROFILE,
  BANK_TRANSACTIONS,
  TOTAL_MONTHLY_REVENUE,
  TOTAL_MARKETPLACE_REVENUE,
  FOOTER_NOTE,
} from '../data/mockData.js'
import { computeEscrowStuck } from '../logic/pricing.js'
import { formatNumberVN } from '../utils/format.js'

// Kênh qua sàn (docs/du-lieu.md mục 3): dùng để tô đậm phần "qua sàn" trong thanh
// ngang cơ cấu doanh thu — không viết cứng danh sách kênh nào tính là "qua sàn" ở
// nơi khác, chỉ dùng đúng 2 tên kênh khớp với TOTAL_MARKETPLACE_REVENUE.
const MARKETPLACE_CHANNELS = new Set(['Shopee', 'TikTok Shop'])

const STATUS_LABEL = {
  matched: 'Đã khớp',
  exception: 'Ngoại lệ — cần tra thủ công',
  reversed: 'Hoàn',
  outflow: 'Chi ra',
}

const STATUS_STYLE = {
  matched: 'text-teal-700',
  exception: 'text-amber-700 font-semibold',
  reversed: 'text-slate-600',
  outflow: 'text-slate-600',
}

// Mẫu dòng cho mô phỏng bảng Excel đối soát thủ công (docs/du-lieu.md mục 5)
const MANUAL_SHEET_CODES = ['GD01', 'GD02', 'GD05', 'GD13', 'GD14', 'GD17', 'GD20']
const MANUAL_SHEET_ROWS = MANUAL_SHEET_CODES.map((code) => BANK_TRANSACTIONS.find((tx) => tx.code === code))

export default function Screen1({ onNext }) {
  const { openPeek } = usePermissions()
  const escrowStuck = computeEscrowStuck(ESCROW_STUCK.normal.marketplaceRevenue, ESCROW_STUCK.normal.averageHoldDays)

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
    <div className="flex h-full flex-col">
      <TopBar screenNumber={1} onOpenPeek={() => openPeek(1)} />
      <div className="min-h-0 flex-1">
        <SurfaceFrame variant="platform">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 px-12 pb-3 pt-3">
              <ActProgress currentAct={actForScreen(1)} tone="light" />
            </div>

            <main className="flex-1 overflow-y-auto px-12 pt-10 pb-24">
              <div className="mx-auto max-w-[1536px] space-y-6">
                <h1 className="text-screen-title font-bold text-slate-900">Trạng thái hiện tại</h1>

                {/* Con số chủ đạo — người xem hiểu vấn đề trong 3 giây */}
                <Card padding="p-8">
                  <div className="text-label font-medium text-slate-600">Đang kẹt ở sàn</div>
                  <Money value={escrowStuck} size="hero" className="mt-2 block text-slate-900" />
                  <div className="mt-3 text-body text-slate-600">
                    = doanh thu sàn {formatNumberVN(ESCROW_STUCK.normal.marketplaceRevenue)} triệu / 30 ×{' '}
                    {ESCROW_STUCK.normal.averageHoldDays} ngày giữ tiền bình quân
                  </div>
                </Card>

                {/* Thanh ngang cơ cấu doanh thu 4 kênh, một thanh chia đoạn, nhãn ngay trên từng đoạn */}
                <Card>
                  <div className="text-label font-medium text-slate-600">Cơ cấu doanh thu tháng</div>
                  <Money value={TOTAL_MONTHLY_REVENUE} size="emphasis" className="mt-1 block text-slate-900" />

                  <div className="mt-4 flex h-16 w-full overflow-hidden rounded-lg" role="img" aria-label="Cơ cấu doanh thu theo kênh">
                    {SALES_CHANNELS.map((c) => {
                      const isMarketplace = MARKETPLACE_CHANNELS.has(c.channel)
                      return (
                        <div
                          key={c.channel}
                          style={{ width: `${(c.monthlyRevenue / TOTAL_MONTHLY_REVENUE) * 100}%` }}
                          className={`flex flex-col items-center justify-center overflow-hidden px-1 text-center leading-tight ${
                            isMarketplace ? 'bg-navy text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                          title={`${c.channel}: ${formatNumberVN(c.monthlyRevenue)} triệu`}
                        >
                          <span className="w-full truncate text-label font-semibold">{c.channel}</span>
                          <span className={`w-full truncate text-label ${isMarketplace ? 'text-white/80' : 'text-slate-600'}`}>
                            {formatNumberVN(c.monthlyRevenue)} triệu
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-4 text-label font-medium text-navy">
                    Qua sàn: {formatNumberVN(TOTAL_MARKETPLACE_REVENUE)} triệu trên tổng {formatNumberVN(TOTAL_MONTHLY_REVENUE)} triệu
                  </div>
                </Card>

                {/* Hai Stat ngang hàng (docs/thiet-ke.md mục 5) — không lặp lại số "2%/tháng"
                    trong component, currentFundingOption đã chứa số này trong dữ liệu. */}
                <Card padding="p-4">
                  <div className="grid grid-cols-2 divide-x divide-slate-200">
                    <Stat
                      label="Đối soát thủ công"
                      value={`${formatNumberVN(SELLER_PROFILE.monthlyManualReconciliationHours)} giờ/tháng`}
                      className="px-4 first:pl-0"
                    />
                    <Stat
                      label="Lựa chọn vốn hiện tại"
                      value={SELLER_PROFILE.currentFundingOption}
                      className="px-4"
                    />
                  </div>
                </Card>

                {/* Mô phỏng bảng Excel đối soát thủ công — bằng chứng nỗi đau, hạ cấp thị giác so với con số chính */}
                <Card className="border-slate-100 bg-slate-50/60">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-label font-medium text-slate-600">Cách chị Lan đối soát hiện nay</span>
                    <button
                      onClick={runSimulation}
                      disabled={isSimulating}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-label font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-60"
                    >
                      {isSimulating ? 'Đang tô màu…' : 'Mô phỏng ▶'}
                    </button>
                  </div>

                  {revealedCount === 0 ? (
                    <p className="text-label italic text-slate-600">
                      Bấm "Mô phỏng ▶" để xem từng dòng được đối chiếu và tô màu bằng tay.
                    </p>
                  ) : (
                    <table className="w-full text-label">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-slate-600">
                          <th className="py-2 pr-3 font-medium">Ngày</th>
                          <th className="py-2 pr-3 font-medium">Bên chuyển / nhận</th>
                          <th className="py-2 pr-3 font-medium">Nội dung</th>
                          <th className="py-2 pr-3 text-right font-medium">Số tiền</th>
                          <th className="py-2 font-medium">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MANUAL_SHEET_ROWS.slice(0, revealedCount).map((tx) => (
                          <tr key={tx.code} className={`border-b border-slate-100 ${tx.status === 'exception' ? 'bg-amber-50' : ''}`}>
                            <td className="py-2 pr-3 text-slate-700">
                              {tx.date.slice(8, 10)}/{tx.date.slice(5, 7)}
                            </td>
                            <td className="py-2 pr-3 text-slate-700">{tx.counterparty}</td>
                            <td className="py-2 pr-3 text-slate-600">{tx.reference}</td>
                            <td className={`py-2 pr-3 text-right tabular-nums ${tx.amount >= 0 ? 'text-teal-700' : 'text-slate-600'}`}>
                              {tx.amount >= 0 ? '+' : ''}
                              {formatNumberVN(tx.amount)}
                            </td>
                            <td className={`py-2 ${STATUS_STYLE[tx.status]}`}>{STATUS_LABEL[tx.status]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </Card>

                <div className="flex justify-end">
                  <Button onClick={onNext}>Kết nối ngân hàng →</Button>
                </div>
              </div>
            </main>

            <footer className="border-t border-slate-200 px-12 py-3 text-label text-slate-600">{FOOTER_NOTE}</footer>
          </div>
        </SurfaceFrame>
      </div>
    </div>
  )
}
