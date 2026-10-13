import { useState, useEffect, useRef } from 'react'
import {
  Trophy, Flag, Zap, Clock, Sliders, CheckCircle2, AlertCircle,
  FileSpreadsheet, Play, Pause, RefreshCw, Crown, Users, BarChart3,
  Flame, ShieldAlert, Sparkles, Dices, ChevronRight, ArrowUpRight
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, money, useToast } from '@/components/ui'

// 12 Horses with distinct colors, jockeys, and baseline odds
const HORSES_DATA = [
  { id: 1, name: 'Red Lightning', jockey: 'A. Sharma', color: '#ef4444', bg: 'bg-red-500', text: 'text-red-500', lightBg: 'bg-red-50 border-red-200', odds: 2.8, number: '01' },
  { id: 2, name: 'Royal Sapphire', jockey: 'K. Patel', color: '#3b82f6', bg: 'bg-blue-500', text: 'text-blue-500', lightBg: 'bg-blue-50 border-blue-200', odds: 3.4, number: '02' },
  { id: 3, name: 'Golden Stallion', jockey: 'R. Rawat', color: '#eab308', bg: 'bg-amber-500', text: 'text-amber-500', lightBg: 'bg-amber-50 border-amber-200', odds: 4.2, number: '03' },
  { id: 4, name: 'Emerald Duke', jockey: 'M. Verma', color: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-500', lightBg: 'bg-emerald-50 border-emerald-200', odds: 5.5, number: '04' },
  { id: 5, name: 'Purple Storm', jockey: 'S. Singh', color: '#a855f7', bg: 'bg-purple-500', text: 'text-purple-500', lightBg: 'bg-purple-50 border-purple-200', odds: 6.8, number: '05' },
  { id: 6, name: 'Black Shadow', jockey: 'D. Mehta', color: '#334155', bg: 'bg-slate-700', text: 'text-slate-700', lightBg: 'bg-slate-100 border-slate-300', odds: 8.0, number: '06' },
  { id: 7, name: 'Silver Comet', jockey: 'V. Joshi', color: '#64748b', bg: 'bg-slate-500', text: 'text-slate-500', lightBg: 'bg-slate-50 border-slate-200', odds: 9.5, number: '07' },
  { id: 8, name: 'Crimson Blaze', jockey: 'P. Nair', color: '#f43f5e', bg: 'bg-rose-500', text: 'text-rose-500', lightBg: 'bg-rose-50 border-rose-200', odds: 11.0, number: '08' },
  { id: 9, name: 'Ocean Breeze', jockey: 'H. Khan', color: '#06b6d4', bg: 'bg-cyan-500', text: 'text-cyan-500', lightBg: 'bg-cyan-50 border-cyan-200', odds: 13.5, number: '09' },
  { id: 10, name: 'Desert King', jockey: 'I. Gill', color: '#f97316', bg: 'bg-orange-500', text: 'text-orange-500', lightBg: 'bg-orange-50 border-orange-200', odds: 16.0, number: '10' },
  { id: 11, name: 'Midnight Star', jockey: 'T. Rao', color: '#6366f1', bg: 'bg-indigo-500', text: 'text-indigo-500', lightBg: 'bg-indigo-50 border-indigo-200', odds: 18.5, number: '11' },
  { id: 12, name: 'Diamond Express', jockey: 'N. Das', color: '#ec4899', bg: 'bg-pink-500', text: 'text-pink-500', lightBg: 'bg-pink-50 border-pink-200', odds: 22.0, number: '12' },
]

const SEED_RACES = [
  { id: 1, raceId: 'HR_9921', winner: 'Red Lightning (#01)', second: 'Golden Stallion (#03)', third: 'Emerald Duke (#04)', odds: '2.8x', pool: 124500, time: '2 mins ago' },
  { id: 2, raceId: 'HR_9920', winner: 'Royal Sapphire (#02)', second: 'Purple Storm (#05)', third: 'Desert King (#10)', odds: '3.4x', pool: 98000, time: '6 mins ago' },
  { id: 3, raceId: 'HR_9919', winner: 'Black Shadow (#06)', second: 'Red Lightning (#01)', third: 'Silver Comet (#07)', odds: '8.0x', pool: 142000, time: '10 mins ago' },
  { id: 4, raceId: 'HR_9918', winner: 'Emerald Duke (#04)', second: 'Royal Sapphire (#02)', third: 'Crimson Blaze (#08)', odds: '5.5x', pool: 110500, time: '14 mins ago' },
  { id: 5, raceId: 'HR_9917', winner: 'Desert King (#10)', second: 'Diamond Express (#12)', third: 'Midnight Star (#11)', odds: '16.0x', pool: 89000, time: '18 mins ago' },
]

const SEED_BETS = [
  { id: 1, ticketId: 'TKT_7812', user: 'Vikram Rawat', horse: 'Red Lightning (#01)', amount: 1500, odds: '2.8x', payout: 4200, status: 'Won' },
  { id: 2, ticketId: 'TKT_7813', user: 'Kunal Joshi', horse: 'Royal Sapphire (#02)', amount: 500, odds: '3.4x', payout: 0, status: 'Lost' },
  { id: 3, ticketId: 'TKT_7814', user: 'Aman Verma', horse: 'Golden Stallion (#03)', amount: 2000, odds: '4.2x', payout: 0, status: 'Lost' },
  { id: 4, ticketId: 'TKT_7815', user: 'Pooja Singh', horse: 'Emerald Duke (#04)', amount: 800, odds: '5.5x', payout: 4400, status: 'Won' },
  { id: 5, ticketId: 'TKT_7816', user: 'Deepak Mehta', horse: 'Purple Storm (#05)', amount: 1200, odds: '6.8x', payout: 0, status: 'Lost' },
  { id: 6, ticketId: 'TKT_7817', user: 'Sneha Patel', horse: 'Desert King (#10)', amount: 300, odds: '16.0x', payout: 4800, status: 'Won' },
]

export default function HorseRiding() {
  const [toast, node] = useToast()
  const [raceNo, setRaceNo] = useState(9922)
  const [raceState, setRaceState] = useState('WAITING') // 'WAITING' | 'RACING' | 'FINISHED'
  const [countdown, setCountdown] = useState(6)
  const [activeTab, setActiveTab] = useState('races') // 'races' | 'bets'
  const [pastRaces, setPastRaces] = useState(SEED_RACES)
  const [userBets] = useState(SEED_BETS)
  const [predeterminedWinner, setPredeterminedWinner] = useState(null)
  const [winningPodium, setWinningPodium] = useState(null)

  // Horse positions in percentage (0 to 100)
  const [positions, setPositions] = useState(() => Array(12).fill(0))
  const [raceElapsed, setRaceElapsed] = useState(0) // 0 to 20 seconds
  const [isPaused, setIsPaused] = useState(false)

  const positionsRef = useRef(positions)
  positionsRef.current = positions

  const raceStateRef = useRef(raceState)
  raceStateRef.current = raceState

  const animFrameRef = useRef(null)

  // Countdown timer for next race
  useEffect(() => {
    if (raceState !== 'WAITING' || isPaused) return
    if (countdown <= 0) {
      startRace()
      return
    }
    const timer = setTimeout(() => {
      setCountdown((c) => c - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [countdown, raceState, isPaused])

  // Start the 12 horses race (Duration: exactly 20 seconds)
  const startRace = () => {
    setRaceState('RACING')
    setPositions(Array(12).fill(0))
    setRaceElapsed(0)
    setWinningPodium(null)

    // Pre-calculate target speeds/winner
    let chosenWinnerId = predeterminedWinner
    if (!chosenWinnerId) {
      // Weighted pick based on odds
      const rand = Math.random()
      if (rand < 0.35) chosenWinnerId = 1
      else if (rand < 0.55) chosenWinnerId = 2
      else if (rand < 0.70) chosenWinnerId = 3
      else if (rand < 0.82) chosenWinnerId = 4
      else chosenWinnerId = Math.floor(Math.random() * 8) + 5
    }

    const RACE_DURATION_MS = 20000 // 20 seconds duration
    const startTime = performance.now()

    // Assign randomized characteristics per horse so ranking shifts naturally throughout 20s
    const horseParams = HORSES_DATA.map((h) => {
      const isWinner = h.id === chosenWinnerId
      return {
        id: h.id,
        isWinner,
        // Early speed burst vs late surge
        earlyFactor: 0.85 + Math.random() * 0.3,
        midFactor: 0.85 + Math.random() * 0.3,
        lateFactor: isWinner ? 1.45 + Math.random() * 0.25 : 0.8 + Math.random() * 0.25,
        phaseShift: Math.random() * Math.PI * 2,
      }
    })

    const loop = (now) => {
      const elapsedMs = Math.max(0, now - startTime)
      const progress = Math.min(1, elapsedMs / RACE_DURATION_MS)

      setRaceElapsed(Math.min(20, Math.floor(elapsedMs / 1000)))

      const currentPos = Array(12).fill(0)

      for (let i = 0; i < 12; i++) {
        const hp = horseParams[i]
        // Smooth base progression mapped to 20 seconds
        const base = progress * 100

        // Dynamic fluctuations: early pack (0-7s), mid-race pack (7-15s), final sprint (15-20s)
        let dynamicMod = 0
        if (progress < 0.35) {
          // 0 to 7 sec: pack jostles closely
          dynamicMod = (hp.earlyFactor - 1) * 6 * Math.sin((progress / 0.35) * Math.PI)
        } else if (progress < 0.75) {
          // 7 to 15 sec: mid race shifts
          dynamicMod = (hp.midFactor - 1) * 7 * Math.sin(((progress - 0.35) / 0.4) * Math.PI)
        } else {
          // 15 to 20 sec: final homestretch sprint
          const finishWeight = (progress - 0.75) / 0.25
          dynamicMod = hp.isWinner ? finishWeight * 4.5 : (hp.lateFactor - 1) * 5 * finishWeight
        }

        // Small continuous micro-jitter for organic gallop feel
        const gallopWobble = Math.sin(now * 0.008 + hp.phaseShift) * 0.7

        if (progress >= 1) {
          currentPos[i] = hp.isWinner ? 100 : Math.min(99.4, 94 + (i % 5) * 1.0)
        } else {
          currentPos[i] = Math.max(0, Math.min(99.5, base + dynamicMod + gallopWobble))
        }
      }

      setPositions(currentPos)

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(loop)
      } else {
        // Race concluded at exactly 20 seconds
        setRaceElapsed(20)

        // Find top 3
        const sorted = currentPos
          .map((pos, idx) => ({ pos, horse: HORSES_DATA[idx] }))
          .sort((a, b) => b.pos - a.pos)

        const winner = sorted[0].horse
        const second = sorted[1].horse
        const third = sorted[2].horse

        setWinningPodium({ winner, second, third })
        setRaceState('FINISHED')

        // Add to history
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

        // Reset for next race in 7 seconds
        setTimeout(() => {
          setRaceNo((r) => r + 1)
          setPositions(Array(12).fill(0))
          setRaceElapsed(0)
          setCountdown(8)
          setRaceState('WAITING')
        }, 6500)
      }
    }

    animFrameRef.current = requestAnimationFrame(loop)
  }

  const handleSetPredeterminedWinner = (horseId) => {
    setPredeterminedWinner(horseId)
    const h = HORSES_DATA.find((x) => x.id === horseId)
    toast(`Target Winner locked: #${h.number} ${h.name}!`)
  }

  const handleInstantFinish = () => {
    if (raceState !== 'RACING') {
      toast('Start race first')
      return
    }
    // Boost positions so race ends immediately
    setPositions((prev) => prev.map((p, i) => (i === 0 ? 100 : Math.min(95, p + 50))))
  }

  const raceCols = [
    { key: 'raceId', label: 'Race ID', render: (r) => <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{r.raceId}</span> },
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

  // Leaderboard ranking of current positions
  const currentLeaderboard = HORSES_DATA.map((h, i) => ({ ...h, progress: positions[i] })).sort((a, b) => b.progress - a.progress)

  return (
    <div className="space-y-5">
      {/* Page Banner with Badges */}
      <PageBanner
        title="Horse-Riding Championship Arena"
        icon={Dices}
        crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Games' }, { label: 'Horse-Riding' }]}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-bold text-emerald-100 backdrop-blur-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            12 Horses Live
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
            Turf Racecourse Engine
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/30 px-3 py-1 text-xs font-bold text-amber-200">
            Static Demo · No API
          </span>
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
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">All starting stalls loaded</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Users size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Current Race No</p>
              <span className="rounded bg-amber-50 text-amber-700 text-[10px] font-extrabold px-1.5 py-0.2 border border-amber-200">
                Live
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              #HR-{raceNo}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {raceState === 'RACING'
                ? `RACING: ${raceElapsed}s / 20s`
                : raceState === 'FINISHED'
                ? 'PHOTO FINISH'
                : `Starts in ${countdown}s`}
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
                  ROYAL TURF DERBY RACE #HR-{raceNo}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                  raceState === 'RACING'
                    ? 'bg-emerald-500 text-white animate-pulse'
                    : raceState === 'FINISHED'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                }`}>
                  {raceState === 'RACING'
                    ? `⚡ LIVE RACE (${20 - raceElapsed}s left)`
                    : raceState === 'FINISHED'
                    ? '🏁 FINISHED'
                    : `GATES OPEN IN ${countdown}S`}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">1200M Thoroughbred Championship Course · 20s Full Sprint</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {raceState === 'WAITING' && (
              <button
                onClick={startRace}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:from-emerald-700 hover:to-teal-700 transition"
              >
                <Play size={13} fill="currentColor" /> Open Gates Now
              </button>
            )}

            {raceState === 'RACING' && (
              <button
                onClick={handleInstantFinish}
                className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-700 transition"
              >
                <Zap size={13} /> Instant Finish
              </button>
            )}

            <button
              onClick={() => {
                setPositions(Array(12).fill(0))
                setRaceState('WAITING')
                setCountdown(6)
                toast('Racecourse track reset')
              }}
              className="flex items-center gap-1 rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
              title="Reset Track"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Live Podium Notification when race finishes */}
        {raceState === 'FINISHED' && winningPodium && (
          <div className="bg-gradient-to-r from-amber-950/80 via-amber-900/50 to-amber-950/80 border-b border-amber-500/40 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-white animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-md font-black text-lg">
                🥇
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                  Official Race Winner
                </span>
                <span className="text-base font-black text-white">
                  Horse #{winningPodium.winner.number} · {winningPodium.winner.name} ({winningPodium.winner.odds}x)
                </span>
                <span className="text-xs text-amber-200 block">
                  Jockey: {winningPodium.winner.jockey} • Payouts Disbursed
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
          <div className="relative rounded-xl border border-slate-800/80 bg-gradient-to-r from-[#1a2318] via-[#243322] to-[#1e2a1b] p-2 space-y-1 overflow-x-auto shadow-inner">
            {/* Top Turf Distance Markers */}
            <div className="flex justify-between text-[10px] font-black text-emerald-400/70 border-b border-emerald-900/50 pb-1 px-14 font-mono">
              <span>START GATES (0m)</span>
              <span>400m</span>
              <span>800m</span>
              <span>1000m</span>
              <span className="text-amber-400 flex items-center gap-1 font-bold">
                <Flag size={11} /> FINISH (1200m)
              </span>
            </div>

            {/* Checkered Finish Line Strip on the right */}
            <div className="absolute right-3 top-7 bottom-2 w-3.5 bg-[repeating-conic-gradient(#fff_0_25%,#000_0_50%)] bg-[length:7px_7px] opacity-80 rounded-r pointer-events-none z-10 shadow-lg border-l border-white" />

            {/* Starting Stalls Gate on the left */}
            <div className="absolute left-14 top-7 bottom-2 w-1.5 bg-amber-500/70 pointer-events-none z-10 shadow-sm" />

            {/* 12 HORSE LANES */}
            {HORSES_DATA.map((horse, idx) => {
              const pos = positions[idx]
              const currentRank = currentLeaderboard.findIndex((h) => h.id === horse.id) + 1
              const isLead = currentRank === 1 && raceState === 'RACING' && pos > 5

              return (
                <div
                  key={horse.id}
                  className={`relative flex items-center h-8 sm:h-9 rounded-lg px-1 transition-colors border ${
                    isLead
                      ? 'bg-amber-950/40 border-amber-500/50 shadow-xs'
                      : 'bg-black/25 border-emerald-900/40 hover:bg-black/40'
                  }`}
                >
                  {/* Stall Number & Horse Number Badge */}
                  <div className="flex items-center gap-1.5 w-12 shrink-0 z-20">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-black text-white shadow-xs"
                      style={{ backgroundColor: horse.color }}
                    >
                      {horse.number}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold hidden sm:inline">
                      {currentRank}º
                    </span>
                  </div>

                  {/* Lane Turf Track Background */}
                  <div className="relative flex-1 h-full flex items-center">
                    {/* Dirt/Turf ground lines */}
                    <div className="absolute inset-x-0 h-0.5 bg-emerald-950/50 pointer-events-none" />

                    {/* Galloping Horse Runner (Animated position) */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1 z-20 transition-all duration-75"
                      style={{ left: `calc(${pos}% * 0.88)` }}
                    >
                      {/* Realistic Galloping Horse & Jockey Icon with Animation */}
                      <div
                        className={`relative flex items-center justify-center transition-transform ${
                          raceState === 'RACING' ? 'animate-bounce duration-150' : ''
                        }`}
                      >
                        {/* Horse Silhouette Graphic */}
                        <div
                          className="flex h-6 w-8 items-center justify-center rounded-md shadow-md text-white font-black text-xs"
                          style={{
                            backgroundColor: horse.color,
                            boxShadow: `0 0 10px ${horse.color}60`,
                          }}
                        >
                          🏇
                        </div>

                        {/* Dust Particles behind horse when galloping */}
                        {raceState === 'RACING' && (
                          <div className="absolute -left-2 top-2 flex gap-0.5 opacity-60">
                            <span className="w-1 h-1 rounded-full bg-amber-200/50 animate-ping" />
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/40" />
                          </div>
                        )}
                      </div>

                      {/* Horse Name Tag (Floating label) */}
                      <div className="hidden md:flex items-center gap-1 bg-black/80 px-1.5 py-0.5 rounded text-[9.5px] font-bold text-white border border-white/20 whitespace-nowrap shadow-xs">
                        <span>{horse.name}</span>
                        <span className="text-amber-300 font-mono text-[9px]">{horse.odds}x</span>
                      </div>
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
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
              <span>Course: 1200m Fast Turf</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">RNG Engine: Provably Fair</span>
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
          {HORSES_DATA.map((h) => (
            <div
              key={h.id}
              className={`p-2.5 rounded-xl border transition flex flex-col justify-between ${h.lightBg} hover:shadow-xs`}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-black text-white"
                  style={{ backgroundColor: h.color }}
                >
                  {h.number}
                </span>
                <span className="font-mono text-xs font-black text-slate-900">
                  {h.odds}x
                </span>
              </div>

              <div className="mt-1.5">
                <span className="text-xs font-black text-slate-900 block truncate">
                  {h.name}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  Jockey: {h.jockey}
                </span>
              </div>

              <button
                onClick={() => handleSetPredeterminedWinner(h.id)}
                className={`mt-2 w-full rounded-lg py-1 text-[10px] font-extrabold transition text-center ${
                  predeterminedWinner === h.id
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200'
                }`}
              >
                {predeterminedWinner === h.id ? '★ Target Winner' : 'Target Winner'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ADMIN CONTROL CONSOLE & RESULT OVERRIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Next Winner Target Selector */}
        <div className="card bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs lg:col-span-2 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Sliders size={16} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 tracking-tight">
                  Derby Winner Manipulation & Target Calibration
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  Manually lock which of the 12 horses will win the upcoming race #HR-{raceNo}
                </p>
              </div>
            </div>

            {predeterminedWinner ? (
              <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
                <Flame size={12} className="text-amber-500" /> Locked: Horse #{predeterminedWinner}
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 text-slate-600 px-2.5 py-0.5 text-xs font-semibold">
                Auto Turf Fair RNG
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={predeterminedWinner || ''}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value) : null
                setPredeterminedWinner(val)
                if (val) {
                  const h = HORSES_DATA.find((x) => x.id === val)
                  toast(`Set #HR-${raceNo} target winner to #${h.number} ${h.name}`)
                } else {
                  toast('Reset to natural RNG')
                }
              }}
              className="input !text-xs font-bold flex-1 min-w-[200px]"
            >
              <option value="">Auto Provably Fair Algorithm (Natural Race)</option>
              {HORSES_DATA.map((h) => (
                <option key={h.id} value={h.id}>
                  Horse #{h.number} - {h.name} (Jockey: {h.jockey} | Odds: {h.odds}x)
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                setPredeterminedWinner(null)
                toast('Reset to Natural Algorithm')
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition shrink-0"
            >
              Reset to Auto RNG
            </button>
          </div>

          <p className="text-[11px] text-slate-400 pt-1">
            * Selected horse receives optimized acceleration bursts and stamina pacing to secure 1st place at the 1200m finish post.
          </p>
        </div>

        {/* Emergency Race Controls */}
        <div className="card bg-white p-4.5 rounded-xl border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <ShieldAlert size={16} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 tracking-tight">
                  Emergency Live Controls
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">Turf derby live cycle controls</p>
              </div>
            </div>

            <div className="space-y-2 mt-3">
              <button
                onClick={() => {
                  setIsPaused(!isPaused)
                  toast(isPaused ? 'Derby schedule resumed' : 'Derby schedule paused')
                }}
                className={`w-full flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition ${
                  isPaused
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
                <span>{isPaused ? 'Resume Race Schedule' : 'Pause Race Schedule'}</span>
              </button>

              <button
                onClick={handleInstantFinish}
                disabled={raceState !== 'RACING'}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white hover:bg-black transition disabled:opacity-50"
              >
                <Zap size={14} /> Instant Finish Current Race
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Derby Speed: <strong>1.0x Normal</strong></span>
            <span className="text-emerald-600 font-bold">100% Solvent</span>
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

