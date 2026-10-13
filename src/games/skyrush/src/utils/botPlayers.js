// Simulated multiplayer live bets for Aviator
import { RANDOM_PLAYER_NAMES, getFirstName } from './playerPool'

const AVATAR_COLORS = [
  '#e50914', '#913ef8', '#34b4ff', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#14b8a6'
]

export function generateLiveBots(roundId) {
  const count = 25 + Math.floor(Math.random() * 20)
  const bots = []

  for (let i = 0; i < count; i++) {
    const rawName = RANDOM_PLAYER_NAMES[i % RANDOM_PLAYER_NAMES.length]
    const user = getFirstName(rawName)
    const color = AVATAR_COLORS[i % AVATAR_COLORS.length]
    const amount = [50, 100, 200, 300, 500, 1000, 2000, 5000][Math.floor(Math.random() * 8)]

    // Target cashout point for bot
    let targetMultiplier
    const r = Math.random()
    if (r < 0.35) {
      targetMultiplier = +(1.1 + Math.random() * 0.7).toFixed(2) // 1.10 - 1.80x
    } else if (r < 0.7) {
      targetMultiplier = +(1.8 + Math.random() * 1.5).toFixed(2) // 1.80 - 3.30x
    } else if (r < 0.9) {
      targetMultiplier = +(3.3 + Math.random() * 4.0).toFixed(2) // 3.30 - 7.30x
    } else {
      targetMultiplier = +(7.5 + Math.random() * 15.0).toFixed(2) // 7.50 - 22.50x
    }

    bots.push({
      id: `bot-${roundId}-${i}`,
      user,
      avatarColor: color,
      amount,
      targetMultiplier,
      cashedOut: false,
      cashedAt: null,
      payout: 0,
    })
  }

  return bots
}

export function updateBotCashouts(bots, currentMultiplier) {
  let hasChanges = false
  const updated = bots.map((bot) => {
    if (!bot.cashedOut && currentMultiplier >= bot.targetMultiplier) {
      hasChanges = true
      return {
        ...bot,
        cashedOut: true,
        cashedAt: bot.targetMultiplier,
        payout: +(bot.amount * bot.targetMultiplier).toFixed(2),
      }
    }
    return bot
  })

  return hasChanges ? updated : bots
}

