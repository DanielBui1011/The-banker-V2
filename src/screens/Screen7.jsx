import { useState } from 'react'
import ScreenShell from '../components/ScreenShell.jsx'
import { usePermissions } from '../state/permissionState.jsx'

const STATUS_STYLE = {
  active: 'text-teal-400',
  'in-effect': 'text-teal-400',
  revoked: 'text-slate-500',
  'not-granted': 'text-slate-500',
}

function formatDateVN(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const [y, m, d] = value.split('-')
  return `${d}/${m}/${y}`
}

export default function Screen7({ onBack, peekReturnScreen }) {
  const { permissions, accessLog, revokeA1, revokeA2 } = usePermissions()
  const [exportMessage, setExportMessage] = useState('')

  function handleExport() {
    setExportMessage('Đã xuất hồ sơ doanh thu đã xác thực (mô phỏng) — không có tệp thật được tạo.')
  }

  function revokeAction(permission) {
    if (permission.code === 'A1') return revokeA1
    if (permission.code === 'A2') return revokeA2
    return null
  }

  return (
    <ScreenShell screenNumber={7} title="Trung tâm quyền riêng tư" maxWidth="max-w-4xl">
      <div className="space-y-6">
        {onBack && (
          <button
            onClick={onBack}
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-base font-medium text-slate-300 hover:bg-slate-800"
          >
            ← Quay về Màn {peekReturnScreen}
          </button>
        )}

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-4 text-xl font-semibold text-slate-200">Danh sách quyền</div>
          {permissions.length === 0 ? (
            <p className="text-lg text-slate-500">Chưa có quyền nào được cấp.</p>
          ) : (
            <div className="space-y-3">
              {permissions.map((permission) => {
                const revoke = revokeAction(permission)
                const canRevoke = revoke && permission.status === 'active'
                const lockedReason =
                  permission.code === 'A4' && permission.status === 'in-effect' ? permission.revokeNote : null

                return (
                  <div key={permission.code} className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold text-white">
                          {permission.code} — {permission.purpose}
                        </div>
                        <div className="mt-1 text-base text-slate-400">
                          {permission.from} → {permission.to}
                        </div>
                        <div className="mt-1 text-base text-slate-500">
                          Cấp ngày {formatDateVN(permission.grantedDate)} · Hạn {formatDateVN(permission.expiryDate)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${STATUS_STYLE[permission.status]}`}>
                          {permission.statusLabel}
                        </div>
                        {canRevoke && (
                          <button
                            onClick={revoke}
                            className="mt-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-base font-medium text-slate-200 hover:bg-slate-700"
                          >
                            Rút lại
                          </button>
                        )}
                        {!canRevoke && permission.status !== 'not-granted' && (
                          <div className="mt-2">
                            <button
                              disabled
                              className="cursor-not-allowed rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-base font-medium text-slate-600"
                            >
                              Rút lại
                            </button>
                            {lockedReason && <div className="mt-1 text-base text-amber-300">{lockedReason}</div>}
                            {permission.status === 'revoked' && (
                              <div className="mt-1 text-base text-slate-500">Đã thu hồi</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-4 text-xl font-semibold text-slate-200">Nhật ký truy cập</div>
          {accessLog.length === 0 ? (
            <p className="text-lg text-slate-500">Chưa có hoạt động truy cập nào.</p>
          ) : (
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-slate-800 text-left text-slate-500">
                  <th className="py-2 pr-3 font-medium">Thời điểm</th>
                  <th className="py-2 pr-3 font-medium">Bên truy cập</th>
                  <th className="py-2 pr-3 font-medium">Mục đích</th>
                  <th className="py-2 font-medium">Dữ liệu</th>
                </tr>
              </thead>
              <tbody>
                {accessLog.map((entry, i) => (
                  <tr key={i} className="border-b border-slate-800/60">
                    <td className="py-2 pr-3 text-slate-400">{entry.timestamp}</td>
                    <td className="py-2 pr-3 text-slate-300">{entry.actor}</td>
                    <td className="py-2 pr-3 text-slate-400">{entry.purpose}</td>
                    <td className="py-2 text-slate-400">{entry.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="space-y-2">
          <button
            onClick={handleExport}
            className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white transition hover:bg-blue-500"
          >
            Xuất hồ sơ doanh thu đã xác thực của tôi
          </button>
          {exportMessage && <p className="text-base text-emerald-400">{exportMessage}</p>}
        </div>
      </div>
    </ScreenShell>
  )
}
