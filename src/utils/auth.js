const TOKEN_KEY = 'veronova_admin_token'
const USER_KEY = 'veronova_admin_user'
const LOGIN_TOKEN_KEY = 'login_token'

export const auth = {
  getToken: () => {
    try {
      return (
        localStorage.getItem(TOKEN_KEY) ||
        localStorage.getItem('adminToken') ||
        localStorage.getItem('admin_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('access_token') ||
        null
      )
    } catch {
      return null
    }
  },

  getLoginToken: () => {
    try {
      return (
        localStorage.getItem(LOGIN_TOKEN_KEY) ||
        localStorage.getItem('veronova_login_token') ||
        null
      )
    } catch {
      return null
    }
  },

  getUser: () => {
    try {
      const data = localStorage.getItem(USER_KEY)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  },

  setAuth: (token, user, loginToken = null) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token)
        localStorage.setItem('adminToken', token)
        localStorage.setItem('admin_token', token)
        localStorage.setItem('token', token)
      }
      if (loginToken) {
        localStorage.setItem(LOGIN_TOKEN_KEY, loginToken)
        localStorage.setItem('veronova_login_token', loginToken)
      } else if (user?.login_token) {
        localStorage.setItem(LOGIN_TOKEN_KEY, user.login_token)
        localStorage.setItem('veronova_login_token', user.login_token)
      }
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user))
      }
    } catch (e) {
      console.warn('Failed to save auth to localStorage:', e)
    }
  },

  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token)
        localStorage.setItem('adminToken', token)
        localStorage.setItem('admin_token', token)
        localStorage.setItem('token', token)
      }
    } catch (e) {
      console.warn('Failed to save token to localStorage:', e)
    }
  },

  clearAuth: () => {
    try {
      const keysToRemove = [
        TOKEN_KEY,
        'adminToken',
        'admin_token',
        'token',
        'access_token',
        LOGIN_TOKEN_KEY,
        'veronova_login_token',
        USER_KEY,
        'veronova_deposits_v1',
        'veronova_withdrawals_v1',
        'veronova_players_v1',
        'veronova_support_v1',
        'veronova_fund_transfers_v1',
        'veronova_salary_v1',
        'horse_forced_winner',
      ]
      keysToRemove.forEach((k) => localStorage.removeItem(k))
    } catch (e) {
      console.warn('Failed to clear auth:', e)
    }
  },

  isAuthenticated: () => {
    try {
      const token = auth.getToken()
      if (!token || typeof token !== 'string' || token.startsWith('dev_token_') || token.startsWith('veronova_session_')) {
        return false
      }
      return true
    } catch {
      return false
    }
  },
}

export default auth
