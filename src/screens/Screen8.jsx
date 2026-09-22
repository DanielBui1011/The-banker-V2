import { useEffect, useMemo, useState } from 'react'
import { usePermissions } from '../state/permissionState.jsx'
import { useScenario } from '../state/scenarioState.jsx'
import {
  FOOTER_NOTE,
  GRANTED_PERMISSIONS,
  BANK_VIEW,
  RECEIVABLE_UNITS,
  PRICING_PARAMS,
  VERIFICATION_METRICS,
  LEAK_BATCH_RATE,
} from '../data/mockData.js'
import { computeAvailableValue } from '../logic/pricing.js'
import { computeVerificationScore, computeLeakAdjustedScore } from '../logic/verification.js'
import { formatNumberVN } from '../utils/format.js'

// Đơn vị dùng cho minh họa phơi nhiễm chéo — cùng bộ RU-03/RU-04 và tham số kỳ thường
// dùng ở Màn 5/6 (docs/du-lieu.md mục 4.3, tình huống T3: min(85; 150 − 100) = 50).
const LOCK_UNITS = RECEIVABLE_UNITS.filter((u) => u.code === 'RU-03' || u.code === 'RU-04')
const A2_PERMISSION = GRANTED_PERMISSIONS.find((p) => p.code === 'A2')

// Giao diện thứ ba (man-hinh.md Màn 8): khác cả Nền tảng (ScreenShell) lẫn trang cấp
// quyền của Techcombank — đây là cổng nội bộ cán bộ tín dụng, không dùng ScreenShell.
const TIMEPOINTS = [
  { id: '15-09', label: '15/09 — sau giải ngân' },
  { id: '20-09', label: '20/09 — sau tất toán' },
]

function formatDateVN(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const [y, m, d] = value.split('-')
  return `${d}/${m}/${y}`
}

