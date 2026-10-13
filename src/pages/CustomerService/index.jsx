import { useState, useMemo, useEffect } from 'react'
import {
  Headphones, CheckCircle2, Clock, AlertCircle, Eye, Send, UserCheck,
  FileSpreadsheet, Filter, MessageSquare, ShieldCheck, Sparkles, User,
  Plus, Check, Landmark, KeyRound, FileEdit, Contact, Trash2, Edit3
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, Modal, useToast } from '@/components/ui'

const SEED_SUPPORT = [
  { id: 1, ticket_id: 'TCK_8820', category: 'bank_request', user: 'Vikram Rawat', user_id: 'VN_78291', issue: 'New Bank Account Linking Request', priority: 'Urgent', agent: 'Officer Ananya', status: 'In Progress', time: '10 mins ago', message: 'Requested linking of HDFC Bank account ending in 4401 with cheque verification.' },
  { id: 2, ticket_id: 'TCK_8821', category: 'ifsc_modification', user: 'Kunal Joshi', user_id: 'VN_99214', issue: 'IFSC Code Modification', priority: 'High', agent: 'Officer Rahul', status: 'Resolved', time: '25 mins ago', message: 'Branch IFSC changed from SBIN0001234 to SBIN0005678 after bank merger.' },
  { id: 3, ticket_id: 'TCK_8822', category: 'verification', user: 'Pooja Singh', user_id: 'VN_12890', issue: 'Indian Resident Aadhaar & PAN KYC', priority: 'Normal', agent: 'Officer Ananya', status: 'Open', time: '1 hour ago', message: 'Submitted PAN card and Aadhaar front/back for non-restricted tier.' },
  { id: 4, ticket_id: 'TCK_8823', category: 'delete_usdt', user: 'Aman Verma', user_id: 'VN_44102', issue: 'Delete Old TRC20 USDT Address', priority: 'Normal', agent: 'Officer Rohit', status: 'Resolved', time: '2 hours ago', message: 'Old wallet address compromised, requesting removal of USDT TRC-20 address.' },
  { id: 5, ticket_id: 'TCK_8824', category: 'change_password', user: 'Deepak Mehta', user_id: 'VN_88201', issue: 'Change / Reset Login Password', priority: 'High', agent: 'Officer Rahul', status: 'Resolved', time: '3 hours ago', message: 'Verified mobile number OTP and reset player account password.' },
  { id: 6, ticket_id: 'TCK_8825', category: 'bank_name', user: 'Suresh Raina', user_id: 'VN_33190', issue: 'Beneficiary Bank Name Correction', priority: 'Normal', agent: 'Officer Ananya', status: 'Open', time: '4 hours ago', message: 'Account holder name typo: requested update to match Aadhaar card exactly.' },
  { id: 7, ticket_id: 'TCK_8826', category: 'game_complaints', user: 'Harish Patel', user_id: 'VN_66210', issue: 'Game Round Crash / Bet Disconnect', priority: 'Urgent', agent: 'Officer Rahul', status: 'In Progress', time: '5 hours ago', message: 'Wagered ₹500 on Aviator round #8812, game froze before cashout triggered.' },
  { id: 8, ticket_id: 'TCK_8827', category: 'bank_request', user: 'Rohit Sharma', user_id: 'VN_11094', issue: 'Secondary Bank Account Approval', priority: 'Normal', agent: 'Officer Rohit', status: 'Resolved', time: '6 hours ago', message: 'Added ICICI secondary bank details for high-volume withdrawals.' },
]

export const SUB_CATEGORY_CONFIG = {
  bank_request: { label: 'View Bank Request', icon: Landmark, desc: 'Review, approve and verify linked player bank accounts' },
  change_password: { label: 'Change Login Password', icon: KeyRound, desc: 'Handle player login credentials & 2FA reset requests' },
  ifsc_modification: { label: 'IFSC Modifications', icon: FileEdit, desc: 'Update and audit bank branch IFSC code amendments' },
  verification: { label: 'Indian/Non-Indian Verification', icon: Contact, desc: 'Review KYC documents, Aadhaar, PAN & residency proofs' },
  delete_usdt: { label: 'Delete Old USDT', icon: Trash2, desc: 'Safely unbind and purge legacy TRC20/ERC20 wallet addresses' },
  bank_name: { label: 'Bank Name Modifications', icon: Edit3, desc: 'Reconcile beneficiary title mismatch against identity records' },
  game_complaints: { label: 'Game Issue Complaints', icon: AlertCircle, desc: 'Investigate bet disconnection, freeze anomalies & round recalculations' },
}

