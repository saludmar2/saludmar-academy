import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = Info;
          let bgColor = 'bg-slate-900/95';
          let textColor = 'text-white';
          let borderColor = 'border-slate-800';
          let iconColor = 'text-sky-400';

          switch (toast.type) {
            case 'success':
              Icon = CheckCircle;
              bgColor = 'bg-emerald-950/95';
              borderColor = 'border-emerald-800/50';
              iconColor = 'text-emerald-400';
              break;
            case 'error':
              Icon = XCircle;
              bgColor = 'bg-rose-950/95';
              borderColor = 'border-rose-800/50';
              iconColor = 'text-rose-400';
              break;
            case 'warning':
              Icon = AlertCircle;
              bgColor = 'bg-amber-950/95';
              borderColor = 'border-amber-800/50';
              iconColor = 'text-amber-400';
              break;
            case 'info':
              Icon = Info;
              bgColor = 'bg-slate-950/95';
              borderColor = 'border-slate-800/50';
              iconColor = 'text-blue-400';
              break;
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className={`flex items-start gap-3 p-4 rounded-xl border ${bgColor} ${textColor} ${borderColor} shadow-2xl backdrop-blur-md`}
            >
              <div className={`p-1 rounded-lg ${iconColor} bg-white/5`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 text-sm font-medium pr-2">
                {toast.text}
              </div>
              <button
                onClick={() => onRemove(toast.id)}
                className="text-slate-400 hover:text-white transition-colors duration-200"
              >
                <X size={16} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

// Hook for triggering toast notifications easily
export function useToasts() {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const addToast = React.useCallback((text: string, type: ToastMessage['type'] = 'success', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, text }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}
