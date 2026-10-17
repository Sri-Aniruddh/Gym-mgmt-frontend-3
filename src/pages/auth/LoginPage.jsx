import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dumbbell, Lock, Mail, ArrowRight, ShieldCheck, KeyRound, QrCode, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { useTheme } from '../../context/ThemeContext';

const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password or one-time credential is required')
});

export const LoginPage = () => {
  const { login } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await login(data.email, data.password);

      if (result.mustChangePassword) {
        toastSuccess('Initial authentication verified!', 'Please set your permanent password to continue.');
        navigate('/first-time-password', { replace: true });
      } else {
        toastSuccess('Welcome back!', 'Signed in successfully.');
        const from = location.state?.from?.pathname;
        if (from) {
          navigate(from, { replace: true });
        } else {
          navigate('/admin/dashboard', { replace: true });
        }
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Invalid email or password';
      toastError('Login Failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 relative overflow-hidden transition-colors">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-yellow-400/10 dark:bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top right theme toggle */}
      <div className="absolute top-5 right-5 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-sm"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>
      </div>

      <div className="w-full max-w-md z-10 py-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-xl shadow-emerald-600/20 mb-3 border-2 border-yellow-400/40">
            <Dumbbell className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Gym Fitness Portal</h1>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-yellow-400 text-slate-950 rounded uppercase tracking-wider">
              PRO
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Gym Management & Member Portal</p>
        </div>

        {/* Generic Entrance QR Shortcut Card */}
        <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-lg">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">Facility QR Check-In</p>
              <p className="text-slate-500 dark:text-slate-400">At the gym entrance? Check in here directly</p>
            </div>
          </div>
          <Link
            to="/check-in"
            className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-bold rounded-lg transition-colors shadow-sm"
          >
            Check In
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-7 shadow-xl shadow-slate-200/50 dark:shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sign In to Your Account</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Admins and Members can sign in with their email and password or one-time invitation code.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
              {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password / One-Time Code
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  {...register('password')}
                  placeholder="Enter password or one-time code"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>
              {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 text-sm mt-6 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Security badge note */}
        <div className="flex items-center justify-center gap-1.5 mt-5 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Protected with HTTP-only tokens, bcrypt, and rate limiting</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