export default function CustomerService({ activeCategory = null }) {
  const [rows, setRows] = useState(() => {
    const raw = localStorage.getItem('veronova_support_tickets_v1')
    return raw ? JSON.parse(raw) : SEED_SUPPORT
  })
  const [filterTab, setFilterTab] = useState('ALL') // ALL, URGENT, OPEN, PROGRESS, RESOLVED
  const [categoryTab, setCategoryTab] = useState(activeCategory || 'ALL')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [toast, node] = useToast()

  useEffect(() => {
    setCategoryTab(activeCategory || 'ALL')
  }, [activeCategory])

  const persist = (next) => {
    setRows(next)
    localStorage.setItem('veronova_support_tickets_v1', JSON.stringify(next))
  }

  const urgentCount = useMemo(() => rows.filter((r) => r.priority === 'Urgent').length, [rows])
  const openCount = useMemo(() => rows.filter((r) => r.status === 'Open' || r.status === 'In Progress').length, [rows])
  const resolvedCount = useMemo(() => rows.filter((r) => r.status === 'Resolved').length, [rows])

  const displayRows = useMemo(() => {
    return rows.filter((r) => {
      if (categoryTab !== 'ALL' && r.category !== categoryTab) return false
      if (filterTab === 'URGENT' && r.priority !== 'Urgent') return false
      if (filterTab === 'OPEN' && r.status !== 'Open') return false
      if (filterTab === 'PROGRESS' && r.status !== 'In Progress') return false
      if (filterTab === 'RESOLVED' && r.status !== 'Resolved') return false
      return true
    })
  }, [rows, filterTab, categoryTab])

  const handleStatusChange = (row, newStatus) => {
    const next = rows.map((r) => (r.id === row.id ? { ...r, status: newStatus } : r))
    persist(next)
    toast(`Ticket #${row.ticket_id} changed to ${newStatus}`)
    if (selectedTicket?.id === row.id) {
      setSelectedTicket({ ...selectedTicket, status: newStatus })
    }
  }

  const exportCols = [
    { key: 'id', label: 'ID' },
    { key: 'ticket_id', label: 'Ticket ID' },
    { key: 'category', label: 'Department / Category' },
    { key: 'user', label: 'Player Name' },
    { key: 'user_id', label: 'User ID' },
    { key: 'issue', label: 'Support Query' },
    { key: 'priority', label: 'Priority' },
    { key: 'agent', label: 'Assigned Officer' },
    { key: 'status', label: 'Status' },
    { key: 'time', label: 'Timestamp' },
  ]

  const activeCategoryInfo = SUB_CATEGORY_CONFIG[categoryTab] || null
  const currentTitle = activeCategoryInfo ? activeCategoryInfo.label : 'Customer Service & Helpdesk Operations'
  const currentIcon = activeCategoryInfo ? activeCategoryInfo.icon : Headphones

  const cols = [
    { key: 'id', label: '#ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    {
      key: 'ticket_id',
      label: 'Ticket Reference',
      render: (r) => (
        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {r.ticket_id}
        </span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (r) => {
        const conf = SUB_CATEGORY_CONFIG[r.category]
        const Icon = conf?.icon || Headphones
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
            <Icon size={12} className="text-blue-600" />
            <span>{conf?.label || r.category}</span>
          </span>
        )
      },
    },
    {
      key: 'user',
      label: 'Player Details',
      render: (r) => (
        <div className="min-w-[150px]">
          <span className="font-extrabold text-slate-900 text-sm block">{r.user}</span>
          <span className="font-mono text-[11px] font-bold text-slate-500">{r.user_id}</span>
        </div>
      ),
    },
    {
      key: 'issue',
      label: 'Subject & Query',
      render: (r) => (
        <div className="min-w-[200px]">
          <span className="font-bold text-slate-900 text-xs block">{r.issue}</span>
          <span className="text-[11px] text-slate-500 block truncate max-w-[260px]">{r.message}</span>
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (r) => (
        <span
          className={`rounded-md px-2 py-0.5 text-xs font-black ${
            r.priority === 'Urgent'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : r.priority === 'High'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {r.priority}
        </span>
      ),
    },
    {
      key: 'agent',
      label: 'Assigned Staff',
      render: (r) => (
        <span className="inline-flex items-center gap-1 text-xs text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded">
          <UserCheck size={12} className="text-blue-600" /> {r.agent}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
            r.status === 'Resolved'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : r.status === 'In Progress'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {r.status === 'Resolved' ? <CheckCircle2 size={12} /> : <Clock size={12} />} {r.status}
        </span>
      ),
    },
    {
      label: 'Actions',
      render: (r) => (
        <button
          onClick={() => setSelectedTicket(r)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-2xs"
          title="Open Ticket"
        >
          <Eye size={14} />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageBanner
        title={currentTitle}
        icon={currentIcon}
        crumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Customer Service', to: '/customer-service' },
          ...(activeCategoryInfo ? [{ label: activeCategoryInfo.label }] : []),
        ]}
      />

      {/* Sub-Category Quick Switcher Navigation */}
      <div className="card bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setCategoryTab('ALL')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              categoryTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Headphones size={13} />
            <span>All Requests</span>
            <span className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${categoryTab === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {rows.length}
            </span>
          </button>

          {Object.entries(SUB_CATEGORY_CONFIG).map(([key, item]) => {
            const count = rows.filter((r) => r.category === key).length
            const active = categoryTab === key
            const Icon = item.icon
            return (
              <button
                key={key}
                onClick={() => setCategoryTab(key)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  active
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={13} />
                <span>{item.label}</span>
                <span className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${active ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Compact, Sleek Customer Service Helpdesk Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Resolution Speed</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              42 Seconds
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Avg response time</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Clock size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Urgent Escalations</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {urgentCount} Urgent Tickets
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">High priority bank queries</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <AlertCircle size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Resolved Today</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {resolvedCount} Solved
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">99.4% CSAT achieved</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">On-Duty Officers</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              8 Agents Active
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Shift 1 attending tickets</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <Headphones size={18} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All Tickets', count: rows.length },
              { id: 'URGENT', label: 'Urgent', count: urgentCount },
              { id: 'OPEN', label: 'Open Queue', count: rows.filter((r) => r.status === 'Open').length },
              { id: 'PROGRESS', label: 'In Progress', count: rows.filter((r) => r.status === 'In Progress').length },
              { id: 'RESOLVED', label: 'Resolved', count: resolvedCount },
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
            onClick={() => exportCSV('customer_service_tickets', exportCols, displayRows)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <FileSpreadsheet size={15} /> Export to Excel
          </button>
        </div>

        <DataTable columns={cols} rows={displayRows} unit="tickets" placeholder="Search by ticket ID, user, or issue..." />
      </div>

      {/* Ticket Details & Action Modal */}
      {selectedTicket && (
        <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title={`Support Ticket: #${selectedTicket.ticket_id}`} maxWidth="max-w-md">
          <div className="space-y-4 text-xs">
            <div className="bg-slate-900 p-4 rounded-xl text-white">
              <span className="text-[10px] font-bold uppercase text-slate-400">Issue Subject</span>
              <p className="text-base font-black mt-1">{selectedTicket.issue}</p>
              <p className="text-slate-300 mt-2 bg-white/10 p-2.5 rounded-lg text-xs leading-relaxed">{selectedTicket.message}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-100">
              <div className="flex justify-between"><span>Player Name:</span><strong>{selectedTicket.user}</strong></div>
              <div className="flex justify-between"><span>User ID:</span><strong className="font-mono">{selectedTicket.user_id}</strong></div>
              <div className="flex justify-between"><span>Assigned Officer:</span><strong>{selectedTicket.agent}</strong></div>
              <div className="flex justify-between"><span>Priority:</span><strong className="text-rose-600">{selectedTicket.priority}</strong></div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t">
              <button
                onClick={() => handleStatusChange(selectedTicket, 'In Progress')}
                className="flex-1 rounded-xl bg-blue-50 py-2 font-bold text-blue-700 hover:bg-blue-100"
              >
                Set In Progress
              </button>
              <button
                onClick={() => handleStatusChange(selectedTicket, 'Resolved')}
                className="flex-1 rounded-xl bg-emerald-600 py-2 font-bold text-white hover:bg-emerald-700"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
