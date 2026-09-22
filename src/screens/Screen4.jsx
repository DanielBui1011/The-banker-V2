import { useState } from 'react'
import ScreenShell from '../components/ScreenShell.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { RECEIVABLE_UNITS, VERIFICATION_METRICS, MIN_LOTS_FOR_SCORE, LEAK_BATCH_RATE } from '../data/mockData.js'
import { computeVerificationScore, computeLeakAdjustedScore, isScoreAvailable } from '../logic/verification.js'
import { usePermissions } from '../state/permissionState.jsx'
import { useSettlement } from '../state/settlementState.jsx'
import { formatNumberVN, formatPercentVN } from '../utils/format.js'

// 'verified-then-locked' bắt đầu là "Đã xác thực" (gray); sau khi qua Màn 5 bước 5d
// (Techcombank giải ngân, quyền A4 có hiệu lực) chuyển "Đã khóa" (purple).
const STATUS_LABEL = {
  settled: 'Đã tất toán',
  'verified-then-locked': (unit, advanceGranted) => (advanceGranted ? 'Đã khóa' : 'Đã xác thực'),
  'projected-insufficient-history': (unit) =>
    `Dự phóng — chưa đủ lịch sử (${unit.lots}/${MIN_LOTS_FOR_SCORE} lô)`,
  reversed: 'Đã hoàn',
}

const VERIFICATION_CHANNELS = ['Shopee', 'TikTok Shop', 'Hãng vận chuyển A']

const METRIC_ROWS = [
  { key: 'projectionAccuracy', label: 'Độ sát dự phóng', format: formatPercentVN },
  { key: 'volatility', label: 'Độ dao động', format: formatPercentVN },
  { key: 'feeDeviation', label: 'Sai lệch phí', format: formatPercentVN },
  { key: 'leakRate', label: 'Tỷ lệ rò rỉ', format: formatPercentVN },
  { key: 'p90DelayDays', label: 'Độ trễ P90', format: (v) => `${v} ngày` },
]

// Sau khi Techcombank giải ngân, RU-03/RU-04 không còn dùng status tĩnh của mockData —
// Màn 6 (settlementState) quyết định: đã khóa / đã tất toán / đứt gãy (kịch bản rò rỉ).
const SETTLEMENT_TONE = { locked: 'tier2', settled: 'tier1', broken: 'broken' }
const SETTLEMENT_LABEL = { locked: 'Đã khóa', settled: 'Đã tất toán', broken: 'Đứt gãy' }

function settlementStatusFor(unit, advanceGranted, settlement) {
  if (!advanceGranted) return null
  if (unit.code === 'RU-03') return settlement.ru03Status
  if (unit.code === 'RU-04') return settlement.ru04Status
  return null
}

function statusLabelFor(unit, advanceGranted, settlementStatus) {
  if (settlementStatus) return SETTLEMENT_LABEL[settlementStatus]
  const entry = STATUS_LABEL[unit.status]
  return typeof entry === 'function' ? entry(unit, advanceGranted) : entry
}

function statusToneFor(unit, advanceGranted, settlementStatus) {
  if (settlementStatus) return SETTLEMENT_TONE[settlementStatus]
  if (unit.status === 'verified-then-locked' && advanceGranted) return unit.lockedColor
  return unit.statusColor
}

