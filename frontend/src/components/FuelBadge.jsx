import { Zap, Leaf, BatteryCharging, Fuel, Gauge, Car } from 'lucide-react';
import { getFuelTypeConfig } from '../utils/formatters';

export function FuelBadge({ fuelType, size = 'sm', showIcon = true }) {
  const config = getFuelTypeConfig(fuelType);

  const renderIcon = () => {
    if (!showIcon) return null;
    const iconProps = { className: size === 'sm' ? 'w-3 h-3' : 'w-4 h-4' };

    switch (config.iconName) {
      case 'Zap':
        return <Zap {...iconProps} />;
      case 'Leaf':
        return <Leaf {...iconProps} />;
      case 'BatteryCharging':
        return <BatteryCharging {...iconProps} />;
      case 'Fuel':
        return <Fuel {...iconProps} />;
      case 'Gauge':
        return <Gauge {...iconProps} />;
      default:
        return <Car {...iconProps} />;
    }
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-0.5 text-xs font-semibold'
      : 'px-3 py-1 text-sm font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border transition-colors ${config.bgClass} ${sizeClasses}`}
      title={config.label}
    >
      {renderIcon()}
      <span>{config.label}</span>
    </span>
  );
}

export default FuelBadge;
