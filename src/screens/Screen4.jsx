import { useMemo, useState } from 'react'
import { ShieldCheck, ChevronRight } from 'lucide-react'
import TopBar from '../components/ui/TopBar.jsx'
import ActProgress from '../components/ui/ActProgress.jsx'
import SurfaceFrame from '../components/ui/SurfaceFrame.jsx'
import Card from '../components/ui/Card.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import LifecycleTrail from '../components/ui/LifecycleTrail.jsx'
import Money from '../components/ui/Money.jsx'
import Drawer from '../components/ui/Drawer.jsx'
import Callout from '../components/ui/Callout.jsx'
import Button from '../components/ui/Button.jsx'
import { actForScreen } from '../config/flow.js'
import {
  RECEIVABLE_UNITS,
  MEGA_SALE_UNITS,
  VERIFICATION_METRICS,
  MIN_LOTS_FOR_SCORE,
  LEAK_BATCH_RATE,
  FOOTER_NOTE,
  PRICING_PARAMS,
} from '../data/mockData.js'
import { computeVerificationScore, computeLeakAdjustedScore, computeMatchRate, isScoreAvailable } from '../logic/verification.js'
import { computeAvailableValue } from '../logic/pricing.js'
import { useSettlement } from '../state/settlementState.jsx'
import { useScenario } from '../state/scenarioState.jsx'
import { formatNumberVN, formatPercentVN } from '../utils/format.js'

const METRIC_ROWS = [
  { key: 'projectionAccuracy', label: 'Độ sát dự phóng', format: formatPercentVN },
  { key: 'volatility', label: 'Độ dao động', format: formatPercentVN },
  { key: 'feeDeviation', label: 'Sai lệch phí', format: formatPercentVN },
  { key: 'leakRate', label: 'Tỷ lệ rò rỉ', format: formatPercentVN },
  { key: 'p90DelayDays', label: 'Độ trễ P90', format: (v) => `${v} ngày` },
]

// Chỉ RU-01 hiện phần trăm khớp trên dòng "Vì sao tin được" (duyệt Vòng 17): RU-02 chỉ
// ghi "35 → 34,6" vì 98,9% sẽ lệch với điểm chỉ số 97,5% của TikTok Shop.
const SHOW_MATCH_RATE = ['RU-01']

// Sau khi Techcombank giải ngân, RU-03/RU-04 không còn dùng status tĩnh của mockData —
// settlementState quyết định: đã khóa / đã tất toán / đứt gãy (kịch bản rò rỉ). Gate bằng
// locksInitialized (nguồn sự thật của chính settlementState) chứ không phải a2a4Granted,
// vì hai cờ này ở hai provider khác nhau và có thể lệch pha nếu chỉ reset một bên.
function settlementStatusFor(unit, settlement) {
  if (!settlement.locksInitialized) return null
  if (unit.code === 'RU-03') return settlement.ru03Status
  if (unit.code === 'RU-04') return settlement.ru04Status
  return null
}

// Bước vòng đời hiện tại của đơn vị vùng B ('broken' là nhánh rủi ro, ngoài vệt 4 bước).
function stepFor(settlementStatus) {
  if (settlementStatus === 'broken' || settlementStatus === 'settled' || settlementStatus === 'locked') return settlementStatus
  return 'verified'
}

