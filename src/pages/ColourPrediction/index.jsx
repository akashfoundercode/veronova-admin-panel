import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import {
  Palette, Timer, Zap, Clock, Trophy, Users, Coins, BarChart3, User,
  Radio, RefreshCw, CheckCircle2, ShieldCheck, Flame, Lock, Unlock,
  Volume2, VolumeX, Sliders, Sparkles, TrendingUp, AlertTriangle,
  History, ArrowUpRight, Copy, Check, ChevronRight, Award, Crown
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, money, useToast, Modal } from '@/components/ui'
import { wingoSocket } from '@/services/wingoSocket'
import { SOCKET_CONFIG } from '@/constants/socketConfig'
import { API_ENDPOINTS, WINGO_API } from '@/constants/api'
import { apiRequest } from '@/utils/apiClient'

// 4 WinGo Modes mapped to exact backend game_id:
// 30 sec -> game_id: 1
// 1 min  -> game_id: 2
// 3 min  -> game_id: 3
// 5 min  -> game_id: 4
const WINGO_MODES = [
  { id: '30sec', game_id: 1, label: 'WinGo 30 Sec', key: 'thirtySecTimer', totalSec: 30, icon: Zap, theme: 'from-rose-600 via-pink-600 to-purple-700', neon: 'border-rose-500/40 text-rose-400' },
  { id: '1min', game_id: 2, label: 'WinGo 1 Min', key: 'oneMinTimer', totalSec: 60, icon: Zap, theme: 'from-blue-600 via-indigo-600 to-purple-700', neon: 'border-blue-500/40 text-blue-400' },
  { id: '3min', game_id: 3, label: 'WinGo 3 Min', key: 'threeMinTimer', totalSec: 180, icon: Clock, theme: 'from-amber-600 via-orange-600 to-rose-700', neon: 'border-amber-500/40 text-amber-400' },
  { id: '5min', game_id: 4, label: 'WinGo 5 Min', key: 'fiveMinTimer', totalSec: 300, icon: Clock, theme: 'from-emerald-600 via-teal-600 to-cyan-700', neon: 'border-emerald-500/40 text-emerald-400' },
]

// Ball Colors: 0 = Red+Violet, 5 = Green+Violet, Odd = Green, Even = Red
const getBallColorInfo = (num) => {
  const n = Number(num)
  if (n === 0) return { bg: 'bg-gradient-to-br from-rose-600 to-purple-600', text: 'Red + Violet', type: 'special', isBig: false }
  if (n === 5) return { bg: 'bg-gradient-to-br from-emerald-600 to-purple-600', text: 'Green + Violet', type: 'special', isBig: true }
  if (n % 2 === 1) return { bg: 'bg-emerald-600', text: 'Green', type: 'green', isBig: n >= 5 }
  return { bg: 'bg-rose-600', text: 'Red', type: 'red', isBig: n >= 5 }
}

const getBetAmount = (bet) => {
  const raw = bet?.amount ?? bet?.bet_amount ?? bet?.money ?? bet?.stake ?? bet?.total_amount ?? bet?.betAmount
  const amount = Number(String(raw ?? 0).replace(/[₹,\s]/g, ''))
  return Number.isFinite(amount) ? amount : 0
}

const getBetSelection = (bet) => {
  const raw = bet?.number ?? bet?.num ?? bet?.bet_number ?? bet?.betNumber ?? bet?.pick ??
    bet?.bet_type ?? bet?.betType ?? bet?.chosen ?? bet?.select ?? bet?.selection ?? bet?.bet_on ?? bet?.bet
  const num = Number(raw)
  if (Number.isInteger(num)) {
    if (num >= 0 && num <= 9) return { kind: 'number', value: num }
    if (num === 10) return { kind: 'choice', value: 'green' }
    if (num === 20) return { kind: 'choice', value: 'violet' }
    if (num === 30) return { kind: 'choice', value: 'red' }
    if (num === 40) return { kind: 'choice', value: 'big' }
    if (num === 50) return { kind: 'choice', value: 'small' }
  }
  const value = String(raw ?? '').trim().toLowerCase()
  if (/^(green|red|violet|big|small)$/.test(value)) return { kind: 'choice', value }
  const numberMatch = value.match(/(?:ball\s*)?([0-9]+)/)
  if (numberMatch) {
    const val = Number(numberMatch[1])
    if (val >= 0 && val <= 9) return { kind: 'number', value: val }
    if (val === 10) return { kind: 'choice', value: 'green' }
    if (val === 20) return { kind: 'choice', value: 'violet' }
    if (val === 30) return { kind: 'choice', value: 'red' }
    if (val === 40) return { kind: 'choice', value: 'big' }
    if (val === 50) return { kind: 'choice', value: 'small' }
  }
  return { kind: 'unknown', value }
}

const extractBetRows = (response) => {
  const candidates = [response, response?.bets, response?.data, response?.data?.bets, response?.data?.data,
    response?.result, response?.result?.bets, response?.rows, response?.data?.rows]
  return candidates.find(Array.isArray) || null
}

// Fallback Seeds in case backend is offline
const SEED_LAST_FIVE = [
  { id: 5, period: '20261016108977', num: 9, colour: 'Green', isBig: true, time: '10:04:00' },
  { id: 4, period: '20261016108976', num: 1, colour: 'Green', isBig: false, time: '10:03:00' },
  { id: 3, period: '20261016108975', num: 0, colour: 'Red + Violet', isBig: false, time: '10:02:00' },
  { id: 2, period: '20261016108974', num: 7, colour: 'Green', isBig: true, time: '10:01:00' },
  { id: 1, period: '20261016108973', num: 2, colour: 'Red', isBig: false, time: '10:00:00' },
]

const SEED_BETS = [
  { id: 101, user: 'User_8921', period: '20261016108978', pick: 'Green', amount: 500, time: 'Just now' },
  { id: 102, user: 'User_3310', period: '20261016108978', pick: 'Big (5-9)', amount: 1000, time: '12s ago' },
  { id: 103, user: 'User_5192', period: '20261016108978', pick: 'Ball 7', amount: 200, time: '25s ago' },
  { id: 104, user: 'User_7718', period: '20261016108978', pick: 'Red', amount: 1500, time: '40s ago' },
  { id: 105, user: 'User_9941', period: '20261016108978', pick: 'Small (0-4)', amount: 350, time: '52s ago' },
]

// Audio Synthesizer Beep (Browser Web Audio API)
const playCountdownTone = (freq = 880, duration = 0.08) => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ctx.currentTime)
    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
  } catch {}
}

