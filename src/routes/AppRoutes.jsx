import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { DashboardLayout } from '@/layouts'

const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Attendance = lazy(() => import('@/pages/Attendance'))
const Players = lazy(() => import('@/pages/Players'))
const FundTransferAdd = lazy(() => import('@/pages/FundTransfer/FundTransferAdd').then((m) => ({ default: m.default })))
const FundTransferHistory = lazy(() => import('@/pages/FundTransfer/FundTransferHistory').then((m) => ({ default: m.default })))
const VipLevels = lazy(() => import('@/pages/VipLevels'))
const IllegalBets = lazy(() => import('@/pages/IllegalBets'))
const SystemUsers = lazy(() => import('@/pages/SystemUsers'))
const IpLogs = lazy(() => import('@/pages/IpLogs'))
const Aviator = lazy(() => import('@/pages/Aviator'))
const AviatorSettings = lazy(() => import('@/pages/AviatorSettings'))
const MlmLevels = lazy(() => import('@/pages/MlmLevels'))
const Salary = lazy(() => import('@/pages/Salary'))
const ColourPrediction = lazy(() => import('@/pages/ColourPrediction'))
const chickenPages = import('@/pages/Chicken')
const ChickenMultiplier = lazy(() => chickenPages.then((m) => ({ default: m.ChickenMultiplier })))
const ChickenBetHistory = lazy(() => chickenPages.then((m) => ({ default: m.ChickenBetHistory })))
const ChickenBetValues = lazy(() => chickenPages.then((m) => ({ default: m.ChickenBetValues })))
const ChickenAmountSetup = lazy(() => chickenPages.then((m) => ({ default: m.ChickenAmountSetup })))
const Gift = lazy(() => import('@/pages/Gift'))
const GiftHistory = lazy(() => import('@/pages/Gift/GiftHistory'))
const Offer = lazy(() => import('@/pages/Offer'))
const Banners = lazy(() => import('@/pages/Banners'))
const Feedback = lazy(() => import('@/pages/Feedback'))
const PaymentsLimit = lazy(() => import('@/pages/PaymentsLimit'))
const Deposit = lazy(() => import('@/pages/Deposit'))
const DepositPending = lazy(() => import('@/pages/Deposit/DepositPending'))
const DepositSuccess = lazy(() => import('@/pages/Deposit/DepositSuccess'))
const DepositReject = lazy(() => import('@/pages/Deposit/DepositReject'))
const Withdrawal = lazy(() => import('@/pages/Withdrawal'))
const WithdrawalPending = lazy(() => import('@/pages/Withdrawal/WithdrawalPending'))
const WithdrawalApproved = lazy(() => import('@/pages/Withdrawal/WithdrawalApproved'))
const WithdrawalReject = lazy(() => import('@/pages/Withdrawal/WithdrawalReject'))
const CustomerService = lazy(() => import('@/pages/CustomerService'))
const ProfitLoss = lazy(() => import('@/pages/ProfitLoss'))
const Support = lazy(() => import('@/pages/Support'))
const Simple = lazy(() => import('@/pages/Simple'))
const HorseRiding = lazy(() => import('@/pages/HorseRiding'))
const StackTower = lazy(() => import('@/pages/StackTower'))
const InHouseGames = lazy(() => import('@/pages/InHouseGames'))
const ThirdPartyGames = lazy(() => import('@/pages/ThirdPartyGames'))
const Login = lazy(() => import('@/pages/Login'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading page...</div>}>
      <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="players" element={<Players />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="fund-transfer" element={<FundTransferAdd />} />
        <Route path="fund-transfer/add" element={<FundTransferAdd />} />
        <Route path="fund-transfer/history" element={<FundTransferHistory />} />
        <Route path="fund-transfer-history" element={<FundTransferHistory />} />
        <Route path="vip-levels" element={<VipLevels />} />
        <Route path="illegal-bets" element={<IllegalBets />} />
        <Route path="system-users" element={<SystemUsers />} />
        <Route path="login-ip" element={<IpLogs today={false} />} />
        <Route path="today-ip" element={<IpLogs today />} />
        <Route path="aviator" element={<Aviator />} />
        <Route path="aviator-settings" element={<AviatorSettings />} />
        <Route path="mlm-levels" element={<MlmLevels />} />
        <Route path="salary" element={<Salary />} />
        <Route path="colour-prediction" element={<ColourPrediction />} />
        <Route path="chicken/multiplier" element={<ChickenMultiplier />} />
        <Route path="chicken/bet-history" element={<ChickenBetHistory />} />
        <Route path="chicken/bet-values" element={<ChickenBetValues />} />
        <Route path="chicken/amount-setup" element={<ChickenAmountSetup />} />
        <Route path="horse-riding" element={<HorseRiding />} />
        <Route path="stack-tower" element={<StackTower />} />
        <Route path="stack-tower/stats" element={<StackTower />} />
        <Route path="stack-tower/control" element={<StackTower />} />
        <Route path="in-house-games" element={<InHouseGames />} />
        <Route path="third-party-games" element={<ThirdPartyGames />} />
        <Route path="jilli-bets" element={<Simple />} />
        <Route path="gift" element={<Gift />} />
        <Route path="gift-history" element={<GiftHistory />} />
        <Route path="offer" element={<Offer />} />
        <Route path="banners" element={<Banners />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="payments-limit" element={<PaymentsLimit />} />
        <Route path="deposit" element={<Deposit />} />
        <Route path="deposit/pending" element={<DepositPending />} />
        <Route path="deposit/success" element={<DepositSuccess />} />
        <Route path="deposit/reject" element={<DepositReject />} />
        <Route path="withdrawal" element={<Withdrawal />} />
        <Route path="withdrawal/pending" element={<WithdrawalPending />} />
        <Route path="withdrawal/approved" element={<WithdrawalApproved />} />
        <Route path="withdrawal/reject" element={<WithdrawalReject />} />
        <Route path="customer-service" element={<CustomerService />} />
        <Route path="customer-service/bank-request" element={<CustomerService activeCategory="bank_request" />} />
        <Route path="customer-service/change-password" element={<CustomerService activeCategory="change_password" />} />
        <Route path="customer-service/ifsc-modification" element={<CustomerService activeCategory="ifsc_modification" />} />
        <Route path="customer-service/verification" element={<CustomerService activeCategory="verification" />} />
        <Route path="customer-service/delete-usdt" element={<CustomerService activeCategory="delete_usdt" />} />
        <Route path="customer-service/bank-name-modification" element={<CustomerService activeCategory="bank_name" />} />
        <Route path="customer-service/game-complaints" element={<CustomerService activeCategory="game_complaints" />} />
        <Route path="customer-service/deposit-problems" element={<CustomerService activeCategory="deposit_problems" />} />
        <Route path="customer-service/withdraw-problems" element={<CustomerService activeCategory="withdraw_problems" />} />
        <Route path="profit-loss" element={<ProfitLoss />} />
        <Route path="support" element={<Support />} />
        <Route path="*" element={<Simple />} />
      </Route>
      </Routes>
    </Suspense>
  )
}

