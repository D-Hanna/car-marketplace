import { Search, RotateCcw, Filter, DollarSign, Calendar, X } from 'lucide-react';

const PRICE_PRESETS = [
  { label: 'Any Price', value: '' },
  { label: 'Under $30k', value: '30000' },
  { label: 'Under $50k', value: '50000' },
  { label: 'Under $75k', value: '75000' },
  { label: 'Under $100k', value: '100000' },
  { label: 'Under $150k', value: '150000' },
];

const YEAR_PRESETS = [
  { label: 'Any Year', value: '' },
  { label: '2024+', value: '2024' },
  { label: '2023+', value: '2023' },
  { label: '2022+', value: '2022' },
  { label: '2020+', value: '2020' },
  { label: '2018+', value: '2018' },
  { label: '2015+', value: '2015' },
];

export function FilterBar({ filters, onChange, onReset, totalMatches = 0 }) {
  const activeCount = [
    Boolean(filters.make?.trim()),
    Boolean(filters.maxPrice),
    Boolean(filters.minYear),
  ].filter(Boolean).length;

  const handleMakeChange = (e) => {
    onChange({ ...filters, make: e.target.value });
  };

  const handleMaxPriceChange = (value) => {
    onChange({ ...filters, maxPrice: value });
  };

  const handleMinYearChange = (value) => {
    onChange({ ...filters, minYear: value });
  };

  const clearMake = () => {
    onChange({ ...filters, make: '' });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-8">
      {/* Top Filter Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
            Filter & Search Catalog
          </h2>
          {activeCount > 0 ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
              {activeCount} active
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-normal">
              ({totalMatches} available)
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset all filters</span>
          </button>
        )}
      </div>

      {/* Filter Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
        {/* Make Search (takes 5 cols) */}
        <div className="md:col-span-5 relative">
          <label htmlFor="make-search" className="block text-xs font-medium text-slate-600 mb-1">
            Search Make / Brand
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="make-search"
              type="text"
              value={filters.make || ''}
              onChange={handleMakeChange}
              placeholder="e.g. Tesla, BMW, Porsche..."
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
            />
            {filters.make && (
              <button
                type="button"
                onClick={clearMake}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                aria-label="Clear make filter"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Max Price Filter (takes 4 cols) */}
        <div className="md:col-span-4">
          <label htmlFor="max-price-select" className="block text-xs font-medium text-slate-600 mb-1">
            Max Price ($ USD)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <select
              id="max-price-select"
              value={filters.maxPrice || ''}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all cursor-pointer appearance-none"
            >
              {PRICE_PRESETS.map((preset) => (
                <option key={preset.label} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Min Year Filter (takes 3 cols) */}
        <div className="md:col-span-3">
          <label htmlFor="min-year-select" className="block text-xs font-medium text-slate-600 mb-1">
            Min Year
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <select
              id="min-year-select"
              value={filters.minYear || ''}
              onChange={(e) => handleMinYearChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all cursor-pointer appearance-none"
            >
              {YEAR_PRESETS.map((preset) => (
                <option key={preset.label} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
