import { useState } from 'react'
import { AlertTriangle, Hourglass, Link2 } from 'lucide-react'
import Card from '../components/ui/Card.jsx'
import DataTable from '../components/ui/DataTable.jsx'
import Drawer from '../components/ui/Drawer.jsx'
import Callout from '../components/ui/Callout.jsx'
import Stat from '../components/ui/Stat.jsx'
import StatusBadge from '../components/ui/StatusBadge.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import DoneCheck from '../components/ui/DoneCheck.jsx'
import Term from '../components/ui/Term.jsx'
import {
  BANK_TRANSACTIONS,
  FEE_DEVIATIONS,
  RECONCILIATION_COMPARISON,
  SELLER_PROFILE,
  VERIFICATION_METRICS,
  MIN_LOTS_FOR_SCORE,
} from '../data/mockData.js'
import { summarizeTransactions, isFeeDeviationFlagged } from '../logic/reconciliation.js'
import { availability } from '../logic/journey.js'
import { formatNumberVN, formatDateVN, formatPercentVN } from '../utils/format.js'
import { useApp } from '../state/appState.jsx'

// Đối soát (Màn 3 cũ, san-pham.md B.1 Tầng 1). Dữ liệu chỉ có từ 15/09 (mục E); trước đó
// là trạng thái trống có lý do + nút, đọc từ availability(state, 'viewReconciliation').
const STATUS_LABEL = { matched: 'Đã khớp', exception: 'Ngoại lệ', reversed: 'Hoàn', outflow: 'Chi ra' }
// Ngoại lệ và hoàn lên đầu bảng (Vòng 13) — sort ổn định.
const ROW_PRIORITY = { exception: 0, reversed: 1, matched: 2, outflow: 2 }
const DEFAULT_VISIBLE_ROWS = 6
const ddmm = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`
const EXCEPTIONS = BANK_TRANSACTIONS.filter((tx) => tx.status === 'exception')

// Mã giao dịch đã khớp đóng góp vào thực nhận của một đơn vị (du-lieu.md mục 5)
const contributingCodes = (unit) =>
  BANK_TRANSACTIONS.filter((tx) => tx.linkedTo === unit && tx.status === 'matched').map((tx) => tx.code)

const COLUMNS = [
  { key: 'date', header: 'Ngày', render: (tx) => ddmm(tx.date) },
  {
    key: 'amount',
    header: 'Số tiền (triệu)',
    align: 'right',
    render: (tx) => `${tx.amount >= 0 ? '+' : ''}${formatNumberVN(tx.amount)}`,
  },
  { key: 'counterparty', header: 'Bên chuyển', render: (tx) => tx.counterparty },
  { key: 'reference', header: 'Nội dung', render: (tx) => tx.reference },
  { key: 'status', header: 'Trạng thái', render: (tx) => <StatusBadge status={tx.status} size="sm" /> },
  { key: 'matchMethod', header: 'Phương pháp khớp', render: (tx) => tx.matchMethod },
]

export default function DoiSoat() {
  const { state } = useApp()
  const gate = availability(state, 'viewReconciliation')
  if (!gate.ok) return <NotYet gate={gate} />
  return <Reconciliation revoked={state.consents.A1 === 'revoked'} />
}

// Trước khi có dữ liệu: chưa kết nối → Kết nối; đã kết nối 01/08 → đang tích lũy lô (hanh-trinh 1.6)
function NotYet({ gate }) {
  const { state } = useApp()
  if (state.consents.A1 === 'none') {
    return (
      <EmptyState icon={Link2} gate={gate} title="Chưa có dữ liệu">
        <p>
          Kết nối tài khoản Techcombank để app đọc giao dịch và tự <Term name="Đối soát">đối soát</Term> với đơn hàng.
        </p>
      </EmptyState>
    )
  }
  return (
    <EmptyState icon={Hourglass} gate={gate} title={`Đang tích lũy lịch sử — cần ${MIN_LOTS_FOR_SCORE} lô tất toán mỗi kênh`}>
      <p className="flex items-center gap-2 font-medium text-ink">
        <span className="text-primary">
          <DoneCheck size={24} />
        </span>
        Đã kết nối tài khoản {SELLER_PROFILE.paymentAccount}
      </p>
      <p>
        Mỗi lần sàn trả tiền về tài khoản là một <Term name="Lô tất toán">lô tất toán</Term>. App so tiền về với dự phóng lập trước
        đó — đủ {MIN_LOTS_FOR_SCORE} lô thì kênh có <Term name="Điểm xác thực">điểm xác thực</Term>.
      </p>
      <ul className="flex gap-6">
        {Object.keys(VERIFICATION_METRICS).map((channel) => (
          <li key={channel}>
            {channel}: <span className="font-semibold tabular-nums text-ink">0/{MIN_LOTS_FOR_SCORE} lô</span>
          </li>
        ))}
      </ul>
    </EmptyState>
  )
}

function Reconciliation({ revoked }) {
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(false)
  const [selectedTx, setSelectedTx] = useState(null)
  const [feeUnit, setFeeUnit] = useState(null)
  const [exceptionsOpen, setExceptionsOpen] = useState(false)

  const summary = summarizeTransactions(BANK_TRANSACTIONS)
  const total = BANK_TRANSACTIONS.length
  const autoMatchRate = total === 0 ? 0 : summary.matchedCount / total
  const flagged = FEE_DEVIATIONS.filter((fd) => isFeeDeviationFlagged(fd.deviationRate))

  const filters = [
    { key: 'all', label: 'Tất cả', count: total },
    { key: 'matched', label: 'Đã khớp', count: summary.matchedCount },
    { key: 'exception', label: 'Ngoại lệ', count: summary.exceptionCount },
    { key: 'reversed', label: 'Hoàn', count: summary.reversedCount },
    { key: 'outflow', label: 'Chi ra', count: summary.outflowCount },
  ]
  const rows = (filter === 'all' ? BANK_TRANSACTIONS : BANK_TRANSACTIONS.filter((tx) => tx.status === filter))
    .slice()
    .sort((a, b) => ROW_PRIORITY[a.status] - ROW_PRIORITY[b.status])
  const visibleRows = expanded ? rows : rows.slice(0, DEFAULT_VISIBLE_ROWS)

  return (
    <>
      {revoked && <Callout variant="info">Quyền đối soát A1 đã rút — số liệu dừng ở lần đồng bộ cuối, không cập nhật thêm.</Callout>}

      <Card padding="p-6">
        <div className="grid grid-cols-3 gap-6 divide-x divide-line">
          <div>
            <div className="text-label font-medium text-ink-muted">Tỷ lệ giao dịch khớp tự động</div>
            <span className="mt-1 block text-hero font-bold tabular-nums text-teal-700">{formatPercentVN(autoMatchRate)}</span>
            <div className="mt-1 text-label text-ink-muted">
              {summary.matchedCount}/{total} giao dịch {ddmm(BANK_TRANSACTIONS[0].date)}–{ddmm(BANK_TRANSACTIONS[total - 1].date)}
            </div>
          </div>
          <div className="pl-6">
            <div className="text-label font-medium text-ink-muted">Trước — thủ công</div>
            <div className="mt-2 text-section-title font-bold text-ink">{RECONCILIATION_COMPARISON.beforeHoursPerMonth} giờ/tháng</div>
          </div>
          <div className="pl-6">
            <div className="text-label font-medium text-teal-700">Sau — tự động</div>
            <div className="mt-2 text-section-title font-bold text-teal-700">{RECONCILIATION_COMPARISON.afterLabel}</div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-4 divide-x divide-line border-t border-line pt-4">
          <Stat label="Đã khớp" value={summary.matchedCount} hint={`${formatNumberVN(summary.matchedTotal)} triệu`} className="pr-4" />
          <div className="px-4">
            <Stat label={<Term name="Ngoại lệ" />} value={summary.exceptionCount} hint="Cần tra thủ công" />
            <button
              type="button"
              onClick={() => setExceptionsOpen(true)}
              className="mt-2 rounded-lg border border-primary px-3 py-1 text-label font-semibold text-primary transition duration-fast hover:bg-primary-soft"
            >
              Xử lý ngoại lệ
            </button>
          </div>
          <Stat label="Hoàn" value={summary.reversedCount} hint="Đảo chuyển" className="px-4" />
          <Stat label="Chi ra" value={summary.outflowCount} hint="Không đối soát" className="px-4" />
        </div>
      </Card>

      {flagged.map((fd) => (
        <button key={fd.unit} type="button" onClick={() => setFeeUnit(fd)} className="block w-full text-left">
          <Card padding="p-4" className="flex items-center gap-3 transition duration-fast hover:bg-app-bg">
            <AlertTriangle size={20} className="flex-shrink-0 text-ink" aria-hidden="true" />
            <span className="flex-1 text-body text-ink">
              <span className="font-semibold">Sai lệch phí {fd.unit} — {fd.channel}:</span> dự phóng {formatNumberVN(fd.projected)}, thực nhận{' '}
              {formatNumberVN(fd.actual)} (lệch {formatPercentVN(fd.deviationRate)}, vượt ngưỡng cảnh báo)
            </span>
            <span className="text-label font-semibold text-primary">Xem chi tiết</span>
          </Card>
        </button>
      ))}

      <Card padding="p-0" className="overflow-hidden">
        <div className="flex flex-wrap gap-2 border-b border-line p-4">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => {
                setFilter(f.key)
                setExpanded(false)
              }}
              className={`rounded-full border px-3 py-1.5 text-label font-medium transition duration-fast ${
                filter === f.key ? 'border-primary bg-primary text-white' : 'border-line bg-app-bg text-ink hover:bg-app-surface'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
        <div className="p-4">
          <DataTable columns={COLUMNS} rows={visibleRows} rowKey={(tx) => tx.code} onRowClick={setSelectedTx} />
          {!expanded && rows.length > DEFAULT_VISIBLE_ROWS && (
            <div className="flex justify-center pt-3">
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="rounded-lg border border-line px-4 py-2 text-label font-medium text-ink transition duration-fast hover:bg-app-bg"
              >
                Xem tất cả {rows.length}
              </button>
            </div>
          )}
        </div>
      </Card>

      <Drawer open={exceptionsOpen} onClose={() => setExceptionsOpen(false)} title={`Ngoại lệ cần tra thủ công (${EXCEPTIONS.length})`}>
        <div className="space-y-4">
          <p className="text-body text-ink-muted">Khoản tiền về không tự khớp được với đơn nào. Đối chiếu tay với đơn hàng rồi ghi chú.</p>
          {EXCEPTIONS.map((tx) => (
            <Card key={tx.code} padding="p-4" className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-emphasis font-semibold text-ink">{tx.code}</span>
                <StatusBadge status="exception" size="sm" />
              </div>
              <Row label="Ngày" value={formatDateVN(tx.date)} />
              <Row label="Số tiền" value={`+${formatNumberVN(tx.amount)} triệu`} />
              <Row label="Bên chuyển" value={tx.counterparty} />
              <Row label="Nội dung" value={tx.reference} />
            </Card>
          ))}
        </div>
      </Drawer>

      <Drawer open={selectedTx != null} onClose={() => setSelectedTx(null)} title={selectedTx ? `Giao dịch ${selectedTx.code}` : ''}>
        {selectedTx && (
          <div className="space-y-3">
            <Row label="Ngày" value={formatDateVN(selectedTx.date)} />
            <Row label="Bên chuyển/nhận" value={selectedTx.counterparty} />
            <Row label="Nội dung" value={selectedTx.reference} />
            <Row label="Kênh" value={selectedTx.channel} />
            <Row label="Số tiền" value={`${selectedTx.amount >= 0 ? '+' : ''}${formatNumberVN(selectedTx.amount)} triệu`} />
            <Row label="Trạng thái" value={STATUS_LABEL[selectedTx.status]} />
            <Row label="Phương pháp khớp" value={selectedTx.matchMethod} />
            <Row label="Liên kết đơn vị" value={selectedTx.linkedTo} />
          </div>
        )}
      </Drawer>

      <Drawer open={feeUnit != null} onClose={() => setFeeUnit(null)} title={feeUnit ? `Sai lệch phí ${feeUnit.unit}` : ''}>
        {feeUnit && (
          <div className="space-y-3">
            <Callout variant="info">Từ {contributingCodes(feeUnit.unit).join(' + ')}</Callout>
            <Row label="Đơn vị liên quan" value={`${feeUnit.unit} — ${feeUnit.channel}`} />
            <Row label="Dự phóng" value={`${formatNumberVN(feeUnit.projected)} triệu`} />
            <Row label="Thực nhận" value={`${formatNumberVN(feeUnit.actual)} triệu`} />
            <Row label="Chênh lệch" value={`${formatNumberVN(feeUnit.deviation)} triệu (${formatPercentVN(feeUnit.deviationRate)})`} />
          </div>
        )}
      </Drawer>
    </>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line pb-2">
      <span className="text-label text-ink-muted">{label}</span>
      <span className="text-right text-body font-medium text-ink">{value}</span>
    </div>
  )
}
