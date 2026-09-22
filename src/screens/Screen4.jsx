import { useState } from 'react'
import TopBar from '../components/ui/TopBar.jsx'
import ActProgress from '../components/ui/ActProgress.jsx'
import SurfaceFrame from '../components/ui/SurfaceFrame.jsx'
import Card from '../components/ui/Card.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import Stepper from '../components/ui/Stepper.jsx'
import Money from '../components/ui/Money.jsx'
import Drawer from '../components/ui/Drawer.jsx'
import Callout from '../components/ui/Callout.jsx'
import { actForScreen } from '../config/flow.js'
import {
  RECEIVABLE_UNITS,
  MEGA_SALE_UNITS,
  VERIFICATION_METRICS,
  MIN_LOTS_FOR_SCORE,
  LEAK_BATCH_RATE,
  FOOTER_NOTE,
} from '../data/mockData.js'
import { computeVerificationScore, computeLeakAdjustedScore, isScoreAvailable } from '../logic/verification.js'
import { usePermissions } from '../state/permissionState.jsx'
import { useSettlement } from '../state/settlementState.jsx'
import { useScenario } from '../state/scenarioState.jsx'
import { formatNumberVN, formatPercentVN } from '../utils/format.js'

const LIFECYCLE_STEPS = ['Dựng', 'Đã xác thực', 'Đã khóa', 'Tất toán']

const VERIFICATION_CHANNELS = ['Shopee', 'TikTok Shop', 'Hãng vận chuyển A']

const METRIC_ROWS = [
  { key: 'projectionAccuracy', label: 'Độ sát dự phóng', format: formatPercentVN },
  { key: 'volatility', label: 'Độ dao động', format: formatPercentVN },
  { key: 'feeDeviation', label: 'Sai lệch phí', format: formatPercentVN },
  { key: 'leakRate', label: 'Tỷ lệ rò rỉ', format: formatPercentVN },
  { key: 'p90DelayDays', label: 'Độ trễ P90', format: (v) => `${v} ngày` },
]

// Sau khi Techcombank giải ngân, RU-03/RU-04 không còn dùng status tĩnh của mockData —
// settlementState quyết định: đã khóa / đã tất toán / đứt gãy (kịch bản rò rỉ).
function settlementStatusFor(unit, advanceGranted, settlement) {
  if (!advanceGranted) return null
  if (unit.code === 'RU-03') return settlement.ru03Status
  if (unit.code === 'RU-04') return settlement.ru04Status
  return null
}

// Trạng thái chuẩn hóa dùng để chọn nhãn StatusBadge từ src/ui/status.js và bước
// hiện tại trên Stepper vòng đời Dựng → Đã xác thực → Đã khóa → Tất toán. Nhánh
// "Tất toán thiếu"/"Đứt gãy" chỉ hiện khi settlementStatus thực sự bằng giá trị đó.
function lifecycleFor(unit, advanceGranted, settlementStatus) {
  if (settlementStatus === 'broken') return { badge: 'broken', step: 3, broken: true }
  if (settlementStatus === 'settled') return { badge: 'settled', step: 4 }
  if (settlementStatus === 'locked') return { badge: 'locked', step: 3 }
  if (unit.status === 'settled') return { badge: 'settled', step: 4 }
  if (unit.status === 'verified-then-locked') return { badge: 'verified', step: 2 }
  if (unit.status === 'projected-insufficient-history') return { badge: 'insufficient-history', step: 1 }
  if (unit.status === 'reversed') return { badge: 'reversed', step: null }
  return { badge: 'projected', step: 1 }
}

