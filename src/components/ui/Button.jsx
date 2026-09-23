// Button (Vòng 12 mục 6) — thay các nút hành động rộng hết trang: nút chính
// (primary) rộng theo nội dung, tối thiểu 280px; nút phụ (secondary) viền.
// Đặt trong hàng `justify-end` ở từng màn để nút chính căn phải.
const VARIANT = {
  primary:
    'min-w-[280px] rounded-xl bg-navy px-8 py-3 text-emphasis font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:hover:bg-slate-300',
  secondary:
    'rounded-xl border border-slate-300 bg-white px-8 py-3 text-emphasis font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60',
}

export default function Button({ variant = 'primary', className = '', ...props }) {
  return <button className={`${VARIANT[variant] ?? VARIANT.primary} ${className}`} {...props} />
}
