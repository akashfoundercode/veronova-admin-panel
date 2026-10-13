const MLM_LEVELS_KEY = 'veronova_mlm_levels_v2'
const MLM_AGENTS_KEY = 'veronova_mlm_agents_v2'

export const initialMlmLevels = [
  {
    id: 1,
    name: 'Level 1',
    title: 'Direct Referrals (1st Gen)',
    count: 1,
    commission_rate: 0.60,
    rate_display: '0.6000%',
    depth_share: '60.0% Base',
    min_active_downlines: 1,
    members_count: 420,
    turnover_volume: 4850000,
    commission_paid: 29100,
    status: 'Active',
    color: 'from-blue-600 to-indigo-700',
    badge_color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    id: 2,
    name: 'Level 2',
    title: 'Secondary Sub-Referrals (2nd Gen)',
    count: 2,
    commission_rate: 0.18,
    rate_display: '0.1800%',
    depth_share: '18.0% Base',
    min_active_downlines: 2,
    members_count: 840,
    turnover_volume: 8420000,
    commission_paid: 15156,
    status: 'Active',
    color: 'from-emerald-500 to-teal-700',
    badge_color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    id: 3,
    name: 'Level 3',
    title: 'Tertiary Sub-Referrals (3rd Gen)',
    count: 3,
    commission_rate: 0.054,
    rate_display: '0.0540%',
    depth_share: '5.4% Base',
    min_active_downlines: 3,
    members_count: 1620,
    turnover_volume: 12150000,
    commission_paid: 6561,
    status: 'Active',
    color: 'from-purple-500 to-violet-700',
    badge_color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  {
    id: 4,
    name: 'Level 4',
    title: 'Network Depth Tier 4 (4th Gen)',
    count: 4,
    commission_rate: 0.016,
    rate_display: '0.0160%',
    depth_share: '1.6% Base',
    min_active_downlines: 4,
    members_count: 2450,
    turnover_volume: 15800000,
    commission_paid: 2528,
    status: 'Active',
    color: 'from-amber-500 to-yellow-600',
    badge_color: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    id: 5,
    name: 'Level 5',
    title: 'Network Depth Tier 5 (5th Gen)',
    count: 5,
    commission_rate: 0.0048,
    rate_display: '0.0048%',
    depth_share: '0.48% Base',
    min_active_downlines: 5,
    members_count: 3120,
    turnover_volume: 18900000,
    commission_paid: 907,
    status: 'Active',
    color: 'from-rose-500 to-pink-700',
    badge_color: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  {
    id: 6,
    name: 'Level 6',
    title: 'Infinite Base Tier 6 (6th Gen)',
    count: 6,
    commission_rate: 0.0014,
    rate_display: '0.0014%',
    depth_share: '0.14% Base',
    min_active_downlines: 6,
    members_count: 4050,
    turnover_volume: 22400000,
    commission_paid: 313,
    status: 'Active',
    color: 'from-cyan-600 to-blue-800',
    badge_color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  },
]

export const initialTopAgents = [
  {
    id: 1,
    agent_id: 'VN_99814',
    agent_name: 'Akash_Pro',
    mobile: '9876543210',
    direct_referrals: 48,
    total_downline: 1420,
    team_turnover: 14500000,
    total_commission: 84520,
    status: 'Active Top Sponsor',
    tier: 'Diamond Leader',
  },
  {
    id: 2,
    agent_id: 'MAMF1350',
    agent_name: 'Rahul_Champ',
    mobile: '7991877018',
    direct_referrals: 32,
    total_downline: 890,
    team_turnover: 8200000,
    total_commission: 45210,
    status: 'Active Sponsor',
    tier: 'Platinum Leader',
  },
  {
    id: 3,
    agent_id: 'VZPH8680',
    agent_name: 'User_L13HY',
    mobile: '7800302707',
    direct_referrals: 18,
    total_downline: 430,
    team_turnover: 4800000,
    total_commission: 22800,
    status: 'Active Sponsor',
    tier: 'Gold Leader',
  },
  {
    id: 4,
    agent_id: 'KRNX7721',
    agent_name: 'Karan_Striker',
    mobile: '9368117311',
    direct_referrals: 24,
    total_downline: 380,
    team_turnover: 3600000,
    total_commission: 18400,
    status: 'Active Sponsor',
    tier: 'Silver Leader',
  },
]

export const initialCommissionLogs = [
  {
    id: 'MLM_TX_1001',
    sponsor_id: 'VN_99814',
    sponsor_name: 'Akash_Pro',
    downline_id: 'MAMF1350',
    level: 'Level 1 (0.60%)',
    game: 'Aviator Crash',
    bet_amount: 10000,
    commission_earned: 60.0,
    time: 'Today, 02:40 PM',
  },
  {
    id: 'MLM_TX_1002',
    sponsor_id: 'VN_99814',
    sponsor_name: 'Akash_Pro',
    downline_id: 'VZPH8680',
    level: 'Level 2 (0.18%)',
    game: 'Colour Prediction (1M)',
    bet_amount: 5000,
    commission_earned: 9.0,
    time: 'Today, 02:15 PM',
  },
  {
    id: 'MLM_TX_1003',
    sponsor_id: 'MAMF1350',
    sponsor_name: 'Rahul_Champ',
    downline_id: 'HLYY2860',
    level: 'Level 1 (0.60%)',
    game: 'Chicken Road Game',
    bet_amount: 2500,
    commission_earned: 15.0,
    time: 'Today, 01:50 PM',
  },
  {
    id: 'MLM_TX_1004',
    sponsor_id: 'VZPH8680',
    sponsor_name: 'User_L13HY',
    downline_id: 'BHJP4011',
    level: 'Level 1 (0.60%)',
    game: 'Colour Prediction',
    bet_amount: 1000,
    commission_earned: 6.0,
    time: 'Today, 01:20 PM',
  },
  {
    id: 'MLM_TX_1005',
    sponsor_id: 'VN_99814',
    sponsor_name: 'Akash_Pro',
    downline_id: 'JXEH0711',
    level: 'Level 3 (0.054%)',
    game: 'Horse-Riding',
    bet_amount: 8000,
    commission_earned: 4.32,
    time: 'Today, 12:45 PM',
  },
]

export function getMlmLevels() {
  try {
    const raw = localStorage.getItem(MLM_LEVELS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error('Error reading MLM levels:', e)
  }
  return initialMlmLevels
}

export function saveMlmLevels(list) {
  try {
    localStorage.setItem(MLM_LEVELS_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Error saving MLM levels:', e)
  }
}

