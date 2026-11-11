/**
 * ============================================================================
 * VERONOVA GAMES & SERVER CENTRALIZED CONFIGURATION
 * ============================================================================
 * Sabhi games (Aviator, Wingo, Horse Racing, Chicken Road, Jili, etc.) aur Admin APIs
 * ka Base URL aur Socket URL is ek file me centralized hai.
 *
 * Future me koi bhi URL badalna ho to sirf yaha in dono me change karein:
 * 1. GAME_BASE_URL: Sabhi games aur admin REST APIs ka ek hi common Base URL
 * 2. SOCKET_BASE_URL: Sabhi games ke live WebSockets / Socket.IO ka Base URL
 * ============================================================================
 */

// 1. Centralized Game & API Base URL (One place for all games & admin APIs)
export const GAME_BASE_URL = 'https://api.wingo4all.site'
// export const GAME_BASE_URL = 'http://localhost:3010'

// 2. Centralized Socket Server Base URL (One place for all live game sockets)
export const SOCKET_BASE_URL = 'https://api.wingo4all.site'
// export const SOCKET_BASE_URL = 'http://localhost:3010'

// Primary alias used across apiClient and admin services
export const BACKEND_BASE_URL = GAME_BASE_URL

const backendUrl = (path) => `${BACKEND_BASE_URL.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`

// 3. Centralized Game Sockets Configuration
export const SOCKET_CONFIG = {
  // 1. Aviator Game Socket
  AVIATOR: {
    URL: SOCKET_BASE_URL,
    EVENT_NAME: 'demobdg_aviator',
    CRASH_EVENT: 'aviator_drop_now',
    RECONNECT_DELAY: 1000,
    TIMEOUT: 10000,
  },

  // 2. WinGo / Colour Prediction Socket
  WINGO: {
    URL: `${SOCKET_BASE_URL}/wingo`,
    EVENT_NAME: 'verenova_wingo',
    EVENT_ALIASES: ['veronova_wingo', 'funplay_wingo', 'wingo', 'wingo_timer', 'timer_update'],
    RECONNECT_DELAY: 1000,
    TIMEOUT: 10000,
  },

  // 3. Horse Riding / Racing Game Socket
  HORSE_RACING: {
    URL: `${SOCKET_BASE_URL}/horse-race`,
    EVENTS: {
      CURRENT_STATE: 'race:current_state',
      CREATED: 'race:created',
      BETTING_OPEN: 'race:betting_open',
      COUNTDOWN_TICK: 'race:countdown_tick',
      BETTING_CLOSED_TIC: 'race:betting_closed_tic',
      BETTING_CLOSED: 'race:betting_closed',
      STATE_CHANGED: 'race:state_changed',
      TRACK_UPDATE: 'race:track_update',
      RUNNING_TRACK: 'race:running_track',
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
      // Live Bets Activity & Real-time Pool Aliases
      LIVE_BET: 'bet:live',
      ADMIN_BET_LIVE: 'admin:bet_live',
      ADMIN_BET_POOL_UPDATE: 'admin:bet_pool_update',
      RACE_BET_POOL_UPDATE: 'race:bet_pool_update',
      ADMIN_HORSE_BETS: 'admin:horse_bets',
      HORSE_BETS_UPDATE: 'horse:bets_update',
      CHIPS_UPDATE: 'chips:update',
      POOL_UPDATE: 'pool:update',
    },
    RECONNECT_DELAY: 1000,
    TIMEOUT: 10000,
  },

  // 4. Stack Tower Game Socket
  STACK_TOWER: {
    URL: `${SOCKET_BASE_URL}/stack-tower`,
    FALLBACK_URL: SOCKET_BASE_URL,
    ADMIN_EVENTS: {
      FORCE_STOP: 'force_stop',
      ADMIN_DROP_OBSTACLE: 'admin_drop_obstacle',
      DROP_OBSTACLE: 'drop_obstacle',
      FORCE_DROP: 'force_drop',
      STACK_TOWER_FORCE_STOP: 'stack_tower_force_stop',
    },
    LISTEN_EVENTS: {
      OBSTACLE_DROP_ACK: 'obstacle_drop_ack',
      OBSTACLE_DROPPED: 'obstacle_dropped',
      ROUND_UPDATE: 'round_update',
    },
    RECONNECT_DELAY: 1000,
    TIMEOUT: 10000,
  },
}

// 4. Game categories use the shared backend host.
export const EXTERNAL_GAME_BASE_URL = `${GAME_BASE_URL}/api`

