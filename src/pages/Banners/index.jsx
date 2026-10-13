import { useState, useMemo } from 'react'
import {
  Image as ImageIcon, Plus, Pencil, Trash2, Eye,
  Sparkles, Wallet, Users, Crown, Trophy, Gift, ArrowUpRight,
  CheckCircle2, Clock, Smartphone, Monitor, Layers, RefreshCw,
  FileSpreadsheet, Database, ExternalLink, SlidersHorizontal
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, Modal, useToast } from '@/components/ui'
import { getBanners, saveBanners } from './bannerStore'

export default function Banners() {
  const [rows, setRows] = useState(getBanners)
  const [filterTab, setFilterTab] = useState('ALL') // ALL, ACTIVITY, HERO, DEPOSIT, VIP, ACTIVE
  const [modal, setModal] = useState(null) // { mode: 'add' | 'edit', row }
  const [previewItem, setPreviewItem] = useState(rows[0] || null)
  const [toast, node] = useToast()

  // Persist Rows
  const persistRows = (updater) => {
    setRows((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveBanners(next)
      return next
    })
  }

  // Row update helper
  const updateRow = (id, patch) => {
    persistRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  // Toggle Status
  const toggleStatus = (banner) => {
    const next = banner.status === 'Active' ? 'Inactive' : 'Active'
    updateRow(banner.id, { status: next })
    toast(`Banner "${banner.title}" status changed to ${next}`)
  }

  // Computations
  const activeBanners = useMemo(() => rows.filter((r) => r.status === 'Active'), [rows])
  const totalImpressions = useMemo(() => rows.reduce((acc, r) => acc + (r.impressions || 0), 0), [rows])
  const totalClicks = useMemo(() => rows.reduce((acc, r) => acc + (r.clicks || 0), 0), [rows])
  const ctrRate = useMemo(() => {
    if (!totalImpressions) return 0
    return ((totalClicks / totalImpressions) * 100).toFixed(1)
  }, [totalImpressions, totalClicks])

  // Filtered Rows
  const displayRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterTab === 'ACTIVITY' && !r.category?.includes('Activity')) return false
      if (filterTab === 'HERO' && r.category !== 'Hero Carousel') return false
      if (filterTab === 'DEPOSIT' && r.category !== 'Deposit Promotion') return false
      if (filterTab === 'VIP' && r.category !== 'VIP Banner') return false
      if (filterTab === 'ACTIVE' && r.status !== 'Active') return false
      return true
    })
  }, [rows, filterTab])

  // Render Icon
  const renderIcon = (iconType, size = 16) => {
    switch (iconType) {
      case 'Wallet':
        return <Wallet size={size} />
      case 'Users':
        return <Users size={size} />
      case 'Gift':
        return <Gift size={size} />
      case 'Crown':
        return <Crown size={size} />
      case 'Trophy':
        return <Trophy size={size} />
      default:
        return <Sparkles size={size} />
    }
  }

  // Handle Save Modal
  const handleSaveModal = (e) => {
    e.preventDefault()
    const { title, subtitle, category, target_route, icon_type, banner_img, activity_img, priority, status } = modal.row
    if (!title) return toast('Please enter a banner title')

    if (modal.mode === 'add') {
      const newRecord = {
        id: Math.max(0, ...rows.map((r) => r.id)) + 1,
        title,
        subtitle: subtitle || 'Special promotional activity',
        category: category || 'Activity Promotion',
        target_route: target_route || '/offer',
        icon_type: icon_type || 'Sparkles',
        banner_img: banner_img || 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%)',
        activity_img: activity_img || 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        priority: Number(priority) || rows.length + 1,
        status: status || 'Active',
        impressions: 0,
        clicks: 0,
        date: new Date().toISOString().slice(0, 10),
      }
      persistRows((prev) => [newRecord, ...prev])
      toast(`New banner "${title}" added successfully!`)
    } else {
      updateRow(modal.row.id, {
        title,
        subtitle,
        category,
        target_route,
        icon_type,
        banner_img,
        activity_img,
        priority: Number(priority) || 1,
        status,
      })
      toast(`Banner #${modal.row.id} updated successfully`)
    }
    setModal(null)
  }

  // Delete
  const handleDelete = (id) => {
    if (confirm('Delete this banner activity?')) {
      persistRows((prev) => prev.filter((r) => r.id !== id))
      toast('Banner removed')
    }
  }

  // Export Columns
  const exportCols = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Banner Title' },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'category', label: 'Category' },
    { key: 'target_route', label: 'Destination Route' },
    { key: 'impressions', label: 'Impressions' },
    { key: 'clicks', label: 'Clicks' },
    { key: 'priority', label: 'Position' },
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
      key: 'title',
      label: 'Activity Title',
      render: (r) => (
        <div className="min-w-[180px]">
          <span className="font-extrabold text-slate-900 text-sm block hover:text-blue-600 transition-colors">
            {r.title}
          </span>
          <span className="text-xs text-slate-500 font-medium block mt-0.5 line-clamp-1">
            {r.subtitle}
          </span>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
              {r.category}
            </span>
            <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {r.target_route}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'banner_img',
      label: 'Banner Image (Wide 16:9)',
      render: (r) => (
        <div className="min-w-[210px]">
          <div
            style={{ background: r.banner_img }}
            className="h-16 w-48 rounded-xl p-2.5 text-white shadow-sm flex flex-col justify-between relative overflow-hidden transition-transform hover:scale-105 cursor-pointer"
            onClick={() => setPreviewItem(r)}
            title="Click to preview in mobile mockup"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/20 backdrop-blur-md">
                {renderIcon(r.icon_type, 12)}
              </span>
              <span className="text-[8px] font-black uppercase tracking-wider bg-black/30 px-1 py-0.2 rounded">
                Slot #{r.priority}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-black truncate drop-shadow-sm">{r.title}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'activity_img',
      label: 'Activity Image (Icon Tile)',
      render: (r) => (
        <div className="min-w-[130px]">
          <div
            style={{ background: r.activity_img }}
            className="h-14 w-14 rounded-2xl flex flex-col items-center justify-center text-white shadow-sm transition-transform hover:scale-110 cursor-pointer p-1 text-center"
            onClick={() => setPreviewItem(r)}
            title="Activity Icon Tile"
          >
            {renderIcon(r.icon_type, 18)}
            <span className="text-[8px] font-black mt-0.5 truncate max-w-[48px]">
              {r.title.split(' ')[0]}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'analytics',
      label: 'Impression & CTR',
      render: (r) => {
        const ctr = r.impressions ? ((r.clicks / r.impressions) * 100).toFixed(1) : 0
        return (
          <div className="min-w-[125px] text-xs space-y-0.5">
            <div className="flex items-center justify-between text-slate-500">
              <span>Views:</span>
              <span className="font-bold text-slate-800">{(r.impressions || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Clicks:</span>
              <span className="font-bold text-blue-700">{(r.clicks || 0).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between pt-0.5 border-t border-slate-100 font-bold">
              <span className="text-slate-600">CTR:</span>
              <span className="text-emerald-600 font-extrabold">{ctr}%</span>
            </div>
          </div>
        )
      },
    },
    {
      key: 'priority',
      label: 'Sequence',
      render: (r) => (
        <span className="font-mono text-xs font-black text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
          Pos {r.priority}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <button
          onClick={() => toggleStatus(r)}
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition hover:opacity-85 ${
            r.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
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
        <div className="flex items-center gap-1">
          <button
            onClick={() => setModal({ mode: 'edit', row: { ...r } })}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-700 hover:text-white transition shadow-2xs"
            title="Edit Banner & Activity Settings"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => handleDelete(r.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition shadow-2xs"
            title="Delete Banner"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ]

  const currentPreview = previewItem || rows[0]

  return (
    <div className="space-y-6">
      {/* Page Banner */}
      <PageBanner
        title="Activity & Banner Management"
        icon={ImageIcon}
        crumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Activity & Banner' },
          { label: 'Media CMS Studio' },
        ]}
      >
        <button
          onClick={() =>
            setModal({
              mode: 'add',
              row: {
                title: 'Invitation Bonus',
                subtitle: 'Earn cash rewards by sharing referral link',
                category: 'Activity Promotion',
                target_route: '/gift',
                icon_type: 'Gift',
                banner_img: 'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 50%, #a855f7 100%)',
                activity_img: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                priority: rows.length + 1,
                status: 'Active',
              },
            })
          }
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-extrabold text-blue-700 shadow-xl transition-all hover:bg-blue-50 hover:shadow-2xl hover:scale-105 active:scale-95"
        >
          <Plus size={16} /> Add Banner / Activity
        </button>
      </PageBanner>

      {/* Bespoke Carousel & CMS Studio Command Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Hero (7 cols): Billboard Impressions & CTR Engine */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl border border-purple-900/40 flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-purple-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-widest text-purple-300">
                  Activity Center & Billboard Studio
                </span>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-purple-200 border border-white/10 flex items-center gap-1.5">
                <Smartphone size={12} className="text-purple-300" /> App Synced
              </span>
            </div>

            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-purple-200/80">Total Activity Billboard Impressions</p>
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm font-mono">
                  {totalImpressions.toLocaleString('en-IN')}
                </h2>
                <span className="text-xs font-semibold text-purple-300">Views logged across all player sessions</span>
              </div>
            </div>

            {/* CTR Engagement Bar */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <ArrowUpRight size={13} className="text-purple-400" /> Total Campaign Clicks: {totalClicks.toLocaleString('en-IN')}
                </span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  {ctrRate}% Click-Through Rate
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(15, parseFloat(ctrRate) * 5))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-[11px] text-slate-400">Live Active Campaigns</p>
              <p className="text-sm font-extrabold text-white mt-0.5">
                {activeBanners.length} Slots Active
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">Total Media Assets</p>
              <p className="text-sm font-extrabold text-purple-300 mt-0.5">
                {rows.length} Campaigns
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[11px] text-slate-400">Resolution Standard</p>
              <p className="text-sm font-extrabold text-emerald-400 mt-0.5 flex items-center gap-1">
                <CheckCircle2 size={14} /> Dual Vector Ready
              </p>
            </div>
          </div>
        </div>

        {/* Right (5 cols): Live Dual-View Mockup (Banner + Activity Tile) */}
        <div className="lg:col-span-5 card p-5 rounded-2xl border-t-4 border-t-purple-600 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Smartphone size={16} className="text-purple-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Player App Dual-View Spotlight
                </h4>
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                Live Artwork
              </span>
            </div>

            {currentPreview && (
              <div className="mt-3 space-y-3">
                {/* 1. Wide Banner Mockup */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    1. Wide Carousel Banner (16:9)
                  </span>
                  <div
                    style={{ background: currentPreview.banner_img }}
                    className="h-24 w-full rounded-2xl p-3 text-white shadow-md flex flex-col justify-between relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md">
                        {renderIcon(currentPreview.icon_type, 14)}
                      </span>
                      <span className="rounded-full bg-black/30 px-2 py-0.5 text-[9px] font-black uppercase">
                        Pos #{currentPreview.priority}
                      </span>
                    </div>
                    <div>
                      <h5 className="text-xs font-black truncate">{currentPreview.title}</h5>
                      <p className="text-[10px] text-white/80 truncate">{currentPreview.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* 2. Activity Icon Tile Mockup */}
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      2. Activity Center Icon Tile (1:1)
                    </span>
                    <span className="text-xs font-extrabold text-slate-800 mt-0.5 block">
                      {currentPreview.title}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Route: {currentPreview.target_route}
                    </span>
                  </div>
                  <div
                    style={{ background: currentPreview.activity_img }}
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-md"
                  >
                    {renderIcon(currentPreview.icon_type, 20)}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Click any table row to update spotlight</span>
            <span className="font-bold text-purple-600">{activeBanners.length} Live in Rotation</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Segmented Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All Campaigns', count: rows.length },
              { id: 'ACTIVE', label: 'Live Active', count: activeBanners.length },
              { id: 'ACTIVITY', label: 'Activity Promos', count: rows.filter((r) => r.category?.includes('Activity')).length },
              { id: 'HERO', label: 'Hero Carousels', count: rows.filter((r) => r.category === 'Hero Carousel').length },
              { id: 'DEPOSIT', label: 'Deposit Bonuses', count: rows.filter((r) => r.category === 'Deposit Promotion').length },
              { id: 'VIP', label: 'VIP Banners', count: rows.filter((r) => r.category === 'VIP Banner').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  filterTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
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

          <button
            onClick={() => exportCSV('activity_banners_cms', exportCols, displayRows)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            <FileSpreadsheet size={15} /> Export to Excel
          </button>
        </div>

        {/* DataTable */}
        <DataTable
          columns={cols}
          rows={displayRows}
          unit="banners"
          placeholder="Search by title (e.g. Salary Income, Lucky Recharge, Referral)..."
        />
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <Modal
          isOpen={!!modal}
          onClose={() => setModal(null)}
          title={modal.mode === 'add' ? 'Create New Activity & Banner' : `Edit Banner: ${modal.row.title}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveModal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Activity Title
              </label>
              <input
                type="text"
                placeholder="e.g. Salary Income, Lucky Recharge Bonus"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500"
                value={modal.row.title}
                onChange={(e) => setModal({ ...modal, row: { ...modal.row, title: e.target.value } })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Subtitle / Description
              </label>
              <input
                type="text"
                placeholder="e.g. Daily fixed salary for promoters"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium text-slate-900 outline-none focus:border-blue-500"
                value={modal.row.subtitle || ''}
                onChange={(e) => setModal({ ...modal, row: { ...modal.row, subtitle: e.target.value } })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Category
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  value={modal.row.category}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, category: e.target.value } })}
                >
                  <option value="Activity Promotion">Activity Promotion</option>
                  <option value="Deposit Promotion">Deposit Promotion</option>
                  <option value="Hero Carousel">Hero Carousel</option>
                  <option value="VIP Banner">VIP Banner</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Target Route
                </label>
                <input
                  type="text"
                  placeholder="/salary or /offer"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono font-bold text-slate-800 outline-none focus:border-blue-500"
                  value={modal.row.target_route}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, target_route: e.target.value } })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Icon Theme
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  value={modal.row.icon_type}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, icon_type: e.target.value } })}
                >
                  <option value="Wallet">Wallet (Salary)</option>
                  <option value="Sparkles">Sparkles (Recharge)</option>
                  <option value="Users">Users (Referral)</option>
                  <option value="Gift">Gift (Invitation)</option>
                  <option value="Trophy">Trophy (Casino)</option>
                  <option value="Crown">Crown (VIP)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Sequence Position
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500"
                  value={modal.row.priority}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, priority: e.target.value } })}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md"
              >
                {modal.mode === 'add' ? 'Save Campaign' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {node}
    </div>
  )
}
