import React, { useState, useMemo } from 'react';
import { useTrip } from '../context/TripContext';
import { Trip, ExpenseCategory } from '../types';
import { formatCurrency, getCurrencyConfig } from '../data/currencies';
import {
  DollarSign,
  Plus,
  Trash2,
  BarChart3,
  Building,
  Plane,
  Utensils,
  Car,
  Ticket,
  ShoppingBag,
  HelpCircle,
  X,
  CreditCard,
  TrendingUp,
} from 'lucide-react';

const CATEGORY_ICONS: Record<ExpenseCategory, { label: string; icon: any; color: string; bg: string }> = {
  flights: { label: 'Flights & Transit', icon: Plane, color: 'text-[#E5C578]', bg: 'bg-white/[0.02] border-white/10' },
  stay: { label: 'Hotels & Lodging', icon: Building, color: 'text-[#E5C578]', bg: 'bg-white/[0.02] border-white/10' },
  lodging: { label: 'Hotels & Lodging', icon: Building, color: 'text-[#E5C578]', bg: 'bg-white/[0.02] border-white/10' },
  food: { label: 'Dining & Drinks', icon: Utensils, color: 'text-[#E5C578]', bg: 'bg-white/[0.02] border-white/10' },
  activities: { label: 'Tours & Tickets', icon: Ticket, color: 'text-[#E5C578]', bg: 'bg-white/[0.02] border-white/10' },
  transport: { label: 'Local Transit & Cabs', icon: Car, color: 'text-[#E5C578]', bg: 'bg-white/[0.02] border-white/10' },
  transit: { label: 'Local Transit & Cabs', icon: Car, color: 'text-[#E5C578]', bg: 'bg-white/[0.02] border-white/10' },
  shopping: { label: 'Shopping & Gifts', icon: ShoppingBag, color: 'text-[#E5C578]', bg: 'bg-white/[0.02] border-white/10' },
  other: { label: 'Miscellaneous', icon: HelpCircle, color: 'text-[#E5C578]', bg: 'bg-white/[0.02] border-white/10' },
};

