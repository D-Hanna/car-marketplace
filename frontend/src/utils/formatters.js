/**
 * Formats a numeric price into a localized currency string
 * e.g. 38999 -> "$38,999"
 */
export function formatPrice(price) {
  if (price === undefined || price === null || isNaN(Number(price))) {
    return '$0';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Number(price) % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Number(price));
}

/**
 * Formats mileage with thousands separators and unit
 * e.g. 12500 -> "12,500 km"
 */
export function formatMileage(mileage) {
  if (mileage === undefined || mileage === null || isNaN(Number(mileage))) {
    return '0 km';
  }
  return `${new Intl.NumberFormat('en-US').format(Number(mileage))} km`;
}

/**
 * Metadata and style definitions for fuel types
 */
export const FUEL_TYPE_CONFIG = {
  ELECTRIC: {
    label: 'Electric',
    shortLabel: 'EV',
    bgClass: 'bg-emerald-500/10 text-emerald-700 border-emerald-200/80 hover:bg-emerald-500/20',
    dotClass: 'bg-emerald-500',
    iconName: 'Zap',
  },
  HYBRID: {
    label: 'Hybrid',
    shortLabel: 'Hybrid',
    bgClass: 'bg-teal-500/10 text-teal-700 border-teal-200/80 hover:bg-teal-500/20',
    dotClass: 'bg-teal-500',
    iconName: 'Leaf',
  },
  PLUGIN_HYBRID: {
    label: 'Plug-in Hybrid',
    shortLabel: 'PHEV',
    bgClass: 'bg-sky-500/10 text-sky-700 border-sky-200/80 hover:bg-sky-500/20',
    dotClass: 'bg-sky-500',
    iconName: 'BatteryCharging',
  },
  PETROL: {
    label: 'Petrol',
    shortLabel: 'Petrol',
    bgClass: 'bg-amber-500/10 text-amber-700 border-amber-200/80 hover:bg-amber-500/20',
    dotClass: 'bg-amber-500',
    iconName: 'Fuel',
  },
  DIESEL: {
    label: 'Diesel',
    shortLabel: 'Diesel',
    bgClass: 'bg-slate-500/10 text-slate-700 border-slate-300 hover:bg-slate-500/20',
    dotClass: 'bg-slate-500',
    iconName: 'Gauge',
  },
};

export function getFuelTypeConfig(fuelType) {
  return (
    FUEL_TYPE_CONFIG[fuelType] || {
      label: fuelType || 'Unknown',
      shortLabel: fuelType || 'Unknown',
      bgClass: 'bg-gray-100 text-gray-700 border-gray-200',
      dotClass: 'bg-gray-400',
      iconName: 'Car',
    }
  );
}
