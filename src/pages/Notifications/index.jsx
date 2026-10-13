import { useState, useMemo } from 'react'
import {
  Bell, Send, Plus, Megaphone, Smartphone, MessageSquare, Sparkles,
  Users, CheckCircle2, Clock, Trash2, Eye, Copy, AlertCircle, ArrowUpRight,
  Radio, Layers
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, Modal, useToast } from '@/components/ui'

const SEED_NOTIFICATIONS = [
  {
    id: 'NOTIF-901',
    title: '🔥 Weekend Aviator Crash 2.0x Insurance!',
    body: 'Place bets on Aviator this Saturday and Sunday. Get 10% cash refund if plane crashes below 1.20x!',
    channel: 'In-App Popup',
    audience: 'All Players',
    recipients: 28450,
    read_rate: '54.2%',
    status: 'Live',
    sent_at: '13 Oct 2026, 09:00 AM',
    action_url: '/aviator',
    action_label: 'Play Aviator Now',
  },
  {
    id: 'NOTIF-902',
    title: '👑 Exclusive VIP 5+ Royal Deposit Match Bonus',
    body: 'Deposit ₹10,000 or more today and receive an instant ₹3,000 cash credit directly into your playable wallet.',
    channel: 'Personal Inbox',
    audience: 'VIP Tier 5+',
    recipients: 420,
    read_rate: '89.4%',
    status: 'Live',
    sent_at: '12 Oct 2026, 14:30 PM',
    action_url: '/deposit',
    action_label: 'Claim VIP Bonus',
  },
  {
    id: 'NOTIF-903',
    title: '⚡ Instant IMPS Payouts Operational 24/7',
    body: 'All bank withdrawal channels are functioning with zero latency. Processing time is currently under 60 seconds.',
    channel: 'Marquee Ticker',
    audience: 'All Players',
    recipients: 32100,
    read_rate: '98.0%',
    status: 'Live',
    sent_at: '12 Oct 2026, 11:00 AM',
    action_url: '/withdrawal',
    action_label: 'View Status',
  },
  {
    id: 'NOTIF-904',
    title: '🎁 Red Envelope Flash Drop in 30 Minutes!',
    body: 'Prepare your wallets! 500 lucky envelopes containing up to ₹1,000 each are dropping in the Gift Center.',
    channel: 'Push Notification',
    audience: 'Active (Last 24h)',
    recipients: 12500,
    read_rate: '46.1%',
    status: 'Completed',
    sent_at: '11 Oct 2026, 18:30 PM',
    action_url: '/gift',
    action_label: 'Go to Gift Center',
  },
  {
    id: 'NOTIF-905',
    title: '💎 Welcome Back Gift: 100% Reload Bonus',
    body: 'We missed you! Log in today to claim a special ₹500 reload credit on your next recharge.',
    channel: 'SMS Gateway',
    audience: 'Dormant (7+ Days)',
    recipients: 5800,
    read_rate: '22.8%',
    status: 'Scheduled',
    sent_at: '14 Oct 2026, 10:00 AM',
    action_url: '/deposit',
    action_label: 'Recharge & Claim',
  },
]

