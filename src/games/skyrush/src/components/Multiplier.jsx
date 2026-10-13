import { GAME_STATE } from '../hooks/useGameEngine'

export default function Multiplier({ gameState, multiplier, countdown, crashPoint }) {
  if (gameState === GAME_STATE.COUNTDOWN) {
    return (
      <div className="multiplier-wrap multiplier-wrap--countdown">
        <div className="multiplier-label">Next flight in</div>
        <div className="multiplier countdown-value">{countdown}s</div>
      </div>
    )
  }

  if (gameState === GAME_STATE.CRASHED) {
    return (
      <div className="multiplier-wrap multiplier-wrap--crashed">
        <div className="multiplier crashed-value">{crashPoint?.toFixed(2)}x</div>
        <div className="multiplier-label crashed-label">Crashed</div>
      </div>
    )
  }

  return (
    <div className="multiplier-wrap">
      <div className="multiplier">{multiplier.toFixed(2)}x</div>
    </div>
  )
}
