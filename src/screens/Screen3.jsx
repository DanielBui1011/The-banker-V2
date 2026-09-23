import { useState } from 'react'
import TopBar from '../components/ui/TopBar.jsx'
import ActProgress from '../components/ui/ActProgress.jsx'
import SurfaceFrame from '../components/ui/SurfaceFrame.jsx'
import Card from '../components/ui/Card.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import Drawer from '../components/ui/Drawer.jsx'
import Callout from '../components/ui/Callout.jsx'
import Stat from '../components/ui/Stat.jsx'
import Button from '../components/ui/Button.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import { AlertTriangle } from 'lucide-react'
import { actForScreen } from '../config/flow.js'
import { BANK_TRANSACTIONS, FEE_DEVIATIONS, RECONCILIATION_COMPARISON, FOOTER_NOTE } from '../data/mockData.js'
import { summarizeTransactions, isFeeDeviationFlagged } from '../logic/reconciliation.js'
import { formatNumberVN, formatDateVN, formatPercentVN } from '../utils/format.js'

const STATUS_LABEL = {
  matched: 'Đã khớp',
  exception: 'Ngoại lệ',
  reversed: 'Hoàn',
  outflow: 'Chi ra',
}

// Ngoại lệ và hoàn lên đầu bảng theo mặc định (Vòng 13) — sort ổn định, giữ
// nguyên thứ tự tương đối trong từng nhóm.
const ROW_PRIORITY = { exception: 0, reversed: 1, matched: 2, outflow: 2 }
const DEFAULT_VISIBLE_ROWS = 8

function formatDateDisplay(isoDate) {
  return `${isoDate.slice(8, 10)}/${isoDate.slice(5, 7)}`
}

// Mã giao dịch đã khớp đóng góp vào thực nhận của một đơn vị — tính từ BANK_TRANSACTIONS,
// không viết cứng (docs/du-lieu.md mục 5).
function contributingCodes(unit) {
  return BANK_TRANSACTIONS.filter((tx) => tx.linkedTo === unit && tx.status === 'matched').map((tx) => tx.code)
}

const COLUMNS = [
  { key: 'date', header: 'Ngày', render: (tx) => formatDateDisplay(tx.date) },
  {
    key: 'amount',
    header: 'Số tiền (triệu)',
    align: 'right',
    render: (tx) => (
      <span className={tx.amount >= 0 ? 'text-slate-900' : 'text-slate-500'}>
        {tx.amount >= 0 ? '+' : ''}
        {formatNumberVN(tx.amount)}
      </span>
    ),
  },
  { key: 'counterparty', header: 'Bên chuyển', render: (tx) => tx.counterparty },
  { key: 'reference', header: 'Nội dung', render: (tx) => tx.reference },
  { key: 'channel', header: 'Kênh', render: (tx) => tx.channel },
  {
    key: 'status',
    header: 'Trạng thái',
    render: (tx) => <StatusBadge status={tx.status} size="sm" />,
  },
  { key: 'matchMethod', header: 'Phương pháp khớp', render: (tx) => tx.matchMethod },
]

