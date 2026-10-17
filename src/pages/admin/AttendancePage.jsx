import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CalendarCheck,
  UserCheck,
  Search,
  Clock,
  LogOut,
  AlertCircle,
  Plus,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  QrCode,
  Printer,
  ExternalLink,
  Copy,
  Check,
  Dumbbell
} from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import MemberSearchSelect from '../../components/common/MemberSearchSelect';
import { useToast } from '../../components/common/Toast';

const checkInSchema = z.object({
  memberId: z.string().min(1, 'Please enter or select a Member ID'),
  notes: z.string().optional()
});

export const AttendancePage = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [records, setRecords] = useState([]);
  const [todaySummary, setTodaySummary] = useState({
    date: new Date().toISOString().split('T')[0],
    totalCheckIns: 0,
    currentlyInGym: 0,
    checkedOut: 0
  });

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });

  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchMember, setSearchMember] = useState('');
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [selectedCheckInMember, setSelectedCheckInMember] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [gymSettings, setGymSettings] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(checkInSchema)
  });

  // Fetch gym settings for QR poster
  useEffect(() => {
    api.get('/settings')
      .then((res) => {
        if (res.data?.data) {
          setGymSettings(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const checkInUrl = `${window.location.origin}/check-in`;
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(checkInUrl)}&margin=10`;

  const copyQrLink = () => {
    navigator.clipboard.writeText(checkInUrl);
    setCopiedLink(true);
    toastSuccess('Link Copied', 'Check-in page URL copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const printQrPoster = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${gymSettings?.gymName || 'IronPulse Fitness'} - Entrance Attendance QR</title>
          <style>
            @page { size: A4 portrait; margin: 15mm; }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              color: #0f172a;
              text-align: center;
              padding: 20px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 90vh;
            }
            .container {
              border: 3px solid #059669;
              border-radius: 24px;
              padding: 40px;
              max-width: 600px;
              margin: 0 auto;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            }
            .badge {
              display: inline-block;
              background: #facc15;
              color: #020617;
              font-weight: 900;
              font-size: 14px;
              letter-spacing: 2px;
              padding: 6px 16px;
              border-radius: 9999px;
              text-transform: uppercase;
              margin-bottom: 16px;
            }
            h1 {
              font-size: 32px;
              font-weight: 900;
              margin: 0 0 8px 0;
              color: #047857;
            }
            p.sub {
              font-size: 16px;
              color: #475569;
              margin: 0 0 24px 0;
            }
            .qr-box {
              background: #ffffff;
              padding: 16px;
              border-radius: 20px;
              border: 2px solid #e2e8f0;
              display: inline-block;
              margin-bottom: 24px;
            }
            .qr-box img {
              width: 280px;
              height: 280px;
              display: block;
            }
            .instructions {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              padding: 20px;
              text-align: left;
              font-size: 14px;
              line-height: 1.6;
            }
            .instructions ol {
              margin: 8px 0 0 20px;
              padding: 0;
            }
            .instructions li {
              margin-bottom: 6px;
            }
            .footer {
              margin-top: 24px;
              font-size: 12px;
              color: #94a3b8;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <span class="badge">Gym Entrance Check-In</span>
            <h1>${gymSettings?.gymName || 'IronPulse Fitness'}</h1>
            <p class="sub">Scan with any phone camera or QR reader to record your attendance</p>

            <div class="qr-box">
              <img src="${qrSvgUrl}" alt="Entrance QR Code" />
            </div>

            <div class="instructions">
              <strong>How to check in:</strong>
              <ol>
                <li>Scan the QR code with your smartphone camera.</li>
                <li>Enter your <strong>Member ID</strong> or registered <strong>Email</strong>.</li>
                <li>Enter your <strong>Phone Number</strong> or <strong>Password</strong> to verify.</li>
                <li>Tap <strong>Check In Now</strong> — your session is recorded instantly!</li>
              </ol>
            </div>

            <div class="footer">
              ${gymSettings?.address || 'IronPulse Fitness & Health Club'} &bull; Powered by IronPulse Gym Management
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Fetch today summary
  const fetchTodaySummary = async () => {
    try {
      const res = await api.get('/attendance/today');
      if (res.data?.data) {
        setTodaySummary(res.data.data);
      }
    } catch {}
  };

  // Fetch Attendance Records
  const fetchAttendance = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = { page, limit: 15 };
      if (selectedDate) params.date = selectedDate;
      if (searchMember) params.search = searchMember;

      const res = await api.get('/attendance', { params });
      if (res.data?.success) {
        setRecords(res.data.data);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      toastError('Failed to fetch attendance', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, searchMember, toastError]);

  useEffect(() => {
    fetchTodaySummary();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAttendance(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchAttendance]);

  // Submit Manual Check-In
  const onCheckInSubmit = async (data) => {
    const memberId = data.memberId || selectedCheckInMember?.memberId;
    if (!memberId) {
      toastError('Missing Member', 'Please search and select a member to check in.');
      return;
    }
    try {
      const res = await api.post('/attendance/check-in', { ...data, memberId });
      toastSuccess('Check-In Recorded!', res.data?.message);
      setIsCheckInModalOpen(false);
      setSelectedCheckInMember(null);
      reset();
      fetchAttendance(1);
      fetchTodaySummary();
    } catch (err) {
      toastError('Check-In Failed', err.response?.data?.message || err.message);
    }
  };

  // Mark Check-Out
  const handleCheckOut = async (attendanceId) => {
    try {
      await api.post('/attendance/check-out', { attendanceId });
      toastSuccess('Check-Out Recorded', 'Member check-out time logged');
      fetchAttendance(pagination.page);
      fetchTodaySummary();
    } catch (err) {
      toastError('Check-Out Failed', err.response?.data?.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Attendance Tracking</h1>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-600 text-white rounded uppercase tracking-wider">
              Live Capacity
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Log check-ins, monitor gym capacity, and display the official entrance QR code for member self-check-in.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Facility Generic QR Code Button */}
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-extrabold rounded-xl text-xs shadow-md transition-all cursor-pointer"
            title="Display facility entrance QR code"
          >
            <QrCode className="w-4 h-4 text-slate-950" />
            <span>Facility Check-in QR</span>
          </button>

          <button
            onClick={() => {
              reset();
              setIsCheckInModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Mark Member Check-In</span>
          </button>
        </div>
      </div>

      {/* Real-Time Facility Occupancy Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Total Check-Ins
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{todaySummary.totalCheckIns}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-emerald-300 dark:border-emerald-800/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Currently In Gym
            </span>
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {todaySummary.currentlyInGym}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Completed Sessions
            </span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <LogOut className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-2">{todaySummary.checkedOut}</p>
        </div>
      </div>

      {/* Date & Search Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
            placeholder="Search by Member ID (e.g. MEM-2026)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" /> Date:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Check-In Time</th>
                <th className="py-3.5 px-4">Check-Out Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-4 px-4">
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                    No check-in records found for this selection
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Member */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">
                        {r.memberRef?.userId?.name || 'Member'}
                      </p>
                      <p className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {r.memberId}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4">{r.dateString}</td>

                    {/* Check In */}
                    <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                      {new Date(r.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Check Out */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {r.checkOutAt ? (
                        new Date(r.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold italic">
                          Active in gym
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge status={r.status} />
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      {r.status === 'PRESENT' && (
                        <button
                          onClick={() => handleCheckOut(r._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Check Out</span>
                        </button>
                      )}
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
            Showing {records.length} of {pagination.total} check-ins
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchAttendance(pagination.page - 1)}
              disabled={!pagination.hasPrevPage}
              className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-slate-900 dark:text-white rounded-lg cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-900 dark:text-white px-2">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => fetchAttendance(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="p-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-slate-900 dark:text-white rounded-lg cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FACILITY GENERIC QR CODE MODAL */}
      <Modal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="Facility Attendance Entrance QR"
        maxWidth="max-w-md"
      >
        <div className="text-center space-y-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-yellow-400 text-slate-950 rounded uppercase tracking-wider">
              Single Generic Facility QR
            </span>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">
              {gymSettings?.gymName || 'IronPulse Fitness'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Every gym has only one QR code for member attendance. Print and mount this at your front desk or turnstile.
            </p>
          </div>

          {/* QR Code Graphic */}
          <div className="p-4 bg-white rounded-2xl border-2 border-emerald-500/30 inline-block shadow-md">
            <img src={qrSvgUrl} alt="Entrance QR Code" className="w-56 h-56 mx-auto block" />
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-left text-slate-600 dark:text-slate-400 space-y-1">
            <p className="font-bold text-slate-900 dark:text-slate-200">When members scan this QR code:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              <li>They open the instant Check-In page.</li>
              <li>They enter their <strong>Member ID</strong>, <strong>Email</strong>, or <strong>Username</strong>.</li>
              <li>They verify with their <strong>Phone Number</strong> or <strong>Password</strong>.</li>
              <li>Attendance is logged immediately without needing manual front-desk interaction.</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={printQrPoster}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Entrance Poster</span>
            </button>

            <button
              onClick={copyQrLink}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied URL!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* MANUAL CHECK-IN MODAL */}
      <Modal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
        title="Mark Member Check-In"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit(onCheckInSubmit)} className="space-y-4">
          <MemberSearchSelect
            selectedMember={selectedCheckInMember}
            onSelectMember={(m) => {
              setSelectedCheckInMember(m);
              setValue('memberId', m.memberId, { shouldValidate: true });
            }}
            onClear={() => {
              setSelectedCheckInMember(null);
              setValue('memberId', '', { shouldValidate: true });
            }}
            error={errors.memberId?.message}
            placeholder="Type member name, email, or Member ID..."
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Session Notes (Optional)
            </label>
            <input
              type="text"
              {...register('notes')}
              placeholder="e.g. Cardio workout, group class, PT session"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>Check-in time will be stamped with the current time. Duplicate check-ins are prevented.</span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCheckInModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Checking In...' : 'Confirm Check-In'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendancePage;
