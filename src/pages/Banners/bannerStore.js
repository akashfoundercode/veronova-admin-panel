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

export function getBanners() {
  try {
    const raw = localStorage.getItem(BANNERS_KEY)
    if (!raw) return INITIAL_BANNERS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_BANNERS
  } catch (err) {
    return INITIAL_BANNERS
  }
}

export function saveBanners(banners) {
  try {
    localStorage.setItem(BANNERS_KEY, JSON.stringify(banners))
  } catch (err) {}
}
