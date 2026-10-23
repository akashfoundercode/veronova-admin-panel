import { useCallback, useEffect, useRef, useState } from 'react'
import { generateCrashPoint, multiplierAtTime, RUNWAY_TAKEOFF_TIME } from '../utils/crash'
import { generateRoundPlayers } from '../utils/playerPool'
import { soundManager } from '../utils/audio'
import { aviatorSocket } from '../services/aviatorSocket'

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
  const [socketStatus, setSocketStatus] = useState(() => aviatorSocket.getStatus())

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
  const socketTargetCrashRef = useRef(null)
  const isSocketControlledRef = useRef(false)
  const countdownRef = useRef(COUNTDOWN_SECONDS)
  const countdownEndAtRef = useRef(null)
  const socketLiveMultiplierRef = useRef(null)
  const lastSocketTimerValRef = useRef(null)
  const lastSocketTimerTimeRef = useRef(null)
  const consecutiveSameTimerCountRef = useRef(0)
  const targetCrashRef = useRef(generateCrashPoint())
  const isSocketActiveRef = useRef(false)
  const lastSocketPacketTimeRef = useRef(0)
  const currentSocketPeriodRef = useRef(null)
  const periodCrashedRef = useRef(null)
  const periodFlownRef = useRef(null)

  betsRef.current = bets
  balanceRef.current = balance
  multiplierRef.current = multiplier
  roundIdRef.current = roundId
  liveBotsRef.current = liveBots
  const gameStateRef = useRef(gameState)
  gameStateRef.current = gameState

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
    const currentBet = betsRef.current[index]
    if (!currentBet || currentBet.amount <= 0 || currentBet.amount > balanceRef.current) return
    const isRoundCountdown = gameState === GAME_STATE.COUNTDOWN
    const nextStatus = isRoundCountdown ? BET_STATUS.PENDING : BET_STATUS.ACTIVE

    balanceRef.current = +(balanceRef.current - currentBet.amount).toFixed(2)
    setBalance(balanceRef.current)
    setBets((current) => current.map((bet, i) =>
      i === index ? { ...bet, status: nextStatus, cashedAt: null, payout: 0, betId: Date.now() + i } : bet
    ))
    soundManager.playBetPlaced()
  }, [gameState])

  const cancelBet = useCallback((index) => {
    const currentBet = betsRef.current[index]
    if (!currentBet || (currentBet.status !== BET_STATUS.PENDING && currentBet.status !== BET_STATUS.IDLE)) return
    if (currentBet.status === BET_STATUS.PENDING) {
      balanceRef.current = +(balanceRef.current + currentBet.amount).toFixed(2)
      setBalance(balanceRef.current)
    }
    setBets((current) => current.map((bet, i) =>
      i === index ? { ...bet, status: BET_STATUS.IDLE, cashedAt: null, payout: 0 } : bet
    ))
    soundManager.playClick()
  }, [])

  const cashOut = useCallback((index) => {
    const currentBet = betsRef.current[index]
    if (!currentBet || currentBet.status !== BET_STATUS.ACTIVE) return
    if (cashoutGuardRef.current.has(index)) return
    cashoutGuardRef.current.add(index)

    const liveMultiplier = multiplierRef.current
    const payout = +(currentBet.amount * liveMultiplier).toFixed(2)

    balanceRef.current = +(balanceRef.current + payout).toFixed(2)
    setBalance(balanceRef.current)
    setBets((current) => current.map((bet, i) =>
      i === index ? { ...bet, status: BET_STATUS.CASHED_OUT, cashedAt: liveMultiplier, payout } : bet
    ))
    soundManager.playCashOut()
    setWinNotification({ amount: payout, multiplier: liveMultiplier })
    window.setTimeout(() => setWinNotification(null), 2500)

    setMyBetsHistory((current) => [
      {
        roundId: roundIdRef.current,
        amount: currentBet.amount,
        multiplier: liveMultiplier,
        payout,
        cashedOut: true,
        timestamp: Date.now(),
      },
      ...current,
    ].slice(0, 30))
  }, [])

  // Trigger Crash transition and telemetry
  const triggerCrash = useCallback((finalCrash) => {
    if (gameStateRef.current === GAME_STATE.CRASHED) return
    gameStateRef.current = GAME_STATE.CRASHED
    periodCrashedRef.current = currentSocketPeriodRef.current || roundIdRef.current
    countdownEndAtRef.current = null

    const finalMultiplier = Math.max(1, +(Number(finalCrash) || 1).toFixed(2))
    multiplierRef.current = finalMultiplier
    setMultiplier(finalMultiplier)
    setCrashPoint(finalMultiplier)
    soundManager.playFlewAway()
    setHistory((current) => [finalMultiplier, ...current.filter((_, i) => i < 19)])
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
  }, [])

  const forceCrash = useCallback((customCrash = null) => {
    // If round is already crashed or in countdown, ignore
    if (gameStateRef.current === GAME_STATE.CRASHED || gameStateRef.current === GAME_STATE.COUNTDOWN) return
    const currentPeriod = currentSocketPeriodRef.current || roundIdRef.current
    if (periodCrashedRef.current === currentPeriod) return
    periodCrashedRef.current = currentPeriod

    // ALWAYS take the plane's exact live flight multiplier from demobdg_aviator timer!
    const liveMult = multiplierRef.current || socketLiveMultiplierRef.current || customCrash || 1.00
    const cp = Math.max(1.0, +(Number(liveMult) || 1.0).toFixed(2))

    // 1. Trigger local crash animation immediately
    triggerCrash(cp)

    // 2. Emit to socket once
    aviatorSocket.forceCrash(cp)
  }, [triggerCrash])

  const startNextRound = useCallback((customCountdown = COUNTDOWN_SECONDS, newPeriod = null) => {
    if (gameStateRef.current === GAME_STATE.COUNTDOWN) return
    gameStateRef.current = GAME_STATE.COUNTDOWN

    const nextRound = newPeriod || (roundIdRef.current + 1)
    roundIdRef.current = nextRound
    setRoundId(nextRound)
    const pool = generateRoundPlayers(nextRound, 55)
    roundPoolRef.current = pool
    poolIndexRef.current = 12
    const openingBets = pool.slice(0, 12)
    liveBotsRef.current = openingBets
    setLiveBots(openingBets)
    cashoutGuardRef.current.clear()
    socketTargetCrashRef.current = null
    socketLiveMultiplierRef.current = null
    lastSocketTimerValRef.current = null
    lastSocketTimerTimeRef.current = null
    consecutiveSameTimerCountRef.current = 0
    targetCrashRef.current = generateCrashPoint()
    isSocketControlledRef.current = false
    periodCrashedRef.current = null
    periodFlownRef.current = null
    if (aviatorSocket) aviatorSocket._lastCrashedPeriod = null

    // Initialize steady countdown with zero fluctuation
    const cd = typeof customCountdown === 'number' && customCountdown > 0 ? customCountdown : COUNTDOWN_SECONDS
    countdownRef.current = cd
    countdownEndAtRef.current = performance.now() + cd * 1000
    setCountdown(cd)
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

  // Listen for emergency crash commands from Admin parent window
  useEffect(() => {
    const handleWindowMsg = (e) => {
      if (e.data && e.data.type === 'FORCE_CRASH') {
        // Only trigger if plane is currently flying!
        if (gameStateRef.current !== GAME_STATE.FLYING) return
        const liveMult = multiplierRef.current || socketLiveMultiplierRef.current || Number(e.data?.crashPoint) || 1.00
        const cp = Math.max(1.0, +(Number(liveMult) || 1.0).toFixed(2))
        forceCrash(cp)
      }
    }
    window.addEventListener('message', handleWindowMsg)
    return () => window.removeEventListener('message', handleWindowMsg)
  }, [forceCrash])

  // Broadcast live game state to parent Admin window
  useEffect(() => {
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          type: 'GAME_STATE_UPDATE',
          gameState,
          multiplier: multiplierRef.current,
          crashPoint,
          countdown: countdownRef.current,
          roundId: roundIdRef.current,
        }, '*')
      } catch {}
    }
  }, [gameState, crashPoint])

  // Subscribe to live socket events (https://fcsocket.site | demobdg_aviator)
  useEffect(() => {
    const unsubscribe = aviatorSocket.subscribe((event) => {
      if (event.type === 'CONNECTION_CHANGE') {
        setSocketStatus((prev) => ({
          ...prev,
          connected: event.connected,
        }))
        return
      }

      if (event.type === 'SOCKET_PACKET' && event.packet) {
        const { packet } = event
        lastSocketPacketTimeRef.current = Date.now()
        isSocketActiveRef.current = true

        setSocketStatus({
          connected: true,
          channel: 'demobdg_aviator',
          serverUrl: 'https://fcsocket.site',
          lastPacket: packet,
        })

        const period = packet.period || roundIdRef.current
        if (period && period !== currentSocketPeriodRef.current) {
          currentSocketPeriodRef.current = period
          periodCrashedRef.current = null
          periodFlownRef.current = null
          roundIdRef.current = period
          setRoundId(period)
        }

        if (Array.isArray(packet.history) && packet.history.length > 0) {
          setHistory(packet.history.map(Number).filter((n) => !isNaN(n)))
        }

        if (packet.crashPoint && packet.crashPoint > 1.0) {
          socketTargetCrashRef.current = packet.crashPoint
        }

        const currentState = gameStateRef.current

        // 1. STATUS: 0 (COUNTDOWN / BETTING PHASE - LOADER RUNS ON RUNWAY)
        if (packet.state === 'COUNTDOWN' || packet.status === 0) {
          // Reset period locks for the new round
          periodCrashedRef.current = null
          periodFlownRef.current = null

          if (currentState === GAME_STATE.FLYING) {
            // Missed blast transition; blast immediately before resetting
            const finalCrash = packet.crashPoint || packet.multiplier || socketLiveMultiplierRef.current || multiplierRef.current || 1.0
            triggerCrash(finalCrash)
          }

          const socketSec = packet.betTime !== null ? packet.betTime : (packet.time !== null ? packet.time : null)

          if (currentState === GAME_STATE.CRASHED) {
            // New round boarding begins cleanly on runway
            startNextRound(socketSec || COUNTDOWN_SECONDS, period)
          } else if (currentState === GAME_STATE.COUNTDOWN) {
            // Smoothly sync loader countdown without jumping or fluctuation
            if (socketSec !== null && socketSec >= 0) {
              const currentCd = countdownRef.current
              // Only update if drift exceeds 0.8s to avoid stutter
              if (Math.abs(currentCd - socketSec) > 0.8) {
                countdownRef.current = socketSec
                countdownEndAtRef.current = performance.now() + socketSec * 1000
                setCountdown(socketSec)
              }
            }
          }
        } 
        // 2. STATUS: 1 (FLYING / TAKEOFF & CLIMB PHASE)
        else if (packet.state === 'FLYING' || packet.status === 1) {
          // STRICT RULE: Once this period has blasted, it NEVER flies again in this period!
          if (periodCrashedRef.current === period) {
            return
          }

          if (currentState === GAME_STATE.COUNTDOWN) {
            // Server took off: end countdown loader cleanly and fly
            periodFlownRef.current = period
            countdownEndAtRef.current = null
            gameStateRef.current = GAME_STATE.FLYING
            setGameState(GAME_STATE.FLYING)
          }

          if (packet.multiplier !== null && packet.multiplier >= 1.0) {
            socketLiveMultiplierRef.current = packet.multiplier
            lastSocketTimerTimeRef.current = Date.now()
          }
        } 
        // 3. STATUS: 2 (CRASHED / BLAST PHASE)
        else if (packet.state === 'CRASHED' || packet.status === 2) {
          if (periodCrashedRef.current === period) {
            // Already crashed for this period
            return
          }
          periodCrashedRef.current = period

          const finalCrash = packet.crashPoint || packet.multiplier || socketLiveMultiplierRef.current || multiplierRef.current || 1.0
          if (currentState === GAME_STATE.FLYING) {
            triggerCrash(finalCrash)
          } else {
            // Update last crash multiplier display even if already stopped
            setCrashPoint(finalCrash)
            multiplierRef.current = finalCrash
            setMultiplier(finalCrash)
          }
        }
      }
    })

    return () => unsubscribe()
  }, [triggerCrash, startNextRound])

  // Countdown timer loop for the 10-second boarding loader
  useEffect(() => {
    if (gameState !== GAME_STATE.COUNTDOWN) {
      countdownEndAtRef.current = null
      return undefined
    }

    if (!countdownEndAtRef.current) {
      const dur = Math.min(30, Math.max(1, countdownRef.current || COUNTDOWN_SECONDS))
      countdownEndAtRef.current = performance.now() + dur * 1000
    }

    const countdownTimer = window.setInterval(() => {
      if (!countdownEndAtRef.current) return
      const remaining = Math.max(0, (countdownEndAtRef.current - performance.now()) / 1000)
      const formatted = +remaining.toFixed(1)
      countdownRef.current = formatted
      setCountdown(formatted)
      if (remaining <= 0) {
        if (isSocketActiveRef.current && (Date.now() - lastSocketPacketTimeRef.current < 6000) && remaining > -1.2) {
          // Allow small grace window for server status: 1 packet to arrive
          return
        }
        window.clearInterval(countdownTimer)
        countdownEndAtRef.current = null
        gameStateRef.current = GAME_STATE.FLYING
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

  // Flight animation and live multiplier loop
  useEffect(() => {
    if (gameState !== GAME_STATE.FLYING) return undefined

    flightStartRef.current = null
    setBets((current) => current.map((bet) =>
      bet.status === BET_STATUS.PENDING ? { ...bet, status: BET_STATUS.ACTIVE } : bet
    ))
    soundManager.startEngine()

    const tick = (timestamp) => {
      if (flightStartRef.current === null) flightStartRef.current = timestamp
      const elapsed = (timestamp - flightStartRef.current) / 1000
      const calculatedMultiplier = multiplierAtTime(elapsed)
      const socketTargetMult = socketLiveMultiplierRef.current

      // Smoothly match live socket timer telemetry or calculated flight curve
      let liveMultiplier = calculatedMultiplier
      if (socketTargetMult && socketTargetMult > 1.0) {
        if (socketTargetMult > multiplierRef.current) {
          // Smooth 60fps glide towards socket multiplier
          liveMultiplier = +(multiplierRef.current + (socketTargetMult - multiplierRef.current) * 0.35).toFixed(2)
        } else {
          liveMultiplier = socketTargetMult
        }
      }
      liveMultiplier = Math.max(multiplierRef.current, liveMultiplier)

      setFlightElapsed(elapsed)

      // Blast trigger:
      // When live socket is active: the blast is strictly dictated by server's status: 2 or status: 0
      // If socket packets stall for > 5000ms during flight, trigger failsafe blast
      const isSocketLive = isSocketActiveRef.current && (Date.now() - lastSocketPacketTimeRef.current < 6000)
      if (isSocketLive) {
        if (socketLiveMultiplierRef.current && lastSocketTimerTimeRef.current) {
          if (Date.now() - lastSocketTimerTimeRef.current > 5000) {
            triggerCrash(multiplierRef.current)
            return
          }
        }
      } else {
        // Fallback simulation: each round uses a freshly randomized targetCrashRef (never repeats same time)
        const roundTarget = targetCrashRef.current || 2.50
        if (elapsed >= RUNWAY_TAKEOFF_TIME && liveMultiplier >= roundTarget) {
          triggerCrash(roundTarget)
          return
        }
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
  }, [gameState, cashOut, triggerCrash])

  // Automatic reset when round ends (pause 2.6s for explosion, then start betting countdown)
  useEffect(() => {
    if (gameState !== GAME_STATE.CRASHED) return undefined
    const timer = window.setTimeout(() => {
      if (gameStateRef.current === GAME_STATE.CRASHED) {
        startNextRound()
      }
    }, CRASH_PAUSE_MS)
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
    socketStatus,
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
      forceCrash,
    },
  }
}
