import { GAME_STATE } from '../hooks/useGameEngine'

const LABELS = {
  [GAME_STATE.COUNTDOWN]: 'Boarding',
  [GAME_STATE.TAKEOFF]: 'Taking off',
  [GAME_STATE.FLYING]: 'In flight',
  [GAME_STATE.CRASHED]: 'Crashed',
}

export default function GameControls({ gameState, roundId }) {
  return (
    <div className="game-status-bar">
      <span className={`status-dot status-dot--${gameState.toLowerCase()}`} />
      <span className="status-text">{LABELS[gameState] ?? gameState}</span>
      <span className="status-round">Round #{roundId + 1}</span>
    </div>
  )
}