export default function Screen8({ onNext }) {
  const { permissions } = usePermissions()
  const { leak, phase3, resetSignal } = useScenario()
  const [timepoint, setTimepoint] = useState('15-09')
  const [crossExposureOn, setCrossExposureOn] = useState(false)

  // Phím R đặt lại cả bộ chọn thời điểm và công tắc minh họa, kể cả khi vẫn đang ở Màn 8.
  useEffect(() => {
    setTimepoint('15-09')
    setCrossExposureOn(false)
  }, [resetSignal])

  const a2Revoked = permissions.find((p) => p.code === 'A2')?.status === 'revoked'
  const afterSettlement = timepoint === '20-09'

  // Tại 20/09, RU-03 và RU-04 đã tất toán — không còn bị khóa, không còn bên nào giữ
  // quyền đòi nợ trên đó (mục 10: khoản ứng tự tất toán khi tiền sàn về).
  const units = useMemo(
    () =>
      BANK_VIEW.units.map((u) =>
        afterSettlement && (u.code === 'RU-03' || u.code === 'RU-04') ? { ...u, lockedAmount: 0, lockerCount: 0 } : u
      ),
    [afterSettlement]
  )
  const totalExposure = units.reduce((sum, u) => sum + u.lockedAmount, 0)
  const baseLenderCount = Math.max(0, ...units.map((u) => u.lockerCount))

  const crossExposure = useMemo(
    () =>
      computeAvailableValue({
        units: LOCK_UNITS,
        params: PRICING_PARAMS.normal,
        lockedByOthers: crossExposureOn ? BANK_VIEW.crossExposureExample.otherLockedAmount : 0,
      }),
    [crossExposureOn]
  )
  const crossExposureLenderCount = baseLenderCount + (crossExposureOn ? 1 : 0)

  const shopeeScoreBase = computeVerificationScore(VERIFICATION_METRICS.Shopee)
  const shopeeScore = leak ? computeLeakAdjustedScore(shopeeScoreBase, LEAK_BATCH_RATE) : shopeeScoreBase
  const tiktokScore = computeVerificationScore(VERIFICATION_METRICS['TikTok Shop'])

  return (
    <div className="flex h-full flex-col bg-gray-100 text-gray-900">
      <header className="bg-blue-950 px-8 py-5 text-white">
        <div className="text-sm font-medium uppercase tracking-wide text-blue-300">Hệ thống nội bộ</div>
        <h1 className="mt-1 text-3xl font-bold">Techcombank — Cổng thẩm định (mô phỏng)</h1>
        {!a2Revoked && (
          <div className="mt-3 text-lg text-blue-200">
            Truy cập theo quyền A2 của nhà bán — hiệu lực đến {formatDateVN(A2_PERMISSION.expiryDate)}
          </div>
        )}
      </header>

      <main className="flex-1 px-8 py-8">
        {a2Revoked ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-lg font-semibold text-amber-800">
            Nhà bán đã rút quyền A2 — không thể xem dữ liệu.
          </div>
        ) : (
          <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex flex-wrap gap-3">
              {TIMEPOINTS.map((tp) => (
                <button
                  key={tp.id}
                  onClick={() => setTimepoint(tp.id)}
                  className={`rounded-lg border px-4 py-2 text-base font-medium transition ${
                    timepoint === tp.id
                      ? 'border-blue-700 bg-blue-700 text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tp.label}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">Đơn vị</th>
                    <th className="px-4 py-3 font-medium">Giá trị ròng dự phóng</th>
                    <th className="px-4 py-3 font-medium">Giá trị khả dụng</th>
                    <th className="px-4 py-3 font-medium">Đã bị khóa</th>
                    <th className="px-4 py-3 font-medium">Số bên đang khóa</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((u) => (
                    <tr key={u.code} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3 font-semibold text-gray-900">{u.code}</td>
                      <td className="px-4 py-3">{formatNumberVN(u.projectedNetValue)} triệu</td>
                      <td className="px-4 py-3">
                        {u.availableValue == null ? u.availableValueNote : `${formatNumberVN(u.availableValue)} triệu`}
                      </td>
                      <td className="px-4 py-3">{formatNumberVN(u.lockedAmount)} triệu</td>
                      <td className="px-4 py-3">{u.lockerCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                Sổ đăng ký chỉ cho biết giá trị đã khóa và số bên khóa, không tiết lộ danh tính.
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-base text-gray-500">Tổng phơi nhiễm hợp nhất</div>
              <div className="mt-1 text-3xl font-bold text-blue-900">
                {formatNumberVN(totalExposure)} triệu
                <span className="ml-2 text-lg font-normal text-gray-500">trên {baseLenderCount} bên cho vay</span>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="text-xl font-semibold text-gray-800">Doanh thu đã xác thực theo kênh</div>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <ScoreTile channel="Shopee" score={shopeeScore} />
                <ScoreTile channel="TikTok Shop" score={tiktokScore} />
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xl font-semibold text-gray-800">
                    Minh họa: đã có bên khác khóa {formatNumberVN(BANK_VIEW.crossExposureExample.otherLockedAmount)}{' '}
                    triệu
                  </div>
                  <div className="text-base text-gray-500">Ảnh hưởng tới giá trị khả dụng của RU-03 và RU-04.</div>
                </div>
                <ToggleSwitch active={crossExposureOn} onToggle={() => setCrossExposureOn((v) => !v)} />
              </div>

              <div className="mt-4 flex items-center gap-8">
                <div>
                  <div className="text-base text-gray-500">Giá trị khả dụng (RU-03 + RU-04)</div>
                  <div className="text-2xl font-bold text-blue-900">{formatNumberVN(crossExposure.result)} triệu</div>
                </div>
                <div>
                  <div className="text-base text-gray-500">Số bên đang khóa</div>
                  <div className="text-2xl font-bold text-blue-900">{crossExposureLenderCount}</div>
                </div>
              </div>

              {crossExposureOn && (
                <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-base font-semibold text-amber-800">
                  Phát hiện tài trợ chồng lấn — giá trị khả dụng đã được trừ
                </div>
              )}
            </div>

            {phase3 && (
              <button
                onClick={onNext}
                className="w-full rounded-xl bg-blue-800 py-3 text-lg font-semibold text-white transition hover:bg-blue-700"
              >
                Tiếp: Giai đoạn 3 — nhiều bên chào giá →
              </button>
            )}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-300 bg-gray-100 px-8 py-3 text-base text-gray-500">{FOOTER_NOTE}</footer>
    </div>
  )
}

function ScoreTile({ channel, score }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="text-base font-medium text-gray-600">{channel}</div>
      <div className="mt-1 text-3xl font-bold text-blue-900">{score}</div>
    </div>
  )
}

function ToggleSwitch({ active, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={active}
      className={`h-7 w-12 shrink-0 rounded-full transition ${active ? 'bg-blue-700' : 'bg-gray-300'}`}
    >
      <span
        className={`block h-6 w-6 rounded-full bg-white shadow transition ${
          active ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}
