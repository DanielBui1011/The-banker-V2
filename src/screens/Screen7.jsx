import { useState } from 'react'
import TopBar from '../components/ui/TopBar.jsx'
import ActProgress from '../components/ui/ActProgress.jsx'
import SurfaceFrame from '../components/ui/SurfaceFrame.jsx'
import Card from '../components/ui/Card.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import Timeline from '../components/ui/Timeline.jsx'
import Callout from '../components/ui/Callout.jsx'
import { actForScreen } from '../config/flow.js'
import { usePermissions } from '../state/permissionState.jsx'
import { FOOTER_NOTE } from '../data/mockData.js'
import { formatDateVN } from '../utils/format.js'

// Bản chất mỗi quyền (docs/quy-tac.md mục 3, du-lieu.md mục 8): A1/A2 là quyền xử
// lý dữ liệu qua Open API; A4 là biện pháp bảo đảm (đăng ký theo NĐ 99/2022/NĐ-CP),
// không phải quyền xử lý dữ liệu.
const NATURE_LABEL = {
  A1: 'Xử lý dữ liệu',
  A2: 'Xử lý dữ liệu',
  A4: 'Biện pháp bảo đảm',
}

// Hệ quả cụ thể khi rút từng quyền, và nhãn nút xác nhận nêu rõ hành động
// (docs/man-hinh.md Màn 7) — không dùng "OK"/"Xác nhận" chung chung.
const REVOKE_INFO = {
  A1: {
    message: 'Techcombank sẽ ngừng đọc dòng tiền phục vụ đối soát. Đối soát tự động sẽ dừng cập nhật.',
    confirmLabel: 'Rút quyền A1',
  },
  A2: {
    message: 'Techcombank sẽ không còn xem dữ liệu phục vụ đánh giá tín dụng. Đối soát (A1) vẫn hoạt động.',
    confirmLabel: 'Rút quyền A2',
  },
}

// Bên nhận hiển thị ở thẻ quyền — A2 ghi rõ Techcombank là bên đánh giá tín dụng
// (Vòng 12 mục 2), khớp với "Bên nhận dữ liệu" trên trang cấp quyền A2 (Màn 5a).
const RECIPIENT_LABEL = {
  A2: 'Techcombank (bên đánh giá tín dụng)',
}

