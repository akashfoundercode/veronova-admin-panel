import { useState, useEffect, useMemo } from 'react'
import {
  Users,
  Wallet,
  BarChart2,
  TrendingDown,
  Layers,
  Clock,
  Radio,
  Cloud,
  Database,
  Search,
  Eye,
  Square,
  Play,
  Pause,
  Wrench,
  RotateCcw,
  XCircle,
  Zap,
  Building2,
  Trophy,
  Star,
  TrendingUp,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import { money, useToast, Modal } from '@/components/ui'
import {
  fetchStackTowerStats,
  fetchActivePlayers,
  fetchRecentRounds,
  triggerObstacleDrop,
  MOCK_ACTIVE_ROUNDS,
  STACK_TOWER_FLOOR_TABLE,
  PERFECT_BONUS_BY_MODE,
  FLOOR_PAYOUT_ROWS,
  FLOOR_INCREMENTS,
  getFloorMultiplier,
  calculateFloorPayout,
  resolveCurrentFloor,
  getFloorFromMultiplier,
} from './stackTowerService'
import { stackTowerSocket } from '@/services/stackTowerSocket'
import auth from '@/utils/auth'

/**
 * Standardize live player data from backend admin_join, player_joined, and active_players_update
 * Spec: [ { round_id, user_id, username, bet_amount, difficulty, level, multiplier, armed } ]
 */
export function formatLivePlayer(raw) {
  if (!raw) return null
  const userid = raw.user_id ?? raw.userid ?? raw.userId ?? raw.u_id ?? raw.id ?? 1
  const round_id = String(raw.round_id || raw.roundId || (userid ? `ST20261104-${userid}` : '')).trim()
  const username = raw.username || raw.user_name || (userid ? `User #${userid}` : 'Player')
  const mode = String(raw.difficulty || raw.mode || 'MEDIUM').toUpperCase()
  const bet_amount = Number(raw.bet_amount ?? raw.amount ?? raw.bet ?? 100)

  // Deduce exact current floor from multiplier or floor fields (never 1 floor ahead)
  const rawFloor = Number(raw.floor ?? raw.current_floor ?? raw.height ?? raw.current_height ?? raw.level ?? 0)
  const rawMult = Number(raw.multiplier ?? raw.mult ?? raw.odds ?? 0)
  const current_floor = resolveCurrentFloor(rawFloor, rawMult, mode)

  const perfectMult = getFloorMultiplier(current_floor, mode, true)
  const is_perfect = Boolean(
    raw.is_perfect ||
    raw.perfect ||
    raw.perfect_drop ||
    raw.isPerfect ||
    (rawMult > 1.01 && Math.abs(rawMult - perfectMult) < 0.05)
  )
  const multiplier = getFloorMultiplier(current_floor, mode, is_perfect)
  const payout = calculateFloorPayout(bet_amount, current_floor, mode, multiplier, is_perfect)
  const armed = Boolean(raw.armed)
  const rawStat = String(raw.status ?? '').toUpperCase()
  const isWon = raw.status === 1 || rawStat === 'WON' || rawStat === 'CASHOUT'
  const isLost = raw.status === 2 || rawStat === 'LOST' || rawStat === 'CRASHED'
  const status = armed ? 'Armed' : isWon ? 'Won' : isLost ? 'Lost' : 'Building'

  return {
    id: raw.id || round_id || `${userid}-${Date.now()}`,
    round_id,
    userid,
    username,
    mode,
    bet_amount,
    current_floor,
    multiplier,
    payout,
    is_perfect,
    armed,
    status,
    total_rounds: Number(raw.total_rounds || 1),
    total_win: Number(raw.total_win || 0),
    total_loss: Number(raw.total_loss || 0),
  }
}

export default function StackTowerAdmin() {
  const [toast, toastNode] = useToast()
  const currentUser = auth.getUser()

  // Live Data States - Initialized with active sample rounds so monitoring is immediately interactive
  const [players, setPlayers] = useState(() => (Array.isArray(MOCK_ACTIVE_ROUNDS) ? MOCK_ACTIVE_ROUNDS.map(formatLivePlayer) : []))
  const [history, setHistory] = useState([])
  const [statsData, setStatsData] = useState(null)
  const [apiOnline, setApiOnline] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Selection & Filters
  const [selectedPlayerId, setSelectedPlayerId] = useState(null)
  const [selectedRoundId, setSelectedRoundId] = useState(null)
  const [selectedRows, setSelectedRows] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [modeFilter, setModeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('Building')
  const [playersPage, setPlayersPage] = useState(1)
  const [playersPerPage, setPlayersPerPage] = useState(5)

  // Global Controls
  const [gameRunning, setGameRunning] = useState(true)
  const [pauseNewBets, setPauseNewBets] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  // Socket & Logs
  const [socketConnected, setSocketConnected] = useState(stackTowerSocket.isConnected)
  const [gameLogs, setGameLogs] = useState([])
  const [isDropping, setIsDropping] = useState(false)
  const [isRefreshingPlayers, setIsRefreshingPlayers] = useState(false)
  const [confirmModal, setConfirmModal] = useState({ open: false, player: null, action: '' })
  const [forceStopModal, setForceStopModal] = useState({
    open: false,
    round_id: '',
    player: null,
    message: '',
    success: true,
  })

  // History table filters & pagination
  const [historySearch, setHistorySearch] = useState('')
  const [historyModeFilter, setHistoryModeFilter] = useState('All')
  const [historyResultFilter, setHistoryResultFilter] = useState('All')
  const [historyPage, setHistoryPage] = useState(1)
  const [historyPerPage, setHistoryPerPage] = useState(5)
  const [isRefreshingHistory, setIsRefreshingHistory] = useState(false)

  // Multiplier & Payout Reference Table States
  const [tableBaseBet, setTableBaseBet] = useState(100)
  const [multiplierTableExpanded, setMultiplierTableExpanded] = useState(true)
  const [payoutTableMode, setPayoutTableMode] = useState('ALL') // 'ALL' | 'EASY' | 'MEDIUM' | 'HARD'

  // Live clock tick
  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(clockTimer)
  }, [])

  // 1. LIVE BACKEND DATA FETCHING & POLLING
  const fetchLiveBackend = async () => {
    try {
      // A. Live Stats
      const statsRes = await fetchStackTowerStats()
      if (statsRes?.data) {
        const d = statsRes.data
        setStatsData(d)
        setApiOnline(true)

        // Check if stats contains active players
        const activeList = d.active_players || d.live_bets || d.active_bets || d.players
        if (Array.isArray(activeList) && activeList.length > 0) {
          setPlayers((prev) => {
            const map = new Map()
            prev.forEach((p) => {
              if (p.round_id) map.set(p.round_id, p)
            })
            activeList.forEach((ap) => {
              const rId = ap.round_id || ap.roundId || (ap.userid ? `ST20261104-${ap.userid}` : null)
              if (rId) {
                const ex = map.get(rId)
                const currentFloor = Math.max(Number(ap.current_floor || ap.floor || ap.level || 0), ex?.current_floor || 0)
                const apMode = String(ap.mode || ap.difficulty || ex?.mode || 'MEDIUM').toUpperCase()
                const multiplier = getFloorMultiplier(currentFloor, apMode)
                const betAmount = Number(ap.bet_amount || ap.amount || ap.bet || 100)
                const payout = calculateFloorPayout(betAmount, currentFloor, apMode, multiplier)
                map.set(rId, {
                  id: ap.id || ex?.id || Date.now(),
                  userid: ap.userid || ap.user_id || ap.userId || ap.u_id || ex?.userid || 1,
                  round_id: rId,
                  bet_amount: betAmount,
                  mode: apMode,
                  current_floor: currentFloor,
                  multiplier,
                  payout,
                  status: ap.status === 1 ? 'Won' : ap.status === 2 ? 'Lost' : ex?.status || 'Building',
                  total_rounds: 1,
                  total_win: 0,
                  total_loss: 0,
                })
              }
            })
            return Array.from(map.values())
          })
        }

        // Check if stats contains recent rounds history
        const histList = d.recent_rounds || d.history || d.rounds || d.last_rounds
        if (Array.isArray(histList) && histList.length > 0) {
          const mapped = histList.map((h, idx) => {
            const hFloor = Number(h.tower_height || h.floor || h.level || h.current_floor || 1)
            const hMode = String(h.mode || h.difficulty || 'MEDIUM').toUpperCase()
            const hMult = getFloorMultiplier(hFloor, hMode)
            const hBet = Number(h.bet_amount || h.amount || h.bet || 100)
            const isWon = h.status === 1 || h.result === 'Won' || h.result === 'won' || String(h.result || '').toLowerCase().includes('cashout')
            const isLost = h.status === 2 || h.result === 'Lost' || h.result === 'lost'
            const result = isWon ? 'Won' : isLost ? 'Lost' : 'Cashout'
            const payout = isLost ? 0 : calculateFloorPayout(hBet, hFloor, hMode, hMult)
            return {
              id: h.id || idx + 1,
              round_id: h.round_id || h.roundId || `ST20261104-${h.id || 984200 + idx}`,
              time: h.created_at ? new Date(h.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : (h.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
              userid: h.userid || h.user_id || h.userId || h.u_id || 1,
              mode: hMode.charAt(0) + hMode.slice(1).toLowerCase(),
              bet: hBet,
              floor: hFloor,
              multiplier: hMult,
              result,
              payout,
              reason: h.reason || (isLost ? 'Obstacle Strike' : isWon ? 'Cashed Out' : 'Completed'),
            }
          })
          setHistory((prev) => {
            const map = new Map()
            mapped.forEach((item) => {
              if (item.round_id) map.set(item.round_id, item)
            })
            prev.forEach((item) => {
              if (item.round_id && !map.has(item.round_id)) map.set(item.round_id, item)
            })
            return Array.from(map.values())
          })
        }
      }

      // B. Live Active Players from Database endpoint
      const liveActive = await fetchActivePlayers()
      if (Array.isArray(liveActive) && liveActive.length > 0) {
        setPlayers((prev) => {
          const map = new Map()
          prev.forEach((p) => {
            if (p.round_id) map.set(p.round_id, p)
          })
          liveActive.forEach((lp) => {
            if (lp.round_id) {
              const ex = map.get(lp.round_id)
              map.set(lp.round_id, ex ? {
                ...lp,
                current_floor: Math.max(lp.current_floor || 0, ex.current_floor || 0),
                multiplier: Math.max(lp.multiplier || 1, ex.multiplier || 1),
                status: ex.status || lp.status,
              } : lp)
            }
          })
          return Array.from(map.values())
        })
        if (!selectedPlayerId && liveActive[0]) {
          setSelectedPlayerId(liveActive[0].userid)
        }
      }

      // C. Live History from Database
      const liveHist = await fetchRecentRounds()
      if (Array.isArray(liveHist) && liveHist.length > 0) {
        setHistory((prev) => {
          const map = new Map()
          liveHist.forEach((item) => {
            if (item.round_id) map.set(item.round_id, item)
          })
          prev.forEach((item) => {
            if (item.round_id && !map.has(item.round_id)) map.set(item.round_id, item)
          })
          return Array.from(map.values())
        })
      }
    } catch (err) {
      console.warn('[Stack Tower] Live polling sync error:', err.message)
    }
  }

  useEffect(() => {
    fetchLiveBackend()
    const pollTimer = setInterval(fetchLiveBackend, 6000)
    return () => clearInterval(pollTimer)
  }, [])

  // Step 2 from backend spec: Admin Screen open hote hi:
  // socket.emit("admin_join", {}, (ack) => { setLivePlayers(ack.players); });
  useEffect(() => {
    stackTowerSocket.adminJoin((ack, liveList) => {
      if (Array.isArray(liveList) && liveList.length > 0) {
        const formatted = liveList.map(formatLivePlayer).filter(Boolean)
        setPlayers(formatted)
        if (formatted[0]) setSelectedPlayerId(formatted[0].userid)
      }
    })
  }, [])

  // Manual Refresh for Live Active Players
  const handleManualRefreshPlayers = async () => {
    setIsRefreshingPlayers(true)
    try {
      let liveCount = 0
      try {
        const ack = await stackTowerSocket.adminJoin()
        const sPlayers = stackTowerSocket.extractPlayers(ack)
        if (sPlayers.length > 0) {
          const formatted = sPlayers.map(formatLivePlayer).filter(Boolean)
          setPlayers(formatted)
          liveCount = formatted.length
          toast(`Live players refreshed: ${formatted.length} active player(s)`)
        }
      } catch {}

      if (liveCount === 0) {
        const liveActive = await fetchActivePlayers()
        if (Array.isArray(liveActive) && liveActive.length > 0) {
          const formatted = liveActive.map(formatLivePlayer).filter(Boolean)
          setPlayers(formatted)
          liveCount = formatted.length
          toast(`Live players synced from database: ${formatted.length} player(s)`)
        }
      }

      if (liveCount === 0) {
        setPlayers((prev) => (prev.length > 0 ? prev : MOCK_ACTIVE_ROUNDS.map(formatLivePlayer)))
        toast('Live server idle (0 real players stacking right now, active test players loaded)')
      }
    } catch (err) {
      toast(`Refresh notice: ${err.message}`)
    } finally {
      setTimeout(() => setIsRefreshingPlayers(false), 400)
    }
  }

  // Step 4 from backend spec: "Force Stop" Button Click Handler (With Custom Popup Modal)
  const onForceStopClick = async (roundId) => {
    if (!roundId) return
    setIsDropping(true)
    const targetPlayer = players.find((p) => p.round_id === roundId)
    try {
      const ack = await stackTowerSocket.emitForceStop({ round_id: roundId })
      const message = ack?.message || `Round ${roundId} ARMED! Tower will collapse on next floor drop.`

      // Mark ARMED immediately on this player row
      setPlayers((prev) =>
        prev.map((p) =>
          p.round_id === roundId
            ? { ...p, armed: true, status: 'Armed' }
            : p
        )
      )

      toast(`⚡ ${message}`)

      // Display proper popup message dialog (REPLACING BROWSER ALERT)
      setForceStopModal({
        open: true,
        round_id: roundId,
        player: targetPlayer,
        message,
        success: true,
      })
    } catch (err) {
      toast(`Force stop error: ${err.message}`)
      setForceStopModal({
        open: true,
        round_id: roundId,
        player: targetPlayer,
        message: `Error executing force stop: ${err.message}`,
        success: false,
      })
    } finally {
      setIsDropping(false)
    }
  }

  // 2. REAL-TIME WEBSOCKET LISTENER
  useEffect(() => {
    const fmtLog = (entry) => {
      let dot = 'bg-blue-400'
      if (entry.type === 'success') dot = 'bg-emerald-400'
      else if (entry.type === 'warn') dot = 'bg-amber-400'
      else if (entry.type === 'error') dot = 'bg-rose-500'
      else if (entry.type === 'broadcast') dot = 'bg-purple-400'
      else if (entry.type === 'ack') dot = 'bg-sky-400'
      return {
        id: entry.id || Date.now() + Math.random(),
        time: entry.timestamp || new Date().toLocaleTimeString(),
        text: entry.message,
        dot,
      }
    }

    const unsub = stackTowerSocket.subscribe((event) => {
      if (event.type === 'CONNECTION_CHANGE') {
        setSocketConnected(event.connected)
        if (event.connected) {
          // Re-emit admin_join on reconnect
          stackTowerSocket.adminJoin((ack, liveList) => {
            if (Array.isArray(liveList) && liveList.length > 0) {
              const formatted = liveList.map(formatLivePlayer).filter(Boolean)
              setPlayers(formatted)
            }
          })
        }
      }

      if (event.type === 'STATUS_INIT') {
        setSocketConnected(event.connected)
        if (Array.isArray(event.logs) && event.logs.length > 0) {
          setGameLogs(event.logs.slice(0, 50).map(fmtLog))
        }
      }

      if (event.type === 'LOG' && event.entry) {
        setGameLogs((prev) => [fmtLog(event.entry), ...prev.slice(0, 49)])
      }

      // Step 3.1: Naya player join hone par:
      // socket.on("player_joined", (player) => { ... })
      if (event.type === 'PLAYER_JOINED' && event.player) {
        const np = formatLivePlayer(event.player)
        if (np) {
          setPlayers((prev) => {
            const rest = prev.filter((p) => p.round_id !== np.round_id)
            return [np, ...rest]
          })
          toast(`Player #${np.userid} (${np.username}) joined mode ${np.mode} with ₹${np.bet_amount.toFixed(2)}`)
        }
      }

      // Step 3.2: Player jab floor build kare (1, 2, 3, 4, 5...):
      // socket.on("player_floor_updated", (data) => { ... })
      if (event.type === 'PLAYER_FLOOR_UPDATED' && event.data) {
        const d = event.data?.data || event.data?.result || event.data || {}
        const rId = String(d.round_id || d.roundId || d.round || '').trim()
        const uId = d.user_id ?? d.userid ?? d.userId ?? d.u_id ?? d.id
        const rawFloor = Number(d.floor ?? d.current_floor ?? d.height ?? d.current_height ?? d.tower_height ?? d.level ?? 0)
        const rawMult = Number(d.multiplier ?? d.mult ?? d.odds ?? 0)
        const isArmed = d.armed !== undefined ? Boolean(d.armed) : undefined

        setPlayers((prev) =>
          prev.map((p) => {
            const matchesRound = rId && String(p.round_id || '').trim().toLowerCase() === rId.toLowerCase()
            const matchesUser = uId && String(p.userid || '') === String(uId)
            if (matchesRound || matchesUser) {
              const effectiveFloor = resolveCurrentFloor(
                rawFloor > 0 ? rawFloor : p.current_floor,
                rawMult > 0 ? rawMult : p.multiplier,
                p.mode
              )
              const perfectMult = getFloorMultiplier(effectiveFloor, p.mode, true)
              const isPerfect = Boolean(
                d.is_perfect ||
                d.perfect ||
                d.perfect_drop ||
                d.isPerfect ||
                (rawMult > 1.01 && Math.abs(rawMult - perfectMult) < 0.05)
              )
              const newMult = getFloorMultiplier(effectiveFloor, p.mode, isPerfect)
              const newPayout = calculateFloorPayout(p.bet_amount, effectiveFloor, p.mode, newMult, isPerfect)
              const armedState = isArmed !== undefined ? isArmed : p.armed
              return {
                ...p,
                current_floor: effectiveFloor,
                multiplier: newMult,
                payout: newPayout,
                is_perfect: isPerfect,
                armed: armedState,
                status: armedState ? 'Armed' : p.status,
              }
            }
            return p
          })
        )
      }

      // Step 3.3: Auto list update:
      // socket.on("active_players_update", (res) => { setLivePlayers(res.data); })
      if (event.type === 'ACTIVE_PLAYERS_UPDATE') {
        const list = Array.isArray(event.players) ? event.players : []
        if (list.length > 0) {
          const formatted = list.map(formatLivePlayer).filter(Boolean)
          setPlayers((prev) => {
            const armedMap = new Map(prev.filter((p) => p.armed).map((p) => [p.round_id, true]))
            return formatted.map((p) => (armedMap.has(p.round_id) ? { ...p, armed: true, status: 'Armed' } : p))
          })
        }
      }

      // Step 4 Ack: Force stop executed & armed
      if (event.type === 'FORCE_STOP_ACK') {
        const rId = event.round_id
        if (rId) {
          setPlayers((prev) =>
            prev.map((p) => (p.round_id === rId ? { ...p, armed: true, status: 'Armed' } : p))
          )
        }
      }

      if (event.type === 'SOCKET_GAME_EVENT') {
        const payload = event.data || {}
        const evt = String(event.event || '').toLowerCase()

        // Extract player attributes across all backend naming variants
        const rawUid = payload.userid ?? payload.user_id ?? payload.userId ?? payload.u_id ?? payload.id ?? payload.player_id
        const rId = payload.round_id || payload.roundId || payload.round || payload.game_id || payload.order_id || (rawUid ? `ST20261104-${rawUid}` : null)
        const betAmt = Number(payload.bet_amount ?? payload.amount ?? payload.bet ?? payload.stake ?? 100)
        const rawFloor = Number(payload.floor ?? payload.current_floor ?? payload.step ?? payload.tower_height ?? payload.level ?? 0)
        const rawMult = Number(payload.multiplier ?? payload.mult ?? payload.odds ?? 0)
        const mode = String(payload.mode || payload.difficulty || 'Medium').replace(/^./, (c) => c.toUpperCase())
        const floor = resolveCurrentFloor(rawFloor, rawMult, mode)
        const perfectMult = getFloorMultiplier(floor, mode, true)
        const isPerfect = Boolean(
          payload.is_perfect ||
          payload.perfect ||
          payload.perfect_drop ||
          payload.isPerfect ||
          (rawMult > 1.01 && Math.abs(rawMult - perfectMult) < 0.05)
        )
        const mult = getFloorMultiplier(floor, mode, isPerfect)
        const rawStatus = payload.status
        const isWon = rawStatus === 1 || rawStatus === 'Won' || rawStatus === 'won' || evt.includes('cashout') || evt.includes('win')
        const isLost = rawStatus === 2 || rawStatus === 'Lost' || rawStatus === 'lost' || evt.includes('drop') || evt.includes('crash') || evt.includes('topple') || evt.includes('strike') || evt.includes('game-over')
        const calcPayout = calculateFloorPayout(betAmt, floor, mode, mult, isPerfect)
        const wonPayout = isWon ? Number(payload.payout ?? payload.payout_amount ?? payload.win_amount ?? calcPayout) : 0

        // If userid wasn't in event, find from existing player record by round_id
        let uId = rawUid
        if (!uId && rId) {
          const matched = players.find((p) => p.round_id === rId)
          if (matched) uId = matched.userid
        }

        if (uId || rId) {
          const displayUid = uId || 'Player'
          const displayRid = rId || `ST20261104-${uId}`

          if (isWon) {
            // Player Cashed Out / Won
            setPlayers((prev) =>
              prev.map((p) => {
                if ((uId && p.userid === uId) || (rId && p.round_id === rId)) {
                  return { ...p, status: 'Won', payout: wonPayout, current_floor: floor, multiplier: mult }
                }
                return p
              })
            )
            setHistory((hPrev) => {
              const newEntry = {
                id: Date.now(),
                round_id: displayRid,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                userid: displayUid,
                mode,
                bet: betAmt,
                floor,
                multiplier: mult,
                result: 'Cashout',
                payout: wonPayout,
                reason: 'Player Cashed Out',
              }
              const rest = hPrev.filter((h) => h.round_id !== displayRid)
              return [newEntry, ...rest]
            })
            setGameLogs((prev) => [
              {
                id: Date.now(),
                time: new Date().toLocaleTimeString(),
                text: `User #${displayUid} Cashed Out ₹${wonPayout.toLocaleString()} at Floor #${floor} (${mult}x)`,
                dot: 'bg-emerald-400',
              },
              ...prev.slice(0, 49),
            ])
          } else if (isLost) {
            // Player Tower Collapsed / Lost
            setPlayers((prev) =>
              prev.map((p) => {
                if ((uId && p.userid === uId) || (rId && p.round_id === rId)) {
                  return { ...p, status: 'Lost', payout: 0, current_floor: floor, multiplier: mult }
                }
                return p
              })
            )
            setHistory((hPrev) => {
              const newEntry = {
                id: Date.now(),
                round_id: displayRid,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                userid: displayUid,
                mode,
                bet: betAmt,
                floor,
                multiplier: mult,
                result: 'Lost',
                payout: 0,
                reason: payload.reason || 'Tower Collapsed',
              }
              const rest = hPrev.filter((h) => h.round_id !== displayRid)
              return [newEntry, ...rest]
            })
            setGameLogs((prev) => [
              {
                id: Date.now(),
                time: new Date().toLocaleTimeString(),
                text: `User #${displayUid} Tower Collapsed at Floor #${floor} (Lost ₹${betAmt})`,
                dot: 'bg-rose-500',
              },
              ...prev.slice(0, 49),
            ])
          } else {
            // Live step / stack_block / climb / new bet (Active Building)
            const np = {
              id: Date.now(),
              userid: displayUid,
              round_id: displayRid,
              bet_amount: betAmt,
              mode,
              current_floor: floor,
              multiplier: mult,
              payout: Math.round(betAmt * mult),
              status: 'Building',
              total_rounds: 1,
              total_win: 0,
              total_loss: 0,
            }

            setPlayers((prev) => {
              const existingIdx = prev.findIndex((p) => (uId && p.userid === uId) || (rId && p.round_id === rId))
              if (existingIdx >= 0) {
                const updated = [...prev]
                const old = updated[existingIdx]
                updated[existingIdx] = {
                  ...old,
                  current_floor: floor,
                  multiplier: mult,
                  payout: Math.round(old.bet_amount * mult),
                  status: 'Building',
                }
                return updated
              }
              return [np, ...prev]
            })

            const isStackEvent = evt === 'stack_block' || evt.includes('stack')
            setGameLogs((prev) => [
              {
                id: Date.now(),
                time: new Date().toLocaleTimeString(),
                text: isStackEvent
                  ? `User #${displayUid} stacked block to Floor #${floor} (${mult}x)`
                  : `User #${displayUid} Floor #${floor} (${mult}x) | Bet ₹${betAmt} (${mode})`,
                dot: isStackEvent ? 'bg-amber-400' : 'bg-sky-400',
              },
              ...prev.slice(0, 49),
            ])
          }
        }
      }

      // Obstacle dropped broadcast from server
      if (event.type === 'OBSTACLE_DROPPED') {
        const rId = event.data?.round_id
        const uId = event.data?.userid
        const targetRid = rId || (uId ? `ST20261104-${uId}` : null)

        setPlayers((prev) =>
          prev.map((p) => {
            if ((uId && p.userid === uId) || (rId && p.round_id === rId)) {
              return { ...p, status: 'Lost', payout: 0 }
            }
            return p
          })
        )

        if (targetRid) {
          setHistory((hPrev) => {
            const newEntry = {
              id: Date.now(),
              round_id: targetRid,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              userid: uId || 'Player',
              mode: 'Medium',
              bet: 100,
              floor: 1,
              multiplier: 1,
              result: 'Lost',
              payout: 0,
              reason: 'Obstacle Dropped',
            }
            const rest = hPrev.filter((h) => h.round_id !== targetRid)
            return [newEntry, ...rest]
          })
        }
        toast(`[BROADCAST] Obstacle strike on Round ${rId || ''}! User #${uId || ''} lost.`)
      }
    })
    return () => unsub()
  }, [])

  // Filtered & Paginated history (strictly deduplicated by round_id / id)
  const filteredHistory = useMemo(() => {
    const seen = new Set()
    return history
      .filter((h) => {
        const k = h.round_id ? `rid-${h.round_id}` : `id-${h.id || Math.random()}`
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
      .filter((h) => {
        const q = historySearch.toLowerCase().trim()
        const matchSearch =
          !q ||
          String(h.userid).includes(q) ||
          String(h.round_id || '').toLowerCase().includes(q)
        const matchMode =
          historyModeFilter === 'All' ||
          String(h.mode || '').toLowerCase() === historyModeFilter.toLowerCase()
        const matchResult =
          historyResultFilter === 'All' ||
          String(h.result || '').toLowerCase() === historyResultFilter.toLowerCase()
        return matchSearch && matchMode && matchResult
      })
  }, [history, historySearch, historyModeFilter, historyResultFilter])

  const paginatedHistory = useMemo(() => {
    const start = (historyPage - 1) * historyPerPage
    return filteredHistory.slice(start, start + historyPerPage)
  }, [filteredHistory, historyPage, historyPerPage])

  const totalHistoryPages = Math.max(1, Math.ceil(filteredHistory.length / historyPerPage))

  const handleManualRefreshHistory = async () => {
    setIsRefreshingHistory(true)
    try {
      const liveHist = await fetchRecentRounds()
      if (Array.isArray(liveHist) && liveHist.length > 0) {
        setHistory((prev) => {
          const map = new Map()
          liveHist.forEach((item) => {
            if (item.round_id) map.set(item.round_id, item)
          })
          prev.forEach((item) => {
            if (item.round_id && !map.has(item.round_id)) map.set(item.round_id, item)
          })
          return Array.from(map.values())
        })
        toast('History refreshed from live database')
      } else {
        toast('History is up to date')
      }
    } finally {
      setIsRefreshingHistory(false)
    }
  }

  // Active selected player object
  const activePlayer = useMemo(() => {
    if (players.length === 0) return null
    if (selectedRoundId) {
      const matchRound = players.find((p) => p.round_id === selectedRoundId || p.id === selectedRoundId)
      if (matchRound) return matchRound
    }
    if (selectedPlayerId) {
      const matchUser = players.find((p) => String(p.userid) === String(selectedPlayerId))
      if (matchUser) return matchUser
    }
    return players[0] || null
  }, [players, selectedRoundId, selectedPlayerId])

  // Real-time dynamic floor, multiplier, and payout for selected active player
  const activeDisplayFloor = useMemo(() => {
    return Number(activePlayer?.current_floor ?? 0)
  }, [activePlayer])

  const activeDisplayMult = useMemo(() => {
    return getFloorMultiplier(activeDisplayFloor, activePlayer?.mode, Boolean(activePlayer?.is_perfect))
  }, [activePlayer, activeDisplayFloor])

  const activeDisplayPayout = useMemo(() => {
    return calculateFloorPayout(
      activePlayer?.bet_amount || 100,
      activeDisplayFloor,
      activePlayer?.mode,
      activeDisplayMult
    )
  }, [activePlayer, activeDisplayFloor, activeDisplayMult])

  // Toggle selection
  const toggleSelectRow = (userId) => {
    setSelectedPlayerId(userId)
    const next = new Set(selectedRows)
    if (next.has(userId)) next.delete(userId)
    else next.add(userId)
    setSelectedRows(next)
  }

  // FORCE DROP PLAYER (DUAL TRIGGER)
  const handleForceDrop = async (target) => {
    const p = target || activePlayer
    if (!p) return

    setIsDropping(true)
    try {
      await triggerObstacleDrop({
        round_id: p.round_id,
        userid: p.userid,
        obstacle_type: 'WRECKING_BALL',
        level: p.current_floor,
        reason: 'Admin force drop',
        triggerMode: 'dual',
      })

      // Mark status Lost immediately
      setPlayers((prev) =>
        prev.map((item) =>
          item.userid === p.userid ? { ...item, status: 'Lost', payout: 0.0 } : item
        )
      )

      // Add to history without duplicate round_id
      setHistory((prev) => {
        const newEntry = {
          id: Date.now(),
          round_id: p.round_id,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          userid: p.userid,
          mode: p.mode || 'Medium',
          bet: p.bet_amount,
          floor: p.current_floor,
          multiplier: p.multiplier,
          result: 'Lost',
          payout: 0.0,
          reason: 'Admin force drop',
        }
        const rest = prev.filter((item) => item.round_id !== p.round_id)
        return [newEntry, ...rest]
      })

      // Add log
      setGameLogs((prev) => [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          text: `Admin force dropped User #${p.userid} at Floor ${p.current_floor} (Status: LOST)`,
          dot: 'bg-rose-500',
        },
        ...prev.slice(0, 9),
      ])

      toast(`⚡ Force Drop executed on User #${p.userid}! Round terminated (Lost).`)
    } catch (err) {
      toast(`Drop error: ${err.message}`)
    } finally {
      setIsDropping(false)
      setConfirmModal({ open: false, player: null, action: '' })
    }
  }

  // PAUSE PLAYER ROUND
  const handlePausePlayer = (target) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.userid === target.userid
          ? { ...p, status: p.status === 'Paused' ? 'Building' : 'Paused' }
          : p
      )
    )
    toast(`User #${target.userid} round ${target.status === 'Paused' ? 'resumed' : 'paused'}`)
  }

  // CANCEL ROUND
  const handleCancelRound = (target) => {
    setPlayers((prev) => prev.filter((p) => p.userid !== target.userid))
    toast(`Round ${target.round_id} cancelled`)
  }

  // REFUND BET
  const handleRefundBet = (target) => {
    toast(`₹${target.bet_amount.toFixed(2)} refunded to User #${target.userid}'s wallet`)
  }

  // GLOBAL EMERGENCY STOP
  const handleStopAll = () => {
    setPlayers((prev) => prev.map((p) => ({ ...p, status: 'Lost', payout: 0 })))
    toast('EMERGENCY: All active player rounds stopped (Lost)')
  }

  // Filtered players list (strictly deduplicated by round_id)
  const filteredPlayers = useMemo(() => {
    const seen = new Set()
    return players
      .filter((p) => {
        const key = p.round_id || `${p.userid}-${p.id}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .filter((p) => {
        const q = searchQuery.toLowerCase().trim()
        const matchSearch =
          !q ||
          String(p.userid).includes(q) ||
          String(p.username || '').toLowerCase().includes(q) ||
          String(p.round_id || '').toLowerCase().includes(q)

        const matchMode =
          modeFilter === 'All' ||
          String(p.mode || '').toLowerCase() === modeFilter.toLowerCase()

        const stat = String(p.status || '').toLowerCase()
        const matchStatus =
          statusFilter === 'All' ||
          (statusFilter === 'Building' && (stat === 'building' || stat === 'armed' || stat === 'active' || stat === 'playing' || !stat)) ||
          (statusFilter === 'Armed' && p.armed) ||
          stat.includes(statusFilter.toLowerCase())

        return matchSearch && matchMode && matchStatus
      })
  }, [players, searchQuery, modeFilter, statusFilter])

  const totalPlayersPages = Math.max(1, Math.ceil(filteredPlayers.length / playersPerPage))

  const paginatedPlayers = useMemo(() => {
    const start = (playersPage - 1) * playersPerPage
    return filteredPlayers.slice(start, start + playersPerPage)
  }, [filteredPlayers, playersPage, playersPerPage])

  // Reset to page 1 on filter or search changes
  useEffect(() => {
    setPlayersPage(1)
  }, [searchQuery, modeFilter, statusFilter])

  // DYNAMIC LIVE STATS BINDINGS
  const activePlayersCount = statsData?.overall?.total_players || players.filter((p) => p.status === 'Building').length
  const totalActiveBetsAmount = statsData?.overall?.total_wagered
    ? money(statsData.overall.total_wagered)
    : money(players.reduce((sum, p) => sum + (p.bet_amount || 0), 0))
  const totalCashoutWinningsAmount = statsData?.overall?.total_payout
    ? money(statsData.overall.total_payout)
    : money(history.filter((h) => h.result === 'Won' || h.result === 'Cashout').reduce((sum, h) => sum + (h.payout || 0), 0))
  const totalLostBetsAmount = statsData?.overall?.house_profit
    ? money(statsData.overall.house_profit)
    : money(history.filter((h) => h.result === 'Lost').reduce((sum, h) => sum + (h.bet || 0), 0))
  const activeRoundsCount = statsData?.overall?.total_bets || players.length

  const todayTotalRounds = statsData?.overall?.total_bets ? Number(statsData.overall.total_bets).toLocaleString() : String(players.length)
  const todayTotalBets = statsData?.overall?.total_wagered ? money(statsData.overall.total_wagered) : money(players.reduce((sum, p) => sum + (p.bet_amount || 0), 0))
  const todayTotalPayout = statsData?.overall?.total_payout ? money(statsData.overall.total_payout) : money(history.reduce((sum, h) => sum + (h.payout || 0), 0))
  const todayNetProfit = statsData?.overall?.house_profit
    ? money(statsData.overall.house_profit)
    : money(Math.max(0, players.reduce((sum, p) => sum + (p.bet_amount || 0), 0) - history.reduce((sum, h) => sum + (h.payout || 0), 0)))

  return (
    <div className="space-y-4 text-slate-100 font-sans -m-1 sm:-m-2">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & SYSTEM STATUS BAR                                         */}
      {/* ========================================================================= */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-[#0a1128]/95 p-3.5 sm:p-4 rounded-2xl border border-blue-900/40 shadow-lg">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Stack Tower – Admin Control Panel</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Live Game Operations, Player Monitoring & Round Management
          </p>
        </div>

        {/* Live Status Indicators */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs font-semibold">
          <div className="flex items-center gap-1.5 bg-[#0c1938] border border-emerald-500/40 px-2.5 py-1.5 rounded-xl text-emerald-400 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Game: Running</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0c1938] border border-cyan-500/40 px-2.5 py-1.5 rounded-xl text-cyan-400">
            <Zap size={13} className="text-cyan-400 fill-current" />
            <span>Socket: {socketConnected ? 'Connected' : 'Connecting'}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0c1938] border border-blue-500/40 px-2.5 py-1.5 rounded-xl text-blue-400">
            <Cloud size={13} />
            <span>API: {apiOnline ? 'Online' : 'Syncing'}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0c1938] border border-emerald-500/40 px-2.5 py-1.5 rounded-xl text-emerald-400">
            <Database size={13} />
            <span>DB: Healthy</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-[#0c1938] border border-slate-700/60 px-2.5 py-1.5 rounded-xl text-slate-300 font-mono text-[11px]">
            <span>
              {currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })},{' '}
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-[#0c1938] border border-blue-800/60 px-3 py-1 rounded-xl">
            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center font-black text-white text-xs">
              {(currentUser?.username || 'A')[0].toUpperCase()}
            </div>
            <div className="text-left text-[11px] leading-tight">
              <span className="font-bold text-white block">{currentUser?.username || 'Akash Rai'}</span>
              <span className="text-slate-400 text-[10px]">{currentUser?.role || 'Super Admin'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FULL-WIDTH QUICK STATS (TODAY)                                         */}
      {/* ========================================================================= */}
      <div className="bg-[#0a1128] rounded-2xl border border-blue-900/40 p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <BarChart2 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                <span>Quick Stats (Today)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Daily Stack Tower aggregated volume, total bets, user payouts and net house revenue.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold text-[11px] flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Sync</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
          <div className="bg-[#070e24] p-3.5 sm:p-4 rounded-xl border border-blue-950/70 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Total Rounds</span>
              <span className="font-mono font-black text-white text-xl sm:text-2xl block mt-0.5">{todayTotalRounds}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-600/15 text-blue-400 flex items-center justify-center font-bold">
              <Layers size={20} />
            </div>
          </div>

          <div className="bg-[#070e24] p-3.5 sm:p-4 rounded-xl border border-blue-950/70 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Total Bets</span>
              <span className="font-mono font-black text-white text-xl sm:text-2xl block mt-0.5 truncate">{todayTotalBets}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-600/15 text-cyan-400 flex items-center justify-center font-bold">
              <Wallet size={20} />
            </div>
          </div>

          <div className="bg-[#070e24] p-3.5 sm:p-4 rounded-xl border border-blue-950/70 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Total Payout</span>
              <span className="font-mono font-black text-slate-200 text-xl sm:text-2xl block mt-0.5 truncate">{todayTotalPayout}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-600/15 text-purple-400 flex items-center justify-center font-bold">
              <Trophy size={20} />
            </div>
          </div>

          <div className="bg-[#070e24] p-3.5 sm:p-4 rounded-xl border border-emerald-950/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-emerald-400 block font-bold">Net Profit</span>
              <span className="font-mono font-black text-emerald-400 text-xl sm:text-2xl block mt-0.5 truncate">{todayNetProfit}</span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-600/15 text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN DASHBOARD SPLIT: LIVE PLAYERS TABLE + PLAYER CONTROL              */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: LIVE ACTIVE PLAYERS (7 COLS) */}
        <div className="xl:col-span-7 space-y-4">
          <div className="bg-[#0a1128] rounded-2xl border border-blue-900/40 p-4 shadow-xl space-y-3.5">
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Active Players Monitoring</span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Track all live players, bets, tower progress and take control when required.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={modeFilter}
                  onChange={(e) => setModeFilter(e.target.value)}
                  className="bg-[#070e24] border border-blue-900/60 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none cursor-pointer"
                >
                  <option value="All">All Modes</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#070e24] border border-blue-900/60 rounded-xl px-2.5 py-1.5 text-xs text-emerald-400 outline-none cursor-pointer font-bold"
                >
                  <option value="Building">● Building (Active)</option>
                  <option value="All">All Status (Active & Recent)</option>
                  <option value="Won">Won / Cashed Out</option>
                  <option value="Lost">Lost / Crashed</option>
                </select>

                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by User ID / Round ID..."
                    className="bg-[#070e24] border border-blue-900/60 rounded-xl pl-3 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none w-44 sm:w-52"
                  />
                  <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>

                <button
                  onClick={handleManualRefreshPlayers}
                  disabled={isRefreshingPlayers}
                  title="Refresh Live Active Players"
                  className="flex items-center gap-1.5 bg-[#0c1a40] hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={13} className={isRefreshingPlayers ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Players Table */}
            <div className="overflow-x-auto rounded-xl border border-blue-950/60 bg-[#060c20]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#081230] border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">Round ID</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Player Name / ID</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Game Mode</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Bet Amount (₹)</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Floors Built</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Multiplier</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Payout (Est.)</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">Status</th>
                    <th className="py-2.5 px-3 text-center whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedPlayers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500 italic whitespace-nowrap">
                        No active players matching filters. Waiting for live players to join...
                      </td>
                    </tr>
                  ) : (
                    paginatedPlayers.map((p, pIdx) => {
                      const globalPIdx = (playersPage - 1) * playersPerPage + pIdx + 1
                      const isSelected =
                        (selectedRoundId && (p.round_id === selectedRoundId || p.id === selectedRoundId)) ||
                        (!selectedRoundId && activePlayer && (p.round_id === activePlayer.round_id || String(p.userid) === String(activePlayer.userid)))
                      const modeColor =
                        p.mode === 'Easy' || p.mode === 'EASY'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : p.mode === 'Hard' || p.mode === 'HARD'
                          ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                          : 'bg-amber-500/20 text-amber-400 border-amber-500/30'

                      const displayFloor = Number(p.current_floor ?? 0)
                      const displayMult = getFloorMultiplier(displayFloor, p.mode, Boolean(p.is_perfect))
                      const displayPayout = calculateFloorPayout(
                        p.bet_amount,
                        displayFloor,
                        p.mode,
                        displayMult,
                        Boolean(p.is_perfect)
                      )

                      return (
                        <tr
                          key={`player-${p.round_id || p.userid || 'p'}-${globalPIdx}`}
                          onClick={() => {
                            setSelectedRoundId(p.round_id || p.id)
                            setSelectedPlayerId(p.userid)
                          }}
                          className={`transition cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600/15 border-l-4 border-l-blue-500'
                              : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          {/* 1. Round ID */}
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-300 text-[11px] whitespace-nowrap">
                            {p.round_id}
                          </td>

                          {/* 2. Player Name / ID */}
                          <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className={`h-2 w-2 rounded-full ${p.armed ? 'bg-red-400 animate-ping' : 'bg-emerald-400'}`} />
                              <span className="text-white font-bold">{p.username || `User #${p.userid}`}</span>
                              <span className="text-slate-400 font-mono text-[10px]">#{p.userid}</span>
                            </div>
                          </td>

                          {/* 3. Game Mode */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${modeColor}`}>
                              {p.mode}
                            </span>
                          </td>

                          {/* 4. Bet Amount */}
                          <td className="py-2.5 px-3 font-mono font-bold text-white whitespace-nowrap">
                            ₹{Number(p.bet_amount || 0).toFixed(2)}
                          </td>

                          {/* 5. Floors Built (Live 1, 2, 3, 4, 5...) */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1 text-amber-400 font-black font-mono">
                              <ChevronUp size={14} className="stroke-[3]" />
                              <span>{displayFloor > 0 ? `Floor ${displayFloor}` : 'Base (0)'}</span>
                            </div>
                          </td>

                          {/* 6. Multiplier (1.2x, 1.5x...) */}
                          <td className="py-2.5 px-3 font-mono font-extrabold text-emerald-400 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span>{displayMult.toFixed(2)}x</span>
                              {p.is_perfect && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 py-0.5 rounded font-black inline-flex items-center gap-0.5 shadow-sm">
                                  <Star size={8} className="fill-amber-400 text-amber-400" />
                                  <span>PERFECT</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Payout (Current) */}
                          <td className="py-2.5 px-3 font-mono font-bold text-white whitespace-nowrap">
                            ₹{displayPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Status / Armed Tag */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {p.armed ? (
                              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-red-600/90 text-white animate-pulse border border-red-400 shadow-sm shadow-red-500/40 inline-flex items-center gap-1">
                                <span>ARMED ⚠</span>
                              </span>
                            ) : (
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                  p.status === 'Building'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : p.status === 'Won'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {p.status}
                              </span>
                            )}
                          </td>

                          {/* 7. Action: [Force Stop] Button */}
                          <td className="py-2.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => onForceStopClick(p.round_id)}
                                disabled={p.armed || isDropping}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                                  p.armed
                                    ? 'bg-red-950/80 border border-red-500/60 text-red-300 cursor-not-allowed opacity-90'
                                    : 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white border border-red-400/40 cursor-pointer shadow-red-900/40 active:scale-95'
                                }`}
                                title={p.armed ? 'Armed! Tower will collapse on next floor drop' : `Force stop round ${p.round_id}`}
                              >
                                <Square size={11} fill="currentColor" />
                                <span>{p.armed ? 'ARMED ⚠' : 'Force Stop'}</span>
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedRoundId(p.round_id || p.id)
                                  setSelectedPlayerId(p.userid)
                                }}
                                title="View Player Details in Right Panel"
                                className="h-7 w-7 rounded-lg bg-blue-950/60 hover:bg-blue-900 border border-blue-700/50 text-blue-400 flex items-center justify-center transition cursor-pointer"
                              >
                                <Eye size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Active Players Pagination Bar (8 per page) */}
            {filteredPlayers.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 text-xs text-slate-400 border-t border-white/5">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span>
                    Showing <strong className="font-bold text-white font-mono">{(playersPage - 1) * playersPerPage + 1}</strong> to{' '}
                    <strong className="font-bold text-white font-mono">{Math.min(playersPage * playersPerPage, filteredPlayers.length)}</strong> of{' '}
                    <strong className="font-bold text-white font-mono">{filteredPlayers.length}</strong> players
                  </span>

                  <select
                    value={playersPerPage}
                    onChange={(e) => {
                      setPlayersPerPage(Number(e.target.value))
                      setPlayersPage(1)
                    }}
                    className="ml-3 bg-[#070e24] border border-blue-900/60 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none cursor-pointer"
                  >
                    <option value={5}>5 / page</option>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto whitespace-nowrap">
                  <button
                    onClick={() => setPlayersPage((p) => Math.max(1, p - 1))}
                    disabled={playersPage === 1}
                    className="p-1.5 rounded-lg bg-[#070e24] border border-blue-900/60 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-900/40 cursor-pointer"
                    title="Previous Page"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="px-3 py-1 rounded-lg bg-[#070e24] border border-blue-900/60 text-white font-mono font-bold text-xs">
                    {playersPage} / {totalPlayersPages}
                  </span>
                  <button
                    onClick={() => setPlayersPage((p) => Math.min(totalPlayersPages, p + 1))}
                    disabled={playersPage === totalPlayersPages}
                    className="p-1.5 rounded-lg bg-[#070e24] border border-blue-900/60 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-900/40 cursor-pointer"
                    title="Next Page"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PLAYER DETAILS + GAME CONTROLS (5 COLS) */}
        <div className="xl:col-span-5 space-y-4">
          {/* Player Details Card */}
          <div className="bg-[#0a1128] rounded-2xl border border-blue-900/40 p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Users size={15} />
                </div>
                <h3 className="text-sm font-black text-white">
                  Player Details – User #{activePlayer?.userid || '---'}
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE</span>
              </span>
            </div>

            {/* Dynamic Tower Stage (Pure UI Code - No Static Image) */}
            <div className="relative rounded-2xl overflow-hidden border border-blue-900/60 p-3.5 text-white min-h-[195px] sm:min-h-[205px] flex flex-col justify-between shadow-inner bg-gradient-to-b from-[#0c1a40] via-[#08122c] to-[#040817]">
              {/* Top Status Overlays */}
              <div className="flex items-start justify-between relative z-10">
                <span className="bg-[#070e24]/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold border border-blue-500/30 text-white shadow-md flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      activePlayer?.mode === 'Hard'
                        ? 'bg-purple-400'
                        : activePlayer?.mode === 'Medium'
                        ? 'bg-amber-400'
                        : 'bg-blue-400'
                    }`}
                  />
                  <span>Mode: {activePlayer?.mode || 'Easy'}</span>
                </span>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="bg-[#070e24]/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-mono font-bold border border-blue-500/30 text-white shadow-md flex items-center gap-1.5">
                    <Layers size={13} className="text-amber-400" />
                    <span>Floor: {activeDisplayFloor}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 px-2.5 py-0.5 rounded-lg text-xs font-mono font-black shadow-lg flex items-center gap-1">
                      <Zap size={11} fill="currentColor" />
                      <span>{activeDisplayMult.toFixed(2)}x</span>
                    </span>
                    {activePlayer?.is_perfect && (
                      <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-md text-[9px] font-mono font-black flex items-center gap-0.5 shadow-md">
                        <Star size={9} className="fill-slate-950" />
                        <span>PERFECT</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Tower Building Visualization */}
              <div className="my-auto py-2 flex flex-col items-center justify-center relative z-10">
                {!activePlayer ? (
                  <div className="flex flex-col items-center justify-center py-4 text-slate-500 space-y-1.5">
                    <Building2 size={32} className="opacity-40 text-blue-400" />
                    <span className="text-xs font-medium">Select a player from the table to monitor tower</span>
                  </div>
                ) : (
                  <div className="w-52 sm:w-60 flex flex-col items-center space-y-1">
                    {/* Active Top Floor Block */}
                    <div className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white py-1.5 px-3 rounded-lg shadow-lg shadow-blue-500/30 border border-cyan-300 flex items-center justify-between text-xs font-mono font-black animate-pulse">
                      <span className="flex items-center gap-1">
                        <ChevronUp size={14} className="stroke-[3]" />
                        <span>{activeDisplayFloor > 0 ? `FLOOR ${activeDisplayFloor}` : 'BASE (ROUND READY)'}</span>
                      </span>
                      <span className="bg-black/40 px-2 py-0.5 rounded text-[10px] text-cyan-300 font-bold flex items-center gap-1">
                        {activePlayer?.is_perfect && (
                          <Star size={9} className="fill-amber-400 text-amber-400" />
                        )}
                        <span>{activeDisplayMult.toFixed(2)}x</span>
                      </span>
                    </div>

                    {/* Lower Floor Blocks */}
                    {activeDisplayFloor > 1 && (
                      <div className="w-[90%] bg-blue-900/60 border border-blue-700/50 text-slate-300 py-1 px-3 rounded-md flex items-center justify-between text-[10px] font-mono">
                        <span>Floor {activeDisplayFloor - 1}</span>
                        <span className="text-slate-400">
                          {getFloorMultiplier(activeDisplayFloor - 1, activePlayer?.mode).toFixed(2)}x
                        </span>
                      </div>
                    )}
                    {activeDisplayFloor > 2 && (
                      <div className="w-[80%] bg-blue-950/60 border border-blue-900/50 text-slate-400 py-0.5 px-2 rounded-md flex items-center justify-between text-[9px] font-mono">
                        <span>Floor {activeDisplayFloor - 2}</span>
                        <span className="text-slate-500">
                          {getFloorMultiplier(activeDisplayFloor - 2, activePlayer?.mode).toFixed(2)}x
                        </span>
                      </div>
                    )}

                    {/* Foundation Base */}
                    <div className="w-full h-2 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-md border-t border-slate-600 mt-1 shadow-inner" />
                  </div>
                )}
              </div>

              {/* Status footer pill */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 relative z-10 pt-1 border-t border-white/5">
                <span className="truncate max-w-[180px]">Round: {activePlayer?.round_id || '---'}</span>
                <span
                  className={`font-bold ${
                    activePlayer?.status === 'Building' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {activePlayer?.status ? `Status: ${activePlayer.status}` : 'No Active Round'}
                </span>
              </div>

              {/* Cyber grid background pattern */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, #60a5fa 1px, transparent 0)',
                  backgroundSize: '16px 16px',
                }}
              />
            </div>

            {/* Player Metrics Grid */}
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="bg-[#070e24] p-2.5 rounded-xl border border-blue-950/70">
                <span className="text-[10px] text-slate-400 block font-medium">Bet Amount</span>
                <span className="font-mono font-black text-white text-sm block mt-0.5">
                  ₹{(activePlayer?.bet_amount || 0).toFixed(2)}
                </span>
              </div>

              <div className="bg-[#070e24] p-2.5 rounded-xl border border-blue-950/70">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 block font-medium flex items-center gap-1">
                    <Trophy size={11} className="text-amber-400" />
                    <span>Current Payout</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold text-cyan-400">
                    {activeDisplayFloor > 0 ? `Floor ${activeDisplayFloor}` : 'Base Bet'}
                  </span>
                </div>
                <span className="font-mono font-black text-emerald-400 text-sm block mt-0.5">
                  ₹{activeDisplayPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-0.5">
                  <span>Mult: {activeDisplayMult.toFixed(2)}x</span>
                  {activePlayer?.is_perfect && (
                    <span className="text-amber-400 font-bold flex items-center gap-0.5">
                      <Star size={8} className="fill-amber-400" />
                      <span>Perfect Bonus</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-[#070e24] p-2.5 rounded-xl border border-blue-950/70 truncate">
                <span className="text-[10px] text-slate-400 block font-medium">Round ID</span>
                <span className="font-mono font-bold text-slate-300 text-[10px] block mt-0.5 truncate">
                  {activePlayer?.round_id || '---'}
                </span>
              </div>
            </div>

            {/* Player Control Action Buttons */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">
                Player Control (Current Round)
              </span>

              <button
                type="button"
                disabled={!activePlayer || activePlayer.armed || isDropping}
                onClick={() => onForceStopClick(activePlayer.round_id)}
                className={`w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-95 ${
                  activePlayer?.armed
                    ? 'bg-red-950/80 border border-red-500/60 text-red-300 cursor-not-allowed opacity-90'
                    : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30'
                }`}
                title={activePlayer?.armed ? 'Armed! Tower will collapse on next floor drop' : `Force stop round ${activePlayer?.round_id}`}
              >
                <Square size={14} fill="currentColor" />
                <span>{activePlayer?.armed ? 'ARMED ⚠ (COLLAPSE ON NEXT DROP)' : 'Force Stop'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. FLOOR-WISE MULTIPLIER & PAYOUT REFERENCE TABLE (Normal vs PERFECT Drop) */}
      {/* ========================================================================= */}
      <div className="bg-[#0a1128] rounded-2xl border border-blue-900/40 p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3.5">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span className="text-xl">📊</span>
              <span>Floor-wise Payout: Normal vs ⭐ PERFECT Drop</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold flex items-center gap-1">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                <span>Perfect Drop Bonus Matrix</span>
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Official payout multiplier & reward matrix for 🟢 EASY (+0.10x), 🟡 MEDIUM (+0.20x), and 🔴 HARD (+0.35x) tower modes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Interactive Bet Calculator */}
            <div className="flex items-center gap-2 bg-[#070e24] border border-blue-900/60 rounded-xl px-3 py-1.5">
              <span className="text-slate-400 font-medium">Test Bet:</span>
              <div className="flex items-center text-emerald-400 font-mono font-bold">
                <span>₹</span>
                <input
                  type="number"
                  min="1"
                  step="10"
                  value={tableBaseBet}
                  onChange={(e) => setTableBaseBet(Math.max(1, Number(e.target.value) || 100))}
                  className="w-16 bg-transparent text-white font-mono font-bold outline-none pl-1"
                />
              </div>
              <button
                type="button"
                onClick={() => setTableBaseBet(100)}
                className="text-[10px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
              >
                Reset ₹100
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMultiplierTableExpanded((prev) => !prev)}
              className="flex items-center gap-1.5 bg-[#0c1a40] hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
            >
              {multiplierTableExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              <span>{multiplierTableExpanded ? 'Hide Table' : 'Show Table'}</span>
            </button>
          </div>
        </div>

        {multiplierTableExpanded && (
          <div className="space-y-4">
            {/* Mode Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPayoutTableMode('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  payoutTableMode === 'ALL'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 border border-blue-400/50'
                    : 'bg-[#070e24] hover:bg-blue-950/60 text-slate-300 border border-blue-900/50'
                }`}
              >
                <span>🌐 All Modes (Side-by-Side)</span>
              </button>

              <button
                type="button"
                onClick={() => setPayoutTableMode('EASY')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  payoutTableMode === 'EASY'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 border border-emerald-400/50'
                    : 'bg-[#070e24] hover:bg-emerald-950/40 text-emerald-400 border border-emerald-900/50'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>🟢 1. EASY MODE (+0.10x Extra on Perfect)</span>
              </button>

              <button
                type="button"
                onClick={() => setPayoutTableMode('MEDIUM')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  payoutTableMode === 'MEDIUM'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 border border-amber-400/50'
                    : 'bg-[#070e24] hover:bg-amber-950/40 text-amber-400 border border-amber-900/50'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>🟡 2. MEDIUM MODE (+0.20x Extra on Perfect)</span>
              </button>

              <button
                type="button"
                onClick={() => setPayoutTableMode('HARD')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                  payoutTableMode === 'HARD'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 border border-rose-400/50'
                    : 'bg-[#070e24] hover:bg-rose-950/40 text-rose-400 border border-rose-900/50'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-rose-400" />
                <span>🔴 3. HARD MODE (+0.35x Extra on Perfect)</span>
              </button>
            </div>

            {/* TAB VIEW 1: SINGLE MODE TABLE (Exact 5 columns conforming strictly to user spec) */}
            {payoutTableMode !== 'ALL' && (
              <div className="space-y-3">
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    payoutTableMode === 'EASY'
                      ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300'
                      : payoutTableMode === 'HARD'
                      ? 'bg-rose-950/30 border-rose-900/50 text-rose-300'
                      : 'bg-amber-950/30 border-amber-900/50 text-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm">
                      {payoutTableMode === 'EASY'
                        ? '🟢 1. EASY MODE'
                        : payoutTableMode === 'HARD'
                        ? '🔴 3. HARD MODE'
                        : '🟡 2. MEDIUM MODE'}
                    </span>
                    <span className="bg-black/30 px-2.5 py-0.5 rounded-full font-bold">
                      {payoutTableMode === 'EASY'
                        ? '+0.10x Extra on Perfect Drop'
                        : payoutTableMode === 'HARD'
                        ? '+0.35x Extra on Perfect Drop'
                        : '+0.20x Extra on Perfect Drop'}
                    </span>
                  </div>
                  <span className="font-mono text-slate-300">
                    Floor 10+: {payoutTableMode === 'EASY' ? '+2.50x / floor' : payoutTableMode === 'HARD' ? '+25.00x / floor' : '+5.00x / floor'}
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-blue-950/60 shadow-inner">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#081230] border-b border-white/5 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="py-3 px-4 w-32 whitespace-nowrap">Floor / Level</th>
                        <th className="py-3 px-4 whitespace-nowrap text-slate-300">
                          Normal Drop Multiplier
                        </th>
                        <th className="py-3 px-4 whitespace-nowrap text-white">
                          Normal Payout (₹{tableBaseBet} Bet)
                        </th>
                        <th className="py-3 px-4 whitespace-nowrap bg-amber-950/30 text-amber-300 border-x border-amber-900/40">
                          <span className="inline-flex items-center gap-1.5">
                            <Star size={13} className="fill-amber-400 text-amber-400" />
                            <span>⭐ PERFECT Drop Multiplier</span>
                          </span>
                        </th>
                        <th className="py-3 px-4 whitespace-nowrap bg-amber-950/20 text-amber-200">
                          ⭐ PERFECT Payout (₹{tableBaseBet} Bet)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono text-xs">
                      {FLOOR_PAYOUT_ROWS.map((row) => {
                        const normMult =
                          payoutTableMode === 'EASY'
                            ? row.easyMult
                            : payoutTableMode === 'HARD'
                            ? row.hardMult
                            : row.medMult

                        const perfMult =
                          payoutTableMode === 'EASY'
                            ? row.easyPerfectMult
                            : payoutTableMode === 'HARD'
                            ? row.hardPerfectMult
                            : row.medPerfectMult

                        const normPay = (tableBaseBet * normMult).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 0,
                        })
                        const perfPay = (tableBaseBet * perfMult).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 0,
                        })

                        return (
                          <tr
                            key={`single-matrix-${payoutTableMode}-${row.floor}`}
                            className="hover:bg-white/[0.02] transition"
                          >
                            <td className="py-2.5 px-4 font-bold text-slate-200 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="text-slate-500 font-medium">#</span>
                                <span className="text-white font-black">Floor {row.floor}</span>
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-bold text-slate-300 whitespace-nowrap">
                              <span className="bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-700">
                                {normMult.toFixed(2)}x
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-black text-white whitespace-nowrap">
                              ₹{normPay}
                            </td>
                            <td className="py-2.5 px-4 whitespace-nowrap bg-amber-950/15 border-x border-amber-900/30">
                              <span className="inline-flex items-center gap-1.5 font-extrabold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-md shadow-sm shadow-amber-500/20">
                                <Star size={11} className="fill-amber-400 text-amber-400" />
                                <span>{perfMult.toFixed(2)}x</span>
                              </span>
                            </td>
                            <td className="py-2.5 px-4 font-black text-emerald-400 whitespace-nowrap bg-amber-950/10">
                              <span className="text-base text-emerald-300 font-extrabold">
                                ₹{perfPay}
                              </span>
                            </td>
                          </tr>
                        )
                      })}

                      {/* Floor 10+ Scaling Row */}
                      <tr className="bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-indigo-950/40 border-t-2 border-cyan-500/40 font-bold">
                        <td className="py-3 px-4 text-cyan-300 font-black whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5">
                            <Zap size={14} className="text-cyan-400 fill-current" />
                            <span>Floor 10+</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                          <span className="font-black text-white">
                            {payoutTableMode === 'EASY'
                              ? '+2.50x per floor'
                              : payoutTableMode === 'HARD'
                              ? '+25.00x per floor'
                              : '+5.00x per floor'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          <span>
                            (+₹
                            {(
                              tableBaseBet *
                              (payoutTableMode === 'EASY'
                                ? 2.5
                                : payoutTableMode === 'HARD'
                                ? 25.0
                                : 5.0)
                            ).toFixed(0)}{' '}
                            per floor)
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap bg-amber-950/20 border-x border-amber-900/30">
                          <div className="flex items-center gap-1.5 text-amber-300 font-black">
                            <Star size={12} className="fill-amber-400 text-amber-400" />
                            <span>
                              {payoutTableMode === 'EASY'
                                ? '+2.50x + 0.10x'
                                : payoutTableMode === 'HARD'
                                ? '+25.00x + 0.35x'
                                : '+5.00x + 0.20x'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap bg-amber-950/15 text-emerald-300 font-black">
                          <span>
                            (+₹
                            {(
                              tableBaseBet *
                              (payoutTableMode === 'EASY'
                                ? 2.6
                                : payoutTableMode === 'HARD'
                                ? 25.35
                                : 5.2)
                            ).toFixed(0)}{' '}
                            per floor)
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB VIEW 2: ALL MODES SIDE-BY-SIDE COMPARISON TABLE */}
            {payoutTableMode === 'ALL' && (
              <div className="overflow-x-auto rounded-xl border border-blue-950/60 shadow-inner">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#081230] border-b border-white/5 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-3 w-28 whitespace-nowrap" rowSpan={2}>
                        Floor / Level
                      </th>
                      <th
                        className="py-2 px-3 text-center bg-emerald-950/30 text-emerald-400 border-x border-emerald-900/40"
                        colSpan={2}
                      >
                        <span className="inline-flex items-center gap-1.5 font-black">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          <span>🟢 EASY MODE (+0.10x Perfect)</span>
                        </span>
                      </th>
                      <th
                        className="py-2 px-3 text-center bg-amber-950/30 text-amber-400 border-r border-amber-900/40"
                        colSpan={2}
                      >
                        <span className="inline-flex items-center gap-1.5 font-black">
                          <span className="h-2 w-2 rounded-full bg-amber-400" />
                          <span>🟡 MEDIUM MODE (+0.20x Perfect)</span>
                        </span>
                      </th>
                      <th
                        className="py-2 px-3 text-center bg-rose-950/30 text-rose-400"
                        colSpan={2}
                      >
                        <span className="inline-flex items-center gap-1.5 font-black">
                          <span className="h-2 w-2 rounded-full bg-rose-400" />
                          <span>🔴 HARD MODE (+0.35x Perfect)</span>
                        </span>
                      </th>
                    </tr>
                    <tr className="text-[10px] bg-[#060c20] border-t border-white/5">
                      {/* Easy columns */}
                      <th className="py-1.5 px-2 bg-emerald-950/20 text-slate-300 border-l border-emerald-900/30">
                        Normal Drop
                      </th>
                      <th className="py-1.5 px-2 bg-emerald-950/30 text-amber-300 border-r border-emerald-900/30">
                        ⭐ PERFECT (+0.10x)
                      </th>

                      {/* Medium columns */}
                      <th className="py-1.5 px-2 bg-amber-950/20 text-slate-300">
                        Normal Drop
                      </th>
                      <th className="py-1.5 px-2 bg-amber-950/30 text-amber-300 border-r border-amber-900/30">
                        ⭐ PERFECT (+0.20x)
                      </th>

                      {/* Hard columns */}
                      <th className="py-1.5 px-2 bg-rose-950/20 text-slate-300">
                        Normal Drop
                      </th>
                      <th className="py-1.5 px-2 bg-rose-950/30 text-amber-300">
                        ⭐ PERFECT (+0.35x)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-xs">
                    {FLOOR_PAYOUT_ROWS.map((row) => {
                      const easyNormPay = (tableBaseBet * row.easyMult).toLocaleString('en-IN', { maximumFractionDigits: 0 })
                      const easyPerfPay = (tableBaseBet * row.easyPerfectMult).toLocaleString('en-IN', { maximumFractionDigits: 0 })

                      const medNormPay = (tableBaseBet * row.medMult).toLocaleString('en-IN', { maximumFractionDigits: 0 })
                      const medPerfPay = (tableBaseBet * row.medPerfectMult).toLocaleString('en-IN', { maximumFractionDigits: 0 })

                      const hardNormPay = (tableBaseBet * row.hardMult).toLocaleString('en-IN', { maximumFractionDigits: 0 })
                      const hardPerfPay = (tableBaseBet * row.hardPerfectMult).toLocaleString('en-IN', { maximumFractionDigits: 0 })

                      return (
                        <tr key={`matrix-floor-${row.floor}`} className="hover:bg-white/[0.02] transition">
                          <td className="py-2 px-3 font-bold text-slate-200 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1">
                              <span className="text-slate-500 font-medium">#</span>
                              <span className="text-white font-black">Floor {row.floor}</span>
                            </span>
                          </td>

                          {/* EASY MODE */}
                          <td className="py-2 px-2 whitespace-nowrap bg-emerald-950/10 border-l border-emerald-900/20">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-slate-300 font-bold">{row.easyMult.toFixed(2)}x</span>
                              <span className="text-white font-extrabold text-[11px]">₹{easyNormPay}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap bg-emerald-950/20 border-r border-emerald-900/30">
                            <div className="flex items-center justify-between gap-1 text-amber-300 font-bold">
                              <span className="inline-flex items-center gap-0.5">
                                <Star size={9} className="fill-amber-400 text-amber-400" />
                                <span>{row.easyPerfectMult.toFixed(2)}x</span>
                              </span>
                              <span className="text-emerald-300 font-black text-[11px]">₹{easyPerfPay}</span>
                            </div>
                          </td>

                          {/* MEDIUM MODE */}
                          <td className="py-2 px-2 whitespace-nowrap bg-amber-950/10">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-slate-300 font-bold">{row.medMult.toFixed(2)}x</span>
                              <span className="text-white font-extrabold text-[11px]">₹{medNormPay}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap bg-amber-950/20 border-r border-amber-900/30">
                            <div className="flex items-center justify-between gap-1 text-amber-300 font-bold">
                              <span className="inline-flex items-center gap-0.5">
                                <Star size={9} className="fill-amber-400 text-amber-400" />
                                <span>{row.medPerfectMult.toFixed(2)}x</span>
                              </span>
                              <span className="text-emerald-300 font-black text-[11px]">₹{medPerfPay}</span>
                            </div>
                          </td>

                          {/* HARD MODE */}
                          <td className="py-2 px-2 whitespace-nowrap bg-rose-950/10">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-slate-300 font-bold">{row.hardMult.toFixed(2)}x</span>
                              <span className="text-white font-extrabold text-[11px]">₹{hardNormPay}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2 whitespace-nowrap bg-rose-950/20">
                            <div className="flex items-center justify-between gap-1 text-amber-300 font-bold">
                              <span className="inline-flex items-center gap-0.5">
                                <Star size={9} className="fill-amber-400 text-amber-400" />
                                <span>{row.hardPerfectMult.toFixed(2)}x</span>
                              </span>
                              <span className="text-emerald-300 font-black text-[11px]">₹{hardPerfPay}</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}

                    {/* Floor 10+ Scaling Row */}
                    <tr className="bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-indigo-950/40 border-t-2 border-cyan-500/40 font-bold text-[10px]">
                      <td className="py-2.5 px-3 text-cyan-300 font-black whitespace-nowrap">
                        <span className="inline-flex items-center gap-1">
                          <Zap size={12} className="text-cyan-400 fill-current" />
                          <span>Floor 10+</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-slate-300 whitespace-nowrap border-l border-emerald-900/30 bg-emerald-950/15">
                        <span>+2.50x / fl</span>
                      </td>
                      <td className="py-2.5 px-2 text-amber-300 whitespace-nowrap border-r border-emerald-900/30 bg-emerald-950/25">
                        <span>+2.50x + 0.10x</span>
                      </td>

                      <td className="py-2.5 px-2 text-slate-300 whitespace-nowrap bg-amber-950/15">
                        <span>+5.00x / fl</span>
                      </td>
                      <td className="py-2.5 px-2 text-amber-300 whitespace-nowrap border-r border-amber-900/30 bg-amber-950/25">
                        <span>+5.00x + 0.20x</span>
                      </td>

                      <td className="py-2.5 px-2 text-slate-300 whitespace-nowrap bg-rose-950/15">
                        <span>+25.00x / fl</span>
                      </td>
                      <td className="py-2.5 px-2 text-amber-300 whitespace-nowrap bg-rose-950/25">
                        <span>+25.00x + 0.35x</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. FULL-WIDTH RECENT ROUNDS HISTORY TABLE (Spanning Full Page Width)      */}
      {/* ========================================================================= */}
      <div className="bg-[#0a1128] rounded-2xl border border-blue-900/40 p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3.5">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <RotateCcw size={18} className="text-blue-400" />
              <span>Recent Rounds History</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono font-bold">
                {filteredHistory.length} Records
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live database records of all completed, cashed out and obstacle-toppled Stack Tower rounds across the system.
            </p>
          </div>

          {/* Filter Controls: Search, Mode, Result & Refresh */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="relative">
              <input
                type="text"
                value={historySearch}
                onChange={(e) => {
                  setHistorySearch(e.target.value)
                  setHistoryPage(1)
                }}
                placeholder="Search User ID / Round ID..."
                className="bg-[#070e24] border border-blue-900/60 rounded-xl pl-3 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none w-48 sm:w-56"
              />
              <Search size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <select
              value={historyModeFilter}
              onChange={(e) => {
                setHistoryModeFilter(e.target.value)
                setHistoryPage(1)
              }}
              className="bg-[#070e24] border border-blue-900/60 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none cursor-pointer"
            >
              <option value="All">All Modes</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={historyResultFilter}
              onChange={(e) => {
                setHistoryResultFilter(e.target.value)
                setHistoryPage(1)
              }}
              className="bg-[#070e24] border border-blue-900/60 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none cursor-pointer"
            >
              <option value="All">All Results</option>
              <option value="Won">Won</option>
              <option value="Cashout">Cashout</option>
              <option value="Lost">Lost / Dropped</option>
            </select>

            <button
              onClick={handleManualRefreshHistory}
              disabled={isRefreshingHistory}
              title="Refresh History from Database"
              className="flex items-center gap-1.5 bg-[#0c1a40] hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 px-3 py-1.5 rounded-xl font-bold transition cursor-pointer"
            >
              <RefreshCw size={13} className={isRefreshingHistory ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Full-width Responsive Table */}
        <div className="overflow-x-auto rounded-xl border border-blue-950/60">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#081230] border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center whitespace-nowrap">#</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Time & Date</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Round ID</th>
                <th className="py-2.5 px-3 whitespace-nowrap">User ID</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Mode</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Bet Amount</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Floor Reached</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Multiplier</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Result</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Payout</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Reason / Trigger</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px]">
              {paginatedHistory.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-10 text-center text-slate-500 italic whitespace-nowrap">
                    No history records found. Real-time completed, cashed-out and obstacle-dropped rounds will automatically appear here.
                  </td>
                </tr>
              ) : (
                paginatedHistory.map((h, idx) => {
                  const globalIdx = (historyPage - 1) * historyPerPage + idx + 1
                  const isWon = h.result === 'Won' || h.result === 'Cashout'
                  const modeColor =
                    h.mode === 'Easy'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : h.mode === 'Hard'
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/30'

                  return (
                    <tr key={`hist-${h.round_id || h.id || 'h'}-${globalIdx}`} className="hover:bg-white/[0.02] transition">
                      <td className="py-2.5 px-3 text-slate-500 text-center whitespace-nowrap">{globalIdx}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[10px] whitespace-nowrap">{h.time}</td>
                      <td className="py-2.5 px-3 text-slate-300 font-bold whitespace-nowrap">{h.round_id || '---'}</td>
                      <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${isWon ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          <span>#{h.userid}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${modeColor}`}>
                          {h.mode || 'Medium'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">₹{Number(h.bet || 0).toFixed(2)}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="text-amber-400 font-black inline-flex items-center gap-0.5">
                          <ChevronUp size={13} className="stroke-[3]" />
                          <span>Floor {h.floor || 1}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-emerald-400 font-extrabold whitespace-nowrap">
                        {getFloorMultiplier(h.floor || 1, h.mode).toFixed(2)}x
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            isWon
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {h.result}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white whitespace-nowrap">
                        {isWon ? (
                          <span className="text-emerald-400 font-black">
                            ₹{calculateFloorPayout(h.bet || 100, h.floor || 1, h.mode).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-slate-500">₹0.00</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[10px] font-sans whitespace-nowrap">
                        {h.reason || (isWon ? 'Cashed Out' : 'Tower Toppled')}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredHistory.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 text-xs text-slate-400 border-t border-white/5">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span>
                Showing <strong className="font-bold text-white font-mono">{(historyPage - 1) * historyPerPage + 1}</strong> to{' '}
                <strong className="font-bold text-white font-mono">{Math.min(historyPage * historyPerPage, filteredHistory.length)}</strong> of{' '}
                <strong className="font-bold text-white font-mono">{filteredHistory.length}</strong> entries
              </span>

              <select
                value={historyPerPage}
                onChange={(e) => {
                  setHistoryPerPage(Number(e.target.value))
                  setHistoryPage(1)
                }}
                className="ml-3 bg-[#070e24] border border-blue-900/60 rounded-lg px-2 py-1 text-xs text-slate-200 outline-none cursor-pointer"
              >
                <option value={5}>5 / page</option>
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto whitespace-nowrap">
              <button
                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                disabled={historyPage === 1}
                className="p-1.5 rounded-lg bg-[#070e24] border border-blue-900/60 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-900/40 cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-3 py-1 rounded-lg bg-[#070e24] border border-blue-900/60 text-white font-mono font-bold text-xs">
                {historyPage} / {totalHistoryPages}
              </span>
              <button
                onClick={() => setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))}
                disabled={historyPage === totalHistoryPages}
                className="p-1.5 rounded-lg bg-[#070e24] border border-blue-900/60 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-900/40 cursor-pointer"
                title="Next Page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        title="Confirm Force Drop"
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, player: null, action: '' })}
        width="max-w-md"
      >
        <div className="space-y-4 text-slate-900">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white">
              <ShieldAlert size={22} />
            </div>
            <div>
              <h4 className="font-black text-sm">Force Drop User #{confirmModal.player?.userid}</h4>
              <p className="text-xs text-rose-700">
                Are you sure you want to crash this player's tower at Floor #{confirmModal.player?.current_floor}? Round will be marked LOST.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn-ghost !py-2 text-xs"
              onClick={() => setConfirmModal({ open: false, player: null, action: '' })}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleForceDrop(confirmModal.player)}
              disabled={isDropping}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-4 py-2 shadow-md transition"
            >
              <Zap size={14} fill="currentColor" />
              <span>{isDropping ? 'Toppling...' : 'Yes, Force Drop Now'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* FORCE STOP SUCCESS POPUP MODAL (REPLACING BROWSER ALERT)                  */}
      {/* ========================================================================= */}
      {forceStopModal.open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setForceStopModal({ open: false, round_id: '', player: null, message: '', success: true })}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-red-500/40 bg-gradient-to-b from-[#180a1d] via-[#0d0718] to-[#06030c] p-5 sm:p-6 text-white shadow-2xl shadow-red-950/80 transition-all animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Glowing Shield Icon */}
            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white shadow-lg shadow-red-600/50 border border-red-400">
                <ShieldAlert size={26} className="animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-black text-white">Tower Collapse Armed</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white animate-pulse border border-red-400 shadow-sm shadow-red-600/40">
                    ARMED ⚠
                  </span>
                </div>
                <p className="text-xs text-rose-300/80 mt-0.5">
                  Admin Force Stop Command Executed
                </p>
              </div>
              <button
                type="button"
                onClick={() => setForceStopModal({ open: false, round_id: '', player: null, message: '', success: true })}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
                title="Close"
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Server Message Box */}
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/30 p-3.5 text-xs text-red-200 leading-relaxed font-sans">
              <div className="flex items-start gap-2">
                <span className="text-rose-400 font-bold shrink-0">Server:</span>
                <p className="font-semibold text-rose-100">{forceStopModal.message}</p>
              </div>
              <p className="mt-2 text-[11px] text-rose-300/75 border-t border-red-500/20 pt-2">
                Is player ke agla floor rakhte hi tower collapse ho jayega aur round LOST mark ho jayega. Player cash out nahi kar sakega.
              </p>
            </div>

            {/* Round & Target Details */}
            {forceStopModal.round_id && (
              <div className="mt-4 rounded-xl border border-white/10 bg-[#070b1a] p-3 text-xs space-y-2 font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400 font-sans text-[11px]">Round ID:</span>
                  <span className="font-bold text-white text-[11px]">{forceStopModal.round_id}</span>
                </div>
                {forceStopModal.player && (
                  <>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400 font-sans text-[11px]">Player:</span>
                      <span className="font-bold text-cyan-400">{forceStopModal.player.username || `User #${forceStopModal.player.userid}`} (#{forceStopModal.player.userid})</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400 font-sans text-[11px]">Game Mode:</span>
                      <span className="font-bold text-amber-400">{forceStopModal.player.mode}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400 font-sans text-[11px]">Current Floor / Mult:</span>
                      <span className="font-bold text-emerald-400">Floor {forceStopModal.player.current_floor} ({Number(forceStopModal.player.multiplier || 1).toFixed(2)}x)</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400 font-sans text-[11px]">Bet Amount:</span>
                      <span className="font-bold text-white">₹{Number(forceStopModal.player.bet_amount || 0).toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between text-slate-300 pt-1.5 border-t border-white/5">
                  <span className="text-slate-400 font-sans text-[11px]">Target Status:</span>
                  <span className="font-black text-rose-400 uppercase tracking-wide">ARMED - PENDING COLLAPSE</span>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setForceStopModal({ open: false, round_id: '', player: null, message: '', success: true })}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition cursor-pointer active:scale-95"
              >
                Theek Hai (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {toastNode}
    </div>
  )
}
