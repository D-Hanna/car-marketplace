import { useState } from 'react';
import { Calendar, Gauge, ArrowRight, Car as CarIcon } from 'lucide-react';
import FuelBadge from './FuelBadge';
import { formatPrice, formatMileage } from '../utils/formatters';

export function CarCard({ car, onSelect }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={() => onSelect(car)}
      className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image container */}
      <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
        {imgError || !car.imageUrl ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-4">
            <div className="w-12 h-12 rounded-full bg-white/80 shadow-sm flex items-center justify-center mb-2">
              <CarIcon className="w-6 h-6 text-slate-400" />
            </div>
            <span className="text-xs font-medium text-slate-500">{car.make} {car.model}</span>
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
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              {car.make}
            </p>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {car.model}
            </h3>
          </div>

          {/* Quick Specs */}
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-4 pt-1 border-t border-slate-100">
            <div className="flex items-center gap-1.5" title="Manufacturing Year">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{car.year}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5" title="Odometer Mileage">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatMileage(car.mileage)}</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Price & Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-medium block">Price</span>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              {formatPrice(car.price)}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(car);
            }}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 transition-all cursor-pointer group-hover:translate-x-0.5"
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
