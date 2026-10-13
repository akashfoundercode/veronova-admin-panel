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
