import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  History, Wallet, Plus, Pencil, Trash2, IndianRupee, TrendingUp,
  Layers, CheckCircle2, Receipt, ShieldCheck, Copy, Check, Filter,
  ArrowUpRight, Award, Search, Sparkles, RefreshCw, KeyRound, LogIn, AlertCircle
} from 'lucide-react'
import DataTable from '@/components/DataTable'
import { PageBanner, Modal, useToast, money } from '@/components/ui'
import fundTransferBg from '@/assets/images/FUND TRANSFER.png'
import { ROUTES } from '@/constants/routes'
import {
  getFundTransfers, saveFundTransfers,
  getSummary, saveSummary,
  saveSubtypes, normalizeFundTransferItem
} from './fundTransferStore'
import { apiRequest } from '@/utils/apiClient'
import auth from '@/utils/auth'
import { API_ENDPOINTS } from '@/constants/api'

export default function FundTransferHistory() {
  const [rows, setRows] = useState(getFundTransfers)
  const [summary, setSummary] = useState(getSummary)
  const [filterTab, setFilterTab] = useState('ALL') // ALL, ADD_FUND, BONUS, FUND_TRANSFER, HIGH_VALUE
  const [edit, setEdit] = useState(null)
  const [receiptModal, setReceiptModal] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [toast, node] = useToast()

  // API States
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [lastSynced, setLastSynced] = useState(null)

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
    toast(`Copied ${text} to clipboard!`)
  }

  const persistRows = (updater) => {
    setRows((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveFundTransfers(next)
      return next
    })
  }

  // Fetch History from /admin/fund-transfer/history
  const fetchFundHistory = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true)
    else setIsLoading(true)
    setApiError(null)

    const endpoints = [
      API_ENDPOINTS.FUND_TRANSFER_HISTORY_PROXY,     // '/admin/fund-transfer/history'
      API_ENDPOINTS.FUND_TRANSFER_HISTORY_API_PROXY, // '/api/admin/fund-transfer/history'
    ]

    let json = null
    let usedEndpoint = null
    let lastErr = null

    for (const ep of endpoints) {
      try {
        console.log(`[Veronova Fund Transfer] Fetching GET ${ep}...`)
        json = await apiRequest(ep, { method: 'GET' })
        usedEndpoint = ep
        console.log(`[Veronova Fund Transfer] Response from ${ep}:`, json)
        break
      } catch (err) {
        lastErr = err
        if (err.status === 404) continue
        break
      }
    }

    if (json) {
      const payload = json.data || json
      const historyList = payload.history || payload.list || (Array.isArray(payload) ? payload : null)

      if (Array.isArray(historyList)) {
        const normalized = historyList
          .map((item, idx) => normalizeFundTransferItem(item, idx))
          .filter(Boolean)
        setRows(normalized)
        saveFundTransfers(normalized)
        setLastSynced(new Date().toLocaleTimeString())
        if (isManual) toast(`Synced ${normalized.length} fund transfer transaction(s) from server`)
        console.log(`[Veronova Fund Transfer] Loaded ${normalized.length} transactions from ${usedEndpoint}`)
      }

      if (payload.summary) {
        setSummary(payload.summary)
        saveSummary(payload.summary)
      }

      if (Array.isArray(payload.subtypes)) {
        saveSubtypes(payload.subtypes)
      }
    } else if (lastErr) {
      console.error('[Veronova Fund Transfer] Fetch error:', lastErr)
      setApiError(lastErr.message || 'Could not fetch fund transfer history')
      if (isManual) toast(`Sync failed: ${lastErr.message}`)
    }

    setIsLoading(false)
    setIsRefreshing(false)
  }, [toast])

  // Initial load
  useEffect(() => {
    fetchFundHistory()
  }, [fetchFundHistory])

  const handleSaveEdit = (e) => {
    e.preventDefault()
    persistRows((prev) =>
      prev.map((r) =>
        r.id === edit.id
          ? {
              ...r,
              amount: Number(edit.amount),
              desc: edit.desc,
              remark: edit.remark,
              user: edit.user,
              user_name: edit.user_name,
            }
          : r
      )
    )
    toast('Transfer record updated successfully')
    setEdit(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transfer transaction?')) {
      persistRows((prev) => prev.filter((r) => r.id !== id))
      toast('Transfer record deleted')
    }
  }

  // KPIs
  const totalTransferred = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  const addFundList = rows.filter((r) => String(r.desc).toUpperCase().includes('ADD'))
  const addFundVolume = addFundList.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  const bonusList = rows.filter((r) => String(r.desc).toUpperCase().includes('BONUS'))
  const bonusVolume = bonusList.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  const highValueList = rows.filter((r) => Number(r.amount) >= 1000)

  // Filtered rows for table
  const displayRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterTab === 'ADD_FUND' && !String(r.desc).toUpperCase().includes('ADD')) return false
      if (filterTab === 'BONUS' && !String(r.desc).toUpperCase().includes('BONUS')) return false
      if (filterTab === 'FUND_TRANSFER' && !String(r.desc).toUpperCase().includes('TRANSFER')) return false
      if (filterTab === 'HIGH_VALUE' && Number(r.amount) < 1000) return false
      return true
    })
  }, [rows, filterTab])

  // Columns definition
  const cols = [
    {
      key: 'id',
      label: '#ID & TxID',
      render: (r) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span>
          <p className="font-mono text-[10px] text-slate-500 font-semibold">{r.tx_id || `TXN_${r.id}`}</p>
        </div>
      ),
    },
    {
      key: 'user',
      label: 'Recipient Player',
      render: (r) => (
        <div className="flex items-center gap-2.5 min-w-[170px]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-extrabold text-xs shadow-2xs">
            {(r.user_name || r.user || 'P').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-extrabold text-slate-900 text-sm">{r.user_name || 'Player'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-1 rounded">
                {r.user}
              </span>
              <button
                onClick={() => handleCopy(r.user, r.id)}
                className="text-slate-400 hover:text-slate-600"
                title="Copy User ID"
              >
                {copiedId === r.id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount Transferred',
      render: (r) => (
        <div className="font-black text-emerald-600 text-sm">
          +₹{Number(r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      ),
    },
    {
      key: 'desc',
      label: 'Transfer Type',
      render: (r) => {
        const isBonus = String(r.desc).toUpperCase().includes('BONUS')
        const isAdd = String(r.desc).toUpperCase().includes('ADD')
        const badgeCls = isBonus
          ? 'bg-purple-50 text-purple-700 border-purple-200'
          : isAdd
          ? 'bg-blue-50 text-blue-700 border-blue-200'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        return (
          <span className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-bold border ${badgeCls}`}>
            {r.desc}
          </span>
        )
      },
    },
    {
      key: 'remark',
      label: 'Purpose / Remark',
      render: (r) => (
        <div className="max-w-[200px]">
          <span className="text-xs text-slate-700 font-medium truncate block">{r.remark || '-'}</span>
          <span className="text-[10px] text-slate-400 font-mono">{r.operator || 'Super Admin (ADM01)'}</span>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date & Time',
      render: (r) => <span className="text-xs text-slate-500 font-mono">{r.date}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={12} className="text-emerald-600" /> {r.status || 'Completed'}
        </span>
      ),
    },
    {
      label: 'Action',
      render: (r) => (
        <div className="flex items-center gap-1">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-2xs"
            title="View Receipt Voucher"
            onClick={() => setReceiptModal(r)}
          >
            <Receipt size={14} />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-700 hover:text-white transition shadow-2xs"
            title="Edit record"
            onClick={() => setEdit(r)}
          >
            <Pencil size={14} />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition shadow-2xs"
            title="Delete record"
            onClick={() => handleDelete(r.id)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageBanner
        title="Fund Transfer History"
        icon={History}
        bgImage={fundTransferBg}
        crumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Fund Transfer', to: ROUTES.FUND_TRANSFER_ADD },
          { label: 'Transfer Records' },
        ]}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchFundHistory(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white border border-white/30 hover:bg-white/30 transition shadow-sm disabled:opacity-50 cursor-pointer"
            title="Sync with Backend Fund Transfer API"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Live'}</span>
          </button>
          <Link
            to={ROUTES.FUND_TRANSFER_ADD}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-extrabold text-blue-700 shadow-xl transition-all hover:bg-blue-50 hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <Plus size={16} /> New Fund Transfer
          </Link>
        </div>
      </PageBanner>

      {/* API Notice if any */}
      {apiError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 shadow-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span>Notice: {apiError}</span>
          </div>
          <button
            onClick={() => fetchFundHistory(true)}
            className="flex items-center gap-1 rounded bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900 hover:bg-amber-200 transition"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} /> Retry
          </button>
        </div>
      )}

      {/* Compact, Sleek Treasury Disbursement & Transfer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Transferred Volume</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              ₹{Number(totalTransferred).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{summary?.total_transactions ?? rows.length} settled events</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Direct Add Fund</p>
            <h3 className="text-xl font-bold text-emerald-600 mt-0.5 tracking-tight font-mono">
              ₹{addFundVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{addFundList.length} credits • {((addFundVolume / (totalTransferred || 1)) * 100).toFixed(0)}% capital</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Wallet size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Bonus & Promo Grants</p>
            <h3 className="text-xl font-bold text-purple-600 mt-0.5 tracking-tight font-mono">
              ₹{bonusVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{bonusList.length} incentive grants</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <Award size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">High Value Disbursals</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {highValueList.length} Vouchers
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">≥₹1,000 double-audited</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <ShieldCheck size={18} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card p-4 space-y-4 shadow-sm">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All Transfers', count: rows.length },
              { id: 'ADD_FUND', label: 'Add Fund', count: addFundList.length },
              { id: 'BONUS', label: 'Bonus', count: bonusList.length },
              { id: 'HIGH_VALUE', label: 'High Value (≥₹1k)', count: highValueList.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  filterTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                    filterTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <Link
            to={ROUTES.FUND_TRANSFER_ADD}
            className="btn !py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <Plus size={15} /> Add Transfer
          </Link>
        </div>

        {/* DataTable */}
        <DataTable
          columns={cols}
          rows={displayRows}
          exportName="fund-transfer-history"
          placeholder="Search by User ID, Name, Tx ID, or remark..."
        />
      </div>

      {/* ================= MODAL: DIGITAL VOUCHER RECEIPT ================= */}
      {receiptModal && (
        <Modal title="Transaction Voucher Receipt" onClose={() => setReceiptModal(null)}>
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 text-white text-center shadow-lg">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                <CheckCircle2 size={26} />
              </div>
              <p className="text-xs uppercase tracking-widest text-blue-300 font-bold">Transaction Confirmed</p>
              <h2 className="mt-1 text-3xl font-black">
                ₹{Number(receiptModal.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
              <p className="mt-1 font-mono text-xs text-blue-300">{receiptModal.tx_id || `TXN_${receiptModal.id}`}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient ID:</span>
                <span className="font-mono font-bold text-slate-800">{receiptModal.user}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Player Name:</span>
                <span className="font-bold text-slate-800">{receiptModal.user_name || 'Verified Player'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-blue-700">{receiptModal.desc}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Purpose / Remark:</span>
                <span className="font-medium text-slate-700">{receiptModal.remark}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Execution Date:</span>
                <span className="font-medium text-slate-700">{receiptModal.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Authorized By:</span>
                <span className="font-semibold text-slate-800">{receiptModal.operator || 'Super Admin (ADM01)'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button className="btn w-full font-bold" onClick={() => setReceiptModal(null)}>
                Close Receipt
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= MODAL: EDIT RECORD ================= */}
      {edit && (
        <Modal
          title={`Edit Transfer #${edit.id} (${edit.user})`}
          onClose={() => setEdit(null)}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">User ID</label>
                <input
                  className="input font-mono font-bold"
                  value={edit.user}
                  onChange={(e) => setEdit({ ...edit, user: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Player Name</label>
                <input
                  className="input"
                  value={edit.user_name || ''}
                  onChange={(e) => setEdit({ ...edit, user_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  className="input font-bold"
                  value={edit.amount}
                  onChange={(e) => setEdit({ ...edit, amount: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Category</label>
                <select
                  className="input font-semibold"
                  value={edit.desc}
                  onChange={(e) => setEdit({ ...edit, desc: e.target.value })}
                >
                  <option value="ADD FUND">ADD FUND</option>
                  <option value="BONUS">BONUS</option>
                  <option value="FUND TRANSFER">FUND TRANSFER</option>
                  <option value="PRIZE">PRIZE</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Remark / Note</label>
              <input
                className="input"
                value={edit.remark}
                onChange={(e) => setEdit({ ...edit, remark: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setEdit(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn font-bold">
                Update Record
              </button>
            </div>
          </form>
        </Modal>
      )}





      {node}
    </div>
  )
}
