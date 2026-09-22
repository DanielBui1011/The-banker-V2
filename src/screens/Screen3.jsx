import { useState } from 'react'
import ScreenShell from '../components/ScreenShell.jsx'
import { BANK_TRANSACTIONS, FEE_DEVIATIONS, RECONCILIATION_COMPARISON } from '../data/mockData.js'
import { summarizeTransactions, isFeeDeviationFlagged } from '../logic/reconciliation.js'
import { formatNumberVN } from '../utils/format.js'

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'matched', label: 'Đã khớp' },
  { key: 'exception', label: 'Ngoại lệ' },
  { key: 'reversed', label: 'Hoàn' },
  { key: 'outflow', label: 'Chi ra' },
]

const STATUS_LABEL = {
  matched: 'Đã khớp',
  exception: 'Ngoại lệ',
  reversed: 'Hoàn',
  outflow: 'Chi ra',
}

// Màu trạng thái theo docs/man-hinh.md Màn 3: Đã khớp teal, Ngoại lệ amber,
// Hoàn gray, Chi ra gray nhạt (mờ hơn Hoàn).
const STATUS_STYLE = {
  matched: 'text-teal-400',
  exception: 'text-amber-300 font-semibold',
  reversed: 'text-slate-400',
  outflow: 'text-slate-600',
}

function formatDateDisplay(isoDate) {
  return `${isoDate.slice(8, 10)}/${isoDate.slice(5, 7)}`
}

