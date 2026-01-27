/**
 * CurrencyDisplay Component
 * Displays currency with compact format and clickable VND/USD toggle
 */

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Types
export type CurrencyCode = 'VND' | 'USD';

interface CurrencyDisplayProps {
  /** Amount in VND (base currency) */
  amount: number;
  /** Additional CSS classes */
  className?: string;
  /** CSS classes for the value part */
  valueClassName?: string;
  /** CSS classes for the currency badge */
  badgeClassName?: string;
  /** Show currency toggle badge */
  showToggle?: boolean;
  /** Default currency to display */
  defaultCurrency?: CurrencyCode;
  /** Exchange rate (VND per 1 USD), if not provided will use default */
  exchangeRate?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

// Default exchange rate
const DEFAULT_EXCHANGE_RATE = 25000;

// Format number with compact units
function formatCompact(
  amount: number,
  currency: CurrencyCode,
  exchangeRate: number
): { value: string; unit: string; fullValue: string } {
  const convertedAmount = currency === 'VND' ? amount : amount / exchangeRate;

  // Full value for tooltip
  const fullValue = currency === 'VND'
    ? `${convertedAmount.toLocaleString('vi-VN')} ₫`
    : `$${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (currency === 'VND') {
    if (Math.abs(convertedAmount) >= 1e12) {
      return { value: (convertedAmount / 1e12).toFixed(1), unit: 'nghìn tỷ', fullValue };
    }
    if (Math.abs(convertedAmount) >= 1e9) {
      return { value: (convertedAmount / 1e9).toFixed(1), unit: 'tỷ', fullValue };
    }
    if (Math.abs(convertedAmount) >= 1e6) {
      return { value: (convertedAmount / 1e6).toFixed(1), unit: 'triệu', fullValue };
    }
    if (Math.abs(convertedAmount) >= 1e3) {
      return { value: (convertedAmount / 1e3).toFixed(0), unit: 'K', fullValue };
    }
    return { value: convertedAmount.toLocaleString('vi-VN'), unit: '₫', fullValue };
  } else {
    if (Math.abs(convertedAmount) >= 1e9) {
      return { value: `$${(convertedAmount / 1e9).toFixed(2)}`, unit: 'B', fullValue };
    }
    if (Math.abs(convertedAmount) >= 1e6) {
      return { value: `$${(convertedAmount / 1e6).toFixed(2)}`, unit: 'M', fullValue };
    }
    if (Math.abs(convertedAmount) >= 1e3) {
      return { value: `$${(convertedAmount / 1e3).toFixed(1)}`, unit: 'K', fullValue };
    }
    return { value: `$${convertedAmount.toFixed(0)}`, unit: '', fullValue };
  }
}

export function CurrencyDisplay({
  amount,
  className,
  valueClassName,
  badgeClassName,
  showToggle = true,
  defaultCurrency = 'VND',
  exchangeRate = DEFAULT_EXCHANGE_RATE,
  size = 'md',
}: CurrencyDisplayProps) {
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency);

  const toggleCurrency = useCallback(() => {
    setCurrency((prev) => (prev === 'VND' ? 'USD' : 'VND'));
  }, []);

  const formatted = formatCompact(amount, currency, exchangeRate);

  const sizeClasses = {
    sm: {
      value: 'text-sm font-semibold',
      unit: 'text-xs',
      badge: 'text-[10px] px-1 py-0.5',
    },
    md: {
      value: 'text-base font-bold',
      unit: 'text-xs',
      badge: 'text-[10px] px-1.5 py-0.5',
    },
    lg: {
      value: 'text-lg font-bold',
      unit: 'text-sm',
      badge: 'text-xs px-2 py-1',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('inline-flex items-center gap-1', className)}>
            {/* Value */}
            <span className={cn(sizes.value, valueClassName)}>
              {formatted.value}
            </span>

            {/* Unit */}
            {formatted.unit && (
              <span className={cn(sizes.unit, 'text-muted-foreground')}>
                {formatted.unit}
              </span>
            )}

            {/* Currency Toggle Badge */}
            {showToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCurrency();
                }}
                className={cn(
                  'ml-1 rounded font-medium transition-all',
                  'hover:scale-105 active:scale-95',
                  currency === 'VND'
                    ? 'bg-red-500/15 text-red-600 dark:text-red-400 hover:bg-red-500/25'
                    : 'bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-green-500/25',
                  sizes.badge,
                  badgeClassName
                )}
              >
                {currency}
              </button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p className="font-medium">{formatted.fullValue}</p>
          {showToggle && (
            <p className="text-muted-foreground mt-0.5">
              Click {currency === 'VND' ? 'USD' : 'VND'} để chuyển đổi
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Simple currency formatter function (for inline use)
 */
export function formatCurrencyCompact(
  amount: number,
  currency: CurrencyCode = 'VND',
  exchangeRate: number = DEFAULT_EXCHANGE_RATE
): string {
  const { value, unit } = formatCompact(amount, currency, exchangeRate);
  return unit ? `${value} ${unit}` : value;
}

/**
 * CurrencyToggle - Standalone toggle button
 */
export function CurrencyToggle({
  currency,
  onChange,
  className,
}: {
  currency: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
  className?: string;
}) {
  return (
    <div className={cn('inline-flex rounded-lg bg-muted p-0.5', className)}>
      <button
        onClick={() => onChange('VND')}
        className={cn(
          'px-3 py-1 text-xs font-medium rounded-md transition-all',
          currency === 'VND'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        VND
      </button>
      <button
        onClick={() => onChange('USD')}
        className={cn(
          'px-3 py-1 text-xs font-medium rounded-md transition-all',
          currency === 'USD'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        USD
      </button>
    </div>
  );
}
