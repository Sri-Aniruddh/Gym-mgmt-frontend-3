import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  Receipt,
  LogOut,
  Menu,
  X,
  Dumbbell,
  Sun,
  Moon,
  QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import api from '../services/api.js';

export const MemberLayout = () => {
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
            document.title = `${res.data.data.gymName} - Member Portal`;
          }
        }
      })
      .catch(() => {});
  }, []);

  const navItems = [
    { name: 'My Dashboard', path: '/member/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', path: '/member/profile', icon: User },
    { name: 'Attendance History', path: '/member/attendance', icon: CalendarCheck },
    { name: 'Payment Receipts', path: '/member/payments', icon: Receipt }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Navbar */}
      <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 sticky top-0 z-30 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          {/* Gym Branding */}
          <div className="flex items-center gap-3">
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
            <div>
              <h1 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                {gymSettings?.gymName || 'IronPulse Gym'}
              </h1>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
                Member Portal
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Member Profile, Theme Toggle & Logout */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/check-in"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-400/20 text-yellow-900 dark:text-yellow-400 border border-yellow-400/30 text-xs font-bold hover:bg-yellow-400/30 transition-all"
            title="Self-service entrance check-in"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Self Check-In</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {isDark ? <Moon className="w-4 h-4 text-yellow-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>

          <div className="text-right">
            <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name}</p>
            <p className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {user?.memberId || 'Active Member'}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
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
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-1">
          <Link
            to="/check-in"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3.5 py-2 mb-2 rounded-xl bg-yellow-400/20 text-yellow-900 dark:text-yellow-400 text-xs font-bold border border-yellow-400/30"
          >
            <QrCode className="w-4 h-4" />
            <span>Quick Self Check-In</span>
          </Link>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs ${
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

      {/* Main Viewport */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default MemberLayout;
