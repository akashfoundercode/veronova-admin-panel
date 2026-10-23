import { useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import {
  ArrowDownToLine, ArrowUpFromLine, Receipt, TrendingUp, Headphones,
  MessageSquare, Info, BarChart3, Bell, Settings, ShieldCheck,
  CheckCircle2, AlertCircle, Clock, Copy, Check, Search,
  FileSpreadsheet, Plus, Trash2, Pencil, Eye, X, Lock, Unlock,
  Send, DollarSign, SlidersHorizontal, Layers, Smartphone, Sparkles,
  Calendar, TrendingDown, Filter, RefreshCw, Star, HelpCircle,
  ToggleLeft, ToggleRight, Database, Users, Wallet, CreditCard, Gamepad2
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, Modal, useToast, money } from '@/components/ui'

// Mock Datasets for all secondary admin pages
const SEED_DEPOSITS = [
  { id: 1, txn_id: 'DEP_992014', utr: '428910293847', user_id: 'VN_78291', user_name: 'Vikram Rawat', channel: 'PhonePe UPI', amount: 15000, status: 'Approved', date: '13 Oct 2026 09:15 AM' },
  { id: 2, txn_id: 'DEP_992015', utr: '428910293848', user_id: 'VN_44102', user_name: 'Aman Verma', channel: 'GooglePay UPI', amount: 5000, status: 'Approved', date: '13 Oct 2026 09:20 AM' },
  { id: 3, txn_id: 'DEP_992016', utr: '428910293849', user_id: 'VN_99214', user_name: 'Kunal Joshi', channel: 'Paytm UPI', amount: 2000, status: 'Pending', date: '13 Oct 2026 09:35 AM' },
  { id: 4, txn_id: 'DEP_992017', utr: '428910293850', user_id: 'VN_12890', user_name: 'Pooja Singh', channel: 'IMPS Bank', amount: 25000, status: 'Pending', date: '13 Oct 2026 09:40 AM' },
  { id: 5, txn_id: 'DEP_992018', utr: '428910293851', user_id: 'VN_63019', user_name: 'Sneha Patel', channel: 'USDT TRC20', amount: 45000, status: 'Approved', date: '13 Oct 2026 09:45 AM' },
  { id: 6, txn_id: 'DEP_992019', utr: '428910293852', user_id: 'VN_88201', user_name: 'Deepak Mehta', channel: 'PhonePe UPI', amount: 1000, status: 'Rejected', date: '13 Oct 2026 08:30 AM' },
]

const SEED_WITHDRAWALS = [
  { id: 1, req_id: 'WD_4401', user_id: 'VN_78291', user_name: 'Vikram Rawat', bank: 'HDFC Bank', acc_no: '501002938471', ifsc: 'HDFC0001245', holder: 'Vikram Rawat', amount: 12000, status: 'Approved', date: '13 Oct 2026 09:00 AM' },
  { id: 2, req_id: 'WD_4402', user_id: 'VN_44102', user_name: 'Aman Verma', bank: 'ICICI Bank', acc_no: '001201928374', ifsc: 'ICIC0000012', holder: 'Aman Verma', amount: 8500, status: 'Pending', date: '13 Oct 2026 09:25 AM' },
  { id: 3, req_id: 'WD_4403', user_id: 'VN_99214', user_name: 'Kunal Joshi', bank: 'State Bank of India', acc_no: '30291827461', ifsc: 'SBIN0004521', holder: 'Kunal Joshi', amount: 15000, status: 'Pending', date: '13 Oct 2026 09:30 AM' },
  { id: 4, req_id: 'WD_4404', user_id: 'VN_12890', user_name: 'Pooja Singh', bank: 'Axis Bank', acc_no: '918273645012', ifsc: 'UTIB0000213', holder: 'Pooja Singh', amount: 4000, status: 'Approved', date: '13 Oct 2026 08:45 AM' },
  { id: 5, req_id: 'WD_4405', user_id: 'VN_88201', user_name: 'Deepak Mehta', bank: 'Kotak Bank', acc_no: '48192039481', ifsc: 'KKBK0000192', holder: 'Deepak Mehta', amount: 20000, status: 'Rejected', date: '12 Oct 2026 07:15 PM' },
]

const SEED_LIMITS = [
  { id: 1, channel: 'PhonePe UPI QR', min_amt: 100, max_amt: 50000, daily_cap: 2500000, fee: '0.0%', status: 'Active' },
  { id: 2, channel: 'GooglePay UPI Direct', min_amt: 200, max_amt: 50000, daily_cap: 2000000, fee: '0.0%', status: 'Active' },
  { id: 3, channel: 'IMPS Bank Transfer', min_amt: 500, max_amt: 200000, daily_cap: 5000000, fee: '0.0%', status: 'Active' },
  { id: 4, channel: 'USDT TRC20 Crypto', min_amt: 1700, max_amt: 1000000, daily_cap: 10000000, fee: '1.0%', status: 'Active' },
  { id: 5, channel: 'Player Instant Withdrawal', min_amt: 500, max_amt: 100000, daily_cap: 500000, fee: '0.0%', status: 'Active' },
]

const SEED_PROFIT_LOSS = [
  { id: 1, game: 'Wingo / Colour Prediction', turnover: 8450000, payouts: 6420000, net_profit: 2030000, margin: '24.0%', rounds: 4320 },
  { id: 2, game: 'Aviator Crash Multiplier', turnover: 6820000, payouts: 5210000, net_profit: 1610000, margin: '23.6%', rounds: 2890 },
  { id: 3, game: 'Chicken Multiplier Gold', turnover: 2450000, payouts: 1720000, net_profit: 730000, margin: '29.7%', rounds: 1640 },
  { id: 4, game: 'Jilli Slots & Fish Hunter', turnover: 1890000, payouts: 1380000, net_profit: 510000, margin: '26.9%', rounds: 3120 },
  { id: 5, game: 'Horse Racing Simulation', turnover: 1250000, payouts: 940000, net_profit: 310000, margin: '24.8%', rounds: 890 },
]

const SEED_FEEDBACK = [
  { id: 1, user_name: 'Aman Verma', rating: 5, category: 'Payout Speed', message: 'Instant withdrawal in 2 minutes via IMPS! Best gaming experience.', status: 'Resolved', date: '12 Oct 2026' },
  { id: 2, user_name: 'Deepak Mehta', rating: 4, category: 'Game Fairness', message: 'Aviator multiplier smoothness is great, please add more deposit channels.', status: 'Under Review', date: '11 Oct 2026' },
  { id: 3, user_name: 'Sneha Patel', rating: 5, category: 'VIP Support', message: 'VIP manager was very prompt in upgrading my cashback rate.', status: 'Resolved', date: '10 Oct 2026' },
]

const SEED_SUPPORT = [
  { id: 1, ticket_id: 'TCK_8820', user: 'Vikram Rawat', issue: 'Bank Payout Query', priority: 'Urgent', agent: 'Support Officer 01', status: 'In Progress', time: '10 mins ago' },
  { id: 2, ticket_id: 'TCK_8821', user: 'Kunal Joshi', issue: 'Deposit UTR Verification', priority: 'High', agent: 'Support Officer 02', status: 'Resolved', time: '25 mins ago' },
  { id: 3, ticket_id: 'TCK_8822', user: 'Pooja Singh', issue: 'VIP Reward Inquiry', priority: 'Normal', agent: 'Support Officer 01', status: 'Open', time: '1 hour ago' },
]

export default function Simple() {
  const { pathname } = useLocation()
  const [copiedKey, setCopiedKey] = useState(null)
  const [toast, node] = useToast()

  // State maps
  const [depositRows, setDepositRows] = useState(SEED_DEPOSITS)
  const [withdrawRows, setWithdrawRows] = useState(SEED_WITHDRAWALS)
  const [limitsRows, setLimitsRows] = useState(SEED_LIMITS)
  const [selectedProof, setSelectedProof] = useState(null)

  // Copy helper
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1800)
    toast(`Copied ${text} to clipboard!`)
  }

  // 1. DEPOSIT PAGE
  if (pathname === '/deposit') {
    const totalApproved = depositRows.filter((r) => r.status === 'Approved').reduce((acc, r) => acc + r.amount, 0)
    const pendingDeposits = depositRows.filter((r) => r.status === 'Pending')

    const cols = [
      { key: 'id', label: '#ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
      {
        key: 'player',
        label: 'Player & Txn',
        render: (r) => (
          <div className="min-w-[170px]">
            <span className="font-extrabold text-slate-900 text-sm block">{r.user_name}</span>
            <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[11px] text-slate-500">
              <span>{r.user_id}</span> • <span className="text-blue-700 font-bold">{r.txn_id}</span>
            </div>
          </div>
        ),
      },
      {
        key: 'utr',
        label: 'UTR / Reference',
        render: (r) => (
          <div className="flex items-center gap-1.5 min-w-[170px]">
            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {r.utr}
            </span>
            <button onClick={() => handleCopy(r.utr, `utr_${r.id}`)} className="text-slate-400 hover:text-slate-600">
              {copiedKey === `utr_${r.id}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
            </button>
          </div>
        ),
      },
      {
        key: 'channel',
        label: 'Payment Gateway',
        render: (r) => (
          <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-xs font-extrabold text-blue-700 border border-blue-200">
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
            {r.status}
          </span>
        ),
      },
      {
        label: 'Actions',
        render: (r) => (
          <div className="flex items-center gap-1">
            {r.status === 'Pending' && (
              <>
                <button
                  onClick={() => {
                    setDepositRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: 'Approved' } : x)))
                    toast(`Deposit #${r.txn_id} approved and credited!`)
                  }}
                  className="rounded-lg bg-emerald-50 p-1.5 text-emerald-700 hover:bg-emerald-600 hover:text-white transition shadow-2xs font-bold text-xs px-2"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setDepositRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: 'Rejected' } : x)))
                    toast(`Deposit #${r.txn_id} rejected`)
                  }}
                  className="rounded-lg bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-600 hover:text-white transition shadow-2xs font-bold text-xs px-2"
                >
                  Reject
                </button>
              </>
            )}
            <button
              onClick={() => setSelectedProof(r)}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition"
              title="View Payment Voucher"
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

        {/* Deposit KPI Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 p-6 text-white shadow-xl border border-emerald-900/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">Deposit Inflow Vault</span>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-300">Bank Reconciled</span>
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-white font-mono">
                ₹{totalApproved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-xs text-emerald-200 mt-1">Total approved deposits credited to player wallets</p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span>{pendingDeposits.length} Pending Approval Verification</span>
              <span className="text-emerald-400 font-extrabold">Instant UPI Sync Active</span>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 gap-4">
            <div className="card p-5 rounded-2xl border-t-4 border-t-amber-500 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Pending Verification Queue</p>
                <h3 className="mt-1 text-2xl font-black text-amber-700">{pendingDeposits.length} Requests</h3>
                <p className="text-xs text-slate-500 mt-0.5">Average verify time: 45s</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <Clock size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-4 space-y-4 shadow-sm">
          <DataTable columns={cols} rows={depositRows} unit="deposits" placeholder="Search by UTR, player name, or transaction ID..." />
        </div>

        {selectedProof && (
          <Modal isOpen={!!selectedProof} onClose={() => setSelectedProof(null)} title={`Deposit Voucher: #${selectedProof.txn_id}`} maxWidth="max-w-md">
            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-slate-900 p-4 text-white">
                <p className="text-slate-400 font-bold uppercase text-[10px]">Payment Proof Details</p>
                <p className="text-2xl font-black mt-1">₹{selectedProof.amount.toLocaleString('en-IN')}</p>
                <p className="text-slate-300 font-mono mt-1">UTR: {selectedProof.utr}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 border border-slate-100">
                <div className="flex justify-between"><span>Player Name:</span><strong>{selectedProof.user_name}</strong></div>
                <div className="flex justify-between"><span>User ID:</span><strong className="font-mono">{selectedProof.user_id}</strong></div>
                <div className="flex justify-between"><span>Gateway Channel:</span><strong>{selectedProof.channel}</strong></div>
                <div className="flex justify-between"><span>Timestamp:</span><strong>{selectedProof.date}</strong></div>
              </div>
              <button onClick={() => setSelectedProof(null)} className="w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white">Close</button>
            </div>
          </Modal>
        )}
        {node}
      </div>
    )
  }

  // 2. WITHDRAWAL PAGE
  if (pathname === '/withdrawal') {
    const totalPending = withdrawRows.filter((r) => r.status === 'Pending').reduce((acc, r) => acc + r.amount, 0)
    const totalApproved = withdrawRows.filter((r) => r.status === 'Approved').reduce((acc, r) => acc + r.amount, 0)

    const cols = [
      { key: 'id', label: '#ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
      {
        key: 'player',
        label: 'Player Details',
        render: (r) => (
          <div className="min-w-[160px]">
            <span className="font-extrabold text-slate-900 text-sm block">{r.user_name}</span>
            <span className="font-mono text-[11px] font-bold text-slate-500">{r.user_id}</span>
          </div>
        ),
      },
      {
        key: 'bank',
        label: 'Bank Account & IFSC',
        render: (r) => (
          <div className="min-w-[200px] text-xs">
            <span className="font-bold text-slate-800 block">{r.bank}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">{r.acc_no}</span>
              <button onClick={() => handleCopy(r.acc_no, `acc_${r.id}`)} className="text-slate-400 hover:text-slate-600">
                {copiedKey === `acc_${r.id}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
              </button>
            </div>
            <span className="font-mono text-[10px] text-slate-500 block mt-0.5">IFSC: {r.ifsc} • {r.holder}</span>
          </div>
        ),
      },
      {
        key: 'amount',
        label: 'Requested Amount',
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
            {r.status}
          </span>
        ),
      },
      {
        label: 'Actions',
        render: (r) => (
          <div className="flex items-center gap-1.5">
            {r.status === 'Pending' && (
              <>
                <button
                  onClick={() => {
                    setWithdrawRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: 'Approved' } : x)))
                    toast(`Withdrawal #${r.req_id} approved and sent to bank gateway!`)
                  }}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition"
                >
                  Pay Now
                </button>
                <button
                  onClick={() => {
                    setWithdrawRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: 'Rejected' } : x)))
                    toast(`Withdrawal #${r.req_id} rejected and funds returned`)
                  }}
                  className="rounded-lg bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-600 hover:text-white transition"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        ),
      },
    ]

    return (
      <div className="space-y-6">
        <PageBanner
          title="Withdrawal Payout Requests & Cashouts"
          icon={ArrowUpFromLine}
          crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Payouts & Cashouts' }]}
        />

        {/* Withdrawal KPI */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 p-6 text-white shadow-xl border border-blue-900/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-300">Disbursement Queue</span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-blue-200">IMPS Auto-Connected</span>
              </div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black text-white font-mono">
                ₹{totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-xs text-blue-200 mt-1">Total pending cashout volume awaiting release</p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span>₹{totalApproved.toLocaleString('en-IN')} Settled Successfully Today</span>
              <span className="text-emerald-400 font-bold">100% Liquidity Backed</span>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 gap-4">
            <div className="card p-5 rounded-2xl border-t-4 border-t-emerald-500 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Total Settled Cashouts</p>
                <h3 className="mt-1 text-2xl font-black text-emerald-600">₹{totalApproved.toLocaleString('en-IN')}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Disbursed via automated bank IMPS</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-4 space-y-4 shadow-sm">
          <DataTable columns={cols} rows={withdrawRows} unit="withdrawals" placeholder="Search by account, IFSC, or player name..." />
        </div>
        {node}
      </div>
    )
  }

  // 3. PAYMENTS LIMIT PAGE
  if (pathname === '/payments-limit') {
    const cols = [
      { key: 'channel', label: 'Gateway Channel', render: (r) => <span className="font-extrabold text-slate-900 text-sm">{r.channel}</span> },
      { key: 'min_amt', label: 'Min Transaction', render: (r) => <span className="font-bold text-slate-700">₹{r.min_amt.toLocaleString('en-IN')}</span> },
      { key: 'max_amt', label: 'Max Single Limit', render: (r) => <span className="font-bold text-emerald-600">₹{r.max_amt.toLocaleString('en-IN')}</span> },
      { key: 'daily_cap', label: 'Daily Cap Ceiling', render: (r) => <span className="font-extrabold text-blue-700">₹{r.daily_cap.toLocaleString('en-IN')}</span> },
      { key: 'fee', label: 'Gateway Fee', render: (r) => <span className="font-mono text-xs font-bold text-slate-500">{r.fee}</span> },
      { key: 'status', label: 'Status', render: (r) => <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">{r.status}</span> },
    ]

    return (
      <div className="space-y-6">
        <PageBanner
          title="Payment Gateway Limits & Processing Rules"
          icon={Receipt}
          crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Payments Limit' }]}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5 rounded-2xl border-t-4 border-t-blue-600 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Total Gateway Channels</p>
            <h3 className="mt-1 text-2xl font-black text-slate-900">{limitsRows.length} Active Gateways</h3>
            <p className="text-xs text-blue-600 font-semibold mt-0.5">UPI, IMPS, USDT Supported</p>
          </div>
          <div className="card p-5 rounded-2xl border-t-4 border-t-emerald-500 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Daily Inflow Limit Cap</p>
            <h3 className="mt-1 text-2xl font-black text-emerald-600">₹1.95 Crore / Day</h3>
            <p className="text-xs text-slate-500 mt-0.5">Combined gateway liquidity</p>
          </div>
          <div className="card p-5 rounded-2xl border-t-4 border-t-amber-500 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Fraud Velocity Guard</p>
            <h3 className="mt-1 text-2xl font-black text-amber-700">Max 5 Txns / Hour</h3>
            <p className="text-xs text-slate-500 mt-0.5">Automated velocity throttling</p>
          </div>
        </div>
        <div className="card p-4 space-y-4 shadow-sm">
          <DataTable columns={cols} rows={limitsRows} unit="channels" placeholder="Search gateway limits..." />
        </div>
        {node}
      </div>
    )
  }

  // 4. PROFIT / LOSS PAGE
  if (pathname === '/profit-loss') {
    const totalTurnover = SEED_PROFIT_LOSS.reduce((acc, r) => acc + r.turnover, 0)
    const totalProfit = SEED_PROFIT_LOSS.reduce((acc, r) => acc + r.net_profit, 0)

    const cols = [
      { key: 'game', label: 'Gaming Segment', render: (r) => <span className="font-extrabold text-slate-900 text-sm">{r.game}</span> },
      { key: 'turnover', label: 'Total Bet Turnover', render: (r) => <span className="font-bold text-slate-700">₹{r.turnover.toLocaleString('en-IN')}</span> },
      { key: 'payouts', label: 'Player Payouts Won', render: (r) => <span className="font-bold text-rose-600">₹{r.payouts.toLocaleString('en-IN')}</span> },
      { key: 'net_profit', label: 'Gross Gaming Revenue (GGR)', render: (r) => <span className="font-black text-emerald-600 text-sm">+₹{r.net_profit.toLocaleString('en-IN')}</span> },
      { key: 'margin', label: 'Platform Margin', render: (r) => <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-black text-emerald-700 border border-emerald-200">{r.margin}</span> },
      { key: 'rounds', label: 'Rounds Settled', render: (r) => <span className="font-mono text-xs text-slate-500">{r.rounds.toLocaleString('en-IN')}</span> },
    ]

    return (
      <div className="space-y-6">
        <PageBanner
          title="Profit / Loss & Admin Financial Telemetry"
          icon={TrendingUp}
          crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Profit & Loss Telemetry' }]}
        />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 p-6 text-white shadow-xl border border-emerald-900/40 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">Net Platform GGR</span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black text-white font-mono">
                +₹{totalProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-xs text-emerald-200 mt-1">Platform net house yield after all user cashout winnings</p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span>Total Bet Turnover: ₹{totalTurnover.toLocaleString('en-IN')}</span>
              <span className="text-emerald-400 font-bold">+25.3% Average House Margin</span>
            </div>
          </div>
          <div className="lg:col-span-5 grid grid-cols-1 gap-4">
            <div className="card p-5 rounded-2xl border-t-4 border-t-blue-600 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Total Wager Volume</p>
                <h3 className="mt-1 text-2xl font-black text-slate-900">₹{(totalTurnover / 10000000).toFixed(2)} Crore</h3>
                <p className="text-xs text-blue-600 font-semibold mt-0.5">Across all 5 live game engines</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <BarChart3 size={24} />
              </div>
            </div>
          </div>
        </div>
        <div className="card p-4 space-y-4 shadow-sm">
          <DataTable columns={cols} rows={SEED_PROFIT_LOSS} unit="games" placeholder="Search by game title..." />
        </div>
        {node}
      </div>
    )
  }

  // 5. FEEDBACK PAGE
  if (pathname === '/feedback') {
    const cols = [
      { key: 'user_name', label: 'Player Name', render: (r) => <span className="font-extrabold text-slate-900 text-sm">{r.user_name}</span> },
      { key: 'rating', label: 'Rating', render: (r) => <div className="flex items-center text-amber-500">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={13} fill="currentColor" />)}</div> },
      { key: 'category', label: 'Category', render: (r) => <span className="rounded-md bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-bold">{r.category}</span> },
      { key: 'message', label: 'Feedback Message', render: (r) => <span className="text-xs text-slate-700">{r.message}</span> },
      { key: 'status', label: 'Status', render: (r) => <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">{r.status}</span> },
      { key: 'date', label: 'Date', render: (r) => <span className="font-mono text-xs text-slate-400">{r.date}</span> },
    ]

    return (
      <div className="space-y-6">
        <PageBanner title="Player Feedback & Quality Ratings" icon={MessageSquare} crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Feedback & Reviews' }]} />
        <div className="card p-4 space-y-4 shadow-sm">
          <DataTable columns={cols} rows={SEED_FEEDBACK} unit="reviews" placeholder="Search feedback..." />
        </div>
        {node}
      </div>
    )
  }

  // 6. CUSTOMER SERVICE & SUPPORT
  if (pathname === '/customer-service' || pathname === '/support') {
    const cols = [
      { key: 'ticket_id', label: 'Ticket ID', render: (r) => <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{r.ticket_id}</span> },
      { key: 'user', label: 'Player Name', render: (r) => <span className="font-extrabold text-slate-900 text-sm">{r.user}</span> },
      { key: 'issue', label: 'Support Query', render: (r) => <span className="text-xs font-bold text-slate-800">{r.issue}</span> },
      { key: 'priority', label: 'Priority', render: (r) => <span className={`rounded-md px-2 py-0.5 text-xs font-black ${r.priority === 'Urgent' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{r.priority}</span> },
      { key: 'agent', label: 'Assigned Officer', render: (r) => <span className="text-xs text-slate-600 font-semibold">{r.agent}</span> },
      { key: 'status', label: 'Status', render: (r) => <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">{r.status}</span> },
      { key: 'time', label: 'Last Activity', render: (r) => <span className="font-mono text-xs text-slate-400">{r.time}</span> },
    ]

    return (
      <div className="space-y-6">
        <PageBanner title="Customer Service & Helpdesk Escalations" icon={Headphones} crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Customer Service' }]} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5 rounded-2xl border-t-4 border-t-blue-600 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Avg Resolution Speed</p>
            <h3 className="mt-1 text-2xl font-black text-slate-900">42 Seconds</h3>
            <p className="text-xs text-emerald-600 font-semibold mt-0.5">Live 24/7 Response Active</p>
          </div>
          <div className="card p-5 rounded-2xl border-t-4 border-t-emerald-500 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Total Solved Today</p>
            <h3 className="mt-1 text-2xl font-black text-emerald-600">142 Inquiries</h3>
            <p className="text-xs text-slate-500 mt-0.5">99.4% CSAT satisfaction</p>
          </div>
          <div className="card p-5 rounded-2xl border-t-4 border-t-purple-600 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Active Live Agents</p>
            <h3 className="mt-1 text-2xl font-black text-purple-700">8 Support Officers</h3>
            <p className="text-xs text-slate-500 mt-0.5">Shift 1 currently online</p>
          </div>
        </div>
        <div className="card p-4 space-y-4 shadow-sm">
          <DataTable columns={cols} rows={SEED_SUPPORT} unit="tickets" placeholder="Search support tickets..." />
        </div>
        {node}
      </div>
    )
  }

  // 7. SETTINGS PAGE
  if (pathname === '/settings') {
    return (
      <div className="space-y-6">
        <PageBanner title="Veronova System & Platform Settings" icon={Settings} crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Settings' }]} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="card p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base border-b pb-2">Platform Security & Access</h3>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div><p className="font-bold text-slate-800 text-sm">Two-Factor OTP Enforcement</p><p className="text-xs text-slate-400">Require OTP for all admin withdrawals</p></div>
              <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 font-bold text-xs border border-emerald-200">Enabled</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div><p className="font-bold text-slate-800 text-sm">System Maintenance Mode</p><p className="text-xs text-slate-400">Temporarily pause player logins for maintenance</p></div>
              <span className="rounded-full bg-slate-100 text-slate-600 px-3 py-1 font-bold text-xs">Disabled (Live)</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div><p className="font-bold text-slate-800 text-sm">IP Blacklist Enforcement</p><p className="text-xs text-slate-400">Auto-reject logins from multi-account flagged IPs</p></div>
              <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 font-bold text-xs border border-emerald-200">Active WAF</span>
            </div>
          </div>

          <div className="card p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base border-b pb-2">Automation & Gateways</h3>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div><p className="font-bold text-slate-800 text-sm">Instant IMPS Auto-Disbursement</p><p className="text-xs text-slate-400">Auto-approve player withdrawals below ₹10,000</p></div>
              <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 font-bold text-xs border border-emerald-200">Active</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <div><p className="font-bold text-slate-800 text-sm">Telegram Bot Telemetry Webhook</p><p className="text-xs text-slate-400">Instant alert notifications for large deposits (≥₹50k)</p></div>
              <span className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 font-bold text-xs border border-blue-200">Connected</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div><p className="font-bold text-slate-800 text-sm">Daily Midnight P/L Settlement</p><p className="text-xs text-slate-400">Auto calculate agent commissions at 00:00</p></div>
              <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 font-bold text-xs border border-emerald-200">Scheduled</span>
            </div>
          </div>
        </div>
        {node}
      </div>
    )
  }

  // 8. 3RD PARTY GAMES: JILLI GAME BETS AUDIT & MANAGEMENT
  if (pathname === '/jilli-bets') {
    const jilliRows = Array.from({ length: 25 }, (_, i) => {
      const games = [
        'Fortune Gems 2',
        'Boxing King',
        'Super Ace',
        'Mega Ace',
        'Crazy Hunter',
        'Golden Empire',
        'Ali Baba',
        'Dragon Fortune',
      ]
      const g = games[i % games.length]
      const betAmt = [10, 20, 50, 100, 200, 500, 1000][i % 7]
      const isWin = i % 2 === 0
      const mult = isWin ? +(1.5 + (i % 6) * 1.8).toFixed(2) : 0
      const winAmt = isWin ? +(betAmt * mult).toFixed(2) : 0
      return {
        id: i + 1,
        round_id: `JL_RND_${982100 + i}`,
        user_name: ['Rahul S.', 'Vikas K.', 'Pooja M.', 'Arjun T.', 'Deepak R.', 'Rohit G.'][i % 6],
        user_id: `UID_${1040 + i}`,
        game_name: g,
        provider: 'JILLI Games',
        bet_amount: betAmt,
        win_amount: winAmt,
        mult: mult,
        status: isWin ? 'Win' : 'Loss',
        time: `13 Oct 2026 0${(i % 9) + 1}:15 PM`,
      }
    })

    const jilliCols = [
      {
        key: 'round_id',
        label: 'Round ID',
        render: (r) => (
          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {r.round_id}
          </span>
        ),
      },
      {
        key: 'user_name',
        label: 'Player',
        render: (r) => (
          <div>
            <span className="font-extrabold text-slate-900 text-xs block">{r.user_name}</span>
            <span className="font-mono text-[10px] text-slate-400 font-bold">{r.user_id}</span>
          </div>
        ),
      },
      {
        key: 'game_name',
        label: 'Jilli Game Title',
        render: (r) => (
          <span className="inline-flex items-center gap-1.5 font-bold text-slate-900 text-xs">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            {r.game_name}
          </span>
        ),
      },
      {
        key: 'bet_amount',
        label: 'Bet Wagered',
        render: (r) => (
          <span className="font-mono font-bold text-slate-900 text-xs">{money(r.bet_amount)}</span>
        ),
      },
      {
        key: 'mult',
        label: 'Multiplier',
        render: (r) =>
          r.mult > 0 ? (
            <span className="font-mono text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {r.mult}x
            </span>
          ) : (
            <span className="font-mono text-xs text-slate-400">—</span>
          ),
      },
      {
        key: 'win_amount',
        label: 'Payout Amount',
        render: (r) => (
          <span
            className={`font-mono font-black text-xs ${
              r.win_amount > 0 ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            {r.win_amount > 0 ? money(r.win_amount) : '₹0.00'}
          </span>
        ),
      },
      {
        key: 'status',
        label: 'Outcome',
        render: (r) => (
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
              r.status === 'Win'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {r.status}
          </span>
        ),
      },
      {
        key: 'time',
        label: 'Timestamp',
        render: (r) => <span className="font-mono text-xs text-slate-400">{r.time}</span>,
      },
    ]

    return (
      <div className="space-y-6">
        <PageBanner
          title="Jilli Games 3rd Party Bet Ledger"
          icon={Gamepad2}
          crumbs={[{ label: 'Dashboard', to: '/' }, { label: '3rd Party Games' }, { label: 'Jilli Game Bets' }]}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 border border-purple-400/40 px-3 py-1 text-xs font-bold text-purple-200">
              JILLI API Gateway · Active
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
              Seamless Wallet Sync
            </span>
          </div>
        </PageBanner>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-5 rounded-2xl border-t-4 border-t-purple-600 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Total 3rd Party Turnover</p>
            <h3 className="mt-1 text-2xl font-black text-slate-900 font-mono">₹18,90,000</h3>
            <p className="text-xs text-purple-600 font-semibold mt-0.5">Across 8 Jilli slot & fish titles</p>
          </div>
          <div className="card p-5 rounded-2xl border-t-4 border-t-emerald-500 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Player Cashout Settled</p>
            <h3 className="mt-1 text-2xl font-black text-emerald-600 font-mono">₹13,80,000</h3>
            <p className="text-xs text-slate-500 mt-0.5">Seamless wallet disbursed</p>
          </div>
          <div className="card p-5 rounded-2xl border-t-4 border-t-blue-600 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">Platform Revenue GGR</p>
            <h3 className="mt-1 text-2xl font-black text-blue-600 font-mono">₹5,10,000</h3>
            <p className="text-xs text-emerald-600 font-bold mt-0.5">+26.9% House Margin</p>
          </div>
        </div>

        <div className="card p-4 space-y-4 shadow-sm">
          <DataTable
            columns={jilliCols}
            rows={jilliRows}
            unit="bets"
            exportName="JilliGames_Bets"
            exportLabel="Export Jilli Bets"
            placeholder="Search by player, round ID or title..."
          />
        </div>
        {node}
      </div>
    )
  }

  // 9. NOTIFICATIONS & REPORTS & OTHER FALLBACKS (Clean, professional view)
  const title = pathname.slice(1).split('-').map((w) => w[0]?.toUpperCase() + w.slice(1)).join(' ') || 'Platform Section'
  const rows = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    title: `${title} Entry #${100 + i}`,
    category: 'System Broadcast',
    status: i % 2 === 0 ? 'Published' : 'Archived',
    date: `1${i} Oct 2026 10:00 AM`,
  }))

  const fallbackCols = [
    { key: 'id', label: '#ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    { key: 'title', label: 'Item Headline', render: (r) => <span className="font-bold text-slate-800 text-sm">{r.title}</span> },
    { key: 'category', label: 'Category', render: (r) => <span className="rounded-md bg-blue-50 text-blue-700 px-2 py-0.5 text-xs font-bold">{r.category}</span> },
    { key: 'status', label: 'Status', render: (r) => <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">{r.status}</span> },
    { key: 'date', label: 'Timestamp', render: (r) => <span className="font-mono text-xs text-slate-400">{r.date}</span> },
  ]

  return (
    <div className="space-y-6">
      <PageBanner title={`${title} Console`} icon={Info} crumbs={[{ label: 'Dashboard', to: '/' }, { label: title }]} />
      <div className="card p-4 space-y-4 shadow-sm">
        <DataTable columns={fallbackCols} rows={rows} unit="items" placeholder={`Search ${title.toLowerCase()}...`} />
      </div>
      {node}
    </div>
  )
}
