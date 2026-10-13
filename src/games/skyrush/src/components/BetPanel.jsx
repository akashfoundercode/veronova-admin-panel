import React, { useState } from 'react'
import { BET_STATUS, GAME_STATE } from '../hooks/useGameEngine'
import { soundManager } from '../utils/audio'

function BetPanel({
  panelIndex,
  bet,
  gameState,
  multiplier,
  balance,
  onPlaceBet,
  onCancelBet,
  onCashOut,
  onUpdateAmount,
  onUpdateAutoCashout,
  onToggleAutoBet,
}) {
  const [tab, setTab] = useState('bet') // 'bet' | 'auto'
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState(Boolean(bet.autoCashout))

  const isFlying = gameState === GAME_STATE.FLYING
  const isCountdown = gameState === GAME_STATE.COUNTDOWN
  const isCrashed = gameState === GAME_STATE.CRASHED

  const isIdle = bet.status === BET_STATUS.IDLE
  const isPending = bet.status === BET_STATUS.PENDING
  const isActive = bet.status === BET_STATUS.ACTIVE
  const isCashedOut = bet.status === BET_STATUS.CASHED_OUT

  // Live cashout calculation
  const livePayout = (bet.amount * multiplier).toFixed(2)

  const handleAmountChange = (newAmount) => {
    const valid = Math.max(10, Math.min(100000, Number(newAmount) || 10))
    onUpdateAmount(panelIndex, valid)
  }

  const handleQuickAdd = (addAmount) => {
    soundManager.playClick()
    handleAmountChange(bet.amount + addAmount)
  }

  const handleStepAmount = (delta) => {
    soundManager.playClick()
    handleAmountChange(bet.amount + delta)
  }

  const handleAutoCashoutToggle = (enabled) => {
    soundManager.playClick()
    setAutoCashoutEnabled(enabled)
    if (!enabled) {
      onUpdateAutoCashout(panelIndex, '')
    } else if (!bet.autoCashout) {
      onUpdateAutoCashout(panelIndex, '2.00')
    }
  }

  const handleActionButton = () => {
    soundManager.playClick()
    if (isPending) {
      onCancelBet(panelIndex)
    } else if (isActive) {
      onCashOut(panelIndex)
    } else if (isIdle) {
      onPlaceBet(panelIndex)
    }
  }

  return (
    <div className={`bet-panel ${isActive ? 'is-active-bet' : ''} ${isCashedOut ? 'is-cashed-out' : ''}`}>
      {/* Panel Tabs: Bet / Auto */}
      <div className="bet-panel-header">
        <div className="bet-tabs">
          <button
            className={`bet-tab-btn ${tab === 'bet' ? 'active' : ''}`}
            onClick={() => {
              soundManager.playClick()
              setTab('bet')
            }}
          >
            Bet
          </button>
          <button
            className={`bet-tab-btn ${tab === 'auto' ? 'active' : ''}`}
            onClick={() => {
              soundManager.playClick()
              setTab('auto')
            }}
          >
            Auto
          </button>
        </div>
      </div>

      {/* Main Controls Section */}
      <div className="bet-panel-body">
        {/* Left Side: Amount Adjuster */}
        <div className="bet-input-section">
          {/* Bet Amount Input with +/- */}
          <div className="amount-spinner">
            <button
              className="spinner-btn"
              onClick={() => handleStepAmount(-50)}
              disabled={isActive || bet.amount <= 10}
            >
              -
            </button>
            <div className="amount-input-wrap">
              <span className="currency-tag">₹</span>
              <input
                type="number"
                className="amount-input"
                value={bet.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                disabled={isActive}
                min="10"
                max="100000"
                step="10"
              />
            </div>
            <button
              className="spinner-btn"
              onClick={() => handleStepAmount(50)}
              disabled={isActive}
            >
              +
            </button>
          </div>

          {/* Quick Amount Buttons */}
          <div className="quick-amount-grid">
            <button onClick={() => handleQuickAdd(100)} disabled={isActive}>+100</button>
            <button onClick={() => handleQuickAdd(200)} disabled={isActive}>+200</button>
            <button onClick={() => handleQuickAdd(500)} disabled={isActive}>+500</button>
            <button onClick={() => handleQuickAdd(1000)} disabled={isActive}>+1000</button>
          </div>

          {/* Auto Cashout Row if in Auto Tab */}
          {tab === 'auto' && (
            <div className="auto-controls-row">
              <label className="auto-toggle-label">
                <input
                  type="checkbox"
                  checked={autoCashoutEnabled}
                  onChange={(e) => handleAutoCashoutToggle(e.target.checked)}
                />
                <span className="toggle-custom" />
                <span>Auto Cash Out</span>
              </label>

              {autoCashoutEnabled && (
                <div className="auto-multiplier-input-wrap">
                  <input
                    type="number"
                    step="0.1"
                    min="1.05"
                    max="100"
                    className="auto-mult-input"
                    value={bet.autoCashout || '2.00'}
                    onChange={(e) => onUpdateAutoCashout(panelIndex, e.target.value)}
                    disabled={isActive}
                  />
                  <span className="mult-unit">x</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side: Big Action Button */}
        <div className="bet-action-section">
          {/* State 1: IDLE - Place Bet */}
          {isIdle && (
            <button
              className="btn-aviator-action btn-place-bet"
              onClick={handleActionButton}
              disabled={bet.amount > balance}
            >
              <div className="btn-action-label">BET</div>
              <div className="btn-action-amount">₹{bet.amount.toLocaleString('en-IN')}</div>
            </button>
          )}

          {/* State 2: PENDING during countdown - Waiting or Cancel */}
          {isPending && (
            <button
              className="btn-aviator-action btn-cancel-bet"
              onClick={handleActionButton}
            >
              <div className="btn-action-label">CANCEL</div>
              <div className="btn-action-sublabel">Waiting for flight</div>
            </button>
          )}

          {/* State 3: ACTIVE during flight - Live Cash Out */}
          {isActive && (
            <button
              className="btn-aviator-action btn-cashout-active"
              onClick={handleActionButton}
            >
              <div className="btn-action-label">CASH OUT</div>
              <div className="btn-action-amount">₹{Number(livePayout).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </button>
          )}

          {/* State 4: CASHED OUT */}
          {isCashedOut && (
            <div className="btn-aviator-action btn-cashed-out-badge">
              <div className="btn-action-label">CASHED OUT</div>
              <div className="btn-action-sublabel">
                @{bet.cashedAt?.toFixed(2)}x (+₹{bet.payout?.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
              </div>
            </div>
          )}

          {/* State 5: LOST when crashed */}
          {bet.status === BET_STATUS.LOST && (
            <div className="btn-aviator-action btn-lost-badge">
              <div className="btn-action-label">FLEW AWAY</div>
              <div className="btn-action-sublabel">Round ended</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(BetPanel)

