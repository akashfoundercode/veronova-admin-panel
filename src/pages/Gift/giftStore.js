export const INITIAL_GIFTS = [
  {
    id: 1,
    code: '805085313370438',
    title: 'Weekend High-Roller Red Envelope',
    deposit: 1000,
    gift: 200,
    people: 10,
    avail: 3,
    status: 'Active',
    date: '2026-10-12 18:46:31',
  },
  {
    id: 2,
    code: '512285806558097',
    title: 'Flash Recharge Gift Envelope',
    deposit: 500,
    gift: 50,
    people: 5,
    avail: 0,
    status: 'Exhausted',
    date: '2026-10-11 14:42:37',
  },
  {
    id: 3,
    code: '112776372300489',
    title: 'VIP Lounge Exclusive Gift Box',
    deposit: 2000,
    gift: 300,
    people: 8,
    avail: 5,
    status: 'Active',
    date: '2026-10-10 14:40:08',
  },
  {
    id: 4,
    code: '992384718293012',
    title: 'Festival Lucky Coupon Drop',
    deposit: 300,
    gift: 100,
    people: 50,
    avail: 22,
    status: 'Active',
    date: '2026-10-09 11:20:00',
  },
  {
    id: 5,
    code: '334901827461928',
    title: 'Midnight Wingo Surprise Bonus',
    deposit: 1500,
    gift: 250,
    people: 15,
    avail: 0,
    status: 'Exhausted',
    date: '2026-10-05 02:15:44',
  },
]

export const INITIAL_REDEMPTIONS = [
  {
    id: 101,
    code: '805085313370438',
    user_id: 'VN_88291',
    user_name: 'Aman Verma',
    gift_amount: 200,
    deposit_verified: 1200,
    redeemed_at: '12 Oct 2026 07:15 PM',
    ip_address: '103.212.144.18',
    device: 'Mobile (Android 14)',
    status: 'Credited'
  },
  {
    id: 102,
    code: '805085313370438',
    user_id: 'VN_39201',
    user_name: 'Vikram Rawat',
    gift_amount: 200,
    deposit_verified: 1500,
    redeemed_at: '12 Oct 2026 07:22 PM',
    ip_address: '49.36.128.45',
    device: 'Mobile (iOS 17)',
    status: 'Credited'
  },
  {
    id: 103,
    code: '112776372300489',
    user_id: 'VN_78912',
    user_name: 'Sneha Patel',
    gift_amount: 300,
    deposit_verified: 2500,
    redeemed_at: '11 Oct 2026 03:40 PM',
    ip_address: '157.34.89.102',
    device: 'Desktop (Windows)',
    status: 'Credited'
  },
  {
    id: 104,
    code: '992384718293012',
    user_id: 'VN_44102',
    user_name: 'Kunal Joshi',
    gift_amount: 100,
    deposit_verified: 500,
    redeemed_at: '10 Oct 2026 12:15 PM',
    ip_address: '27.56.92.14',
    device: 'Mobile (Android 13)',
    status: 'Credited'
  },
  {
    id: 105,
    code: '512285806558097',
    user_id: 'VN_12890',
    user_name: 'Pooja Singh',
    gift_amount: 50,
    deposit_verified: 600,
    redeemed_at: '09 Oct 2026 05:30 PM',
    ip_address: '106.210.45.67',
    device: 'Mobile (iOS 16)',
    status: 'Credited'
  },
]

const GIFTS_KEY = 'veronova_gifts_v1'
const REDEMPTIONS_KEY = 'veronova_redemptions_v1'

export function getGifts() {
  try {
    const raw = localStorage.getItem(GIFTS_KEY)
    if (!raw) return INITIAL_GIFTS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_GIFTS
  } catch (err) {
    return INITIAL_GIFTS
  }
}

export function saveGifts(gifts) {
  try {
    localStorage.setItem(GIFTS_KEY, JSON.stringify(gifts))
  } catch (err) {}
}

export function getRedemptions() {
  try {
    const raw = localStorage.getItem(REDEMPTIONS_KEY)
    if (!raw) return INITIAL_REDEMPTIONS
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_REDEMPTIONS
  } catch (err) {
    return INITIAL_REDEMPTIONS
  }
}

export function saveRedemptions(redemptions) {
  try {
    localStorage.setItem(REDEMPTIONS_KEY, JSON.stringify(redemptions))
  } catch (err) {}
}

