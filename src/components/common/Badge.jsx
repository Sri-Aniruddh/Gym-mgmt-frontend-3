import React from 'react';

export const Badge = ({ status = '', className = '' }) => {
  const normalized = String(status).toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case 'ACTIVE':
      case 'COMPLETED':
      case 'PRESENT':
      case 'ACCEPTED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30';
      case 'EXPIRED':
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30';
      case 'PENDING':
      case 'SENT':
      case 'EXPIRING_SOON':
        return 'bg-yellow-50 text-yellow-800 border-yellow-400 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30';
      case 'INACTIVE':
      case 'CHECKED_OUT':
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide border ${getStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-90" />
      {normalized.replace('_', ' ')}
    </span>
  );
};

export default Badge;
