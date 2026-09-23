import { useEffect, useMemo, useState } from 'react'
import SurfaceFrame from '../components/ui/SurfaceFrame.jsx'
import Card from '../components/ui/Card.jsx'
import Money from '../components/ui/Money.jsx'
import LayerTag from '../components/ui/LayerTag.jsx'
import SegmentedControl from '../components/ui/SegmentedControl.jsx'
import ToggleSwitch from '../components/ui/ToggleSwitch.jsx'
import Callout from '../components/ui/Callout.jsx'
import { usePermissions } from '../state/permissionState.jsx'
import { useScenario } from '../state/scenarioState.jsx'
import { useSettlement } from '../state/settlementState.jsx'
import { isTypingTarget } from '../utils/keyboard.js'
import {
  FOOTER_NOTE,
  GRANTED_PERMISSIONS,
  BANK_VIEW,
  RECEIVABLE_UNITS,
  PRICING_PARAMS,
  VERIFICATION_METRICS,
  LEAK_BATCH_RATE,
  LOCK_CERTIFICATE,
} from '../data/mockData.js'
import { computeAvailableValue } from '../logic/pricing.js'
import { computeVerificationScore, computeLeakAdjustedScore } from '../logic/verification.js'
import { formatNumberVN, formatDateVN } from '../utils/format.js'

// Đơn vị dùng cho minh họa phơi nhiễm chéo — cùng bộ RU-03/RU-04 và tham số kỳ thường
// dùng ở Màn 5/6 (docs/du-lieu.md mục 4.3, tình huống T3: min(85; 150 − 100) = 50).
const LOCK_UNITS = RECEIVABLE_UNITS.filter((u) => u.code === 'RU-03' || u.code === 'RU-04')
const A2_PERMISSION = GRANTED_PERMISSIONS.find((p) => p.code === 'A2')

const TIMEPOINTS = [
  { id: '15-09', label: '15/09 — sau giải ngân' },
  { id: '20-09', label: '20/09 — sau tất toán' },
]