function formatLogTimestamp(value) {
  const [datePart, timePart] = value.split(' ')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return value
  return `${formatDateVN(datePart)} ${timePart}`
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

  // Nhóm theo bên truy cập liên tiếp (Vòng 13) — nêu tên bên truy cập một lần ở
  // đầu mỗi nhóm, mỗi dòng bên trong chỉ còn mục đích và dữ liệu.
  const accessGroups = []
  for (const entry of accessLog) {
    const lastGroup = accessGroups[accessGroups.length - 1]
    if (lastGroup && lastGroup.actor === entry.actor) {
      lastGroup.items.push(entry)
    } else {
      accessGroups.push({ actor: entry.actor, items: [entry] })
    }
  }

  return (
    <div className="flex h-full flex-col">
      <TopBar screenNumber={7} showPeekButton={false} />
      <div className="min-h-0 flex-1">
        <SurfaceFrame variant="platform">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 px-12 pb-3 pt-3">
              <ActProgress currentAct={actForScreen(7)} tone="light" />
            </div>

            <main className="flex-1 overflow-y-auto px-12 pt-10 pb-24">
              <div className="mx-auto max-w-[1536px] space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-screen-title font-bold text-slate-900">Trung tâm quyền riêng tư</h1>
                  {goBack && (
                    <button
                      onClick={goBack}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-label font-medium text-slate-700 hover:bg-slate-50"
                    >
                      ← Quay lại
                    </button>
                  )}
                </div>

                <div>
                  <div className="mb-3 text-section-title font-semibold text-slate-900">Danh sách quyền</div>
                  {permissions.length === 0 ? (
                    <Card>
                      <p className="text-body text-slate-500">Chưa có quyền nào được cấp.</p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {permissions.map((permission) => {
                        const action = actionFor(permission)
                        const lockedReason =
                          permission.code === 'A4' && permission.status === 'in-effect' ? permission.revokeNote : null
                        const statusKey =
                          permission.status === 'not-granted' ? 'not-granted' : `granted-${permission.status}`

                        return (
                          <Card key={permission.code} className="flex flex-col gap-3">
                            <div className="flex flex-col gap-2">
                              <div className="text-emphasis font-semibold text-slate-900">
                                {permission.code} — {permission.purpose}
                              </div>
                              <StatusBadge status={statusKey} className="self-start" />
                            </div>

                            <div className="text-label text-slate-600">
                              Bản chất: {NATURE_LABEL[permission.code]}
                            </div>
                            <div className="text-label text-slate-600">
                              Bên nhận: {RECIPIENT_LABEL[permission.code] ?? permission.to}
                            </div>

                            {permission.status === 'not-granted' ? (
                              <div className="text-label text-slate-500">{permission.pendingNote}</div>
                            ) : (
                              <div className="text-label text-slate-500">
                                Cấp ngày {formatDateVN(permission.grantedDate)} · Hạn{' '}
                                {/^\d{4}-\d{2}-\d{2}$/.test(permission.expiryDate)
                                  ? formatDateVN(permission.expiryDate)
                                  : permission.expiryDate}
                              </div>
                            )}

                            <div className="mt-auto pt-2">
                              {action?.kind === 'revoke' && (
                                <button
                                  onClick={() => setConfirmCode(permission.code)}
                                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-label font-medium text-slate-700 hover:bg-slate-50"
                                >
                                  Rút quyền {permission.code}
                                </button>
                              )}

                              {action?.kind === 'regrant' && (
                                <button
                                  onClick={action.run}
                                  className="w-full rounded-lg border border-teal-600 bg-teal-50 px-3 py-2 text-label font-medium text-teal-700 hover:bg-teal-100"
                                >
                                  Cấp lại quyền {permission.code}
                                </button>
                              )}

                              {!action && permission.status === 'in-effect' && (
                                <div className="space-y-1.5">
                                  <button
                                    disabled
                                    className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-label font-medium text-slate-400"
                                  >
                                    Không thể rút quyền {permission.code}
                                  </button>
                                  {lockedReason && (
                                    <Callout variant="warn">{lockedReason}</Callout>
                                  )}
                                </div>
                              )}
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>

                <Card>
                  <div className="mb-4 text-section-title font-semibold text-slate-900">Nhật ký truy cập</div>
                  {accessGroups.length === 0 ? (
                    <p className="text-body text-slate-500">Chưa có hoạt động truy cập nào.</p>
                  ) : (
                    <div className="max-h-[360px] space-y-4 overflow-y-auto pr-1">
                      {accessGroups.map((group, i) => (
                        <div key={i}>
                          <div className="mb-1.5 text-label font-semibold text-slate-700">{group.actor}</div>
                          <Timeline
                            items={group.items.map((entry) => ({
                              date: formatLogTimestamp(entry.timestamp),
                              label: `${entry.purpose} — ${entry.data}`,
                              done: true,
                            }))}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card>
                  <div className="mb-3 text-section-title font-semibold text-slate-900">Dữ liệu của tôi</div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-body text-slate-600">Xuất hồ sơ doanh thu đã xác thực để lưu hoặc chia sẻ.</p>
                    <button
                      onClick={handleExport}
                      className="flex-shrink-0 rounded-xl border border-slate-300 px-5 py-2.5 text-body font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Xuất hồ sơ doanh thu đã xác thực
                    </button>
                  </div>
                  {exportMessage && <p className="mt-2 text-right text-label text-teal-700">{exportMessage}</p>}
                </Card>
              </div>
            </main>

            <footer className="border-t border-slate-200 px-12 py-3 text-label text-slate-500">{FOOTER_NOTE}</footer>
          </div>
        </SurfaceFrame>
      </div>

      <ConfirmDialog
        open={confirmCode != null}
        title={confirmCode ? `Rút quyền ${confirmCode}?` : ''}
        message={confirmCode ? REVOKE_INFO[confirmCode].message : ''}
        confirmLabel={confirmCode ? REVOKE_INFO[confirmCode].confirmLabel : 'Xác nhận'}
        cancelLabel="Hủy"
        onCancel={() => setConfirmCode(null)}
        onConfirm={() => {
          if (confirmCode === 'A1') revokeA1()
          if (confirmCode === 'A2') revokeA2()
          setConfirmCode(null)
        }}
      />
    </div>
  )
}
