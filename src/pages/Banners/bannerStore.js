export const INITIAL_BANNERS = [
  {
    id: 1,
    title: 'Salary Income',
    subtitle: 'Daily & monthly fixed salary for active downline promoters',
    banner_img: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%)',
    activity_img: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    icon_type: 'Wallet',
    category: 'Activity Promotion',
    target_route: '/salary',
    impressions: 48200,
    clicks: 6420,
    priority: 1,
    status: 'Active',
    date: '2026-10-01'
  },
  {
    id: 2,
    title: 'Lucky Recharge Bonus',
    subtitle: '100% instant matching reward on your daily recharge',
    banner_img: 'linear-gradient(135deg, #065f46 0%, #10b981 50%, #14b8a6 100%)',
    activity_img: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    icon_type: 'Sparkles',
    category: 'Deposit Promotion',
    target_route: '/offer',
    impressions: 62400,
    clicks: 11200,
    priority: 2,
    status: 'Active',
    date: '2026-10-03'
  },
  {
    id: 3,
    title: 'Referral Income',
    subtitle: 'Earn continuous multi-tier 6-level downline commissions',
    banner_img: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #f97316 100%)',
    activity_img: 'linear-gradient(135deg, #c2410c 0%, #9a3412 100%)',
    icon_type: 'Users',
    category: 'Activity Promotion',
    target_route: '/mlm-levels',
    impressions: 34100,
    clicks: 4320,
    priority: 3,
    status: 'Active',
    date: '2026-10-05'
  },
  {
    id: 4,
    title: 'Invitation Bonus',
    subtitle: 'Invite 1 active friend and get ₹250 instant cash voucher',
    banner_img: 'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 50%, #a855f7 100%)',
    activity_img: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    icon_type: 'Gift',
    category: 'Activity Promotion',
    target_route: '/gift',
    impressions: 29800,
    clicks: 3890,
    priority: 4,
    status: 'Active',
    date: '2026-10-08'
  },
  {
    id: 5,
    title: 'Welcome To Veronova Casino',
    subtitle: 'India\'s fastest gaming platform with 1-second instant payouts',
    banner_img: 'linear-gradient(135deg, #0f172a 0%, #312e81 50%, #4338ca 100%)',
    activity_img: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
    icon_type: 'Trophy',
    category: 'Hero Carousel',
    target_route: '/players',
    impressions: 89000,
    clicks: 14500,
    priority: 5,
    status: 'Active',
    date: '2026-09-20'
  },
  {
    id: 6,
    title: 'VIP Legend Club Rewards',
    subtitle: 'Unlock ₹24.8 Lakh monthly loyalty salary pool & 24/7 concierge',
    banner_img: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #f59e0b 100%)',
    activity_img: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)',
    icon_type: 'Crown',
    category: 'VIP Banner',
    target_route: '/vip-levels',
    impressions: 21500,
    clicks: 2800,
    priority: 6,
    status: 'Active',
    date: '2026-09-25'
  }
]

const BANNERS_KEY = 'veronova_activity_banners_v2'

/**
 * Deduplicate banners array by unique ID and content fingerprint
 */
export function deduplicateBanners(list) {
  if (!Array.isArray(list)) return []
  const seenIds = new Set()
  const seenContent = new Set()
  const result = []

  for (const item of list) {
    if (!item || typeof item !== 'object') continue

    const idKey = item.id !== undefined && item.id !== null ? String(item.id) : null
    const titleKey = (item.title || item.name || '').trim().toLowerCase()
    const routeKey = (item.target_route || item.route || '').trim().toLowerCase()
    const contentKey = `${titleKey}|${routeKey}|${item.category || ''}`

    // If ID is already present, skip duplicate
    if (idKey && seenIds.has(idKey)) continue

    // If exact same title + route + category is already present, skip duplicate
    if (titleKey && seenContent.has(contentKey)) continue

    if (idKey) seenIds.add(idKey)
    if (titleKey) seenContent.add(contentKey)
    result.push(item)
  }

  return result
}

export function getBanners() {
  try {
    const raw = localStorage.getItem(BANNERS_KEY)
    if (!raw) return INITIAL_BANNERS
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return deduplicateBanners(parsed)
    }
    return INITIAL_BANNERS
  } catch (err) {
    return INITIAL_BANNERS
  }
}

export function saveBanners(banners) {
  try {
    const clean = deduplicateBanners(banners)
    localStorage.setItem(BANNERS_KEY, JSON.stringify(clean))
  } catch (err) {}
}

export function normalizeBanner(raw, index = 0, defaultCategory = 'Hero Carousel', entityType = 'banner') {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id ?? raw._id ?? raw['#'] ?? index + 1
  const title = raw.title || raw.name || raw.banner_name || raw.activity_name || 'Campaign Banner'
  const subtitle = raw.subtitle || raw.description || raw.tagline || ''
  const category = raw.category || raw.type || (entityType === 'activity' ? 'Activity Promotion' : defaultCategory)
  const target_route = raw.target_route || raw.route || raw.link || raw.url || '/offer'
  const icon_type = raw.icon_type || raw.icon || 'Sparkles'
  
  const banner_img =
    raw.banner_img ||
    raw.image ||
    raw.img ||
    raw.image_url ||
    raw.banner ||
    (entityType === 'activity'
      ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%)'
      : 'linear-gradient(135deg, #0f172a 0%, #312e81 50%, #4338ca 100%)')

  const activity_img =
    raw.activity_img ||
    raw.thumbnail ||
    raw.icon_img ||
    raw.activity ||
    raw.image ||
    'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'

  const priority = Number(raw.priority ?? raw.sequence ?? raw.order ?? raw.position ?? (index + 1))
  
  let status = 'Active'
  if (raw.status !== undefined && raw.status !== null) {
    if (typeof raw.status === 'string') {
      const s = raw.status.trim().toLowerCase()
      if (s === 'active' || s === '1' || s === 'enabled') status = 'Active'
      else if (s === 'inactive' || s === '0' || s === 'disabled') status = 'Inactive'
      else status = raw.status.charAt(0).toUpperCase() + raw.status.slice(1)
    } else if (raw.status === 0 || raw.status === false) {
      status = 'Inactive'
    } else {
      status = 'Active'
    }
  }

  const impressions = Number(raw.impressions ?? raw.views ?? raw.view_count ?? 0)
  const clicks = Number(raw.clicks ?? raw.click_count ?? 0)
  let date = raw.date || raw.created_at || raw.createdAt || new Date().toISOString().slice(0, 10)
  if (typeof date === 'string' && date.includes('T')) {
    date = date.slice(0, 10)
  }

  const _type = raw._type || entityType || (category.includes('Activity') ? 'activity' : 'banner')

  return {
    id,
    title,
    subtitle,
    category,
    target_route,
    icon_type,
    banner_img,
    activity_img,
    priority,
    status,
    impressions,
    clicks,
    date: String(date),
    _type,
    raw,
  }
}
