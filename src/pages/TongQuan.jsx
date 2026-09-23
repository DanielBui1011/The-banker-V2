import { useState } from 'react'
import { Landmark, CalendarCheck } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import Money from '../components/ui/Money.jsx'
import Stat from '../components/ui/Stat.jsx'
import Drawer from '../components/ui/Drawer.jsx'
import Callout from '../components/ui/Callout.jsx'
import Button from '../components/ui/Button.jsx'
import DoneCheck from '../components/ui/DoneCheck.jsx'
import {
  SALES_CHANNELS,
  ESCROW_STUCK,
  SELLER_PROFILE,
  TOTAL_MONTHLY_REVENUE,
  TOTAL_MARKETPLACE_REVENUE,
  AIS_OTHER_BANKS,
  VERIFICATION_METRICS,
  MIN_LOTS_FOR_SCORE,
  BANK_TRANSACTIONS,
} from '../data/mockData.js'
import { computeEscrowStuck } from '../logic/pricing.js'
import { ROUTES, events } from '../logic/journey.js'
import { go } from '../utils/route.js'
import { formatNumberVN } from '../utils/format.js'
import { useApp } from '../state/appState.jsx'

// Tổng quan (san-pham.md B.1, I: gộp Màn 1 + chọn ngân hàng 2a). Trước kết nối: hồ sơ
// nhà bán + nút Kết nối Techcombank (drawer chọn ngân hàng). Sau kết nối: tài khoản đã
// kết nối, số lô theo ngày mô phỏng; từ 15/09 thêm thẻ tóm tắt "6 tuần sau".
const MARKETPLACE_CHANNELS = new Set(['Shopee', 'TikTok Shop'])

export default function TongQuan() {
  const { state } = useApp()
  const [pickerOpen, setPickerOpen] = useState(false)
  const escrow = state.scenario.peakSeason ? ESCROW_STUCK.megaSale : ESCROW_STUCK.normal
  const connected = state.consents.A1 !== 'none'

  return (
    <>
      {state.eventIndex >= 1 && <SixWeeksSummary />}

      <div className="grid grid-cols-5 gap-5">
        <Card padding="p-6" className="col-span-3">
          <div className="text-label font-medium text-ink-muted">Tiền đang chờ sàn thanh toán</div>
          <Money value={computeEscrowStuck(escrow.marketplaceRevenue, escrow.averageHoldDays)} size="hero" className="mt-1 block text-ink" />
          <p className="mt-2 text-body text-ink-muted">
            = doanh thu sàn {formatNumberVN(escrow.marketplaceRevenue)} triệu / 30 × {escrow.averageHoldDays} ngày giữ tiền bình quân
          </p>
          <div className="mt-4 grid grid-cols-2 divide-x divide-line border-t border-line pt-4">
            <Stat label="Đối soát thủ công" value={`${formatNumberVN(SELLER_PROFILE.monthlyManualReconciliationHours)} giờ/tháng`} className="pr-4" />
            <Stat label="Lựa chọn vốn hiện tại" value={SELLER_PROFILE.currentFundingOption} className="pl-4" />
          </div>
        </Card>

        <Card padding="p-6" className="col-span-2 flex flex-col">
          {connected ? <ConnectedAccount /> : <ConnectPrompt onConnect={() => setPickerOpen(true)} />}
        </Card>
      </div>

      <RevenueMix />

      <Drawer open={pickerOpen} onClose={() => setPickerOpen(false)} title="Chọn ngân hàng nhận tiền">
        <BankPicker />
      </Drawer>
    </>
  )
}

function ConnectPrompt({ onConnect }) {
  return (
    <>
      <Landmark size={28} className="text-primary" aria-hidden="true" />
      <h2 className="mt-3 text-section-title font-semibold text-ink">Chưa kết nối ngân hàng nhận tiền</h2>
      <p className="mt-2 text-body text-ink-muted">
        Kết nối tài khoản Techcombank để app tự đối soát tiền sàn về với đơn hàng. Bạn cấp quyền trên trang của Techcombank.
      </p>
      <div className="mt-auto pt-5">
        <Button onClick={onConnect}>Kết nối Techcombank</Button>
      </div>
    </>
  )
}