// 3. Centralized API Endpoints Registry
export const API_ENDPOINTS = {
  BACKEND_BASE_URL,
  // Authentication
  LOGIN: backendUrl('/api/login'),
  LOGIN_PROXY: backendUrl('/api/login'),
  ADMIN_LOGIN_PROXY: backendUrl('/api/admin/login'),
  LOGOUT: backendUrl('/api/logout'),
  LOGOUT_PROXY: backendUrl('/api/logout'),
  ADMIN_LOGOUT_PROXY: backendUrl('/api/admin/logout'),

  // Dashboard
  DASHBOARD: backendUrl('/admin/dashboard'),
  DASHBOARD_PROXY: backendUrl('/admin/dashboard'),

  // Players Management
  PLAYERS: backendUrl('/api/admin/players'),
  PLAYERS_PROXY: backendUrl('/api/admin/players'),

  // Attendance Management
  ATTENDANCE: backendUrl('/api/admin/attendance'),
  ATTENDANCE_PROXY: backendUrl('/api/admin/attendance'),
  ATTENDANCE_ADMIN_PROXY: backendUrl('/admin/attendance'),

  // Fund Transfer Management
  FUND_TRANSFER: backendUrl('/admin/fund-transfer'),
  FUND_TRANSFER_PROXY: backendUrl('/admin/fund-transfer'),
  FUND_TRANSFER_API_PROXY: backendUrl('/api/admin/fund-transfer'),
  FUND_TRANSFER_HISTORY: backendUrl('/admin/fund-transfer/history'),
  FUND_TRANSFER_HISTORY_PROXY: backendUrl('/admin/fund-transfer/history'),
  FUND_TRANSFER_HISTORY_API_PROXY: backendUrl('/api/admin/fund-transfer/history'),

  // Player wallet adjustments
  WALLET_CREDIT: backendUrl('/api/admin/wallets/credit'),
  WALLET_DEBIT: backendUrl('/api/admin/wallets/debit'),
  UPDATE_WALLET: backendUrl('/api/update-wallet'),

  // VIP Levels Management
  VIP_LEVELS: backendUrl('/admin/vip-levels'),
  VIP_LEVELS_ADMIN_PROXY: backendUrl('/admin/vip-levels'),
  VIP_LEVELS_API_PROXY: backendUrl('/api/admin/vip-levels'),
  VIP_LEVELS_POST: backendUrl('/api/admin/vip-levels'),

  // Illegal Bets & Flagged Players Management
  ILLEGAL_PLAYERS: backendUrl('/api/admin/players?illegal=true'),
  ILLEGAL_PLAYERS_PROXY: backendUrl('/api/admin/players?illegal=true'),
  ILLEGAL_BETS: backendUrl('/admin/illegal-bets'),
  ILLEGAL_BETS_ADMIN_PROXY: backendUrl('/admin/illegal-bets'),
  ILLEGAL_BETS_API_PROXY: backendUrl('/api/admin/illegal-bets'),

  // Login History & IP Telemetry
  LOGIN_HISTORY: backendUrl('/admin/login-history'),
  LOGIN_HISTORY_PROXY: backendUrl('/admin/login-history'),
  LOGIN_HISTORY_API_PROXY: backendUrl('/api/admin/login-history'),

  // MLM Levels Management
  MLM_LEVELS: backendUrl('/admin/mlm-levels'),
  MLM_LEVELS_PROXY: backendUrl('/admin/mlm-levels'),
  MLM_LEVELS_API_PROXY: backendUrl('/api/admin/mlm-levels'),

  // Agent Salary & Payroll Management
  SALARY_LIST: backendUrl('/admin/salary-list'),
  SALARY_LIST_PROXY: backendUrl('/admin/salary-list'),
  SALARY_LIST_API_PROXY: backendUrl('/api/admin/salary-list'),
  SALARY_USER_SEARCH_PROXY: (userId) => backendUrl(`/admin/salary-list/${encodeURIComponent(userId)}`),

  // Offers & Promotions Engine
  OFFERS: backendUrl('/admin/offers'),
  OFFERS_PROXY: backendUrl('/admin/offers'),
  OFFERS_API_PROXY: backendUrl('/api/admin/offers'),
  OFFERS_ITEM_PROXY: (id) => backendUrl(`/admin/offers/${encodeURIComponent(id)}`),

  // Gifts & Red Envelopes
  GIFTS: backendUrl('/admin/gifts'),
  GIFTS_PROXY: backendUrl('/admin/gifts'),
  GIFTS_API_PROXY: backendUrl('/api/admin/gifts'),
  GIFTS_ITEM_PROXY: (id) => backendUrl(`/admin/gifts/${encodeURIComponent(id)}`),
  GIFT_HISTORY: backendUrl('/admin/gift-history'),
  GIFT_HISTORY_PROXY: backendUrl('/admin/gift-history'),
  GIFT_HISTORY_API_PROXY: backendUrl('/api/admin/gift-history'),

  // Banners & Activity CMS / Sliders
  BANNERS: backendUrl('/api/admin/banners'),
  BANNERS_PROXY: backendUrl('/api/admin/banners'),
  BANNERS_LEGACY_PROXY: backendUrl('/admin/banners'),
  BANNERS_API_PROXY: backendUrl('/api/admin/banners'),
  BANNERS_ITEM_PROXY: (id) => backendUrl(`/api/admin/banners/${encodeURIComponent(id)}`),
  BANNERS_LEGACY_ITEM_PROXY: (id) => backendUrl(`/admin/banners/${encodeURIComponent(id)}`),

  SLIDERS_PROXY: backendUrl('/api/admin/sliders'),
  SLIDERS_ITEM_PROXY: (id) => backendUrl(`/api/admin/sliders/${encodeURIComponent(id)}`),
  PUBLIC_BANNERS_PROXY: backendUrl('/api/banners'),
  PUBLIC_SLIDERS_PROXY: backendUrl('/api/sliders'),

  ACTIVITY_BANNERS: backendUrl('/admin/activity-banners'),
  ACTIVITY_BANNERS_PROXY: backendUrl('/admin/activity-banners'),
  ACTIVITY_BANNERS_API_PROXY: backendUrl('/api/admin/activity-banners'),
  ACTIVITY_BANNERS_ITEM_PROXY: (id) => backendUrl(`/admin/activity-banners/${encodeURIComponent(id)}`),

  BANNER_HISTORY: backendUrl('/admin/banner-history'),
  BANNER_HISTORY_PROXY: backendUrl('/admin/banner-history'),

  // Payment Limits & Processing Rules
  PAYMENT_LIMITS: backendUrl('/admin/payment-limits'),
  PAYMENT_LIMITS_PROXY: backendUrl('/admin/payment-limits'),
  PAYMENT_LIMITS_API_PROXY: backendUrl('/api/admin/payment-limits'),
  PAYMENT_LIMIT_ITEM_PROXY: (id) => backendUrl(`/admin/payment-limits/${encodeURIComponent(id)}`),

  // Deposits & Recharge Management
  DEPOSITS: backendUrl('/admin/deposits'),
  DEPOSITS_PROXY: backendUrl('/admin/deposits'),
  DEPOSITS_API_PROXY: backendUrl('/api/admin/deposits'),
  DEPOSITS_PENDING: backendUrl('/admin/deposits/pending'),
  DEPOSITS_PENDING_PROXY: backendUrl('/admin/deposits/pending'),
  DEPOSITS_SUCCESS: backendUrl('/admin/deposits/success'),
  DEPOSITS_SUCCESS_PROXY: backendUrl('/admin/deposits/success'),
  DEPOSITS_REJECT: backendUrl('/admin/deposits/reject'),
  DEPOSITS_REJECT_PROXY: backendUrl('/admin/deposits/reject'),
  DEPOSIT_ITEM: (id) => backendUrl(`/admin/deposits/${encodeURIComponent(id)}`),
  DEPOSIT_ITEM_PROXY: (id) => backendUrl(`/admin/deposits/${encodeURIComponent(id)}`),
  DEPOSIT_STATUS: (id) => backendUrl(`/admin/deposits/${encodeURIComponent(id)}/status`),
  DEPOSIT_STATUS_PROXY: (id) => backendUrl(`/admin/deposits/${encodeURIComponent(id)}/status`),

  // Withdrawals & Payout Desk
  WITHDRAWALS: backendUrl('/admin/withdrawals'),
  WITHDRAWALS_PROXY: backendUrl('/admin/withdrawals'),
  WITHDRAWALS_API_PROXY: backendUrl('/api/admin/withdrawals'),
  WITHDRAWALS_PENDING: backendUrl('/admin/withdrawals/pending'),
  WITHDRAWALS_PENDING_PROXY: backendUrl('/admin/withdrawals/pending'),
  WITHDRAWALS_APPROVED: backendUrl('/admin/withdrawals/approved'),
  WITHDRAWALS_APPROVED_PROXY: backendUrl('/admin/withdrawals/approved'),
  WITHDRAWALS_SUCCESS_PROXY: backendUrl('/admin/withdrawals/success'),
  WITHDRAWALS_REJECT: backendUrl('/admin/withdrawals/reject'),
  WITHDRAWALS_REJECT_PROXY: backendUrl('/admin/withdrawals/reject'),
  WITHDRAWAL_ITEM: (id) => backendUrl(`/admin/withdrawals/${encodeURIComponent(id)}`),
  WITHDRAWAL_ITEM_PROXY: (id) => backendUrl(`/admin/withdrawals/${encodeURIComponent(id)}`),
  WITHDRAWAL_STATUS: (id) => backendUrl(`/admin/withdrawals/${encodeURIComponent(id)}/status`),
  WITHDRAWAL_STATUS_PROXY: (id) => backendUrl(`/admin/withdrawals/${encodeURIComponent(id)}/status`),

  // Exact Endpoint Aliases
  depositsPending: backendUrl('/admin/deposits/pending'),
  depositsSuccess: backendUrl('/admin/deposits/success'),
  depositsReject: backendUrl('/admin/deposits/reject'),
  deposits: backendUrl('/admin/deposits'),
  depositItem: (id) => backendUrl(`/admin/deposits/${encodeURIComponent(id)}`),
  depositStatus: (id) => backendUrl(`/admin/deposits/${encodeURIComponent(id)}/status`),

  withdrawalsPending: backendUrl('/admin/withdrawals/pending'),
  withdrawalsApproved: backendUrl('/admin/withdrawals/approved'),
  withdrawalsReject: backendUrl('/admin/withdrawals/reject'),
  withdrawals: backendUrl('/admin/withdrawals'),
  withdrawalItem: (id) => backendUrl(`/admin/withdrawals/${encodeURIComponent(id)}`),
  withdrawalStatus: (id) => backendUrl(`/admin/withdrawals/${encodeURIComponent(id)}/status`),

  // Support Settings & Customer Helpdesk CMS
  SUPPORT_SETTINGS: backendUrl('/admin/support-settings'),
  SUPPORT_SETTINGS_PROXY: backendUrl('/admin/support-settings'),
  SUPPORT_SETTINGS_API_PROXY: backendUrl('/api/admin/support-settings'),
  SUPPORT_SETTING_ITEM: (id) => backendUrl(`/admin/support-settings/${encodeURIComponent(id)}`),
  SUPPORT_SETTING_ITEM_PROXY: (id) => backendUrl(`/admin/support-settings/${encodeURIComponent(id)}`),

  supportSettings: backendUrl('/admin/support-settings'),
  supportSettingItem: (id) => backendUrl(`/admin/support-settings/${encodeURIComponent(id)}`),

  // Aviator Telemetry, Drops History & Bets
  AVIATOR_TELEMETRY: backendUrl('/admin/aviator/telemetry'),
  AVIATOR_TELEMETRY_PROXY: backendUrl('/admin/aviator/telemetry'),
  AVIATOR_TELEMETRY_API_PROXY: backendUrl('/api/admin/aviator/telemetry'),
  AVIATOR_DROPS: backendUrl('/admin/aviator/drops'),
  AVIATOR_DROPS_PROXY: backendUrl('/admin/aviator/drops'),
  AVIATOR_DROPS_API_PROXY: backendUrl('/api/admin/aviator/drops'),
  AVIATOR_BETS: backendUrl('/admin/aviator'),
  AVIATOR_BETS_PROXY: backendUrl('/admin/aviator'),
  AVIATOR_BETS_API_PROXY: backendUrl('/api/admin/aviator'),

  aviatorTelemetry: backendUrl('/admin/aviator/telemetry'),
  aviatorDrops: backendUrl('/admin/aviator/drops'),
  aviator: backendUrl('/admin/aviator'),

  // WinGo Routes (Colour Prediction Engine)
  WINGO_FETCH: (gameid) => backendUrl(`/fetch/${gameid}`),
  WINGO_FETCH_PROXY: (gameid) => backendUrl(`/fetch/${gameid}`),
  WINGO_STORE_RESULT: backendUrl('/colour_prediction-store'),
  WINGO_STORE_RESULT_PROXY: backendUrl('/colour_prediction-store'),
  WINGO_FUTURE_STORE: backendUrl('/future-result-store'),
  WINGO_FUTURE_STORE_PROXY: backendUrl('/future-result-store'),
  WINGO_BETS: backendUrl('/bets'),
  WINGO_BETS_PROXY: backendUrl('/bets'),
  WINGO_RESULTS: backendUrl('/results'),
  WINGO_RESULTS_PROXY: backendUrl('/results'),
  WINGO_LAST_FIVE_RESULT: backendUrl('/last_five_result'),
  WINGO_LAST_FIVE_RESULT_PROXY: backendUrl('/last_five_result'),
  WINGO_LAST_RESULT: backendUrl('/last_result'),
  WINGO_LAST_RESULT_PROXY: backendUrl('/last_result'),
  WINGO_GET_RESULT: (gameId) => backendUrl(`/api/get_result?game_id=${encodeURIComponent(gameId)}`),
  WINGO_WIN_AMOUNT: backendUrl('/win-amount'),
  WINGO_WIN_AMOUNT_PROXY: backendUrl('/win-amount'),
  WINGO_BET_HISTORY: backendUrl('/bet_history'),
  WINGO_BET_HISTORY_PROXY: backendUrl('/bet_history'),
  WINGO_ADMIN_SET_RESULT: (id) => backendUrl(`/fetch_admin_set_Results/${encodeURIComponent(id)}`),
  WINGO_ADMIN_SET_RESULT_PROXY: (id) => backendUrl(`/fetch_admin_set_Results/${encodeURIComponent(id)}`),
  WINGO_LIVE: (gameId) => backendUrl(`/admin/wingo/live/${encodeURIComponent(gameId)}`),
  WINGO_LIVE_API: (gameId) => backendUrl(`/api/admin/wingo/live/${encodeURIComponent(gameId)}`),
  WINGO_AUTO_RESULT_INSERT: backendUrl('/auto_wingo_result_insert'),
  WINGO_AUTO_RESULT_INSERT_API: backendUrl('/api/auto_wingo_result_insert'),
  WINGO_FETCH_HISTORY: (gameId) => backendUrl(`/api/fetchhistory/${encodeURIComponent(gameId)}`),

  wingoFetch: (gameid) => backendUrl(`/fetch/${gameid}`),
  wingoStoreResult: backendUrl('/colour_prediction-store'),
  wingoFutureStore: backendUrl('/future-result-store'),
  wingoBets: backendUrl("/bets"),
  wingoResults: backendUrl("/results"),
  wingoLastFiveResult: backendUrl("/last_five_result"),
  wingoLastResult: backendUrl("/last_result"),
  wingoWinAmount: backendUrl("/win-amount"),
  wingoBetHistory: backendUrl("/bet_history"),
  wingoAdminSetResult: backendUrl("/fetch_admin_set_Results/:id"),
  wingoAdminSetResultUrl: (id) => backendUrl(`/fetch_admin_set_Results/${encodeURIComponent(id)}`),
  wingoLive: (gameId) => backendUrl(`/admin/wingo/live/${encodeURIComponent(gameId)}`),
  wingoLiveApi: (gameId) => backendUrl(`/api/admin/wingo/live/${encodeURIComponent(gameId)}`),
  wingoAutoResultInsert: backendUrl('/auto_wingo_result_insert'),
  wingoAutoResultInsertApi: backendUrl('/api/auto_wingo_result_insert'),
  wingoFetchHistory: (gameId) => backendUrl(`/api/fetchhistory/${encodeURIComponent(gameId)}`),

  // Chicken Road Routes
  CHICKEN_BET: backendUrl('/api/bet'),
  CHICKEN_BET_VALUES: backendUrl('/bet_values'),
  CHICKEN_HISTORY: backendUrl('/api/history'),
  CHICKEN_HISTORY_BY_USER: (userId) => backendUrl(`/api/history?user_id=${encodeURIComponent(userId)}`),
  CHICKEN_CASHOUT: backendUrl('/api/cashout'),
  CHICKEN_MULTIPLIER: backendUrl('/api/multiplier'),
  CHICKEN_MULTIPLIER_BY_USER: (userId) => backendUrl(`/api/multiplier?user_id=${encodeURIComponent(userId)}`),
  CHICKEN_ADMIN_MULTIPLIER: backendUrl('/admin/multiplier'),
  CHICKEN_RULES: backendUrl('/getGameRules'),
  CHICKEN_UPDATE_ROAST_MULTIPLIER: backendUrl('/updateRoastMultiplier'),
  CHICKEN_ADD_MULTIPLIER: backendUrl('/add_multiplier'),
  CHICKEN_MULTIPLIER_UPDATE: backendUrl('/multiplier_update'),
  CHICKEN_MULTIPLIER_DELETE: backendUrl('/multiplier_delete'),
  CHICKEN_UPDATE_GAME_RULES: backendUrl('/updateGameRules'),
  CHICKEN_UPDATE_BET_VALUES: backendUrl('/updateBetValues'),

  // Chicken Road Endpoint Aliases
  chickenBet: backendUrl("/api/bet"),
  chickenBetValues: backendUrl("/bet_values"),
  chickenHistory: backendUrl("/api/history"),
  chickenHistoryByUser: (userId) => backendUrl(`/api/history?user_id=${encodeURIComponent(userId)}`),
  chickenCashout: backendUrl("/api/cashout"),
  chickenMultiplier: backendUrl("/api/multiplier"),
  chickenMultiplierByUser: (userId) => backendUrl(`/api/multiplier?user_id=${encodeURIComponent(userId)}`),
  chickenAdminMultiplier: backendUrl("/admin/multiplier"),
  chickenRules: backendUrl("/getGameRules"),
  chickenUpdateRoastMultiplier: backendUrl("/updateRoastMultiplier"),
  chickenAddMultiplier: backendUrl("/add_multiplier"),
  chickenMultiplierUpdate: backendUrl("/multiplier_update"),
  chickenMultiplierDelete: backendUrl("/multiplier_delete"),
  chickenUpdateGameRules: backendUrl("/updateGameRules"),
  chickenUpdateBetValues: backendUrl("/updateBetValues"),

  // Stack Tower Admin Endpoints & Aliases
  STACK_TOWER_ADMIN_STATS: backendUrl('/api/stack-tower/admin/stats'),
  STACK_TOWER_ADMIN_STATS_ALIASES: [
    backendUrl('/api/stack-tower/admin/stats'),
    backendUrl('/admin/stack-tower/stats'),
    backendUrl('/admin/stack_tower_stats'),
    backendUrl('/stack_tower_admin_stats'),
  ],
  STACK_TOWER_ADMIN_ACTIVE_BETS: backendUrl('/api/stack-tower/admin/active-bets'),
  STACK_TOWER_ADMIN_ACTIVE_BETS_ALIASES: [
    backendUrl('/api/stack-tower/admin/active-bets'),
    backendUrl('/api/stack-tower/active-bets'),
    backendUrl('/admin/stack-tower/active-bets'),
    backendUrl('/admin/stack-tower/active'),
  ],
  STACK_TOWER_ADMIN_DROP_OBSTACLE: backendUrl('/api/stack-tower/admin/drop-obstacle'),
  STACK_TOWER_ADMIN_DROP_OBSTACLE_ALIASES: [
    backendUrl('/api/stack-tower/admin/drop-obstacle'),
    backendUrl('/admin/stack-tower/drop-obstacle'),
    backendUrl('/admin/stack_tower/drop_obstacle'),
    backendUrl('/api/admin/stack-tower/drop-obstacle'),
    backendUrl('/stack_tower_drop_obstacle'),
  ],

  // Jili Games Endpoints
  JILI_GAMES: backendUrl('/getjilligame'),
  JILI_LAUNCH: backendUrl('/jilligame'),
  jiliGames: backendUrl("/getjilligame"),
  jiliLaunch: backendUrl("/jilligame"),
  jiliLaunchUrl: (userId, amount, gameId) =>
    backendUrl(`/jilligame?user_id=${encodeURIComponent(userId || '')}&amount=${encodeURIComponent(amount || '')}&game_id=${encodeURIComponent(gameId || '')}`),

  // 4. Admin Management REST APIs
  // IFSC Requests
  ifscModifications: backendUrl("/admin/ifsc-modifications"),
  ifscModificationApprove: (id) => backendUrl(`/admin/ifsc-modification-approve/${encodeURIComponent(id)}`),
  IFSC_MODIFICATIONS: backendUrl('/admin/ifsc-modifications'),
  IFSC_MODIFICATION_APPROVE: (id) => backendUrl(`/admin/ifsc-modification-approve/${encodeURIComponent(id)}`),

  // Delete Account
  viewDeleteWithdraw: backendUrl("/admin/view-delete-withdraw"),
  bankAccountChangeStatus: (id) => backendUrl(`/admin/bank-account-change-status/${encodeURIComponent(id)}`),
  VIEW_DELETE_WITHDRAW: backendUrl('/admin/view-delete-withdraw'),
  BANK_ACCOUNT_CHANGE_STATUS: (id) => backendUrl(`/admin/bank-account-change-status/${encodeURIComponent(id)}`),

  // Bank Name
  bankNameModifications: backendUrl("/admin/bank-name-modifications"),
  bankNameModificationApprove: (id) => backendUrl(`/admin/bank-name-modification-approve/${encodeURIComponent(id)}`),
  BANK_NAME_MODIFICATIONS: backendUrl('/admin/bank-name-modifications'),
  BANK_NAME_MODIFICATION_APPROVE: (id) => backendUrl(`/admin/bank-name-modification-approve/${encodeURIComponent(id)}`),

  // Game Issue Complaints
  gameIssueComplaints: backendUrl("/admin/game-issue-complaints"),
  gameIssueComplaintApprove: (id) => backendUrl(`/admin/game-issue-complaint-approve/${encodeURIComponent(id)}`),
  GAME_ISSUE_COMPLAINTS: backendUrl('/admin/game-issue-complaints'),
  GAME_ISSUE_COMPLAINT_APPROVE: (id) => backendUrl(`/admin/game-issue-complaint-approve/${encodeURIComponent(id)}`),

  // Password Reset
  requestChangeLoginPassword: backendUrl("/admin/request-change-login-password"),
  approveLoginPasswordRequest: (id) => backendUrl(`/admin/approve-login-password-request/${encodeURIComponent(id)}`),
  REQUEST_CHANGE_LOGIN_PASSWORD: backendUrl('/admin/request-change-login-password'),
  APPROVE_LOGIN_PASSWORD_REQUEST: (id) => backendUrl(`/admin/approve-login-password-request/${encodeURIComponent(id)}`),

  // USDT Verification
  usdtVerification: backendUrl("/admin/usdt-verification"),
  usdtVerificationItem: (id) => backendUrl(`/admin/usdt-verification/${encodeURIComponent(id)}`),
  usdtApprove: (id) => backendUrl(`/admin/usdt-approve/${encodeURIComponent(id)}`),
  USDT_VERIFICATION: backendUrl('/admin/usdt-verification'),
  USDT_VERIFICATION_ITEM: (id) => backendUrl(`/admin/usdt-verification/${encodeURIComponent(id)}`),
  USDT_APPROVE: (id) => backendUrl(`/admin/usdt-approve/${encodeURIComponent(id)}`),

  // USDT Address Verification
  usdtAddressVerification: backendUrl("/admin/usdt-address-verification"),
  changeUsdtAddressStatus: (id) => backendUrl(`/admin/change-usdt-address-status/${encodeURIComponent(id)}`),
  USDT_ADDRESS_VERIFICATION: backendUrl('/admin/usdt-address-verification'),
  CHANGE_USDT_ADDRESS_STATUS: (id) => backendUrl(`/admin/change-usdt-address-status/${encodeURIComponent(id)}`),

  // Deposit / Withdraw Problems
  depositProblems: backendUrl("/admin/deposit-problems"),
  depositProblemStatus: (id) => backendUrl(`/admin/deposit-problem-status/${encodeURIComponent(id)}`),
  DEPOSIT_PROBLEMS: backendUrl('/admin/deposit-problems'),
  DEPOSIT_PROBLEM_STATUS: (id) => backendUrl(`/admin/deposit-problem-status/${encodeURIComponent(id)}`),

  withdrawProblems: backendUrl("/admin/withdraw-problems"),
  withdrawProblemStatus: (id) => backendUrl(`/admin/withdraw-problem-status/${encodeURIComponent(id)}`),
  WITHDRAW_PROBLEMS: backendUrl('/admin/withdraw-problems'),
  WITHDRAW_PROBLEM_STATUS: (id) => backendUrl(`/admin/withdraw-problem-status/${encodeURIComponent(id)}`),

  // External Game Categories
  GAME_CATEGORIES: `${EXTERNAL_GAME_BASE_URL}/game-categories`,
  GAMES_BY_CATEGORY: `${EXTERNAL_GAME_BASE_URL}/games-by-category`,
}

