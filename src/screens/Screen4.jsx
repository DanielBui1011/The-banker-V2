import { useState } from 'react'
import ScreenShell from '../components/ScreenShell.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { RECEIVABLE_UNITS, VERIFICATION_METRICS, MIN_LOTS_FOR_SCORE } from '../data/mockData.js'
import { computeVerificationScore, isScoreAvailable } from '../logic/verification.js'
import { formatMillion, formatNumberVN } from '../utils/format.js'

const STATUS_LABEL = {
  settled: 'Đã tất toán',
  'verified-then-locked': 'Đã xác thực',
  'projected-insufficient-history': (unit) =>
    `Dự phóng — chưa đủ lịch sử (${unit.lots}/${MIN_LOTS_FOR_SCORE} lô)`,
  reversed: 'Đã hoàn',
}

const VERIFICATION_CHANNELS = ['Shopee', 'TikTok Shop', 'Hãng vận chuyển A']

const METRIC_ROWS = [
  { key: 'projectionAccuracy', label: 'Độ sát dự phóng', format: (v) => `${formatNumberVN(v * 100)}%` },
  { key: 'volatility', label: 'Độ dao động', format: (v) => `${formatNumberVN(v * 100)}%` },
  { key: 'feeDeviation', label: 'Sai lệch phí', format: (v) => `${formatNumberVN(v * 100)}%` },
  { key: 'leakRate', label: 'Tỷ lệ rò rỉ', format: (v) => `${formatNumberVN(v * 100)}%` },
  { key: 'p90DelayDays', label: 'Độ trễ P90', format: (v) => `${v} ngày` },
]

function statusLabelFor(unit) {
  const entry = STATUS_LABEL[unit.status]
  return typeof entry === 'function' ? entry(unit) : entry
}

export default function Screen4({ onNext }) {
  const [openChannel, setOpenChannel] = useState(null)

  const verifiedUnits = RECEIVABLE_UNITS.filter((u) => u.status === 'verified-then-locked')
  const pendingTotal = verifiedUnits.reduce((sum, u) => sum + u.projectedNetValue, 0)

  return (
    <ScreenShell screenNumber={4} title="Khoản phải thu và điểm xác thực">
      <div className="space-y-6">
        <p className="text-lg text-slate-400">
          Mỗi đơn hàng đã đối soát trở thành một đơn vị khoản phải thu, gắn với kênh và cửa sổ thanh toán riêng.
        </p>

        {/* 6 thẻ đơn vị khoản phải thu — docs/du-lieu.md mục 6 */}
        <div className="grid grid-cols-3 gap-4">
          {RECEIVABLE_UNITS.map((unit) => (
            <div key={unit.code} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-white">{unit.code}</div>
                <StatusBadge tone={unit.statusColor}>{statusLabelFor(unit)}</StatusBadge>
              </div>
              <div className="mt-1 text-base text-slate-400">{unit.channel}</div>
              <div className="mt-2 text-2xl font-bold text-slate-100">{formatMillion(unit.projectedNetValue)}</div>
              <div className="mt-1 text-base text-slate-500">Cửa sổ thanh toán: {unit.settlementWindow}</div>
            </div>
          ))}
        </div>

        {/* Dòng tổng — tính từ các đơn vị Đã xác thực, không viết cứng */}
        <div className="rounded-xl border border-teal-800/60 bg-teal-950/20 p-5">
          <div className="text-base text-teal-300">Đang chờ sàn thanh toán</div>
          <div className="mt-1 text-3xl font-bold text-teal-200">
            {formatMillion(pendingTotal)}{' '}
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
              const score = computeVerificationScore(metrics)
              const available = isScoreAvailable(score)
              return (
                <button
                  key={channel}
                  onClick={() => setOpenChannel(channel)}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 text-left transition hover:border-slate-600 hover:bg-slate-900"
                >
                  <div className="text-lg font-semibold text-slate-100">{channel}</div>
                  {available ? (
                    <div className="mt-2 text-4xl font-bold text-teal-300">{score}</div>
                  ) : (
                    <div className="mt-2 text-xl font-bold text-amber-300">
                      {score} ({metrics.settledLots}/{MIN_LOTS_FOR_SCORE} lô)
                    </div>
                  )}
                  <div className="mt-2 text-base text-slate-500">Bấm để xem phân rã →</div>
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
          metrics={VERIFICATION_METRICS[openChannel]}
          score={computeVerificationScore(VERIFICATION_METRICS[openChannel])}
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
