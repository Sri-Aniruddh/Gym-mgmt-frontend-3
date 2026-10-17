import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/common/Toast';
import ProtectedRoute from './components/routing/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import MemberLayout from './layouts/MemberLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import FirstTimePasswordPage from './pages/auth/FirstTimePasswordPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Public Generic Entrance QR Check-In Page
import SelfCheckInPage from './pages/public/SelfCheckInPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import MembersPage from './pages/admin/MembersPage';
import PlansPage from './pages/admin/PlansPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import AttendancePage from './pages/admin/AttendancePage';
import ReportsPage from './pages/admin/ReportsPage';
import SettingsPage from './pages/admin/SettingsPage';

// Member Pages
import MemberDashboardPage from './pages/member/MemberDashboardPage';
import MemberProfilePage from './pages/member/MemberProfilePage';
import MemberAttendancePage from './pages/member/MemberAttendancePage';
import MemberPaymentsPage from './pages/member/MemberPaymentsPage';

// Root redirect handler
const RootRedirect = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-500">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/member/dashboard" replace />;
};

export const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              {/* Root Route */}
              <Route path="/" element={<RootRedirect />} />

              {/* Public Self-Service Attendance Entrance QR Route */}
              <Route path="/check-in" element={<SelfCheckInPage />} />

              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/setup-password" element={<FirstTimePasswordPage />} />
              <Route path="/first-time-setup" element={<FirstTimePasswordPage />} />
              <Route path="/first-time-password" element={<FirstTimePasswordPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Admin Portal (Role: ADMIN) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="members" element={<MembersPage />} />
                <Route path="plans" element={<PlansPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Member Portal (Role: MEMBER) */}
              <Route
                path="/member"
                element={
                  <ProtectedRoute allowedRoles={['MEMBER']}>
                    <MemberLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/member/dashboard" replace />} />
                <Route path="dashboard" element={<MemberDashboardPage />} />
                <Route path="profile" element={<MemberProfilePage />} />
                <Route path="attendance" element={<MemberAttendancePage />} />
                <Route path="payments" element={<MemberPaymentsPage />} />
              </Route>

              {/* Fallback Catch-all */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
