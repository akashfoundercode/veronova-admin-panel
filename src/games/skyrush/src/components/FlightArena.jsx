import React, { useEffect, useRef, useState } from 'react'
import World from './World'
import AviatorPlane from './AviatorPlane'
import BoardingLoaderOverlay from './BoardingLoaderOverlay'
import flyingCharacterImg from '../assets/loader/flyingchar.png'
import characterImg from '../assets/loader/character .png'
import { GAME_STATE } from '../hooks/useGameEngine'
import { RUNWAY_TAKEOFF_TIME } from '../utils/crash'

function getMultiplierTier(m) {
  if (m >= 50) return 'gold'
  if (m >= 10) return 'pink'
  if (m >= 2) return 'purple'
  return 'blue'
}

export default function FlightArena({
  gameState,
  multiplier,
  countdown,
  crashPoint,
  flightElapsed,
  winNotification,
}) {
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [parachutes, setParachutes] = useState([])
  const [crashParachutes, setCrashParachutes] = useState([])
  const crashEjectedRef = useRef(false)
  const nextParachuteAtRef = useRef(0.8)
  const parachuteIdRef = useRef(0)
  const lastFlightPosRef = useRef({ x: 0, y: 0, rotation: 0, worldOffset: 0, isAirborne: false })

  // Observe container dimensions responsively
  useEffect(() => {
    const el = containerRef.current
    if (!el) return undefined

    const updateSize = () => {
      if (el) {
        setDimensions({
          width: el.clientWidth || 800,
          height: el.clientHeight || 420,
        })
      }
    }

    updateSize()
    const ro = new ResizeObserver(() => updateSize())
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const width = dimensions.width || 800
  const height = dimensions.height || 420

  // Runway ground baseline in pixels - matches the runway tarmac strip in the background
  const runwayY = height * 0.775
  const runwayStartX = width * 0.06
  const liftoffX = width * 0.16
  const maxForwardX = width * 0.84

  let planeX = runwayStartX
  let planeY = runwayY
  let rotation = 0
  let retract = 0
  let vibration = 0
  let worldOffset = 0
  let isGroundRolling = false

  const SPRINT_START = 0.20 // Immediate engine thrust surge
  const ROTATE_START = 0.40 // High-speed sprint -> Nose rotates up (Vr)
  const LIFTOFF_TIME = RUNWAY_TAKEOFF_TIME // 0.60s: Airborne into the sky

  if (gameState === GAME_STATE.COUNTDOWN) {
    // Parked flat on the runway tarmac (0deg level)
    planeX = runwayStartX
    planeY = runwayY
    rotation = 0
    retract = 0
    vibration = 0
    worldOffset = 0
    isGroundRolling = false
  } else if (gameState === GAME_STATE.FLYING) {
    const t = flightElapsed

    if (t < SPRINT_START) {
      // Phase 1: Fast initial roll on tarmac
      const p1 = t / SPRINT_START
      planeX = runwayStartX + (liftoffX - runwayStartX) * Math.pow(p1, 1.8) * 0.25
      planeY = runwayY
      rotation = 0
      retract = 0
      vibration = Math.sin(t * 18) * 0.3
      worldOffset = 0
      isGroundRolling = true
    } else if (t < ROTATE_START) {
      // Phase 2A: Full power engine sprint
      const speedP = (t - SPRINT_START) / (ROTATE_START - SPRINT_START)
      planeX = runwayStartX + (liftoffX - runwayStartX) * (0.25 + Math.pow(speedP, 1.6) * 0.40)
      planeY = runwayY
      rotation = 0
      retract = 0
      vibration = Math.sin(t * (24 + speedP * 18)) * (0.4 + speedP * 0.8)
      worldOffset = 0
      isGroundRolling = true
    } else if (t < LIFTOFF_TIME) {
      // Phase 2B: High-speed nose rotation on tarmac
      const rotP = (t - ROTATE_START) / (LIFTOFF_TIME - ROTATE_START)
      planeX = runwayStartX + (liftoffX - runwayStartX) * (0.65 + Math.pow(rotP, 1.4) * 0.35)
      const easeRot = rotP * rotP * (3 - 2 * rotP)
      rotation = -15.0 * easeRot
      planeY = runwayY
      retract = 0
      vibration = Math.sin(t * 42) * (1.1 * (1 - rotP * 0.3))
      worldOffset = 0
      isGroundRolling = true
    } else {
      // Phase 3: Continuous Dynamic Rocket Propulsion & Ascent across the Sky
      isGroundRolling = false
      const climbT = t - LIFTOFF_TIME

      // 1. Continuous forward travel across the arena (never stuck in one spot!)
      const forwardRatio = 1 - Math.exp(-0.25 * climbT)
      planeX = liftoffX + (maxForwardX - liftoffX) * forwardRatio

      // 2. Continuous upward rocket ascent into the sky
      const liftP = 1 - Math.exp(-0.9 * climbT)
      const initRise = (runwayY - height * 0.44) * liftP
      const maxContinuousRise = height * 0.26
      const steadyRise = Math.min(
        maxContinuousRise,
        (Math.log(Math.max(1, multiplier)) * (height * 0.046)) + (climbT * 0.8)
      )
      planeY = runwayY - initRise - steadyRise

      // 3. Dynamic supersonic rocket pitch angle (smoothly elevates as climb accelerates)
      const pitchBoost = Math.min(15.0, Math.log(Math.max(1, multiplier)) * 3.8 + (climbT * 0.35))
      const targetPitch = -15.0 - pitchBoost
      const microRocketSway = Math.sin(climbT * 2.4) * 0.5
      rotation = targetPitch + microRocketSway

      // Landing Gear Retraction
      const gearDelay = 0.1
      const gearDuration = 0.6
      retract = Math.min(1, Math.max(0, (climbT - gearDelay) / gearDuration))

      // Aerodynamic micro-sway
      const wobbleY = Math.sin(climbT * 2.2) * 1.4
      const wobbleX = Math.cos(climbT * 1.6) * 0.9
      planeX += wobbleX
      planeY += wobbleY

      // High-speed cosmic parallax scroll
      const milestoneScroll = climbT * 0.75 + Math.log(Math.max(1, multiplier)) * 0.65
      worldOffset = height * (liftP * 1.0 + milestoneScroll)
      vibration = 0
    }

    lastFlightPosRef.current = {
      x: planeX,
      y: planeY,
      rotation,
      worldOffset,
      isAirborne: t >= LIFTOFF_TIME,
    }
  } else if (gameState === GAME_STATE.CRASHED) {
    const crashedOnRunway = !lastFlightPosRef.current.isAirborne
    planeX = lastFlightPosRef.current.x
    planeY = crashedOnRunway ? runwayY : lastFlightPosRef.current.y
    rotation = crashedOnRunway ? 0 : (lastFlightPosRef.current.rotation || -40)
    worldOffset = lastFlightPosRef.current.worldOffset
    retract = crashedOnRunway ? 0 : 1
    vibration = 0
    isGroundRolling = crashedOnRunway
  }

  const isFlying = gameState === GAME_STATE.FLYING
  const isCrashed = gameState === GAME_STATE.CRASHED
  const isCountdown = gameState === GAME_STATE.COUNTDOWN
  const multTier = getMultiplierTier(multiplier)

  // Emergency mass character ejection upon crash
  useEffect(() => {
    if (isCountdown) {
      setParachutes([])
      setCrashParachutes([])
      crashEjectedRef.current = false
      nextParachuteAtRef.current = 0.8
      parachuteIdRef.current = 0
      return
    }

    if (isCrashed && !crashEjectedRef.current) {
      crashEjectedRef.current = true
      const cx = lastFlightPosRef.current.x
      const cy = lastFlightPosRef.current.y

      // 10 Distinct radial trajectories throwing all characters outward in all directions
      const crashTrajectories = [
        'crash-traj-up-left',
        'crash-traj-up-high',
        'crash-traj-up-right',
        'crash-traj-far-left',
        'crash-traj-far-right',
        'crash-traj-down-left',
        'crash-traj-down-right',
        'crash-traj-loop-left',
        'crash-traj-high-catapult',
        'crash-traj-spin-out',
      ]

      const massBurst = crashTrajectories.map((traj, idx) => ({
        id: `crash_p_${idx}_${Date.now()}`,
        left: cx + (Math.random() * 30 - 15),
        top: cy + (Math.random() * 20 - 10),
        trajectoryClass: traj,
        delay: +(idx * 0.03).toFixed(2),
        duration: +(3.2 + (idx % 3) * 0.4).toFixed(2),
        scale: +(0.85 + (idx % 4) * 0.08).toFixed(2),
        img: idx % 2 === 0 ? flyingCharacterImg : characterImg,
      }))

      setCrashParachutes(massBurst)
    }
  }, [isCountdown, isCrashed])

  useEffect(() => {
    if (isCountdown) {
      setParachutes([])
      nextParachuteAtRef.current = 0.8
      parachuteIdRef.current = 0
      return
    }
    if (!isFlying || flightElapsed < nextParachuteAtRef.current) return

    const planeWidth = Math.min(215, Math.max(140, width * 0.165))
    const planeHeight = planeWidth / 1.55
    const centerX = planeX + planeWidth * 0.5
    const centerY = planeY + planeHeight * 0.5
    // Top flank / bagal ejection position
    const relX = -0.12 * planeWidth
    const relY = -0.42 * planeHeight
    const rad = (rotation * Math.PI) / 180
    const rotX = relX * Math.cos(rad) - relY * Math.sin(rad)
    const rotY = relX * Math.sin(rad) + relY * Math.cos(rad)

    // Randomly decide burst count: single (1) vs group of 2, 3, or 4 characters
    const rand = Math.random()
    let burstCount = 1
    if (rand < 0.38) {
      burstCount = 1 // Single character
    } else if (rand < 0.65) {
      burstCount = 3 // 3 characters together
    } else if (rand < 0.86) {
      burstCount = 4 // 4 characters together
    } else {
      burstCount = 2 // 2 characters together
    }

    const TRAJECTORIES = ['traj-standard', 'traj-high', 'traj-wide', 'traj-low']
    const newBurst = []

    for (let i = 0; i < burstCount; i++) {
      const pId = parachuteIdRef.current + i
      let traj = TRAJECTORIES[i % TRAJECTORIES.length]
      let delay = 0
      let offsetX = 0
      let offsetY = 0
      let scale = 1.0

      if (burstCount === 1) {
        traj = TRAJECTORIES[Math.floor(Math.random() * TRAJECTORIES.length)]
        delay = 0
        scale = 1.0
      } else if (burstCount === 2) {
        traj = i === 0 ? 'traj-standard' : 'traj-wide'
        delay = i * 0.12
        offsetX = i === 0 ? -10 : 12
        offsetY = i === 0 ? -8 : 8
        scale = i === 0 ? 1.05 : 0.95
      } else if (burstCount === 3) {
        const tripleTrajs = ['traj-high', 'traj-standard', 'traj-wide']
        traj = tripleTrajs[i]
        delay = i * 0.09
        offsetX = (i - 1) * 16 + (Math.random() * 6 - 3)
        offsetY = (i - 1) * 12 + (Math.random() * 6 - 3)
        scale = 0.92 + i * 0.08
      } else {
        const quadTrajs = ['traj-high', 'traj-standard', 'traj-low', 'traj-wide']
        traj = quadTrajs[i]
        delay = i * 0.08
        offsetX = (i - 1.5) * 15 + (Math.random() * 8 - 4)
        offsetY = (i - 1.5) * 10 + (Math.random() * 8 - 4)
        scale = 0.90 + (i % 3) * 0.08
      }

      newBurst.push({
        id: pId,
        left: centerX + rotX - 33 + offsetX,
        top: centerY + rotY - 33 + offsetY,
        trajectoryClass: traj,
        delay: +delay.toFixed(2),
        duration: +(2.8 + (i % 2) * 0.4).toFixed(2),
        scale: +scale.toFixed(2),
      })
    }

    parachuteIdRef.current += burstCount

    // Adaptive interval between burst releases
    const nextInterval = burstCount >= 3
      ? 2.4 + Math.random() * 1.6
      : 1.5 + Math.random() * 1.3

    nextParachuteAtRef.current = flightElapsed + nextInterval
    setParachutes((current) => [...current, ...newBurst])
  }, [isCountdown, isFlying, flightElapsed, planeX, planeY, rotation, width])



  return (
    <div className={`flight-arena ${isCrashed ? 'is-crashed' : ''} ${isCountdown ? 'is-countdown' : ''}`} ref={containerRef}>
      {/* Vertically Stacked Seamless Sky + Runway with Celestial Milestones */}
      <World
        offset={worldOffset}
        flightElapsed={flightElapsed}
        multiplier={multiplier}
      />

      {/* Jet Actor Container (Active during Flight) - 100% GPU Hardware Accelerated */}
      {isFlying && (
        <div
          className="plane-actor-container"
          style={{
            transform: `translate3d(${planeX}px, ${planeY}px, 0) translate(-28%, -82.5%)`,
          }}
        >
          <AviatorPlane
            rotation={rotation}
            isFlying={isFlying}
            retract={retract}
            vibration={vibration}
            isGroundRolling={isGroundRolling}
          />
        </div>
      )}

      {/* Dynamic Cinematic Explosion Blast & Shockwave (No static crash PNG) */}
      {isCrashed && (
        <div
          className="plane-actor-container plane-crashed-blast"
          style={{
            transform: `translate3d(${planeX}px, ${planeY}px, 0) translate(-50%, -50%)`,
          }}
        >
          {/* Fireball Flash & Shockwave Rings */}
          <div className="crash-explosion-flash" />
          <div className="crash-shockwave-ring ring-1" />
          <div className="crash-shockwave-ring ring-2" />
          <div className="crash-fire-core" />

          {/* Sparks & Shrapnel Debris */}
          <div className="crash-debris-field" aria-hidden="true">
            <span className="crash-spark spk-1" />
            <span className="crash-spark spk-2" />
            <span className="crash-spark spk-3" />
            <span className="crash-spark spk-4" />
            <span className="crash-spark spk-5" />
            <span className="crash-spark spk-6" />
            <span className="crash-smoke-cloud smk-1" />
            <span className="crash-smoke-cloud smk-2" />
          </div>
        </div>
      )}

      {/* Regular In-flight Parachutes */}
      {parachutes.map((parachute) => (
        <div
          key={parachute.id}
          className={`flight-parachute-eject ${parachute.trajectoryClass || ''}`}
          style={{
            left: `${parachute.left}px`,
            top: `${parachute.top}px`,
            animationDelay: `${parachute.delay || 0}s`,
            animationDuration: `${parachute.duration || 3.0}s`,
            transform: `scale(${parachute.scale || 1})`,
          }}
          onAnimationEnd={(e) => {
            if (e.target === e.currentTarget) {
              setParachutes((current) => current.filter((item) => item.id !== parachute.id))
            }
          }}
          aria-hidden="true"
        >
          <span className="eject-blast-puff" onAnimationEnd={(e) => e.stopPropagation()} />
          <img src={flyingCharacterImg} alt="" draggable="false" />
        </div>
      ))}

      {/* Emergency Crash Mass Character Ejection (All characters thrown out upon crash!) */}
      {crashParachutes.map((char) => (
        <div
          key={char.id}
          className={`flight-parachute-eject crash-mass-eject ${char.trajectoryClass || ''}`}
          style={{
            left: `${char.left}px`,
            top: `${char.top}px`,
            animationDelay: `${char.delay || 0}s`,
            animationDuration: `${char.duration || 3.2}s`,
            transform: `scale(${char.scale || 1})`,
          }}
          aria-hidden="true"
        >
          <span className="eject-blast-puff" onAnimationEnd={(e) => e.stopPropagation()} />
          <img src={char.img} alt="" draggable="false" />
        </div>
      ))}

      {/* Center Stage Multiplier & Intermission Overlay */}
      <div className="arena-center-display">
        {/* Realistic Boarding Loader & Miniature Jumping Passengers Overlay */}
        {isCountdown && (
          <BoardingLoaderOverlay
            countdown={countdown}
            totalCountdown={10.0}
          />
        )}

        {/* Ultra-Premium Live Active Multiplier */}
        {isFlying && (
          <div className={`premium-multiplier-display tier-${multTier}`}>
            <div className="multiplier-ambient-halo" />
            <div className="multiplier-digits-wrap">
              <span className="multiplier-number">
                {multiplier.toFixed(2)}
              </span>
              <span className="multiplier-x-badge">x</span>
            </div>
          </div>
        )}

        {/* Crashed State Card */}
        {isCrashed && (
          <div className="premium-flew-away-card premium-crashed-card">
            <div className="flew-away-title crashed-title">CRASHED</div>
            <div className="flew-away-multiplier crashed-multiplier">
              {crashPoint ? crashPoint.toFixed(2) : multiplier.toFixed(2)}
              <span className="mult-x-tag">x</span>
            </div>
          </div>
        )}

        {/* Win Notification Banner */}
        {winNotification && (
          <div className="win-toast-overlay">
            <div className="win-toast-badge">YOU WON</div>
            <div className="win-toast-amount">₹{winNotification.payout.toFixed(2)}</div>
            <div className="win-toast-mult">@ {winNotification.multiplier.toFixed(2)}x</div>
          </div>
        )}
      </div>
    </div>
  )
}