export default function Screen4({ onNext }) {
  const [openChannel, setOpenChannel] = useState(null)
  const { a2a4Granted } = usePermissions()
  const settlement = useSettlement()
  const { megaSale } = useScenario()

  const verifiedUnits = RECEIVABLE_UNITS.filter((u) => u.status === 'verified-then-locked')
  const pendingTotal = verifiedUnits.reduce((sum, u) => sum + u.projectedNetValue, 0)

  return (
    <div className="flex h-full flex-col">
      <TopBar screenNumber={4} />
      <div className="min-h-0 flex-1">
        <SurfaceFrame variant="platform">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 px-12 pb-3 pt-3">
              <ActProgress currentAct={actForScreen(4)} tone="light" />
            </div>

            <main className="flex-1 overflow-y-auto px-12 py-10">
              <div className="mx-auto max-w-[1536px] space-y-6">
                <h1 className="text-screen-title font-bold text-slate-900">Khoản phải thu và điểm xác thực</h1>
                <p className="text-body text-slate-600">
                  Đơn hàng đã giao nhưng sàn chưa thanh toán được gom theo kênh và cửa sổ thanh toán thành đơn vị
                  khoản phải thu.
                </p>

                <div className="grid grid-cols-3 gap-4">
                  {RECEIVABLE_UNITS.map((unit) => {
                    const settlementStatus = settlementStatusFor(unit, a2a4Granted, settlement)
                    const lifecycle = lifecycleFor(unit, a2a4Granted, settlementStatus)
                    const isRU0304 = unit.code === 'RU-03' || unit.code === 'RU-04'
                    const actualReceived = isRU0304
                      ? settlement.getActualReceived(unit.code)
                      : unit.status === 'settled' || unit.status === 'reversed'
                        ? unit.actualReceived
                        : null

                    return (
                      <Card key={unit.code}>
                        <div className="flex items-center justify-between">
                          <div className="text-emphasis font-semibold text-slate-900">{unit.code}</div>
                          <StatusBadge status={lifecycle.badge} />
                        </div>
                        <div className="mt-1 text-label text-slate-500">{unit.channel}</div>
                        <Money value={unit.projectedNetValue} size="section-title" className="mt-2 block text-slate-900" />
                        <div className="mt-1 text-label text-slate-500">Cửa sổ thanh toán: {unit.settlementWindow}</div>
                        {actualReceived != null && (
                          <div className="mt-1 text-label font-medium text-teal-700">
                            Thực nhận: {formatNumberVN(actualReceived)} triệu
                          </div>
                        )}

                        {lifecycle.step != null && (
                          <div className="mt-4 overflow-x-auto">
                            <Stepper steps={LIFECYCLE_STEPS} currentStep={lifecycle.step} />
                          </div>
                        )}

                        {lifecycle.broken && (
                          <Callout variant="danger" className="mt-3">
                            Đứt gãy — sàn chưa thanh toán đúng hạn cho khoản này.
                          </Callout>
                        )}
                      </Card>
                    )
                  })}
                </div>

                {megaSale && (
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-section-title font-semibold text-slate-900">
                      Đơn vị Mega Sale
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {MEGA_SALE_UNITS.map((unit) => (
                        <Card key={unit.code}>
                          <div className="flex items-center justify-between">
                            <div className="text-emphasis font-semibold text-slate-900">{unit.code}</div>
                            <StatusBadge status="verified" />
                          </div>
                          <div className="mt-1 text-label text-slate-500">
                            {unit.channel} · {unit.group}
                          </div>
                          <Money value={unit.projectedNetValue} size="section-title" className="mt-2 block text-slate-900" />
                          <div className="mt-1 text-label text-slate-500">Điểm xác thực: {unit.verificationScore}</div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <Card className="border-teal-200 bg-teal-50">
                  <div className="text-label font-medium text-teal-700">Đang chờ sàn thanh toán</div>
                  <div className="mt-1">
                    <Money value={pendingTotal} size="section-title" className="text-teal-700" />{' '}
                    <span className="text-body font-normal text-teal-700">
                      ({verifiedUnits.length} đơn vị đã xác thực)
                    </span>
                  </div>
                </Card>

                <div>
                  <div className="mb-3 text-section-title font-semibold text-slate-900">Điểm xác thực theo kênh</div>
                  <div className="grid grid-cols-3 gap-4">
                    {VERIFICATION_CHANNELS.map((channel) => {
                      const metrics = VERIFICATION_METRICS[channel]
                      const baseScore = computeVerificationScore(metrics)
                      // Sau khi RU-03 (Shopee) chuyển Đứt gãy, điểm xác thực Shopee chiết khấu
                      // theo tỷ lệ rò rỉ 1/8 lô (docs/du-lieu.md mục 4.3, T10).
                      const score =
                        channel === 'Shopee' && settlement.ru03Status === 'broken'
                          ? computeLeakAdjustedScore(baseScore, LEAK_BATCH_RATE)
                          : baseScore
                      const available = isScoreAvailable(score)
                      return (
                        <button key={channel} onClick={() => setOpenChannel(channel)} className="text-left">
                          <Card className="transition hover:border-slate-300 hover:shadow">
                            <div className="text-emphasis font-semibold text-slate-900">{channel}</div>
                            {available ? (
                              <>
                                <div className="mt-2 text-hero font-bold text-teal-700">{score}</div>
                                <div className="mt-1 text-label text-slate-500">
                                  Cơ sở tính điểm: {metrics.settledLots} lô đã tất toán
                                </div>
                                <div className="mt-1 text-label text-slate-500">Bấm để xem phân rã →</div>
                              </>
                            ) : (
                              <div className="mt-2 text-emphasis font-bold text-slate-500">
                                {score} ({metrics.settledLots}/{MIN_LOTS_FOR_SCORE} lô)
                              </div>
                            )}
                          </Card>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <p className="text-label text-slate-500">
                  Điểm xác thực đo mức độ dự phóng khớp với tiền thật về tài khoản.
                </p>

                <button
                  onClick={onNext}
                  className="w-full rounded-xl bg-navy py-4 text-emphasis font-semibold text-white transition hover:opacity-90"
                >
                  Xem khả năng ứng vốn →
                </button>
              </div>
            </main>

            <footer className="border-t border-slate-200 px-12 py-3 text-label text-slate-500">{FOOTER_NOTE}</footer>
          </div>
        </SurfaceFrame>
      </div>

      <Drawer open={openChannel != null} onClose={() => setOpenChannel(null)} title={openChannel ? `${openChannel} — Phân rã điểm xác thực` : ''}>
        {openChannel && (
          <ScoreBreakdown
            metrics={
              openChannel === 'Shopee' && settlement.ru03Status === 'broken'
                ? { ...VERIFICATION_METRICS[openChannel], leakRate: LEAK_BATCH_RATE }
                : VERIFICATION_METRICS[openChannel]
            }
            score={
              openChannel === 'Shopee' && settlement.ru03Status === 'broken'
                ? computeLeakAdjustedScore(computeVerificationScore(VERIFICATION_METRICS[openChannel]), LEAK_BATCH_RATE)
                : computeVerificationScore(VERIFICATION_METRICS[openChannel])
            }
          />
        )}
      </Drawer>
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
            <span className="text-label text-slate-500">{row.label}</span>
            <span className="text-body font-medium text-slate-900">{row.format(metrics[row.key])}</span>
          </div>
        ))}
      </div>
      <div className="text-label text-slate-500">Cơ sở tính điểm — số lô đã tất toán: {metrics.settledLots}</div>
    </div>
  )
}
