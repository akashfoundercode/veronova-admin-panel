import mainWheelImg from '../assets/main-wheel.png'
import noseWheelImg from '../assets/nose-wheel.png'

/**
 * Landing gear rig. Rendered in the exact same coordinate rig as <Jet />
 * (same x / y / rotate / vibration) so the wheels stay glued to the
 * airframe, but as fully independent <img> elements per spec — never
 * merged into the jet artwork.
 *
 * `retract` (0 -> 1) animates the gear physically sliding up and into the
 * fuselage: translate toward the attachment point, shrink slightly, and
 * only fade out opacity right at the very end, so it reads as gear
 * folding away rather than a jump-cut.
 */
export default function JetWheels({ x, y, rotate, vibration, retract }) {
  const t = Math.min(1, Math.max(0, retract))
  // ease-in so the gear lingers visibly before tucking away
  const eased = t * t * (3 - 2 * t)

  const wheelStyle = (travel, scaleMin) => ({
    transform: `translateY(${-travel * eased}%) scale(${1 - (1 - scaleMin) * eased})`,
    opacity: 1 - Math.max(0, eased - 0.75) * 4,
  })

  if (eased >= 0.999) return null

  return (
    <div
      className="jet-rig wheels-rig"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        '--rotate': `${rotate}deg`,
        '--vibe': `${vibration}px`,
      }}
    >
      <div className="wheel-anchor wheel-anchor--main" style={wheelStyle(70, 0.35)}>
        <img src={mainWheelImg} alt="" className="wheel-sprite wheel-sprite--main" draggable="false" />
      </div>
      <div className="wheel-anchor wheel-anchor--nose" style={wheelStyle(85, 0.3)}>
        <img src={noseWheelImg} alt="" className="wheel-sprite wheel-sprite--nose" draggable="false" />
      </div>
    </div>
  )
}
