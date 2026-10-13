import { useEffect, useMemo, useRef, useState } from 'react'
import World from './World.jsx'
import Jet from './Jet.jsx'
import JetWheels from './JetWheels.jsx'
import FlightPath from './FlightPath.jsx'
import Multiplier from './Multiplier.jsx'
import GameControls from './GameControls.jsx'
import { GAME_STATE } from '../hooks/useGameEngine'
import { getJetPose } from '../utils/flightPath'

const MAX_TRAIL_POINTS = 50

export default function GameCanvas({
  gameState,
  countdown,
  multiplier,
  crashPoint,
  takeoffProgress,
  flightElapsed,
  roundId,
}) {
  const stageRef = useRef(null)
  const trailRef = useRef([])
  const [trailPoints, setTrailPoints] = useState([])
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 })
  const frozenPoseRef = useRef(null)

  useEffect(() => {
    const el = stageRef.current
    if (!el) return undefined
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setStageSize({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Reset the trail whenever a fresh round begins.
  useEffect(() => {
    trailRef.current = []
    setTrailPoints([])
    frozenPoseRef.current = null
  }, [roundId])

  const pose = useMemo(() => {
    if (gameState === GAME_STATE.CRASHED) {
      // freeze the jet exactly where the crash happened
      if (!frozenPoseRef.current) {
        frozenPoseRef.current = getJetPose(GAME_STATE.FLYING, 1, flightElapsed)
      }
      return frozenPoseRef.current
    }
    return getJetPose(gameState, takeoffProgress, flightElapsed)
  }, [gameState, takeoffProgress, flightElapsed])

  // Sample the jet's screen-space position into a fading trail.
  useEffect(() => {
    if (gameState !== GAME_STATE.TAKEOFF && gameState !== GAME_STATE.FLYING) return
    if (!stageSize.w || !stageSize.h) return
    const px = (pose.x / 100) * stageSize.w
    const py = (pose.y / 100) * stageSize.h
    const pts = trailRef.current
    pts.push({ x: px, y: py })
    if (pts.length > MAX_TRAIL_POINTS) pts.shift()
    setTrailPoints([...pts])
  }, [pose, gameState, stageSize])

  const isFlyingPhase = gameState === GAME_STATE.TAKEOFF || gameState === GAME_STATE.FLYING
  const showExplosion = gameState === GAME_STATE.CRASHED

  return (
    <div className="game-canvas" ref={stageRef}>
      <World offset={pose.cameraOffset} />

      <FlightPath points={trailPoints} active={gameState === GAME_STATE.FLYING} />

      {gameState !== GAME_STATE.COUNTDOWN && (
        <JetWheels
          x={pose.x}
          y={pose.y}
          rotate={pose.rotate}
          vibration={pose.vibration}
          retract={pose.wheelRetract}
        />
      )}

      <Jet
        x={pose.x}
        y={pose.y}
        rotate={pose.rotate}
        vibration={pose.vibration}
        hidden={gameState === GAME_STATE.COUNTDOWN}
      />

      {showExplosion && (
        <div className="explosion" style={{ left: `${pose.x}%`, top: `${pose.y}%` }}>
          <span className="explosion-core" />
          <span className="explosion-ring" />
        </div>
      )}

      <div className="canvas-overlay-top">
        <GameControls gameState={gameState} roundId={roundId} />
      </div>

      <div className={`canvas-overlay-multiplier ${isFlyingPhase ? '' : 'canvas-overlay-multiplier--idle'}`}>
        <Multiplier
          gameState={gameState}
          multiplier={multiplier}
          countdown={countdown}
          crashPoint={crashPoint}
        />
      </div>
    </div>
  )
}
