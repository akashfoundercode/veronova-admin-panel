import { useState, useMemo } from 'react'
import {
  ShieldAlert, Eye, Lock, Unlock, AlertTriangle, ShieldCheck,
  TrendingDown, DollarSign, RefreshCw, Copy, Check, Search, Filter,
  ExternalLink, Ban, CheckCircle2, FileText, HelpCircle, ArrowUpRight,
  Sliders, UserX, Cpu, Activity, Globe
} from 'lucide-react'
import DataTable from '@/components/DataTable'
import { PageBanner, Modal, useToast, money } from '@/components/ui'
import illegalBetsBg from '@/assets/images/illegalbets.png'
import { getIllegalUsers, saveIllegalUsers } from './illegalBetsStore'

export default function IllegalBets() {
  const [rows, setRows] = useState(getIllegalUsers)
  const [filterTab, setFilterTab] = useState('ALL') // ALL, CRITICAL, HEDGING, BOT, FROZEN
  const [investigateUser, setInvestigateUser] = useState(null)
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

  // Persist updater
  const persistRows = (updater) => {
    setRows((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveIllegalUsers(next)
      return next
    })
  }

  // Toggle Account Freeze
  const toggleFreeze = (user) => {
    const nextStatus = user.status === 'Frozen' ? 'Under Review' : 'Frozen'
    persistRows((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    )
    toast(
      nextStatus === 'Frozen'
        ? `Account ${user.user_id} frozen! Withdrawals blocked.`
        : `Account ${user.user_id} unlocked and set to Under Review.`
    )
    if (investigateUser?.id === user.id) {
      setInvestigateUser((prev) => ({ ...prev, status: nextStatus }))
    }
  }

  // Clear / False Positive
  const handleClearIncident = (user) => {
    persistRows((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: 'Cleared', risk_score: 15, risk_level: 'Low' } : u))
    )
    toast(`Incident for ${user.user_id} marked as Cleared / False Positive!`)
    setInvestigateUser(null)
  }

  // Confiscate / Void Illegal Winnings
  const handleConfiscate = (user) => {
    if (window.confirm(`Confiscate ₹${user.wallet_at_risk.toLocaleString('en-IN')} fraudulent balance from ${user.user_id}?`)) {
      persistRows((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, wallet_at_risk: 0, status: 'Frozen' } : u))
      )
      toast(`₹${user.wallet_at_risk.toLocaleString('en-IN')} confiscated from ${user.user_id}!`)
      if (investigateUser?.id === user.id) {
        setInvestigateUser((prev) => ({ ...prev, wallet_at_risk: 0 }))
      }
    }
  }

  // KPI Calculations
  const totalIllegalBets = rows.reduce((acc, r) => acc + (Number(r.count) || 0), 0)
  const totalBalanceAtRisk = rows.reduce((acc, r) => acc + (Number(r.wallet_at_risk) || 0), 0)
  const frozenCount = rows.filter((r) => r.status === 'Frozen').length
  const criticalCount = rows.filter((r) => r.risk_score >= 90).length
  const hedgingCount = rows.filter((r) => r.violation_type.includes('Hedging')).length
  const botCount = rows.filter((r) => r.violation_type.includes('Bot')).length

  // Filtered rows
  const displayRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterTab === 'CRITICAL' && r.risk_score < 90) return false
      if (filterTab === 'HEDGING' && !r.violation_type.includes('Hedging')) return false
      if (filterTab === 'BOT' && !r.violation_type.includes('Bot')) return false
      if (filterTab === 'FROZEN' && r.status !== 'Frozen') return false
      return true
    })
  }, [rows, filterTab])

  // Risk Score Badge
  const getRiskBadge = (score, level) => {
    if (score >= 90) {
      return {
        bg: 'bg-rose-50 border-rose-200 text-rose-700',
        bar: 'bg-rose-600',
        label: `${score}/100 Critical`,
      }
    }
    if (score >= 75) {
      return {
        bg: 'bg-amber-50 border-amber-200 text-amber-700',
        bar: 'bg-amber-500',
        label: `${score}/100 High`,
      }
    }
    return {
      bg: 'bg-blue-50 border-blue-200 text-blue-700',
      bar: 'bg-blue-500',
      label: `${score}/100 Medium`,
    }
  }

  // Columns
  const cols = [
    {
      key: 'id',
      label: '#ID',
      render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span>,
    },
    {
      key: 'player',
      label: 'Flagged Suspect Player',
      render: (r) => (
        <div className="flex items-center gap-3 min-w-[210px]">
          <div className="relative shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-600 to-red-800 text-white font-black text-xs shadow-md">
              <ShieldAlert size={18} />
            </div>
            {r.status === 'Frozen' && (
              <div className="absolute -top-1.5 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-rose-400 shadow-xs">
                <Lock size={10} />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-sm hover:text-rose-600 transition">
                {r.user_name}
              </span>
            </div>
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
            <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
              <Globe size={10} /> {r.ip_address} ({r.location})
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'violation',
      label: 'Violation Category',
      render: (r) => {
        const isHedge = r.violation_type.includes('Hedging')
        const isBot = r.violation_type.includes('Bot')
        const badgeCls = isHedge
          ? 'bg-rose-50 text-rose-700 border-rose-200'
          : isBot
          ? 'bg-purple-50 text-purple-700 border-purple-200'
          : 'bg-amber-50 text-amber-700 border-amber-200'
        return (
          <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold border ${badgeCls}`}>
            {r.violation_type}
          </span>
        )
      },
    },
    {
      key: 'risk',
      label: 'Risk Telemetry',
      render: (r) => {
        const b = getRiskBadge(r.risk_score, r.risk_level)
        return (
          <div className="min-w-[130px]">
            <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-black border ${b.bg}`}>
              {b.label}
            </span>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${b.bar}`}
                style={{ width: `${r.risk_score}%` }}
              />
            </div>
          </div>
        )
      },
    },
    {
      key: 'count',
      label: 'Illegal Bets',
      render: (r) => (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-black text-rose-800">
          <AlertTriangle size={12} /> {r.count} Bets
        </span>
      ),
    },
    {
      key: 'wallet',
      label: 'Wallet At Risk',
      render: (r) => (
        <div className="font-black text-slate-900 text-sm">
          ₹{Number(r.wallet_at_risk).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          <span className="block text-[10px] text-slate-400 font-normal">Exposed Balance</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Account Status',
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
            r.status === 'Frozen'
              ? 'bg-rose-100 text-rose-800 border border-rose-300'
              : r.status === 'Cleared'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          {r.status === 'Frozen' ? (
            <Lock size={12} className="text-rose-600" />
          ) : r.status === 'Cleared' ? (
            <CheckCircle2 size={12} className="text-emerald-600" />
          ) : (
            <Activity size={12} className="text-amber-600" />
          )}
          {r.status}
        </span>
      ),
    },
    {
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setInvestigateUser(r)}
            className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-extrabold text-blue-700 hover:bg-blue-600 hover:text-white transition shadow-2xs"
            title="Investigate Bet Logs"
          >
            <Eye size={14} /> Audit Trail
          </button>
          <button
            onClick={() => toggleFreeze(r)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition shadow-2xs ${
              r.status === 'Frozen'
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white'
            }`}
            title={r.status === 'Frozen' ? 'Unlock Account' : 'Freeze Suspicious Account'}
          >
            {r.status === 'Frozen' ? <Unlock size={14} /> : <Lock size={14} />}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Banner */}
      <PageBanner
        title="Illegal User Bets & Fraud Risk Control"
        icon={ShieldAlert}
        bgImage={illegalBetsBg}
        crumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Illegal User Bet', to: '/illegal-bets' },
          { label: 'Fraud Detection Console' },
        ]}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRulesModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white border border-white/30 hover:bg-white/30 transition shadow-sm"
          >
            <HelpCircle size={15} /> Anti-Collusion Rules
          </button>
        </div>
      </PageBanner>

      {/* Compact, Sleek Threat & Anti-Fraud Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Capital Exposure at Risk */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Capital at Risk</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              ₹{totalBalanceAtRisk.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{rows.length} flagged accounts</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <ShieldAlert size={18} />
          </div>
        </div>

        {/* Card 2: Quarantined Accounts */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Quarantine Vault</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {frozenCount} / {rows.length} Frozen
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{((frozenCount / (rows.length || 1)) * 100).toFixed(0)}% Locked</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Lock size={18} />
          </div>
        </div>

        {/* Card 3: Detected Exploits */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Detected Exploits</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {totalIllegalBets} Anomaly Bets
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Hedging & Bots</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Cpu size={18} />
          </div>
        </div>

        {/* Card 4: Critical Threat Targets */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Critical Risk (≥90)</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {criticalCount} Critical Accounts
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Payout interceptor armed</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <ShieldAlert size={18} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card p-4 space-y-4 shadow-sm">
        {/* Segmented Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All Flagged Users', count: rows.length },
              { id: 'CRITICAL', label: 'Critical Risk (≥90)', count: criticalCount },
              { id: 'HEDGING', label: 'Opposite Betting (Hedging)', count: hedgingCount },
              { id: 'BOT', label: 'Bot Rapid Automation', count: botCount },
              { id: 'FROZEN', label: 'Frozen Accounts', count: frozenCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  filterTab === tab.id
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25 scale-[1.02]'
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

          <div className="text-xs font-semibold text-slate-400">
            Showing {displayRows.length} flagged incidents
          </div>
        </div>

        {/* The Main DataTable */}
        <DataTable
          columns={cols}
          rows={displayRows}
          exportName="illegal-bets-incidents"
          placeholder="Search by User ID, Name, IP, or violation..."
        />
      </div>

      {/* ================= MODAL: DETAILED BET AUDIT TRAIL ================= */}
      {investigateUser && (
        <Modal
          title={`Fraud Audit Trail · ${investigateUser.user_name} (${investigateUser.user_id})`}
          onClose={() => setInvestigateUser(null)}
          width="max-w-4xl"
        >
          <div className="space-y-4">
            {/* Header info card */}
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-5 text-white shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 font-black text-white text-base shadow-lg">
                    {investigateUser.risk_score}
                  </div>
                  <div>
                    <h3 className="text-lg font-black">{investigateUser.user_name}</h3>
                    <p className="font-mono text-xs text-rose-200">
                      User ID: {investigateUser.user_id} • IP: {investigateUser.ip_address} ({investigateUser.location})
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block rounded-md bg-rose-500/20 px-2.5 py-1 text-xs font-bold text-rose-300 border border-rose-500/30">
                    {investigateUser.violation_type}
                  </span>
                  <p className="text-xs text-slate-300 mt-1 font-semibold">
                    Wallet At Risk: ₹{Number(investigateUser.wallet_at_risk).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Conflicting Rounds Audit Log */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Detected Opposing / Programmatic Wagers ({investigateUser.bets?.length || 0} Rounds Logged)
              </h4>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3 font-bold">Bet ID & Round</th>
                      <th className="p-3 font-bold">Game</th>
                      <th className="p-3 font-bold">Player Wager</th>
                      <th className="p-3 font-bold">Detected Collusion / Conflict</th>
                      <th className="p-3 font-bold">Amount</th>
                      <th className="p-3 font-bold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {investigateUser.bets && investigateUser.bets.length > 0 ? (
                      investigateUser.bets.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50 transition">
                          <td className="p-3 font-mono">
                            <span className="font-bold text-slate-900">{b.id}</span>
                            <span className="block text-[10px] text-slate-400">{b.round_id}</span>
                          </td>
                          <td className="p-3 font-bold text-slate-800">{b.game}</td>
                          <td className="p-3 font-bold text-blue-700">{b.choice}</td>
                          <td className="p-3">
                            <span className="rounded bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
                              {b.conflict}
                            </span>
                          </td>
                          <td className="p-3 font-black text-slate-900">₹{b.amount.toLocaleString('en-IN')}</td>
                          <td className="p-3 font-mono text-[11px] text-slate-500">{b.date}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-400">
                          No sub-rounds recorded for this incident.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => handleClearIncident(investigateUser)}
                className="btn-ghost text-xs font-bold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
              >
                Mark as False Positive / Clear Flag
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleConfiscate(investigateUser)}
                  className="btn bg-rose-700 hover:bg-rose-800 text-xs font-bold"
                >
                  Confiscate Illegitimate Winnings
                </button>
                <button
                  type="button"
                  onClick={() => toggleFreeze(investigateUser)}
                  className={`btn text-xs font-bold ${
                    investigateUser.status === 'Frozen'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-slate-900 hover:bg-black'
                  }`}
                >
                  {investigateUser.status === 'Frozen' ? 'Unlock Account' : 'Freeze Account'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= MODAL: ANTI-COLLUSION RULES ================= */}
      {rulesModal && (
        <Modal title="Anti-Fraud & Hedging Detection Architecture" onClose={() => setRulesModal(false)}>
          <div className="space-y-4 text-xs sm:text-sm text-slate-700">
            <div className="rounded-xl bg-rose-50 p-4 border border-rose-200">
              <h4 className="font-extrabold text-rose-950 mb-1 flex items-center gap-1.5">
                <ShieldAlert size={16} className="text-rose-600" /> Algorithmic Fraud Engine
              </h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                The platform monitors every round in real time to prevent unlawful arbitrage, illegal bonus laundering, and synchronized betting.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Opposite Betting / Hedging:</strong> Placing wagers on opposing outcomes (e.g. Red vs Green, Big vs Small) in the same round to guarantee turnover with zero risk.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <span><strong>IP & Device Collision:</strong> Two or more player accounts active on the same IP subnet placing contradictory or syndicated bets.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Bot Rapid Automation:</strong> Automated API scripts placing bets within 5ms of round completion or executing repetitive cashout patterns.</span>
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