export default function Notifications() {
  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem('veronova_broadcasts_v1')
      return raw ? JSON.parse(raw) : SEED_NOTIFICATIONS
    } catch {
      return SEED_NOTIFICATIONS
    }
  })

  const [activeTab, setActiveTab] = useState('ALL')
  const [composeModal, setComposeModal] = useState(false)
  const [previewModal, setPreviewModal] = useState(null)
  const [toast, node] = useToast()

  const [draft, setDraft] = useState({
    title: '',
    body: '',
    channel: 'In-App Popup',
    audience: 'All Players',
    action_url: '/offer',
    action_label: 'Claim Now',
    schedule_type: 'now',
  })

  const saveToStorage = (data) => {
    setNotifications(data)
    try {
      localStorage.setItem('veronova_broadcasts_v1', JSON.stringify(data))
    } catch {}
  }

  const filteredList = useMemo(() => {
    if (activeTab === 'ALL') return notifications
    if (activeTab === 'LIVE') return notifications.filter((n) => n.status === 'Live')
    if (activeTab === 'SCHEDULED') return notifications.filter((n) => n.status === 'Scheduled')
    if (activeTab === 'MARQUEE') return notifications.filter((n) => n.channel === 'Marquee Ticker')
    return notifications.filter((n) => n.channel.toLowerCase().includes(activeTab.toLowerCase()))
  }, [notifications, activeTab])

  const handleSendBroadcast = (e) => {
    e.preventDefault()
    if (!draft.title || !draft.body) {
      toast('Please enter both title and notification body')
      return
    }

    const newNotif = {
      id: `NOTIF-${Math.floor(900 + Math.random() * 900)}`,
      title: draft.title,
      body: draft.body,
      channel: draft.channel,
      audience: draft.audience,
      recipients: draft.audience === 'VIP Tier 5+' ? 450 : draft.audience === 'All Players' ? 29100 : 8500,
      read_rate: '0.0%',
      status: draft.schedule_type === 'now' ? 'Live' : 'Scheduled',
      sent_at: draft.schedule_type === 'now' ? 'Just now' : 'Tomorrow, 10:00 AM',
      action_url: draft.action_url,
      action_label: draft.action_label,
    }

    const next = [newNotif, ...notifications]
    saveToStorage(next)
    setComposeModal(false)
    setDraft({
      title: '',
      body: '',
      channel: 'In-App Popup',
      audience: 'All Players',
      action_url: '/offer',
      action_label: 'Claim Now',
      schedule_type: 'now',
    })
    toast(`Broadcast "${newNotif.title}" dispatched successfully!`)
  }

  const handleDelete = (id) => {
    const next = notifications.filter((n) => n.id !== id)
    saveToStorage(next)
    toast('Notification campaign removed')
  }

  const handleToggleStatus = (id) => {
    const next = notifications.map((n) => {
      if (n.id === id) {
        const nextStatus = n.status === 'Live' ? 'Completed' : 'Live'
        return { ...n, status: nextStatus }
      }
      return n
    })
    saveToStorage(next)
    toast('Broadcast campaign status updated')
  }

  const cols = [
    {
      key: 'id',
      label: 'Campaign Code',
      render: (r) => (
        <div>
          <span className="font-mono text-xs font-black text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
            {r.id}
          </span>
          <span className="text-[11px] text-slate-400 block mt-1 font-mono">{r.sent_at}</span>
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Broadcast Content & Preview',
      render: (r) => (
        <div className="min-w-[260px] max-w-md">
          <span
            className="font-extrabold text-slate-900 text-sm block hover:text-blue-600 transition cursor-pointer line-clamp-1"
            onClick={() => setPreviewModal(r)}
          >
            {r.title}
          </span>
          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{r.body}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {r.channel}
            </span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Target: {r.audience}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'audience',
      label: 'Delivery Telemetry',
      render: (r) => (
        <div>
          <span className="font-mono text-xs font-black text-slate-900 block">
            {r.recipients.toLocaleString('en-IN')} Terminals
          </span>
          <span className="text-[11px] font-bold text-emerald-600">
            {r.read_rate} Open Rate
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Live Broadcast Status',
      render: (r) => (
        <button
          onClick={() => handleToggleStatus(r.id)}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black transition cursor-pointer ${
            r.status === 'Live'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs hover:bg-emerald-100'
              : r.status === 'Scheduled'
              ? 'bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
          title="Click to toggle status"
        >
          <span className={`h-2 w-2 rounded-full ${r.status === 'Live' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
          {r.status}
        </button>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewModal(r)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Preview Mobile Push Display"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={() => {
              setDraft({
                title: `${r.title} (Clone)`,
                body: r.body,
                channel: r.channel,
                audience: r.audience,
                action_url: r.action_url,
                action_label: r.action_label,
                schedule_type: 'now',
              })
              setComposeModal(true)
            }}
            className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
            title="Clone / Resend"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => handleDelete(r.id)}
            className="p-1.5 rounded-lg border border-rose-100 text-rose-500 hover:bg-rose-50 transition"
            title="Delete Campaign"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageBanner
        title="Player Push Dispatcher & Announcement Engine"
        icon={Bell}
        crumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Notifications' }]}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setComposeModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95"
          >
            <Send size={14} /> Compose Broadcast
          </button>
          <button
            onClick={() => {
              exportCSV('notification_broadcasts_history', [
                { key: 'id', label: 'Broadcast ID' },
                { key: 'title', label: 'Title' },
                { key: 'channel', label: 'Channel' },
                { key: 'audience', label: 'Audience' },
                { key: 'recipients', label: 'Recipients' },
                { key: 'read_rate', label: 'Open Rate' },
                { key: 'status', label: 'Status' },
                { key: 'sent_at', label: 'Dispatched At' },
              ], notifications)
              toast('Broadcast history exported to CSV')
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs transition"
          >
            <ArrowUpRight size={14} /> Export
          </button>
        </div>
      </PageBanner>

      {/* Compact, Sleek Notification Performance Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Subscribers</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              28,450 Devices
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Push terminals registered</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Smartphone size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Click-Through Rate</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              54.2% CTR
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">+8.4% above average</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Marquee Tickers</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              3 Active
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">In-app tickers active</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Megaphone size={18} />
          </div>
        </div>

        <div className="card bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Dispatch Latency</p>
            <h3 className="text-xl font-bold text-slate-900 mt-0.5 tracking-tight font-mono">
              0.32s Instant
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">Zero queue drops</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Radio size={18} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['ALL', 'LIVE', 'SCHEDULED', 'MARQUEE'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {tab === 'ALL' ? 'All Broadcasts' : tab === 'LIVE' ? 'Currently Live' : tab === 'SCHEDULED' ? 'Scheduled Queue' : 'Marquee Tickers'}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-semibold">
          Showing <span className="text-slate-900 font-bold">{filteredList.length}</span> announcements
        </div>
      </div>

      {/* Data Table */}
      <div className="card p-5 shadow-sm space-y-4">
        <DataTable
          columns={cols}
          rows={filteredList}
          unit="broadcasts"
          placeholder="Search notifications by title, ID, or channel..."
        />
      </div>

      {/* Modal: Compose New Broadcast */}
      {composeModal && (
        <Modal
          isOpen={composeModal}
          open={composeModal}
          onClose={() => setComposeModal(false)}
          title="Compose & Dispatch Broadcast"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSendBroadcast} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Campaign Headline</label>
              <input
                type="text"
                required
                placeholder="e.g. 🎉 Diwali Dhamaka 50% Cashback Match!"
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Message Body</label>
              <textarea
                required
                rows={3}
                placeholder="Detailed message copy displayed to the players..."
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Delivery Channel</label>
                <select
                  value={draft.channel}
                  onChange={(e) => setDraft({ ...draft, channel: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="In-App Popup">In-App Modal Popup</option>
                  <option value="Marquee Ticker">Top Scrolling Marquee</option>
                  <option value="Push Notification">Mobile Push Notification</option>
                  <option value="Personal Inbox">Player Mailbox</option>
                  <option value="SMS Gateway">SMS Urgent Alert</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Player Segment</label>
                <select
                  value={draft.audience}
                  onChange={(e) => setDraft({ ...draft, audience: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
                >
                  <option value="All Players">All Registered Players (28.4k)</option>
                  <option value="VIP Tier 5+">VIP Club Tier 5+ (High Net Worth)</option>
                  <option value="Active (Last 24h)">Active In Last 24 Hours</option>
                  <option value="Dormant (7+ Days)">Inactive & Dormant (Winback)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Action Button Label</label>
                <input
                  type="text"
                  placeholder="e.g. Deposit Now"
                  value={draft.action_label}
                  onChange={(e) => setDraft({ ...draft, action_label: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Destination Route / Deep-link</label>
                <input
                  type="text"
                  placeholder="e.g. /deposit or /aviator"
                  value={draft.action_url}
                  onChange={(e) => setDraft({ ...draft, action_url: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Live Mobile Push Preview */}
            <div className="rounded-2xl bg-slate-900 p-4 text-white space-y-2 border border-slate-700">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 font-bold text-blue-400">
                  <Smartphone size={13} /> Mobile Screen Preview
                </span>
                <span>VERONOVA APP • Just now</span>
              </div>
              <div className="space-y-1">
                <div className="font-extrabold text-sm text-white">{draft.title || 'Notification Headline Preview'}</div>
                <div className="text-xs text-slate-300">{draft.body || 'Your broadcast message preview will appear here.'}</div>
              </div>
              <div className="pt-1 flex justify-end">
                <span className="text-[11px] font-black text-amber-400 uppercase bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  {draft.action_label || 'Action'}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setComposeModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-black text-white hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20"
              >
                <Send size={14} /> Dispatch Announcement
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Preview Broadcast */}
      {previewModal && (
        <Modal open={Boolean(previewModal)} onClose={() => setPreviewModal(null)} title="Broadcast Telemetry & Device Render" maxWidth="max-w-md">
          <div className="space-y-4 pt-1">
            <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 p-5 text-white border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-300">{previewModal.id}</span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-400/30">
                  {previewModal.status}
                </span>
              </div>
              <h3 className="text-base font-black text-white">{previewModal.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{previewModal.body}</p>
              <div className="pt-2 flex items-center justify-between border-t border-white/10">
                <span className="text-xs text-slate-400 font-mono">Channel: {previewModal.channel}</span>
                <span className="rounded-lg bg-blue-500 px-3 py-1 text-xs font-extrabold text-white">
                  {previewModal.action_label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-semibold">Target Audience</span>
                <span className="text-slate-900 font-extrabold text-sm">{previewModal.audience}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-semibold">Delivered Devices</span>
                <span className="text-slate-900 font-extrabold text-sm">{previewModal.recipients.toLocaleString('en-IN')}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-semibold">Read Through</span>
                <span className="text-emerald-600 font-extrabold text-sm">{previewModal.read_rate}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-400 block font-semibold">Sent Timestamp</span>
                <span className="text-slate-900 font-bold">{previewModal.sent_at}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setPreviewModal(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {node}
    </div>
  )
}

