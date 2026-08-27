// src/utils/exchangeRates.ts
// Real-time live foreign exchange rates fetcher and converter

import { CurrencyCode, CurrencyConfig } from '../types';
import { SUPPORTED_CURRENCIES, getCurrencyConfig } from '../data/currencies';

const CACHE_KEY_RATES = 'triplink_live_forex_rates_v2';
const CACHE_KEY_RATES_TIME = 'triplink_live_forex_time_v2';

export interface LiveRatesResponse {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
  isLive: boolean;
}

// Built-in verified baseline rates (1 USD = X units)
const DEFAULT_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  INR: 86.8,
  JPY: 155.2,
  AUD: 1.54,
  CAD: 1.39,
  SGD: 1.35,
  AED: 3.67,
  CHF: 0.90,
  THB: 36.5,
  NZD: 1.68,
  HKD: 7.78,
  KRW: 1395.0,
  BRL: 5.75,
  MXN: 20.3,
  SEK: 10.8,
  NOK: 11.1,
  TRY: 35.8,
  ZAR: 18.2,
};

let memoryRates: Record<string, number> = { ...DEFAULT_RATES };
let memoryLastUpdated: string = new Date().toISOString();
let isLiveSynced: boolean = false;

/**
 * Fetch real-time live exchange rates from open exchange API
 */
export async function fetchLiveExchangeRates(): Promise<LiveRatesResponse> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.rates) {
        memoryRates = { ...DEFAULT_RATES, ...data.rates };
        memoryLastUpdated = data.time_last_update_utc || new Date().toISOString();
        isLiveSynced = true;

        try {
          localStorage.setItem(CACHE_KEY_RATES, JSON.stringify(memoryRates));
          localStorage.setItem(CACHE_KEY_RATES_TIME, memoryLastUpdated);
        } catch {
          // ignore
        }

        return {
          base: 'USD',
          rates: memoryRates,
          lastUpdated: memoryLastUpdated,
          isLive: true,
        };
      }
    }
  } catch (err) {
    console.warn('Live forex fetch error, checking local cache:', err);
  }

  // Check cached rates
  try {
    const cached = localStorage.getItem(CACHE_KEY_RATES);
    const cachedTime = localStorage.getItem(CACHE_KEY_RATES_TIME);
    if (cached) {
      memoryRates = JSON.parse(cached);
      memoryLastUpdated = cachedTime || new Date().toISOString();
      return {
        base: 'USD',
        rates: memoryRates,
        lastUpdated: memoryLastUpdated,
        isLive: true,
      };
    }
  } catch {
    // fallback
  }

  return {
    base: 'USD',
    rates: DEFAULT_RATES,
    lastUpdated: memoryLastUpdated,
    isLive: false,
  };
}

/**
 * Convert any amount from source currency to target currency using live rates
 */
export function convertCurrency(
  amount: number,
  fromCode: string | CurrencyCode,
  toCode: string | CurrencyCode,
  rates: Record<string, number> = memoryRates
): {
  result: number;
  rateUsed: number;
  formattedResult: string;
} {
  const fromUpper = fromCode.toUpperCase();
  const toUpper = toCode.toUpperCase();

  const fromRateUSD = rates[fromUpper] || DEFAULT_RATES[fromUpper] || 1.0;
  const toRateUSD = rates[toUpper] || DEFAULT_RATES[toUpper] || 1.0;

  // Convert to USD first, then to target
  const amountUSD = amount / fromRateUSD;
  const converted = amountUSD * toRateUSD;
  const directRate = toRateUSD / fromRateUSD;

  const targetConfig = getCurrencyConfig(toCode);
  const formattedResult = `${targetConfig.symbol}${new Intl.NumberFormat(undefined, {
    maximumFractionDigits: directRate > 50 ? 0 : 2,
    minimumFractionDigits: directRate > 50 ? 0 : 2,
  }).format(converted)}`;

  return {
    result: converted,
    rateUsed: directRate,
    formattedResult,
  };
}

/**
 * Quick exchange ticker pairs
 */
export const POPULAR_EXCHANGE_PAIRS = [
  { from: 'USD', to: 'EUR', label: 'USD / EUR' },
  { from: 'USD', to: 'GBP', label: 'USD / GBP' },
  { from: 'USD', to: 'JPY', label: 'USD / JPY' },
  { from: 'USD', to: 'INR', label: 'USD / INR' },
  { from: 'EUR', to: 'GBP', label: 'EUR / GBP' },
  { from: 'USD', to: 'AUD', label: 'USD / AUD' },
];
