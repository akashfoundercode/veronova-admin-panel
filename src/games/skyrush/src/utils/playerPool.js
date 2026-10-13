/**
 * Player pool for simulated names, initials, and live demo bets.
 */

export const RANDOM_PLAYER_NAMES = [
  'Aarav', 'Rahul', 'Vikram', 'Priya', 'Amit', 'Rohit', 'Suresh', 'Ananya',
  'Karan', 'Dev', 'Neha', 'Deepak', 'Aditya', 'Pooja', 'Manish', 'Harsh',
  'Rohan', 'Raj', 'Sunil', 'Akash', 'Gaurav', 'Sameer', 'Abhishek', 'Sachin',
  'Kavita', 'Sneha', 'Ritu', 'Nitin', 'Sanjay', 'Vijay', 'Kabir', 'Ishaan',
  'Simran', 'Meera', 'Varun', 'Arjun', 'Rishi', 'Tanvi', 'Shreya', 'Yash',
  'Kunal', 'Pankaj', 'Mohit', 'Rakesh', 'Chetan', 'Kiran', 'Divya', 'Alok',
  'Vikas', 'Ankit', 'Ajay', 'Monika', 'Swati', 'Preeti', 'Bhavna', 'Anita',
  'Dinesh', 'Kamal', 'Sandeep', 'Pradeep', 'Ashok', 'Vinod', 'Anil', 'Mukesh',
  'Naresh', 'Sunita', 'Mamta', 'Lata', 'Usha', 'Geeta', 'Seema', 'Jitendra',
  'Narendra', 'Surendra', 'Kuldeep', 'Deepa', 'Jyoti', 'Rekha', 'Poonam', 'Payal',
  'Komal', 'Sapna', 'Shweta', 'Nisha', 'Sonali', 'Pallavi', 'Rashmi', 'Kriti',
  'Tara', 'Maya', 'Diya', 'Rhea', 'Anvi', 'Ira', 'Myra', 'Aadhya',
  'Ayan', 'Reyansh', 'Dhruv', 'Vihaan', 'Advait', 'Shaurya', 'Aman', 'Vicky'
]

const AVATAR_COLORS = [
  '#e53935', '#1e88e5', '#43a047', '#fb8c00',
  '#8e24aa', '#00acc1', '#3949ab', '#d81b60',
  '#f59e0b', '#10b981', '#6366f1', '#ec4899'
]

/**
 * Extract clean, authentic first name from any user string
 * Guarantees only the first name is displayed on all devices.
 */
export function getFirstName(fullName) {
  if (!fullName) return 'User'
  if (typeof fullName !== 'string') return String(fullName)
  if (fullName.startsWith('You')) return 'You'
  // Remove any underscores, digits, asterisks, or last names
  const clean = fullName.split(/[_\s@]/)[0].replace(/[^a-zA-Z]/g, '')
  return clean || fullName.slice(0, 8)
}

/**
 * Get a deterministic demo profile (name + color)
 */
export function getPlayerProfile(seed) {
  let hash = 0
  if (typeof seed === 'number') {
    hash = Math.abs(seed)
  } else if (typeof seed === 'string') {
    for (let i = 0; i < seed.length; i++) {
      hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffff
    }
    hash = Math.abs(hash)
  } else {
    hash = Math.floor(Math.random() * 100000)
  }

  const rawName = RANDOM_PLAYER_NAMES[hash % RANDOM_PLAYER_NAMES.length]
  const name = getFirstName(rawName)
  const photo = null
  const color = AVATAR_COLORS[hash % AVATAR_COLORS.length]

  return { name, photo, color }
}

/**
 * Generate a dynamic batch of live players for a round
 */
export function generateRoundPlayers(roundId = 1000, count = 55) {
  const BET_AMOUNTS = [20, 50, 100, 150, 200, 300, 500, 800, 1000, 1500, 2000, 5000]

  return Array.from({ length: count }).map((_, i) => {
    const seed = roundId * 100 + i
    const { name, photo, color } = getPlayerProfile(seed)

    // Realistic cashout targets: 60% cash out early (< 2.5x), 25% mid (2.5x - 7x), 15% high
    const r = ((seed * 9301 + 49297) % 233280) / 233280
    let targetCashout = 1.15
    if (r < 0.60) {
      targetCashout = +(1.15 + r * 2.2).toFixed(2) // 1.15x - 2.47x
    } else if (r < 0.85) {
      targetCashout = +(2.50 + (r - 0.6) * 18).toFixed(2) // 2.50x - 7.00x
    } else {
      targetCashout = +(7.00 + (r - 0.85) * 60).toFixed(2) // 7.00x - 16.00x
    }

    const amount = BET_AMOUNTS[(seed + i) % BET_AMOUNTS.length]

    return {
      id: `bot_${roundId}_${i}`,
      user: getFirstName(name),
      avatarUrl: photo,
      avatarColor: color,
      amount,
      targetCashout,
      cashedOut: false,
      cashedAt: null,
      payout: 0,
    }
  })
}
