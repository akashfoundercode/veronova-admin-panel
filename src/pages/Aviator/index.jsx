import { useState, useEffect, useRef } from 'react'
import {
  Plane, Crown, Users, BarChart3, User, Gamepad2, FileText,
  Sliders, Zap, ShieldAlert, RefreshCw, Maximize2, Smartphone,
  CheckCircle2, AlertTriangle, ArrowUpRight, FileSpreadsheet,
  Settings, Play, Pause, Flame
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, money, useToast } from '@/components/ui'

const INITIAL_MULTIPLIERS = [2.48, 1.15, 1.21, 29.58, 1.65, 2.0, 1.27, 1.11, 1.13, 1.18, 1.52, 1.26, 1.14, 3.42, 1.08]

const chipClass = (m) => {
  if (m >= 10) return 'bg-blue-600 text-white font-extrabold shadow-xs shadow-blue-500/30'
  if (m >= 2) return 'bg-rose-500 text-white font-bold'
  if (m >= 1.5) return 'bg-purple-600 text-white font-semibold'
  return 'bg-slate-800 text-slate-300 font-medium'
}

const SEED_DROPS = [
  { id: 65, round: 1028080, crash: '3.42x', n: 3.42, at: 'Just now', hash: 'e3b0c44298fc1c149afbf4c8996fb924', pool: 48500 },
  { id: 64, round: 1028079, crash: '1.08x', n: 1.08, at: '1 min ago', hash: '8f434346648f6b96df89dda901c5176b', pool: 52100 },
  { id: 63, round: 1028078, crash: '2.48x', n: 2.48, at: '3 mins ago', hash: '2c26b46b68ffc68ff99b453c1d304134', pool: 61200 },
  { id: 62, round: 1027923, crash: '1.15x', n: 1.15, at: '5 mins ago', hash: 'fcde2b2edba56bf4086867210e30325f', pool: 38900 },
  { id: 61, round: 1024473, crash: '1.21x', n: 1.21, at: '8 mins ago', hash: '05e3f3ff9b1f2982d6b38c290c01a91d', pool: 44300 },
  { id: 60, round: 1019727, crash: '29.58x', n: 29.58, at: '12 mins ago', hash: 'e499d34349387d8a6df8f73a3ff646ff', pool: 92400 },
  { id: 59, round: 1019001, crash: '1.65x', n: 1.65, at: '15 mins ago', hash: '5e884898da28047151d0e56f8dc62927', pool: 53100 },
  { id: 58, round: 1018442, crash: '2.00x', n: 2.00, at: '18 mins ago', hash: '4b227777d4dd1fc61c6f884f48641d02', pool: 47800 },
]

const SEED_BETS = [
  { id: 1, user: 'Vikram_R', user_id: 'VN_78291', amount: 500, autoCash: '2.00x', cash: '2.48x', payout: 1240, status: 'Won' },
  { id: 2, user: 'Amit_K', user_id: 'VN_99214', amount: 1200, autoCash: '1.50x', cash: '1.50x', payout: 1800, status: 'Won' },
  { id: 3, user: 'Rahul_S', user_id: 'VN_44102', amount: 250, autoCash: '3.00x', cash: '—', payout: 0, status: 'Crashed' },
  { id: 4, user: 'Priya_M', user_id: 'VN_12890', amount: 2000, autoCash: '1.20x', cash: '1.20x', payout: 2400, status: 'Won' },
  { id: 5, user: 'Deepak_V', user_id: 'VN_88201', amount: 100, autoCash: '5.00x', cash: '—', payout: 0, status: 'Crashed' },
  { id: 6, user: 'Sneha_J', user_id: 'VN_33190', amount: 3500, autoCash: '1.30x', cash: '1.30x', payout: 4550, status: 'Won' },
  { id: 7, user: 'Karan_T', user_id: 'VN_66210', amount: 800, autoCash: '—', cash: '1.92x', payout: 1536, status: 'Won' },
]

