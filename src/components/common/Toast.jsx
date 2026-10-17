import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, title, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  const success = useCallback((title, message) => addToast('success', title, message), [addToast]);
  const error = useCallback((title, message) => addToast('error', title, message), [addToast]);
  const info = useCallback((title, message) => addToast('info', title, message), [addToast]);
  const warning = useCallback((title, message) => addToast('warning', title, message), [addToast]);

  return (
    <ToastContext.Provider value={{ toast: addToast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />,
            info: <Info className="w-5 h-5 text-cyan-500 shrink-0" />
          };

          const borderColors = {
            success: 'border-emerald-300 bg-white dark:bg-emerald-950/90 dark:border-emerald-500/30 text-slate-800 dark:text-white',
            error: 'border-rose-300 bg-white dark:bg-rose-950/90 dark:border-rose-500/30 text-slate-800 dark:text-white',
            warning: 'border-yellow-300 bg-white dark:bg-amber-950/90 dark:border-amber-500/30 text-slate-800 dark:text-white',
            info: 'border-cyan-300 bg-white dark:bg-cyan-950/90 dark:border-cyan-500/30 text-slate-800 dark:text-white'
          };

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-slide-in ${borderColors[t.type]}`}
            >
              {icons[t.type]}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs uppercase tracking-wider">{t.title}</p>
                {t.message && <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{t.message}</p>}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
