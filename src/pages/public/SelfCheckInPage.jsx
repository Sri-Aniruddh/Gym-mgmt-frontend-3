import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  QrCode,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sun,
  Moon
} from 'lucide-react';
import api from '../../services/api.js';
import { useTheme } from '../../context/ThemeContext.jsx';

export const SelfCheckInPage = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [searchParams] = useSearchParams();

  const [identifier, setIdentifier] = useState(searchParams.get('id') || '');
  const [verification, setVerification] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [gymSettings, setGymSettings] = useState(null);

  useEffect(() => {
    api.get('/settings')
      .then((res) => {
        if (res.data?.data) {
          setGymSettings(res.data.data);
          if (res.data.data.gymName) {
            document.title = `${res.data.data.gymName} - Facility Check-In`;
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleSelfCheckIn = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !verification.trim()) {
      setErrorMsg('Please enter both your Member ID/Email and phone or password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.post('/attendance/self-check-in', {
        identifier: identifier.trim(),
        verification: verification.trim(),
        notes: notes.trim() || undefined
      });

      if (res.data?.success) {
        setSuccessData(res.data.data);
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Check-in failed. Please verify your details.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setIdentifier('');
    setVerification('');
    setNotes('');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative transition-colors duration-200">
      {/* Theme Toggle Top Right */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Toggle Light / Dark theme"
        >
          {isDark ? <Moon className="w-4 h-4 text-yellow-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Gym Brand Header */}
        <div className="text-center mb-6">
          {gymSettings?.logoUrl ? (
            <img
              src={gymSettings.logoUrl}
              alt="Gym Logo"
              className="h-16 w-auto max-w-[180px] mx-auto object-contain mb-3 rounded-xl border border-slate-200 dark:border-slate-800 p-1 bg-white dark:bg-slate-900 shadow-sm"
            />
          ) : (
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 mb-3">
              <Dumbbell className="w-7 h-7" />
            </div>
          )}
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {gymSettings?.gymName || 'IronPulse Fitness'}
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 text-xs font-bold mt-1.5 uppercase tracking-wider">
            <QrCode className="w-3.5 h-3.5" />
            <span>Facility Entrance Check-In</span>
          </div>
        </div>

        {/* Check-In Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {successData ? (
            /* Success Confirmation Screen */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border-2 border-emerald-500 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Check-In Confirmed!</h2>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  Welcome to workout, {successData.member?.name}!
                </p>
                <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">
                  ID: {successData.member?.memberId}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Timestamp:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {new Date(successData.member?.checkInAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Status:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase">Turnstile Access Granted</span>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition-all shadow-lg shadow-emerald-600/30 cursor-pointer mt-4"
              >
                Check In Another Member
              </button>

              <div className="pt-2">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
                >
                  Go to Member Portal Login
                </Link>
              </div>
            </div>
          ) : (
            /* Check-In Input Form */
            <form onSubmit={handleSelfCheckIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Member ID or Registered Email *
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. GYM-2026-0001 or alex@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-mono uppercase focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Found on your digital member card or welcome email.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Phone Number or Password *
                </label>
                <input
                  type="password"
                  value={verification}
                  onChange={(e) => setVerification(e.target.value)}
                  placeholder="Your registered phone or password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Used to verify your identity before check-in.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Workout Session Note (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Cardio & Weights, Yoga class"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition-all shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50 mt-6"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Confirming check-in...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Check In Now</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Member Card Reminder */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 space-y-1">
            <p>Every gym member has a unique Member ID.</p>
            <Link
              to="/login"
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold inline-block"
            >
              Sign In to Your Member Portal
            </Link>
          </div>
        </div>

        {/* Security badge note */}
        <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Single facility entrance QR verification • Anti-duplicate protected</span>
        </div>
      </div>
    </div>
  );
};

export default SelfCheckInPage;
