// Định dạng số theo quy ước hiển thị của dự án (docs/du-lieu.md mục 1):
// dấu phẩy là dấu thập phân; số nguyên không hiện phần thập phân;
// số có phần lẻ hiện tối đa 2 chữ số thập phân, bỏ số 0 thừa.
export function formatNumberVN(value) {
  const rounded = Math.round(value * 100) / 100
  return rounded.toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

// Định dạng tỷ lệ phần trăm — luôn hiện đúng 1 chữ số thập phân (85,0%),
// khác quy tắc số tiền ở trên. value là số thập phân (0,85 → "85,0%").
export function formatPercentVN(value) {
  const rounded = Math.round(value * 1000) / 10
  return `${rounded.toLocaleString('vi-VN', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`
}
