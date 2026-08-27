import React, { useState, useEffect } from 'react';
import { useTrip } from '../context/TripContext';
import { SUPPORTED_CURRENCIES, formatCurrency, getCurrencyConfig } from '../data/currencies';
import { GoogleAuthModal } from './GoogleAuthModal';
import { ApkInstallModal } from './ApkInstallModal';
import { OfflineManagerModal } from './OfflineManagerModal';
import { LiveCurrencyConverterModal } from './LiveCurrencyConverterModal';
import {
  Plus,
  Smartphone,
  ChevronDown,
  Compass,
  Luggage,
  MapPin,
  TrendingUp,
  Database,
  ArrowRightLeft,
  Wifi,
  WifiOff,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeScreen,
    setActiveScreen,
    setActiveTripId,
    user,
    trips,
    baseCurrency,
    setBaseCurrency,
  } = useTrip();

  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(false);
  const [showApkModal, setShowApkModal] = useState<boolean>(false);
  const [showOfflineModal, setShowOfflineModal] = useState<boolean>(false);
  const [showForexModal, setShowForexModal] = useState<boolean>(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Stats calculation
  const totalVisitedPlaces = user.visitedPlaces?.length || 0;
  const currentCurrency = getCurrencyConfig(baseCurrency);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#0C0E14] border-b border-zinc-800 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-6 lg:gap-8">
              <button
                onClick={() => {
                  setActiveTripId(null);
                  setActiveScreen('dashboard');
                }}
                className="flex items-center gap-2.5 text-left group transition-transform active:scale-98 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg tracking-tight text-white group-hover:text-amber-400 transition-colors">
                      TripLink
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono font-medium">
                      v2.0
                    </span>
                  </div>
                </div>
              </button>

              {/* Desktop Navigation Tabs */}
              <nav className="hidden md:flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => {
                    setActiveTripId(null);
                    setActiveScreen('dashboard');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeScreen === 'dashboard'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  Trips
                </button>

                <button
                  onClick={() => {
                    setActiveTripId(null);
                    setActiveScreen('visited-memory-hub');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeScreen === 'visited-memory-hub'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <span>Memory Vault</span>
                  {totalVisitedPlaces > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold">
                      {totalVisitedPlaces}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveTripId(null);
                    setActiveScreen('cross-trip-analytics');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1 cursor-pointer ${
                    activeScreen === 'cross-trip-analytics'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Analytics</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTripId(null);
                    setActiveScreen('packing-templates');
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1 cursor-pointer ${
                    activeScreen === 'packing-templates'
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                  }`}
                >
                  <Luggage className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Packing Library</span>
                </button>
              </nav>
            </div>

            {/* Right Quick Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Offline Cache Status Pill */}
              <button
                onClick={() => setShowOfflineModal(true)}
                className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                  isOnline
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
                    : 'bg-amber-950/40 border-amber-800 text-amber-400'
                }`}
                title="IndexedDB Offline Storage Status"
              >
                {isOnline ? (
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span className="text-[11px] font-mono">
                  {isOnline ? 'Offline Ready' : 'Offline Mode'}
                </span>
              </button>

              {/* Live FX Rates Converter Button */}
              <button
                onClick={() => setShowForexModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs font-mono font-semibold text-zinc-200 transition-colors cursor-pointer"
                title="Open Live Currency Converter"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400 font-bold">{currentCurrency.code}</span>
                <span className="text-zinc-400 hidden sm:inline">({currentCurrency.symbol})</span>
              </button>

              {/* Install PWA / App */}
              <button
                onClick={() => setShowApkModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition-colors cursor-pointer"
                title="Install app on your device"
              >
                <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-[11px]">Install</span>
              </button>

              {/* Plan Trip CTA */}
              <button
                onClick={() => {
                  setActiveTripId(null);
                  setActiveScreen('new-trip-wizard');
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold tracking-wide btn-tactile cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Plan Trip</span>
              </button>

              {/* Profile Button */}
              <button
                onClick={() => setShowGoogleModal(true)}
                className="flex items-center gap-1.5 p-1 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 transition-all cursor-pointer relative"
                title={user.googleUser ? `Connected as ${user.name}` : 'Account Settings'}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold text-white overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{user.name ? user.name.slice(0, 2).toUpperCase() : 'ME'}</span>
                  )}
                </div>

                {user.googleDriveConnected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5" />
                )}
              </button>

            </div>
          </div>

          {/* Mobile Tab Bar */}
          <div className="flex md:hidden overflow-x-auto py-2.5 gap-2 border-t border-zinc-800/80 no-scrollbar text-xs font-medium">
            <button
              onClick={() => {
                setActiveTripId(null);
                setActiveScreen('dashboard');
              }}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-colors ${
                activeScreen === 'dashboard'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Trips
            </button>
            <button
              onClick={() => {
                setActiveTripId(null);
                setActiveScreen('visited-memory-hub');
              }}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1 ${
                activeScreen === 'visited-memory-hub'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Memory Vault</span>
              {totalVisitedPlaces > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 font-mono">
                  {totalVisitedPlaces}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTripId(null);
                setActiveScreen('cross-trip-analytics');
              }}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-colors ${
                activeScreen === 'cross-trip-analytics'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => {
                setActiveTripId(null);
                setActiveScreen('packing-templates');
              }}
              className={`px-3 py-1 rounded-lg whitespace-nowrap transition-colors ${
                activeScreen === 'packing-templates'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Packing
            </button>
            <button
              onClick={() => setShowOfflineModal(true)}
              className="px-3 py-1 rounded-lg whitespace-nowrap text-zinc-300 font-semibold bg-zinc-800 border border-zinc-700"
            >
              Offline Vault
            </button>
          </div>
        </div>
      </header>

      {/* Modals */}
      <GoogleAuthModal isOpen={showGoogleModal} onClose={() => setShowGoogleModal(false)} />
      <ApkInstallModal isOpen={showApkModal} onClose={() => setShowApkModal(false)} />
      <OfflineManagerModal isOpen={showOfflineModal} onClose={() => setShowOfflineModal(false)} />
      <LiveCurrencyConverterModal isOpen={showForexModal} onClose={() => setShowForexModal(false)} />
    </>
  );
};

