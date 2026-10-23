import { useState, useMemo, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, UserCheck, UserPlus, TrendingUp, Wallet, Landmark, Banknote, HandCoins, Receipt, MessageCircle,
  Gamepad2, Percent, Ban, Scale, LineChart as LineIcon, TrendingDown, MessageSquareText, BarChart3,
  Layers, RefreshCw, AlertCircle, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar,
} from 'recharts'
import welcomeBg from '@/assets/images/image.png'
import VeronovaLoader from '@/components/ui/VeronovaLoader'
import auth from '@/utils/auth'
import { apiRequest } from '@/utils/apiClient'
import { API_ENDPOINTS } from '@/constants/api'

// Currency & Number Formatting Helpers
const formatINR = (val) => {
  const num = Number(val) || 0
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

const formatNumber = (val) => {
  const num = Number(val) || 0
  return new Intl.NumberFormat('en-IN').format(num)
}

const formatDateLabel = (dateStr) => {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  } catch {
    return dateStr
  }
}

// Generate dynamic sparklines based on metric trend
const generateSparkData = (trend, seed = 5) => {
  return Array.from({ length: 12 }, (_, i) => {
    let base = 20 + ((seed * (i + 2) * 5) % 15)
    if (trend === 'up') base += i * 2.5
    else if (trend === 'down') base += (12 - i) * 2.5
    return { v: Math.max(5, Math.round(base)) }
  })
}

const theme = {
  blue: ['bg-blue-100 text-blue-600', '#2563eb'],
  green: ['bg-emerald-100 text-emerald-600', '#10b981'],
  purple: ['bg-purple-100 text-purple-600', '#8b5cf6'],
  orange: ['bg-amber-100 text-amber-600', '#f59e0b'],
  red: ['bg-rose-100 text-rose-600', '#ef4444'],
}

// Default baseline data in case backend is loading or unavailable
const DEFAULT_DATA = {
  counts: {
    total_player: 8,
    total_turnover: 141349,
    total_deposit: 4067511,
    total_withdrawal: 0,
    otp_pack_balance: 4955,
    total_commission: 0,
    total_games: 25,
    feedbacks: 0,
    chicken_road_admin_profit: 0,
    chicken_road_admin_loss: 128259.9,
    aviator_admin_profit: 10683.15,
    aviator_admin_loss: 0,
    active_player: 8,
    today_user: 0,
    today_turnover: 0,
    today_deposit: 0,
    today_withdrawal: 0,
    pending_withdrawal: 2,
    pending_deposit: 12,
    illegal_betters: 2,
    demo_users: 0,
  },
  metrics: {
    totalRevenue: { value: 4067511, changePercent: 0, trend: 'flat' },
    totalPlayer: { value: 8, changePercent: 0, trend: 'flat' },
    activePlayer: { value: 8, changePercent: 0, trend: 'flat' },
    todayUser: { value: 0, changePercent: 0, trend: 'flat' },
    todayTurnover: { value: 0, changePercent: 0, trend: 'flat' },
    totalTurnover: { value: 141349, changePercent: 14962.7, trend: 'up' },
    totalDeposit: { value: 4067511, changePercent: 0, trend: 'flat' },
    todayDeposit: { value: 0, changePercent: 0, trend: 'flat' },
    totalWithdrawal: { value: 0, changePercent: 0, trend: 'flat' },
    todayWithdrawal: { value: 0, changePercent: 0, trend: 'flat' },
    feedbacks: { value: 0, changePercent: 0, trend: 'flat' },
    totalGames: { value: 25, changePercent: 0, trend: 'flat' },
    totalCommission: { value: 0, changePercent: 0, trend: 'flat' },
    demoUsers: { value: 0, changePercent: 0, trend: 'flat' },
    illegalBetters: { value: 2, changePercent: 0, trend: 'flat' },
    pendingDeposit: { value: 12, changePercent: -100, trend: 'down' },
    pendingWithdrawal: { value: 2, changePercent: -100, trend: 'down' },
    chickenRoadAdminProfit: { value: 0, changePercent: -100, trend: 'down' },
    chickenRoadAdminLoss: { value: 128259.9, changePercent: 0, trend: 'flat' },
    aviatorAdminProfit: { value: 10683.15, changePercent: -79.39, trend: 'down' },
    aviatorAdminLoss: { value: 0, changePercent: 0, trend: 'flat' },
    otpPackBalance: { value: 4955, changePercent: 0, trend: 'flat' },
  },
  charts: {
    turnoverOverview: [
      { date: '2026-10-08', value: 0 },
      { date: '2026-10-09', value: 21 },
      { date: '2026-10-10', value: 0 },
      { date: '2026-10-11', value: 0 },
      { date: '2026-10-12', value: 0 },
      { date: '2026-10-13', value: 0 },
      { date: '2026-10-14', value: 0 },
    ],
    depositVsWithdrawal: {
      deposits: [
        { date: '2026-10-08', value: 0 },
        { date: '2026-10-09', value: 0 },
        { date: '2026-10-10', value: 0 },
        { date: '2026-10-11', value: 0 },
        { date: '2026-10-12', value: 0 },
        { date: '2026-10-13', value: 0 },
        { date: '2026-10-14', value: 0 },
      ],
      withdrawals: [
        { date: '2026-10-08', value: 0 },
        { date: '2026-10-09', value: 0 },
        { date: '2026-10-10', value: 0 },
        { date: '2026-10-11', value: 0 },
        { date: '2026-10-12', value: 0 },
        { date: '2026-10-13', value: 0 },
        { date: '2026-10-14', value: 0 },
      ],
    },
    playerGrowth: [
      { date: '2026-10-08', value: 0 },
      { date: '2026-10-09', value: 0 },
      { date: '2026-10-10', value: 0 },
      { date: '2026-10-11', value: 0 },
      { date: '2026-10-12', value: 0 },
      { date: '2026-10-13', value: 0 },
      { date: '2026-10-14', value: 0 },
    ],
  },
}

