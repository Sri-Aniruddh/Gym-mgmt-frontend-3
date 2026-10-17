import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  Calendar,
  IndianRupee,
  Users,
  CalendarCheck,
  ShieldAlert,
  ArrowDownToLine,
  Filter
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

export const ReportsPage = () => {
  const { error: toastError } = useToast();

  const [reportData, setReportData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const [summaryRes, logsRes, settingsRes] = await Promise.all([
        api.get('/reports/summary', { params }),
        api.get('/reports/audit-logs?limit=25'),
        api.get('/settings')
      ]);

      if (summaryRes.data?.data) setReportData(summaryRes.data.data);
      if (logsRes.data?.data) setAuditLogs(logsRes.data.data);
      if (settingsRes.data?.data?.currencySymbol) setCurrencySymbol(settingsRes.data.data.currencySymbol);
    } catch (err) {
      toastError('Failed to load reports', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate, toastError]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Reports & Audit Trail</h1>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-600 text-white rounded uppercase tracking-wider">
              Audit
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Financial analytics, membership performance, and administrative audit trails.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
          <span className="text-slate-500 dark:text-slate-400 text-xs">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
          />
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-bold px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {reportData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Revenue
            </span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              {currencySymbol}{reportData.revenue.totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{reportData.revenue.totalTransactions} transactions</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              New Member Signups
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {reportData.members.newMembersCount}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Joined during selected period</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Facility Check-Ins
            </span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
              {reportData.attendance.totalCheckIns}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total visits logged</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Memberships
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {reportData.members.activeMemberships}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Currently valid access plans</p>
          </div>
        </div>
      )}

      {/* Payment Method Breakdown */}
      {reportData?.revenue?.byMethod && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
            Revenue Breakdown by Payment Method
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {reportData.revenue.byMethod.map((m) => (
              <div key={m._id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{m._id}</span>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                  {currencySymbol}{m.totalAmount.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{m.count} payments</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Trail Logs */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Administrative Audit Trail
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Immutable record of security and administrative operations</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 italic">
                    No audit logs recorded yet
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {log.actorName || log.actorEmail || 'System'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                      {log.targetType} {log.targetId ? `(${log.targetId.slice(-6)})` : ''}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
