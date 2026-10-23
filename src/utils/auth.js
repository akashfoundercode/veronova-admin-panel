const TOKEN_KEY = 'veronova_admin_token'
const USER_KEY = 'veronova_admin_user'

export const auth = {
  getToken: () => {
    try {
      return (
        localStorage.getItem(TOKEN_KEY) ||
        localStorage.getItem('admin_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('access_token') ||
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

  setAuth: (token, user) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token)
        localStorage.setItem('admin_token', token)
        localStorage.setItem('token', token)
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
        localStorage.setItem('admin_token', token)
        localStorage.setItem('token', token)
      }
    } catch (e) {
      console.warn('Failed to save token to localStorage:', e)
    }
  },

  clearAuth: () => {
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('admin_token')
      localStorage.removeItem('token')
      localStorage.removeItem('access_token')
      localStorage.removeItem(USER_KEY)
    } catch (e) {
      console.warn('Failed to clear auth:', e)
    }
  },

  isAuthenticated: () => {
    try {
      return Boolean(auth.getToken())
    } catch {
      return false
    }
  },
}

export default auth
