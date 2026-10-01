import { useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center">
      <div className="w-20 h-20 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
        <Compass className="w-10 h-10 animate-pulse" />
      </div>

      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-200/60 mb-3">
        404 Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
        Page Not Found
      </h1>

      <p className="text-sm sm:text-base text-slate-500 max-w-md mx-auto mb-8">
        The route you are looking for doesn't exist or may have been moved. Let's get you back to the car catalog.
      </p>

      <button
        type="button"
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all cursor-pointer hover:-translate-x-0.5"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Inventory</span>
      </button>
    </div>
  );
}

export default NotFoundPage;
