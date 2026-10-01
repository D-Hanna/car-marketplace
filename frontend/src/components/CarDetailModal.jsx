import { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Gauge,
  Car as CarIcon,
  Copy,
  Check,
  ShieldCheck,
  PhoneCall,
  Loader2,
} from 'lucide-react';
import FuelBadge from './FuelBadge';
import { formatPrice, formatMileage } from '../utils/formatters';
import { fetchCarById } from '../services/carService';

export function CarDetailModal({ carId, initialCar = null, onClose, onShowToast }) {
  const [car, setCar] = useState(initialCar);
  const [loading, setLoading] = useState(!initialCar);
  const [error, setError] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!carId) return;

    async function loadDetail() {
      try {
        const data = await fetchCarById(carId);
        if (isMounted) {
          setCar(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          if (!initialCar) {
            setError(err.detail || err.message || 'Failed to load car details.');
          }
          setLoading(false);
        }
      }
    }

    loadDetail();

    return () => {
      isMounted = false;
    };
  }, [carId, initialCar]);

  // ESC key listener to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopyId = () => {
    if (car?.id) {
      navigator.clipboard?.writeText(car.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onShowToast?.({
        type: 'info',
        title: 'Copied to Clipboard',
        message: 'Car UUID has been copied.',
      });
    }
  };

  const handleContactSeller = () => {
    onShowToast?.({
      type: 'success',
      title: 'Inquiry Sent',
      message: `Your inquiry for the ${car?.make} ${car?.model} was submitted to the verified dealer.`,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200/80 dark:border-slate-800 my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {loading && !car ? (
          <div className="p-16 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mb-3" />
            <p className="text-sm font-medium">Fetching vehicle details...</p>
          </div>
        ) : error && !car ? (
          <div className="p-8 text-center">
            <p className="text-rose-600 dark:text-rose-400 font-medium mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : car ? (
          <div>
            {/* Hero Image */}
            <div className="relative aspect-[16/9] w-full bg-slate-900">
              {imgError || !car.imageUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 dark:bg-slate-950 text-slate-400 p-6">
                  <CarIcon className="w-16 h-16 text-slate-600 dark:text-slate-500 mb-3" />
                  <span className="text-base font-semibold text-slate-300">
                    {car.make} {car.model}
                  </span>
                </div>
              ) : (
                <img
                  src={car.imageUrl}
                  alt={`${car.make} ${car.model}`}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Floating badges */}
              <div className="absolute top-4 left-4 flex gap-2 items-center">
                <FuelBadge fuelType={car.fuelType} size="md" />
                <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold">
                  {car.year}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8">
              {/* Header Title & Price */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    {car.make}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    {car.model}
                  </h2>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-slate-400 dark:text-slate-500 block font-medium">Listing Price</span>
                  <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
                    {formatPrice(car.price)}
                  </span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/80">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1">
                    Year
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-base">
                    <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span>{car.year}</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/80">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1">
                    Mileage
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-base">
                    <Gauge className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span>{formatMileage(car.mileage)}</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/80">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1">
                    Powertrain
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-base capitalize">
                    <span>{car.fuelType?.replace('_', ' ').toLowerCase()}</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/80">
                  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1">
                    Status
                  </span>
                  <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified</span>
                  </div>
                </div>
              </div>

              {/* UUID ID section */}
              <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 py-3 px-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl my-4 border border-slate-100 dark:border-slate-700/80">
                <div className="truncate pr-2">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Listing ID:</span>{' '}
                  <span className="font-mono text-slate-600 dark:text-slate-300">{car.id}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium shrink-0 cursor-pointer"
                  title="Copy Car ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleContactSeller}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Contact Dealer / Inquire</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default CarDetailModal;
