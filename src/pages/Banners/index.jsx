import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Image as ImageIcon, Plus, Pencil, Trash2, Eye,
  Sparkles, Wallet, Users, Crown, Trophy, Gift, ArrowUpRight,
  CheckCircle2, Clock, Smartphone, Monitor, Layers, RefreshCw,
  FileSpreadsheet, Database, ExternalLink, SlidersHorizontal,
  Upload, Link as LinkIcon
} from 'lucide-react'
import DataTable, { exportCSV } from '@/components/DataTable'
import { PageBanner, Modal, useToast } from '@/components/ui'
import { apiRequest } from '@/utils/apiClient'
import { API_ENDPOINTS } from '@/constants/api'
import { getBanners, saveBanners, normalizeBanner, deduplicateBanners, resolveImageUrl } from './bannerStore'

export default function Banners() {
  const [rows, setRows] = useState(() => deduplicateBanners(getBanners()))
  const [filterTab, setFilterTab] = useState('ALL') // ALL, BANNERS, ACTIVITY, ACTIVE, HERO, VIP
  const [modal, setModal] = useState(null) // { mode: 'add' | 'edit', row }
  const [previewItem, setPreviewItem] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastSynced, setLastSynced] = useState(null)
  const [toast, node] = useToast()

  // Load both /admin/banners and /admin/activity-banners
  const loadBanners = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true)
    else setIsLoading(true)

    try {
      console.log(`[Veronova Banners] Syncing from ${API_ENDPOINTS.BANNERS_PROXY} and ${API_ENDPOINTS.ACTIVITY_BANNERS_PROXY}`)

      const [bannersRes, activityRes] = await Promise.allSettled([
        apiRequest(API_ENDPOINTS.BANNERS_PROXY, { method: 'GET' }),
        apiRequest(API_ENDPOINTS.ACTIVITY_BANNERS_PROXY, { method: 'GET' }),
      ])

      const extractList = (res, defaultCategory, entityType) => {
        if (res.status === 'fulfilled' && res.value) {
          const json = res.value
          const payload = json.data || json
          const rawList =
            payload.list ||
            payload.banners ||
            payload.activity_banners ||
            payload.activities ||
            payload.data ||
            payload.rows ||
            (Array.isArray(payload) ? payload : null)

          if (Array.isArray(rawList)) {
            return rawList
              .map((item, idx) => normalizeBanner(item, idx, defaultCategory, entityType))
              .filter(Boolean)
          }
        }
        return []
      }

      const regularList = extractList(bannersRes, 'Hero Carousel', 'banner')
      const activityList = extractList(activityRes, 'Activity Promotion', 'activity')

      // Smart deduplication: merge both lists while eliminating identical IDs or duplicate contents
      const rawCombined = [...regularList, ...activityList]
      const cleanCombined = deduplicateBanners(rawCombined)

      if (cleanCombined.length > 0) {
        setRows(cleanCombined)
        saveBanners(cleanCombined)
        setLastSynced(new Date().toLocaleTimeString())
        console.log(`[Veronova Banners] Loaded ${cleanCombined.length} unique banners (deduplicated from ${rawCombined.length})`)
      }
    } catch (err) {
      console.warn('[Veronova Banners] Error syncing banners from backend:', err.message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadBanners()
  }, [loadBanners])

  // Persist Rows with automatic deduplication
  const persistRows = (updater) => {
    setRows((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      const clean = deduplicateBanners(next)
      saveBanners(clean)
      return clean
    })
  }

  // Row update helper
  const updateRow = (id, patch) => {
    persistRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  // Toggle Status via PUT /admin/banners/:id or /admin/activity-banners/:id
  const toggleStatus = async (banner) => {
    const next = banner.status === 'Active' ? 'Inactive' : 'Active'
    updateRow(banner.id, { status: next })
    toast(`Banner "${banner.title}" status changed to ${next}`)

    const isActivity = banner._type === 'activity' || banner.category?.includes('Activity')
    const itemUrl = isActivity
      ? API_ENDPOINTS.ACTIVITY_BANNERS_ITEM_PROXY(banner.id)
      : API_ENDPOINTS.BANNERS_ITEM_PROXY(banner.id)

    try {
      await apiRequest(itemUrl, {
        method: 'PUT',
        body: JSON.stringify({ id: banner.id, status: next }),
      }).catch(async () => {
        await apiRequest(itemUrl, {
          method: 'POST',
          body: JSON.stringify({ id: banner.id, status: next }),
        }).catch(() => null)
      })
    } catch (err) {
      console.warn(`[Veronova Banners] Status update failed for #${banner.id}:`, err.message)
    }
  }

  // Deduplicated base rows
  const uniqueRows = useMemo(() => deduplicateBanners(rows), [rows])

  // Computations
  const activeBanners = useMemo(() => uniqueRows.filter((r) => r.status === 'Active'), [uniqueRows])
  const totalImpressions = useMemo(() => uniqueRows.reduce((acc, r) => acc + (r.impressions || 0), 0), [uniqueRows])
  const totalClicks = useMemo(() => uniqueRows.reduce((acc, r) => acc + (r.clicks || 0), 0), [uniqueRows])
  const ctrRate = useMemo(() => {
    if (!totalImpressions) return 0
    return ((totalClicks / totalImpressions) * 100).toFixed(1)
  }, [totalImpressions, totalClicks])

  // Filtered Rows with guaranteed deduplication
  const displayRows = useMemo(() => {
    const filtered = uniqueRows.filter((r) => {
      if (filterTab === 'BANNERS' && (r._type === 'activity' || r.category?.includes('Activity'))) return false
      if (filterTab === 'ACTIVITY' && r._type !== 'activity' && !r.category?.includes('Activity')) return false
      if (filterTab === 'HERO' && r.category !== 'Hero Carousel') return false
      if (filterTab === 'DEPOSIT' && r.category !== 'Deposit Promotion') return false
      if (filterTab === 'VIP' && r.category !== 'VIP Banner') return false
      if (filterTab === 'ACTIVE' && r.status !== 'Active') return false
      return true
    })
    return deduplicateBanners(filtered)
  }, [uniqueRows, filterTab])

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

  // Handle File Upload from device (Banner Artwork or Activity Icon)
  const handleFileUpload = (e, field) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result
      setModal((prev) => {
        if (!prev) return null
        return {
          ...prev,
          row: {
            ...prev.row,
            [field]: dataUrl,
            [`_${field}_file`]: file,
          },
        }
      })
      toast(`${field === 'banner_img' ? 'Banner artwork' : 'Activity icon'} selected from device`)
    }
    reader.readAsDataURL(file)
  }

  // Handle Save Modal (POST or PUT /api/admin/banners or /api/admin/sliders)
  const handleSaveModal = async (e) => {
    e.preventDefault()
    const { title, subtitle, category, target_route, icon_type, banner_img, activity_img, priority, status, _type } = modal.row
    if (!title) return toast('Please enter a banner title')

    const isActivity = _type === 'activity' || category?.includes('Activity')
    const numericStatus = status === 'Active' || status === 1 || status === '1' ? 1 : 0
    const resolvedBannerImg = resolveImageUrl(banner_img)
    const resolvedActivityImg = resolveImageUrl(activity_img)

    const backendPayload = {
      title,
      banner_image: resolvedBannerImg || banner_img,
      image: resolvedBannerImg || banner_img,
      activity_image: resolvedActivityImg || activity_img,
      activity_image_url: target_route || '/offer',
      status: numericStatus,
      status_label: numericStatus === 1 ? 'Active' : 'Inactive',
    }

    const hasFiles = Boolean(modal.row._banner_img_file || modal.row._activity_img_file)
    const buildRequestBody = () => {
      if (hasFiles) {
        const fd = new FormData()
        fd.append('title', title)
        fd.append('status', String(numericStatus))
        if (modal.row.id) fd.append('id', String(modal.row.id))
        if (target_route) {
          fd.append('activity_image_url', target_route)
          fd.append('target_route', target_route)
        }
        if (modal.row._banner_img_file) {
          fd.append('banner_image', modal.row._banner_img_file)
          fd.append('image', modal.row._banner_img_file)
        } else if (resolvedBannerImg || banner_img) {
          fd.append('banner_image', resolvedBannerImg || banner_img)
          fd.append('image', resolvedBannerImg || banner_img)
        }
        if (modal.row._activity_img_file) {
          fd.append('activity_image', modal.row._activity_img_file)
        } else if (resolvedActivityImg || activity_img) {
          fd.append('activity_image', resolvedActivityImg || activity_img)
        }
        return fd
      }
      return JSON.stringify({ ...backendPayload, id: modal.row?.id })
    }

    if (modal.mode === 'add') {
      const newRecord = {
        id: Math.max(0, ...rows.map((r) => r.id)) + 1,
        title,
        subtitle: subtitle || 'Special promotional activity',
        category: category || (isActivity ? 'Activity Promotion' : 'Hero Carousel'),
        target_route: target_route || '/offer',
        icon_type: icon_type || 'Sparkles',
        banner_img: resolvedBannerImg || banner_img || 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%)',
        activity_img: resolvedActivityImg || activity_img || 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        priority: Number(priority) || rows.length + 1,
        status: numericStatus === 1 ? 'Active' : 'Inactive',
        impressions: 0,
        clicks: 0,
        date: new Date().toISOString().slice(0, 10),
        _type: isActivity ? 'activity' : 'banner',
        ...backendPayload,
      }
      persistRows((prev) => [newRecord, ...prev])
      toast(`New ${isActivity ? 'activity banner' : 'banner'} "${title}" added successfully!`)

      const targetUrl = isActivity ? API_ENDPOINTS.ACTIVITY_BANNERS_PROXY : API_ENDPOINTS.BANNERS_PROXY
      try {
        await apiRequest(targetUrl, {
          method: 'POST',
          body: buildRequestBody(),
        }).catch(async () => {
          await apiRequest(API_ENDPOINTS.SLIDERS_PROXY, {
            method: 'POST',
            body: buildRequestBody(),
          }).catch(() => null)
        })
      } catch (err) {
        console.warn('[Veronova Banners] Create banner failed:', err.message)
      }
    } else {
      const patch = {
        title,
        subtitle,
        category,
        target_route,
        icon_type,
        banner_img: resolvedBannerImg || banner_img,
        activity_img: resolvedActivityImg || activity_img,
        priority: Number(priority) || 1,
        status: numericStatus === 1 ? 'Active' : 'Inactive',
        _type: isActivity ? 'activity' : 'banner',
        ...backendPayload,
      }
      updateRow(modal.row.id, patch)
      toast(`Banner #${modal.row.id} updated successfully`)

      const itemUrl = isActivity
        ? API_ENDPOINTS.ACTIVITY_BANNERS_ITEM_PROXY(modal.row.id)
        : API_ENDPOINTS.BANNERS_ITEM_PROXY(modal.row.id)

      try {
        await apiRequest(itemUrl, {
          method: 'PUT',
          body: buildRequestBody(),
        }).catch(async () => {
          await apiRequest(itemUrl, {
            method: 'POST',
            body: buildRequestBody(),
          }).catch(async () => {
            await apiRequest(API_ENDPOINTS.SLIDERS_ITEM_PROXY(modal.row.id), {
              method: 'POST',
              body: buildRequestBody(),
            }).catch(() => null)
          })
        })
      } catch (err) {
        console.warn(`[Veronova Banners] Update failed for #${modal.row.id}:`, err.message)
      }
    }
    setModal(null)
  }

  // Delete via DELETE /admin/banners/:id or /admin/activity-banners/:id
  const handleDelete = async (id) => {
    const item = rows.find((r) => r.id === id)
    if (!confirm(`Delete banner "${item?.title || id}"?`)) return

    persistRows((prev) => prev.filter((r) => r.id !== id))
    toast('Banner removed')

    const isActivity = item?._type === 'activity' || item?.category?.includes('Activity')
    const itemUrl = isActivity
      ? API_ENDPOINTS.ACTIVITY_BANNERS_ITEM_PROXY(id)
      : API_ENDPOINTS.BANNERS_ITEM_PROXY(id)

    try {
      await apiRequest(itemUrl, { method: 'DELETE' }).catch(async () => {
        await apiRequest(itemUrl, {
          method: 'POST',
          body: JSON.stringify({ action: 'delete', _method: 'DELETE' }),
        }).catch(async () => {
          await apiRequest(API_ENDPOINTS.BANNERS_PROXY, {
            method: 'POST',
            body: JSON.stringify({ id, action: 'delete' }),
          }).catch(() => null)
        })
      })
    } catch (err) {
      console.warn(`[Veronova Banners] Delete failed for #${id}:`, err.message)
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
      render: (r) => {
        const isGradient = r.banner_img?.startsWith('linear-gradient')
        const imgUrl = resolveImageUrl(r.banner_img || r.banner_image || r.image)
        return (
          <div className="min-w-[210px]">
            <div
              className="h-16 w-48 rounded-xl text-white shadow-sm flex flex-col justify-between relative overflow-hidden transition-transform hover:scale-105 cursor-pointer bg-slate-900 border border-slate-700/50"
              onClick={() => setPreviewItem(r)}
              title="Click to preview in mobile mockup"
            >
              {!isGradient && imgUrl ? (
                <img
                  src={imgUrl}
                  alt={r.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              ) : (
                <div className="absolute inset-0 w-full h-full" style={{ background: r.banner_img }} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="flex items-center justify-between relative z-10 p-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/20 backdrop-blur-md">
                  {renderIcon(r.icon_type, 12)}
                </span>
                <span className="text-[8px] font-black uppercase tracking-wider bg-black/40 px-1.5 py-0.5 rounded">
                  Slot #{r.priority}
                </span>
              </div>
              <div className="relative z-10 p-2 pt-0">
                <p className="text-[11px] font-black truncate drop-shadow-md">{r.title}</p>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'activity_img',
      label: 'Activity Image (Icon Tile)',
      render: (r) => {
        const isGradient = r.activity_img?.startsWith('linear-gradient')
        const imgUrl = resolveImageUrl(r.activity_img || r.activity_image)
        return (
          <div className="min-w-[130px]">
            <div
              className="h-14 w-14 rounded-2xl flex flex-col items-center justify-center text-white shadow-sm transition-transform hover:scale-110 cursor-pointer p-1 text-center relative overflow-hidden bg-slate-900 border border-slate-700/50"
              onClick={() => setPreviewItem(r)}
              title="Activity Icon Tile"
            >
              {!isGradient && imgUrl ? (
                <img
                  src={imgUrl}
                  alt={r.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              ) : (
                <div className="absolute inset-0 w-full h-full" style={{ background: r.activity_img }} />
              )}
              <div className="relative z-10 flex flex-col items-center">
                {renderIcon(r.icon_type, 18)}
                <span className="text-[8px] font-black mt-0.5 truncate max-w-[48px] drop-shadow">
                  {r.title.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>
        )
      },
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

  const currentPreview = previewItem || uniqueRows[0] || null

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
        <div className="flex flex-wrap items-center gap-2">
          {lastSynced && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-white/15 backdrop-blur-xs px-2.5 py-1 text-[11px] font-semibold text-white/90">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Synced: {lastSynced}
            </span>
          )}
          <button
            onClick={() => loadBanners(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs px-3 py-2 text-xs font-bold text-white transition disabled:opacity-50"
            title="Sync Live Banners from Backend"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Sync Live</span>
          </button>
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
                  _type: 'activity',
                },
              })
            }
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs sm:text-sm font-extrabold text-blue-700 shadow-xl transition-all hover:bg-blue-50 hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <Plus size={16} /> Add Banner / Activity
          </button>
        </div>
      </PageBanner>

      {/* Main Table Card */}
      <div className="card p-4 space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Segmented Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {[
              { id: 'ALL', label: 'All Media', count: rows.length },
              { id: 'BANNERS', label: 'Home Banners (/admin/banners)', count: rows.filter((r) => r._type !== 'activity' && !r.category?.includes('Activity')).length },
              { id: 'ACTIVITY', label: 'Activity Center (/admin/activity-banners)', count: rows.filter((r) => r._type === 'activity' || r.category?.includes('Activity')).length },
              { id: 'ACTIVE', label: 'Live Active', count: activeBanners.length },
              { id: 'HERO', label: 'Hero Carousels', count: rows.filter((r) => r.category === 'Hero Carousel').length },
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Target API / Type
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  value={modal.row._type || 'activity'}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, _type: e.target.value } })}
                >
                  <option value="activity">Activity (/admin/activity-banners)</option>
                  <option value="banner">Home Banner (/admin/banners)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Status
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                  value={modal.row.status || 'Active'}
                  onChange={(e) => setModal({ ...modal, row: { ...modal.row, status: e.target.value } })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Campaign Title
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

            {/* 1. Banner Image (Wide 16:9 Carousel) */}
            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-blue-600" />
                  <span>Banner Artwork (Wide 16:9 Carousel)</span>
                </label>
                <span className="text-[10px] text-slate-500 font-medium">Device se Upload ya URL paste karein</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                {/* File Upload Button */}
                <label className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm transition cursor-pointer active:scale-95">
                  <Upload size={14} />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'banner_img')}
                  />
                </label>

                {/* Direct URL Input */}
                <div className="relative flex-1 w-full">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <LinkIcon size={13} />
                  </div>
                  <input
                    type="text"
                    placeholder="https://api.wingo4all.site/uploads/sliders/... ya URL"
                    className="w-full rounded-xl border border-slate-200 pl-8 pr-2.5 py-2 text-xs font-mono font-medium text-slate-800 bg-white outline-none focus:border-blue-500"
                    value={modal.row.banner_img || ''}
                    onChange={(e) => setModal({ ...modal, row: { ...modal.row, banner_img: e.target.value, _banner_img_file: null } })}
                  />
                </div>

                {/* Live Thumbnail Preview */}
                {modal.row.banner_img && (
                  <div className="h-10 w-16 shrink-0 rounded-lg overflow-hidden border border-slate-300 relative shadow-inner bg-slate-900" title="Banner Preview">
                    {!modal.row.banner_img.startsWith('linear-gradient') ? (
                      <img
                        src={resolveImageUrl(modal.row.banner_img)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-full h-full" style={{ background: modal.row.banner_img }} />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Activity Image (1:1 Icon Tile) */}
            <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers size={14} className="text-indigo-600" />
                  <span>Activity Image (1:1 Icon / Square Tile)</span>
                </label>
                <span className="text-[10px] text-slate-500 font-medium">Activity icon image / route thumbnail</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2">
                {/* File Upload Button */}
                <label className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold shadow-sm transition cursor-pointer active:scale-95">
                  <Upload size={14} />
                  <span>Upload Icon</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'activity_img')}
                  />
                </label>

                {/* Direct URL Input */}
                <div className="relative flex-1 w-full">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <LinkIcon size={13} />
                  </div>
                  <input
                    type="text"
                    placeholder="https://api.wingo4all.site/uploads/sliders/... ya URL"
                    className="w-full rounded-xl border border-slate-200 pl-8 pr-2.5 py-2 text-xs font-mono font-medium text-slate-800 bg-white outline-none focus:border-indigo-500"
                    value={modal.row.activity_img || ''}
                    onChange={(e) => setModal({ ...modal, row: { ...modal.row, activity_img: e.target.value, _activity_img_file: null } })}
                  />
                </div>

                {/* Live Thumbnail Preview */}
                {modal.row.activity_img && (
                  <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-slate-300 relative shadow-inner bg-slate-900" title="Activity Preview">
                    {!modal.row.activity_img.startsWith('linear-gradient') ? (
                      <img
                        src={resolveImageUrl(modal.row.activity_img)}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-full h-full" style={{ background: modal.row.activity_img }} />
                    )}
                  </div>
                )}
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
