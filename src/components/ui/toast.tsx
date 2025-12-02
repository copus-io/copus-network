import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  action?: ToastAction;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type: Toast['type'], options?: { duration?: number; action?: ToastAction }) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'], options: { duration?: number; action?: ToastAction } = {}) => {
    const { action } = options;

    // Calculate duration based on message length if not explicitly provided
    // Formula: 2000ms base + 60ms per character
    // Min: 2000ms, Max: 8000ms
    const calculatedDuration = options.duration || Math.min(
      Math.max(2000, 2000 + message.length * 60),
      8000
    );

    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, message, type, duration: calculatedDuration, action };

    setToasts(prev => [...prev, toast]);

    if (calculatedDuration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, calculatedDuration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC<{
  toasts: Toast[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: Toast;
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  // Define colors based on toast type
  const getToastStyles = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-[#f0fdf4]',
          border: 'border-[#86efac]',
          text: 'text-[#16a34a]',
        };
      case 'error':
        return {
          bg: 'bg-[#fdf2f2]',
          border: 'border-[#fbb6b6]',
          text: 'text-[#e53e3e]',
        };
      case 'warning':
        return {
          bg: 'bg-[#fffbeb]',
          border: 'border-[#fcd34d]',
          text: 'text-[#d97706]',
        };
      case 'info':
      default:
        return {
          bg: 'bg-[#eff6ff]',
          border: 'border-[#93c5fd]',
          text: 'text-[#2563eb]',
        };
    }
  };

  const styles = getToastStyles(toast.type);

  return (
    <div
      className={`px-6 py-3 ${styles.bg} border ${styles.border} rounded-full shadow-sm transform transition-all duration-300 animate-in slide-in-from-top-2 fade-in-0`}
    >
      <div className="flex items-center gap-3">
        <p className={`${styles.text} text-sm font-medium whitespace-nowrap`}>
          {toast.message}
        </p>
        {toast.action && (
          <button
            onClick={() => {
              toast.action!.onClick();
              onRemove(toast.id);
            }}
            className={`${styles.text} text-sm font-semibold underline hover:no-underline whitespace-nowrap`}
          >
            {toast.action.label}
          </button>
        )}
      </div>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};