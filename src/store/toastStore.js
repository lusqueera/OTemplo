import { create } from 'zustand';
import { nanoid } from 'nanoid';

export const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: ({ type = 'info', title, message, duration = 4000 }) => {
    const id = nanoid();
    set(s => ({ toasts: [...s.toasts, { id, type, title, message, createdAt: Date.now() }] }));
    if (duration > 0) {
      setTimeout(() => {
        set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
      }, duration);
    }
    return id;
  },

  removeToast: (id) => {
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
  },

  success: (message, title) => {
    return get().addToast({ type: 'success', title: title || 'Sucesso', message });
  },

  error: (message, title) => {
    return get().addToast({ type: 'error', title: title || 'Erro', message });
  },

  warning: (message, title) => {
    return get().addToast({ type: 'warning', title: title || 'Atenção', message });
  },

  info: (message, title) => {
    return get().addToast({ type: 'info', title: title || 'Info', message });
  },
}));
