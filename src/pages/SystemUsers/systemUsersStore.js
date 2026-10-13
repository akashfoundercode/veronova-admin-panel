const STORAGE_KEY = 'veronova_system_users_v2'

export const initialSystemUsers = [
  {
    id: 1,
    user_id: 'SYS_001',
    user_name: 'super_admin_demo',
    email: 'admin.sandbox@veronova.io',
    mobile: '9876540001',
    role: 'System Operator',
    wallet: 500000,
    password: 'AdminDemo@2026',
    status: 'Active Sandbox',
    created_at: '12-07-2026 07:01 PM',
    last_login: 'Today, 09:40 AM',
  },
  {
    id: 2,
    user_id: 'DEMO_101',
    user_name: 'demo_player_alpha',
    email: 'demo1@veronova.com',
    mobile: '9876540002',
    role: 'Demo Player',
    wallet: 25000,
    password: 'DemoPass@101',
    status: 'Active Sandbox',
    created_at: '11-07-2026 06:45 PM',
    last_login: 'Today, 08:15 AM',
  },
  {
    id: 3,
    user_id: 'QA_201',
    user_name: 'qa_crash_tester',
    email: 'qa.aviator@veronova.io',
    mobile: '9876540003',
    role: 'QA Tester',
    wallet: 100000,
    password: 'QaCrash#2026',
    status: 'Active Sandbox',
    created_at: '10-07-2026 05:30 PM',
    last_login: 'Yesterday, 04:20 PM',
  },
  {
    id: 4,
    user_id: 'BOT_301',
    user_name: 'simulator_bot_wingo',
    email: 'bot.wingo@veronova.internal',
    mobile: '9876540004',
    role: 'Bot Simulator',
    wallet: 200000,
    password: 'SimBot$9920',
    status: 'Active Sandbox',
    created_at: '09-07-2026 03:12 PM',
    last_login: 'Live Engine Running',
  },
  {
    id: 5,
    user_id: 'DEMO_102',
    user_name: 'highroller_demo',
    email: 'highroller.demo@gmail.com',
    mobile: '9876540005',
    role: 'Demo Player',
    wallet: 1000000,
    password: 'VipDemo!8820',
    status: 'Active Sandbox',
    created_at: '08-07-2026 11:20 AM',
    last_login: '10-07-2026 02:10 PM',
  },
  {
    id: 6,
    user_id: 'QA_202',
    user_name: 'qa_chicken_tester',
    email: 'qa.chicken@veronova.io',
    mobile: '9876540006',
    role: 'QA Tester',
    wallet: 50000,
    password: 'QaChicken#77',
    status: 'Disabled',
    created_at: '05-07-2026 10:00 AM',
    last_login: '07-07-2026 11:30 AM',
  },
]

export function getSystemUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error('Error loading system users:', e)
  }
  return initialSystemUsers
}

export function saveSystemUsers(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Error saving system users:', e)
  }
}

