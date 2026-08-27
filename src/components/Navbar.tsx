import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { SUPPORTED_CURRENCIES, formatCurrency, getCurrencyConfig } from '../data/currencies';
import { GoogleAuthModal } from './GoogleAuthModal';
import { ApkInstallModal } from './ApkInstallModal';
import {
  Compass,
  Plus,
  BookmarkCheck,
  BarChart3,
  Luggage,
  Sparkles,
  Plane,
  Smartphone,
  HardDrive,
  Globe,
  ChevronDown,
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
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState<boolean>(false);

  // Cross-trip stats calculation
  const totalVisitedPlaces = user.visitedPlaces.length;
  const uniqueCountries = new Set<string>();
  const uniqueCities = new Set<string>();

  user.visitedPlaces.forEach((p) => {
    if (p.country) uniqueCountries.add(p.country.toLowerCase());
    if (p.city) uniqueCities.add(p.city.toLowerCase());
  });

  trips.forEach((t) => {
    t.destinations.forEach((d) => {
      if (t.status === 'completed' || t.status === 'active') {
        if (d.country) uniqueCountries.add(d.country.toLowerCase());
        if (d.city) uniqueCities.add(d.city.toLowerCase());
      }
    });
  });

  const lifetimeSpendUSD = trips.reduce((sum, t) => {
    const tripExpenses = t.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    return sum + tripExpenses;
  }, 0);

  const currentCurrency = getCurrencyConfig(baseCurrency);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FDFCFB]/95 backdrop-blur-md border-b border-[#E5E1DA] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20">
            
            {/* Brand & Connected Tagline */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => {
                  setActiveTripId(null);
                  setActiveScreen('dashboard');
                }}
                className="flex items-center gap-3 text-left group transition-transform active:scale-98 cursor-pointer"
              >
                <h1 className="font-serif text-2xl sm:text-3xl font-light italic tracking-tight text-[#1A1A1A] hover:opacity-80 transition-opacity">
                  TripLink
                </h1>
              </button>

              {/* Desktop Navigation Links */}
              <nav className="hidden md:flex items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8C8881]">
                <button
                  onClick={() => {
                    setActiveTripId(null);
                    setActiveScreen('dashboard');
                  }}
                  className={`transition-colors pb-1 cursor-pointer ${
                    activeScreen === 'dashboard'
                      ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A] font-bold'
                      : 'hover:text-[#1A1A1A]'
                  }`}
                >
                  Dashboard
                </button>

                <button
                  onClick={() => {
                    setActiveTripId(null);
                    setActiveScreen('visited-memory-hub');
                  }}
                  className={`transition-colors pb-1 flex items-center gap-1.5 cursor-pointer ${
                    activeScreen === 'visited-memory-hub'
                      ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A] font-bold'
                      : 'hover:text-[#1A1A1A]'
                  }`}
                >
                  <span>Visited Memory</span>
                  <span className="text-[10px] font-mono font-normal opacity-75">
                    ({totalVisitedPlaces})
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveTripId(null);
                    setActiveScreen('cross-trip-analytics');
                  }}
                  className={`transition-colors pb-1 cursor-pointer ${
                    activeScreen === 'cross-trip-analytics'
                      ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A] font-bold'
                      : 'hover:text-[#1A1A1A]'
                  }`}
                >
                  Global Spend & Stats
                </button>

                <button
                  onClick={() => {
                    setActiveTripId(null);
                    setActiveScreen('packing-templates');
                  }}
                  className={`transition-colors pb-1 cursor-pointer ${
                    activeScreen === 'packing-templates'
                      ? 'text-[#1A1A1A] border-b-2 border-[#1A1A1A] font-bold'
                      : 'hover:text-[#1A1A1A]'
                  }`}
                >
                  Library
                </button>
              </nav>
            </div>

            {/* Right Actions: Currency, Install APK, Google Account */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Currency Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#E5E1DA] bg-white hover:border-[#1A1A1A] text-xs font-mono font-bold text-[#1A1A1A] transition-colors cursor-pointer shadow-2xs"
                  title="Change Base Currency"
                >
                  <span>{currentCurrency.code}</span>
                  <span className="text-[#8C8881]">({currentCurrency.symbol})</span>
                  <ChevronDown className="w-3 h-3 text-[#8C8881]" />
                </button>

                {showCurrencyDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-[#E5E1DA] shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-64 overflow-y-auto">
                    <div className="px-3 py-1 text-[9px] font-mono font-bold uppercase text-[#8C8881] border-b border-[#E5E1DA]">
                      Select Base Currency
                    </div>
                    {SUPPORTED_CURRENCIES.map((curr) => (
                      <button
                        key={curr.code}
                        onClick={() => {
                          setBaseCurrency(curr.code);
                          setShowCurrencyDropdown(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-[#FDFCFB] transition-colors cursor-pointer ${
                          curr.code === baseCurrency ? 'font-bold text-[#1A1A1A] bg-stone-50' : 'text-[#8C8881]'
                        }`}
                      >
                        <span>{curr.name}</span>
                        <span className="font-mono font-bold">{curr.symbol} {curr.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Install App / Roll out APK button */}
              <button
                onClick={() => setShowApkModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FDFCFB] hover:bg-stone-100 border border-[#E5E1DA] text-xs font-semibold text-[#1A1A1A] transition-colors cursor-pointer shadow-2xs"
                title="Roll out mobile app / APK"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#1A1A1A]" />
                <span className="text-[11px]">Install App</span>
              </button>

              {/* Minimalist Lifetime Footprint Pill */}
              <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#8C8881] border border-[#E5E1DA] bg-white px-3 py-1.5 rounded-full">
                <span>{uniqueCountries.size} Countries</span>
                <span className="text-[#E5E1DA]">•</span>
                <span className="text-[#1A1A1A] font-mono">
                  {formatCurrency(lifetimeSpendUSD, baseCurrency)} Total
                </span>
              </div>

              {/* Create New Journey Button */}
              <button
                onClick={() => {
                  setActiveTripId(null);
                  setActiveScreen('new-trip-wizard');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A1A1A] hover:bg-black text-white text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>Plan Trip</span>
              </button>

              {/* Google Account Profile Button with Drive Sync status */}
              <button
                onClick={() => setShowGoogleModal(true)}
                className="flex items-center gap-1.5 p-1 rounded-full border border-[#E5E1DA] hover:border-[#1A1A1A] bg-white transition-colors cursor-pointer relative"
                title={user.googleUser ? `Connected as ${user.name}` : 'Connect Google Account & Drive'}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E5E1DA] text-[10px] font-bold text-[#1A1A1A] overflow-hidden">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    'HY'
                  )}
                </div>

                {user.googleDriveConnected && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute -top-0.5 -right-0.5" />
                )}
              </button>

            </div>
          </div>

          {/* Mobile Navigation Bar */}
          <div className="flex md:hidden overflow-x-auto py-2.5 gap-4 border-t border-[#E5E1DA] no-scrollbar text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
            <button
              onClick={() => {
                setActiveTripId(null);
                setActiveScreen('dashboard');
              }}
              className={`whitespace-nowrap ${
                activeScreen === 'dashboard' ? 'text-[#1A1A1A] font-extrabold border-b border-[#1A1A1A] pb-0.5' : 'hover:text-[#1A1A1A]'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setActiveTripId(null);
                setActiveScreen('visited-memory-hub');
              }}
              className={`whitespace-nowrap ${
                activeScreen === 'visited-memory-hub' ? 'text-[#1A1A1A] font-extrabold border-b border-[#1A1A1A] pb-0.5' : 'hover:text-[#1A1A1A]'
              }`}
            >
              Memory ({totalVisitedPlaces})
            </button>
            <button
              onClick={() => {
                setActiveTripId(null);
                setActiveScreen('cross-trip-analytics');
              }}
              className={`whitespace-nowrap ${
                activeScreen === 'cross-trip-analytics' ? 'text-[#1A1A1A] font-extrabold border-b border-[#1A1A1A] pb-0.5' : 'hover:text-[#1A1A1A]'
              }`}
            >
              Global Spend
            </button>
            <button
              onClick={() => {
                setActiveTripId(null);
                setActiveScreen('packing-templates');
              }}
              className={`whitespace-nowrap ${
                activeScreen === 'packing-templates' ? 'text-[#1A1A1A] font-extrabold border-b border-[#1A1A1A] pb-0.5' : 'hover:text-[#1A1A1A]'
              }`}
            >
              Library
            </button>
            <button
              onClick={() => setShowApkModal(true)}
              className="whitespace-nowrap text-amber-800 font-bold"
            >
              📱 Roll out APK
            </button>
          </div>
        </div>
      </header>

      {/* Modals */}
      <GoogleAuthModal isOpen={showGoogleModal} onClose={() => setShowGoogleModal(false)} />
      <ApkInstallModal isOpen={showApkModal} onClose={() => setShowApkModal(false)} />
    </>
  );
};
