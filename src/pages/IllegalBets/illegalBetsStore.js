const STORAGE_KEY = 'veronova_illegal_bets_v2'

export const initialIllegalUsers = [
  {
    id: 1,
    user_id: 'SUSP9901',
    user_name: 'Hedger_King',
    email: 'hedger99@proton.me',
    mobile: '7968676675',
    ip_address: '103.214.62.11',
    location: 'Mumbai, IN',
    violation_type: 'Opposite Betting (Hedging)',
    risk_score: 96,
    risk_level: 'Critical',
    count: 35,
    wallet_at_risk: 125000,
    status: 'Frozen',
    flagged_at: '12-07-2026 10:45 AM',
    bets: [
      { id: 'BET_99182', game: 'Colour Prediction (Wingo 1M)', round_id: '#2026071201', choice: 'Red (₹5,000)', conflict: 'Green (₹5,000) via MAMF1350', amount: 5000, date: '12-07-2026 10:44 AM', ip: '103.214.62.11' },
      { id: 'BET_99181', game: 'Colour Prediction (Wingo 1M)', round_id: '#2026071200', choice: 'Big (₹10,000)', conflict: 'Small (₹10,000) via MAMF1350', amount: 10000, date: '12-07-2026 10:43 AM', ip: '103.214.62.11' },
      { id: 'BET_99175', game: 'Colour Prediction (Wingo 30S)', round_id: '#2026071295', choice: 'Red (₹2,500)', conflict: 'Violet/Green Hedge', amount: 2500, date: '12-07-2026 10:30 AM', ip: '103.214.62.11' },
      { id: 'BET_99160', game: 'Colour Prediction (Wingo 1M)', round_id: '#2026071280', choice: 'Big (₹8,000)', conflict: 'Small (₹8,000) Collision', amount: 8000, date: '12-07-2026 10:15 AM', ip: '103.214.62.11' },
    ],
  },
  {
    id: 2,
    user_id: 'BOT_4410',
    user_name: 'RapidScript_Bot',
    email: 'bot4410@shadow.net',
    mobile: '9368117311',
    ip_address: '45.118.132.88',
    location: 'Bangalore, IN',
    violation_type: 'Bot Rapid Automation',
    risk_score: 91,
    risk_level: 'Critical',
    count: 28,
    wallet_at_risk: 84000,
    status: 'Frozen',
    flagged_at: '12-07-2026 09:15 AM',
    bets: [
      { id: 'BET_88421', game: 'Aviator Crash', round_id: '#AV77180', choice: 'Auto Cashout @ 1.01x', conflict: 'Programmatic API Spikes (4ms latency)', amount: 15000, date: '12-07-2026 09:14 AM', ip: '45.118.132.88' },
      { id: 'BET_88419', game: 'Aviator Crash', round_id: '#AV77179', choice: 'Auto Cashout @ 1.01x', conflict: 'Scripted Burst (12 simultaneous bets)', amount: 15000, date: '12-07-2026 09:12 AM', ip: '45.118.132.88' },
      { id: 'BET_88410', game: 'Chicken Road Game', round_id: '#CK9910', choice: 'Step 1 Instant Cashout', conflict: 'Rapid Loop Macro Detected', amount: 10000, date: '12-07-2026 09:05 AM', ip: '45.118.132.88' },
    ],
  },
  {
    id: 3,
    user_id: 'VN_77180',
    user_name: 'Syndicate_Alpha',
    email: 'alpha77@gmail.com',
    mobile: '8755741645',
    ip_address: '157.48.21.90',
    location: 'Delhi, IN',
    violation_type: 'Multi-Account IP Collision',
    risk_score: 84,
    risk_level: 'High',
    count: 19,
    wallet_at_risk: 45000,
    status: 'Under Review',
    flagged_at: '11-07-2026 07:30 PM',
    bets: [
      { id: 'BET_76210', game: 'Colour Prediction (Wingo 1M)', round_id: '#2026071145', choice: 'Green (₹5,000)', conflict: 'Shared Device Fingerprint with 4 users', amount: 5000, date: '11-07-2026 07:28 PM', ip: '157.48.21.90' },
      { id: 'BET_76205', game: 'Horse-Riding', round_id: '#HR4401', choice: 'Horse #2 Win', conflict: 'Coordinated Syndicate Staking', amount: 8000, date: '11-07-2026 07:15 PM', ip: '157.48.21.90' },
    ],
  },
  {
    id: 4,
    user_id: 'VZPH8680',
    user_name: 'User_L13HY',
    email: 'l13hy@veronova.io',
    mobile: '7800302707',
    ip_address: '106.195.40.15',
    location: 'Lucknow, IN',
    violation_type: 'Opposite Betting (Hedging)',
    risk_score: 76,
    risk_level: 'High',
    count: 4,
    wallet_at_risk: 39848,
    status: 'Under Review',
    flagged_at: '11-07-2026 04:12 PM',
    bets: [
      { id: 'BET_65412', game: 'Chicken Road Game', round_id: '#CK8840', choice: 'Roast Multiplier', conflict: 'Contradictory Hedge Bet', amount: 2000, date: '11-07-2026 04:10 PM', ip: '106.195.40.15' },
      { id: 'BET_65408', game: 'Colour Prediction', round_id: '#2026071110', choice: 'Red (₹1,000)', conflict: 'Opposite Green Placed on Sub-Account', amount: 1000, date: '11-07-2026 04:05 PM', ip: '106.195.40.15' },
    ],
  },
  {
    id: 5,
    user_id: 'WIN_ANOM_02',
    user_name: 'LuckyStreak_99',
    email: 'lucky99@outlook.com',
    mobile: '8090145106',
    ip_address: '117.211.89.34',
    location: 'Varanasi, IN',
    violation_type: 'Abnormal Win Rate',
    risk_score: 68,
    risk_level: 'Medium',
    count: 14,
    wallet_at_risk: 92000,
    status: 'Under Review',
    flagged_at: '10-07-2026 11:20 PM',
    bets: [
      { id: 'BET_54190', game: 'Aviator Crash', round_id: '#AV6610', choice: 'Multi Cashout @ 45.2x', conflict: 'Win Rate 98.4% on 15 consecutive rounds', amount: 2500, date: '10-07-2026 11:18 PM', ip: '117.211.89.34' },
      { id: 'BET_54185', game: 'Chicken Road Game', round_id: '#CK7712', choice: 'Hardcore Step 8', conflict: 'Statistical Anomaly Flag', amount: 1000, date: '10-07-2026 11:10 PM', ip: '117.211.89.34' },
    ],
  },
  {
    id: 6,
    user_id: 'PROXY_USER_9',
    user_name: 'VpnExplorer_X',
    email: 'vpn@hide.me',
    mobile: '9336193591',
    ip_address: '194.26.29.112',
    location: 'Frankfurt, DE (VPN)',
    violation_type: 'Multi-Account IP Collision',
    risk_score: 62,
    risk_level: 'Medium',
    count: 8,
    wallet_at_risk: 15000,
    status: 'Cleared',
    flagged_at: '09-07-2026 03:45 PM',
    bets: [
      { id: 'BET_43210', game: 'Colour Prediction', round_id: '#2026070940', choice: 'Red (₹1,500)', conflict: 'Datacenter Proxy Flag', amount: 1500, date: '09-07-2026 03:40 PM', ip: '194.26.29.112' },
    ],
  },
]

export function getIllegalUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error('Error loading illegal bets users:', e)
  }
  return initialIllegalUsers
}

export function saveIllegalUsers(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Error saving illegal bets users:', e)
  }
}

