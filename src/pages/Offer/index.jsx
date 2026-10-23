import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Megaphone, Plus, Pencil, Trash2, Gift, Sparkles, TrendingUp,
  Calendar, CheckCircle2, AlertCircle, Clock, Copy, Check, Eye,
  Percent, ShieldCheck, Flame, ArrowUpRight, DollarSign, Tag,
  Layers, RefreshCw
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, Modal, useToast, money } from '@/components/ui'
import { apiRequest } from '@/utils/apiClient'
import { API_ENDPOINTS } from '@/constants/api'
import offerBg from '@/assets/images/offer.png'
import { getOffers, saveOffers, normalizeOffer } from './offerStore'

export default function Offer() {
  const [rows, setRows] = useState(getOffers)
  const [filterTab, setFilterTab] = useState('ALL') // ALL, DEPOSIT, CASHBACK, RELOAD, VIP, ACTIVE
  const [modal, setModal] = useState(null) // { mode: 'add' | 'edit', row }
  const [viewOffer, setViewOffer] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  const [toast, node] = useToast()

  // Fetch all offers from /admin/offers
  const loadOffers = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      console.log(`[Veronova Offers] Fetching promotions from: ${API_ENDPOINTS.OFFERS_PROXY}`)
      const json = await apiRequest(API_ENDPOINTS.OFFERS_PROXY, { method: 'GET' })

      if (json && (json.status === 200 || json.data)) {
        const payload = json.data || json
        const rawList =
          payload.list ||
          payload.offers ||
          payload.history ||
          payload.promotions ||
          (Array.isArray(payload) ? payload : null)

        if (Array.isArray(rawList) && rawList.length > 0) {
          const formatted = rawList.map((item, idx) => normalizeOffer(item, idx))
          setRows(formatted)
          saveOffers(formatted)
          setLastSynced(new Date().toLocaleTimeString())
          console.log(`[Veronova Offers] Loaded ${formatted.length} promotions from backend`)
        }
      }
    } catch (err) {
      console.warn('[Veronova Offers] Error fetching live offers, using local cache:', err.message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadOffers()
  }, [loadOffers])

  // Persist Rows
  const persistRows = (updater) => {
    setRows((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveOffers(next)
      return next
    })
  }

  // Row update helper
  const updateRow = (id, patch) => {
    persistRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  // KPI Computations
  const totalBudgetBurned = useMemo(() => rows.reduce((acc, r) => acc + (Number(r.budget_burned) || 0), 0), [rows])
  const totalClaims = useMemo(() => rows.reduce((acc, r) => acc + (Number(r.claimed_count) || 0), 0), [rows])
  const activeOffers = useMemo(() => rows.filter((r) => r.status === 'Active'), [rows])
  const scheduledOffers = useMemo(() => rows.filter((r) => r.status === 'Scheduled'), [rows])
  const expiredOffers = useMemo(() => rows.filter((r) => r.status === 'Expired'), [rows])

  const topOffer = useMemo(() => {
    if (!rows.length) return null
    return [...rows].sort((a, b) => (b.claimed_count || 0) - (a.claimed_count || 0))[0]
  }, [rows])

  // Filtered Rows
  const displayRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterTab === 'DEPOSIT' && r.type !== 'Deposit Bonus') return false
      if (filterTab === 'CASHBACK' && r.type !== 'Cashback') return false
      if (filterTab === 'RELOAD' && r.type !== 'Reload Bonus') return false
      if (filterTab === 'VIP' && r.type !== 'VIP Bounty') return false
      if (filterTab === 'ACTIVE' && r.status !== 'Active') return false
      if (filterTab === 'SCHEDULED' && r.status !== 'Scheduled') return false
      return true
    })
  }, [rows, filterTab])

  // Toggle Status via API: /admin/offers/:id
  const toggleOfferStatus = async (offer) => {
    const next = offer.status === 'Active' ? 'Expired' : 'Active'
    updateRow(offer.id, { status: next })
    toast(`Offer #${offer.id} status changed to ${next}`)

    try {
      const updateUrl = API_ENDPOINTS.OFFERS_ITEM_PROXY(offer.id)
      console.log(`[Veronova Offers] Updating status via API: ${updateUrl}`)
      await apiRequest(updateUrl, {
        method: 'PUT',
        body: JSON.stringify({ ...offer, status: next }),
      }).catch(async () => {
        await apiRequest(updateUrl, {
          method: 'POST',
          body: JSON.stringify({ ...offer, status: next }),
        }).catch(() => null)
      })
    } catch (err) {
      console.warn(`[Veronova Offers] Status update for #${offer.id} failed:`, err.message)
    }
  }

  // Save Add/Edit Offer via API: POST /admin/offers or PUT /admin/offers/:id
  const handleSaveOffer = async (e) => {
    e.preventDefault()
    const { title, bonus, min_deposit, max_bonus, type, status, start_date, end_date, tagline } = modal.row

    if (!title || !bonus) {
      return toast('Please enter Offer Title and Reward')
    }

    if (modal.mode === 'add') {
      let newOffer = {
        id: Math.max(0, ...rows.map((r) => r.id)) + 1,
        title,
        tagline: tagline || 'Exclusive platform promotion',
        bonus,
        min_deposit: Number(min_deposit) || 0,
        max_bonus: Number(max_bonus) || 0,
        type: type || 'Deposit Bonus',
        status: status || 'Active',
        claimed_count: 0,
        budget_burned: 0,
        start_date: start_date || new Date().toISOString().slice(0, 10),
        end_date: end_date || '2026-12-31',
        badge_color: 'from-blue-600 to-indigo-600',
      }

      // Live POST /admin/offers
      try {
        console.log(`[Veronova Offers] Creating offer via API: ${API_ENDPOINTS.OFFERS_PROXY}`)
        const res = await apiRequest(API_ENDPOINTS.OFFERS_PROXY, {
          method: 'POST',
          body: JSON.stringify(newOffer),
        })
        const created = res?.data || res?.offer || res
        if (created && (created.id || created.title)) {
          newOffer = normalizeOffer(created)
        }
      } catch (err) {
        console.warn('[Veronova Offers] POST /admin/offers failed, saved locally:', err.message)
      }

      persistRows((prev) => [newOffer, ...prev])
      toast(`New offer "${title}" created successfully!`)
    } else {
      const patch = {
        title,
        tagline,
        bonus,
        min_deposit: Number(min_deposit) || 0,
        max_bonus: Number(max_bonus) || 0,
        type,
        status,
        start_date,
        end_date,
      }

      updateRow(modal.row.id, patch)

      // Live PUT /admin/offers/:id
      try {
        const editUrl = API_ENDPOINTS.OFFERS_ITEM_PROXY(modal.row.id)
        console.log(`[Veronova Offers] Updating offer via API: ${editUrl}`)
        await apiRequest(editUrl, {
          method: 'PUT',
          body: JSON.stringify({ id: modal.row.id, ...patch }),
        }).catch(async () => {
          await apiRequest(editUrl, {
            method: 'POST',
            body: JSON.stringify({ id: modal.row.id, ...patch }),
          }).catch(() => null)
        })
      } catch (err) {
        console.warn(`[Veronova Offers] Update /admin/offers/${modal.row.id} failed:`, err.message)
      }

      toast(`Offer #${modal.row.id} updated successfully`)
    }
    setModal(null)
  }

  // Delete Offer via API: DELETE /admin/offers/:id
  const handleDeleteOffer = async (id) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return

    persistRows((prev) => prev.filter((r) => r.id !== id))
    toast('Offer deleted')

    try {
      const deleteUrl = API_ENDPOINTS.OFFERS_ITEM_PROXY(id)
      console.log(`[Veronova Offers] Deleting offer via API: ${deleteUrl}`)
      await apiRequest(deleteUrl, { method: 'DELETE' }).catch(async () => {
        await apiRequest(deleteUrl, {
          method: 'POST',
          body: JSON.stringify({ action: 'delete', _method: 'DELETE' }),
        }).catch(() => null)
      })
    } catch (err) {
      console.warn(`[Veronova Offers] DELETE /admin/offers/${id} failed:`, err.message)
    }
  }

  // Type Badge Helper
  const getTypeBadge = (type) => {
    switch (type) {
      case 'Deposit Bonus':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Cashback':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'VIP Bounty':
        return 'bg-amber-50 text-amber-800 border-amber-200'
      case 'Reload Bonus':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200'
    }
  }

  // Export Columns
  const exportCols = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Offer Title' },
    { key: 'bonus', label: 'Reward' },
    { key: 'type', label: 'Type' },
    { key: 'min_deposit', label: 'Min Deposit' },
    { key: 'max_bonus', label: 'Max Bonus' },
    { key: 'claimed_count', label: 'Total Claims' },
    { key: 'budget_burned', label: 'Budget Disbursed' },
    { key: 'status', label: 'Status' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'end_date', label: 'End Date' },
  ]

  // Columns for DataTable
  const cols = [
    {
      key: 'id',
      label: '#ID',
      render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span>,
    },
    {
      key: 'title',
      label: 'Campaign & Title',
      render: (r) => (
        <div className="min-w-[220px]">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm hover:text-blue-600 transition-colors">
              {r.title}
            </span>
          </div>
          {r.tagline && (
            <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
              {r.tagline}
            </p>
          )}
          <div className="mt-1 flex items-center gap-1.5">
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-black border ${getTypeBadge(r.type)}`}>
              {r.type}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'bonus',
      label: 'Reward / Bonus',
      render: (r) => (
        <div className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-1 font-black text-white text-xs shadow-xs">
          <Sparkles size={13} className="text-yellow-300" />
          {r.bonus}
        </div>
      ),
    },
    {
      key: 'limits',
      label: 'Qualifying Limits',
      render: (r) => (
        <div className="min-w-[140px] text-xs space-y-0.5">
          <div className="flex items-center justify-between text-slate-500">
            <span>Min Dep:</span>
            <span className="font-bold text-slate-800">₹{Number(r.min_deposit).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Max Cap:</span>
            <span className="font-extrabold text-emerald-600">₹{Number(r.max_bonus).toLocaleString('en-IN')}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'analytics',
      label: 'Campaign Analytics',
      render: (r) => (
        <div className="min-w-[150px] text-xs space-y-0.5">
          <div className="flex items-center justify-between text-slate-500">
            <span>Total Claims:</span>
            <span className="font-bold text-blue-700">{(r.claimed_count || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Budget Burn:</span>
            <span className="font-extrabold text-slate-800">₹{Number(r.budget_burned || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'dates',
      label: 'Campaign Validity',
      render: (r) => (
        <div className="min-w-[130px] text-xs font-mono">
          <div className="text-slate-600 flex items-center gap-1">
            <Calendar size={12} className="text-slate-400" /> {r.start_date}
          </div>
          <div className="text-slate-400 text-[11px] mt-0.5">
            to {r.end_date}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <button
          onClick={() => toggleOfferStatus(r)}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition hover:opacity-85 ${
            r.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : r.status === 'Scheduled'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
          title="Click to toggle status"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              r.status === 'Active'
                ? 'bg-emerald-500 animate-pulse'
                : r.status === 'Scheduled'
                ? 'bg-blue-500'
                : 'bg-slate-400'
            }`}
          />
          {r.status}
        </button>
      ),
    },
    {
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewOffer(r)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-2xs"
            title="View Details"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => setModal({ mode: 'edit', row: { ...r } })}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-700 hover:text-white transition shadow-2xs"
            title="Edit Offer"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => handleDeleteOffer(r.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition shadow-2xs"
            title="Delete Offer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Banner */}
      <PageBanner
        title="Promotions & Offer Engine"
        icon={Megaphone}
        bgImage={offerBg}
        crumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Offers & Campaigns' },
          { label: 'Promotions Console' },
        ]}
      >
        <div className="flex flex-wrap items-center gap-2">
          {lastSynced && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-white/15 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Synced: {lastSynced}
            </span>
          )}
          <button
            onClick={() => loadOffers(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs px-3 py-2 text-xs font-bold text-white transition disabled:opacity-50"
            title="Sync Live Promotions from Backend"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Sync Live</span>
          </button>
          <button
            onClick={() =>
              setModal({
                mode: 'add',
                row: {
                  title: '',
                  tagline: '',
                  bonus: '50% Match',
                  min_deposit: 500,
                  max_bonus: 2500,
                  type: 'Deposit Bonus',
                  status: 'Active',
                  start_date: new Date().toISOString().slice(0, 10),
                  end_date: '2026-11-30',
                },
              })
            }
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-extrabold text-blue-700 shadow-xl transition-all hover:bg-blue-50 hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <Plus size={16} /> Create New Campaign
          </button>
        </div>
      </PageBanner>

      {/* Compact, Sleek Promotion & Campaign Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Campaign Budget Burned</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              ₹{totalBudgetBurned.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{totalClaims.toLocaleString('en-IN')} claims disbursed</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <Flame size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Campaigns</p>
            <h3 className="text-xl font-bold text-emerald-600 mt-0.5 tracking-tight font-mono">
              {activeOffers.length} Running
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{scheduledOffers.length} scheduled • {expiredOffers.length} expired</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Gift size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Top Performer</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono truncate" title={topOffer?.title || 'None'}>
              {topOffer ? `${topOffer.claimed_count} Claims` : 'None'}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{topOffer?.title || 'No active offer'}</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <TrendingUp size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Campaigns</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {rows.length} Promos
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">+342% recharge lift</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <ShieldCheck size={18} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Segmented Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All Campaigns', count: rows.length },
              { id: 'ACTIVE', label: 'Active', count: activeOffers.length },
              { id: 'DEPOSIT', label: 'Deposit Bonus', count: rows.filter((r) => r.type === 'Deposit Bonus').length },
              { id: 'CASHBACK', label: 'Cashback', count: rows.filter((r) => r.type === 'Cashback').length },
              { id: 'RELOAD', label: 'Reload', count: rows.filter((r) => r.type === 'Reload Bonus').length },
              { id: 'VIP', label: 'VIP Bounty', count: rows.filter((r) => r.type === 'VIP Bounty').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  filterTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    filterTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Export to Excel */}
          <button
            onClick={() => exportCSV('promotions_offers', exportCols, displayRows)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            Export to Excel
          </button>
        </div>

        {/* DataTable */}
        <DataTable
          columns={cols}
          rows={displayRows}
          unit="promotions"
          placeholder="Search offers by title, type, or reward..."
        />
      </div>

      {/* View Offer Details Modal */}
      {viewOffer && (
        <Modal
          isOpen={!!viewOffer}
          onClose={() => setViewOffer(null)}
          title={`Promotion Dossier: ${viewOffer.title}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                {viewOffer.type}
              </span>
              <h3 className="text-xl font-black text-white mt-1">{viewOffer.title}</h3>
              {viewOffer.tagline && <p className="text-xs text-blue-100 mt-1">{viewOffer.tagline}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 font-medium">Reward Structure</span>
                <p className="font-extrabold text-emerald-600 text-base mt-0.5">{viewOffer.bonus}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Status</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{viewOffer.status}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Min Deposit Condition</span>
                <p className="font-bold text-slate-800 mt-0.5">₹{Number(viewOffer.min_deposit).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Max Reward Ceiling</span>
                <p className="font-bold text-slate-800 mt-0.5">₹{Number(viewOffer.max_bonus).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Total Player Claims</span>
                <p className="font-bold text-blue-700 mt-0.5">{viewOffer.claimed_count?.toLocaleString('en-IN') || 0} Claims</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Budget Burned</span>
                <p className="font-bold text-rose-600 mt-0.5">₹{Number(viewOffer.budget_burned || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-slate-600 font-medium">Campaign Schedule:</span>
              </div>
              <span className="font-mono font-bold text-slate-800">
                {viewOffer.start_date} → {viewOffer.end_date}
              </span>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setViewOffer(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Offer Modal */}
      {modal && (
        <Modal
          isOpen={!!modal}
          onClose={() => setModal(null)}
          title={modal.mode === 'add' ? 'Create New Promotional Campaign' : `Edit Campaign #${modal.row.id}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSaveOffer} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Campaign Title
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500"
                placeholder="e.g. First Deposit 100% Welcome Bonus"
                value={modal.row.title}
                onChange={(e) => setModal({ ...modal, row: { ...modal.row, title: e.target.value } })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Short Tagline / Explanation
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500"
                placeholder="e.g. Instant matching credits on first recharge"
                value={modal.row.tagline || ''}
                onChange={(e) => setModal({ ...modal, row: { ...modal.row, tagline: e.target.value } })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Bonus / Reward Value
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500"
                  placeholder="e.g. 100% Match or ₹500 Flat"
                  value={modal.row.bonus}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, bonus: e.target.value } })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Campaign Type
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  value={modal.row.type}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, type: e.target.value } })}
                >
                  <option value="Deposit Bonus">Deposit Bonus</option>
                  <option value="Cashback">Cashback</option>
                  <option value="Reload Bonus">Reload Bonus</option>
                  <option value="VIP Bounty">VIP Bounty</option>
                  <option value="Festival Special">Festival Special</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Min Deposit (₹)
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500"
                  value={modal.row.min_deposit}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, min_deposit: e.target.value } })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Max Bonus Ceiling (₹)
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500"
                  value={modal.row.max_bonus}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, max_bonus: e.target.value } })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Status
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  value={modal.row.status}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, status: e.target.value } })}
                >
                  <option value="Active">Active</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500"
                  value={modal.row.start_date}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, start_date: e.target.value } })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500"
                  value={modal.row.end_date}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, end_date: e.target.value } })}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md"
              >
                {modal.mode === 'add' ? 'Create Campaign' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {node}
    </div>
  )
}