// Chicken Road API Registry Export
export const CHICKEN_API = {
  chickenBet: API_ENDPOINTS.chickenBet,
  chickenBetValues: API_ENDPOINTS.chickenBetValues,
  chickenHistory: API_ENDPOINTS.chickenHistory,
  chickenHistoryByUser: API_ENDPOINTS.chickenHistoryByUser,
  chickenCashout: API_ENDPOINTS.chickenCashout,
  chickenMultiplier: API_ENDPOINTS.chickenMultiplier,
  chickenMultiplierByUser: API_ENDPOINTS.chickenMultiplierByUser,
  chickenAdminMultiplier: API_ENDPOINTS.chickenAdminMultiplier,
  chickenRules: API_ENDPOINTS.chickenRules,
  chickenUpdateRoastMultiplier: API_ENDPOINTS.chickenUpdateRoastMultiplier,
  chickenAddMultiplier: API_ENDPOINTS.chickenAddMultiplier,
  chickenMultiplierUpdate: API_ENDPOINTS.chickenMultiplierUpdate,
  chickenMultiplierDelete: API_ENDPOINTS.chickenMultiplierDelete,
  chickenUpdateGameRules: API_ENDPOINTS.chickenUpdateGameRules,
  chickenUpdateBetValues: API_ENDPOINTS.chickenUpdateBetValues,
}   

