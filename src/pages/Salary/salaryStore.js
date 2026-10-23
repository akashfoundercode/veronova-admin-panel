// Initial Mock Seed Data for Agent & Player Salary Management
export const INITIAL_SALARY_DATA = [
  {
    id: 1,
    user_id: 'VN_78291',
    user: 'Vikram Rawat',
    role: 'Master Agent',
    avatar_color: 'from-blue-600 to-indigo-600',
    active: 34,
    down: 420,
    dDep: 85000,
    dWd: 18000,
    mDep: 1250000,
    mWd: 420000,
    amount: 35000,
    type: 'monthly',
    status: 'Paid',
    date: '12 Oct 2026 09:30 AM',
    sel: false,
    remarks: 'Achieved Tier 3 Downline Target'
  },
  {
    id: 2,
    user_id: 'VN_44102',
    user: 'Aman Verma',
    role: 'Super Affiliate',
    avatar_color: 'from-purple-600 to-pink-600',
    active: 19,
    down: 185,
    dDep: 32000,
    dWd: 6500,
    mDep: 640000,
    mWd: 210000,
    amount: 15000,
    type: 'monthly',
    status: 'Paid',
    date: '12 Oct 2026 09:32 AM',
    sel: false,
    remarks: 'Monthly fixed salary + bonus'
  },
  {
    id: 3,
    user_id: 'VN_99214',
    user: 'Kunal Joshi',
    role: 'Senior Partner',
    avatar_color: 'from-amber-500 to-orange-600',
    active: 28,
    down: 310,
    dDep: 64000,
    dWd: 12000,
    mDep: 980000,
    mWd: 310000,
    amount: 2500,
    type: 'daily',
    status: 'Pending',
    date: '13 Oct 2026 08:45 AM',
    sel: false,
    remarks: 'Daily performance payout'
  },
  {
    id: 4,
    user_id: 'VN_12890',
    user: 'Pooja Singh',
    role: 'Direct Agent',
    avatar_color: 'from-emerald-500 to-teal-600',
    active: 12,
    down: 95,
    dDep: 18000,
    dWd: 4000,
    mDep: 320000,
    mWd: 95000,
    amount: 1200,
    type: 'daily',
    status: 'Pending',
    date: '13 Oct 2026 08:50 AM',
    sel: false,
    remarks: 'Daily net P/L incentive'
  },
  {
    id: 5,
    user_id: 'VN_63019',
    user: 'Sneha Patel',
    role: 'Master Agent',
    avatar_color: 'from-rose-500 to-red-600',
    active: 52,
    down: 860,
    dDep: 145000,
    dWd: 35000,
    mDep: 2850000,
    mWd: 890000,
    amount: 60000,
    type: 'monthly',
    status: 'Pending',
    date: '13 Oct 2026 09:00 AM',
    sel: false,
    remarks: 'Top affiliate volume producer'
  },
  {
    id: 6,
    user_id: 'VN_88201',
    user: 'Deepak Mehta',
    role: 'Direct Agent',
    avatar_color: 'from-cyan-600 to-blue-600',
    active: 8,
    down: 62,
    dDep: 9500,
    dWd: 2200,
    mDep: 180000,
    mWd: 55000,
    amount: 800,
    type: 'daily',
    status: 'Processing',
    date: '13 Oct 2026 09:10 AM',
    sel: false,
    remarks: 'Payout queue'
  },
  {
    id: 7,
    user_id: 'VN_31940',
    user: 'Rahul Sharma',
    role: 'Senior Partner',
    avatar_color: 'from-indigo-600 to-violet-700',
    active: 22,
    down: 240,
    dDep: 41000,
    dWd: 9000,
    mDep: 720000,
    mWd: 240000,
    amount: 20000,
    type: 'monthly',
    status: 'Paid',
    date: '11 Oct 2026 06:15 PM',
    sel: false,
    remarks: 'Regular monthly salary cycle'
  },
  {
    id: 8,
    user_id: 'VN_77189',
    user: 'Rohan Gupta',
    role: 'Direct Agent',
    avatar_color: 'from-teal-600 to-emerald-700',
    active: 5,
    down: 38,
    dDep: 6000,
    dWd: 1500,
    mDep: 110000,
    mWd: 32000,
    amount: 500,
    type: 'none',
    status: 'Pending',
    date: '10 Oct 2026 04:20 PM',
    sel: false,
    remarks: 'Reviewing downline retention'
  }
]

const STORAGE_KEY = 'veronova_salary_records_v1'

export function getSalaryRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return INITIAL_SALARY_DATA
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SALARY_DATA
  } catch (err) {
    console.error('Error reading salary records:', err)
    return INITIAL_SALARY_DATA
  }
}

export function saveSalaryRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch (err) {
    console.error('Error saving salary records:', err)
  }
}

export function normalizeSalaryRecord(raw, index = 0) {
  const id = Number(raw.id ?? index + 1)
  const userId = raw.user_id || raw.u_id || raw.userId || `VN_${10000 + id}`
  const userName = raw.user || raw.user_name || raw.username || `Agent ${id}`
  const role = raw.role || 'Agent Partner'
  const active = Number(raw.active ?? raw.active_members ?? raw.active_downlines ?? 0)
  const down = Number(raw.down ?? raw.downlines ?? raw.total_downlines ?? 0)
  const dDep = Number(raw.dDep ?? raw.daily_deposit ?? raw.today_deposit ?? 0)
  const dWd = Number(raw.dWd ?? raw.daily_withdrawal ?? raw.today_withdrawal ?? 0)
  const mDep = Number(raw.mDep ?? raw.monthly_deposit ?? raw.total_deposit ?? 0)
  const mWd = Number(raw.mWd ?? raw.monthly_withdrawal ?? raw.total_withdrawal ?? 0)
  const amount = Number(raw.amount ?? raw.salary ?? raw.salary_amount ?? 0)
  const rawType = (raw.type || raw.salary_type || raw.cycle || 'monthly').toString().toLowerCase()
  const type = rawType.includes('daily') ? 'daily' : (rawType.includes('none') ? 'none' : 'monthly')
  const status = raw.status === 'Paid' || raw.status === 'paid' || raw.is_paid === true ? 'Paid' : 'Pending'
  const date = raw.date || raw.created_at || raw.updated_at || 'Just Now'
  const remarks = raw.remarks || raw.notes || 'Agent performance payroll'

  const colors = [
    'from-blue-600 to-indigo-600',
    'from-purple-600 to-pink-600',
    'from-amber-500 to-orange-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-red-600',
    'from-cyan-600 to-blue-700',
  ]
  const avatarColor = raw.avatar_color || colors[(id - 1) % colors.length]

  return {
    id,
    user_id: userId,
    user: userName,
    user_name: userName,
    role,
    avatar_color: avatarColor,
    active,
    down,
    dDep,
    dWd,
    mDep,
    mWd,
    amount,
    type,
    status,
    date,
    sel: Boolean(raw.sel),
    remarks,
    raw,
  }
}

