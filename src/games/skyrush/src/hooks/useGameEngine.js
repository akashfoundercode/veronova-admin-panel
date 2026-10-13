import { useCallback, useEffect, useRef, useState } from 'react'
import { generateCrashPoint, multiplierAtTime, RUNWAY_TAKEOFF_TIME } from '../utils/crash'
import { generateRoundPlayers } from '../utils/playerPool'
import { soundManager } from '../utils/audio'

export const GAME_STATE = {
  COUNTDOWN: 'COUNTDOWN',
  FLYING: 'FLYING',
  CRASHED: 'CRASHED',
}

export const BET_STATUS = {
  IDLE: 'IDLE',
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  CASHED_OUT: 'CASHED_OUT',
  LOST: 'LOST',
}

const COUNTDOWN_SECONDS = 10
const CRASH_PAUSE_MS = 2600
const INITIAL_BALANCE = 5000

function makeInitialBet(amount) {
  return {
    amount,
    autoCashout: '',
    autoBet: false,
    status: BET_STATUS.IDLE,
    cashedAt: null,
    payout: 0,
    betId: null,
  }
}

export function useGameEngine() {
  const [gameState, setGameState] = useState(GAME_STATE.COUNTDOWN)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
  const [multiplier, setMultiplier] = useState(1)
  const [crashPoint, setCrashPoint] = useState(null)
  const [flightElapsed, setFlightElapsed] = useState(0)
  const [history, setHistory] = useState([1.21, 2.66, 1.24, 1.16, 2.48])
  const [balance, setBalance] = useState(INITIAL_BALANCE)
  const [bets, setBets] = useState([makeInitialBet(100), makeInitialBet(200)])
  const [myBetsHistory, setMyBetsHistory] = useState([])
  const [liveBots, setLiveBots] = useState(() => generateRoundPlayers(1084816, 12))
  const [roundId, setRoundId] = useState(1084816)
  const [winNotification, setWinNotification] = useState(null)
  const [soundMuted, setSoundMuted] = useState(false)
  const [userProfile] = useState({ username: 'Admin', wallet: INITIAL_BALANCE, total_wallet: INITIAL_BALANCE })

  const betsRef = useRef(bets)
  const balanceRef = useRef(balance)
  const multiplierRef = useRef(multiplier)
  const roundIdRef = useRef(roundId)
  const liveBotsRef = useRef(liveBots)
  const roundPoolRef = useRef(generateRoundPlayers(1084816, 55))
  const poolIndexRef = useRef(12)
  const cashoutGuardRef = useRef(new Set())
  const flightStartRef = useRef(null)
  const rafRef = useRef(null)

  betsRef.current = bets
  balanceRef.current = balance
  multiplierRef.current = multiplier
  roundIdRef.current = roundId
  liveBotsRef.current = liveBots

  const toggleSound = useCallback(() => {
    setSoundMuted((muted) => {
      soundManager.setMuted(!muted)
      return !muted
    })
  }, [])

  const resetBalance = useCallback((amount = INITIAL_BALANCE) => {
    const nextBalance = Math.max(0, Number(amount) || 0)
    balanceRef.current = nextBalance
    setBalance(nextBalance)
  }, [])

  const updateBetAmount = useCallback((index, amount) => {
    setBets((current) => current.map((bet, i) =>
      i === index ? { ...bet, amount: Math.max(10, Number(amount) || 10) } : bet
    ))
  }, [])

  const updateAutoCashout = useCallback((index, value) => {
    setBets((current) => current.map((bet, i) =>
      i === index ? { ...bet, autoCashout: value } : bet
    ))
  }, [])

  const toggleAutoBet = useCallback((index, enabled) => {
    setBets((current) => current.map((bet, i) =>
      i === index ? { ...bet, autoBet: enabled } : bet
    ))
  }, [])

  const placeBet = useCallback((index) => {
    const bet = betsRef.current[index]
    if (gameState !== GAME_STATE.COUNTDOWN || !bet || bet.status !== BET_STATUS.IDLE || bet.amount > balanceRef.current) return

    const nextBalance = +(balanceRef.current - bet.amount).toFixed(2)
    balanceRef.current = nextBalance
    setBalance(nextBalance)
    setBets((current) => current.map((item, i) =>
      i === index ? { ...item, status: BET_STATUS.PENDING, cashedAt: null, payout: 0 } : item
    ))
  }, [gameState])

  const cancelBet = useCallback((index) => {
    const bet = betsRef.current[index]
    if (!bet || bet.status !== BET_STATUS.PENDING) return

    const nextBalance = +(balanceRef.current + bet.amount).toFixed(2)
    balanceRef.current = nextBalance
    setBalance(nextBalance)
    setBets((current) => current.map((item, i) =>
      i === index ? { ...item, status: BET_STATUS.IDLE, betId: null } : item
    ))
  }, [])

  const cashOut = useCallback((index) => {
    const bet = betsRef.current[index]
    if (!bet || bet.status !== BET_STATUS.ACTIVE || cashoutGuardRef.current.has(index)) return

    cashoutGuardRef.current.add(index)
    const cashoutMultiplier = multiplierRef.current
    const payout = +(bet.amount * cashoutMultiplier).toFixed(2)
    const nextBalance = +(balanceRef.current + payout).toFixed(2)
    balanceRef.current = nextBalance
    setBalance(nextBalance)
    soundManager.playCashout()
    setBets((current) => current.map((item, i) =>
      i === index
        ? { ...item, status: BET_STATUS.CASHED_OUT, cashedAt: cashoutMultiplier, payout }
        : item
    ))
    setMyBetsHistory((current) => [{
      roundId: roundIdRef.current,
      amount: bet.amount,
      multiplier: cashoutMultiplier,
      payout,
      cashedOut: true,
      timestamp: Date.now(),
    }, ...current].slice(0, 30))
    setWinNotification({ multiplier: cashoutMultiplier, payout, betIndex: index })
    window.setTimeout(() => setWinNotification(null), 3800)
  }, [])

  const startNextRound = useCallback(() => {
    roundIdRef.current += 1
    const nextRound = roundIdRef.current
    setRoundId(nextRound)
    const pool = generateRoundPlayers(nextRound, 55)
    roundPoolRef.current = pool
    poolIndexRef.current = 12
    const openingBets = pool.slice(0, 12)
    liveBotsRef.current = openingBets
    setLiveBots(openingBets)
    cashoutGuardRef.current.clear()
    setCountdown(COUNTDOWN_SECONDS)
    setMultiplier(1)
    multiplierRef.current = 1
    setCrashPoint(null)
    setFlightElapsed(0)
    const nextBets = betsRef.current.map((bet) => {
      if (bet.autoBet && bet.amount <= balanceRef.current) {
        balanceRef.current = +(balanceRef.current - bet.amount).toFixed(2)
        return { ...bet, status: BET_STATUS.PENDING, cashedAt: null, payout: 0 }
      }
      return makeInitialBet(bet.amount)
    })
    setBets(nextBets)
    setBalance(balanceRef.current)
    setGameState(GAME_STATE.COUNTDOWN)
  }, [])

  useEffect(() => {
    if (gameState !== GAME_STATE.COUNTDOWN) return undefined

    const startedAt = performance.now()
    const countdownTimer = window.setInterval(() => {
      const remaining = Math.max(0, COUNTDOWN_SECONDS - (performance.now() - startedAt) / 1000)
      setCountdown(+remaining.toFixed(1))
      if (remaining <= 0) {
        window.clearInterval(countdownTimer)
        setGameState(GAME_STATE.FLYING)
      }
    }, 100)

    const playerTimer = window.setInterval(() => {
      const pool = roundPoolRef.current
      const index = poolIndexRef.current
      if (index >= pool.length) return
      const batch = pool.slice(index, index + (Math.random() < 0.4 ? 2 : 1))
      poolIndexRef.current += batch.length
      setLiveBots((current) => {
        const next = [...current, ...batch]
        liveBotsRef.current = next
        return next
      })
    }, 320)

    return () => {
      window.clearInterval(countdownTimer)
      window.clearInterval(playerTimer)
    }
  }, [gameState])

  useEffect(() => {
    if (gameState !== GAME_STATE.FLYING) return undefined

    const targetCrash = generateCrashPoint()
    flightStartRef.current = null
    setBets((current) => current.map((bet) =>
      bet.status === BET_STATUS.PENDING ? { ...bet, status: BET_STATUS.ACTIVE } : bet
    ))
    soundManager.startEngine()

    const tick = (timestamp) => {
      if (flightStartRef.current === null) flightStartRef.current = timestamp
      const elapsed = (timestamp - flightStartRef.current) / 1000
      const liveMultiplier = multiplierAtTime(elapsed)

      setFlightElapsed(elapsed)
      if (elapsed >= RUNWAY_TAKEOFF_TIME && liveMultiplier >= targetCrash) {
        const finalMultiplier = Math.max(1, targetCrash)
        multiplierRef.current = finalMultiplier
        setMultiplier(finalMultiplier)
        setCrashPoint(finalMultiplier)
        soundManager.playFlewAway()
        setHistory((current) => [finalMultiplier, ...current].slice(0, 20))
        setMyBetsHistory((current) => {
          const lostBets = betsRef.current
            .filter((bet) => bet.status === BET_STATUS.ACTIVE)
            .map((bet) => ({
              roundId: roundIdRef.current,
              amount: bet.amount,
              multiplier: finalMultiplier,
              payout: 0,
              cashedOut: false,
              timestamp: Date.now(),
            }))
          return [...lostBets, ...current].slice(0, 30)
        })
        setBets((current) => current.map((bet) =>
          bet.status === BET_STATUS.ACTIVE ? { ...bet, status: BET_STATUS.LOST } : bet
        ))
        soundManager.stopEngine()
        setGameState(GAME_STATE.CRASHED)
        return
      }

      multiplierRef.current = liveMultiplier
      setMultiplier(liveMultiplier)
      soundManager.updateEnginePitch(liveMultiplier)

      if (liveBotsRef.current.some((bot) => !bot.cashedOut && bot.targetCashout <= liveMultiplier)) {
        setLiveBots((current) => {
          const updated = current.map((bot) => (
            !bot.cashedOut && bot.targetCashout <= liveMultiplier
              ? {
                ...bot,
                cashedOut: true,
                cashedAt: bot.targetCashout,
                payout: +(bot.amount * bot.targetCashout).toFixed(2),
              }
              : bot
          ))
          liveBotsRef.current = updated
          return updated
        })
      }

      betsRef.current.forEach((bet, index) => {
        const target = Number.parseFloat(bet.autoCashout)
        if (bet.status === BET_STATUS.ACTIVE && target >= 1.01 && liveMultiplier >= target) {
          cashOut(index)
        }
      })
      rafRef.current = window.requestAnimationFrame(tick)
    }

    rafRef.current = window.requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      soundManager.stopEngine()
    }
  }, [gameState, cashOut])

  useEffect(() => {
    if (gameState !== GAME_STATE.CRASHED) return undefined
    const timer = window.setTimeout(startNextRound, CRASH_PAUSE_MS)
    return () => window.clearTimeout(timer)
  }, [gameState, startNextRound])

  useEffect(() => () => {
    if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current)
    soundManager.stopEngine()
  }, [])

  const refreshProfile = useCallback(() => Promise.resolve(userProfile), [userProfile])

  return {
    gameState,
    countdown,
    multiplier,
    crashPoint,
    flightElapsed,
    history,
    balance,
    bets,
    myBetsHistory,
    liveBots,
    roundId,
    winNotification,
    soundMuted,
    socketStatus: { connected: false, channel: 'local-demo', lastPacket: null },
    userProfile,
    actions: {
      toggleSound,
      resetBalance,
      updateBetAmount,
      updateAutoCashout,
      toggleAutoBet,
      placeBet,
      cancelBet,
      cashOut,
      refreshProfile,
    },
  }
}