export default function Screen3({ onNext }) {
  const [filter, setFilter] = useState('all')
  const [showExceptions, setShowExceptions] = useState(false)
  const [attachedCodes, setAttachedCodes] = useState([])

  const summary = summarizeTransactions(BANK_TRANSACTIONS)
  const filteredRows = filter === 'all' ? BANK_TRANSACTIONS : BANK_TRANSACTIONS.filter((tx) => tx.status === filter)
  const exceptionRows = BANK_TRANSACTIONS.filter((tx) => tx.status === 'exception')

  function attachToOrder(code) {
    setAttachedCodes((codes) => (codes.includes(code) ? codes : [...codes, code]))
  }

  return (
    <ScreenShell screenNumber={3} title="Đối soát tự động">
      <div className="space-y-6">
        <p className="text-lg text-slate-400">
          Giao dịch tài khoản Techcombank được đọc qua quyền A1 và tự động khớp với đơn hàng.
        </p>

        {/* Khối tóm tắt — tính trực tiếp từ BANK_TRANSACTIONS, không viết cứng số */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-xl border border-teal-800/60 bg-teal-950/20 p-4">
            <div className="text-base text-teal-300">Đã khớp</div>
            <div className="mt-1 text-3xl font-bold text-teal-200">{summary.matchedCount}</div>
            <div className="mt-1 text-base text-slate-400">{formatNumberVN(summary.matchedTotal)} triệu tổng cộng</div>
          </div>
          <div className="rounded-xl border border-amber-800/60 bg-amber-950/20 p-4">
            <div className="text-base text-amber-300">Ngoại lệ</div>
            <div className="mt-1 text-3xl font-bold text-amber-200">{summary.exceptionCount}</div>
            <div className="mt-1 text-base text-slate-400">Cần tra thủ công</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="text-base text-slate-400">Hoàn</div>
            <div className="mt-1 text-3xl font-bold text-slate-200">{summary.reversedCount}</div>
            <div className="mt-1 text-base text-slate-500">Đảo chuyển</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="text-base text-slate-500">Chi ra</div>
            <div className="mt-1 text-3xl font-bold text-slate-400">{summary.outflowCount}</div>
            <div className="mt-1 text-base text-slate-600">Không đối soát</div>
          </div>
        </div>

        {/* Bảng giao dịch — thẻ lọc + cuộn trong khung ~10 dòng */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-4">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`rounded-full border px-3 py-1.5 text-base font-medium transition ${
                    filter === f.key
                      ? 'border-blue-600 bg-blue-950/50 text-blue-300'
                      : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowExceptions(true)}
              className="rounded-lg border border-amber-700 bg-amber-950/40 px-3 py-1.5 text-base font-medium text-amber-300 hover:bg-amber-900/40"
            >
              Xử lý ngoại lệ ({exceptionRows.length})
            </button>
          </div>

          <div className="max-h-[440px] overflow-y-auto">
            <table className="w-full text-base">
              <thead className="sticky top-0 bg-slate-900">
                <tr className="border-b border-slate-800 text-left text-slate-500">
                  <th className="py-2 pl-4 pr-3 font-medium">Ngày</th>
                  <th className="py-2 pr-3 text-right font-medium">Số tiền</th>
                  <th className="py-2 pr-3 font-medium">Bên chuyển</th>
                  <th className="py-2 pr-3 font-medium">Nội dung</th>
                  <th className="py-2 pr-3 font-medium">Kênh</th>
                  <th className="py-2 pr-3 font-medium">Trạng thái</th>
                  <th className="py-2 pr-4 font-medium">Phương pháp khớp</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((tx) => (
                  <tr key={tx.code} className="border-b border-slate-800/60">
                    <td className="py-2 pl-4 pr-3 whitespace-nowrap text-slate-300">{formatDateDisplay(tx.date)}</td>
                    <td
                      className={`py-2 pr-3 text-right whitespace-nowrap ${
                        tx.amount >= 0 ? 'text-slate-200' : 'text-slate-400'
                      }`}
                    >
                      {tx.amount >= 0 ? '+' : ''}
                      {formatNumberVN(tx.amount)}
                    </td>
                    <td className="py-2 pr-3 text-slate-300">{tx.counterparty}</td>
                    <td className="py-2 pr-3 text-slate-400">{tx.reference}</td>
                    <td className="py-2 pr-3 text-slate-400">{tx.channel}</td>
                    <td className={`py-2 pr-3 whitespace-nowrap ${STATUS_STYLE[tx.status]}`}>
                      {STATUS_LABEL[tx.status]}
                    </td>
                    <td className="py-2 pr-4 text-slate-400">{tx.matchMethod}</td>
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-500">
                      Không có giao dịch nào ở bộ lọc này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Phát hiện sai lệch phí — cảnh báo khi chênh lệch trên 1,5% */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-3 text-xl font-semibold text-slate-200">Phát hiện sai lệch phí</div>
          <div className="grid grid-cols-2 gap-4">
            {FEE_DEVIATIONS.map((fd) => {
              const flagged = isFeeDeviationFlagged(fd.deviationRate)
              return (
                <div
                  key={fd.unit}
                  className={`rounded-lg border p-4 ${
                    flagged ? 'border-amber-700/60 bg-amber-950/20' : 'border-slate-800 bg-slate-950/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-slate-100">
                      {fd.unit} — {fd.channel}
                    </div>
                    <span className={`text-base font-semibold ${flagged ? 'text-amber-300' : 'text-slate-400'}`}>
                      {flagged ? 'Cảnh báo' : 'Trong ngưỡng'}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-base text-slate-400">
                    <div className="flex justify-between">
                      <span>Dự phóng</span>
                      <span className="text-slate-200">{formatNumberVN(fd.projected)} triệu</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thực nhận</span>
                      <span className="text-slate-200">{formatNumberVN(fd.actual)} triệu</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chênh lệch</span>
                      <span className={flagged ? 'text-amber-300' : 'text-slate-300'}>
                        {formatNumberVN(fd.deviation)} triệu ({formatNumberVN(fd.deviationRate * 100)}%)
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Khối so sánh trước/sau — tái sử dụng từ bản cũ */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="mb-3 text-base font-medium text-slate-500">Trước — Thủ công</div>
            <div className="text-3xl font-bold text-slate-300">
              {RECONCILIATION_COMPARISON.beforeHoursPerMonth} giờ/tháng
            </div>
          </div>
          <div className="rounded-xl border border-teal-800/60 bg-teal-950/20 p-4">
            <div className="mb-3 text-base font-medium text-teal-300">Sau — Tự động</div>
            <div className="text-3xl font-bold text-teal-200">{RECONCILIATION_COMPARISON.afterLabel}</div>
          </div>
        </div>

        <button
          onClick={onNext}
          className="w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white transition hover:bg-blue-500"
        >
          Tiếp →
        </button>
      </div>

      {showExceptions && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-6">
          <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-100">Xử lý ngoại lệ</h2>
              <button
                onClick={() => setShowExceptions(false)}
                className="rounded-lg border border-slate-700 px-3 py-1.5 text-base text-slate-300 hover:bg-slate-800"
              >
                Đóng
              </button>
            </div>
            <div className="space-y-3">
              {exceptionRows.map((tx) => {
                const attached = attachedCodes.includes(tx.code)
                return (
                  <div
                    key={tx.code}
                    className="flex items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-950/40 p-4"
                  >
                    <div>
                      <div className="text-lg font-semibold text-white">
                        {tx.code} — {formatDateDisplay(tx.date)}
                      </div>
                      <div className="text-base text-slate-400">
                        {tx.counterparty} · {tx.reference} · {tx.amount >= 0 ? '+' : ''}
                        {formatNumberVN(tx.amount)} triệu
                      </div>
                    </div>
                    <button
                      onClick={() => attachToOrder(tx.code)}
                      disabled={attached}
                      className={`shrink-0 rounded-lg px-4 py-2 text-base font-semibold transition ${
                        attached
                          ? 'cursor-default bg-teal-900/50 text-teal-300'
                          : 'border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      {attached ? 'Đã gắn ✓' : 'Gắn với đơn hàng'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </ScreenShell>
  )
}
