/**
 * KPICard Component - Modern Enterprise Design with Watermark Icons
 */

import { ReactNode, isValidElement, createElement } from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';

interface KPICardProps {
  title: string;
  /** Display value as string/number (ignored if amount is provided) */
  value?: string | number;
  /** Amount in VND - enables currency mode with VND/USD toggle */
  amount?: number;
  previousValue?: string | number;
  subtitle?: string;
  unit?: string;
  icon?: LucideIcon | ReactNode;
  trend?: {
    value: number;
    label?: string;
    period?: string;
  };
  status?: 'success' | 'warning' | 'danger' | 'neutral';
  sparkline?: number[];
  className?: string;
  compact?: boolean;
}

export function KPICard({
  title,
  value,
  amount,
  previousValue,
  subtitle,
  unit,
  icon: Icon,
  trend,
  status = 'neutral',
  sparkline,
  className,
  compact = false,
}: KPICardProps) {
  // Render value - either CurrencyDisplay (if amount) or plain text
  const renderValue = (size: 'sm' | 'md' | 'lg' = 'lg') => {
    if (amount !== undefined) {
      return <CurrencyDisplay amount={amount} size={size} />;
    }
    return <>{value}</>;
  };
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="h-3.5 w-3.5" />;
    if (trend.value < 0) return <TrendingDown className="h-3.5 w-3.5" />;
    return <Minus className="h-3.5 w-3.5" />;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-foreground-muted';
    if (trend.value > 0) return 'text-cyan-600'; // Brand blue
    if (trend.value < 0) return 'text-red-600';
    return 'text-foreground-muted';
  };

  const getStatusIndicator = () => {
    const colors = {
      success: 'bg-cyan-500', // Brand blue
      warning: 'bg-amber-500',
      danger: 'bg-red-500',
      neutral: 'bg-slate-400',
    };
    return colors[status];
  };

  // Simple sparkline renderer
  const renderSparkline = () => {
    if (!sparkline || sparkline.length === 0) return null;

    const max = Math.max(...sparkline);
    const min = Math.min(...sparkline);
    const range = max - min || 1;
    const height = 24;
    const width = 60;
    const stepX = width / (sparkline.length - 1);

    const points = sparkline
      .map((val, i) => {
        const x = i * stepX;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="ml-auto">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          points={points}
          className={getTrendColor()}
        />
      </svg>
    );
  };

  // Render large watermark icon
  const renderWatermarkIcon = () => {
    if (!Icon) return null;

    const iconProps = {
      className: 'h-28 w-28 absolute -right-4 -bottom-4 pointer-events-none',
      strokeWidth: 1,
      style: {
        opacity: 0.06,
        color: 'var(--color-foreground)'
      }
    };

    if (isValidElement(Icon)) {
      return Icon;
    }

    try {
      return createElement(Icon as any, iconProps);
    } catch {
      return null;
    }
  };

  // Render small header icon
  const renderHeaderIcon = () => {
    if (!Icon) return null;

    const iconProps = {
      className: 'h-4 w-4 text-foreground-subtle',
      strokeWidth: 1.75,
    };

    if (isValidElement(Icon)) {
      return Icon;
    }

    try {
      return createElement(Icon as any, iconProps);
    } catch {
      return null;
    }
  };

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center justify-between',
          'px-4 py-3 rounded-lg border border-surface-border bg-card',
          className
        )}
        data-testid="kpi-card"
      >
        <div className="flex items-center gap-3">
          <div className={cn('w-2 h-2 rounded-full', getStatusIndicator())} />
          <span className="text-xs text-foreground-muted uppercase tracking-wide">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold font-mono tabular-nums">{renderValue('sm')}</span>
          {unit && !amount && <span className="text-xs text-foreground-subtle">{unit}</span>}
          {trend && (
            <span className={cn('flex items-center gap-1 text-xs font-medium', getTrendColor())}>
              {getTrendIcon()}
              {Math.abs(trend.value)}%
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        'p-5 rounded-2xl',
        // Clean modern design
        'bg-card',
        'border border-surface-border',
        // Soft shadow
        'shadow-sm',
        // Hover effect
        'hover:shadow-md dark:hover:shadow-xl',
        'hover:-translate-y-1 hover:scale-[1.01]',
        'transition-all duration-300 ease-out',
        'cursor-pointer',
        className
      )}
      data-testid="kpi-card"
    >
      {/* Watermark Icon */}
      {renderWatermarkIcon()}

      {/* Subtle gradient overlay - only visible in dark mode */}
      <div className="absolute inset-0 pointer-events-none dark:bg-gradient-to-br dark:from-white/[0.03] dark:to-transparent" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={cn('w-2 h-2 rounded-full', getStatusIndicator())} />
            <span className="text-[11px] font-semibold text-foreground-subtle uppercase tracking-wider">
              {title}
            </span>
          </div>
          {renderHeaderIcon()}
        </div>

        {/* Value */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-foreground font-mono tabular-nums tracking-tight">
                {renderValue('lg')}
              </span>
              {unit && !amount && (
                <span className="text-sm font-medium text-foreground-muted ml-1">{unit}</span>
              )}
            </div>

            {/* Subtitle */}
            {subtitle && (
              <p className="text-xs text-foreground-muted mt-1">{subtitle}</p>
            )}

            {/* Trend & Previous */}
            <div className="flex items-center gap-3 mt-2">
              {trend && (
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: trend.value > 0 ? 'rgba(125, 211, 232, 0.15)' : trend.value < 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                    color: trend.value > 0 ? '#0891B2' : trend.value < 0 ? '#DC2626' : '#64748B'
                  }}
                >
                  {getTrendIcon()}
                  <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
                  {(trend.label || trend.period) && (
                    <span className="text-foreground-subtle font-normal ml-0.5">
                      {trend.label || trend.period}
                    </span>
                  )}
                </span>
              )}
              {previousValue && (
                <span className="flex items-center gap-1 text-xs text-foreground-subtle">
                  <ArrowRight className="h-3 w-3" />
                  <span className="font-mono">{previousValue}</span>
                </span>
              )}
            </div>
          </div>

          {/* Sparkline */}
          {renderSparkline()}
        </div>
      </div>
    </div>
  );
}
