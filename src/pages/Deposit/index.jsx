import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowDownToLine, CheckCircle2, Clock, AlertCircle, Copy, Check,
  Search, FileSpreadsheet, Eye, DollarSign, Wallet, ShieldCheck,
  TrendingUp, RefreshCw, X, Filter, Sparkles, ChevronDown
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, Modal, useToast, money } from '@/components/ui'
import { apiRequest } from '@/utils/apiClient'
import { API_ENDPOINTS } from '@/constants/api'
import { ROUTES } from '@/constants/routes'
import {
  getDeposits,
  saveDeposits,
  normalizeDeposit,
  deduplicateDeposits,
} from './depositStore'

export default function Deposit({ statusMode = null }) {
  const navigate = useNavigate()
  const [rows, setRows] = useState(getDeposits)
  const [filterTab, setFilterTab] = useState(statusMode || 'ALL') // ALL, PENDING, SUCCESS, REJECT, UPI, IMPS
  const [selectedProof, setSelectedProof] = useState(null)
  const [copiedKey, setCopiedKey] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  const [toast, node] = useToast()

  const persist = (next) => {
    const clean = deduplicateDeposits(next)
    setRows(clean)
    saveDeposits(clean)
  }

  // Get corresponding endpoint based on filter tab
  const getTabEndpoint = (tab) => {
    switch (tab) {
      case 'PENDING':
        return API_ENDPOINTS.DEPOSITS_PENDING_PROXY
      case 'SUCCESS':
        return API_ENDPOINTS.DEPOSITS_SUCCESS_PROXY
      case 'REJECT':
        return API_ENDPOINTS.DEPOSITS_REJECT_PROXY
      default:
        return API_ENDPOINTS.DEPOSITS_PROXY
    }
  }

  // Load live deposits from /admin/deposits or specific status endpoint
  const loadDeposits = useCallback(async (isManual = false, targetTab = filterTab) => {
    if (isManual) setIsRefreshing(true)
    else setIsLoading(true)

    const endpoint = getTabEndpoint(targetTab)

    try {
      console.log(`[Veronova Deposits] Fetching from: ${endpoint}`)
      const json = await apiRequest(endpoint, { method: 'GET' })

      if (json && (json.status === 200 || json.data || Array.isArray(json))) {
        const payload = json.data || json
        const rawList =
          payload.list ||
          payload.deposits ||
          payload.recharges ||
          payload.data ||
          payload.rows ||
          (Array.isArray(payload) ? payload : null)

        if (Array.isArray(rawList)) {
          const formatted = rawList
            .map((item, idx) => normalizeDeposit(item, idx))
            .filter(Boolean)

          if (formatted.length > 0) {
            setRows((prev) => {
              let updated
              if (targetTab === 'ALL' || !targetTab) {
                updated = deduplicateDeposits(formatted)
              } else {
                // Merge fresh rows for this status tab with existing rows
                const others = prev.filter((r) => r.status.toUpperCase() !== targetTab)
                updated = deduplicateDeposits([...formatted, ...others])
              }
              saveDeposits(updated)
              return updated
            })
          }
          setLastSynced(new Date().toLocaleTimeString())
          console.log(`[Veronova Deposits] Synced records from ${endpoint}`)
        }
      }
    } catch (err) {
      console.warn(`[Veronova Deposits] Error syncing from ${endpoint}, using cache:`, err.message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [filterTab])

  useEffect(() => {
    if (statusMode) {
      setFilterTab(statusMode)
      loadDeposits(false, statusMode)
    } else {
      setFilterTab('ALL')
      loadDeposits(false, 'ALL')
    }
  }, [statusMode, loadDeposits])

  const handleTabChange = (newTab) => {
    setFilterTab(newTab)
    if (['ALL', 'PENDING', 'SUCCESS', 'REJECT'].includes(newTab)) {
      loadDeposits(false, newTab)
    }
  }

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1800)
    toast(`Copied ${text} to clipboard!`)
  }

  // 3 Dropdown Status Change Handler [Pending, Success, Reject]
  // Uses /admin/deposits/:id/status with fallback to /admin/deposits/:id
  const handleStatusChange = async (row, newStatus) => {
    if (row.status === newStatus) return

    const next = rows.map((r) => (r.id === row.id ? { ...r, status: newStatus } : r))
    persist(next)
    toast(`Deposit #${row.txn_id || row.id} updated to ${newStatus}!`)

    const payload = {
      id: row.id,
      status: newStatus.toLowerCase(),
      status_name: newStatus,
    }

    try {
      // 1. Primary: /admin/deposits/:id/status
      const statusUrl = API_ENDPOINTS.DEPOSIT_STATUS_PROXY(row.id)
      let updatedOk = false

      try {
        const res = await apiRequest(statusUrl, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        if (res && (res.status === 200 || res.success)) updatedOk = true
      } catch {
        try {
          const res2 = await apiRequest(statusUrl, {
            method: 'POST',
            body: JSON.stringify(payload),
          })
          if (res2 && (res2.status === 200 || res2.success)) updatedOk = true
        } catch {}
      }

      // 2. Fallback: /admin/deposits/:id
      if (!updatedOk) {
        const itemUrl = API_ENDPOINTS.DEPOSIT_ITEM_PROXY(row.id)
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
      console.warn(`[Veronova Deposits] Status update failed for #${row.id}:`, err.message)
    }
  }

  // Fetch single deposit via /admin/deposits/:id on proof view
  const handleViewProof = async (row) => {
    setSelectedProof(row)
    try {
      const itemUrl = API_ENDPOINTS.DEPOSIT_ITEM_PROXY(row.id)
      const res = await apiRequest(itemUrl, { method: 'GET' }).catch(() => null)
      if (res && (res.data || res.deposit || res.id)) {
        const fresh = normalizeDeposit(res.data || res.deposit || res)
        if (fresh) {
          setSelectedProof((prev) => ({ ...prev, ...fresh }))
        }
      }
    } catch (err) {
      console.log('[Veronova Deposits] View voucher fallback to local item')
    }
  }

  const currentTab = statusMode || filterTab

  const pageMeta = useMemo(() => {
    if (statusMode === 'PENDING') {
      return {
        title: 'Pending Deposits Review Queue',
        icon: Clock,
        crumbs: [{ label: 'Dashboard', to: '/' }, { label: 'Deposit', to: '/deposit' }, { label: 'Pending Deposits' }],
      }
    }
    if (statusMode === 'SUCCESS') {
      return {
        title: 'Approved & Success Deposits Ledger',
        icon: CheckCircle2,
        crumbs: [{ label: 'Dashboard', to: '/' }, { label: 'Deposit', to: '/deposit' }, { label: 'Success Deposits' }],
      }
    }
    if (statusMode === 'REJECT') {
      return {
        title: 'Rejected Deposits Audit Log',
        icon: AlertCircle,
        crumbs: [{ label: 'Dashboard', to: '/' }, { label: 'Deposit', to: '/deposit' }, { label: 'Rejected Deposits' }],
      }
    }
    return {
      title: 'Player Deposit & Recharge Ledger',
      icon: ArrowDownToLine,
      crumbs: [{ label: 'Dashboard', to: '/' }, { label: 'Recharge & Deposits' }],
    }
  }, [statusMode])

  // Stats Computations
  const successRows = useMemo(() => rows.filter((r) => r.status === 'Success'), [rows])
  const successSum = useMemo(() => successRows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0), [successRows])
  const pendingRows = useMemo(() => rows.filter((r) => r.status === 'Pending'), [rows])
  const pendingSum = useMemo(() => pendingRows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0), [pendingRows])
  const rejectRows = useMemo(() => rows.filter((r) => r.status === 'Reject'), [rows])
  const rejectSum = useMemo(() => rejectRows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0), [rejectRows])

  // Filtered Rows
  const displayRows = useMemo(() => {
    const filtered = rows.filter((r) => {
      if (currentTab === 'SUCCESS' && r.status !== 'Success') return false
      if (currentTab === 'PENDING' && r.status !== 'Pending') return false
      if (currentTab === 'REJECT' && r.status !== 'Reject') return false
      if (currentTab === 'UPI' && !r.channel?.includes('UPI')) return false
      if (currentTab === 'IMPS' && !r.channel?.includes('IMPS')) return false
      return true
    })
    return deduplicateDeposits(filtered)
  }, [rows, currentTab])

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
              r.status === 'Success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : r.status === 'Pending'
                ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
            }`}
            title="Change status: Pending, Success, Reject"
          >
            <option value="Pending" className="text-amber-800 bg-white font-bold">Pending</option>
            <option value="Success" className="text-emerald-800 bg-white font-bold">Success</option>
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
                onClick={() => handleStatusChange(r, 'Success')}
                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-2xs"
                title="Mark as Success"
              >
                Approve
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
            onClick={() => handleViewProof(r)}
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
            onClick={() => loadDeposits(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs px-3 py-2 text-xs font-bold text-white transition disabled:opacity-50"
            title="Sync Live Deposits from Backend"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Sync Live</span>
          </button>
        </div>
      </PageBanner>

      {/* Compact, Sleek Deposit Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Success Deposit Inflow</p>
            <h3 className="text-xl font-bold text-emerald-600 mt-0.5 tracking-tight font-mono">
              ₹{successSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{successRows.length} cleared deposits</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Review Queue</p>
            <h3 className="text-xl font-bold text-amber-600 mt-0.5 tracking-tight font-mono">
              ₹{pendingSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{pendingRows.length} awaiting audit</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Clock size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rejected Requests</p>
            <h3 className="text-xl font-bold text-rose-600 mt-0.5 tracking-tight font-mono">
              ₹{rejectSum.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{rejectRows.length} rejected</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <AlertCircle size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Recharges</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {rows.length} Transactions
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {((successRows.length / (rows.length || 1)) * 100).toFixed(0)}% Clearance rate
            </p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ArrowDownToLine size={18} />
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
                  if (val === 'PENDING') navigate(ROUTES.DEPOSIT_PENDING)
                  else if (val === 'SUCCESS') navigate(ROUTES.DEPOSIT_SUCCESS)
                  else if (val === 'REJECT') navigate(ROUTES.DEPOSIT_REJECT)
                  else navigate(ROUTES.DEPOSIT)
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-blue-500"
              >
                <option value="ALL">All Statuses ({rows.length})</option>
                <option value="PENDING">Pending Page ({pendingRows.length})</option>
                <option value="SUCCESS">Success Page ({successRows.length})</option>
                <option value="REJECT">Reject Page ({rejectRows.length})</option>
              </select>
            </div>

            <div className="hidden sm:flex items-center gap-1.5">
              {[
                { id: 'ALL', label: 'All Deposits', to: ROUTES.DEPOSIT, count: rows.length },
                { id: 'PENDING', label: 'Pending Deposits', to: ROUTES.DEPOSIT_PENDING, count: pendingRows.length, color: 'text-amber-700 bg-amber-50' },
                { id: 'SUCCESS', label: 'Success Deposits', to: ROUTES.DEPOSIT_SUCCESS, count: successRows.length, color: 'text-emerald-700 bg-emerald-50' },
                { id: 'REJECT', label: 'Reject Deposits', to: ROUTES.DEPOSIT_REJECT, count: rejectRows.length, color: 'text-rose-700 bg-rose-50' },
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
              <p className="text-2xl font-black mt-1 font-mono">₹{Number(selectedProof.amount).toLocaleString('en-IN')}</p>
              <p className="text-slate-300 font-mono mt-1">UTR: {selectedProof.utr}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-100">
              <div className="flex justify-between"><span>Player Name:</span><strong>{selectedProof.user_name}</strong></div>
              <div className="flex justify-between"><span>User ID:</span><strong className="font-mono">{selectedProof.user_id}</strong></div>
              <div className="flex justify-between"><span>Gateway Channel:</span><strong>{selectedProof.channel}</strong></div>
              <div className="flex justify-between"><span>Timestamp:</span><strong>{selectedProof.date}</strong></div>
              <div className="flex justify-between items-center">
                <span>Current Status:</span>
                <span
                  className={`rounded-lg px-2 py-0.5 font-bold ${
                    selectedProof.status === 'Success'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedProof.status === 'Pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {selectedProof.status}
                </span>
              </div>
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
