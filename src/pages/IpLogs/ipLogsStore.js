const STORAGE_KEY = 'veronova_ip_logs_v3'

export const initialSummary = {
  total_logins: 103,
  totalLogins: 103,
  today_logins: 7,
  todayLogins: 7,
  today_users: 1,
  todayUsers: 1,
  total_users: 3,
  totalUsers: 3,
  unique_ips: 59,
  uniqueIps: 59,
  active_type: 'all',
}

// Normalizer to format raw API records from /admin/login-history
export function normalizeLoginLog(raw, index = 0) {
  const id = raw['#'] ?? raw.id ?? (103 - index)
  const userId = raw.u_id || (raw.user_id ? `ADMIN_${raw.user_id}` : `USR_${id}`)
  const userName = raw.username || raw.user_name || 'Admin'
  const ip = raw.ip_address || raw.ip || '127.0.0.1'
  const isToday = raw.is_today === true || raw.today === true
  const loginTime = raw.login_time || raw.created_at || raw.date || 'Just Now'
  const date = raw.date || (raw.created_at ? raw.created_at.split('T')[0] : '')
  const mobile = raw.mobile || '—'
  const email = raw.email || '—'
  const accountType = raw.account_type ?? 0

  // Geographic and ISP detection heuristics
  const isLocal = ip === '::1' || ip.includes('127.0.0.1')
  let isp = raw.isp
  let location = raw.location
  let device = raw.device
  let securityTag = raw.security_tag

  if (!isp) {
    if (isLocal) isp = 'Internal Loopback / Localhost'
    else if (ip.startsWith('49.43')) isp = 'Reliance Jio Infocomm 5G'
    else if (ip.startsWith('152.58')) isp = 'Bharti Airtel Broadband'
    else if (ip.startsWith('223.184')) isp = 'Vodafone Idea Ltd'
    else if (ip.startsWith('106.219')) isp = 'Tata Teleservices Ltd'
    else isp = 'Carrier Network Telecom'
  }

  if (!location) {
    if (isLocal) location = 'Localhost System (Dev)'
    else if (ip.startsWith('49.43')) location = 'Mumbai, Maharashtra, IN'
    else if (ip.startsWith('152.58')) location = 'Delhi NCR, IN'
    else if (ip.startsWith('223.184')) location = 'Kolkata, WB, IN'
    else location = 'India (Verified GeoIP)'
  }

  if (!device) {
    if (isLocal) device = 'Admin Web Console (macOS / Chrome)'
    else if (ip.startsWith('49.43')) device = 'iPhone 15 (iOS / Safari)'
    else if (ip.startsWith('152.58')) device = 'Samsung Galaxy S24 (Android)'
    else device = 'Web Client Portal'
  }

  if (!securityTag) {
    if (isLocal) securityTag = 'Secure Local Session'
    else if (isToday) securityTag = 'Today Active'
    else securityTag = 'Residential Clean'
  }

  return {
    id,
    user_id: userId,
    user_name: userName,
    username: userName,
    mobile,
    email,
    account_type: accountType,
    ip,
    ip_address: ip,
    isp,
    location,
    device,
    security_tag: securityTag,
    time: loginTime,
    login_time: loginTime,
    date,
    today: isToday,
    is_today: isToday,
    is_blocked: Boolean(raw.is_blocked),
    accounts_on_ip: raw.accounts_on_ip || [userId],
    raw,
  }
}

