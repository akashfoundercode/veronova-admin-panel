import { useState, useMemo } from 'react'
import {
  User, Mail, Phone, Lock, Eye, EyeOff, PlusCircle, Users as UsersIcon,
  Pencil, Trash2, ShieldCheck, CheckCircle2, Copy, Check, TrendingUp,
  Cpu, Wrench, RefreshCw, KeyRound, Sparkles, Building2, HelpCircle,
  Plus, Minus, ArrowUpRight, DollarSign, Send, RotateCcw
} from 'lucide-react'
import DataTable from '@/components/DataTable'
import { PageBanner, Field, Modal, useToast, money } from '@/components/ui'
import systemUserBg from '@/assets/images/system user.png'
import { getSystemUsers, saveSystemUsers } from './systemUsersStore'

export default function SystemUsers() {
  const [rows, setRows] = useState(getSystemUsers)
  const [filterTab, setFilterTab] = useState('ALL') // ALL, DEMO, QA, BOT, OPERATOR
  const [showPasswordMap, setShowPasswordMap] = useState({})
  const [copiedText, setCopiedText] = useState(null)

  // Registration Form State
  const [f, setF] = useState({
    user_name: '',
    email: '',
    mobile: '',
    password: '',
    role: 'Demo Player',
    wallet: '25000',
  })
  const [showFormPassword, setShowFormPassword] = useState(false)

  // Modals State
  const [editUser, setEditUser] = useState(null)
  const [walletModal, setWalletModal] = useState(null) // { user, mode: 'credit' | 'debit' }
  const [walletAmt, setWalletAmt] = useState('')
  const [rulesModal, setRulesModal] = useState(false)

  const [toast, node] = useToast()

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedText(id)
    setTimeout(() => setCopiedText(null), 1800)
    toast(`Copied ${text} to clipboard!`)
  }

  // Toggle password peek for individual row
  const toggleRowPassword = (id) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Generate strong random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
    let gen = 'Vero@'
    for (let i = 0; i < 6; i++) {
      gen += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setF((prev) => ({ ...prev, password: gen }))
    toast('Strong demo password generated!')
  }

  // Persist Rows
  const persistRows = (updater) => {
    setRows((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveSystemUsers(next)
      return next
    })
  }

  // Register New System/Demo User
  const handleRegister = (e) => {
    e.preventDefault()
    if (!f.email || !f.password) {
      return toast('Email and password are required')
    }

    const nextId = Math.max(0, ...rows.map((r) => r.id)) + 1
    const prefix =
      f.role === 'QA Tester' ? 'QA_' : f.role === 'Bot Simulator' ? 'BOT_' : 'DEMO_'
    const randomUid = prefix + Math.floor(100 + Math.random() * 900)
    const derivedName = f.user_name.trim() || f.email.split('@')[0]
    const numWallet = Number(f.wallet) || 0

    const now = new Date()
    const dateStr = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`

    const newUser = {
      id: nextId,
      user_id: randomUid,
      user_name: derivedName,
      email: f.email.trim(),
      mobile: f.mobile.trim() || '9876540000',
      role: f.role,
      wallet: numWallet,
      password: f.password,
      status: 'Active Sandbox',
      created_at: dateStr,
      last_login: 'Never',
    }

    persistRows([newUser, ...rows])
    toast(`Registered ${newUser.user_name} (${newUser.role}) successfully!`)
    setF({
      user_name: '',
      email: '',
      mobile: '',
      password: '',
      role: 'Demo Player',
      wallet: '25000',
    })
  }

  // Quick Wallet Adjust for row
  const handleQuickWallet = (user, delta) => {
    persistRows((prev) =>
      prev.map((u) => {
        if (u.id === user.id) {
          const newBal = delta === 0 ? 0 : Math.max(0, u.wallet + delta)
          return { ...u, wallet: newBal }
        }
        return u
      })
    )
    toast(
      delta === 0
        ? `Reset ${user.user_name} demo wallet to ₹0`
        : `Added +₹${delta.toLocaleString('en-IN')} demo credits to ${user.user_name}!`
    )
  }

  // Wallet Modal Submit
  const handleWalletModalSubmit = (e) => {
    e.preventDefault()
    const amt = Number(walletAmt)
    if (!amt || amt <= 0) return toast('Please enter a valid amount')

    const multiplier = walletModal.mode === 'credit' ? 1 : -1
    persistRows((prev) =>
      prev.map((u) => {
        if (u.id === walletModal.user.id) {
          const newBal = Math.max(0, u.wallet + amt * multiplier)
          return { ...u, wallet: newBal }
        }
        return u
      })
    )
    toast(
      `Demo wallet ₹${amt.toLocaleString('en-IN')} ${
        walletModal.mode === 'credit' ? 'credited to' : 'debited from'
      } ${walletModal.user.user_name}!`
    )
    setWalletModal(null)
    setWalletAmt('')
  }

  // Save Edit User
  const handleSaveEdit = (e) => {
    e.preventDefault()
    persistRows((prev) =>
      prev.map((u) => (u.id === editUser.id ? { ...u, ...editUser } : u))
    )
    toast('System user updated successfully')
    setEditUser(null)
  }

  // Delete User
  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this system user account?')) {
      persistRows((prev) => prev.filter((u) => u.id !== id))
      toast('System user removed')
    }
  }

  // Toggle User Status
  const toggleStatus = (user) => {
    const next = user.status === 'Active Sandbox' ? 'Disabled' : 'Active Sandbox'
    persistRows((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: next } : u))
    )
    toast(`${user.user_name} status set to ${next}`)
  }

  // KPI Calculations
  const totalVirtualLiquidity = rows.reduce((acc, r) => acc + (Number(r.wallet) || 0), 0)
  const activeSandboxCount = rows.filter((r) => r.status === 'Active Sandbox').length
  const qaCount = rows.filter((r) => r.role === 'QA Tester').length
  const demoCount = rows.filter((r) => r.role === 'Demo Player').length
  const botCount = rows.filter((r) => r.role === 'Bot Simulator').length
  const operatorCount = rows.filter((r) => r.role === 'System Operator').length

  // Filtered Rows
  const displayRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterTab === 'DEMO' && r.role !== 'Demo Player') return false
      if (filterTab === 'QA' && r.role !== 'QA Tester') return false
      if (filterTab === 'BOT' && r.role !== 'Bot Simulator') return false
      if (filterTab === 'OPERATOR' && r.role !== 'System Operator') return false
      return true
    })
  }, [rows, filterTab])

  // Role Badge Helper
  const getRoleBadge = (role) => {
    switch (role) {
      case 'System Operator':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'QA Tester':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'Bot Simulator':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200'
    }
  }

  // Columns Definition
  const cols = [
    {
      key: 'id',
      label: '#ID',
      render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span>,
    },
    {
      key: 'user',
      label: 'System User Details',
      render: (r) => (
        <div className="flex items-center gap-3 min-w-[210px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 font-extrabold text-white text-xs shadow-md">
            {r.user_name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm">{r.user_name}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-1 rounded">
                {r.user_id}
              </span>
              <button
                onClick={() => handleCopy(r.user_id, `uid_${r.id}`)}
                className="text-slate-400 hover:text-slate-600"
                title="Copy User ID"
              >
                {copiedText === `uid_${r.id}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Account Role',
      render: (r) => (
        <span className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold border ${getRoleBadge(r.role)}`}>
          {r.role}
        </span>
      ),
    },
    {
      key: 'contact',
      label: 'Email & Mobile',
      render: (r) => (
        <div className="min-w-[170px] text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
            <Mail size={12} className="text-slate-400" />
            <span className="truncate max-w-[140px]">{r.email}</span>
            <button
              onClick={() => handleCopy(r.email, `mail_${r.id}`)}
              className="text-slate-400 hover:text-slate-600"
              title="Copy Email"
            >
              {copiedText === `mail_${r.id}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 mt-0.5">
            <Phone size={12} className="text-slate-400" />
            <span>{r.mobile}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'wallet',
      label: 'Demo Wallet',
      render: (r) => (
        <div className="min-w-[150px]">
          <span className="font-black text-slate-900 text-sm">
            ₹{Number(r.wallet).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
          {/* Quick inline adjustment pills */}
          <div className="mt-1 flex items-center gap-1.5">
            <button
              onClick={() => handleQuickWallet(r, 25000)}
              className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-2xs"
              title="Quick Add ₹25,000 Demo Credits"
            >
              +₹25k
            </button>
            <button
              onClick={() => handleQuickWallet(r, 0)}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-slate-200 transition"
              title="Reset Demo Wallet to ₹0"
            >
              Reset
            </button>
          </div>
        </div>
      ),
    },
    {
      key: 'password',
      label: 'Credentials',
      render: (r) => (
        <div className="min-w-[130px] flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-slate-700">
            {showPasswordMap[r.id] ? r.password : '••••••••'}
          </span>
          <button
            onClick={() => toggleRowPassword(r.id)}
            className="text-slate-400 hover:text-slate-700 transition"
            title={showPasswordMap[r.id] ? 'Hide password' : 'Peek password'}
          >
            {showPasswordMap[r.id] ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
          <button
            onClick={() => handleCopy(r.password, `pwd_${r.id}`)}
            className="text-slate-400 hover:text-slate-700 transition"
            title="Copy password"
          >
            {copiedText === `pwd_${r.id}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
          </button>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <button
          onClick={() => toggleStatus(r)}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition hover:opacity-85 ${
            r.status === 'Active Sandbox'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
          title="Click to toggle status"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              r.status === 'Active Sandbox' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
          />
          {r.status}
        </button>
      ),
    },
    {
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setWalletModal({ user: r, mode: 'credit' })
              setWalletAmt('50000')
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition shadow-2xs"
            title="Load Virtual Demo Balance"
          >
            <DollarSign size={14} />
          </button>
          <button
            onClick={() => setEditUser(r)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-2xs"
            title="Edit User Info"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => handleDeleteUser(r.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition shadow-2xs"
            title="Delete User"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Banner */}
      <PageBanner
        title="System Users & Sandbox Accounts"
        icon={User}
        bgImage={systemUserBg}
        crumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'System Users', to: '/system-users' },
          { label: 'Demo & Internal Staff' },
        ]}
      >
        <button
          onClick={() => setRulesModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white border border-white/30 hover:bg-white/30 transition shadow-sm"
        >
          <HelpCircle size={15} /> Sandbox Architecture
        </button>
      </PageBanner>

      {/* Compact, Sleek System & Sandbox Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Virtual Demo Liquidity */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Demo Virtual Pool</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              ₹{totalVirtualLiquidity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Zero real money exposure</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <DollarSign size={18} />
          </div>
        </div>

        {/* Card 2: QA & Staff Accounts */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">QA & Ops Staff</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {qaCount + operatorCount} Accounts
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{qaCount} QA • {operatorCount} Ops</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Wrench size={18} />
          </div>
        </div>

        {/* Card 3: AI Bots */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">AI Bot Simulators</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {botCount} Bots Running
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Automated load testing</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Cpu size={18} />
          </div>
        </div>

        {/* Card 4: Demo Guest Users */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Demo Trial Accounts</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {demoCount} Accounts
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Sandbox gameplay trial</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <UsersIcon size={18} />
          </div>
        </div>
      </div>

      {/* Register System / Demo User Console */}
      <form onSubmit={handleRegister} className="card p-5 sm:p-6 shadow-sm border border-blue-100 bg-white">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-xs">
              <PlusCircle size={22} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 sm:text-lg">Create System & Demo Account</h3>
              <p className="text-xs text-slate-500">Register QA testers, demo players, or automated game simulation bots</p>
            </div>
          </div>
          <button
            type="button"
            onClick={generatePassword}
            className="btn-ghost flex items-center gap-1.5 border border-slate-200 text-xs font-bold text-slate-700 hover:border-blue-300 hover:text-blue-600"
          >
            <KeyRound size={14} /> Generate Strong Password
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label">Account Role</label>
            <select
              className="input font-bold"
              value={f.role}
              onChange={(e) => setF({ ...f, role: e.target.value })}
            >
              <option value="Demo Player">Demo Player (Player Sandbox)</option>
              <option value="QA Tester">QA Tester (Feature Testing)</option>
              <option value="System Operator">System Operator (Staff)</option>
              <option value="Bot Simulator">Bot Simulator (Autonomous)</option>
            </select>
          </div>

          <div>
            <label className="label">Username</label>
            <input
              className="input"
              placeholder="e.g. qa_aviator_tester"
              value={f.user_name}
              onChange={(e) => setF({ ...f, user_name: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="e.g. qa@veronova.io"
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Mobile Number</label>
            <input
              type="tel"
              className="input"
              placeholder="e.g. 9876540001"
              value={f.mobile}
              onChange={(e) => setF({ ...f, mobile: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Initial Virtual Demo Wallet (₹)</label>
            <input
              type="number"
              min="0"
              step="any"
              className="input font-bold"
              placeholder="25000"
              value={f.wallet}
              onChange={(e) => setF({ ...f, wallet: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showFormPassword ? 'text' : 'password'}
                className="input !pr-10 font-mono"
                placeholder="Enter password"
                value={f.password}
                onChange={(e) => setF({ ...f, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowFormPassword(!showFormPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                {showFormPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Quick Fund Presets:</span>
            {[10000, 25000, 100000, 500000].map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => setF({ ...f, wallet: String(amt) })}
                className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 hover:bg-slate-200"
              >
                +₹{amt >= 100000 ? `${amt / 100000} Lakh` : `${amt / 1000}k`}
              </button>
            ))}
          </div>

          <button type="submit" className="btn px-6 py-2.5 font-bold shadow-md shadow-blue-500/20">
            <PlusCircle size={16} /> Register System User
          </button>
        </div>
      </form>

      {/* Main Table Card */}
      <div className="card p-4 space-y-4 shadow-sm">
        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All System Accounts', count: rows.length },
              { id: 'DEMO', label: 'Demo Players', count: demoCount },
              { id: 'QA', label: 'QA Testers', count: qaCount },
              { id: 'BOT', label: 'Bot Simulators', count: botCount },
              { id: 'OPERATOR', label: 'Operators', count: operatorCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  filterTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-extrabold ${
                    filterTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="text-xs font-semibold text-slate-400">
            Showing {displayRows.length} internal accounts
          </div>
        </div>

        {/* The Main DataTable */}
        <DataTable
          columns={cols}
          rows={displayRows}
          exportName="veronova-system-users"
          placeholder="Search by name, email, User ID, or mobile..."
        />
      </div>

      {/* ================= MODAL: EDIT USER ================= */}
      {editUser && (
        <Modal title={`Edit System User · ${editUser.user_name}`} onClose={() => setEditUser(null)}>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Username</label>
                <input
                  className="input font-bold"
                  value={editUser.user_name}
                  onChange={(e) => setEditUser({ ...editUser, user_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Role</label>
                <select
                  className="input font-semibold"
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                >
                  <option value="Demo Player">Demo Player</option>
                  <option value="QA Tester">QA Tester</option>
                  <option value="System Operator">System Operator</option>
                  <option value="Bot Simulator">Bot Simulator</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  className="input"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Mobile Number</label>
                <input
                  type="tel"
                  className="input"
                  value={editUser.mobile}
                  onChange={(e) => setEditUser({ ...editUser, mobile: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Demo Balance (₹)</label>
                <input
                  type="number"
                  className="input font-bold"
                  value={editUser.wallet}
                  onChange={(e) => setEditUser({ ...editUser, wallet: +e.target.value })}
                />
              </div>

              <div>
                <label className="label">Status</label>
                <select
                  className="input font-semibold"
                  value={editUser.status}
                  onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
                >
                  <option value="Active Sandbox">Active Sandbox</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <input
                className="input font-mono"
                value={editUser.password}
                onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setEditUser(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn font-bold">
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= MODAL: ADJUST VIRTUAL WALLET ================= */}
      {walletModal && (
        <Modal
          title={`Load Virtual Demo Balance · ${walletModal.user.user_name}`}
          onClose={() => setWalletModal(null)}
        >
          <form onSubmit={handleWalletModalSubmit} className="space-y-4">
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Current Demo Balance</p>
                <p className="text-xl font-black text-slate-900">
                  ₹{Number(walletModal.user.wallet).toLocaleString('en-IN')}
                </p>
              </div>
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-mono font-bold text-blue-700">
                {walletModal.user.user_id}
              </span>
            </div>

            <div>
              <label className="label">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  className="input !pl-8 text-base font-extrabold text-slate-900"
                  value={walletAmt}
                  onChange={(e) => setWalletAmt(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {[25000, 50000, 100000, 500000].map((v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => setWalletAmt(String(v))}
                    className="rounded-lg border border-slate-200 bg-slate-50 py-1 text-xs font-bold text-slate-700 hover:border-blue-400"
                  >
                    +₹{v >= 100000 ? `${v / 100000}L` : `${v / 1000}k`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setWalletModal(null)}
              >
                Cancel
              </button>
              <button type="submit" className="btn bg-emerald-600 hover:bg-emerald-700 font-bold">
                Credit Virtual Credits
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= MODAL: SANDBOX ARCHITECTURE ================= */}
      {rulesModal && (
        <Modal title="Internal System & Sandbox Architecture" onClose={() => setRulesModal(false)}>
          <div className="space-y-4 text-xs sm:text-sm text-slate-700">
            <div className="rounded-xl bg-blue-50 p-4 border border-blue-200">
              <h4 className="font-extrabold text-blue-950 mb-1 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-blue-600" /> Isolated Sandbox Environment
              </h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                System users are internal testing accounts with isolated virtual demo balances that do not affect platform accounting, real payment gateways, or payout liabilities.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Demo Players:</strong> Pre-loaded virtual accounts for testing end-user experience across games.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>QA Testers:</strong> Engineering accounts for testing crash multipliers, colour prediction odds, and websocket performance.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Bot Simulators:</strong> Programmatic simulator accounts generating background game activity in lobbies.</span>
              </li>
            </ul>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button className="btn" onClick={() => setRulesModal(false)}>Understood</button>
            </div>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}
