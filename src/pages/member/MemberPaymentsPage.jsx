import React, { useState, useEffect } from 'react';
import { CreditCard, Printer, FileText, Calendar } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import PrintableReceipt from '../../components/common/PrintableReceipt';

export const MemberPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [settings, setSettings] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/payments'),
      api.get('/settings')
    ])
      .then(([payRes, settingsRes]) => {
        if (payRes.data?.data) {
          setPayments(payRes.data.data);
        }
        if (settingsRes.data?.data) {
          setSettings(settingsRes.data.data);
          if (settingsRes.data.data.currencySymbol) {
            setCurrencySymbol(settingsRes.data.data.currencySymbol);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">My Payment Receipts</h1>
          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-yellow-400 text-slate-950 rounded uppercase tracking-wider">
            Invoices
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Access and print official invoices and receipts for all your membership transactions.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Receipt Reference</th>
                <th className="py-3.5 px-4">Payment Date</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-4 px-4">
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                    No payment receipts found on record
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {p.transactionReference}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-sm text-emerald-600 dark:text-emerald-400">
                      {currencySymbol}{p.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={p.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                        title="View Official Receipt"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View (md:hidden) */}
        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="p-4 space-y-2">
                <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-1/2" />
              </div>
            ))
          ) : payments.length === 0 ? (
            <div className="p-8 text-center text-slate-400 italic text-xs">
              No payment receipts found on record
            </div>
          ) : (
            payments.map((p) => (
              <div key={p._id} className="p-4 space-y-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[160px]">
                      {p.transactionReference}
                    </span>
                    <span className="text-[10px] text-slate-500">{new Date(p.paymentDate).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                      {currencySymbol}{p.amount.toFixed(2)}
                    </p>
                    <Badge status={p.status} />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl">
                  <span>Method: <strong className="text-slate-700 dark:text-slate-200">{p.paymentMethod}</strong></span>
                  <button
                    onClick={() => setSelectedReceipt(p)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          title={`Receipt: ${selectedReceipt.transactionReference}`}
          maxWidth="max-w-2xl"
        >
          <PrintableReceipt
            payment={selectedReceipt}
            settings={settings}
            onClose={() => setSelectedReceipt(null)}
          />
        </Modal>
      )}
    </div>
  );
};

export default MemberPaymentsPage;
