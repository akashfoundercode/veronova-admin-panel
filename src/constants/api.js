/**
 * Veronova Centralized API Endpoints Configuration
 * 
 * Saari APIs ke URLs is ek file me centralized hain.
 * Agar backend ka URL badalna ho to sirf yaha BACKEND_BASE_URL change karein,
 * pure project me automatic reflect ho jayega.
 */

// 1. Backend Server Base URL (Localhost port 3000 ya production domain)
export const BACKEND_BASE_URL = 'http://localhost:3000'

// 2. External Game Categories Server (Separated)
export const EXTERNAL_GAME_BASE_URL = 'https://root.veronova.co.in/api'

// 3. Centralized API Endpoints Registry
export const API_ENDPOINTS = {
  BACKEND_BASE_URL,
  // Authentication
  LOGIN: `${BACKEND_BASE_URL}/api/login`,
  LOGIN_PROXY: '/api/login',
  ADMIN_LOGIN_PROXY: '/api/admin/login',
  LOGOUT: `${BACKEND_BASE_URL}/api/logout`,
  LOGOUT_PROXY: '/api/logout',
  ADMIN_LOGOUT_PROXY: '/api/admin/logout',

  // Dashboard
  DASHBOARD: `${BACKEND_BASE_URL}/admin/dashboard`,
  DASHBOARD_PROXY: '/admin/dashboard',

  // Players Management
  PLAYERS: `${BACKEND_BASE_URL}/api/admin/players`,
  PLAYERS_PROXY: '/api/admin/players',

  // Attendance Management
  ATTENDANCE: `${BACKEND_BASE_URL}/api/admin/attendance`,
  ATTENDANCE_PROXY: '/api/admin/attendance',
  ATTENDANCE_ADMIN_PROXY: '/admin/attendance',

  // Fund Transfer Management
  FUND_TRANSFER: `${BACKEND_BASE_URL}/admin/fund-transfer`,
  FUND_TRANSFER_PROXY: '/admin/fund-transfer',
  FUND_TRANSFER_API_PROXY: '/api/admin/fund-transfer',
  FUND_TRANSFER_HISTORY: `${BACKEND_BASE_URL}/admin/fund-transfer/history`,
  FUND_TRANSFER_HISTORY_PROXY: '/admin/fund-transfer/history',
  FUND_TRANSFER_HISTORY_API_PROXY: '/api/admin/fund-transfer/history',

  // VIP Levels Management
  VIP_LEVELS: `${BACKEND_BASE_URL}/admin/vip-levels`,
  VIP_LEVELS_ADMIN_PROXY: '/admin/vip-levels',
  VIP_LEVELS_API_PROXY: '/api/admin/vip-levels',
  VIP_LEVELS_POST: `${BACKEND_BASE_URL}/api/admin/vip-levels`,

  // Illegal Bets & Flagged Players Management
  ILLEGAL_PLAYERS: `${BACKEND_BASE_URL}/api/admin/players?illegal=true`,
  ILLEGAL_PLAYERS_PROXY: '/api/admin/players?illegal=true',
  ILLEGAL_BETS: `${BACKEND_BASE_URL}/admin/illegal-bets`,
  ILLEGAL_BETS_ADMIN_PROXY: '/admin/illegal-bets',
  ILLEGAL_BETS_API_PROXY: '/api/admin/illegal-bets',

  // Login History & IP Telemetry
  LOGIN_HISTORY: `${BACKEND_BASE_URL}/admin/login-history`,
  LOGIN_HISTORY_PROXY: '/admin/login-history',
  LOGIN_HISTORY_API_PROXY: '/api/admin/login-history',

  // MLM Levels Management
  MLM_LEVELS: `${BACKEND_BASE_URL}/admin/mlm-levels`,
  MLM_LEVELS_PROXY: '/admin/mlm-levels',
  MLM_LEVELS_API_PROXY: '/api/admin/mlm-levels',

  // Agent Salary & Payroll Management
  SALARY_LIST: `${BACKEND_BASE_URL}/admin/salary-list`,
  SALARY_LIST_PROXY: '/admin/salary-list',
  SALARY_LIST_API_PROXY: '/api/admin/salary-list',
  SALARY_USER_SEARCH_PROXY: (userId) => `/admin/salary-list/${encodeURIComponent(userId)}`,

  // Offers & Promotions Engine
  OFFERS: `${BACKEND_BASE_URL}/admin/offers`,
  OFFERS_PROXY: '/admin/offers',
  OFFERS_API_PROXY: '/api/admin/offers',
  OFFERS_ITEM_PROXY: (id) => `/admin/offers/${encodeURIComponent(id)}`,

  // Gifts & Red Envelopes
  GIFTS: `${BACKEND_BASE_URL}/admin/gifts`,
  GIFTS_PROXY: '/admin/gifts',
  GIFTS_API_PROXY: '/api/admin/gifts',
  GIFTS_ITEM_PROXY: (id) => `/admin/gifts/${encodeURIComponent(id)}`,
  GIFT_HISTORY: `${BACKEND_BASE_URL}/admin/gift-history`,
  GIFT_HISTORY_PROXY: '/admin/gift-history',
  GIFT_HISTORY_API_PROXY: '/api/admin/gift-history',

  // Banners & Activity CMS
  BANNERS: `${BACKEND_BASE_URL}/admin/banners`,
  BANNERS_PROXY: '/admin/banners',
  BANNERS_API_PROXY: '/api/admin/banners',
  BANNERS_ITEM_PROXY: (id) => `/admin/banners/${encodeURIComponent(id)}`,

  ACTIVITY_BANNERS: `${BACKEND_BASE_URL}/admin/activity-banners`,
  ACTIVITY_BANNERS_PROXY: '/admin/activity-banners',
  ACTIVITY_BANNERS_API_PROXY: '/api/admin/activity-banners',
  ACTIVITY_BANNERS_ITEM_PROXY: (id) => `/admin/activity-banners/${encodeURIComponent(id)}`,

  BANNER_HISTORY: `${BACKEND_BASE_URL}/admin/banner-history`,
  BANNER_HISTORY_PROXY: '/admin/banner-history',

  // Payment Limits & Processing Rules
  PAYMENT_LIMITS: `${BACKEND_BASE_URL}/admin/payment-limits`,
  PAYMENT_LIMITS_PROXY: '/admin/payment-limits',
  PAYMENT_LIMITS_API_PROXY: '/api/admin/payment-limits',
  PAYMENT_LIMIT_ITEM_PROXY: (id) => `/admin/payment-limits/${encodeURIComponent(id)}`,

  // Deposits & Recharge Management
  DEPOSITS: `${BACKEND_BASE_URL}/admin/deposits`,
  DEPOSITS_PROXY: '/admin/deposits',
  DEPOSITS_API_PROXY: '/api/admin/deposits',
  DEPOSITS_PENDING: `${BACKEND_BASE_URL}/admin/deposits/pending`,
  DEPOSITS_PENDING_PROXY: '/admin/deposits/pending',
  DEPOSITS_SUCCESS: `${BACKEND_BASE_URL}/admin/deposits/success`,
  DEPOSITS_SUCCESS_PROXY: '/admin/deposits/success',
  DEPOSITS_REJECT: `${BACKEND_BASE_URL}/admin/deposits/reject`,
  DEPOSITS_REJECT_PROXY: '/admin/deposits/reject',
  DEPOSIT_ITEM: (id) => `${BACKEND_BASE_URL}/admin/deposits/${encodeURIComponent(id)}`,
  DEPOSIT_ITEM_PROXY: (id) => `/admin/deposits/${encodeURIComponent(id)}`,
  DEPOSIT_STATUS: (id) => `${BACKEND_BASE_URL}/admin/deposits/${encodeURIComponent(id)}/status`,
  DEPOSIT_STATUS_PROXY: (id) => `/admin/deposits/${encodeURIComponent(id)}/status`,

  // Withdrawals & Payout Desk
  WITHDRAWALS: `${BACKEND_BASE_URL}/admin/withdrawals`,
  WITHDRAWALS_PROXY: '/admin/withdrawals',
  WITHDRAWALS_API_PROXY: '/api/admin/withdrawals',
  WITHDRAWALS_PENDING: `${BACKEND_BASE_URL}/admin/withdrawals/pending`,
  WITHDRAWALS_PENDING_PROXY: '/admin/withdrawals/pending',
  WITHDRAWALS_APPROVED: `${BACKEND_BASE_URL}/admin/withdrawals/approved`,
  WITHDRAWALS_APPROVED_PROXY: '/admin/withdrawals/approved',
  WITHDRAWALS_SUCCESS_PROXY: '/admin/withdrawals/success',
  WITHDRAWALS_REJECT: `${BACKEND_BASE_URL}/admin/withdrawals/reject`,
  WITHDRAWALS_REJECT_PROXY: '/admin/withdrawals/reject',
  WITHDRAWAL_ITEM: (id) => `${BACKEND_BASE_URL}/admin/withdrawals/${encodeURIComponent(id)}`,
  WITHDRAWAL_ITEM_PROXY: (id) => `/admin/withdrawals/${encodeURIComponent(id)}`,
  WITHDRAWAL_STATUS: (id) => `${BACKEND_BASE_URL}/admin/withdrawals/${encodeURIComponent(id)}/status`,
  WITHDRAWAL_STATUS_PROXY: (id) => `/admin/withdrawals/${encodeURIComponent(id)}/status`,

  // Exact Endpoint Aliases
  depositsPending: '/admin/deposits/pending',
  depositsSuccess: '/admin/deposits/success',
  depositsReject: '/admin/deposits/reject',
  deposits: '/admin/deposits',
  depositItem: (id) => `/admin/deposits/${encodeURIComponent(id)}`,
  depositStatus: (id) => `/admin/deposits/${encodeURIComponent(id)}/status`,

  withdrawalsPending: '/admin/withdrawals/pending',
  withdrawalsApproved: '/admin/withdrawals/approved',
  withdrawalsReject: '/admin/withdrawals/reject',
  withdrawals: '/admin/withdrawals',
  withdrawalItem: (id) => `/admin/withdrawals/${encodeURIComponent(id)}`,
  withdrawalStatus: (id) => `/admin/withdrawals/${encodeURIComponent(id)}/status`,

  // Support Settings & Customer Helpdesk CMS
  SUPPORT_SETTINGS: `${BACKEND_BASE_URL}/admin/support-settings`,
  SUPPORT_SETTINGS_PROXY: '/admin/support-settings',
  SUPPORT_SETTINGS_API_PROXY: '/api/admin/support-settings',
  SUPPORT_SETTING_ITEM: (id) => `${BACKEND_BASE_URL}/admin/support-settings/${encodeURIComponent(id)}`,
  SUPPORT_SETTING_ITEM_PROXY: (id) => `/admin/support-settings/${encodeURIComponent(id)}`,

  supportSettings: '/admin/support-settings',
  supportSettingItem: (id) => `/admin/support-settings/${encodeURIComponent(id)}`,

  // Aviator Telemetry, Drops History & Bets
  AVIATOR_TELEMETRY: `${BACKEND_BASE_URL}/admin/aviator/telemetry`,
  AVIATOR_TELEMETRY_PROXY: '/admin/aviator/telemetry',
  AVIATOR_TELEMETRY_API_PROXY: '/api/admin/aviator/telemetry',
  AVIATOR_DROPS: `${BACKEND_BASE_URL}/admin/aviator/drops`,
  AVIATOR_DROPS_PROXY: '/admin/aviator/drops',
  AVIATOR_DROPS_API_PROXY: '/api/admin/aviator/drops',
  AVIATOR_BETS: `${BACKEND_BASE_URL}/admin/aviator`,
  AVIATOR_BETS_PROXY: '/admin/aviator',
  AVIATOR_BETS_API_PROXY: '/api/admin/aviator',

  aviatorTelemetry: '/admin/aviator/telemetry',
  aviatorDrops: '/admin/aviator/drops',
  aviator: '/admin/aviator',

  // WinGo Routes (Colour Prediction Engine on http://localhost:3000)
  WINGO_FETCH: (gameid) => `${BACKEND_BASE_URL}/fetch/${gameid}`,
  WINGO_FETCH_PROXY: (gameid) => `/fetch/${gameid}`,
  WINGO_STORE_RESULT: `${BACKEND_BASE_URL}/colour_prediction-store`,
  WINGO_STORE_RESULT_PROXY: '/colour_prediction-store',
  WINGO_FUTURE_STORE: `${BACKEND_BASE_URL}/future-result-store`,
  WINGO_FUTURE_STORE_PROXY: '/future-result-store',
  WINGO_BETS: `${BACKEND_BASE_URL}/bets`,
  WINGO_BETS_PROXY: '/bets',
  WINGO_RESULTS: `${BACKEND_BASE_URL}/results`,
  WINGO_RESULTS_PROXY: '/results',
  WINGO_LAST_FIVE_RESULT: `${BACKEND_BASE_URL}/last_five_result`,
  WINGO_LAST_FIVE_RESULT_PROXY: '/last_five_result',
  WINGO_LAST_RESULT: `${BACKEND_BASE_URL}/last_result`,
  WINGO_LAST_RESULT_PROXY: '/last_result',
  WINGO_WIN_AMOUNT: `${BACKEND_BASE_URL}/win-amount`,
  WINGO_WIN_AMOUNT_PROXY: '/win-amount',
  WINGO_BET_HISTORY: `${BACKEND_BASE_URL}/bet_history`,
  WINGO_BET_HISTORY_PROXY: '/bet_history',
  WINGO_ADMIN_SET_RESULT: (id) => `${BACKEND_BASE_URL}/fetch_admin_set_Results/${encodeURIComponent(id)}`,
  WINGO_ADMIN_SET_RESULT_PROXY: (id) => `/fetch_admin_set_Results/${encodeURIComponent(id)}`,

  wingoFetch: (gameid) => `/fetch/${gameid}`,
  wingoStoreResult: '/colour_prediction-store',
  wingoFutureStore: '/future-result-store',
  wingoBets: "/bets",
  wingoResults: "/results",
  wingoLastFiveResult: "/last_five_result",
  wingoLastResult: "/last_result",
  wingoWinAmount: "/win-amount",
  wingoBetHistory: "/bet_history",
  wingoAdminSetResult: "/fetch_admin_set_Results/:id",
  wingoAdminSetResultUrl: (id) => `/fetch_admin_set_Results/${encodeURIComponent(id)}`,

  // Chicken Road Routes
  CHICKEN_BET: `${BACKEND_BASE_URL}/bet`,
  CHICKEN_BET_VALUES: `${BACKEND_BASE_URL}/bet_values`,
  CHICKEN_HISTORY: `${BACKEND_BASE_URL}/history`,
  CHICKEN_CASHOUT: `${BACKEND_BASE_URL}/cashout`,
  CHICKEN_MULTIPLIER: `${BACKEND_BASE_URL}/multiplier`,
  CHICKEN_ADMIN_MULTIPLIER: `${BACKEND_BASE_URL}/admin/multiplier`,
  CHICKEN_RULES: `${BACKEND_BASE_URL}/getGameRules`,
  CHICKEN_UPDATE_ROAST_MULTIPLIER: `${BACKEND_BASE_URL}/updateRoastMultiplier`,
  CHICKEN_ADD_MULTIPLIER: `${BACKEND_BASE_URL}/add_multiplier`,
  CHICKEN_MULTIPLIER_UPDATE: `${BACKEND_BASE_URL}/multiplier_update`,
  CHICKEN_MULTIPLIER_DELETE: `${BACKEND_BASE_URL}/multiplier_delete`,
  CHICKEN_UPDATE_GAME_RULES: `${BACKEND_BASE_URL}/updateGameRules`,
  CHICKEN_UPDATE_BET_VALUES: `${BACKEND_BASE_URL}/updateBetValues`,

  // Chicken Road Endpoint Aliases
  chickenBet: "/bet",
  chickenBetValues: "/bet_values",
  chickenHistory: "/history",
  chickenCashout: "/cashout",
  chickenMultiplier: "/multiplier",
  chickenAdminMultiplier: "/admin/multiplier",
  chickenRules: "/getGameRules",
  chickenUpdateRoastMultiplier: "/updateRoastMultiplier",
  chickenAddMultiplier: "/add_multiplier",
  chickenMultiplierUpdate: "/multiplier_update",
  chickenMultiplierDelete: "/multiplier_delete",
  chickenUpdateGameRules: "/updateGameRules",
  chickenUpdateBetValues: "/updateBetValues",

  // Jili Games Endpoints
  JILI_GAMES: `${BACKEND_BASE_URL}/getjilligame`,
  JILI_LAUNCH: `${BACKEND_BASE_URL}/jilligame`,
  jiliGames: "/getjilligame",
  jiliLaunch: "/jilligame",
  jiliLaunchUrl: (userId, amount, gameId) =>
    `/jilligame?user_id=${encodeURIComponent(userId || '')}&amount=${encodeURIComponent(amount || '')}&game_id=${encodeURIComponent(gameId || '')}`,

  // 4. Admin Management REST APIs
  // IFSC Requests
  ifscModifications: "/admin/ifsc-modifications",
  ifscModificationApprove: (id) => `/admin/ifsc-modification-approve/${encodeURIComponent(id)}`,
  IFSC_MODIFICATIONS: `${BACKEND_BASE_URL}/admin/ifsc-modifications`,
  IFSC_MODIFICATION_APPROVE: (id) => `${BACKEND_BASE_URL}/admin/ifsc-modification-approve/${encodeURIComponent(id)}`,

  // Delete Account
  viewDeleteWithdraw: "/admin/view-delete-withdraw",
  bankAccountChangeStatus: (id) => `/admin/bank-account-change-status/${encodeURIComponent(id)}`,
  VIEW_DELETE_WITHDRAW: `${BACKEND_BASE_URL}/admin/view-delete-withdraw`,
  BANK_ACCOUNT_CHANGE_STATUS: (id) => `${BACKEND_BASE_URL}/admin/bank-account-change-status/${encodeURIComponent(id)}`,

  // Bank Name
  bankNameModifications: "/admin/bank-name-modifications",
  bankNameModificationApprove: (id) => `/admin/bank-name-modification-approve/${encodeURIComponent(id)}`,
  BANK_NAME_MODIFICATIONS: `${BACKEND_BASE_URL}/admin/bank-name-modifications`,
  BANK_NAME_MODIFICATION_APPROVE: (id) => `${BACKEND_BASE_URL}/admin/bank-name-modification-approve/${encodeURIComponent(id)}`,

  // Game Issue Complaints
  gameIssueComplaints: "/admin/game-issue-complaints",
  gameIssueComplaintApprove: (id) => `/admin/game-issue-complaint-approve/${encodeURIComponent(id)}`,
  GAME_ISSUE_COMPLAINTS: `${BACKEND_BASE_URL}/admin/game-issue-complaints`,
  GAME_ISSUE_COMPLAINT_APPROVE: (id) => `${BACKEND_BASE_URL}/admin/game-issue-complaint-approve/${encodeURIComponent(id)}`,

  // Password Reset
  requestChangeLoginPassword: "/admin/request-change-login-password",
  approveLoginPasswordRequest: (id) => `/admin/approve-login-password-request/${encodeURIComponent(id)}`,
  REQUEST_CHANGE_LOGIN_PASSWORD: `${BACKEND_BASE_URL}/admin/request-change-login-password`,
  APPROVE_LOGIN_PASSWORD_REQUEST: (id) => `${BACKEND_BASE_URL}/admin/approve-login-password-request/${encodeURIComponent(id)}`,

  // USDT Verification
  usdtVerification: "/admin/usdt-verification",
  usdtVerificationItem: (id) => `/admin/usdt-verification/${encodeURIComponent(id)}`,
  usdtApprove: (id) => `/admin/usdt-approve/${encodeURIComponent(id)}`,
  USDT_VERIFICATION: `${BACKEND_BASE_URL}/admin/usdt-verification`,
  USDT_VERIFICATION_ITEM: (id) => `${BACKEND_BASE_URL}/admin/usdt-verification/${encodeURIComponent(id)}`,
  USDT_APPROVE: (id) => `${BACKEND_BASE_URL}/admin/usdt-approve/${encodeURIComponent(id)}`,

  // USDT Address Verification
  usdtAddressVerification: "/admin/usdt-address-verification",
  changeUsdtAddressStatus: (id) => `/admin/change-usdt-address-status/${encodeURIComponent(id)}`,
  USDT_ADDRESS_VERIFICATION: `${BACKEND_BASE_URL}/admin/usdt-address-verification`,
  CHANGE_USDT_ADDRESS_STATUS: (id) => `${BACKEND_BASE_URL}/admin/change-usdt-address-status/${encodeURIComponent(id)}`,

  // Deposit / Withdraw Problems
  depositProblems: "/admin/deposit-problems",
  depositProblemStatus: (id) => `/admin/deposit-problem-status/${encodeURIComponent(id)}`,
  DEPOSIT_PROBLEMS: `${BACKEND_BASE_URL}/admin/deposit-problems`,
  DEPOSIT_PROBLEM_STATUS: (id) => `${BACKEND_BASE_URL}/admin/deposit-problem-status/${encodeURIComponent(id)}`,

  withdrawProblems: "/admin/withdraw-problems",
  withdrawProblemStatus: (id) => `/admin/withdraw-problem-status/${encodeURIComponent(id)}`,
  WITHDRAW_PROBLEMS: `${BACKEND_BASE_URL}/admin/withdraw-problems`,
  WITHDRAW_PROBLEM_STATUS: (id) => `${BACKEND_BASE_URL}/admin/withdraw-problem-status/${encodeURIComponent(id)}`,

  // External Game Categories
  GAME_CATEGORIES: `${EXTERNAL_GAME_BASE_URL}/game-categories`,
  GAMES_BY_CATEGORY: `${EXTERNAL_GAME_BASE_URL}/games-by-category`,
}

