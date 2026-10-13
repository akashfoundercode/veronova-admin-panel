export const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

export const lerp = (a, b, t) => a + (b - a) * t

// Maps t (0..1) with an ease-out-cubic curve
export const easeOutCubic = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3)

// Maps t (0..1) with an ease-in-out-cubic curve
export const easeInOutCubic = (t) => {
  const c = clamp(t, 0, 1)
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2
}

// Smoothly approaches `target` from `current` — good for per-frame damping
export const damp = (current, target, smoothing, dt) =>
  lerp(current, target, 1 - Math.pow(smoothing, dt * 60))
