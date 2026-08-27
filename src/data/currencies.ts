import { CurrencyCode, CurrencyConfig } from '../types';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', rateToUSD: 1.0 },
  { code: 'EUR', symbol: '€', name: 'Euro', rateToUSD: 0.92 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateToUSD: 0.79 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToUSD: 86.8 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateToUSD: 155.2 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateToUSD: 1.54 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateToUSD: 1.39 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateToUSD: 1.35 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateToUSD: 3.67 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rateToUSD: 0.90 },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', rateToUSD: 36.5 },
];

export const getCurrencyConfig = (code: string | CurrencyCode = 'USD'): CurrencyConfig => {
  const found = SUPPORTED_CURRENCIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
  return found || SUPPORTED_CURRENCIES[0];
};

/**
 * Converts an amount stored in USD to the user's selected base currency.
 */
export const convertFromUSD = (amountInUSD: number, targetCurrency: string | CurrencyCode = 'USD'): number => {
  const config = getCurrencyConfig(targetCurrency);
  return Math.round(amountInUSD * config.rateToUSD);
};

/**
 * Formats a currency amount with symbol and thousands separators.
 */
export const formatCurrency = (
  amountInUSD: number,
  currencyCode: string | CurrencyCode = 'USD',
  showSymbol: boolean = true
): string => {
  const config = getCurrencyConfig(currencyCode);
  const converted = convertFromUSD(amountInUSD, currencyCode);

  const formattedNum = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  }).format(converted);

  if (!showSymbol) return formattedNum;
  return `${config.symbol}${formattedNum}`;
};
