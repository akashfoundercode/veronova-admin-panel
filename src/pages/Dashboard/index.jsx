import { useState, useMemo } from 'react'
import {
  Users, UserCheck, UserPlus, TrendingUp, Wallet, Landmark, Banknote, HandCoins, Receipt, MessageCircle,
  Gamepad2, Percent, Ban, Scale, LineChart as LineIcon, TrendingDown, MessageSquareText, BarChart3, ArrowDownUp, UserRound,
  Layers, Sparkles, Filter, Activity, ShieldAlert
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar,
} from 'recharts'
import welcomeBg from '@/assets/images/image.png'

const spark = (seed, up = true) => Array.from({ length: 14 }, (_, i) => ({ v: 10 + ((seed * (i + 3) * 7) % 9) + (up ? i * 0.6 : 0) }))

const theme = {
  blue: ['bg-blue-100 text-blue-600', '#3b82f6'],
  green: ['bg-emerald-100 text-emerald-600', '#10b981'],
  purple: ['bg-purple-100 text-purple-600', '#8b5cf6'],
  orange: ['bg-amber-100 text-amber-600', '#f59e0b'],
  red: ['bg-rose-100 text-rose-600', '#ef4444'],
}

// Categorized metrics for clarity and fast operational oversight
const categories = [
  {
    id: 'TOTALS',
    label: 'Overall Platform Totals',
    badge: 'Core Ledger',
    stats: [
      ['Total Player', '8.00', '-12%', 'blue', Users],
      ['Total Turnover', '₹1,41,349.00', '-22%', 'purple', Wallet],
      ['Total Deposit', '₹40,67,511.00', '-15%', 'blue', Landmark],
      ['Total Withdrawal', '₹0.00', '0%', 'red', HandCoins],
      ['Total Commission', '₹0.00', '0%', 'blue', Percent],
      ['Total Games', '3.00', '-50%', 'purple', Gamepad2],
      ['Feedbacks', '0.00', '0%', 'blue', MessageCircle],
      ['Otp Pack Balance', '4,955.00', '-25%', 'red', MessageSquareText],
    ],
  },
  {
    id: 'GAMES',
    label: 'Game Engines & P/L Breakdown',
    badge: 'Casino & Crash',
    stats: [
      ['Chicken Road Admin Profit', '₹0.00', '0%', 'green', Scale],
      ['Chicken Road Admin Loss', '₹1,28,259.90', '-5%', 'red', Scale],
      ['Aviator Admin Profit', '₹10,683.15', '+12%', 'blue', LineIcon],
      ['Aviator Admin Loss', '₹0.00', '0%', 'red', TrendingDown],
    ],
  },
  {
    id: 'TODAY',
    label: 'Today & Real-Time Velocity',
    badge: 'Daily Pulse',
    stats: [
      ['Active Player', '8.00', '-8%', 'green', UserCheck],
      ['Today User', '0.00', '0%', 'purple', UserPlus],
      ['Today Turnover', '₹21.00', '+18%', 'orange', BarChart3],
      ['Today Deposit', '₹0.00', '0%', 'green', Banknote],
      ['Today Withdrawal', '₹0.00', '0%', 'orange', Receipt],
    ],
  },
  {
    id: 'RISK',
    label: 'Queue & Risk Mitigation',
    badge: 'Audit & Holds',
    stats: [
      ['Pending Deposit', '12.00', '-9%', 'green', Banknote],
      ['Pending Withdrawal', '2.00', '-9%', 'orange', Receipt],
      ['Illegal Betters', '2.00', '-100%', 'red', Ban],
      ['Demo Users', '0.00', '0%', 'purple', Users],
    ],
  },
]

const days = ['4 Oct', '5 Oct', '6 Oct', '7 Oct', '8 Oct', '9 Oct', '10 Oct']
const turnover = days.map((d, i) => ({ d, v: [50, 68, 66, 120, 122, 98, 150][i] * 1000 }))
const dw = days.map((d, i) => ({ d, deposit: [480, 310, 310, 290, 290, 420, 480][i], withdrawal: [310, 130, 240, 180, 420, 170, 330][i] }))
const growth = days.map((d, i) => ({ d, v: [10, 12, 12, 20, 15, 28, 28][i] }))

