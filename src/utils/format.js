// Định dạng số theo quy ước hiển thị của dự án (docs/du-lieu.md mục 1):
// dấu phẩy là dấu thập phân; số nguyên không hiện phần thập phân;
// số có phần lẻ hiện tối đa 1 chữ số thập phân, làm tròn.
export function formatNumberVN(value) {
  const rounded = Math.round(value * 10) / 10
  const hasDecimal = !Number.isInteger(rounded)
  return rounded.toLocaleString('vi-VN', {
    minimumFractionDigits: hasDecimal ? 1 : 0,
    maximumFractionDigits: 1,
  })
}
