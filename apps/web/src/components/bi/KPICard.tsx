/**
 * KPI Card Component
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { KPI } from '@/types/advanced';

interface KPICardProps {
  kpi: KPI;
  className?: string;
}

export function KPICard({ kpi, className }: KPICardProps) {
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
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{kpi.name}</p>
            <p className="text-2xl font-bold mt-1">{formatValue(kpi.value, kpi.format)}</p>
            {kpi.subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{kpi.subtitle}</p>
            )}
          </div>
          {kpi.change !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-medium px-2 py-1 rounded',
                kpi.change > 0 && 'text-success bg-success-muted',
                kpi.change < 0 && 'text-danger bg-danger-muted',
                kpi.change === 0 && 'text-foreground-muted bg-surface-hover'
              )}
            >
              <TrendIcon className="h-4 w-4" />
              {kpi.change > 0 && '+'}
              {kpi.change.toFixed(1)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
