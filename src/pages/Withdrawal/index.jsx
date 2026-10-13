import { useState, useMemo } from 'react'
import {
  ArrowUpFromLine, CheckCircle2, Clock, AlertCircle, Copy, Check,
  Search, FileSpreadsheet, Eye, DollarSign, Wallet, ShieldCheck,
  Building2, ArrowUpRight, TrendingDown, Send, Printer
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, Modal, useToast, money } from '@/components/ui'

const SEED_WITHDRAWALS = [
  { id: 1, req_id: 'WD_4401', user_id: 'VN_78291', user_name: 'Vikram Rawat', bank: 'HDFC Bank', acc_no: '501002938471', ifsc: 'HDFC0001245', holder: 'Vikram Rawat', amount: 12000, status: 'Approved', date: '13 Oct 2026 09:00 AM' },
  { id: 2, req_id: 'WD_4402', user_id: 'VN_44102', user_name: 'Aman Verma', bank: 'ICICI Bank', acc_no: '001201928374', ifsc: 'ICIC0000012', holder: 'Aman Verma', amount: 8500, status: 'Pending', date: '13 Oct 2026 09:25 AM' },
  { id: 3, req_id: 'WD_4403', user_id: 'VN_99214', user_name: 'Kunal Joshi', bank: 'State Bank of India', acc_no: '30291827461', ifsc: 'SBIN0004521', holder: 'Kunal Joshi', amount: 15000, status: 'Pending', date: '13 Oct 2026 09:30 AM' },
  { id: 4, req_id: 'WD_4404', user_id: 'VN_12890', user_name: 'Pooja Singh', bank: 'Axis Bank', acc_no: '918273645012', ifsc: 'UTIB0000213', holder: 'Pooja Singh', amount: 4000, status: 'Approved', date: '13 Oct 2026 08:45 AM' },
  { id: 5, req_id: 'WD_4405', user_id: 'VN_88201', user_name: 'Deepak Mehta', bank: 'Kotak Bank', acc_no: '48192039481', ifsc: 'KKBK0000192', holder: 'Deepak Mehta', amount: 20000, status: 'Rejected', date: '12 Oct 2026 07:15 PM' },
  { id: 6, req_id: 'WD_4406', user_id: 'VN_63019', user_name: 'Sneha Patel', bank: 'HDFC Bank', acc_no: '501009182736', ifsc: 'HDFC0001245', holder: 'Sneha Patel', amount: 25000, status: 'Pending', date: '13 Oct 2026 09:45 AM' },
]

