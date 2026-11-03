import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/common/Toast';
import ProtectedRoute from './components/routing/ProtectedRoute';

// Layouts (loaded upfront for instant frame render)
import AdminLayout from './layouts/AdminLayout';
import MemberLayout from './layouts/MemberLayout';

// Lazy-loaded Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const FirstTimePasswordPage = lazy(() => import('./pages/auth/FirstTimePasswordPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

// Lazy-loaded Public Self-Service Attendance Entrance QR Page
const SelfCheckInPage = lazy(() => import('./pages/public/SelfCheckInPage'));

// Lazy-loaded Admin Pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const MembersPage = lazy(() => import('./pages/admin/MembersPage'));
const PlansPage = lazy(() => import('./pages/admin/PlansPage'));
const PaymentsPage = lazy(() => import('./pages/admin/PaymentsPage'));
const AttendancePage = lazy(() => import('./pages/admin/AttendancePage'));
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));

// Lazy-loaded Member Pages
const MemberDashboardPage = lazy(() => import('./pages/member/MemberDashboardPage'));
const MemberProfilePage = lazy(() => import('./pages/member/MemberProfilePage'));
const MemberAttendancePage = lazy(() => import('./pages/member/MemberAttendancePage'));
const MemberPaymentsPage = lazy(() => import('./pages/member/MemberPaymentsPage'));

// Lightweight Page Loading Skeleton
const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-slate-400">
    <div className="w-8 h-8 border-3 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-3 animate-pulse">
      Loading...
    </span>
  </div>
);

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
            <Suspense fallback={<PageLoader />}>
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
            </Suspense>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
