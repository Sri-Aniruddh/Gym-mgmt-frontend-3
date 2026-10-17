import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Dumbbell,
  CalendarCheck,
  CreditCard,
  Clock,
  Printer,
  ShieldCheck,
  User,
  QrCode,
  ArrowRight,
  AlertTriangle,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import PrintableReceipt from '../../components/common/PrintableReceipt';
import { useToast } from '../../components/common/Toast';

export const MemberDashboardPage = () => {
  const { success: toastSuccess } = useToast();
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/member'),
      api.get('/settings')
    ])
      .then(([dashRes, settingsRes]) => {
        if (dashRes.data?.data) {
          setData(dashRes.data.data);
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

  const copyMemberId = () => {
    if (!data?.member?.memberId) return;
    navigator.clipboard.writeText(data.member.memberId);
    setCopiedId(true);
    toastSuccess('Member ID Copied!', `Copied ${data.member.memberId} to clipboard.`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const { member, membership, stats, recentAttendance, recentPayments, welcomeMessage } = data;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Member Portal
            </span>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-yellow-400 text-slate-950 rounded uppercase tracking-wider">
              Active Member
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{welcomeMessage}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track your workout consistency, membership validity, and entrance check-in ID.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            to="/check-in"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-extrabold rounded-xl text-xs shadow-sm transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Facility Self Check-In</span>
          </Link>

          <Link
            to="/member/profile"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all"
          >
            <User className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      {/* Entrance Check-In Instructions Card */}
      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-900 dark:text-white">
              Gym Entrance Attendance (Single Facility QR)
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Scan the QR sign at the front desk and enter your <strong>Member ID</strong> or <strong>Email</strong> with your phone number/password.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono font-bold px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-emerald-600 dark:text-emerald-400">
            {member.memberId}
          </span>
          <button
            onClick={copyMemberId}
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 rounded-xl text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            title="Copy Member ID"
          >
            {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Grid: Digital Pass & Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Digital Membership Pass Card */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-xl shadow-emerald-600/20 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Dumbbell className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-xs uppercase tracking-wider text-emerald-100">Digital Pass</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-yellow-400 text-slate-950">
                {membership?.status || member.status}
              </span>
            </div>

            <div className="mt-6">
              <p className="text-[10px] font-extrabold text-emerald-200 uppercase tracking-wider">Member Name</p>
              <h2 className="text-2xl font-black text-white tracking-tight">{member.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-sm text-yellow-300 font-black">{member.memberId}</span>
                <button
                  onClick={copyMemberId}
                  className="p-1 rounded bg-white/20 hover:bg-white/30 text-white text-xs"
                  title="Copy ID"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/20">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] text-emerald-200 uppercase tracking-wider">Current Plan</p>
                <p className="text-sm font-extrabold text-white">{membership?.planName || 'No Active Plan'}</p>
                {membership?.endDate && (
                  <p className="text-[11px] text-emerald-100 mt-0.5">
                    Valid until: {new Date(membership.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div className="p-2 bg-white rounded-xl text-slate-900 shadow-md">
                <QrCode className="w-7 h-7 text-slate-900" />
              </div>
            </div>
          </div>
        </div>

        {/* Expiration & Subscription Summary */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Membership Validity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Countdown to next renewal</p>

            <div className="mt-6">
              {membership ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                      {membership.daysRemaining}
                    </span>
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">days remaining</span>
                  </div>

                  {membership.isExpiringSoon && (
                    <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                      <span>Your membership expires soon! Speak with gym staff to renew.</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-500 italic">No current membership subscription active.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Status:</span>
            <Badge status={membership?.status || 'INACTIVE'} />
          </div>
        </div>

        {/* Attendance Stats Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Workout Attendance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Track your gym consistency</p>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  This Month
                </span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {stats.visitsThisMonth}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Check-ins</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  All-Time
                </span>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.totalVisitsAllTime}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Total sessions</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/member/attendance"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-between"
            >
              <span>View full visit history</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Visits & Payment Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Recent Check-Ins</h3>
            <Link
              to="/member/attendance"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase text-[11px]">
                <tr>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Check-In</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {recentAttendance.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">{a.dateString}</td>
                    <td className="py-3 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      {new Date(a.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 text-right">
                      <Badge status={a.status} />
                    </td>
                  </tr>
                ))}
                {recentAttendance.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400 italic">
                      No visits recorded yet. Scan the entrance QR when you arrive!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Recent Payments</h3>
            <Link
              to="/member/payments"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase text-[11px]">
                <tr>
                  <th className="pb-3">Reference</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {recentPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {p.transactionReference.length > 14
                        ? `${p.transactionReference.slice(0, 14)}...`
                        : p.transactionReference}
                    </td>
                    <td className="py-3">{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400">{currencySymbol}{p.amount.toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {recentPayments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                      No payment history recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      <Modal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        title="Payment Receipt"
        maxWidth="max-w-2xl"
      >
        {selectedReceipt && (
          <PrintableReceipt
            payment={selectedReceipt}
            settings={settings}
            onClose={() => setSelectedReceipt(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default MemberDashboardPage;
