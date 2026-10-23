import React, { useState } from 'react'
import { soundManager } from '../utils/audio'

function Header({
  balance,
  onResetBalance,
  soundMuted,
  onToggleSound,
  onOpenFairModal,
  onlineCount = 2419,
  profile,
  onOpenProfileModal,
  socketStatus,
  hideBalance = true,
}) {
  const [showDepositMenu, setShowDepositMenu] = useState(false)

  const handleDeposit = (amount) => {
    onResetBalance(balance + amount)
    setShowDepositMenu(false)
    soundManager.playClick()
  }

  return (
    <header className="aviator-header">
      {/* Brand */}
      <div className="header-left">
        <div className="aviator-brand">
          <svg className="brand-logo-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
          <span className="brand-text">Aviator</span>
        </div>
        <button
          className="header-btn header-btn-ghost"
          onClick={() => {
            soundManager.playClick()
            onOpenFairModal('rules')
          }}
        >
          <svg className="header-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className="btn-label">How to play?</span>
        </button>
      </div>

      {/* Center Online Count + Live Socket Status */}
      <div className="header-center">
        <div className="online-badge">
          <span className="online-dot" />
          <span>{onlineCount.toLocaleString()} online</span>
        </div>
        {socketStatus && (
          <div
            className={`socket-badge ${socketStatus.connected ? '' : 'disconnected'}`}
            title={`Server: ${socketStatus.serverUrl || 'https://fcsocket.site'} (${socketStatus.channel || 'demobdg_aviator'})`}
          >
            <span className="socket-dot" />
            <span>{socketStatus.connected ? 'FC LIVE' : 'CONNECTING'}</span>
          </div>
        )}
      </div>

      {/* Right Controls: Balance + Sound + Fair */}
      <div className="header-right">
        {/* Provably Fair */}
        <button
          className="header-btn header-btn-fair"
          onClick={() => {
            soundManager.playClick()
            onOpenFairModal('fairness')
          }}
          title="Provably Fair 100%"
        >
          <svg className="fair-shield-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span className="fair-text">Provably Fair</span>
        </button>

        {/* Balance */}
        {!hideBalance && (
          <div className="balance-container">
            <div className="balance-label">Balance:</div>
            <div className="balance-amount">
              <span className="currency-symbol">₹</span>
              {balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <button
              className="deposit-plus-btn"
              onClick={() => {
                soundManager.playClick()
                setShowDepositMenu(!showDepositMenu)
              }}
              title="Add Funds"
            >
              +
            </button>

            {showDepositMenu && (
              <div className="deposit-dropdown">
                <div className="deposit-title">Quick Deposit / Add Demo Funds</div>
                <div className="deposit-grid">
                  <button onClick={() => handleDeposit(500)}>+ ₹500</button>
                  <button onClick={() => handleDeposit(1000)}>+ ₹1,000</button>
                  <button onClick={() => handleDeposit(5000)}>+ ₹5,000</button>
                  <button onClick={() => handleDeposit(10000)}>+ ₹10,000</button>
                </div>
                <button
                  className="deposit-reset"
                  onClick={() => {
                    onResetBalance(5000)
                    setShowDepositMenu(false)
                    soundManager.playClick()
                  }}
                >
                  Reset to ₹5,000.00
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pilot Profile Pill */}
        <button
          className="header-profile-btn"
          onClick={() => {
            soundManager.playClick()
            if (onOpenProfileModal) onOpenProfileModal()
          }}
          title="Open Pilot Profile"
        >
          <div className="header-pilot-avatar">
            {profile?.userimage && !profile.userimage.includes('bdgcassino.com') ? (
              <img
                src={profile.userimage}
                alt="Pilot"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : null}
            <span>{(profile?.username || 'A').slice(0, 1).toUpperCase()}</span>
          </div>
          <span className="header-pilot-name">{profile?.username || 'Admin'}</span>
        </button>

        {/* Audio Mute/Unmute */}
        <button
          className={`sound-toggle-btn ${soundMuted ? 'muted' : ''}`}
          onClick={onToggleSound}
          title={soundMuted ? 'Unmute sound' : 'Mute sound'}
        >
          {soundMuted ? (
            <svg className="sound-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg className="sound-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}

export default React.memo(Header)