export default function Screen3({ onNext }) {
  const [filter, setFilter] = useState('all')
  const [selectedTx, setSelectedTx] = useState(null)
  const [feeDrawerUnit, setFeeDrawerUnit] = useState(null)
  const [expanded, setExpanded] = useState(false)

  const summary = summarizeTransactions(BANK_TRANSACTIONS)
  const total = BANK_TRANSACTIONS.length
  // Con số chính của màn — tỷ lệ giao dịch khớp tự động, tính trực tiếp từ dữ liệu
  // (không viết cứng), trả lời câu hỏi "Đối soát có tự động không?".
  const autoMatchRate = total === 0 ? 0 : summary.matchedCount / total

  // Chip lọc kèm số đếm — tên nhóm giữ nguyên như đã chốt (all/matched/exception/
  // reversed/outflow), số đếm tính từ summary (không viết cứng, docs/du-lieu.md mục 5).
  const filters = [
    { key: 'all', label: 'Tất cả', count: total },
    { key: 'matched', label: 'Đã khớp', count: summary.matchedCount },
    { key: 'exception', label: 'Ngoại lệ', count: summary.exceptionCount },
    { key: 'reversed', label: 'Hoàn', count: summary.reversedCount },
    { key: 'outflow', label: 'Chi ra', count: summary.outflowCount },
  ]

  const filteredRows = filter === 'all' ? BANK_TRANSACTIONS : BANK_TRANSACTIONS.filter((tx) => tx.status === filter)
  // Ngoại lệ và hoàn lên đầu, tối đa 8 dòng cho tới khi bấm "Xem tất cả" (Vòng 13).
  const sortedRows = [...filteredRows].sort((a, b) => ROW_PRIORITY[a.status] - ROW_PRIORITY[b.status])
  const visibleRows = expanded ? sortedRows : sortedRows.slice(0, DEFAULT_VISIBLE_ROWS)

  function selectFilter(key) {
    setFilter(key)
    setExpanded(false)
  }

  return (
    <div className="flex h-full flex-col">
      <TopBar screenNumber={3} />
      <div className="min-h-0 flex-1">
        <SurfaceFrame variant="platform">
          <div className="flex h-full flex-col">
            <div className="border-b border-slate-200 px-12 pb-3 pt-3">
              <ActProgress currentAct={actForScreen(3)} tone="light" />
            </div>

            <main className="flex-1 overflow-y-auto px-12 pt-10 pb-24">
              <div className="mx-auto max-w-[1536px] space-y-6">
                <h1 className="text-screen-title font-bold text-slate-900">Đối soát tự động</h1>
                <p className="text-body text-slate-600">
                  Giao dịch tài khoản Techcombank được đọc qua quyền A1 và tự động khớp với đơn hàng.
                </p>

                {/* Con số chủ đạo đặt cạnh cặp Trước/Sau (Vòng 13) — trả lời "Đối soát có tự
                    động không?" và mức tiết kiệm thời gian trong cùng một khối. */}
                <Card padding="p-8">
                  <div className="grid grid-cols-3 gap-8 divide-x divide-slate-200">
                    <div>
                      <div className="text-label font-medium text-slate-500">Tỷ lệ giao dịch khớp tự động</div>
                      <span className="mt-2 block text-hero font-bold tabular-nums text-teal-700">
                        {formatPercentVN(autoMatchRate)}
                      </span>
                      <div className="mt-3 text-label text-slate-600">
                        {summary.matchedCount}/{total} giao dịch tự khớp
                      </div>
                    </div>
                    <div className="pl-8">
                      <div className="text-label font-medium text-slate-500">Trước — Thủ công</div>
                      <div className="mt-2 text-section-title font-bold text-slate-700">
                        {RECONCILIATION_COMPARISON.beforeHoursPerMonth} giờ/tháng
                      </div>
                    </div>
                    <div className="pl-8">
                      <div className="text-label font-medium text-teal-700">Sau — Tự động</div>
                      <div className="mt-2 text-section-title font-bold text-teal-700">
                        {RECONCILIATION_COMPARISON.afterLabel}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Bốn số liệu phụ, hạ thành một hàng — không cạnh tranh với con số chính */}
                <Card padding="p-4">
                  <div className="grid grid-cols-4 divide-x divide-slate-200">
                    <Stat label="Đã khớp" value={summary.matchedCount} hint={`${formatNumberVN(summary.matchedTotal)} triệu`} className="px-4 first:pl-0" />
                    <Stat label="Ngoại lệ" value={summary.exceptionCount} hint="Cần tra thủ công" className="px-4" />
                    <Stat label="Hoàn" value={summary.reversedCount} hint="Đảo chuyển" className="px-4" />
                    <Stat label="Chi ra" value={summary.outflowCount} hint="Không đối soát" className="px-4" />
                  </div>
                </Card>

                <Card padding="p-0" className="overflow-hidden">
                  <div className="flex flex-wrap gap-2 border-b border-slate-200 p-4">
                    {filters.map((f) => (
                      <button
                        key={f.key}
                        onClick={() => selectFilter(f.key)}
                        className={`rounded-full border px-3 py-1.5 text-label font-medium transition ${
                          filter === f.key
                            ? 'border-navy bg-navy text-white'
                            : 'border-slate-300 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {f.label} ({f.count})
                      </button>
                    ))}
                  </div>

                  <div className="p-4">
                    <DataTable
                      columns={COLUMNS}
                      rows={visibleRows}
                      rowKey={(tx) => tx.code}
                      onRowClick={(tx) => setSelectedTx(tx)}
                    />
                    {sortedRows.length === 0 && (
                      <p className="py-6 text-center text-label text-slate-500">Không có giao dịch nào ở bộ lọc này.</p>
                    )}
                    {!expanded && sortedRows.length > DEFAULT_VISIBLE_ROWS && (
                      <div className="flex justify-center pt-3">
                        <button
                          onClick={() => setExpanded(true)}
                          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-label font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Xem tất cả {sortedRows.length}
                        </button>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Mức nhấn thứ hai — bằng chứng cho cơ chế học ngược biểu phí, không phải con số chính của màn */}
                <div>
                  <div className="mb-3 text-emphasis font-semibold text-slate-900">Phát hiện sai lệch phí</div>
                  <div className="grid grid-cols-2 gap-4">
                    {FEE_DEVIATIONS.map((fd) => {
                      const flagged = isFeeDeviationFlagged(fd.deviationRate)
                      const content = (
                        <>
                          <div className="flex items-center justify-between">
                            <div className="text-emphasis font-semibold text-slate-900">
                              {fd.unit} — {fd.channel}
                            </div>
                            {flagged ? (
                              <span className="flex items-center gap-1.5 text-label font-semibold text-slate-700">
                                <AlertTriangle size={16} className="flex-shrink-0" aria-hidden="true" />
                                Vượt ngưỡng cảnh báo phí
                              </span>
                            ) : (
                              <span className="text-label font-semibold text-slate-500">Trong ngưỡng</span>
                            )}
                          </div>
                          <div className="mt-2 space-y-1 text-label text-slate-600">
                            <div className="flex justify-between">
                              <span>Dự phóng</span>
                              <span className="tabular-nums text-slate-900">{formatNumberVN(fd.projected)} triệu</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Thực nhận</span>
                              <span className="tabular-nums text-slate-900">{formatNumberVN(fd.actual)} triệu</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Chênh lệch</span>
                              <span className={`tabular-nums ${flagged ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
                                {formatNumberVN(fd.deviation)} triệu ({formatPercentVN(fd.deviationRate)})
                              </span>
                            </div>
                          </div>
                        </>
                      )
                      return flagged ? (
                        <button key={fd.unit} onClick={() => setFeeDrawerUnit(fd)} className="text-left">
                          <Card className="border-slate-300 bg-slate-50">{content}</Card>
                        </button>
                      ) : (
                        <Card key={fd.unit}>{content}</Card>
                      )
                    })}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={onNext}>Tiếp →</Button>
                </div>
              </div>
            </main>

            <footer className="border-t border-slate-200 px-12 py-3 text-label text-slate-500">{FOOTER_NOTE}</footer>
          </div>
        </SurfaceFrame>
      </div>

      <Drawer open={selectedTx != null} onClose={() => setSelectedTx(null)} title={selectedTx ? `Giao dịch ${selectedTx.code}` : ''}>
        {selectedTx && (
          <div className="space-y-3 text-body text-slate-700">
            <Row label="Ngày" value={formatDateVN(selectedTx.date)} />
            <Row label="Bên chuyển/nhận" value={selectedTx.counterparty} />
            <Row label="Nội dung" value={selectedTx.reference} />
            <Row label="Kênh" value={selectedTx.channel} />
            <Row
              label="Số tiền"
              value={`${selectedTx.amount >= 0 ? '+' : ''}${formatNumberVN(selectedTx.amount)} triệu`}
            />
            <Row label="Trạng thái" value={STATUS_LABEL[selectedTx.status]} />
            <Row label="Phương pháp khớp" value={selectedTx.matchMethod} />
            <Row label="Liên kết đơn vị" value={selectedTx.linkedTo} />
          </div>
        )}
      </Drawer>

      <Drawer open={feeDrawerUnit != null} onClose={() => setFeeDrawerUnit(null)} title={feeDrawerUnit ? `Sai lệch phí ${feeDrawerUnit.unit}` : ''}>
        {feeDrawerUnit && (
          <div className="space-y-4">
            <Callout variant="warn">Từ {contributingCodes(feeDrawerUnit.unit).join(' + ')}</Callout>
            <div className="space-y-3 text-body text-slate-700">
              <Row label="Đơn vị liên quan" value={`${feeDrawerUnit.unit} — ${feeDrawerUnit.channel}`} />
              <Row label="Dự phóng" value={`${formatNumberVN(feeDrawerUnit.projected)} triệu`} />
              <Row label="Thực nhận" value={`${formatNumberVN(feeDrawerUnit.actual)} triệu`} />
              <Row
                label="Chênh lệch"
                value={`${formatNumberVN(feeDrawerUnit.deviation)} triệu (${formatPercentVN(feeDrawerUnit.deviationRate)})`}
              />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
      <span className="text-label text-slate-500">{label}</span>
      <span className="text-body font-medium text-slate-900">{value}</span>
    </div>
  )
}