// Single Stat Metric Card Component
function StatCard({ label, value, changePercent, trend = 'flat', color = 'blue', Icon, index }) {
  const [cls, hex] = theme[color] || theme.blue
  const isZero = changePercent === 0 || !changePercent
  const isNeg = changePercent < 0

  return (
    <div className="card bg-white min-w-0 p-3 rounded-xl border border-slate-200/70 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${cls}`}>
            <Icon size={15} />
          </div>
          <span className="truncate text-xs font-semibold text-slate-600" title={label}>
            {label}
          </span>
        </div>

        {/* Change Badge */}
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold flex items-center gap-0.5 ${
            isZero
              ? 'bg-slate-100 text-slate-500'
              : isNeg
              ? 'bg-rose-50 text-rose-600'
              : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          {isZero ? (
            <Minus size={9} />
          ) : isNeg ? (
            <ArrowDownRight size={10} />
          ) : (
            <ArrowUpRight size={10} />
          )}
          <span>{Math.abs(changePercent || 0)}%</span>
        </span>
      </div>

      <div className="flex items-baseline justify-between gap-2 mt-2 pt-1 border-t border-slate-100/80">
        <div className="text-base sm:text-lg font-bold whitespace-nowrap text-slate-900 tracking-tight font-mono">
          {value}
        </div>
        <div className="h-5 w-14 shrink-0 opacity-80 hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={generateSparkData(trend, index)}>
              <defs>
                <linearGradient id={`spark-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={hex} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={hex} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={hex}
                strokeWidth={1.75}
                fill={`url(#spark-${index})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(DEFAULT_DATA)
  const [selectedPeriod, setSelectedPeriod] = useState('7d')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Fetch Dashboard API from central endpoint
  const loadDashboard = useCallback(async (periodKey = '7d', isManual = false) => {
    if (!auth.isAuthenticated()) {
      navigate('/login', { replace: true })
      return
    }

    if (isManual) setIsRefreshing(true)
    else setIsLoading(true)
    setApiError(null)

    try {
      // Calls central /admin/dashboard?period=... via proxy with direct localhost fallback
      const endpoint = `${API_ENDPOINTS.DASHBOARD_PROXY}?period=${periodKey}`
      console.log(`[Veronova Dashboard] Fetching data for period ${periodKey} from:`, endpoint)

      const json = await apiRequest(endpoint, { method: 'GET' })

      if (json && (json.status === 200 || json.data)) {
        const payload = json.data || json
        setDashboardData((prev) => ({
          ...prev,
          ...payload,
          counts: { ...prev.counts, ...(payload.counts || {}) },
          metrics: { ...prev.metrics, ...(payload.metrics || {}) },
          charts: { ...prev.charts, ...(payload.charts || {}) },
        }))
        setLastUpdated(new Date().toLocaleTimeString())
        console.log('[Veronova Dashboard] Data successfully updated from API')
      } else {
        throw new Error(json?.message || 'Unexpected response format')
      }
    } catch (err) {
      console.warn('[Veronova Dashboard] Dashboard sync failed or session out. Redirecting to /login:', err.message)
      auth.clearAuth()
      window.location.href = '/login'
      return
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [navigate])

  // Initial mount & period change effect
  useEffect(() => {
    loadDashboard(selectedPeriod)
  }, [selectedPeriod, loadDashboard])

  const counts = dashboardData.counts || {}
  const metrics = dashboardData.metrics || {}
  const charts = dashboardData.charts || {}

  // Construct structured category metrics matching API values
  const structuredCategories = useMemo(() => {
    return [
      {
        id: 'TOTALS',
        label: 'Overall Platform Totals',
        badge: 'Core Ledger',
        stats: [
          {
            label: 'Total Player',
            value: formatNumber(metrics.totalPlayer?.value ?? counts.total_player),
            changePercent: metrics.totalPlayer?.changePercent ?? 0,
            trend: metrics.totalPlayer?.trend ?? 'flat',
            color: 'blue',
            Icon: Users,
          },
          {
            label: 'Total Turnover',
            value: formatINR(metrics.totalTurnover?.value ?? counts.total_turnover),
            changePercent: metrics.totalTurnover?.changePercent ?? 14962.7,
            trend: metrics.totalTurnover?.trend ?? 'up',
            color: 'purple',
            Icon: Wallet,
          },
          {
            label: 'Total Deposit',
            value: formatINR(metrics.totalDeposit?.value ?? counts.total_deposit),
            changePercent: metrics.totalDeposit?.changePercent ?? 0,
            trend: metrics.totalDeposit?.trend ?? 'flat',
            color: 'blue',
            Icon: Landmark,
          },
          {
            label: 'Total Withdrawal',
            value: formatINR(metrics.totalWithdrawal?.value ?? counts.total_withdrawal),
            changePercent: metrics.totalWithdrawal?.changePercent ?? 0,
            trend: metrics.totalWithdrawal?.trend ?? 'flat',
            color: 'red',
            Icon: HandCoins,
          },
          {
            label: 'Total Commission',
            value: formatINR(metrics.totalCommission?.value ?? counts.total_commission),
            changePercent: metrics.totalCommission?.changePercent ?? 0,
            trend: metrics.totalCommission?.trend ?? 'flat',
            color: 'blue',
            Icon: Percent,
          },
          {
            label: 'Total Games',
            value: formatNumber(metrics.totalGames?.value ?? counts.total_games),
            changePercent: metrics.totalGames?.changePercent ?? 0,
            trend: metrics.totalGames?.trend ?? 'flat',
            color: 'purple',
            Icon: Gamepad2,
          },
          {
            label: 'Feedbacks',
            value: formatNumber(metrics.feedbacks?.value ?? counts.feedbacks),
            changePercent: metrics.feedbacks?.changePercent ?? 0,
            trend: metrics.feedbacks?.trend ?? 'flat',
            color: 'blue',
            Icon: MessageCircle,
          },
          {
            label: 'Otp Pack Balance',
            value: formatNumber(metrics.otpPackBalance?.value ?? counts.otp_pack_balance),
            changePercent: metrics.otpPackBalance?.changePercent ?? 0,
            trend: metrics.otpPackBalance?.trend ?? 'flat',
            color: 'red',
            Icon: MessageSquareText,
          },
        ],
      },
      {
        id: 'GAMES',
        label: 'Game Engines & P/L Breakdown',
        badge: 'Casino & Crash',
        stats: [
          {
            label: 'Chicken Road Admin Profit',
            value: formatINR(metrics.chickenRoadAdminProfit?.value ?? counts.chicken_road_admin_profit),
            changePercent: metrics.chickenRoadAdminProfit?.changePercent ?? -100,
            trend: metrics.chickenRoadAdminProfit?.trend ?? 'down',
            color: 'green',
            Icon: Scale,
          },
          {
            label: 'Chicken Road Admin Loss',
            value: formatINR(metrics.chickenRoadAdminLoss?.value ?? counts.chicken_road_admin_loss),
            changePercent: metrics.chickenRoadAdminLoss?.changePercent ?? 0,
            trend: metrics.chickenRoadAdminLoss?.trend ?? 'flat',
            color: 'red',
            Icon: Scale,
          },
          {
            label: 'Aviator Admin Profit',
            value: formatINR(metrics.aviatorAdminProfit?.value ?? counts.aviator_admin_profit),
            changePercent: metrics.aviatorAdminProfit?.changePercent ?? -79.39,
            trend: metrics.aviatorAdminProfit?.trend ?? 'down',
            color: 'blue',
            Icon: LineIcon,
          },
          {
            label: 'Aviator Admin Loss',
            value: formatINR(metrics.aviatorAdminLoss?.value ?? counts.aviator_admin_loss),
            changePercent: metrics.aviatorAdminLoss?.changePercent ?? 0,
            trend: metrics.aviatorAdminLoss?.trend ?? 'flat',
            color: 'red',
            Icon: TrendingDown,
          },
        ],
      },
      {
        id: 'TODAY',
        label: 'Today & Real-Time Velocity',
        badge: 'Daily Pulse',
        stats: [
          {
            label: 'Active Player',
            value: formatNumber(metrics.activePlayer?.value ?? counts.active_player),
            changePercent: metrics.activePlayer?.changePercent ?? 0,
            trend: metrics.activePlayer?.trend ?? 'flat',
            color: 'green',
            Icon: UserCheck,
          },
          {
            label: 'Today User',
            value: formatNumber(metrics.todayUser?.value ?? counts.today_user),
            changePercent: metrics.todayUser?.changePercent ?? 0,
            trend: metrics.todayUser?.trend ?? 'flat',
            color: 'purple',
            Icon: UserPlus,
          },
          {
            label: 'Today Turnover',
            value: formatINR(metrics.todayTurnover?.value ?? counts.today_turnover),
            changePercent: metrics.todayTurnover?.changePercent ?? 0,
            trend: metrics.todayTurnover?.trend ?? 'flat',
            color: 'orange',
            Icon: BarChart3,
          },
          {
            label: 'Today Deposit',
            value: formatINR(metrics.todayDeposit?.value ?? counts.today_deposit),
            changePercent: metrics.todayDeposit?.changePercent ?? 0,
            trend: metrics.todayDeposit?.trend ?? 'flat',
            color: 'green',
            Icon: Banknote,
          },
          {
            label: 'Today Withdrawal',
            value: formatINR(metrics.todayWithdrawal?.value ?? counts.today_withdrawal),
            changePercent: metrics.todayWithdrawal?.changePercent ?? 0,
            trend: metrics.todayWithdrawal?.trend ?? 'flat',
            color: 'orange',
            Icon: Receipt,
          },
        ],
      },
      {
        id: 'RISK',
        label: 'Queue & Risk Mitigation',
        badge: 'Audit & Holds',
        stats: [
          {
            label: 'Pending Deposit',
            value: formatNumber(metrics.pendingDeposit?.value ?? counts.pending_deposit),
            changePercent: metrics.pendingDeposit?.changePercent ?? -100,
            trend: metrics.pendingDeposit?.trend ?? 'down',
            color: 'green',
            Icon: Banknote,
          },
          {
            label: 'Pending Withdrawal',
            value: formatNumber(metrics.pendingWithdrawal?.value ?? counts.pending_withdrawal),
            changePercent: metrics.pendingWithdrawal?.changePercent ?? -100,
            trend: metrics.pendingWithdrawal?.trend ?? 'down',
            color: 'orange',
            Icon: Receipt,
          },
          {
            label: 'Illegal Betters',
            value: formatNumber(metrics.illegalBetters?.value ?? counts.illegal_betters),
            changePercent: metrics.illegalBetters?.changePercent ?? 0,
            trend: metrics.illegalBetters?.trend ?? 'flat',
            color: 'red',
            Icon: Ban,
          },
          {
            label: 'Demo Users',
            value: formatNumber(metrics.demoUsers?.value ?? counts.demo_users),
            changePercent: metrics.demoUsers?.changePercent ?? 0,
            trend: metrics.demoUsers?.trend ?? 'flat',
            color: 'purple',
            Icon: Users,
          },
        ],
      },
    ]
  }, [counts, metrics])

  // Filtered categories
  const displayedCategories = useMemo(() => {
    if (selectedCategory === 'ALL') return structuredCategories
    return structuredCategories.filter((c) => c.id === selectedCategory)
  }, [selectedCategory, structuredCategories])

  // Format Chart Data
  const turnoverChartData = useMemo(() => {
    const list = charts.turnoverOverview || []
    return list.map((item) => ({
      d: formatDateLabel(item.date),
      v: Number(item.value) || 0,
    }))
  }, [charts.turnoverOverview])

  const depositVsWithdrawalChartData = useMemo(() => {
    const deposits = charts.depositVsWithdrawal?.deposits || []
    const withdrawals = charts.depositVsWithdrawal?.withdrawals || []
    return deposits.map((dItem, idx) => {
      const wItem = withdrawals[idx] || {}
      return {
        d: formatDateLabel(dItem.date),
        deposit: Number(dItem.value) || 0,
        withdrawal: Number(wItem.value) || 0,
      }
    })
  }, [charts.depositVsWithdrawal])

  const playerGrowthChartData = useMemo(() => {
    const list = charts.playerGrowth || []
    return list.map((item) => ({
      d: formatDateLabel(item.date),
      v: Number(item.value) || 0,
    }))
  }, [charts.playerGrowth])

  // Mini growth chart for the banner card
  const bannerGrowthData = useMemo(() => {
    if (turnoverChartData.length > 0) return turnoverChartData
    return [
      { d: '1', v: 10 },
      { d: '2', v: 18 },
      { d: '3', v: 14 },
      { d: '4', v: 22 },
      { d: '5', v: 28 },
    ]
  }, [turnoverChartData])

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Banner */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden rounded-2xl px-5 py-4 sm:px-6 sm:py-5 min-h-[155px] sm:min-h-[175px] shadow-sm border border-blue-200/40 text-white bg-[#0b4899]">
        <img
          src={welcomeBg}
          alt="Gaming Banner"
          className="absolute inset-0 w-full h-full object-cover object-[45%_55%] pointer-events-none"
        />
        <div className="absolute inset-y-0 left-0 w-72 sm:w-96 bg-gradient-to-r from-blue-950/85 via-blue-950/50 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-sm sm:max-w-md">
          <span className="inline-block px-2 py-0.5 rounded-full bg-blue-950/75 backdrop-blur-sm text-blue-200 text-[10px] font-semibold mb-1 border border-blue-400/30">
            Welcome back,
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] leading-tight">
            Admin 👋
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/65 backdrop-blur-md border border-white/20 text-[11px] font-medium text-white shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Platform live telemetric overview</span>
            </div>

            <button
              onClick={() => loadDashboard(selectedPeriod, true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-950/70 hover:bg-blue-900 border border-white/20 text-[11px] font-medium text-blue-100 transition cursor-pointer"
              title="Refresh live metrics"
            >
              <RefreshCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Refreshing...' : lastUpdated ? `Updated ${lastUpdated}` : 'Sync'}</span>
            </button>
          </div>
        </div>

        {/* Compact Fixed-Width Total Revenue Card */}
        <div className="relative z-10 card w-52 sm:w-56 shrink-0 p-2.5 sm:p-3 bg-white/95 backdrop-blur-md shadow-md border border-white/80 rounded-xl self-start sm:self-auto">
          <div className="flex items-center justify-between gap-1.5">
            <span className="text-[11px] sm:text-xs font-bold text-slate-700 whitespace-nowrap">Total Revenue</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white text-slate-700 px-2 py-0.5 text-[11px] font-semibold shadow-2xs outline-none cursor-pointer hover:border-slate-300 focus:ring-2 focus:ring-blue-100 transition"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-black text-slate-900 whitespace-nowrap font-mono">
              {formatINR(metrics.totalRevenue?.value ?? counts.total_deposit)}
            </span>
            <span
              className={`rounded px-1 py-0.2 text-[9px] font-black ${
                (metrics.totalRevenue?.changePercent ?? 0) < 0
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {(metrics.totalRevenue?.changePercent ?? 0) >= 0 ? '↑' : '↓'}{' '}
              {metrics.totalRevenue?.changePercent ?? 0}%
            </span>
          </div>
          <div className="mt-1.5 h-6 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bannerGrowthData}>
                <Bar dataKey="v" fill="#2563eb" radius={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>


      {/* Category Filter Pill Bar */}
      <div className="card bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200/70 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers size={13} />
            <span>All Metrics</span>
            <span
              className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                selectedCategory === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {structuredCategories.reduce((acc, c) => acc + c.stats.length, 0)}
            </span>
          </button>

          {structuredCategories.map((cat) => {
            const active = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    active ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {cat.stats.length}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400 px-1">
          <span>Period: <strong className="text-slate-700">{selectedPeriod.toUpperCase()}</strong></span>
          <span>•</span>
          <span>Showing {displayedCategories.reduce((acc, c) => acc + c.stats.length, 0)} metrics</span>
        </div>
      </div>

      {/* Categorized Metric Groups */}
      <div className="space-y-4">
        {displayedCategories.map((cat, catIdx) => (
          <div key={cat.id} className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  {cat.label}
                </h4>
                <span className="text-[10px] text-slate-400 font-medium">({cat.badge})</span>
              </div>
            </div>

            <div className="grid gap-2 sm:gap-2.5 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {cat.stats.map((s, i) => (
                <StatCard
                  key={s.label}
                  label={s.label}
                  value={s.value}
                  changePercent={s.changePercent}
                  trend={s.trend}
                  color={s.color}
                  Icon={s.Icon}
                  index={catIdx * 8 + i}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Visual Telemetry Charts */}
      <div className="mt-5 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Chart 1: Turnover Overview */}
        <div className="card min-w-0 p-4 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Turnover Overview</h3>
            <span className="text-xs font-semibold text-slate-400">{selectedPeriod.toUpperCase()}</span>
          </div>
          <div className="text-lg sm:text-xl font-extrabold mt-1 text-slate-900 font-mono flex items-center gap-2">
            <span>{formatINR(metrics.totalTurnover?.value ?? counts.total_turnover)}</span>
            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              ↑ +{metrics.totalTurnover?.changePercent ?? 14962.7}%
            </span>
          </div>
          <div className="mt-2 h-48 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={turnoverChartData}>
                <defs>
                  <linearGradient id="tv-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : v)}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [formatINR(value), 'Turnover']}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={2.5} fill="url(#tv-grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Deposit vs Withdrawal */}
        <div className="card min-w-0 p-4 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Deposit vs Withdrawal</h3>
            <span className="text-xs font-semibold text-slate-400">{selectedPeriod.toUpperCase()}</span>
          </div>
          <div className="mt-1 flex justify-start gap-4 text-xs font-semibold">
            <span className="text-emerald-600 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Deposit ({formatINR(metrics.totalDeposit?.value ?? counts.total_deposit)})
            </span>
            <span className="text-rose-500 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Withdrawal ({formatINR(metrics.totalWithdrawal?.value ?? counts.total_withdrawal)})
            </span>
          </div>
          <div className="mt-2 h-48 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depositVsWithdrawalChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}K` : v)}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value, name) => [formatINR(value), name === 'deposit' ? 'Deposit' : 'Withdrawal']}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
                <Bar dataKey="deposit" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withdrawal" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Player Growth */}
        <div className="card min-w-0 p-4 md:col-span-2 lg:col-span-1 bg-white rounded-xl border border-slate-200/70 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">Player Growth</h3>
            <span className="text-xs font-semibold text-slate-400">{selectedPeriod.toUpperCase()}</span>
          </div>
          <div className="text-lg sm:text-xl font-extrabold mt-1 text-slate-900 font-mono flex items-center gap-2">
            <span>{formatNumber(metrics.totalPlayer?.value ?? counts.total_player)} Total</span>
            <span className="text-xs text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
              Active: {formatNumber(metrics.activePlayer?.value ?? counts.active_player)}
            </span>
          </div>
          <div className="mt-2 h-48 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={playerGrowthChartData}>
                <defs>
                  <linearGradient id="pg-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="d" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(value) => [formatNumber(value), 'New Players']}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="v" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#pg-grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
