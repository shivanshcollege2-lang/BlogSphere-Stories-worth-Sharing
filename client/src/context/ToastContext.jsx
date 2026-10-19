import { createContext, useCallback, useContext, useState } from 'react';
import { Check, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    window.setTimeout(() => setToast(null), 3800);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div className={`toast toast-${toast.type}`} role="status" aria-live="polite">
          {toast.type === 'success' ? <Check size={17} /> : <X size={17} />}
          <span>{toast.message}</span>
          <button className="toast-close" aria-label="Dismiss notification" onClick={() => setToast(null)}><X size={15} /></button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used within ToastProvider.');
  return value;
}
