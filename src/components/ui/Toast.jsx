import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'info', duration = 4000) => {
      const id = idCounter += 1;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration) setTimeout(() => remove(id), duration);
    },
    [remove]
  );

  const api = {
    success: (msg) => push(msg, 'success'),
    error: (msg) => push(msg, 'error'),
    info: (msg) => push(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`flex items-start gap-2.5 rounded-xl border shadow-panel px-4 py-3 text-sm bg-white animate-fadeIn ${
              t.type === 'success' ? 'border-emerald-200' : t.type === 'error' ? 'border-red-200' : 'border-ink-200'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info size={18} className="text-brand-500 shrink-0 mt-0.5" />}
            <p className="flex-1 text-ink-700">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-ink-400 hover:text-ink-600" aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
