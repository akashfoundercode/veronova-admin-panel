import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Receipt, Plus, Pencil, Trash2, ShieldCheck, CheckCircle2,
  SlidersHorizontal, RefreshCw, FileSpreadsheet, Lock, AlertCircle,
  Zap, DollarSign, Wallet, CreditCard, Sparkles
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, Modal, useToast, money } from '@/components/ui'
import { apiRequest } from '@/utils/apiClient'
import { API_ENDPOINTS } from '@/constants/api'
import {
  getPaymentLimits,
  savePaymentLimits,
  normalizePaymentLimit,
  deduplicateLimits,
} from './paymentsLimitStore'

export default function PaymentsLimit() {
  const [rows, setRows] = useState(() => deduplicateLimits(getPaymentLimits()))
  const [filterTab, setFilterTab] = useState('ALL') // ALL, DEPOSIT, WITHDRAWAL
  const [modal, setModal] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  const [toast, node] = useToast()

  const persist = (next) => {
    const clean = deduplicateLimits(next)
    setRows(clean)
    savePaymentLimits(clean)
  }

  // Load payment limits from /admin/payment-limits
  const loadPaymentLimits = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      console.log(`[Veronova Payment Limits] Syncing from: ${API_ENDPOINTS.PAYMENT_LIMITS_PROXY}`)
      const json = await apiRequest(API_ENDPOINTS.PAYMENT_LIMITS_PROXY, { method: 'GET' })

      if (json && (json.status === 200 || json.data || Array.isArray(json))) {
        const payload = json.data || json
        const rawList =
          payload.list ||
          payload.limits ||
          payload.payment_limits ||
          payload.data ||
          payload.rows ||
          (Array.isArray(payload) ? payload : null)

        if (Array.isArray(rawList) && rawList.length > 0) {
          const formatted = rawList
            .map((item, idx) => normalizePaymentLimit(item, idx))
            .filter(Boolean)
          const clean = deduplicateLimits(formatted)
          setRows(clean)
          savePaymentLimits(clean)
          setLastSynced(new Date().toLocaleTimeString())
          console.log(`[Veronova Payment Limits] Loaded ${clean.length} gateway rules from backend`)
        }
      }
    } catch (err) {
      console.warn('[Veronova Payment Limits] Error syncing live limits, using local cache:', err.message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadPaymentLimits()
  }, [loadPaymentLimits])

  const totalDailyCap = useMemo(() => rows.reduce((acc, r) => acc + (r.daily_cap || 0), 0), [rows])

  const displayRows = useMemo(() => {
    const filtered = rows.filter((r) => {
      if (filterTab === 'DEPOSIT' && r.type !== 'Deposit') return false
      if (filterTab === 'WITHDRAWAL' && r.type !== 'Withdrawal') return false
      return true
    })
    return deduplicateLimits(filtered)
  }, [rows, filterTab])

  // Save Gateway Rule (POST /admin/payment-limits or PUT /admin/payment-limits/:id)
  const handleSave = async (e) => {
    e.preventDefault()
    const { channel, min_amt, max_amt, daily_cap, fee, type, speed, status } = modal.row

    if (modal.mode === 'add') {
      const newLimit = {
        id: Math.max(0, ...rows.map((r) => r.id)) + 1,
        channel,
        min_amt: Number(min_amt) || 0,
        max_amt: Number(max_amt) || 0,
        daily_cap: Number(daily_cap) || 0,
        fee: fee?.includes('%') ? fee : `${fee}%`,
        type: type || 'Deposit',
        status: status || 'Active',
        speed: speed || 'Instant (Auto)',
      }
      persist([...rows, newLimit])
      toast(`Gateway rule for ${channel} added!`)

      try {
        await apiRequest(API_ENDPOINTS.PAYMENT_LIMITS_PROXY, {
          method: 'POST',
          body: JSON.stringify(newLimit),
        }).catch(() => null)
      } catch (err) {
        console.warn('[Veronova Payment Limits] POST failed:', err.message)
      }
    } else {
      const patch = {
        channel,
        min_amt: Number(min_amt) || 0,
        max_amt: Number(max_amt) || 0,
        daily_cap: Number(daily_cap) || 0,
        fee: fee?.includes('%') ? fee : `${fee}%`,
        type: type || 'Deposit',
        status: status || 'Active',
      }
      const next = rows.map((r) => (r.id === modal.row.id ? { ...r, ...patch } : r))
      persist(next)
      toast(`Limits updated for ${channel}!`)

      try {
        const itemUrl = API_ENDPOINTS.PAYMENT_LIMIT_ITEM_PROXY(modal.row.id)
        await apiRequest(itemUrl, {
          method: 'PUT',
          body: JSON.stringify({ id: modal.row.id, ...patch }),
        }).catch(async () => {
          await apiRequest(itemUrl, {
            method: 'POST',
            body: JSON.stringify({ id: modal.row.id, ...patch }),
          }).catch(() => null)
        })
      } catch (err) {
        console.warn(`[Veronova Payment Limits] Update failed for #${modal.row.id}:`, err.message)
      }
    }
    setModal(null)
  }

  // Delete Gateway Rule (DELETE /admin/payment-limits/:id)
  const handleDelete = async (id, channelName) => {
    if (!confirm(`Delete payment gateway limit rule for "${channelName || id}"?`)) return

    const next = rows.filter((r) => r.id !== id)
    persist(next)
    toast('Gateway rule removed')

    try {
      const itemUrl = API_ENDPOINTS.PAYMENT_LIMIT_ITEM_PROXY(id)
      await apiRequest(itemUrl, { method: 'DELETE' }).catch(async () => {
        await apiRequest(itemUrl, {
          method: 'POST',
          body: JSON.stringify({ action: 'delete', _method: 'DELETE' }),
        }).catch(() => null)
      })
    } catch (err) {
      console.warn(`[Veronova Payment Limits] Delete failed for #${id}:`, err.message)
    }
  }

  // Toggle Status (PUT /admin/payment-limits/:id)
  const toggleStatus = async (limit) => {
    const nextStatus = limit.status === 'Active' ? 'Inactive' : 'Active'
    const next = rows.map((r) => (r.id === limit.id ? { ...r, status: nextStatus } : r))
    persist(next)
    toast(`${limit.channel} marked ${nextStatus}`)

    try {
      const itemUrl = API_ENDPOINTS.PAYMENT_LIMIT_ITEM_PROXY(limit.id)
      await apiRequest(itemUrl, {
        method: 'PUT',
        body: JSON.stringify({ id: limit.id, status: nextStatus }),
      }).catch(async () => {
        await apiRequest(itemUrl, {
          method: 'POST',
          body: JSON.stringify({ id: limit.id, status: nextStatus }),
        }).catch(() => null)
      })
    } catch (err) {
      console.warn(`[Veronova Payment Limits] Status toggle failed for #${limit.id}:`, err.message)
    }
  }

  const exportCols = [
    { key: 'id', label: 'ID' },
    { key: 'channel', label: 'Gateway Channel' },
    { key: 'type', label: 'Type' },
    { key: 'min_amt', label: 'Min Limit (₹)' },
    { key: 'max_amt', label: 'Max Limit (₹)' },
    { key: 'daily_cap', label: 'Daily Cap (₹)' },
    { key: 'fee', label: 'Gateway Fee' },
    { key: 'status', label: 'Status' },
  ]

  const cols = [
    { key: 'id', label: '#ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    {
      key: 'channel',
      label: 'Payment Gateway Channel',
      render: (r) => (
        <div className="min-w-[190px]">
          <span className="font-extrabold text-slate-900 text-sm block">{r.channel}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="rounded-md bg-blue-50 text-blue-700 px-1.5 py-0.2 text-[10px] font-bold border border-blue-200">{r.type}</span>
            <span className="text-[10px] text-slate-500 font-semibold">{r.speed}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'min_amt',
      label: 'Minimum Allowed',
      render: (r) => <span className="font-bold text-slate-800 text-xs">₹{Number(r.min_amt).toLocaleString('en-IN')}</span>,
    },
    {
      key: 'max_amt',
      label: 'Max Single Limit',
      render: (r) => <span className="font-black text-emerald-600 text-sm">₹{Number(r.max_amt).toLocaleString('en-IN')}</span>,
    },
    {
      key: 'daily_cap',
      label: 'Daily Cap Ceiling',
      render: (r) => <span className="font-extrabold text-blue-700 text-xs">₹{Number(r.daily_cap).toLocaleString('en-IN')}</span>,
    },
    {
      key: 'fee',
      label: 'Gateway Fee',
      render: (r) => <span className="font-mono text-xs font-bold text-slate-500">{r.fee}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <button
          onClick={() => toggleStatus(r)}
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold transition hover:opacity-85 ${
            r.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
          title="Click to toggle status"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${r.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          {r.status}
        </button>
      ),
    },
    {
      label: 'Action',
      render: (r) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setModal({ mode: 'edit', row: { ...r } })}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-700 hover:text-white transition shadow-2xs"
            title="Edit Limits"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => handleDelete(r.id, r.channel)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition shadow-2xs"
            title="Delete Gateway Rule"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageBanner
        title="Payment Gateway Limits & Processing Rules"
        icon={Receipt}
        crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Payments Limit' }]}
      >
        <div className="flex flex-wrap items-center gap-2">
          {lastSynced && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-white/15 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Synced: {lastSynced}
            </span>
          )}
          <button
            onClick={() => loadPaymentLimits(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs px-3 py-2 text-xs font-bold text-white transition disabled:opacity-50"
            title="Sync Live Payment Limits from Backend"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Sync Live</span>
          </button>
          <button
            onClick={() =>
              setModal({
                mode: 'add',
                row: { channel: '', min_amt: 100, max_amt: 50000, daily_cap: 2000000, fee: '0.0%', type: 'Deposit', status: 'Active' },
              })
            }
            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-extrabold text-blue-700 shadow-xl transition-all hover:bg-blue-50"
          >
            <Plus size={16} /> Add Gateway Channel
          </button>
        </div>
      </PageBanner>

      {/* Compact, Sleek Gateway Throttle & Velocity Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Liquidity Throttle</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              ₹{(totalDailyCap / 10000000).toFixed(2)} Cr / Day
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Combined ceiling limit</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
            <Receipt size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Max Single Txn</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              ₹10,00,000
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">High-roller limit</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ShieldCheck size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Configured Channels</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {rows.length} Gateways
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">UPI, IMPS, USDT</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <Lock size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Min Recharge</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              ₹100 Minimum
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Zero gateway fee</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={18} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All Channels', count: rows.length },
              { id: 'DEPOSIT', label: 'Recharge Gateways', count: rows.filter((r) => r.type === 'Deposit').length },
              { id: 'WITHDRAWAL', label: 'Payout Channels', count: rows.filter((r) => r.type === 'Withdrawal').length },
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
            onClick={() => exportCSV('payment_limits_rules', exportCols, displayRows)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <FileSpreadsheet size={15} /> Export to Excel
          </button>
        </div>

        <DataTable columns={cols} rows={displayRows} unit="channels" placeholder="Search gateway channels..." />
      </div>

      {/* Edit Limit Modal */}
      {modal && (
        <Modal isOpen={!!modal} onClose={() => setModal(null)} title={modal.mode === 'add' ? 'Add Gateway Channel' : `Edit Limits: ${modal.row.channel}`} maxWidth="max-w-md">
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase text-slate-600 mb-1">Channel Name</label>
              <input
                type="text"
                className="w-full rounded-xl border p-2.5 font-bold text-slate-900"
                value={modal.row.channel}
                onChange={(e) => setModal({ ...modal, row: { ...modal.row, channel: e.target.value } })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Min Transaction (₹)</label>
                <input
                  type="number"
                  className="w-full rounded-xl border p-2.5 font-bold text-slate-900"
                  value={modal.row.min_amt}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, min_amt: Number(e.target.value) } })}
                  required
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Max Transaction (₹)</label>
                <input
                  type="number"
                  className="w-full rounded-xl border p-2.5 font-bold text-slate-900"
                  value={modal.row.max_amt}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, max_amt: Number(e.target.value) } })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Daily Cap Ceiling (₹)</label>
                <input
                  type="number"
                  className="w-full rounded-xl border p-2.5 font-bold text-slate-900"
                  value={modal.row.daily_cap}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, daily_cap: Number(e.target.value) } })}
                  required
                />
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Gateway Fee (%)</label>
                <input
                  type="text"
                  className="w-full rounded-xl border p-2.5 font-bold text-slate-900"
                  value={modal.row.fee}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, fee: e.target.value } })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Gateway Type</label>
                <select
                  className="w-full rounded-xl border p-2.5 font-bold text-slate-900 outline-none"
                  value={modal.row.type || 'Deposit'}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, type: e.target.value } })}
                >
                  <option value="Deposit">Deposit (Recharge)</option>
                  <option value="Withdrawal">Withdrawal (Payout)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold uppercase text-slate-600 mb-1">Status</label>
                <select
                  className="w-full rounded-xl border p-2.5 font-bold text-slate-900 outline-none"
                  value={modal.row.status || 'Active'}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, status: e.target.value } })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={() => setModal(null)} className="rounded-xl border px-3 py-2 text-xs font-bold text-slate-600">Cancel</button>
              <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">Save Gateway Limits</button>
            </div>
          </form>
        </Modal>
      )}

      {node}
    </div>
  )
}

