import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Phone, MapPin, Lock, Save, ShieldCheck, KeyRound, Copy, Check } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';

const profileSchema = z.object({
  phone: z.string().min(7, 'Phone number must be at least 7 characters'),
  address: z.string().min(3, 'Address is required'),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']).optional()
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your new password')
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword']
  });

export const MemberProfilePage = () => {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const [memberId, setMemberId] = useState('');
  const [memberDbId, setMemberDbId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: isSubmittingProfile }
  } = useForm({
    resolver: zodResolver(profileSchema)
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isSubmittingPassword }
  } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => {
        const mem = res.data?.data?.member;
        if (mem) {
          setMemberId(mem.memberId);
          setMemberDbId(mem._id);
          resetProfile({
            phone: mem.phone || '',
            address: mem.address || '',
            emergencyContactName: mem.emergencyContact?.name || '',
            emergencyContactPhone: mem.emergencyContact?.phone || '',
            gender: mem.gender || 'PREFER_NOT_TO_SAY'
          });
        }
      })
      .catch((err) => toastError('Failed to load profile', err.message))
      .finally(() => setIsLoading(false));
  }, [resetProfile, toastError]);

  const copyMemberId = () => {
    if (!memberId) return;
    navigator.clipboard.writeText(memberId);
    setCopiedId(true);
    toastSuccess('Member ID Copied', `Copied ${memberId}`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const onUpdateProfile = async (data) => {
    if (!memberDbId) return;
    try {
      await api.put(`/members/${memberDbId}`, data);
      toastSuccess('Profile Updated', 'Your profile details have been saved.');
    } catch (err) {
      toastError('Update Failed', err.response?.data?.message || err.message);
    }
  };

  const onChangePassword = async (data) => {
    try {
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toastSuccess('Password Changed', 'Your account password has been updated.');
      resetPassword();
    } catch (err) {
      toastError('Password Change Failed', err.response?.data?.message || err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span>Loading member profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">My Profile & Security</h1>
          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-600 text-white rounded uppercase tracking-wider">
            Account Details
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details, entrance check-in credentials, and account password.
        </p>
      </div>

      {/* Member Entrance ID Card */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Your Entrance Check-In ID
          </span>
          <p className="font-mono text-lg font-black text-slate-900 dark:text-white mt-0.5">{memberId || 'MEM-2026'}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Use this Member ID or your email at the entrance QR scan station.
          </p>
        </div>
        <button
          onClick={copyMemberId}
          className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-50 transition-colors shadow-sm"
        >
          {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          <span>{copiedId ? 'Copied!' : 'Copy ID'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Details Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Contact & Profile</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Personal contact information</p>
            </div>
          </div>

          <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Full Name (Read-Only)
              </label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 text-xs cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Email Address (Read-Only)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 text-xs cursor-not-allowed font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                {...registerProfile('phone')}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 font-medium"
              />
              {profileErrors.phone && <p className="text-xs text-rose-500 mt-1">{profileErrors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Street Address *
              </label>
              <input
                type="text"
                {...registerProfile('address')}
                placeholder="123 Main St, City"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 font-medium"
              />
              {profileErrors.address && <p className="text-xs text-rose-500 mt-1">{profileErrors.address.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  {...registerProfile('emergencyContactName')}
                  placeholder="Contact Name"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Emergency Phone
                </label>
                <input
                  type="tel"
                  {...registerProfile('emergencyContactPhone')}
                  placeholder="Contact Phone"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmittingProfile}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmittingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-yellow-400/15 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Security & Password</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update your account credentials</p>
              </div>
            </div>

            <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  {...registerPassword('currentPassword')}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                {passwordErrors.currentPassword && (
                  <p className="text-xs text-rose-500 mt-1">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  {...registerPassword('newPassword')}
                  placeholder="At least 8 characters"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                {passwordErrors.newPassword && (
                  <p className="text-xs text-rose-500 mt-1">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  {...registerPassword('confirmPassword')}
                  placeholder="Confirm new password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-xs text-rose-500 mt-1">{passwordErrors.confirmPassword.message}</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isSubmittingPassword ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>End-to-end encrypted with salted bcrypt hashing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfilePage;