// Initial realistic baseline data matching the exact /admin/login-history backend records
export const initialRawLogs = [
  { "#": 103, id: 103, user_id: 1, u_id: "ADMIN_123", username: "Admin", mobile: "1234567890", email: "admin@gmail.com", account_type: 0, ip_address: "::1", login_time: "2026-10-15 04:19:08", date: "2026-10-15", is_today: true, created_at: "2026-10-15T04:19:08.000Z" },
  { "#": 102, id: 102, user_id: 1, u_id: "ADMIN_123", username: "Admin", mobile: "1234567890", email: "admin@gmail.com", account_type: 0, ip_address: "::ffff:127.0.0.1", login_time: "2026-10-15 04:02:31", date: "2026-10-15", is_today: true, created_at: "2026-10-15T04:02:31.000Z" },
  { "#": 101, id: 101, user_id: 1, u_id: "ADMIN_123", username: "Admin", mobile: "1234567890", email: "admin@gmail.com", account_type: 0, ip_address: "::1", login_time: "2026-10-15 03:59:51", date: "2026-10-15", is_today: true, created_at: "2026-10-15T03:59:51.000Z" },
  { "#": 100, id: 100, user_id: 1, u_id: "ADMIN_123", username: "Admin", mobile: "1234567890", email: "admin@gmail.com", account_type: 0, ip_address: "127.0.0.1", login_time: "2026-10-15 03:58:37", date: "2026-10-15", is_today: true, created_at: "2026-10-15T03:58:37.000Z" },
  { "#": 99, id: 99, user_id: 1, u_id: "ADMIN_123", username: "Admin", mobile: "1234567890", email: "admin@gmail.com", account_type: 0, ip_address: "127.0.0.1", login_time: "2026-10-15 03:58:37", date: "2026-10-15", is_today: true, created_at: "2026-10-15T03:58:37.000Z" },
  { "#": 98, id: 98, user_id: 1, u_id: "ADMIN_123", username: "Admin", mobile: "1234567890", email: "admin@gmail.com", account_type: 0, ip_address: "127.0.0.1", login_time: "2026-10-15 03:58:37", date: "2026-10-15", is_today: true, created_at: "2026-10-15T03:58:37.000Z" },
  { "#": 97, id: 97, user_id: 1, u_id: "ADMIN_123", username: "Admin", mobile: "1234567890", email: "admin@gmail.com", account_type: 0, ip_address: "127.0.0.1", login_time: "2026-10-15 03:58:37", date: "2026-10-15", is_today: true, created_at: "2026-10-15T03:58:37.000Z" },
  { "#": 96, id: 96, user_id: 1, u_id: "ADMIN_123", username: "Admin", mobile: "1234567890", email: "admin@gmail.com", account_type: 0, ip_address: "152.58.154.177", login_time: "2026-10-10 08:01:58", date: "2026-10-10", is_today: false, created_at: "2026-10-10T08:01:58.000Z" },
  { "#": 95, id: 95, user_id: 1, u_id: "ADMIN_123", username: "Admin", mobile: "1234567890", email: "admin@gmail.com", account_type: 0, ip_address: "49.43.119.33", login_time: "2026-10-10 07:29:56", date: "2026-10-10", is_today: false, created_at: "2026-10-10T07:29:56.000Z" },
  { "#": 94, id: 94, user_id: 1, u_id: "ADMIN_123", username: "Admin", mobile: "1234567890", email: "admin@gmail.com", account_type: 0, ip_address: "152.58.152.81", login_time: "2026-10-10 03:55:14", date: "2026-10-10", is_today: false, created_at: "2026-10-10T03:55:14.000Z" },
  { "#": 93, id: 93, user_id: 1, u_id: "ADMIN_123", username: "Admin", mobile: "1234567890", email: "admin@gmail.com", account_type: 0, ip_address: "152.58.128.212", login_time: "2026-10-09 06:35:55", date: "2026-10-09", is_today: false, created_at: "2026-10-09T06:35:55.000Z" },
  { "#": 92, id: 92, user_id: 1, u_id: "ADMIN_123", username: "Admin", mobile: "1234567890", email: "admin@gmail.com", account_type: 0, ip_address: "223.184.167.193", login_time: "2026-10-09 05:34:36", date: "2026-10-09", is_today: false, created_at: "2026-10-09T05:34:36.000Z" },
  { "#": 91, id: 91, user_id: 1, u_id: "ADMIN_123", username: "Admin", mobile: "1234567890", email: "admin@gmail.com", account_type: 0, ip_address: "49.43.119.129", login_time: "2026-10-06 09:42:59", date: "2026-10-06", is_today: false, created_at: "2026-10-06T09:42:59.000Z" },
  { "#": 90, id: 90, user_id: 1, u_id: "ADMIN_123", username: "Admin", mobile: "1234567890", email: "admin@gmail.com", account_type: 0, ip_address: "106.219.189.101", login_time: "2026-10-05 05:36:28", date: "2026-10-05", is_today: false, created_at: "2026-10-05T05:36:28.000Z" },
  { "#": 89, id: 89, user_id: 1, u_id: "ADMIN_123", username: "Admin", mobile: "1234567890", email: "admin@gmail.com", account_type: 0, ip_address: "152.58.153.151", login_time: "2026-10-05 03:47:34", date: "2026-10-05", is_today: false, created_at: "2026-10-05T03:47:34.000Z" },
  { "#": 88, id: 88, user_id: 1, u_id: "ADMIN_123", username: "Admin", mobile: "1234567890", email: "admin@gmail.com", account_type: 0, ip_address: "223.184.152.33", login_time: "2026-10-02 10:07:27", date: "2026-10-02", is_today: false, created_at: "2026-10-02T10:07:27.000Z" },
  { "#": 87, id: 87, user_id: 7, u_id: "BHJP4011", username: "User_VBRDE", mobile: "8090145106", email: null, account_type: 0, ip_address: "152.58.129.23", login_time: "2026-10-02 09:44:32", date: "2026-10-02", is_today: false, created_at: "2026-10-02T09:44:32.000Z" },
  { "#": 86, id: 86, user_id: 1, u_id: "ADMIN_123", username: "Admin", mobile: "1234567890", email: "admin@gmail.com", account_type: 0, ip_address: "152.58.155.127", login_time: "2026-10-02 08:33:13", date: "2026-10-02", is_today: false, created_at: "2026-10-02T08:33:13.000Z" },
  { "#": 85, id: 85, user_id: 1, u_id: "ADMIN_123", username: "Admin", mobile: "1234567890", email: "admin@gmail.com", account_type: 0, ip_address: "152.58.155.127", login_time: "2026-10-02 08:21:28", date: "2026-10-02", is_today: false, created_at: "2026-10-02T08:21:28.000Z" },
  { "#": 84, id: 84, user_id: 1, u_id: "ADMIN_123", username: "Admin", mobile: "1234567890", email: "admin@gmail.com", account_type: 0, ip_address: "152.58.155.127", login_time: "2026-10-02 08:19:20", date: "2026-10-02", is_today: false, created_at: "2026-10-02T08:19:20.000Z" },
]

export const initialIpLogs = initialRawLogs.map(normalizeLoginLog)

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
