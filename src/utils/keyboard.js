// Dùng chung cho mọi trình xử lý phím tắt (Stage, App) — chặn phím tắt khi người
// trình bày đang gõ vào input/textarea/select (docs/thiet-ke.md mục 1).
export function isTypingTarget(target) {
  const tag = target?.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || Boolean(target?.isContentEditable)
}
