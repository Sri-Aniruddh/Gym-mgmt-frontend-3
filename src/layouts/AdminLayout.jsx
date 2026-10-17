import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
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
  QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import api from '../services/api.js';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gymSettings, setGymSettings] = useState(null);

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 shrink-0 select-none shadow-sm">
        {/* Brand Header */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md">
          {gymSettings?.logoUrl ? (
            <img
              src={gymSettings.logoUrl}
              alt="Gym Logo"
              className="h-10 w-10 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/25">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 dark:text-white truncate">
              {gymSettings?.gymName || 'IronPulse Gym'}
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
        {/* Mobile Topbar */}
        <header className="lg:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {gymSettings?.logoUrl ? (
              <img src={gymSettings.logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded-lg" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate max-w-[160px]">
              {gymSettings?.gymName || 'IronPulse'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              title="Toggle theme"
            >
              {isDark ? <Moon className="w-4 h-4 text-yellow-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-1 z-40">
            <Link
              to="/check-in"
              target="_blank"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3.5 py-2.5 mb-2 rounded-xl bg-yellow-400/20 text-yellow-900 dark:text-yellow-400 text-xs font-bold border border-yellow-400/30"
            >
              <QrCode className="w-4 h-4" />
              <span>Open Member Entrance QR Check-In</span>
            </Link>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 text-xs font-bold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
