// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useTrip } from '../context/TripContext';
import { Trip } from '../types';
import { formatCurrency, getCurrencyConfig } from '../data/currencies';
import { ApkInstallModal } from './ApkInstallModal';
import { OfflineManagerModal } from './OfflineManagerModal';
import { LiveCurrencyConverterModal } from './LiveCurrencyConverterModal';
import { CalendarSyncModal } from './CalendarSyncModal';
import { GeofenceProximityBanner } from './GeofenceProximityBanner';
import {
  Calendar,
  MapPin,
  Clock,
  Plus,
  ArrowRight,
  ChevronRight,
  Star,
  Users,
  Luggage,
  Sparkles,
  Smartphone,
  Compass,
  Map,
  Layers,
  FileText,
  Activity as ActivityIcon,
  Download,
  CalendarCheck,
  Search,
  CheckCircle2,
  Database,
  ArrowRightLeft,
  Wifi,
  Navigation,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    trips,
    user,
    openTrip,
    setActiveScreen,
    baseCurrency,
  } = useTrip();

  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'completed' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showApkModal, setShowApkModal] = useState<boolean>(false);
  const [showOfflineModal, setShowOfflineModal] = useState<boolean>(false);
  const [showForexModal, setShowForexModal] = useState<boolean>(false);
  const [calendarSyncTrip, setCalendarSyncTrip] = useState<Trip | null>(null);

  // Compute key stats
  const totalVisitedPlaces = user.visitedPlaces?.length || 0;
  const uniqueCountries = new Set<string>();
  const uniqueCities = new Set<string>();

  (user.visitedPlaces || []).forEach((p) => {
    if (p.country) uniqueCountries.add(p.country.toLowerCase());
    if (p.city) uniqueCities.add(p.city.toLowerCase());
  });

  trips.forEach((t) => {
    (t.destinations || []).forEach((d) => {
      if (t.status === 'completed' || t.status === 'active') {
        if (d.country) uniqueCountries.add(d.country.toLowerCase());
        if (d.city) uniqueCities.add(d.city.toLowerCase());
      }
    });
  });

  const totalBudgetAcrossTrips = trips.reduce((sum, t) => sum + Number(t.budget || 0), 0);
  const totalSpentAcrossTrips = trips.reduce((sum, t) => {
    const tripExpenses = (t.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
    return sum + tripExpenses;
  }, 0);

  const activeTrip = trips.find((t) => t.status === 'active') || trips[0];
  const upcomingTrips = trips.filter((t) => t.status === 'upcoming');
  const pastTrips = trips.filter((t) => t.status === 'completed');

  const filteredTrips = trips.filter((t) => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchCity = (t.destinations || []).some(
        (d) => d.city.toLowerCase().includes(q) || d.country.toLowerCase().includes(q)
      );
      return matchTitle || matchCity;
    }
    return true;
  });

  const getCountdownDays = (startDateStr: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(startDateStr);
      const diffTime = start.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  const formatDateRange = (startStr: string, endStr: string) => {
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);
      const startFmt = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endFmt = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${startFmt} – ${endFmt}`;
    } catch {
      return `${startStr} – ${endStr}`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      
      {/* 1. Top Quick Utility Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#14171F] border border-zinc-800 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-zinc-300">Quick Tools:</span>
          
          <button
            onClick={() => setShowForexModal(true)}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>FX Converter</span>
          </button>

          <button
            onClick={() => setShowOfflineModal(true)}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Offline Vault</span>
          </button>

          <button
            onClick={() => setShowApkModal(true)}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-sky-400" />
            <span>Install App</span>
          </button>
        </div>

        {/* Global Summary Stats */}
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
          <div>
            <span>Trips: <strong className="text-white">{trips.length}</strong></span>
          </div>
          <div>
            <span>Memories: <strong className="text-amber-400">{totalVisitedPlaces}</strong></span>
          </div>
          <div>
            <span>Budget: <strong className="text-white">{formatCurrency(totalBudgetAcrossTrips, baseCurrency)}</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Active Trip Live Radar (If trips exist and one is active or planned) */}
      {trips.length > 0 && activeTrip && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-400">
              Live GPS Geofencing Radar • Active Trip: {activeTrip.title}
            </span>
            <button
              onClick={() => openTrip(activeTrip.id, 'map')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View Route Map</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <GeofenceProximityBanner trip={activeTrip} />
        </div>
      )}

      {/* 3. Main Dashboard Workspace */}
      {trips.length === 0 ? (
        /* Empty State */
        <div className="p-8 sm:p-12 rounded-2xl bg-[#14171F] border border-zinc-800 text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              No Trips Planned Yet
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Create your first journey with interactive day-by-day itineraries, offline caching, live GPS radar, and calendar sync.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveScreen('new-trip-wizard')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Plan Your First Trip</span>
            </button>
            <button
              onClick={() => setShowApkModal(true)}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-zinc-400" />
              <span>Install Mobile App</span>
            </button>
          </div>

          {/* Quick presets */}
          <div className="pt-6 border-t border-zinc-800/80 max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
              Or Start From a Popular Itinerary Preset
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div
                onClick={() => setActiveScreen('new-trip-wizard')}
                className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors"
              >
                <span className="text-xs font-semibold text-white block">Tokyo & Kyoto (7 Days)</span>
                <span className="text-[11px] text-zinc-400 mt-1 block">Culinary, temples & modern culture</span>
              </div>
              <div
                onClick={() => setActiveScreen('new-trip-wizard')}
                className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors"
              >
                <span className="text-xs font-semibold text-white block">Paris & Rome (5 Days)</span>
                <span className="text-[11px] text-zinc-400 mt-1 block">Art, historic architecture & cafes</span>
              </div>
              <div
                onClick={() => setActiveScreen('new-trip-wizard')}
                className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors"
              >
                <span className="text-xs font-semibold text-white block">Custom Adventure</span>
                <span className="text-[11px] text-zinc-400 mt-1 block">Specify any destination worldwide</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Trips List & Filter Section */
        <section className="space-y-4">
          
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-white">Your Itineraries</h2>
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-mono">
                {filteredTrips.length} {filteredTrips.length === 1 ? 'Trip' : 'Trips'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter trips or cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 selectable-text"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                {(['all', 'upcoming', 'active', 'completed', 'draft'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                      filter === f
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Trip Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrips.map((trip) => {
              const daysLeft = getCountdownDays(trip.startDate);
              const totalSpent = (trip.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
              const totalActivities = (trip.days || []).reduce((s, d) => s + (d.activities || []).length, 0);

              return (
                <div
                  key={trip.id}
                  className="bg-[#14171F] border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition-all group"
                >
                  {/* Card Top */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span
                        className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          trip.status === 'active'
                            ? 'bg-rose-950/60 border-rose-800 text-rose-400'
                            : trip.status === 'upcoming'
                            ? 'bg-sky-950/60 border-sky-800 text-sky-400'
                            : trip.status === 'completed'
                            ? 'bg-zinc-800 border-zinc-700 text-zinc-400'
                            : 'bg-amber-950/60 border-amber-800 text-amber-400'
                        }`}
                      >
                        {trip.status} {trip.status === 'upcoming' && daysLeft > 0 ? `• in ${daysLeft}d` : ''}
                      </span>

                      <span className="text-xs font-mono text-zinc-400">
                        {(trip.days || []).length} Days • {totalActivities} Stops
                      </span>
                    </div>

                    <div>
                      <h3
                        onClick={() => openTrip(trip.id)}
                        className="text-base font-semibold text-white group-hover:text-amber-400 transition-colors cursor-pointer"
                      >
                        {trip.title}
                      </h3>
                      <p className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span>{(trip.destinations || []).map((d) => d.city).join(' → ') || 'Custom Route'}</span>
                      </p>
                    </div>

                    <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{formatDateRange(trip.startDate, trip.endDate)}</span>
                    </div>
                  </div>

                  {/* Budget & Progress */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-800/80">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-zinc-400">Expenses</span>
                      <span className="text-amber-400 font-semibold">
                        {formatCurrency(totalSpent, baseCurrency)} / {formatCurrency(trip.budget, baseCurrency)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round((totalSpent / (trip.budget || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => openTrip(trip.id, 'itinerary')}
                      className="flex-1 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Open Plan</span>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                    </button>

                    <button
                      onClick={() => setCalendarSyncTrip(trip)}
                      className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
                      title="Sync with Calendar (.ICS / Google Calendar)"
                    >
                      <CalendarCheck className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Modals */}
      <ApkInstallModal isOpen={showApkModal} onClose={() => setShowApkModal(false)} />
      <OfflineManagerModal isOpen={showOfflineModal} onClose={() => setShowOfflineModal(false)} />
      <LiveCurrencyConverterModal isOpen={showForexModal} onClose={() => setShowForexModal(false)} />
      {calendarSyncTrip && (
        <CalendarSyncModal
          trip={calendarSyncTrip}
          isOpen={true}
          onClose={() => setCalendarSyncTrip(null)}
        />
      )}
    </div>
  );
};
