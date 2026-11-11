import auth from './auth'
import { BACKEND_BASE_URL } from '@/constants/api'

/**
 * Universal API Request Handler
 * - Injects Authorization: Bearer <token>
 * - Uses same-origin API paths so browsers do not need cross-origin CORS access
 * - Does NOT trigger CORS fallback if server responded with HTTP status (e.g. 401, 403, 404, 500)
 */
export async function apiRequest(endpoint, options = {}) {
  const { redirectOnAuthError = true, ...requestOptions } = options
  const token = auth.getToken()
  const isFormData = typeof FormData !== 'undefined' && requestOptions.body instanceof FormData
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = /^https?:\/\//i.test(endpoint)
    ? endpoint
    : `${BACKEND_BASE_URL}${path}`

  let response
  try {
    response = await fetch(url, {
      ...requestOptions,
      headers,
    })
  } catch (netErr) {
    throw new Error(`Connection to backend ${BACKEND_BASE_URL} failed: ${netErr.message}`)
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

  // Check for unauthenticated or session expiry (401 only, NOT 403 Forbidden)
  const msgLower = (data && typeof data === 'object' ? `${data.message || ''} ${data.error || ''} ${data.msg || ''}` : '').toLowerCase()
  const isAuthError =
    response.status === 401 ||
    (data && typeof data === 'object' && (data.status === 401 || data.code === 401)) ||
    msgLower.includes('unauthenticated') ||
    msgLower.includes('token expired') ||
    msgLower.includes('token is expired') ||
    msgLower.includes('invalid token') ||
    msgLower.includes('jwt expired') ||
    msgLower.includes('session expired') ||
    msgLower.includes('token not provided') ||
    msgLower.includes('token has expired')

  const isLoginUrl = url.includes('/login') || url.includes('/admin/login')

  if (isAuthError && !isLoginUrl) {
    if (redirectOnAuthError) {
      console.warn('[API Client] Session expired or unauthenticated. Clearing auth and redirecting to /login...')
      auth.clearAuth()
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    const err = new Error(
      (data && typeof data === 'object' && (data.message || data.error || data.msg)) ||
      'Session expired. Please log in again.'
    )
    err.status = 401
    err.isAuthError = true
    err.data = data
    throw err
  }

  // Handle 403 Permission Denied without logging out
  if (response.status === 403 || (data && typeof data === 'object' && data.status === 403)) {
    const errorMsg =
      (data && typeof data === 'object' && (data.message || data.error || data.msg)) ||
      'Permission denied. You do not have permission to perform this action.'
    const err = new Error(errorMsg)
    err.status = 403
    err.isPermissionError = true
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

  // Reject business-level failure inside HTTP 200 responses
  if (
    data &&
    typeof data === 'object' &&
    (data.success === false ||
      data.status === false ||
      (typeof data.status === 'number' && data.status >= 400 && data.status !== 200))
  ) {
    const errorMsg = data.message || data.error || data.msg || 'Business operation rejected by server.'
    const err = new Error(errorMsg)
    err.status = typeof data.status === 'number' ? data.status : 400
    err.isBusinessError = true
    err.data = data
    throw err
  }

  return data
}

export default apiRequest

