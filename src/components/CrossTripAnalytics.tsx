import React, { useMemo } from 'react';
import { useTrip } from '../context/TripContext';
import { formatCurrency, getCurrencyConfig } from '../data/currencies';
import {
  Globe2,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Sparkles,
} from 'lucide-react';

export const CrossTripAnalytics: React.FC = () => {
  const { trips, user, baseCurrency } = useTrip();

  // Aggregate stats
  const uniqueCountries = useMemo(() => {
    const set = new Set<string>();
    user.visitedPlaces.forEach((p) => p.country && set.add(p.country));
    trips.forEach((t) => t.destinations.forEach((d) => d.country && set.add(d.country)));
    return Array.from(set);
  }, [trips, user]);

  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    user.visitedPlaces.forEach((p) => p.city && set.add(p.city));
    trips.forEach((t) => t.destinations.forEach((d) => d.city && set.add(d.city)));
    return Array.from(set);
  }, [trips, user]);

  const totalDaysOnRoad = useMemo(() => {
    return trips.reduce((sum, t) => sum + (t.days.length || 0), 0);
  }, [trips]);

  const lifetimeSpend = useMemo(() => {
    return trips.reduce((sum, t) => {
      return sum + t.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    }, 0);
  }, [trips]);

  // Style tags distribution
  const styleStats = useMemo(() => {
    const map: Record<string, number> = {};
    trips.forEach((t) => {
      t.styleTags.forEach((tag) => {
        map[tag] = (map[tag] || 0) + 1;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [trips]);

  // Yearly spend
  const yearlySpend = useMemo(() => {
    const map: Record<string, { year: string; spend: number; tripCount: number; days: number }> = {};
    trips.forEach((t) => {
      const year = new Date(t.startDate).getFullYear().toString();
      const spend = t.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
      if (!map[year]) {
        map[year] = { year, spend: 0, tripCount: 0, days: 0 };
      }
      map[year].spend += spend;
      map[year].tripCount += 1;
      map[year].days += t.days.length || 1;
    });
    return Object.values(map).sort((a, b) => a.year.localeCompare(b.year));
  }, [trips]);

  const maxYearSpend = Math.max(...yearlySpend.map((y) => y.spend), 1);
  const currencyConfig = getCurrencyConfig(baseCurrency);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Header */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-[#E5E1DA] space-y-6">
        <div className="space-y-2 max-w-2xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
            Global Travel Intelligence
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-[#1A1A1A]">
            Lifetime Cross-Trip Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#8C8881] leading-relaxed">
            Unified analytics synthesizing all completed memories, active expeditions, and future horizons into persistent global metrics.
          </p>
        </div>

        {/* 4 Lifetime Scorecards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="bg-[#FDFCFB] p-4 sm:p-5 rounded-xl border border-[#E5E1DA]">
            <div className="flex items-center justify-between text-[#8C8881] text-[10px] font-bold uppercase tracking-widest">
              <span>Countries</span>
              <Globe2 className="w-3.5 h-3.5 text-[#1A1A1A]" />
            </div>
            <div className="mt-2">
              <span className="font-serif text-3xl font-light text-[#1A1A1A]">
                {uniqueCountries.length}
              </span>
              <span className="text-[10px] text-[#8C8881] block mt-0.5">Explored</span>
            </div>
          </div>

          <div className="bg-[#FDFCFB] p-4 sm:p-5 rounded-xl border border-[#E5E1DA]">
            <div className="flex items-center justify-between text-[#8C8881] text-[10px] font-bold uppercase tracking-widest">
              <span>Cities</span>
              <MapPin className="w-3.5 h-3.5 text-[#1A1A1A]" />
            </div>
            <div className="mt-2">
              <span className="font-serif text-3xl font-light text-[#1A1A1A]">
                {uniqueCities.length}
              </span>
              <span className="text-[10px] text-[#8C8881] block mt-0.5">Locales</span>
            </div>
          </div>

          <div className="bg-[#FDFCFB] p-4 sm:p-5 rounded-xl border border-[#E5E1DA]">
            <div className="flex items-center justify-between text-[#8C8881] text-[10px] font-bold uppercase tracking-widest">
              <span>Days On Road</span>
              <Calendar className="w-3.5 h-3.5 text-[#1A1A1A]" />
            </div>
            <div className="mt-2">
              <span className="font-serif text-3xl font-light text-[#1A1A1A]">
                {totalDaysOnRoad}
              </span>
              <span className="text-[10px] text-[#8C8881] block mt-0.5">Days Traversed</span>
            </div>
          </div>

          <div className="bg-[#FDFCFB] p-4 sm:p-5 rounded-xl border border-[#E5E1DA]">
            <div className="flex items-center justify-between text-[#8C8881] text-[10px] font-bold uppercase tracking-widest">
              <span>Lifetime Spend</span>
              <DollarSign className="w-3.5 h-3.5 text-[#1A1A1A]" />
            </div>
            <div className="mt-2">
              <span className="font-serif text-3xl font-light text-[#1A1A1A] font-mono">
                {formatCurrency(lifetimeSpend, baseCurrency)}
              </span>
              <span className="text-[10px] text-[#8C8881] block mt-0.5">Tracked in Base Currency</span>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Year Travel Spend Charts & Style Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Year-by-Year Bar Chart (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E1DA] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E5E1DA] pb-4">
            <div>
              <h3 className="font-serif text-xl font-light text-[#1A1A1A] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#1A1A1A]" />
                Year-Over-Year Spend Trajectory
              </h3>
              <p className="text-xs text-[#8C8881] mt-0.5">
                Financial investment across expeditions in {currencyConfig.name} ({currencyConfig.symbol}).
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {yearlySpend.map((y) => {
              const widthPct = Math.max(10, Math.round((y.spend / maxYearSpend) * 100));

              return (
                <div key={y.year} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="font-serif text-base font-normal text-[#1A1A1A]">
                      {y.year} ({y.tripCount} {y.tripCount === 1 ? 'Trip' : 'Trips'}, {y.days} Days)
                    </span>
                    <span className="font-mono text-xs font-bold text-[#1A1A1A]">
                      {formatCurrency(y.spend, baseCurrency)}
                    </span>
                  </div>

                  <div className="w-full bg-[#FDFCFB] h-3 rounded-full overflow-hidden border border-[#E5E1DA]">
                    <div
                      className="h-full bg-[#1A1A1A] transition-all duration-700"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Travel Style Distribution (1 Column) */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E1DA] shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-1 border-b border-[#E5E1DA] pb-4">
            <h3 className="font-serif text-xl font-light text-[#1A1A1A] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1A1A1A]" />
              Travel Archetype
            </h3>
            <p className="text-xs text-[#8C8881]">
              Style tags influencing AI itinerary composition.
            </p>
          </div>

          <div className="space-y-3.5 flex-1 pt-2">
            {styleStats.map(([style, count]) => {
              const totalStyles = trips.reduce((s, t) => s + t.styleTags.length, 0);
              const pct = Math.round((count / (totalStyles || 1)) * 100);

              return (
                <div key={style} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="capitalize font-medium text-[#1A1A1A]">{style}</span>
                    <span className="text-[#8C8881]">{pct}% ({count})</span>
                  </div>
                  <div className="w-full bg-[#FDFCFB] h-2 rounded-full overflow-hidden border border-[#E5E1DA]">
                    <div
                      className="h-full bg-[#D16B4B]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#E5E1DA] bg-[#FDFCFB] p-3 rounded-xl text-[10px] text-[#8C8881]">
            <span className="font-bold text-[#1A1A1A] uppercase tracking-wider block">AI Adaptive Balance:</span>
            Itinerary generation prioritizes your top travel preferences automatically.
          </div>
        </div>

      </div>

      {/* Passport Stamps Collection */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E1DA] shadow-xs space-y-6">
        <div className="space-y-1 border-b border-[#E5E1DA] pb-4">
          <h3 className="font-serif text-2xl font-light text-[#1A1A1A] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#1A1A1A]" />
            Passport Footprint & Destinations
          </h3>
          <p className="text-xs text-[#8C8881]">
            Stamps recorded from your completed and planned journeys.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {uniqueCountries.map((country, idx) => (
            <div
              key={country}
              className="p-4 rounded-xl border border-[#E5E1DA] bg-[#FDFCFB] text-center space-y-2 hover:border-[#1A1A1A] transition-all cursor-default"
            >
              <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-white font-serif font-light text-xs flex items-center justify-center mx-auto shadow-xs">
                {country.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-serif font-medium text-xs text-[#1A1A1A] truncate">
                  {country}
                </h4>
                <span className="text-[9px] uppercase tracking-widest text-[#8C8881] font-mono">
                  Stamp #{idx + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
