import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Printer,
  Calendar,
  CheckCircle,
  FileText,
  IndianRupee,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import PrintableReceipt from '../../components/common/PrintableReceipt';
import MemberSearchSelect from '../../components/common/MemberSearchSelect';
import { useToast } from '../../components/common/Toast';

const paymentSchema = z.object({
  memberId: z.string().min(1, 'Please enter or select a Member ID'),
  planId: z.string().optional(),
  amount: z.number().positive('Amount must be greater than 0'),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'NET_BANKING', 'OTHER']).default('CASH'),
  transactionReference: z.string().optional(),
  paymentDate: z.string().optional(),
  sendReceiptEmail: z.boolean().default(true),
  notes: z.string().optional()
});

export const PaymentsPage = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [payments, setPayments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [gymSettings, setGymSettings] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedPaymentMember, setSelectedPaymentMember] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: 'CASH',
      sendReceiptEmail: true,
      paymentDate: new Date().toISOString().split('T')[0]
    }
  });

  const fetchPayments = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (methodFilter) params.paymentMethod = methodFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/payments', { params });
      if (res.data?.success) {
        setPayments(res.data.data);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      toastError('Failed to fetch payments', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [search, methodFilter, startDate, endDate, toastError]);

  useEffect(() => {
    api.get('/settings')
      .then((res) => {
        if (res.data?.data) setGymSettings(res.data.data);
      })
      .catch(() => {});

    api.get('/membership-plans')
      .then((res) => {
        if (res.data?.data) setPlans(res.data.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchPayments]);

  const onRecordPaymentSubmit = async (data) => {
    const memberId = data.memberId || selectedPaymentMember?.memberId;
    if (!memberId) {
      toastError('Missing Member', 'Please search and select a member.');
      return;
    }

    try {
      const res = await api.post('/payments', {
        ...data,
        memberId,
        planId: selectedPlanId || undefined
      });
      toastSuccess('Payment Recorded', res.data?.message || 'Payment added successfully');
      setIsRecordModalOpen(false);
      setSelectedPaymentMember(null);
      setSelectedPlanId('');
      reset();
      fetchPayments(1);

      if (res.data?.data) {
        setSelectedReceiptPayment(res.data.data);
      }
    } catch (err) {
      toastError('Payment Failed', err.response?.data?.message || err.message);
    }
  };

  const currencySymbol = gymSettings?.currencySymbol || '₹';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Payment Ledger</h1>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-yellow-400 text-slate-950 rounded uppercase tracking-wider">
              Finances
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track transactions, receipts, cash/UPI records, and member invoices.
          </p>
        </div>

        <button
          onClick={() => {
            reset({
              paymentMethod: 'CASH',
              sendReceiptEmail: true,
              paymentDate: new Date().toISOString().split('T')[0]
            });
            setIsRecordModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* Filter and Date Range Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference or member ID..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500 font-medium"
          >
            <option value="">All Payment Methods</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Debit / Credit Card</option>
            <option value="NET_BANKING">Net Banking</option>
            <option value="OTHER">Other</option>
          </select>

          {/* Date range inputs */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
            title="Start date"
          />
          <span className="text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:border-emerald-500"
            title="End date"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Transaction Ref</th>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="py-4 px-4">
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                    No payment records found
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Transaction Reference */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {p.transactionReference}
                    </td>

                    {/* Member */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">
                        {p.memberRef?.userId?.name || 'Gym Member'}
                      </p>
                      <p className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">{p.memberId}</p>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </td>

                    {/* Method */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold text-[11px] text-slate-700 dark:text-slate-300">
                        {p.paymentMethod}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-black text-sm text-emerald-600 dark:text-emerald-400">
                      {currencySymbol}{p.amount.toFixed(2)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge status={p.status} />
                    </td>

                    {/* Print Receipt Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceiptPayment(p)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        title="View & Print Official Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing {payments.length} of {pagination.total} transactions
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchPayments(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-slate-900 dark:text-white rounded-lg cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-900 dark:text-white px-2">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => fetchPayments(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-slate-900 dark:text-white rounded-lg cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Member Payment"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit(onRecordPaymentSubmit)} className="space-y-4">
          <MemberSearchSelect
            selectedMember={selectedPaymentMember}
            onSelectMember={(m) => {
              setSelectedPaymentMember(m);
              setValue('memberId', m.memberId, { shouldValidate: true });
            }}
            onClear={() => {
              setSelectedPaymentMember(null);
              setValue('memberId', '', { shouldValidate: true });
            }}
            error={errors.memberId?.message}
            placeholder="Type member name, email, phone, or Member ID..."
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Select Membership Plan (Auto-fills Amount)
            </label>
            <select
              value={selectedPlanId}
              onChange={(e) => {
                const id = e.target.value;
                setSelectedPlanId(id);
                const p = plans.find((plan) => plan._id === id);
                if (p) {
                  setValue('planId', p._id);
                  setValue('amount', p.price, { shouldValidate: true });
                } else {
                  setValue('planId', '');
                }
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="">-- Choose Plan from Dropdown (or enter custom amount below) --</option>
              {plans.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} — {currencySymbol}{p.price} ({p.durationDays} Days access)
                </option>
              ))}
            </select>
            {selectedPlanId && (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-bold">
                ✓ Recording this payment will activate / renew this membership plan for this member.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Amount ({currencySymbol}) *
              </label>
              <input
                type="number"
                step="any"
                {...register('amount', { valueAsNumber: true })}
                placeholder="1499"
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 font-bold"
              />
              {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Payment Method *
              </label>
              <select
                {...register('paymentMethod')}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Debit / Credit Card</option>
                <option value="NET_BANKING">Net Banking</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Custom Transaction Reference (Optional)
            </label>
            <input
              type="text"
              {...register('transactionReference')}
              placeholder="Auto-generated if left blank"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Notes
            </label>
            <input
              type="text"
              {...register('notes')}
              placeholder="e.g. Annual membership renewal payment"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="sendReceiptEmail"
              {...register('sendReceiptEmail')}
              className="w-4 h-4 rounded text-emerald-600 bg-white border-slate-300"
            />
            <label htmlFor="sendReceiptEmail" className="text-xs text-slate-600 dark:text-slate-300">
              Send electronic receipt email to member
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* PRINTABLE RECEIPT MODAL */}
      <Modal
        isOpen={Boolean(selectedReceiptPayment)}
        onClose={() => setSelectedReceiptPayment(null)}
        title="Official Payment Receipt"
        maxWidth="max-w-2xl"
      >
        {selectedReceiptPayment && (
          <PrintableReceipt
            payment={selectedReceiptPayment}
            settings={gymSettings || undefined}
            onClose={() => setSelectedReceiptPayment(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default PaymentsPage;
