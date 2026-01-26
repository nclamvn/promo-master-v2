/**
 * KPI Card Component - Modern Enterprise Design with Watermark Icons
 */

import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { KPI } from '@/types/advanced';

interface KPICardProps {
  kpi: KPI;
  icon?: LucideIcon;
  className?: string;
}

export function KPICard({ kpi, icon: Icon, className }: KPICardProps) {
  const formatValue = (value: number, format?: KPI['format']) => {
    switch (format) {
      case 'CURRENCY':
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
          maximumFractionDigits: 0,
        }).format(value);
      case 'PERCENTAGE':
        return `${value.toFixed(1)}%`;
      default:
        return new Intl.NumberFormat('vi-VN').format(value);
    }
  };

  const TrendIcon = kpi.trend === 'UP' ? TrendingUp : kpi.trend === 'DOWN' ? TrendingDown : Minus;

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
    >
      {/* Watermark Icon */}
      {Icon && (
        <Icon
          className="h-28 w-28 absolute -right-4 -bottom-4 pointer-events-none"
          strokeWidth={1}
          style={{ opacity: 0.06, color: 'var(--color-foreground)' }}
        />
      )}

      {/* Subtle gradient overlay - only visible in dark mode */}
      <div className="absolute inset-0 pointer-events-none dark:bg-gradient-to-br dark:from-white/[0.03] dark:to-transparent" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              'w-2 h-2 rounded-full',
              kpi.trend === 'UP' ? 'bg-cyan-500' : kpi.trend === 'DOWN' ? 'bg-red-500' : 'bg-slate-400'
            )} />
            <span className="text-[11px] font-semibold text-foreground-subtle uppercase tracking-wider">
              {kpi.name}
            </span>
          </div>
          {Icon && <Icon className="h-4 w-4 text-foreground-subtle" strokeWidth={1.75} />}
        </div>

        {/* Value */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-foreground font-mono tabular-nums tracking-tight">
                {formatValue(kpi.value, kpi.format)}
              </span>
            </div>

            {/* Subtitle */}
            {kpi.subtitle && (
              <p className="text-xs text-foreground-muted mt-1">{kpi.subtitle}</p>
            )}

            {/* Trend */}
            {kpi.change !== undefined && (
              <div className="flex items-center gap-3 mt-2">
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: kpi.change > 0 ? 'rgba(125, 211, 232, 0.15)' : kpi.change < 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                    color: kpi.change > 0 ? '#0891B2' : kpi.change < 0 ? '#DC2626' : '#64748B'
                  }}
                >
                  <TrendIcon className="h-3.5 w-3.5" />
                  <span>{kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