function ConnectedAccount() {
  const { state } = useApp()
  const revoked = state.consents.A1 === 'revoked'
  return (
    <>
      <div className="flex items-center gap-3 text-primary">
        {revoked ? <Landmark size={28} aria-hidden="true" /> : <DoneCheck />}
        <h2 className="text-section-title font-semibold text-ink">{revoked ? 'Quyền đối soát A1 đã rút' : 'Đã kết nối'}</h2>
      </div>
      <p className="mt-2 text-body text-ink">{SELLER_PROFILE.paymentAccount}</p>
      <div className="mt-4 border-t border-line pt-4">
        <div className="text-label font-medium text-ink-muted">
          Lô tất toán đã theo dõi (cần {MIN_LOTS_FOR_SCORE} lô mỗi kênh để có điểm xác thực)
        </div>
        <ul className="mt-2 space-y-1 text-body">
          {Object.entries(VERIFICATION_METRICS).map(([channel, m]) => (
            <li key={channel} className="flex justify-between gap-4">
              <span>{channel}</span>
              <span className="font-semibold tabular-nums">
                {state.eventIndex >= 1 ? m.settledLots : 0}/{MIN_LOTS_FOR_SCORE} lô
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

// Thẻ tóm tắt sau khi tua 01/08 → 15/09 (san-pham.md E hệ quả 1, hanh-trinh 1.7).
// Số tuần, số lô, số giao dịch và khoảng ngày đều tính từ dữ liệu.
const ddmm = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`
const TX_DATES = BANK_TRANSACTIONS.map((t) => t.date).sort()

export function SixWeeksSummary({ onClose }) {
  const { state } = useApp()
  const [e0, e1] = events(state)
  const weeks = Math.floor((new Date(e1.date) - new Date(e0.date)) / (7 * 24 * 3600 * 1000))
  const lots = Object.entries(VERIFICATION_METRICS)
    .map(([channel, m]) => `${channel} ${m.settledLots} lô`)
    .join(', ')
  return (
    <Card padding="p-5" className="flex items-start gap-4 border-primary">
      <CalendarCheck size={28} className="flex-shrink-0 text-primary" aria-hidden="true" />
      <div className="flex-1">
        <h2 className="text-emphasis font-semibold text-ink">{weeks} tuần sau</h2>
        <p className="mt-1 text-body text-ink">
          {lots}; {BANK_TRANSACTIONS.length} giao dịch {ddmm(TX_DATES[0]).slice(0, 2)}–{ddmm(TX_DATES[TX_DATES.length - 1])} đã đối soát.
        </p>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-line px-3 py-1.5 text-label font-medium text-ink transition duration-fast hover:bg-app-bg"
        >
          Đã hiểu
        </button>
      )}
    </Card>
  )
}

function RevenueMix() {
  return (
    <Card padding="p-6">
      <div className="flex items-baseline justify-between">
        <div className="text-label font-medium text-ink-muted">Doanh thu tháng theo kênh</div>
        <div className="text-body text-ink">
          Qua sàn <span className="font-semibold">{formatNumberVN(TOTAL_MARKETPLACE_REVENUE)} triệu</span> trên tổng{' '}
          <Money value={TOTAL_MONTHLY_REVENUE} size="body" className="font-semibold" />
        </div>
      </div>
      <div className="mt-3 flex h-14 w-full overflow-hidden rounded-lg" role="img" aria-label="Cơ cấu doanh thu theo kênh">
        {SALES_CHANNELS.map((c) => {
          const marketplace = MARKETPLACE_CHANNELS.has(c.channel)
          return (
            <div
              key={c.channel}
              style={{ width: `${(c.monthlyRevenue / TOTAL_MONTHLY_REVENUE) * 100}%` }}
              className={`flex flex-col items-center justify-center overflow-hidden px-1 text-center leading-tight ${
                marketplace ? 'bg-primary text-white' : 'bg-line text-ink'
              }`}
            >
              <span className="w-full truncate text-label font-semibold">{c.channel}</span>
              <span className="w-full truncate text-label">{formatNumberVN(c.monthlyRevenue)} triệu</span>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// Drawer chọn ngân hàng nhận tiền (Màn 2a cũ): chỉ ngân hàng có tài khoản thanh toán
// (không có công ty tài chính). Ngân hàng khác kết nối được nhưng demo đi theo Techcombank.
function BankPicker() {
  const [noted, setNoted] = useState(null)
  return (
    <div className="space-y-3">
      <p className="text-body text-ink-muted">Chọn ngân hàng nơi bạn nhận tiền sàn để cấp quyền đối soát (A1).</p>
      <button type="button" onClick={() => go(ROUTES.a1)} className="block w-full rounded-xl border-2 border-primary bg-primary-soft p-4 text-left transition duration-fast hover:bg-app-surface">
        <div className="text-emphasis font-semibold text-ink">Techcombank</div>
        <div className="mt-1 text-label text-ink-muted">Tài khoản nhận tiền sàn của {SELLER_PROFILE.ownerName.replace(/^Chị/, 'chị')}</div>
      </button>
      {AIS_OTHER_BANKS.map((name) => (
        <button key={name} type="button" onClick={() => setNoted(name)} className="block w-full rounded-xl border border-line bg-app-surface p-4 text-left transition duration-fast hover:bg-app-bg">
          <div className="text-emphasis font-semibold text-ink">{name}</div>
          <div className="mt-1 text-label text-ink-muted">Hỗ trợ kết nối qua Open API</div>
        </button>
      ))}
      {noted && (
        <Callout variant="info">
          Tiền sàn của {SELLER_PROFILE.ownerName.replace(/^Chị/, 'chị')} về Techcombank — mô phỏng đi theo tài khoản này, không theo {noted}.
        </Callout>
      )}
    </div>
  )
}
