import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { GRANTED_PERMISSIONS, ACCESS_LOG, SELLER_PROFILE } from '../data/mockData.js'
import { LEGAL_NAME, TPP_CODE } from '../config/brand.js'

// Trạng thái quyền dùng chung — Màn 2 (cấp A1) và Màn 7 (trung tâm quyền riêng tư)
// đọc/ghi cùng một nguồn, theo docs/man-hinh.md Màn 7 và docs/du-lieu.md mục 8, 9.

const STATUS_LABEL = {
  'not-granted': 'Chưa cấp',
  active: 'Đang hoạt động',
  revoked: 'Đã thu hồi',
  'in-effect': 'Đang hiệu lực',
  terminated: 'Đã chấm dứt — khoản vay đã tất toán',
}

const PENDING_NOTE = 'Sẽ cấp khi bạn đề nghị ứng vốn'

const PERMISSION_BASE = Object.fromEntries(GRANTED_PERMISSIONS.map((p) => [p.code, p]))

// A2 và A4 được cấp cùng lúc với bước "qua Màn 5" (đề nghị ứng vốn) — mốc ngày lấy
// từ chính du-lieu.md mục 8, không viết cứng số ở đây.
const A2_A4_GRANTED_DATE = PERMISSION_BASE.A2.grantedDate

function dateOnly(timestamp) {
  return timestamp.slice(0, 10)
}

// Đóng dấu giờ cho một dòng nhật ký phát sinh ngay trong lúc trình bày (rút/cấp lại
// quyền): giữ ngày "hôm nay" của kịch bản (đã cấp A2/A4) nhưng lấy giờ:phút thật lúc
// bấm, để nhiều thao tác liên tiếp vẫn sắp xếp được theo đúng thứ tự trước/sau.
function nowTimestamp() {
  const now = new Date()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return `${A2_A4_GRANTED_DATE} ${hh}:${mm}`
}

// Tên pháp nhân + mã TPP dùng ở cột "Bên truy cập" — khớp với trang cấp quyền Techcombank
// (docs/thiet-ke.md mục 3: mọi vị trí pháp lý dùng LEGAL_NAME + TPP_CODE).
function displayActor(actor) {
  return actor === LEGAL_NAME ? `${LEGAL_NAME} — mã TPP ${TPP_CODE}` : actor
}

const PermissionContext = createContext(null)

