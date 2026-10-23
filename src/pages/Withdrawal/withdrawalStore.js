export const SEED_WITHDRAWALS = [
  { id: 1, req_id: 'WD_4401', user_id: 'VN_78291', user_name: 'Vikram Rawat', bank: 'HDFC Bank', acc_no: '501002938471', ifsc: 'HDFC0001245', holder: 'Vikram Rawat', amount: 12000, status: 'Approved', date: '13 Oct 2026 09:00 AM' },
  { id: 2, req_id: 'WD_4402', user_id: 'VN_44102', user_name: 'Aman Verma', bank: 'ICICI Bank', acc_no: '001201928374', ifsc: 'ICIC0000012', holder: 'Aman Verma', amount: 8500, status: 'Pending', date: '13 Oct 2026 09:25 AM' },
  { id: 3, req_id: 'WD_4403', user_id: 'VN_99214', user_name: 'Kunal Joshi', bank: 'State Bank of India', acc_no: '30291827461', ifsc: 'SBIN0004521', holder: 'Kunal Joshi', amount: 15000, status: 'Pending', date: '13 Oct 2026 09:30 AM' },
  { id: 4, req_id: 'WD_4404', user_id: 'VN_12890', user_name: 'Pooja Singh', bank: 'Axis Bank', acc_no: '918273645012', ifsc: 'UTIB0000213', holder: 'Pooja Singh', amount: 4000, status: 'Approved', date: '13 Oct 2026 08:45 AM' },
  { id: 5, req_id: 'WD_4405', user_id: 'VN_88201', user_name: 'Deepak Mehta', bank: 'Kotak Bank', acc_no: '48192039481', ifsc: 'KKBK0000192', holder: 'Deepak Mehta', amount: 20000, status: 'Reject', date: '12 Oct 2026 07:15 PM' },
  { id: 6, req_id: 'WD_4406', user_id: 'VN_63019', user_name: 'Sneha Patel', bank: 'HDFC Bank', acc_no: '501009182736', ifsc: 'HDFC0001245', holder: 'Sneha Patel', amount: 25000, status: 'Pending', date: '13 Oct 2026 09:45 AM' },
]

const WITHDRAWALS_KEY = 'veronova_withdrawals_v2'

export function deduplicateWithdrawals(list) {
  if (!Array.isArray(list)) return []
  const seenIds = new Set()
  const seenReqs = new Set()
  const result = []

  for (const item of list) {
    if (!item || typeof item !== 'object') continue
    const idKey = item.id !== undefined && item.id !== null ? String(item.id) : null
    const reqKey = (item.req_id || item.txn_id || item.order_id || '').trim().toLowerCase()

    if (idKey && seenIds.has(idKey)) continue
    if (reqKey && seenReqs.has(reqKey)) continue

    if (idKey) seenIds.add(idKey)
    if (reqKey) seenReqs.add(reqKey)
    result.push(item)
  }

  return result
}

export function getWithdrawals() {
  try {
    const raw = localStorage.getItem(WITHDRAWALS_KEY) || localStorage.getItem('veronova_withdrawals_v1')
    if (!raw) return SEED_WITHDRAWALS
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return deduplicateWithdrawals(parsed.map((item, idx) => normalizeWithdrawal(item, idx)))
    }
    return SEED_WITHDRAWALS
  } catch (err) {
    return SEED_WITHDRAWALS
  }
}

export function saveWithdrawals(withdrawals) {
  try {
    const clean = deduplicateWithdrawals(withdrawals)
    localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(clean))
  } catch (err) {}
}

export function normalizeStatus(rawStatus) {
  if (rawStatus === undefined || rawStatus === null) return 'Pending'
  const s = String(rawStatus).trim().toLowerCase()
  if (s === 'approved' || s === 'success' || s === 'settled' || s === 'completed' || s === '1' || s === 'done') {
    return 'Approved'
  }
  if (s === 'reject' || s === 'rejected' || s === 'failed' || s === 'cancelled' || s === '0') {
    return 'Reject'
  }
  return 'Pending'
}

export function normalizeWithdrawal(raw, index = 0) {
  if (!raw || typeof raw !== 'object') return null

  const id = raw.id ?? raw._id ?? raw['#'] ?? index + 1
  const req_id = raw.req_id || raw.txn_id || raw.order_id || raw.payout_id || `WD_${4000 + id}`
  const user_id = raw.user_id || raw.uid || raw.u_id || raw.player_id || 'VN_00000'
  const user_name = raw.user_name || raw.username || raw.player_name || raw.name || raw.mobile || 'Player'
  const bank = raw.bank || raw.bank_name || raw.bankName || 'Direct IMPS'
  const acc_no = raw.acc_no || raw.account_no || raw.account_number || raw.accountNo || 'N/A'
  const ifsc = raw.ifsc || raw.ifsc_code || raw.ifscCode || 'N/A'
  const holder = raw.holder || raw.holder_name || raw.account_holder || user_name
  const amount = Number(raw.amount ?? raw.money ?? raw.payout_amount ?? 0)
  const status = normalizeStatus(raw.status)

  let date = raw.date || raw.created_at || raw.createdAt || raw.time || new Date().toLocaleString()
  if (typeof date === 'string' && date.includes('T')) {
    date = date.replace('T', ' ').slice(0, 19)
  }

  return {
    id,
    req_id: String(req_id),
    user_id: String(user_id),
    user_name: String(user_name),
    bank: String(bank),
    acc_no: String(acc_no),
    ifsc: String(ifsc),
    holder: String(holder),
    amount,
    status,
    date: String(date),
    raw,
  }
}

