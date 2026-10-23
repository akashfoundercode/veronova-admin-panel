import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Clock, Calendar, Search, RotateCcw, Pencil, Plus, Trash2,
  TrendingUp, Gift, Flame, Trophy, CheckCircle2, ShieldCheck,
  AlertCircle, Sparkles, SlidersHorizontal, ArrowUpRight, Copy, Check,
  ToggleLeft, ToggleRight, HelpCircle, Users, RefreshCw, KeyRound, LogIn
} from 'lucide-react'
import DataTable from '@/components/DataTable'
import { PageBanner, Modal, useToast, money } from '@/components/ui'
import attendanceBg from '@/assets/images/attendance.png'
import {
  getAttendanceTiers, saveAttendanceTiers,
  getClaimLogs, saveClaimLogs
} from './attendanceStore'
import { apiRequest } from '@/utils/apiClient'
import auth from '@/utils/auth'
import { API_ENDPOINTS } from '@/constants/api'

// Helper to extract attendance tiers list from any backend response shape
function extractAttendanceList(json) {
  if (!json) return null
  if (Array.isArray(json)) return json
  if (json.data && Array.isArray(json.data)) return json.data
  if (json.data && typeof json.data === 'object') {
    if (Array.isArray(json.data.tiers)) return json.data.tiers
    if (Array.isArray(json.data.attendance)) return json.data.attendance
    if (Array.isArray(json.data.rows)) return json.data.rows
    if (Array.isArray(json.data.list)) return json.data.list
  }
  if (Array.isArray(json.tiers)) return json.tiers
  if (Array.isArray(json.attendance)) return json.attendance
  return null
}

function extractClaimsList(json) {
  if (!json) return null
  if (json.data && typeof json.data === 'object') {
    if (Array.isArray(json.data.claims)) return json.data.claims
    if (Array.isArray(json.data.logs)) return json.data.logs
    if (Array.isArray(json.data.claim_logs)) return json.data.claim_logs
    if (Array.isArray(json.data.history)) return json.data.history
  }
  if (Array.isArray(json.claims)) return json.claims
  if (Array.isArray(json.claim_logs)) return json.claim_logs
  return null
}

