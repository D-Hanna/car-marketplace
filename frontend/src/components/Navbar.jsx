import { Link } from 'react-router-dom';
import { Car, Plus, Sparkles } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export function Navbar({ onOpenAddCar, carCount = 0, isLoading = false }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-500/20 group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  AutoMarket
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  CarSphere
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Premium verified car marketplace
              </p>
            </div>
          </Link>

          {/* Right Section: Theme toggle, Stats badge & Action button */}
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>
                {isLoading ? (
                  'Updating listings...'
                ) : (
                  <>
                    <strong className="text-slate-900 dark:text-white font-semibold">{carCount}</strong> {carCount === 1 ? 'vehicle' : 'vehicles'} available
                  </>
                )}
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenAddCar}
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium text-sm shadow-sm hover:shadow-md hover:shadow-indigo-500/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>List Your Car</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
