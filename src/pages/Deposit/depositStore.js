export const SEED_DEPOSITS = [
  { id: 1, txn_id: 'DEP_992014', utr: '428910293847', user_id: 'VN_78291', user_name: 'Vikram Rawat', channel: 'PhonePe UPI', amount: 15000, status: 'Success', date: '13 Oct 2026 09:15 AM' },
  { id: 2, txn_id: 'DEP_992015', utr: '428910293848', user_id: 'VN_44102', user_name: 'Aman Verma', channel: 'GooglePay UPI', amount: 5000, status: 'Success', date: '13 Oct 2026 09:20 AM' },
  { id: 3, txn_id: 'DEP_992016', utr: '428910293849', user_id: 'VN_99214', user_name: 'Kunal Joshi', channel: 'Paytm UPI', amount: 2000, status: 'Pending', date: '13 Oct 2026 09:35 AM' },
  { id: 4, txn_id: 'DEP_992017', utr: '428910293850', user_id: 'VN_12890', user_name: 'Pooja Singh', channel: 'IMPS Bank', amount: 25000, status: 'Pending', date: '13 Oct 2026 09:40 AM' },
  { id: 5, txn_id: 'DEP_992018', utr: '428910293851', user_id: 'VN_63019', user_name: 'Sneha Patel', channel: 'USDT TRC20', amount: 45000, status: 'Success', date: '13 Oct 2026 09:45 AM' },
  { id: 6, txn_id: 'DEP_992019', utr: '428910293852', user_id: 'VN_88201', user_name: 'Deepak Mehta', channel: 'PhonePe UPI', amount: 1000, status: 'Reject', date: '13 Oct 2026 08:30 AM' },
  { id: 7, txn_id: 'DEP_992020', utr: '428910293853', user_id: 'VN_31940', user_name: 'Rahul Sharma', channel: 'GooglePay UPI', amount: 10000, status: 'Success', date: '13 Oct 2026 08:15 AM' },
]

const DEPOSITS_KEY = 'veronova_deposits_v2'

export function deduplicateDeposits(list) {
  if (!Array.isArray(list)) return []
  const seenIds = new Set()
  const seenTxns = new Set()
  const result = []

  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const idKey = item.id !== undefined && item.id !== null ? String(item.id) : null
    const txnKey = (item.txn_id || item.utr || '').trim().toLowerCase()

    if (idKey && seenIds.has(idKey)) continue
    if (txnKey && seenTxns.has(txnKey)) continue

    if (idKey) seenIds.add(idKey)
    if (txnKey) seenTxns.add(txnKey)
    result.push(item)
  }

  return result
}

export function getDeposits() {
  try {
    const raw = localStorage.getItem(DEPOSITS_KEY) || localStorage.getItem('veronova_deposits_v1')
    if (!raw) return SEED_DEPOSITS
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return deduplicateDeposits(parsed.map((item, idx) => normalizeDeposit(item, idx)))
    }
    return SEED_DEPOSITS
  } catch (err) {
    return SEED_DEPOSITS
  }
}

export function saveDeposits(deposits) {
  try {
    const clean = deduplicateDeposits(deposits)
    localStorage.setItem(DEPOSITS_KEY, JSON.stringify(clean))
  } catch (err) {}
}

export function normalizeStatus(rawStatus) {
  if (rawStatus === undefined || rawStatus === null) return 'Pending'
  const s = String(rawStatus).trim().toLowerCase()
  if (s === 'success' || s === 'approved' || s === 'completed' || s === '1' || s === 'done') {
    return 'Success'
  }
  if (s === 'reject' || s === 'rejected' || s === 'failed' || s === 'cancelled' || s === '0') {
    return 'Reject'
  }
  return 'Pending'
}

export function normalizeDeposit(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id ?? raw._id ?? raw['#'] ?? index + 1
  const txn_id = raw.txn_id || raw.transaction_id || raw.order_id || `DEP_${100000 + id}`
  const utr = raw.utr || raw.utr_number || raw.ref_no || raw.reference_id || 'N/A'
  const user_id = raw.user_id || raw.uid || raw.u_id || raw.player_id || 'VN_00000'
  const user_name = raw.user_name || raw.username || raw.player_name || raw.name || raw.mobile || 'Player'
  const channel = raw.channel || raw.gateway || raw.payment_method || raw.method || 'UPI Gateway'
  const amount = Number(raw.amount ?? raw.money ?? raw.deposit_amount ?? 0)
  const status = normalizeStatus(raw.status)
  
  let date = raw.date || raw.created_at || raw.createdAt || raw.time || new Date().toLocaleString()
  if (typeof date === 'string' && date.includes('T')) {
    date = date.replace('T', ' ').slice(0, 19)
  }

  return {
    id,
    txn_id: String(txn_id),
    utr: String(utr),
    user_id: String(user_id),
    user_name: String(user_name),
    channel: String(channel),
    amount,
    status,
    date: String(date),
    raw,
  }
}

