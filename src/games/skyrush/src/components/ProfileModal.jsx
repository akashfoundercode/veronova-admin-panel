import React, { useState } from 'react'
import { soundManager } from '../utils/audio'

export default function ProfileModal({ profile, balance, onRefresh, onClose }) {
  const [copiedKey, setCopiedKey] = useState('')

  const handleCopy = (text, key) => {
    if (!text) return
    try {
      navigator.clipboard.writeText(String(text))
      setCopiedKey(key)
      soundManager.playClick()
      setTimeout(() => setCopiedKey(''), 2000)
    } catch {}
  }

  const username = profile?.username || 'Admin'
  const uid = profile?.u_id || profile?.id || 'ADMIN_123'
  const mobile = profile?.mobile || '1234567890'
  const email = profile?.email || `${(profile?.username || 'admin').toLowerCase().replace(/[^a-z0-9]/g, '')}@skyrush.game`
  const rawImage = profile?.userimage || ''
  const userImage = rawImage && !rawImage.includes('bdgcassino.com') ? rawImage : ''
  const winningAmount = profile?.winning_amount !== undefined ? Number(profile.winning_amount) : 19605.22
  const referralCode = profile?.referral_code || 'AKHTEY'
  const minWithdraw = profile?.minimum_withdraw || '200'
  const maxWithdraw = profile?.maximum_withdraw || '2500'
  const lastLogin = profile?.last_login_time || 'Recent'

  const liveWallet = balance !== undefined
    ? balance
    : (profile?.total_wallet !== undefined ? Number(profile.total_wallet) : Number(profile?.wallet || 0))

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container profile-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="profile-header-title">
            <svg className="profile-badge-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Pilot Profile</span>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => {
              soundManager.playClick()
              onClose()
            }}
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body profile-modal-body">
          {/* Top Pilot Identity Card */}
          <div className="profile-pilot-hero">
            <div className="profile-avatar-frame">
              {userImage ? (
                <img
                  src={userImage}
                  alt={username}
                  className="profile-avatar-img"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : null}
              <div className="profile-avatar-fallback">
                {username.slice(0, 1).toUpperCase()}
              </div>
              <span className="profile-online-ping" title="Online" />
            </div>

            <div className="profile-hero-meta">
              <div className="profile-hero-row">
                <h3 className="profile-username">{username}</h3>
                <span className="profile-vip-tag">VIP PILOT</span>
              </div>
              <div className="profile-uid-row">
                <span className="profile-uid-text">UID: {uid}</span>
                <button
                  className="profile-copy-mini-btn"
                  onClick={() => handleCopy(uid, 'uid')}
                  title="Copy UID"
                >
                  {copiedKey === 'uid' ? '✓' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Dual Wallet Balances */}
          <div className="profile-wallet-grid">
            <div className="profile-wallet-tile main-wallet">
              <span className="tile-label">Total Balance</span>
              <div className="tile-value">
                <span className="tile-currency">₹</span>
                {liveWallet.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <span className="tile-sub">Real API Wallet</span>
            </div>

            <div className="profile-wallet-tile win-wallet">
              <span className="tile-label">Winning Amount</span>
              <div className="tile-value green">
                <span className="tile-currency">₹</span>
                {winningAmount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <span className="tile-sub">Withdrawable</span>
            </div>
          </div>

          {/* Account & Security Details */}
          <div className="profile-details-group">
            <div className="profile-detail-row">
              <span className="pdetail-label">Mobile Number</span>
              <span className="pdetail-val">{mobile}</span>
            </div>

            <div className="profile-detail-row">
              <span className="pdetail-label">Email Address</span>
              <span className="pdetail-val">{email}</span>
            </div>

            <div className="profile-detail-row">
              <span className="pdetail-label">Referral Code</span>
              <div className="pdetail-val-copy">
                <span className="referral-code-pill">{referralCode}</span>
                <button
                  className="profile-copy-btn"
                  onClick={() => handleCopy(referralCode, 'ref')}
                  title="Copy Referral Code"
                >
                  {copiedKey === 'ref' ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>

            <div className="profile-detail-row">
              <span className="pdetail-label">Withdrawal Range</span>
              <span className="pdetail-val">₹{minWithdraw} - ₹{maxWithdraw}</span>
            </div>

            <div className="profile-detail-row">
              <span className="pdetail-label">Last Login</span>
              <span className="pdetail-val muted-time">{lastLogin}</span>
            </div>
          </div>

          {/* Refresh Action Footer */}
          <div className="profile-footer-actions">
            <button
              className="profile-refresh-btn"
              onClick={() => {
                soundManager.playClick()
                if (onRefresh) onRefresh()
              }}
            >
              <svg className="refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Sync Balance & Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
