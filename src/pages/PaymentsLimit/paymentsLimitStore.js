export const SEED_LIMITS = [
  { id: 1, channel: 'PhonePe UPI QR', min_amt: 100, max_amt: 50000, daily_cap: 2500000, fee: '0.0%', status: 'Active', speed: 'Instant (1-5s)', type: 'Deposit' },
  { id: 2, channel: 'GooglePay UPI Direct', min_amt: 200, max_amt: 50000, daily_cap: 2000000, fee: '0.0%', status: 'Active', speed: 'Instant (1-5s)', type: 'Deposit' },
  { id: 3, channel: 'Paytm Wallet & UPI', min_amt: 100, max_amt: 50000, daily_cap: 1500000, fee: '0.0%', status: 'Active', speed: 'Instant (1-5s)', type: 'Deposit' },
  { id: 4, channel: 'IMPS Direct Netbanking', min_amt: 500, max_amt: 200000, daily_cap: 5000000, fee: '0.0%', status: 'Active', speed: '1-3 mins', type: 'Deposit' },
  { id: 5, channel: 'USDT TRC20 Crypto', min_amt: 1700, max_amt: 1000000, daily_cap: 10000000, fee: '1.0%', status: 'Active', speed: 'Blockchain (2-5m)', type: 'Deposit' },
  { id: 6, channel: 'Player Instant Cashout IMPS', min_amt: 500, max_amt: 100000, daily_cap: 1500000, fee: '0.0%', status: 'Active', speed: 'Instant (Under 2m)', type: 'Withdrawal' },
]

const LIMITS_KEY = 'veronova_payments_limit_v1'

/**
 * Deduplicate limits by ID and Channel key
 */
export function deduplicateLimits(list) {
  if (!Array.isArray(list)) return []
  const seenIds = new Set()
  const seenChannels = new Set()
  const result = []

  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const idKey = item.id !== undefined && item.id !== null ? String(item.id) : null
    const channelKey = `${(item.channel || item.name || '').trim().toLowerCase()}|${(item.type || '').trim().toLowerCase()}`

    if (idKey && seenIds.has(idKey)) continue
    if (channelKey && seenChannels.has(channelKey)) continue

    if (idKey) seenIds.add(idKey)
    if (channelKey) seenChannels.add(channelKey)
    result.push(item)
  }

  return result
}

export function getPaymentLimits() {
  try {
    const raw = localStorage.getItem(LIMITS_KEY)
    if (!raw) return SEED_LIMITS
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return deduplicateLimits(parsed)
    }
    return SEED_LIMITS
  } catch (err) {
    return SEED_LIMITS
  }
}

export function savePaymentLimits(limits) {
  try {
    const clean = deduplicateLimits(limits)
    localStorage.setItem(LIMITS_KEY, JSON.stringify(clean))
  } catch (err) {}
}

export function normalizePaymentLimit(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id ?? raw._id ?? raw['#'] ?? index + 1
  const channel = raw.channel || raw.name || raw.channel_name || raw.gateway || `Gateway Channel #${id}`
  const min_amt = Number(raw.min_amt ?? raw.min_amount ?? raw.min ?? raw.minimum ?? 100)
  const max_amt = Number(raw.max_amt ?? raw.max_amount ?? raw.max ?? raw.maximum ?? 50000)
  const daily_cap = Number(raw.daily_cap ?? raw.daily_limit ?? raw.daily_max ?? raw.cap ?? 2000000)
  const fee = raw.fee !== undefined ? String(raw.fee) : (raw.gateway_fee !== undefined ? `${raw.gateway_fee}%` : '0.0%')
  
  let status = 'Active'
  if (raw.status !== undefined && raw.status !== null) {
    if (typeof raw.status === 'string') {
      const s = raw.status.trim().toLowerCase()
      if (s === 'active' || s === '1' || s === 'enabled') status = 'Active'
      else if (s === 'inactive' || s === '0' || s === 'disabled') status = 'Inactive'
      else status = raw.status.charAt(0).toUpperCase() + raw.status.slice(1)
    } else if (raw.status === 0 || raw.status === false) {
      status = 'Inactive'
    } else {
      status = 'Active'
    }
  }

  const speed = raw.speed || raw.processing_time || raw.duration || 'Instant (Auto)'
  let type = raw.type || (channel.toLowerCase().includes('cashout') || channel.toLowerCase().includes('withdraw') ? 'Withdrawal' : 'Deposit')
  if (type.toLowerCase() === 'recharge') type = 'Deposit'
  if (type.toLowerCase() === 'payout') type = 'Withdrawal'

  return {
    id,
    channel,
    min_amt,
    max_amt,
    daily_cap,
    fee: fee.includes('%') ? fee : `${fee}%`,
    status,
    speed,
    type,
    raw,
  }
}

