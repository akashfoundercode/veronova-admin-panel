import React from 'react'

/**
 * RotateDeviceOverlay:
 * Futuristic Cyberpunk Cockpit HUD shown exclusively when a mobile/tablet
 * device is in Portrait orientation. Prompts the user to rotate their device
 * to Landscape for the optimal flight experience. Automatically hides when rotated.
 */
export default function RotateDeviceOverlay() {
  const [dismissed, setDismissed] = React.useState(false)
  const isEmbed = typeof window !== 'undefined' && (
    window.location.search.includes('embed') ||
    window.location.search.includes('landscape') ||
    window.self !== window.top
  )

  if (isEmbed || dismissed) {
    return null
  }

  const handleFullscreenToggle = () => {
    try {
      const el = document.documentElement
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) {
          el.requestFullscreen().catch(() => {})
        } else if (el.webkitRequestFullscreen) {
          el.webkitRequestFullscreen()
        }
        if (window.screen?.orientation?.lock) {
          window.screen.orientation.lock('landscape').catch(() => {})
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {})
        }
      }
    } catch {
      // Ignored if not supported or denied
    }
  }

  return (
    <div className="rotate-device-overlay" aria-modal="true" role="dialog">
      {/* Background Animated Ambience */}
      <div className="rotate-ambient-glow glow-red" />
      <div className="rotate-ambient-glow glow-cyan" />
      <div className="rotate-grid-lines" />

      <div className="rotate-modal-card">
        {/* Top Cockpit Header */}
        <div className="rotate-hud-header">
          <div className="rotate-jet-icon-box">
            <svg className="rotate-jet-svg" viewBox="0 0 28 28" fill="none">
              <g transform="rotate(45 14 14)">
                <ellipse cx="14" cy="24" rx="2.5" ry="3.5" fill="#ff1e42" opacity="0.9" />
                <path
                  d="M 14 2 C 14.6 4.5 15.3 7.5 15.5 10 L 25 15.5 L 25 17 L 16.2 16 L 15.8 19 L 20.5 23 L 20 24 L 15.2 22.8 L 14.6 24 L 14 23.5 L 13.4 24 L 12.8 22.8 L 8 24 L 7.5 23 L 12.2 19 L 11.8 16 L 3 17 L 3 15.5 L 12.5 10 C 12.7 7.5 13.4 4.5 14 2 Z"
                  fill="url(#rotateJetGrad)"
                  stroke="#ffffff"
                  strokeWidth="0.5"
                />
              </g>
              <defs>
                <linearGradient id="rotateJetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="60%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="rotate-hud-subtitle">AVIATOR FLIGHT TELEMETRY</span>
        </div>

        {/* Central Animated Phone Rotation Graphic */}
        <div className="rotate-graphic-container">
          {/* Animated Orbiting Curved Arrow */}
          <div className="rotate-orbit-arrow-wrap">
            <svg className="rotate-orbit-svg" viewBox="0 0 160 160" fill="none">
              <path
                d="M 80 18 A 62 62 0 1 1 20 90"
                stroke="url(#orbitGrad)"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
              <polygon points="18,74 24,96 6,90" fill="#ff2a4b" />
              <defs>
                <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff2a4b" />
                  <stop offset="60%" stopColor="#ff758c" />
                  <stop offset="100%" stopColor="#00f2fe" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Pivoting Phone Graphic */}
          <div className="rotating-phone-box">
            <div className="phone-outer-bezel">
              <div className="phone-screen">
                <div className="phone-notch" />
                {/* Mini Flight Path Inside Phone Screen */}
                <div className="mini-cockpit-hud">
                  <span className="mini-hud-mult">2.84x</span>
                  <div className="mini-hud-curve" />
                  <div className="mini-hud-jet" />
                </div>
              </div>
              <div className="phone-home-indicator" />
            </div>
          </div>
        </div>

        {/* Informational Text */}
        <div className="rotate-info-content">
          <div className="rotate-status-pill">
            <span className="rotate-pulse-dot" />
            <span className="rotate-status-text">PORTRAIT DETECTED</span>
          </div>

          <h2 className="rotate-main-heading">
            ROTATE YOUR DEVICE
          </h2>

          <p className="rotate-desc-text">
            Aviator supersonic flight requires <span className="highlight-text">Landscape Mode</span>.
            Please turn your phone horizontally to start playing.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '100%' }}>
            <button
              type="button"
              className="rotate-fullscreen-btn"
              onClick={handleFullscreenToggle}
            >
              <svg className="fullscreen-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
              <span>Tap for Fullscreen</span>
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '11px', textDecoration: 'underline', cursor: 'pointer', paddingTop: '2px' }}
            >
              Continue Anyway
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
