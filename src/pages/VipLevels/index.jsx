import { useState, useMemo } from 'react'
import {
  Crown, Pencil, Plus, Gift, Trophy, Sparkles, TrendingUp,
  ShieldCheck, CheckCircle2, Copy, Check, Users, IndianRupee,
  Receipt, Flame, HelpCircle, ArrowUpRight, Award, Zap, Send
} from 'lucide-react'
import DataTable from '@/components/DataTable'
import { PageBanner, Modal, useToast, money } from '@/components/ui'
import vipBg from '@/assets/images/VIP.png'
import {
  getVipTiers, saveVipTiers,
  getVipClaims, saveVipClaims
} from './vipStore'

export default function VipLevels() {
  const [activeTab, setActiveTab] = useState('TIERS') // 'TIERS' | 'CLAIMS' | 'LADDER'
  const [tiers, setTiers] = useState(getVipTiers)
  const [claims, setClaims] = useState(getVipClaims)

  // Modals
  const [editTier, setEditTier] = useState(null)
  const [awardModal, setAwardModal] = useState(false)
  const [rulesModal, setRulesModal] = useState(false)
  const [receiptModal, setReceiptModal] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

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
  const persistTiers = (updater) => {
    setTiers((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveVipTiers(next)
      return next
    })
  }

  // Persist claims
  const persistClaims = (updater) => {
    setClaims((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveVipClaims(next)
      return next
    })
  }

  // Toggle Tier Status
  const toggleTierStatus = (tier) => {
    const nextStatus = tier.status === 'Active' ? 'Paused' : 'Active'
    persistTiers((prev) =>
      prev.map((t) => (t.id === tier.id ? { ...t, status: nextStatus } : t))
    )
    toast(`${tier.name} status updated to ${nextStatus}`)
  }

  // Save Edit Tier
  const handleSaveEdit = (e) => {
    e.preventDefault()
    persistTiers((prev) =>
      prev.map((t) =>
        t.id === editTier.id
          ? {
              ...t,
              ...editTier,
              range: Number(editTier.range),
              up: Number(editTier.up),
              month: Number(editTier.month),
            }
          : t
      )
    )
    toast(`Updated ${editTier.name} rules successfully!`)
    setEditTier(null)
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

  // Tier Table Columns
  const tierCols = [
    {
      key: 'id',
      label: '#ID',
      render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span>,
    },
    {
      key: 'name',
      label: 'VIP Tier',
      render: (r) => (
        <div className="flex items-center gap-2.5 min-w-[170px]">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${r.color} text-white font-black text-xs shadow-md`}
          >
            <Crown size={18} fill="currentColor" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-sm">{r.name}</span>
            </div>
            <p className="text-[11px] text-slate-500 font-semibold">{r.title}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'range',
      label: 'Betting Turnover Target',
      render: (r) => (
        <div className="font-extrabold text-slate-900 text-sm">
          ₹{Number(r.range).toLocaleString('en-IN')}
          <span className="block text-[10px] text-slate-400 font-normal">Accumulated Bets</span>
        </div>
      ),
    },
    {
      key: 'up',
      label: 'Level-Up Fund Reward',
      render: (r) => (
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700 font-black text-sm border border-emerald-200">
          <Gift size={14} className="text-emerald-600" />
          ₹{Number(r.up).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      ),
    },
    {
      key: 'month',
      label: 'Monthly VIP Salary / Fund',
      render: (r) => (
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1 text-purple-700 font-black text-sm border border-purple-200">
          <Trophy size={14} className="text-purple-600" />
          ₹{Number(r.month).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      ),
    },
    {
      key: 'rebate',
      label: 'Daily Cash Rebate',
      render: (r) => (
        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
          {r.rebate || '0.20%'}
        </span>
      ),
    },
    {
      key: 'members',
      label: 'Active Members',
      render: (r) => (
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Users size={13} className="text-slate-400" />
          <span>{r.members} Players</span>
        </div>
      ),
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
      label: 'Action',
      render: (r) => (
        <button
          className="btn !py-1.5 text-xs font-bold flex items-center gap-1"
          onClick={() => setEditTier(r)}
        >
          <Pencil size={13} /> Edit Tier
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
      render: (r) => (
        <div className="flex items-center gap-2.5 min-w-[170px]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white font-black text-xs shadow-xs">
            {r.user_name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-extrabold text-slate-900 text-sm">{r.user_name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-1 rounded">
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
          <button
            onClick={() => setRulesModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white border border-white/30 hover:bg-white/30 transition shadow-sm"
          >
            <HelpCircle size={15} /> VIP Rules & Perks
          </button>
          <button
            onClick={() => setAwardModal(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-extrabold text-blue-700 shadow-xl transition-all hover:bg-blue-50 hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <Send size={16} /> Award VIP Fund
          </button>
        </div>
      </PageBanner>

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
                <label className="label">VIP Tier Name</label>
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
              <label className="label">Betting Turnover Requirement (₹)</label>
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
                <label className="label">Level Up Fund Reward (₹)</label>
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
                <label className="label">Monthly VIP Salary (₹)</label>
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
              <button type="submit" className="btn font-bold">
                Save VIP Rules
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

      {node}
    </div>
  )
}
