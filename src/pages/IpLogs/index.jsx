import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Clock, ShieldCheck, MapPin, Globe, ShieldAlert, Laptop,
  Smartphone, Monitor, Copy, Check, Eye, Lock, Unlock, AlertTriangle,
  RefreshCw, Wifi, HelpCircle, ArrowUpRight, Search, Filter, Ban,
  Phone, Mail, UserCheck
} from 'lucide-react'
import DataTable from '@/components/DataTable'
import { PageBanner, Modal, useToast } from '@/components/ui'
import { apiRequest } from '@/utils/apiClient'
import { API_ENDPOINTS } from '@/constants/api'
import {
  getIpLogs,
  saveIpLogs,
  initialSummary,
  normalizeLoginLog,
} from './ipLogsStore'

export default function IpLogs({ today = false }) {
  const [logs, setLogs] = useState(getIpLogs)
  const [summary, setSummary] = useState(initialSummary)
  const [filterTab, setFilterTab] = useState(today ? 'TODAY' : 'ALL') // ALL, TODAY, MULTI, BLOCKED
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  const [inspectIp, setInspectIp] = useState(null)
  const [blockModal, setBlockModal] = useState(false)
  const [rulesModal, setRulesModal] = useState(false)
  const [manualIp, setManualIp] = useState('')
  const [manualReason, setManualReason] = useState('Multi-account syndication')
  const [copiedKey, setCopiedKey] = useState(null)

  const [toast, node] = useToast()

  // Copy helper
  const handleCopy = (text, key) => {
    if (!text || text === '—') return
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1800)
    toast(`Copied ${text} to clipboard!`)
  }

  // Fetch Login History from /admin/login-history
  const loadLoginHistory = useCallback(
    async (typeParam, isManual = false) => {
      if (isManual) setIsRefreshing(true)
      else setIsLoading(true)

      try {
        const activeType = typeParam || (today ? 'today' : 'all')
        // Uses Vite proxy endpoint /admin/login-history
        const endpoint = `${API_ENDPOINTS.LOGIN_HISTORY_PROXY}?type=${activeType}`
        console.log(`[Veronova IP Logs] Fetching login history from: ${endpoint}`)

        const json = await apiRequest(endpoint, { method: 'GET' })

        if (json && (json.status === 200 || json.data)) {
          const payload = json.data || json
          if (payload.summary) {
            setSummary((prev) => ({ ...prev, ...payload.summary }))
          }

          const rawList = payload.list || payload.history || payload.logins || []
          if (Array.isArray(rawList) && rawList.length > 0) {
            const formatted = rawList.map((item, idx) => normalizeLoginLog(item, idx))
            setLogs(formatted)
            saveIpLogs(formatted)
            setLastUpdated(new Date().toLocaleTimeString())
            console.log(`[Veronova IP Logs] Loaded ${formatted.length} login sessions`)
          }
        }
      } catch (err) {
        console.warn('[Veronova IP Logs] Error fetching live history, using local cache:', err.message)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [today]
  )

  // Initial load and filter change
  useEffect(() => {
    loadLoginHistory(today ? 'today' : (filterTab === 'TODAY' ? 'today' : 'all'))
  }, [today, filterTab, loadLoginHistory])

  // Persist updater
  const persistLogs = (updater) => {
    setLogs((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveIpLogs(next)
      return next
    })
  }

  // Toggle IP Block Status
  const toggleBlockIp = (item) => {
    const nextBlocked = !item.is_blocked
    persistLogs((prev) =>
      prev.map((l) => (l.ip === item.ip ? { ...l, is_blocked: nextBlocked } : l))
    )
    toast(
      nextBlocked
        ? `IP Address ${item.ip} has been blacklisted and blocked!`
        : `IP Address ${item.ip} unblocked and allowed.`
    )
    if (inspectIp?.ip === item.ip) {
      setInspectIp((prev) => ({ ...prev, is_blocked: nextBlocked }))
    }
  }

  // Handle Manual Block IP
  const handleManualBlock = (e) => {
    e.preventDefault()
    if (!manualIp.trim()) return toast('Please enter an IP address')
    const ipStr = manualIp.trim()

    persistLogs((prev) => {
      const exists = prev.some((l) => l.ip === ipStr)
      if (exists) {
        return prev.map((l) => (l.ip === ipStr ? { ...l, is_blocked: true } : l))
      }
      const newEntry = normalizeLoginLog({
        id: Math.max(0, ...prev.map((l) => l.id)) + 1,
        u_id: 'UNKNOWN',
        username: 'Suspicious Client',
        ip_address: ipStr,
        isp: 'External Network',
        location: 'Manual Blacklist',
        device: 'Unknown Client',
        security_tag: 'VPN / Proxy Alert',
        login_time: 'Just Now',
        date: new Date().toISOString().split('T')[0],
        is_today: true,
        is_blocked: true,
        accounts_on_ip: [],
      })
      return [newEntry, ...prev]
    })

    toast(`IP ${ipStr} added to security blacklist!`)
    setBlockModal(false)
    setManualIp('')
  }

  // KPI calculations prioritizing backend summary
  const totalLogins = summary.total_logins || summary.totalLogins || logs.length
  const todayCount = summary.today_logins || summary.todayLogins || logs.filter((l) => l.is_today || l.today).length
  const uniqueIps = summary.unique_ips || summary.uniqueIps || new Set(logs.map((l) => l.ip)).size
  const totalUsers = summary.total_users || summary.totalUsers || 3
  const todayUsers = summary.today_users || summary.todayUsers || 1
  const multiCount = useMemo(
    () => logs.filter((l) => (l.security_tag && l.security_tag.includes('Multi')) || (l.accounts_on_ip && l.accounts_on_ip.length > 1)).length,
    [logs]
  )
  const blockedCount = useMemo(() => logs.filter((l) => l.is_blocked).length, [logs])

  // Filtered rows for table
  const displayRows = useMemo(() => {
    return logs.filter((l) => {
      if (today && !l.is_today && !l.today) return false
      if (filterTab === 'TODAY' && !l.is_today && !l.today) return false
      if (filterTab === 'MULTI' && !(l.security_tag?.includes('Multi') || (l.accounts_on_ip && l.accounts_on_ip.length > 1))) return false
      if (filterTab === 'BLOCKED' && !l.is_blocked) return false
      return true
    })
  }, [logs, filterTab, today])

  // Columns Definition
  const cols = [
    {
      key: 'id',
      label: '#ID',
      render: (r) => (
        <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
          #{r.id}
        </span>
      ),
    },
    {
      key: 'user',
      label: 'Player Account & Contact',
      render: (r) => (
        <div className="flex items-center gap-2.5 min-w-[190px]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-xs shadow-xs shrink-0">
            {(r.user_name || r.user_id || 'AD').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-extrabold text-slate-900 text-sm truncate max-w-[130px]">{r.user_name}</p>
              {r.is_today && (
                <span className="rounded bg-emerald-50 text-emerald-700 text-[10px] font-black px-1 py-0.2 border border-emerald-200">
                  Today
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-1 rounded">
                {r.user_id}
              </span>
              <button
                onClick={() => handleCopy(r.user_id, `uid_${r.id}`)}
                className="text-slate-400 hover:text-slate-600"
                title="Copy User ID"
              >
                {copiedKey === `uid_${r.id}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
              </button>
            </div>
            {r.mobile && r.mobile !== '—' && (
              <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                <Phone size={10} className="text-slate-400" /> {r.mobile}
              </p>
            )}
            {r.email && r.email !== '—' && (
              <p className="text-[11px] text-slate-400 truncate max-w-[160px] flex items-center gap-1">
                <Mail size={10} className="text-slate-400" /> {r.email}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'ip',
      label: 'IP Address & Carrier',
      render: (r) => (
        <div className="min-w-[180px]">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {r.ip}
            </span>
            <button
              onClick={() => handleCopy(r.ip, `ip_${r.id}`)}
              className="text-slate-400 hover:text-slate-600"
              title="Copy IP"
            >
              {copiedKey === `ip_${r.id}` ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 font-semibold mt-1 flex items-center gap-1 truncate max-w-[190px]">
            <Wifi size={11} className="text-slate-400 shrink-0" /> {r.isp}
          </p>
          <p className="text-[10px] text-slate-400 truncate max-w-[190px] flex items-center gap-1 mt-0.5">
            <MapPin size={10} className="text-rose-400 shrink-0" /> {r.location}
          </p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Session Scope',
      render: (r) => {
        const isToday = r.is_today || r.today
        return (
          <div className="min-w-[130px]">
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold border ${
                isToday
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isToday ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {isToday ? 'Today Login' : 'Past Session'}
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5 font-medium">
              {r.security_tag || 'Standard Session'}
            </span>
          </div>
        )
      },
    },
    {
      key: 'time',
      label: 'Login Timestamp',
      render: (r) => (
        <div className="min-w-[140px]">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 font-mono">
            <Clock size={12} className="text-blue-500" /> {r.time}
          </span>
          {r.date && (
            <span className="block text-[11px] font-semibold text-slate-400 mt-0.5">
              Date: {r.date}
            </span>
          )}
        </div>
      ),
    },
    {
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setInspectIp(r)}
            className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-extrabold text-blue-700 hover:bg-blue-600 hover:text-white transition shadow-2xs cursor-pointer"
            title="Inspect IP Dossier"
          >
            <Eye size={13} /> Dossier
          </button>
          <button
            onClick={() => toggleBlockIp(r)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition shadow-2xs cursor-pointer ${
              r.is_blocked
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white'
            }`}
            title={r.is_blocked ? 'Unblock IP' : 'Blacklist & Block IP'}
          >
            {r.is_blocked ? <Unlock size={14} /> : <Lock size={14} />}
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Banner with live controls */}
      <PageBanner
        title={today ? "Today's Login User IP Records" : 'Login User IP Address Logs'}
        icon={today ? ShieldCheck : MapPin}
        crumbs={[
          { label: 'Dashboard', to: '/' },
          { label: today ? 'Today Login IP Details' : 'Login User IP Details' },
          { label: 'Live Telemetry' },
        ]}
      >
        <div className="flex flex-wrap items-center gap-2">
          {lastUpdated && (
            <span className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-[11px] text-white/90 font-medium">
              Synced: {lastUpdated}
            </span>
          )}
          <button
            onClick={() => loadLoginHistory(null, true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md px-3 py-2 text-xs font-bold text-white border border-white/30 hover:bg-white/30 transition shadow-xs cursor-pointer"
            title="Refresh Live Login History from Server"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Live'}</span>
          </button>
          <button
            onClick={() => setRulesModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white border border-white/30 hover:bg-white/30 transition shadow-sm cursor-pointer"
          >
            <HelpCircle size={14} /> Guide
          </button>
          <button
            onClick={() => setBlockModal(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-rose-700 shadow-xl transition-all hover:bg-rose-50 active:scale-95 cursor-pointer"
          >
            <Ban size={15} /> Blacklist IP
          </button>
        </div>
      </PageBanner>

      {/* Network IP Telemetry Stats Cards (from /admin/login-history summary) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Unique Network Footprints */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Unique Network IPs</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {uniqueIps} Distinct IPs
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{totalLogins} total sessions logged</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 shadow-2xs">
            <Globe size={19} />
          </div>
        </div>

        {/* Card 2: Today's Active Logins */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Today's Sessions</p>
            <h3 className="text-xl font-bold text-emerald-700 mt-0.5 tracking-tight font-mono">
              {todayCount} Active Today
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{todayUsers} users logged in today</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-2xs">
            <Wifi size={19} />
          </div>
        </div>

        {/* Card 3: Total Platform Users */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total User Accounts</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {totalUsers} Unique Users
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Across {totalLogins} login events</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-2xs">
            <UserCheck size={19} />
          </div>
        </div>

        {/* Card 4: Blacklisted & Collisions */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Security Intercepts</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {blockedCount} Blocked / {multiCount} Shared
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Subnet collision monitoring</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shadow-2xs">
            <Ban size={19} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card p-4 space-y-4 shadow-sm bg-white rounded-2xl border border-slate-200/80">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All Logins', count: totalLogins },
              { id: 'TODAY', label: "Today's Logins", count: todayCount },
              { id: 'MULTI', label: 'Shared / Multi-Account', count: multiCount },
              { id: 'BLOCKED', label: 'Blacklisted IPs', count: blockedCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
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
            Showing {displayRows.length} session records
          </div>
        </div>

        {/* The Main DataTable */}
        <DataTable
          columns={cols}
          rows={displayRows}
          exportName={today ? 'today-login-history' : 'login-history'}
          placeholder="Search by IP, User ID, name, mobile, email..."
        />
      </div>

      {/* ================= MODAL: IP DOSSIER ================= */}
      {inspectIp && (
        <Modal
          title={`IP Security Dossier · ${inspectIp.ip}`}
          onClose={() => setInspectIp(null)}
          width="max-w-2xl"
        >
          <div className="space-y-4">
            {/* Header info */}
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-5 text-white shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-xl font-black">{inspectIp.ip}</span>
                  <p className="text-xs text-blue-300 mt-0.5">{inspectIp.isp}</p>
                </div>
                <span
                  className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                    inspectIp.is_blocked
                      ? 'bg-rose-500 text-white'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {inspectIp.is_blocked ? 'BLACKLISTED' : 'CLEAN / ALLOWED'}
                </span>
              </div>
            </div>

            {/* Telemetry Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-slate-400 font-semibold">Associated Player:</span>
                <p className="font-bold text-slate-800 mt-0.5">
                  {inspectIp.user_name} ({inspectIp.user_id})
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-slate-400 font-semibold">Mobile / Contact:</span>
                <p className="font-bold text-slate-800 mt-0.5 font-mono">
                  {inspectIp.mobile || '—'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-slate-400 font-semibold">Email:</span>
                <p className="font-bold text-slate-800 mt-0.5">{inspectIp.email || '—'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-slate-400 font-semibold">Session Scope:</span>
                <p className="font-bold text-blue-700 mt-0.5">
                  {inspectIp.is_today ? 'Active Today' : 'Historical Session'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-slate-400 font-semibold">Location / GeoIP:</span>
                <p className="font-bold text-slate-800 mt-0.5">{inspectIp.location}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-slate-400 font-semibold">Recorded Login Time:</span>
                <p className="font-bold text-slate-800 mt-0.5 font-mono">{inspectIp.time}</p>
              </div>
            </div>

            {/* Accounts Associated with this IP */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
              <h4 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-blue-600" />
                Player Accounts Connected To This IP ({inspectIp.accounts_on_ip?.length || 1})
              </h4>
              <div className="flex flex-wrap gap-2">
                {(inspectIp.accounts_on_ip || [inspectIp.user_id]).map((uid) => (
                  <span
                    key={uid}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-mono font-bold text-slate-800 border border-slate-200 shadow-2xs"
                  >
                    {uid}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setInspectIp(null)}
              >
                Close
              </button>
              <button
                type="button"
                className={`btn font-bold ${
                  inspectIp.is_blocked ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
                onClick={() => toggleBlockIp(inspectIp)}
              >
                {inspectIp.is_blocked ? 'Unblock IP Address' : 'Blacklist IP Address'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= MODAL: MANUAL BLOCK IP ================= */}
      {blockModal && (
        <Modal title="Manual IP Address Blacklist" onClose={() => setBlockModal(false)}>
          <form onSubmit={handleManualBlock} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="label">Target IP Address</label>
              <input
                className="input font-mono font-bold"
                placeholder="e.g. 194.26.29.112"
                value={manualIp}
                onChange={(e) => setManualIp(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label">Reason / Infraction</label>
              <select
                className="input font-semibold"
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
              >
                <option value="Multi-account syndication">Multi-account syndication</option>
                <option value="Datacenter Proxy / VPN abuse">Datacenter Proxy / VPN abuse</option>
                <option value="Rapid bot automation attack">Rapid bot automation attack</option>
                <option value="Account takeover suspicious activity">Account takeover suspicious activity</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setBlockModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn bg-rose-600 hover:bg-rose-700 font-bold text-white">
                Blacklist IP Address
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ================= MODAL: CARRIER NAT GUIDE ================= */}
      {rulesModal && (
        <Modal title="IP Telemetry & Carrier NAT Architecture" onClose={() => setRulesModal(false)}>
          <div className="space-y-4 text-xs sm:text-sm text-slate-700">
            <div className="rounded-xl bg-blue-50 p-4 border border-blue-200">
              <h4 className="font-extrabold text-blue-950 mb-1 flex items-center gap-1.5">
                <Globe size={16} className="text-blue-600" /> Mobile CGNAT vs Dedicated Broadband
              </h4>
              <p className="text-slate-600 leading-relaxed text-xs">
                In India, mobile carriers (Jio, Airtel) frequently use Carrier-Grade NAT (CGNAT) where thousands of legitimate cellular users share dynamic public IPv4 pools.
              </p>
            </div>

            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Residential Clean:</strong> Legitimate cellular and fiber broadband IPs with healthy fraud scores.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Multi-Account Collision:</strong> Accounts that placed opposing bets while sharing identical IP address subnets within the same window.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldAlert size={16} className="text-rose-500 shrink-0 mt-0.5" />
                <span><strong>Datacenter Proxy:</strong> Non-residential ASNs (DigitalOcean, AWS, Tor exit nodes) frequently used for multi-bot automation.</span>
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