// WinGo API Registry Export
export const WINGO_API = {
  wingoFetch: API_ENDPOINTS.wingoFetch,
  wingoStoreResult: API_ENDPOINTS.wingoStoreResult,
  wingoFutureStore: API_ENDPOINTS.wingoFutureStore,
  wingoBets: API_ENDPOINTS.wingoBets,
  wingoResults: API_ENDPOINTS.wingoResults,
  wingoLastFiveResult: API_ENDPOINTS.wingoLastFiveResult,
  wingoLastResult: API_ENDPOINTS.wingoLastResult,
  wingoGetResult: API_ENDPOINTS.WINGO_GET_RESULT,
  wingoWinAmount: API_ENDPOINTS.wingoWinAmount,
  wingoBetHistory: API_ENDPOINTS.wingoBetHistory,
  wingoAdminSetResult: API_ENDPOINTS.wingoAdminSetResult,
  wingoAdminSetResultUrl: API_ENDPOINTS.wingoAdminSetResultUrl,
  wingoLive: API_ENDPOINTS.wingoLive,
  wingoLiveApi: API_ENDPOINTS.wingoLiveApi,
  wingoAutoResultInsert: API_ENDPOINTS.wingoAutoResultInsert,
  wingoAutoResultInsertApi: API_ENDPOINTS.wingoAutoResultInsertApi,
  wingoFetchHistory: API_ENDPOINTS.wingoFetchHistory,
}

