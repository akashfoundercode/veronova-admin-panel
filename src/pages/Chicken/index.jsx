import { useState } from 'react'
import {
  Flame,
  Database,
  Pencil,
  Trash2,
  Plus,
  Save,
  Target,
  Star,
  SlidersHorizontal,
  TrendingUp,
  Sparkles,
  Zap,
  ShieldCheck,
  Award,
  BarChart3,
  CheckCircle2,
  ArrowUpRight,
  Coins,
  DollarSign,
  HelpCircle,
  RefreshCw,
  Play,
} from 'lucide-react'
import DataTable from '@/components/DataTable'
import { PageBanner, FormModal, useToast, money } from '@/components/ui'

// Difficulty definitions & ultra-premium color themes
const DIFFICULTY_CONFIG = {
  Easy: {
    label: 'Easy',
    bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/25',
    pill: 'bg-emerald-500 text-white shadow-emerald-500/30',
    accent: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    cardBorder: 'border-emerald-200/60 dark:border-emerald-900/30',
    iconBg: 'bg-emerald-50 text-emerald-600',
    desc: 'Lowest risk, frequent safe step multipliers',
    roastDefault: '10.00x',
  },
  Medium: {
    label: 'Medium',
    bg: 'bg-blue-500/10 text-blue-600 border-blue-500/25',
    pill: 'bg-blue-600 text-white shadow-blue-500/30',
    accent: '#2563eb',
    gradient: 'from-blue-600 to-indigo-600',
    cardBorder: 'border-blue-200/60 dark:border-blue-900/30',
    iconBg: 'bg-blue-50 text-blue-600',
    desc: 'Balanced risk/reward lane profile',
    roastDefault: '1760.55x',
  },
  Hard: {
    label: 'Hard',
    bg: 'bg-purple-500/10 text-purple-600 border-purple-500/25',
    pill: 'bg-purple-600 text-white shadow-purple-500/30',
    accent: '#9333ea',
    gradient: 'from-purple-600 to-pink-600',
    cardBorder: 'border-purple-200/60 dark:border-purple-900/30',
    iconBg: 'bg-purple-50 text-purple-600',
    desc: 'High volatility, massive jump payouts',
    roastDefault: '40899.77x',
  },
  Hardcore: {
    label: 'Hardcore',
    bg: 'bg-rose-500/10 text-rose-600 border-rose-500/25',
    pill: 'bg-rose-600 text-white shadow-rose-500/30',
    accent: '#e11d48',
    gradient: 'from-rose-600 to-orange-600',
    cardBorder: 'border-rose-200/60 dark:border-rose-900/30',
    iconBg: 'bg-rose-50 text-rose-600',
    desc: 'Extreme danger & legendary jackpot multipliers',
    roastDefault: '2516310.50x',
  },
}

