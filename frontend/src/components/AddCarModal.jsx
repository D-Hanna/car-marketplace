import { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
} from 'lucide-react';
import { SAMPLE_CAR_IMAGES, FUEL_TYPES } from '../constants/sampleImages';
import { createCar, ApiError } from '../services/carService';

const INITIAL_FORM = {
  make: '',
  model: '',
  year: new Date().getFullYear(),
  mileage: '',
  price: '',
  fuelType: 'ELECTRIC',
  imageUrl: '',
};

function AddCarForm({ onClose, onCarCreated, onShowToast }) {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (name === 'imageUrl') {
      setPreviewError(false);
    }
  };

  const handleSelectSample = (sample) => {
    setFormData((prev) => ({
      ...prev,
      make: sample.make || prev.make,
      model: sample.model || prev.model,
      year: sample.year || prev.year,
      fuelType: sample.fuelType || prev.fuelType,
      imageUrl: sample.url,
      price: prev.price || '45000',
      mileage: prev.mileage || '15000',
    }));
    setPreviewError(false);
    setErrors({});
    setGeneralError(null);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.make?.trim()) {
      newErrors.make = 'Make is required.';
    } else if (formData.make.trim().length > 50) {
      newErrors.make = 'Make cannot exceed 50 characters.';
    }

    if (!formData.model?.trim()) {
      newErrors.model = 'Model is required.';
    } else if (formData.model.trim().length > 50) {
      newErrors.model = 'Model cannot exceed 50 characters.';
    }

    const yearNum = Number(formData.year);
    if (!formData.year || isNaN(yearNum)) {
      newErrors.year = 'Valid year is required.';
    } else if (yearNum < 1900 || yearNum > 2030) {
      newErrors.year = 'Year must be between 1900 and 2030.';
    }

    const mileageNum = Number(formData.mileage);
    if (formData.mileage === '' || isNaN(mileageNum)) {
      newErrors.mileage = 'Mileage is required.';
    } else if (mileageNum < 0) {
      newErrors.mileage = 'Mileage cannot be negative.';
    }

    const priceNum = Number(formData.price);
    if (formData.price === '' || isNaN(priceNum)) {
      newErrors.price = 'Price is required.';
    } else if (priceNum < 0.01) {
      newErrors.price = 'Price must be at least $0.01.';
    }

    if (!formData.fuelType) {
      newErrors.fuelType = 'Fuel type is required.';
    }

    if (!formData.imageUrl?.trim()) {
      newErrors.imageUrl = 'Image URL is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const createdCar = await createCar(formData);
      onShowToast?.({
        type: 'success',
        title: 'Listing Published!',
        message: `${createdCar.make} ${createdCar.model} is now listed in the catalog.`,
      });
      onCarCreated?.(createdCar);
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.invalidParams?.length > 0) {
        const backendErrors = {};
        err.invalidParams.forEach((param) => {
          if (param.name) {
            backendErrors[param.name] = param.reason || 'Invalid value';
          }
        });
        setErrors(backendErrors);
        setGeneralError(err.detail || 'Please correct the highlighted fields.');
      } else {
        setGeneralError(
          err.detail || err.message || 'Failed to create listing. Ensure backend server is reachable.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
      {/* General Error Banner */}
      {generalError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Unable to submit listing</p>
            <p>{generalError}</p>
          </div>
        </div>
      )}

      {/* Quick Preset Selector */}
      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Quick-Pick Sample Vehicles
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SAMPLE_CAR_IMAGES.map((sample) => (
            <button
              key={sample.name}
              type="button"
              onClick={() => handleSelectSample(sample)}
              className={`text-left p-2 rounded-xl border text-xs transition-all flex items-center gap-2 cursor-pointer ${
                formData.imageUrl === sample.url
                  ? 'border-indigo-600 bg-indigo-50/80 text-indigo-900 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <img
                src={sample.url}
                alt={sample.name}
                className="w-9 h-9 rounded-lg object-cover shrink-0"
              />
              <div className="truncate">
                <p className="font-semibold truncate">{sample.make} {sample.model}</p>
                <p className="text-[10px] text-slate-500 capitalize">{sample.fuelType.toLowerCase()}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Make & Model */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="make" className="block text-xs font-semibold text-slate-700 mb-1">
            Make / Manufacturer <span className="text-rose-500">*</span>
          </label>
          <input
            id="make"
            name="make"
            type="text"
            placeholder="e.g. Tesla, BMW, Porsche"
            value={formData.make}
            onChange={handleChange}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
              errors.make
                ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500/20'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 bg-slate-50/50 focus:bg-white'
            }`}
          />
          {errors.make && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.make}</p>
          )}
        </div>

        <div>
          <label htmlFor="model" className="block text-xs font-semibold text-slate-700 mb-1">
            Model Name <span className="text-rose-500">*</span>
          </label>
          <input
            id="model"
            name="model"
            type="text"
            placeholder="e.g. Model 3, M4 Competition"
            value={formData.model}
            onChange={handleChange}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
              errors.model
                ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500/20'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 bg-slate-50/50 focus:bg-white'
            }`}
          />
          {errors.model && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.model}</p>
          )}
        </div>
      </div>

      {/* Year, Mileage, Price */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="year" className="block text-xs font-semibold text-slate-700 mb-1">
            Year <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              id="year"
              name="year"
              type="number"
              min="1900"
              max="2030"
              placeholder="2023"
              value={formData.year}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.year
                  ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 bg-slate-50/50 focus:bg-white'
              }`}
            />
          </div>
          {errors.year && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.year}</p>
          )}
        </div>

        <div>
          <label htmlFor="mileage" className="block text-xs font-semibold text-slate-700 mb-1">
            Mileage (km) <span className="text-rose-500">*</span>
          </label>
          <input
            id="mileage"
            name="mileage"
            type="number"
            min="0"
            placeholder="15000"
            value={formData.mileage}
            onChange={handleChange}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
              errors.mileage
                ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500/20'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 bg-slate-50/50 focus:bg-white'
            }`}
          />
          {errors.mileage && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.mileage}</p>
          )}
        </div>

        <div>
          <label htmlFor="price" className="block text-xs font-semibold text-slate-700 mb-1">
            Price ($ USD) <span className="text-rose-500">*</span>
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="42500"
            value={formData.price}
            onChange={handleChange}
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
              errors.price
                ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500/20'
                : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 bg-slate-50/50 focus:bg-white'
            }`}
          />
          {errors.price && (
            <p className="text-xs text-rose-500 mt-1 font-medium">{errors.price}</p>
          )}
        </div>
      </div>

      {/* Fuel Type */}
      <div>
        <label htmlFor="fuelType" className="block text-xs font-semibold text-slate-700 mb-1">
          Fuel / Powertrain Type <span className="text-rose-500">*</span>
        </label>
        <select
          id="fuelType"
          name="fuelType"
          value={formData.fuelType}
          onChange={handleChange}
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
        >
          {FUEL_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label} ({type.value})
            </option>
          ))}
        </select>
        {errors.fuelType && (
          <p className="text-xs text-rose-500 mt-1 font-medium">{errors.fuelType}</p>
        )}
      </div>

      {/* Image URL & Live Preview */}
      <div>
        <label htmlFor="imageUrl" className="block text-xs font-semibold text-slate-700 mb-1">
          Image URL <span className="text-rose-500">*</span>
        </label>
        <div className="flex gap-3 items-start">
          <div className="flex-1">
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={formData.imageUrl}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                errors.imageUrl
                  ? 'border-rose-400 bg-rose-50/30 focus:ring-rose-500/20'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 bg-slate-50/50 focus:bg-white'
              }`}
            />
            {errors.imageUrl && (
              <p className="text-xs text-rose-500 mt-1 font-medium">{errors.imageUrl}</p>
            )}
          </div>

          {/* Preview Thumbnail */}
          <div className="w-14 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
            {formData.imageUrl && !previewError ? (
              <img
                src={formData.imageUrl}
                alt="Preview"
                onError={() => setPreviewError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </div>
      </div>

      {/* Modal Actions */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Publishing Listing...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Publish Listing</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export function AddCarModal({ isOpen, onClose, onCarCreated, onShowToast }) {
  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200/90 my-8 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 sm:px-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">List a New Vehicle</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in the vehicle specifications to publish your listing instantly.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Inner Form with cleanly initialized state */}
        <AddCarForm
          onClose={onClose}
          onCarCreated={onCarCreated}
          onShowToast={onShowToast}
        />
      </div>
    </div>
  );
}

export default AddCarModal;
