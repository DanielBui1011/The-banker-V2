// DataTable (docs/thiet-ke.md mục 4) — hàng cao ≥ 56px (h-14), số căn phải.
// columns: [{ key, header, align, render? }]. rows: mảng dữ liệu. rowKey(row) => string.
// onRowClick(row)? — khi có, mỗi hàng bấm được (ví dụ mở Drawer chi tiết).
export default function DataTable({ columns, rows, rowKey, onRowClick }) {
  return (
    <table className="w-full text-label">
      <thead>
        <tr className="border-b border-slate-200 text-left text-slate-500">
          {columns.map((col) => (
            <th key={col.key} className={`px-3 py-2 font-medium ${col.align === 'right' ? 'text-right' : 'text-left'}`}>
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={rowKey(row)}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={`h-14 border-b border-slate-100 ${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''}`}
          >
            {columns.map((col) => (
              <td
                key={col.key}
                className={`px-3 tabular-nums ${col.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                {col.render ? col.render(row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
