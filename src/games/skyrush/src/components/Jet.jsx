import { forwardRef } from 'react'
import jetImg from '../assets/jet.png'

/**
 * The aircraft itself. Positioned by its parent via CSS custom properties
 * so all the motion math stays outside the render tree and only ever
 * touches `transform` (cheap) instead of layout properties.
 */
const Jet = forwardRef(function Jet({ x, y, rotate, vibration, hidden }, ref) {
  return (
    <div
      ref={ref}
      className="jet-rig"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        '--rotate': `${rotate}deg`,
        '--vibe': `${vibration}px`,
        opacity: hidden ? 0 : 1,
      }}
    >
      <img src={jetImg} alt="SkyRush jet" className="jet-sprite" draggable="false" />
    </div>
  )
})

export default Jet
