import React, { createContext, useContext, useState } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const getStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.9)', border: '#34d399' };
      case 'error':
        return { bg: 'rgba(239, 68, 68, 0.9)', border: '#f87171' };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.9)', border: '#fbbf24' };
      default:
        return { bg: 'rgba(14, 165, 233, 0.9)', border: '#38bdf8' };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map((t) => {
          const s = getStyle(t.type);
          return (
            <div
              key={t.id}
              style={{
                backgroundColor: s.bg,
                color: 'white',
                padding: '12px 20px',
                borderRadius: '10px',
                border: `1px solid ${s.border}`,
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                fontSize: '13px',
                fontWeight: 600,
                backdropFilter: 'blur(8px)',
                transition: 'all 0.3s ease',
              }}
            >
              {t.message}
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
