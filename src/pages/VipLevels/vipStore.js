const VIP_TIERS_KEY = 'veronova_vip_tiers_v2'
const VIP_CLAIMS_KEY = 'veronova_vip_claims_v2'

export const initialVipTiers = [
  {
    id: 1,
    name: 'VIP 1',
    title: 'Bronze Pioneer',
    range: 3000,
    up: 60,
    month: 30,
    rebate: '0.20%',
    members: 620,
    status: 'Active',
    color: 'from-amber-700 to-amber-900',
    badge_color: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: 2,
    name: 'VIP 2',
    title: 'Silver Challenger',
    range: 30000,
    up: 180,
    month: 90,
    rebate: '0.30%',
    members: 380,
    status: 'Active',
    color: 'from-slate-400 to-slate-600',
    badge_color: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  {
    id: 3,
    name: 'VIP 3',
    title: 'Gold Master',
    range: 300000,
    up: 690,
    month: 290,
    rebate: '0.40%',
    members: 240,
    status: 'Active',
    color: 'from-amber-400 to-yellow-600',
    badge_color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  {
    id: 4,
    name: 'VIP 4',
    title: 'Platinum Elite',
    range: 2000000,
    up: 1800,
    month: 890,
    rebate: '0.50%',
    members: 145,
    status: 'Active',
    color: 'from-teal-400 to-emerald-600',
    badge_color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  {
    id: 5,
    name: 'VIP 5',
    title: 'Sapphire Knight',
    range: 20000000,
    up: 6900,
    month: 1890,
    rebate: '0.65%',
    members: 82,
    status: 'Active',
    color: 'from-blue-500 to-indigo-700',
    badge_color: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  {
    id: 6,
    name: 'VIP 6',
    title: 'Ruby High Roller',
    range: 60000000,
    up: 16900,
    month: 6900,
    rebate: '0.80%',
    members: 46,
    status: 'Active',
    color: 'from-rose-500 to-red-700',
    badge_color: 'bg-rose-100 text-rose-800 border-rose-300',
  },
  {
    id: 7,
    name: 'VIP 7',
    title: 'Amethyst Grandmaster',
    range: 300000000,
    up: 69000,
    month: 16900,
    rebate: '1.00%',
    members: 24,
    status: 'Active',
    color: 'from-purple-600 to-violet-800',
    badge_color: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  {
    id: 8,
    name: 'VIP 8',
    title: 'Emerald Sovereign',
    range: 1000000000,
    up: 169000,
    month: 69000,
    rebate: '1.20%',
    members: 12,
    status: 'Active',
    color: 'from-emerald-600 to-green-900',
    badge_color: 'bg-emerald-100 text-emerald-900 border-emerald-400',
  },
  {
    id: 9,
    name: 'VIP 9',
    title: 'Royal Diamond Monarch',
    range: 5000000000,
    up: 690000,
    month: 169000,
    rebate: '1.40%',
    members: 5,
    status: 'Active',
    color: 'from-cyan-500 via-blue-600 to-indigo-900',
    badge_color: 'bg-cyan-100 text-cyan-900 border-cyan-400',
  },
  {
    id: 10,
    name: 'VIP 10',
    title: 'Supreme Legend Titan',
    range: 9999999999,
    up: 1690000,
    month: 690000,
    rebate: '1.60%',
    members: 2,
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
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
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

