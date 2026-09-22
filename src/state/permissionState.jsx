import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { GRANTED_PERMISSIONS, ACCESS_LOG, SELLER_PROFILE } from '../data/mockData.js'

// Trạng thái quyền dùng chung — Màn 2 (cấp A1) và Màn 7 (trung tâm quyền riêng tư)
// đọc/ghi cùng một nguồn, theo docs/man-hinh.md Màn 7 và docs/du-lieu.md mục 8, 9.

const STATUS_LABEL = {
  'not-granted': 'Chưa cấp — sẽ cấp khi bạn đề nghị ứng vốn',
  active: 'Đang hoạt động',
  revoked: 'Đã thu hồi',
  'in-effect': 'Đang hiệu lực',
}

const PERMISSION_BASE = Object.fromEntries(GRANTED_PERMISSIONS.map((p) => [p.code, p]))

// A2 và A4 được cấp cùng lúc với bước "qua Màn 5" (đề nghị ứng vốn) — mốc ngày lấy
// từ chính du-lieu.md mục 8, không viết cứng số ở đây.
const A2_A4_GRANTED_DATE = PERMISSION_BASE.A2.grantedDate

function dateOnly(timestamp) {
  return timestamp.slice(0, 10)
}

const PermissionContext = createContext(null)

export function PermissionProvider({ children, hasPassedScreen5, hasPassedScreen6 }) {
  const [a1Status, setA1Status] = useState('not-granted') // not-granted | active | revoked
  const [a2Revoked, setA2Revoked] = useState(false)
  const [extraLogLines, setExtraLogLines] = useState([])
  const [peekReturnScreen, setPeekReturnScreen] = useState(null)

  const a1Granted = a1Status !== 'not-granted'
  const a2a4Granted = a1Granted && hasPassedScreen5

  const grantA1 = useCallback(() => setA1Status('active'), [])

  const revokeA1 = useCallback(() => {
    setA1Status('revoked')
    setExtraLogLines((lines) => [
      ...lines,
      { timestamp: 'Vừa xong', actor: SELLER_PROFILE.ownerName, purpose: 'A1 — rút quyền', data: 'Nhà bán rút quyền A1' },
    ])
  }, [])

  const revokeA2 = useCallback(() => {
    setA2Revoked(true)
    setExtraLogLines((lines) => [
      ...lines,
      { timestamp: 'Vừa xong', actor: SELLER_PROFILE.ownerName, purpose: 'A2 — rút quyền', data: 'Nhà bán rút quyền A2' },
    ])
  }, [])

  const reset = useCallback(() => {
    setA1Status('not-granted')
    setA2Revoked(false)
    setExtraLogLines([])
  }, [])

  const openPeek = useCallback((fromScreen) => setPeekReturnScreen(fromScreen), [])
  const closePeek = useCallback(() => setPeekReturnScreen(null), [])

  const permissions = useMemo(() => {
    if (!a1Granted) return []

    const rows = [{ ...PERMISSION_BASE.A1, status: a1Status, statusLabel: STATUS_LABEL[a1Status] }]

    const a2Status = a2Revoked ? 'revoked' : a2a4Granted ? 'active' : 'not-granted'
    rows.push({ ...PERMISSION_BASE.A2, status: a2Status, statusLabel: STATUS_LABEL[a2Status] })

    const a4Status = a2a4Granted ? 'in-effect' : 'not-granted'
    rows.push({ ...PERMISSION_BASE.A4, status: a4Status, statusLabel: STATUS_LABEL[a4Status] })

    return rows
  }, [a1Granted, a1Status, a2Revoked, a2a4Granted])

  const accessLog = useMemo(() => {
    if (!a1Granted) return []
    const visibleBase = ACCESS_LOG.filter((entry) => {
      const day = dateOnly(entry.timestamp)
      if (day < A2_A4_GRANTED_DATE) return true
      if (day === A2_A4_GRANTED_DATE) return hasPassedScreen5
      return hasPassedScreen6
    })
    return [...visibleBase, ...extraLogLines]
  }, [a1Granted, hasPassedScreen5, hasPassedScreen6, extraLogLines])

  const value = useMemo(
    () => ({
      permissions,
      accessLog,
      grantA1,
      revokeA1,
      revokeA2,
      reset,
      isPeeking: peekReturnScreen !== null,
      peekReturnScreen,
      openPeek,
      closePeek,
    }),
    [permissions, accessLog, grantA1, revokeA1, revokeA2, reset, peekReturnScreen, openPeek, closePeek]
  )

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
}

export function usePermissions() {
  const ctx = useContext(PermissionContext)
  if (!ctx) throw new Error('usePermissions phải được gọi bên trong PermissionProvider')
  return ctx
}
