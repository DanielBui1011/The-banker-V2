import { useState } from 'react'
import { ShieldCheck, ChevronRight, Hourglass, Link2 } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import LifecycleTrail from '../components/ui/LifecycleTrail.jsx'
import Money from '../components/ui/Money.jsx'
import Drawer from '../components/ui/Drawer.jsx'
import Callout from '../components/ui/Callout.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Term from '../components/ui/Term.jsx'
import {
  RECEIVABLE_UNITS,
  MEGA_SALE_UNITS,
  VERIFICATION_METRICS,
  MIN_LOTS_FOR_SCORE,
  LEAK_BATCH_RATE,
  PRICING_PARAMS,
  SETTLEMENT_TIMELINE_NORMAL,
  SETTLEMENT_TIMELINE_LEAK,
} from '../data/mockData.js'
import { computeVerificationScore, computeLeakAdjustedScore, computeMatchRate, isScoreAvailable } from '../logic/verification.js'
import { computeAvailableValue } from '../logic/pricing.js'
import { availability, activeUnits, unitStatus, ru03Broke } from '../logic/journey.js'
import { formatNumberVN, formatPercentVN } from '../utils/format.js'
import { useApp } from '../state/appState.jsx'

// Khoản phải thu (Màn 4 cũ, 4 vùng A–D, san-pham.md B.1 Tầng 2). Trạng thái đơn vị đọc
// unitStatus(state, …) theo ngày mô phỏng + sổ khóa; trước 15/09 là trạng thái trống.
const METRIC_ROWS = [
  { key: 'projectionAccuracy', label: 'Độ sát dự phóng', format: formatPercentVN },
  { key: 'volatility', label: 'Độ dao động', format: formatPercentVN },
  { key: 'feeDeviation', label: 'Sai lệch phí', format: formatPercentVN },
  { key: 'leakRate', label: 'Tỷ lệ rò rỉ', format: formatPercentVN },
  { key: 'p90DelayDays', label: 'Độ trễ P90', format: (v) => `${v} ngày` },
]
// Chỉ RU-01 hiện % khớp (duyệt Vòng 17): 98,9% của RU-02 lệch với chỉ số 97,5% của TikTok Shop.
const SHOW_MATCH_RATE = ['RU-01']
const PAID = Object.fromEntries(
  SETTLEMENT_TIMELINE_NORMAL.filter((m) => m.kind === 'marketplace-payment').map((m) => [m.unit, m.marketplaceAmount])
)
const LIFECYCLE = ['verified', 'locked', 'settled']
const BROKEN_DATE = SETTLEMENT_TIMELINE_LEAK.find((m) => m.id === 'leak-broken').date

export default function KhoanPhaiThu() {
  const { state } = useApp()
  const gate = availability(state, 'viewReconciliation')
  if (!gate.ok) {
    return (
      <EmptyState icon={state.consents.A1 === 'none' ? Link2 : Hourglass} gate={gate} title="Chưa có khoản phải thu đã xác thực">
        <p>
          <Term name="Đơn vị khoản phải thu" /> chỉ được xác thực khi kênh bán có đủ {MIN_LOTS_FOR_SCORE}{' '}
          <Term name="Lô tất toán">lô tất toán</Term> — tiền sàn đã về tài khoản
          khớp với dự phóng. {state.consents.A1 === 'none' ? 'Hãy kết nối tài khoản Techcombank trước.' : 'Đang tích lũy lịch sử.'}
        </p>
      </EmptyState>
    )
  }
  return <Receivables />
}

