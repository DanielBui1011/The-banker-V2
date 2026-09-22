import { useState } from 'react'
import Card from './ui/Card.jsx'
import Money from './ui/Money.jsx'
import SurfaceFrame from './ui/SurfaceFrame.jsx'
import { LOCK_CERTIFICATE } from '../data/mockData.js'
import { formatNumberVN } from '../utils/format.js'

// LockCertificate (Vòng 7C, Màn 5) — biên nhận ngân hàng sau khi khóa RU-03/RU-04
// (docs/du-lieu.md mục 12). Chỉ dùng component chung trong src/components/ui/.
// amounts: { 'RU-03': 46.75, 'RU-04': 38.25 } — lấy từ src/logic/pricing.js qua
// props, không viết cứng ở đây.
export default function LockCertificate({ amounts, secured = LOCK_CERTIFICATE.secured, className = '' }) {
  const [showTech, setShowTech] = useState(false)
  const total = Object.values(amounts).reduce((sum, v) => sum + v, 0)
  const unitLines = Object.entries(amounts)
    .map(([code, value]) => `${code} (${formatNumberVN(value)})`)
    .join(', ')

  return (
    <Card className={className} padding="p-6">
      <div className="flex items-center justify-between">
        <span className="text-emphasis font-semibold text-slate-900">Chứng thư khóa</span>
        <span className="text-label text-slate-500">Mã {LOCK_CERTIFICATE.certificateId}</span>
      </div>

      <div className="mt-4 divide-y divide-slate-100">
        <CertRow label="Đơn vị" value={unitLines} />
        <CertRow label="Bên nhận bảo đảm" value={secured} />
        <CertRow
          label="Giá trị khóa"
          value={
            <span>
              {Object.entries(amounts)
                .map(([, value]) => formatNumberVN(value))
                .join(' + ')}{' '}
              = <Money value={total} size="label" className="text-slate-900" />
            </span>
          }
        />
        <CertRow label="Thứ tự ưu tiên" value={`#${LOCK_CERTIFICATE.priority}`} />
        <CertRow label="Thời điểm khóa" value={LOCK_CERTIFICATE.lockedAt} />
        <CertRow label="Mã đăng ký bảo đảm" value={LOCK_CERTIFICATE.registrationId} />
        <CertRow label="Thuật toán chữ ký" value="RS256 (JWS) — kiểm chứng độc lập" />
      </div>

      <p className="mt-4 text-label italic text-slate-500">Chữ ký minh họa trong prototype.</p>

      <button
        onClick={() => setShowTech((v) => !v)}
        className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-label font-medium text-slate-700 transition hover:bg-slate-50"
      >
        {showTech ? 'Ẩn dạng kỹ thuật' : 'Xem dạng kỹ thuật'}
      </button>

      {showTech && <TechJwsView amounts={amounts} secured={secured} />}
    </Card>
  )
}

function CertRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-label">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  )
}

function TechJwsView({ amounts, secured }) {
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    cert: LOCK_CERTIFICATE.certificateId,
    secured,
    units: amounts,
    priority: LOCK_CERTIFICATE.priority,
    lockedAt: LOCK_CERTIFICATE.lockedAt,
    registrationId: LOCK_CERTIFICATE.registrationId,
  }

  return (
    <div className="mt-4 -mx-6 -mb-6 h-96 overflow-hidden rounded-b-xl">
      <SurfaceFrame variant="tech">
        <div className="space-y-4 px-6 py-6 text-label">
          <div>
            <div className="mb-1 text-slate-400">header</div>
            <pre className="overflow-x-auto rounded-lg bg-black/30 p-3">{JSON.stringify(header, null, 2)}</pre>
          </div>
          <div>
            <div className="mb-1 text-slate-400">payload</div>
            <pre className="overflow-x-auto rounded-lg bg-black/30 p-3">{JSON.stringify(payload, null, 2)}</pre>
          </div>
          <div className="text-slate-400">signature: (minh họa — không phải chữ ký thật)</div>
        </div>
      </SurfaceFrame>
    </div>
  )
}
