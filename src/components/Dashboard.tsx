import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { Trip } from '../types';
import { formatCurrency, getCurrencyConfig } from '../data/currencies';
import { ApkInstallModal } from './ApkInstallModal';
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
  BookmarkCheck,
  Smartphone,
  Send,
  Zap,
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
  const [showApkModal, setShowApkModal] = useState<boolean>(false);

  // Compute connected cross-trip statistics
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

  const lifetimeSpend = trips.reduce((sum, t) => {
    const tripExpenses = t.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    return sum + tripExpenses;
  }, 0);

  const activeTrip = trips.find((t) => t.status === 'active');
  const upcomingTrips = trips.filter((t) => t.status === 'upcoming');
  const pastTrips = trips.filter((t) => t.status === 'completed');
  const draftTrips = trips.filter((t) => t.status === 'draft');

  const filteredTrips = trips.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const getCountdownDays = (startDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startDateStr);
    const diffTime = start.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10 animate-in fade-in duration-300">
      
      {/* 1. Clean Minimalism 4-Column Stat Header */}
      <header className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#E5E1DA] bg-white rounded-2xl overflow-hidden shadow-xs">
        <div className="flex flex-col border-b sm:border-b-0 sm:border-r border-[#E5E1DA] p-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">Global Footprint</span>
          <span className="mt-1 font-serif text-4xl font-light text-[#1A1A1A]">
            {uniqueCountries.size}<span className="text-lg italic text-[#8C8881] ml-2">countries</span>
          </span>
        </div>

        <div className="flex flex-col border-b sm:border-b-0 lg:border-r border-[#E5E1DA] p-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">Cities Navigated</span>
          <span className="mt-1 font-serif text-4xl font-light text-[#1A1A1A]">
            {uniqueCities.size}<span className="text-lg italic text-[#8C8881] ml-2">locales</span>
          </span>
        </div>

        <div className="flex flex-col border-b sm:border-b-0 sm:border-r border-[#E5E1DA] p-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">Lifetime Investment</span>
          <span className="mt-1 font-serif text-3xl sm:text-4xl font-light text-[#1A1A1A]">
            {formatCurrency(lifetimeSpend, baseCurrency)}
          </span>
        </div>

        <div
          onClick={() => setActiveScreen('new-trip-wizard')}
          className="flex items-center justify-center bg-[#1A1A1A] hover:bg-black p-6 text-white cursor-pointer transition-colors"
        >
          <button className="text-[11px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 cursor-pointer">
            <Sparkles className="w-4 h-4 text-amber-400" />
            + Plan New Journey
          </button>
        </div>
      </header>

      {/* 2. Quick Action Shortcut Banner */}
      <div className="p-4 rounded-2xl bg-[#FDFCFB] border border-[#E5E1DA] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-[#1A1A1A]">⚡ Quick Workflows:</span>
          <button
            onClick={() => setActiveScreen('new-trip-wizard')}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E1DA] text-xs font-semibold text-[#1A1A1A] hover:border-[#1A1A1A] flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Prompt to Journey (Instant)</span>
          </button>
          <button
            onClick={() => setShowApkModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#E5E1DA] text-xs font-semibold text-[#1A1A1A] hover:border-[#1A1A1A] flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
            <span>Roll out Mobile APK / PWA</span>
          </button>
        </div>

        <div className="text-[11px] text-[#8C8881] font-mono">
          Visited Memory: <strong>{totalVisitedPlaces} places protected from repeats</strong>
        </div>
      </div>

      {/* 3. Current & Upcoming Highlight Grid */}
      <section className="space-y-4">
        <div className="flex items-end justify-between border-b border-[#E5E1DA] pb-2">
          <h2 className="font-serif text-2xl font-light text-[#1A1A1A]">Current & Upcoming</h2>
          <span className="text-[11px] font-medium text-[#8C8881] uppercase tracking-wider">
            {upcomingTrips.length + (activeTrip ? 1 : 0) + draftTrips.length} Active Connections
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Active Live Now Card (Terracotta #D16B4B) */}
          {activeTrip ? (
            <div
              onClick={() => openTrip(activeTrip.id, 'itinerary')}
              className="relative h-68 overflow-hidden rounded-2xl bg-[#D16B4B] p-6 text-white shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                  Live Now
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                  {activeTrip.days.length} Days Itinerary
                </span>
              </div>

              <div>
                <h3 className="font-serif text-2xl sm:text-3xl leading-tight">
                  {activeTrip.destinations[0]?.city || activeTrip.title} <br />
                  <span className="italic opacity-80 text-xl font-light">
                    {activeTrip.destinations.slice(1).map((d) => `& ${d.city}`).join(' ') || activeTrip.destinations[0]?.country}
                  </span>
                </h3>
                <p className="mt-2 text-xs font-light opacity-90 truncate">
                  Next: {activeTrip.days[0]?.activities[0]?.name || 'Sunset excursion in city center'}
                </p>
              </div>

              <div className="border-t border-white/20 pt-4">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span>Budget Health</span>
                  <span>
                    {Math.max(0, Math.round((1 - activeTrip.expenses.reduce((s, e) => s + e.amount, 0) / (activeTrip.budget || 1)) * 100))}% Remaining
                  </span>
                </div>
                <div className="mt-2 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((activeTrip.expenses.reduce((s, e) => s + e.amount, 0) / (activeTrip.budget || 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setActiveScreen('new-trip-wizard')}
              className="flex h-68 flex-col justify-between rounded-2xl border border-dashed border-[#E5E1DA] bg-[#F9F8F6] p-6 hover:bg-white transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <span className="rounded-full border border-[#8C8881]/20 bg-[#8C8881]/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  No Live Trip
                </span>
              </div>
              <div className="text-center py-4">
                <h3 className="font-serif text-2xl text-[#1A1A1A] font-light">
                  Ready for adventure?
                </h3>
                <p className="mt-2 text-xs text-[#8C8881]">
                  Create a new itinerary with continuous AI memory.
                </p>
              </div>
              <button className="w-full bg-[#1A1A1A] hover:bg-stone-800 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-all">
                + Launch Itinerary
              </button>
            </div>
          )}

          {/* Upcoming Trip Card 1 (Slate Navy #2D3E50) */}
          {upcomingTrips.slice(0, 1).map((trip) => {
            const daysLeft = getCountdownDays(trip.startDate);
            return (
              <div
                key={trip.id}
                className="flex h-68 flex-col justify-between rounded-2xl border border-[#E5E1DA] bg-white p-6 shadow-xs hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="rounded-full border border-[#2D3E50]/20 bg-[#2D3E50]/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#2D3E50]">
                      {daysLeft > 0 ? `In ${daysLeft} Days` : 'Upcoming'}
                    </span>
                    <Clock className="w-4 h-4 text-[#2D3E50]" />
                  </div>
                  <h3 className="mt-4 font-serif text-2xl text-[#1A1A1A] font-light leading-snug">
                    {trip.title.split(' ')[0]} <br />
                    <span className="italic text-[#8C8881] text-lg">
                      {trip.title.split(' ').slice(1).join(' ') || trip.destinations.map((d) => d.city).join(', ')}
                    </span>
                  </h3>
                  <p className="mt-2 text-xs text-[#8C8881]">
                    {trip.destinations.length} Cities • {trip.styleTags.join(' • ') || 'Curated Style'}
                  </p>
                </div>

                <div className="flex gap-2 mt-auto pt-4 border-t border-[#E5E1DA]/50">
                  <button
                    onClick={() => openTrip(trip.id, 'itinerary')}
                    className="flex-1 border border-[#E5E1DA] py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] hover:bg-[#F9F8F6] transition-colors cursor-pointer"
                  >
                    Edit Plan
                  </button>
                  <button
                    onClick={() => openTrip(trip.id, 'packing')}
                    className="flex-1 bg-[#2D3E50] hover:bg-[#1f2b38] py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white transition-colors cursor-pointer"
                  >
                    Packing List
                  </button>
                </div>
              </div>
            );
          })}

          {/* Draft or Additional Upcoming Card */}
          {draftTrips.length > 0 ? (
            draftTrips.slice(0, 1).map((draft) => (
              <div
                key={draft.id}
                onClick={() => openTrip(draft.id)}
                className="flex h-68 flex-col justify-between rounded-2xl border border-[#E5E1DA] bg-white p-6 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="rounded-full border border-[#6B705C]/20 bg-[#6B705C]/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#6B705C]">
                      Draft
                    </span>
                    <Sparkles className="w-4 h-4 text-[#6B705C]" />
                  </div>
                  <h3 className="mt-4 font-serif text-2xl text-[#1A1A1A] font-light leading-snug">
                    {draft.title.split(' ')[0]} <br />
                    <span className="italic text-[#8C8881] text-lg">
                      {draft.title.split(' ').slice(1).join(' ') || draft.destinations.map((d) => d.city).join(', ')}
                    </span>
                  </h3>
                  <p className="mt-2 text-xs text-[#8C8881]">
                    AI Draft Ready: {draft.days.reduce((s, d) => s + d.activities.length, 0)} Activities Planned
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t border-[#E5E1DA]/50 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {draft.collaborators.map((c) => (
                      <div
                        key={c.id}
                        className="h-7 w-7 rounded-full border-2 border-white bg-[#E5E1DA] flex items-center justify-center text-[10px] font-bold text-[#1A1A1A]"
                      >
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                    ))}
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] flex items-center gap-1">
                    Resume <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          ) : upcomingTrips.length > 1 ? (
            upcomingTrips.slice(1, 2).map((trip) => (
              <div
                key={trip.id}
                onClick={() => openTrip(trip.id)}
                className="flex h-68 flex-col justify-between rounded-2xl border border-[#E5E1DA] bg-white p-6 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="rounded-full border border-[#2D3E50]/20 bg-[#2D3E50]/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#2D3E50]">
                      Upcoming
                    </span>
                    <Clock className="w-4 h-4 text-[#2D3E50]" />
                  </div>
                  <h3 className="mt-4 font-serif text-2xl text-[#1A1A1A] font-light leading-snug">
                    {trip.title}
                  </h3>
                  <p className="mt-2 text-xs text-[#8C8881]">
                    {formatDateRange(trip.startDate, trip.endDate)}
                  </p>
                </div>

                <div className="flex gap-2 mt-auto pt-4 border-t border-[#E5E1DA]/50">
                  <button
                    onClick={() => openTrip(trip.id, 'itinerary')}
                    className="w-full bg-[#1A1A1A] hover:bg-stone-800 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white"
                  >
                    Open Journey
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div
              onClick={() => setActiveScreen('new-trip-wizard')}
              className="flex h-68 flex-col justify-between rounded-2xl border border-[#E5E1DA] bg-white p-6 shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="rounded-full border border-[#6B705C]/20 bg-[#6B705C]/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#6B705C]">
                    Draft Ready
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-2xl text-[#1A1A1A] font-light">
                  Swiss Alps <br />
                  <span className="italic text-[#8C8881] text-lg">Glacier Express Tour</span>
                </h3>
                <p className="mt-2 text-xs text-[#8C8881]">
                  AI Draft Ready: 14 Activities Suggested
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-[#E5E1DA]/50 flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="h-7 w-7 rounded-full border-2 border-white bg-[#E5E1DA] flex items-center justify-center text-[10px] font-bold text-[#1A1A1A]">JD</div>
                  <div className="h-7 w-7 rounded-full border-2 border-white bg-[#D16B4B] flex items-center justify-center text-[10px] font-bold text-white">SA</div>
                </div>
                <button className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">
                  Plan Now →
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* 4. Connected Journey Horizon Timeline */}
      <section className="rounded-2xl border border-[#E5E1DA] bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E1DA] pb-4">
          <div>
            <h3 className="font-serif text-xl font-light text-[#1A1A1A] flex items-center gap-2">
              Connected Journey Horizon
            </h3>
            <p className="text-xs text-[#8C8881] mt-0.5">
              All expeditions across past, active, and upcoming time horizons.
            </p>
          </div>
          
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['all', 'active', 'upcoming', 'completed', 'draft'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest capitalize transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-[#1A1A1A] text-white shadow-xs'
                    : 'text-[#8C8881] hover:text-[#1A1A1A] bg-[#F9F8F6] border border-[#E5E1DA]'
                }`}
              >
                {f} {f === 'all' ? `(${trips.length})` : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Items */}
        <div className="space-y-3 pt-1">
          {filteredTrips.map((trip) => {
            const daysLeft = getCountdownDays(trip.startDate);
            const totalSpent = trip.expenses.reduce((s, e) => s + e.amount, 0);

            return (
              <div
                key={trip.id}
                onClick={() => openTrip(trip.id)}
                className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-[#FDFCFB] hover:bg-[#F9F8F6] border border-[#E5E1DA] transition-all cursor-pointer"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: trip.color || '#1A1A1A' }}
                    />
                    <h4 className="font-serif text-lg font-normal text-[#1A1A1A] group-hover:opacity-80 transition-opacity">
                      {trip.title}
                    </h4>

                    {/* Status Badge */}
                    <span
                      className={`text-[9px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full ${
                        trip.status === 'active'
                          ? 'border border-[#D16B4B]/30 bg-[#D16B4B]/10 text-[#D16B4B]'
                          : trip.status === 'upcoming'
                          ? 'border border-[#2D3E50]/20 bg-[#2D3E50]/5 text-[#2D3E50]'
                          : trip.status === 'completed'
                          ? 'border border-[#8C8881]/20 bg-[#8C8881]/10 text-[#8C8881]'
                          : 'border border-[#6B705C]/20 bg-[#6B705C]/5 text-[#6B705C]'
                      }`}
                    >
                      {trip.status}
                    </span>

                    {trip.status === 'upcoming' && daysLeft > 0 && (
                      <span className="text-[10px] font-mono font-medium text-[#2D3E50]">
                        in {daysLeft}d
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#8C8881]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </span>

                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {trip.destinations.map((d) => d.city).join(', ')}
                    </span>

                    <span className="font-mono text-[#1A1A1A]">
                      {formatCurrency(totalSpent, baseCurrency)} / {formatCurrency(trip.budget, baseCurrency)}
                    </span>

                    {trip.collaborators.length > 1 && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {trip.collaborators.length} travelers
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 md:mt-0 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] group-hover:opacity-70 transition-opacity shrink-0">
                  <span>Open Journey</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. The Archive / Memories Section */}
      <section className="space-y-4">
        <div className="flex items-end justify-between border-b border-[#E5E1DA] pb-2">
          <h2 className="font-serif text-2xl font-light italic text-[#8C8881]">The Archive</h2>
          <button
            onClick={() => setActiveScreen('visited-memory-hub')}
            className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] hover:opacity-70 transition-opacity cursor-pointer"
          >
            View All Memories ({totalVisitedPlaces})
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {user.visitedPlaces.slice(0, 3).map((place, idx) => (
            <div
              key={place.id || idx}
              onClick={() => setActiveScreen('visited-memory-hub')}
              className="group relative h-44 overflow-hidden rounded-xl grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer"
            >
              <img
                src={place.photoUrl || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&auto=format&fit=crop&q=80'}
                alt={place.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">
                  {place.city}, {place.country}
                </p>
                <p className="font-serif text-lg leading-tight truncate">
                  {place.name}
                </p>
              </div>

              <div className="absolute right-3 top-3 h-6 w-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Star className="h-3 w-3 text-white fill-white" />
              </div>
            </div>
          ))}

          {/* + More Memories Card */}
          <div
            onClick={() => setActiveScreen('visited-memory-hub')}
            className="group relative h-44 overflow-hidden rounded-xl bg-[#E5E1DA] flex flex-col items-center justify-center border-2 border-dashed border-[#8C8881]/30 cursor-pointer hover:bg-[#dcd7ce] transition-colors"
          >
            <p className="font-serif text-xl text-[#8C8881] italic">
              + {Math.max(0, user.visitedPlaces.length - 3)} More
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#8C8881] mt-1">
              {user.visitedPlaces.length} total memories
            </p>
          </div>
        </div>
      </section>

      {/* APK Modal */}
      <ApkInstallModal isOpen={showApkModal} onClose={() => setShowApkModal(false)} />
    </div>
  );
};