// Chicken Road API Registry Export
export const CHICKEN_API = {
  chickenBet: API_ENDPOINTS.chickenBet,
  chickenBetValues: API_ENDPOINTS.chickenBetValues,
  chickenHistory: API_ENDPOINTS.chickenHistory,
  chickenCashout: API_ENDPOINTS.chickenCashout,
  chickenMultiplier: API_ENDPOINTS.chickenMultiplier,
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
  wingoWinAmount: API_ENDPOINTS.wingoWinAmount,
  wingoBetHistory: API_ENDPOINTS.wingoBetHistory,
  wingoAdminSetResult: API_ENDPOINTS.wingoAdminSetResult,
  wingoAdminSetResultUrl: API_ENDPOINTS.wingoAdminSetResultUrl,
}

// Jili Games API Registry Export
export const JILI_API = {
  jiliGames: API_ENDPOINTS.jiliGames,
  jiliLaunch: API_ENDPOINTS.jiliLaunch,
  jiliLaunchUrl: API_ENDPOINTS.jiliLaunchUrl,
  gamesUrl: API_ENDPOINTS.JILI_GAMES,
  launchUrl: API_ENDPOINTS.JILI_LAUNCH,
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
  LOGIN_DIRECT_IPV4: `http://127.0.0.1:3000/api/login`,
  DASHBOARD_PROXY: API_ENDPOINTS.DASHBOARD_PROXY,
  DASHBOARD_DIRECT: API_ENDPOINTS.DASHBOARD,
}

// Horse Racing Socket URL
export const HORSE_RACING_SOCKET = {
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
    // Live Bets Activity
    LIVE_BET: 'bet:live',
  },
}

export default {
  BACKEND_BASE_URL,
  EXTERNAL_GAME_BASE_URL,
  API_ENDPOINTS,
  GAME_CATEGORY_API,
  LOCAL_API,
  WINGO_API,
  CHICKEN_API,
  JILI_API,
  ADMIN_MANAGEMENT_API,
  CUSTOMER_SERVICE_API,
  HORSE_RACING_SOCKET,
}
