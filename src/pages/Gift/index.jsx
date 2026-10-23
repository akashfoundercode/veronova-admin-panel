import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Gift as GiftIcon, Plus, Pencil, Trash2, FileSpreadsheet, Copy, Check,
  Sparkles, History, Users, Wallet, RefreshCw, KeyRound, CheckCircle2,
  AlertCircle, ArrowUpRight, TrendingUp, ShieldCheck, Clock
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, Modal, useToast, money } from '@/components/ui'
import { apiRequest } from '@/utils/apiClient'
import { API_ENDPOINTS } from '@/constants/api'
import { getGifts, saveGifts, normalizeGift } from './giftStore'

export default function Gift() {
  const [rows, setRows] = useState(getGifts)
  const [filterTab, setFilterTab] = useState('ALL') // ALL, ACTIVE, EXHAUSTED
  const [copiedCode, setCopiedCode] = useState(null)
  const [modal, setModal] = useState(null) // { mode: 'add' | 'edit', row }
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  const [toast, node] = useToast()

  // Quick Generator State
  const [quickDeposit, setQuickDeposit] = useState('1000')
  const [quickGift, setQuickGift] = useState('200')
  const [quickPeople, setQuickPeople] = useState('10')
  const [quickTitle, setQuickTitle] = useState('Flash Red Envelope')

  // Generate 15-digit code helper
  const genCode = () => String(Math.floor(1e14 + Math.random() * 9e14))

  // Fetch all gifts from /admin/gifts
  const loadGifts = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      console.log(`[Veronova Gifts] Fetching gifts from: ${API_ENDPOINTS.GIFTS_PROXY}`)
      const json = await apiRequest(API_ENDPOINTS.GIFTS_PROXY, { method: 'GET' })

      if (json && (json.status === 200 || json.data || Array.isArray(json))) {
        const payload = json.data || json
        const rawList =
          payload.list ||
          payload.gifts ||
          payload.data ||
          payload.rows ||
          (Array.isArray(payload) ? payload : null)

        if (Array.isArray(rawList) && rawList.length > 0) {
          const formatted = rawList.map((item, idx) => normalizeGift(item, idx)).filter(Boolean)
          setRows(formatted)
          saveGifts(formatted)
          setLastSynced(new Date().toLocaleTimeString())
          console.log(`[Veronova Gifts] Loaded ${formatted.length} gifts from backend`)
        }
      }
    } catch (err) {
      console.warn('[Veronova Gifts] Error fetching live gifts, using local cache:', err.message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadGifts()
  }, [loadGifts])

  // Persist Rows
  const persistRows = (updater) => {
    setRows((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveGifts(next)
      return next
    })
  }

  // Row update helper
  const updateRow = (id, patch) => {
    persistRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  // Copy helper
  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 1800)
    toast(`Copied gift code ${code} to clipboard!`)
  }

  // Quick Generate Gift Code (POST /admin/gifts)
  const handleQuickCreate = async (e) => {
    e.preventDefault()
    const code = genCode()
    const peopleCount = Number(quickPeople) || 1
    const newGift = {
      id: Math.max(0, ...rows.map((r) => r.id)) + 1,
      code,
      title: quickTitle || 'VIP Bonus Envelope',
      deposit: Number(quickDeposit) || 0,
      gift: Number(quickGift) || 0,
      people: peopleCount,
      avail: peopleCount,
      status: 'Active',
      date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    }
    persistRows((prev) => [newGift, ...prev])
    toast(`New gift code ${code} created with ${peopleCount} claims!`)

    // Backend call
    try {
      await apiRequest(API_ENDPOINTS.GIFTS_PROXY, {
        method: 'POST',
        body: JSON.stringify({
          code,
          title: newGift.title,
          deposit: newGift.deposit,
          gift: newGift.gift,
          people: newGift.people,
          avail: newGift.avail,
          status: newGift.status,
        }),
      }).catch(() => null)
    } catch (err) {
      console.warn('[Veronova Gifts] POST /admin/gifts failed:', err.message)
    }
  }

  // Save Modal (POST /admin/gifts or PUT /admin/gifts/:id)
  const handleSaveModal = async (e) => {
    e.preventDefault()
    const { code, title, deposit, gift, people } = modal.row
    if (!deposit || !gift || !people) {
      return toast('Please enter valid gift parameters')
    }

    if (modal.mode === 'add') {
      const peopleNum = Number(people) || 1
      const record = {
        id: Math.max(0, ...rows.map((r) => r.id)) + 1,
        code: code || genCode(),
        title: title || 'Custom Red Envelope',
        deposit: Number(deposit) || 0,
        gift: Number(gift) || 0,
        people: peopleNum,
        avail: peopleNum,
        status: 'Active',
        date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      }
      persistRows((prev) => [record, ...prev])
      toast(`Gift code created successfully!`)

      try {
        await apiRequest(API_ENDPOINTS.GIFTS_PROXY, {
          method: 'POST',
          body: JSON.stringify(record),
        }).catch(() => null)
      } catch (err) {
        console.warn('[Veronova Gifts] POST /admin/gifts failed:', err.message)
      }
    } else {
      const patch = {
        title,
        deposit: Number(deposit) || 0,
        gift: Number(gift) || 0,
        people: Number(people) || 1,
      }
      updateRow(modal.row.id, patch)
      toast('Gift code updated')

      try {
        const itemUrl = API_ENDPOINTS.GIFTS_ITEM_PROXY(modal.row.id)
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
        console.warn(`[Veronova Gifts] Update /admin/gifts/${modal.row.id} failed:`, err.message)
      }
    }
    setModal(null)
  }

  // Delete Gift (DELETE /admin/gifts/:id)
  const handleDelete = async (id) => {
    if (!confirm('Delete this gift code?')) return

    persistRows((prev) => prev.filter((r) => r.id !== id))
    toast('Gift code deleted')

    try {
      const itemUrl = API_ENDPOINTS.GIFTS_ITEM_PROXY(id)
      await apiRequest(itemUrl, { method: 'DELETE' }).catch(async () => {
        await apiRequest(itemUrl, {
          method: 'POST',
          body: JSON.stringify({ action: 'delete', _method: 'DELETE' }),
        }).catch(() => null)
      })
    } catch (err) {
      console.warn(`[Veronova Gifts] DELETE /admin/gifts/${id} failed:`, err.message)
    }
  }

  // KPI Computations
  const totalGiftDistributed = useMemo(() => {
    return rows.reduce((acc, r) => acc + (r.gift * (r.people - r.avail)), 0)
  }, [rows])
  const totalMaxBudget = useMemo(() => {
    return rows.reduce((acc, r) => acc + (r.gift * r.people), 0)
  }, [rows])
  const activeGifts = useMemo(() => rows.filter((r) => r.avail > 0), [rows])
  const totalClaimsLeft = useMemo(() => rows.reduce((acc, r) => acc + r.avail, 0), [rows])

  // Filtered Rows
  const displayRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterTab === 'ACTIVE' && r.avail === 0) return false
      if (filterTab === 'EXHAUSTED' && r.avail > 0) return false
      return true
    })
  }, [rows, filterTab])

  // Export Columns
  const exportCols = [
    { key: 'id', label: 'ID' },
    { key: 'code', label: '15-Digit Gift Code' },
    { key: 'title', label: 'Title' },
    { key: 'deposit', label: 'Deposit Condition' },
    { key: 'gift', label: 'Gift Reward Amount' },
    { key: 'people', label: 'Total Quota' },
    { key: 'avail', label: 'Remaining Available' },
    { key: 'status', label: 'Status' },
    { key: 'date', label: 'Created At' },
  ]

  // Columns for DataTable
  const cols = [
    {
      key: 'id',
      label: '#ID',
      render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span>,
    },
    {
      key: 'code',
      label: '15-Digit Gift Code',
      render: (r) => (
        <div className="min-w-[190px]">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-sm font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
              {r.code}
            </span>
            <button
              onClick={() => handleCopy(r.code, r.id)}
              className="text-slate-400 hover:text-slate-700 transition p-1"
              title="Copy Code"
            >
              {copiedCode === r.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            </button>
          </div>
          {r.title && (
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {r.title}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'deposit',
      label: 'Deposit Required',
      render: (r) => (
        <span className="font-bold text-slate-800 text-sm">
          ₹{Number(r.deposit).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'gift',
      label: 'Gift Reward Amount',
      render: (r) => (
        <div className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-xs font-black text-white shadow-2xs">
          <Sparkles size={12} className="text-yellow-200" />
          ₹{Number(r.gift).toLocaleString('en-IN')}
        </div>
      ),
    },
    {
      key: 'quota',
      label: 'Claim Progress',
      render: (r) => {
        const claimed = r.people - r.avail
        const pct = Math.min(100, Math.round((claimed / (r.people || 1)) * 100))
        return (
          <div className="min-w-[130px] space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">{claimed} / {r.people} Claimed</span>
              <span className="font-mono text-[10px] text-slate-400">{pct}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  r.avail === 0 ? 'bg-slate-400' : 'bg-gradient-to-r from-blue-500 to-emerald-500'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      key: 'avail',
      label: 'Slots Remaining',
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black ${
            r.avail > 0
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}
        >
          {r.avail > 0 ? `${r.avail} Slots Left` : 'Exhausted'}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Created Date',
      render: (r) => (
        <span className="font-mono text-xs text-slate-500 whitespace-nowrap block">
          {r.date}
        </span>
      ),
    },
    {
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setModal({ mode: 'edit', row: { ...r } })}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-700 hover:text-white transition shadow-2xs"
            title="Edit Gift Parameters"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => handleDelete(r.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition shadow-2xs"
            title="Delete Gift"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Banner */}
      <PageBanner
        title="Gift Code & Red Envelope Management"
        icon={GiftIcon}
        crumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Gift Code Hub' },
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
            onClick={() => loadGifts(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs px-3 py-2 text-xs font-bold text-white transition disabled:opacity-50"
            title="Sync Live Gifts from Backend"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Sync Live</span>
          </button>
          <Link
            to="/gift-history"
            className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white border border-white/30 hover:bg-white/30 transition shadow-sm"
          >
            <History size={15} /> Redemption History
          </Link>
          <button
            onClick={() =>
              setModal({
                mode: 'add',
                row: {
                  code: genCode(),
                  title: '',
                  deposit: 1000,
                  gift: 200,
                  people: 10,
                },
              })
            }
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-extrabold text-blue-700 shadow-xl transition-all hover:bg-blue-50 hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <Plus size={16} /> Create Custom Gift
          </button>
        </div>
      </PageBanner>

      {/* Bespoke Gift Envelope Treasury & Generator Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Hero (7 cols): Gift Envelope Treasury Vault */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950 via-red-950 to-slate-950 p-6 text-white shadow-xl border border-amber-900/40 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                  Gift Envelope Treasury
                </span>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-amber-200 border border-white/10 flex items-center gap-1.5">
                <Sparkles size={12} className="text-yellow-400" /> Instant Coupon Payout
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-200/80">Total Disbursed Gift Volume</p>
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm font-mono">
                  ₹{totalGiftDistributed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h2>
                <span className="text-xs font-semibold text-amber-300">Of ₹{totalMaxBudget.toLocaleString('en-IN')} total coupon budget</span>
              </div>
            </div>

            {/* Claimed vs Remaining Bar */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <GiftIcon size={13} className="text-amber-400" /> Disbursed to Players
                </span>
                <span className="text-amber-300 font-bold flex items-center gap-1.5">
                  <Users size={13} /> {totalClaimsLeft} Slots Remaining
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(15, (totalGiftDistributed / (totalMaxBudget || 1)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-[11px] text-slate-400">Active Coupons</p>
              <p className="text-sm font-extrabold text-white mt-0.5">
                {activeGifts.length} Codes Available
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Total Envelopes</p>
              <p className="text-sm font-extrabold text-amber-300 mt-0.5">
                {rows.length} Configured
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[11px] text-slate-400">Redemption Type</p>
              <p className="text-sm font-extrabold text-emerald-400 mt-0.5 flex items-center gap-1">
                <ShieldCheck size={14} /> 15-Digit Secure
              </p>
            </div>
          </div>
        </div>

        {/* Right (5 cols): 1-Click Rapid Red Envelope Creator */}
        <div className="lg:col-span-5 card p-5 rounded-2xl border-t-4 border-t-amber-500 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <KeyRound size={17} className="text-amber-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Quick 15-Digit Generator
                </h4>
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Instant Drop
              </span>
            </div>

            <form onSubmit={handleQuickCreate} className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Req Deposit (₹)
                  </label>
                  <input
                    type="number"
                    value={quickDeposit}
                    onChange={(e) => setQuickDeposit(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold text-slate-800"
                    placeholder="1000"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Gift Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={quickGift}
                    onChange={(e) => setQuickGift(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs font-black text-amber-700"
                    placeholder="200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Max Claims (People)
                  </label>
                  <input
                    type="number"
                    value={quickPeople}
                    onChange={(e) => setQuickPeople(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold text-slate-800"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Campaign Tag
                  </label>
                  <input
                    type="text"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs font-bold text-slate-800"
                    placeholder="Title"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 py-2.5 text-xs font-extrabold text-white shadow-md hover:from-amber-700 hover:to-orange-700 transition active:scale-95"
              >
                <Plus size={15} /> Generate & Activate 15-Digit Gift
              </button>
            </form>
          </div>

          <p className="mt-3 text-[11px] text-slate-400 text-center">
            Generated codes can be shared in Telegram/WhatsApp VIP groups
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Segmented Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All Gift Codes', count: rows.length },
              { id: 'ACTIVE', label: 'Active Slots', count: activeGifts.length },
              { id: 'EXHAUSTED', label: 'Exhausted', count: rows.length - activeGifts.length },
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
            onClick={() => exportCSV('gift_codes_list', exportCols, displayRows)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <FileSpreadsheet size={15} /> Export to Excel
          </button>
        </div>

        {/* DataTable */}
        <DataTable
          columns={cols}
          rows={displayRows}
          unit="gift codes"
          placeholder="Search by 15-digit code or envelope title..."
        />
      </div>

      {/* Add / Edit Gift Modal */}
      {modal && (
        <Modal
          isOpen={!!modal}
          onClose={() => setModal(null)}
          title={modal.mode === 'add' ? 'Create Custom Gift Code' : `Edit Gift #${modal.row.id}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveModal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                15-Digit Gift Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono font-bold text-blue-700 bg-slate-50 outline-none"
                  value={modal.row.code}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, code: e.target.value } })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setModal({ ...modal, row: { ...modal.row, code: genCode() } })}
                  className="rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-100"
                  title="Randomize"
                >
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Envelope Title / Event
              </label>
              <input
                type="text"
                placeholder="e.g. VIP Lounge Red Envelope"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                value={modal.row.title || ''}
                onChange={(e) => setModal({ ...modal, row: { ...modal.row, title: e.target.value } })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Qualifying Deposit (₹)
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  value={modal.row.deposit}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, deposit: e.target.value } })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Gift Amount (₹)
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-black text-amber-700 outline-none focus:border-blue-500"
                  value={modal.row.gift}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, gift: e.target.value } })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Number of Eligible People (Quota)
              </label>
              <input
                type="number"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                value={modal.row.people}
                onChange={(e) => setModal({ ...modal, row: { ...modal.row, people: e.target.value } })}
                required
              />
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
                {modal.mode === 'add' ? 'Save Gift' : 'Update Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {node}
    </div>
  )
}
