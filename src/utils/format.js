// Định dạng số theo quy ước hiển thị của dự án (docs/du-lieu.md mục 1):
// dấu phẩy là dấu thập phân, 1 chữ số thập phân.
export function formatNumberVN(value, decimals = 1) {
  return value.toLocaleString('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatMillion(value, decimals = 1) {
  return `${formatNumberVN(value, decimals)} triệu`
}
