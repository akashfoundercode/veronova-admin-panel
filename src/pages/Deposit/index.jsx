import { useState, useMemo } from 'react'
import {
  ArrowDownToLine, CheckCircle2, Clock, AlertCircle, Copy, Check,
  Search, FileSpreadsheet, Eye, DollarSign, Wallet, ShieldCheck,
  TrendingUp, RefreshCw, X, Filter, Sparkles
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, Modal, useToast, money } from '@/components/ui'

const SEED_DEPOSITS = [
  { id: 1, txn_id: 'DEP_992014', utr: '428910293847', user_id: 'VN_78291', user_name: 'Vikram Rawat', channel: 'PhonePe UPI', amount: 15000, status: 'Approved', date: '13 Oct 2026 09:15 AM' },
  { id: 2, txn_id: 'DEP_992015', utr: '428910293848', user_id: 'VN_44102', user_name: 'Aman Verma', channel: 'GooglePay UPI', amount: 5000, status: 'Approved', date: '13 Oct 2026 09:20 AM' },
  { id: 3, txn_id: 'DEP_992016', utr: '428910293849', user_id: 'VN_99214', user_name: 'Kunal Joshi', channel: 'Paytm UPI', amount: 2000, status: 'Pending', date: '13 Oct 2026 09:35 AM' },
  { id: 4, txn_id: 'DEP_992017', utr: '428910293850', user_id: 'VN_12890', user_name: 'Pooja Singh', channel: 'IMPS Bank', amount: 25000, status: 'Pending', date: '13 Oct 2026 09:40 AM' },
  { id: 5, txn_id: 'DEP_992018', utr: '428910293851', user_id: 'VN_63019', user_name: 'Sneha Patel', channel: 'USDT TRC20', amount: 45000, status: 'Approved', date: '13 Oct 2026 09:45 AM' },
  { id: 6, txn_id: 'DEP_992019', utr: '428910293852', user_id: 'VN_88201', user_name: 'Deepak Mehta', channel: 'PhonePe UPI', amount: 1000, status: 'Rejected', date: '13 Oct 2026 08:30 AM' },
  { id: 7, txn_id: 'DEP_992020', utr: '428910293853', user_id: 'VN_31940', user_name: 'Rahul Sharma', channel: 'GooglePay UPI', amount: 10000, status: 'Approved', date: '13 Oct 2026 08:15 AM' },
]

