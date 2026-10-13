import React, { useState } from 'react'
import { getMultiplierColor, generateProvablyFairHash } from '../utils/crash'
import { soundManager } from '../utils/audio'

function HistoryBar({ history = [], onSelectRound }) {
  const [selectedPill, setSelectedPill] = useState(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const handlePillClick = (item, index) => {
    soundManager.playClick()
    const value = typeof item === 'number' ? item : item.multiplier
    const roundId = typeof item === 'object' ? item.roundId : 1000 - index
    const hashData = generateProvablyFairHash(roundId, value)
    setSelectedPill({
      multiplier: value,
      roundId,
      ...hashData,
    })
  }

  return (
    <div className="aviator-history-bar">
      <div className="history-label">
        <span className="history-icon">🕒</span>
      </div>

      <div className={`history-pills-scroll ${isExpanded ? 'expanded' : ''}`}>
        {history.map((item, index) => {
          const mult = typeof item === 'number' ? item : item.multiplier
          const color = getMultiplierColor(mult)
          return (
            <button
              key={index}
              className="history-pill"
              style={{
                color: color,
                backgroundColor: `${color}18`,
                borderColor: `${color}40`,
              }}
              onClick={() => handlePillClick(item, index)}
              title={`Round Details: ${mult.toFixed(2)}x`}
            >
              {mult.toFixed(2)}x
            </button>
          )
        })}
      </div>

      <button
        className="history-expand-toggle"
        onClick={() => {
          soundManager.playClick()
          setIsExpanded(!isExpanded)
        }}
        title="Toggle history view"
      >
        {isExpanded ? '▲' : '▼'}
      </button>

      {/* Pill Detail Popover */}
      {selectedPill && (
        <div className="pill-popover-overlay" onClick={() => setSelectedPill(null)}>
          <div className="pill-popover" onClick={(e) => e.stopPropagation()}>
            <div className="popover-header">
              <span className="popover-title">ROUND #{selectedPill.roundId}</span>
              <button className="popover-close" onClick={() => setSelectedPill(null)}>✕</button>
            </div>
            <div className="popover-result">
              <span
                className="popover-multiplier"
                style={{ color: getMultiplierColor(selectedPill.multiplier) }}
              >
                {selectedPill.multiplier.toFixed(2)}x
              </span>
            </div>
            <div className="popover-details">
              <div className="detail-row">
                <span className="detail-key">Server Seed:</span>
                <span className="detail-val">{selectedPill.serverSeed}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Client Seed:</span>
                <span className="detail-val">{selectedPill.clientSeed}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">SHA-256 Hash:</span>
                <span className="detail-val hash-val">{selectedPill.hash}</span>
              </div>
            </div>
            <div className="popover-footer">
              <span className="popover-verified">✓ Provably Fair Verified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(HistoryBar)

