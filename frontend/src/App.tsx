import { Navigate, Route, Routes } from 'react-router-dom'
import { GuestRoute } from '@/components/auth/GuestRoute'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ChangePasswordPage } from '@/pages/auth/CompanyAuthPages'
import { SignupPage } from '@/pages/auth/SignupPage'
import { AiAssistantPage } from '@/pages/AiAssistantPage'
import { AnalyticsReportsPage } from '@/pages/AnalyticsReportsPage'
import { AttendancePage } from '@/pages/AttendancePage'
import { AttritionInsightsPage } from '@/pages/AttritionInsightsPage'
import { DashboardRouter } from '@/pages/DashboardRouter'
import { EmployeeDashboardPage } from '@/pages/EmployeeDashboardPage'
import { EmployeeDirectoryPage } from '@/pages/EmployeeDirectoryPage'
import { EmployeeLifecyclePage } from '@/pages/EmployeeLifecyclePage'
import { HrAnnouncementsPage } from '@/pages/HrAnnouncementsPage'
import { HrAdminDashboardPage } from '@/pages/HrAdminDashboardPage'
import { LeaveManagementPage } from '@/pages/LeaveManagementPage'
import { ManagerDashboardPage } from '@/pages/ManagerDashboardPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { HrPayrollPage } from '@/pages/HrPayrollPage'
import { PayrollPage } from '@/pages/PayrollPage'
import { ManagerPerformancePage } from '@/pages/ManagerPerformancePage'
import { PerformancePage } from '@/pages/PerformancePage'
import { ProfileSettingsPage } from '@/pages/ProfileSettingsPage'
import { SplashPage } from '@/pages/SplashPage'
import { WorkforceIntelligencePage } from '@/pages/WorkforceIntelligencePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/splash" replace />} />
      <Route path="/splash" element={<SplashPage />} />
      <Route element={<GuestRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/dashboard/employee" element={<EmployeeDashboardPage />} />
          <Route path="/dashboard/manager" element={<ManagerDashboardPage />} />
          <Route path="/dashboard/hr-admin" element={<HrAdminDashboardPage />} />
          <Route path="/dashboard/directory" element={<EmployeeDirectoryPage />} />
          <Route path="/dashboard/lifecycle" element={<EmployeeLifecyclePage />} />
          <Route path="/dashboard/announcements" element={<HrAnnouncementsPage />} />
          <Route path="/dashboard/attendance" element={<AttendancePage />} />
          <Route path="/dashboard/leave" element={<LeaveManagementPage />} />
          <Route path="/dashboard/payroll" element={<PayrollPage />} />
          <Route path="/dashboard/payroll/operations" element={<HrPayrollPage />} />
          <Route path="/dashboard/performance" element={<PerformancePage />} />
          <Route path="/dashboard/performance/operations" element={<ManagerPerformancePage />} />
          <Route path="/dashboard/intelligence" element={<WorkforceIntelligencePage />} />
          <Route path="/dashboard/insights" element={<AttritionInsightsPage />} />
          <Route path="/dashboard/ai-assistant" element={<AiAssistantPage />} />
          <Route path="/dashboard/analytics" element={<AnalyticsReportsPage />} />
          <Route path="/dashboard/notifications" element={<NotificationsPage />} />
          <Route path="/dashboard/profile" element={<ProfileSettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/splash" replace />} />
    </Routes>
  )
}
