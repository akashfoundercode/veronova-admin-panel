import React from 'react'
import jetImg from '../assets/plane.png'
import backWheelImg from '../assets/back-wheel.png'
import frontWheelImg from '../assets/front-wheel.png'

export default function AviatorPlane({
  rotation = 0,
  isFlying = true,
  retract = 0,
  vibration = 0,
  isGroundRolling = false,
}) {
  const t = Math.min(1, Math.max(0, retract))
  // Smooth ease-in for wheels tucking cleanly into plane belly
  const eased = t * t * (3 - 2 * t)

  // Wheel travels slightly up into belly while quickly fading out so it never peaks out the top
  const wheelStyle = (travel, scaleMin) => ({
    transform: `translateY(${-travel * eased}%) scale(${1 - (1 - scaleMin) * eased})`,
    opacity: Math.max(0, 1 - eased * 1.7),
  })

  const isAirborne = isFlying && retract > 0.05

  return (
    <div
      className="aviator-plane-wrapper"
      style={{
        transform: `rotate(${rotation}deg) translateX(${vibration}px)`,
      }}
    >
      {/* Afterburner Thruster Flame & Realistic Booster Plume */}
      {isFlying && (
        <div className={`jet-exhaust-container ${isAirborne ? 'is-booster-active' : ''}`}>
          {/* Continuous Smoke Plume Trail from Engine */}
          <div className="exhaust-smoke-trail" aria-hidden="true">
            <span className="exhaust-smoke-particle smk-1" />
            <span className="exhaust-smoke-particle smk-2" />
            <span className="exhaust-smoke-particle smk-3" />
            <span className="exhaust-smoke-particle smk-4" />
          </div>

          {/* Fiery Outer Plasma & Heat Distortion Glow */}
          <div className="jet-exhaust-glow" />
          <div className="jet-exhaust-outer-fire" />

          {/* Main Incandescent Thrust Flame */}
          <div className="jet-exhaust-flame" />

          {/* Ultra Hot Inner Mach Diamonds & White Core */}
          <div className="jet-exhaust-core" />
          {isAirborne && <div className="jet-exhaust-shockdiamonds" />}
        </div>
      )}

      {/* Runway Ground Roll Tire Smoke Emitter */}
      {isGroundRolling && (
        <div className="tire-smoke-layer" aria-hidden="true">
          <span className="tire-smoke-puff puff-1" />
          <span className="tire-smoke-puff puff-2" />
          <span className="tire-smoke-puff puff-3" />
        </div>
      )}

      {/* Retractable Landing Gear Wheels */}
      {eased < 0.999 && (
        <div className="jet-wheels-layer">
          <div className="wheel-anchor wheel-anchor--main" style={wheelStyle(35, 0.4)}>
            <img
              src={backWheelImg}
              alt="Back Wheel"
              className="wheel-sprite wheel-sprite--main"
              draggable="false"
            />
          </div>
          <div className="wheel-anchor wheel-anchor--nose" style={wheelStyle(38, 0.4)}>
            <img
              src={frontWheelImg}
              alt="Front Wheel"
              className="wheel-sprite wheel-sprite--nose"
              draggable="false"
            />
          </div>
        </div>
      )}

      {/* Main Jet Airframe PNG */}
      <div className="jet-body-layer">
        <img
          src={jetImg}
          alt="Aviator Jet"
          className="jet-sprite-img"
          draggable="false"
        />
      </div>
    </div>
  )
}