export default function Withdrawal() {
  const [rows, setRows] = useState(() => {
    const raw = localStorage.getItem('veronova_withdrawals_v1')
    return raw ? JSON.parse(raw) : SEED_WITHDRAWALS
  })
  const [filterTab, setFilterTab] = useState('ALL') // ALL, APPROVED, PENDING, REJECTED, HIGH
  const [copiedKey, setCopiedKey] = useState(null)
  const [voucherModal, setVoucherModal] = useState(null)
  const [toast, node] = useToast()

  const persist = (next) => {
    setRows(next)
    localStorage.setItem('veronova_withdrawals_v1', JSON.stringify(next))
  }

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1800)
    toast(`Copied ${text} to clipboard!`)
  }

  const approvedSum = useMemo(() => rows.filter((r) => r.status === 'Approved').reduce((acc, r) => acc + r.amount, 0), [rows])
  const pendingRows = useMemo(() => rows.filter((r) => r.status === 'Pending'), [rows])
  const pendingSum = useMemo(() => pendingRows.reduce((acc, r) => acc + r.amount, 0), [pendingRows])

  const displayRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterTab === 'APPROVED' && r.status !== 'Approved') return false
      if (filterTab === 'PENDING' && r.status !== 'Pending') return false
      if (filterTab === 'REJECTED' && r.status !== 'Rejected') return false
      if (filterTab === 'HIGH' && r.amount < 10000) return false
      return true
    })
  }, [rows, filterTab])

  const handleApprove = (row) => {
    const next = rows.map((r) => (r.id === row.id ? { ...r, status: 'Approved' } : r))
    persist(next)
    toast(`Withdrawal #${row.req_id} approved! ₹${row.amount.toLocaleString('en-IN')} sent via IMPS.`)
  }

  const handleReject = (row) => {
    const next = rows.map((r) => (r.id === row.id ? { ...r, status: 'Rejected' } : r))
    persist(next)
    toast(`Withdrawal #${row.req_id} rejected. Balance refunded to player wallet.`)
  }

  const exportCols = [
    { key: 'id', label: 'ID' },
    { key: 'req_id', label: 'Request ID' },
    { key: 'user_name', label: 'Player Name' },
    { key: 'user_id', label: 'User ID' },
    { key: 'bank', label: 'Bank Name' },
    { key: 'acc_no', label: 'Account Number' },
    { key: 'ifsc', label: 'IFSC Code' },
    { key: 'holder', label: 'Account Holder' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Timestamp' },
  ]

  const cols = [
    { key: 'id', label: '#ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    {
      key: 'player',
      label: 'Player Details',
      render: (r) => (
        <div className="min-w-[160px]">
          <span className="font-extrabold text-slate-900 text-sm block hover:text-blue-600 transition-colors">{r.user_name}</span>
          <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1 rounded">{r.user_id}</span>
        </div>
      ),
    },
    {
      key: 'bank',
      label: 'Bank Account & Beneficiary',
      render: (r) => (
        <div className="min-w-[210px] text-xs">
          <span className="font-bold text-slate-800 block">{r.bank}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">{r.acc_no}</span>
            <button onClick={() => handleCopy(r.acc_no, `acc_${r.id}`)} className="text-slate-400 hover:text-slate-600" title="Copy Account No">
              {copiedKey === `acc_${r.id}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
            </button>
          </div>
          <span className="font-mono text-[10px] text-slate-500 block mt-0.5">IFSC: {r.ifsc} • {r.holder}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Payout Amount',
      render: (r) => (
        <span className="font-black text-slate-900 text-sm">
          ₹{r.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
            r.status === 'Approved'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : r.status === 'Pending'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {r.status === 'Approved' ? <CheckCircle2 size={12} /> : r.status === 'Pending' ? <Clock size={12} /> : <AlertCircle size={12} />}
          {r.status}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Timestamp',
      render: (r) => <span className="font-mono text-xs text-slate-400 block whitespace-nowrap">{r.date}</span>,
    },
    {
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1">
          {r.status === 'Pending' && (
            <>
              <button
                onClick={() => handleApprove(r)}
                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs flex items-center gap-1"
              >
                <Send size={11} /> Pay Now
              </button>
              <button
                onClick={() => handleReject(r)}
                className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700 hover:bg-rose-600 hover:text-white transition"
              >
                Reject
              </button>
            </>
          )}
          <button
            onClick={() => setVoucherModal(r)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition"
            title="View Payout Voucher"
          >
            <Eye size={13} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageBanner
        title="Withdrawal Requests & Payout Desk"
        icon={ArrowUpFromLine}
        crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Payouts & Cashouts' }]}
      />

      {/* Compact, Sleek Withdrawal Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Disbursement Queue</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              ₹{pendingSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Awaiting bank IMPS</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Clock size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Settled Cashouts</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              ₹{approvedSum.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Direct IMPS credited</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Cashouts</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {rows.length} Payouts
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Automated banking pipeline</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ArrowUpFromLine size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Success Rate</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              99.8%
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Reserve liquidity backed</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <ShieldCheck size={18} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All Payouts', count: rows.length },
              { id: 'PENDING', label: 'Pending Approval', count: pendingRows.length },
              { id: 'APPROVED', label: 'Settled', count: rows.filter((r) => r.status === 'Approved').length },
              { id: 'REJECTED', label: 'Rejected', count: rows.filter((r) => r.status === 'Rejected').length },
              { id: 'HIGH', label: 'High Value (≥₹10k)', count: rows.filter((r) => r.amount >= 10000).length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  filterTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-black">{tab.count}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => exportCSV('withdrawals_payout_ledger', exportCols, displayRows)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <FileSpreadsheet size={15} /> Export to Excel
          </button>
        </div>

        <DataTable columns={cols} rows={displayRows} unit="payouts" placeholder="Search by account number, IFSC, or player name..." />
      </div>

      {/* Payout Voucher Modal */}
      {voucherModal && (
        <Modal isOpen={!!voucherModal} onClose={() => setVoucherModal(null)} title={`Payout Voucher: #${voucherModal.req_id}`} maxWidth="max-w-md">
          <div className="space-y-3 text-xs">
            <div className="rounded-xl bg-slate-900 p-4 text-white">
              <p className="text-slate-400 font-bold uppercase text-[10px]">Beneficiary Payout Details</p>
              <p className="text-2xl font-black mt-1 font-mono">₹{voucherModal.amount.toLocaleString('en-IN')}</p>
              <p className="text-slate-300 font-mono mt-1">A/C: {voucherModal.acc_no}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-100">
              <div className="flex justify-between"><span>Beneficiary Name:</span><strong>{voucherModal.holder}</strong></div>
              <div className="flex justify-between"><span>Bank Name:</span><strong>{voucherModal.bank}</strong></div>
              <div className="flex justify-between"><span>IFSC Code:</span><strong className="font-mono">{voucherModal.ifsc}</strong></div>
              <div className="flex justify-between"><span>Player ID:</span><strong className="font-mono">{voucherModal.user_id}</strong></div>
              <div className="flex justify-between"><span>Status:</span><strong className={voucherModal.status === 'Approved' ? 'text-emerald-600' : 'text-amber-600'}>{voucherModal.status}</strong></div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => window.print()} className="rounded-xl border px-3 py-2 text-xs font-bold text-slate-700 flex items-center gap-1">
                <Printer size={13} /> Print
              </button>
              <button onClick={() => setVoucherModal(null)} className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}

