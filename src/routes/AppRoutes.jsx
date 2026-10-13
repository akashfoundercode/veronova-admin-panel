import { Routes, Route } from 'react-router-dom'
import { DashboardLayout } from '@/layouts'
import {
  Dashboard,
  Attendance,
  Players,
  FundTransfer,
  FundTransferAdd,
  FundTransferHistory,
  VipLevels,
  IllegalBets,
  SystemUsers,
  IpLogs,
  Aviator,
  AviatorSettings,
  MlmLevels,
  Salary,
  ColourPrediction,
  ChickenMultiplier,
  ChickenBetHistory,
  ChickenBetValues,
  ChickenAmountSetup,
  Gift,
  Offer,
  Banners,
  Feedback,
  PaymentsLimit,
  Deposit,
  Withdrawal,
  CustomerService,
  ProfitLoss,
  Support,
  Reports,
  Notifications,
  Settings,
  Simple,
  HorseRiding,
  InHouseGames,
  ThirdPartyGames,
} from '@/pages'
import GiftHistory from '@/pages/Gift/GiftHistory'

export default function AppRoutes() {
  return (
    <Routes>
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
        <Route path="withdrawal" element={<Withdrawal />} />
        <Route path="customer-service" element={<CustomerService />} />
        <Route path="customer-service/bank-request" element={<CustomerService activeCategory="bank_request" />} />
        <Route path="customer-service/change-password" element={<CustomerService activeCategory="change_password" />} />
        <Route path="customer-service/ifsc-modification" element={<CustomerService activeCategory="ifsc_modification" />} />
        <Route path="customer-service/verification" element={<CustomerService activeCategory="verification" />} />
        <Route path="customer-service/delete-usdt" element={<CustomerService activeCategory="delete_usdt" />} />
        <Route path="customer-service/bank-name-modification" element={<CustomerService activeCategory="bank_name" />} />
        <Route path="customer-service/game-complaints" element={<CustomerService activeCategory="game_complaints" />} />
        <Route path="profit-loss" element={<ProfitLoss />} />
        <Route path="support" element={<Support />} />
        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Simple />} />
      </Route>
    </Routes>
  )
}

