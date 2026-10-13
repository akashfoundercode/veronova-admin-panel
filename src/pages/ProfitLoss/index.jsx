import { useState, useMemo } from 'react'
import {
  TrendingUp, BarChart3, ShieldCheck, DollarSign, ArrowUpRight,
  ArrowDownRight, FileSpreadsheet, Calendar, Percent, Sparkles,
  PieChart, RefreshCw, Trophy
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, money } from '@/components/ui'

const SEED_PROFIT_LOSS = [
  { id: 1, game: 'Wingo / Colour Prediction', turnover: 8450000, payouts: 6420000, net_profit: 2030000, margin: '24.0%', rounds: 4320, active_players: 8420 },
  { id: 2, game: 'Aviator Crash Multiplier', turnover: 6820000, payouts: 5210000, net_profit: 1610000, margin: '23.6%', rounds: 2890, active_players: 6150 },
  { id: 3, game: 'Chicken Multiplier Gold', turnover: 2450000, payouts: 1720000, net_profit: 730000, margin: '29.7%', rounds: 1640, active_players: 2890 },
  { id: 4, game: 'Jilli Slots & Fish Hunter', turnover: 1890000, payouts: 1380000, net_profit: 510000, margin: '26.9%', rounds: 3120, active_players: 1940 },
  { id: 5, game: 'Horse Racing Simulation', turnover: 1250000, payouts: 940000, net_profit: 310000, margin: '24.8%', rounds: 890, active_players: 1420 },
]

export default function ProfitLoss() {
  const [rows] = useState(SEED_PROFIT_LOSS)
  const [filterPeriod, setFilterPeriod] = useState('MONTH') // TODAY, WEEK, MONTH

  const totalTurnover = useMemo(() => rows.reduce((acc, r) => acc + r.turnover, 0), [rows])
  const totalPayouts = useMemo(() => rows.reduce((acc, r) => acc + r.payouts, 0), [rows])
  const totalProfit = useMemo(() => rows.reduce((acc, r) => acc + r.net_profit, 0), [rows])
  const totalRounds = useMemo(() => rows.reduce((acc, r) => acc + r.rounds, 0), [rows])
  const avgMargin = useMemo(() => {
    return ((totalProfit / totalTurnover) * 100).toFixed(1)
  }, [totalProfit, totalTurnover])

  const exportCols = [
    { key: 'id', label: 'ID' },
    { key: 'game', label: 'Game Engine' },
    { key: 'turnover', label: 'Total Bet Turnover' },
    { key: 'payouts', label: 'Player Payouts Won' },
    { key: 'net_profit', label: 'Gross Gaming Revenue (GGR)' },
    { key: 'margin', label: 'Platform Margin' },
    { key: 'rounds', label: 'Rounds Settled' },
    { key: 'active_players', label: 'Active Players' },
  ]

  const cols = [
    { key: 'id', label: '#ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    {
      key: 'game',
      label: 'Gaming Engine Title',
      render: (r) => (
        <div className="min-w-[200px]">
          <span className="font-extrabold text-slate-900 text-sm block">{r.game}</span>
          <span className="text-[11px] text-slate-500">{r.active_players.toLocaleString('en-IN')} Active Players</span>
        </div>
      ),
    },
    {
      key: 'turnover',
      label: 'Total Bet Turnover',
      render: (r) => <span className="font-bold text-slate-800 text-xs">₹{r.turnover.toLocaleString('en-IN')}</span>,
    },
    {
      key: 'payouts',
      label: 'Player Cashouts Won',
      render: (r) => <span className="font-bold text-rose-600 text-xs">₹{r.payouts.toLocaleString('en-IN')}</span>,
    },
    {
      key: 'net_profit',
      label: 'Gross Gaming Revenue (GGR)',
      render: (r) => (
        <span className="font-black text-emerald-600 text-sm">
          +₹{r.net_profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'margin',
      label: 'House Margin %',
      render: (r) => (
        <span className="inline-flex items-center gap-0.5 rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-black text-emerald-700 border border-emerald-200">
          <ArrowUpRight size={12} /> {r.margin}
        </span>
      ),
    },
    {
      key: 'rounds',
      label: 'Rounds Settled',
      render: (r) => <span className="font-mono text-xs text-slate-500">{r.rounds.toLocaleString('en-IN')}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <PageBanner
        title="Profit / Loss & Admin Financial Telemetry"
        icon={TrendingUp}
        crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Financial Telemetry' }, { label: 'GGR Profit / Loss' }]}
      />

      {/* Compact, Sleek P&L Financial Telemetry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Net Platform GGR</p>
            <h3 className="text-xl font-bold text-emerald-600 mt-0.5 tracking-tight font-mono">
              +₹{totalProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Gross gaming revenue</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <TrendingUp size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Wager Turnover</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              ₹{(totalTurnover / 10000000).toFixed(2)} Cr
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{totalRounds.toLocaleString('en-IN')} rounds</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <BarChart3 size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Average House Margin</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              +{avgMargin}%
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Across all games</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <ShieldCheck size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Player Cashout Won</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              ₹{(rows.reduce((a, b) => a + b.payouts, 0) / 10000000).toFixed(2)} Cr
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">100% reserve backed</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <ArrowUpRight size={18} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
            Game Engine Revenue Breakdown
          </h4>
          <button
            onClick={() => exportCSV('platform_ggr_report', exportCols, rows)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <FileSpreadsheet size={15} /> Export Financial Telemetry
          </button>
        </div>

        <DataTable columns={cols} rows={rows} unit="games" placeholder="Search game engine..." />
      </div>
    </div>
  )
}

