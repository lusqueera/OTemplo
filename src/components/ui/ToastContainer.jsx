import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '../../store/toastStore';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: { bg: 'rgba(45, 212, 168, 0.12)', border: 'rgba(45, 212, 168, 0.25)', icon: 'var(--green)', bar: 'var(--green)' },
  error: { bg: 'rgba(248, 113, 113, 0.12)', border: 'rgba(248, 113, 113, 0.25)', icon: 'var(--red)', bar: 'var(--red)' },
  warning: { bg: 'rgba(240, 165, 0, 0.12)', border: 'rgba(240, 165, 0, 0.25)', icon: 'var(--amber)', bar: 'var(--amber)' },
  info: { bg: 'rgba(96, 165, 250, 0.12)', border: 'rgba(96, 165, 250, 0.25)', icon: 'var(--blue)', bar: 'var(--blue)' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="toast-container">
      <AnimatePresence>
        {toasts.map(toast => {
          const Icon = icons[toast.type] || icons.info;
          const color = colors[toast.type] || colors.info;

          return (
            <motion.div
              key={toast.id}
              className="toast"
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{ background: color.bg, borderColor: color.border }}
            >
              <div className="toast-bar" style={{ background: color.bar }} />
              <div className="toast-icon">
                <Icon size={18} color={color.icon} />
              </div>
              <div className="toast-body">
                <p className="toast-title">{toast.title}</p>
                {toast.message && <p className="toast-message">{toast.message}</p>}
              </div>
              <button className="toast-close" onClick={() => removeToast(toast.id)}>
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
