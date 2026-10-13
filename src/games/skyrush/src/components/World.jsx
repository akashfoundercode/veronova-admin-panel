import React, { useMemo } from 'react'
import runwayImg from '../assets/runway-background.png'
import nightFrameImg from '../assets/nightframe.png'
import earthImg from '../assets/bg-parts/earth.png'
import asteroidImg from '../assets/bg-parts/aestroids.png'
import smallAsteroidImg from '../assets/bg-parts/aestroids small.png'
import blueCircleNebulaImg from '../assets/bg-parts/bluecirclenebula.png'
import dangerNebulaImg from '../assets/bg-parts/dangernumbula.png'
import roundedNebulaImg from '../assets/bg-parts/roundednumbula.png'
import blueNebulaImg from '../assets/bg-parts/blue nebula.png'
import brightStarsImg from '../assets/bg-parts/bright-stars.png'
import goldStarImg from '../assets/bg-parts/gold star.png'
import jupiterImg from '../assets/bg-parts/jupitor.png'
import moonImg from '../assets/bg-parts/moon.png'
import purplePlanetImg from '../assets/bg-parts/puple-planet.png'
import saturnImg from '../assets/bg-parts/saturn.png'
import saturnRedImg from '../assets/bg-parts/saturnred.png'
import cloudyPlanetImg from '../assets/bg-parts/cloudyplanet.png'
import pngwingImg from '../assets/bg-parts/pngwing.com.png'



const MeteorLayer = React.memo(function MeteorLayer() {
  const meteors = [
    { id: 'meteor-a', top: '17%', left: '12%', delay: '1s', duration: '6.5s', length: '110px' },
    { id: 'meteor-b', top: '31%', left: '68%', delay: '4s', duration: '8s', length: '78px' },
    { id: 'meteor-c', top: '8%', left: '46%', delay: '7s', duration: '7s', length: '96px' },
  ]
  return (
    <div className="meteor-layer" aria-hidden="true">
      {meteors.map((m) => (
        <span
          key={m.id}
          className="meteor"
          style={{
            top: m.top,
            left: m.left,
            animationDelay: m.delay,
            animationDuration: m.duration,
            width: m.length,
          }}
        />
      ))}
    </div>
  )
})

/**
 * Spaced-out Linear Celestial Milestones:
 * - Each celestial part appears strictly ONCE along altitude journey with generous spacing!
 * - Cropped elements (cloudyplanet, pngwing) are anchored to the left corner.
 */
const SpacePartsLayer = React.memo(function SpacePartsLayer({ frame = 0 }) {
  if (frame === 0) {
    // Stage 1 (Liftoff ~1.5x): Blue Circle Nebula & Asteroids
    return (
      <div className="celestial-zone zone-asteroids" aria-hidden="true">
        <img className="celestial-body celestial-blue-nebula" src={blueCircleNebulaImg} alt="Blue Circle Nebula" draggable="false" />
        <img className="celestial-body celestial-asteroid-main" src={asteroidImg} alt="Asteroids" draggable="false" />
        <img className="celestial-body celestial-asteroid-small" src={smallAsteroidImg} alt="Small Asteroids" draggable="false" />
        <img className="celestial-body celestial-gold-star" src={goldStarImg} alt="Gold Star" draggable="false" />
      </div>
    )
  }

  if (frame === 2) {
    // Stage 2 (~3.5x): Gas Giant Jupiter & Rounded Nebula
    return (
      <div className="celestial-zone zone-jupiter" aria-hidden="true">
        <img className="celestial-body celestial-rounded-nebula" src={roundedNebulaImg} alt="Rounded Nebula" draggable="false" />
        <img className="celestial-body celestial-jupiter" src={jupiterImg} alt="Jupiter" draggable="false" />
        <img className="celestial-body celestial-bright-stars" src={brightStarsImg} alt="Bright Stars" draggable="false" />
      </div>
    )
  }

  if (frame === 4) {
    // Stage 3 (~6.0x): Red Ringed Saturn & Danger Red Nebula
    return (
      <div className="celestial-zone zone-saturn-red" aria-hidden="true">
        <img className="celestial-body celestial-danger-nebula" src={dangerNebulaImg} alt="Danger Nebula" draggable="false" />
        <img className="celestial-body celestial-saturn-red" src={saturnRedImg} alt="Red Saturn" draggable="false" />
        <img className="celestial-body celestial-gold-star-alt" src={goldStarImg} alt="Gold Star" draggable="false" />
      </div>
    )
  }

  if (frame === 7) {
    // Stage 4 (~10.0x): Cloudy Atmosphere Planet (Anchored on Left Corner)
    return (
      <div className="celestial-zone zone-cloudy-planet" aria-hidden="true">
        <img className="celestial-body celestial-cloudy-planet" src={cloudyPlanetImg} alt="Cloudy Planet" draggable="false" />
        <img className="celestial-body celestial-gold-star" src={goldStarImg} alt="Gold Star" draggable="false" />
      </div>
    )
  }

  if (frame === 10) {
    // Stage 5 (~16.0x): Cosmic Wing Galaxy (Left Corner) & Ringed Saturn
    return (
      <div className="celestial-zone zone-saturn" aria-hidden="true">
        <img className="celestial-body celestial-saturn" src={saturnImg} alt="Saturn" draggable="false" />
        <img className="celestial-body celestial-pngwing" src={pngwingImg} alt="Cosmic Galaxy" draggable="false" />
      </div>
    )
  }

  if (frame === 14) {
    // Stage 6 (~25.0x): Purple Exoplanet & Deep Blue Cloud
    return (
      <div className="celestial-zone zone-purple-planet" aria-hidden="true">
        <img className="celestial-body celestial-purple-planet" src={purplePlanetImg} alt="Purple Planet" draggable="false" />
        <img className="celestial-body celestial-blue-nebula-alt" src={blueNebulaImg} alt="Blue Nebula Cloud" draggable="false" />
      </div>
    )
  }

  if (frame === 19) {
    // Stage 7 (~50x+ Grand Milestone): Planet Earth Orbital Pass (Appears STRICTLY ONCE)
    return (
      <div className="celestial-zone zone-earth-orbital" aria-hidden="true">
        <div className="orbital-earth-container">
          <img className="celestial-body celestial-earth-orbital" src={earthImg} alt="Planet Earth" draggable="false" />
          <div className="orbital-earth-glow" />
        </div>
        <img className="celestial-body celestial-gold-star" src={goldStarImg} alt="Star" draggable="false" />
      </div>
    )
  }

  // All other in-between & infinite high altitude frames: zero parts repeat, pure stars & meteors
  return null
})

