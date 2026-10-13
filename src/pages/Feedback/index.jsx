import { useState, useMemo } from 'react'
import {
  MessageSquare, Star, CheckCircle2, Clock, Eye, Send, Reply,
  Filter, FileSpreadsheet, Plus, Trash2, TrendingUp, ShieldCheck,
  User, AlertCircle, Sparkles, ThumbsUp
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, Modal, useToast } from '@/components/ui'

const SEED_FEEDBACK = [
  {
    id: 1,
    user_name: 'Aman Verma',
    user_id: 'VN_44102',
    rating: 5,
    category: 'Withdrawal Speed',
    message: 'Instant withdrawal in under 2 minutes via IMPS! Truly the best and fastest casino app in India.',
    admin_reply: 'Thank you Aman! We maintain dedicated IMPS liquidity for instant settlements.',
    status: 'Resolved',
    date: '13 Oct 2026 09:15 AM'
  },
  {
    id: 2,
    user_name: 'Vikram Rawat',
    user_id: 'VN_78291',
    rating: 5,
    category: 'VIP Loyalty',
    message: 'Monthly VIP salary was credited on time at midnight. Dedicated VIP manager is very helpful.',
    admin_reply: 'Glad to have you in our VIP Legend tier, Vikram!',
    status: 'Resolved',
    date: '12 Oct 2026 08:30 PM'
  },
  {
    id: 3,
    user_name: 'Kunal Joshi',
    user_id: 'VN_99214',
    rating: 3,
    category: 'Deposit Gateway',
    message: 'UPI QR code took 5 minutes to verify UTR during peak hours. Please optimize PhonePe gateway speed.',
    admin_reply: 'We have upgraded our secondary PhonePe banking node. Thank you for reporting.',
    status: 'Under Review',
    date: '12 Oct 2026 04:20 PM'
  },
  {
    id: 4,
    user_name: 'Pooja Singh',
    user_id: 'VN_12890',
    rating: 5,
    category: 'Game Fairness',
    message: 'Aviator multiplier smoothness and Wingo color charts are very transparent. 10/10 experience!',
    admin_reply: '',
    status: 'Resolved',
    date: '11 Oct 2026 06:10 PM'
  },
  {
    id: 5,
    user_name: 'Deepak Mehta',
    user_id: 'VN_88201',
    rating: 4,
    category: 'UI & Usability',
    message: 'App is very fast. Would love to have dark mode toggle in the player app account settings.',
    admin_reply: 'Dark mode theme is slated for release in the upcoming v3.1 update!',
    status: 'Resolved',
    date: '10 Oct 2026 02:45 PM'
  },
  {
    id: 6,
    user_name: 'Sneha Patel',
    user_id: 'VN_63019',
    rating: 2,
    category: 'Downline Commission',
    message: 'L3 referral commission took a few hours to sync on Sunday evening.',
    admin_reply: 'Checked your account; downline batch settlement was completed. All commissions cleared.',
    status: 'Under Review',
    date: '09 Oct 2026 11:30 AM'
  }
]

