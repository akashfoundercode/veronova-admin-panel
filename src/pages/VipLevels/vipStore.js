const VIP_TIERS_KEY = 'veronova_vip_tiers_v2'
const VIP_CLAIMS_KEY = 'veronova_vip_claims_v2'

export const initialVipTiers = [
  {
    id: 1,
    name: 'VIP 1',
    title: 'Bronze Pioneer',
    betting_range: 3000,
    range: 3000,
    level_up_rewards: 60,
    up: 60,
    monthly_rewards: 30,
    month: 30,
    action: ['edit', 'update'],
    rebate: '0.20%',
    status: 'Active',
    color: 'from-amber-700 to-amber-900',
    badge_color: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: 2,
    name: 'VIP 2',
    title: 'Silver Challenger',
    betting_range: 30000,
    range: 30000,
    level_up_rewards: 180,
    up: 180,
    monthly_rewards: 90,
    month: 90,
    action: ['edit', 'update'],
    rebate: '0.30%',
    status: 'Active',
    color: 'from-slate-400 to-slate-600',
    badge_color: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  {
    id: 3,
    name: 'VIP 3',
    title: 'Gold Master',
    betting_range: 300000,
    range: 300000,
    level_up_rewards: 690,
    up: 690,
    monthly_rewards: 290,
    month: 290,
    action: ['edit', 'update'],
    rebate: '0.40%',
    status: 'Active',
    color: 'from-amber-400 to-yellow-600',
    badge_color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  {
    id: 4,
    name: 'VIP 4',
    title: 'Platinum Elite',
    betting_range: 2000000,
    range: 2000000,
    level_up_rewards: 1800,
    up: 1800,
    monthly_rewards: 890,
    month: 890,
    action: ['edit', 'update'],
    rebate: '0.50%',
    status: 'Active',
    color: 'from-teal-400 to-emerald-600',
    badge_color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 5,
    name: 'VIP 5',
    title: 'Sapphire Knight',
    betting_range: 20000000,
    range: 20000000,
    level_up_rewards: 6900,
    up: 6900,
    monthly_rewards: 1890,
    month: 1890,
    action: ['edit', 'update'],
    rebate: '0.65%',
    status: 'Active',
    color: 'from-blue-500 to-indigo-700',
    badge_color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    id: 6,
    name: 'VIP 6',
    title: 'Ruby High Roller',
    betting_range: 60000000,
    range: 60000000,
    level_up_rewards: 16900,
    up: 16900,
    monthly_rewards: 6900,
    month: 6900,
    action: ['edit', 'update'],
    rebate: '0.80%',
    status: 'Active',
    color: 'from-rose-500 to-red-700',
    badge_color: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    id: 7,
    name: 'VIP 7',
    title: 'Amethyst Grandmaster',
    betting_range: 300000000,
    range: 300000000,
    level_up_rewards: 69000,
    up: 69000,
    monthly_rewards: 16900,
    month: 16900,
    action: ['edit', 'update'],
    rebate: '1.00%',
    status: 'Active',
    color: 'from-purple-600 to-violet-800',
    badge_color: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    id: 8,
    name: 'VIP 8',
    title: 'Emerald Sovereign',
    betting_range: 1000000000,
    range: 1000000000,
    level_up_rewards: 169000,
    up: 169000,
    monthly_rewards: 69000,
    month: 69000,
    action: ['edit', 'update'],
    rebate: '1.20%',
    status: 'Active',
    color: 'from-emerald-600 to-green-900',
    badge_color: 'bg-emerald-100 text-emerald-900 border-emerald-400',
  },
  {
    id: 9,
    name: 'VIP 9',
    title: 'Royal Diamond Monarch',
    betting_range: 5000000000,
    range: 5000000000,
    level_up_rewards: 690000,
    up: 690000,
    monthly_rewards: 169000,
    month: 169000,
    action: ['edit', 'update'],
    rebate: '1.40%',
    status: 'Active',
    color: 'from-cyan-500 via-blue-600 to-indigo-900',
    badge_color: 'bg-cyan-100 text-cyan-900 border-cyan-400',
  },
  {
    id: 10,
    name: 'VIP 10',
    title: 'Supreme Legend Titan',
    betting_range: 9999999999,
    range: 9999999999,
    level_up_rewards: 1690000,
    up: 1690000,
    monthly_rewards: 690000,
    month: 690000,
    action: ['edit', 'update'],
    rebate: '1.60%',
    status: 'Active',
    color: 'from-amber-400 via-rose-500 to-purple-800',
    badge_color: 'bg-gradient-to-r from-amber-200 to-rose-200 text-slate-900 border-amber-400 font-black',
  },
]

export const initialVipClaims = [
  {
    id: 1,
    tx_id: 'VIP_FND_88102',
    user_id: 'VN_99814',
    user_name: 'Akash_Pro',
    mobile: '9876543210',
    vip_level: 'VIP 6',
    reward_type: 'Level Up Reward',
    amount: 16900,
    date: '12-07-2026 09:30 PM',
    status: 'Credited',
  },
  {
    id: 2,
    tx_id: 'VIP_FND_88095',
    user_id: 'VN_99814',
    user_name: 'Akash_Pro',
    mobile: '9876543210',
    vip_level: 'VIP 6',
    reward_type: 'Monthly VIP Fund',
    amount: 6900,
    date: '12-07-2026 09:00 PM',
    status: 'Credited',
  },
  {
    id: 3,
    tx_id: 'VIP_FND_88042',
    user_id: 'MAMF1350',
    user_name: 'Rahul_Champ',
    mobile: '7991877018',
    vip_level: 'VIP 5',
    reward_type: 'Level Up Reward',
    amount: 6900,
    date: '12-07-2026 06:15 PM',
    status: 'Credited',
  },
  {
    id: 4,
    tx_id: 'VIP_FND_88020',
    user_id: 'VZPH8680',
    user_name: 'User_L13HY',
    mobile: '7800302707',
    vip_level: 'VIP 4',
    reward_type: 'Monthly VIP Fund',
    amount: 890,
    date: '11-07-2026 08:40 PM',
    status: 'Credited',
  },
  {
    id: 5,
    tx_id: 'VIP_FND_87995',
    user_id: 'HLYY2860',
    user_name: 'User_4CMBA',
    mobile: '8755741645',
    vip_level: 'VIP 3',
    reward_type: 'Level Up Reward',
    amount: 690,
    date: '11-07-2026 04:20 PM',
    status: 'Credited',
  },
  {
    id: 6,
    tx_id: 'VIP_FND_87950',
    user_id: 'KRNX7721',
    user_name: 'Karan_Striker',
    mobile: '9368117311',
    vip_level: 'VIP 5',
    reward_type: 'Monthly VIP Fund',
    amount: 1890,
    date: '10-07-2026 07:10 PM',
    status: 'Credited',
  },
  {
    id: 7,
    tx_id: 'VIP_FND_87910',
    user_id: 'BHJP4011',
    user_name: 'User_VBRDE',
    mobile: '8090145106',
    vip_level: 'VIP 2',
    reward_type: 'Level Up Reward',
    amount: 180,
    date: '10-07-2026 02:45 PM',
    status: 'Credited',
  },
]

export function getVipTiers() {
  try {
    const raw = localStorage.getItem(VIP_TIERS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error('Error loading VIP tiers:', e)
  }
  return initialVipTiers
}

export function saveVipTiers(list) {
  try {
    localStorage.setItem(VIP_TIERS_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Error saving VIP tiers:', e)
  }
}

export function getVipClaims() {
  try {
    const raw = localStorage.getItem(VIP_CLAIMS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure cached items are valid claims, not accidentally saved tier arrays
        if (parsed[0] && (parsed[0].user_id || parsed[0].user_name || parsed[0].tx_id)) {
          return parsed
        }
      }
    }
  } catch (e) {
    console.error('Error loading VIP claims:', e)
  }
  return initialVipClaims
}

export function saveVipClaims(list) {
  try {
    localStorage.setItem(VIP_CLAIMS_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Error saving VIP claims:', e)
  }
}

export const VIP_TIER_STYLES = [
  { color: 'from-amber-700 to-amber-900', badge_color: 'bg-amber-100 text-amber-800 border-amber-300', title: 'Bronze Pioneer' },
  { color: 'from-slate-400 to-slate-600', badge_color: 'bg-slate-100 text-slate-800 border-slate-300', title: 'Silver Challenger' },
  { color: 'from-amber-400 to-yellow-600', badge_color: 'bg-yellow-100 text-yellow-800 border-yellow-300', title: 'Gold Master' },
  { color: 'from-teal-400 to-emerald-600', badge_color: 'bg-emerald-100 text-emerald-800 border-emerald-300', title: 'Platinum Elite' },
  { color: 'from-blue-500 to-indigo-700', badge_color: 'bg-blue-100 text-blue-800 border-blue-300', title: 'Sapphire Knight' },
  { color: 'from-rose-500 to-red-700', badge_color: 'bg-rose-100 text-rose-800 border-rose-300', title: 'Ruby High Roller' },
  { color: 'from-purple-600 to-violet-800', badge_color: 'bg-purple-100 text-purple-800 border-purple-300', title: 'Amethyst Grandmaster' },
  { color: 'from-emerald-600 to-green-900', badge_color: 'bg-emerald-100 text-emerald-900 border-emerald-400', title: 'Emerald Sovereign' },
  { color: 'from-cyan-500 via-blue-600 to-indigo-900', badge_color: 'bg-cyan-100 text-cyan-900 border-cyan-400', title: 'Royal Diamond Monarch' },
  { color: 'from-amber-400 via-rose-500 to-purple-800', badge_color: 'bg-gradient-to-r from-amber-200 to-rose-200 text-slate-900 border-amber-400 font-black', title: 'Supreme Legend Titan' },
]

export function extractVipList(json) {
  if (!json) return null
  if (Array.isArray(json)) return json
  if (json.data && Array.isArray(json.data)) return json.data
  if (json.data && typeof json.data === 'object') {
    if (Array.isArray(json.data.levels)) return json.data.levels
    if (Array.isArray(json.data.vip_levels)) return json.data.vip_levels
    if (Array.isArray(json.data.vipLevels)) return json.data.vipLevels
    if (Array.isArray(json.data.tiers)) return json.data.tiers
    if (Array.isArray(json.data.rows)) return json.data.rows
    if (Array.isArray(json.data.list)) return json.data.list
    const vals = Object.values(json.data)
    if (vals.length > 0 && typeof vals[0] === 'object' && vals[0] !== null) {
      if (vals[0].name || vals[0].range || vals[0].betting_turnover || vals[0].level || vals[0].id) {
        return vals
      }
    }
  }
  if (Array.isArray(json.levels)) return json.levels
  if (Array.isArray(json.vip_levels)) return json.vip_levels
  if (Array.isArray(json.vipLevels)) return json.vipLevels
  if (Array.isArray(json.tiers)) return json.tiers
  if (Array.isArray(json.rows)) return json.rows
  if (Array.isArray(json.list)) return json.list
  return null
}

export function extractVipClaimsList(json) {
  if (!json) return null
  const checkIsClaim = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return false
    const first = arr[0]
    // Claims log must have user_id, tx_id, or reward_type, and NOT be a tier definition (betting_range)
    return Boolean(first && (first.user_id || first.u_id || first.tx_id || first.reward_type) && !first.betting_range)
  }

  if (json.data && typeof json.data === 'object') {
    if (checkIsClaim(json.data.claims)) return json.data.claims
    if (checkIsClaim(json.data.claims_log)) return json.data.claims_log
    if (checkIsClaim(json.data.claim_logs)) return json.data.claim_logs
    if (checkIsClaim(json.data.history)) return json.data.history
    if (checkIsClaim(json.data.logs)) return json.data.logs
  }
  if (checkIsClaim(json.claims)) return json.claims
  if (checkIsClaim(json.claims_log)) return json.claims_log
  return null
}

export function normalizeVipTier(item, idx = 0) {
  if (!item || typeof item !== 'object') return null
  const id = item.id ?? item.level ?? item.vip_level ?? (idx + 1)
  const levelNum = Number(item.level ?? item.vip_level ?? item.id ?? (idx + 1))
  const rawName = item.name || item.tier_name || (levelNum ? `VIP ${levelNum}` : `VIP ${idx + 1}`)
  const name = typeof rawName === 'string' && rawName.toLowerCase().startsWith('vip')
    ? rawName.toUpperCase()
    : rawName

  const styleIdx = (levelNum && levelNum > 0 ? levelNum - 1 : idx) % VIP_TIER_STYLES.length
  const defaultStyle = VIP_TIER_STYLES[styleIdx] || VIP_TIER_STYLES[0]

  const title = item.title || defaultStyle.title || `VIP Level ${levelNum || idx + 1}`

  // Betting range (turnover target)
  const rawRange = item.betting_range ?? item.range ?? item.betting_turnover ?? item.turnover ?? item.turnover_target ?? item.target ?? item.recharge ?? item.exp ?? item.points ?? 0
  const range = Number(rawRange) || 0

  // Level Up Rewards (upgrade bonus)
  const rawUp = item.level_up_rewards ?? item.up ?? item.upgrade_bonus ?? item.level_up_reward ?? item.level_up_bonus ?? item.bonus ?? item.upgrade_reward ?? 0
  const up = Number(rawUp) || 0

  // Monthly Rewards (monthly salary / bonus)
  const rawMonth = item.monthly_rewards ?? item.month ?? item.monthly_salary ?? item.monthly_bonus ?? item.monthly_reward ?? item.monthly ?? 0
  const month = Number(rawMonth) || 0

  // Action
  const action = Array.isArray(item.action) ? item.action : ['edit', 'update']

  // Rebate
  let rebate = item.rebate
  if (!rebate) {
    if (item.cash_rebate !== undefined && item.cash_rebate !== null) rebate = `${item.cash_rebate}%`
    else if (item.rebate_percentage !== undefined && item.rebate_percentage !== null) rebate = `${item.rebate_percentage}%`
    else rebate = '0.20%'
  } else if (typeof rebate === 'number') {
    rebate = `${rebate}%`
  }

  // Members count
  const members = Number(item.members ?? item.active_members ?? item.total_users ?? item.player_count ?? 0)

  // Status
  const rawStatus = item.status ?? item.is_active ?? item.active
  const isActive = rawStatus === 'Active' || rawStatus === 1 || rawStatus === '1' || rawStatus === true || rawStatus === 'active' || rawStatus === undefined

  return {
    id,
    level: levelNum || (idx + 1),
    name,
    title,
    range,
    betting_range: range,
    up,
    level_up_rewards: up,
    month,
    monthly_rewards: month,
    action,
    rebate,
    members,
    status: isActive ? 'Active' : 'Paused',
    color: item.color || defaultStyle.color,
    badge_color: item.badge_color || defaultStyle.badge_color,
    raw: item,
  }
}


