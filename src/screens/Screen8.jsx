import { useEffect, useMemo, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import SurfaceFrame from '../components/ui/SurfaceFrame.jsx'
import Card from '../components/ui/Card.jsx'
import Money from '../components/ui/Money.jsx'
import LayerTag from '../components/ui/LayerTag.jsx'
import SegmentedControl from '../components/ui/SegmentedControl.jsx'
import ToggleSwitch from '../components/ui/ToggleSwitch.jsx'
import Callout from '../components/ui/Callout.jsx'
import Button from '../components/ui/Button.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import Drawer from '../components/ui/Drawer.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import LockCertificate from '../components/LockCertificate.jsx'
import { usePermissions } from '../state/permissionState.jsx'
import { useScenario } from '../state/scenarioState.jsx'
import { useSettlement } from '../state/settlementState.jsx'
import { isTypingTarget } from '../utils/keyboard.js'
import {
  FOOTER_NOTE,
  GRANTED_PERMISSIONS,
  BANK_VIEW,
  BANK_ALERT_POLICY,
  RECEIVABLE_UNITS,
  PRICING_PARAMS,
  VERIFICATION_METRICS,
  LEAK_BATCH_RATE,
  LOCK_CERTIFICATE,
  MIN_LOTS_FOR_SCORE,
  SETTLEMENT_TIMELINE_LEAK,
} from '../data/mockData.js'
import { computeAvailableValue } from '../logic/pricing.js'
import { computeVerificationScore, computeLeakAdjustedScore } from '../logic/verification.js'
import { formatNumberVN, formatDateVN } from '../utils/format.js'

// Đơn vị dùng cho minh họa phơi nhiễm chéo — cùng bộ RU-03/RU-04 và tham số kỳ thường
// dùng ở Màn 5/6 (docs/du-lieu.md mục 4.3, tình huống T3: min(85; 150 − 100) = 50).
const LOCK_UNITS = RECEIVABLE_UNITS.filter((u) => u.code === 'RU-03' || u.code === 'RU-04')
const A2_PERMISSION = GRANTED_PERMISSIONS.find((p) => p.code === 'A2')
// Mốc đứt gãy RU-03 (24/09) nằm ngoài bộ chọn thời điểm — cảnh báo mang dấu thời gian riêng.
const LEAK_BROKEN = SETTLEMENT_TIMELINE_LEAK.find((m) => m.id === 'leak-broken')

const TIMEPOINTS = [
  { id: '15-09', label: '15/09 — sau giải ngân' },
  { id: '20-09', label: '20/09 — sau tất toán' },
]

// Vòng 7C — Màn 8 dựng trên SurfaceFrame kiểu bankOps. Vòng 18: ba mục thanh bên
// bấm được — Tra cứu nhà bán (mặc định), Danh mục khóa, Cảnh báo.
export default function Screen8({ onNext }) {
  const { permissions } = usePermissions()
  const { leak, phase3, resetSignal } = useScenario()
  const settlement = useSettlement()
  const [section, setSection] = useState('lookup')
  const [timepoint, setTimepoint] = useState('15-09')
  const [crossExposureOn, setCrossExposureOn] = useState(false)
  const [duplicateCallout, setDuplicateCallout] = useState(null)
  const [certUnit, setCertUnit] = useState(null)

  // Phím R đặt lại mục thanh bên, bộ chọn thời điểm và công tắc minh họa, kể cả khi vẫn đang ở Màn 8.
  useEffect(() => {
    setSection('lookup')
    setTimepoint('15-09')
    setCrossExposureOn(false)
    setCertUnit(null)
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

  // Tại 20/09, RU-04 đã tất toán; RU-03 cũng vậy trừ khi bật rò rỉ (L) — khi đó tiền
  // Shopee cho RU-03 không về (19/09) nên RU-03 vẫn đang bị khóa (mục 10).
  const settledCodes = useMemo(
    () => (afterSettlement ? (leak ? ['RU-04'] : ['RU-03', 'RU-04']) : []),
    [afterSettlement, leak]
  )
  const units = useMemo(
    () => BANK_VIEW.units.map((u) => (settledCodes.includes(u.code) ? { ...u, lockedAmount: 0, lockerCount: 0 } : u)),
    [settledCodes]
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

  // Danh mục khóa: chỉ khóa của Techcombank; số tiền khóa tính từ src/logic/pricing.js
  // qua settlementState. Khóa của bên khác chỉ hiện SỐ bên (quy tắc 5).
  const lockAmounts = { 'RU-03': settlement.ru03LockAmount, 'RU-04': settlement.ru04LockAmount }
  const portfolioRows = Object.entries(lockAmounts).map(([code, amount]) => ({
    code,
    amount,
    status: settledCodes.includes(code) ? 'settled' : 'locked',
  }))
  const otherLenderCount = Math.max(0, baseLenderCount - 1) + (crossExposureOn ? 1 : 0)

  const alerts = leak ? [{ unit: 'RU-03', isoDate: LEAK_BROKEN.isoDate }] : []

  const nav = {
    items: [
      { id: 'lookup', label: 'Tra cứu nhà bán' },
      { id: 'portfolio', label: 'Danh mục khóa' },
      { id: 'alerts', label: 'Cảnh báo', count: alerts.length },
    ],
    active: section,
    onSelect: setSection,
  }
  const title = nav.items.find((i) => i.id === section).label

  return (
    <SurfaceFrame variant="bankOps" bankName="Techcombank" nav={nav}>
      <div className="flex h-full flex-col">
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-14 pb-24 pt-8">
          <div className="max-w-6xl space-y-6">
            <h1 className="text-screen-title font-bold text-slate-900">{title} — Lan Beauty</h1>

            {duplicateCallout && (
              <Callout variant="info">
                Lệnh khóa này đã được ghi nhận lúc {duplicateCallout.lockedAt} — không tạo khóa mới. Thứ tự ưu tiên #{duplicateCallout.priority} giữ nguyên. Tổng đã khóa: {formatNumberVN(duplicateCallout.total)} triệu.
              </Callout>
            )}

            {section === 'portfolio' && (
              <>
                <SegmentedControl options={TIMEPOINTS} value={timepoint} onChange={setTimepoint} />
                <Card>
                  <DataTable
                    columns={[
                      { key: 'code', header: 'Đơn vị', render: (r) => <span className="font-semibold text-slate-900">{r.code}</span> },
                      { key: 'amount', header: 'Giá trị khóa', align: 'right', render: (r) => `${formatNumberVN(r.amount)} triệu` },
                      { key: 'priority', header: 'Thứ tự ưu tiên', render: () => `#${LOCK_CERTIFICATE.priority}` },
                      { key: 'lockedAt', header: 'Thời điểm khóa', render: () => LOCK_CERTIFICATE.lockedAt },
                      { key: 'reg', header: 'Mã đăng ký bảo đảm (giả định)', render: () => LOCK_CERTIFICATE.registrationId },
                      { key: 'status', header: 'Trạng thái', render: (r) => <StatusBadge status={r.status} size="sm" className="whitespace-nowrap" /> },
                    ]}
                    rows={portfolioRows}
                    rowKey={(r) => r.code}
                    onRowClick={(r) => setCertUnit(r.code)}
                  />
                  <p className="mt-3 text-label text-slate-600">Bấm một dòng để xem chứng thư khóa.</p>
                </Card>
                <p className="text-label text-slate-700">
                  Bên khác đang khóa trên các đơn vị này: <span className="font-semibold tabular-nums">{otherLenderCount}</span> bên —
                  danh tính được ẩn theo quy chế thành viên.
                </p>
              </>
            )}

            {section === 'alerts' &&
              (alerts.length === 0 ? (
                <Card>
                  <div className="text-emphasis font-semibold text-slate-900">Không có cảnh báo</div>
                  <p className="mt-2 text-label text-slate-700">
                    Hệ thống kiểm tra {BANK_ALERT_POLICY.checkInterval}; cảnh báo đứt gãy được gửi trong{' '}
                    {BANK_ALERT_POLICY.brokenNoticeMinutes} phút.
                  </p>
                </Card>
              ) : (
                alerts.map((a) => (
                  <Card key={a.unit}>
                    <div className="flex items-center gap-3">
                      <StatusBadge status="broken" />
                      <span className="text-emphasis font-semibold text-slate-900">{a.unit}</span>
                      <span className="ml-auto text-label tabular-nums text-slate-600">{formatDateVN(a.isoDate)}</span>
                    </div>
                    <p className="mt-3 text-body text-slate-900">
                      <span className="font-semibold">Hệ quả:</span> Đóng băng cấp khóa mới cho nhà bán.
                    </p>
                  </Card>
                ))
              ))}

            {section === 'lookup' &&
              (a2Revoked ? (
                <Card>
                  <div className="text-emphasis font-semibold text-slate-900">Không có dữ liệu để hiển thị</div>
                  <p className="mt-2 text-label text-slate-600">
                    Nhà bán đã rút quyền A2 (đánh giá tín dụng), cấp ngày {formatDateVN(A2_PERMISSION.grantedDate)}. Ghi
                    chú rút quyền: {A2_PERMISSION.revokeNote}.
                  </p>
                </Card>
              ) : (
                <>
                  <div>
                    <div className="text-label font-medium text-slate-600">Tổng phơi nhiễm hợp nhất</div>
                    <Money value={totalExposure} size="hero" className="text-slate-900" />
                    <div className="mt-1 text-label text-slate-600">bảo đảm bằng {lockedTierUnits.length} đơn vị đã khóa</div>
                    <div className="mt-2 text-label text-slate-600">
                      Khả dụng còn lại để khóa: <Money value={availableToLock} size="body" className="font-medium text-slate-700" />
                    </div>
                  </div>

                  <div className="text-label text-slate-600">
                    Truy cập theo quyền A2 của nhà bán — hiệu lực đến {formatDateVN(A2_PERMISSION.expiryDate)}
                  </div>

                  <SegmentedControl options={TIMEPOINTS} value={timepoint} onChange={setTimepoint} />

                  <div className="space-y-4">
                    <LayerGroup layer={2} title="Đã khóa" units={lockedTierUnits} />
                    <LayerGroup layer={1} title="Sẵn có, chưa khóa" units={availableTierUnits} />
                    {insufficientUnits.length > 0 && <InsufficientGroup units={insufficientUnits} />}
                  </div>

                  <Card>
                    <div className="grid grid-cols-2 gap-6">
                      <VisibilityList
                        title="Ngân hàng thấy"
                        Icon={Eye}
                        items={['Doanh thu đã xác thực', 'Điểm xác thực', 'Trạng thái đơn vị', 'Giá trị đã khóa', 'Số bên khóa']}
                      />
                      <VisibilityList
                        title="Ngân hàng KHÔNG thấy"
                        Icon={EyeOff}
                        items={['Dữ liệu đơn hàng thô', 'Danh tính bên khóa khác', 'Dữ liệu ngoài phạm vi A2']}
                      />
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
                        <div className="text-label text-slate-600">Ảnh hưởng tới giá trị khả dụng của RU-03 và RU-04.</div>
                      </div>
                      <ToggleSwitch active={crossExposureOn} onToggle={() => setCrossExposureOn((v) => !v)} label="Bên khác khóa" />
                    </div>

                    <div className="mt-4 flex items-center gap-8">
                      <div>
                        <div className="text-label text-slate-600">Giá trị khả dụng (RU-03 + RU-04)</div>
                        <Money value={crossExposure.result} size="emphasis" className="text-slate-900" />
                      </div>
                      <div>
                        <div className="text-label text-slate-600">Số bên đang khóa</div>
                        <div className="text-emphasis font-semibold tabular-nums text-slate-900">{crossExposureLenderCount}</div>
                      </div>
                    </div>
                    <p className="mt-2 text-label italic text-slate-600">
                      Danh tính bên khóa được ẩn theo quy chế thành viên.
                    </p>

                    {crossExposureOn && (
                      <Callout variant="warn" className="mt-4">
                        Đã bị khóa bởi 1 bên khác: {formatNumberVN(BANK_VIEW.crossExposureExample.otherLockedAmount)} triệu — giá
                        trị khả dụng đã được trừ.
                      </Callout>
                    )}
                  </Card>
                </>
              ))}

            {phase3 && (
              <div className="flex justify-end">
                <Button onClick={onNext}>Tiếp: Giai đoạn 3 — nhiều bên chào giá →</Button>
              </div>
            )}
          </div>
        </main>

        <footer className="border-t border-slate-200 px-14 py-3 text-label text-slate-600">{FOOTER_NOTE}</footer>
      </div>

      <Drawer open={certUnit != null} onClose={() => setCertUnit(null)} title={`Chi tiết khóa ${certUnit ?? ''}`}>
        <LockCertificate amounts={lockAmounts} />
      </Drawer>
    </SurfaceFrame>
  )
}

function VisibilityList({ title, Icon, items }) {
  return (
    <div>
      <div className="mb-2 text-label font-semibold text-slate-900">{title}</div>
      <ul className="space-y-1 text-label text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <Icon size={18} className="flex-shrink-0 text-slate-600" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
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
          <tr className="border-b border-slate-200 text-left text-slate-600">
            <th className="w-24 px-3 py-2 font-medium">Đơn vị</th>
            <th className="w-48 px-3 py-2 text-right font-medium">Giá trị ròng dự phóng</th>
            <th className="w-48 px-3 py-2 text-right font-medium">Giá trị khả dụng</th>
            <th className="w-40 px-3 py-2 text-right font-medium">Đã bị khóa</th>
            <th className="w-40 px-3 py-2 font-medium">Số bên đang khóa</th>
          </tr>
        </thead>
        <tbody>
          {units.map((u) => (
            <tr key={u.code} className="h-14 border-b border-slate-100 last:border-0">
              <td className="px-3 font-semibold text-slate-900">{u.code}</td>
              <td className="px-3 text-right tabular-nums">{formatNumberVN(u.projectedNetValue)} triệu</td>
              <td className="px-3 text-right tabular-nums">{formatNumberVN(u.availableValue)} triệu</td>
              <td className="px-3 text-right tabular-nums">{formatNumberVN(u.lockedAmount)} triệu</td>
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
      {units.map((u) => {
        const lots = RECEIVABLE_UNITS.find((r) => r.code === u.code)?.lots
        return (
          <div key={u.code} className="flex items-center justify-between gap-4 border-t border-slate-100 py-2.5 text-label first:border-t-0">
            <span>
              <span className="font-semibold text-slate-900">{u.code}</span>
              {lots != null && (
                <span className="text-slate-700">
                  {' '}— chưa đủ {MIN_LOTS_FOR_SCORE} lô lịch sử ({lots}/{MIN_LOTS_FOR_SCORE})
                </span>
              )}
            </span>
            <span className="tabular-nums text-slate-600">{formatNumberVN(u.projectedNetValue)} triệu dự phóng</span>
          </div>
        )
      })}
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