const TypeBadge = ({ t }) => {
  const cfg = DIFFICULTY_CONFIG[t] || DIFFICULTY_CONFIG.Easy
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-xs ${cfg.bg}`}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg.accent }} />
      {t}
    </span>
  )
}

const crumbs = (last) => [
  { label: 'Dashboard', to: '/' },
  { label: 'Chicken Road Game', to: '/chicken/multiplier' },
  { label: last },
]

// ==========================================
// 1. CHICKEN MULTIPLIER PAGE (REDESIGNED)
// ==========================================
export function ChickenMultiplier() {
  const [toast, toastNode] = useToast()
  const [roast, setRoast] = useState([
    { id: 1, type: 'Easy', value: '10.00', steps: 24, rtp: '97.2%' },
    { id: 2, type: 'Medium', value: '1760.55', steps: 24, rtp: '96.8%' },
    { id: 3, type: 'Hard', value: '40899.77', steps: 24, rtp: '96.5%' },
    { id: 4, type: 'Hardcore', value: '2516310.50', steps: 24, rtp: '96.0%' },
  ])

  const base = [
    { m: 1.02, t: 'Easy', step: 1 },
    { m: 1.05, t: 'Easy', step: 2 },
    { m: 1.16, t: 'Easy', step: 3 },
    { m: 1.21, t: 'Easy', step: 4 },
    { m: 1.27, t: 'Easy', step: 5 },
    { m: 1.34, t: 'Easy', step: 6 },
    { m: 1.42, t: 'Easy', step: 7 },
    { m: 1.51, t: 'Easy', step: 8 },
    { m: 1.75, t: 'Medium', step: 9 },
    { m: 2.10, t: 'Medium', step: 10 },
    { m: 3.45, t: 'Hard', step: 11 },
    { m: 8.90, t: 'Hardcore', step: 12 },
  ]

  const [list, setList] = useState(
    base.map((item, i) => ({
      id: i + 1,
      mult: item.m,
      type: item.t,
      step: item.step,
      created: `04 Aug 2025 01:${String(4 + i).padStart(2, '0')} PM`,
    }))
  )

  const [edit, setEdit] = useState(null)
  const [add, setAdd] = useState(false)
  const [activeTab, setActiveTab] = useState('ALL')

  // Filter list by selected difficulty tab
  const filteredList = activeTab === 'ALL' ? list : list.filter((x) => x.type === activeTab)

  const listCols = [
    {
      key: 'id',
      label: 'ID',
      render: (r) => (
        <span className="font-mono text-xs font-bold text-slate-500">#{String(r.id).padStart(3, '0')}</span>
      ),
    },
    {
      key: 'step',
      label: 'Road Step',
      render: (r) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 font-mono text-xs font-bold text-slate-700">
          Step {r.step || r.id}
        </span>
      ),
    },
    {
      key: 'mult',
      label: 'Step Multiplier',
      render: (r) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-mono font-black text-xs shadow-xs">
          <Zap size={12} fill="currentColor" />
          {Number(r.mult).toFixed(2)}x
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Difficulty Mode',
      render: (r) => <TypeBadge t={r.type} />,
    },
    {
      key: 'created',
      label: 'Last Modified',
      render: (r) => (
        <span className="text-xs text-slate-500 font-medium">{r.created}</span>
      ),
    },
    {
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-2xs"
            onClick={() => setEdit({ kind: 'list', row: r })}
            title="Edit Multiplier"
          >
            <Pencil size={14} />
          </button>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition shadow-2xs"
            onClick={() => {
              setList(list.filter((x) => x.id !== r.id))
              toast('Multiplier step deleted')
            }}
            title="Delete Multiplier"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Premium Gradient Banner */}
      <PageBanner title="Chicken Road Game" icon={Flame} crumbs={crumbs('Multiplier')}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1 text-xs font-bold text-amber-200 backdrop-blur-xs">
            <Flame size={13} className="text-amber-400 fill-amber-400 animate-pulse" />
            Max Jackpot: 2.51M Multiplier
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-200">
            <ShieldCheck size={13} /> Provably Fair Engine
          </span>
        </div>
      </PageBanner>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Active Steps</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">{list.length} Levels</h3>
            <p className="text-[11px] text-emerald-600 mt-0.5 font-medium flex items-center gap-1">
              <TrendingUp size={11} /> Configured across 4 modes
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-xs">
            <Database size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Default Safe RTP</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">97.00%</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">House edge: 3.00%</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-xs">
            <ShieldCheck size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Top Single Win</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">2,516,310.50x</h3>
            <p className="text-[11px] text-rose-500 mt-0.5 font-bold">Hardcore step 24 cap</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shadow-xs">
            <Flame size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Min Step Entry</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">1.02x Multiplier</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Easy road step #1</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shadow-xs">
            <Zap size={18} />
          </div>
        </div>
      </div>

      {/* 4 ROAST MULTIPLIER CARDS (TIGHT, HIGH-END REDESIGN) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Flame size={18} className="text-amber-500 fill-amber-500" />
              Roast Multiplier Tier Configuration
            </h2>
            <p className="text-xs text-slate-500">
              Final roast multiplier payouts executed when the chicken clears all obstacles in the selected lane.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 font-mono">4 Difficulty Classes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {roast.map((tier) => {
            const cfg = DIFFICULTY_CONFIG[tier.type] || DIFFICULTY_CONFIG.Easy
            return (
              <div
                key={tier.id}
                className={`group relative overflow-hidden rounded-2xl bg-white border ${cfg.cardBorder} p-4 shadow-xs hover:shadow-md transition-all`}
              >
                {/* Background decorative tint */}
                <div
                  className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-xl pointer-events-none"
                  style={{ backgroundColor: cfg.accent }}
                />

                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black tracking-wide ${cfg.pill}`}
                  >
                    {tier.type}
                  </span>
                  <button
                    onClick={() => setEdit({ kind: 'roast', row: tier })}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition"
                    title={`Edit ${tier.type} Roast Multiplier`}
                  >
                    <Pencil size={13} />
                  </button>
                </div>

                <div className="mt-3.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Max Roast Multiplier
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="font-mono text-2xl font-black text-slate-900 tracking-tight">
                      {tier.value}
                    </span>
                    <span className="font-black text-amber-500 text-base">x</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-slate-600">
                    <Target size={12} className="text-slate-400" />
                    24 Steps
                  </span>
                  <span className="font-mono text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    RTP {tier.rtp}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* MULTIPLIER STEP LIST TABLE WITH FILTER TABS */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-extrabold text-slate-900 flex items-center gap-2 text-base">
              <Database size={18} className="text-blue-600" />
              Road Multiplier Step Ladder
            </h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
              {filteredList.length} Steps
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Filter Tabs */}
            <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
              {['ALL', 'Easy', 'Medium', 'Hard', 'Hardcore'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    activeTab === tab
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
              onClick={() => setAdd(true)}
            >
              <Plus size={14} /> Add Multiplier Step
            </button>
          </div>
        </div>

        <DataTable
          columns={listCols}
          rows={filteredList}
          exportName="ChickenRoad_Multipliers"
          exportLabel="Export Multipliers"
          placeholder="Search by multiplier or difficulty..."
        />
      </div>

      {/* EDIT MODAL */}
      {edit && (
        <FormModal
          title={`Edit ${edit.kind === 'roast' ? `${edit.row.type} Roast Multiplier` : `Step #${edit.row.id}`}`}
          values={{ ...edit.row, mult: edit.row.mult ?? edit.row.value }}
          fields={
            edit.kind === 'roast'
              ? [
                  { key: 'value', label: 'Max Roast Multiplier Value', type: 'text' },
                  { key: 'rtp', label: 'Configured RTP % (e.g. 96.8%)', type: 'text' },
                ]
              : [
                  { key: 'mult', label: 'Step Multiplier (e.g. 1.25)', type: 'number' },
                  {
                    key: 'type',
                    label: 'Difficulty Mode',
                    options: ['Easy', 'Medium', 'Hard', 'Hardcore'],
                  },
                ]
          }
          onSave={(v) => {
            if (edit.kind === 'roast') {
              setRoast(
                roast.map((r) =>
                  r.id === edit.row.id
                    ? { ...r, value: v.value, rtp: v.rtp || r.rtp }
                    : r
                )
              )
              toast(`${edit.row.type} roast multiplier updated!`)
            } else {
              setList(
                list.map((r) =>
                  r.id === edit.row.id ? { ...r, mult: v.mult, type: v.type } : r
                )
              )
              toast('Multiplier step updated!')
            }
          }}
          onClose={() => setEdit(null)}
        />
      )}

      {/* ADD MULTIPLIER MODAL */}
      {add && (
        <FormModal
          title="Add New Multiplier Step"
          values={{ mult: '', type: 'Easy' }}
          saveLabel="Add Step"
          fields={[
            { key: 'mult', label: 'Step Multiplier Value', type: 'number' },
            {
              key: 'type',
              label: 'Difficulty Mode',
              options: ['Easy', 'Medium', 'Hard', 'Hardcore'],
            },
          ]}
          onSave={(v) => {
            const nextId = Math.max(0, ...list.map((l) => l.id)) + 1
            setList([
              ...list,
              {
                id: nextId,
                step: nextId,
                mult: Number(v.mult),
                type: v.type,
                created: new Date().toLocaleString('en-GB'),
              },
            ])
            toast('New multiplier step added successfully!')
          }}
          onClose={() => setAdd(false)}
        />
      )}

      {toastNode}
    </div>
  )
}

// ==========================================
// 2. CHICKEN BET HISTORY PAGE (REDESIGNED)
// ==========================================
export function ChickenBetHistory() {
  const [activeFilter, setActiveFilter] = useState('ALL')

  const rawRows = Array.from({ length: 101 }, (_, i) => {
    if (i === 0) {
      return {
        id: 1,
        user_id: 1012,
        name: 'VipPlayer_Rahul',
        amount: 500,
        win: 0,
        mult: 0,
        difficulty: 'Hard',
        stepsTaken: 7,
        result: 'Loss',
        at: '13 Oct 2026 03:22 PM',
      }
    }
    if (i === 1) {
      return {
        id: 2,
        user_id: 1008,
        name: 'LuckyStriker99',
        amount: 250,
        win: 402.5,
        mult: 1.61,
        difficulty: 'Easy',
        stepsTaken: 9,
        result: 'Win',
        at: '13 Oct 2026 03:18 PM',
      }
    }
    if (i === 2) {
      return {
        id: 3,
        user_id: 1045,
        name: 'DragonSlayer',
        amount: 100,
        win: 890,
        mult: 8.9,
        difficulty: 'Hardcore',
        stepsTaken: 12,
        result: 'Win',
        at: '13 Oct 2026 03:10 PM',
      }
    }
    const isWin = i % 3 === 0
    const diffs = ['Easy', 'Medium', 'Hard', 'Hardcore']
    const diff = diffs[i % 4]
    const betAmt = [10, 25, 50, 100, 250, 500][i % 6]
    const multiplier = isWin ? +(1.1 + (i % 8) * 0.45).toFixed(2) : 0
    return {
      id: i + 1,
      user_id: 1000 + i,
      name: `User_${1000 + i}`,
      amount: betAmt,
      win: isWin ? +(betAmt * multiplier).toFixed(2) : 0,
      mult: multiplier,
      difficulty: diff,
      stepsTaken: isWin ? (i % 15) + 3 : (i % 6) + 1,
      result: isWin ? 'Win' : 'Loss',
      at: '13 Oct 2026 02:45 PM',
    }
  })

  const [rows] = useState(rawRows)

  const filteredRows =
    activeFilter === 'ALL'
      ? rows
      : activeFilter === 'WIN'
      ? rows.filter((r) => r.result === 'Win')
      : rows.filter((r) => r.result === 'Loss')

  const totalWagered = rows.reduce((acc, r) => acc + r.amount, 0)
  const totalPayout = rows.reduce((acc, r) => acc + r.win, 0)
  const totalGGR = totalWagered - totalPayout

  const cols = [
    {
      key: 'id',
      label: 'Ticket #',
      render: (r) => (
        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          #CR-{String(r.id).padStart(4, '0')}
        </span>
      ),
    },
    {
      key: 'user_id',
      label: 'User UID',
      render: (r) => (
        <span className="font-mono text-xs font-bold text-slate-600">UID: {r.user_id}</span>
      ),
    },
    {
      key: 'name',
      label: 'Player',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-[10px]">
            {r.name.slice(0, 2).toUpperCase()}
          </div>
          <span className="font-bold text-slate-900 text-xs">{r.name}</span>
        </div>
      ),
    },
    {
      key: 'difficulty',
      label: 'Difficulty',
      render: (r) => <TypeBadge t={r.difficulty || 'Easy'} />,
    },
    {
      key: 'amount',
      label: 'Bet Wagered',
      render: (r) => (
        <span className="font-mono font-bold text-slate-900 text-xs">
          {money(r.amount)}
        </span>
      ),
    },
    {
      key: 'mult',
      label: 'Cashed Multiplier',
      render: (r) =>
        r.mult > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-400 text-slate-950 px-2 py-0.5 font-mono text-xs font-black shadow-2xs">
            <Zap size={11} fill="currentColor" /> {r.mult.toFixed(2)}x
          </span>
        ) : (
          <span className="font-mono text-xs text-slate-400 font-semibold">—</span>
        ),
    },
    {
      key: 'win',
      label: 'Payout Amount',
      render: (r) => (
        <span
          className={`font-mono font-black text-xs ${
            r.win > 0 ? 'text-emerald-600' : 'text-slate-400'
          }`}
        >
          {r.win > 0 ? money(r.win) : '₹0.00'}
        </span>
      ),
    },
    {
      key: 'result',
      label: 'Round Outcome',
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
            r.result === 'Win'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              r.result === 'Win' ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
          {r.result === 'Win' ? 'Cashed Out' : 'Fried / Loss'}
        </span>
      ),
    },
    {
      key: 'at',
      label: 'Timestamp',
      render: (r) => <span className="text-xs text-slate-500">{r.at}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <PageBanner title="Chicken Road User Bets" icon={Target} crumbs={crumbs('Bet History')}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-bold text-emerald-200">
            Realtime Audit Log
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
            {rows.length} Total Sessions
          </span>
        </div>
      </PageBanner>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Bet Volume</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">{money(totalWagered)}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Across {rows.length} chicken runs</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-xs">
            <Coins size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Payouts Won</p>
            <h3 className="text-xl font-bold text-emerald-600 mt-0.5 tracking-tight font-mono">{money(totalPayout)}</h3>
            <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">Player withdrawals settled</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-xs">
            <Award size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Platform Net Yield (GGR)</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">{money(totalGGR)}</h3>
            <p className="text-[11px] text-blue-600 mt-0.5 font-bold">House retention margin</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-xs">
            <BarChart3 size={18} />
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center justify-between px-1">
        <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
          {[
            { id: 'ALL', label: `All Bets (${rows.length})` },
            { id: 'WIN', label: `Wins (${rows.filter((r) => r.result === 'Win').length})` },
            { id: 'LOSS', label: `Fried / Loss (${rows.filter((r) => r.result === 'Loss').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                activeFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={cols}
        rows={filteredRows}
        unit="bets"
        exportName="ChickenRoad_BetHistory"
        exportLabel="Export Bets CSV"
        placeholder="Search by user, UID or ticket..."
      />
    </div>
  )
}

// ==========================================
// 3. CHICKEN BET VALUES PAGE (REDESIGNED)
// ==========================================
export function ChickenBetValues() {
  const [toast, toastNode] = useToast()
  const [rows, setRows] = useState([
    { id: 1, value: 5, popular: false, usageCount: '14.2K Bets' },
    { id: 2, value: 10, popular: true, usageCount: '89.4K Bets' },
    { id: 3, value: 25, popular: true, usageCount: '124.8K Bets' },
    { id: 4, value: 50, popular: true, usageCount: '215.1K Bets' },
    { id: 5, value: 100, popular: false, usageCount: '45.3K Bets' },
    { id: 6, value: 250, popular: false, usageCount: '18.9K Bets' },
  ])
  const [edit, setEdit] = useState(null)
  const [add, setAdd] = useState(false)

  const cols = [
    {
      key: 'id',
      label: 'Slot ID',
      render: (r) => (
        <span className="font-mono text-xs font-bold text-slate-500">#{String(r.id).padStart(2, '0')}</span>
      ),
    },
    {
      key: 'value',
      label: 'Bet Chip Value',
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-xs shadow-xs border border-amber-200">
            ₹
          </div>
          <span className="font-mono text-base font-black text-slate-900">
            {money(r.value)}
          </span>
          {r.popular && (
            <span className="rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5">
              Popular
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'usageCount',
      label: 'Player Selection Volume',
      render: (r) => (
        <span className="font-mono text-xs font-semibold text-slate-600">{r.usageCount}</span>
      ),
    },
    {
      label: 'Quick Preset',
      render: (r) => (
        <span className="text-xs text-slate-400">Available on in-game betting bar</span>
      ),
    },
    {
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-2xs"
            onClick={() => setEdit(r)}
            title="Edit Chip Value"
          >
            <Pencil size={15} />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-600 hover:text-white transition shadow-2xs"
            onClick={() => {
              setRows(rows.filter((x) => x.id !== r.id))
              toast('Bet value chip removed')
            }}
            title="Delete Chip"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageBanner title="Bet Value Chip Presets" icon={Star} crumbs={crumbs('Bet Values')}>
        <button
          onClick={() => setAdd(true)}
          className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-blue-600 shadow-md hover:bg-blue-50 transition"
        >
          <Plus size={15} /> Add New Chip
        </button>
      </PageBanner>

      {/* Visual Chips Showcase Bar */}
      <div className="card bg-gradient-to-r from-slate-900 via-[#101726] to-slate-900 p-5 rounded-2xl border border-slate-800 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <Coins size={18} className="text-amber-400" />
              In-Game Player Chip Selector Preview
            </h3>
            <p className="text-xs text-slate-400">
              Chips rendered directly inside the Chicken Road betting interface for 1-click wagering.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full">
            Active Chips: {rows.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {rows.map((chip) => (
            <div
              key={chip.id}
              onClick={() => setEdit(chip)}
              className="cursor-pointer group flex items-center gap-2.5 rounded-2xl bg-white/5 border border-white/10 px-4 py-2.5 hover:bg-white/15 hover:border-amber-400/60 transition shadow-xs"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-xs shadow-md group-hover:scale-105 transition-transform">
                ₹
              </div>
              <div>
                <span className="text-sm font-black font-mono text-white block">
                  {chip.value}
                </span>
                <span className="text-[10px] text-slate-400 block">Preset Chip</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DataTable
        columns={cols}
        rows={rows}
        unit="chips"
        exportName="ChickenRoad_BetChips"
        exportLabel="Export Chips"
        placeholder="Search chip value..."
      />

      {edit && (
        <FormModal
          title={`Edit Bet Chip #${edit.id}`}
          values={edit}
          fields={[{ key: 'value', label: 'Chip Value (₹ INR)', type: 'number' }]}
          onSave={(v) => {
            setRows(rows.map((r) => (r.id === edit.id ? { ...r, value: +v.value } : r)))
            toast('Chip value updated successfully!')
          }}
          onClose={() => setEdit(null)}
        />
      )}

      {add && (
        <FormModal
          title="Add New Bet Chip"
          values={{ value: '' }}
          saveLabel="Add Chip"
          fields={[{ key: 'value', label: 'Chip Value (₹ INR)', type: 'number' }]}
          onSave={(v) => {
            const nextId = Math.max(0, ...rows.map((r) => r.id)) + 1
            setRows([
              ...rows,
              {
                id: nextId,
                value: +v.value,
                popular: false,
                usageCount: '0 Bets',
              },
            ])
            toast('New bet chip added!')
          }}
          onClose={() => setAdd(false)}
        />
      )}

      {toastNode}
    </div>
  )
}

