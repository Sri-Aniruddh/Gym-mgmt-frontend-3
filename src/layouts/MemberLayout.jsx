import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link, useLocation } from 'react-router-dom';
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
  QrCode,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import api from '../services/api.js';

export const MemberLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gymSettings, setGymSettings] = useState(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

  const gymDisplayName = gymSettings?.gymName || 'Ashifitness Gym';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Navbar */}
      <header className="h-16 md:h-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 sticky top-0 z-40 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Gym Branding */}
          <div className="flex items-center gap-2.5">
            {gymSettings?.logoUrl ? (
              <img
                src={gymSettings.logoUrl}
                alt="Ashifitness Logo"
                className="h-8 w-8 md:h-10 md:w-10 object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5"
              />
            ) : (
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-600/25">
                <Dumbbell className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
            )}
            <div>
              <h1 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-none">
                {gymDisplayName}
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
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-bold'
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

        {/* Desktop Profile & Logout */}
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

        {/* Mobile Header Actions */}
        <div className="flex md:hidden items-center gap-1.5">
          <Link
            to="/check-in"
            className="p-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-400/10 rounded-xl"
            title="Open Entrance QR"
          >
            <QrCode className="w-5 h-5" />
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            title="Toggle Theme"
          >
            {isDark ? <Moon className="w-4 h-4 text-yellow-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            aria-label="Open mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Full Slide-In Drawer with Backdrop */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 border-r border-slate-200 dark:border-slate-800">
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-black uppercase text-slate-900 dark:text-white truncate max-w-[150px]">
                    {gymDisplayName}
                  </h2>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                    Member
                  </span>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3">
              <Link
                to="/check-in"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl bg-yellow-400/20 text-yellow-900 dark:text-yellow-400 text-xs font-bold border border-yellow-400/30"
              >
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  <span>Self Check-In Station</span>
                </div>
                <span className="text-[10px] bg-yellow-400 text-slate-950 px-1.5 py-0.5 rounded font-black uppercase">Live</span>
              </Link>
            </div>

            <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
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

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <div className="mb-3">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {user?.memberId || 'Active Member'}
                </p>
              </div>
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

      {/* Main Viewport */}
      <main className="flex-1 p-3 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 flex items-center justify-around py-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-bold ${
                  isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="truncate max-w-[64px]">{item.name.replace('My ', '')}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default MemberLayout;
