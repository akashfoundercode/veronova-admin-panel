const TIERS_STORAGE_KEY = 'veronova_attendance_tiers_v2'
const LOGS_STORAGE_KEY = 'veronova_attendance_logs_v2'

export const initialTiers = [
  {
    id: 7,
    day: 'Day 7',
    tier_name: 'Tier 7 (Jackpot Streak)',
    accumulated: 200000,
    bonus: 6500,
    min_streak_days: 7,
    status: 'Active',
    date: '2026-05-18 05:35:07',
    tag: 'Jackpot',
  },
  {
    id: 6,
    day: 'Day 6',
    tier_name: 'Tier 6 (Diamond)',
    accumulated: 80000,
    bonus: 2500,
    min_streak_days: 6,
    status: 'Active',
    date: '2026-05-18 05:34:27',
    tag: 'High Roller',
  },
  {
    id: 5,
    day: 'Day 5',
    tier_name: 'Tier 5 (Platinum)',
    accumulated: 20000,
    bonus: 451,
    min_streak_days: 5,
    status: 'Active',
    date: '2026-05-18 05:33:59',
    tag: 'VIP Reward',
  },
  {
    id: 4,
    day: 'Day 4',
    tier_name: 'Tier 4 (Gold)',
    accumulated: 8000,
    bonus: 201,
    min_streak_days: 4,
    status: 'Active',
    date: '2026-05-18 05:33:16',
    tag: 'Gold Streak',
  },
  {
    id: 3,
    day: 'Day 3',
    tier_name: 'Tier 3 (Silver)',
    accumulated: 3000,
    bonus: 101,
    min_streak_days: 3,
    status: 'Active',
    date: '2026-05-18 05:32:43',
    tag: 'Silver Streak',
  },
  {
    id: 2,
    day: 'Day 2',
    tier_name: 'Tier 2 (Bronze)',
    accumulated: 1000,
    bonus: 21,
    min_streak_days: 2,
    status: 'Active',
    date: '2026-05-18 05:32:12',
    tag: 'Starter',
  },
  {
    id: 1,
    day: 'Day 1',
    tier_name: 'Tier 1 (Welcome Check-in)',
    accumulated: 110,
    bonus: 10,
    min_streak_days: 1,
    status: 'Active',
    date: '2026-05-18 05:31:58',
    tag: 'Sign-in',
  },
]

export const initialClaimLogs = [
  {
    id: 101,
    user_id: 'VN_99814',
    user_name: 'Akash_Pro',
    mobile: '9876543210',
    streak_day: 7,
    accumulated: 215000,
    bonus: 6500,
    claimed_at: '2026-07-12 11:20:45',
    status: 'Credited',
  },
  {
    id: 102,
    user_id: 'MAMF1350',
    user_name: 'Rahul_Champ',
    mobile: '7991877018',
    streak_day: 6,
    accumulated: 85200,
    bonus: 2500,
    claimed_at: '2026-07-12 10:45:12',
    status: 'Credited',
  },
  {
    id: 103,
    user_id: 'VZPH8680',
    user_name: 'User_L13HY',
    mobile: '7800302707',
    streak_day: 5,
    accumulated: 39848,
    bonus: 451,
    claimed_at: '2026-07-12 09:30:20',
    status: 'Credited',
  },
  {
    id: 104,
    user_id: 'HLYY2860',
    user_name: 'User_4CMBA',
    mobile: '8755741645',
    streak_day: 4,
    accumulated: 15400,
    bonus: 201,
    claimed_at: '2026-07-12 08:15:00',
    status: 'Credited',
  },
  {
    id: 105,
    user_id: 'BHJP4011',
    user_name: 'User_VBRDE',
    mobile: '8090145106',
    streak_day: 3,
    accumulated: 5000,
    bonus: 101,
    claimed_at: '2026-07-11 18:40:15',
    status: 'Credited',
  },
  {
    id: 106,
    user_id: 'KRNX7721',
    user_name: 'Karan_Striker',
    mobile: '9368117311',
    streak_day: 2,
    accumulated: 1200,
    bonus: 21,
    claimed_at: '2026-07-11 14:10:05',
    status: 'Credited',
  },
  {
    id: 107,
    user_id: 'JXEH0711',
    user_name: 'User_GR9MH',
    mobile: '9336193591',
    streak_day: 1,
    accumulated: 150,
    bonus: 10,
    claimed_at: '2026-07-11 12:05:30',
    status: 'Credited',
  },
]

export function getAttendanceTiers() {
  try {
    const raw = localStorage.getItem(TIERS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error('Error loading attendance tiers:', e)
  }
  return initialTiers
}

export function saveAttendanceTiers(list) {
  try {
    localStorage.setItem(TIERS_STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Error saving attendance tiers:', e)
  }
}

export function getClaimLogs() {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error('Error loading attendance claim logs:', e)
  }
  return initialClaimLogs
}

export function saveClaimLogs(list) {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Error saving attendance claim logs:', e)
  }
}