function Receivables() {
  const { state } = useApp()
  const [openChannel, setOpenChannel] = useState(null)
  const peak = state.scenario.peakSeason
  const readyUnits = activeUnits(state)
  const readyTotal = readyUnits.reduce((sum, u) => sum + u.projectedNetValue, 0)
  const settledUnits = RECEIVABLE_UNITS.filter((u) => u.status === 'settled')
  const cod = RECEIVABLE_UNITS.find((u) => u.status === 'projected-insufficient-history')
  const reversed = RECEIVABLE_UNITS.find((u) => u.status === 'reversed')
  const shopeeBroken = ru03Broke(state) // điểm giữ mức sau chiết khấu cả khi đã xử lý (Vòng 29)

  const scoreFor = (channel) => {
    const base = computeVerificationScore(VERIFICATION_METRICS[channel])
    // RU-03 đứt gãy → điểm Shopee chiết khấu theo tỷ lệ rò rỉ 1/8 lô (du-lieu mục 4.3, T10)
    return channel === 'Shopee' && shopeeBroken ? computeLeakAdjustedScore(base, LEAK_BATCH_RATE) : base
  }
  const openMetrics =
    openChannel === 'Shopee' && shopeeBroken ? { ...VERIFICATION_METRICS.Shopee, leakRate: LEAK_BATCH_RATE } : VERIFICATION_METRICS[openChannel]

  return (
    <>
      {/* A — câu dẫn nối với Tổng quan */}
      <p className="text-section-title font-semibold text-ink">
        <Money value={readyTotal} size="section-title" className="text-ink" /> {peak ? 'chờ sàn mùa cao điểm là' : 'đang ở sàn nay là'}{' '}
        {readyUnits.length} đơn vị tài sản <Term name="Đã xác thực">đã xác thực</Term>
      </p>

      {/* B — sẵn sàng làm tài sản bảo đảm */}
      <section>
        <div className="grid grid-cols-2 gap-4">
          {readyUnits.map((unit, i) => (
            <UnitCard key={unit.code} first={i === 0} unit={unit} status={unitStatus(state, unit.code)} peak={peak} accountChange={state.scenario.accountChange} />
          ))}
        </div>
        <div className="mt-2 text-right text-body font-semibold text-ink">
          {readyUnits.map((u) => formatNumberVN(u.projectedNetValue)).join(' + ')} = {formatNumberVN(readyTotal)} triệu
        </div>
        {peak && <PeakCalculation />}
      </section>

      {/* C — vì sao tin được */}
      <Card padding="p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <h2 className="text-emphasis font-semibold text-ink">Vì sao tin được</h2>
          <p className="text-label text-ink-muted">Điểm xác thực đo mức độ dự phóng khớp với tiền thật về tài khoản.</p>
        </div>
        <div className="mt-2 divide-y divide-line">
          {settledUnits.map((unit) => {
            const score = scoreFor(unit.channel)
            return (
              <div key={unit.code} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body text-ink">
                  <span className="font-semibold">{unit.code}</span>
                  <span className="text-ink-muted">{unit.channel}</span>
                  <span>
                    Dự phóng {formatNumberVN(unit.projectedNetValue)} → thực nhận <span className="font-semibold">{formatNumberVN(unit.actualReceived)}</span>
                    {SHOW_MATCH_RATE.includes(unit.code) && ` (khớp ${formatPercentVN(computeMatchRate(unit.projectedNetValue, unit.actualReceived))})`}
                  </span>
                  <StatusBadge status="settled" size="sm" />
                </div>
                <button
                  type="button"
                  onClick={() => setOpenChannel(unit.channel)}
                  className="flex items-center gap-1 rounded-full border border-line bg-app-surface px-4 py-1 text-body font-semibold text-ink transition duration-fast hover:border-primary"
                >
                  Điểm xác thực {unit.channel}: {isScoreAvailable(score) ? score : 'chưa đủ lịch sử'}
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
              </div>
            )
          })}
        </div>
      </Card>

      {/* D — chưa dùng được */}
      <div className="rounded-xl border border-line bg-app-surface px-5 py-3">
        <h2 className="text-label font-semibold text-ink-muted">Chưa dùng được</h2>
        <div className="mt-1 divide-y divide-line text-body text-ink">
          <div className="flex items-center justify-between gap-4 py-2">
            <span>
              <span className="font-semibold">{cod.code}</span> · COD · <Money value={cod.projectedNetValue} size="body" /> · Chưa đủ lịch sử (
              {cod.lots}/{MIN_LOTS_FOR_SCORE} lô)
            </span>
            <StatusBadge status="insufficient-history" size="sm" />
          </div>
          <div className="flex items-center justify-between gap-4 py-2">
            <span>
              <span className="font-semibold">{reversed.code}</span> · {reversed.channel} · Đơn hoàn · <Money value={reversed.actualReceived} size="body" />
            </span>
            <StatusBadge status="reversed" size="sm" />
          </div>
        </div>
      </div>

      <Drawer open={openChannel != null} onClose={() => setOpenChannel(null)} title={openChannel ? `${openChannel} — Phân rã điểm xác thực` : ''}>
        {openChannel && <ScoreBreakdown metrics={openMetrics} score={scoreFor(openChannel)} />}
      </Drawer>
    </>
  )
}

