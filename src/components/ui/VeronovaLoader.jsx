import React from 'react'
import { Crown } from 'lucide-react'

/**
 * Premium Veronova Branded Loader
 *
 * @param {'sm' | 'md' | 'lg'} size - Dimensions of loader
 * @param {'section' | 'fullScreen' | 'inline'} variant - Layout style
 * @param {string} text - Primary loading message
 * @param {string} subtitle - Secondary branding or status text
 * @param {string} className - Additional CSS classes
 */
export default function VeronovaLoader({
  size = 'md',
  variant = 'section',
  text = 'Loading...',
  subtitle = 'VERONOVA GAMING SUITE',
  className = '',
}) {
  // Inline miniature version
  if (variant === 'inline') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <div className="relative flex h-5 w-5 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
          <Crown size={10} className="text-blue-600" fill="currentColor" />
        </div>
        {text && <span className="text-xs font-semibold text-slate-600">{text}</span>}
      </div>
    )
  }

  // Size configurations
  const dimensions = {
    sm: {
      ring: 'h-14 w-14',
      icon: 20,
      title: 'text-xs tracking-[0.2em]',
      sub: 'text-[10px]',
      bar: 'w-24 h-0.5',
    },
    md: {
      ring: 'h-20 w-20',
      icon: 28,
      title: 'text-sm tracking-[0.26em]',
      sub: 'text-[11px]',
      bar: 'w-36 h-1',
    },
    lg: {
      ring: 'h-28 w-28',
      icon: 40,
      title: 'text-base tracking-[0.3em]',
      sub: 'text-xs',
      bar: 'w-48 h-1.5',
    },
  }[size] || dimensions.md

  const content = (
    <div className="flex flex-col items-center justify-center text-center select-none py-6">
      {/* Animated Emblem Container */}
      <div className="relative flex items-center justify-center mb-4">
        {/* Ambient Pulsing Glow behind emblem */}
        <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-blue-600/25 via-sky-400/25 to-indigo-600/25 blur-xl animate-pulse" />

        {/* Outer Rotating Gradient Ring with Orbiting Jewel */}
        <div className={`relative ${dimensions.ring} flex items-center justify-center`}>
          <svg className="absolute inset-0 h-full w-full animate-spin" style={{ animationDuration: '2.5s' }} viewBox="0 0 100 100">
            <defs>
              <linearGradient id="veronova-loader-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="1" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="url(#veronova-loader-grad)"
              strokeWidth="4"
              strokeDasharray="180 100"
              strokeLinecap="round"
            />
          </svg>

          {/* Inner Counter-Rotating Accent Ring */}
          <svg className="absolute inset-2 h-[calc(100%-16px)] w-[calc(100%-16px)] animate-spin" style={{ animationDuration: '3.8s', animationDirection: 'reverse' }} viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="#93c5fd"
              strokeWidth="2"
              strokeDasharray="40 140"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>

          {/* Central Glass Capsule housing the Veronova Crown */}
          <div className="relative flex h-[75%] w-[75%] items-center justify-center rounded-2xl bg-white shadow-md border border-blue-100/90 overflow-hidden group">
            {/* Subtle light sweep reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/70 via-white to-sky-50/40 pointer-events-none" />

            {/* Glowing Crown Icon */}
            <div className="relative z-10 transition-transform duration-300">
              <Crown
                size={dimensions.icon}
                className="text-blue-600 filter drop-shadow-[0_2px_8px_rgba(37,99,235,0.35)] animate-bounce"
                style={{ animationDuration: '2s' }}
                fill="currentColor"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Veronova Brand Heading with Shimmer Effect */}
      <div className="space-y-1">
        <h3 className={`font-black ${dimensions.title} text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-sky-500 to-blue-800 drop-shadow-2xs`}>
          VERONOVA
        </h3>

        {/* Dynamic Status / Loading Message */}
        {text && (
          <p className={`font-semibold text-slate-600 ${dimensions.sub} tracking-wide`}>
            {text}
          </p>
        )}

        {/* Secondary Subtitle */}
        {subtitle && (
          <p className="text-[10px] font-bold text-blue-400 tracking-[0.2em] uppercase">
            {subtitle}
          </p>
        )}
      </div>

      {/* Futuristic Indeterminate Beam Progress Track */}
      <div className={`mt-3.5 ${dimensions.bar} rounded-full bg-slate-100 overflow-hidden relative border border-slate-200/50 shadow-inner`}>
        <div
          className="absolute inset-y-0 w-1/2 rounded-full bg-gradient-to-r from-transparent via-blue-600 to-sky-400"
          style={{
            animation: 'veronovaBeam 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          }}
        />
      </div>
    </div>
  )

  // Fullscreen overlay variant
  if (variant === 'fullScreen') {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md transition-all animate-in fade-in duration-200 ${className}`}
      >
        <div className="rounded-3xl bg-white/95 px-8 py-7 shadow-2xl border border-white/80 max-w-sm w-full mx-4">
          {content}
        </div>
      </div>
    )
  }

  // Section / card embedded variant
  return (
    <div className={`w-full flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-xs p-6 ${className}`}>
      {content}
    </div>
  )
}

