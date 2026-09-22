// Sổ đăng ký khóa đơn vị khoản phải thu — event-sourced, chỉ-thêm-mới.
// Trạng thái hiện tại tính bằng phát lại toàn bộ sự kiện (replay).

// Tổng đã khóa trên một đơn vị (tính bằng phát lại sự kiện)
function computeLockedForUnit(registry, unitId) {
  return registry.filter((e) => e.unitId === unitId).reduce((sum, e) => sum + e.amount, 0)
}

// lockUnit(registry, {lenderId, unitId, requestId, amount, availableValue})
//   → {registry, result}
//
// Gửi lại cùng (lenderId, unitId, requestId): không thêm sự kiện, result.status = "DA_GHI_NHAN"
// Tổng khóa sẽ vượt giá trị khả dụng:  result.status = "TU_CHOI", result.availableRemaining
// Thành công: thêm sự kiện vào sổ,       result.status = "OK", result.certificate
export function lockUnit(registry, { lenderId, unitId, requestId, amount, availableValue }) {
  // Lũy đẳng: cùng lenderId + unitId + requestId → trả chứng thư cũ
  const existing = registry.find(
    (e) => e.lenderId === lenderId && e.unitId === unitId && e.requestId === requestId
  )
  if (existing) {
    return { registry, result: { status: 'DA_GHI_NHAN', certificate: existing.certificate } }
  }

  // Kiểm tra overflow: tổng đã khóa + amount mới > giá trị khả dụng?
  const alreadyLocked = computeLockedForUnit(registry, unitId)
  const availableRemaining = Math.max(0, availableValue - alreadyLocked)
  if (amount > availableRemaining + 1e-9) {
    return { registry, result: { status: 'TU_CHOI', availableRemaining } }
  }

  // Thứ tự ưu tiên = số sự kiện trên đơn vị này + 1
  const priority = registry.filter((e) => e.unitId === unitId).length + 1
  const certificate = {
    certificateId: `LOCK-${requestId}`,
    unitId,
    lenderId,
    amount,
    priority,
    requestId,
  }
  const event = { lenderId, unitId, requestId, amount, certificate }
  return { registry: [...registry, event], result: { status: 'OK', certificate } }
}
