import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  UserPlus,
  IndianRupee,
  TrendingUp,
  CreditCard,
  CalendarCheck,
  RefreshCw,
  Plus,
  ArrowUpRight,
  QrCode
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import api from '../../services/api';
import Badge from '../../components/common/Badge';

const PIE_COLORS = ['#059669', '#0284c7', '#eab308', '#8b5cf6', '#f43f5e'];

export const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, settingsRes] = await Promise.all([
        api.get('/dashboard/admin'),
        api.get('/settings')
      ]);

      if (dashRes.data?.data) {
        setData(dashRes.data.data);
      }
      if (settingsRes.data?.data?.currencySymbol) {
        setCurrencySymbol(settingsRes.data.data.currencySymbol);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse p-4" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />
          <div className="h-80 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const { kpis, charts, recentActivity } = data;

  const statCards = [
    {
      title: 'Total Members',
      value: kpis.totalMembers,
      icon: Users,
      textColor: 'text-slate-900 dark:text-white',
      badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
    },
    {
      title: 'Active Members',
      value: kpis.activeMembers,
      icon: UserCheck,
      textColor: 'text-emerald-600 dark:text-emerald-400',
      badgeColor: 'bg-emerald-500 text-white'
    },
    {
      title: 'Expired Plans',
      value: kpis.expiredMemberships,
      icon: UserX,
      textColor: 'text-rose-600 dark:text-rose-400',
      badgeColor: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
    },
    {
      title: 'Expiring Soon (7d)',
      value: kpis.membershipsExpiringSoon,
      icon: AlertTriangle,
      textColor: 'text-amber-600 dark:text-amber-400',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
    },
    {
      title: 'New This Month',
      value: kpis.newMembersThisMonth,
      icon: UserPlus,
      textColor: 'text-teal-600 dark:text-teal-400',
      badgeColor: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400'
    },
    {
      title: 'Total Revenue',
      value: `${currencySymbol}${kpis.totalRevenueCollected.toLocaleString()}`,
      icon: IndianRupee,
      textColor: 'text-slate-900 dark:text-white',
      badgeColor: 'bg-yellow-400 text-slate-950 font-bold'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Gym Administration Dashboard</h1>
            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-yellow-400 text-slate-950 rounded uppercase tracking-wider">
              Overview
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time gym performance, active member occupancy, and financial metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer shadow-sm"
            title="Refresh statistics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/check-in"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-950 font-extrabold rounded-xl text-xs shadow-sm transition-all"
            title="Open Public Entrance Check-In QR page"
          >
            <QrCode className="w-4 h-4" />
            <span>Entrance QR</span>
          </Link>
          <Link
            to="/admin/members"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </Link>
          <Link
            to="/admin/payments"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold rounded-xl text-xs border border-slate-200 dark:border-slate-700 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Record Payment</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-300 hover:translate-y-[-2px]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.title}</span>
                <div className={`p-1.5 rounded-lg ${stat.badgeColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className={`text-2xl font-black mt-3 tracking-tight ${stat.textColor}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Monthly Revenue Performance
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Aggregated payments collected over the last 6 months</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `${currencySymbol}${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0f172a',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`${currencySymbol}${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Membership Plan Distribution Donut Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Plan Distribution</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Active member subscriptions by plan</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center my-2">
            {charts.planDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts.planDistribution}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {charts.planDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#0f172a'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', color: '#64748b' }}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 italic">No active subscriptions yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Member Registration Trends Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
          <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Member Registration Trends
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">New member signups per month</p>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.registrationTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e2e8f0',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#0f172a'
                }}
              />
              <Bar dataKey="registrations" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Recent Member Signups</h2>
            <Link
              to="/admin/members"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              View all members <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase text-[11px]">
                <tr>
                  <th className="pb-3">Member</th>
                  <th className="pb-3">Plan</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {recentActivity.members.map((m) => (
                  <tr key={m._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
                          {m.userId?.name?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{m.userId?.name}</p>
                          <p className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{m.memberId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300">
                      {m.membershipId?.planId?.name || 'Standard'}
                    </td>
                    <td className="py-3">
                      <Badge status={m.status} />
                    </td>
                    <td className="py-3 text-right text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {recentActivity.members.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                      No members registered yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payment Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Recent Payments</h2>
            <Link
              to="/admin/payments"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              View all payments <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800 uppercase text-[11px]">
                <tr>
                  <th className="pb-3">Reference</th>
                  <th className="pb-3">Member</th>
                  <th className="pb-3">Method</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {recentActivity.payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {p.transactionReference.length > 14
                        ? `${p.transactionReference.slice(0, 14)}...`
                        : p.transactionReference}
                    </td>
                    <td className="py-3 text-slate-900 dark:text-white font-medium">
                      {p.memberRef?.userId?.name || p.memberId}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                      {currencySymbol}{p.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {recentActivity.payments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 italic">
                      No payments recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