// Vòng 7C — Màn 8 dựng trên SurfaceFrame kiểu bankOps, tiêu đề "Techcombank", bộ
// chọn thời điểm bằng SegmentedControl, nhóm đơn vị theo tầng (LayerTag).
export default function Screen8({ onNext }) {
  const { permissions } = usePermissions()
  const { leak, phase3, resetSignal } = useScenario()
  const settlement = useSettlement()
  const [timepoint, setTimepoint] = useState('15-09')
  const [crossExposureOn, setCrossExposureOn] = useState(false)
  const [duplicateCallout, setDuplicateCallout] = useState(null)

  // Phím R đặt lại cả bộ chọn thời điểm và công tắc minh họa, kể cả khi vẫn đang ở Màn 8.
  useEffect(() => {
    setTimepoint('15-09')
    setCrossExposureOn(false)
  }, [resetSignal])

  // Phím D (Màn 8): mô phỏng Techcombank gửi lại lệnh khóa — chỉ hoạt động khi đã khóa
  useEffect(() => {
    function handleKeyDown(e) {
      if (isTypingTarget(e.target)) return
      if (e.key.toLowerCase() !== 'd') return
      if (!settlement.locksInitialized) return
      const result = settlement.retryLock('RU-03')
      if (result?.status === 'DA_GHI_NHAN') {
        const lockedAt = LOCK_CERTIFICATE.lockedAt.slice(11, 16)
        setDuplicateCallout({ lockedAt, priority: 1, total: settlement.totalLocked })
        setTimeout(() => setDuplicateCallout(null), 6000)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [settlement])

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
  const lockedTierUnits = units.filter((u) => u.lockerCount > 0)
  const availableTierUnits = units.filter((u) => u.lockerCount === 0 && u.availableValue != null)
  const insufficientUnits = units.filter((u) => u.availableValue == null)
  const availableToLock = availableTierUnits.reduce((sum, u) => sum + u.availableValue, 0)

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
    <SurfaceFrame variant="bankOps" bankName="Techcombank">
      <div className="flex h-full flex-col">
        <div className="px-12 pt-8">
          <h1 className="text-screen-title font-bold text-slate-900">Techcombank</h1>
          <p className="mt-1 text-label text-slate-500">Cổng nghiệp vụ — tra cứu nhà bán Lan Beauty</p>
        </div>

        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-12 pb-24 pt-6">
          {duplicateCallout && (
            <div className="mb-6 max-w-5xl mx-auto">
              <Callout variant="info">
                Lệnh khóa này đã được ghi nhận lúc {duplicateCallout.lockedAt} — không tạo khóa mới. Thứ tự ưu tiên #{duplicateCallout.priority} giữ nguyên. Tổng đã khóa: {formatNumberVN(duplicateCallout.total)} triệu.
              </Callout>
            </div>
          )}
          {a2Revoked ? (
            <Card className="mx-auto max-w-5xl">
              <div className="text-emphasis font-semibold text-slate-900">Không có dữ liệu để hiển thị</div>
              <p className="mt-2 text-label text-slate-600">
                Nhà bán đã rút quyền A2 (đánh giá tín dụng), cấp ngày {formatDateVN(A2_PERMISSION.grantedDate)}. Ghi
                chú rút quyền: {A2_PERMISSION.revokeNote}.
              </p>
            </Card>
          ) : (
            <div className="mx-auto max-w-5xl space-y-6">
              <div>
                <div className="text-emphasis font-semibold text-slate-900">Ngân hàng thấy gì, và KHÔNG thấy gì?</div>
                <div className="mt-2 flex items-baseline gap-3">
                  <Money value={availableToLock} size="hero" className="text-slate-900" />
                  <span className="text-label text-slate-500">giá trị khả dụng còn lại để khóa</span>
                </div>
              </div>

              <div className="text-label text-slate-500">
                Truy cập theo quyền A2 của nhà bán — hiệu lực đến {formatDateVN(A2_PERMISSION.expiryDate)}
              </div>

              <SegmentedControl options={TIMEPOINTS} value={timepoint} onChange={setTimepoint} />

              <div className="space-y-4">
                <LayerGroup layer={2} title="Đã khóa" units={lockedTierUnits} />
                <LayerGroup layer={1} title="Sẵn có, chưa khóa" units={availableTierUnits} />
                {insufficientUnits.length > 0 && (
                  <InsufficientGroup units={insufficientUnits} />
                )}
              </div>

              <Callout variant="info">
                Sổ đăng ký chỉ cho biết giá trị đã khóa và số bên khóa, không tiết lộ danh tính bên khóa khác.
              </Callout>

              <Card>
                <div className="text-label text-slate-500">Tổng phơi nhiễm hợp nhất</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <Money value={totalExposure} size="section-title" className="text-slate-900" />
                  <span className="text-label text-slate-500">trên {baseLenderCount} bên cho vay</span>
                </div>
              </Card>

              <Card>
                <div className="text-emphasis font-semibold text-slate-900">Doanh thu đã xác thực theo kênh</div>
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <ScoreTile channel="Shopee" score={shopeeScore} />
                  <ScoreTile channel="TikTok Shop" score={tiktokScore} />
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-emphasis font-semibold text-slate-900">
                      Minh họa: đã có bên khác khóa {formatNumberVN(BANK_VIEW.crossExposureExample.otherLockedAmount)} triệu
                    </div>
                    <div className="text-label text-slate-500">Ảnh hưởng tới giá trị khả dụng của RU-03 và RU-04.</div>
                  </div>
                  <ToggleSwitch active={crossExposureOn} onToggle={() => setCrossExposureOn((v) => !v)} label="Bên khác khóa" />
                </div>

                <div className="mt-4 flex items-center gap-8">
                  <div>
                    <div className="text-label text-slate-500">Giá trị khả dụng (RU-03 + RU-04)</div>
                    <Money value={crossExposure.result} size="emphasis" className="text-slate-900" />
                  </div>
                  <div>
                    <div className="text-label text-slate-500">Số bên đang khóa</div>
                    <div className="text-emphasis font-semibold tabular-nums text-slate-900">{crossExposureLenderCount}</div>
                  </div>
                </div>
                <p className="mt-2 text-label italic text-slate-500">
                  Danh tính bên khóa được ẩn theo quy chế thành viên.
                </p>

                {crossExposureOn && (
                  <Callout variant="warn" className="mt-4">
                    Đã bị khóa bởi 1 bên khác: {formatNumberVN(BANK_VIEW.crossExposureExample.otherLockedAmount)} triệu — giá
                    trị khả dụng đã được trừ.
                  </Callout>
                )}
              </Card>

              {phase3 && (
                <button
                  onClick={onNext}
                  className="w-full rounded-xl bg-navy py-3 text-emphasis font-semibold text-white transition hover:opacity-90"
                >
                  Tiếp: Giai đoạn 3 — nhiều bên chào giá →
                </button>
              )}
            </div>
          )}
        </main>

        <footer className="border-t border-slate-200 px-12 py-3 text-label text-slate-500">{FOOTER_NOTE}</footer>
      </div>
    </SurfaceFrame>
  )
}

function LayerGroup({ layer, title, units }) {
  if (units.length === 0) return null
  return (
    <Card>
      <div className="mb-3 flex items-center gap-3">
        <LayerTag layer={layer} />
        <span className="text-emphasis font-semibold text-slate-900">{title}</span>
      </div>
      <table className="w-full table-fixed text-label">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="w-24 px-3 py-2 font-medium">Đơn vị</th>
            <th className="w-48 px-3 py-2 font-medium">Giá trị ròng dự phóng</th>
            <th className="w-48 px-3 py-2 font-medium">Giá trị khả dụng</th>
            <th className="w-40 px-3 py-2 font-medium">Đã bị khóa</th>
            <th className="w-40 px-3 py-2 font-medium">Số bên đang khóa</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u) => (
            <tr key={u.code} className="h-14 border-b border-slate-100 last:border-0">
              <td className="px-3 font-semibold text-slate-900">{u.code}</td>
              <td className="px-3 tabular-nums">{formatNumberVN(u.projectedNetValue)} triệu</td>
              <td className="px-3 tabular-nums">{formatNumberVN(u.availableValue)} triệu</td>
              <td className="px-3 tabular-nums">{formatNumberVN(u.lockedAmount)} triệu</td>
              <td className="px-3 tabular-nums">{u.lockerCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

function InsufficientGroup({ units }) {
  return (
    <Card>
      <div className="mb-3 text-emphasis font-semibold text-slate-900">Chưa đủ điều kiện</div>
      {units.map((u) => (
        <div key={u.code} className="flex items-center justify-between border-t border-slate-100 py-2.5 text-label first:border-t-0">
          <span className="font-semibold text-slate-900">{u.code}</span>
          <span className="tabular-nums text-slate-600">{formatNumberVN(u.projectedNetValue)} triệu dự phóng</span>
          <span className="text-slate-500">{u.availableValueNote}</span>
        </div>
      ))}
    </Card>
  )
}

function ScoreTile({ channel, score }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="text-label font-medium text-slate-600">{channel}</div>
      <div className="mt-1 text-section-title font-bold tabular-nums text-slate-900">{score}</div>
    </div>
  )
}