export function PermissionProvider({ children, debtFullyRepaid = false, visibleLogDates = [] }) {
  const [a1Status, setA1Status] = useState('not-granted') // not-granted | active | revoked
  const [a2Revoked, setA2Revoked] = useState(false)
  const [a2a4Granted, setA2a4Granted] = useState(false) // cấp cùng lúc, ở Màn 5 bước 5d
  const [extraLogLines, setExtraLogLines] = useState([])
  const [peekReturnScreen, setPeekReturnScreen] = useState(null)
  const [reauthRequested, setReauthRequested] = useState(false)

  const a1Granted = a1Status !== 'not-granted'

  const grantA1 = useCallback(() => setA1Status('active'), [])

  // Gọi từ Màn 5 bước 5d, ngay khi Techcombank "phê duyệt và giải ngân" —
  // không chờ người trình bày bấm "Tiếp" rời khỏi màn, để bảng "Quyền của tôi"
  // xem nhanh (peek) từ chính Màn 5 cũng phản ánh đúng trạng thái mới.
  const grantA2A4 = useCallback(() => setA2a4Granted(true), [])

  const revokeA1 = useCallback(() => {
    setA1Status('revoked')
    setExtraLogLines((lines) => [
      ...lines,
      { timestamp: nowTimestamp(), actor: SELLER_PROFILE.ownerName, purpose: 'A1 — rút quyền', data: 'Nhà bán rút quyền A1' },
    ])
  }, [])

  const revokeA2 = useCallback(() => {
    setA2Revoked(true)
    setExtraLogLines((lines) => [
      ...lines,
      { timestamp: nowTimestamp(), actor: SELLER_PROFILE.ownerName, purpose: 'A2 — rút quyền', data: 'Nhà bán rút quyền A2' },
    ])
  }, [])

  // A2 không có trang cấp quyền riêng trong phạm vi hiện tại (đó là bước 5a của Màn 5,
  // chưa xây) — cấp lại nghĩa là kích hoạt lại ngay, cùng cơ chế với lúc "qua Màn 5".
  const regrantA2 = useCallback(() => {
    setA2Revoked(false)
    setExtraLogLines((lines) => [
      ...lines,
      { timestamp: nowTimestamp(), actor: SELLER_PROFILE.ownerName, purpose: 'A2 — cấp lại quyền', data: 'Nhà bán cấp lại quyền A2' },
    ])
  }, [])

  // A1 phải cấp lại qua đúng trang 2b (Techcombank) — Màn 2 đọc cờ này để nhảy thẳng
  // tới bước 2b thay vì bắt đầu lại từ 2a.
  const requestReauth = useCallback(() => setReauthRequested(true), [])
  const consumeReauthRequest = useCallback(() => setReauthRequested(false), [])

  const reset = useCallback(() => {
    setA1Status('not-granted')
    setA2Revoked(false)
    setA2a4Granted(false)
    setExtraLogLines([])
    setReauthRequested(false)
  }, [])

  const openPeek = useCallback((fromScreen) => setPeekReturnScreen(fromScreen), [])
  const closePeek = useCallback(() => setPeekReturnScreen(null), [])

  const permissions = useMemo(() => {
    if (!a1Granted) return []

    const rows = [{ ...PERMISSION_BASE.A1, status: a1Status, statusLabel: STATUS_LABEL[a1Status] }]

    const a2Status = a2Revoked ? 'revoked' : a2a4Granted ? 'active' : 'not-granted'
    rows.push({
      ...PERMISSION_BASE.A2,
      status: a2Status,
      statusLabel: STATUS_LABEL[a2Status],
      pendingNote: a2Status === 'not-granted' ? PENDING_NOTE : null,
    })

    const a4Status = debtFullyRepaid ? 'terminated' : a2a4Granted ? 'in-effect' : 'not-granted'
    rows.push({
      ...PERMISSION_BASE.A4,
      status: a4Status,
      statusLabel: STATUS_LABEL[a4Status],
      pendingNote: a4Status === 'not-granted' ? PENDING_NOTE : null,
    })

    return rows
  }, [a1Granted, a1Status, a2Revoked, a2a4Granted, debtFullyRepaid])

  const accessLog = useMemo(() => {
    if (!a1Granted) return []
    const visibleBase = ACCESS_LOG.filter((entry) => {
      const day = dateOnly(entry.timestamp)
      if (day < A2_A4_GRANTED_DATE) return true
      if (day === A2_A4_GRANTED_DATE) return a2a4Granted
      return visibleLogDates.includes(day)
    })
    return [...visibleBase, ...extraLogLines]
      .map((entry) => ({ ...entry, actor: displayActor(entry.actor) }))
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : a.timestamp > b.timestamp ? -1 : 0))
  }, [a1Granted, a2a4Granted, visibleLogDates, extraLogLines])

  const value = useMemo(
    () => ({
      permissions,
      accessLog,
      grantA1,
      revokeA1,
      revokeA2,
      regrantA2,
      a2a4Granted,
      grantA2A4,
      reauthRequested,
      requestReauth,
      consumeReauthRequest,
      reset,
      isPeeking: peekReturnScreen !== null,
      peekReturnScreen,
      openPeek,
      closePeek,
    }),
    [
      permissions,
      accessLog,
      grantA1,
      revokeA1,
      revokeA2,
      regrantA2,
      a2a4Granted,
      grantA2A4,
      reauthRequested,
      requestReauth,
      consumeReauthRequest,
      reset,
      peekReturnScreen,
      openPeek,
      closePeek,
    ]
  )

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
}

export function usePermissions() {
  const ctx = useContext(PermissionContext)
  if (!ctx) throw new Error('usePermissions phải được gọi bên trong PermissionProvider')
  return ctx
}
