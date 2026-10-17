import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ShieldAlert,
  Lock,
  CheckCircle2,
  Sun,
  Moon,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Loader2
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { useTheme } from '../../context/ThemeContext';

const firstTimeSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().min(8, 'Please confirm your password')
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  });

export const FirstTimePasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const { submitFirstTimePassword } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(Boolean(token));
  const [tokenError, setTokenError] = useState('');
  const [memberInfo, setMemberInfo] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(firstTimeSchema)
  });

  // If opened with an invitation token in URL, verify it against the backend
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const verifyToken = async () => {
      setVerifyingToken(true);
      setTokenError('');
      try {
        const res = await api.get('/auth/verify-invitation', {
          params: { token }
        });
        if (isMounted) {
          setMemberInfo(res.data?.data || null);
        }
      } catch (err) {
        if (isMounted) {
          setTokenError(
            err.response?.data?.message ||
              'This invitation link is invalid, expired, or has already been used. Please request a new invitation.'
          );
        }
      } finally {
        if (isMounted) {
          setVerifyingToken(false);
        }
      }
    };

    verifyToken();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (token) {
        // Direct invitation token setup flow
        await api.post('/auth/setup-password', {
          token,
          newPassword: data.newPassword
        });
        toastSuccess('Password Created!', 'Your account is activated. Please sign in with your email and new password.');
        navigate('/login', { replace: true });
      } else {
        // Logged-in one-time credential session flow
        await submitFirstTimePassword(data.newPassword);
        toastSuccess('Account Activated!', 'Your permanent password has been set. Welcome to the gym!');
        navigate('/member/dashboard', { replace: true });
      }
    } catch (err) {
      toastError('Activation Failed', err.response?.data?.message || err.message || 'Could not set password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 relative transition-colors">
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

      <div className="w-full max-w-md">
        {/* Token Verification Loading State */}
        {verifyingToken && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Verifying Invitation Link...</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Please wait while we validate your secure activation link.
            </p>
          </div>
        )}

        {/* Token Verification Error State */}
        {!verifyingToken && tokenError && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 mb-4 border border-rose-500/30">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Invitation Link Expired or Invalid</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-xs mx-auto">
              {tokenError}
            </p>
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 text-left">
              <p className="font-semibold text-slate-700 dark:text-slate-200 mb-1">What can you do?</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>If you already set your password, sign in to your portal.</li>
                <li>If the link expired (valid for 24h), ask the gym to resend your invite.</li>
              </ul>
            </div>
            <div className="mt-6 flex justify-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-600/20"
              >
                Go to Sign In <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Form State */}
        {!verifyingToken && !tokenError && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-3 border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {memberInfo?.name ? `Welcome, ${memberInfo.name}!` : 'Set Up Your Password'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                {memberInfo?.email ? (
                  <span>
                    Setting up password for <strong className="text-slate-700 dark:text-slate-200">{memberInfo.email}</strong>
                    {memberInfo.memberId && ` (ID: ${memberInfo.memberId})`}
                  </span>
                ) : (
                  'Choose your personal secure password to activate your member account.'
                )}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-7 shadow-xl shadow-slate-200/50 dark:shadow-2xl border border-slate-200 dark:border-slate-800">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    New Permanent Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      {...register('newPassword')}
                      placeholder="At least 8 characters"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  {errors.newPassword && <p className="text-xs text-rose-500 mt-1">{errors.newPassword.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      {...register('confirmPassword')}
                      placeholder="Repeat your password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-rose-500 mt-1">{errors.confirmPassword.message}</p>}
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Security Checklist:
                  </p>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-1">
                    <li>Minimum 8 characters</li>
                    <li>Invitation link will be marked used immediately</li>
                    <li>You will be able to log in anytime with this password</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Password...' : 'Save Password & Activate Account'}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FirstTimePasswordPage;