export default function Aviator() {
  const [tab, setTab] = useState('drops')
  const [multipliers, setMultipliers] = useState(INITIAL_MULTIPLIERS)
  const [drops, setDrops] = useState(SEED_DROPS)
  const [bets] = useState(SEED_BETS)
  const [periodNo, setPeriodNo] = useState(1134892)
  const [usersPlaying, setUsersPlaying] = useState(48)
  const [targetCrash, setTargetCrash] = useState('2.50')
  const [isManualOverride, setIsManualOverride] = useState(false)
  const [rtpTarget, setRtpTarget] = useState('96')
  const [gamePaused, setGamePaused] = useState(false)
  const [isInteractive, setIsInteractive] = useState(false)
  const [iframeKey, setIframeKey] = useState(1)
  const iframeRef = useRef(null)
  const containerRef = useRef(null)

  const [toast, node] = useToast()

  // Periodic simulated state to keep live telemetry vibrant
  useEffect(() => {
    const timer = setInterval(() => {
      setUsersPlaying((prev) => Math.max(30, Math.min(85, prev + Math.floor(Math.random() * 5) - 2)))
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  // Listen for scroll events from game iframe so cursor over game still scrolls the page smoothly
  useEffect(() => {
    const handleScrollMsg = (e) => {
      if (e.data && e.data.type === 'PARENT_SCROLL') {
        const delta = Number(e.data.deltaY) || 0
        if (!delta) return
        const main = document.querySelector('main')
        const scrollContainer = main?.parentElement || document.scrollingElement || document.documentElement || document.body
        if (scrollContainer) {
          scrollContainer.scrollTop += delta
        }
      }
    }
    window.addEventListener('message', handleScrollMsg)
    return () => window.removeEventListener('message', handleScrollMsg)
  }, [])

  const handleApplyNextCrash = (val) => {
    const num = parseFloat(val || targetCrash)
    if (isNaN(num) || num < 1.01) {
      toast('Please enter a valid multiplier (min 1.01x)')
      return
    }
    setTargetCrash(num.toFixed(2))
    setIsManualOverride(true)
    toast(`Next round locked at ${num.toFixed(2)}x`)
  }

  const handleForceCrashNow = () => {
    const currentCrash = (1.10 + Math.random() * 0.4).toFixed(2)
    const newDrops = [
      {
        id: drops.length + 1,
        round: periodNo,
        crash: `${currentCrash}x`,
        n: parseFloat(currentCrash),
        at: 'Just now',
        hash: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        pool: Math.floor(40000 + Math.random() * 30000),
      },
      ...drops,
    ]
    setDrops(newDrops)
    setMultipliers([parseFloat(currentCrash), ...multipliers.slice(0, 14)])
    setPeriodNo((p) => p + 1)
    setIsManualOverride(false)
    toast(`⚡ Emergency Crash Triggered at ${currentCrash}x! Round ended.`)
  }

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {})
    } else {
      document.exitFullscreen?.().catch(() => {})
    }
  }

  const reloadGame = () => {
    setIframeKey((k) => k + 1)
    toast('Flight engine reloaded')
  }

  const dropCols = [
    { key: 'id', label: '#ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    {
      key: 'round',
      label: 'Round ID',
      render: (r) => (
        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {r.round}
        </span>
      ),
    },
    {
      key: 'crash',
      label: 'Crash Point',
      render: (r) => (
        <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-black ${
          r.n >= 10 ? 'bg-blue-600 text-white' : r.n >= 2 ? 'bg-rose-600 text-white' : r.n >= 1.5 ? 'bg-purple-600 text-white' : 'bg-slate-700 text-white'
        }`}>
          {r.crash}
        </span>
      ),
    },
    {
      key: 'pool',
      label: 'Total Bet Pool',
      render: (r) => <span className="font-mono text-xs font-bold text-slate-800">{money(r.pool)}</span>,
    },
    {
      key: 'hash',
      label: 'SHA-256 Hash',
      render: (r) => <span className="font-mono text-[11px] text-slate-400 truncate max-w-[140px] block">{r.hash}</span>,
    },
    { key: 'at', label: 'Crashed At', render: (r) => <span className="text-xs text-slate-500 font-medium">{r.at}</span> },
  ]

  const betCols = [
    { key: 'id', label: '#ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    {
      key: 'user',
      label: 'Player Details',
      render: (r) => (
        <div>
          <span className="font-bold text-xs text-slate-900 block">{r.user}</span>
          <span className="font-mono text-[10px] text-slate-500 font-semibold">{r.user_id}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Bet Wagered',
      render: (r) => <span className="font-mono text-xs font-bold text-slate-900">{money(r.amount)}</span>,
    },
    {
      key: 'autoCash',
      label: 'Auto Target',
      render: (r) => <span className="font-mono text-xs font-semibold text-slate-600">{r.autoCash}</span>,
    },
    {
      key: 'cash',
      label: 'Cashed Out At',
      render: (r) => (
        <span className={`font-mono text-xs font-bold ${r.cash !== '—' ? 'text-emerald-600' : 'text-slate-400'}`}>
          {r.cash}
        </span>
      ),
    },
    {
      key: 'payout',
      label: 'Net Payout',
      render: (r) => (
        <span className={`font-mono text-xs font-extrabold ${r.payout > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
          {r.payout > 0 ? money(r.payout) : '₹0.00'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
          r.status === 'Won' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {r.status === 'Won' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
          {r.status}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      {/* Page Banner with Live Badges */}
      <PageBanner
        title="Aviator Game Telemetry & Control"
        icon={Plane}
        crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Games' }, { label: 'Aviator' }]}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-bold text-emerald-100 backdrop-blur-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Live Flight Active
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
            <Smartphone size={13} /> Landscape Format
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-200">
            Static Demo · No API
          </span>
        </div>
      </PageBanner>

      {/* Financial & Performance Stats (Uniform compact card design) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Admin Profit</p>
              <span className="rounded bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-1.5 py-0.2 border border-emerald-200">
                +12.4%
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {money(10683.15)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Net platform margin</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Crown size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total User Profit</p>
              <span className="rounded bg-pink-50 text-pink-700 text-[10px] font-extrabold px-1.5 py-0.2 border border-pink-200">
                +8.1%
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {money(1782.85)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Player cashed winnings</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
            <Users size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Today Admin Profit</p>
              <span className="rounded bg-slate-100 text-slate-600 text-[10px] font-extrabold px-1.5 py-0.2">
                0%
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {money(0)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Daily session revenue</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <BarChart3 size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Players</p>
              <span className="rounded bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-1.5 py-0.2 border border-emerald-200">
                Online
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {usersPlaying} Playing
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Current round wagerers</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <User size={18} />
          </div>
        </div>
      </div>

      {/* Recent Multipliers Stream */}
      <div className="card bg-[#0e121e] text-white p-3 rounded-xl border border-slate-800 shadow-sm flex items-center gap-3 overflow-x-auto">
        <div className="flex shrink-0 items-center gap-2 border-r border-slate-800 pr-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/30 text-blue-400">
            <Gamepad2 size={16} />
          </div>
          <div className="leading-tight">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Recent</span>
            <span className="text-xs font-bold text-white">Multipliers</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto py-0.5">
          {multipliers.map((m, i) => (
            <span
              key={i}
              className={`shrink-0 rounded-lg px-2.5 py-1 text-xs transition hover:scale-105 cursor-default ${chipClass(m)}`}
            >
              {typeof m === 'number' ? m.toFixed(2) : m}x
            </span>
          ))}
        </div>
      </div>

      {/* 1 Single Clean Game Card (No Nested Cards) */}
      <div ref={containerRef} className="card bg-[#0b0e17] rounded-xl border border-slate-800 shadow-md overflow-hidden">
        {/* Frame Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 border-b border-slate-800 bg-[#0e121e]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-white">
              Live Aviator Simulation
            </span>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700/80">
              Round #{periodNo}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsInteractive((v) => !v)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                isInteractive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
              }`}
              title={isInteractive ? 'Click to enable smooth page scroll' : 'Enable click interaction inside game'}
            >
              <span>{isInteractive ? '🎮 Interactive' : '📜 Scroll Mode'}</span>
            </button>

            <button
              onClick={reloadGame}
              className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white transition"
              title="Reload Game Engine"
            >
              <RefreshCw size={13} />
              <span className="hidden sm:inline">Reload</span>
            </button>

            <button
              onClick={handleToggleFullscreen}
              className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white transition"
              title="Fullscreen Mode"
            >
              <Maximize2 size={13} />
              <span className="hidden sm:inline">Fullscreen</span>
            </button>
          </div>
        </div>

        {/* The Game Iframe: pointer-events-none in default Scroll Mode ensures 100% smooth mouse wheel & touch scrolling! */}
        <div
          className="w-full bg-[#080b16] relative"
          onMouseLeave={() => setIsInteractive(false)}
          onWheel={(e) => {
            if (!isInteractive) {
              const main = document.querySelector('main')
              const scrollEl = main?.parentElement || document.scrollingElement || document.documentElement || document.body
              if (scrollEl) {
                scrollEl.scrollTop += e.deltaY
              }
            }
          }}
        >
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src="/aviator-game.html?embed=1&landscape=1"
            title="SkyRush Aviator Live Simulation"
            className={`block w-full border-0 select-none ${isInteractive ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{
              height: 'clamp(360px, 44vw, 450px)',
              minHeight: 340,
              maxHeight: 500,
            }}
          />
        </div>
      </div>

      {/* ADMIN CONTROL CONSOLE & CRASH INTERVENTION (All Previous Functionality & Buttons) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Next Crash Target Control */}
        <div className="card bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs lg:col-span-2 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Sliders size={16} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 tracking-tight">
                  Next Round Crash Multiplier Control
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Override server seed algorithm and target a predetermined crash point
                </p>
              </div>
            </div>

            {isManualOverride ? (
              <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
                <Flame size={12} className="text-amber-500" /> Manual Target Locked ({targetCrash}x)
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-xs font-semibold">
                Auto Provably Fair RNG
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[140px]">
              <input
                type="number"
                step="0.01"
                min="1.01"
                value={targetCrash}
                onChange={(e) => setTargetCrash(e.target.value)}
                placeholder="Target e.g. 2.50"
                className="input !font-mono !font-black !text-base !pr-10 !h-10 text-slate-900"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                X
              </span>
            </div>

            <button
              onClick={() => handleApplyNextCrash()}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition shrink-0"
            >
              <Zap size={14} /> Set Next Crash
            </button>

            <button
              onClick={() => {
                setIsManualOverride(false)
                toast('Reset to Provably Fair Auto RNG')
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition shrink-0"
            >
              Reset to Auto RNG
            </button>
          </div>

          {/* Quick Presets */}
          <div className="pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Quick Multiplier Presets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '1.10x Crash', val: '1.10' },
                { label: '1.30x Low', val: '1.30' },
                { label: '1.50x Safe', val: '1.50' },
                { label: '2.00x Double', val: '2.00' },
                { label: '3.50x Mid', val: '3.50' },
                { label: '5.00x High', val: '5.00' },
                { label: '10.00x Moonshot', val: '10.00' },
              ].map((p) => (
                <button
                  key={p.val}
                  onClick={() => handleApplyNextCrash(p.val)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Intervention & RTP Settings */}
        <div className="card bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <ShieldAlert size={16} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 tracking-tight">
                  Emergency Live Intervention
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">Realtime flight emergency controls</p>
              </div>
            </div>

            <div className="space-y-2 mt-3">
              <button
                onClick={handleForceCrashNow}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2.5 text-xs font-black text-white shadow-xs hover:from-rose-700 hover:to-red-700 transition"
              >
                <Zap size={14} /> Force Crash Round Now
              </button>

              <button
                onClick={() => {
                  setGamePaused((p) => !p)
                  toast(gamePaused ? 'Bets unpaused' : 'Bets quarantined & paused')
                }}
                className={`w-full flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition ${
                  gamePaused
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                {gamePaused ? <Play size={14} /> : <Pause size={14} />}
                <span>{gamePaused ? 'Resume Round Bets' : 'Pause New Round Bets'}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>Target RTP:</span>
              <div className="flex gap-1">
                {['94', '96', '97', '98'].map((rtp) => (
                  <button
                    key={rtp}
                    onClick={() => {
                      setRtpTarget(rtp)
                      toast(`System RTP target calibrated to ${rtp}%`)
                    }}
                    className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${
                      rtpTarget === rtp ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {rtp}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROUND OVERVIEW & LIVE MONITORING TABLES (Drop History & User Bets) */}
      <div className="card bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 tracking-tight text-base">
                Aviator Round Telemetry & Bets Overview
              </h3>
              <p className="text-xs text-slate-500">Monitor live bets, cashed out targets, and provably fair seeds</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-slate-700">
              Period No · <span className="font-mono text-blue-600 font-extrabold">#{periodNo}</span>
            </span>

            <span className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Players Online · <span className="font-mono font-extrabold">{usersPlaying}</span>
            </span>
          </div>
        </div>

        {/* Tab Switcher & Export */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setTab('drops')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                tab === 'drops'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Drop History</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${tab === 'drops' ? 'bg-blue-700 text-white' : 'bg-white text-slate-600'}`}>
                {drops.length}
              </span>
            </button>

            <button
              onClick={() => setTab('bets')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                tab === 'bets'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>User Bets</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${tab === 'bets' ? 'bg-blue-700 text-white' : 'bg-white text-slate-600'}`}>
                {bets.length}
              </span>
            </button>
          </div>

          <button
            onClick={() => exportCSV(tab === 'drops' ? 'aviator_drops_history' : 'aviator_user_bets', tab === 'drops' ? dropCols : betCols, tab === 'drops' ? drops : bets)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition"
          >
            <FileSpreadsheet size={14} /> Export to Excel
          </button>
        </div>

        {/* Data Table */}
        <DataTable
          columns={tab === 'drops' ? dropCols : betCols}
          rows={tab === 'drops' ? drops : bets}
          unit={tab === 'drops' ? 'rounds' : 'bets'}
          placeholder={tab === 'drops' ? 'Search round ID or hash...' : 'Search user or bet details...'}
        />
      </div>

      {node}
    </div>
  )
}
