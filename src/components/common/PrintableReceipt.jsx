import React from 'react';
import { Printer, CheckCircle, ShieldCheck, Dumbbell } from 'lucide-react';

export const PrintableReceipt = ({ payment, settings, onClose }) => {
  const gymName = settings?.gymName || 'IronPulse Fitness & Gym';
  const logoUrl = settings?.logoUrl || '';
  const currencySymbol = settings?.currencySymbol || '₹';
  const receiptFooter = settings?.receiptFooter || 'Thank you for choosing IronPulse Gym. Train hard!';

  const formattedDate = new Date(payment.paymentDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Action buttons (hidden when printing) */}
      <div className="flex justify-end gap-3 no-print">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 text-xs cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl transition-colors text-xs cursor-pointer"
          >
            Close
          </button>
        )}
      </div>

      {/* Printable Sheet */}
      <div
        id="printable-receipt"
        className="bg-white text-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200"
      >
        {/* Receipt Header */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-6">
          <div>
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt={gymName} className="h-12 w-auto max-w-[120px] object-contain rounded-lg" />
              ) : (
                <div className="w-11 h-11 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black shadow-md">
                  <Dumbbell className="w-6 h-6" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">{gymName}</h1>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Official Payment Receipt</p>
              </div>
            </div>
            {settings?.address && <p className="text-xs text-slate-500 mt-2.5">{settings.address}</p>}
            <p className="text-xs text-slate-500">
              {settings?.contactEmail} {settings?.contactPhone ? `| ${settings.contactPhone}` : ''}
            </p>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wide border border-emerald-300">
              <CheckCircle className="w-3.5 h-3.5" />
              Confirmed
            </span>
            <p className="text-xs font-mono font-bold text-slate-600 mt-2">Ref: {payment.transactionReference}</p>
            <p className="text-xs text-slate-500">{formattedDate}</p>
          </div>
        </div>

        {/* Member and Transaction Details */}
        <div className="grid grid-cols-2 gap-6 my-6 text-sm">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billed To Member</p>
            <p className="text-base font-extrabold text-slate-900 mt-1">
              {payment.memberRef?.userId?.name || 'Valued Member'}
            </p>
            <p className="text-xs font-mono font-bold text-emerald-700 mt-0.5">ID: {payment.memberId}</p>
            {payment.memberRef?.phone && <p className="text-xs text-slate-600 mt-1">{payment.memberRef.phone}</p>}
            {payment.memberRef?.userId?.email && <p className="text-xs text-slate-600">{payment.memberRef.userId.email}</p>}
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Particulars</p>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Method:</span>
                <span className="font-bold text-slate-800">{payment.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold text-emerald-600">{payment.status}</span>
              </div>
              {payment.recordedBy?.name && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Authorized by:</span>
                  <span className="font-semibold text-slate-800">{payment.recordedBy.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-center">Duration</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-slate-900">
                  {payment.membershipId?.planId?.name || 'Gym Membership Access'}
                  {payment.notes && <p className="text-[11px] text-slate-500 font-normal mt-0.5">{payment.notes}</p>}
                </td>
                <td className="py-3.5 px-4 text-center font-mono text-xs">
                  {payment.membershipId?.planId?.durationDays ? `${payment.membershipId.planId.durationDays} Days` : 'N/A'}
                </td>
                <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                  {currencySymbol}{Number(payment.amount).toFixed(2)}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-emerald-50/50 border-t-2 border-emerald-500 text-slate-900 font-bold">
              <tr>
                <td colSpan={2} className="py-3 px-4 text-right uppercase text-xs tracking-wider text-slate-600">
                  Total Paid:
                </td>
                <td className="py-3 px-4 text-right text-base text-emerald-700 font-black">
                  {currencySymbol}{Number(payment.amount).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-5 text-center text-xs text-slate-500 space-y-1.5">
          <p className="font-medium text-slate-700 italic">"{receiptFooter}"</p>
          <div className="flex items-center justify-center gap-1.5 text-slate-400 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Electronically verified transaction • Official Gym Record</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableReceipt;
