import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Gauge, ArrowRight, Car as CarIcon } from 'lucide-react';
import FuelBadge from './FuelBadge';
import { formatPrice, formatMileage } from '../utils/formatters';

export function CarCard({ car, onSelect }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [imgError, setImgError] = useState(false);

  const handleCardClick = () => {
    onSelect?.(car);
    navigate(`/cars/${car.id}`, { state: { fromSearch: location.search } });
  };

  return (
    <div
<<<<<<< HEAD
      onClick={handleCardClick}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image container */}
      <div className="relative aspect-[16/10] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        {imgError || !car.imageUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-400 p-4">
            <div className="w-12 h-12 rounded-full bg-white/80 dark:bg-slate-700/80 shadow-sm flex items-center justify-center mb-2">
              <CarIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{car.make} {car.model}</span>
          </div>
        ) : (
          <img
            src={car.imageUrl}
            alt={`${car.make} ${car.model}`}
            onError={() => setImgError(true)}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        )}

        {/* Floating Fuel Type Badge */}
        <div className="absolute top-3 right-3 shadow-sm backdrop-blur-md">
          <FuelBadge fuelType={car.fuelType} size="sm" />
        </div>

        {/* Floating Year Pill */}
        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-sm text-white text-xs font-semibold tracking-wide">
          {car.year}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Make & Model */}
          <div className="mb-2">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {car.make}
            </p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
              {car.model}
            </h3>
          </div>

          {/* Quick Specs */}
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4 pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5" title="Manufacturing Year">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>{car.year}</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <div className="flex items-center gap-1.5" title="Odometer Mileage">
              <Gauge className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>{formatMileage(car.mileage)}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Price & Action */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 uppercase font-medium block">Price</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatPrice(car.price)}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 hover:text-indigo-700 dark:hover:text-indigo-200 transition-all cursor-pointer group-hover:translate-x-0.5"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default CarCard;
