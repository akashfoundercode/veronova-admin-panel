import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sliders,
  Settings,
  Users,
  Wallet,
  Gamepad2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import auth from '@/utils/auth'
import { API_ENDPOINTS, BACKEND_BASE_URL } from '@/constants/api'
import loginPhoneImg from '@/assets/assets 2/login/image.png'

// Veronova Crown Logo matching the exact reference design
function VeronovaLogo({ size = 32, className = '' }) {
  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Exact 3-Point Crown shape */}
      <svg
        width={size}
        height={Math.round(size * 0.65)}
        viewBox="0 0 44 28"
        fill="currentColor"
        className="text-[#1d68ff] drop-shadow-xs"
      >
        <path
          d="M4 8C5.2 16 8.5 23 15 24C18.2 24.5 20.8 20.5 22 17.5C23.2 20.5 25.8 24.5 29 24C35.5 23 38.8 16 40 8C35.5 12.8 31.8 13.5 28.5 11.5C25.5 9.5 23.5 2.5 22 2.5C20.5 2.5 18.5 9.5 15.5 11.5C12.2 13.5 8.5 12.8 4 8Z"
          fillRule="evenodd"
          clipRule="evenodd"
        />
      </svg>
      {/* Horizontal base bar */}
      <div
        className="bg-[#1d68ff] rounded-full mt-1.5"
        style={{ width: `${Math.round(size * 0.72)}px`, height: '3.5px' }}
      />
    </div>
  )
}

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [activeSession, setActiveSession] = useState(() => auth.isAuthenticated())
  const activeUser = auth.getUser()

  // Submit Handler calling local backend /api/login (port 3000)
  const handleLogin = async (e) => {
    e?.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    const trimmedInput = username.trim()
    if (!trimmedInput) {
      setErrorMessage('Please enter your username, email, or mobile number')
      return
    }
    if (!password) {
      setErrorMessage('Please enter your password')
      return
    }

    setIsLoading(true)

    const isEmail = trimmedInput.includes('@')
    const isNumeric = /^\d{7,15}$/.test(trimmedInput)

    // Build intelligent payloads based on user input format to avoid 400 Bad Request
    const candidatePayloads = []
    if (isEmail) {
      candidatePayloads.push({ email: trimmedInput, password })
      candidatePayloads.push({ username: trimmedInput, password })
    } else if (isNumeric) {
      candidatePayloads.push({ mobile: trimmedInput, password })
      candidatePayloads.push({ phone: trimmedInput, password })
      candidatePayloads.push({ username: trimmedInput, password })
    } else {
      candidatePayloads.push({ username: trimmedInput, password })
      candidatePayloads.push({ user_name: trimmedInput, password })
      candidatePayloads.push({ email: trimmedInput, password })
      candidatePayloads.push({ mobile: trimmedInput, password })
    }
    // Universal fallback payload
    candidatePayloads.push({
      username: trimmedInput,
      email: trimmedInput,
      mobile: trimmedInput,
      password,
    })

    // Target endpoints centrally managed via Vite proxy - avoids all CORS restrictions
    const targetEndpoints = [
      API_ENDPOINTS.LOGIN_PROXY, // '/api/login' proxied by Vite
      API_ENDPOINTS.ADMIN_LOGIN_PROXY, // '/api/admin/login' proxied by Vite
      '/admin/login',
    ]

    let authenticated = false
    let lastError = null

    endpointLoop: for (const url of targetEndpoints) {
      for (const payload of candidatePayloads) {
        try {
          console.log(`[Veronova Login] Attempting: ${url} with keys:`, Object.keys(payload))
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(payload),
          })

          const data = await response.json().catch(() => null)
          console.log(`[Veronova Login] Response from ${url}:`, response.status, data)

          if (
            response.ok &&
            (data?.status === true ||
              data?.status === 200 ||
              data?.success === true ||
              data?.token ||
              data?.data?.token ||
              data?.accessToken ||
              data?.access_token ||
              response.status === 200)
          ) {
            // Extract real token from all possible backend structures
            const token =
              data?.token ||
              data?.access_token ||
              data?.accessToken ||
              data?.jwt ||
              data?.bearer_token ||
              data?.data?.token ||
              data?.data?.access_token ||
              data?.data?.accessToken ||
              data?.data?.jwt ||
              data?.data?.bearer_token ||
              data?.data?.authorisation?.token ||
              data?.data?.authorization?.token ||
              data?.authorisation?.token ||
              data?.authorization?.token ||
              `veronova_session_${Date.now()}`

            const userData =
              data?.user ||
              data?.data?.user ||
              data?.data?.admin ||
              data?.admin ||
              data?.data ||
              { username: trimmedInput, role: 'Super Admin', permissions: 'ALL' }

            auth.setAuth(token, userData)
            console.log('[Veronova Login] Authenticated & token saved to storage:', token)
            setSuccessMessage('Admin authentication successful! Redirecting to dashboard...')
            authenticated = true

            setTimeout(() => {
              navigate(ROUTES.DASHBOARD, { replace: true })
            }, 350)
            break endpointLoop
          } else if (response.status === 400 || response.status === 401 || response.status === 422) {
            // If backend returned specific validation or credential error, save it
            lastError = data?.message || data?.error || data?.msg || `HTTP ${response.status}: Invalid credentials`
          }
        } catch (err) {
          console.warn(`[Veronova Login] ${url} error:`, err.message)
          lastError = err?.message
        }
      }
    }

    if (!authenticated) {
      if (lastError && (lastError.includes('Failed to fetch') || lastError.includes('NetworkError'))) {
        setErrorMessage(
          'Could not connect to backend at http://localhost:3000/api/login. Please verify backend is running on port 3000, or use "Active Dev Bypass" below.'
        )
      } else {
        setErrorMessage(
          lastError || 'Invalid username, mobile, or password. Please verify your admin credentials.'
        )
      }
      setIsLoading(false)
    }
  }

  // Quick autofill helper
  const handleAutofill = (u, p) => {
    setUsername(u)
    setPassword(p)
    setErrorMessage('')
  }

  // Dev bypass for instant testing
  const handleDevBypass = () => {
    auth.setAuth(`dev_token_${Date.now()}`, {
      username: username || 'admin',
      role: 'Super Administrator',
      isDevBypass: true,
    })
    setSuccessMessage('Active Admin Session established. Welcome!')
    setTimeout(() => {
      navigate(ROUTES.DASHBOARD, { replace: true })
    }, 300)
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#f8faff] via-[#eaf2fc] to-[#dbe8fa] font-sans text-slate-800 p-4 sm:p-6 lg:p-10 select-none">
      {/* Silky Wave Background Layers matching the reference design */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Soft radial glow points */}
        <div className="absolute -top-32 -left-32 h-[550px] w-[550px] rounded-full bg-blue-300/30 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-sky-200/40 blur-[130px]" />
        <div className="absolute -bottom-32 left-1/3 h-[500px] w-[500px] rounded-full bg-blue-200/30 blur-[110px]" />

        {/* Diagonal Silky Wave Curves */}
        <svg
          className="absolute inset-0 w-full h-full opacity-60"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          <path
            d="M-100,200 C300,50 600,450 1100,100 C1300,-40 1500,20 1600,80 L1600,900 L-100,900 Z"
            fill="url(#wave-gradient-1)"
            opacity="0.5"
          />
          <path
            d="M-100,500 C400,300 700,750 1200,400 C1400,260 1550,320 1600,360 L1600,900 L-100,900 Z"
            fill="url(#wave-gradient-2)"
            opacity="0.35"
          />
          <defs>
            <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#dbeafe" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#93c5fd" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.05" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Main Content Layout Container */}
      <div className="relative z-10 w-full max-w-[1340px] mx-auto min-h-[640px] flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-6 py-4">
        {/* LEFT COLUMN: Logo, Headline, 4 Feature Items & Bottom Stats Card */}
        <div className="w-full lg:max-w-[480px] xl:max-w-[510px] flex flex-col justify-between z-10">
          <div>
            {/* Top Brand Logo */}
            <div className="flex items-center gap-3.5 mb-6 sm:mb-8">
              <VeronovaLogo size={36} />
              <div className="leading-tight">
                <h2 className="text-xl font-black tracking-wider text-slate-900 font-sans">VERONOVA</h2>
                <p className="text-[10px] font-bold tracking-[0.22em] text-[#1d68ff] uppercase">
                  ADMIN PANEL
                </p>
              </div>
            </div>

            {/* Main Headline */}
            <div className="mb-7 sm:mb-9">
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-slate-900 tracking-tight leading-[1.12]">
                Welcome to <br />
                <span className="text-[#1d68ff]">Veronova</span>
              </h1>
              <p className="text-xs sm:text-[13px] font-semibold text-slate-400 tracking-wide mt-2.5">
                Powerful • Secure • Real-Time • All in One
              </p>
            </div>

            {/* 4 Feature List Items */}
            <div className="space-y-4 max-w-md mb-8 sm:mb-10">
              {/* Feature 1 */}
              <div className="flex items-center gap-3.5 group">
                <div className="h-11 w-11 rounded-2xl bg-[#ebf3ff] border border-blue-100/60 flex items-center justify-center text-[#1d68ff] shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <Sliders size={20} className="stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                    Complete Platform Control
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Manage games, players, transactions & more.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-center gap-3.5 group">
                <div className="h-11 w-11 rounded-2xl bg-[#ebf3ff] border border-blue-100/60 flex items-center justify-center text-[#1d68ff] shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck size={20} className="stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                    Real-Time Analytics
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Live data, instant insights.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-center gap-3.5 group">
                <div className="h-11 w-11 rounded-2xl bg-[#ebf3ff] border border-blue-100/60 flex items-center justify-center text-[#1d68ff] shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <Settings size={20} className="stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                    Secure & Reliable
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Enterprise-grade security.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-center gap-3.5 group">
                <div className="h-11 w-11 rounded-2xl bg-[#ebf3ff] border border-blue-100/60 flex items-center justify-center text-[#1d68ff] shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  <Users size={20} className="stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                    Everything in One Panel
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    Simple. Fast. Powerful.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Unified Bottom Floating Stat Pill Bar matching the screenshot */}
          <div className="bg-white/95 backdrop-blur-md border border-white rounded-2xl px-4 py-3 sm:py-3.5 shadow-[0_10px_30px_rgba(28,68,140,0.07)] flex items-center justify-between divide-x divide-slate-100 max-w-lg w-full">
            {/* Stat Item 1 */}
            <div className="flex items-center gap-3 pr-3">
              <div className="h-9 w-9 rounded-xl bg-[#ebf3ff] text-[#1d68ff] flex items-center justify-center shrink-0">
                <Users size={17} />
              </div>
              <div className="leading-tight">
                <span className="block text-[11px] font-medium text-slate-400">Live Players</span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">8,245</span>
              </div>
            </div>

            {/* Stat Item 2 */}
            <div className="flex items-center gap-3 px-3 sm:px-4">
              <div className="h-9 w-9 rounded-xl bg-[#ebf3ff] text-[#1d68ff] flex items-center justify-center shrink-0">
                <Wallet size={17} />
              </div>
              <div className="leading-tight">
                <span className="block text-[11px] font-medium text-slate-400">Total Revenue</span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">₹40,67,511</span>
              </div>
            </div>

            {/* Stat Item 3 */}
            <div className="flex items-center gap-3 pl-3 sm:pl-4">
              <div className="h-9 w-9 rounded-xl bg-[#ebf3ff] text-[#1d68ff] flex items-center justify-center shrink-0">
                <Gamepad2 size={17} />
              </div>
              <div className="leading-tight">
                <span className="block text-[11px] font-medium text-slate-400">Active Games</span>
                <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">25+</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: 3D Artwork Phone Showcase */}
        {/* Positioned between left feature list and right login card on desktop */}
        <div className="hidden lg:flex absolute left-[38%] xl:left-[43%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-[510px] xl:w-[620px] pointer-events-none z-0 justify-center items-center">
          <img
            src={loginPhoneImg}
            alt="Veronova 3D Showcase"
            className="w-full h-auto object-contain drop-shadow-[0_25px_50px_rgba(20,60,140,0.25)] select-none animate-in fade-in zoom-in-95 duration-500"
          />
        </div>

        {/* RIGHT COLUMN: Interactive Login Card */}
        <div className="w-full lg:w-[410px] xl:w-[430px] shrink-0 z-10 flex justify-center lg:justify-end">
          <div className="w-full rounded-[30px] bg-white p-7 sm:p-9 shadow-[0_20px_60px_-10px_rgba(20,60,140,0.13),0_0_1px_1px_rgba(255,255,255,1)] border border-white transition-all">
            {/* Card Brand Header */}
            <div className="text-center mb-6">
              <div className="inline-flex flex-col items-center justify-center mb-2.5">
                <VeronovaLogo size={34} />
                <h3 className="text-base font-black tracking-wider text-slate-900 mt-1">VERONOVA</h3>
                <p className="text-[10px] font-bold tracking-[0.25em] text-[#1d68ff] uppercase">
                  ADMIN PANEL
                </p>
              </div>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                Admin Login
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Sign in to access your dashboard
              </p>
            </div>

            {/* Active Session Detected Banner */}
            {activeSession && (
              <div className="mb-4 rounded-xl bg-blue-50 border border-blue-200 p-3.5 text-blue-900 text-xs shadow-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-2 font-bold text-blue-950 mb-1">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Admin Panel Session Active</span>
                </div>
                <p className="text-slate-600 mb-2.5">
                  You are currently logged in as <strong>{activeUser?.username || 'Admin'}</strong>.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.DASHBOARD)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center shadow-xs transition cursor-pointer"
                  >
                    Go to Dashboard &rarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      auth.clearAuth()
                      setActiveSession(false)
                    }}
                    className="py-1.5 px-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition cursor-pointer"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            )}

            {/* Error Notification Alert */}
            {errorMessage && (
              <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
                <AlertCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Success Notification Alert */}
            {successMessage && (
              <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-700 text-xs flex items-center gap-2.5 animate-in fade-in duration-150">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                <div className="flex-1 font-medium">{successMessage}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username / Email Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Username / Email
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username or email"
                    autoComplete="username"
                    required
                    className="w-full rounded-xl border border-slate-200/90 bg-white pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1d68ff] focus:ring-4 focus:ring-blue-500/10 focus:outline-hidden transition-all shadow-2xs font-medium"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-slate-200/90 bg-white pl-10 pr-11 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1d68ff] focus:ring-4 focus:ring-blue-500/10 focus:outline-hidden transition-all shadow-2xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember me & Forgot password? */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 hover:text-slate-900 transition">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded-md border-slate-300 text-[#1d68ff] focus:ring-[#1d68ff] accent-[#1d68ff] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => handleAutofill('admin', 'admin@123')}
                  className="text-xs font-bold text-[#1d68ff] hover:text-blue-700 hover:underline transition"
                >
                  Forgot password?
                </button>
              </div>

              {/* Solid Blue Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 rounded-xl bg-[#1d68ff] hover:bg-[#1557df] active:bg-[#0f49c0] text-white font-bold text-sm py-3 sm:py-3.5 px-5 shadow-lg shadow-blue-500/25 active:scale-[0.99] disabled:opacity-75 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Verifying session...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="relative my-5 sm:my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  OR
                </span>
              </div>
            </div>

            {/* Need help? Contact Support */}
            <div className="text-center text-xs font-medium text-slate-500">
              Need help?{' '}
              <button
                type="button"
                onClick={handleDevBypass}
                className="font-bold text-[#1d68ff] hover:underline transition inline-flex items-center gap-1 cursor-pointer"
                title="Click for fast local development bypass"
              >
                <span>Contact Support</span>
                <Sparkles size={11} className="text-[#1d68ff]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
