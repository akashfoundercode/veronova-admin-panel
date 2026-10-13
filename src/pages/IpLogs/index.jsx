import { useState, useMemo } from 'react'
import {
  Clock, ShieldCheck, MapPin, Globe, ShieldAlert, Laptop,
  Smartphone, Monitor, Copy, Check, Eye, Lock, Unlock, AlertTriangle,
  TrendingUp, Wifi, HelpCircle, ArrowUpRight, Search, Filter, Ban
} from 'lucide-react'
import DataTable from '@/components/DataTable'
import { PageBanner, Modal, useToast } from '@/components/ui'
import { getIpLogs, saveIpLogs } from './ipLogsStore'

export default function IpLogs({ today = false }) {
  const [logs, setLogs] = useState(getIpLogs)
  const [filterTab, setFilterTab] = useState(today ? 'TODAY' : 'ALL') // ALL, TODAY, MULTI, VPN, BLOCKED
  const [inspectIp, setInspectIp] = useState(null)
  const [blockModal, setBlockModal] = useState(false)
  const [rulesModal, setRulesModal] = useState(false)
  const [manualIp, setManualIp] = useState('')
  const [manualReason, setManualReason] = useState('Multi-account syndication')
  const [copiedKey, setCopiedKey] = useState(null)

  const [toast, node] = useToast()

  // Copy helper
  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1800)
    toast(`Copied ${text} to clipboard!`)
  }

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
      const newEntry = {
        id: Math.max(0, ...prev.map((l) => l.id)) + 1,
        user_id: 'UNKNOWN',
        user_name: 'Suspicious Client',
        ip: ipStr,
        isp: 'External Network',
        location: 'Manual Blacklist',
        device: 'Unknown Client',
        security_tag: 'VPN / Proxy Alert',
        time: 'Just Now',
        full_date: new Date().toISOString(),
        today: true,
        is_blocked: true,
        accounts_on_ip: [],
      }
      return [newEntry, ...prev]
    })

    toast(`IP ${ipStr} added to security blacklist!`)
    setBlockModal(false)
    setManualIp('')
  }

  // KPI calculations
  const uniqueIps = useMemo(() => new Set(logs.map((l) => l.ip)).size, [logs])
  const todayCount = useMemo(() => logs.filter((l) => l.today).length, [logs])
  const vpnCount = useMemo(
    () => logs.filter((l) => l.security_tag.includes('VPN')).length,
    [logs]
  )
  const multiCount = useMemo(
    () => logs.filter((l) => l.security_tag.includes('Multi') || (l.accounts_on_ip && l.accounts_on_ip.length > 1)).length,
    [logs]
  )
  const blockedCount = useMemo(() => logs.filter((l) => l.is_blocked).length, [logs])

  // Filtered rows for table
  const displayRows = useMemo(() => {
    return logs.filter((l) => {
      if (today && !l.today) return false
      if (filterTab === 'TODAY' && !l.today) return false
      if (filterTab === 'MULTI' && !(l.security_tag.includes('Multi') || (l.accounts_on_ip && l.accounts_on_ip.length > 1))) return false
      if (filterTab === 'VPN' && !l.security_tag.includes('VPN')) return false
      if (filterTab === 'BLOCKED' && !l.is_blocked) return false
      return true
    })
  }, [logs, filterTab, today])

  // Device Icon Helper
  const getDeviceIcon = (device) => {
    if (device.includes('iPhone') || device.includes('Android') || device.includes('Mobile')) {
      return <Smartphone size={13} className="text-blue-500 shrink-0" />
    }
    if (device.includes('MacBook') || device.includes('Windows')) {
      return <Laptop size={13} className="text-purple-500 shrink-0" />
    }
    return <Monitor size={13} className="text-slate-500 shrink-0" />
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
      label: 'Player Account',
      render: (r) => (
        <div className="flex items-center gap-2.5 min-w-[170px]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-xs shadow-xs">
            {(r.user_name || r.user_id).slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-extrabold text-slate-900 text-sm">{r.user_name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-1 rounded">
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
          </div>
        </div>
      ),
    },
    {
      key: 'ip',
      label: 'IP Address & Carrier ISP',
      render: (r) => (
        <div className="min-w-[190px]">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
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
          <p className="text-[11px] text-slate-500 font-semibold mt-1 flex items-center gap-1 truncate max-w-[200px]">
            <Wifi size={11} className="text-slate-400 shrink-0" /> {r.isp}
          </p>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Geolocation',
      render: (r) => (
        <div className="min-w-[160px] text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <MapPin size={12} className="text-rose-500 shrink-0" />
            <span className="truncate max-w-[180px]">{r.location}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'device',
      label: 'Client Device & Agent',
      render: (r) => (
        <div className="flex items-center gap-1.5 min-w-[160px] text-xs font-medium text-slate-700">
          {getDeviceIcon(r.device)}
          <span className="truncate max-w-[170px]">{r.device}</span>
        </div>
      ),
    },
    {
      key: 'security_tag',
      label: 'Security Classification',
      render: (r) => {
        const isVpn = r.security_tag.includes('VPN')
        const isMulti = r.security_tag.includes('Multi')
        const badgeCls = isVpn
          ? 'bg-amber-50 text-amber-800 border-amber-200'
          : isMulti
          ? 'bg-rose-50 text-rose-800 border-rose-200'
          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        return (
          <div className="min-w-[150px]">
            <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-black border ${badgeCls}`}>
              {r.security_tag}
            </span>
            {r.accounts_on_ip && r.accounts_on_ip.length > 1 && (
              <span className="block text-[10px] text-rose-600 font-bold mt-0.5">
                ⚠ {r.accounts_on_ip.length} accounts on this IP
              </span>
            )}
          </div>
        )
      },
    },
    {
      key: 'time',
      label: 'Session Login Time',
      render: (r) => (
        <div className="min-w-[130px]">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
            <Clock size={12} /> {r.time}
          </span>
        </div>
      ),
    },
    {
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setInspectIp(r)}
            className="flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-extrabold text-blue-700 hover:bg-blue-600 hover:text-white transition shadow-2xs"
            title="Inspect IP Dossier"
          >
            <Eye size={13} /> Dossier
          </button>
          <button
            onClick={() => toggleBlockIp(r)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition shadow-2xs ${
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
      {/* Banner */}
      <PageBanner
        title={today ? "Today's Login User IP Records" : 'Login User IP Address Logs'}
        icon={today ? ShieldCheck : MapPin}
        crumbs={[
          { label: 'Dashboard', to: '/' },
          { label: today ? 'Today Login IP Details' : 'Login User IP Details' },
          { label: 'Security Telemetry' },
        ]}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setRulesModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white border border-white/30 hover:bg-white/30 transition shadow-sm"
          >
            <HelpCircle size={15} /> Carrier NAT & IP Guide
          </button>
          <button
            onClick={() => setBlockModal(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-extrabold text-rose-700 shadow-xl transition-all hover:bg-rose-50 hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <Ban size={16} /> Blacklist IP
          </button>
        </div>
      </PageBanner>

      {/* Compact, Sleek Network IP Telemetry Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Unique Network Footprints */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Unique Network IPs</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {uniqueIps} Distinct IPs
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">{logs.length} logged sessions</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
            <Globe size={18} />
          </div>
        </div>

        {/* Card 2: Today's Active Logins */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Today's Sessions</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {todayCount} Active Logins
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Residential carrier verified</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Wifi size={18} />
          </div>
        </div>

        {/* Card 3: Multi-Account Collisions */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Multi-Account Collisions</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {multiCount} Shared Clusters
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">&gt;1 player duplicate IP</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <AlertTriangle size={18} />
          </div>
        </div>

        {/* Card 4: Blacklisted & Proxies */}
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Proxy & Blacklist Filter</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {blockedCount} Blocked / {vpnCount} Proxies
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Subnet intercept active</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Ban size={18} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card p-4 space-y-4 shadow-sm">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All Sessions', count: logs.length },
              { id: 'TODAY', label: "Today's Logins", count: todayCount },
              { id: 'MULTI', label: 'Multi-Account Collisions', count: multiCount },
              { id: 'VPN', label: 'VPN & Proxy Alerts', count: vpnCount },
              { id: 'BLOCKED', label: 'Blacklisted IPs', count: blockedCount },
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
            Showing {displayRows.length} session logs
          </div>
        </div>

        {/* The Main DataTable */}
        <DataTable
          columns={cols}
          rows={displayRows}
          exportName={today ? 'today-user-ip-logs' : 'all-user-ip-logs'}
          placeholder="Search by IP, User ID, name, location, or ISP..."
        />
      </div>

      {/* ================= MODAL: IP DOSSIER ================= */}
      {inspectIp && (
        <Modal
          title={`IP Security Intelligence Dossier · ${inspectIp.ip}`}
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
                <span className="text-slate-400 font-semibold">Location:</span>
                <p className="font-bold text-slate-800 mt-0.5">{inspectIp.location}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-slate-400 font-semibold">User Agent / Device:</span>
                <p className="font-bold text-slate-800 mt-0.5">{inspectIp.device}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-slate-400 font-semibold">Classification:</span>
                <p className="font-bold text-blue-700 mt-0.5">{inspectIp.security_tag}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-slate-400 font-semibold">Last Session Recorded:</span>
                <p className="font-bold text-slate-800 mt-0.5">{inspectIp.time}</p>
              </div>
            </div>

            {/* Accounts Associated with this IP */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
              <h4 className="font-bold text-slate-900 text-xs mb-2 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-rose-600" />
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
              {inspectIp.accounts_on_ip && inspectIp.accounts_on_ip.length > 1 && (
                <p className="text-[11px] text-rose-700 font-semibold mt-2">
                  Warning: Multiple players actively shared this IP. Check for opposite hedging bets or duplicate bonus claims.
                </p>
              )}
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
                onClick={() => toggleBlockIp(inspectIp)}
                className={`btn font-bold text-xs ${
                  inspectIp.is_blocked
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {inspectIp.is_blocked ? 'Remove From Blacklist' : 'Blacklist & Block IP'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ================= MODAL: MANUAL BLACKLIST IP ================= */}
      {blockModal && (
        <Modal title="Add IP Address to Security Blacklist" onClose={() => setBlockModal(false)}>
          <form onSubmit={handleManualBlock} className="space-y-4">
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
              <button type="submit" className="btn bg-rose-600 hover:bg-rose-700 font-bold">
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
                <span><strong>Multi-Account Collision:</strong> Accounts that placed opposing bets while sharing identical IP address subnets within the same 5-minute window.</span>
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
