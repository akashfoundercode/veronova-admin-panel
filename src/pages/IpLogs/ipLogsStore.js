const STORAGE_KEY = 'veronova_ip_logs_v2'

export const initialIpLogs = [
  {
    id: 97,
    user_id: 'VN_99814',
    user_name: 'Akash_Pro',
    ip: '49.43.119.33',
    isp: 'Reliance Jio Infocomm 5G',
    location: 'Mumbai, Maharashtra, IN',
    device: 'iPhone 15 (iOS 18 / Safari)',
    security_tag: 'Residential Clean',
    time: 'Today, 04:54 PM',
    full_date: '2026-10-13 16:54:12',
    today: true,
    is_blocked: false,
    accounts_on_ip: ['VN_99814'],
  },
  {
    id: 96,
    user_id: 'MAMF1350',
    user_name: 'Rahul_Champ',
    ip: '152.58.154.177',
    isp: 'Bharti Airtel Broadband',
    location: 'Delhi NCR, IN',
    device: 'Samsung Galaxy S24 (Android 14 / Chrome)',
    security_tag: 'Residential Clean',
    time: 'Today, 01:31 PM',
    full_date: '2026-10-13 13:31:05',
    today: true,
    is_blocked: false,
    accounts_on_ip: ['MAMF1350'],
  },
  {
    id: 95,
    user_id: 'VZPH8680',
    user_name: 'User_L13HY',
    ip: '49.43.119.33',
    isp: 'Reliance Jio Infocomm 5G',
    location: 'Mumbai, Maharashtra, IN',
    device: 'OnePlus 12 (Android / Chrome)',
    security_tag: 'Multi-Account Collision',
    time: 'Today, 12:59 PM',
    full_date: '2026-10-13 12:59:40',
    today: true,
    is_blocked: false,
    accounts_on_ip: ['VN_99814', 'VZPH8680', 'HLYY2860'],
  },
  {
    id: 94,
    user_id: 'BOT_4410',
    user_name: 'RapidScript_Bot',
    ip: '45.118.132.88',
    isp: 'Cloudflare / DigitalOcean Datacenter',
    location: 'Frankfurt, DE (Proxy Server)',
    device: 'Automated Headless Chromium (Linux)',
    security_tag: 'VPN / Proxy Alert',
    time: 'Today, 09:25 AM',
    full_date: '2026-10-13 09:25:22',
    today: true,
    is_blocked: true,
    accounts_on_ip: ['BOT_4410', 'SCRIPTER_9'],
  },
  {
    id: 93,
    user_id: 'HLYY2860',
    user_name: 'User_4CMBA',
    ip: '152.58.128.212',
    isp: 'Bharti Airtel Broadband',
    location: 'Bangalore, Karnataka, IN',
    device: 'Windows 11 (Chrome 128)',
    security_tag: 'Residential Clean',
    time: 'Yesterday, 12:05 PM',
    full_date: '2026-10-12 12:05:18',
    today: false,
    is_blocked: false,
    accounts_on_ip: ['HLYY2860'],
  },
  {
    id: 92,
    user_id: 'BHJP4011',
    user_name: 'User_VBRDE',
    ip: '223.184.167.193',
    isp: 'Vodafone Idea Telecommunications',
    location: 'Lucknow, Uttar Pradesh, IN',
    device: 'Vivo V29 (Android / Chrome)',
    security_tag: 'Residential Clean',
    time: 'Yesterday, 11:04 AM',
    full_date: '2026-10-12 11:04:45',
    today: false,
    is_blocked: false,
    accounts_on_ip: ['BHJP4011'],
  },
  {
    id: 91,
    user_id: 'KRNX7721',
    user_name: 'Karan_Striker',
    ip: '49.43.119.129',
    isp: 'Reliance Jio Infocomm 5G',
    location: 'Ahmedabad, Gujarat, IN',
    device: 'MacBook Pro (macOS Sonoma / Safari)',
    security_tag: 'Residential Clean',
    time: '11 Oct 2026, 03:12 PM',
    full_date: '2026-10-11 15:12:00',
    today: false,
    is_blocked: false,
    accounts_on_ip: ['KRNX7721'],
  },
  {
    id: 90,
    user_id: 'SUSP9901',
    user_name: 'Hedger_King',
    ip: '106.219.189.101',
    isp: 'ACT Fibernet High-Speed',
    location: 'Hyderabad, Telangana, IN',
    device: 'Windows 11 (Brave Browser)',
    security_tag: 'Multi-Account Collision',
    time: '10 Oct 2026, 11:06 AM',
    full_date: '2026-10-10 11:06:50',
    today: false,
    is_blocked: true,
    accounts_on_ip: ['SUSP9901', 'HEDG_SUB_1'],
  },
  {
    id: 89,
    user_id: 'JXEH0711',
    user_name: 'User_GR9MH',
    ip: '152.58.153.151',
    isp: 'Bharti Airtel Mobile 4G',
    location: 'Kolkata, West Bengal, IN',
    device: 'Redmi Note 13 (Android / Chrome)',
    security_tag: 'Residential Clean',
    time: '10 Oct 2026, 09:17 AM',
    full_date: '2026-10-10 09:17:35',
    today: false,
    is_blocked: false,
    accounts_on_ip: ['JXEH0711'],
  },
  {
    id: 88,
    user_id: 'PROXY_USER_9',
    user_name: 'VpnExplorer_X',
    ip: '194.26.29.112',
    isp: 'Mullvad / ProtonVPN Datacenter Exit',
    location: 'Stockholm, Sweden (Datacenter)',
    device: 'Windows 10 (Tor / Firefox)',
    security_tag: 'VPN / Proxy Alert',
    time: '09 Oct 2026, 03:37 PM',
    full_date: '2026-10-09 15:37:10',
    today: false,
    is_blocked: true,
    accounts_on_ip: ['PROXY_USER_9'],
  },
]

export function getIpLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error('Error loading IP logs:', e)
  }
  return initialIpLogs
}

export function saveIpLogs(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Error saving IP logs:', e)
  }
}