export default function Screen4({ onNext }) {
  const [openChannel, setOpenChannel] = useState(null)
  const settlement = useSettlement()
  const { megaSale } = useScenario()

  // Vùng B: kỳ thường là RU-03/RU-04; bật Mega Sale thì RU-M1/RU-M2 thay vào (mockData mục 6).
  const readyUnits = megaSale ? MEGA_SALE_UNITS : RECEIVABLE_UNITS.filter((u) => u.status === 'verified-then-locked')
  const readyTotal = readyUnits.reduce((sum, u) => sum + u.projectedNetValue, 0)

  const settledUnits = RECEIVABLE_UNITS.filter((u) => u.status === 'settled')
  const cod = RECEIVABLE_UNITS.find((u) => u.status === 'projected-insufficient-history')
  const reversed = RECEIVABLE_UNITS.find((u) => u.status === 'reversed')

  const scoreFor = (channel) => {
    const base = computeVerificationScore(VERIFICATION_METRICS[channel])
    // Sau khi RU-03 (Shopee) chuyển Đứt gãy, điểm Shopee chiết khấu theo tỷ lệ rò rỉ 1/8 lô
    // (docs/du-lieu.md mục 4.3, T10).
    return channel === 'Shopee' && settlement.ru03Status === 'broken' ? computeLeakAdjustedScore(base, LEAK_BATCH_RATE) : base
  }
  const openMetrics =
    openChannel === 'Shopee' && settlement.ru03Status === 'broken'
      ? { ...VERIFICATION_METRICS[openChannel], leakRate: LEAK_BATCH_RATE }
      : VERIFICATION_METRICS[openChannel]

  return (
    <div className="flex h-full flex-col">
      <TopBar screenNumber={4} />
      <div className="min-h-0 flex-1">
        <SurfaceFrame variant="platform">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 px-12 pb-3 pt-3">
              <ActProgress currentAct={actForScreen(4)} tone="light" />
            </div>

            <main className="flex-1 overflow-y-auto px-12 pt-4 pb-6">
              <div className="mx-auto max-w-[1536px] space-y-4">
                {/* A — câu dẫn nối với màn đầu */}
                <section>
                  <h1 className="text-screen-title font-bold text-slate-900">
                    {megaSale ? 'Mega Sale: ' : ''}
                    <Money value={readyTotal} size="screen-title" className="text-slate-900" />{' '}
                    {megaSale ? 'chờ sàn là' : 'đang kẹt ở sàn nay là'} {readyUnits.length} đơn vị {megaSale ? '' : 'tài sản '}đã xác thực
                  </h1>
                  <p className="mt-1 text-body text-slate-600">
                    Đơn vị khoản phải thu = đơn hàng đã giao, sàn chưa trả, gom theo kênh và cửa sổ thanh toán.
                  </p>
                </section>

                {/* B — sẵn sàng làm tài sản bảo đảm */}
                <section>
                  <h2 className="mb-2 text-emphasis font-semibold text-slate-900">Sẵn sàng làm tài sản bảo đảm</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {readyUnits.map((unit) => {
                      const settlementStatus = megaSale ? null : settlementStatusFor(unit, settlement)
                      const step = stepFor(settlementStatus)
                      const actualReceived = megaSale ? null : settlement.getActualReceived(unit.code)
                      return (
                        <Card key={unit.code} padding="p-5" className="!border-slate-700 ring-1 ring-slate-300">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-baseline gap-2">
                              <span className="text-emphasis font-semibold text-slate-900">{unit.code}</span>
                              <span className="text-body text-slate-600">{unit.channel}</span>
                            </div>
                            {megaSale && (
                              <span className="rounded-full border border-slate-700 bg-slate-100 px-3 py-0.5 text-label font-semibold text-slate-800">
                                Mega Sale
                              </span>
                            )}
                            {step === 'broken' && <StatusBadge status="broken" />}
                          </div>
                          <div className="mt-1 flex items-baseline justify-between gap-3">
                            <Money value={unit.projectedNetValue} size="section-title" className="text-slate-900" />
                            {unit.settlementWindow && (
                              <span className="text-label text-slate-600">Cửa sổ thanh toán: {unit.settlementWindow}</span>
                            )}
                          </div>
                          {step === 'broken' ? (
                            <Callout variant="danger" className="mt-3">
                              Đứt gãy — sàn chưa thanh toán đúng hạn cho khoản này.
                            </Callout>
                          ) : (
                            <LifecycleTrail current={step} className="mt-3" />
                          )}
                          {actualReceived != null && (
                            <div className="mt-2 text-label font-medium text-teal-700">
                              Thực nhận: {formatNumberVN(actualReceived)} triệu
                            </div>
                          )}
                          {step === 'verified' && (
                            <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3 text-body font-semibold text-navy">
                              <ShieldCheck size={20} aria-hidden="true" />
                              Đủ điều kiện ứng vốn
                            </div>
                          )}
                        </Card>
                      )
                    })}
                  </div>
                  <div className="mt-3 text-right text-emphasis font-semibold text-slate-900">
                    {readyUnits.map((u) => formatNumberVN(u.projectedNetValue)).join(' + ')} = {formatNumberVN(readyTotal)} triệu
                  </div>
                  {megaSale && <MegaSaleCalculation />}
                </section>

                {/* C — vì sao tin được (nơi duy nhất nói về điểm xác thực) */}
                <section>
                  <Card padding="p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                      <h2 className="text-emphasis font-semibold text-slate-900">Vì sao tin được</h2>
                      <p className="text-label text-slate-600">Điểm xác thực đo mức độ dự phóng khớp với tiền thật về tài khoản.</p>
                    </div>
                    <div className="mt-2 divide-y divide-slate-200">
                      {settledUnits.map((unit) => {
                        const score = scoreFor(unit.channel)
                        return (
                          <div key={unit.code} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-body text-slate-900">
                              <span className="font-semibold">{unit.code}</span>
                              <span className="text-slate-600">{unit.channel}</span>
                              <span>
                                Dự phóng {formatNumberVN(unit.projectedNetValue)} → thực nhận{' '}
                                <span className="font-semibold">{formatNumberVN(unit.actualReceived)}</span>
                                {SHOW_MATCH_RATE.includes(unit.code) &&
                                  ` (khớp ${formatPercentVN(computeMatchRate(unit.projectedNetValue, unit.actualReceived))})`}
                              </span>
                              <StatusBadge status="settled" size="sm" />
                            </div>
                            <button
                              onClick={() => setOpenChannel(unit.channel)}
                              className="flex items-center gap-1 rounded-full border border-slate-400 bg-white px-4 py-1 text-body font-semibold text-slate-900 transition hover:border-slate-700"
                            >
                              Điểm xác thực {unit.channel}: {isScoreAvailable(score) ? score : 'chưa đủ lịch sử'}
                              <ChevronRight size={18} aria-hidden="true" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                </section>

                {/* D — chưa dùng được */}
                <section>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-3">
                    <h2 className="text-label font-semibold text-slate-700">Chưa dùng được</h2>
                    <div className="mt-1 divide-y divide-slate-200 text-body text-slate-700">
                      <div className="flex items-center justify-between gap-4 py-2">
                        <span>
                          <span className="font-semibold">{cod.code}</span> · COD · <Money value={cod.projectedNetValue} size="body" /> · Chưa
                          đủ lịch sử ({cod.lots}/{MIN_LOTS_FOR_SCORE} lô)
                        </span>
                        <StatusBadge status="insufficient-history" size="sm" />
                      </div>
                      <div className="flex items-center justify-between gap-4 py-2">
                        <span>
                          <span className="font-semibold">{reversed.code}</span> · {reversed.channel} · Đơn hoàn ·{' '}
                          <Money value={reversed.actualReceived} size="body" />
                        </span>
                        <StatusBadge status="reversed" size="sm" />
                      </div>
                    </div>
                  </div>
                </section>

                <div className="flex justify-end">
                  <Button onClick={onNext}>Xem khả năng ứng vốn →</Button>
                </div>
              </div>
            </main>

            <footer className="border-t border-slate-200 px-12 py-3 text-label text-slate-600">{FOOTER_NOTE}</footer>
          </div>
        </SurfaceFrame>
      </div>

      <Drawer open={openChannel != null} onClose={() => setOpenChannel(null)} title={openChannel ? `${openChannel} — Phân rã điểm xác thực` : ''}>
        {openChannel && <ScoreBreakdown metrics={openMetrics} score={scoreFor(openChannel)} />}
      </Drawer>
    </div>
  )
}

// Phép tính Mega Sale hiển thị như một chuỗi: tỷ lệ ứng → giá trị theo công
// thức → giá trị bị chặn bởi trần dư nợ (yêu cầu Vòng 10: "phần thay đổi phải
// thấy ngay"). Tính từ src/logic/pricing.js, không viết cứng số liệu.
function MegaSaleCalculation() {
  const pricing = useMemo(
    () => computeAvailableValue({ units: MEGA_SALE_UNITS, params: PRICING_PARAMS.megaSale, lockedByOthers: 0 }),
    []
  )
  const rate = pricing.unitBreakdown[0]?.advanceRate ?? 0

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-5 py-3 text-body">
      <span className="font-semibold text-slate-900">{formatPercentVN(rate)}</span>
      <span className="text-slate-600">→</span>
      <Money value={pricing.formulaValueTotal} size="emphasis" className="text-slate-900" />
      <span className="text-slate-600">→</span>
      <span className="font-semibold text-amber-700">
        bị chặn bởi trần dư nợ <Money value={pricing.result} size="emphasis" className="text-amber-700" />
      </span>
    </div>
  )
}

function ScoreBreakdown({ metrics, score }) {
  const available = isScoreAvailable(score)

  if (!available) {
    return (
      <Callout variant="warn">
        Chưa đủ lịch sử — đã có {metrics.settledLots}/{MIN_LOTS_FOR_SCORE} lô tất toán. Cần thêm lô tất toán để hệ
        thống tính điểm xác thực.
      </Callout>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg border border-teal-200 bg-teal-50 p-4">
        <span className="text-body text-teal-700">Điểm xác thực</span>
        <span className="text-hero font-bold text-teal-700">{score}</span>
      </div>
      <div className="rounded-lg border border-slate-200">
        {METRIC_ROWS.map((row) => (
          <div key={row.key} className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-0">
            <span className="text-label text-slate-600">{row.label}</span>
            <span className="text-body font-medium text-slate-900">{row.format(metrics[row.key])}</span>
          </div>
        ))}
      </div>
      <div className="text-label text-slate-600">Cơ sở tính điểm — số lô đã tất toán: {metrics.settledLots}</div>
    </div>
  )
}
