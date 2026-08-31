import React, { createContext, useContext, useState, useCallback } from 'react';
import { Bell, CheckCircle2, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 5000, onClick }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type, onClick }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => {
              if (toast.onClick) toast.onClick();
              removeToast(toast.id);
            }}
            className={`pointer-events-auto p-4 rounded-xl border bg-cardBg flex items-start gap-3 shadow-elevated transition-all animate-slide-up cursor-pointer hover:border-accent/40 ${
              toast.type === 'success'
                ? 'border-success/30'
                : toast.type === 'error'
                ? 'border-danger/30'
                : 'border-accent/30'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' ? (
                <CheckCircle2 size={18} className="text-success" />
              ) : toast.type === 'error' ? (
                <AlertCircle size={18} className="text-danger" />
              ) : (
                <Bell size={18} className="text-accent" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold text-textPrimary tracking-tight">{toast.title}</h5>
              <p className="text-[11px] text-textSecondary mt-0.5 line-clamp-2 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="p-1 rounded-lg text-textMuted hover:text-textPrimary hover:bg-bgSecondary transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
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
