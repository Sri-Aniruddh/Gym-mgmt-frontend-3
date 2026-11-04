import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarCheck,
  Award,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Dumbbell,
  ChevronRight,
  Sun,
  Moon,
  QrCode,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import api from '../services/api.js';
import { AdminChangePasswordModal } from '../components/common/AdminChangePasswordModal.jsx';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gymSettings, setGymSettings] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    api.get('/settings')
      .then((res) => {
        if (res.data?.data) {
          setGymSettings(res.data.data);
          if (res.data.data.gymName) {
            document.title = `${res.data.data.gymName} - Admin Portal`;
          }
        }
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Members', path: '/admin/members', icon: Users },
    { name: 'Membership Plans', path: '/admin/plans', icon: Award },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Attendance', path: '/admin/attendance', icon: CalendarCheck },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const gymDisplayName = gymSettings?.gymName || 'Ashifitness Gym';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 shrink-0 select-none shadow-sm">
        {/* Brand Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md">
          {gymSettings?.logoUrl ? (
            <img
              src={gymSettings.logoUrl}
              alt="Ashifitness Logo"
              className="h-10 w-10 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-600/25">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white truncate">
              {gymDisplayName}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 tracking-wider uppercase">
                Admin Panel
              </span>
            </div>
          </div>
        </div>

        {/* Generic Facility QR Check-in Quick Button */}
        <div className="px-4 pt-4">
          <Link
            to="/check-in"
            target="_blank"
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-yellow-400/15 hover:bg-yellow-400/25 border border-yellow-500/30 text-yellow-800 dark:text-yellow-400 text-xs font-bold transition-all"
            title="Open Member Entrance QR Scan & Check-in Page"
          >
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              <span>Entrance Check-In QR</span>
            </div>
            <span className="text-[10px] bg-yellow-400 text-slate-950 px-1.5 py-0.2 rounded font-black uppercase">Live</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all duration-200 group ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Theme Switch & User Card */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
          {/* Light / Dark Mode Toggle */}
          <div className="flex items-center justify-between mb-3 p-2 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Theme</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
              title="Toggle Light / Dark mode"
            >
              {isDark ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 font-black flex items-center justify-center text-xs border border-emerald-500/20">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPasswordModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-2 transition-all cursor-pointer shadow-sm"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Update Password</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Sticky Topbar */}
        <header className="lg:hidden sticky top-0 z-40 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            {gymSettings?.logoUrl ? (
              <img src={gymSettings.logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded-lg border border-slate-200 dark:border-slate-700" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-sm">
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate block max-w-[150px]">
                {gymDisplayName}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block">
                Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Link
              to="/check-in"
              target="_blank"
              className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-400/10 rounded-xl"
              title="Open Entrance QR"
            >
              <QrCode className="w-5 h-5" />
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Moon className="w-4 h-4 text-yellow-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Mobile Full Slide-In Drawer with Backdrop */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Dark Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sliding Drawer Container */}
            <div className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-200">
              {/* Drawer Header */}
              <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-black uppercase text-slate-900 dark:text-white truncate max-w-[150px]">
                      {gymDisplayName}
                    </h2>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                      Admin Panel
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Quick Entrance QR Link */}
              <div className="p-3">
                <Link
                  to="/check-in"
                  target="_blank"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl bg-yellow-400/15 border border-yellow-500/30 text-yellow-800 dark:text-yellow-400 text-xs font-bold"
                >
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <span>Entrance Check-In QR</span>
                  </div>
                  <span className="text-[10px] bg-yellow-400 text-slate-950 px-1.5 py-0.5 rounded font-black uppercase">Live</span>
                </Link>
              </div>

              {/* Drawer Nav Items */}
              <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            <span>{item.name}</span>
                          </div>
                          {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              {/* Drawer Footer with User & Logout */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 font-black flex items-center justify-center text-xs border border-emerald-500/20">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsPasswordModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-2 transition-all cursor-pointer shadow-sm"
                >
                  <KeyRound className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Update Password</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Change Password Modal */}
        <AdminChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-20 lg:pb-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Quick-Access Bar */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-2 px-1">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
                isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/members"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
                isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span>Members</span>
          </NavLink>

          <NavLink
            to="/admin/payments"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
                isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <CreditCard className="w-4 h-4 mb-0.5" />
            <span>Payments</span>
          </NavLink>

          <NavLink
            to="/admin/attendance"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
                isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
              }`
            }
          >
            <CalendarCheck className="w-4 h-4 mb-0.5" />
            <span>Attendance</span>
          </NavLink>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400"
          >
            <Menu className="w-4 h-4 mb-0.5" />
            <span>More</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