export default function ColourPrediction() {
  const [activeModeIndex, setActiveModeIndex] = useState(0)
  const [tab, setTab] = useState('results')
  const [socketConnected, setSocketConnected] = useState(wingoSocket.isConnected)
  const [wingoData, setWingoData] = useState(wingoSocket.lastPacket)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isLoadingApi, setIsLoadingApi] = useState(false)
  const [toast, toastNode] = useToast()

  // API State
  const [resultsList, setResultsList] = useState([])
  const [lastFiveResults, setLastFiveResults] = useState(SEED_LAST_FIVE)
  const [lastResult, setLastResult] = useState(SEED_LAST_FIVE[0])
  const [betsList, setBetsList] = useState(SEED_BETS)
  const [betHistoryList, setBetHistoryList] = useState([])
  const [winAmountStats, setWinAmountStats] = useState({
    totalAdminProfit: 98450.50,
    totalUserProfit: 42310.20,
    todayAdminProfit: 1420.80,
    todayUserProfit: 890.40,
  })

  const [backendPeriodNo, setBackendPeriodNo] = useState(null)
  const [poolTotals, setPoolTotals] = useState({
    green: 0,
    violet: 0,
    red: 0,
    small: 0,
    big: 0,
    numberAmounts: Array(10).fill(0),
  })

  // Admin Result Override Modal & Direct Set Outcome State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)
  const [targetBallNumber, setTargetBallNumber] = useState(7)
  const [targetBallColor, setTargetBallColor] = useState('Green')
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false)
  const [adminSetWinner, setAdminSetWinner] = useState(null)

  const prevSecondRef = useRef(null)
  const lastFetchedPeriodRef = useRef(null)

  const currentMode = WINGO_MODES[activeModeIndex]
  const currentSeconds = Math.max(0, Number(wingoData?.[currentMode.key] ?? 0))
  const timerBetThreshold = wingoData?.timerBetTime ?? 10
  const isBettingLocked = currentSeconds <= timerBetThreshold
  const isLastFiveSeconds = currentSeconds > 0 && currentSeconds <= 5

  // Generated Period Number from Timestamp (Fallback if backend /fetch has no rows yet)
  const fallbackPeriod = useMemo(() => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const modeOffset = (activeModeIndex + 1) * 100000
    const minsPassed = now.getHours() * 60 + now.getMinutes()
    const periodSequence = String(minsPassed + 1000).slice(-4)
    return `${y}${m}${d}${modeOffset + Number(periodSequence)}`
  }, [activeModeIndex])

  // Real Period Number from backend betlogs or fallback
  const currentPeriod = backendPeriodNo || fallbackPeriod

  // Reset function to clear pool amounts & bets when a round finishes
  const resetCurrentRoundPools = useCallback(() => {
    setPoolTotals({
      green: 0,
      violet: 0,
      red: 0,
      small: 0,
      big: 0,
      numberAmounts: Array(10).fill(0),
    })
    setBetsList([])
    setAdminSetWinner(null)
  }, [])

  // --- API Fetchers with integer game_id ---
  const activeGameId = Number(currentMode.game_id)

  // 1. Fetch Backend Bets & Live Pools from /api/admin/wingo/live/:gameid & fallback /fetch/{gameid}
  const fetchBackendBets = useCallback(async () => {
    try {
      const gId = Number(currentMode.game_id)
      const endpoints = [
        `/api/admin/wingo/live/${gId}`,
        `/admin/wingo/live/${gId}`,
        `/bets?game_id=${gId}`,
        `/api/bets?game_id=${gId}`,
        `/fetch/${gId}`,
        `/api/fetch/${gId}`,
        API_ENDPOINTS.WINGO_FETCH(gId),
      ]
      let json = null
      for (const ep of endpoints) {
        if (!ep) continue
        try {
          json = await apiRequest(ep, { method: 'GET' })
          if (json && (json.data || json.bets || json.pools || Array.isArray(json))) break
        } catch {}
      }

      // 1. Structured live snapshot from /api/admin/wingo/live/:gameid
      if (json && (json.data?.pools || json.pools)) {
        const liveData = json.data || json
        if (liveData.games_no) {
          setBackendPeriodNo(String(liveData.games_no))
        }
        const pools = liveData.pools || {}
        const numAmounts = Array(10).fill(0)
        if (Array.isArray(pools.numbers)) {
          pools.numbers.forEach((item) => {
            const n = Number(item.number)
            if (n >= 0 && n <= 9) {
              numAmounts[n] = Number(item.amount ?? 0)
            }
          })
        }
        setPoolTotals({
          green: Number(pools.color?.green ?? 0),
          violet: Number(pools.color?.violet ?? 0),
          red: Number(pools.color?.red ?? 0),
          small: Number(pools.size?.small ?? 0),
          big: Number(pools.size?.big ?? 0),
          numberAmounts: numAmounts,
        })
        const activeBets = Array.isArray(liveData.active_bets)
          ? liveData.active_bets
          : Array.isArray(liveData.data)
            ? liveData.data
            : []
        setBetsList(activeBets)
        return
      }

      // 2. Fallback for /bets or /fetch/{gameid} array
      const bets = extractBetRows(json)
      if (bets && Array.isArray(bets)) {
        setBetsList(bets)
        const firstCurrentBet = bets.find((bet) => bet.games_no || bet.period || bet.game_no)
        const gameNo = firstCurrentBet?.games_no ?? firstCurrentBet?.period ?? firstCurrentBet?.game_no
        if (gameNo) setBackendPeriodNo(String(gameNo))

        let green = 0
        let violet = 0
        let red = 0
        let small = 0
        let big = 0
        const nums = Array(10).fill(0)

        bets.forEach((bet) => {
          const selection = getBetSelection(bet)
          const amt = getBetAmount(bet)
          if (selection.kind === 'number') {
            const num = selection.value
            if (num >= 0 && num <= 9) {
              nums[num] += amt
              if ([1, 3, 7, 9].includes(num)) green += amt
              if ([0, 5].includes(num)) violet += amt
              if ([2, 4, 6, 8].includes(num)) red += amt
              if (num <= 4) small += amt
              if (num >= 5) big += amt
            }
          } else if (selection.kind === 'choice') {
            if (selection.value === 'green') green += amt
            if (selection.value === 'violet') violet += amt
            if (selection.value === 'red') red += amt
            if (selection.value === 'small') small += amt
            if (selection.value === 'big') big += amt
          }
        })

        setPoolTotals({ green, violet, red, small, big, numberAmounts: nums })
      }
    } catch (err) {
      console.warn('[WinGo /fetch/{gameid}] Fetch error:', err)
    }
  }, [currentMode.game_id])

  // 2. Fetch Results List (/results?game_id=...)
  const fetchResults = useCallback(async () => {
    try {
      const q = `?game_id=${Number(currentMode.game_id)}&limit=10`
      const endpoints = [
        WINGO_API.wingoResults ? `${WINGO_API.wingoResults}${q}` : null,
        `/results${q}`,
        `${API_ENDPOINTS.WINGO_RESULTS_PROXY}${q}`,
        API_ENDPOINTS.WINGO_RESULTS_PROXY ? `${API_ENDPOINTS.WINGO_RESULTS_PROXY}${q}` : null,
        `/api/results${q}`,
      ]
      let json = null
      for (const ep of endpoints) {
        if (!ep) continue
        try {
          json = await apiRequest(ep, { method: 'GET' })
          if (json) break
        } catch {}
      }
      const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : null
      if (list && list.length > 0) {
        setResultsList(list)
      } else if (resultsList.length === 0) {
        setResultsList(SEED_LAST_FIVE)
      }
    } catch (err) {
      console.warn('[WinGo API] Results fetch error:', err)
    }
  }, [currentMode.game_id, resultsList.length])

  // 3. Fetch Last Five Results (/last_five_result?game_id=...)
  const fetchLastFive = useCallback(async () => {
    try {
      const q = `?game_id=${Number(currentMode.game_id)}`
      const endpoints = [
        WINGO_API.wingoLastFiveResult ? `${WINGO_API.wingoLastFiveResult}${q}` : null,
        `/last_five_result${q}`,
        `${API_ENDPOINTS.WINGO_LAST_FIVE_RESULT_PROXY}${q}`,
        API_ENDPOINTS.WINGO_LAST_FIVE_RESULT_PROXY ? `${API_ENDPOINTS.WINGO_LAST_FIVE_RESULT_PROXY}${q}` : null,
        `/api/last_five_result${q}`,
      ]
      let json = null
      for (const ep of endpoints) {
        if (!ep) continue
        try {
          json = await apiRequest(ep, { method: 'GET' })
          if (json) break
        } catch {}
      }
      const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : null
      if (list && list.length > 0) {
        setLastFiveResults(list)
      }
    } catch (err) {
      console.warn('[WinGo API] Last 5 fetch error:', err)
    }
  }, [currentMode.game_id])

  // 4. Fetch Immediate Last Result (/last_result?game_id=...)
  const fetchLastResult = useCallback(async () => {
    try {
      const gId = Number(currentMode.game_id)
      const q = `?game_id=${Number(currentMode.game_id)}`
      const endpoints = [
        WINGO_API.wingoGetResult ? WINGO_API.wingoGetResult(gId) : null,
        WINGO_API.wingoLastResult ? `${WINGO_API.wingoLastResult}${q}` : null,
        `/last_result${q}`,
        `${API_ENDPOINTS.WINGO_LAST_RESULT_PROXY}${q}`,
        API_ENDPOINTS.WINGO_LAST_RESULT_PROXY ? `${API_ENDPOINTS.WINGO_LAST_RESULT_PROXY}${q}` : null,
        `/api/last_result${q}`,
      ]
      let json = null
      for (const ep of endpoints) {
        if (!ep) continue
        try {
          json = await apiRequest(ep, { method: 'GET' })
          if (json) break
        } catch {}
      }
      const res = json?.data || json
      if (res && (res.num !== undefined || res.number !== undefined || res.result !== undefined)) {
        setLastResult(res)
      }
    } catch (err) {
      console.warn('[WinGo API] Last result fetch error:', err)
    }
  }, [currentMode.game_id])

  // 5. Fetch Win Amounts & Stats (/win-amount?game_id=...)
  const fetchWinAmount = useCallback(async () => {
    try {
      const q = `?game_id=${Number(currentMode.game_id)}`
      const endpoints = [
        WINGO_API.wingoWinAmount ? `${WINGO_API.wingoWinAmount}${q}` : null,
        `/win-amount${q}`,
        `${API_ENDPOINTS.WINGO_WIN_AMOUNT_PROXY}${q}`,
        API_ENDPOINTS.WINGO_WIN_AMOUNT_PROXY ? `${API_ENDPOINTS.WINGO_WIN_AMOUNT_PROXY}${q}` : null,
        `/api/win-amount${q}`,
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
        setWinAmountStats((prev) => ({
          totalAdminProfit: Number(data.total_admin_profit ?? data.totalAdminProfit ?? prev.totalAdminProfit),
          totalUserProfit: Number(data.total_user_profit ?? data.totalUserProfit ?? prev.totalUserProfit),
          todayAdminProfit: Number(data.today_admin_profit ?? data.todayAdminProfit ?? prev.todayAdminProfit),
          todayUserProfit: Number(data.today_user_profit ?? data.todayUserProfit ?? prev.todayUserProfit),
        }))
      }
    } catch (err) {
      console.warn('[WinGo API] Win amount fetch error:', err)
    }
  }, [currentMode.game_id])

  // 6. Fetch Bet History via POST (/api/bet_history & /bet_history)
  const fetchBetHistory = useCallback(async () => {
    try {
      const gId = Number(currentMode.game_id)
      const endpoints = [
        `/api/bet_history`,
        '/api/bet_history',
        `/bet_history`,
        `${API_ENDPOINTS.WINGO_BET_HISTORY_PROXY}`,
      ]
      let json = null
      for (const ep of endpoints) {
        if (!ep) continue
        try {
          json = await apiRequest(ep, {
            method: 'POST',
            body: JSON.stringify({ game_id: gId }),
          })
          if (json) break
        } catch {}
      }
      const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : null
      if (list && list.length > 0) {
        setBetHistoryList(list)
      }
    } catch (err) {
      console.warn('[WinGo API] Bet history fetch error:', err)
    }
  }, [currentMode.game_id])

  // Manual Full Sync
  const handleFullRefresh = async () => {
    setIsLoadingApi(true)
    await Promise.allSettled([
      fetchBackendBets(),
      fetchResults(),
      fetchLastFive(),
      fetchLastResult(),
      fetchWinAmount(),
      fetchBetHistory(),
    ])
    setIsLoadingApi(false)
    toast('WinGo data synchronised successfully with backend APIs', 'success')
  }

  // Initial Load & on interval mode change
  useEffect(() => {
    fetchBackendBets()
    fetchResults()
    fetchLastFive()
    fetchLastResult()
    fetchWinAmount()
    fetchBetHistory()
  }, [activeModeIndex, fetchBackendBets, fetchResults, fetchLastFive, fetchLastResult, fetchWinAmount, fetchBetHistory])

  // Socket Subscription
  useEffect(() => {
    const unsubscribe = wingoSocket.subscribe((event) => {
      if (event.type === 'CONNECTION_CHANGE') {
        setSocketConnected(Boolean(event.connected))
      } else if (event.type === 'WINGO_PACKET' || event.type === 'WINGO_TICK') {
        if (event.packet) {
          setWingoData(event.packet)
          setSocketConnected(true)
        }
      }
    })
    return () => {
      unsubscribe()
    }
  }, [])

  // 7. Fetch Admin Set Results (/fetch_admin_set_Results/:id)
  const fetchAdminSetResults = useCallback(async () => {
    try {
      const gId = Number(currentMode.game_id)
      const endpoints = [
        `/api/fetch_admin_set_Results/${gId}`,
        `/fetch_admin_set_Results/${gId}`,
        WINGO_API.wingoAdminSetResultUrl ? WINGO_API.wingoAdminSetResultUrl(gId) : null,
        `/api/fetchhistory/${gId}`,
        `/fetchhistory/${gId}`,
      ]
      let json = null
      for (const ep of endpoints) {
        if (!ep) continue
        try {
          json = await apiRequest(ep, { method: 'GET' })
          if (json) break
        } catch {}
      }
      const rows = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : json?.bets || []
      if (Array.isArray(rows) && rows.length > 0) {
        const match = rows.find((r) => String(r.gamesno || r.period || r.game_no) === String(currentPeriod))
        if (match) {
          const num = Number(match.number ?? match.card_number ?? 0)
          const info = getBallColorInfo(num)
          setAdminSetWinner({
            number: num,
            color: info.text,
            size: num >= 5 ? 'Big' : 'Small',
            period: currentPeriod,
            label: `Ball #${num} (${info.text})`,
          })
        }
      }
    } catch (err) {
      console.warn('[WinGo API] Admin set results fetch error:', err)
    }
  }, [currentMode.game_id, currentPeriod])

  // Audio & Countdown Effects for Last Seconds (5, 4, 3, 2, 1) & Round Reset
  useEffect(() => {
    if (prevSecondRef.current !== currentSeconds) {
      if (soundEnabled) {
        if (isLastFiveSeconds) {
          // Urgent warning beep for 5, 4, 3, 2, 1
          playCountdownTone(currentSeconds === 1 ? 1200 : 960, 0.12)
        } else if (currentSeconds > 0 && currentSeconds % 10 === 0) {
          // Subtle soft pulse tick
          playCountdownTone(540, 0.05)
        }
      }

      // When round resets (currentSeconds transitions from > 0 to 0), refresh for the next round
      if (prevSecondRef.current !== null && prevSecondRef.current > 0 && currentSeconds === 0) {
        resetCurrentRoundPools()
        if (lastFetchedPeriodRef.current !== currentPeriod) {
          lastFetchedPeriodRef.current = currentPeriod
          setTimeout(() => {
            fetchBackendBets()
            fetchResults()
            fetchLastFive()
            fetchLastResult()
            fetchWinAmount()
            fetchAdminSetResults()
          }, 1200)
        }
      }

      prevSecondRef.current = currentSeconds
    }
  }, [currentSeconds, soundEnabled, isLastFiveSeconds, currentPeriod, resetCurrentRoundPools, fetchResults, fetchLastFive, fetchLastResult, fetchWinAmount, fetchBackendBets, fetchAdminSetResults])

  // Copy Period ID
  const handleCopyPeriod = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(currentPeriod)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      toast(`Copied Period #${currentPeriod}`, 'info')
    }
  }

  // 5-second polling for live pools and bets
  useEffect(() => {
    fetchBackendBets()
    fetchAdminSetResults()
    const pollInterval = setInterval(() => {
      fetchBackendBets()
    }, 5000)
    return () => clearInterval(pollInterval)
  }, [fetchBackendBets, fetchAdminSetResults])

  // 1-Click Winner Selection for Colors, Sizes, and Numbers
  const handleDirectSetOutcome = async (type, val) => {
    let chosenNum = 0
    let chosenColor = 'Green'

    if (type === 'number') {
      chosenNum = Number(val)
      const info = getBallColorInfo(chosenNum)
      chosenColor = info.text
    } else if (type === 'color') {
      const colorKey = String(val).toLowerCase()
      if (colorKey === 'green') {
        const candidates = [1, 3, 7, 9]
        candidates.sort((a, b) => (poolTotals.numberAmounts[a] || 0) - (poolTotals.numberAmounts[b] || 0))
        chosenNum = candidates[0]
        chosenColor = 'Green'
      } else if (colorKey === 'red') {
        const candidates = [2, 4, 6, 8]
        candidates.sort((a, b) => (poolTotals.numberAmounts[a] || 0) - (poolTotals.numberAmounts[b] || 0))
        chosenNum = candidates[0]
        chosenColor = 'Red'
      } else if (colorKey === 'violet') {
        const candidates = [0, 5]
        candidates.sort((a, b) => (poolTotals.numberAmounts[a] || 0) - (poolTotals.numberAmounts[b] || 0))
        chosenNum = candidates[0]
        chosenColor = 'Violet'
      }
    } else if (type === 'size') {
      const sizeKey = String(val).toLowerCase()
      if (sizeKey === 'small') {
        const candidates = [0, 1, 2, 3, 4]
        candidates.sort((a, b) => (poolTotals.numberAmounts[a] || 0) - (poolTotals.numberAmounts[b] || 0))
        chosenNum = candidates[0]
      } else {
        const candidates = [5, 6, 7, 8, 9]
        candidates.sort((a, b) => (poolTotals.numberAmounts[a] || 0) - (poolTotals.numberAmounts[b] || 0))
        chosenNum = candidates[0]
      }
      const info = getBallColorInfo(chosenNum)
      chosenColor = info.text
    }

    setIsSubmittingOverride(true)
    try {
      const targetId = currentPeriod
      const targetGameId = Number(currentMode.game_id)
      const payload = {
        gameid: targetGameId,
        game_id: targetGameId,
        period_num: targetId,
        gamesno: targetId,
        game_no: targetId,
        period_id: targetId,
        card_number: chosenNum,
        number: chosenNum,
        result_number: chosenNum,
        result_colour: chosenColor,
        colour: chosenColor,
        is_big: chosenNum >= 5,
        mode: currentMode.id,
      }

      const endpoints = [
        '/api/auto_wingo_result_insert',
        '/auto_wingo_result_insert',
        '/colour_prediction-store',
        '/api/colour_prediction-store',
        '/colour_prediction_store',
        '/api/colour_prediction_store',
        WINGO_API.wingoAdminSetResultUrl ? WINGO_API.wingoAdminSetResultUrl(targetGameId) : null,
        API_ENDPOINTS.WINGO_STORE_RESULT_PROXY,
      ]

      let success = false
      let lastErr = null
      for (const ep of endpoints) {
        if (!ep) continue
        try {
          const res = await apiRequest(ep, {
            method: 'POST',
            body: JSON.stringify(payload),
          })
          if (res) {
            success = true
            break
          }
        } catch (err) {
          lastErr = err
        }
      }

      if (!success) {
        throw new Error(lastErr?.message || 'Failed to submit admin winner result.')
      }

      const outcomeLabel = type === 'color' 
        ? `${String(val).toUpperCase()} (Ball #${chosenNum})` 
        : type === 'size' 
          ? `${String(val).toUpperCase()} (Ball #${chosenNum})` 
          : `Ball #${chosenNum} (${chosenColor})`

      setAdminSetWinner({
        number: chosenNum,
        color: chosenColor,
        size: chosenNum >= 5 ? 'Big' : 'Small',
        period: targetId,
        label: outcomeLabel,
      })
      toast(`✅ Winning Result set to ${outcomeLabel} for Round #${targetId}!`, 'success')
      fetchBackendBets()
      fetchAdminSetResults()
    } catch (err) {
      toast(`Failed to set admin result: ${err.message}`, 'error')
    } finally {
      setIsSubmittingOverride(false)
    }
  }

  // Submit Admin Result Override Modal (/auto_wingo_result_insert & /colour_prediction-store)
  const handleAdminSetResult = async () => {
    setIsSubmittingOverride(true)
    try {
      const targetId = currentPeriod
      const targetGameId = Number(currentMode.game_id)
      const targetNum = Number(targetBallNumber)

      const payload = {
        gameid: targetGameId,
        game_id: targetGameId,
        period_num: targetId,
        gamesno: targetId,
        game_no: targetId,
        period_id: targetId,
        card_number: targetNum,
        number: targetNum,
        result_number: targetNum,
        result_colour: targetBallColor,
        colour: targetBallColor,
        is_big: targetNum >= 5,
        mode: currentMode.id,
      }

      const endpoints = [
        '/api/auto_wingo_result_insert',
        '/auto_wingo_result_insert',
        '/colour_prediction-store',
        '/api/colour_prediction-store',
        '/colour_prediction_store',
        '/api/colour_prediction_store',
        WINGO_API.wingoAdminSetResultUrl ? WINGO_API.wingoAdminSetResultUrl(targetGameId) : null,
        API_ENDPOINTS.WINGO_STORE_RESULT_PROXY,
      ]

      let success = false
      let lastErr = null
      for (const ep of endpoints) {
        if (!ep) continue
        try {
          const res = await apiRequest(ep, {
            method: 'POST',
            body: JSON.stringify(payload),
          })
          if (res) {
            success = true
            break
          }
        } catch (err) {
          lastErr = err
        }
      }

      if (!success) {
        throw new Error(lastErr?.message || 'Failed to submit admin winner result to server.')
      }

      setAdminSetWinner({
        number: targetNum,
        color: targetBallColor,
        size: targetNum >= 5 ? 'Big' : 'Small',
        period: targetId,
        label: `Ball #${targetNum} (${targetBallColor})`,
      })
      toast(`Winner Ball ${targetNum} (${targetBallColor}) submitted successfully for Period #${targetId}`, 'success')
      setIsAdminModalOpen(false)
      fetchBackendBets()
      fetchResults()
      fetchAdminSetResults()
    } catch (err) {
      toast(`Failed to set admin result: ${err.message}`, 'error')
    } finally {
      setIsSubmittingOverride(false)
    }
  }

  // Split-flap / Digital Flip Digits
  const mins = Math.floor(currentSeconds / 60)
  const secs = currentSeconds % 60
  const m1 = Math.floor(mins / 10)
  const m2 = mins % 10
  const s1 = Math.floor(secs / 10)
  const s2 = secs % 10

  // Progress Percentage of Round
  const progressPercent = Math.min(100, Math.max(0, ((currentMode.totalSec - currentSeconds) / currentMode.totalSec) * 100))

  // Table Columns
  const resultColumns = [
    {
      key: 'period',
      label: 'Period Number',
      render: (r) => (
        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {r.period || r.period_id || r.period_no || `#${r.id}`}
        </span>
      ),
    },
    {
      key: 'num',
      label: 'Result Ball & Colour',
      render: (r) => {
        const num = r.num ?? r.number ?? r.result_number ?? 0
        const info = getBallColorInfo(num)
        return (
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white shadow-xs ${info.bg}`}>
              {num}
            </span>
            <span className="font-bold text-xs text-slate-800">
              {r.colour || r.result_colour || info.text}
            </span>
          </div>
        )
      },
    },
    {
      key: 'type',
      label: 'Big / Small',
      render: (r) => {
        const num = r.num ?? r.number ?? r.result_number ?? 0
        const isBig = num >= 5
        return (
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-black tracking-wide ${
            isBig ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-blue-100 text-blue-800 border border-blue-300'
          }`}>
            {isBig ? 'BIG (5-9)' : 'SMALL (0-4)'}
          </span>
        )
      },
    },
    {
      key: 'created',
      label: 'Drawn Time',
      render: (r) => (
        <span className="text-xs text-slate-500 font-mono">
          {r.created || r.time || r.created_at || 'Just now'}
        </span>
      ),
    },
  ]

  const betColumns = [
    {
      key: 'period',
      label: 'Period Number',
      render: (r) => (
        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {r.games_no || r.period || currentPeriod}
        </span>
      ),
    },
    {
      key: 'user',
      label: 'Player / Game',
      render: (r) => <span className="font-bold text-xs text-slate-900">{r.user || r.username || (r.game_id ? `Game #${r.game_id}` : 'User')}</span>,
    },
    {
      key: 'pick',
      label: 'Prediction Pick',
      render: (r) => {
        const num = r.number !== undefined && r.number !== null ? parseInt(r.number) : null
        if (num !== null && !isNaN(num)) {
          if (num === 10) {
            return <span className="rounded-md px-2.5 py-0.5 font-bold text-xs inline-flex items-center gap-1 bg-emerald-600 text-white shadow-xs">GREEN (2x)</span>
          }
          if (num === 20) {
            return <span className="rounded-md px-2.5 py-0.5 font-bold text-xs inline-flex items-center gap-1 bg-purple-600 text-white shadow-xs">VIOLET (4.5x)</span>
          }
          if (num === 30) {
            return <span className="rounded-md px-2.5 py-0.5 font-bold text-xs inline-flex items-center gap-1 bg-rose-600 text-white shadow-xs">RED (2x)</span>
          }
          if (num === 40) {
            return <span className="rounded-md px-2.5 py-0.5 font-bold text-xs inline-flex items-center gap-1 bg-amber-600 text-white shadow-xs">BIG (5-9)</span>
          }
          if (num === 50) {
            return <span className="rounded-md px-2.5 py-0.5 font-bold text-xs inline-flex items-center gap-1 bg-blue-600 text-white shadow-xs">SMALL (0-4)</span>
          }
          const info = getBallColorInfo(num)
          return (
            <span className={`rounded-md px-2.5 py-0.5 font-bold text-xs inline-flex items-center gap-1.5 text-white ${info.bg}`}>
              Ball {num} · {info.text}
            </span>
          )
        }
        const pick = String(r.pick || r.bet_type || r.chosen || 'Green')
        const isGreen = pick.toLowerCase().includes('green')
        const isRed = pick.toLowerCase().includes('red')
        const isViolet = pick.toLowerCase().includes('violet')
        return (
          <span className={`rounded-md px-2 py-0.5 font-bold text-xs inline-flex items-center gap-1 ${
            isGreen ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
            isRed ? 'bg-rose-100 text-rose-800 border border-rose-300' :
            isViolet ? 'bg-purple-100 text-purple-800 border border-purple-300' :
            'bg-slate-100 text-slate-800 border border-slate-300'
          }`}>
            {pick}
          </span>
        )
      },
    },
    {
      key: 'amount',
      label: 'Bet Amount',
      render: (r) => <span className="font-mono text-xs font-bold text-slate-900">{money(parseFloat(r.amount) || 0)}</span>,
    },
    {
      key: 'time',
      label: 'Time / Status',
      render: (r) => <span className="text-xs text-slate-500 font-medium">{r.created_at || r.time || 'Live Round'}</span>,
    },
  ]

  return (
    <div className="space-y-4">
      {toastNode}

      {/* Top Banner with Centralized Socket Status */}
      <PageBanner
        title="WinGo (Colour Prediction) Live Telemetry"
        icon={Palette}
        crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'In-House Games' }, { label: 'WinGo' }]}
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Socket Connection Badge */}
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-xs ${
            socketConnected
              ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
              : 'bg-amber-50 border border-amber-300 text-amber-800'
          }`}>
            <Radio size={13} className={socketConnected ? 'animate-pulse text-emerald-600' : 'text-amber-600'} />
            {socketConnected ? `Live Socket: ${SOCKET_CONFIG.WINGO.EVENT_NAME}` : `Connecting: ${SOCKET_CONFIG.WINGO.URL}`}
          </span>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled((v) => !v)}
            title={soundEnabled ? 'Mute Sound FX' : 'Enable Countdown Audio FX'}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition shadow-xs ${
              soundEnabled
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
            {soundEnabled ? 'FX Sound ON' : 'Muted'}
          </button>

          {/* API Sync Refresh */}
          <button
            onClick={handleFullRefresh}
            disabled={isLoadingApi}
            className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-white px-3 py-1.5 text-xs font-bold hover:bg-slate-800 transition shadow-xs disabled:opacity-50"
          >
            <RefreshCw size={13} className={isLoadingApi ? 'animate-spin' : ''} />
            Sync APIs
          </button>
        </div>
      </PageBanner>

      {/* Financial & Performance Stats from /win-amount */}
      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center gap-3 rounded-2xl p-4 text-white shadow-md bg-gradient-to-r from-emerald-600 to-green-600">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shrink-0">
            <Coins size={24} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-90">Total Admin Profit</div>
            <div className="text-2xl font-extrabold tracking-tight font-mono">{money(winAmountStats.totalAdminProfit)}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl p-4 text-white shadow-md bg-gradient-to-r from-rose-600 to-pink-600">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shrink-0">
            <User size={24} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-90">Total User Profit</div>
            <div className="text-2xl font-extrabold tracking-tight font-mono">{money(winAmountStats.totalUserProfit)}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl p-4 text-white shadow-md bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shrink-0">
            <BarChart3 size={24} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-90">Today Admin Profit</div>
            <div className="text-2xl font-extrabold tracking-tight font-mono">{money(winAmountStats.todayAdminProfit)}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl p-4 text-white shadow-md bg-gradient-to-r from-amber-500 to-orange-500">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 shrink-0">
            <Users size={24} />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-90">Today User Profit</div>
            <div className="text-2xl font-extrabold tracking-tight font-mono">{money(winAmountStats.todayUserProfit)}</div>
          </div>
        </div>
      </div>

      {/* 4 Live Socket Room Timers Bar (30 Sec, 1 Min, 3 Min, 5 Min) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {WINGO_MODES.map((mode, i) => {
          const modeSecs = Math.max(0, Number(wingoData?.[mode.key] ?? 0))
          const isSelected = activeModeIndex === i
          const ModeIcon = mode.icon
          const mSecMins = Math.floor(modeSecs / 60)
          const mSecSecs = modeSecs % 60
          const timeStr = `${String(mSecMins).padStart(2, '0')} : ${String(mSecSecs).padStart(2, '0')}`
          const isModeLocked = modeSecs <= timerBetThreshold

          return (
            <button
              key={mode.id}
              onClick={() => setActiveModeIndex(i)}
              className={`rounded-2xl p-3.5 text-left transition-all border relative overflow-hidden group ${
                isSelected
                  ? 'bg-slate-900 border-blue-500 text-white shadow-xl ring-2 ring-blue-500/30'
                  : 'bg-white border-slate-200/90 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                  isSelected ? 'text-blue-400' : 'text-slate-500'
                }`}>
                  <ModeIcon size={14} />
                  {mode.label}
                </span>
                <span className={`w-2.5 h-2.5 rounded-full ${
                  isModeLocked
                    ? 'bg-rose-500 animate-ping'
                    : socketConnected
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-slate-400'
                }`} />
              </div>

              <div className="font-mono text-2xl font-black tracking-tight">
                {timeStr}
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/20 text-[10px] font-bold">
                <span className={isModeLocked ? 'text-rose-400 font-extrabold flex items-center gap-1' : 'opacity-75'}>
                  {isModeLocked ? <Lock size={10} /> : <Unlock size={10} />}
                  {isModeLocked ? 'Drawing Result' : 'Betting Open'}
                </span>
                <span className="opacity-60">{mode.totalSec}s round</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* ========================================================================= */}
      {/* HERO PREMIUM CASINO / GAME CLOCK DISPLAY (Ultra Luxury Split-Flap Screen) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-black text-white p-5 sm:p-7 shadow-2xl">
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-96 rounded-full bg-blue-500/15 blur-3xl" />
        {isLastFiveSeconds && (
          <div className="pointer-events-none absolute inset-0 bg-rose-600/10 animate-pulse" />
        )}

        {/* Display Header: Period, Status Badge, Admin Control */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg">
              <currentMode.icon size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-blue-400">
                  {currentMode.label}
                </span>
                <span className="text-slate-500 font-mono text-xs">·</span>
                <span className="text-slate-400 text-xs font-medium">Interval #{activeModeIndex + 1}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm sm:text-base font-mono font-bold tracking-tight text-white">
                  Period: <span className="text-amber-400 font-extrabold">{currentPeriod}</span>
                </span>
                <button
                  onClick={handleCopyPeriod}
                  title="Copy Period Number"
                  className="rounded-md bg-slate-800/80 p-1 text-slate-400 hover:text-white transition hover:bg-slate-700"
                >
                  {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Betting Status Pill */}
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold border transition-all ${
              isBettingLocked
                ? 'bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse'
                : 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
            }`}>
              {isBettingLocked ? <Lock size={12} className="text-rose-400" /> : <Unlock size={12} className="text-emerald-400" />}
              {isBettingLocked ? 'BETTING LOCKED' : 'BETTING OPEN'}
            </span>

            {/* Admin Override Trigger */}
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3.5 py-1 text-xs font-extrabold hover:from-amber-600 hover:to-orange-600 transition shadow-md"
            >
              <Sliders size={13} />
              Set Next Result
            </button>
          </div>
        </div>

        {/* Centerpiece: Ultra-Luxury LED Flip Timer & Urgent Count Overlay */}
        <div className="relative z-10 py-6 sm:py-8 flex flex-col items-center justify-center">
          {/* If Last 5 Seconds: Dramatic Center Flash Countdown ("thoda count chalne last sec ka") */}
          {isLastFiveSeconds ? (
            <div className="flex flex-col items-center justify-center py-2 animate-bounce">
              <div className="text-xs uppercase tracking-widest font-black text-rose-400 flex items-center gap-1.5 mb-2">
                <AlertTriangle size={16} className="text-rose-400 animate-pulse" />
                FINAL COUNTDOWN · DRAWING IN PROGRESS
              </div>
              
              {/* Massive Glowing Number */}
              <div className="relative flex items-center justify-center">
                <div className="absolute -inset-4 rounded-full bg-rose-600/30 blur-xl animate-ping" />
                <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-3xl bg-gradient-to-b from-rose-600 via-red-700 to-rose-950 border-2 border-rose-400/80 flex items-center justify-center text-6xl sm:text-7xl font-black font-mono text-white shadow-2xl ring-4 ring-rose-500/40">
                  {currentSeconds}
                </div>
              </div>

              <div className="text-rose-300 text-xs font-mono font-bold mt-3 tracking-wider">
                LOCK WINDOW: {timerBetThreshold}s · STANDBY FOR WINNING BALL
              </div>
            </div>
          ) : (
            /* Normal Elegant Split-Flap Clock Display */
            <div className="flex flex-col items-center">
              <div className="text-xs uppercase tracking-widest font-bold text-slate-400 mb-3 flex items-center gap-2">
                <Sparkles size={14} className="text-blue-400" />
                OFFICIAL GAME TIMER DISPLAY
              </div>

              <div className="flex items-center gap-2 sm:gap-4 font-mono select-none">
                {/* Minutes Group */}
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="relative flex h-18 w-13 sm:h-24 sm:w-18 items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 text-3xl sm:text-5xl font-black text-white shadow-xl">
                    <div className="absolute inset-x-0 top-1/2 h-px bg-black/60 shadow-xs" />
                    {m1}
                  </div>
                  <div className="relative flex h-18 w-13 sm:h-24 sm:w-18 items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 text-3xl sm:text-5xl font-black text-white shadow-xl">
                    <div className="absolute inset-x-0 top-1/2 h-px bg-black/60 shadow-xs" />
                    {m2}
                  </div>
                </div>

                {/* Blinking Colon Separator */}
                <div className="flex flex-col gap-2 py-2 text-2xl sm:text-4xl font-black text-blue-400 animate-pulse">
                  <span>:</span>
                </div>

                {/* Seconds Group */}
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="relative flex h-18 w-13 sm:h-24 sm:w-18 items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/80 text-3xl sm:text-5xl font-black text-white shadow-xl">
                    <div className="absolute inset-x-0 top-1/2 h-px bg-black/60 shadow-xs" />
                    {s1}
                  </div>
                  <div className={`relative flex h-18 w-13 sm:h-24 sm:w-18 items-center justify-center rounded-2xl bg-gradient-to-b border text-3xl sm:text-5xl font-black shadow-xl transition-colors ${
                    isBettingLocked
                      ? 'from-rose-900 to-slate-950 border-rose-600 text-rose-300'
                      : 'from-slate-800 to-slate-900 border-slate-700/80 text-white'
                  }`}>
                    <div className="absolute inset-x-0 top-1/2 h-px bg-black/60 shadow-xs" />
                    {s2}
                  </div>
                </div>
              </div>

              {/* Status Hint */}
              <div className="mt-3 text-xs text-slate-400 font-medium">
                {isBettingLocked
                  ? '🔒 Bets are locked for the current round drawing'
                  : '✨ Predictions are currently open for all players'}
              </div>
            </div>
          )}

          {/* Luxury Progress Bar */}
          <div className="w-full max-w-xl mt-5">
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5">
              <span>Elapsed: {currentMode.totalSec - currentSeconds}s</span>
              <span>Remaining: {currentSeconds}s / {currentMode.totalSec}s</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  isLastFiveSeconds
                    ? 'bg-rose-500 shadow-md shadow-rose-500/50'
                    : isBettingLocked
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-blue-500 to-emerald-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Display Footer: Last 5 Drawn Balls Strip (/last_five_result API) */}
        <div className="relative z-10 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-amber-400 shrink-0" />
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-300">
              RECENT DRAWN BALLS:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {lastFiveResults.map((r, i) => {
              const num = r.num ?? r.number ?? r.result_number ?? 0
              const info = getBallColorInfo(num)
              return (
                <div
                  key={r.id || r.period || i}
                  className="flex items-center gap-1.5 rounded-full bg-slate-800/90 pl-1 pr-2.5 py-1 border border-slate-700/80 shadow-xs"
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black text-white shadow-xs ${info.bg}`}>
                    {num}
                  </span>
                  <span className="text-[11px] font-bold text-slate-200">
                    {info.isBig ? 'Big' : 'Small'}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Spotlight on Last Drawn Round (/last_result API) */}
          {lastResult && (
            <div className="flex items-center gap-2 rounded-xl bg-slate-800/70 px-3 py-1.5 border border-slate-700">
              <Award size={14} className="text-emerald-400" />
              <span className="text-[11px] text-slate-300 font-medium">Last Winner:</span>
              <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white ${
                getBallColorInfo(lastResult.num ?? lastResult.number ?? 0).bg
              }`}>
                {lastResult.num ?? lastResult.number ?? 0}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Winning Bet Pools & Colors Overview with 1-Click Winner Selection */}
      <div className="card p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-2 font-extrabold tracking-wide text-slate-900 text-sm">
              <Flame size={18} className="text-amber-500" />
              LIVE BETTING POOLS (CURRENT ROUND #{currentPeriod})
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              1-Click Winner Control: Click Green, Violet, Red, Big, Small, or any Ball 0-9 to set next winner.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 font-mono bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              {betsList.length} Active Bets
            </span>
            <button
              type="button"
              onClick={() => {
                setTargetBallNumber(7)
                setTargetBallColor('Green')
                setIsAdminModalOpen(true)
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition flex items-center gap-1"
            >
              <Sliders size={12} /> Custom Modal
            </button>
          </div>
        </div>

        {/* Guaranteed Winner Alert Banner */}
        {adminSetWinner && String(adminSetWinner.period) === String(currentPeriod) && (
          <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-amber-500/15 border border-amber-400/60 p-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
                <Crown size={18} />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-amber-800">
                  GUARANTEED WINNER LOCKED FOR ROUND #{currentPeriod}
                </div>
                <div className="text-sm font-black font-mono text-amber-950 flex items-center gap-2">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white ${getBallColorInfo(adminSetWinner.number).bg}`}>
                    {adminSetWinner.number}
                  </span>
                  <span>{adminSetWinner.label}</span>
                  <span className="text-xs font-bold text-amber-700">({adminSetWinner.size})</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-extrabold text-amber-800 bg-white/80 rounded-md px-2 py-1 border border-amber-300">
              Click any other card below to override
            </span>
          </div>
        )}

        {/* 3 Main Colors with 1-Click Winner Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center font-black text-white">
          {/* GREEN */}
          <button
            type="button"
            disabled={isSubmittingOverride}
            onClick={() => handleDirectSetOutcome('color', 'green')}
            title="Click to force GREEN as winning result for this round"
            className={`group relative rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-3.5 shadow-md transition hover:scale-102 active:scale-98 cursor-pointer text-left ${
              adminSetWinner && adminSetWinner.color === 'Green'
                ? 'ring-4 ring-amber-400 ring-offset-2'
                : 'hover:ring-2 hover:ring-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider opacity-90 flex items-center gap-1.5">
                GREEN
                {adminSetWinner && adminSetWinner.color === 'Green' && (
                  <Crown size={14} className="text-amber-300 animate-bounce" />
                )}
              </div>
              <span className="text-[10px] font-extrabold bg-white/20 px-2 py-0.5 rounded-full group-hover:bg-white/30 transition">
                SET WINNER ➔
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-mono mt-1 font-black">
              {poolTotals.green > 0 ? money(poolTotals.green) : '₹0.00'}
            </div>
            <div className="flex items-center justify-between text-[10px] opacity-85 font-normal mt-0.5">
              <span>Payout 2x (1, 3, 7, 9)</span>
              <span className="font-bold underline text-emerald-100">Click to Win</span>
            </div>
          </button>

          {/* VIOLET */}
          <button
            type="button"
            disabled={isSubmittingOverride}
            onClick={() => handleDirectSetOutcome('color', 'violet')}
            title="Click to force VIOLET as winning result for this round"
            className={`group relative rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 p-3.5 shadow-md transition hover:scale-102 active:scale-98 cursor-pointer text-left ${
              adminSetWinner && adminSetWinner.color === 'Violet'
                ? 'ring-4 ring-amber-400 ring-offset-2'
                : 'hover:ring-2 hover:ring-purple-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider opacity-90 flex items-center gap-1.5">
                VIOLET
                {adminSetWinner && adminSetWinner.color === 'Violet' && (
                  <Crown size={14} className="text-amber-300 animate-bounce" />
                )}
              </div>
              <span className="text-[10px] font-extrabold bg-white/20 px-2 py-0.5 rounded-full group-hover:bg-white/30 transition">
                SET WINNER ➔
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-mono mt-1 font-black">
              {poolTotals.violet > 0 ? money(poolTotals.violet) : '₹0.00'}
            </div>
            <div className="flex items-center justify-between text-[10px] opacity-85 font-normal mt-0.5">
              <span>Payout 4.5x (0, 5)</span>
              <span className="font-bold underline text-purple-100">Click to Win</span>
            </div>
          </button>

          {/* RED */}
          <button
            type="button"
            disabled={isSubmittingOverride}
            onClick={() => handleDirectSetOutcome('color', 'red')}
            title="Click to force RED as winning result for this round"
            className={`group relative rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 p-3.5 shadow-md transition hover:scale-102 active:scale-98 cursor-pointer text-left ${
              adminSetWinner && adminSetWinner.color === 'Red'
                ? 'ring-4 ring-amber-400 ring-offset-2'
                : 'hover:ring-2 hover:ring-rose-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider opacity-90 flex items-center gap-1.5">
                RED
                {adminSetWinner && adminSetWinner.color === 'Red' && (
                  <Crown size={14} className="text-amber-300 animate-bounce" />
                )}
              </div>
              <span className="text-[10px] font-extrabold bg-white/20 px-2 py-0.5 rounded-full group-hover:bg-white/30 transition">
                SET WINNER ➔
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-mono mt-1 font-black">
              {poolTotals.red > 0 ? money(poolTotals.red) : '₹0.00'}
            </div>
            <div className="flex items-center justify-between text-[10px] opacity-85 font-normal mt-0.5">
              <span>Payout 2x (2, 4, 6, 8)</span>
              <span className="font-bold underline text-rose-100">Click to Win</span>
            </div>
          </button>
        </div>

        {/* 0-9 Numbers Grid with 1-click outcome select */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5 pt-2">
          {Array.from({ length: 10 }, (_, num) => {
            const info = getBallColorInfo(num)
            const amt = poolTotals.numberAmounts[num] || 0
            const isWinner = adminSetWinner && Number(adminSetWinner.number) === num
            return (
              <button
                key={num}
                type="button"
                disabled={isSubmittingOverride}
                onClick={() => handleDirectSetOutcome('number', num)}
                title={`Click to set Ball #${num} as guaranteed winner`}
                className={`group relative rounded-2xl border p-2 text-center transition cursor-pointer hover:shadow-md hover:scale-105 active:scale-95 ${
                  isWinner
                    ? 'border-amber-400 ring-4 ring-amber-300 ring-offset-2 bg-amber-50/70 shadow-md'
                    : 'border-slate-200 bg-white hover:border-blue-500 shadow-xs'
                }`}
              >
                {isWinner && (
                  <div className="absolute -top-2 -right-1 bg-amber-500 text-white p-1 rounded-full shadow-md animate-bounce">
                    <Crown size={12} />
                  </div>
                )}
                <div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl font-black text-white shadow-xs ${info.bg} group-hover:ring-2 group-hover:ring-blue-400`}>
                  {num}
                </div>
                <div className="text-xs font-black text-slate-800 font-mono mt-1.5 truncate">
                  {amt > 0 ? money(amt) : '₹0.00'}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                  {info.isBig ? 'Big' : 'Small'}
                </div>
                <div className={`text-[9px] font-extrabold mt-0.5 transition-opacity ${
                  isWinner ? 'text-amber-700 opacity-100' : 'text-blue-600 opacity-0 group-hover:opacity-100'
                }`}>
                  {isWinner ? '★ WINNER' : 'Click to Win'}
                </div>
              </button>
            )
          })}
        </div>

        {/* Big / Small Summary with 1-Click Winner Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center font-black text-white pt-1">
          <button
            type="button"
            disabled={isSubmittingOverride}
            onClick={() => handleDirectSetOutcome('size', 'big')}
            title="Click to force BIG (5-9) as winning result for this round"
            className={`group relative rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 p-3.5 shadow-md transition hover:scale-102 active:scale-98 cursor-pointer text-left ${
              adminSetWinner && adminSetWinner.size === 'Big'
                ? 'ring-4 ring-amber-300 ring-offset-2'
                : 'hover:ring-2 hover:ring-amber-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider opacity-90 flex items-center gap-1.5">
                BIG (5, 6, 7, 8, 9)
                {adminSetWinner && adminSetWinner.size === 'Big' && (
                  <Crown size={14} className="text-yellow-200 animate-bounce" />
                )}
              </div>
              <span className="text-[10px] font-extrabold bg-white/20 px-2 py-0.5 rounded-full group-hover:bg-white/30 transition">
                SET WINNER ➔
              </span>
            </div>
            <div className="text-xl font-mono mt-1 font-black">
              {poolTotals.big > 0 ? money(poolTotals.big) : '₹0.00'}
            </div>
            <div className="flex items-center justify-between text-[10px] opacity-85 font-normal mt-0.5">
              <span>Payout 2x</span>
              <span className="font-bold underline text-amber-100">Click to Win</span>
            </div>
          </button>

          <button
            type="button"
            disabled={isSubmittingOverride}
            onClick={() => handleDirectSetOutcome('size', 'small')}
            title="Click to force SMALL (0-4) as winning result for this round"
            className={`group relative rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 p-3.5 shadow-md transition hover:scale-102 active:scale-98 cursor-pointer text-left ${
              adminSetWinner && adminSetWinner.size === 'Small'
                ? 'ring-4 ring-amber-300 ring-offset-2'
                : 'hover:ring-2 hover:ring-blue-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider opacity-90 flex items-center gap-1.5">
                SMALL (0, 1, 2, 3, 4)
                {adminSetWinner && adminSetWinner.size === 'Small' && (
                  <Crown size={14} className="text-yellow-200 animate-bounce" />
                )}
              </div>
              <span className="text-[10px] font-extrabold bg-white/20 px-2 py-0.5 rounded-full group-hover:bg-white/30 transition">
                SET WINNER ➔
              </span>
            </div>
            <div className="text-xl font-mono mt-1 font-black">
              {poolTotals.small > 0 ? money(poolTotals.small) : '₹0.00'}
            </div>
            <div className="flex items-center justify-between text-[10px] opacity-85 font-normal mt-0.5">
              <span>Payout 2x</span>
              <span className="font-bold underline text-blue-100">Click to Win</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tabs: Result History, Current Bets, Bet History */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('results')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                tab === 'results'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <History size={14} />
              Drawn Results (/results)
            </button>
            <button
              onClick={() => setTab('bets')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                tab === 'bets'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Users size={14} />
              Live Current Bets (/bets)
            </button>
            <button
              onClick={() => setTab('history')}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                tab === 'history'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <BarChart3 size={14} />
              Bet History (/bet_history)
            </button>
          </div>

          <button
            onClick={() => {
              const activeRows = tab === 'results' ? resultsList : tab === 'bets' ? betsList : betHistoryList
              const activeCols = tab === 'results' ? resultColumns : betColumns
              exportCSV(`wingo_${tab}_export`, activeCols, activeRows)
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs flex items-center gap-1"
          >
            <ArrowUpRight size={13} />
            Export CSV
          </button>
        </div>

        <DataTable
          columns={tab === 'results' ? resultColumns : betColumns}
          rows={
            tab === 'results'
              ? resultsList
              : tab === 'bets'
              ? betsList
              : betHistoryList.length > 0
              ? betHistoryList
              : betsList
          }
          hideSize
        />
      </div>

      {/* ========================================================================= */}
      {/* ADMIN RESULT INTERVENTION MODAL (/fetch_admin_set_Results/:id)            */}
      {/* ========================================================================= */}
      {isAdminModalOpen && (
        <Modal
          title={`WinGo Admin Result Control (Period #${currentPeriod})`}
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 flex items-start gap-2">
              <ShieldCheck size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Manual Outcome Override:</strong> Select the ball number and color to be drawn for Period <span className="font-mono font-bold">#{currentPeriod}</span>. This uses the backend route <span className="font-mono font-bold text-amber-800">/fetch_admin_set_Results/:id</span>.
              </div>
            </div>

            {/* Ball Selection */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
                1. Select Target Winning Ball (0 - 9):
              </label>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 10 }, (_, num) => {
                  const info = getBallColorInfo(num)
                  const isSelected = targetBallNumber === num
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setTargetBallNumber(num)
                        setTargetBallColor(info.text)
                      }}
                      className={`flex flex-col items-center justify-center rounded-xl p-2 border-2 transition ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-black text-white shadow-xs ${info.bg}`}>
                        {num}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 mt-1">
                        {info.isBig ? 'Big' : 'Small'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quick Preview */}
            <div className="rounded-xl bg-slate-900 text-white p-3.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected Outcome:</div>
                <div className="text-base font-black font-mono mt-0.5 flex items-center gap-2">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs text-white ${getBallColorInfo(targetBallNumber).bg}`}>
                    {targetBallNumber}
                  </span>
                  <span>Ball {targetBallNumber} · {getBallColorInfo(targetBallNumber).text}</span>
                  <span className="text-xs text-amber-400">({targetBallNumber >= 5 ? 'Big' : 'Small'})</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-medium">Target Period</div>
                <div className="text-xs font-mono font-bold text-blue-400">#{currentPeriod}</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAdminModalOpen(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingOverride}
                onClick={handleAdminSetResult}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 text-xs font-bold transition shadow-md disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmittingOverride ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Confirm & Set Result
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
