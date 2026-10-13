import { clamp, easeOutCubic, lerp } from './easing'

// All positions are percentages (0-100) of the game canvas box, so the
// same numbers work responsively at every screen size.

const RUNWAY_START = { x: 7, y: 79, rotate: 0 }
const LIFTOFF = { x: 34, y: 65, rotate: -9 }
const CRUISE = { x: 63, y: 38, rotate: -17 }

/**
 * Jet pose + wheel + camera state for the current instant.
 * @param {'READY'|'COUNTDOWN'|'TAKEOFF'|'FLYING'|'CRASHED'} phase
 * @param {number} takeoffProgress 0..1 across the TAKEOFF phase
 * @param {number} flightElapsed seconds elapsed since FLYING began
 */
export function getJetPose(phase, takeoffProgress, flightElapsed) {
  if (phase === 'COUNTDOWN' || phase === 'READY') {
    return {
      x: RUNWAY_START.x,
      y: RUNWAY_START.y,
      rotate: 0,
      wheelRetract: 0,
      cameraOffset: 0,
      vibration: 0,
    }
  }

  if (phase === 'TAKEOFF') {
    const p = easeOutCubic(takeoffProgress)
    const wheelStart = 0.55
    const wheelP = clamp((takeoffProgress - wheelStart) / (1 - wheelStart), 0, 1)
    return {
      x: lerp(RUNWAY_START.x, LIFTOFF.x, p),
      y: lerp(RUNWAY_START.y, LIFTOFF.y, p),
      rotate: lerp(RUNWAY_START.rotate, LIFTOFF.rotate, p),
      wheelRetract: easeOutCubic(wheelP),
      cameraOffset: lerp(0, 46, p),
      vibration: (1 - p) * 1.4,
    }
  }

  // FLYING and CRASHED (frozen at last live values when crashed, handled by caller)
  const settleT = clamp(flightElapsed / 5.5, 0, 1)
  const settle = easeOutCubic(settleT)
  const x = lerp(LIFTOFF.x, CRUISE.x, settle)
  const y = lerp(LIFTOFF.y, CRUISE.y, settle)
  const rotate = lerp(LIFTOFF.rotate, CRUISE.rotate, settle)

  const wobble = Math.sin(flightElapsed * 2.1) * 0.9
  const wobbleRotate = Math.sin(flightElapsed * 1.7) * 1.6

  const camera =
    46 + (1 - Math.exp(-flightElapsed / 6)) * 320 + flightElapsed * 22

  return {
    x,
    y: y + wobble,
    rotate: rotate + wobbleRotate,
    wheelRetract: 1,
    cameraOffset: camera,
    vibration: 0.5,
  }
}

/**
 * Builds a smooth SVG path string trailing behind the jet from a list of
 * recent {x,y} points expressed in canvas pixels.
 */
export function buildTrailPath(points) {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const midX = (prev.x + curr.x) / 2
    const midY = (prev.y + curr.y) / 2
    d += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`
  }
  return d
}
