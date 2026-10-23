const STORAGE_KEY = 'veronova_players_cache_v3'

export const initialPlayers = []

export function getPlayers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Error reading players from storage', e)
  }
  return []
}

export function savePlayers(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list || []))
  } catch (e) {
    console.error('Error saving players to storage', e)
  }
}
