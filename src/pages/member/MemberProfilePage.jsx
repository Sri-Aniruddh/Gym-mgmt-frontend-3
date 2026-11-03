import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Phone, MapPin, Lock, Save, ShieldCheck, KeyRound, Copy, Check, Camera, Upload } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import CameraCaptureModal from '../../components/common/CameraCaptureModal';
import AvatarImage from '../../components/common/AvatarImage';

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
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
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
          setProfileImageUrl(mem.profileImageUrl || '');
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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toastError('Invalid File', 'Please select an image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toastError('File Too Large', 'Maximum image size is 5MB.');
      return;
    }

    setIsUploadingPhoto(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'members');

    try {
      const uploadRes = await api.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newImageUrl = uploadRes.data?.data?.imageUrl || uploadRes.data?.data?.url;
      if (newImageUrl) {
        setProfileImageUrl(newImageUrl);
        if (memberDbId) {
          await api.put(`/members/${memberDbId}`, { profileImageUrl: newImageUrl });
          toastSuccess('Photo Updated', 'Your profile picture has been saved to Atlas.');
        }
      }
    } catch (err) {
      toastError('Upload Failed', err.response?.data?.message || err.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCameraCapture = async (dataUri) => {
    setIsUploadingPhoto(true);
    try {
      const uploadRes = await api.post('/uploads/image', { image: dataUri, folder: 'members' });
      const newImageUrl = uploadRes.data?.data?.imageUrl || uploadRes.data?.data?.url;
      if (newImageUrl) {
        setProfileImageUrl(newImageUrl);
        if (memberDbId) {
          await api.put(`/members/${memberDbId}`, { profileImageUrl: newImageUrl });
          toastSuccess('Photo Updated', 'Your profile picture has been saved.');
        }
      }
    } catch (err) {
      toastError('Camera Upload Failed', err.response?.data?.message || err.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const onUpdateProfile = async (data) => {
    if (!memberDbId) return;
    try {
      await api.put(`/members/${memberDbId}`, {
        ...data,
        profileImageUrl: profileImageUrl || undefined
      });
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
    <div className="space-y-6 sm:space-y-8 max-w-4xl">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">My Profile & Security</h1>
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
          <p className="font-mono text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">{memberId || 'MEM-2026'}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Use this Member ID or your email at the entrance QR check-in station.
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Contact & Profile</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Personal contact information</p>
            </div>
          </div>

          {/* Profile Picture Upload Section */}
          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <div className="relative">
              <AvatarImage
                src={profileImageUrl}
                alt="Profile"
                fallbackText={user?.name || 'M'}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
                fallbackClassName="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-sm"
              />
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900 dark:text-white">Profile Photo</p>
              <p className="text-[10px] text-slate-400">Compressed & delivered via Cloudinary CDN</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={() => setIsCameraModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Take Selfie</span>
                </button>
              </div>
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
                placeholder="+1 555-0199"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              {profileErrors.phone && <p className="text-xs text-rose-500 mt-1">{profileErrors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Residential Address *
              </label>
              <input
                type="text"
                {...registerProfile('address')}
                placeholder="Street address, city"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              {profileErrors.address && <p className="text-xs text-rose-500 mt-1">{profileErrors.address.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  {...registerProfile('emergencyContactName')}
                  placeholder="e.g. Spouse, Parent"
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
                  placeholder="Phone number"
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingProfile}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmittingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Security & Password</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Update your access password</p>
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
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
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
                placeholder="Minimum 8 characters"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
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
                placeholder="Re-enter new password"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-indigo-500"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-rose-500 mt-1">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>Passwords are encrypted with bcrypt and never stored in plain text.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmittingPassword}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isSubmittingPassword ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Live Selfie Camera Modal */}
      <CameraCaptureModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCapture}
        title="Take Profile Selfie"
      />
    </div>
  );
};

export default MemberProfilePage;
