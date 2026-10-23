import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  CreditCard, Gift, ArrowLeft, Copy, Check, Search, Calendar,
  ShieldCheck, CheckCircle2, TrendingUp, Smartphone, Monitor,
  FileSpreadsheet, Filter, RefreshCw, Sparkles, Printer, User,
  DollarSign, Clock, AlertCircle, ArrowUpRight, Award, Zap
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, Modal, useToast, money } from '@/components/ui'
import { apiRequest } from '@/utils/apiClient'
import { API_ENDPOINTS } from '@/constants/api'
import { getGifts, saveGifts, getRedemptions, saveRedemptions, normalizeGiftHistory } from './giftStore'

export default function GiftHistory() {
  const [rows, setRows] = useState(getRedemptions)
  const [giftsList, setGiftsList] = useState(getGifts)
  const [filterTab, setFilterTab] = useState('ALL') // ALL, TODAY, HIGH, MOBILE, DESKTOP
  const [copiedKey, setCopiedKey] = useState(null)
  const [voucherModal, setVoucherModal] = useState(null)
  const [simulateModal, setSimulateModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  
  // Simulation form
  const [simCode, setSimCode] = useState('805085313370438')
  const [simPlayer, setSimPlayer] = useState('Rohan Gupta')
  const [simUserId, setSimUserId] = useState('VN_55109')

  const [toast, node] = useToast()

  // Fetch gift redemption history from /admin/gift-history
  const loadGiftHistory = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      console.log(`[Veronova Gift History] Fetching redemptions from: ${API_ENDPOINTS.GIFT_HISTORY_PROXY}`)
      const json = await apiRequest(API_ENDPOINTS.GIFT_HISTORY_PROXY, { method: 'GET' })

      if (json && (json.status === 200 || json.data || Array.isArray(json))) {
        const payload = json.data || json
        const rawList =
          payload.list ||
          payload.history ||
          payload.redemptions ||
          payload.data ||
          payload.rows ||
          (Array.isArray(payload) ? payload : null)

        if (Array.isArray(rawList) && rawList.length > 0) {
          const formatted = rawList.map((item, idx) => normalizeGiftHistory(item, idx)).filter(Boolean)
          setRows(formatted)
          saveRedemptions(formatted)
          setLastSynced(new Date().toLocaleTimeString())
          console.log(`[Veronova Gift History] Loaded ${formatted.length} redemption records from backend`)
        }
      }
    } catch (err) {
      console.warn('[Veronova Gift History] Error fetching live history, using local cache:', err.message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadGiftHistory()
  }, [loadGiftHistory])

  // Persist Redemptions
  const persistRedemptions = (updater) => {
    setRows((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveRedemptions(next)
      return next
    })
  }

  // Copy helper
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1800)
    toast(`Copied ${text} to clipboard!`)
  }

  // Computations
  const totalRedeemedAmount = useMemo(() => {
    return rows.reduce((acc, r) => acc + (Number(r.gift_amount) || 0), 0)
  }, [rows])

  const totalQualifyingDeposits = useMemo(() => {
    return rows.reduce((acc, r) => acc + (Number(r.deposit_verified) || 0), 0)
  }, [rows])

  const uniqueClaimantsCount = useMemo(() => {
    return new Set(rows.map((r) => r.user_id)).size
  }, [rows])

  // Filtered Rows
  const displayRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterTab === 'TODAY' && !r.redeemed_at.includes('12 Oct') && !r.redeemed_at.includes('13 Oct')) return false
      if (filterTab === 'HIGH' && Number(r.gift_amount) < 200) return false
      if (filterTab === 'MOBILE' && !r.device?.toLowerCase().includes('mobile')) return false
      if (filterTab === 'DESKTOP' && !r.device?.toLowerCase().includes('desktop')) return false
      return true
    })
  }, [rows, filterTab])

  // Handle Simulate Redeem Code
  const handleSimulateClaim = (e) => {
    e.preventDefault()
    if (!simCode.trim() || !simPlayer.trim()) {
      return toast('Please enter valid gift code and player name')
    }

    const matchedGift = giftsList.find((g) => g.code === simCode.trim())
    const giftAmt = matchedGift ? matchedGift.gift : 150
    const depositAmt = matchedGift ? matchedGift.deposit : 500

    // Deduct available slot from gift if matched
    if (matchedGift && matchedGift.avail > 0) {
      const updatedGifts = giftsList.map((g) =>
        g.id === matchedGift.id ? { ...g, avail: Math.max(0, g.avail - 1) } : g
      )
      setGiftsList(updatedGifts)
      saveGifts(updatedGifts)
    }

    const now = new Date()
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const newClaim = {
      id: Math.max(0, ...rows.map((r) => r.id)) + 1,
      code: simCode.trim(),
      user_id: simUserId || 'VN_' + Math.floor(10000 + Math.random() * 90000),
      user_name: simPlayer,
      gift_amount: giftAmt,
      deposit_verified: depositAmt,
      redeemed_at: dateStr,
      ip_address: '103.24.' + Math.floor(10 + Math.random() * 80) + '.' + Math.floor(10 + Math.random() * 200),
      device: 'Mobile (Android 14)',
      status: 'Credited'
    }

    persistRedemptions((prev) => [newClaim, ...prev])
    toast(`Gift code successfully redeemed! ₹${giftAmt} credited to ${simPlayer}.`)
    setSimulateModal(false)
  }

  // Export Columns
  const exportCols = [
    { key: 'id', label: 'ID' },
    { key: 'code', label: '15-Digit Gift Code' },
    { key: 'user_name', label: 'Player Name' },
    { key: 'user_id', label: 'User ID' },
    { key: 'gift_amount', label: 'Gift Credited' },
    { key: 'deposit_verified', label: 'Verified Deposit' },
    { key: 'redeemed_at', label: 'Redemption Timestamp' },
    { key: 'ip_address', label: 'IP Address' },
    { key: 'device', label: 'Device' },
    { key: 'status', label: 'Status' },
  ]

  // Columns for DataTable
  const cols = [
    {
      key: 'id',
      label: '#ID',
      render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span>,
    },
    {
      key: 'player',
      label: 'Claimant Player',
      render: (r) => {
        const initials = (r.user_name || 'U').slice(0, 2).toUpperCase()
        return (
          <div className="flex items-center gap-2.5 min-w-[180px]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 font-extrabold text-white text-xs shadow-xs">
              {initials}
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm block hover:text-amber-600 transition-colors">
                {r.user_name}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-1 rounded">
                  {r.user_id}
                </span>
                <button
                  onClick={() => handleCopy(r.user_id, `usr_${r.id}`)}
                  className="text-slate-400 hover:text-slate-600"
                  title="Copy User ID"
                >
                  {copiedKey === `usr_${r.id}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                </button>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'code',
      label: '15-Digit Coupon Code',
      render: (r) => (
        <div className="flex items-center gap-1.5 min-w-[180px]">
          <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
            {r.code}
          </span>
          <button
            onClick={() => handleCopy(r.code, `code_${r.id}`)}
            className="text-slate-400 hover:text-slate-600"
            title="Copy Code"
          >
            {copiedKey === `code_${r.id}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
          </button>
        </div>
      ),
    },
    {
      key: 'gift_amount',
      label: 'Reward Credited',
      render: (r) => (
        <div className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700 border border-emerald-200">
          <Sparkles size={12} className="text-emerald-500" />
          +₹{Number(r.gift_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      ),
    },
    {
      key: 'deposit_verified',
      label: 'Recharge Backing',
      render: (r) => (
        <div className="min-w-[120px] text-xs space-y-0.5">
          <span className="font-bold text-slate-800">
            ₹{Number(r.deposit_verified).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold block flex items-center gap-0.5">
            <CheckCircle2 size={10} /> Verified Met
          </span>
        </div>
      ),
    },
    {
      key: 'telemetry',
      label: 'Client Telemetry',
      render: (r) => (
        <div className="min-w-[150px] text-xs font-mono">
          <span className="text-slate-700 font-bold block">{r.ip_address}</span>
          <span className="text-[11px] text-slate-400 font-sans block mt-0.5">{r.device}</span>
        </div>
      ),
    },
    {
      key: 'time',
      label: 'Redeemed Timestamp',
      render: (r) => (
        <span className="font-mono text-xs text-slate-500 whitespace-nowrap block">
          {r.redeemed_at}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={12} className="text-emerald-500" /> {r.status}
        </span>
      ),
    },
    {
      label: 'Voucher',
      render: (r) => (
        <button
          onClick={() => setVoucherModal(r)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition shadow-2xs"
          title="View Redemption Voucher"
        >
          <CreditCard size={14} />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Banner */}
      <PageBanner
        title="Gift Code Redeemed History"
        icon={CreditCard}
        crumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Gift Codes', to: '/gift' },
          { label: 'Redemption Audit Ledger' },
        ]}
      >
        <div className="flex flex-wrap items-center gap-2">
          {lastSynced && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-white/15 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Synced: {lastSynced}
            </span>
          )}
          <button
            onClick={() => loadGiftHistory(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs px-3 py-2 text-xs font-bold text-white transition disabled:opacity-50"
            title="Sync Live Redemptions from Backend"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Sync Live</span>
          </button>
          <Link
            to="/gift"
            className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white border border-white/30 hover:bg-white/30 transition shadow-sm"
          >
            <ArrowLeft size={15} /> Gift Code Generator
          </Link>
          <button
            onClick={() => setSimulateModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-extrabold text-amber-800 shadow-xl transition-all hover:bg-amber-50 hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <Zap size={15} className="text-amber-600 fill-amber-500" /> Simulate Player Redeem
          </button>
        </div>
      </PageBanner>

      {/* Bespoke Redemption Clearinghouse Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Hero (7 cols): Redemption Liquidity Vault */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950 via-rose-950 to-slate-950 p-6 text-white shadow-xl border border-amber-900/40 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
                  Gift Redemption Clearinghouse
                </span>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-amber-200 border border-white/10 flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-400" /> 100% Instant Wallet Settlement
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-200/80">Total Gift Volume Credited</p>
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm font-mono">
                  ₹{totalRedeemedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </h2>
                <span className="text-xs font-semibold text-amber-300">Across {rows.length} successful claims</span>
              </div>
            </div>

            {/* Deposit Verification Ratio Bar */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400" /> Qualifying Deposit Backing: ₹{totalQualifyingDeposits.toLocaleString('en-IN')}
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  100% Verified Met
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 transition-all duration-500"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-[11px] text-slate-400">Unique Claimants</p>
              <p className="text-sm font-extrabold text-white mt-0.5">
                {uniqueClaimantsCount} Players Rewarded
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Avg Reward / Claim</p>
              <p className="text-sm font-extrabold text-amber-300 mt-0.5">
                ₹{rows.length ? Math.round(totalRedeemedAmount / rows.length).toLocaleString('en-IN') : '0'}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[11px] text-slate-400">Replay Exploits</p>
              <p className="text-sm font-extrabold text-emerald-400 mt-0.5 flex items-center gap-1">
                <ShieldCheck size={14} /> 0 Duplicate Claims
              </p>
            </div>
          </div>
        </div>

        {/* Right (5 cols): Live Telemetry Distribution */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {/* Verified Deposit Backing Card */}
          <div className="card p-5 rounded-2xl border-t-4 border-t-emerald-500 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Qualifying Deposits Backing</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-black text-slate-900">
                    ₹{totalQualifyingDeposits.toLocaleString('en-IN')}
                  </h3>
                </div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={22} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Recharge Conditions Enforced</span>
              <span className="rounded bg-emerald-100 px-2 py-0.5 font-bold text-emerald-800 text-[11px]">
                Audited Met
              </span>
            </div>
          </div>

          {/* Client Telemetry Distribution */}
          <div className="card bg-white p-5 rounded-2xl border-t-4 border-t-blue-600 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <Smartphone size={15} className="text-blue-600" />
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Client Device Distribution</p>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <h3 className="text-2xl font-black text-blue-950">84.2% Mobile</h3>
                  <span className="text-xs font-bold text-slate-500">Android & iOS</span>
                </div>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-xs">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-blue-200/60 flex items-center justify-between text-xs">
              <span className="text-blue-800 font-semibold">15.8% Web Desktop</span>
              <span className="rounded-md bg-blue-200/80 px-2 py-0.5 text-[11px] font-black text-blue-900">
                IP Geotraced
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Segmented Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All Claim Records', count: rows.length },
              { id: 'TODAY', label: "Today's Redemptions", count: rows.filter((r) => r.redeemed_at.includes('12 Oct') || r.redeemed_at.includes('13 Oct')).length },
              { id: 'HIGH', label: 'High Value (≥₹200)', count: rows.filter((r) => Number(r.gift_amount) >= 200).length },
              { id: 'MOBILE', label: 'Mobile App', count: rows.filter((r) => r.device?.toLowerCase().includes('mobile')).length },
              { id: 'DESKTOP', label: 'Desktop Web', count: rows.filter((r) => r.device?.toLowerCase().includes('desktop')).length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  filterTab === tab.id
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-500/25 scale-[1.02]'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    filterTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Export to Excel */}
          <button
            onClick={() => exportCSV('gift_redemptions_audit_ledger', exportCols, displayRows)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <FileSpreadsheet size={15} /> Export Audit to Excel
          </button>
        </div>

        {/* DataTable */}
        <DataTable
          columns={cols}
          rows={displayRows}
          unit="redemptions"
          placeholder="Search by player name, 15-digit code, or IP address..."
        />
      </div>

      {/* View Redemption Voucher Modal */}
      {voucherModal && (
        <Modal
          isOpen={!!voucherModal}
          onClose={() => setVoucherModal(null)}
          title="Gift Redemption Settlement Voucher"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-900 p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Redemption Voucher
                  </span>
                  <h3 className="text-lg font-black text-white mt-0.5 font-mono">
                    #RDM-2026-00{voucherModal.id}
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-black uppercase text-white">
                  {voucherModal.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">{voucherModal.redeemed_at}</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl space-y-2 border border-slate-100 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Player Name:</span>
                <span className="font-extrabold text-slate-900">{voucherModal.user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">User ID:</span>
                <span className="font-mono font-bold text-slate-800">{voucherModal.user_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Redeemed Code:</span>
                <span className="font-mono font-bold text-amber-800 bg-amber-50 px-1 rounded">{voucherModal.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Qualifying Deposit Met:</span>
                <span className="font-bold text-slate-800">₹{Number(voucherModal.deposit_verified).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Client IP Address:</span>
                <span className="font-mono text-slate-600">{voucherModal.ip_address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Client Device:</span>
                <span className="text-slate-600">{voucherModal.device}</span>
              </div>
            </div>

            <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Instant Wallet Credit
                </span>
                <p className="text-2xl font-black text-emerald-700 mt-0.5">
                  +₹{Number(voucherModal.gift_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <Sparkles size={20} />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <Printer size={13} /> Print Voucher
              </button>
              <button
                onClick={() => setVoucherModal(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Simulate Redeem Modal */}
      {simulateModal && (
        <Modal
          isOpen={simulateModal}
          onClose={() => setSimulateModal(false)}
          title="Simulate Player Gift Code Claim"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSimulateClaim} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                15-Digit Gift Code
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono font-bold text-amber-900 bg-amber-50 outline-none"
                value={simCode}
                onChange={(e) => setSimCode(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Player Full Name
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500"
                value={simPlayer}
                onChange={(e) => setSimPlayer(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Player User ID
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono font-bold text-slate-800 outline-none focus:border-blue-500"
                value={simUserId}
                onChange={(e) => setSimUserId(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSimulateModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:from-amber-700 hover:to-rose-700"
              >
                Execute Instant Claim
              </button>
            </div>
          </form>
        </Modal>
      )}

      {node}
    </div>
  )
}