// key={status}: badge và viền thẻ chạy lại hiệu ứng đổi trạng thái (L.2) khi đơn vị đổi trạng thái
// first: thẻ đầu tiên mang chú giải thuật ngữ (lần xuất hiện đầu trên trang, D.4)
function UnitCard({ unit, status, peak, accountChange, first }) {
  const received = status === 'settled' && !(unit.code === 'RU-03' && accountChange) ? PAID[unit.code] : null
  return (
    <Card key={status} padding="p-5" className="animate-ru-card-glow">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-emphasis font-semibold text-ink">{unit.code}</span>
          <span className="text-body text-ink-muted">{unit.channel}</span>
        </div>
        {peak ? (
          <span className="rounded-full border border-line px-3 py-0.5 text-label font-semibold text-ink">Mùa cao điểm</span>
        ) : (
          <StatusBadge status={status} className="animate-ru-badge-fade" />
        )}
      </div>
      <div className="mt-1 flex items-baseline justify-between gap-3">
        <Money value={unit.projectedNetValue} size="section-title" className="text-ink" />
        {unit.settlementWindow && <span className="text-label text-ink-muted">
            {first ? <Term name="Cửa sổ thanh toán" /> : 'Cửa sổ thanh toán'}: {unit.settlementWindow}
          </span>}
      </div>
      {status === 'broken' ? (
        <Callout variant="danger" className="mt-3">
          Đứt gãy — hết cửa sổ thanh toán và thời gian <Term name="Ân hạn">ân hạn</Term> mà tiền không về tài khoản nhận tiền đã
          đăng ký.
        </Callout>
      ) : status === 'repaid-other' ? (
        <p className="mt-3 text-label text-ink-muted">Từng đứt gãy {BROKEN_DATE}</p>
      ) : (
        <LifecycleTrail current={LIFECYCLE.includes(status) ? status : 'verified'} className="mt-3" />
      )}
      {received != null && <div className="mt-2 text-label font-medium text-ink">Thực nhận: {formatNumberVN(received)} triệu</div>}
      {status === 'verified' && (
        <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-body font-semibold text-primary">
          <ShieldCheck size={20} aria-hidden="true" />
          Đủ điều kiện làm tài sản bảo đảm
        </div>
      )}
    </Card>
  )
}

// Mùa cao điểm: tỷ lệ ứng → giá trị theo công thức → bị chặn bởi trần dư nợ (quy-tac mục 4)
function PeakCalculation() {
  const pricing = computeAvailableValue({ units: MEGA_SALE_UNITS, params: PRICING_PARAMS.megaSale, lockedByOthers: 0 })
  const rate = pricing.unitBreakdown[0]?.advanceRate ?? 0
  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-app-surface px-5 py-3 text-body text-ink">
      <span className="font-semibold">
        <Term name="Tỷ lệ ứng" /> {formatPercentVN(rate)}
      </span>
      <span aria-hidden="true">→</span>
      <Money value={pricing.formulaValueTotal} size="emphasis" />
      <span aria-hidden="true">→</span>
      <span className="font-semibold">
        Bị chặn bởi <Term name="Trần dư nợ">trần dư nợ</Term>: <Money value={pricing.result} size="emphasis" />
      </span>
    </div>
  )
}

function ScoreBreakdown({ metrics, score }) {
  if (!isScoreAvailable(score)) {
    return (
      <Callout variant="info">
        Chưa đủ lịch sử — đã có {metrics.settledLots}/{MIN_LOTS_FOR_SCORE} lô tất toán.
      </Callout>
    )
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border border-line bg-app-bg p-4">
        <span className="text-body text-ink">Điểm xác thực</span>
        <span className="text-hero font-bold text-ink">{score}</span>
      </div>
      <div className="rounded-lg border border-line">
        {METRIC_ROWS.map((row) => (
          <div key={row.key} className="flex items-center justify-between border-b border-line px-4 py-3 last:border-0">
            <span className="text-label text-ink-muted">{row.label}</span>
            <span className="text-body font-medium text-ink">{row.format(metrics[row.key])}</span>
          </div>
        ))}
      </div>
      <div className="text-label text-ink-muted">Cơ sở tính điểm — số lô đã tất toán: {metrics.settledLots}</div>
    </div>
  )
}
