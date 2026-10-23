import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Network, Pencil, Users, TrendingUp, IndianRupee, Layers,
  CheckCircle2, Copy, Check, Calculator, HelpCircle, ArrowUpRight,
  Sparkles, Award, ShieldCheck, Flame, GitBranch, Share2, DollarSign,
  RefreshCw
} from 'lucide-react'
import DataTable from '@/components/DataTable'
import { PageBanner, Modal, useToast, money } from '@/components/ui'
import { apiRequest } from '@/utils/apiClient'
import { API_ENDPOINTS } from '@/constants/api'
import {
  getMlmLevels, saveMlmLevels,
  initialTopAgents, initialCommissionLogs,
  normalizeMlmLevel
} from './mlmStore'

export default function MlmLevels() {
  const [activeTab, setActiveTab] = useState('LEVELS') // 'LEVELS' | 'AGENTS' | 'STREAM' | 'SIMULATOR'
  const [levels, setLevels] = useState(getMlmLevels)
  const [agents, setAgents] = useState(initialTopAgents)
  const [stream, setStream] = useState(initialCommissionLogs)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)

  // Fetch MLM Levels from /admin/mlm-levels
  const loadMlmLevels = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      console.log(`[Veronova MLM] Fetching levels from: ${API_ENDPOINTS.MLM_LEVELS_PROXY}`)
      const json = await apiRequest(API_ENDPOINTS.MLM_LEVELS_PROXY, { method: 'GET' })

      if (json && (json.status === 200 || json.data)) {
        const payload = json.data || json
        const rawList =
          payload.list ||
          payload.mlm_levels ||
          payload.levels ||
          payload.history ||
          (Array.isArray(payload) ? payload : null)

        if (Array.isArray(rawList) && rawList.length > 0) {
          const formatted = rawList.map((item, idx) => normalizeMlmLevel(item, idx))
          setLevels(formatted)
          saveMlmLevels(formatted)
          setLastSynced(new Date().toLocaleTimeString())
          console.log(`[Veronova MLM] Loaded ${formatted.length} cascading tiers from backend`)
        }

        if (payload.top_agents && Array.isArray(payload.top_agents)) {
          setAgents(payload.top_agents)
        }
        if (payload.commission_logs && Array.isArray(payload.commission_logs)) {
          setStream(payload.commission_logs)
        }
      }
    } catch (err) {
      console.warn('[Veronova MLM] Live fetch failed, using local/cached levels:', err.message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadMlmLevels()
  }, [loadMlmLevels])

  // Modals
  const [editLevel, setEditLevel] = useState(null)
  const [rulesModal, setRulesModal] = useState(false)
  const [copiedKey, setCopiedKey] = useState(null)

  // Simulator State
  const [simBetAmount, setSimBetAmount] = useState('10000')

  const [toast, node] = useToast()

  // Copy helper
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1800)
    toast(`Copied ${text} to clipboard!`)
  }

  // Persist levels
  const persistLevels = (updater) => {
    setLevels((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveMlmLevels(next)
      return next
    })
  }

  // Toggle Level Status
  const toggleStatus = (lvl) => {
    const nextStatus = lvl.status === 'Active' ? 'Paused' : 'Active'
    persistLevels((prev) =>
      prev.map((l) => (l.id === lvl.id ? { ...l, status: nextStatus } : l))
    )
    toast(`${lvl.name} status updated to ${nextStatus}`)
  }

  // Save Edit Level
  const handleSaveEdit = (e) => {
    e.preventDefault()
    persistLevels((prev) =>
      prev.map((l) =>
        l.id === editLevel.id
          ? {
              ...l,
              ...editLevel,
              commission_rate: Number(editLevel.commission_rate),
              rate_display: `${Number(editLevel.commission_rate).toFixed(4)}%`,
              min_active_downlines: Number(editLevel.min_active_downlines),
            }
          : l
      )
    )
    toast(`Updated ${editLevel.name} commission rate!`)
    setEditLevel(null)
  }

  // KPIs
  const totalCommissionPaid = levels.reduce((acc, l) => acc + (Number(l.commission_paid) || 0), 0)
  const totalNetworkMembers = levels.reduce((acc, l) => acc + (Number(l.members_count) || 0), 0)
  const totalTurnoverVolume = levels.reduce((acc, l) => acc + (Number(l.turnover_volume) || 0), 0)
  const activeLevelsCount = levels.filter((l) => l.status === 'Active').length

  // Levels Columns
  const levelCols = [
    {
      key: 'id',
      label: '#Tier Depth',
      render: (r) => (
        <span className="font-mono text-xs font-black text-slate-400">Depth #{r.id}</span>
      ),
    },
    {
      key: 'name',
      label: 'Cascade Level',
      render: (r) => (
        <div className="flex items-center gap-2.5 min-w-[190px]">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${r.color} text-white font-black text-xs shadow-md`}
          >
            L{r.id}
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm">{r.name}</span>
            <p className="text-[11px] text-slate-500 font-semibold">{r.title}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'rate',
      label: 'Commission Rate %',
      render: (r) => (
        <div className="min-w-[130px]">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-800 font-black text-sm border border-emerald-200">
            {r.rate_display}
          </span>
          <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">{r.depth_share}</span>
        </div>
      ),
    },
    {
      key: 'min',
      label: 'Min Downlines',
      render: (r) => (
        <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
          {r.min_active_downlines} Active Player{r.min_active_downlines > 1 ? 's' : ''}
        </span>
      ),
    },
    {
      key: 'members',
      label: 'Enrolled Members',
      render: (r) => (
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Users size={13} className="text-slate-400" />
          <span>{r.members_count.toLocaleString('en-IN')} Users</span>
        </div>
      ),
    },
    {
      key: 'turnover',
      label: 'Team Bet Turnover',
      render: (r) => (
        <div className="font-bold text-slate-800 text-xs">
          ₹{Number(r.turnover_volume).toLocaleString('en-IN')}
        </div>
      ),
    },
    {
      key: 'commission',
      label: 'Commission Paid Out',
      render: (r) => (
        <div className="font-black text-emerald-600 text-sm">
          ₹{Number(r.commission_paid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <button
          onClick={() => toggleStatus(r)}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition hover:opacity-85 ${
            r.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
          title="Toggle Status"
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
          onClick={() => setEditLevel(r)}
          className="btn !py-1.5 text-xs font-bold flex items-center gap-1"
        >
          <Pencil size={13} /> Edit
        </button>
      ),
    },
  ]

  // Top Agents Columns
  const agentCols = [
    {
      key: 'rank',
      label: 'Rank',
      render: (r) => (
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-950 font-black text-xs">
          #{r.id}
        </div>
      ),
    },
    {
      key: 'agent',
      label: 'Agent Sponsor',
      render: (r) => (
        <div className="flex items-center gap-2.5 min-w-[170px]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xs shadow-xs">
            {r.agent_name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-extrabold text-slate-900 text-sm">{r.agent_name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-1 rounded">
                {r.agent_id}
              </span>
              <button
                onClick={() => handleCopy(r.agent_id, `ag_${r.id}`)}
                className="text-slate-400 hover:text-slate-600"
              >
                {copiedKey === `ag_${r.id}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'tier',
      label: 'Agent Rank Tier',
      render: (r) => (
        <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-700 border border-purple-200">
          <Award size={12} /> {r.tier}
        </span>
      ),
    },
    {
      key: 'direct',
      label: 'Direct Level 1 Players',
      render: (r) => (
        <span className="font-black text-blue-700 text-xs">
          {r.direct_referrals} Direct Users
        </span>
      ),
    },
    {
      key: 'total_network',
      label: 'Total Downline Network',
      render: (r) => (
        <span className="font-black text-slate-900 text-xs">
          {r.total_downline.toLocaleString('en-IN')} Members
        </span>
      ),
    },
    {
      key: 'team_turnover',
      label: 'Team Bet Turnover',
      render: (r) => (
        <span className="font-bold text-slate-800 text-xs">
          ₹{Number(r.team_turnover).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'commission',
      label: 'Commission Earned',
      render: (r) => (
        <span className="font-black text-emerald-600 text-sm">
          ₹{Number(r.total_commission).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
  ]

  // Commission Stream Columns
  const streamCols = [
    {
      key: 'id',
      label: 'Tx ID',
      render: (r) => <span className="font-mono text-xs font-bold text-slate-500">{r.id}</span>,
    },
    {
      key: 'sponsor',
      label: 'Beneficiary Sponsor',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-900 text-xs">{r.sponsor_name}</span>
          <span className="block font-mono text-[10px] text-blue-600">{r.sponsor_id}</span>
        </div>
      ),
    },
    {
      key: 'downline',
      label: 'Downline Bettor',
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
          {r.downline_id}
        </span>
      ),
    },
    {
      key: 'level',
      label: 'MLM Level Depth',
      render: (r) => (
        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
          {r.level}
        </span>
      ),
    },
    {
      key: 'game',
      label: 'Game Played',
      render: (r) => <span className="text-xs font-bold text-slate-800">{r.game}</span>,
    },
    {
      key: 'bet_amount',
      label: 'Bet Amount',
      render: (r) => (
        <span className="font-bold text-slate-900 text-xs">
          ₹{Number(r.bet_amount).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'earned',
      label: 'Commission Paid',
      render: (r) => (
        <span className="font-black text-emerald-600 text-xs">
          +₹{Number(r.commission_earned).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'time',
      label: 'Timestamp',
      render: (r) => <span className="text-xs text-slate-500 font-mono">{r.time}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Banner */}
      <PageBanner
        title="Multi-Level Marketing (MLM) Referral Architecture"
        icon={Network}
        crumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'MLM Levels', to: '/mlm-levels' },
          { label: 'Referral Cascade Slabs' },
        ]}
      >
        <div className="flex flex-wrap items-center gap-2">
          {lastSynced && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] text-white/90 font-medium">
              Synced: {lastSynced}
            </span>
          )}
          <button
            onClick={() => loadMlmLevels(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md px-3 py-2 text-xs font-bold text-white border border-white/30 hover:bg-white/30 transition shadow-xs cursor-pointer"
            title="Refresh Live MLM Levels from Server"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Live'}</span>
          </button>
          <button
            onClick={() => setRulesModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-extrabold text-blue-700 shadow-xl transition hover:bg-blue-50 cursor-pointer"
          >
            <HelpCircle size={15} /> 6-Tier Cascade Math
          </button>
        </div>
      </PageBanner>

      {/* Compact, Sleek MLM Network Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Commission Paid Out */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">MLM Commissions Paid</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              ₹{totalCommissionPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Across L1 to L6 downlines</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <IndianRupee size={18} />
          </div>
        </div>

        {/* Card 2: Network Downline Size */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Downline Network</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {totalNetworkMembers.toLocaleString('en-IN')} Members
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">6 active generations</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Users size={18} />
          </div>
        </div>

        {/* Card 3: Network Bet Turnover */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Network Bet Turnover</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              ₹{(totalTurnoverVolume / 10000000).toFixed(2)} Cr
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Total affiliate volume</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <TrendingUp size={18} />
          </div>
        </div>

        {/* Card 4: Direct L1 Base Share */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Direct L1 Base Cut</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              0.6000%
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">60% primary tier split</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <GitBranch size={18} />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('LEVELS')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'LEVELS'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <GitBranch size={15} />
              <span>6-Tier Commission Slabs ({levels.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('AGENTS')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'AGENTS'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Award size={15} />
              <span>Top Affiliate Leaders ({agents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('STREAM')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'STREAM'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <TrendingUp size={15} />
              <span>Live Commission Stream ({stream.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('SIMULATOR')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'SIMULATOR'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Calculator size={15} />
              <span>Commission Simulator</span>
            </button>
          </div>
        </div>

        {/* Tab 1: LEVELS SLABS */}
        {activeTab === 'LEVELS' && (
          <div className="space-y-4">
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-blue-800 font-semibold">
                <Sparkles size={18} className="text-blue-600 shrink-0" />
                <span>
                  Every wager placed by downline players distributes instant passive commissions across 6 tiers up the sponsor tree.
                </span>
              </div>
              <button
                onClick={() => setRulesModal(true)}
                className="font-bold text-blue-700 hover:underline flex items-center gap-1"
              >
                View Cascade Rules <ArrowUpRight size={14} />
              </button>
            </div>

            <DataTable
              columns={levelCols}
              rows={levels}
              exportName="mlm-levels-slabs"
              placeholder="Search level or title..."
            />
          </div>
        )}

        {/* Tab 2: TOP AGENTS */}
        {activeTab === 'AGENTS' && (
          <div className="space-y-4">
            <DataTable
              columns={agentCols}
              rows={agents}
              exportName="top-affiliate-agents"
              placeholder="Search by agent name, ID, or mobile..."
            />
          </div>
        )}

        {/* Tab 3: LIVE COMMISSION STREAM */}
        {activeTab === 'STREAM' && (
          <div className="space-y-4">
            <DataTable
              columns={streamCols}
              rows={stream}
              exportName="live-commission-stream"
              placeholder="Search sponsor, downline, or game..."
            />
          </div>
        )}

        {/* Tab 4: COMMISSION SIMULATOR */}
        {activeTab === 'SIMULATOR' && (
          <div className="space-y-6 max-w-4xl mx-auto py-2">
            <div className="card p-6 border border-blue-100 bg-white shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <Calculator size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Multi-Tier Commission Realtime Simulator</h3>
                  <p className="text-xs text-slate-500">
                    Simulate any player wager to see the automatic instant cascade breakdown across all 6 MLM levels
                  </p>
                </div>
              </div>

              {/* Input */}
              <div>
                <label className="label">Sample Player Bet Turnover (₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="10"
                    step="any"
                    className="input !pl-8 text-lg font-extrabold text-slate-900"
                    value={simBetAmount}
                    onChange={(e) => setSimBetAmount(e.target.value)}
                  />
                </div>
                {/* Preset Chips */}
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {[1000, 5000, 10000, 50000, 100000, 500000].map((v) => (
                    <button
                      type="button"
                      key={v}
                      onClick={() => setSimBetAmount(String(v))}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-blue-400"
                    >
                      ₹{v.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Calculated Commission Payout Stream for ₹{Number(simBetAmount || 0).toLocaleString('en-IN')} Bet
                </h4>

                <div className="space-y-2">
                  {levels.map((lvl) => {
                    const payout = (Number(simBetAmount || 0) * (lvl.commission_rate / 100))
                    return (
                      <div
                        key={lvl.id}
                        className="flex items-center justify-between rounded-xl bg-white p-3 border border-slate-100 shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${lvl.color} text-white font-black text-xs`}
                          >
                            L{lvl.id}
                          </span>
                          <div>
                            <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{lvl.name}</span>
                            <span className="ml-2 font-mono text-xs text-blue-600 font-bold">
                              ({lvl.rate_display})
                            </span>
                            <p className="text-[11px] text-slate-400">{lvl.title}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-black text-emerald-600 text-sm sm:text-base">
                            +₹{payout.toFixed(4)}
                          </span>
                          <span className="block text-[10px] text-slate-400">Instant Upline Credit</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Total Pool */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="text-xs font-bold text-slate-600">Total Affiliate Commission Distributed:</span>
                  <span className="text-base font-black text-blue-700">
                    +₹
                    {levels
                      .reduce((acc, l) => acc + (Number(simBetAmount || 0) * (l.commission_rate / 100)), 0)
                      .toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL: EDIT LEVEL ================= */}
      {editLevel && (
        <Modal
          title={`Edit ${editLevel.name} Commission Rules`}
          onClose={() => setEditLevel(null)}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Level Name</label>
                <input
                  className="input font-bold"
                  value={editLevel.name}
                  onChange={(e) => setEditLevel({ ...editLevel, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Level Title / Depth</label>
                <input
                  className="input"
                  value={editLevel.title}
                  onChange={(e) => setEditLevel({ ...editLevel, title: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Commission Rate %</label>
                <input
                  type="number"
                  step="any"
                  className="input font-bold text-emerald-600"
                  value={editLevel.commission_rate}
                  onChange={(e) => setEditLevel({ ...editLevel, commission_rate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Min Active Downlines</label>
                <input
                  type="number"
                  min="0"
                  className="input font-bold"
                  value={editLevel.min_active_downlines}
                  onChange={(e) => setEditLevel({ ...editLevel, min_active_downlines: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Status</label>
              <select
                className="input font-semibold"
                value={editLevel.status}
                onChange={(e) => setEditLevel({ ...editLevel, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setEditLevel(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn font-bold">
                Save Level Slabs
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= MODAL: 6-TIER CASCADE RULES ================= */}
      {rulesModal && (
        <Modal title="6-Tier MLM Commission Cascade Mathematics" onClose={() => setRulesModal(false)}>
          <div className="space-y-4 text-xs sm:text-sm text-slate-700">
            <div className="rounded-xl bg-blue-50 p-4 border border-blue-200">
              <h4 className="font-extrabold text-blue-950 mb-1 flex items-center gap-1.5">
                <Network size={16} className="text-blue-600" /> Multi-Generational Referral Math
              </h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                Whenever a player places any bet across any platform games, their 6 direct uplines automatically receive passive turnover cuts without reducing the player payout.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Level 1 (Direct 0.60%):</strong> Sponsor receives 0.60% (e.g. ₹60 per ₹10,000 turnover).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Level 2 (Tier 2 0.18%):</strong> Grand-sponsor receives 0.18% (e.g. ₹18 per ₹10,000 turnover).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Levels 3 to 6 (0.054% down to 0.0014%):</strong> Deep cascade ensuring high network virality and incentive for top affiliate recruiting.</span>
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
