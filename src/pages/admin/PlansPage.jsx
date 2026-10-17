import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Award, Plus, Edit2, CheckCircle2, Power, Clock, IndianRupee } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';

const planSchema = z.object({
  name: z.string().min(2, 'Plan name is required').max(100),
  durationDays: z.number().int().min(1, 'Duration must be at least 1 day'),
  price: z.number().min(0, 'Price cannot be negative'),
  description: z.string().optional().default(''),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE')
});

export const PlansPage = () => {
  const { success: toastSuccess, error: toastError } = useToast();
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: {
      status: 'ACTIVE'
    }
  });

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const [plansRes, settingsRes] = await Promise.all([
        api.get('/membership-plans'),
        api.get('/settings')
      ]);
      if (plansRes.data?.data) {
        setPlans(plansRes.data.data);
      }
      if (settingsRes.data?.data?.currencySymbol) {
        setCurrencySymbol(settingsRes.data.data.currencySymbol);
      }
    } catch (err) {
      toastError('Failed to load plans', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    reset({
      name: '',
      durationDays: 30,
      price: 1499,
      description: '',
      status: 'ACTIVE'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    reset({
      name: plan.name,
      durationDays: plan.durationDays,
      price: plan.price,
      description: plan.description || '',
      status: plan.status
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingPlan) {
        await api.put(`/membership-plans/${editingPlan._id}`, data);
        toastSuccess('Plan Updated', `Successfully updated ${data.name}`);
      } else {
        await api.post('/membership-plans', data);
        toastSuccess('Plan Created', `Successfully added ${data.name}`);
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (err) {
      toastError('Failed to save plan', err.response?.data?.message || err.message);
    }
  };

  const togglePlanStatus = async (plan) => {
    try {
      await api.patch(`/membership-plans/${plan._id}/status`);
      toastSuccess('Status Changed', `Plan marked as ${plan.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'}`);
      fetchPlans();
    } catch (err) {
      toastError('Action failed', err.response?.data?.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Membership Plans</h1>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-yellow-400 text-slate-950 rounded uppercase tracking-wider">
              Packages
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure flexible pricing, duration intervals, and package privileges.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />
          ))
        ) : plans.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 italic">
            No membership plans found. Click "Create New Plan" to add one.
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan._id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border shadow-sm flex flex-col justify-between transition-all duration-300 hover:translate-y-[-2px] ${
                plan.status === 'ACTIVE'
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-slate-200 dark:border-slate-800/40 opacity-70'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                    <Award className="w-5 h-5" />
                  </div>
                  <Badge status={plan.status} />
                </div>

                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{plan.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                  {plan.description || 'Full access to gym facilities and equipment.'}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">
                      {currencySymbol}{plan.price}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">/ {plan.durationDays} days</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>Duration: {plan.durationDays} calendar days</span>
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => openEditModal(plan)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Plan</span>
                </button>

                <button
                  onClick={() => togglePlanStatus(plan)}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    plan.status === 'ACTIVE'
                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/40'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800/40'
                  }`}
                  title={plan.status === 'ACTIVE' ? 'Deactivate Plan' : 'Activate Plan'}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT PLAN MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create New Membership Plan'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Plan Name *
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Quarterly Pro"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 font-semibold"
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Duration (Days) *
              </label>
              <input
                type="number"
                {...register('durationDays', { valueAsNumber: true })}
                placeholder="30"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              {errors.durationDays && <p className="text-xs text-rose-500 mt-1">{errors.durationDays.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Price ({currencySymbol}) *
              </label>
              <input
                type="number"
                step="any"
                {...register('price', { valueAsNumber: true })}
                placeholder="1499"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 font-bold"
              />
              {errors.price && <p className="text-xs text-rose-500 mt-1">{errors.price.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Features, group classes access, locker facilities..."
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingPlan ? 'Save Changes' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PlansPage;
