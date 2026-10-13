import { buildTrailPath } from '../utils/flightPath'

export default function FlightPath({ points, active }) {
  const d = buildTrailPath(points)
  if (!d) return null

  return (
    <svg className="flight-path" preserveAspectRatio="none">
      <defs>
        <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--accent-red)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity={active ? 0.9 : 0.3} />
        </linearGradient>
        <filter id="trailGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d={d}
        fill="none"
        stroke="url(#trailGradient)"
        strokeWidth="3.5"
        strokeLinecap="round"
        filter="url(#trailGlow)"
      />
    </svg>
  )
}
