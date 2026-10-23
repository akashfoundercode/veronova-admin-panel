import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Trophy, Flag, Zap, Clock, Sliders, CheckCircle2, AlertCircle,
  FileSpreadsheet, Play, Pause, RefreshCw, Crown, Users, BarChart3,
  Flame, ShieldAlert, Sparkles, Dices, Radio, Coins, Layers, CircleDollarSign,
  Power, Check
} from 'lucide-react'
import { io } from 'socket.io-client'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, money, useToast } from '@/components/ui'
import horseBg from '@/assets/games/horseracing.png'
import thoroughbredImg from '@/assets/horses/thoroughbred.png'
import { HORSE_RACING_SOCKET_URL, HORSE_RACING_EVENTS } from '@/constants/socketConfig'
import { auth } from '@/utils/auth'

// 12 Horses with distinct colors, jockeys, baseline odds and matching socket runners
const HORSES_DATA = [
  { id: 1, serialNumber: 1, name: 'Thunder Bolt', jockey: 'A. Sharma', color: '#ef4444', bg: 'bg-red-500', text: 'text-red-500', lightBg: 'bg-red-50 border-red-200', odds: 2.8, number: '01' },
  { id: 2, serialNumber: 2, name: 'Storm Runner', jockey: 'K. Patel', color: '#3b82f6', bg: 'bg-blue-500', text: 'text-blue-500', lightBg: 'bg-blue-50 border-blue-200', odds: 3.4, number: '02' },
  { id: 3, serialNumber: 3, name: 'Golden Arrow', jockey: 'R. Rawat', color: '#eab308', bg: 'bg-amber-500', text: 'text-amber-500', lightBg: 'bg-amber-50 border-amber-200', odds: 4.2, number: '03' },
  { id: 4, serialNumber: 4, name: 'Shadow Blaze', jockey: 'M. Verma', color: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-500', lightBg: 'bg-emerald-50 border-emerald-200', odds: 5.5, number: '04' },
  { id: 5, serialNumber: 5, name: 'Midnight Star', jockey: 'S. Singh', color: '#a855f7', bg: 'bg-purple-500', text: 'text-purple-500', lightBg: 'bg-purple-50 border-purple-200', odds: 6.8, number: '05' },
  { id: 6, serialNumber: 6, name: 'Royal Knight', jockey: 'D. Mehta', color: '#334155', bg: 'bg-slate-700', text: 'text-slate-700', lightBg: 'bg-slate-100 border-slate-300', odds: 8.0, number: '06' },
  { id: 7, serialNumber: 7, name: 'Silver Bullet', jockey: 'V. Joshi', color: '#64748b', bg: 'bg-slate-500', text: 'text-slate-500', lightBg: 'bg-slate-50 border-slate-200', odds: 9.5, number: '07' },
  { id: 8, serialNumber: 8, name: 'Fire Steed', jockey: 'P. Nair', color: '#f43f5e', bg: 'bg-rose-500', text: 'text-rose-500', lightBg: 'bg-rose-50 border-rose-200', odds: 11.0, number: '08' },
  { id: 9, serialNumber: 9, name: 'Wild Pegasus', jockey: 'H. Khan', color: '#06b6d4', bg: 'bg-cyan-500', text: 'text-cyan-500', lightBg: 'bg-cyan-50 border-cyan-200', odds: 13.5, number: '09' },
  { id: 10, serialNumber: 10, name: 'Gallop', jockey: 'I. Gill', color: '#f97316', bg: 'bg-orange-500', text: 'text-orange-500', lightBg: 'bg-orange-50 border-orange-200', odds: 16.0, number: '10' },
  { id: 11, serialNumber: 11, name: 'Desert Comet', jockey: 'T. Rao', color: '#6366f1', bg: 'bg-indigo-500', text: 'text-indigo-500', lightBg: 'bg-indigo-50 border-indigo-200', odds: 18.5, number: '11' },
  { id: 12, serialNumber: 12, name: 'Victory Spirit', jockey: 'N. Das', color: '#ec4899', bg: 'bg-pink-500', text: 'text-pink-500', lightBg: 'bg-pink-50 border-pink-200', odds: 22.0, number: '12' },
]

const SEED_RACES = [
  { id: 1, raceId: 'HR_20261016572', winner: 'Wild Pegasus (#09)', second: 'Storm Runner (#02)', third: 'Royal Knight (#06)', odds: '13.5x', pool: 124500, time: '2 mins ago' },
  { id: 2, raceId: 'HR_20261016571', winner: 'Thunder Bolt (#01)', second: 'Golden Arrow (#03)', third: 'Silver Bullet (#07)', odds: '2.8x', pool: 98000, time: '5 mins ago' },
  { id: 3, raceId: 'HR_20261016570', winner: 'Royal Knight (#06)', second: 'Shadow Blaze (#04)', third: 'Desert Comet (#11)', odds: '8.0x', pool: 142000, time: '9 mins ago' },
  { id: 4, raceId: 'HR_20261016569', winner: 'Storm Runner (#02)', second: 'Midnight Star (#05)', third: 'Fire Steed (#08)', odds: '3.4x', pool: 110500, time: '13 mins ago' },
]

const SEED_BETS = [
  { id: 1, ticketId: 'TKT_7812', user: 'Vikram Rawat', horse: 'Wild Pegasus (#09)', amount: 1500, odds: '13.5x', payout: 20250, status: 'Won' },
  { id: 2, ticketId: 'TKT_7813', user: 'Kunal Joshi', horse: 'Storm Runner (#02)', amount: 500, odds: '3.4x', payout: 0, status: 'Lost' },
  { id: 3, ticketId: 'TKT_7814', user: 'Aman Verma', horse: 'Golden Arrow (#03)', amount: 2000, odds: '4.2x', payout: 0, status: 'Lost' },
  { id: 4, ticketId: 'TKT_7815', user: 'Pooja Singh', horse: 'Thunder Bolt (#01)', amount: 800, odds: '2.8x', payout: 2240, status: 'Won' },
  { id: 5, ticketId: 'TKT_7816', user: 'Deepak Mehta', horse: 'Midnight Star (#05)', amount: 1200, odds: '6.8x', payout: 0, status: 'Lost' },
  { id: 6, ticketId: 'TKT_7817', user: 'Sneha Patel', horse: 'Gallop (#10)', amount: 300, odds: '16.0x', payout: 4800, status: 'Won' },
]

/**
 * Realistic Thoroughbred Racing Horse Runner Component
 * Uses the user's high-res top-down thoroughbred PNG with realistic animated gallop gait,
 * dynamic jockey saddlecloth in horse theme color, and stall number
 */
function RaceHorseRunner({ horse, isRacing, speedKmh, status }) {
  // Gallop cadence phase offset per horse so all 12 horses don't stride identically in robot sync
  const strideDelay = `${((horse.id * 83) % 340) / 1000}s`

  return (
    <div className="relative flex items-center select-none">
      {/* Racing Pennant Flag with Horse Number (Positioned clearly above/away from horse body) */}
      <div className="absolute -top-4.5 left-3.5 flex flex-col items-start pointer-events-none z-30 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
        {/* Swallowtail Flag Pennant */}
        <div
          className="flex items-center gap-1 pl-1.5 pr-2.5 py-0.5 shadow-md font-mono text-[9.5px] font-black text-white leading-none border-l-2 border-white rounded-l-xs"
          style={{
            backgroundColor: horse.color,
            clipPath: 'polygon(0% 0%, 100% 0%, 82% 50%, 100% 100%, 0% 100%)',
          }}
        >
          <Flag size={8} className="text-white fill-white shrink-0" />
          <span>{horse.number}</span>
        </div>
        {/* Flagpole pin pointing to horse */}
        <div className="w-[1.5px] h-2 bg-white/90 shadow-xs ml-0.5" />
      </div>

      {/* Real Animated Thoroughbred Horse (Entire body clearly visible without overlay) */}
      <div
        className={`relative flex items-center ${isRacing ? 'animate-horse-stride' : ''}`}
        style={{ animationDelay: strideDelay }}
      >
        <img
          src={thoroughbredImg}
          alt={horse.name}
          className="h-8 sm:h-9 w-18 sm:w-20 object-contain pointer-events-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]"
        />

        {/* Realistic Kicked Turf Dust Particles during gallop */}
        {isRacing && (
          <div className="absolute -left-3 bottom-0.5 flex gap-0.5 opacity-80 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 animate-ping" />
            <span className="w-1 h-1 rounded-full bg-amber-200/90" />
          </div>
        )}
      </div>

      {/* Floating Speed & Status Tag */}
      <div className="hidden sm:flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-[10px] font-bold text-white border border-white/20 whitespace-nowrap shadow-md ml-1.5">
        <span className="truncate max-w-[85px]">{horse.name}</span>
        {speedKmh ? (
          <span className="text-emerald-400 font-mono text-[9px] font-extrabold">{speedKmh} km/h</span>
        ) : (
          <span className="text-amber-300 font-mono text-[9px]">{horse.odds}x</span>
        )}
        {status === 'LEADING' && (
          <span className="bg-amber-500 text-slate-950 text-[8px] px-1 rounded font-black">LEAD</span>
        )}
      </div>
    </div>
  )
}

export default function HorseRiding() {
  const [toast, node] = useToast()
  const [raceNo, setRaceNo] = useState('20261016573')
  const [raceState, setRaceState] = useState('WAITING') // 'WAITING' | 'BETTING_CLOSED' | 'RACING' | 'FINISHED'
  const [countdown, setCountdown] = useState(30)
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [stageDescription, setStageDescription] = useState('Connecting to Live Derby Server...')
  const [jackpotInfo, setJackpotInfo] = useState(null)
  const [leaderInfo, setLeaderInfo] = useState(null)
  const [liveHorsesData, setLiveHorsesData] = useState({})
  
  const [activeTab, setActiveTab] = useState('races') // 'races' | 'bets'
  const [pastRaces, setPastRaces] = useState(SEED_RACES)
  const [userBets, setUserBets] = useState(SEED_BETS)
  const [predeterminedWinner, setPredeterminedWinner] = useState(() => {
    try {
      const saved = localStorage.getItem('horse_forced_winner')
      return saved ? Number(saved) : null
    } catch {
      return null
    }
  })
  const [winningPodium, setWinningPodium] = useState(null)

  // Realtime Live Betting Activity state (bets per horse 1-12)
  const [horseBets, setHorseBets] = useState(() => {
    const init = {}
    for (let i = 1; i <= 12; i++) init[i] = 0
    return init
  })
  const [jackpotQueueStatus, setJackpotQueueStatus] = useState(null)
  const [selectedMultiplier, setSelectedMultiplier] = useState(3)
  const [selectedJackpotMode, setSelectedJackpotMode] = useState('CONTINUOUS')

  // Live Horse positions in percentage (0 to 100)
  const [positions, setPositions] = useState(() => Array(12).fill(0))
  const [raceElapsed, setRaceElapsed] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Total active pool calculated from live bets on all 12 horses
  const totalLiveBetsPool = Object.values(horseBets).reduce((acc, curr) => acc + (Number(curr) || 0), 0)

  // High-performance animation refs for 60FPS LERP & dead reckoning
  const socketRef = useRef(null)
  const raceStateRef = useRef(raceState)
  raceStateRef.current = raceState

  const predeterminedWinnerRef = useRef(predeterminedWinner)
  predeterminedWinnerRef.current = predeterminedWinner

  const targetPositionsRef = useRef(Array(12).fill(0))
  const renderedPositionsRef = useRef(Array(12).fill(0))
  const horseSpeedsRef = useRef(Array(12).fill(55)) // in km/h
  const liveHorsesDataRef = useRef({})
  const lastFrameTimeRef = useRef(performance.now())
  const lastUiUpdateRef = useRef(0)

  // 60FPS RAF Interpolation Engine (Eliminates all stutter & jitter)
  useEffect(() => {
    let animId
    const loop = (now) => {
      const dt = Math.min(0.1, (now - lastFrameTimeRef.current) / 1000)
      lastFrameTimeRef.current = now

      if (raceStateRef.current === 'RACING') {
        const current = renderedPositionsRef.current
        const targets = targetPositionsRef.current
        const speeds = horseSpeedsRef.current

        let hasMoved = false
        const next = [...current]

        for (let i = 0; i < 12; i++) {
          const cur = current[i]
          const tgt = targets[i]
          const diff = tgt - cur

          if (Math.abs(diff) > 0.05) {
            // Smooth exponential blend towards verified socket target position
            const catchupSpeed = diff > 0 ? 10 : 5
            next[i] = cur + diff * Math.min(1, dt * catchupSpeed)
            hasMoved = true
          } else if (tgt > 0 && tgt < 99.5) {
            // Dead reckoning: keep horse gliding smoothly forward at its speed
            // so it NEVER freezes or stutters between socket packets!
            const speedProgressPerSec = (speeds[i] / 3.6 / 1000) * 100 // % per sec on 1000m track
            next[i] = Math.min(99.5, cur + speedProgressPerSec * dt * 0.75)
            hasMoved = true
          }
        }

        // Forced Winner Track Enforcement: Winner horse is ALWAYS in the lead (sabse aage), aur baki uske piche
        const forcedId = predeterminedWinnerRef.current
        if (forcedId && forcedId >= 1 && forcedId <= 12) {
          const forcedIdx = forcedId - 1
          let maxOtherProgress = 0
          for (let i = 0; i < 12; i++) {
            if (i !== forcedIdx && next[i] > maxOtherProgress) {
              maxOtherProgress = next[i]
            }
          }

          if (maxOtherProgress > 0.5) {
            const leadBuffer = 2.8 // Clear visual lead gap on the turf
            // Ensure forced winner is strictly ahead
            if (next[forcedIdx] < maxOtherProgress + leadBuffer) {
              next[forcedIdx] = Math.min(99.5, maxOtherProgress + leadBuffer)
              hasMoved = true
            }
            // Clamp any other horse that gets too close or ahead
            for (let i = 0; i < 12; i++) {
              if (i !== forcedIdx && next[i] >= next[forcedIdx]) {
                next[i] = Math.max(0, next[forcedIdx] - leadBuffer)
                hasMoved = true
              }
            }
          }
        }

        if (hasMoved) {
          renderedPositionsRef.current = next
          setPositions(next)
        }
      }

      animId = requestAnimationFrame(loop)
    }

    lastFrameTimeRef.current = performance.now()
    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [])

  // Setup Live Socket Connection
  const initSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
    setIsSyncing(true)

    const socket = io(HORSE_RACING_SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
      timeout: 10000,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setSocketConnected(true)
      setIsSyncing(false)
      toast('Connected to Live Horse Racing Engine!')

      // Sync persistent forced winner to server on connect
      if (predeterminedWinnerRef.current) {
        const forcedHorse = HORSES_DATA.find((x) => x.id === predeterminedWinnerRef.current)
        if (forcedHorse) {
          socket.emit(HORSE_RACING_EVENTS.ADMIN_SET_FORCED_WINNER, {
            horseSerial: forcedHorse.serialNumber,
            serialNumber: forcedHorse.serialNumber,
            horseId: forcedHorse.id,
            token: auth.getToken(),
          })
          socket.emit(HORSE_RACING_EVENTS.ADMIN_FORCE_WINNER, {
            horseSerial: forcedHorse.serialNumber,
            serialNumber: forcedHorse.serialNumber,
            horseId: forcedHorse.id,
          })
        }
      }
    })

    socket.on('disconnect', () => {
      setSocketConnected(false)
    })

    socket.on('connect_error', () => {
      setSocketConnected(false)
      setIsSyncing(false)
    })

    // 1. Initial State Snapshot
    socket.on(HORSE_RACING_EVENTS.CURRENT_STATE, (data) => {
      if (!data) return
      if (data.gameSerial) setRaceNo(String(data.gameSerial))
      if (data.stageDescription) setStageDescription(data.stageDescription)
      if (data.jackpot) setJackpotInfo(data.jackpot)

      if (data.status === 'RUNNING') {
        setRaceState('RACING')
        if (data.timeRemainingSec) setTimeRemaining(Math.round(data.timeRemainingSec))
        if (data.elapsedSec) setRaceElapsed(Math.round(data.elapsedSec))
      } else if (data.status === 'BETTING_CLOSED') {
        setRaceState('BETTING_CLOSED')
        setCountdown(Math.round(data.timeRemainingSec || 5))
      } else if (data.status === 'RESULT') {
        setRaceState('FINISHED')
        if (data.winner) {
          setWinningPodium({
            winner: {
              number: String(data.winner.serial_number || '01').padStart(2, '0'),
              name: data.winner.horse_name_snapshot || 'Winner',
              odds: data.jackpot?.multiplier ? `${data.jackpot.multiplier}x` : '3.5x',
              finishTime: data.winner.finish_time || '20.0s',
            },
            second: { number: '02', name: 'Placed Runner', finishTime: '20.3s' },
            third: { number: '03', name: 'Third Place', finishTime: '20.5s' },
          })
        }
      } else {
        setRaceState('WAITING')
        setCountdown(Math.round(data.timeRemainingSec || 30))
        targetPositionsRef.current = Array(12).fill(0)
        renderedPositionsRef.current = Array(12).fill(0)
        setPositions(Array(12).fill(0))
      }
    })

    // 2. Betting Open / Race Created
    const handleBettingOpen = (data) => {
      if (!data) return
      setRaceState('WAITING')
      if (data.gameSerial) setRaceNo(String(data.gameSerial))
      if (data.stageDescription) setStageDescription(data.stageDescription)
      if (data.jackpot) setJackpotInfo(data.jackpot)

      // Re-emit forced winner on every fresh race round so it remains active continuously
      if (predeterminedWinnerRef.current) {
        const forcedHorse = HORSES_DATA.find((x) => x.id === predeterminedWinnerRef.current)
        if (forcedHorse && socket.connected) {
          socket.emit(HORSE_RACING_EVENTS.ADMIN_SET_FORCED_WINNER, {
            horseSerial: forcedHorse.serialNumber,
            serialNumber: forcedHorse.serialNumber,
            horseId: forcedHorse.id,
            token: auth.getToken(),
          })
          socket.emit(HORSE_RACING_EVENTS.ADMIN_FORCE_WINNER, {
            horseSerial: forcedHorse.serialNumber,
            serialNumber: forcedHorse.serialNumber,
            horseId: forcedHorse.id,
          })
        }
      }

      // Reset bets map for the fresh race round
      const freshBets = {}
      for (let i = 1; i <= 12; i++) freshBets[i] = 0
      setHorseBets(freshBets)

      targetPositionsRef.current = Array(12).fill(0)
      renderedPositionsRef.current = Array(12).fill(0)
      setPositions(Array(12).fill(0))
      setWinningPodium(null)
      setLeaderInfo(null)
      setTimeRemaining(null)
      setRaceElapsed(0)
      setCountdown(Math.round(data.timeRemainingSec || 35))
    }
    socket.on(HORSE_RACING_EVENTS.BETTING_OPEN, handleBettingOpen)
    socket.on(HORSE_RACING_EVENTS.CREATED, handleBettingOpen)

    // 3. Betting Closed
    socket.on(HORSE_RACING_EVENTS.BETTING_CLOSED, (data) => {
      setRaceState('BETTING_CLOSED')
      setStageDescription(data?.message || 'Betting Closed. Countdown in 5s')
      setCountdown(data?.secondsRemaining || 5)
    })

    // 4. Countdown Tick (3, 2, 1)
    socket.on(HORSE_RACING_EVENTS.COUNTDOWN_TICK, (data) => {
      if (data?.countdown !== undefined) {
        setCountdown(data.countdown)
        setStageDescription(`Gate opens in ${data.countdown}s!`)
      }
    })

    // 5. High Precision Track Update (Streamlined single listener)
    const handleTrackUpdate = (data) => {
      if (!data) return
      if (data.gameSerial) setRaceNo(String(data.gameSerial))
      if (data.stage === 'RUNNING' && raceStateRef.current !== 'RACING') {
        setRaceState('RACING')
      }

      // Throttle non-critical UI stats updates to 4 times per second to prevent React DOM lag
      const now = performance.now()
      if (now - lastUiUpdateRef.current > 250) {
        lastUiUpdateRef.current = now
        if (data.elapsedSec !== undefined) setRaceElapsed(Math.round(data.elapsedSec))
        if (data.timeRemainingSec !== undefined) setTimeRemaining(Math.round(data.timeRemainingSec))
        if (data.leader) setLeaderInfo(data.leader)
        setLiveHorsesData({ ...liveHorsesDataRef.current })
      }

      // Feed targets to RAF interpolation engine
      if (Array.isArray(data.horses)) {
        data.horses.forEach((h) => {
          const serial = h.serialNumber || h.lane || 1
          const idx = serial - 1
          if (idx >= 0 && idx < 12) {
            const target = h.progressPercent !== undefined ? h.progressPercent : Math.min(100, (h.currentDistanceM || 0) / 10)
            targetPositionsRef.current[idx] = target
            if (h.speedKmh) horseSpeedsRef.current[idx] = h.speedKmh
            liveHorsesDataRef.current[serial] = h
          }
        })

        // Forced Winner Track Priority: Forced winner horse stays sabse aage, baki uske piche
        const forcedId = predeterminedWinnerRef.current
        if (forcedId && forcedId >= 1 && forcedId <= 12) {
          const forcedIdx = forcedId - 1
          let maxOtherTarget = 0
          for (let i = 0; i < 12; i++) {
            if (i !== forcedIdx && targetPositionsRef.current[i] > maxOtherTarget) {
              maxOtherTarget = targetPositionsRef.current[i]
            }
          }

          const leadMargin = maxOtherTarget > 5 ? 3.0 : 1.5
          if (targetPositionsRef.current[forcedIdx] < maxOtherTarget + leadMargin) {
            targetPositionsRef.current[forcedIdx] = Math.min(99.5, maxOtherTarget + leadMargin)
          }

          // Ensure all other 11 horses stay behind forced winner
          for (let i = 0; i < 12; i++) {
            if (i !== forcedIdx && targetPositionsRef.current[i] >= targetPositionsRef.current[forcedIdx]) {
              targetPositionsRef.current[i] = Math.max(0, targetPositionsRef.current[forcedIdx] - leadMargin)
            }
          }

          horseSpeedsRef.current[forcedIdx] = Math.max(horseSpeedsRef.current[forcedIdx] || 55, 68)

          if (liveHorsesDataRef.current[forcedId]) {
            liveHorsesDataRef.current[forcedId] = {
              ...liveHorsesDataRef.current[forcedId],
              currentRank: 1,
              status: 'LEADING',
            }
          }
        }
      }
    }
    // Only listen to TRACK_UPDATE (avoids duplicate 2x churn from running_track)
    socket.on(HORSE_RACING_EVENTS.TRACK_UPDATE, handleTrackUpdate)

    // 6. Race Result
    socket.on(HORSE_RACING_EVENTS.RESULT, (data) => {
      if (!data) return
      setRaceState('FINISHED')
      targetPositionsRef.current = Array(12).fill(100)
      renderedPositionsRef.current = Array(12).fill(100)
      setPositions(Array(12).fill(100))

      const race = data.race || {}
      const winner = data.winner || {}
      const horses = data.horses || []

      const winnerHorse = horses.find((h) => h.finish_position === 1) || winner
      const secondHorse = horses.find((h) => h.finish_position === 2) || horses[1]
      const thirdHorse = horses.find((h) => h.finish_position === 3) || horses[2]

      const podium = {
        winner: {
          number: winnerHorse?.serial_number ? String(winnerHorse.serial_number).padStart(2, '0') : '01',
          name: winnerHorse?.horse_name_snapshot || winner?.horse_name_snapshot || 'Winner',
          odds: race.jackpot_multiplier ? `${race.jackpot_multiplier}x` : '3.5x',
          finishTime: winnerHorse?.finish_time || '20.0s',
          jockey: HORSES_DATA.find((x) => x.serialNumber === (winnerHorse?.serial_number || 1))?.jockey || 'Champion Jockey',
        },
        second: {
          number: secondHorse?.serial_number ? String(secondHorse.serial_number).padStart(2, '0') : '02',
          name: secondHorse?.horse_name_snapshot || 'Runner Up',
          finishTime: secondHorse?.finish_time || '20.3s',
        },
        third: {
          number: thirdHorse?.serial_number ? String(thirdHorse.serial_number).padStart(2, '0') : '03',
          name: thirdHorse?.horse_name_snapshot || '3rd Place',
          finishTime: thirdHorse?.finish_time || '20.5s',
        },
      }
      setWinningPodium(podium)
      setStageDescription(`Derby Winner: #${podium.winner.number} ${podium.winner.name}`)

      // Settle any active pending tickets in userBets
      const winNum = podium.winner.number
      setUserBets((prev) =>
        prev.map((b) => {
          if (b.status === 'Pending') {
            const isWon = b.horse.includes(`#${winNum}`)
            const mult = parseFloat(b.odds) || 2.5
            return {
              ...b,
              status: isWon ? 'Won' : 'Lost',
              payout: isWon ? Math.round(b.amount * mult) : 0,
            }
          }
          return b
        })
      )

      // Prepend to past races history
      setPastRaces((prev) => [
        {
          id: prev.length + 1,
          raceId: `HR_${race.game_serial || data.gameSerial || race.id || Date.now()}`,
          winner: `${podium.winner.name} (#${podium.winner.number})`,
          second: `${podium.second.name} (#${podium.second.number})`,
          third: `${podium.third.name} (#${podium.third.number})`,
          odds: podium.winner.odds,
          pool: Math.floor(95000 + Math.random() * 60000),
          time: 'Just now',
        },
        ...prev.slice(0, 49),
      ])
    })

    // 7. Jackpot Update from Server
    socket.on(HORSE_RACING_EVENTS.JACKPOT, (data) => {
      if (data) setJackpotInfo(data)
    })
    socket.on(HORSE_RACING_EVENTS.JACKPOT_UPDATE, (data) => {
      if (data) setJackpotInfo(data)
    })

    // 8. Jackpot Queue Status
    const handleJackpotQueueUpdate = (data) => {
      if (data) setJackpotQueueStatus(data)
    }
    socket.on(HORSE_RACING_EVENTS.ADMIN_JACKPOT_QUEUE_STATUS, handleJackpotQueueUpdate)
    socket.on(HORSE_RACING_EVENTS.RACE_JACKPOT_QUEUE, handleJackpotQueueUpdate)

    // 9. Forced Winner confirmation listeners
    const handleForcedWinnerConfirmed = (data) => {
      if (!data) return
      const serial = Number(data.horseSerial || data.serialNumber || data.winnerHorseSerial)
      if (serial && serial >= 1 && serial <= 12) {
        setPredeterminedWinner(serial)
        const horse = HORSES_DATA.find((h) => h.serialNumber === serial)
        toast(`Server confirmed target winner: #${horse?.number || serial} ${horse?.name || ''}`)
      } else if (data.reset) {
        setPredeterminedWinner(null)
        toast('Server confirmed winner reset to Fair RNG')
      }
    }
    socket.on(HORSE_RACING_EVENTS.RACE_SET_FORCED_WINNER, handleForcedWinnerConfirmed)
    socket.on(HORSE_RACING_EVENTS.RACE_FORCE_WINNER, handleForcedWinnerConfirmed)

    // 10. Live Bets Activity ({ totalBets: 45000, horseSerial: 6 })
    socket.on(HORSE_RACING_EVENTS.LIVE_BET, (data) => {
      if (!data) return
      const serial = Number(data.horseSerial || data.serialNumber || data.horseId)
      const total = Number(data.totalBets !== undefined ? data.totalBets : (data.amount || data.betAmount || 0))

      if (serial >= 1 && serial <= 12) {
        setHorseBets((prev) => ({
          ...prev,
          [serial]: total,
        }))

        const targetHorse = HORSES_DATA.find((h) => h.serialNumber === serial) || HORSES_DATA[serial - 1]
        const singleWager = data.amount || data.betAmount || Math.floor((data.totalBets || 1000) * 0.15) || 500

        setUserBets((prev) => [
          {
            id: Date.now() + Math.random(),
            ticketId: `TKT_${String(Math.floor(1000 + Math.random() * 9000))}`,
            user: data.username || data.userName || `Player_${Math.floor(100 + Math.random() * 900)}`,
            horse: `${targetHorse.name} (#${targetHorse.number})`,
            amount: singleWager,
            odds: `${targetHorse.odds}x`,
            payout: 0,
            status: 'Pending',
            time: 'Just now',
          },
          ...prev.slice(0, 49),
        ])
      }
    })

    return socket
  }, [])

  useEffect(() => {
    const s = initSocket()
    return () => {
      if (s) s.disconnect()
    }
  }, [initSocket])

  // Local Countdown ticking timer for smooth second-by-second countdown in WAITING state
  useEffect(() => {
    if (raceState !== 'WAITING' || isPaused) return
    if (countdown <= 0) return
    const timer = setTimeout(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0))
    }, 1000)
    return () => clearTimeout(timer)
  }, [countdown, raceState, isPaused])

  // Fallback Simulation Engine (for manual test / offline demonstration)
  const startFallbackRace = () => {
    setRaceState('RACING')
    targetPositionsRef.current = Array(12).fill(0)
    renderedPositionsRef.current = Array(12).fill(0)
    setPositions(Array(12).fill(0))
    setRaceElapsed(0)
    setWinningPodium(null)

    let chosenWinnerId = predeterminedWinner
    if (!chosenWinnerId) {
      const rand = Math.random()
      if (rand < 0.35) chosenWinnerId = 1
      else if (rand < 0.55) chosenWinnerId = 2
      else if (rand < 0.70) chosenWinnerId = 3
      else if (rand < 0.82) chosenWinnerId = 4
      else chosenWinnerId = Math.floor(Math.random() * 8) + 5
    }

    const RACE_DURATION_MS = 20000
    const startTime = performance.now()

    const horseParams = HORSES_DATA.map((h) => {
      const isWinner = h.id === chosenWinnerId
      return {
        id: h.id,
        isWinner,
        earlyFactor: 0.85 + Math.random() * 0.3,
        midFactor: 0.85 + Math.random() * 0.3,
        lateFactor: isWinner ? 1.45 + Math.random() * 0.25 : 0.8 + Math.random() * 0.25,
        phaseShift: Math.random() * Math.PI * 2,
      }
    })

    const interval = setInterval(() => {
      const elapsedMs = performance.now() - startTime
      const progress = Math.min(1, elapsedMs / RACE_DURATION_MS)

      setRaceElapsed(Math.min(20, Math.floor(elapsedMs / 1000)))

      for (let i = 0; i < 12; i++) {
        const hp = horseParams[i]
        const base = progress * 100

        if (hp.isWinner) {
          // Winner horse stays strictly in 1st place (sabse aage) throughout the track
          const leadOffset = progress > 0.05 ? 3.5 + Math.sin(progress * 8) * 0.5 : 1.2
          if (progress >= 1) {
            targetPositionsRef.current[i] = 100
          } else {
            targetPositionsRef.current[i] = Math.min(99.5, base + leadOffset)
          }
          horseSpeedsRef.current[i] = 68
        } else {
          // Baki horses uske piche rahenge, spaced out naturally
          const lagOffset = -2.2 - ((i % 5) * 1.5) + Math.sin(progress * 6 + hp.phaseShift) * 0.8
          if (progress >= 1) {
            targetPositionsRef.current[i] = Math.min(97.5, 93 - (i % 6) * 1.4)
          } else {
            targetPositionsRef.current[i] = Math.max(0, Math.min(96.5, base + lagOffset))
          }
          horseSpeedsRef.current[i] = 56 - (i % 5) * 2
        }
      }

      if (progress >= 1) {
        clearInterval(interval)
        setRaceElapsed(20)
        targetPositionsRef.current = targetPositionsRef.current.map((pos, idx) => (idx === chosenWinnerId - 1 ? 100 : Math.min(98, pos)))
        renderedPositionsRef.current = [...targetPositionsRef.current]
        setPositions([...targetPositionsRef.current])

        const winner = HORSES_DATA.find((h) => h.id === chosenWinnerId) || HORSES_DATA[0]
        const remaining = HORSES_DATA.filter((h) => h.id !== chosenWinnerId)
        const second = remaining[0]
        const third = remaining[1]

        setWinningPodium({
          winner: { ...winner, finishTime: '20.0s' },
          second: { ...second, finishTime: '20.3s' },
          third: { ...third, finishTime: '20.5s' },
        })
        setRaceState('FINISHED')

        const newRace = {
          id: pastRaces.length + 1,
          raceId: `HR_${raceNo}`,
          winner: `${winner.name} (#${winner.number})`,
          second: `${second.name} (#${second.number})`,
          third: `${third.name} (#${third.number})`,
          odds: `${winner.odds}x`,
          pool: Math.floor(80000 + Math.random() * 70000),
          time: 'Just now',
        }
        setPastRaces((prev) => [newRace, ...prev])
        setPredeterminedWinner(null)

        setTimeout(() => {
          targetPositionsRef.current = Array(12).fill(0)
          renderedPositionsRef.current = Array(12).fill(0)
          setPositions(Array(12).fill(0))
          setRaceElapsed(0)
          setCountdown(20)
          setRaceState('WAITING')
        }, 6500)
      }
    }, 50)
  }

  // Emit Admin Forced Winner to live socket ('admin:set_forced_winner' & 'admin:force_winner')
  const handleForceWinner = (horseId) => {
    setPredeterminedWinner(horseId)
    predeterminedWinnerRef.current = horseId
    try {
      if (horseId) {
        localStorage.setItem('horse_forced_winner', String(horseId))
      } else {
        localStorage.removeItem('horse_forced_winner')
      }
    } catch {}

    const horse = HORSES_DATA.find((x) => x.id === horseId)

    if (!horse) {
      // Reset to Fair RNG
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit(HORSE_RACING_EVENTS.ADMIN_SET_FORCED_WINNER, {
          horseSerial: null,
          reset: true,
          token: auth.getToken(),
        })
        socketRef.current.emit(HORSE_RACING_EVENTS.ADMIN_FORCE_WINNER, {
          horseSerial: null,
          reset: true,
        })
      }
      toast('Derby winner reset to Auto Provably Fair RNG')
      return
    }

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(HORSE_RACING_EVENTS.ADMIN_SET_FORCED_WINNER, {
        horseSerial: horse.serialNumber,
        serialNumber: horse.serialNumber,
        horseId: horse.id,
        token: auth.getToken(),
      }, (ack) => {
        if (ack?.success) {
          toast(`Server ACK: #${horse.number} ${horse.name} forced as winner!`)
        }
      })
      socketRef.current.emit(HORSE_RACING_EVENTS.ADMIN_FORCE_WINNER, {
        horseSerial: horse.serialNumber,
        serialNumber: horse.serialNumber,
        horseId: horse.id,
      })
    }
    toast(`Active Forced Winner: #${horse.number} ${horse.name} (Har race me 1st aayega!)`)
  }

  // Alias for backward compatibility
  const handleSetPredeterminedWinner = handleForceWinner

  // Emit Admin Jackpot Controls ("Kab Dena Kab Nahi")
  const handleSetJackpot = ({ enabled, multiplier = selectedMultiplier, mode = selectedJackpotMode }) => {
    const multLabel = `${multiplier}X`
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(HORSE_RACING_EVENTS.ADMIN_SET_JACKPOT, {
        enabled,
        multiplier,
        multiplierLabel: multLabel,
        mode: enabled ? mode : 'OFF',
        token: auth.getToken(),
      }, (ack) => {
        if (ack?.success) {
          toast(ack.message || `Jackpot ${enabled ? `${multLabel} (${mode}) Enabled` : 'Disabled'}`)
        }
      })
      socketRef.current.emit(HORSE_RACING_EVENTS.ADMIN_FORCE_JACKPOT, {
        enabled,
        multiplier,
        multiplierLabel: multLabel,
        mode: enabled ? mode : 'OFF',
      })
    }
    setJackpotInfo({
      isJackpot: enabled,
      enabled,
      multiplier: enabled ? multiplier : 1,
      multiplierLabel: multLabel,
      label: multLabel,
      mode: enabled ? mode : 'OFF',
      message: enabled
        ? `🔥 ADMIN JACKPOT: ${multLabel} PAYOUT (${mode === 'CONTINUOUS' ? 'Continuous Races' : 'Next Race Only'})`
        : null,
    })
    toast(`Jackpot ${enabled ? `Activated (${multLabel} - ${mode})` : 'Turned OFF'}`)
  }

  // Query server jackpot queue status ('admin:jackpot_queue_status')
  const handleQueryJackpotQueue = () => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(HORSE_RACING_EVENTS.ADMIN_JACKPOT_QUEUE_STATUS, {
        token: auth.getToken(),
      }, (ack) => {
        if (ack) {
          setJackpotQueueStatus(ack)
          toast('Jackpot queue status synchronized!')
        }
      })
    } else {
      toast('Socket not connected')
    }
  }

  const handleInstantFinish = () => {
    if (raceState !== 'RACING') {
      toast('Wait for race to start')
      return
    }
    targetPositionsRef.current = Array(12).fill(100)
  }

  // Current ranking of 12 horses (Forced Winner is strictly top #1)
  const currentLeaderboard = HORSES_DATA.map((h, i) => {
    const live = liveHorsesData[h.serialNumber]
    const isForced = predeterminedWinner === h.id
    return {
      ...h,
      progress: positions[i],
      currentRank: isForced && (raceState === 'RACING' || raceState === 'FINISHED') ? 1 : live?.currentRank,
      speedKmh: isForced && raceState === 'RACING' ? Math.max(live?.speedKmh || 65, 68) : live?.speedKmh,
      gapToLeaderM: isForced && raceState === 'RACING' ? 0 : live?.gapToLeaderM,
      status: isForced && raceState === 'RACING' ? 'LEADING' : live?.status,
    }
  }).sort((a, b) => {
    if (predeterminedWinner) {
      if (a.id === predeterminedWinner) return -1
      if (b.id === predeterminedWinner) return 1
    }
    if (a.currentRank && b.currentRank) return a.currentRank - b.currentRank
    return b.progress - a.progress
  })

  const raceCols = [
    { key: 'raceId', label: 'Race ID / Serial', render: (r) => <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{r.raceId}</span> },
    {
      key: 'winner',
      label: '1st Place (Winner)',
      render: (r) => (
        <span className="inline-flex items-center gap-1.5 font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 text-xs">
          <Trophy size={13} className="text-amber-500 fill-amber-500" />
          {r.winner}
        </span>
      ),
    },
    { key: 'second', label: '2nd Place', render: (r) => <span className="text-xs font-semibold text-slate-700">{r.second}</span> },
    { key: 'third', label: '3rd Place', render: (r) => <span className="text-xs font-semibold text-slate-500">{r.third}</span> },
    { key: 'odds', label: 'Winning Odds', render: (r) => <span className="font-mono text-xs font-black text-emerald-600">{r.odds}</span> },
    { key: 'pool', label: 'Total Pool', render: (r) => <span className="font-mono text-xs font-bold text-slate-800">{money(r.pool)}</span> },
    { key: 'time', label: 'Settled', render: (r) => <span className="text-xs text-slate-400">{r.time}</span> },
  ]

  const betCols = [
    { key: 'ticketId', label: 'Ticket', render: (r) => <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">{r.ticketId}</span> },
    { key: 'user', label: 'Player Name', render: (r) => <span className="font-extrabold text-slate-900 text-xs">{r.user}</span> },
    { key: 'horse', label: 'Selected Horse', render: (r) => <span className="font-bold text-slate-800 text-xs">{r.horse}</span> },
    { key: 'amount', label: 'Bet Wagered', render: (r) => <span className="font-mono text-xs font-bold text-slate-900">{money(r.amount)}</span> },
    { key: 'odds', label: 'Odds', render: (r) => <span className="font-mono text-xs text-slate-600 font-semibold">{r.odds}</span> },
    {
      key: 'payout',
      label: 'Payout',
      render: (r) => (
        <span className={`font-mono text-xs font-black ${r.payout > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
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
          {r.status === 'Won' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
          {r.status}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      {/* Page Banner with Badges & Socket Status */}
      <PageBanner
        title="Horse-Riding Championship Arena"
        icon={Dices}
        bgImage={horseBg}
        crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Games' }, { label: 'Horse-Riding' }]}
      >
        <div className="flex flex-wrap items-center gap-2">
          {/* Live Runner Count */}
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md border border-emerald-400/60">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-200 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            12 Horses Live
          </span>

          {/* Real-time Socket Indicator */}
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-md border ${
            socketConnected
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
              : 'bg-amber-950/80 border-amber-500/60 text-amber-200'
          }`}>
            <Radio size={13} className={socketConnected ? 'animate-pulse text-emerald-400' : 'text-amber-400'} />
            {socketConnected ? 'Live Socket: 60FPS' : 'Connecting Engine...'}
          </span>

          {/* Active Jackpot Alert Badge */}
          {jackpotInfo?.isJackpot && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 border border-rose-400/80 px-3.5 py-1.5 text-xs font-black text-white shadow-md animate-pulse">
              <Flame size={13} className="text-amber-300" />
              {jackpotInfo.label || `${jackpotInfo.multiplier}X`} JACKPOT ACTIVE
            </span>
          )}

          {/* Engine Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 px-3.5 py-1.5 text-xs font-bold text-white shadow-md">
            <Flag size={13} className="text-amber-400" />
            Turf Racecourse Engine
          </span>

          {/* Re-sync Button */}
          <button
            type="button"
            onClick={initSocket}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3 py-1.5 text-xs font-bold shadow-md transition cursor-pointer"
            title="Re-sync with Live Socket: https://horseracing.siberiancrane.tech/"
          >
            <RefreshCw size={12} className={isSyncing ? 'animate-spin text-blue-400' : ''} />
            {isSyncing ? 'Syncing...' : 'Sync Engine'}
          </button>
        </div>
      </PageBanner>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Race Turnover</p>
              <span className="rounded bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-1.5 py-0.2 border border-emerald-200">
                +18.2%
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {money(1485200)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Across 842 settled derbies</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Crown size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Platform Net Yield</p>
              <span className="rounded bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-1.5 py-0.2 border border-emerald-200">
                24.4% Margin
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {money(362400)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">GGR house revenue</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <BarChart3 size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Derby Jockeys</p>
              <span className="rounded bg-blue-50 text-blue-700 text-[10px] font-extrabold px-1.5 py-0.2 border border-blue-200">
                Lined Up
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              12 Runners
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {leaderInfo ? `Leader: ${leaderInfo.name} (${leaderInfo.speedKmh} km/h)` : 'All starting stalls loaded'}
            </p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Users size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Current Race Serial</p>
              <span className={`rounded text-[10px] font-extrabold px-1.5 py-0.2 border ${
                socketConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {socketConnected ? 'Socket Live' : 'Offline'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5 tracking-tight font-mono truncate">
              #{raceNo}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {raceState === 'RACING'
                ? `RACING: ${timeRemaining || Math.max(0, 20 - raceElapsed)}s left`
                : raceState === 'BETTING_CLOSED'
                ? `Countdown: ${countdown}s`
                : raceState === 'FINISHED'
                ? 'RACE FINISHED'
                : `Betting: ${countdown}s`}
            </p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* 1 SINGLE CLEAN CARD: 12-HORSES LIVE RACE TRACK ARENA */}
      <div className="card bg-[#0b101b] rounded-2xl border border-slate-800 shadow-xl overflow-hidden space-y-0">
        {/* Arena Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-slate-900 via-[#101726] to-slate-900 border-b border-slate-800 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Trophy size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-wide text-white">
                  ROYAL TURF DERBY #{raceNo}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                  raceState === 'RACING'
                    ? 'bg-emerald-500 text-white animate-pulse'
                    : raceState === 'BETTING_CLOSED'
                    ? 'bg-rose-600 text-white animate-pulse'
                    : raceState === 'FINISHED'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-blue-600 text-white'
                }`}>
                  {raceState === 'RACING'
                    ? `⚡ LIVE DERBY (${timeRemaining || Math.max(0, 20 - raceElapsed)}s left)`
                    : raceState === 'BETTING_CLOSED'
                    ? `🔒 BETS CLOSED (Gates Open in ${countdown}s)`
                    : raceState === 'FINISHED'
                    ? '🏁 RESULT SETTLED'
                    : `GATES OPEN IN ${countdown}S`}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {stageDescription || '1000M Thoroughbred Championship Course · 60FPS Fluid Physics'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!socketConnected && raceState === 'WAITING' && (
              <button
                onClick={startFallbackRace}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:from-emerald-700 hover:to-teal-700 transition"
              >
                <Play size={13} fill="currentColor" /> Open Gates (Demo)
              </button>
            )}

            {raceState === 'RACING' && !socketConnected && (
              <button
                onClick={handleInstantFinish}
                className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition"
              >
                <Zap size={13} /> Instant Finish
              </button>
            )}

            <button
              onClick={() => {
                initSocket()
                toast('Reconnecting to Live Derby Socket...')
              }}
              className="flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
              title="Re-sync Socket"
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Jackpot Announcement Bar (if active) */}
        {jackpotInfo?.isJackpot && (
          <div className="bg-gradient-to-r from-rose-950 via-amber-950 to-rose-950 border-b border-rose-500/40 px-4 py-2 flex items-center justify-between text-white text-xs">
            <span className="flex items-center gap-1.5 font-bold text-amber-300">
              <Flame size={14} className="text-rose-400 animate-bounce" />
              {jackpotInfo.message || `🔥 JACKPOT ACTIVE: ${jackpotInfo.multiplier}X PAYOUT ON ALL RUNNERS!`}
            </span>
            <span className="font-mono text-[11px] bg-rose-600 px-2 py-0.5 rounded font-black">
              {jackpotInfo.label || `${jackpotInfo.multiplier}X`}
            </span>
          </div>
        )}

        {/* Persistent Forced Winner Announcement Bar (Active for all races) */}
        {predeterminedWinner && (
          <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-950 border-b border-emerald-500/50 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-white text-xs">
            <span className="flex items-center gap-2 font-bold text-emerald-300">
              <Crown size={15} className="text-amber-400 animate-bounce" />
              <span>
                ACTIVE FORCED WINNER (Har Race Me 1st Aayega):{' '}
                <strong className="text-white underline font-black">
                  Horse #{String(predeterminedWinner).padStart(2, '0')} · {HORSES_DATA.find((x) => x.id === predeterminedWinner)?.name}
                </strong>
              </span>
            </span>
            <button
              onClick={() => handleForceWinner(null)}
              className="flex items-center gap-1 font-mono text-[10px] bg-rose-600/90 hover:bg-rose-700 px-2.5 py-1 rounded-md font-black text-white transition shadow-sm border border-rose-400"
            >
              <Power size={11} /> Turn OFF (Auto RNG)
            </button>
          </div>
        )}

        {/* Live Podium Notification when race finishes */}
        {raceState === 'FINISHED' && winningPodium && (
          <div className="bg-gradient-to-r from-amber-950/80 via-amber-900/50 to-amber-950/80 border-b border-amber-500/40 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-white animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-md font-black text-lg">
                🥇
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                  Official Derby Winner
                </span>
                <span className="text-base font-black text-white">
                  Horse #{winningPodium.winner.number} · {winningPodium.winner.name} ({winningPodium.winner.odds})
                </span>
                <span className="text-xs text-amber-200 block">
                  Time: {winningPodium.winner.finishTime} • Jockey: {winningPodium.winner.jockey || 'Ace'} • Winnings Settled
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <span className="text-slate-400 font-bold block text-[10px]">2ND PLACE</span>
                <span className="font-bold text-white">#{winningPodium.second.number} {winningPodium.second.name}</span>
              </div>
              <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <span className="text-slate-400 font-bold block text-[10px]">3RD PLACE</span>
                <span className="font-bold text-white">#{winningPodium.third.number} {winningPodium.third.name}</span>
              </div>
            </div>
          </div>
        )}

        {/* THE 12-LANE RACECOURSE TRACK */}
        <div className="p-3 sm:p-4 bg-[#080d17] relative select-none">
          {/* Track Surface container */}
          <div className="relative rounded-xl border border-slate-800/80 bg-gradient-to-r from-[#172514] via-[#1f331b] to-[#172514] p-2 space-y-1.5 overflow-x-auto shadow-inner">
            {/* Top Turf Distance Markers */}
            <div className="flex justify-between text-[10px] font-black text-emerald-400/80 border-b border-emerald-900/50 pb-1 px-14 font-mono">
              <span>START GATES (0m)</span>
              <span>250m</span>
              <span>500m</span>
              <span>750m</span>
              <span className="text-amber-400 flex items-center gap-1 font-bold">
                <Flag size={11} /> FINISH (1000m)
              </span>
            </div>

            {/* Checkered Finish Line Strip on the right */}
            <div className="absolute right-3 top-7 bottom-2 w-3.5 bg-[repeating-conic-gradient(#fff_0_25%,#000_0_50%)] bg-[length:7px_7px] opacity-80 rounded-r pointer-events-none z-10 shadow-lg border-l border-white" />

            {/* Starting Stalls Gate on the left */}
            <div className="absolute left-14 top-7 bottom-2 w-1.5 bg-amber-500/70 pointer-events-none z-10 shadow-sm" />

            {/* 12 HORSE LANES */}
            {HORSES_DATA.map((horse, idx) => {
              const pos = positions[idx] || 0
              const live = liveHorsesData[horse.serialNumber]
              const currentRank = live?.currentRank || (currentLeaderboard.findIndex((h) => h.id === horse.id) + 1)
              const isLead = currentRank === 1 && raceState === 'RACING' && pos > 3

              return (
                <div
                  key={horse.id}
                  className={`relative flex items-center h-11 sm:h-12 rounded-lg px-1.5 transition-colors border ${
                    isLead
                      ? 'bg-amber-950/40 border-amber-500/50 shadow-xs'
                      : 'bg-black/25 border-emerald-900/40 hover:bg-black/40'
                  }`}
                >
                  {/* Stall Number, Rank, Forced Winner & Realtime Bet Chip Badge */}
                  <div className="flex items-center gap-1.5 w-auto min-w-[70px] max-w-[130px] shrink-0 z-20">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-black text-white shadow-xs"
                      style={{ backgroundColor: horse.color }}
                    >
                      {horse.number}
                    </span>
                    <span className="text-[10px] font-mono text-slate-300 font-bold">
                      {currentRank}º
                    </span>
                    {predeterminedWinner === horse.id && (
                      <span className="text-[9px] font-black bg-amber-500 text-slate-950 px-1 py-0.5 rounded leading-none shadow-xs">
                        ★ WIN
                      </span>
                    )}
                    {(horseBets[horse.serialNumber] || 0) > 0 && (
                      <span className="hidden sm:inline-flex items-center gap-0.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 px-1 py-0.5 rounded text-[9px] font-mono font-bold">
                        <Coins size={9} className="text-amber-400" />
                        ₹{(horseBets[horse.serialNumber] || 0).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Lane Turf Track Background */}
                  <div className="relative flex-1 h-full flex items-center">
                    {/* Turf lane divider lines */}
                    <div className="absolute inset-x-0 h-0.5 bg-emerald-950/50 pointer-events-none" />

                    {/* Smooth 60FPS Hardware-Accelerated Galloping Runner */}
                    <div
                      className="absolute top-[52%] flex items-center gap-1 z-20 pointer-events-none"
                      style={{
                        left: `${Math.min(99.5, Math.max(0, pos)) * 0.88}%`,
                        transform: 'translateY(-50%) translateZ(0)',
                        willChange: 'left',
                      }}
                    >
                      <RaceHorseRunner
                        horse={horse}
                        isRacing={raceState === 'RACING'}
                        speedKmh={live?.speedKmh}
                        status={live?.status}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Realtime Race Progress Bar & Live Rank Stream */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400">Live Top 3 Jockeys:</span>
              <div className="flex items-center gap-1.5">
                {currentLeaderboard.slice(0, 3).map((h, i) => (
                  <span
                    key={h.id}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-extrabold text-white"
                    style={{ backgroundColor: h.color }}
                  >
                    <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                    <span>#{h.number} {h.name}</span>
                    {h.speedKmh && <span className="opacity-80 text-[9px]">({h.speedKmh}km/h)</span>}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
              <span>Course: 1000m Fast Turf</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Radio size={11} className={socketConnected ? 'animate-pulse text-emerald-400' : 'text-slate-500'} />
                {socketConnected ? 'Realtime 60FPS Feed' : 'Offline / Standalone Engine'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 12 RUNNERS LINEUP & ODDS CARDS */}
      <div className="card bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Users size={16} />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 tracking-tight">
                Official 12-Runners Starting Stalls & Odds
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Live field runner metrics, jockey assignments and platform payout multiples
              </p>
            </div>
          </div>

          <span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-xs font-bold">
            12 of 12 Loaded in Stalls
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {HORSES_DATA.map((h) => {
            const betAmt = horseBets[h.serialNumber] || 0
            const poolPct = totalLiveBetsPool > 0 ? Math.round((betAmt / totalLiveBetsPool) * 100) : 0
            const isTarget = predeterminedWinner === h.id

            return (
              <div
                key={h.id}
                className={`p-2.5 rounded-xl border transition flex flex-col justify-between ${
                  isTarget
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500 shadow-md'
                    : `${h.lightBg} hover:shadow-xs`
                }`}
              >
                <div>
                  {/* Visual Active Badge when locked */}
                  {isTarget && (
                    <div className="mb-2 flex items-center justify-between bg-emerald-600 text-white rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-xs animate-pulse">
                      <span className="flex items-center gap-1">
                        <Crown size={10} /> ACTIVE WINNER
                      </span>
                      <span className="bg-emerald-800 text-[8px] px-1 rounded">HAR RACE</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-1">
                    <span
                      className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-black text-white shadow-2xs"
                      style={{ backgroundColor: h.color }}
                    >
                      {h.number}
                    </span>
                    <span className="font-mono text-xs font-black text-slate-900">
                      {h.odds}x
                    </span>
                  </div>

                  <div className="mt-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 block truncate">
                        {h.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">
                      Jockey: {h.jockey}
                    </span>
                  </div>

                  {/* Realtime Bet Volume & Pool Share on this horse */}
                  <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[10px]">
                    <div className="flex items-center justify-between text-slate-600 font-mono">
                      <span className="text-[9.5px] font-bold flex items-center gap-0.5 text-slate-500">
                        <Coins size={10} className="text-amber-500" /> Bets:
                      </span>
                      <span className="font-extrabold text-slate-900">
                        ₹{betAmt.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-1 mt-1 overflow-hidden">
                      <div
                        className="bg-amber-500 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, poolPct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[8.5px] text-slate-400 mt-0.5">
                      <span>Pool Share</span>
                      <span className="font-bold text-slate-600">{poolPct}%</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleForceWinner(isTarget ? null : h.id)}
                  className={`mt-2 w-full rounded-lg py-1.5 text-[10px] font-black transition text-center shadow-xs flex items-center justify-center gap-1 ${
                    isTarget
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-1 ring-emerald-400'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  {isTarget ? (
                    <>
                      <Check size={12} className="stroke-[3]" />
                      <span>ACTIVE WINNER (Turn Off)</span>
                    </>
                  ) : (
                    <>
                      <Zap size={11} />
                      <span>Force Win</span>
                    </>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* ADMIN CONTROL CONSOLE & RESULT OVERRIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CARD 1: Forced Winner Controller ("Kon se horse ko jitana hai") */}
        <div className="card bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Sliders size={16} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 tracking-tight">
                  Forced Winner Override
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Kon se horse ko jitana hai (Har race ke liye active)
                </p>
              </div>
            </div>

            {predeterminedWinner ? (
              <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 px-2.5 py-0.5 text-xs font-black flex items-center gap-1 shadow-xs animate-pulse">
                <Crown size={12} className="text-emerald-600" /> ACTIVE: Horse #{String(predeterminedWinner).padStart(2, '0')} (Har Race)
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-xs font-semibold">
                Auto Provably Fair RNG
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-700 block">
              Select Guaranteed Winner (Persistent Across Races):
            </label>
            <select
              value={predeterminedWinner || ''}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value) : null
                handleForceWinner(val)
              }}
              className="input !text-xs font-bold w-full"
            >
              <option value="">Auto Provably Fair RNG (Natural Race)</option>
              {HORSES_DATA.map((h) => (
                <option key={h.id} value={h.id}>
                  Horse #{h.number} - {h.name} (Jockey: {h.jockey} | Odds: {h.odds}x)
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 pt-1">
              {predeterminedWinner ? (
                <div className="w-full space-y-2">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-xs text-emerald-800 font-bold flex items-center gap-2">
                    <Crown size={14} className="text-amber-500 shrink-0" />
                    <span>
                      Horse #{HORSES_DATA.find((x) => x.id === predeterminedWinner)?.number} {HORSES_DATA.find((x) => x.id === predeterminedWinner)?.name} har race me sabse aage rahega jab tak aap reset na karein.
                    </span>
                  </div>
                  <button
                    onClick={() => handleForceWinner(null)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition shadow-2xs"
                  >
                    <Power size={13} /> Reset to Auto RNG (Remove Lock)
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">
                  * Ek baar horse lock karne par wo <strong>har aane wali race</strong> me automatically winner rahega.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CARD 2: Jackpot Multiplier Engine ("Jackpot kab dena kab nahi") */}
        <div className="card bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 tracking-tight">
                  Jackpot Multiplier Engine
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Jackpot kab dena kab nahi (Pacing & Modes)
                </p>
              </div>
            </div>

            {jackpotInfo?.isJackpot || jackpotInfo?.enabled ? (
              <span className="rounded-full bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1 shadow-2xs animate-pulse">
                <Flame size={12} className="text-rose-500" /> {jackpotInfo.multiplierLabel || `${jackpotInfo.multiplier}X`} ({jackpotInfo.mode || 'ON'})
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-xs font-semibold">
                Jackpot Disabled (Normal)
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {/* Multiplier buttons */}
            <div>
              <span className="text-[11px] font-bold text-slate-700 block mb-1">
                Payout Multiplier:
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[2, 3, 4, 5].map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMultiplier(m)}
                    className={`py-1 rounded-lg text-xs font-black transition border ${
                      selectedMultiplier === m
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs ring-1 ring-amber-400'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m}X
                  </button>
                ))}
              </div>
            </div>

            {/* Mode selector */}
            <div>
              <span className="text-[11px] font-bold text-slate-700 block mb-1">
                Duration / Mode:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setSelectedJackpotMode('CONTINUOUS')}
                  className={`py-1 px-2 rounded-lg text-[11px] font-bold transition border ${
                    selectedJackpotMode === 'CONTINUOUS'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Continuous (Har Race)
                </button>
                <button
                  onClick={() => setSelectedJackpotMode('NEXT_ROUND')}
                  className={`py-1 px-2 rounded-lg text-[11px] font-bold transition border ${
                    selectedJackpotMode === 'NEXT_ROUND'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Next Race Only (1 Race)
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() =>
                  handleSetJackpot({
                    enabled: true,
                    multiplier: selectedMultiplier,
                    mode: selectedJackpotMode,
                  })
                }
                className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black py-1.5 text-xs shadow-2xs transition"
              >
                <Zap size={13} fill="currentColor" /> Apply {selectedMultiplier}X
              </button>

              <button
                onClick={() =>
                  handleSetJackpot({
                    enabled: false,
                    multiplier: 1,
                    mode: 'OFF',
                  })
                }
                className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2.5 py-1.5 text-xs transition"
                title="Disable Jackpot (Band Karo)"
              >
                Turn OFF
              </button>

              <button
                onClick={handleQueryJackpotQueue}
                className="rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold px-2.5 py-1.5 text-xs transition"
                title="Check Jackpot Queue Status"
              >
                <RefreshCw size={12} />
              </button>
            </div>

            {jackpotQueueStatus && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-[10px] text-slate-600 font-mono">
                Queue: {JSON.stringify(jackpotQueueStatus).slice(0, 60)}...
              </div>
            )}
          </div>
        </div>

        {/* CARD 3: Emergency Live Controls & Betting Volume */}
        <div className="card bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Coins size={16} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 tracking-tight">
                  Realtime Bets & Emergency
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Har horse pe bets volume (Socket Feed)
                </p>
              </div>
            </div>

            {/* Total Active Pool Metric */}
            <div className="my-2.5 p-2.5 rounded-xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Live Race Pool (12 Horses)
                </span>
                <span className="text-lg font-black font-mono text-amber-400">
                  ₹{totalLiveBetsPool.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Total Tickets</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {userBets.length} Active
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsPaused(!isPaused)
                  toast(isPaused ? 'Derby schedule resumed' : 'Derby schedule paused')
                }}
                className={`w-full flex items-center justify-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  isPaused
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                {isPaused ? <Play size={13} /> : <Pause size={13} />}
                <span>{isPaused ? 'Resume Race Schedule' : 'Pause Race Schedule'}</span>
              </button>

              <button
                onClick={handleInstantFinish}
                disabled={raceState !== 'RACING'}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-black text-white hover:bg-black transition disabled:opacity-50"
              >
                <Zap size={13} /> Instant Finish Current Race
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Derby Speed: <strong>1.0x Normal</strong></span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <Check size={12} /> Realtime Connected
            </span>
          </div>
        </div>
      </div>

      {/* RACE HISTORY & USER BETS TABLES */}
      <div className="card bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Trophy size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 tracking-tight text-base">
                Derby Race History & Player Vouchers
              </h3>
              <p className="text-xs text-slate-500">Review past winning jockeys, trifecta rankings and wager settlements</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('races')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === 'races'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Race History</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${activeTab === 'races' ? 'bg-blue-700 text-white' : 'bg-white text-slate-600'}`}>
                {pastRaces.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('bets')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                activeTab === 'bets'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>User Bets</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${activeTab === 'bets' ? 'bg-blue-700 text-white' : 'bg-white text-slate-600'}`}>
                {userBets.length}
              </span>
            </button>

            <button
              onClick={() => exportCSV(activeTab === 'races' ? 'horse_race_history' : 'horse_user_bets', activeTab === 'races' ? raceCols : betCols, activeTab === 'races' ? pastRaces : userBets)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition ml-2"
            >
              <FileSpreadsheet size={14} /> Export to Excel
            </button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={activeTab === 'races' ? raceCols : betCols}
          rows={activeTab === 'races' ? pastRaces : userBets}
          unit={activeTab === 'races' ? 'races' : 'bets'}
          placeholder={activeTab === 'races' ? 'Search by race ID or winner...' : 'Search by player or horse...'}
        />
      </div>

      {node}
    </div>
  )
}
