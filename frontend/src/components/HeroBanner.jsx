import { ShieldCheck, Zap, Award, Sparkles, Plus } from 'lucide-react';

export function HeroBanner({ onOpenAddCar }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 mb-8 shadow-xl">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Curated Premium Marketplace</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-4">
          Discover, Buy & List <br />
          <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-indigo-100 bg-clip-text text-transparent">
            Exceptional Vehicles
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 mb-6 max-w-xl leading-relaxed">
          Explore our certified catalog of electric, hybrid, and performance sports cars. Verified mileage, complete specifications, and transparent dealer pricing.
        </p>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button
            type="button"
            onClick={onOpenAddCar}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>List a Vehicle</span>
          </button>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-300 pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Verified Specs</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Next-Gen Powertrains</span>
          </div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-sky-400" />
            <span>Certified Dealerships</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;
