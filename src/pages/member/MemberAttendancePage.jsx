import React, { useState, useEffect } from 'react';
import { CalendarCheck, Clock, Calendar } from 'lucide-react';
import api from '../../services/api';
import Badge from '../../components/common/Badge';

export const MemberAttendancePage = () => {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance')
      .then((res) => {
        if (res.data?.data) {
          setRecords(res.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">My Attendance History</h1>
          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-600 text-white rounded uppercase tracking-wider">
            Visits Log
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review all your workout visits and facility check-in timestamps.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Visit Date</th>
                <th className="py-3.5 px-4">Check-In Time</th>
                <th className="py-3.5 px-4">Check-Out Time</th>
                <th className="py-3.5 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="py-4 px-4">
                      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 italic">
                    No gym visits recorded yet. Scan the entrance QR code next time you arrive!
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{r.dateString}</span>
                    </td>
                    <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      {new Date(r.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono">
                      {r.checkOutAt ? (
                        new Date(r.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold italic">
                          Active in gym
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Badge status={r.status} />
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

export default MemberAttendancePage;
