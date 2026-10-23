import auth from './auth'
import { BACKEND_BASE_URL } from '@/constants/api'

/**
 * Universal API Request Handler
 * - Injects Authorization: Bearer <token>
 * - Uses Vite dev proxy (relative paths like /api/... or /admin/...) to prevent CORS errors
 * - If relative fetch experiences a genuine network connection failure, tries direct backend
 * - Does NOT trigger CORS fallback if server responded with HTTP status (e.g. 401, 403, 404, 500)
 */
export async function apiRequest(endpoint, options = {}) {
  const token = auth.getToken()
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  // Ensure leading slash for proxy routing
  let url = endpoint
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = url.startsWith('/') ? url : `/${url}`
  }

  let response = null
  let isProxy = !url.startsWith('http://') && !url.startsWith('https://')

  try {
    response = await fetch(url, {
      ...options,
      headers,
    })
  } catch (netErr) {
    throw new Error(`Connection to backend failed. Please verify backend is running on port 3000: ${netErr.message}`)
  }

  // Parse response body
  const contentType = response.headers.get('content-type') || ''
  let data = null

  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => null)
  } else {
    const text = await response.text().catch(() => null)
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  // Check for unauthenticated or session expiry
  const msgLower = (data && typeof data === 'object' ? `${data.message || ''} ${data.error || ''} ${data.msg || ''}` : '').toLowerCase()
  const isAuthError =
    response.status === 401 ||
    response.status === 403 ||
    (data && typeof data === 'object' && (data.status === 401 || data.status === 403 || data.code === 401)) ||
    msgLower.includes('unauthenticated') ||
    msgLower.includes('token expired') ||
    msgLower.includes('token is expired') ||
    msgLower.includes('invalid token') ||
    msgLower.includes('jwt expired') ||
    msgLower.includes('session expired') ||
    msgLower.includes('token not provided') ||
    msgLower.includes('token has expired') ||
    msgLower.includes('unauthorized')

  const isLoginUrl = url.includes('/login') || url.includes('/admin/login')

  if (isAuthError && !isLoginUrl) {
    console.warn('[API Client] Session expired or unauthenticated. Clearing auth and redirecting to /login...')
    auth.clearAuth()
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
    const err = new Error(
      (data && typeof data === 'object' && (data.message || data.error || data.msg)) ||
      'Session expired. Please log in again.'
    )
    err.status = response.status || 401
    err.isAuthError = true
    err.data = data
    throw err
  }

  if (!response.ok) {
    const errorMsg =
      (data && typeof data === 'object' && (data.message || data.error || data.msg)) ||
      `HTTP ${response.status}: ${response.statusText}`

    const err = new Error(errorMsg)
    err.status = response.status
    err.data = data
    throw err
  }

  return data
}

export default apiRequest

