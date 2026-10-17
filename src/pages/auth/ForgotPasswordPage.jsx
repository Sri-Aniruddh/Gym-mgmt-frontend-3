import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim()
});

export const ForgotPasswordPage = () => {
  const { error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(forgotSchema)
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setIsDispatched(true);
    } catch (err) {
      toastError('Request Failed', err.response?.data?.message || 'Could not process request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 relative transition-colors">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-2xl border border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reset Your Password</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
            Enter your registered email address and we'll dispatch a secure reset link.
          </p>

          {isDispatched ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/30 rounded-xl p-5 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Instructions Dispatched</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                If an account exists with that email address, you will receive a password reset link shortly.
              </p>
              <Link
                to="/login"
                className="mt-4 inline-block text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sending reset link...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Password Reset Link</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
