// src/components/LiveCurrencyConverterModal.tsx
import React, { useState, useEffect } from 'react';
import { useTrip } from '../context/TripContext';
import { SUPPORTED_CURRENCIES, getCurrencyConfig } from '../data/currencies';
import { fetchLiveExchangeRates, convertCurrency, POPULAR_EXCHANGE_PAIRS, LiveRatesResponse } from '../utils/exchangeRates';
import {
  ArrowRightLeft,
  RefreshCw,
  TrendingUp,
  X,
  Check,
  Globe2,
  DollarSign,
} from 'lucide-react';

interface LiveCurrencyConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveCurrencyConverterModal: React.FC<LiveCurrencyConverterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { baseCurrency, setBaseCurrency } = useTrip();

  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>(baseCurrency || 'JPY');
  const [amount, setAmount] = useState<number>(100);
  const [liveData, setLiveData] = useState<LiveRatesResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      loadRates();
      setToCurrency(baseCurrency || 'JPY');
    }
  }, [isOpen, baseCurrency]);

  const loadRates = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLiveExchangeRates();
      setLiveData(data);
    } catch (e) {
      console.error('Error fetching live forex:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const conversion = convertCurrency(
    Number(amount) || 0,
    fromCurrency,
    toCurrency,
    liveData?.rates
  );

  const unitConversion = convertCurrency(
    1,
    fromCurrency,
    toCurrency,
    liveData?.rates
  );

  const handleSetGlobalBase = (currencyCode: string) => {
    setBaseCurrency(currencyCode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#14171F] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-[#0F1116]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/50 text-amber-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">
                  Live Multi-Currency Engine
                </h3>
                {liveData?.isLive && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-[10px] font-mono font-semibold">
                    LIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Real-time FX rates for expenses and travel budgets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Active Unit Rate Banner */}
          <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-400 block font-mono">
                Exchange Rate
              </span>
              <span className="text-sm font-semibold text-white mt-0.5 block font-mono">
                1 {fromCurrency} = {unitConversion.rateUsed.toFixed(unitConversion.rateUsed > 10 ? 2 : 4)} {toCurrency}
              </span>
            </div>
            <button
              onClick={loadRates}
              disabled={isLoading}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Refresh live exchange rates"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="text-[11px] font-mono">Update</span>
            </button>
          </div>

          {/* Interactive Converter Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* From Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">You Pay / Convert</label>
                <div className="flex rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden focus-within:border-amber-400">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-transparent text-white font-mono text-sm focus:outline-none selectable-text"
                    placeholder="100"
                  />
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="bg-zinc-800 text-white text-xs font-semibold px-3 border-l border-zinc-700 focus:outline-none cursor-pointer"
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex sm:hidden justify-center py-1">
                <button
                  onClick={handleSwap}
                  className="p-2 rounded-full bg-zinc-800 border border-zinc-700 text-amber-400 hover:bg-zinc-700"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              {/* To Output */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Converted Value</label>
                <div className="flex rounded-xl border border-zinc-700 bg-zinc-900 overflow-hidden">
                  <div className="w-full px-3.5 py-2.5 bg-zinc-900/60 text-amber-400 font-mono text-sm font-semibold flex items-center">
                    {conversion.formattedResult}
                  </div>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="bg-zinc-800 text-white text-xs font-semibold px-3 border-l border-zinc-700 focus:outline-none cursor-pointer"
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Select Popular Currency Pairs */}
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
              Quick Currency Pairs
            </span>
            <div className="flex flex-wrap gap-2">
              {POPULAR_EXCHANGE_PAIRS.map((pair) => (
                <button
                  key={pair.label}
                  onClick={() => {
                    setFromCurrency(pair.from);
                    setToCurrency(pair.to);
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-colors ${
                    fromCurrency === pair.from && toCurrency === pair.to
                      ? 'bg-amber-500 text-zinc-950 border-amber-500'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  {pair.label}
                </button>
              ))}
            </div>
          </div>

          {/* Global Base Currency Selector */}
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-white">
                  App-Wide Base Currency
                </span>
              </div>
              <span className="text-xs font-mono text-amber-400 font-bold">
                Currently: {baseCurrency}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              All trip totals, estimated activity costs, and charts are calculated in this currency.
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 pt-1">
              {SUPPORTED_CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => handleSetGlobalBase(curr.code)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1 transition-colors ${
                    baseCurrency === curr.code
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                  }`}
                >
                  <span>{curr.code}</span>
                  {baseCurrency === curr.code && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-[#0F1116] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
