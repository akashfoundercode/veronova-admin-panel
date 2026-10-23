import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Wallet, User, IndianRupee, Layers, MessageCircle, Send, History,
  TrendingUp, ShieldCheck, ArrowRight, CheckCircle2, Sparkles, Copy,
  Check, AlertCircle, Building2, Receipt, ArrowUpRight, Clock, Award,
  RefreshCw, KeyRound, LogIn
} from 'lucide-react'
import { PageBanner, Field, Modal, useToast, money } from '@/components/ui'
import fundTransferBg from '@/assets/images/FUND TRANSFER.png'
import { ROUTES } from '@/constants/routes'
import {
  getFundTransfers, saveFundTransfers,
  getSubtypes, saveSubtypes,
  normalizeFundTransferItem
} from './fundTransferStore'
import { apiRequest } from '@/utils/apiClient'
import auth from '@/utils/auth'
import { API_ENDPOINTS } from '@/constants/api'

// Known quick-select player suggestions
const playerSuggestions = [
  { id: 'VN_99814', name: 'Akash_Pro' },
  { id: 'MAMF1350', name: 'Rahul_Champ' },
  { id: 'VZPH8680', name: 'User_L13HY' },
  { id: 'HLYY2860', name: 'User_4CMBA' },
  { id: 'KRNX7721', name: 'Karan_Striker' },
]

