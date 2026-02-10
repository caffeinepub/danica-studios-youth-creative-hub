import { Currency, CurrencyAggregatedAmount, MonetaryAmount } from '../backend';

export const CURRENCIES = [
  { code: Currency.USD, label: 'USD', symbol: '$' },
  { code: Currency.ZWG, label: 'ZWG', symbol: 'ZWG' },
  { code: Currency.ZAR, label: 'ZAR', symbol: 'R' },
  { code: Currency.EUR, label: 'EUR', symbol: '€' },
  { code: Currency.GBP, label: 'GBP', symbol: '£' },
  { code: Currency.BWP, label: 'BWP', symbol: 'P' },
  { code: Currency.ZMW, label: 'ZMW', symbol: 'ZK' },
] as const;

export const DEFAULT_CURRENCY = Currency.USD;

// Legacy defaulting: treat missing currency as ZAR for backward compatibility
export const LEGACY_DEFAULT_CURRENCY = Currency.ZAR;

export function getCurrencyInfo(currency: Currency) {
  return CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
}

export function formatCurrency(amount: bigint | number, currency: Currency): string {
  const info = getCurrencyInfo(currency);
  const numAmount = typeof amount === 'bigint' ? Number(amount) : amount;
  return `${info.symbol} ${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatMonetaryAmount(monetaryAmount: MonetaryAmount): string {
  return formatCurrency(monetaryAmount.amount, monetaryAmount.currency);
}

// Get total for a specific currency from aggregated amounts
export function getCurrencyTotal(
  aggregated: CurrencyAggregatedAmount[],
  currency: Currency
): bigint {
  const found = aggregated.find((a) => a.currency === currency);
  return found ? found.amount : BigInt(0);
}

// Get chart-friendly label for currency
export function getCurrencyChartLabel(currency: Currency): string {
  const info = getCurrencyInfo(currency);
  return `Income (${info.label})`;
}