// Jili Games API Registry Export
export const JILI_API = {
  jiliGames: API_ENDPOINTS.jiliGames,
  jiliLaunch: API_ENDPOINTS.jiliLaunch,
  jiliLaunchUrl: API_ENDPOINTS.jiliLaunchUrl,
  gamesUrl: API_ENDPOINTS.JILI_GAMES,
  launchUrl: API_ENDPOINTS.JILI_LAUNCH,
}

// Stack Tower Game API Registry Export
export const STACK_TOWER_API = {
  stats: API_ENDPOINTS.STACK_TOWER_ADMIN_STATS,
  statsAliases: API_ENDPOINTS.STACK_TOWER_ADMIN_STATS_ALIASES,
  activeBets: API_ENDPOINTS.STACK_TOWER_ADMIN_ACTIVE_BETS,
  activeBetsAliases: API_ENDPOINTS.STACK_TOWER_ADMIN_ACTIVE_BETS_ALIASES,
  dropObstacle: API_ENDPOINTS.STACK_TOWER_ADMIN_DROP_OBSTACLE,
  dropObstacleAliases: API_ENDPOINTS.STACK_TOWER_ADMIN_DROP_OBSTACLE_ALIASES,
}

// 4. Admin Management REST APIs Export
export const ADMIN_MANAGEMENT_API = {
  // IFSC Requests
  ifscModifications: API_ENDPOINTS.ifscModifications,
  ifscModificationApprove: API_ENDPOINTS.ifscModificationApprove,

  // Delete Account (Bank)
  viewDeleteWithdraw: API_ENDPOINTS.viewDeleteWithdraw,
  bankAccountChangeStatus: API_ENDPOINTS.bankAccountChangeStatus,

  // Bank Name
  bankNameModifications: API_ENDPOINTS.bankNameModifications,
  bankNameModificationApprove: API_ENDPOINTS.bankNameModificationApprove,

  // Game Issue Complaints
  gameIssueComplaints: API_ENDPOINTS.gameIssueComplaints,
  gameIssueComplaintApprove: API_ENDPOINTS.gameIssueComplaintApprove,

  // Password Reset
  requestChangeLoginPassword: API_ENDPOINTS.requestChangeLoginPassword,
  approveLoginPasswordRequest: API_ENDPOINTS.approveLoginPasswordRequest,

  // USDT Verification
  usdtVerification: API_ENDPOINTS.usdtVerification,
  usdtVerificationItem: API_ENDPOINTS.usdtVerificationItem,
  usdtApprove: API_ENDPOINTS.usdtApprove,

  // USDT Address Verification
  usdtAddressVerification: API_ENDPOINTS.usdtAddressVerification,
  changeUsdtAddressStatus: API_ENDPOINTS.changeUsdtAddressStatus,

  // Deposit / Withdraw Problems
  depositProblems: API_ENDPOINTS.depositProblems,
  depositProblemStatus: API_ENDPOINTS.depositProblemStatus,
  withdrawProblems: API_ENDPOINTS.withdrawProblems,
  withdrawProblemStatus: API_ENDPOINTS.withdrawProblemStatus,
}

