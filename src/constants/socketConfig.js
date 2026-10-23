/**
 * Veronova Centralized Game Sockets Configuration
 * 
 * Saare games ke WebSocket / Socket.IO URLs aur event names is ek file me centralized hain.
 * Agar future me koi bhi socket URL ya event name change karna ho,
 * to sirf yaha is file me change karein - pure admin aur games me automatically reflect ho jayega!
 */

export const SOCKET_CONFIG = {
  // 1. Aviator Game Socket (SkyRush Aviator Simulation)
  AVIATOR: {
    URL: 'https://fcsocket.site',
    EVENT_NAME: 'demobdg_aviator',
    CRASH_EVENT: 'aviator_drop_now',
    RECONNECT_DELAY: 1000,
    TIMEOUT: 10000,
  },

  // 2. WinGo / Colour Prediction Socket (Funplay Live Game Engine)
  WINGO: {
    URL: 'https://socket.funplay.services',
    EVENT_NAME: 'funplay_wingo',
    RECONNECT_DELAY: 1000,
    TIMEOUT: 10000,
  },

  // 3. Horse Riding / Racing Game Socket
  HORSE_RACING: {
    URL: 'https://horseracing.siberiancrane.tech/',
    EVENTS: {
      CURRENT_STATE: 'race:current_state',
      CREATED: 'race:created',
      BETTING_OPEN: 'race:betting_open',
      COUNTDOWN_TICK: 'race:countdown_tick',
      BETTING_CLOSED_TIC: 'race:betting_closed_tic',
      BETTING_CLOSED: 'race:betting_closed',
      STATE_CHANGED: 'race:state_changed',
      TRACK_UPDATE: 'race:track_update',
      RESULT: 'race:result',
      JACKPOT: 'race:jackpot',
      WALLET: 'wallet',
      // Admin Forced Winner Controls
      ADMIN_SET_FORCED_WINNER: 'admin:set_forced_winner',
      RACE_SET_FORCED_WINNER: 'race:set_forced_winner',
      ADMIN_FORCE_WINNER: 'admin:force_winner',
      RACE_FORCE_WINNER: 'race:force_winner',
      // Admin Jackpot Controls & Queue
      ADMIN_SET_JACKPOT: 'admin:set_jackpot',
      ADMIN_FORCE_JACKPOT: 'admin:force_jackpot',
      JACKPOT_UPDATE: 'jackpot:update',
      ADMIN_JACKPOT_QUEUE_STATUS: 'admin:jackpot_queue_status',
      RACE_JACKPOT_QUEUE: 'race:jackpot_queue',
      // Live Bets Activity
      LIVE_BET: 'bet:live',
    },
    RECONNECT_DELAY: 1000,
    TIMEOUT: 10000,
  },
}

// Convenient Direct Exports
export const AVIATOR_SOCKET_URL = SOCKET_CONFIG.AVIATOR.URL
export const AVIATOR_SOCKET_EVENT = SOCKET_CONFIG.AVIATOR.EVENT_NAME
export const AVIATOR_CRASH_EVENT = SOCKET_CONFIG.AVIATOR.CRASH_EVENT

export const WINGO_SOCKET_URL = SOCKET_CONFIG.WINGO.URL
export const WINGO_SOCKET_EVENT = SOCKET_CONFIG.WINGO.EVENT_NAME

export const HORSE_RACING_SOCKET_URL = SOCKET_CONFIG.HORSE_RACING.URL
export const HORSE_RACING_EVENTS = SOCKET_CONFIG.HORSE_RACING.EVENTS

export default SOCKET_CONFIG