// ==========================================
// 4. CHICKEN AMOUNT SETUP PAGE (REDESIGNED)
// ==========================================
export function ChickenAmountSetup() {
  const [toast, toastNode] = useToast()
  const [rows, setRows] = useState([
    {
      id: 1,
      keyName: 'min_bet_amount',
      title: 'Minimum Bet Stake',
      desc: 'Smallest wager allowed per chicken step run',
      value: 5,
      unit: '₹',
      icon: DollarSign,
      category: 'Wager Limits',
    },
    {
      id: 2,
      keyName: 'max_bet_amount',
      title: 'Maximum Bet Stake',
      desc: 'Highest single wager ceiling per round to protect liability',
      value: 50,
      unit: '₹',
      icon: ShieldCheck,
      category: 'Wager Limits',
    },
    {
      id: 3,
      keyName: 'First Recharge',
      title: 'First Recharge Bonus Entry',
      desc: 'Minimum deposit required to unlock special chicken roads',
      value: 500,
      unit: '₹',
      icon: Sparkles,
      category: 'Promotional Gate',
    },
    {
      id: 4,
      keyName: 'min_win',
      title: 'Minimum Win Guarantee',
      desc: 'Lowest cashout threshold possible on road completion',
      value: 50,
      unit: '₹',
      icon: Award,
      category: 'Payout Rules',
    },
    {
      id: 5,
      keyName: 'max_win',
      title: 'Maximum Win Cap Per Round',
      desc: 'Hard ceiling payout per ticket before auto-cashout',
      value: 500,
      unit: '₹',
      icon: Target,
      category: 'Payout Rules',
    },
  ])

  const handleUpdate = (id, keyName) => {
    toast(`${keyName} successfully updated and applied!`)
  }

  const handleSaveAll = () => {
    toast('All Chicken Road parameters saved to live engine!')
  }

  return (
    <div className="space-y-6">
      <PageBanner title="Chicken Road Engine Configuration" icon={SlidersHorizontal} crumbs={crumbs('Amount Setup')}>
        <button
          onClick={handleSaveAll}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:from-emerald-600 hover:to-teal-700 transition"
        >
          <Save size={15} /> Save All Engine Settings
        </button>
      </PageBanner>

      {/* Main Settings Panel */}
      <div className="card bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-xs">
              <SlidersHorizontal size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Game Limits & Risk Governance</h3>
              <p className="text-xs text-slate-500">
                Configure threshold constraints, safety boundaries, and jackpot payout caps.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={13} /> Engine Active · Realtime Sync
          </span>
        </div>

        {/* Setting Rows Grid */}
        <div className="space-y-3.5">
          {rows.map((row) => {
            const Icon = row.icon || SlidersHorizontal
            return (
              <div
                key={row.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs mt-0.5">
                    <Icon size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-slate-900">{row.title}</h4>
                      <span className="font-mono text-[10px] bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded font-bold">
                        {row.keyName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{row.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 sm:shrink-0 self-end sm:self-center">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                      {row.unit}
                    </span>
                    <input
                      type="number"
                      className="input !pl-7 !w-36 font-mono font-black text-sm text-slate-900 bg-white"
                      value={row.value}
                      onChange={(e) =>
                        setRows(
                          rows.map((x) =>
                            x.id === row.id ? { ...x, value: e.target.value } : x
                          )
                        )
                      }
                    />
                  </div>
                  <button
                    className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
                    onClick={() => handleUpdate(row.id, row.keyName)}
                  >
                    <Save size={13} /> Update
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {toastNode}
    </div>
  )
}
