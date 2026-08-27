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
  Compass,
} from 'lucide-react';

export const CrossTripAnalytics: React.FC = () => {
  const { trips, user, baseCurrency } = useTrip();

  // Aggregate stats
  const uniqueCountries = useMemo(() => {
    const set = new Set<string>();
    (user.visitedPlaces || []).forEach((p) => p.country && set.add(p.country));
    trips.forEach((t) => (t.destinations || []).forEach((d) => d.country && set.add(d.country)));
    return Array.from(set);
  }, [trips, user]);

  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    (user.visitedPlaces || []).forEach((p) => p.city && set.add(p.city));
    trips.forEach((t) => (t.destinations || []).forEach((d) => d.city && set.add(d.city)));
    return Array.from(set);
  }, [trips, user]);

  const totalDaysOnRoad = useMemo(() => {
    return trips.reduce((sum, t) => sum + ((t.days || []).length || 0), 0);
  }, [trips]);

  const lifetimeSpend = useMemo(() => {
    return trips.reduce((sum, t) => {
      return sum + (t.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
    }, 0);
  }, [trips]);

  // Style tags distribution
  const styleStats = useMemo(() => {
    const map: Record<string, number> = {};
    trips.forEach((t) => {
      (t.styleTags || []).forEach((tag) => {
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
      const spend = (t.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
      if (!map[year]) {
        map[year] = { year, spend: 0, tripCount: 0, days: 0 };
      }
      map[year].spend += spend;
      map[year].tripCount += 1;
      map[year].days += (t.days || []).length || 1;
    });
    return Object.values(map).sort((a, b) => a.year.localeCompare(b.year));
  }, [trips]);

  const maxYearSpend = Math.max(...yearlySpend.map((y) => y.spend), 1);
  const currencyConfig = getCurrencyConfig(baseCurrency);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Header */}
      <section className="luxury-card-elevated rounded-3xl p-6 sm:p-8 shadow-2xl border-white/[0.1] space-y-6">
        <div className="space-y-2 max-w-2xl">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E5C578]">
            Global Travel Intelligence
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-white">
            Lifetime Cross-Trip Analytics
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-light">
            Unified analytics synthesizing all completed memories, active expeditions, and future horizons into persistent global metrics.
          </p>
        </div>

        {/* 4 Lifetime Scorecards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="luxury-card p-5 rounded-2xl border-white/[0.08]">
            <div className="flex items-center justify-between text-stone-400 text-[10px] font-mono font-bold uppercase tracking-widest">
              <span>Countries</span>
              <Globe2 className="w-3.5 h-3.5 text-[#E5C578]" />
            </div>
            <div className="mt-2">
              <span className="font-serif text-3xl sm:text-4xl font-light text-white">
                {uniqueCountries.length}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">Explored</span>
            </div>
          </div>

          <div className="luxury-card p-5 rounded-2xl border-white/[0.08]">
            <div className="flex items-center justify-between text-stone-400 text-[10px] font-mono font-bold uppercase tracking-widest">
              <span>Cities</span>
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="mt-2">
              <span className="font-serif text-3xl sm:text-4xl font-light text-white">
                {uniqueCities.length}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">Locales</span>
            </div>
          </div>

          <div className="luxury-card p-5 rounded-2xl border-white/[0.08]">
            <div className="flex items-center justify-between text-stone-400 text-[10px] font-mono font-bold uppercase tracking-widest">
              <span>Days On Road</span>
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="mt-2">
              <span className="font-serif text-3xl sm:text-4xl font-light text-white">
                {totalDaysOnRoad}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5">Days Traversed</span>
            </div>
          </div>

          <div className="luxury-card p-5 rounded-2xl border-white/[0.08]">
            <div className="flex items-center justify-between text-stone-400 text-[10px] font-mono font-bold uppercase tracking-widest">
              <span>Lifetime Spend</span>
              <DollarSign className="w-3.5 h-3.5 text-[#E5C578]" />
            </div>
            <div className="mt-2">
              <span className="font-serif text-3xl sm:text-4xl font-light text-[#E5C578] font-mono">
                {formatCurrency(lifetimeSpend, baseCurrency)}
              </span>
              <span className="text-[10px] text-stone-400 block mt-0.5 font-mono">Base Currency</span>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Year Travel Spend Charts & Style Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Year-by-Year Bar Chart (2 Columns) */}
        <div className="lg:col-span-2 luxury-card rounded-3xl p-6 sm:p-8 border-white/[0.08] space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div>
              <h3 className="font-serif text-xl font-light text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#E5C578]" />
                Year-Over-Year Spend Trajectory
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Financial investment across expeditions in {currencyConfig.name} ({currencyConfig.symbol}).
              </p>
            </div>
          </div>

          {yearlySpend.length === 0 ? (
            <p className="text-xs text-stone-500 italic py-4">No expense records logged yet.</p>
          ) : (
            <div className="space-y-5">
              {yearlySpend.map((y) => {
                const widthPct = Math.max(10, Math.round((y.spend / maxYearSpend) * 100));

                return (
                  <div key={y.year} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="font-serif text-base font-normal text-white">
                        {y.year} ({y.tripCount} {y.tripCount === 1 ? 'Trip' : 'Trips'}, {y.days} Days)
                      </span>
                      <span className="font-mono text-xs font-bold text-[#E5C578]">
                        {formatCurrency(y.spend, baseCurrency)}
                      </span>
                    </div>

                    <div className="w-full bg-white/[0.04] h-3 rounded-full overflow-hidden border border-white/[0.08]">
                      <div
                        className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E5C578] transition-all duration-700"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Travel Style Distribution (1 Column) */}
        <div className="luxury-card rounded-3xl p-6 sm:p-8 border-white/[0.08] space-y-6 flex flex-col justify-between">
          <div className="space-y-1 border-b border-white/[0.08] pb-4">
            <h3 className="font-serif text-xl font-light text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E5C578]" />
              Travel Archetype
            </h3>
            <p className="text-xs text-stone-400">
              Style tags influencing AI itinerary composition.
            </p>
          </div>

          {styleStats.length === 0 ? (
            <p className="text-xs text-stone-500 italic py-4">Create trips to establish style distribution.</p>
          ) : (
            <div className="space-y-3.5 flex-1 pt-2">
              {styleStats.map(([style, count]) => {
                const totalStyles = trips.reduce((s, t) => s + (t.styleTags || []).length, 0);
                const pct = Math.round((count / (totalStyles || 1)) * 100);

                return (
                  <div key={style} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize font-medium text-stone-200">{style}</span>
                      <span className="text-stone-400 font-mono">{pct}% ({count})</span>
                    </div>
                    <div className="w-full bg-white/[0.04] h-2 rounded-full overflow-hidden border border-white/[0.08]">
                      <div
                        className="h-full bg-[#E5C578]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-3 border-t border-white/[0.08] bg-white/[0.02] p-3.5 rounded-2xl text-[10px] text-stone-400">
            <span className="font-bold text-white uppercase tracking-wider block font-mono">AI Adaptive Engine:</span>
            Itinerary generation continuously adapts to your top travel styles.
          </div>
        </div>

      </div>

      {/* Passport Stamps Collection */}
      <section className="luxury-card rounded-3xl p-6 sm:p-8 border-white/[0.08] space-y-6">
        <div className="space-y-1 border-b border-white/[0.08] pb-4">
          <h3 className="font-serif text-2xl font-light text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-[#E5C578]" />
            Passport Footprint & Destinations
          </h3>
          <p className="text-xs text-stone-400">
            Digital stamps acquired from all cataloged destinations and expeditions.
          </p>
        </div>

        {uniqueCountries.length === 0 ? (
          <div className="text-center py-8 text-stone-500">
            <Compass className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No passport stamps recorded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {uniqueCountries.map((country, idx) => (
              <div
                key={country}
                className="p-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-center space-y-2 hover:border-[#E5C578]/50 hover:bg-white/[0.04] transition-all cursor-default group"
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8C6B1B] p-[1px] mx-auto shadow-md">
                  <div className="w-full h-full bg-[#0E1017] rounded-[15px] flex items-center justify-center font-serif text-xs font-bold text-[#E5C578]">
                    {country.substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <div>
                  <h4 className="font-serif font-medium text-xs text-white truncate group-hover:text-[#E5C578] transition-colors">
                    {country}
                  </h4>
                  <span className="text-[9px] uppercase tracking-widest text-stone-400 font-mono">
                    Stamp #{idx + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};