export const CUSTOMER_SERVICE_API = ADMIN_MANAGEMENT_API

// Backward compatibility exports
export const GAME_CATEGORY_API = {
  BASE_URL: EXTERNAL_GAME_BASE_URL,
  CATEGORIES: API_ENDPOINTS.GAME_CATEGORIES,
  GAMES_BY_CATEGORY: API_ENDPOINTS.GAMES_BY_CATEGORY,
}

export const LOCAL_API = {
  BASE_URL: BACKEND_BASE_URL,
  LOGIN_PROXY: API_ENDPOINTS.LOGIN_PROXY,
  LOGIN_DIRECT: API_ENDPOINTS.LOGIN,
  DASHBOARD_PROXY: API_ENDPOINTS.DASHBOARD_PROXY,
  DASHBOARD_DIRECT: API_ENDPOINTS.DASHBOARD,
}

// Horse Racing Socket URL
export const HORSE_RACING_SOCKET = {
  URL: SOCKET_BASE_URL,
  EVENTS: SOCKET_CONFIG.HORSE_RACING.EVENTS,
}

export default {
  GAME_BASE_URL,
  SOCKET_BASE_URL,
  SOCKET_CONFIG,
  BACKEND_BASE_URL,
  EXTERNAL_GAME_BASE_URL,
  API_ENDPOINTS,
  GAME_CATEGORY_API,
  LOCAL_API,
  WINGO_API,
  CHICKEN_API,
  STACK_TOWER_API,
  JILI_API,
  ADMIN_MANAGEMENT_API,
  CUSTOMER_SERVICE_API,
  HORSE_RACING_SOCKET,
}
