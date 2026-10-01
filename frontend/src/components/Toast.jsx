import { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl shadow-xl border backdrop-blur-md ${
          isSuccess
            ? 'bg-emerald-950/90 text-white border-emerald-500/40 shadow-emerald-900/20'
            : isError
            ? 'bg-rose-950/90 text-white border-rose-500/40 shadow-rose-900/20'
            : 'bg-slate-900/90 text-white border-slate-700/50 shadow-slate-900/20'
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
          {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-400" />}
        </div>
        <div className="flex-1 text-sm">
          {toast.title && <div className="font-semibold mb-0.5">{toast.title}</div>}
          <div className="text-slate-200">{toast.message}</div>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="shrink-0 text-slate-400 hover:text-white transition-colors p-1 rounded-md"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Toast;