export default function Deposit() {
  const [rows, setRows] = useState(() => {
    const raw = localStorage.getItem('veronova_deposits_v1')
    return raw ? JSON.parse(raw) : SEED_DEPOSITS
  })
  const [filterTab, setFilterTab] = useState('ALL') // ALL, APPROVED, PENDING, REJECTED, UPI, IMPS
  const [selectedProof, setSelectedProof] = useState(null)
  const [copiedKey, setCopiedKey] = useState(null)
  const [toast, node] = useToast()

  const persist = (next) => {
    setRows(next)
    localStorage.setItem('veronova_deposits_v1', JSON.stringify(next))
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
      if (filterTab === 'UPI' && !r.channel.includes('UPI')) return false
      if (filterTab === 'IMPS' && !r.channel.includes('IMPS')) return false
      return true
    })
  }, [rows, filterTab])

  const handleApprove = (row) => {
    const next = rows.map((r) => (r.id === row.id ? { ...r, status: 'Approved' } : r))
    persist(next)
    toast(`Deposit #${row.txn_id} approved! ₹${row.amount.toLocaleString('en-IN')} credited to ${row.user_name}.`)
  }

  const handleReject = (row) => {
    const next = rows.map((r) => (r.id === row.id ? { ...r, status: 'Rejected' } : r))
    persist(next)
    toast(`Deposit #${row.txn_id} rejected.`)
  }

  const exportCols = [
    { key: 'id', label: 'ID' },
    { key: 'txn_id', label: 'Transaction ID' },
    { key: 'utr', label: 'UTR Reference' },
    { key: 'user_name', label: 'Player Name' },
    { key: 'user_id', label: 'User ID' },
    { key: 'channel', label: 'Gateway Channel' },
    { key: 'amount', label: 'Deposit Amount' },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Timestamp' },
  ]

  const cols = [
    { key: 'id', label: '#ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    {
      key: 'player',
      label: 'Player & Txn Ref',
      render: (r) => (
        <div className="min-w-[170px]">
          <span className="font-extrabold text-slate-900 text-sm block hover:text-blue-600 transition-colors">{r.user_name}</span>
          <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[11px] text-slate-500">
            <span>{r.user_id}</span> • <span className="text-blue-700 font-bold">{r.txn_id}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'utr',
      label: 'UTR / Bank Reference',
      render: (r) => (
        <div className="flex items-center gap-1.5 min-w-[170px]">
          <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {r.utr}
          </span>
          <button onClick={() => handleCopy(r.utr, `utr_${r.id}`)} className="text-slate-400 hover:text-slate-600" title="Copy UTR">
            {copiedKey === `utr_${r.id}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
          </button>
        </div>
      ),
    },
    {
      key: 'channel',
      label: 'Payment Gateway',
      render: (r) => (
        <span className="inline-block rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-extrabold text-blue-700 border border-blue-200">
          {r.channel}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Deposit Amount',
      render: (r) => (
        <span className="font-black text-emerald-600 text-sm">
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
                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
              >
                Approve
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
            onClick={() => setSelectedProof(r)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition"
            title="View Voucher"
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
        title="Player Deposit & Recharge Ledger"
        icon={ArrowDownToLine}
        crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Recharge & Deposits' }]}
      />

      {/* Compact, Sleek Deposit Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Deposit Inflow Vault</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              ₹{approvedSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Credited to player balances</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <ShieldCheck size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Review Queue</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              ₹{pendingSum.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{pendingRows.length} awaiting audit</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Clock size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Logged Recharges</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {rows.length} Transactions
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Instant gateway trace</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ArrowDownToLine size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Clearance Rate</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {((rows.filter(r => r.status === 'Approved').length / (rows.length || 1)) * 100).toFixed(0)}% Approved
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Reconciled ledger</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <CheckCircle2 size={18} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All Deposits', count: rows.length },
              { id: 'APPROVED', label: 'Approved', count: rows.filter((r) => r.status === 'Approved').length },
              { id: 'PENDING', label: 'Pending UTR', count: pendingRows.length },
              { id: 'REJECTED', label: 'Rejected', count: rows.filter((r) => r.status === 'Rejected').length },
              { id: 'UPI', label: 'UPI Gateways', count: rows.filter((r) => r.channel.includes('UPI')).length },
              { id: 'IMPS', label: 'Bank IMPS', count: rows.filter((r) => r.channel.includes('IMPS')).length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  filterTab === tab.id ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-black">{tab.count}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => exportCSV('deposits_ledger', exportCols, displayRows)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <FileSpreadsheet size={15} /> Export to Excel
          </button>
        </div>

        <DataTable columns={cols} rows={displayRows} unit="deposits" placeholder="Search by UTR, player name, or transaction ID..." />
      </div>

      {/* Deposit Proof Modal */}
      {selectedProof && (
        <Modal isOpen={!!selectedProof} onClose={() => setSelectedProof(null)} title={`Deposit Voucher: #${selectedProof.txn_id}`} maxWidth="max-w-md">
          <div className="space-y-3 text-xs">
            <div className="rounded-xl bg-slate-900 p-4 text-white">
              <p className="text-slate-400 font-bold uppercase text-[10px]">Payment Proof Details</p>
              <p className="text-2xl font-black mt-1 font-mono">₹{selectedProof.amount.toLocaleString('en-IN')}</p>
              <p className="text-slate-300 font-mono mt-1">UTR: {selectedProof.utr}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-100">
              <div className="flex justify-between"><span>Player Name:</span><strong>{selectedProof.user_name}</strong></div>
              <div className="flex justify-between"><span>User ID:</span><strong className="font-mono">{selectedProof.user_id}</strong></div>
              <div className="flex justify-between"><span>Gateway Channel:</span><strong>{selectedProof.channel}</strong></div>
              <div className="flex justify-between"><span>Timestamp:</span><strong>{selectedProof.date}</strong></div>
              <div className="flex justify-between"><span>Status:</span><strong className="text-emerald-700">{selectedProof.status}</strong></div>
            </div>
            <button onClick={() => setSelectedProof(null)} className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white">
              Close Voucher
            </button>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}