export default function Feedback() {
  const [rows, setRows] = useState(() => {
    const raw = localStorage.getItem('veronova_feedbacks_v1')
    return raw ? JSON.parse(raw) : SEED_FEEDBACK
  })
  const [filterTab, setFilterTab] = useState('ALL') // ALL, 5STAR, GRIEVANCE, RESOLVED, REVIEW
  const [replyModal, setReplyModal] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [toast, node] = useToast()

  const persist = (next) => {
    setRows(next)
    localStorage.setItem('veronova_feedbacks_v1', JSON.stringify(next))
  }

  // Computations
  const avgRating = useMemo(() => {
    if (!rows.length) return '5.0'
    return (rows.reduce((acc, r) => acc + r.rating, 0) / rows.length).toFixed(2)
  }, [rows])

  const resolvedCount = useMemo(() => rows.filter((r) => r.status === 'Resolved').length, [rows])
  const reviewCount = useMemo(() => rows.filter((r) => r.status === 'Under Review').length, [rows])

  const displayRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterTab === '5STAR' && r.rating !== 5) return false
      if (filterTab === 'GRIEVANCE' && r.rating > 3) return false
      if (filterTab === 'RESOLVED' && r.status !== 'Resolved') return false
      if (filterTab === 'REVIEW' && r.status !== 'Under Review') return false
      return true
    })
  }, [rows, filterTab])

  const handleSendReply = (e) => {
    e.preventDefault()
    if (!replyModal) return
    const next = rows.map((r) =>
      r.id === replyModal.id ? { ...r, admin_reply: replyText, status: 'Resolved' } : r
    )
    persist(next)
    toast(`Reply sent to ${replyModal.user_name} and marked as Resolved!`)
    setReplyModal(null)
    setReplyText('')
  }

  const exportCols = [
    { key: 'id', label: 'ID' },
    { key: 'user_name', label: 'Player Name' },
    { key: 'user_id', label: 'User ID' },
    { key: 'rating', label: 'Rating' },
    { key: 'category', label: 'Category' },
    { key: 'message', label: 'Feedback Message' },
    { key: 'admin_reply', label: 'Admin Reply' },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Date' },
  ]

  const cols = [
    { key: 'id', label: '#ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    {
      key: 'player',
      label: 'Player Details',
      render: (r) => (
        <div className="min-w-[170px]">
          <span className="font-extrabold text-slate-900 text-sm block">{r.user_name}</span>
          <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1 rounded">{r.user_id}</span>
        </div>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (r) => (
        <div className="flex items-center gap-1 text-amber-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={14} fill={i < r.rating ? 'currentColor' : 'none'} className={i < r.rating ? 'text-amber-500' : 'text-slate-300'} />
          ))}
          <span className="ml-1 text-xs font-black text-slate-800">{r.rating}.0</span>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (r) => <span className="rounded-md bg-purple-50 text-purple-700 px-2 py-0.5 text-xs font-bold border border-purple-200">{r.category}</span>,
    },
    {
      key: 'message',
      label: 'Player Grievance / Feedback',
      render: (r) => (
        <div className="max-w-md text-xs">
          <p className="font-medium text-slate-800">{r.message}</p>
          {r.admin_reply && (
            <div className="mt-1 flex items-start gap-1 text-[11px] text-blue-700 bg-blue-50 p-1.5 rounded-lg border border-blue-100">
              <Reply size={12} className="shrink-0 mt-0.5" />
              <span><strong>Admin:</strong> {r.admin_reply}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${r.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
          {r.status === 'Resolved' ? <CheckCircle2 size={12} /> : <Clock size={12} />} {r.status}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Timestamp',
      render: (r) => <span className="font-mono text-xs text-slate-400 block whitespace-nowrap">{r.date}</span>,
    },
    {
      label: 'Action',
      render: (r) => (
        <button
          onClick={() => {
            setReplyModal(r)
            setReplyText(r.admin_reply || '')
          }}
          className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-extrabold text-blue-700 hover:bg-blue-600 hover:text-white transition shadow-2xs"
          title="Reply to Player"
        >
          <Reply size={13} /> Reply
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageBanner
        title="Player Experience & Feedback Console"
        icon={MessageSquare}
        crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Player Experience' }, { label: 'Feedback Desk' }]}
      />

      {/* Compact, Sleek Feedback & CSAT Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">CSAT Score Index</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {avgRating} <span className="text-xs text-amber-600 font-bold">/ 5.0</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{rows.length} verified ratings</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Star size={18} fill="currentColor" />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Under Review</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {reviewCount} Grievances
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Awaiting reply</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <Clock size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Resolved Reviews</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {resolvedCount} Solved
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Avg turnaround 14 mins</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Feedback</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {rows.length} Entries
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">100% genuine submissions</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <MessageSquare size={18} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All Feedback', count: rows.length },
              { id: '5STAR', label: '5-Star Praises', count: rows.filter((r) => r.rating === 5).length },
              { id: 'GRIEVANCE', label: 'Grievances (≤3★)', count: rows.filter((r) => r.rating <= 3).length },
              { id: 'RESOLVED', label: 'Resolved', count: resolvedCount },
              { id: 'REVIEW', label: 'Under Review', count: reviewCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  filterTab === tab.id ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px] font-black">{tab.count}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => exportCSV('player_feedback_report', exportCols, displayRows)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <FileSpreadsheet size={15} /> Export to Excel
          </button>
        </div>

        <DataTable columns={cols} rows={displayRows} unit="feedback entries" placeholder="Search by player or message..." />
      </div>

      {/* Reply Modal */}
      {replyModal && (
        <Modal isOpen={!!replyModal} onClose={() => setReplyModal(null)} title={`Reply to ${replyModal.user_name}`} maxWidth="max-w-md">
          <form onSubmit={handleSendReply} className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Player Message ({replyModal.category})</span>
              <p className="mt-1 text-slate-800 font-medium text-xs">{replyModal.message}</p>
            </div>
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 mb-1">Official Admin Response</label>
              <textarea
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500"
                rows={3}
                placeholder="Type response to player..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={() => setReplyModal(null)} className="rounded-xl border px-3 py-2 text-xs font-bold text-slate-600">Cancel</button>
              <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 flex items-center gap-1">
                <Send size={13} /> Send Official Reply
              </button>
            </div>
          </form>
        </Modal>
      )}

      {node}
    </div>
  )
}

