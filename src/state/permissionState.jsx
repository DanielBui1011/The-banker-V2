import { createContext, useContext, useState } from 'react'
import { GRANTED_PERMISSIONS } from '../data/mockData.js'
import { LEGAL_NAME, TPP_CODE } from '../config/brand.js'
import { ROUTES, accessLog as selectAccessLog, loan } from '../logic/journey.js'
import { useApp } from './appState.jsx'

// ADAPTER TẠM (Vòng 21, gỡ ở Vòng 24 — docs/ban-giao.md): giao diện cũ của usePermissions()
// cho các màn cũ. Quyền và nhật ký đọc từ store journey.js (consents, accessLog).
// Provider chỉ còn giữ cờ giao diện "cấp lại A1" (Quyền & dữ liệu → trang A1).

const STATUS_LABEL = {
  'not-granted': 'Chưa cấp',
  active: 'Đang hoạt động',
  revoked: 'Đã thu hồi',
  'in-effect': 'Đang hiệu lực',
  terminated: 'Đã chấm dứt — khoản vay đã tất toán',
}
const PENDING_NOTE = 'Sẽ cấp khi bạn đề nghị ứng vốn'
const PERMISSION_BASE = Object.fromEntries(GRANTED_PERMISSIONS.map((p) => [p.code, p]))

// Mọi vị trí pháp lý dùng LEGAL_NAME + TPP_CODE (docs/thiet-ke.md mục 3)
const displayActor = (actor) => (actor === LEGAL_NAME ? `${LEGAL_NAME} — mã TPP ${TPP_CODE}` : actor)

const PermissionContext = createContext(null)

export function PermissionProvider({ children }) {
  const [reauthRequested, setReauthRequested] = useState(false)
  return (
    <PermissionContext.Provider value={{ reauthRequested, setReauthRequested }}>{children}</PermissionContext.Provider>
  )
}

function permissionRows(state) {
  const { A1, A2, A4 } = state.consents
  if (A1 === 'none') return []
  const row = (code, status) => ({
    ...PERMISSION_BASE[code],
    status,
    statusLabel: STATUS_LABEL[status],
    pendingNote: status === 'not-granted' ? PENDING_NOTE : null,
  })
  const a2 = A2 === 'none' ? 'not-granted' : A2
  const a4 = loan(state).status === 'repaid' ? 'terminated' : A4 === 'signed' ? 'in-effect' : 'not-granted'
  return [row('A1', A1), row('A2', a2), row('A4', a4)]
}

export function usePermissions() {
  const ui = useContext(PermissionContext)
  if (!ui) throw new Error('usePermissions phải được gọi bên trong PermissionProvider')
  const { state, dispatch } = useApp()
  const log = selectAccessLog(state)
    .map((l) => ({ timestamp: `${l.date} ${l.time ?? ''}`.trim(), actor: displayActor(l.actor), purpose: l.purpose, data: l.data }))
    .reverse()

  return {
    permissions: permissionRows(state),
    accessLog: log,
    grantA1: () => dispatch({ type: 'grantA1' }),
    revokeA1: () => dispatch({ type: 'revokeA1' }),
    revokeA2: () => dispatch({ type: 'revokeA2' }),
    regrantA2: () => dispatch({ type: 'grantA2' }),
    a2a4Granted: state.consents.A4 === 'signed',
    // Màn 5 cũ cấp A2 + ký A4 cùng lúc khi gửi đề nghị → tách thành các hành động của reducer
    grantA2A4: () => {
      dispatch({ type: 'grantA2' })
      dispatch({ type: 'viewEstimate' })
      dispatch({ type: 'signA4' })
    },
    reauthRequested: ui.reauthRequested,
    requestReauth: () => ui.setReauthRequested(true),
    consumeReauthRequest: () => ui.setReauthRequested(false),
    // Lớp phủ "Quyền của tôi" đã bỏ (san-pham.md mục J) → mở trang Quyền & dữ liệu
    isPeeking: false,
    openPeek: () => {
      window.location.hash = ROUTES.quyen
    },
    closePeek: () => {},
  }
}
