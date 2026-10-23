import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowUpFromLine, CheckCircle2, Clock, AlertCircle, Copy, Check,
  Search, FileSpreadsheet, Eye, DollarSign, Wallet, ShieldCheck,
  Building2, ArrowUpRight, TrendingDown, Send, Printer, RefreshCw, ChevronDown
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, Modal, useToast, money } from '@/components/ui'
import { apiRequest } from '@/utils/apiClient'
import { API_ENDPOINTS } from '@/constants/api'
import { ROUTES } from '@/constants/routes'
import {
  getWithdrawals,
  saveWithdrawals,
  normalizeWithdrawal,
  deduplicateWithdrawals,
} from './withdrawalStore'

export default function Withdrawal({ statusMode = null }) {
  const navigate = useNavigate()
  const [rows, setRows] = useState(getWithdrawals)
  const [filterTab, setFilterTab] = useState(statusMode || 'ALL') // ALL, APPROVED, PENDING, REJECT
  const [copiedKey, setCopiedKey] = useState(null)
  const [voucherModal, setVoucherModal] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  const [toast, node] = useToast()

  const persist = (next) => {
    const clean = deduplicateWithdrawals(next)
    setRows(clean)
    saveWithdrawals(clean)
  }

  // Get corresponding endpoint based on filter tab
  const getTabEndpoint = (tab) => {
    switch (tab) {
      case 'PENDING':
        return API_ENDPOINTS.WITHDRAWALS_PENDING_PROXY
      case 'APPROVED':
        return API_ENDPOINTS.WITHDRAWALS_APPROVED_PROXY
      case 'REJECT':
      case 'REJECTED':
        return API_ENDPOINTS.WITHDRAWALS_REJECT_PROXY
      default:
        return API_ENDPOINTS.WITHDRAWALS_PROXY
    }
  }

  // Load live withdrawals from backend
  const loadWithdrawals = useCallback(async (isManual = false, targetTab = (statusMode || filterTab)) => {
    if (isManual) setIsRefreshing(true)
    else setIsLoading(true)

    const endpoint = getTabEndpoint(targetTab)

    try {
      console.log(`[Veronova Withdrawals] Fetching from: ${endpoint}`)
      const json = await apiRequest(endpoint, { method: 'GET' })

      if (json && (json.status === 200 || json.data || Array.isArray(json))) {
        const payload = json.data || json
        const rawList =
          payload.list ||
          payload.withdrawals ||
          payload.payouts ||
          payload.data ||
          payload.rows ||
          (Array.isArray(payload) ? payload : null)

        if (Array.isArray(rawList)) {
          const formatted = rawList
            .map((item, idx) => normalizeWithdrawal(item, idx))
            .filter(Boolean)

          if (formatted.length > 0) {
            setRows((prev) => {
              let updated
              if (targetTab === 'ALL' || !targetTab) {
                updated = deduplicateWithdrawals(formatted)
              } else {
                const normTab = targetTab === 'REJECTED' ? 'REJECT' : targetTab
                const others = prev.filter((r) => r.status.toUpperCase() !== normTab)
                updated = deduplicateWithdrawals([...formatted, ...others])
              }
              saveWithdrawals(updated)
              return updated
            })
          }
          setLastSynced(new Date().toLocaleTimeString())
          console.log(`[Veronova Withdrawals] Synced records from ${endpoint}`)
        }
      }
    } catch (err) {
      console.warn(`[Veronova Withdrawals] Error syncing from ${endpoint}, using cache:`, err.message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [filterTab, statusMode])

  useEffect(() => {
    if (statusMode) {
      setFilterTab(statusMode)
      loadWithdrawals(false, statusMode)
    } else {
      setFilterTab('ALL')
      loadWithdrawals(false, 'ALL')
    }
  }, [statusMode, loadWithdrawals])

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1800)
    toast(`Copied ${text} to clipboard!`)
  }

  // 3-Option Status Dropdown Handler [Pending, Approved, Reject]
  const handleStatusChange = async (row, newStatus) => {
    if (row.status === newStatus) return

    const next = rows.map((r) => (r.id === row.id ? { ...r, status: newStatus } : r))
    persist(next)
    toast(`Withdrawal #${row.req_id || row.id} updated to ${newStatus}!`)

    const payload = {
      id: row.id,
      status: newStatus.toLowerCase(),
      status_name: newStatus,
    }

    try {
      const statusUrl = API_ENDPOINTS.WITHDRAWAL_STATUS_PROXY(row.id)
      let ok = false

      try {
        const res = await apiRequest(statusUrl, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        if (res && (res.status === 200 || res.success)) ok = true
      } catch {
        try {
          const res2 = await apiRequest(statusUrl, {
            method: 'POST',
            body: JSON.stringify(payload),
          })
          if (res2 && (res2.status === 200 || res2.success)) ok = true
        } catch {}
      }

      if (!ok) {
        const itemUrl = API_ENDPOINTS.WITHDRAWAL_ITEM_PROXY(row.id)
        await apiRequest(itemUrl, {
          method: 'PUT',
          body: JSON.stringify(payload),
        }).catch(async () => {
          await apiRequest(itemUrl, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          }).catch(async () => {
            await apiRequest(itemUrl, {
              method: 'POST',
              body: JSON.stringify(payload),
            }).catch(() => null)
          })
        })
      }
    } catch (err) {
      console.warn(`[Veronova Withdrawals] Status update failed for #${row.id}:`, err.message)
    }
  }

  const handleViewVoucher = async (row) => {
    setVoucherModal(row)
    try {
      const itemUrl = API_ENDPOINTS.WITHDRAWAL_ITEM_PROXY(row.id)
      const res = await apiRequest(itemUrl, { method: 'GET' }).catch(() => null)
      if (res && (res.data || res.withdrawal || res.id)) {
        const fresh = normalizeWithdrawal(res.data || res.withdrawal || res)
        if (fresh) {
          setVoucherModal((prev) => ({ ...prev, ...fresh }))
        }
      }
    } catch {
      // Use local row
    }
  }

  const currentTab = statusMode || filterTab

  const pageMeta = useMemo(() => {
    if (statusMode === 'PENDING') {
      return {
        title: 'Pending Withdrawals Approval Queue',
        icon: Clock,
        crumbs: [{ label: 'Dashboard', to: '/' }, { label: 'Withdrawal', to: '/withdrawal' }, { label: 'Pending Withdrawals' }],
      }
    }
    if (statusMode === 'APPROVED') {
      return {
        title: 'Approved & Settled Withdrawals',
        icon: CheckCircle2,
        crumbs: [{ label: 'Dashboard', to: '/' }, { label: 'Withdrawal', to: '/withdrawal' }, { label: 'Approved Withdrawals' }],
      }
    }
    if (statusMode === 'REJECT') {
      return {
        title: 'Rejected Withdrawals Audit Log',
        icon: AlertCircle,
        crumbs: [{ label: 'Dashboard', to: '/' }, { label: 'Withdrawal', to: '/withdrawal' }, { label: 'Reject Withdrawals' }],
      }
    }
    return {
      title: 'Withdrawal Requests & Payout Desk',
      icon: ArrowUpFromLine,
      crumbs: [{ label: 'Dashboard', to: '/' }, { label: 'Payouts & Cashouts' }],
    }
  }, [statusMode])

  // Stats Computations
  const approvedRows = useMemo(() => rows.filter((r) => r.status === 'Approved'), [rows])
  const approvedSum = useMemo(() => approvedRows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0), [approvedRows])
  const pendingRows = useMemo(() => rows.filter((r) => r.status === 'Pending'), [rows])
  const pendingSum = useMemo(() => pendingRows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0), [pendingRows])
  const rejectRows = useMemo(() => rows.filter((r) => r.status === 'Reject'), [rows])
  const rejectSum = useMemo(() => rejectRows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0), [rejectRows])

  // Filtered Rows
  const displayRows = useMemo(() => {
    const filtered = rows.filter((r) => {
      if (currentTab === 'APPROVED' && r.status !== 'Approved') return false
      if (currentTab === 'PENDING' && r.status !== 'Pending') return false
      if (currentTab === 'REJECT' && r.status !== 'Reject') return false
      if (currentTab === 'HIGH' && r.amount < 10000) return false
      return true
    })
    return deduplicateWithdrawals(filtered)
  }, [rows, currentTab])

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
          <div className="flex items-center gap-1 mt-0.5">
            <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1 rounded">{r.user_id}</span>
            <span className="text-[11px] text-slate-400 font-mono font-bold">• #{r.req_id}</span>
          </div>
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
          ₹{Number(r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status (3 Dropdown Options)',
      render: (r) => (
        <div className="relative inline-flex items-center">
          <select
            value={r.status}
            onChange={(e) => handleStatusChange(r, e.target.value)}
            className={`cursor-pointer rounded-xl px-2.5 py-1 text-xs font-black border outline-none transition-all shadow-2xs appearance-none pr-6 ${
              r.status === 'Approved'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : r.status === 'Pending'
                ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
            }`}
            title="Change status: Pending, Approved, Reject"
          >
            <option value="Pending" className="text-amber-800 bg-white font-bold">Pending</option>
            <option value="Approved" className="text-emerald-800 bg-white font-bold">Approved</option>
            <option value="Reject" className="text-rose-800 bg-white font-bold">Reject</option>
          </select>
          <ChevronDown size={12} className="pointer-events-none absolute right-2 text-slate-500" />
        </div>
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
          {r.status === 'Pending' ? (
            <>
              <button
                onClick={() => handleStatusChange(r, 'Approved')}
                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-2xs flex items-center gap-1"
                title="Mark as Approved & Pay Now"
              >
                <Send size={11} /> Pay Now
              </button>
              <button
                onClick={() => handleStatusChange(r, 'Reject')}
                className="rounded-lg bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700 hover:bg-rose-600 hover:text-white transition"
                title="Mark as Reject"
              >
                Reject
              </button>
            </>
          ) : r.status === 'Reject' ? (
            <button
              onClick={() => handleStatusChange(r, 'Pending')}
              className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
              title="Re-open to Pending"
            >
              Re-open
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange(r, 'Reject')}
              className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition"
              title="Reverse to Reject"
            >
              Reject
            </button>
          )}
          <button
            onClick={() => handleViewVoucher(r)}
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
        title={pageMeta.title}
        icon={pageMeta.icon}
        crumbs={pageMeta.crumbs}
      >
        <div className="flex flex-wrap items-center gap-2">
          {lastSynced && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-white/15 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Synced: {lastSynced}
            </span>
          )}
          <button
            onClick={() => loadWithdrawals(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs px-3 py-2 text-xs font-bold text-white transition disabled:opacity-50"
            title="Sync Live Withdrawals from Backend"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Sync Live</span>
          </button>
        </div>
      </PageBanner>

      {/* Compact, Sleek Withdrawal Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Disbursement Queue</p>
            <h3 className="text-xl font-bold text-amber-600 mt-0.5 tracking-tight font-mono">
              ₹{pendingSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{pendingRows.length} awaiting bank IMPS</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Clock size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Settled Cashouts</p>
            <h3 className="text-xl font-bold text-emerald-600 mt-0.5 tracking-tight font-mono">
              ₹{approvedSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{approvedRows.length} direct IMPS credited</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rejected Requests</p>
            <h3 className="text-xl font-bold text-rose-600 mt-0.5 tracking-tight font-mono">
              ₹{rejectSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{rejectRows.length} refunded to wallet</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <AlertCircle size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Cashouts</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {rows.length} Payouts
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {((approvedRows.length / (rows.length || 1)) * 100).toFixed(0)}% Approval rate
            </p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ArrowUpFromLine size={18} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Status Dropdown Filter + Segmented Pills with Router Links */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Page / Status:</span>
              <select
                value={currentTab}
                onChange={(e) => {
                  const val = e.target.value
                  if (val === 'PENDING') navigate(ROUTES.WITHDRAWAL_PENDING)
                  else if (val === 'APPROVED') navigate(ROUTES.WITHDRAWAL_APPROVED)
                  else if (val === 'REJECT') navigate(ROUTES.WITHDRAWAL_REJECT)
                  else navigate(ROUTES.WITHDRAWAL)
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-blue-500"
              >
                <option value="ALL">All Statuses ({rows.length})</option>
                <option value="PENDING">Pending Page ({pendingRows.length})</option>
                <option value="APPROVED">Approved Page ({approvedRows.length})</option>
                <option value="REJECT">Reject Page ({rejectRows.length})</option>
              </select>
            </div>

            <div className="hidden sm:flex items-center gap-1.5">
              {[
                { id: 'ALL', label: 'All Withdrawals', to: ROUTES.WITHDRAWAL, count: rows.length },
                { id: 'PENDING', label: 'Pending', to: ROUTES.WITHDRAWAL_PENDING, count: pendingRows.length, color: 'text-amber-700 bg-amber-50' },
                { id: 'APPROVED', label: 'Approved', to: ROUTES.WITHDRAWAL_APPROVED, count: approvedRows.length, color: 'text-emerald-700 bg-emerald-50' },
                { id: 'REJECT', label: 'Reject', to: ROUTES.WITHDRAWAL_REJECT, count: rejectRows.length, color: 'text-rose-700 bg-rose-50' },
              ].map((tab) => {
                const isActive = currentTab === tab.id
                return (
                  <Link
                    key={tab.id}
                    to={tab.to}
                    className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          <button
            onClick={() => exportCSV('withdrawals_payout_ledger', exportCols, displayRows)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <FileSpreadsheet size={15} /> Export to Excel
          </button>
        </div>

        <DataTable columns={cols} rows={displayRows} unit="payouts" placeholder="Search by account number, IFSC, player ID or name..." />
      </div>

      {/* Payout Voucher Modal */}
      {voucherModal && (
        <Modal isOpen={!!voucherModal} onClose={() => setVoucherModal(null)} title={`Payout Voucher: #${voucherModal.req_id}`} maxWidth="max-w-md">
          <div className="space-y-3 text-xs">
            <div className="rounded-xl bg-slate-900 p-4 text-white">
              <p className="text-slate-400 font-bold uppercase text-[10px]">Beneficiary Payout Details</p>
              <p className="text-2xl font-black mt-1 font-mono">₹{Number(voucherModal.amount).toLocaleString('en-IN')}</p>
              <p className="text-slate-300 font-mono mt-1">A/C: {voucherModal.acc_no}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-100">
              <div className="flex justify-between"><span>Beneficiary Name:</span><strong>{voucherModal.holder}</strong></div>
              <div className="flex justify-between"><span>Bank Name:</span><strong>{voucherModal.bank}</strong></div>
              <div className="flex justify-between"><span>IFSC Code:</span><strong className="font-mono">{voucherModal.ifsc}</strong></div>
              <div className="flex justify-between"><span>Player ID:</span><strong className="font-mono">{voucherModal.user_id}</strong></div>
              <div className="flex justify-between items-center">
                <span>Status:</span>
                <span
                  className={`rounded-lg px-2 py-0.5 font-bold ${
                    voucherModal.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : voucherModal.status === 'Pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {voucherModal.status}
                </span>
              </div>
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
