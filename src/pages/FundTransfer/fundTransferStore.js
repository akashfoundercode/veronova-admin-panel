const STORAGE_KEY = 'veronova_fund_transfers_v2'

export const initialFundTransfers = [
  {
    id: 1,
    tx_id: 'TXN_8849102',
    user: 'VN_99814',
    user_name: 'Akash_Pro',
    amount: 50000,
    remark: 'VIP loyalty deposit match',
    desc: 'ADD FUND',
    date: '12-07-2026 08:30 PM',
    operator: 'Super Admin (ADM01)',
    status: 'Completed',
  },
  {
    id: 2,
    tx_id: 'TXN_8849095',
    user: 'MAMF1350',
    user_name: 'Rahul_Champ',
    amount: 1000,
    remark: 'Monthly active player bonus',
    desc: 'BONUS',
    date: '12-07-2026 07:15 PM',
    operator: 'Super Admin (ADM01)',
    status: 'Completed',
  },
  {
    id: 3,
    tx_id: 'TXN_8848920',
    user: 'VZPH8680',
    user_name: 'User_L13HY',
    amount: 5000,
    remark: 'Tournament prize credit',
    desc: 'FUND TRANSFER',
    date: '12-07-2026 05:40 PM',
    operator: 'Super Admin (ADM01)',
    status: 'Completed',
  },
  {
    id: 4,
    tx_id: 'TXN_8848810',
    user: 'HLYY2860',
    user_name: 'User_4CMBA',
    amount: 500,
    remark: 'Customer support compensation',
    desc: 'ADD FUND',
    date: '11-07-2026 07:01 PM',
    operator: 'Finance Desk',
    status: 'Completed',
  },
  {
    id: 5,
    tx_id: 'TXN_8848750',
    user: 'KRNX7721',
    user_name: 'Karan_Striker',
    amount: 2500,
    remark: 'Streak reward credit',
    desc: 'BONUS',
    date: '11-07-2026 06:45 PM',
    operator: 'Super Admin (ADM01)',
    status: 'Completed',
  },
  {
    id: 6,
    tx_id: 'TXN_8848620',
    user: 'BHJP4011',
    user_name: 'User_VBRDE',
    amount: 200,
    remark: 'Welcome bonus manual addition',
    desc: 'BONUS',
    date: '11-07-2026 04:30 PM',
    operator: 'Support Agent',
    status: 'Completed',
  },
  {
    id: 7,
    tx_id: 'TXN_8848510',
    user: 'JXEH0711',
    user_name: 'User_GR9MH',
    amount: 100,
    remark: 'Manual wallet transfer',
    desc: 'FUND TRANSFER',
    date: '10-07-2026 09:10 PM',
    operator: 'Super Admin (ADM01)',
    status: 'Completed',
  },
]

const SUBTYPES_STORAGE_KEY = 'veronova_fund_transfer_subtypes'
const SUMMARY_STORAGE_KEY = 'veronova_fund_transfer_summary'

export const DEFAULT_SUBTYPES = [
  { id: 1, name: 'DAILY SALARY', status: 1, description: null },
  { id: 2, name: 'MONTHLY SALARY', status: 1, description: null },
  { id: 3, name: 'FIRST RECHARGE SELF BONUS', status: 1, description: null },
  { id: 4, name: 'SECOND RECHARGE SELF BONUS', status: 1, description: null },
  { id: 5, name: 'FIRST RECHARGE AGENT BONUS', status: 1, description: null },
  { id: 6, name: 'ADVERTISEMENT SUPPORT', status: 1, description: null },
  { id: 7, name: 'ADVANCE SALARY', status: 1, description: null },
  { id: 8, name: 'ADD FUND WITH REMARK', status: 0, description: null },
  { id: 9, name: 'DEDUCT FUND WITH REMARK', status: 0, description: null },
]

export function getFundTransfers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Error loading fund transfers:', e)
  }
  return initialFundTransfers
}

export function saveFundTransfers(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch (e) {
    console.error('Error saving fund transfers:', e)
  }
}

export function getSubtypes() {
  try {
    const raw = localStorage.getItem(SUBTYPES_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  return DEFAULT_SUBTYPES
}

export function saveSubtypes(list) {
  try {
    localStorage.setItem(SUBTYPES_STORAGE_KEY, JSON.stringify(list))
  } catch {}
}

export function getSummary() {
  try {
    const raw = localStorage.getItem(SUMMARY_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

export function saveSummary(summary) {
  try {
    localStorage.setItem(SUMMARY_STORAGE_KEY, JSON.stringify(summary))
  } catch {}
}

export function normalizeFundTransferItem(item, idx = 0) {
  if (!item || typeof item !== 'object') return null
  const id = item.id ?? item['#'] ?? idx + 1
  const userId = item.u_id || item.user_id || item.user || `User_${id}`
  const userName = item.username || item.user_name || item.name || (item.u_id || item.user_id ? `User_${item.u_id || item.user_id}` : 'Player')
  const mobile = item.mobile || '-'
  const amount = Number(item.amount) || 0
  const typeName = item.type_name || item.description || item.desc || 'FUND TRANSFER'
  const desc = item.description || item.type_name || item.desc || 'FUND TRANSFER'
  const remark = item.remark || '-'
  const date = item.date || (item.created_at ? new Date(item.created_at).toISOString().slice(0, 19).replace('T', ' ') : new Date().toLocaleString())
  const txId = item.tx_id || `TXN_${id}`
  const operator = item.operator || 'Super Admin (ADM01)'
  const status = item.status || 'Completed'

  return {
    id,
    tx_id: txId,
    user: userId,
    user_id: item.user_id || userId,
    u_id: item.u_id || userId,
    user_name: userName,
    mobile,
    amount,
    type: item.type ?? 37,
    type_name: typeName,
    desc,
    remark,
    date,
    created_at: item.created_at,
    status,
    operator,
    raw: item,
  }
}
