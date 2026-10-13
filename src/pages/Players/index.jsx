import { useState, useMemo } from 'react'
import {
  Users, UserPlus, Search, Wallet, Crown, ShieldCheck, ShieldAlert,
  Phone, Copy, Check, Eye, Pencil, Trash2, ArrowUpRight, ArrowDownLeft,
  Plus, Minus, TrendingUp, DollarSign, Filter, RefreshCw, X, CheckCircle2,
  AlertCircle, Sparkles, Trophy, ExternalLink, Ban, Unlock
} from 'lucide-react'
import DataTable from '@/components/DataTable'
import { PageBanner, Modal, useToast, money } from '@/components/ui'
import playerBg from '@/assets/images/PLAYER.png'
import { getPlayers, savePlayers } from './playersStore'

export default function Players() {
  const [rows, setRows] = useState(getPlayers)
  const [filterTab, setFilterTab] = useState('ALL') // ALL, ACTIVE, VIP, HIGH_BALANCE, SUSPENDED
  const [vipFilter, setVipFilter] = useState('ALL')
  const [kycFilter, setKycFilter] = useState('ALL')
  const [copiedId, setCopiedId] = useState(null)

  // Modals state
  const [viewPlayer, setViewPlayer] = useState(null)
  const [editPlayer, setEditPlayer] = useState(null)
  const [walletModal, setWalletModal] = useState(null) // { player, mode: 'credit' | 'debit' }
  const [walletAmt, setWalletAmt] = useState('')
  const [walletRemark, setWalletRemark] = useState('')
  const [addModal, setAddModal] = useState(false)
  const [newPlayer, setNewPlayer] = useState({
    user_name: '',
    mobile: '',
    vip_level: 'VIP 1',
    initial_wallet: '',
    sponsor: 'Admin',
    sponsor_id: 'ADM01',
  })

  const [toast, node] = useToast()

  // Copy to clipboard helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
    toast(`Copied ${text} to clipboard!`)
  }

  // Update rows and save
  const persistRows = (updater) => {
    setRows((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      savePlayers(next)
      return next
    })
  }

  // Handle Wallet Adjustment
  const handleWalletAdjust = (e) => {
    e.preventDefault()
    const amt = Number(walletAmt)
    if (!amt || amt <= 0) return toast('Please enter a valid amount')

    const multiplier = walletModal.mode === 'credit' ? 1 : -1
    const targetPlayer = walletModal.player

    if (multiplier < 0 && targetPlayer.wallet < amt) {
      return toast('Cannot deduct more than current wallet balance!')
    }

    persistRows((prev) =>
      prev.map((p) => {
        if (p.id === targetPlayer.id) {
          const newWallet = Math.max(0, p.wallet + amt * multiplier)
          return { ...p, wallet: newWallet }
        }
        return p
      })
    )

    toast(
      `Wallet ₹${amt.toLocaleString('en-IN')} ${
        walletModal.mode === 'credit' ? 'credited to' : 'debited from'
      } ${targetPlayer.user_name}!`
    )
    setWalletModal(null)
    setWalletAmt('')
    setWalletRemark('')
  }

  // Toggle Player Status (Active / Suspended)
  const togglePlayerStatus = (player) => {
    const nextStatus = player.status === 'Active' ? 'Suspended' : 'Active'
    persistRows((prev) =>
      prev.map((p) => (p.id === player.id ? { ...p, status: nextStatus } : p))
    )
    toast(`Player #${player.id} status changed to ${nextStatus}`)
    if (viewPlayer?.id === player.id) {
      setViewPlayer((prev) => ({ ...prev, status: nextStatus }))
    }
  }

  // Handle Save Edit Player
  const handleSaveEdit = (e) => {
    e.preventDefault()
    persistRows((prev) =>
      prev.map((p) => (p.id === editPlayer.id ? { ...p, ...editPlayer } : p))
    )
    toast('Player information updated successfully')
    if (viewPlayer?.id === editPlayer.id) {
      setViewPlayer(editPlayer)
    }
    setEditPlayer(null)
  }

  // Handle Add New Player
  const handleAddNewPlayer = (e) => {
    e.preventDefault()
    if (!newPlayer.user_name || !newPlayer.mobile) {
      return toast('Please enter Name and Mobile number')
    }

    const randomId = 'VN_' + Math.floor(10000 + Math.random() * 90000)
    const initialAmt = Number(newPlayer.initial_wallet) || 0
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

    const playerObj = {
      id: Math.max(0, ...rows.map((r) => r.id)) + 1,
      user_id: randomId,
      user_name: newPlayer.user_name,
      mobile: newPlayer.mobile,
      email: `${newPlayer.user_name.toLowerCase().replace(/\s+/g, '')}@veronova.com`,
      sponsor: newPlayer.sponsor || 'Admin',
      sponsor_id: newPlayer.sponsor_id || 'ADM01',
      wallet: initialAmt,
      winning: 0,
      commission: 0,
      bonus: 0,
      turnover: 0,
      vip_level: newPlayer.vip_level,
      status: 'Active',
      kyc_status: 'Pending',
      created_at: `${dateStr}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      avatar_color: 'from-blue-600 to-indigo-600',
      win_rate: '0%',
      total_bets: 0,
    }

    persistRows([playerObj, ...rows])
    toast(`Player ${playerObj.user_name} registered successfully!`)
    setAddModal(false)
    setNewPlayer({
      user_name: '',
      mobile: '',
      vip_level: 'VIP 1',
      initial_wallet: '',
      sponsor: 'Admin',
      sponsor_id: 'ADM01',
    })
  }

  // KPI Calculations
  const totalBalance = rows.reduce((acc, r) => acc + (Number(r.wallet) || 0), 0)
  const totalWinning = rows.reduce((acc, r) => acc + (Number(r.winning) || 0), 0)
  const activeCount = rows.filter((r) => r.status === 'Active').length
  const vipCount = rows.filter((r) => ['VIP 4', 'VIP 5', 'VIP 6'].includes(r.vip_level)).length
  const highBalanceCount = rows.filter((r) => r.wallet >= 50000).length
  const suspendedCount = rows.filter((r) => r.status === 'Suspended').length

  // Filtered rows for DataTable
  const displayRows = useMemo(() => {
    return rows.filter((r) => {
      // Tab filter
      if (filterTab === 'ACTIVE' && r.status !== 'Active') return false
      if (filterTab === 'VIP' && !['VIP 4', 'VIP 5', 'VIP 6'].includes(r.vip_level)) return false
      if (filterTab === 'HIGH_BALANCE' && r.wallet < 50000) return false
      if (filterTab === 'SUSPENDED' && r.status !== 'Suspended') return false

      // Dropdown filters
      if (vipFilter !== 'ALL' && r.vip_level !== vipFilter) return false
      if (kycFilter !== 'ALL' && r.kyc_status !== kycFilter) return false

      return true
    })
  }, [rows, filterTab, vipFilter, kycFilter])

  // VIP Badge Styling helper
  const getVipBadge = (level) => {
    switch (level) {
      case 'VIP 6':
        return 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-xs'
      case 'VIP 5':
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-xs'
      case 'VIP 4':
        return 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs'
      case 'VIP 3':
        return 'bg-purple-100 text-purple-700 border border-purple-200'
      case 'VIP 2':
        return 'bg-blue-100 text-blue-700 border border-blue-200'
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200'
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
      key: 'player',
      label: 'Player Details',
      render: (r) => {
        const initials = (r.user_name || r.user_id || 'U')
          .slice(0, 2)
          .toUpperCase()
        return (
          <div className="flex items-center gap-3 min-w-[210px]">
            <div className="relative shrink-0">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${
                  r.avatar_color || 'from-blue-600 to-indigo-600'
                } font-extrabold text-white text-xs shadow-md`}
              >
                {initials}
              </div>
              {['VIP 5', 'VIP 6'].includes(r.vip_level) && (
                <div className="absolute -top-1.5 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-amber-950 shadow-xs">
                  <Crown size={10} fill="currentColor" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 truncate hover:text-blue-600 transition-colors">
                  {r.user_name || 'Unnamed Player'}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
                  {r.user_id || 'NO_ID'}
                </span>
                <button
                  type="button"
                  title="Copy User ID"
                  onClick={() => handleCopy(r.user_id, r.id)}
                  className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
                >
                  {copiedId === r.id ? (
                    <Check size={12} className="text-emerald-600" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'contact',
      label: 'Contact & KYC',
      render: (r) => (
        <div className="min-w-[130px]">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Phone size={12} className="text-slate-400" />
            <span>{r.mobile}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                r.kyc_status === 'Verified'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : r.kyc_status === 'Pending'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {r.kyc_status === 'Verified' ? (
                <ShieldCheck size={11} className="text-emerald-600" />
              ) : (
                <AlertCircle size={11} className="text-amber-600" />
              )}
              {r.kyc_status}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'vip_level',
      label: 'VIP Tier',
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-extrabold ${getVipBadge(
            r.vip_level
          )}`}
        >
          <Crown size={12} />
          {r.vip_level}
        </span>
      ),
    },
    {
      key: 'wallet',
      label: 'Main Wallet',
      render: (r) => (
        <div className="min-w-[150px]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-extrabold text-slate-900 text-sm">
              ₹{Number(r.wallet).toLocaleString('en-IN')}
            </span>
          </div>
          {/* Quick inline credit/debit pill triggers */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <button
              onClick={() => {
                setWalletModal({ player: r, mode: 'credit' })
                setWalletAmt('')
              }}
              title="Quick Credit Fund"
              className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition shadow-2xs"
            >
              <Plus size={11} /> Add
            </button>
            <button
              onClick={() => {
                setWalletModal({ player: r, mode: 'debit' })
                setWalletAmt('')
              }}
              title="Quick Deduct Fund"
              className="flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200 hover:bg-rose-100 transition shadow-2xs"
            >
              <Minus size={11} /> Deduct
            </button>
          </div>
        </div>
      ),
    },
    {
      key: 'winning',
      label: 'Winning Wallet',
      render: (r) => (
        <div className="font-extrabold text-emerald-600 text-sm">
          ₹{Number(r.winning).toLocaleString('en-IN')}
        </div>
      ),
    },
    {
      key: 'turnover',
      label: 'Turn Over',
      render: (r) => (
        <div className="min-w-[100px]">
          <p className="text-xs font-bold text-slate-700">
            ₹{Number(r.turnover || 0).toLocaleString('en-IN')}
          </p>
          <p className="text-[10px] text-slate-400">Total Played</p>
        </div>
      ),
    },
    {
      key: 'sponsor',
      label: 'Sponsor Info',
      render: (r) => (
        <div className="min-w-[120px]">
          <p className="text-xs font-bold text-slate-800">{r.sponsor || 'Admin'}</p>
          <span className="inline-block rounded bg-blue-50 px-1.5 py-0.2 text-[10px] font-semibold text-blue-700">
            ID: {r.sponsor_id || 'ADM01'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${
            r.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              r.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          />
          {r.status}
        </span>
      ),
    },
    {
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewPlayer(r)}
            title="View Player Profile"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-2xs"
          >
            <Eye size={15} />
          </button>
          <button
            onClick={() => setEditPlayer(r)}
            title="Edit Player Details"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-700 hover:text-white transition shadow-2xs"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => togglePlayerStatus(r)}
            title={r.status === 'Active' ? 'Suspend Player' : 'Activate Player'}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition shadow-2xs ${
              r.status === 'Active'
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
            }`}
          >
            {r.status === 'Active' ? <Ban size={14} /> : <Unlock size={14} />}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Premium Header Banner */}
      <PageBanner
        title="Players Management"
        icon={Users}
        bgImage={playerBg}
        crumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Players', to: '/players' },
          { label: 'User Directory' },
        ]}
      >
        <button
          onClick={() => setAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-extrabold text-blue-700 shadow-xl transition-all hover:bg-blue-50 hover:shadow-2xl hover:scale-105 active:scale-95"
        >
          <UserPlus size={17} /> Register New Player
        </button>
      </PageBanner>

      {/* Compact, Sleek Player Directory & Liquidity Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Player Holdings</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Live settlement pool</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Wallet size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Winning Liability</p>
            <h3 className="text-xl font-bold text-emerald-600 mt-0.5 tracking-tight font-mono">
              ₹{totalWinning.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{((totalWinning / (totalBalance || 1)) * 100).toFixed(1)}% Ready to cashout</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Trophy size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Player Directory</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {rows.length} Players
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{activeCount} active • {rows.length - activeCount} suspended</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <Users size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">VIP High-Rollers</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {vipCount} Elite
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Tier 4, 5 & 6 club</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Crown size={18} />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Quick Filters Bar */}
      <div className="card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Segmented Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All Players', count: rows.length },
              { id: 'ACTIVE', label: 'Active', count: activeCount },
              { id: 'VIP', label: 'VIP Members', count: vipCount },
              { id: 'HIGH_BALANCE', label: 'High Balance (>₹50k)', count: highBalanceCount },
              { id: 'SUSPENDED', label: 'Suspended', count: suspendedCount },
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
                    filterTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={vipFilter}
              onChange={(e) => setVipFilter(e.target.value)}
              className="input !w-auto !py-1.5 text-xs font-semibold"
            >
              <option value="ALL">All VIP Tiers</option>
              <option value="VIP 1">VIP 1</option>
              <option value="VIP 2">VIP 2</option>
              <option value="VIP 3">VIP 3</option>
              <option value="VIP 4">VIP 4</option>
              <option value="VIP 5">VIP 5</option>
              <option value="VIP 6">VIP 6</option>
            </select>

            <select
              value={kycFilter}
              onChange={(e) => setKycFilter(e.target.value)}
              className="input !w-auto !py-1.5 text-xs font-semibold"
            >
              <option value="ALL">All KYC Status</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Unverified">Unverified</option>
            </select>

            {(vipFilter !== 'ALL' || kycFilter !== 'ALL' || filterTab !== 'ALL') && (
              <button
                onClick={() => {
                  setFilterTab('ALL')
                  setVipFilter('ALL')
                  setKycFilter('ALL')
                }}
                className="btn-ghost !py-1.5 !px-2.5 text-xs text-rose-500 hover:bg-rose-50"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* The Main DataTable */}
        <DataTable
          columns={cols}
          rows={displayRows}
          exportName="veronova-players-list"
          placeholder="Search by User ID, Name, Mobile, or Sponsor..."
        />
      </div>

      {/* ================= MODAL: QUICK WALLET ADJUSTMENT ================= */}
      {walletModal && (
        <Modal
          title={`Wallet ${
            walletModal.mode === 'credit' ? 'Credit (+ Add Fund)' : 'Debit (- Deduct Fund)'
          } · ${walletModal.player.user_name}`}
          onClose={() => setWalletModal(null)}
        >
          <form onSubmit={handleWalletAdjust} className="space-y-4">
            {/* Player Balance Card */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Current Player Balance</p>
                  <p className="text-xl font-black text-slate-900">
                    ₹{Number(walletModal.player.wallet).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-500">User ID</p>
                  <p className="font-mono text-sm font-bold text-blue-700">
                    {walletModal.player.user_id}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Amount Chips */}
            <div>
              <label className="label">Quick Preset Amount</label>
              <div className="grid grid-cols-5 gap-2">
                {[100, 500, 1000, 5000, 10000].map((chip) => (
                  <button
                    type="button"
                    key={chip}
                    onClick={() => setWalletAmt(String(chip))}
                    className={`rounded-lg border py-1.5 text-xs font-bold transition ${
                      walletAmt === String(chip)
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'
                    }`}
                  >
                    +₹{chip >= 1000 ? `${chip / 1000}k` : chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
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
                  className="input !pl-8"
                  placeholder="Enter adjustment amount"
                  value={walletAmt}
                  onChange={(e) => setWalletAmt(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Remark */}
            <div>
              <label className="label">Reason / Remark</label>
              <input
                className="input"
                placeholder="e.g. Tournament reward, manual fix, contest"
                value={walletRemark}
                onChange={(e) => setWalletRemark(e.target.value)}
              />
            </div>

            {/* Preview of new balance */}
            {walletAmt && Number(walletAmt) > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-semibold">Projected New Balance:</span>
                <span
                  className={`font-black text-sm ${
                    walletModal.mode === 'credit' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  ₹
                  {Math.max(
                    0,
                    walletModal.player.wallet +
                      Number(walletAmt) * (walletModal.mode === 'credit' ? 1 : -1)
                  ).toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setWalletModal(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn ${
                  walletModal.mode === 'credit'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {walletModal.mode === 'credit' ? 'Credit' : 'Debit'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= MODAL: VIEW PLAYER PROFILE ================= */}
      {viewPlayer && (
        <Modal
          title={`Player Profile · ${viewPlayer.user_name}`}
          onClose={() => setViewPlayer(null)}
          width="max-w-xl"
        >
          <div className="space-y-5">
            {/* Identity Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 p-5 text-white shadow-lg">
              <div className="relative z-10 flex items-center gap-4">
                <div
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${
                    viewPlayer.avatar_color || 'from-amber-500 to-orange-600'
                  } text-xl font-black shadow-md border-2 border-white/20`}
                >
                  {(viewPlayer.user_name || 'U').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold truncate">{viewPlayer.user_name}</h3>
                    <span
                      className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold ${getVipBadge(
                        viewPlayer.vip_level
                      )}`}
                    >
                      {viewPlayer.vip_level}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-blue-200 mt-0.5">
                    User ID: {viewPlayer.user_id} • Registered: {viewPlayer.created_at}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        viewPlayer.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-200'
                          : 'bg-rose-500/20 text-rose-200'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {viewPlayer.status}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-blue-100">
                      <ShieldCheck size={11} /> KYC {viewPlayer.kyc_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Financials Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Main Wallet</p>
                <p className="text-base font-black text-slate-900 mt-1">
                  ₹{Number(viewPlayer.wallet).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                <p className="text-[11px] font-bold text-emerald-600 uppercase">Winning Wallet</p>
                <p className="text-base font-black text-emerald-700 mt-1">
                  ₹{Number(viewPlayer.winning).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Total Turnover</p>
                <p className="text-base font-black text-slate-900 mt-1">
                  ₹{Number(viewPlayer.turnover || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase">Commission</p>
                <p className="text-base font-black text-blue-600 mt-1">
                  ₹{Number(viewPlayer.commission || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* Activity & Referral details */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Sponsor & Contact Info
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Mobile:</span>
                  <p className="font-bold text-slate-800 mt-0.5">{viewPlayer.mobile}</p>
                </div>
                <div>
                  <span className="text-slate-500">Email:</span>
                  <p className="font-bold text-slate-800 mt-0.5">{viewPlayer.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Sponsor Name:</span>
                  <p className="font-bold text-slate-800 mt-0.5">{viewPlayer.sponsor || 'Admin'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Sponsor ID:</span>
                  <p className="font-bold text-blue-600 mt-0.5">{viewPlayer.sponsor_id || 'ADM01'}</p>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => togglePlayerStatus(viewPlayer)}
                className={`btn-ghost text-xs font-bold ${
                  viewPlayer.status === 'Active' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                {viewPlayer.status === 'Active' ? 'Suspend Player' : 'Activate Player'}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setWalletModal({ player: viewPlayer, mode: 'credit' })
                    setViewPlayer(null)
                  }}
                  className="btn bg-emerald-600 hover:bg-emerald-700 text-xs font-bold"
                >
                  <Plus size={14} /> Add Fund
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditPlayer(viewPlayer)
                    setViewPlayer(null)
                  }}
                  className="btn text-xs font-bold"
                >
                  <Pencil size={14} /> Edit Player
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= MODAL: EDIT PLAYER ================= */}
      {editPlayer && (
        <Modal
          title={`Edit Player #${editPlayer.id} (${editPlayer.user_name})`}
          onClose={() => setEditPlayer(null)}
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">User Name</label>
                <input
                  className="input"
                  value={editPlayer.user_name}
                  onChange={(e) => setEditPlayer({ ...editPlayer, user_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Mobile Number</label>
                <input
                  className="input"
                  value={editPlayer.mobile}
                  onChange={(e) => setEditPlayer({ ...editPlayer, mobile: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">VIP Level</label>
                <select
                  className="input"
                  value={editPlayer.vip_level}
                  onChange={(e) => setEditPlayer({ ...editPlayer, vip_level: e.target.value })}
                >
                  <option>VIP 1</option>
                  <option>VIP 2</option>
                  <option>VIP 3</option>
                  <option>VIP 4</option>
                  <option>VIP 5</option>
                  <option>VIP 6</option>
                </select>
              </div>

              <div>
                <label className="label">KYC Status</label>
                <select
                  className="input"
                  value={editPlayer.kyc_status}
                  onChange={(e) => setEditPlayer({ ...editPlayer, kyc_status: e.target.value })}
                >
                  <option>Verified</option>
                  <option>Pending</option>
                  <option>Unverified</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Commission (₹)</label>
                <input
                  type="number"
                  className="input"
                  value={editPlayer.commission}
                  onChange={(e) => setEditPlayer({ ...editPlayer, commission: +e.target.value })}
                />
              </div>

              <div>
                <label className="label">Bonus (₹)</label>
                <input
                  type="number"
                  className="input"
                  value={editPlayer.bonus}
                  onChange={(e) => setEditPlayer({ ...editPlayer, bonus: +e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label">Account Status</label>
              <select
                className="input"
                value={editPlayer.status}
                onChange={(e) => setEditPlayer({ ...editPlayer, status: e.target.value })}
              >
                <option>Active</option>
                <option>Suspended</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setEditPlayer(null)}
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

      {/* ================= MODAL: REGISTER NEW PLAYER ================= */}
      {addModal && (
        <Modal title="Register New Player" onClose={() => setAddModal(false)}>
          <form onSubmit={handleAddNewPlayer} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Full Name / Username</label>
                <input
                  className="input"
                  placeholder="e.g. Vicky_Player"
                  value={newPlayer.user_name}
                  onChange={(e) => setNewPlayer({ ...newPlayer, user_name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Mobile Number</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="e.g. 9876543210"
                  value={newPlayer.mobile}
                  onChange={(e) => setNewPlayer({ ...newPlayer, mobile: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">VIP Level</label>
                <select
                  className="input"
                  value={newPlayer.vip_level}
                  onChange={(e) => setNewPlayer({ ...newPlayer, vip_level: e.target.value })}
                >
                  <option>VIP 1</option>
                  <option>VIP 2</option>
                  <option>VIP 3</option>
                  <option>VIP 4</option>
                  <option>VIP 5</option>
                  <option>VIP 6</option>
                </select>
              </div>

              <div>
                <label className="label">Initial Wallet (₹)</label>
                <input
                  type="number"
                  className="input"
                  placeholder="0.00"
                  value={newPlayer.initial_wallet}
                  onChange={(e) => setNewPlayer({ ...newPlayer, initial_wallet: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Sponsor Name</label>
                <input
                  className="input"
                  value={newPlayer.sponsor}
                  onChange={(e) => setNewPlayer({ ...newPlayer, sponsor: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Sponsor ID</label>
                <input
                  className="input"
                  value={newPlayer.sponsor_id}
                  onChange={(e) => setNewPlayer({ ...newPlayer, sponsor_id: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setAddModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn font-bold">
                Register Player
              </button>
            </div>
          </form>
        </Modal>
      )}

      {node}
    </div>
  )
}