export default function FundTransferAdd() {
  const [rows, setRows] = useState(getFundTransfers)
  const [subtypes, setSubtypes] = useState(getSubtypes)
  const [userId, setUserId] = useState('')
  const [userName, setUserName] = useState('')
  const [amount, setAmount] = useState('')
  const [selectedSubtypeId, setSelectedSubtypeId] = useState('37')
  const [type, setType] = useState('FUND TRANSFER')
  const [remark, setRemark] = useState('')
  const [receiptModal, setReceiptModal] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [toast, node] = useToast()

  // API States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiError, setApiError] = useState(null)

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
    toast(`Copied ${text} to clipboard!`)
  }

  // Handle player selection
  const handleSelectPlayer = (player) => {
    setUserId(player.id)
    setUserName(player.name)
  }

  // Fetch Subtypes from History API
  const fetchSubtypes = useCallback(async () => {
    try {
      const endpoints = [
        API_ENDPOINTS.FUND_TRANSFER_HISTORY_PROXY,
        API_ENDPOINTS.FUND_TRANSFER_HISTORY_API_PROXY,
      ]
      for (const ep of endpoints) {
        try {
          const json = await apiRequest(ep, { method: 'GET' })
          const payload = json.data || json
          if (Array.isArray(payload.subtypes) && payload.subtypes.length > 0) {
            setSubtypes(payload.subtypes)
            saveSubtypes(payload.subtypes)
            console.log('[Veronova Fund Transfer] Subtypes loaded:', payload.subtypes)
            break
          }
        } catch (e) {
          if (e.status === 404) continue
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    fetchSubtypes()
  }, [fetchSubtypes])

  // Submit Handler for POST /admin/fund-transfer
  const send = async (e) => {
    e?.preventDefault()
    setApiError(null)

    const targetUser = userId.trim()
    if (!targetUser) return toast('Please enter or select a User ID')
    const numAmt = Number(amount)
    if (!numAmt || numAmt <= 0) return toast('Please enter a valid transfer amount')

    setIsSubmitting(true)

    const now = new Date()
    const date = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()} ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    const txId = 'TXN_' + Math.floor(1000000 + Math.random() * 9000000)

    // Find subtype details
    const chosenSubtype = subtypes.find((s) => String(s.id) === String(selectedSubtypeId))
    const transferTypeName = chosenSubtype?.name || type || 'FUND TRANSFER'

    const payload = {
      user_id: targetUser,
      u_id: targetUser,
      username: userName.trim() || undefined,
      amount: numAmt,
      type: Number(selectedSubtypeId) || 37,
      type_name: transferTypeName,
      subtype_id: Number(selectedSubtypeId) || undefined,
      remark: remark.trim() || 'Manual transfer by admin',
      description: remark.trim() || transferTypeName,
    }

    const endpoints = [
      API_ENDPOINTS.FUND_TRANSFER_PROXY,     // '/admin/fund-transfer'
      API_ENDPOINTS.FUND_TRANSFER_API_PROXY, // '/api/admin/fund-transfer'
    ]

    let serverResponse = null
    let success = false
    let lastErr = null

    for (const ep of endpoints) {
      try {
        console.log(`[Veronova Fund Transfer] POST to ${ep}...`, payload)
        serverResponse = await apiRequest(ep, {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        console.log(`[Veronova Fund Transfer] Response from ${ep}:`, serverResponse)
        success = true
        break
      } catch (err) {
        lastErr = err
        if (err.status === 404) continue
        break
      }
    }

    if (success || !lastErr) {
      const respData = serverResponse?.data || serverResponse || {}
      const createdEntry = {
        id: respData.id || respData['#'] || Math.max(0, ...rows.map((r) => r.id || 0)) + 1,
        tx_id: respData.tx_id || txId,
        user: targetUser.toUpperCase(),
        user_name: userName.trim() || respData.username || 'Verified Player',
        amount: numAmt,
        remark: remark.trim() || 'Manual transfer by admin',
        desc: transferTypeName.toUpperCase(),
        date,
        operator: 'Super Admin (ADM01)',
        status: 'Completed',
      }

      const updated = [createdEntry, ...rows]
      setRows(updated)
      saveFundTransfers(updated)

      // Show receipt modal
      setReceiptModal(createdEntry)
      toast(`₹${numAmt.toLocaleString('en-IN')} transferred to ${createdEntry.user}!`)

      // Reset form fields
      setUserId('')
      setUserName('')
      setAmount('')
      setRemark('')
    } else {
      console.error('[Veronova Fund Transfer] POST failed:', lastErr)
      setApiError(lastErr.message || 'Transfer failed on server')
      toast(`Transfer failed: ${lastErr.message}`)
    }

    setIsSubmitting(false)
  }

  const totalTransferred = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  const addFundVolume = rows
    .filter((r) => String(r.desc).toUpperCase().includes('ADD'))
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  const bonusVolume = rows
    .filter((r) => String(r.desc).toUpperCase().includes('BONUS'))
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
  const recentTransfers = rows.slice(0, 5)

  return (
    <div className="space-y-6">
      <PageBanner
        title="Admin Fund Transfer"
        icon={Wallet}
        bgImage={fundTransferBg}
        crumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Fund Transfer', to: ROUTES.FUND_TRANSFER_ADD },
          { label: 'Add Fund' },
        ]}
      >
        <Link
          to={ROUTES.FUND_TRANSFER_HISTORY}
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-extrabold text-blue-700 shadow-xl transition-all hover:bg-blue-50 hover:shadow-2xl hover:scale-105 active:scale-95"
        >
          <History size={16} /> Transfer History Records
        </Link>
      </PageBanner>

      {/* API Notice if any */}
      {apiError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 shadow-sm flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span>Notice: {apiError}</span>
          </div>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card relative overflow-hidden p-5 border-l-4 border-l-blue-600 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Transferred</p>
              <h3 className="mt-1 text-2xl font-black text-blue-600">
                ₹{totalTransferred.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                <TrendingUp size={12} className="text-blue-600" /> {rows.length} Total manual credits
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-xs">
              <IndianRupee size={24} />
            </div>
          </div>
        </div>

        <div className="card relative overflow-hidden p-5 border-l-4 border-l-emerald-500 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Add Fund Credits</p>
              <h3 className="mt-1 text-2xl font-black text-emerald-600">
                ₹{addFundVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                Deposit wallet balance
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-xs">
              <Wallet size={24} />
            </div>
          </div>
        </div>

        <div className="card relative overflow-hidden p-5 border-l-4 border-l-purple-600 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Bonus & Rewards Given</p>
              <h3 className="mt-1 text-2xl font-black text-purple-600">
                ₹{bonusVolume.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <p className="mt-1 text-[11px] font-semibold text-purple-600">
                Promotional credits
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 shadow-xs">
              <Award size={24} />
            </div>
          </div>
        </div>

        <div className="card relative overflow-hidden p-5 border-l-4 border-l-indigo-600 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Master Vault Balance</p>
              <h3 className="mt-1 text-2xl font-black text-slate-800">₹50,00,000.00</h3>
              <p className="mt-1 text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck size={12} /> Master Liquidity Active
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-xs">
              <Building2 size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Transfer Terminal */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Form: 7 cols */}
        <div className="card p-5 sm:p-6 shadow-sm lg:col-span-7">
          <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-xs">
                <Send size={22} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-800 sm:text-lg">Manual Wallet Transfer</h3>
                <p className="text-xs text-slate-500">Credit funds or promotional bonuses to any player instantly</p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
              ● Live Engine
            </span>
          </div>

          <form onSubmit={send} className="space-y-4">
            {/* Quick Suggestions */}
            <div>
              <label className="label">Quick Select Player</label>
              <div className="flex flex-wrap gap-1.5">
                {playerSuggestions.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => handleSelectPlayer(p)}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                      userId === p.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
                    }`}
                  >
                    {p.name} <span className="font-mono text-[10px] text-slate-400">({p.id})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-1.5">
                  <User size={14} className="text-blue-600" /> Player User ID
                </label>
                <input
                  className="input font-mono font-bold"
                  placeholder="e.g. VN_99814"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">Player Name (Optional)</label>
                <input
                  className="input"
                  placeholder="e.g. Akash_Pro"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
            </div>

            {/* Amount with Quick Chips */}
            <div>
              <label className="label flex items-center gap-1.5">
                <IndianRupee size={14} className="text-blue-600" /> Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  className="input !pl-8 text-base font-extrabold text-slate-900"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              {/* Amount Preset Chips */}
              <div className="mt-2.5 grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {[100, 500, 1000, 2000, 5000, 10000].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setAmount(String(val))}
                    className={`rounded-lg border py-1 text-xs font-bold transition ${
                      amount === String(val)
                        ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-400'
                    }`}
                  >
                    +₹{val >= 1000 ? `${val / 1000}k` : val}
                  </button>
                ))}
              </div>
            </div>

            {/* Transfer Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label flex items-center gap-1.5">
                  <Layers size={14} className="text-blue-600" /> Transfer Type / Subtype
                </label>
                <select
                  className="input font-semibold"
                  value={selectedSubtypeId}
                  onChange={(e) => {
                    const val = e.target.value
                    setSelectedSubtypeId(val)
                    const found = subtypes.find((s) => String(s.id) === val)
                    if (found) setType(found.name)
                    else if (val === '37') setType('FUND TRANSFER')
                    else if (val === '36') setType('ADD FUND')
                  }}
                >
                  <option value="37">FUND TRANSFER (Manual Balance)</option>
                  <option value="36">ADD FUND (Deposit Credit)</option>
                  {subtypes.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} {st.status === 0 ? '· (Disabled)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label flex items-center gap-1.5">
                  <MessageCircle size={14} className="text-blue-600" /> Remark / Note
                </label>
                <input
                  className="input"
                  placeholder="e.g. VIP deposit bonus"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </div>
            </div>

            {/* Remark Preset Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400">Quick Remarks:</span>
              {['VIP Bonus', 'Manual Recharge Assistance', 'Tournament Reward', 'Goodwill Credit'].map((txt) => (
                <button
                  type="button"
                  key={txt}
                  onClick={() => setRemark(txt)}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                >
                  {txt}
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-500" /> Real-time wallet credit
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn px-6 py-2.5 font-extrabold shadow-md shadow-blue-500/25 flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} /> Execute Transfer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Live Voucher Preview: 5 cols */}
        <div className="space-y-4 lg:col-span-5">
          <div className="card relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-6 text-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Receipt size={18} className="text-blue-400" />
                <span className="text-xs font-black uppercase tracking-widest text-blue-200">
                  Live Transfer Voucher
                </span>
              </div>
              <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-500/30">
                READY
              </span>
            </div>

            {/* Big Amount */}
            <div className="my-6 text-center">
              <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">
                Transfer Amount
              </p>
              <h2 className="mt-1 text-3xl sm:text-4xl font-black text-white">
                ₹{amount ? Number(amount).toLocaleString('en-IN') : '0.00'}
              </h2>
              <span className="mt-2 inline-block rounded-full bg-blue-500/20 px-3 py-0.5 text-xs font-extrabold text-blue-200 border border-blue-400/30">
                {type}
              </span>
            </div>

            {/* Voucher Details list */}
            <div className="space-y-2.5 rounded-xl bg-white/5 p-4 text-xs backdrop-blur-xs border border-white/10">
              <div className="flex justify-between">
                <span className="text-slate-400">Recipient ID:</span>
                <span className="font-mono font-bold text-white">{userId || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Player Name:</span>
                <span className="font-bold text-white">{userName || (userId ? 'Verified User' : '—')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Authorized Source:</span>
                <span className="font-semibold text-blue-200">Admin Master Vault</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Remark / Purpose:</span>
                <span className="font-semibold text-slate-300 truncate max-w-[180px]">{remark || 'Admin Transfer'}</span>
              </div>
            </div>

            {/* Footer note */}
            <div className="mt-4 flex items-center gap-2 text-[11px] text-blue-300">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Funds will reflect immediately in the player wallet upon confirmation.</span>
            </div>
          </div>

          {/* Quick link to history card */}
          <div className="card p-4 border border-blue-100 bg-blue-50/50 flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm">Need Past Transaction Records?</h4>
              <p className="text-xs text-slate-500">Search, filter and export all completed transfers</p>
            </div>
            <Link
              to={ROUTES.FUND_TRANSFER_HISTORY}
              className="btn !py-2 text-xs font-bold flex items-center gap-1.5"
            >
              Open History <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Transfers Log */}
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <h4 className="font-bold text-slate-800 text-sm sm:text-base">Recent Fund Transfers</h4>
          </div>
          <Link
            to={ROUTES.FUND_TRANSFER_HISTORY}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All ({rows.length}) <ArrowRight size={14} />
          </Link>
        </div>

        <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50">
          {recentTransfers.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-3 p-3.5 hover:bg-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xs">
                  #{r.id}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900">{r.user_name || r.user}</span>
                    <span className="font-mono text-[11px] text-slate-500 bg-slate-200/60 px-1 rounded">
                      {r.user}
                    </span>
                    <button
                      onClick={() => handleCopy(r.user, r.id)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      {copiedId === r.id ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {r.date} • {r.remark || '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-extrabold text-blue-700 border border-blue-200">
                  {r.desc}
                </span>
                <span className="text-base font-black text-emerald-600">
                  +₹{Number(r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <button
                  onClick={() => setReceiptModal(r)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
                  title="View Receipt Voucher"
                >
                  <Receipt size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MODAL: DIGITAL TRANSFER RECEIPT ================= */}
      {receiptModal && (
        <Modal title="Transfer Transaction Receipt" onClose={() => setReceiptModal(null)}>
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 p-6 text-white text-center shadow-lg">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                <CheckCircle2 size={26} />
              </div>
              <p className="text-xs uppercase tracking-widest text-blue-200 font-bold">Transfer Successful</p>
              <h2 className="mt-1 text-3xl font-black">
                ₹{Number(receiptModal.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
              <p className="mt-1 font-mono text-xs text-blue-200">Tx ID: {receiptModal.tx_id || `TXN_${receiptModal.id}`}</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient ID:</span>
                <span className="font-mono font-bold text-slate-800">{receiptModal.user}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient Name:</span>
                <span className="font-bold text-slate-800">{receiptModal.user_name || 'Verified Player'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transfer Type:</span>
                <span className="font-bold text-blue-700">{receiptModal.desc}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Remark:</span>
                <span className="font-medium text-slate-700">{receiptModal.remark}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Timestamp:</span>
                <span className="font-medium text-slate-700">{receiptModal.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Operator:</span>
                <span className="font-semibold text-slate-800">{receiptModal.operator || 'Super Admin (ADM01)'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button className="btn w-full" onClick={() => setReceiptModal(null)}>
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}



      {node}
    </div>
  )
}
