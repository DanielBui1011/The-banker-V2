import { useState } from 'react'
import ScreenShell from '../components/ScreenShell.jsx'
import { usePermissions } from '../state/permissionState.jsx'

const STATUS_STYLE = {
  active: 'text-teal-400',
  'in-effect': 'text-teal-400',
  terminated: 'text-teal-400',
  revoked: 'text-slate-500',
  'not-granted': 'text-slate-500',
}

const REVOKE_CONFIRM_MESSAGE = {
  A1: 'Rút quyền A1 sẽ dừng đối soát tự động. Bạn chắc chắn?',
  A2: 'Rút quyền A2 sẽ dừng đánh giá tín dụng. Bạn chắc chắn?',
}

function formatDateVN(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const [y, m, d] = value.split('-')
  return `${d}/${m}/${y}`
}

function formatLogTimestamp(value) {
  const [datePart, timePart] = value.split(' ')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return value
  const [y, m, d] = datePart.split('-')
  return `${d}/${m}/${y} ${timePart}`
}

export default function Screen7({ onBack, onPrev, onGoToScreen }) {
  const { permissions, accessLog, revokeA1, revokeA2, regrantA2, requestReauth } = usePermissions()
  const [exportMessage, setExportMessage] = useState('')
  const [confirmCode, setConfirmCode] = useState(null) // 'A1' | 'A2' | null

  const goBack = onBack ?? onPrev

  function handleExport() {
    setExportMessage('Đã xuất hồ sơ doanh thu đã xác thực (mô phỏng) — không có tệp thật được tạo.')
  }

  function handleRegrantA1() {
    requestReauth()
    onGoToScreen?.(2)
    onBack?.()
  }

  // Hành động khả dụng cho mỗi quyền: rút (cần xác nhận) hoặc cấp lại (sau khi đã thu hồi).
  function actionFor(permission) {
    if (permission.code === 'A1') {
      if (permission.status === 'active') return { kind: 'revoke', run: revokeA1 }
      if (permission.status === 'revoked') return { kind: 'regrant', run: handleRegrantA1 }
    }
    if (permission.code === 'A2') {
      if (permission.status === 'active') return { kind: 'revoke', run: revokeA2 }
      if (permission.status === 'revoked') return { kind: 'regrant', run: regrantA2 }
    }
    return null
  }

  return (
    <ScreenShell screenNumber={7} title="Trung tâm quyền riêng tư">
      <div className="space-y-6">
        {goBack && (
          <button
            onClick={goBack}
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-base font-medium text-slate-300 hover:bg-slate-800"
          >
            ← Quay lại
          </button>
        )}

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-4 text-xl font-semibold text-slate-200">Danh sách quyền</div>
          {permissions.length === 0 ? (
            <p className="text-lg text-slate-500">Chưa có quyền nào được cấp.</p>
          ) : (
            <div className="space-y-3">
              {permissions.map((permission) => {
                const action = actionFor(permission)
                const lockedReason =
                  permission.code === 'A4' && permission.status === 'in-effect' ? permission.revokeNote : null

                return (
                  <div key={permission.code} className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-lg font-semibold text-white">
                          {permission.code} — {permission.purpose}
                        </div>
                        {permission.status === 'not-granted' ? (
                          <div className="mt-1 text-base text-slate-500">{permission.pendingNote}</div>
                        ) : (
                          <>
                            <div className="mt-1 text-base text-slate-400">
                              {permission.from} → {permission.to}
                            </div>
                            <div className="mt-1 text-base text-slate-500">
                              Cấp ngày {formatDateVN(permission.grantedDate)} · Hạn {formatDateVN(permission.expiryDate)}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${STATUS_STYLE[permission.status]}`}>
                          {permission.statusLabel}
                        </div>

                        {action?.kind === 'revoke' && (
                          <button
                            onClick={() => setConfirmCode(permission.code)}
                            className="mt-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-base font-medium text-slate-200 hover:bg-slate-700"
                          >
                            Rút lại
                          </button>
                        )}

                        {action?.kind === 'regrant' && (
                          <button
                            onClick={action.run}
                            className="mt-2 rounded-lg border border-teal-700 bg-teal-950/40 px-3 py-1.5 text-base font-medium text-teal-300 hover:bg-teal-900/40"
                          >
                            Cấp lại
                          </button>
                        )}

                        {!action && permission.status === 'in-effect' && (
                          <div className="mt-2">
                            <button
                              disabled
                              className="cursor-not-allowed rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-base font-medium text-slate-600"
                            >
                              Rút lại
                            </button>
                            {lockedReason && <div className="mt-1 text-base text-amber-300">{lockedReason}</div>}
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
                    <td className="py-2 pr-3 whitespace-nowrap text-slate-400">{formatLogTimestamp(entry.timestamp)}</td>
                    <td className="py-2 pr-3 text-slate-300">{entry.actor}</td>
                    <td className="py-2 pr-3 text-slate-400">{entry.purpose}</td>
                    <td className="py-2 text-slate-400">{entry.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="mt-4 flex justify-end">
            <div className="text-right">
              <button
                onClick={handleExport}
                className="rounded-xl border border-slate-600 px-5 py-2.5 text-lg font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                Xuất hồ sơ doanh thu đã xác thực của tôi
              </button>
              {exportMessage && <p className="mt-2 text-base text-emerald-400">{exportMessage}</p>}
            </div>
          </div>
        </div>
      </div>

      {confirmCode && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-6">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
            <p className="text-lg text-slate-100">{REVOKE_CONFIRM_MESSAGE[confirmCode]}</p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmCode(null)}
                className="flex-1 rounded-lg border border-slate-600 py-2.5 text-base font-semibold text-slate-300 hover:bg-slate-800"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (confirmCode === 'A1') revokeA1()
                  if (confirmCode === 'A2') revokeA2()
                  setConfirmCode(null)
                }}
                className="flex-1 rounded-lg bg-red-700 py-2.5 text-base font-semibold text-white hover:bg-red-600"
              >
                Xác nhận rút quyền
              </button>
            </div>
          </div>
        </div>
      )}
    </ScreenShell>
  )
}
