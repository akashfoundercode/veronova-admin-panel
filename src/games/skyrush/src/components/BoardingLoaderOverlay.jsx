import React, { useMemo } from 'react'
import loaderPlainImg from '../assets/loader/loaderplain.png'
import characterImg from '../assets/loader/character .png'
import boardingBadgeImg from '../assets/loader/boarding_passengers_badge.png'
import flightLoadingBarImg from '../assets/loader/flight_loading_bar_empty.png'

/**
 * BoardingLoaderOverlay:
 * Futuristic Cyberpunk Aviation HUD Loader using official asset images
 * for the top Boarding Passengers badge and bottom Loading Bar frame.
 * Plane and character coordinates are strictly 100% preserved.
 */
/**
 * Premium Supersonic Jet SVG Icon with metallic gradients and afterburner glow
 */
function PremiumJetIcon({ className = 'hud-premium-jet-svg' }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="premiumJetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#f8fafc" />
          <stop offset="70%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <radialGradient id="premiumJetExhaust" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff4d6d" stopOpacity="1" />
          <stop offset="50%" stopColor="#ff1e42" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ff1e42" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform="rotate(45 14 14)">
        {/* Jet Exhaust Thruster Flame */}
        <ellipse cx="14" cy="24" rx="2.2" ry="3.5" fill="url(#premiumJetExhaust)" />
        <ellipse cx="14" cy="23.2" rx="1.2" ry="1.8" fill="#ffffff" opacity="0.9" />

        {/* Jet Silhouette Body */}
        <path
          d="M 14 2 
             C 14.6 4.5 15.3 7.5 15.5 10 
             L 25 15.5 
             L 25 17 
             L 16.2 16 
             L 15.8 19 
             L 20.5 23 
             L 20 24 
             L 15.2 22.8 
             L 14.6 24 
             L 14 23.5 
             L 13.4 24 
             L 12.8 22.8 
             L 8 24 
             L 7.5 23 
             L 12.2 19 
             L 11.8 16 
             L 3 17 
             L 3 15.5 
             L 12.5 10 
             C 12.7 7.5 13.4 4.5 14 2 Z"
          fill="url(#premiumJetGrad)"
          stroke="rgba(255, 255, 255, 0.9)"
          strokeWidth="0.4"
          strokeLinejoin="round"
        />

        {/* Glowing Cockpit Canopy */}
        <path
          d="M 14 6 C 14.4 7.5 14.4 10 14 11.5 C 13.6 10 13.6 7.5 14 6 Z"
          fill="#ff2a4b"
        />
      </g>
    </svg>
  )
}

// Static list of passengers for the boarding stairs queue
const STATIC_PASSENGERS = [
  { id: 'p1', delay: '0.0s' },
  { id: 'p2', delay: '0.7s' },
  { id: 'p3', delay: '1.4s' },
  { id: 'p4', delay: '2.1s' },
  { id: 'p5', delay: '2.8s' },
  { id: 'p6', delay: '3.5s' },
  { id: 'p7', delay: '4.2s' },
  { id: 'p8', delay: '4.9s' },
]

// Pre-rendered 36 SVG chevrons (never recreated across ticks)
const CHEVRON_ARROWS = Array.from({ length: 36 }, (_, i) => (
  <svg key={i} className="chevron-arrow-svg" viewBox="0 0 10 18" fill="currentColor">
    <path d="M1.5 1.5 L6.5 9 L1.5 16.5 L3.5 16.5 L8.5 9 L3.5 1.5 Z" />
  </svg>
))