export default function Screen4({ onNext }) {
  const [openChannel, setOpenChannel] = useState(null)
  const { a2a4Granted } = usePermissions()
  const settlement = useSettlement()

  const verifiedUnits = RECEIVABLE_UNITS.filter((u) => u.status === 'verified-then-locked')
  const pendingTotal = verifiedUnits.reduce((sum, u) => sum + u.projectedNetValue, 0)

  return (
    <ScreenShell screenNumber={4} title="Khoản phải thu và điểm xác thực">
      <div className="space-y-6">
        <p className="text-lg text-slate-400">
          Đơn hàng đã giao nhưng sàn chưa thanh toán được gom theo kênh và cửa sổ thanh toán thành đơn vị khoản
          phải thu.
        </p>

        {/* 6 thẻ đơn vị khoản phải thu — docs/du-lieu.md mục 6 */}
        <div className="grid grid-cols-3 gap-4">
          {RECEIVABLE_UNITS.map((unit) => {
            const settlementStatus = settlementStatusFor(unit, a2a4Granted, settlement)
            const isRU0304 = unit.code === 'RU-03' || unit.code === 'RU-04'
            const actualReceived = isRU0304
              ? settlement.getActualReceived(unit.code)
              : unit.status === 'settled'
                ? unit.actualReceived
                : null

            return (
              <div key={unit.code} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-semibold text-white">{unit.code}</div>
                  <StatusBadge tone={statusToneFor(unit, a2a4Granted, settlementStatus)}>
                    {statusLabelFor(unit, a2a4Granted, settlementStatus)}
                  </StatusBadge>
                </div>
                <div className="mt-1 text-base text-slate-400">{unit.channel}</div>
                <div className="mt-2 text-2xl font-bold text-slate-100">{formatNumberVN(unit.projectedNetValue)} triệu</div>
                <div className="mt-1 text-base text-slate-500">Cửa sổ thanh toán: {unit.settlementWindow}</div>
                {actualReceived != null && (
                  <div className="mt-1 text-base text-teal-400">Thực nhận: {formatNumberVN(actualReceived)} triệu</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Dòng tổng — tính từ các đơn vị Đã xác thực, không viết cứng */}
        <div className="rounded-xl border border-teal-800/60 bg-teal-950/20 p-5">
          <div className="text-base text-teal-300">Đang chờ sàn thanh toán</div>
          <div className="mt-1 text-3xl font-bold text-teal-200">
            {formatNumberVN(pendingTotal)} triệu{' '}
            <span className="text-lg font-normal text-teal-300">
              ({verifiedUnits.length} đơn vị đã xác thực)
            </span>
          </div>
        </div>

        {/* 3 thẻ điểm xác thực theo kênh — docs/du-lieu.md mục 7 */}
        <div>
          <div className="mb-3 text-xl font-semibold text-slate-200">Điểm xác thực theo kênh</div>
          <div className="grid grid-cols-3 gap-4">
            {VERIFICATION_CHANNELS.map((channel) => {
              const metrics = VERIFICATION_METRICS[channel]
              const baseScore = computeVerificationScore(metrics)
              // Sau khi RU-03 (Shopee) chuyển Đứt gãy trong Màn 6/9, điểm xác thực Shopee
              // chiết khấu theo tỷ lệ rò rỉ 1/8 lô (docs/du-lieu.md mục 4.3, T10).
              const score =
                channel === 'Shopee' && settlement.ru03Status === 'broken'
                  ? computeLeakAdjustedScore(baseScore, LEAK_BATCH_RATE)
                  : baseScore
              const available = isScoreAvailable(score)
              return (
                <button
                  key={channel}
                  onClick={() => setOpenChannel(channel)}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-left transition hover:border-slate-600 hover:bg-slate-900"
                >
                  <div className="text-lg font-semibold text-slate-100">{channel}</div>
                  {available ? (
                    <>
                      <div className="mt-2 text-4xl font-bold text-teal-300">{score}</div>
                      <div className="mt-2 text-base text-slate-500">Bấm để xem phân rã →</div>
                    </>
                  ) : (
                    <div className="mt-2 text-xl font-bold text-slate-400">
                      {score} ({metrics.settledLots}/{MIN_LOTS_FOR_SCORE} lô)
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <p className="text-base text-slate-500">
          Điểm xác thực đo mức độ dự phóng khớp với tiền thật về tài khoản.
        </p>

        <button
          onClick={onNext}
          className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white transition hover:bg-blue-500"
        >
          Xem khả năng ứng vốn →
        </button>
      </div>

      {openChannel && (
        <ScoreBreakdownModal
          channel={openChannel}
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
          onClose={() => setOpenChannel(null)}
        />
      )}
    </ScreenShell>
  )
}

function ScoreBreakdownModal({ channel, metrics, score, onClose }) {
  const available = isScoreAvailable(score)

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-6">
      <div className="w-full max-w-xl rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-100">{channel} — Phân rã điểm xác thực</h2>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-base text-slate-300 hover:bg-slate-800"
          >
            Đóng
          </button>
        </div>

        {available ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-teal-800/60 bg-teal-950/20 p-4">
              <span className="text-lg text-teal-300">Điểm xác thực</span>
              <span className="text-3xl font-bold text-teal-200">{score}</span>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/40">
              {METRIC_ROWS.map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between border-b border-slate-800/60 px-4 py-3 last:border-0"
                >
                  <span className="text-base text-slate-400">{row.label}</span>
                  <span className="text-lg font-medium text-slate-100">{row.format(metrics[row.key])}</span>
                </div>
              ))}
            </div>
            <div className="text-base text-slate-500">Số lô đã tất toán: {metrics.settledLots}</div>
          </div>
        ) : (
          <div className="rounded-lg border border-amber-700/60 bg-amber-950/20 p-4 text-lg text-amber-200">
            Chưa đủ lịch sử — đã có {metrics.settledLots}/{MIN_LOTS_FOR_SCORE} lô tất toán. Cần thêm lô tất toán
            để hệ thống tính điểm xác thực.
          </div>
        )}
      </div>
    </div>
  )
}
