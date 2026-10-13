import {
  LayoutDashboard, Clock, Users, Wallet, Crown, ShieldAlert, User, MapPin, ShieldCheck,
  Plane, Settings, Network, ListChecks, Palette, Gamepad2, BarChart3, Bell, Gift,
  Megaphone, Image, MessageSquare, CreditCard, ArrowDownToLine, ArrowUpFromLine,
  Headphones, Percent, Dices, Star, IndianRupee, TrendingUp, Receipt, Info, Flame,
  Send, History, Landmark, KeyRound, FileEdit, Contact, Trash2, Edit3, AlertCircle,
  Home, Globe, Sparkles
} from 'lucide-react'
import { ROUTES } from './routes'

export const sidebarMenus = [
  { to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { to: ROUTES.PLAYERS, label: 'Players', icon: Users },

  // Games Section right after Players with ONLY 2 buttons inside
  {
    label: 'Games',
    icon: Gamepad2,
    key: 'games',
    children: [
      { to: ROUTES.IN_HOUSE_GAMES, label: 'In-House Games', icon: Star },
      { to: ROUTES.THIRD_PARTY_GAMES, label: 'Third-Party Games', icon: Gamepad2 },
    ],
  },

  // Games outside of Games dropdown
  { to: ROUTES.AVIATOR, label: 'Aviator Game', icon: Plane },
  { to: ROUTES.AVIATOR_SETTINGS, label: 'Aviator Settings', icon: Settings },
  { to: ROUTES.COLOUR_PREDICTION, label: 'Wingo (Colour Prediction)', icon: Palette },
  { to: ROUTES.HORSE_RIDING, label: 'Horse-Riding', icon: Dices },
  {
    label: 'Chicken Road Game',
    icon: Flame,
    key: 'chicken',
    children: [
      { to: ROUTES.CHICKEN_MULTIPLIER, label: 'Multiplier', icon: Percent },
      { to: ROUTES.CHICKEN_BET_HISTORY, label: 'Bet History', icon: Dices },
      { to: ROUTES.CHICKEN_BET_VALUES, label: 'Bet Values', icon: Star },
      { to: ROUTES.CHICKEN_AMOUNT_SETUP, label: 'Amount Setup', icon: IndianRupee },
    ],
  },
  { to: ROUTES.JILLI_BETS, label: 'Jilli Game Bets', icon: ListChecks },

  { to: ROUTES.ATTENDANCE, label: 'Attendance', icon: Clock },
  {
    label: 'Fund Transfer',
    icon: Wallet,
    key: 'fund-transfer',
    children: [
      { to: ROUTES.FUND_TRANSFER_ADD, label: 'Add Fund Transfer', icon: Send },
      { to: ROUTES.FUND_TRANSFER_HISTORY, label: 'Transfer History', icon: History },
    ],
  },
  { to: ROUTES.VIP_LEVELS, label: 'VIP Levels', icon: Crown },
  { to: ROUTES.ILLEGAL_BETS, label: 'Illegal User Bet', icon: ShieldAlert },
  { to: ROUTES.SYSTEM_USERS, label: 'System User', icon: User },
  { to: ROUTES.LOGIN_IP, label: 'Login User IP Details', icon: MapPin },
  { to: ROUTES.TODAY_IP, label: 'Today Login User IP Details', icon: ShieldCheck },

  { to: ROUTES.MLM_LEVELS, label: 'MLM Levels', icon: Network },
  { to: ROUTES.SALARY, label: 'Salary List', icon: ListChecks },
  { to: ROUTES.OFFER, label: 'Offer', icon: Megaphone },
  { to: ROUTES.GIFT, label: 'Gift', icon: Gift },
  { to: '/gift-history', label: 'Gift Redeemed History', icon: CreditCard },
  { to: ROUTES.BANNERS, label: 'Activity & Banner', icon: Image },
  { to: '/feedback', label: 'Feedback', icon: MessageSquare },
  { to: '/payments-limit', label: 'Payments Limit', icon: Receipt },
  { to: '/deposit', label: 'Deposit', icon: ArrowDownToLine },
  { to: '/withdrawal', label: 'Withdrawal', icon: ArrowUpFromLine },
  {
    label: 'Customer Service',
    icon: Headphones,
    key: 'customer-service',
    children: [
      { to: ROUTES.CS_BANK_REQUEST, label: 'View Bank Request', icon: Landmark },
      { to: ROUTES.CS_CHANGE_PASSWORD, label: 'Change Login Password', icon: KeyRound },
      { to: ROUTES.CS_IFSC_MODIFICATION, label: 'IFSC Modifications', icon: FileEdit },
      { to: ROUTES.CS_VERIFICATION, label: 'Indian/Non-Indian Verification', icon: Contact },
      { to: ROUTES.CS_DELETE_USDT, label: 'Delete Old USDT', icon: Trash2 },
      { to: ROUTES.CS_BANK_NAME_MODIFICATION, label: 'Bank Name Modifications', icon: Edit3 },
      { to: ROUTES.CS_GAME_COMPLAINTS, label: 'Game Issue Complaints', icon: AlertCircle },
    ],
  },
  { to: '/profit-loss', label: 'Profit/Loss-Admin Details', icon: TrendingUp },
  { to: '/support', label: 'Support Setting', icon: Info },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/notifications', label: 'Notifications', icon: Bell, badge: 3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]