function Stat({ s, i }) {
  const [label, value, change, color, Icon] = s
  const [cls, hex] = theme[color]
  const neg = change.startsWith('-'), zero = change === '0%'
  return (
    <div className="card bg-white min-w-0 p-3 rounded-xl border border-slate-200/70 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${cls}`}>
            <Icon size={15} />
          </div>
          <span className="truncate text-xs font-semibold text-slate-600" title={label}>{label}</span>
        </div>
        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${zero ? 'bg-slate-100 text-slate-500' : neg ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {zero ? '0%' : `${neg ? '↓' : '↑'} ${change.replace(/[+-]/, '')}`}
        </span>
      </div>

      <div className="flex items-baseline justify-between gap-2 mt-2 pt-1 border-t border-slate-100/80">
        <div className="text-base sm:text-lg font-bold whitespace-nowrap text-slate-900 tracking-tight font-mono">
          {value}
        </div>
        <div className="h-5 w-14 shrink-0 opacity-80 hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark(i + 2, !neg)}>
              <defs><linearGradient id={`g${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={hex} stopOpacity={0.35} /><stop offset="100%" stopColor={hex} stopOpacity={0} /></linearGradient></defs>
              <Area type="monotone" dataKey="v" stroke={hex} strokeWidth={1.75} fill={`url(#g${i})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

const RangeSel = () => (
  <select className="rounded-lg border border-slate-200 bg-white text-slate-700 px-2.5 py-1 text-xs font-semibold shadow-2xs outline-none cursor-pointer hover:border-slate-300 focus:ring-2 focus:ring-blue-100 transition">
    <option className="text-slate-800 bg-white" value="7">Last 7 Days</option>
    <option className="text-slate-800 bg-white" value="30">Last 30 Days</option>
  </select>
)

export default function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState('ALL') // 'ALL' or category id

  const displayedCategories = useMemo(() => {
    if (selectedCategory === 'ALL') return categories
    return categories.filter((c) => c.id === selectedCategory)
  }, [selectedCategory])

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Banner */}
      <div className="relative flex flex-wrap items-center justify-between gap-3 sm:gap-4 overflow-hidden rounded-2xl px-5 py-4 sm:px-6 sm:py-5 min-h-[175px] sm:min-h-[195px] shadow-sm border border-blue-200/40 text-white bg-[#0b4899]">
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
          <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/65 backdrop-blur-md border border-white/20 text-[11px] font-medium text-white shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Platform live telemetric overview</span>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="relative z-10 card w-full lg:w-auto sm:min-w-[240px] p-3 bg-white/95 backdrop-blur-md shadow-md border border-white/80 rounded-xl">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700">Total Revenue</span>
            <RangeSel />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-slate-900 whitespace-nowrap font-mono">₹40,67,511</span>
            <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-black text-emerald-700">↑ -12%</span>
          </div>
          <div className="mt-1.5 h-7 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growth}>
                <Bar dataKey="v" fill="#2563eb" radius={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Premium Compact Category Segmented Pill Bar */}
      <div className="card bg-white p-2 sm:p-2.5 rounded-xl border border-slate-200/70 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers size={13} />
            <span>All Metrics</span>
            <span className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${selectedCategory === 'ALL' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {categories.reduce((acc, c) => acc + c.stats.length, 0)}
            </span>
          </button>

          {categories.map((cat) => {
            const active = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  active
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{cat.label}</span>
                <span className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${active ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {cat.stats.length}
                </span>
              </button>
            )
          })}
        </div>

        <div className="text-[11px] font-medium text-slate-400 px-1">
          Showing {displayedCategories.reduce((acc, c) => acc + c.stats.length, 0)} live metrics
        </div>
      </div>

      {/* Categorized Metric Groups with Tight, Crisp Spacing */}
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
                <Stat key={s[0]} s={s} i={catIdx * 8 + i} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <div className="card min-w-0 p-4">
          <div className="flex items-center justify-between gap-2"><h3 className="font-bold text-sm sm:text-base">Turnover Overview</h3><RangeSel /></div>
          <div className="text-lg sm:text-xl font-extrabold mt-1">₹ 141,349.00 <span className="text-sm text-rose-500 font-bold">↓ -22%</span></div>
          <div className="mt-2 h-48 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={turnover}>
                <defs><linearGradient id="tv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="d" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v / 1000 + 'K'} /><Tooltip />
                <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2.5} fill="url(#tv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card min-w-0 p-4">
          <div className="flex items-center justify-between gap-2"><h3 className="font-bold text-sm sm:text-base">Deposit vs Withdrawal</h3><RangeSel /></div>
          <div className="mt-1 flex justify-center gap-4 text-xs font-semibold"><span className="text-emerald-600">● Deposit</span><span className="text-rose-500">● Withdrawal</span></div>
          <div className="mt-2 h-48 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dw}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="d" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v + 'K'} /><Tooltip />
                <Bar dataKey="deposit" fill="#10b981" radius={[4, 4, 0, 0]} /><Bar dataKey="withdrawal" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card min-w-0 p-4 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between gap-2"><h3 className="font-bold text-sm sm:text-base">Player Growth</h3><RangeSel /></div>
          <div className="text-lg sm:text-xl font-extrabold mt-1">8 <span className="text-sm text-emerald-600 font-bold">↑ -12%</span></div>
          <div className="mt-2 h-48 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth}>
                <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="d" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                <Area type="monotone" dataKey="v" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#pg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

