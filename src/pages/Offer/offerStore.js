export const INITIAL_OFFERS = [
  {
    id: 1,
    title: 'First Deposit 100% Welcome Bonus',
    tagline: 'Instant 100% matching credits on player first wallet recharge',
    bonus: '100% Match',
    min_deposit: 500,
    max_bonus: 5000,
    type: 'Deposit Bonus',
    status: 'Active',
    claimed_count: 3840,
    budget_burned: 425000,
    start_date: '2026-10-01',
    end_date: '2026-10-31',
    badge_color: 'from-blue-600 to-indigo-600',
  },
  {
    id: 2,
    title: 'Weekend Slot & Wingo 15% Cashback',
    tagline: 'Automatic loss protection rebate credited every Monday 00:00',
    bonus: '15% Cashback',
    min_deposit: 1000,
    max_bonus: 3000,
    type: 'Cashback',
    status: 'Active',
    claimed_count: 1290,
    budget_burned: 185000,
    start_date: '2026-10-05',
    end_date: '2026-10-28',
    badge_color: 'from-emerald-500 to-teal-600',
  },
  {
    id: 3,
    title: 'VIP Exclusive High-Roller Reload',
    tagline: 'VIP Level 3+ priority bonus on deposits exceeding ₹2,000',
    bonus: '50% Reload',
    min_deposit: 2000,
    max_bonus: 10000,
    type: 'VIP Bounty',
    status: 'Active',
    claimed_count: 640,
    budget_burned: 320000,
    start_date: '2026-10-10',
    end_date: '2026-11-15',
    badge_color: 'from-amber-500 to-orange-600',
  },
  {
    id: 4,
    title: 'Midnight Lightning Reload 30%',
    tagline: 'Night owl special boost for deposits made between 11PM - 4AM',
    bonus: '30% Boost',
    min_deposit: 800,
    max_bonus: 2500,
    type: 'Reload Bonus',
    status: 'Active',
    claimed_count: 980,
    budget_burned: 145000,
    start_date: '2026-10-08',
    end_date: '2026-10-31',
    badge_color: 'from-purple-600 to-pink-600',
  },
  {
    id: 5,
    title: 'Festival Diwali Dhamaka Bonus',
    tagline: 'Grand seasonal bonus pool with guaranteed gift coupon spin',
    bonus: '25% Flat',
    min_deposit: 300,
    max_bonus: 1500,
    type: 'Festival Special',
    status: 'Scheduled',
    claimed_count: 0,
    budget_burned: 0,
    start_date: '2026-10-25',
    end_date: '2026-11-05',
    badge_color: 'from-rose-500 to-red-600',
  },
  {
    id: 6,
    title: 'Weekly Aviator Turnover Bounty',
    tagline: 'Reach ₹50,000 turnover on crash games for instant cash reward',
    bonus: '₹2,500 Cash',
    min_deposit: 1500,
    max_bonus: 2500,
    type: 'VIP Bounty',
    status: 'Expired',
    claimed_count: 410,
    budget_burned: 102500,
    start_date: '2026-09-15',
    end_date: '2026-09-30',
    badge_color: 'from-slate-600 to-slate-800',
  },
]

const STORAGE_KEY = 'veronova_offers_v1'

export function getOffers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_OFFERS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_OFFERS
  } catch (err) {
    console.error('Error reading offers:', err)
    return INITIAL_OFFERS
  }
}

export function saveOffers(offers) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offers))
  } catch (err) {
    console.error('Error saving offers:', err)
  }
}

export function normalizeOffer(raw, index = 0) {
  const id = Number(raw.id ?? index + 1)
  const title = raw.title || raw.name || raw.offer_name || `Offer #${id}`
  const tagline = raw.tagline || raw.description || raw.desc || 'Exclusive promotional campaign'
  const bonus = raw.bonus || raw.reward || (raw.percentage ? `${raw.percentage}% Bonus` : 'Special Bonus')
  const minDeposit = Number(raw.min_deposit ?? raw.min_recharge ?? raw.min_amount ?? 500)
  const maxBonus = Number(raw.max_bonus ?? raw.max_reward ?? raw.max_amount ?? 5000)
  const type = raw.type || raw.category || 'Deposit Bonus'

  let status = 'Active'
  if (raw.status === 'Expired' || raw.status === 0 || raw.status === false || raw.is_active === false) {
    status = 'Expired'
  } else if (raw.status === 'Scheduled' || raw.is_scheduled === true) {
    status = 'Scheduled'
  } else if (raw.status === 'Active' || raw.status === 1 || raw.status === true || raw.is_active === true) {
    status = 'Active'
  }

  const claimedCount = Number(raw.claimed_count ?? raw.claims ?? raw.total_claims ?? 0)
  const budgetBurned = Number(raw.budget_burned ?? raw.budget ?? raw.burned ?? 0)
  const startDate = raw.start_date || (raw.created_at ? raw.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10))
  const endDate = raw.end_date || '2026-12-31'

  const badgeColors = [
    'from-blue-600 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-purple-600 to-pink-600',
    'from-rose-500 to-red-600',
  ]
  const badgeColor = raw.badge_color || badgeColors[(id - 1) % badgeColors.length]

  return {
    id,
    title,
    tagline,
    bonus,
    min_deposit: minDeposit,
    max_bonus: maxBonus,
    type,
    status,
    claimed_count: claimedCount,
    budget_burned: budgetBurned,
    start_date: startDate,
    end_date: endDate,
    badge_color: badgeColor,
    raw,
  }
}

