import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { MobileShell } from '../layouts/MobileShell';
import { WorkerShell } from '../layouts/WorkerShell';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Auth Pages
import { Login } from '../pages/Auth/Login';
import { ShedPinLogin } from '../pages/Auth/ShedPinLogin';

// Farmer Pages
import { TodayOverview } from '../pages/Farmer/TodayOverview';
import { ShedsBirds } from '../pages/Farmer/ShedsBirds';
import { Workers } from '../pages/Farmer/Workers';
import { Tasks } from '../pages/Farmer/Tasks';
import { DailyRecords } from '../pages/Farmer/DailyRecords';
import { SickBirds } from '../pages/Farmer/SickBirds';
import { MaizeGate } from '../pages/Farmer/MaizeGate';
import { FeedDeliveries } from '../pages/Farmer/FeedDeliveries';
import { HealthSchedule } from '../pages/Farmer/HealthSchedule';
import { EggsSales } from '../pages/Farmer/EggsSales';
import { Ledger } from '../pages/Farmer/Ledger';
import { MyVet } from '../pages/Farmer/MyVet';
import { FarmSettings } from '../pages/Farmer/FarmSettings';
import { MoreMenu } from '../pages/Farmer/MoreMenu';

// Worker Pages
import { WorkerTasks } from '../pages/Worker/WorkerTasks';
import { WorkerDailyEntry } from '../pages/Worker/WorkerDailyEntry';
import { WorkerReportProblem } from '../pages/Worker/WorkerReportProblem';

// Vet Pages
import { SickBirdReports } from '../pages/Vet/SickBirdReports';
import { LinkedFarms } from '../pages/Vet/LinkedFarms';
import { VetPracticeProfile } from '../pages/Vet/VetPracticeProfile';

// Supplier Pages
import { MillProfile } from '../pages/Supplier/MillProfile';
import { MedicineProfile } from '../pages/Supplier/MedicineProfile';

// Admin Pages
import { PilotAccounts } from '../pages/Admin/PilotAccounts';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/pin-login" element={<ShedPinLogin />} />

      {/* Farmer Routes (MobileShell) */}
      <Route element={<ProtectedRoute allowedRoles={['INTEG', 'LAYER']} />}>
        <Route path="/farmer" element={<MobileShell />}>
          <Route index element={<Navigate to="/farmer/today" replace />} />
          <Route path="today" element={<TodayOverview />} />
          <Route path="reports" element={<SickBirds />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="sheds" element={<ShedsBirds />} />
          <Route path="daily" element={<DailyRecords />} />
          <Route path="loads" element={<MaizeGate />} />
          <Route path="deliveries" element={<FeedDeliveries />} />
          <Route path="health" element={<HealthSchedule />} />
          <Route path="sales" element={<EggsSales />} />
          <Route path="ledger" element={<Ledger />} />
          <Route path="workers" element={<Workers />} />
          <Route path="vet" element={<MyVet />} />
          <Route path="settings" element={<FarmSettings />} />
          <Route path="more" element={<MoreMenu />} />
        </Route>
      </Route>

      {/* Shed Worker Routes (WorkerShell on Farm Phone) */}
      <Route element={<ProtectedRoute allowedRoles={['WORKER']} />}>
        <Route path="/worker" element={<WorkerShell />}>
          <Route index element={<Navigate to="/worker/tasks" replace />} />
          <Route path="tasks" element={<WorkerTasks />} />
          <Route path="daily" element={<WorkerDailyEntry />} />
          <Route path="report" element={<WorkerReportProblem />} />
        </Route>
      </Route>

      {/* Veterinarian Routes (DashboardLayout) */}
      <Route element={<ProtectedRoute allowedRoles={['VET']} />}>
        <Route path="/vet" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/vet/reports" replace />} />
          <Route path="reports" element={<SickBirdReports />} />
          <Route path="farms" element={<LinkedFarms />} />
          <Route path="profile" element={<VetPracticeProfile />} />
        </Route>
      </Route>

      {/* Supplier Routes (DashboardLayout) */}
      <Route element={<ProtectedRoute allowedRoles={['MILL', 'MEDS']} />}>
        <Route path="/supplier" element={<DashboardLayout />}>
          <Route path="mill" element={<MillProfile />} />
          <Route path="medicine" element={<MedicineProfile />} />
        </Route>
      </Route>

      {/* Administrator Routes (DashboardLayout) */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/admin/accounts" replace />} />
          <Route path="accounts" element={<PilotAccounts />} />
        </Route>
      </Route>

      {/* Fallback Root Redirect */}
      <Route path="*" element={<Navigate to="/farmer/today" replace />} />
    </Routes>
  );
};
