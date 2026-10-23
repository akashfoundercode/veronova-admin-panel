import { useState, useEffect, useRef } from 'react'
import {
  Plane, Crown, Users, BarChart3, User, Gamepad2, FileText,
  Sliders, Zap, ShieldAlert, RefreshCw, Maximize2, Smartphone,
  CheckCircle2, AlertTriangle, ArrowUpRight, FileSpreadsheet,
  Settings, Play, Pause, Flame, Radio
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, money, useToast } from '@/components/ui'
import { aviatorSocket } from '@/games/skyrush/src/services/aviatorSocket'
import { apiRequest } from '@/utils/apiClient'
import { API_ENDPOINTS } from '@/constants/api'
import { SOCKET_CONFIG } from '@/constants/socketConfig'

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
  const [bets, setBets] = useState(SEED_BETS)
  const [periodNo, setPeriodNo] = useState(1134892)
  const [usersPlaying, setUsersPlaying] = useState(48)
  const [targetCrash, setTargetCrash] = useState('2.50')
  const [isManualOverride, setIsManualOverride] = useState(false)
  const [rtpTarget, setRtpTarget] = useState('96')
  const [gamePaused, setGamePaused] = useState(false)
  const [isInteractive, setIsInteractive] = useState(false)
  const [iframeKey, setIframeKey] = useState(1)
  const [socketConnected, setSocketConnected] = useState(aviatorSocket.isConnected)
  const [liveSocketPacket, setLiveSocketPacket] = useState(null)
  const [telemetryData, setTelemetryData] = useState(null)
  const [iframeGameState, setIframeGameState] = useState('COUNTDOWN')
  const [isCrashing, setIsCrashing] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const iframeRef = useRef(null)
  const containerRef = useRef(null)
  const liveFlightMultiplierRef = useRef(1.0)

  const [toast, node] = useToast()

  // 1. Fetch live telemetry (/admin/aviator/telemetry) per round
  const fetchTelemetry = async (roundNum) => {
    try {
      const activeRound = roundNum || periodNo
      const queryStr = activeRound ? `?period_no=${activeRound}` : ''
      const endpoints = [
        API_ENDPOINTS.aviatorTelemetry ? `${API_ENDPOINTS.aviatorTelemetry}${queryStr}` : null,
        API_ENDPOINTS.AVIATOR_TELEMETRY_PROXY ? `${API_ENDPOINTS.AVIATOR_TELEMETRY_PROXY}${queryStr}` : null,
        `/admin/aviator/telemetry${queryStr}`,
        `/api/admin/aviator/telemetry${queryStr}`,
        `/api/admin/aviator${queryStr}`,
      ]
      let json = null
      for (const ep of endpoints) {
        if (!ep) continue
        try {
          json = await apiRequest(ep, { method: 'GET' })
          if (json) break
        } catch {}
      }
      const data = json?.data || json
      if (data && typeof data === 'object') {
        setTelemetryData(data)
        if (data.period_no || data.period) setPeriodNo(data.period_no || data.period)
        if (data.players_online || data.playersOnline) setUsersPlaying(data.players_online || data.playersOnline)
      }
    } catch (err) {
      console.warn('[Aviator] Could not load telemetry:', err)
    }
  }

  // 2. Fetch drop history (/admin/aviator/drops)
  const fetchDrops = async () => {
    try {
      const endpoints = [
        API_ENDPOINTS.aviatorDrops,
        API_ENDPOINTS.AVIATOR_DROPS_PROXY,
        '/admin/aviator/drops',
        '/api/admin/aviator/drops',
      ]
      let json = null
      for (const ep of endpoints) {
        if (!ep) continue
        try {
          json = await apiRequest(ep, { method: 'GET' })
          if (json) break
        } catch {}
      }
      const rawList = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.drops)
        ? json.drops
        : Array.isArray(json)
        ? json
        : null

      if (rawList && rawList.length > 0) {
        const normalized = rawList.map((item, idx) => {
          const mult = Number(item.crash || item.crash_point || item.multiplier || item.n || 1.0)
          return {
            id: item.id || idx + 1,
            round: item.round || item.period_no || item.period || 1028000 + idx,
            crash: typeof item.crash === 'string' && item.crash.includes('x') ? item.crash : `${mult.toFixed(2)}x`,
            n: mult,
            pool: Number(item.pool || item.total_bet || item.total_pool || 45000),
            hash: item.hash || item.sha256 || 'e3b0c44298fc1c149afbf4c8996fb924',
            at: item.at || item.created_at || item.time || 'Just now',
          }
        })
        setDrops(normalized)
        const mults = normalized.slice(0, 15).map((d) => d.n).filter((n) => !isNaN(n) && n > 0)
        if (mults.length > 0) setMultipliers(mults)
      }
    } catch (err) {
      console.warn('[Aviator] Could not load drops:', err)
    }
  }

  // 3. Fetch user bets history (/admin/aviator)
  const fetchBets = async () => {
    try {
      const endpoints = [
        API_ENDPOINTS.aviator,
        API_ENDPOINTS.AVIATOR_BETS_PROXY,
        '/admin/aviator',
        '/api/admin/aviator',
      ]
      let json = null
      for (const ep of endpoints) {
        if (!ep) continue
        try {
          json = await apiRequest(ep, { method: 'GET' })
          if (json) break
        } catch {}
      }
      const rawList = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.bets)
        ? json.bets
        : Array.isArray(json)
        ? json
        : null

      if (rawList && rawList.length > 0) {
        const normalized = rawList.map((item, idx) => {
          const amount = Number(item.amount || item.bet_amount || item.bet || 100)
          const payout = Number(item.payout || item.win_amount || item.win || 0)
          const cashVal = item.cash || item.cashed_out || item.cashed_at || (payout > 0 ? `${(payout / (amount || 1)).toFixed(2)}x` : '—')
          const status = item.status || (payout > 0 ? 'Won' : 'Crashed')
          return {
            id: item.id || idx + 1,
            user: item.user || item.username || item.player_name || `Player_${item.id || idx + 1}`,
            user_id: item.user_id || item.uid || item.player_id || `VN_${10000 + idx}`,
            amount,
            autoCash: item.autoCash || item.auto_cashout || item.target || '—',
            cash: typeof cashVal === 'number' ? `${cashVal.toFixed(2)}x` : cashVal,
            payout,
            status: String(status).toLowerCase() === 'won' || String(status).toLowerCase() === 'win' ? 'Won' : 'Crashed',
          }
        })
        setBets(normalized)
      }
    } catch (err) {
      console.warn('[Aviator] Could not load bets:', err)
    }
  }

  const loadAllBackendData = async () => {
    setIsSyncing(true)
    await Promise.allSettled([fetchTelemetry(), fetchDrops(), fetchBets()])
    setIsSyncing(false)
  }

  // Periodic automatic sync with backend endpoints
  useEffect(() => {
    let active = true
    loadAllBackendData()
    const timer = setInterval(() => {
      if (active) {
        fetchTelemetry()
        fetchDrops()
        fetchBets()
      }
    }, 10000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [])

  // Subscribe to live socket service (https://fcsocket.site | demobdg_aviator) & iframe bridge
  useEffect(() => {
    const handlePacket = (packet) => {
      if (!packet) return
      setLiveSocketPacket(packet)
      setSocketConnected(true)
      if (packet.period) {
        setPeriodNo((prev) => {
          if (prev !== packet.period) {
            fetchTelemetry(packet.period)
          }
          return packet.period
        })
      }
      if (packet.multiplier && packet.multiplier >= 1.0) {
        liveFlightMultiplierRef.current = Number(packet.multiplier)
      }
      if (packet.crashPoint && packet.state === 'CRASHED') {
        const crashVal = Number(packet.crashPoint).toFixed(2)
        setMultipliers((prev) => [parseFloat(crashVal), ...prev.slice(0, 14)])
      }
    }

    const unsubscribe = aviatorSocket.subscribe((event) => {
      if (event.type === 'CONNECTION_CHANGE') {
        setSocketConnected(Boolean(event.connected))
      } else if (event.type === 'SOCKET_PACKET' && event.packet) {
        handlePacket(event.packet)
      }
    })

    const handleWindowMsg = (e) => {
      if (e.data && e.data.type === 'PARENT_SCROLL') {
        const delta = Number(e.data.deltaY) || 0
        if (!delta) return
        const main = document.querySelector('main')
        const scrollContainer = main?.parentElement || document.scrollingElement || document.documentElement || document.body
        if (scrollContainer) {
          scrollContainer.scrollTop += delta
        }
      } else if (e.data && e.data.type === 'AVIATOR_SOCKET_PACKET' && e.data.packet) {
        handlePacket(e.data.packet)
      } else if (e.data && e.data.type === 'GAME_STATE_UPDATE') {
        if (e.data.gameState) setIframeGameState(e.data.gameState)
        if (e.data.multiplier) liveFlightMultiplierRef.current = Number(e.data.multiplier)
      }
    }

    window.addEventListener('message', handleWindowMsg)
    return () => {
      unsubscribe()
      window.removeEventListener('message', handleWindowMsg)
    }
  }, [])

  const handleApplyNextCrash = (val) => {
    const num = parseFloat(val || targetCrash)
    if (isNaN(num) || num < 1.01) {
      toast('Please enter a valid multiplier (min 1.01x)')
      return
    }
    setTargetCrash(num.toFixed(2))
    setIsManualOverride(true)
    aviatorSocket.setTargetCrash(num.toFixed(2))
    toast(`Next round locked at ${num.toFixed(2)}x via socket`)
  }

  const handleForceCrashNow = () => {
    if (isCrashing) return
    const isFlying =
      liveSocketPacket?.status === 1 ||
      liveSocketPacket?.state === 'FLYING' ||
      iframeGameState === 'FLYING'

    if (!isFlying) {
      toast('Plane is not flying right now!')
      return
    }

    // Immediate visual response
    setIsCrashing(true)
    setTimeout(() => setIsCrashing(false), 1200)

    // Note down the exact live flying timer from demobdg_aviator socket right now!
    const liveMult =
      liveFlightMultiplierRef.current ||
      (liveSocketPacket?.multiplier ? Number(liveSocketPacket.multiplier) : null) ||
      (aviatorSocket.liveFlyingMultiplier ? Number(aviatorSocket.liveFlyingMultiplier) : null) ||
      1.00
    const exactCrash = Math.max(1.0, +(Number(liveMult) || 1.0).toFixed(2))

    // Send force crash across socket connection with the exact live flying timer
    aviatorSocket.forceCrash(exactCrash)

    const newDrops = [
      {
        id: drops.length + 1,
        round: periodNo,
        crash: `${exactCrash.toFixed(2)}x`,
        n: exactCrash,
        at: 'Just now',
        hash: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        pool: Math.floor(40000 + Math.random() * 30000),
      },
      ...drops,
    ]
    setDrops(newDrops)
    setMultipliers([exactCrash, ...multipliers.slice(0, 14)])
    setIsManualOverride(false)
    setIframeGameState('CRASHED')

    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'FORCE_CRASH', crashPoint: exactCrash }, '*')
    }

    setLiveSocketPacket((prev) => ({
      ...prev,
      state: 'CRASHED',
      status: 2,
      multiplier: exactCrash,
      crashPoint: exactCrash,
    }))

    toast(`💥 Plane Force Crashed at ${exactCrash.toFixed(2)}x!`)
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

  let resolvedFlightState = 'COUNTDOWN'
  if (isCrashing) {
    resolvedFlightState = 'CRASHING'
  } else if (liveSocketPacket?.status === 1 || liveSocketPacket?.state === 'FLYING' || iframeGameState === 'FLYING') {
    resolvedFlightState = 'FLYING'
  } else if (liveSocketPacket?.status === 2 || liveSocketPacket?.state === 'CRASHED' || iframeGameState === 'CRASHED') {
    resolvedFlightState = 'CRASHED'
  } else {
    resolvedFlightState = 'COUNTDOWN'
  }

  return (
    <div className="space-y-5">
      {/* Page Banner with Live Badges */}
      <PageBanner
        title="Aviator Game Telemetry & Control"
        icon={Plane}
        crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Games' }, { label: 'Aviator' }]}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-200 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            Live Flight Active
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-300 px-3.5 py-1.5 text-xs font-bold text-slate-800 shadow-xs">
            <Smartphone size={13} className="text-blue-600" /> Landscape Format
          </span>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-xs ${
            socketConnected
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
              : 'bg-amber-50 border border-amber-300 text-amber-800'
          }`}>
            <Radio size={13} className={socketConnected ? 'animate-pulse text-emerald-600' : 'text-amber-600'} />
            {socketConnected ? `Live Socket: ${SOCKET_CONFIG.AVIATOR.EVENT_NAME}` : `Connecting: ${SOCKET_CONFIG.AVIATOR.URL}`}
          </span>
          <button
            type="button"
            onClick={() => {
              loadAllBackendData()
              toast('Syncing Aviator telemetry, drops & bets from backend...')
            }}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Refresh from /admin/aviator/telemetry, /admin/aviator/drops, and /admin/aviator"
          >
            <RefreshCw size={12} className={isSyncing ? 'animate-spin text-blue-400' : 'text-slate-400'} />
            {isSyncing ? 'Syncing...' : 'Sync Data'}
          </button>
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
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${socketConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${socketConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider text-white">
              Live Aviator Simulation
            </span>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-slate-700/80">
              Round #{periodNo}
            </span>
            <span className={`rounded px-2 py-0.5 text-[10px] font-bold border hidden sm:inline-flex items-center gap-1 ${
              socketConnected 
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60' 
                : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
            }`}>
              <Radio size={10} className={socketConnected ? 'animate-pulse text-emerald-400' : 'text-amber-400'} />
              {socketConnected ? SOCKET_CONFIG.AVIATOR.URL.replace(/^https?:\/\//, '') : 'connecting...'}
            </span>
            {liveSocketPacket?.time !== null && liveSocketPacket?.time !== undefined && (
              <span className="rounded bg-blue-950/80 text-blue-300 px-2 py-0.5 text-[10px] font-mono font-bold border border-blue-800/60">
                ⏱ {liveSocketPacket.time}s
              </span>
            )}
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

        {/* Live Admin Game Stats & Control Bar (Image Matching: TOTAL BET, TOTAL CASHOUT, ADMIN CRASHED, MULTIPLIER, TOTAL PLAYER) */}
        <div className="p-3 sm:p-3.5 bg-black border-t border-slate-800/90">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
            {/* 1. TOTAL BET */}
            <div className="bg-[#121316] border border-white/5 rounded-2xl py-3 px-3 sm:py-3.5 sm:px-4 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-[11px] sm:text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">
                TOTAL BET
              </span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                {liveSocketPacket?.totalBet
                  ? money(liveSocketPacket.totalBet)
                  : String(telemetryData?.period_no) === String(periodNo) && telemetryData?.total_bet
                  ? money(telemetryData.total_bet)
                  : '₹0.00'}
              </span>
            </div>

            {/* 2. TOTAL CASHOUT */}
            <div className="bg-[#121316] border border-white/5 rounded-2xl py-3 px-3 sm:py-3.5 sm:px-4 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-[11px] sm:text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">
                TOTAL CASHOUT
              </span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                {liveSocketPacket?.totalCashout
                  ? money(liveSocketPacket.totalCashout)
                  : String(telemetryData?.period_no) === String(periodNo) && telemetryData?.total_cashout
                  ? money(telemetryData.total_cashout)
                  : '₹0.00'}
              </span>
            </div>

            {/* 3. ADMIN BUTTON (RED FLYING / GREEN BETTING / CRIMSON CRASHED / AMBER CLICK) */}
            {resolvedFlightState === 'CRASHING' ? (
              <button
                type="button"
                className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 border-2 border-yellow-200 shadow-[0_0_25px_rgba(245,158,11,0.95)] ring-4 ring-yellow-400/60 scale-95 transition-all duration-150 rounded-2xl py-2.5 px-3 sm:py-3 sm:px-4 flex flex-col items-center justify-center text-center cursor-wait select-none"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                  <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-slate-950/90">
                    ADMIN
                  </span>
                </div>
                <span className="text-base sm:text-lg font-black text-slate-950 tracking-wider uppercase">
                  CRASHING...
                </span>
              </button>
            ) : resolvedFlightState === 'FLYING' ? (
              <button
                type="button"
                onClick={handleForceCrashNow}
                className="bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 active:scale-95 transition-all duration-150 rounded-2xl py-2.5 px-3 sm:py-3 sm:px-4 flex flex-col items-center justify-center text-center cursor-pointer border-2 border-red-300 shadow-[0_0_25px_rgba(239,68,68,0.75)] ring-4 ring-red-500/35 animate-pulse select-none group"
                title="Click to instantly crash flying plane!"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span className="text-[10px] sm:text-[11px] font-black text-white/95 tracking-wider uppercase">
                    ADMIN
                  </span>
                </div>
                <span className="text-base sm:text-lg font-black text-white tracking-wider uppercase drop-shadow-md">
                  CRASH NOW
                </span>
              </button>
            ) : resolvedFlightState === 'CRASHED' ? (
              <button
                type="button"
                onClick={() => {
                  toast('Round already crashed! Next round starting shortly...')
                }}
                className="bg-gradient-to-r from-rose-950 via-red-900 to-stone-900 hover:bg-red-900 active:scale-95 transition-all duration-150 rounded-2xl py-2.5 px-3 sm:py-3 sm:px-4 flex flex-col items-center justify-center text-center cursor-pointer border-2 border-red-700/80 shadow-[0_0_15px_rgba(225,29,72,0.35)] select-none group"
                title="Plane Crashed"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-[10px] sm:text-[11px] font-black text-red-300 tracking-wider uppercase">
                    ADMIN
                  </span>
                </div>
                <span className="text-base sm:text-lg font-black text-red-100 tracking-wider uppercase drop-shadow-md">
                  CRASHED
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  toast('Plane is on runway / betting phase! Waiting for takeoff to crash.')
                }}
                className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:to-green-500 active:scale-95 transition-all duration-150 rounded-2xl py-2.5 px-3 sm:py-3 sm:px-4 flex flex-col items-center justify-center text-center cursor-pointer border-2 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] select-none group"
                title="Betting Phase / Plane on Runway"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
                  <span className="text-[10px] sm:text-[11px] font-black text-emerald-100 tracking-wider uppercase">
                    ADMIN
                  </span>
                </div>
                <span className="text-base sm:text-lg font-black text-white tracking-wider uppercase drop-shadow-md">
                  BET TIME
                </span>
              </button>
            )}

            {/* 4. MULTIPLIER */}
            <div className="bg-[#121316] border border-white/5 rounded-2xl py-3 px-3 sm:py-3.5 sm:px-4 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-[11px] sm:text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">
                MULTIPLIER
              </span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                {liveSocketPacket?.state === 'FLYING' && liveSocketPacket?.multiplier
                  ? `${Number(liveSocketPacket.multiplier).toFixed(2)}x`
                  : '₹0.00'}
              </span>
            </div>

            {/* 5. TOTAL PLAYER */}
            <div className="col-span-2 sm:col-span-1 bg-[#121316] border border-white/5 rounded-2xl py-3 px-3 sm:py-3.5 sm:px-4 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-[11px] sm:text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">
                TOTAL PLAYER
              </span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                {liveSocketPacket?.totalPlayer || usersPlaying || 0}
              </span>
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
