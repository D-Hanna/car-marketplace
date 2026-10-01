import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import FilterBar from '../components/FilterBar';
import CarGrid from '../components/CarGrid';
import AddCarModal from '../components/AddCarModal';
import { fetchCars } from '../services/carService';
import { SEED_CARS } from '../constants/seedCars';

export function CarCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const outletContext = useOutletContext() || {};
  const {
    showToast,
    setIsDemoMode,
    setCarCount,
    setIsLoading: setGlobalLoading,
    isAddModalOpen,
    setIsAddModalOpen,
  } = outletContext;

  const [localAddModalOpen, setLocalAddModalOpen] = useState(false);
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const debounceTimerRef = useRef(null);
  const isInitialMount = useRef(true);

  // Synchronize filters with URL search parameters
  const filters = useMemo(
    () => ({
      make: searchParams.get('make') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      minYear: searchParams.get('minYear') || '',
    }),
    [searchParams]
  );

  const handleFilterChange = (newFilters) => {
    const nextParams = new URLSearchParams();
    if (newFilters.make) {
      nextParams.set('make', newFilters.make);
    }
    if (newFilters.maxPrice) {
      nextParams.set('maxPrice', newFilters.maxPrice);
    }
    if (newFilters.minYear) {
      nextParams.set('minYear', newFilters.minYear);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleResetFilters = () => {
    setSearchParams({}, { replace: true });
  };

  // Filter seed cars locally for demo mode
  const filterSeedCars = useCallback((filtersToApply) => {
    return SEED_CARS.filter((car) => {
      if (
        filtersToApply.make &&
        !car.make.toLowerCase().includes(filtersToApply.make.toLowerCase().trim())
      ) {
        return false;
      }
      if (
        filtersToApply.maxPrice &&
        Number(car.price) > Number(filtersToApply.maxPrice)
      ) {
        return false;
      }
      if (
        filtersToApply.minYear &&
        Number(car.year) < Number(filtersToApply.minYear)
      ) {
        return false;
      }
      return true;
    });
  }, []);

  // Load cars from API with graceful demo fallback
  const loadCars = useCallback(
    async (currentFilters = filters) => {
      setIsLoading(true);
      setGlobalLoading?.(true);
      setError(null);

      try {
        const data = await fetchCars(currentFilters);
        setCars(data);
        setCarCount?.(data.length);
        setIsDemoMode?.(false);
      } catch (err) {
        console.warn('Backend API request failed:', err);
        const isNetworkError =
          err.message?.includes('fetch') ||
          err.message?.includes('NetworkError') ||
          err.message?.includes('Failed to fetch') ||
          err.name === 'TypeError' ||
          !err.status;

        if (isNetworkError) {
          setIsDemoMode?.(true);
          const filtered = filterSeedCars(currentFilters);
          setCars(filtered);
          setCarCount?.(filtered.length);
          setError(null);
        } else {
          setError(err);
        }
      } finally {
        setIsLoading(false);
        setGlobalLoading?.(false);
      }
    },
    [filters, filterSeedCars, setCarCount, setIsDemoMode, setGlobalLoading]
  );

  // Trigger search with debounce for typing make, but immediately on first mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      loadCars(filters);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      loadCars(filters);
    }, 250);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [filters, loadCars]);

  const handleOpenAddModal = () => {
    if (setIsAddModalOpen) {
      setIsAddModalOpen(true);
    } else {
      setLocalAddModalOpen(true);
    }
  };

  const handleCloseAddModal = () => {
    if (setIsAddModalOpen) {
      setIsAddModalOpen(false);
    } else {
      setLocalAddModalOpen(false);
    }
  };

  const isAddModalVisible =
    isAddModalOpen !== undefined ? isAddModalOpen : localAddModalOpen;

  const handleCarCreated = (newCar) => {
    setCars((prev) => [newCar, ...prev]);
    setCarCount?.(cars.length + 1);
    loadCars(filters);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Hero Section */}
      <HeroBanner onOpenAddCar={handleOpenAddModal} />

      {/* Filter and Search Bar */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        totalMatches={cars.length}
      />

      {/* Catalog Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Vehicle Inventory
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Showing {cars.length} verified {cars.length === 1 ? 'vehicle' : 'vehicles'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
        >
          <span>+ Add new listing</span>
        </button>
      </div>

      {/* Catalog Grid */}
      <CarGrid
        cars={cars}
        isLoading={isLoading}
        error={error}
        onResetFilters={handleResetFilters}
        onRetry={() => loadCars(filters)}
      />

      {/* Add Car Modal */}
      <AddCarModal
        isOpen={isAddModalVisible}
        onClose={handleCloseAddModal}
        onCarCreated={handleCarCreated}
        onShowToast={showToast}
      />
    </div>
  );
}

export default CarCatalogPage;