function normalizeTier(item, idx = 0) {
  if (!item || typeof item !== 'object') {
    return {
      id: idx + 1,
      day: `Day ${idx + 1}`,
      tier_name: `Tier ${idx + 1}`,
      accumulated: 0,
      bonus: 0,
      min_streak_days: idx + 1,
      status: 'Active',
      date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      tag: 'Streak',
    }
  }

  const id = item.id ?? item._id ?? (idx + 1)
  const streakNum = item.min_streak_days ?? item.day_number ?? item.streak ?? item.days ?? (idx + 1)
  const dayStr = item.day || `Day ${streakNum}`
  const tierName = item.tier_name || item.name || item.title || `Tier ${streakNum}`
  const accumulated = Number(item.accumulated ?? item.recharge_amount ?? item.target_amount ?? item.amount ?? 0)
  const bonus = Number(item.bonus ?? item.reward ?? item.bonus_amount ?? item.reward_amount ?? 0)

  const rawStatus = item.status ?? item.is_active ?? item.active
  const isActive = rawStatus === 'Active' || rawStatus === 1 || rawStatus === true || rawStatus === 'active' || rawStatus === undefined

  return {
    id,
    day: dayStr,
    tier_name: tierName,
    accumulated,
    bonus,
    min_streak_days: Number(streakNum),
    status: isActive ? 'Active' : 'Paused',
    date: item.date || item.created_at || item.updated_at || new Date().toISOString().slice(0, 19).replace('T', ' '),
    tag: item.tag || (Number(streakNum) === 7 ? 'Jackpot' : 'Streak'),
    raw: item,
  }
}

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('TIERS') // 'TIERS' | 'CLAIMS'
  const [tiers, setTiers] = useState(getAttendanceTiers)
  const [claimLogs, setClaimLogs] = useState(getClaimLogs)

  // Live API States
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [lastSynced, setLastSynced] = useState(null)

  // Filters for Claims
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedFilters, setAppliedFilters] = useState({ from: '', to: '', q: '' })

  // Modals
  const [editTier, setEditTier] = useState(null)
  const [addTierModal, setAddTierModal] = useState(false)
  const [newTier, setNewTier] = useState({
    day: 'Day 8',
    tier_name: 'Tier 8 (Super Streak)',
    accumulated: '',
    bonus: '',
    status: 'Active',
    tag: 'Special',
  })
  const [rulesModal, setRulesModal] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  const [toast, node] = useToast()

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
    toast(`Copied ${text} to clipboard!`)
  }

  // Persist Tiers
  const persistTiers = useCallback((updater) => {
    setTiers((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveAttendanceTiers(next)
      return next
    })
  }, [])

  // Fetch Attendance from Backend (GET /api/admin/attendance or /admin/attendance)
  const fetchAttendance = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true)
    else setIsLoading(true)
    setApiError(null)

    const endpoints = [
      API_ENDPOINTS.ATTENDANCE_PROXY,       // '/api/admin/attendance'
      API_ENDPOINTS.ATTENDANCE_ADMIN_PROXY, // '/admin/attendance'
    ]

    let json = null
    let usedEndpoint = null
    let lastErr = null

    for (const ep of endpoints) {
      try {
        console.log(`[Veronova Attendance] GET ${ep}...`)
        json = await apiRequest(ep, { method: 'GET' })
        usedEndpoint = ep
        console.log(`[Veronova Attendance] Success from ${ep}:`, json)
        break
      } catch (err) {
        lastErr = err
        if (err.status === 404) {
          console.warn(`[Veronova Attendance] ${ep} returned 404, attempting next...`)
          continue
        }
        break
      }
    }

    if (json) {
      const tierList = extractAttendanceList(json)
      if (Array.isArray(tierList)) {
        const normalized = tierList.map((item, idx) => normalizeTier(item, idx))
        persistTiers(normalized)
        setLastSynced(new Date().toLocaleTimeString())
        if (isManual) toast(`Synced ${normalized.length} attendance tier(s) from server`)
        console.log(`[Veronova Attendance] Loaded ${normalized.length} live tiers from ${usedEndpoint}`)
      }

      const claimList = extractClaimsList(json)
      if (Array.isArray(claimList)) {
        setClaimLogs(claimList)
        saveClaimLogs(claimList)
      }
    } else if (lastErr) {
      console.error('[Veronova Attendance] Fetch error:', lastErr)
      setApiError(lastErr.message || 'Could not fetch attendance from backend')
      if (isManual) toast(`Sync failed: ${lastErr.message}`)
    }

    setIsLoading(false)
    setIsRefreshing(false)
  }, [persistTiers, toast])

  // Initial load
  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  // Toggle Tier Status (PUT /api/admin/attendance/:id or /admin/attendance/:id)
  const toggleTierStatus = async (tier) => {
    const nextStatus = tier.status === 'Active' ? 'Paused' : 'Active'
    
    // Optimistic local update
    persistTiers((prev) =>
      prev.map((t) => (t.id === tier.id ? { ...t, status: nextStatus } : t))
    )
    toast(`Attendance ${tier.day} status changed to ${nextStatus}`)

    // Server update
    const updateEndpoints = [
      `/api/admin/attendance/${tier.id}`,
      `/admin/attendance/${tier.id}`,
    ]
    for (const ep of updateEndpoints) {
      try {
        await apiRequest(ep, {
          method: 'PUT',
          body: JSON.stringify({ ...tier, status: nextStatus === 'Active' ? 1 : 0 }),
        })
        console.log(`[Veronova Attendance] Updated status on ${ep}`)
        break
      } catch (e) {
        if (e.status === 404) continue
        // Try POST with _method PUT if PUT method not allowed
        try {
          await apiRequest(ep, {
            method: 'POST',
            body: JSON.stringify({ ...tier, status: nextStatus === 'Active' ? 1 : 0, _method: 'PUT' }),
          })
          break
        } catch {}
      }
    }
  }

  // Handle Save Edit Tier (PUT /api/admin/attendance/:id or /admin/attendance/:id)
  const handleSaveEdit = async (e) => {
    e.preventDefault()
    const updatedTier = {
      ...editTier,
      accumulated: Number(editTier.accumulated),
      bonus: Number(editTier.bonus),
    }

    persistTiers((prev) =>
      prev.map((t) => (t.id === editTier.id ? updatedTier : t))
    )
    toast(`Updated ${editTier.day} bonus rules!`)
    setEditTier(null)

    // Call backend API
    const updateEndpoints = [
      `/api/admin/attendance/${editTier.id}`,
      `/admin/attendance/${editTier.id}`,
    ]
    for (const ep of updateEndpoints) {
      try {
        await apiRequest(ep, {
          method: 'PUT',
          body: JSON.stringify(updatedTier),
        })
        console.log(`[Veronova Attendance] Successfully saved edit on ${ep}`)
        break
      } catch (err) {
        if (err.status === 404) continue
        try {
          await apiRequest(ep, {
            method: 'POST',
            body: JSON.stringify({ ...updatedTier, _method: 'PUT' }),
          })
          break
        } catch {}
      }
    }
  }

  // Handle Add New Tier (POST /api/admin/attendance or /admin/attendance)
  const handleAddNewTier = async (e) => {
    e.preventDefault()
    if (!newTier.accumulated || !newTier.bonus) {
      return toast('Please enter Accumulated Amount and Bonus Amount')
    }

    const nextId = Math.max(0, ...tiers.map((t) => Number(t.id) || 0)) + 1
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}`

    const created = {
      id: nextId,
      day: newTier.day || `Day ${nextId}`,
      tier_name: newTier.tier_name || `Tier ${nextId}`,
      accumulated: Number(newTier.accumulated),
      bonus: Number(newTier.bonus),
      min_streak_days: nextId,
      status: newTier.status,
      date: dateStr,
      tag: newTier.tag || 'Streak',
    }

    persistTiers([created, ...tiers])
    toast(`Added ${created.day} attendance tier successfully!`)
    setAddTierModal(false)

    // Send to backend API
    const createEndpoints = [
      API_ENDPOINTS.ATTENDANCE_PROXY,       // '/api/admin/attendance'
      API_ENDPOINTS.ATTENDANCE_ADMIN_PROXY, // '/admin/attendance'
    ]
    for (const ep of createEndpoints) {
      try {
        const res = await apiRequest(ep, {
          method: 'POST',
          body: JSON.stringify(created),
        })
        console.log(`[Veronova Attendance] Created tier on ${ep}:`, res)
        fetchAttendance(true)
        break
      } catch (err) {
        if (err.status === 404) continue
        console.warn(`[Veronova Attendance] Create on ${ep} failed:`, err.message)
      }
    }

    setNewTier({
      day: `Day ${nextId + 1}`,
      tier_name: `Tier ${nextId + 1}`,
      accumulated: '',
      bonus: '',
      status: 'Active',
      tag: 'Special',
    })
  }

  // Delete Tier (DELETE /api/admin/attendance/:id or /admin/attendance/:id)
  const handleDeleteTier = async (id) => {
    if (window.confirm('Are you sure you want to delete this attendance tier?')) {
      persistTiers((prev) => prev.filter((t) => t.id !== id))
      toast('Attendance tier removed')

      const deleteEndpoints = [
        `/api/admin/attendance/${id}`,
        `/admin/attendance/${id}`,
      ]
      for (const ep of deleteEndpoints) {
        try {
          await apiRequest(ep, { method: 'DELETE' })
          console.log(`[Veronova Attendance] Deleted tier #${id} on ${ep}`)
          break
        } catch (e) {
          if (e.status === 404) continue
        }
      }
    }
  }

  // Filtered Claims
  const filteredClaims = useMemo(() => {
    return claimLogs.filter((r) => {
      const d = r.claimed_at.slice(0, 10)
      if (appliedFilters.from && d < appliedFilters.from) return false
      if (appliedFilters.to && d > appliedFilters.to) return false
      if (appliedFilters.q) {
        const q = appliedFilters.q.toLowerCase()
        const match =
          r.user_id.toLowerCase().includes(q) ||
          r.user_name.toLowerCase().includes(q) ||
          r.mobile.includes(q) ||
          String(r.streak_day).includes(q)
        if (!match) return false
      }
      return true
    })
  }, [claimLogs, appliedFilters])

  // KPIs
  const totalBonusPool = tiers.reduce((acc, t) => acc + (Number(t.bonus) || 0), 0)
  const totalClaimsDistributed = claimLogs.reduce((acc, c) => acc + (Number(c.bonus) || 0), 0)
  const activeTiersCount = tiers.filter((t) => t.status === 'Active').length
  const totalClaimsCount = claimLogs.length

  // Slabs / Tiers Columns
  const tierCols = [
    {
      key: 'id',
      label: '#ID',
      render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span>,
    },
    {
      key: 'day',
      label: 'Consecutive Day',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 font-black text-xs shadow-2xs">
            <Flame size={18} fill="currentColor" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900">{r.day}</span>
            <p className="text-[11px] text-slate-500 font-medium">{r.tier_name}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'accumulated',
      label: 'Required Accumulated Amount',
      render: (r) => (
        <div className="font-extrabold text-slate-900 text-sm">
          ₹{Number(r.accumulated).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          <span className="block text-[10px] text-slate-400 font-normal">Recharge / Play Target</span>
        </div>
      ),
    },
    {
      key: 'bonus',
      label: 'Attendance Bonus',
      render: (r) => (
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700 font-extrabold text-sm border border-emerald-200">
          <Gift size={14} className="text-emerald-600" />
          ₹{Number(r.bonus).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      ),
    },
    {
      key: 'ratio',
      label: 'Bonus Reward %',
      render: (r) => {
        const ratio = ((Number(r.bonus) / Number(r.accumulated)) * 100).toFixed(1)
        return (
          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
            {ratio}% Reward
          </span>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <button
          onClick={() => toggleTierStatus(r)}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition hover:opacity-85 ${
            r.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
          title="Click to toggle status"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              r.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
          />
          {r.status}
        </button>
      ),
    },
    {
      key: 'date',
      label: 'Last Modified',
      render: (r) => <span className="text-xs text-slate-500 font-mono">{r.date}</span>,
    },
    {
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setEditTier(r)}
            title="Edit Tier Rules"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-2xs"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => handleDeleteTier(r.id)}
            title="Delete Tier"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition shadow-2xs"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  // Claims Columns
  const claimCols = [
    {
      key: 'id',
      label: '#ID',
      render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span>,
    },
    {
      key: 'player',
      label: 'Player Info',
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-xs">
            {r.user_name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-extrabold text-slate-900 text-sm">{r.user_name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1 rounded">
                {r.user_id}
              </span>
              <button
                onClick={() => handleCopy(r.user_id, r.id)}
                className="text-slate-400 hover:text-slate-600"
              >
                {copiedId === r.id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'streak',
      label: 'Streak Day',
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-1 text-xs font-black text-white shadow-xs">
          <Flame size={13} fill="currentColor" /> Day {r.streak_day} Streak
        </span>
      ),
    },
    {
      key: 'accumulated',
      label: 'Accumulated Met',
      render: (r) => (
        <span className="font-extrabold text-slate-800 text-sm">
          ₹{Number(r.accumulated).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'bonus',
      label: 'Bonus Credited',
      render: (r) => (
        <span className="font-black text-emerald-600 text-sm">
          +₹{Number(r.bonus).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'claimed_at',
      label: 'Claim Time',
      render: (r) => <span className="text-xs text-slate-500 font-mono">{r.claimed_at}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={12} className="text-emerald-600" /> {r.status}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Banner */}
      <PageBanner
        title="Attendance & Daily Streak Bonus"
        icon={Clock}
        bgImage={attendanceBg}
        crumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Attendance', to: '/attendance' },
          { label: 'Streak Bonus Rules' },
        ]}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchAttendance(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white border border-white/30 hover:bg-white/30 transition shadow-sm disabled:opacity-50 cursor-pointer"
            title="Sync with Backend Attendance API"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Live'}</span>
          </button>
          <button
            onClick={() => setRulesModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white border border-white/30 hover:bg-white/30 transition shadow-sm"
          >
            <HelpCircle size={15} /> Streak Rules
          </button>
          <button
            onClick={() => setAddTierModal(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-extrabold text-blue-700 shadow-xl transition-all hover:bg-blue-50 hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <Plus size={16} /> Add Bonus Tier
          </button>
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
            onClick={() => fetchAttendance(true)}
            className="flex items-center gap-1 rounded bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900 hover:bg-amber-200 transition"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} /> Retry
          </button>
        </div>
      )}

      {/* Bespoke Daily Streak Journey Ribbon & Attendance Bonus Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Hero (5 cols): Attendance Bonus Vault */}
        <div className="lg:col-span-5 relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 via-orange-600 to-rose-600 p-6 text-white shadow-xl flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-60 h-60 bg-red-800/30 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-black/20 backdrop-blur-md px-3 py-1 text-xs font-black tracking-wider text-amber-100 uppercase border border-white/20">
                <Flame size={14} className="text-yellow-300 fill-yellow-300 animate-pulse" /> Daily Streak Vault
              </span>
              <span className="text-[11px] font-bold text-amber-100/90">
                Resets Midnight 00:00
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-200">Total Bonuses Disbursed</p>
              <h2 className="mt-1 text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">
                ₹{totalClaimsDistributed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[11px] text-amber-200 font-semibold">Total Claims Logged</p>
              <p className="text-sm font-extrabold text-white mt-0.5 flex items-center gap-1">
                <Gift size={14} className="text-yellow-300" /> {totalClaimsCount} Claims
              </p>
            </div>
            <div>
              <p className="text-[11px] text-amber-200 font-semibold">Max Day 7 Jackpot</p>
              <p className="text-sm font-extrabold text-yellow-300 mt-0.5 flex items-center gap-1">
                <Trophy size={14} className="text-yellow-300" /> ₹6,500.00
              </p>
            </div>
          </div>
        </div>

        {/* Right (7 cols): 7-Day Streak Milestone Progression Visualizer */}
        <div className="lg:col-span-7 card p-5 rounded-2xl shadow-sm flex flex-col justify-between border-t-4 border-t-orange-500">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Daily Consecutive Streak Progression Map
                </h4>
                <p className="text-xs font-bold text-slate-700 mt-0.5">
                  Players earn escalating instant rewards for continuous 7-day logins
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" /> {activeTiersCount} Active Slabs
              </span>
            </div>

            {/* 7-Step Progression Stepper */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mt-2">
              {[
                { day: 'D1', amt: '₹50', color: 'from-amber-100 to-amber-200 text-amber-800' },
                { day: 'D2', amt: '₹100', color: 'from-amber-100 to-amber-200 text-amber-800' },
                { day: 'D3', amt: '₹200', color: 'from-orange-100 to-orange-200 text-orange-800' },
                { day: 'D4', amt: '₹400', color: 'from-orange-100 to-orange-200 text-orange-800' },
                { day: 'D5', amt: '₹800', color: 'from-rose-100 to-rose-200 text-rose-800' },
                { day: 'D6', amt: '₹1.5k', color: 'from-rose-100 to-rose-200 text-rose-800' },
                { day: 'D7', amt: '₹3.5k+', color: 'from-amber-400 to-orange-500 text-white shadow-sm ring-1 ring-amber-400 font-black', jackpot: true },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-xl text-center bg-gradient-to-b ${step.color} transition hover:scale-105 cursor-default`}
                >
                  {step.jackpot && (
                    <span className="absolute -top-2 rounded-full bg-amber-500 text-[9px] font-black px-1.5 text-amber-950 uppercase shadow-2xs">
                      Max
                    </span>
                  )}
                  <span className={`text-[10px] font-bold ${step.jackpot ? 'text-amber-100' : 'text-slate-500'}`}>
                    {step.day}
                  </span>
                  <span className={`text-xs font-black mt-0.5 ${step.jackpot ? 'text-white' : 'text-slate-800'}`}>
                    {step.amt}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock size={13} className="text-slate-400" />
              <span>Consecutive break resets player progress to Day 1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Engagement Retention:</span>
              <span className="font-extrabold text-orange-600">94.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('TIERS')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'TIERS'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <SlidersHorizontal size={15} />
              <span>Attendance Bonus Tiers ({tiers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('CLAIMS')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'CLAIMS'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users size={15} />
              <span>Player Claim History ({claimLogs.length})</span>
            </button>
          </div>

          {activeTab === 'TIERS' && (
            <button
              onClick={() => setAddTierModal(true)}
              className="btn !py-2 text-xs font-bold shadow-xs"
            >
              <Plus size={15} /> Add New Tier Slab
            </button>
          )}
        </div>

        {/* Tab 1: TIERS CONFIGURATION */}
        {activeTab === 'TIERS' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-blue-800 font-semibold">
                <Sparkles size={18} className="text-blue-600 shrink-0" />
                <span>
                  Configure the accumulated deposit/bet threshold and daily reward bonus for each consecutive check-in day.
                </span>
              </div>
              <button
                onClick={() => setRulesModal(true)}
                className="font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                View Rules <ArrowUpRight size={14} />
              </button>
            </div>

            <DataTable
              columns={tierCols}
              rows={tiers}
              exportName="attendance-bonus-tiers"
              placeholder="Search tier name or day..."
            />
          </div>
        )}

        {/* Tab 2: PLAYER CLAIM HISTORY */}
        {activeTab === 'CLAIMS' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="grid items-end gap-3 md:grid-cols-[1fr_1fr_1.5fr_auto_auto]">
                <div>
                  <label className="label">From Date</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="date"
                      className="input !pl-9 text-xs"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">To Date</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="date"
                      className="input !pl-9 text-xs"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Search Player</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      className="input !pl-9 text-xs"
                      placeholder="User ID, Name, Mobile, Streak Day..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  className="btn !py-2 text-xs font-bold"
                  onClick={() => setAppliedFilters({ from: dateFrom, to: dateTo, q: searchQuery })}
                >
                  <Search size={14} /> Apply Filter
                </button>

                <button
                  className="btn-ghost !py-2 text-xs text-slate-600 hover:bg-slate-200"
                  onClick={() => {
                    setDateFrom('')
                    setDateTo('')
                    setSearchQuery('')
                    setAppliedFilters({ from: '', to: '', q: '' })
                  }}
                >
                  <RotateCcw size={14} /> Reset
                </button>
              </div>
            </div>

            <DataTable
              columns={claimCols}
              rows={filteredClaims}
              exportName="attendance-player-claims"
              hideSearch
            />
          </div>
        )}
      </div>

      {/* ================= MODAL: EDIT TIER SLAB ================= */}
      {editTier && (
        <Modal
          title={`Edit Bonus Rules · ${editTier.day}`}
          onClose={() => setEditTier(null)}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Streak Day Label</label>
                <input
                  className="input"
                  value={editTier.day}
                  onChange={(e) => setEditTier({ ...editTier, day: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Tier Name</label>
                <input
                  className="input"
                  value={editTier.tier_name}
                  onChange={(e) => setEditTier({ ...editTier, tier_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Required Accumulated Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="input"
                  value={editTier.accumulated}
                  onChange={(e) => setEditTier({ ...editTier, accumulated: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Attendance Bonus (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  className="input"
                  value={editTier.bonus}
                  onChange={(e) => setEditTier({ ...editTier, bonus: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={editTier.status}
                onChange={(e) => setEditTier({ ...editTier, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setEditTier(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn font-bold">
                Save Slab Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= MODAL: ADD NEW TIER ================= */}
      {addTierModal && (
        <Modal title="Add New Attendance Bonus Tier" onClose={() => setAddTierModal(false)}>
          <form onSubmit={handleAddNewTier} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Consecutive Day</label>
                <input
                  className="input"
                  placeholder="e.g. Day 8"
                  value={newTier.day}
                  onChange={(e) => setNewTier({ ...newTier, day: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Tier Title</label>
                <input
                  className="input"
                  placeholder="e.g. Super Streak"
                  value={newTier.tier_name}
                  onChange={(e) => setNewTier({ ...newTier, tier_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Required Accumulated Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="input"
                  placeholder="e.g. 500000"
                  value={newTier.accumulated}
                  onChange={(e) => setNewTier({ ...newTier, accumulated: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Bonus Reward (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  className="input"
                  placeholder="e.g. 10000"
                  value={newTier.bonus}
                  onChange={(e) => setNewTier({ ...newTier, bonus: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Status</label>
                <select
                  className="input"
                  value={newTier.status}
                  onChange={(e) => setNewTier({ ...newTier, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                </select>
              </div>

              <div>
                <label className="label">Tag / Badge</label>
                <input
                  className="input"
                  placeholder="e.g. Ultra Jackpot"
                  value={newTier.tag}
                  onChange={(e) => setNewTier({ ...newTier, tag: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setAddTierModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn font-bold">
                Create Tier Slab
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= MODAL: STREAK RULES EXPLANATION ================= */}
      {rulesModal && (
        <Modal title="Attendance Streak System Rules" onClose={() => setRulesModal(false)}>
          <div className="space-y-4 text-xs sm:text-sm text-slate-700">
            <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
              <h4 className="font-extrabold text-blue-900 mb-1 flex items-center gap-1.5">
                <Flame size={16} className="text-amber-500" /> Consecutive Daily Sign-in Mechanism
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Players earn daily bonuses by logging in and fulfilling the minimum accumulated recharge or betting requirement for that day.
              </p>
            </div>

            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Day 1 to Day 7:</strong> Higher consecutive days award exponentially bigger bonuses (up to ₹6,500 on Day 7).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Streak Reset:</strong> If a player misses even 1 day of sign-in, their streak counter resets back to Day 1.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Instant Credit:</strong> Upon satisfying the criteria and claiming, bonus funds are instantly credited to the player wallet.</span>
              </li>
            </ul>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button className="btn" onClick={() => setRulesModal(false)}>Got it</button>
            </div>
          </div>
        </Modal>
      )}



      {node}
    </div>
  )
}
