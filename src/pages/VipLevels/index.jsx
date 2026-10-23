import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Crown, Pencil, Plus, Gift, Trophy, Sparkles, TrendingUp,
  ShieldCheck, CheckCircle2, Copy, Check, Users, IndianRupee,
  Receipt, Flame, HelpCircle, ArrowUpRight, Award, Zap, Send,
  RefreshCw, KeyRound, LogIn, AlertCircle, SlidersHorizontal
} from 'lucide-react'
import DataTable from '@/components/DataTable'
import { PageBanner, Modal, useToast, money } from '@/components/ui'
import vipBg from '@/assets/images/VIP.png'
import {
  getVipTiers, saveVipTiers,
  getVipClaims, saveVipClaims,
  extractVipList, extractVipClaimsList, normalizeVipTier,
  VIP_TIER_STYLES
} from './vipStore'
import { apiRequest } from '@/utils/apiClient'
import auth from '@/utils/auth'
import { API_ENDPOINTS } from '@/constants/api'

export default function VipLevels() {
  const [activeTab, setActiveTab] = useState('TIERS') // 'TIERS' | 'CLAIMS' | 'LADDER'
  const [tiers, setTiers] = useState(getVipTiers)
  const [claims, setClaims] = useState(getVipClaims)

  // Live API States
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [lastSynced, setLastSynced] = useState(null)

  // Modals
  const [editTier, setEditTier] = useState(null)
  const [addTierModal, setAddTierModal] = useState(false)
  const [awardModal, setAwardModal] = useState(false)
  const [rulesModal, setRulesModal] = useState(false)
  const [receiptModal, setReceiptModal] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  // Form for New VIP Tier
  const [newTier, setNewTier] = useState({
    name: 'VIP 11',
    title: 'Grand Celestial Titan',
    range: '15000000000',
    up: '3000000',
    month: '1200000',
    rebate: '1.80%',
    status: 'Active',
  })

  // Form for Manual Awarding VIP Fund
  const [awardForm, setAwardForm] = useState({
    user_id: '',
    user_name: '',
    vip_level: 'VIP 5',
    reward_type: 'Level Up Reward',
    amount: '6900',
    remark: 'Special VIP manual credit',
  })

  const [toast, node] = useToast()

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
    toast(`Copied ${text} to clipboard!`)
  }

  // Persist tiers
  const persistTiers = useCallback((updater) => {
    setTiers((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveVipTiers(next)
      return next
    })
  }, [])

  // Persist claims
  const persistClaims = useCallback((updater) => {
    setClaims((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveVipClaims(next)
      return next
    })
  }, [])

  // Fetch VIP Levels from Backend (GET /admin/vip-levels or /api/admin/vip-levels)
  const fetchVipLevels = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true)
    else setIsLoading(true)
    setApiError(null)

    const endpoints = [
      API_ENDPOINTS.VIP_LEVELS_ADMIN_PROXY, // '/admin/vip-levels'
      API_ENDPOINTS.VIP_LEVELS_API_PROXY,   // '/api/admin/vip-levels'
    ]

    let json = null
    let usedEndpoint = null
    let lastErr = null

    for (const ep of endpoints) {
      try {
        console.log(`[Veronova VIP] GET ${ep}...`)
        json = await apiRequest(ep, { method: 'GET' })
        usedEndpoint = ep
        console.log(`[Veronova VIP] Success from ${ep}:`, json)
        break
      } catch (err) {
        lastErr = err
        if (err.status === 404) {
          console.warn(`[Veronova VIP] ${ep} returned 404, attempting next...`)
          continue
        }
        break
      }
    }

    if (json) {
      const list = extractVipList(json)
      if (Array.isArray(list) && list.length > 0) {
        const normalized = list.map((item, idx) => normalizeVipTier(item, idx)).filter(Boolean)
        if (normalized.length > 0) {
          persistTiers(normalized)
          setLastSynced(new Date().toLocaleTimeString())
          if (isManual) toast(`Synced ${normalized.length} VIP tier(s) from server`)
          console.log(`[Veronova VIP] Loaded ${normalized.length} live tiers from ${usedEndpoint}`)
        }
      }

      const claimsList = extractVipClaimsList(json)
      if (Array.isArray(claimsList) && claimsList.length > 0) {
        persistClaims(claimsList)
      }
    } else if (lastErr) {
      console.error('[Veronova VIP] Fetch error:', lastErr)
      setApiError(lastErr.message || 'Could not fetch VIP levels from backend')
      if (isManual) toast(`Sync failed: ${lastErr.message}`)
    }

    setIsLoading(false)
    setIsRefreshing(false)
  }, [persistTiers, persistClaims, toast])

  // Initial load
  useEffect(() => {
    fetchVipLevels()
  }, [fetchVipLevels])

  // Toggle Tier Status (POST /api/admin/vip-levels/:id ya PUT /api/admin/vip-levels/:id)
  const toggleTierStatus = async (tier) => {
    const nextStatus = tier.status === 'Active' ? 'Paused' : 'Active'
    persistTiers((prev) =>
      prev.map((t) => (t.id === tier.id ? { ...t, status: nextStatus } : t))
    )
    toast(`${tier.name} status updated to ${nextStatus}`)

    const payload = {
      ...tier,
      status: nextStatus === 'Active' ? 1 : 0,
      is_active: nextStatus === 'Active' ? 1 : 0,
    }

    const candidateEndpoints = [
      `/api/admin/vip-levels/${tier.id}`,
      `/api/admin/vip-levels`,
      `/admin/vip-levels/${tier.id}`,
      `/admin/vip-levels`,
    ]

    for (const ep of candidateEndpoints) {
      try {
        await apiRequest(ep, {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        break
      } catch (err) {
        if (err.status === 404 || err.status === 405) {
          try {
            await apiRequest(ep, {
              method: 'PUT',
              body: JSON.stringify(payload),
            })
            break
          } catch {}
          continue
        }
        break
      }
    }
  }

  // Save Edit Tier (POST /api/admin/vip-levels/:id ya POST /api/admin/vip-levels)
  const handleSaveEdit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    const updatedTier = {
      ...editTier,
      range: Number(editTier.range),
      up: Number(editTier.up),
      month: Number(editTier.month),
    }

    // Optimistic local update
    persistTiers((prev) =>
      prev.map((t) => (t.id === editTier.id ? updatedTier : t))
    )

    const payload = {
      id: editTier.id,
      level: editTier.level || editTier.id,
      name: editTier.name,
      title: editTier.title,
      range: Number(editTier.range),
      up: Number(editTier.up),
      month: Number(editTier.month),
      rebate: editTier.rebate,
      status: editTier.status === 'Active' ? 1 : 0,
      is_active: editTier.status === 'Active' ? 1 : 0,
      betting_turnover: Number(editTier.range),
      turnover_target: Number(editTier.range),
      target: Number(editTier.range),
      level_up_reward: Number(editTier.up),
      upgrade_bonus: Number(editTier.up),
      monthly_salary: Number(editTier.month),
      monthly_bonus: Number(editTier.month),
      cash_rebate: editTier.rebate,
    }

    const candidateEndpoints = [
      `/api/admin/vip-levels/${editTier.id}`,
      `/api/admin/vip-levels`,
      `/admin/vip-levels/${editTier.id}`,
      `/admin/vip-levels`,
    ]

    let saved = false
    let lastError = null

    for (const ep of candidateEndpoints) {
      try {
        console.log(`[Veronova VIP] POST ${ep}...`, payload)
        await apiRequest(ep, {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        saved = true
        console.log(`[Veronova VIP] Saved successfully on ${ep}`)
        break
      } catch (err) {
        lastError = err
        if (err.status === 404 || err.status === 405) {
          try {
            await apiRequest(ep, {
              method: 'PUT',
              body: JSON.stringify(payload),
            })
            saved = true
            break
          } catch {}
          continue
        }
        break
      }
    }

    setIsSaving(false)
    if (saved) {
      toast(`Updated ${editTier.name} rules successfully on server!`)
      setEditTier(null)
    } else {
      console.warn('[Veronova VIP] Server save warning:', lastError)
      toast(`Saved locally! Server: ${lastError?.message || 'Check backend connection'}`)
      setEditTier(null)
    }
  }

  // Create New VIP Tier (POST /api/admin/vip-levels)
  const handleAddTier = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    const nextId = Math.max(0, ...tiers.map((t) => Number(t.id) || 0)) + 1
    const nextLevel = Math.max(0, ...tiers.map((t) => Number(t.level) || 0)) + 1
    const styleIdx = (nextLevel - 1) % VIP_TIER_STYLES.length
    const style = VIP_TIER_STYLES[styleIdx] || VIP_TIER_STYLES[0]

    const newTierItem = {
      id: nextId,
      level: nextLevel,
      name: newTier.name.trim() || `VIP ${nextLevel}`,
      title: newTier.title.trim() || 'Supreme VIP Challenger',
      range: Number(newTier.range) || 0,
      up: Number(newTier.up) || 0,
      month: Number(newTier.month) || 0,
      rebate: newTier.rebate.trim() || '1.80%',
      members: 0,
      status: newTier.status,
      color: style.color,
      badge_color: style.badge_color,
    }

    persistTiers((prev) => [...prev, newTierItem])
    toast(`Adding ${newTierItem.name}...`)

    const payload = {
      ...newTierItem,
      status: newTierItem.status === 'Active' ? 1 : 0,
      is_active: newTierItem.status === 'Active' ? 1 : 0,
      betting_turnover: newTierItem.range,
      turnover_target: newTierItem.range,
      target: newTierItem.range,
      level_up_reward: newTierItem.up,
      upgrade_bonus: newTierItem.up,
      monthly_salary: newTierItem.month,
      monthly_bonus: newTierItem.month,
      cash_rebate: newTierItem.rebate,
    }

    const candidateEndpoints = [
      `/api/admin/vip-levels`,
      `/admin/vip-levels`,
    ]

    for (const ep of candidateEndpoints) {
      try {
        await apiRequest(ep, {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        console.log(`[Veronova VIP] Created tier on ${ep}`)
        break
      } catch (err) {
        if (err.status === 404) continue
        break
      }
    }

    setIsSaving(false)
    setAddTierModal(false)
    toast(`VIP Tier ${newTierItem.name} added successfully!`)
    setNewTier({
      name: `VIP ${nextLevel + 1}`,
      title: 'Legend Titan',
      range: '',
      up: '',
      month: '',
      rebate: '2.00%',
      status: 'Active',
    })
  }

  // Handle Manual Award VIP Fund
  const handleAwardVipFund = (e) => {
    e.preventDefault()
    if (!awardForm.user_id.trim()) return toast('Please enter Player User ID')
    const numAmt = Number(awardForm.amount)
    if (!numAmt || numAmt <= 0) return toast('Please enter a valid amount')

    const now = new Date()
    const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    const txId = 'VIP_FND_' + Math.floor(10000 + Math.random() * 90000)

    const newClaim = {
      id: Math.max(0, ...claims.map((c) => c.id)) + 1,
      tx_id: txId,
      user_id: awardForm.user_id.trim().toUpperCase(),
      user_name: awardForm.user_name.trim() || 'VIP Member',
      mobile: '9876543210',
      vip_level: awardForm.vip_level,
      reward_type: awardForm.reward_type,
      amount: numAmt,
      date: dateStr,
      status: 'Credited',
    }

    persistClaims([newClaim, ...claims])
    setReceiptModal(newClaim)
    toast(`₹${numAmt.toLocaleString('en-IN')} VIP Fund awarded to ${newClaim.user_id}!`)
    setAwardModal(false)
    setAwardForm({
      user_id: '',
      user_name: '',
      vip_level: 'VIP 5',
      reward_type: 'Level Up Reward',
      amount: '6900',
      remark: 'Special VIP manual credit',
    })
  }

  // KPI Calculations
  const totalFundsDistributed = claims.reduce((acc, c) => acc + (Number(c.amount) || 0), 0)
  const totalVipMembers = tiers.reduce((acc, t) => acc + (Number(t.members) || 0), 0)
  const monthlyFundPool = tiers.reduce((acc, t) => acc + (Number(t.month) || 0), 0)
  const maxJackpotReward = Math.max(...tiers.map((t) => Number(t.up) || 0))

  // Tier Table Columns - Exactly: ID, Name, Betting Range, Level Up Rewards, Monthly Rewards, Action
  const tierCols = [
    {
      key: 'id',
      label: 'ID',
      render: (r) => <span className="font-mono text-xs font-bold text-slate-700">#{r.id}</span>,
    },
    {
      key: 'name',
      label: 'Name',
      render: (r) => (
        <div className="flex items-center gap-2.5 min-w-[150px]">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${r.color || 'from-amber-600 to-amber-800'} text-white font-black text-xs shadow-xs`}
          >
            <Crown size={16} fill="currentColor" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm">{r.name}</span>
            {r.title && <p className="text-[11px] text-slate-500 font-semibold">{r.title}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'range',
      label: 'Betting Range',
      render: (r) => (
        <div className="font-extrabold text-slate-900 text-sm">
          ₹{Number(r.range || 0).toLocaleString('en-IN')}
        </div>
      ),
    },
    {
      key: 'up',
      label: 'Level Up Rewards',
      render: (r) => (
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700 font-black text-sm border border-emerald-200">
          <Gift size={14} className="text-emerald-600" />
          ₹{Number(r.up || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      ),
    },
    {
      key: 'month',
      label: 'Monthly Rewards',
      render: (r) => (
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1 text-purple-700 font-black text-sm border border-purple-200">
          <Trophy size={14} className="text-purple-600" />
          ₹{Number(r.month || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      ),
    },
    {
      label: 'Action',
      render: (r) => (
        <button
          className="btn !py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer"
          onClick={() => setEditTier(r)}
        >
          <Pencil size={13} /> Edit
        </button>
      ),
    },
  ]

  // Claims Table Columns
  const claimCols = [
    {
      key: 'id',
      label: '#ID & TxID',
      render: (r) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span>
          <p className="font-mono text-[10px] text-slate-500 font-semibold">{r.tx_id}</p>
        </div>
      ),
    },
    {
      key: 'user',
      label: 'VIP Player',
      render: (r) => {
        const uName = r?.user_name || r?.name || r?.user || 'VIP Member'
        const uId = r?.user_id || r?.u_id || `VIP_${r?.id || 1}`
        return (
          <div className="flex items-center gap-2.5 min-w-[170px]">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white font-black text-xs shadow-xs">
              {String(uName).slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-extrabold text-slate-900 text-sm">{uName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-1 rounded">
                  {uId}
                </span>
                <button
                  onClick={() => handleCopy(uId, r?.id)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  {copiedId === r?.id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                </button>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'vip_level',
      label: 'VIP Tier',
      render: (r) => (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-900 border border-amber-300">
          <Crown size={12} fill="currentColor" /> {r.vip_level}
        </span>
      ),
    },
    {
      key: 'reward_type',
      label: 'VIP Fund Category',
      render: (r) => {
        const isUp = r.reward_type.includes('Level')
        return (
          <span
            className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-bold ${
              isUp
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-purple-50 text-purple-700 border border-purple-200'
            }`}
          >
            {r.reward_type}
          </span>
        )
      },
    },
    {
      key: 'amount',
      label: 'Fund Amount Credited',
      render: (r) => (
        <span className="font-black text-emerald-600 text-sm">
          +₹{Number(r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
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
          <CheckCircle2 size={12} className="text-emerald-600" /> {r.status}
        </span>
      ),
    },
    {
      label: 'Action',
      render: (r) => (
        <button
          onClick={() => setReceiptModal(r)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
          title="View VIP Voucher"
        >
          <Receipt size={16} />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Banner */}
      <PageBanner
        title="VIP Levels & Loyalty Funds"
        icon={Crown}
        bgImage={vipBg}
        crumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'VIP Levels', to: '/vip-levels' },
          { label: 'VIP Reward Funds' },
        ]}
      >
        <div className="flex flex-wrap items-center gap-2">
          {lastSynced && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-white/80 bg-white/10 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/20">
              Synced: {lastSynced}
            </span>
          )}

          <button
            onClick={() => fetchVipLevels(true)}
            disabled={isRefreshing || isLoading}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white border border-white/30 hover:bg-white/30 transition shadow-sm disabled:opacity-50 cursor-pointer"
            title="Refresh VIP levels from backend"
          >
            <RefreshCw size={14} className={isRefreshing || isLoading ? 'animate-spin' : ''} />
            <span>{isRefreshing || isLoading ? 'Syncing...' : 'Sync Live'}</span>
          </button>

          <button
            onClick={() => setAddTierModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white border border-white/30 hover:bg-white/30 transition shadow-sm cursor-pointer"
          >
            <Plus size={15} /> Add VIP Level
          </button>

          <button
            onClick={() => setRulesModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white border border-white/30 hover:bg-white/30 transition shadow-sm cursor-pointer"
          >
            <HelpCircle size={15} /> VIP Rules & Perks
          </button>

          <button
            onClick={() => setAwardModal(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-extrabold text-blue-700 shadow-xl transition-all hover:bg-blue-50 hover:shadow-2xl hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Send size={16} /> Award VIP Fund
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
            onClick={() => fetchVipLevels(true)}
            className="flex items-center gap-1 rounded bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900 hover:bg-amber-200 transition"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} /> Retry
          </button>
        </div>
      )}

      {/* Compact, Sleek VIP Loyalty Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total VIP Funds Distributed */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">VIP Funds Distributed</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              ₹{totalFundsDistributed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{claims.length} total claims</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Crown size={18} />
          </div>
        </div>

        {/* Card 2: VIP Population */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">VIP Population</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {totalVipMembers.toLocaleString('en-IN')} Players
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Enrolled VIP 1 to VIP 10</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Users size={18} />
          </div>
        </div>

        {/* Card 3: Monthly Salary Pool */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Monthly Salary Pool</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              ₹{monthlyFundPool.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Monthly 1st payout</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <Gift size={18} />
          </div>
        </div>

        {/* Card 4: Daily Cash Rebate */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Daily Wager Rebate</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              Up to 1.60%
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Midnight turnover settlement</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Zap size={18} />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('TIERS')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'TIERS'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Crown size={15} />
              <span>VIP Tier Slabs & Rewards ({tiers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('CLAIMS')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'CLAIMS'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Receipt size={15} />
              <span>Distributed VIP Funds Log ({claims.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('LADDER')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'LADDER'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Sparkles size={15} />
              <span>VIP Ladder Showcase</span>
            </button>
          </div>

          <button
            onClick={() => setAwardModal(true)}
            className="btn !py-2 text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <Send size={14} /> Award VIP Fund
          </button>
        </div>

        {/* Tab 1: TIERS TABLE */}
        {activeTab === 'TIERS' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-amber-900 font-semibold">
                <Crown size={18} className="text-amber-600 shrink-0" fill="currentColor" />
                <span>
                  Configure the 10 VIP Tiers: Level-Up bonus, recurring monthly VIP salary, and daily cash rebate percentage.
                </span>
              </div>
              <button
                onClick={() => setRulesModal(true)}
                className="font-bold text-amber-800 hover:underline flex items-center gap-1"
              >
                View VIP Rules <ArrowUpRight size={14} />
              </button>
            </div>


            <DataTable
              columns={tierCols}
              rows={tiers}
              loading={isLoading || isRefreshing}
              exportName="vip-tier-slabs"
              placeholder="Search by VIP name or title..."
            />
          </div>
        )}

        {/* Tab 2: CLAIMS LOG */}
        {activeTab === 'CLAIMS' && (
          <div className="space-y-4">
            <DataTable
              columns={claimCols}
              rows={claims}
              exportName="vip-fund-claims-history"
              placeholder="Search by User ID, Name, TxID, or tier..."
            />
          </div>
        )}

        {/* Tab 3: LADDER CARDS PROGRESSION */}
        {activeTab === 'LADDER' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {tiers.map((t) => (
              <div
                key={t.id}
                className="card relative overflow-hidden border border-slate-200 p-4 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                {/* Header ribbon */}
                <div
                  className={`absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r ${t.color}`}
                />
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-xs font-bold text-slate-400">#{t.id}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                      t.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {t.status}
                  </span>
                </div>

                <div className="my-3 text-center">
                  <div
                    className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${t.color} text-white font-black shadow-md`}
                  >
                    <Crown size={22} fill="currentColor" />
                  </div>
                  <h4 className="mt-2 text-base font-black text-slate-900">{t.name}</h4>
                  <p className="text-xs text-slate-500 font-semibold">{t.title}</p>
                </div>

                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Turnover:</span>
                    <span className="font-extrabold text-slate-800">
                      ₹{t.range >= 10000000 ? `${(t.range / 10000000).toFixed(1)} Cr` : t.range >= 100000 ? `${(t.range / 100000).toFixed(1)} L` : `${t.range / 1000}k`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Level Up:</span>
                    <span className="font-black text-emerald-600">+₹{t.up.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Monthly:</span>
                    <span className="font-black text-purple-600">₹{t.month.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Rebate:</span>
                    <span className="font-bold text-blue-600">{t.rebate}</span>
                  </div>
                </div>

                <button
                  onClick={() => setEditTier(t)}
                  className="mt-3.5 w-full rounded-xl border border-slate-200 py-1.5 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
                >
                  Edit Rewards
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= MODAL: EDIT TIER SLAB ================= */}
      {editTier && (
        <Modal
          title={`Edit ${editTier.name} Rewards & Rules`}
          onClose={() => setEditTier(null)}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Name</label>
                <input
                  className="input font-bold"
                  value={editTier.name}
                  onChange={(e) => setEditTier({ ...editTier, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">VIP Title / Rank</label>
                <input
                  className="input"
                  value={editTier.title}
                  onChange={(e) => setEditTier({ ...editTier, title: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Betting Range (₹)</label>
              <input
                type="number"
                min="0"
                step="any"
                className="input font-bold"
                value={editTier.range}
                onChange={(e) => setEditTier({ ...editTier, range: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Level Up Rewards (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="input font-bold text-emerald-600"
                  value={editTier.up}
                  onChange={(e) => setEditTier({ ...editTier, up: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Monthly Rewards (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="input font-bold text-purple-600"
                  value={editTier.month}
                  onChange={(e) => setEditTier({ ...editTier, month: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Daily Cash Rebate %</label>
                <input
                  className="input font-bold"
                  value={editTier.rebate || '0.20%'}
                  onChange={(e) => setEditTier({ ...editTier, rebate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Status</label>
                <select
                  className="input font-semibold"
                  value={editTier.status}
                  onChange={(e) => setEditTier({ ...editTier, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setEditTier(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn font-bold cursor-pointer disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save VIP Rules'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= MODAL: AWARD VIP FUND ================= */}
      {awardModal && (
        <Modal title="Award Manual VIP Fund / Bonus" onClose={() => setAwardModal(false)}>
          <form onSubmit={handleAwardVipFund} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Player User ID</label>
                <input
                  className="input font-mono font-bold"
                  placeholder="e.g. VN_99814"
                  value={awardForm.user_id}
                  onChange={(e) => setAwardForm({ ...awardForm, user_id: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Player Name (Optional)</label>
                <input
                  className="input"
                  placeholder="e.g. Akash_Pro"
                  value={awardForm.user_name}
                  onChange={(e) => setAwardForm({ ...awardForm, user_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">VIP Tier</label>
                <select
                  className="input font-bold"
                  value={awardForm.vip_level}
                  onChange={(e) => {
                    const chosen = tiers.find((t) => t.name === e.target.value)
                    setAwardForm({
                      ...awardForm,
                      vip_level: e.target.value,
                      amount: chosen ? String(chosen.up) : awardForm.amount,
                    })
                  }}
                >
                  {tiers.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name} ({t.title})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Reward Type</label>
                <select
                  className="input font-semibold"
                  value={awardForm.reward_type}
                  onChange={(e) => setAwardForm({ ...awardForm, reward_type: e.target.value })}
                >
                  <option value="Level Up Reward">Level Up Reward</option>
                  <option value="Monthly VIP Fund">Monthly VIP Fund</option>
                  <option value="VIP Loyalty Rebate">VIP Loyalty Rebate</option>
                  <option value="Special VIP Privilege">Special VIP Privilege</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Fund Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  className="input !pl-8 text-base font-extrabold text-slate-900"
                  value={awardForm.amount}
                  onChange={(e) => setAwardForm({ ...awardForm, amount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Remark / Reason</label>
              <input
                className="input"
                value={awardForm.remark}
                onChange={(e) => setAwardForm({ ...awardForm, remark: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setAwardModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn font-bold flex items-center gap-1.5">
                <Send size={15} /> Award VIP Fund
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= MODAL: DIGITAL VIP VOUCHER ================= */}
      {receiptModal && (
        <Modal title="VIP Fund Transaction Voucher" onClose={() => setReceiptModal(null)}>
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-6 text-white text-center shadow-lg">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white border border-white/30">
                <Crown size={26} fill="currentColor" />
              </div>
              <p className="text-xs uppercase tracking-widest text-amber-100 font-bold">VIP Reward Credited</p>
              <h2 className="mt-1 text-3xl font-black">
                ₹{Number(receiptModal.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
              <p className="mt-1 font-mono text-xs text-amber-100">Voucher: {receiptModal.tx_id}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient ID:</span>
                <span className="font-mono font-bold text-slate-800">{receiptModal.user_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Player Name:</span>
                <span className="font-bold text-slate-800">{receiptModal.user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">VIP Tier:</span>
                <span className="font-bold text-amber-800">{receiptModal.vip_level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-bold text-blue-700">{receiptModal.reward_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-medium text-slate-700">{receiptModal.date}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button className="btn w-full font-bold" onClick={() => setReceiptModal(null)}>
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= MODAL: VIP RULES EXPLANATION ================= */}
      {rulesModal && (
        <Modal title="VIP Privilege & Rewards Architecture" onClose={() => setRulesModal(false)}>
          <div className="space-y-4 text-xs sm:text-sm text-slate-700">
            <div className="rounded-xl bg-amber-50 p-4 border border-amber-200">
              <h4 className="font-extrabold text-amber-950 mb-1 flex items-center gap-1.5">
                <Crown size={16} className="text-amber-600" fill="currentColor" /> VIP Tier Advancement Engine
              </h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                As players place wagers across any platform games (Aviator, Colour Prediction, Chicken Road, Horse Riding), their accumulated betting volume advances them from VIP 1 to VIP 10.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Level-Up Fund:</strong> One-time instant cash reward credited to player wallet as soon as the turnover threshold is reached.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Monthly VIP Salary:</strong> Recurring monthly loyalty fund claimable on the 1st of every calendar month by active VIP players.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Daily Cash Rebate:</strong> Up to 1.60% automatic wager rebate credited every midnight to higher tier VIPs.</span>
              </li>
            </ul>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button className="btn" onClick={() => setRulesModal(false)}>Understood</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= MODAL: ADD NEW VIP TIER ================= */}
      {addTierModal && (
        <Modal title="Create New VIP Level Slab" onClose={() => setAddTierModal(false)}>
          <form onSubmit={handleAddTier} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Name</label>
                <input
                  className="input font-bold"
                  placeholder="e.g. VIP 11"
                  value={newTier.name}
                  onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">VIP Title / Rank</label>
                <input
                  className="input"
                  placeholder="e.g. Grand Celestial Titan"
                  value={newTier.title}
                  onChange={(e) => setNewTier({ ...newTier, title: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Betting Range (₹)</label>
              <input
                type="number"
                min="0"
                step="any"
                className="input font-bold"
                placeholder="e.g. 15000000000"
                value={newTier.range}
                onChange={(e) => setNewTier({ ...newTier, range: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Level Up Rewards (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="input font-bold text-emerald-600"
                  placeholder="e.g. 3000000"
                  value={newTier.up}
                  onChange={(e) => setNewTier({ ...newTier, up: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Monthly Rewards (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="input font-bold text-purple-600"
                  placeholder="e.g. 1200000"
                  value={newTier.month}
                  onChange={(e) => setNewTier({ ...newTier, month: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Daily Cash Rebate %</label>
                <input
                  className="input font-bold"
                  placeholder="e.g. 1.80%"
                  value={newTier.rebate}
                  onChange={(e) => setNewTier({ ...newTier, rebate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Initial Status</label>
                <select
                  className="input font-semibold"
                  value={newTier.status}
                  onChange={(e) => setNewTier({ ...newTier, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                </select>
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
              <button
                type="submit"
                disabled={isSaving}
                className="btn bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Plus size={15} /> {isSaving ? 'Creating...' : 'Create VIP Level'}
              </button>
            </div>
          </form>
        </Modal>
      )}



      {node}
    </div>
  )
}
