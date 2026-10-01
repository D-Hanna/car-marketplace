import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Gauge,
  Car as CarIcon,
  Copy,
  Check,
  ShieldCheck,
  PhoneCall,
  Loader2,
  AlertOctagon,
  HelpCircle,
  Share2,
} from 'lucide-react';
import FuelBadge from '../components/FuelBadge';
import { formatPrice, formatMileage } from '../utils/formatters';
import { fetchCarById } from '../services/carService';
import { SEED_CARS } from '../constants/seedCars';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function CarDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const outletContext = useOutletContext() || {};
  const { showToast, setIsDemoMode } = outletContext;

  const [car, setCar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [imgError, setImgError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  // Client-side UUID format validation derived during render
  const isInvalidUuid = !id || !UUID_REGEX.test(id);

  const handleBackToInventory = useCallback(() => {
    const fromSearch = location.state?.fromSearch;
    if (fromSearch) {
      navigate({ pathname: '/', search: fromSearch });
    } else {
      navigate('/');
    }
  }, [navigate, location.state]);

  useEffect(() => {
    let isMounted = true;

    if (isInvalidUuid) {
      return;
    }

    async function loadVehicle() {
      setIsLoading(true);
      setErrorState(null);

      try {
        const data = await fetchCarById(id);
        if (isMounted) {
          setCar(data);
          setIsLoading(false);
        }
      } catch (err) {
        if (!isMounted) return;

        // Check if network error (backend offline) -> Fallback to SEED_CARS in Demo Mode
        const isNetworkError =
          err.message?.includes('fetch') ||
          err.message?.includes('NetworkError') ||
          err.message?.includes('Failed to fetch') ||
          err.name === 'TypeError' ||
          !err.status;

        if (isNetworkError) {
          setIsDemoMode?.(true);
          const seedMatch = SEED_CARS.find(
            (c) => c.id.toLowerCase() === id.toLowerCase()
          );

          if (seedMatch) {
            setCar(seedMatch);
            setIsLoading(false);
            return;
          }

          // If not in seed cars either, it's 404
          setErrorState({
            type: 'NOT_FOUND',
            status: 404,
            title: 'Vehicle Not Found',
            message: `No listing found for vehicle ID "${id}". It may have been sold or removed.`,
          });
          setIsLoading(false);
          return;
        }

        if (err.status === 400) {
          setErrorState({
            type: 'BAD_REQUEST',
            status: 400,
            title: 'Bad Request',
            message: err.detail || 'Invalid vehicle identifier provided.',
          });
        } else if (err.status === 404) {
          setErrorState({
            type: 'NOT_FOUND',
            status: 404,
            title: 'Vehicle Not Found',
            message: err.detail || `We could not find any vehicle listing for ID "${id}".`,
          });
        } else {
          setErrorState({
            type: 'GENERIC',
            status: err.status || 500,
            title: 'Unable to Load Vehicle',
            message: err.detail || err.message || 'An unexpected error occurred while fetching vehicle details.',
          });
        }
        setIsLoading(false);
      }
    }

    loadVehicle();

    return () => {
      isMounted = false;
    };
  }, [id, isInvalidUuid, setIsDemoMode]);

  const handleCopyId = async () => {
    if (!car?.id) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(car.id);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      showToast?.({
        type: 'info',
        title: 'Copied to Clipboard',
        message: `Car UUID ${car.id} copied to clipboard.`,
      });
    } catch {
      // Fallback
    }
  };

  const handleContactDealer = () => {
    setInquirySent(true);
    showToast?.({
      type: 'success',
      title: 'Inquiry Sent',
      message: `Your inquiry for the ${car?.make} ${car?.model} was submitted to our verified dealer network.`,
    });
  };

  // 1. Invalid UUID View (400 Bad Request)
  if (isInvalidUuid) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-sm bg-amber-50 border border-amber-200 text-amber-600">
          <AlertOctagon className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            400
          </span>
          <span className="text-slate-500 font-semibold">Invalid Request</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Invalid Vehicle ID
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto mb-8 leading-relaxed">
          The vehicle identifier &quot;{id || ''}&quot; is not a valid UUID format. Valid identifiers must follow RFC 4122 format (e.g. 550e8400-e29b-41d4-a716-446655440000).
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleBackToInventory}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all cursor-pointer hover:-translate-x-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Inventory</span>
          </button>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
        <h2 className="text-lg font-bold text-slate-800">Loading vehicle details...</h2>
        <p className="text-xs text-slate-400 mt-1">Retrieving verified specs from inventory database</p>
      </div>
    );
  }

  // 3. Error State: 400 Bad Request or 404 Not Found from API
  if (errorState) {
    const isBadRequest = errorState.type === 'BAD_REQUEST' || errorState.status === 400;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-sm ${
            isBadRequest
              ? 'bg-amber-50 border border-amber-200 text-amber-600'
              : 'bg-rose-50 border border-rose-200 text-rose-600'
          }`}
        >
          {isBadRequest ? (
            <AlertOctagon className="w-8 h-8 sm:w-10 sm:h-10" />
          ) : (
            <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10" />
          )}
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          <span
            className={`px-2 py-0.5 rounded-full ${
              isBadRequest ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {errorState.status || (isBadRequest ? 400 : 404)}
          </span>
          <span className="text-slate-500 font-semibold">
            {isBadRequest ? 'Invalid Request' : 'Listing Missing'}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          {errorState.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto mb-8 leading-relaxed">
          {errorState.message}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleBackToInventory}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/20 transition-all cursor-pointer hover:-translate-x-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Inventory</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Vehicle Detail View
  if (!car) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full animate-in fade-in duration-300">
      {/* Navigation Breadcrumb / Back button */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={handleBackToInventory}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-slate-300 font-medium text-xs sm:text-sm shadow-sm transition-all cursor-pointer hover:-translate-x-0.5"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
          <span>Back to Inventory</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            Verified Listing
          </span>
          <button
            type="button"
            onClick={handleCopyId}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors cursor-pointer"
            title="Share Vehicle Link"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Main Vehicle Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Hero Image Showcase (takes 7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[16/10] w-full bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 group">
            {imgError || !car.imageUrl ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-slate-400 p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-3">
                  <CarIcon className="w-8 h-8 text-slate-400" />
                </div>
                <span className="text-lg font-bold text-white mb-1">
                  {car.make} {car.model}
                </span>
                <span className="text-xs text-slate-400">Photo showcase unavailable</span>
              </div>
            ) : (
              <img
                src={car.imageUrl}
                alt={`${car.make} ${car.model}`}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            )}

            {/* Floating Badges */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <FuelBadge fuelType={car.fuelType} size="md" />
              <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold tracking-wider">
                {car.year}
              </span>
            </div>
          </div>

          {/* Quick trust metrics */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm text-center">
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Inspection</span>
              <span className="text-xs sm:text-sm font-bold text-emerald-600 flex items-center justify-center gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" /> 160-Point Pass
              </span>
            </div>
            <div className="border-x border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 block">History</span>
              <span className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5 block">
                Clean Title
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 block">Warranty</span>
              <span className="text-xs sm:text-sm font-bold text-indigo-600 mt-0.5 block">
                Included
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Vehicle Specification Breakdown (takes 5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Header Title & Pricing */}
          <div className="pb-6 border-b border-slate-100">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">
              {car.make}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 mb-4">
              {car.model}
            </h1>

            <div className="flex items-baseline justify-between gap-2">
              <div>
                <span className="text-xs text-slate-400 font-medium block">Total Price</span>
                <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {formatPrice(car.price)}
                </span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                In Stock
              </span>
            </div>
          </div>

          {/* Specifications Breakdown */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Vehicle Specifications
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {/* Year */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">
                  Model Year
                </span>
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-base">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>{car.year}</span>
                </div>
              </div>

              {/* Mileage */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">
                  Mileage
                </span>
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-base">
                  <Gauge className="w-4 h-4 text-indigo-500" />
                  <span>{formatMileage(car.mileage)}</span>
                </div>
              </div>

              {/* Fuel / Powertrain */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">
                  Powertrain
                </span>
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-base capitalize">
                  <span>{car.fuelType?.replace('_', ' ').toLowerCase()}</span>
                </div>
              </div>

              {/* Verified Status */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">
                  Authentication
                </span>
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* 1-Click UUID Copy Section */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block">
              Listing Identifier
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-slate-700 truncate select-all">
                {car.id}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-slate-200 hover:border-slate-300 shadow-2xs transition-all cursor-pointer shrink-0"
                title="Copy Listing ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy ID'}</span>
              </button>
            </div>
          </div>

          {/* Contact Dealer / Inquiry Action */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleContactDealer}
              disabled={inquirySent}
              className={`w-full py-3.5 px-5 rounded-xl font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                inquirySent
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 hover:shadow-indigo-500/30'
              }`}
            >
              {inquirySent ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Inquiry Submitted</span>
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4" />
                  <span>Contact Dealer / Inquire</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToInventory}
              className="w-full py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer text-center"
            >
              Return to All Listings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarDetailPage;
