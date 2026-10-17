import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Settings,
  Save,
  CheckCircle2,
  ShieldCheck,
  Dumbbell,
  Upload,
  Image as ImageIcon,
  Trash2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

const settingsSchema = z.object({
  gymName: z.string().min(2, 'Gym name is required').max(100),
  contactEmail: z.string().email('Please enter a valid email'),
  contactPhone: z.string().min(5, 'Phone number is required'),
  address: z.string().min(3, 'Address is required'),
  currency: z.string().min(1).max(5),
  currencySymbol: z.string().min(1).max(5),
  receiptFooter: z.string().optional(),
  logoUrl: z.string().optional()
});

export const SettingsPage = () => {
  const { success: toastSuccess, error: toastError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [previewLogo, setPreviewLogo] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      gymName: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      currency: 'INR',
      currencySymbol: '₹',
      receiptFooter: '',
      logoUrl: ''
    }
  });

  const watchGymName = watch('gymName');
  const watchCurrencySymbol = watch('currencySymbol');
  const watchReceiptFooter = watch('receiptFooter');
  const watchLogoUrl = watch('logoUrl');

  useEffect(() => {
    api.get('/settings')
      .then((res) => {
        if (res.data?.data) {
          const s = res.data.data;
          reset({
            gymName: s.gymName || 'IronPulse Fitness & Gym',
            contactEmail: s.contactEmail || 'contact@ironpulsefitness.com',
            contactPhone: s.contactPhone || '+1 (555) 839-2041',
            address: s.address || '742 Evergreen Fitness Way, Metropolis',
            currency: s.currency || 'INR',
            currencySymbol: s.currencySymbol || '₹',
            receiptFooter: s.receiptFooter || 'Thank you for choosing IronPulse Gym. Strive for greatness!',
            logoUrl: s.logoUrl || ''
          });
          setPreviewLogo(s.logoUrl || '');
          if (s.gymName) {
            document.title = `${s.gymName} - Gym Settings`;
          }
        }
      })
      .catch((err) => toastError('Failed to fetch settings', err.message))
      .finally(() => setIsLoading(false));
  }, [reset, toastError]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toastError('Invalid File', 'Please choose an image file (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toastError('File Too Large', 'Maximum logo size is 5MB');
      return;
    }

    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', 'logos');

    try {
      const res = await api.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const uploadedUrl = res.data?.data?.imageUrl || res.data?.data?.url;
      if (uploadedUrl) {
        setValue('logoUrl', uploadedUrl, { shouldDirty: true });
        setPreviewLogo(uploadedUrl);
        toastSuccess('Logo Uploaded!', 'Logo uploaded successfully. Remember to click "Save Settings".');
      }
    } catch (err) {
      toastError('Logo Upload Failed', err.response?.data?.message || err.message);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setValue('logoUrl', '', { shouldDirty: true });
    setPreviewLogo('');
  };

  const onSubmit = async (data) => {
    try {
      const res = await api.put('/settings', data);
      toastSuccess('Settings Saved!', res.data?.message || 'Gym settings updated successfully');
      if (data.gymName) {
        document.title = `${data.gymName} - Admin Portal`;
      }
      // Reload in a moment or broadcast if desired
      window.dispatchEvent(new Event('gym-settings-updated'));
    } catch (err) {
      toastError('Save Failed', err.response?.data?.message || err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span>Loading gym settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Gym & System Settings</h1>
          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-yellow-400 text-slate-950 rounded uppercase tracking-wider">
            Branding
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure gym profile, upload your custom gym logo, adjust currency, and customize printable receipts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Gym Logo Upload Section */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Official Gym Logo
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-900 overflow-hidden shrink-0 shadow-inner">
                  {previewLogo || watchLogoUrl ? (
                    <img
                      src={previewLogo || watchLogoUrl}
                      alt="Gym Logo"
                      className="w-full h-full object-contain p-1"
                      onError={() => setPreviewLogo('')}
                    />
                  ) : (
                    <Dumbbell className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                  )}
                </div>

                <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingLogo ? 'Uploading...' : 'Upload New Logo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={isUploadingLogo}
                        className="hidden"
                      />
                    </label>

                    {(previewLogo || watchLogoUrl) && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-xl text-xs font-semibold transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    PNG, JPG, or SVG recommended. Logo appears in the header, tab title, and member receipts.
                  </p>
                </div>
              </div>

              {/* Optional Direct URL input */}
              <div className="mt-3">
                <input
                  type="text"
                  {...register('logoUrl')}
                  placeholder="Or paste direct image URL (https://...)"
                  onChange={(e) => setPreviewLogo(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Gym Name *
              </label>
              <input
                type="text"
                {...register('gymName')}
                placeholder="e.g. IronPulse Fitness & Gym"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 font-semibold"
              />
              {errors.gymName && <p className="text-xs text-rose-500 mt-1">{errors.gymName.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Contact Email *
                </label>
                <input
                  type="email"
                  {...register('contactEmail')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                {errors.contactEmail && <p className="text-xs text-rose-500 mt-1">{errors.contactEmail.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  {...register('contactPhone')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
                {errors.contactPhone && <p className="text-xs text-rose-500 mt-1">{errors.contactPhone.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Facility Address *
              </label>
              <input
                type="text"
                {...register('address')}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              {errors.address && <p className="text-xs text-rose-500 mt-1">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Currency Code
                </label>
                <input
                  type="text"
                  {...register('currency')}
                  placeholder="INR"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  {...register('currencySymbol')}
                  placeholder="₹"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Receipt Footer Note
              </label>
              <textarea
                {...register('receiptFooter')}
                rows={2}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving Changes...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Receipt & Branding Preview */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              Live Header Branding
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
              {previewLogo || watchLogoUrl ? (
                <img
                  src={previewLogo || watchLogoUrl}
                  alt="Gym Logo"
                  className="w-11 h-11 object-contain rounded-xl bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 shadow-sm"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center shadow-md">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="min-w-0">
                <p className="font-black text-sm text-slate-900 dark:text-white truncate">
                  {watchGymName || 'Your Gym Name'}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                    Admin Portal Display
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Official Receipt Preview
            </h3>
            <div className="p-5 rounded-xl bg-white text-slate-900 text-xs space-y-3 border border-slate-300 shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
                {previewLogo || watchLogoUrl ? (
                  <img
                    src={previewLogo || watchLogoUrl}
                    alt="Receipt Logo"
                    className="h-10 w-10 object-contain rounded-lg border border-slate-200 p-0.5"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <p className="font-extrabold text-slate-900 text-sm leading-tight">
                    {watchGymName || 'Your Gym Name'}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Official Receipt</p>
                </div>
              </div>

              <div className="flex justify-between font-mono text-[11px] py-1 border-b border-slate-100">
                <span className="text-slate-600">Premium Membership:</span>
                <span className="font-bold text-emerald-700">{watchCurrencySymbol || '₹'}1,499.00</span>
              </div>

              <p className="text-[10px] text-slate-500 italic pt-1">
                "{watchReceiptFooter || 'Thank you for choosing our gym!'}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