interface BudgetTrackerProps {
  trip?: Trip;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({ trip: propTrip }) => {
  const { trips, activeTrip, addExpense, deleteExpense, user, baseCurrency } = useTrip();

  const currentTrip = propTrip || activeTrip || trips[0];
  const [viewMode, setViewMode] = useState<'single-trip' | 'cross-trip-multiyear'>('single-trip');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Add Expense form state
  const [amount, setAmount] = useState<number>(50);
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState<string>(user.name);

  const currencyConfig = getCurrencyConfig(baseCurrency);

  // Single Trip spend calculations
  const totalSpent = useMemo(() => {
    if (!currentTrip) return 0;
    return (currentTrip.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);
  }, [currentTrip]);

  const budget = currentTrip?.budget || 3000;
  const percentUsed = Math.min(100, Math.round((totalSpent / (budget || 1)) * 100));
  const remaining = Math.max(0, budget - totalSpent);

  // Category breakdown for current trip
  const categoryTotals = useMemo(() => {
    const map: Record<ExpenseCategory, number> = {
      flights: 0,
      stay: 0,
      lodging: 0,
      food: 0,
      activities: 0,
      transport: 0,
      transit: 0,
      shopping: 0,
      other: 0,
    };
    if (!currentTrip) return map;
    (currentTrip.expenses || []).forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount || 0);
    });
    return map;
  }, [currentTrip]);

  // Multi-Year Cross Trip Spend Aggregations
  const multiYearData = useMemo(() => {
    const yearMap: Record<string, { year: string; total: number; trips: Trip[]; avgPerDay: number }> = {};

    trips.forEach((t) => {
      const year = new Date(t.startDate).getFullYear().toString();
      const tripSpend = (t.expenses || []).reduce((s, e) => s + Number(e.amount || 0), 0);

      if (!yearMap[year]) {
        yearMap[year] = { year, total: 0, trips: [], avgPerDay: 0 };
      }
      yearMap[year].total += tripSpend;
      yearMap[year].trips.push(t);
    });

    const years = Object.keys(yearMap).sort();
    return years.map((y) => {
      const entry = yearMap[y];
      const totalDays = entry.trips.reduce((s, t) => s + ((t.days || []).length || 1), 0);
      return {
        ...entry,
        avgPerDay: totalDays > 0 ? Math.round(entry.total / totalDays) : 0,
      };
    });
  }, [trips]);

  const maxYearSpend = Math.max(...multiYearData.map((d) => d.total), 1);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTrip || !description.trim() || amount <= 0) return;

    addExpense(currentTrip.id, {
      amount: Number(amount),
      category,
      description,
      date,
      paidBy,
    });

    setShowAddModal(false);
    setDescription('');
    setAmount(50);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E5C578]">
            Financial Cadence
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#E5C578]" />
            Budget & Expense Tracking
          </h2>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-white/[0.02] p-1 rounded-2xl border border-white/[0.08]">
          <button
            onClick={() => setViewMode('single-trip')}
            className={`px-3.5 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all cursor-pointer ${
              viewMode === 'single-trip'
                ? 'bg-white text-black shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            {currentTrip?.title || 'Trip Budget'}
          </button>

          <button
            onClick={() => setViewMode('cross-trip-multiyear')}
            className={`px-3.5 py-1.5 rounded-xl text-[10px] font-mono font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'cross-trip-multiyear'
                ? 'bg-white text-black shadow-sm'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3 h-3 text-[#E5C578]" />
            <span>Multi-Year</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: SINGLE TRIP BUDGET BREAKDOWN */}
      {viewMode === 'single-trip' && currentTrip && (
        <div className="space-y-6">
          
          {/* Main Budget Progress Card */}
          <div className="luxury-card rounded-3xl p-6 sm:p-8 border-white/[0.08] shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E5C578]">
                  Target Budget vs Realized Spend
                </span>
                <h3 className="font-serif text-3xl font-light text-white font-mono">
                  {formatCurrency(totalSpent, baseCurrency)}{' '}
                  <span className="text-base font-normal text-stone-500 font-sans">
                    / {formatCurrency(budget, baseCurrency)}
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[9px] text-stone-400 block uppercase font-mono font-bold tracking-widest">Remaining</span>
                  <span className={`text-base font-mono font-bold ${remaining > 0 ? 'text-[#E5C578]' : 'text-rose-400'}`}>
                    {formatCurrency(remaining, baseCurrency)}
                  </span>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C578] to-[#C59B27] text-[#090A0E] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#D4AF37]/20 btn-tactile cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#090A0E] stroke-[2.5]" />
                  <span>Log Expense</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-white/[0.04] h-3 rounded-full overflow-hidden border border-white/[0.08]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentUsed > 90 ? 'bg-rose-500' : 'bg-gradient-to-r from-[#D4AF37] to-[#E5C578]'
                  }`}
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-stone-400">
                <span>{percentUsed}% of budget committed</span>
                <span>{formatCurrency(remaining, baseCurrency)} remaining</span>
              </div>
            </div>
          </div>

          {/* Category Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { cat: 'stay' as ExpenseCategory, label: 'Lodging' },
              { cat: 'flights' as ExpenseCategory, label: 'Flights' },
              { cat: 'food' as ExpenseCategory, label: 'Food & Drinks' },
              { cat: 'activities' as ExpenseCategory, label: 'Activities' },
              { cat: 'transport' as ExpenseCategory, label: 'Transit' },
              { cat: 'shopping' as ExpenseCategory, label: 'Shopping' },
            ].map(({ cat, label }) => {
              const amount = categoryTotals[cat] || 0;
              const cfg = CATEGORY_ICONS[cat];
              const Icon = cfg.icon;

              return (
                <div
                  key={cat}
                  className="luxury-card p-4 rounded-2xl border-white/[0.08] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-mono font-bold text-stone-400 tracking-wider">
                      {label}
                    </span>
                    <Icon className="w-3.5 h-3.5 text-[#E5C578]" />
                  </div>
                  <div className="font-mono text-sm font-bold text-white">
                    {formatCurrency(amount, baseCurrency)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expenses Table */}
          <div className="luxury-card rounded-3xl border-white/[0.08] overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-white/[0.08] flex items-center justify-between">
              <h4 className="font-serif text-lg font-light text-white">
                Recent Itemized Expenses
              </h4>
              <span className="text-xs text-stone-400 font-mono">
                {(currentTrip.expenses || []).length} records
              </span>
            </div>

            <div className="divide-y divide-white/[0.08]">
              {(currentTrip.expenses || []).map((exp) => {
                const cfg = CATEGORY_ICONS[exp.category] || CATEGORY_ICONS.other;
                const Icon = cfg.icon;

                return (
                  <div
                    key={exp.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl border border-white/10 bg-white/[0.02] text-[#E5C578]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-medium text-xs text-white">
                          {exp.description}
                        </h5>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {exp.date} • {cfg.label} {exp.paidBy ? `• Paid by ${exp.paidBy}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs font-bold text-[#E5C578]">
                        {formatCurrency(exp.amount, baseCurrency)}
                      </span>
                      <button
                        onClick={() => deleteExpense(currentTrip.id, exp.id)}
                        className="p-1 text-stone-500 hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {(currentTrip.expenses || []).length === 0 && (
                <div className="p-8 text-center text-xs text-stone-500 space-y-1">
                  <p>No expenses logged for this trip yet.</p>
                  <p className="text-[11px]">Click "Log Expense" to begin tracking costs.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: MULTI-YEAR CROSS-TRIP OVERVIEW */}
      {viewMode === 'cross-trip-multiyear' && (
        <div className="space-y-6">
          <div className="luxury-card rounded-3xl p-6 sm:p-8 border-white/[0.08] space-y-6">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E5C578]">
                Connected Multi-Trip Analytics
              </span>
              <h3 className="font-serif text-2xl font-light text-white">
                Historical Spend per Year
              </h3>
            </div>

            {multiYearData.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-4">No expense records across any trips yet.</p>
            ) : (
              <div className="space-y-4">
                {multiYearData.map((data) => {
                  const percentOfMax = Math.round((data.total / maxYearSpend) * 100);

                  return (
                    <div key={data.year} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-white font-mono">{data.year}</span>
                        <span className="text-[#E5C578] font-mono font-bold">
                          {formatCurrency(data.total, baseCurrency)}{' '}
                          <span className="text-stone-400 font-normal text-[10px]">
                            ({data.trips.length} journeys)
                          </span>
                        </span>
                      </div>

                      <div className="w-full bg-white/[0.04] h-3 rounded-full overflow-hidden border border-white/[0.08]">
                        <div
                          className="bg-gradient-to-r from-[#D4AF37] to-[#E5C578] h-full rounded-full transition-all duration-500"
                          style={{ width: `${percentOfMax}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add Expense */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="luxury-card-elevated rounded-3xl max-w-md w-full border-white/20 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#0D0F15]">
              <h3 className="font-serif text-lg font-medium text-white">
                Log Trip Expense
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase font-bold text-stone-400 mb-1 block">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Michelin Ramen Dinner"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-[#E5C578]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-stone-400 mb-1 block">
                    Amount ({currencyConfig.code})
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-[#E5C578]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-stone-400 mb-1 block">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0F15] border border-white/10 text-xs text-white focus:outline-none focus:border-[#E5C578]"
                  >
                    <option value="food">Food & Dining</option>
                    <option value="stay">Lodging</option>
                    <option value="flights">Flights</option>
                    <option value="transport">Local Transit</option>
                    <option value="activities">Activities & Tours</option>
                    <option value="shopping">Shopping</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-stone-400 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C578] to-[#C59B27] text-[#090A0E] text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
