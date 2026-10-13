import React, { useState } from 'react'
import { soundManager } from '../utils/audio'

export default function ProvablyFairModal({ initialTab = 'rules', onClose }) {
  const [activeTab, setActiveTab] = useState(initialTab)

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-tabs">
            <button
              className={`modal-tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
              onClick={() => {
                soundManager.playClick()
                setActiveTab('rules')
              }}
            >
              How to Play
            </button>
            <button
              className={`modal-tab-btn ${activeTab === 'fairness' ? 'active' : ''}`}
              onClick={() => {
                soundManager.playClick()
                setActiveTab('fairness')
              }}
            >
              Provably Fair
            </button>
          </div>
          <button
            className="modal-close-btn"
            onClick={() => {
              soundManager.playClick()
              onClose()
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {activeTab === 'rules' && (
            <div className="rules-content">
              <h3>Rules of Aviator</h3>
              <div className="rule-card">
                <div className="rule-number">1</div>
                <div className="rule-text">
                  <strong>Place your Bet:</strong> Select your bet amount and press the green <strong>BET</strong> button before the plane takes off. You can place one or two independent bets simultaneously!
                </div>
              </div>

              <div className="rule-card">
                <div className="rule-number">2</div>
                <div className="rule-text">
                  <strong>Watch the Multiplier:</strong> As the red plane climbs into the sky, the multiplier grows starting from <strong>1.00x</strong> up to thousands of times.
                </div>
              </div>

              <div className="rule-card">
                <div className="rule-number">3</div>
                <div className="rule-text">
                  <strong>Cash Out in Time:</strong> Hit <strong>CASH OUT</strong> before the lucky plane flies away! Your win is your bet multiplied by the cashout coefficient.
                </div>
              </div>

              <div className="rule-card">
                <div className="rule-number">4</div>
                <div className="rule-text">
                  <strong>Auto Features:</strong> Use <em>Auto Bet</em> to automatically wager each round, and <em>Auto Cash Out</em> to lock in profits at your target multiplier (e.g. 2.00x).
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fairness' && (
            <div className="fairness-content">
              <h3>100% Provably Fair Technology</h3>
              <p>
                Aviator uses cryptography-based Provably Fair technology to ensure 100% fairness and game integrity.
                The multiplier result for every round is predetermined before the flight starts and cannot be manipulated by anyone.
              </p>

              <div className="seed-explanation-box">
                <div className="seed-title">How It Works:</div>
                <ol>
                  <li><strong>Server Seed:</strong> Generated on the game server (16 random characters SHA-256 hashed).</li>
                  <li><strong>Client Seeds:</strong> Derived from the first 3 players who place bets in the round.</li>
                  <li><strong>Combined Hash:</strong> Both seeds are concatenated to calculate the final crash multiplier using HMAC-SHA512.</li>
                </ol>
              </div>

              <div className="fairness-badge-large">
                <span>🛡️</span>
                <strong>CRYPTOGRAPHICALLY SECURE & VERIFIED</strong>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

