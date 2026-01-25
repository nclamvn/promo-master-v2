/**
 * KPICard Component - Industrial Design System
 */

import { ReactNode, isValidElement, createElement } from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
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
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="h-3.5 w-3.5" />;
    if (trend.value < 0) return <TrendingDown className="h-3.5 w-3.5" />;
    return <Minus className="h-3.5 w-3.5" />;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-foreground-muted';
    if (trend.value > 0) return 'text-success';
    if (trend.value < 0) return 'text-danger';
    return 'text-foreground-muted';
  };

  const getStatusIndicator = () => {
    const colors = {
      success: 'status-dot-success',
      warning: 'status-dot-warning',
      danger: 'status-dot-danger',
      neutral: 'status-dot-neutral',
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

  // Render icon - handle both LucideIcon and ReactNode
  const renderIcon = () => {
    if (!Icon) return null;
    // Already a valid React element (e.g., <DollarSign className="..." />)
    if (isValidElement(Icon)) {
      return Icon;
    }
    // It's a component (function or forwardRef object), render it
    try {
      return createElement(Icon as any, { className: 'h-5 w-5 text-foreground-subtle' });
    } catch {
      return null;
    }
  };

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center justify-between',
          'px-4 py-3 rounded border border-surface-border bg-card',
          className
        )}
        data-testid="kpi-card"
      >
        <div className="flex items-center gap-3">
          <div className={`status-dot ${getStatusIndicator()}`} />
          <span className="text-xs text-foreground-muted uppercase tracking-wide">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold font-mono tabular-nums">{value}</span>
          {unit && <span className="text-xs text-foreground-subtle">{unit}</span>}
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
        'p-4 rounded border border-surface-border bg-card',
        className
      )}
      data-testid="kpi-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`status-dot ${getStatusIndicator()}`} />
          <span className="text-2xs font-semibold text-foreground-subtle uppercase tracking-wider">
            {title}
          </span>
        </div>
        {renderIcon()}
      </div>

      {/* Value */}
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground font-mono tabular-nums tracking-tight">
              {value}
            </span>
            {unit && (
              <span className="text-sm text-foreground-muted ml-1">{unit}</span>
            )}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-foreground-muted mt-0.5">{subtitle}</p>
          )}

          {/* Trend & Previous */}
          <div className="flex items-center gap-3 mt-1">
            {trend && (
              <span className={cn('flex items-center gap-1 text-xs font-medium', getTrendColor())}>
                {getTrendIcon()}
                <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
                {(trend.label || trend.period) && (
                  <span className="text-foreground-subtle font-normal">{trend.label || trend.period}</span>
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
  );
}