// Active altitude milestone frames (where celestial bodies actually exist)
const CELESTIAL_MILESTONE_FRAMES = [0, 2, 4, 7, 10, 14, 19]

// 40 Continuous night sky frames ensure seamless looping from takeoff to deep space past 100x+
const INFINITE_NIGHT_SKY_FRAMES = Array.from({ length: 40 }, (_, i) => i)

/**
 * Procedural Starry Sky with Seamless Night Looping & Celestial Journey (Zero-Jitter, GPU Optimized)
 */
export default function World({ offset = 0 }) {
  // Static starfield array (created once)
  const stars = useMemo(() => {
    const list = []
    for (let i = 0; i < 35; i++) {
      list.push({
        id: i,
        left: `${(i * 17.3) % 96 + 2}%`,
        top: `${(i * 23.7) % 92 + 4}%`,
        size: (i % 3) === 0 ? 2.2 : (i % 2 === 0 ? 1.6 : 1.1),
        opacity: 0.4 + (i % 5) * 0.12,
        twinkleDuration: `${2.2 + (i % 3) * 0.9}s`,
        twinkleDelay: `${(i % 4) * 0.5}s`,
      })
    }
    return list
  }, [])

  return (
    <div className="world-viewport">
      {/* Global Starfield Layer: Sparkles continuously across entire flight without duplicating 1700+ nodes */}
      <div className="sky-stars-layer" aria-hidden="true">
        {stars.map((s) => (
          <span
            key={`global-star-${s.id}`}
            className="sky-star"
            style={{
              left: s.left,
              top: s.top,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: s.opacity,
              animationDuration: s.twinkleDuration,
              animationDelay: s.twinkleDelay,
            }}
          />
        ))}
      </div>

      {/* Global Meteors Layer: Streaks across the night sky */}
      <MeteorLayer />

      <div
        className="world-track"
        style={{
          transform: `translate3d(0, ${offset}px, 0)`,
        }}
      >
        {/* Infinite deep space atmosphere above runway */}
        <div className="world-deepspace" />

        {/* Continuous Seamless Looping Night Sky (nightframe.png) - Subpixel overlap & alternating flip */}
        {INFINITE_NIGHT_SKY_FRAMES.map((fIndex) => (
          <div
            key={`night-sky-loop-${fIndex}`}
            className="world-night-sky-frame"
            style={{
              bottom: `calc(${(fIndex + 1) * 100}% - 1px)`,
              height: 'calc(100% + 2px)',
              transform: fIndex % 2 === 1 ? 'scaleX(-1)' : 'none',
            }}
          >
            <div
              className="night-sky-loop-art"
              style={{ backgroundImage: `url(${nightFrameImg})` }}
            />
          </div>
        ))}

        {/* Distinct Celestial Milestones (Stage 1 to Stage 7: Jupiter, Saturn, Earth Orbital, etc.) */}
        {CELESTIAL_MILESTONE_FRAMES.map((frame) => (
          <div
            key={`high-frame-${frame}`}
            className={`world-high-sky world-high-sky--${frame}`}
            style={{ bottom: `${(frame + 1) * 100}%` }}
          >
            <SpacePartsLayer frame={frame} />
          </div>
        ))}

        {/* Frame 1: Full Runway Frame with Single Fixed Moon */}
        <div className="world-runway-backdrop">
          <div className="runway-night-art" style={{ backgroundImage: `url(${nightFrameImg})` }} />
        </div>
        <div className="world-runway" style={{ backgroundImage: `url(${runwayImg})` }}>
          {/* Single Moon Planet naturally positioned in the sky above the runway */}
          <div className="runway-single-moon">
            <img src={moonImg} alt="Moon" className="moon-planet-img" draggable="false" />
            <div className="moon-glow-aura" />
          </div>
        </div>
      </div>

      {/* High-contrast subtle vignette */}
      <div className="world-vignette" />
    </div>
  )
}
