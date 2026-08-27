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
  flights: { label: 'Flights & Transit', icon: Plane, color: 'text-[#1A1A1A]', bg: 'bg-[#FDFCFB] border-[#E5E1DA]' },
  stay: { label: 'Hotels & Lodging', icon: Building, color: 'text-[#1A1A1A]', bg: 'bg-[#FDFCFB] border-[#E5E1DA]' },
  lodging: { label: 'Hotels & Lodging', icon: Building, color: 'text-[#1A1A1A]', bg: 'bg-[#FDFCFB] border-[#E5E1DA]' },
  food: { label: 'Dining & Drinks', icon: Utensils, color: 'text-[#1A1A1A]', bg: 'bg-[#FDFCFB] border-[#E5E1DA]' },
  activities: { label: 'Tours & Tickets', icon: Ticket, color: 'text-[#1A1A1A]', bg: 'bg-[#FDFCFB] border-[#E5E1DA]' },
  transport: { label: 'Local Transit & Cabs', icon: Car, color: 'text-[#1A1A1A]', bg: 'bg-[#FDFCFB] border-[#E5E1DA]' },
  transit: { label: 'Local Transit & Cabs', icon: Car, color: 'text-[#1A1A1A]', bg: 'bg-[#FDFCFB] border-[#E5E1DA]' },
  shopping: { label: 'Shopping & Gifts', icon: ShoppingBag, color: 'text-[#1A1A1A]', bg: 'bg-[#FDFCFB] border-[#E5E1DA]' },
  other: { label: 'Miscellaneous', icon: HelpCircle, color: 'text-[#1A1A1A]', bg: 'bg-[#FDFCFB] border-[#E5E1DA]' },
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
    return currentTrip.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
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
    currentTrip.expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount || 0);
    });
    return map;
  }, [currentTrip]);

  // Multi-Year Cross Trip Spend Aggregations
  const multiYearData = useMemo(() => {
    const yearMap: Record<string, { year: string; total: number; trips: Trip[]; avgPerDay: number }> = {};

    trips.forEach((t) => {
      const year = new Date(t.startDate).getFullYear().toString();
      const tripSpend = t.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

      if (!yearMap[year]) {
        yearMap[year] = { year, total: 0, trips: [], avgPerDay: 0 };
      }
      yearMap[year].total += tripSpend;
      yearMap[year].trips.push(t);
    });

    const years = Object.keys(yearMap).sort();
    return years.map((y) => {
      const entry = yearMap[y];
      const totalDays = entry.trips.reduce((s, t) => s + (t.days.length || 1), 0);
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
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
            Financial Cadence
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#1A1A1A]" />
            Budget & Expense Tracking
          </h2>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E5E1DA]">
          <button
            onClick={() => setViewMode('single-trip')}
            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
              viewMode === 'single-trip'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'text-[#8C8881] hover:text-[#1A1A1A]'
            }`}
          >
            {currentTrip?.title || 'Trip Budget'}
          </button>

          <button
            onClick={() => setViewMode('cross-trip-multiyear')}
            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'cross-trip-multiyear'
                ? 'bg-[#1A1A1A] text-white shadow-xs'
                : 'text-[#8C8881] hover:text-[#1A1A1A]'
            }`}
          >
            <BarChart3 className="w-3 h-3 text-[#8C8881]" />
            <span>Multi-Year Overview</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: SINGLE TRIP BUDGET BREAKDOWN */}
      {viewMode === 'single-trip' && currentTrip && (
        <div className="space-y-6">
          
          {/* Main Budget Progress Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E1DA] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                  Target Budget vs Realized Spend
                </span>
                <h3 className="font-serif text-3xl font-light text-[#1A1A1A]">
                  {formatCurrency(totalSpent, baseCurrency)}{' '}
                  <span className="text-base font-normal text-[#8C8881]">
                    / {formatCurrency(budget, baseCurrency)}
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[9px] text-[#8C8881] block uppercase font-bold tracking-widest">Remaining</span>
                  <span className={`text-base font-mono font-bold ${remaining > 0 ? 'text-[#1A1A1A]' : 'text-rose-600'}`}>
                    {formatCurrency(remaining, baseCurrency)}
                  </span>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#1A1A1A] hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Log Expense</span>
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-[#FDFCFB] h-3 rounded-full overflow-hidden border border-[#E5E1DA]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentUsed > 90 ? 'bg-rose-500' : 'bg-[#1A1A1A]'
                  }`}
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-[#8C8881]">
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
                  className="bg-white p-4 rounded-xl border border-[#E5E1DA] shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase font-bold text-[#8C8881] tracking-wider">
                      {label}
                    </span>
                    <Icon className="w-3.5 h-3.5 text-[#8C8881]" />
                  </div>
                  <div className="font-mono text-sm font-bold text-[#1A1A1A]">
                    {formatCurrency(amount, baseCurrency)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-2xl border border-[#E5E1DA] shadow-xs overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-[#E5E1DA] flex items-center justify-between">
              <h4 className="font-serif text-lg font-light text-[#1A1A1A]">
                Recent Itemized Expenses
              </h4>
              <span className="text-xs text-[#8C8881] font-mono">
                {currentTrip.expenses.length} records
              </span>
            </div>

            <div className="divide-y divide-[#E5E1DA]">
              {currentTrip.expenses.map((exp) => {
                const cfg = CATEGORY_ICONS[exp.category] || CATEGORY_ICONS.other;
                const Icon = cfg.icon;

                return (
                  <div
                    key={exp.id}
                    className="p-4 flex items-center justify-between gap-4 hover:bg-[#FDFCFB] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl border border-[#E5E1DA] bg-white text-[#1A1A1A]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-medium text-xs text-[#1A1A1A]">
                          {exp.description}
                        </h5>
                        <span className="text-[10px] text-[#8C8881]">
                          {exp.date} • {cfg.label} {exp.paidBy ? `• Paid by ${exp.paidBy}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs font-bold text-[#1A1A1A]">
                        {formatCurrency(exp.amount, baseCurrency)}
                      </span>
                      <button
                        onClick={() => deleteExpense(currentTrip.id, exp.id)}
                        className="p-1 text-[#8C8881] hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {currentTrip.expenses.length === 0 && (
                <div className="p-8 text-center text-xs text-[#8C8881] space-y-1">
                  <p>No expenses logged for this trip yet.</p>
                  <p className="text-[11px]">Click "+ Log Expense" or scan booking screenshots to auto-sync.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: MULTI-YEAR CROSS-TRIP OVERVIEW */}
      {viewMode === 'cross-trip-multiyear' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E5E1DA] shadow-xs space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C8881]">
                Connected Multi-Trip Analytics
              </span>
              <h3 className="font-serif text-2xl font-light text-[#1A1A1A]">
                Historical Spend per Year
              </h3>
            </div>

            <div className="space-y-4">
              {multiYearData.map((data) => {
                const percentOfMax = Math.round((data.total / maxYearSpend) * 100);

                return (
                  <div key={data.year} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#1A1A1A] font-mono">{data.year}</span>
                      <span className="text-[#1A1A1A] font-mono font-bold">
                        {formatCurrency(data.total, baseCurrency)}{' '}
                        <span className="text-[#8C8881] font-normal text-[10px]">
                          ({data.trips.length} journeys)
                        </span>
                      </span>
                    </div>

                    <div className="w-full bg-[#FDFCFB] h-3 rounded-full overflow-hidden border border-[#E5E1DA]">
                      <div
                        className="bg-[#1A1A1A] h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentOfMax}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Expense */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E5E1DA] shadow-xl overflow-hidden">
            <div className="p-5 border-b border-[#E5E1DA] flex items-center justify-between bg-[#FDFCFB]">
              <h3 className="font-serif text-lg font-medium text-[#1A1A1A]">
                Log Trip Expense
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-[#8C8881] hover:text-[#1A1A1A] rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase font-bold text-[#8C8881] mb-1 block">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Michelin Ramen Dinner"
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E1DA] text-xs focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-[#8C8881] mb-1 block">
                    Amount ({currencyConfig.code})
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E1DA] text-xs font-mono focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase font-bold text-[#8C8881] mb-1 block">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E5E1DA] text-xs focus:outline-none focus:border-[#1A1A1A] bg-white"
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

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E5E1DA] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#1A1A1A] text-white text-xs font-semibold cursor-pointer"
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
