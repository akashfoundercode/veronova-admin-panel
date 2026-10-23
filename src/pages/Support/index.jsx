import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Headphones, MessageSquare, Plus, Pencil, Trash2, CheckCircle2,
  AlertCircle, ExternalLink, RefreshCw, Send, Phone, Mail,
  Bot, Clock, ShieldCheck, Copy, Check, FileSpreadsheet, X, Globe
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, Modal, useToast } from '@/components/ui'
import { apiRequest } from '@/utils/apiClient'
import { API_ENDPOINTS } from '@/constants/api'
import {
  getSupportSettings,
  saveSupportSettings,
  normalizeSupportSetting,
  deduplicateSettings,
} from './supportStore'

export default function Support() {
  const [rows, setRows] = useState(getSupportSettings)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  const [filterType, setFilterType] = useState('ALL')
  const [modal, setModal] = useState(null) // null | { mode: 'create' | 'edit', data: { ... } }
  const [copiedId, setCopiedId] = useState(null)
  const [toast, node] = useToast()

  const persist = (next) => {
    const clean = deduplicateSettings(next)
    setRows(clean)
    saveSupportSettings(clean)
  }

  // Load live support settings from /admin/support-settings
  const loadSettings = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      console.log(`[Veronova Support] Fetching from: ${API_ENDPOINTS.SUPPORT_SETTINGS_PROXY}`)
      const json = await apiRequest(API_ENDPOINTS.SUPPORT_SETTINGS_PROXY, { method: 'GET' })

      if (json && (json.status === 200 || json.data || Array.isArray(json))) {
        const payload = json.data || json
        let rawList = []

        if (Array.isArray(payload)) {
          rawList = payload
        } else if (payload.list || payload.settings || payload.support || payload.data) {
          rawList = payload.list || payload.settings || payload.support || payload.data
        } else if (typeof payload === 'object') {
          // If returned as key-value pairs (e.g. { whatsapp: '...', telegram: '...' })
          rawList = Object.entries(payload).map(([k, v], idx) => ({
            id: idx + 1,
            title: k.toUpperCase() + ' Support',
            channel: k,
            value: typeof v === 'object' ? (v.url || v.value || JSON.stringify(v)) : String(v),
            status: 'Active',
          }))
        }

        if (Array.isArray(rawList) && rawList.length > 0) {
          const formatted = rawList
            .map((item, idx) => normalizeSupportSetting(item, idx))
            .filter(Boolean)
          const clean = deduplicateSettings(formatted)
          setRows(clean)
          saveSupportSettings(clean)
          setLastSynced(new Date().toLocaleTimeString())
          console.log(`[Veronova Support] Synced ${clean.length} support channels`)
        }
      }
    } catch (err) {
      console.warn('[Veronova Support] Error syncing support settings, using local cache:', err.message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1800)
    toast(`Copied ${text} to clipboard!`)
  }

  // Quick Toggle Active/Inactive
  const handleToggleStatus = async (row) => {
    const nextStatus = row.status === 'Active' ? 'Inactive' : 'Active'
    const next = rows.map((r) => (r.id === row.id ? { ...r, status: nextStatus } : r))
    persist(next)
    toast(`${row.title} marked as ${nextStatus}!`)

    try {
      const itemUrl = API_ENDPOINTS.SUPPORT_SETTING_ITEM_PROXY(row.id)
      const payload = { ...row, status: nextStatus, is_active: nextStatus === 'Active' ? 1 : 0 }
      await apiRequest(itemUrl, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }).catch(async () => {
        await apiRequest(itemUrl, {
          method: 'POST',
          body: JSON.stringify(payload),
        }).catch(() => null)
      })
    } catch (err) {
      console.warn(`[Veronova Support] Failed to toggle status for #${row.id}:`, err.message)
    }
  }

  // Delete channel
  const handleDelete = async (row) => {
    if (!window.confirm(`Are you sure you want to delete "${row.title}"?`)) return

    const next = rows.filter((r) => r.id !== row.id)
    persist(next)
    toast(`${row.title} deleted successfully!`)

    try {
      const itemUrl = API_ENDPOINTS.SUPPORT_SETTING_ITEM_PROXY(row.id)
      await apiRequest(itemUrl, { method: 'DELETE' }).catch(() => null)
    } catch (err) {
      console.warn(`[Veronova Support] Failed to delete channel #${row.id}:`, err.message)
    }
  }

  // Submit Modal (Create or Edit)
  const handleSaveModal = async (e) => {
    e.preventDefault()
    const form = e.target
    const channelData = {
      title: form.title.value.trim(),
      channel: form.channel.value.trim().toLowerCase(),
      value: form.value.value.trim(),
      link: form.link.value.trim() || form.value.value.trim(),
      working_hours: form.working_hours.value.trim() || '24/7',
      status: form.status.value,
      description: form.description.value.trim(),
      updated_at: new Date().toLocaleDateString(),
    }

    if (modal.mode === 'create') {
      const newId = rows.length > 0 ? Math.max(...rows.map((r) => Number(r.id) || 0)) + 1 : 1
      const item = { ...channelData, id: newId }
      const next = [item, ...rows]
      persist(next)
      setModal(null)
      toast(`Support channel "${item.title}" created successfully!`)

      try {
        await apiRequest(API_ENDPOINTS.SUPPORT_SETTINGS_PROXY, {
          method: 'POST',
          body: JSON.stringify(item),
        }).catch(() => null)
      } catch (err) {
        console.warn('[Veronova Support] Create channel sync error:', err.message)
      }
    } else {
      const updated = { ...modal.data, ...channelData }
      const next = rows.map((r) => (r.id === updated.id ? updated : r))
      persist(next)
      setModal(null)
      toast(`Support channel "${updated.title}" updated successfully!`)

      try {
        const itemUrl = API_ENDPOINTS.SUPPORT_SETTING_ITEM_PROXY(updated.id)
        await apiRequest(itemUrl, {
          method: 'PUT',
          body: JSON.stringify(updated),
        }).catch(async () => {
          await apiRequest(itemUrl, {
            method: 'POST',
            body: JSON.stringify(updated),
          }).catch(() => null)
        })
      } catch (err) {
        console.warn(`[Veronova Support] Update channel sync error for #${updated.id}:`, err.message)
      }
    }
  }

  // Filtered Rows
  const displayRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterType === 'ACTIVE' && r.status !== 'Active') return false
      if (filterType === 'INACTIVE' && r.status !== 'Inactive') return false
      if (filterType === 'WHATSAPP' && !r.channel.includes('whatsapp')) return false
      if (filterType === 'TELEGRAM' && !r.channel.includes('telegram')) return false
      if (filterType === 'LIVECHAT' && !r.channel.includes('live') && !r.channel.includes('chat')) return false
      return true
    })
  }, [rows, filterType])

  const activeCount = useMemo(() => rows.filter((r) => r.status === 'Active').length, [rows])
  const inactiveCount = useMemo(() => rows.filter((r) => r.status === 'Inactive').length, [rows])
  const roundTheClockCount = useMemo(() => rows.filter((r) => r.working_hours.includes('24')).length, [rows])

  const exportCols = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Channel Name' },
    { key: 'channel', label: 'Platform Type' },
    { key: 'value', label: 'Contact Handle / URL' },
    { key: 'working_hours', label: 'Service Hours' },
    { key: 'status', label: 'Status' },
    { key: 'description', label: 'Description' },
    { key: 'updated_at', label: 'Last Updated' },
  ]

  const getChannelIcon = (type) => {
    const t = String(type).toLowerCase()
    if (t.includes('whatsapp')) return <Phone size={15} className="text-emerald-600" />
    if (t.includes('telegram')) return <Send size={15} className="text-blue-500" />
    if (t.includes('chat')) return <Bot size={15} className="text-indigo-600" />
    if (t.includes('mail')) return <Mail size={15} className="text-amber-600" />
    if (t.includes('phone')) return <Phone size={15} className="text-rose-600" />
    return <Globe size={15} className="text-slate-600" />
  }

  const cols = [
    { key: 'id', label: '#ID', render: (r) => <span className="font-mono text-xs font-bold text-slate-400">#{r.id}</span> },
    {
      key: 'channel_info',
      label: 'Channel & Platform',
      render: (r) => (
        <div className="flex items-center gap-2.5 min-w-[200px]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-200">
            {getChannelIcon(r.channel)}
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm block hover:text-blue-600 transition-colors">
              {r.title}
            </span>
            <span className="inline-block font-mono text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {r.channel}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'value',
      label: 'Contact Handle / Destination URL',
      render: (r) => (
        <div className="min-w-[220px]">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[220px]">
              {r.value}
            </span>
            <button
              onClick={() => handleCopy(r.value, r.id)}
              className="text-slate-400 hover:text-slate-600 transition"
              title="Copy handle"
            >
              {copiedId === r.id ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            </button>
            {r.link && r.link !== 'N/A' && (
              <a
                href={r.link}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:text-blue-700 transition"
                title="Open Link"
              >
                <ExternalLink size={12} />
              </a>
            )}
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5 truncate max-w-[240px]">
            {r.description}
          </span>
        </div>
      ),
    },
    {
      key: 'working_hours',
      label: 'Operational Timing',
      render: (r) => (
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
          <Clock size={12} className="text-blue-500 shrink-0" />
          <span>{r.working_hours}</span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <button
          onClick={() => handleToggleStatus(r)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all shadow-2xs ${
            r.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
          }`}
          title="Click to toggle status"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              r.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
          />
          {r.status}
        </button>
      ),
    },
    {
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setModal({ mode: 'edit', data: r })}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition"
            title="Edit Channel Details"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => handleDelete(r)}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition"
            title="Delete Support Channel"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageBanner
        title="Support Settings & Helpdesk Channels"
        icon={Headphones}
        crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Support Setting' }]}
      >
        <div className="flex flex-wrap items-center gap-2">
          {lastSynced && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-white/15 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Synced: {lastSynced}
            </span>
          )}
          <button
            onClick={() => loadSettings(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs px-3 py-2 text-xs font-bold text-white transition disabled:opacity-50"
            title="Sync Live Settings from Backend"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Sync Live</span>
          </button>
          <button
            onClick={() => setModal({ mode: 'create', data: {} })}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-md transition"
          >
            <Plus size={15} /> Add Support Channel
          </button>
        </div>
      </PageBanner>

      {/* KPI Performance Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Channels</p>
            <h3 className="text-xl font-bold text-emerald-600 mt-0.5 tracking-tight font-mono">
              {activeCount} Live
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Visible on player app</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">24/7 Coverage</p>
            <h3 className="text-xl font-bold text-blue-600 mt-0.5 tracking-tight font-mono">
              {roundTheClockCount} Desks
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Always available</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Clock size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Inactive Desks</p>
            <h3 className="text-xl font-bold text-slate-700 mt-0.5 tracking-tight font-mono">
              {inactiveCount} Paused
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Maintenance or standby</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <AlertCircle size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Endpoints</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              {rows.length} Configured
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Central helpdesk registry</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Headphones size={18} />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Segmented Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All Channels', count: rows.length },
              { id: 'ACTIVE', label: 'Active', count: activeCount },
              { id: 'INACTIVE', label: 'Inactive', count: inactiveCount },
              { id: 'WHATSAPP', label: 'WhatsApp', count: rows.filter((r) => r.channel.includes('whatsapp')).length },
              { id: 'TELEGRAM', label: 'Telegram', count: rows.filter((r) => r.channel.includes('telegram')).length },
              { id: 'LIVECHAT', label: 'Live Chat', count: rows.filter((r) => r.channel.includes('chat') || r.channel.includes('live')).length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  filterType === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                    filterType === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => exportCSV('support_settings_registry', exportCols, displayRows)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <FileSpreadsheet size={15} /> Export Registry
          </button>
        </div>

        <DataTable
          columns={cols}
          rows={displayRows}
          unit="channels"
          placeholder="Search by channel name, handle, or contact value..."
        />
      </div>

      {/* Add / Edit Support Setting Modal */}
      {modal && (
        <Modal
          isOpen={!!modal}
          onClose={() => setModal(null)}
          title={modal.mode === 'create' ? 'Add New Support Channel' : `Edit Channel: ${modal.data?.title}`}
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Channel Title / Display Name *
              </label>
              <input
                type="text"
                name="title"
                defaultValue={modal.data?.title || ''}
                required
                placeholder="e.g. WhatsApp VIP Helpdesk"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-medium text-slate-800 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Platform Type *
                </label>
                <select
                  name="channel"
                  defaultValue={modal.data?.channel || 'whatsapp'}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-bold text-slate-800 outline-none focus:border-blue-500 bg-white"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="telegram">Telegram</option>
                  <option value="livechat">Live Chat Widget</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone Helpline</option>
                  <option value="helpdesk">General Helpdesk</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Status *
                </label>
                <select
                  name="status"
                  defaultValue={modal.data?.status || 'Active'}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-bold text-slate-800 outline-none focus:border-blue-500 bg-white"
                >
                  <option value="Active">Active (Live on App)</option>
                  <option value="Inactive">Inactive (Hidden)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contact Handle / Phone / Email / URL *
              </label>
              <input
                type="text"
                name="value"
                defaultValue={modal.data?.value || ''}
                required
                placeholder="e.g. +91 98765 43210 or @VeronovaHelp"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-mono text-slate-800 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Direct Destination Link / Clickable URL
              </label>
              <input
                type="text"
                name="link"
                defaultValue={modal.data?.link || ''}
                placeholder="e.g. https://wa.me/919876543210 or https://t.me/handle"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-mono text-slate-800 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Operational Timing / Service Hours
              </label>
              <input
                type="text"
                name="working_hours"
                defaultValue={modal.data?.working_hours || '24/7'}
                placeholder="e.g. 24/7 or 09:00 AM - 11:00 PM"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-medium text-slate-800 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Internal Notes / Description
              </label>
              <textarea
                name="description"
                defaultValue={modal.data?.description || ''}
                rows={2}
                placeholder="Brief purpose or note for support agents..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 font-medium text-slate-800 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2 text-xs font-bold text-white shadow-md transition"
              >
                {modal.mode === 'create' ? 'Create Channel' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {node}
    </div>
  )
}