// 6 Progressive Milestones
const STATIC_MILESTONES = [
  {
    id: 'preflight',
    title: <>PREFLIGHT<br />CHECK</>,
    threshold: 18,
    activeRange: [0, 18],
    telemetry: { red: 'PREFLIGHT CHECK', white: 'DIAGNOSTICS OK' },
    icon: (
      <svg className="milestone-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    id: 'fueling',
    title: <>FUELING</>,
    threshold: 36,
    activeRange: [18, 36],
    telemetry: { red: 'REFUELING JET', white: 'FUEL PRESSURE 100%' },
    icon: (
      <svg className="milestone-svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
  },
  {
    id: 'boarding',
    title: <>PASSENGERS<br />BOARDING</>,
    threshold: 58,
    activeRange: [36, 58],
    telemetry: { red: 'PREPARING FLIGHT', white: 'CABIN PRESSURE OK' },
    icon: (
      <svg className="milestone-svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    ),
  },
  {
    id: 'luggage',
    title: <>LUGGAGE<br />LOADING</>,
    threshold: 76,
    activeRange: [58, 76],
    telemetry: { red: 'LUGGAGE SECURED', white: 'CARGO HOLD LOCKED' },
    icon: (
      <svg className="milestone-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="15" rx="2" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="16" />
        <line x1="14" y1="11" x2="14" y2="16" />
      </svg>
    ),
  },
  {
    id: 'systems',
    title: <>SYSTEMS<br />ONLINE</>,
    threshold: 92,
    activeRange: [76, 92],
    telemetry: { red: 'SYSTEMS ONLINE', white: 'AVIONICS 100% READY' },
    icon: (
      <svg className="milestone-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    id: 'takeoff',
    title: <>READY FOR<br />TAKEOFF</>,
    threshold: 100,
    activeRange: [92, 100],
    telemetry: { red: 'CLEARANCE GRANTED', white: 'ENGINES AT FULL POWER' },
    icon: (
      <svg className="milestone-svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M2.5 19h19v2h-19z M22.07 9.64c-.39-.31-1.02-.27-1.37.11l-3.32 3.63L9.6 11.2l4.88-5.35c.34-.37.33-.94-.03-1.3-.37-.36-.95-.36-1.32.01L6.75 10.3l-3.56-.99c-.58-.16-1.19.14-1.38.71-.19.56.09 1.18.66 1.38l17.7 5.7c.18.06.36.09.54.09.43 0 .84-.18 1.12-.52.41-.51.34-1.25-.26-1.73z" />
      </svg>
    ),
  },
]

/**
 * Isolated Boarding Stage:
 * Wrapped in React.memo with zero props so React NEVER re-renders the plane
 * or the 8 walking characters when the countdown timer ticks!
 * Runs 100% on GPU compositor thread at silky 60fps/120fps with zero micro-stutter.
 */
const BoardingPlaneStage = React.memo(function BoardingPlaneStage() {
  return (
    <div className="boarding-stage-wrapper">
      <div className="tarmac-guideline-strip" />
      <div className="tarmac-edge-beacons">
        <span className="tarmac-beacon beacon-b1" />
        <span className="tarmac-beacon beacon-b2" />
        <span className="tarmac-beacon beacon-b3" />
        <span className="tarmac-beacon beacon-b4" />
      </div>

      <div className="boarding-plane-box">
        <img
          src={loaderPlainImg}
          alt="Boarding Plane"
          className="boarding-plane-img"
          draggable="false"
        />

        {/* Passenger Boarding Line: Characters boarding one by one */}
        <div className="boarding-passengers-track">
          {STATIC_PASSENGERS.map((p) => (
            <div
              key={p.id}
              className="boarding-character-wrap"
              style={{ animationDelay: `-${p.delay}` }}
            >
              <img
                src={characterImg}
                alt="Passenger"
                className="boarding-character-img"
                draggable="false"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

function BoardingLoaderOverlay({ countdown = 10, totalCountdown = 10 }) {
  const progressPercent = Math.min(100, Math.max(0, ((totalCountdown - countdown) / totalCountdown) * 100))
  const boardedCount = Math.min(12, Math.max(1, Math.round((progressPercent / 100) * 12)))

  // Identify current active telemetry step
  const currentStep = useMemo(() => {
    return STATIC_MILESTONES.find((m) => progressPercent >= m.activeRange[0] && progressPercent < m.activeRange[1]) || STATIC_MILESTONES[STATIC_MILESTONES.length - 1]
  }, [progressPercent])

  return (
    <div className="boarding-loader-backdrop" aria-hidden="true">
      <div className="boarding-loader-hud">

        {/* TOP HUD ROW */}
        <div className="hud-top-row">
          {/* Top Left: Boarding Passengers Badge Image */}
          <div className="hud-gate-badge-wrap">
            <img
              src={boardingBadgeImg}
              alt="Boarding Passengers Gate A-07"
              className="hud-gate-badge-img"
              draggable="false"
            />
            <div className="hud-gate-badge-content">
              <div className="hud-gate-hex-icon-box">
                <PremiumJetIcon />
              </div>
              <div className="hud-gate-text-col">
                <span className="hud-gate-title">BOARDING PASSENGERS</span>
              </div>
            </div>
          </div>

          {/* Center: Passenger Counter Pill */}
          <div className="hud-passenger-pill">
            <div className="hud-passenger-icon-circle">
              <svg className="hud-people-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
            <div className="hud-passenger-info">
              <span className="hud-passenger-label">PASSENGERS</span>
              <span className="hud-passenger-count">
                <span className="count-num">{boardedCount}</span>/12
              </span>
            </div>
          </div>

          {/* Top Right: Takeoff Countdown HUD */}
          <div className="hud-countdown-badge">
            <div className="hud-rocket-box">
              <svg className="hud-rocket-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.5s3.5 3 3.5 8.5c0 1.5-.5 3-1.5 4.5l3.5 3.5-1.5 1.5-3.5-3.5c-1.5 1-3 1.5-4.5 1.5-5.5 0-8.5-3.5-8.5-3.5s3-3.5 8.5-3.5c1.5 0 3 .5 4.5 1.5l3.5-3.5-1.5-1.5-3.5 3.5C8 9.5 7.5 8 7.5 6.5 7.5 2.5 12 2.5 12 2.5z M6.5 17.5l-2.5 4 4-2.5z" />
              </svg>
            </div>
            <div className="hud-countdown-text">
              <span className="hud-countdown-label">TAKEOFF IN</span>
              <div className="hud-countdown-digits">
                <span className="digit-val">{countdown.toFixed(1)}</span>
                <span className="digit-sec">s</span>
              </div>
            </div>
            <div className="hud-clock-circle">
              <svg className="hud-clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <circle cx="12" cy="12" r="9" />
                <polyline points="12 7 12 12 15 15" />
              </svg>
            </div>
          </div>
        </div>

        {/* CENTER STAGE: Plane + Passengers (Completely isolated in React.memo) */}
        <BoardingPlaneStage />

        {/* BOTTOM HUD: Official Graphic Loading Bar + 6 Progressive Milestones */}
        <div className="hud-bottom-telemetry">

          {/* Telemetry Status directly above the Loading Bar */}
          <div className="hud-telemetry-status">
            <span className="telemetry-red">{currentStep.telemetry.red}</span>
            <span className="telemetry-dot">•</span>
            <span className="telemetry-white">{currentStep.telemetry.white}</span>
          </div>

          {/* Futuristic Loading Bar using the Official Image Frame */}
          <div className="hud-loading-bar-wrapper">
            <img
              src={flightLoadingBarImg}
              alt="Loading Track Frame"
              className="hud-loading-bar-bg"
              draggable="false"
            />

            <div className="hud-loading-bar-overlay">
              {/* Left Hexagon Plane Icon */}
              <div className="hud-loader-hex-icon-box">
                <PremiumJetIcon />
              </div>

              {/* Dynamic Chevron fill inside the image track */}
              <div className="hud-image-track-fill-area">
                <div
                  className="hud-image-track-fill"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="hud-chevron-svg-row">
                    {CHEVRON_ARROWS}
                  </div>
                </div>
              </div>

              {/* Dynamic Percentage matching Takeoff Countdown HUD style */}
              <div className="hud-image-percent-text">
                <span className="percent-val">{Math.round(progressPercent)}</span>
                <span className="percent-sec">%</span>
              </div>
            </div>
          </div>

          {/* 6-Step Connected Dynamic Milestone Timeline */}
          <div className="hud-milestone-timeline">
            <div className="milestone-track-line" />

            {STATIC_MILESTONES.map((m) => {
              const isCompleted = progressPercent >= m.threshold
              const isActive = !isCompleted && progressPercent >= m.activeRange[0] && progressPercent < m.activeRange[1]
              const statusClass = isCompleted ? 'completed' : (isActive ? 'active' : 'pending')

              return (
                <div key={m.id} className={`hud-milestone-item ${statusClass}`}>
                  <div className={`milestone-badge-circle ${isActive ? 'active-glow' : ''}`}>
                    {isCompleted ? (
                      <svg className="milestone-svg checkmark-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      m.icon
                    )}
                  </div>
                  <span className={`milestone-label ${isActive ? 'active-text' : (isCompleted ? 'completed-text' : '')}`}>
                    {m.title}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}

export default React.memo(BoardingLoaderOverlay)
