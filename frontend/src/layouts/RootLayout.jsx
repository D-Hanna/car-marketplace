import { useState, useCallback } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Toast from '../components/Toast';
import { Info } from 'lucide-react';

export function RootLayout() {
  const [toast, setToast] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [carCount, setCarCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const showToast = useCallback((toastData) => {
    setToast(toastData);
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  const handleOpenAddCar = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenAddCar={handleOpenAddCar}
        carCount={carCount}
        isLoading={isLoading}
      />

      {/* Demo / Offline notice if backend is not running */}
      {isDemoMode && (
        <div
          role="status"
          className="bg-amber-500/10 border-b border-amber-500/20 py-2.5 px-4 text-xs text-amber-800 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Demo Mode Active:</strong> Spring Boot backend (<code>http://localhost:8080</code>) is starting or offline. Displaying local verified catalog samples.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Routed Content */}
      <main className="flex-1 w-full">
        <Outlet
          context={{
            showToast,
            isDemoMode,
            setIsDemoMode,
            carCount,
            setCarCount,
            isLoading,
            setIsLoading,
            isAddModalOpen,
            setIsAddModalOpen,
          }}
        />
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link to="/" className="font-bold text-slate-800 hover:text-indigo-600 transition-colors">
              AutoMarket
            </Link>
            <span>•</span>
            <span>CarSphere Marketplace Platform</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <span>Built strictly to OpenAPI 3.0 specification</span>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

export default RootLayout;
