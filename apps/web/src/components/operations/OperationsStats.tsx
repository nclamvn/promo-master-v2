/**
 * Operations Stats Component
 * Shared statistics cards for operations modules
 */

import {
  Package,
  Truck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  DollarSign,
  Calendar,
  Target,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn, formatCurrency, formatNumber, formatPercent } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendLabel,
  variant = 'default',
  className,
}: StatCardProps) {
  const variantStyles = {
    default: '',
    success: 'border-green-200 bg-green-50/50',
    warning: 'border-yellow-200 bg-yellow-50/50',
    danger: 'border-red-200 bg-red-50/50',
    info: 'border-blue-200 bg-blue-50/50',
  };

  const iconColors = {
    default: 'text-muted-foreground',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    info: 'text-blue-600',
  };

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={iconColors[variant]}>
          {icon || <BarChart3 className="h-4 w-4" />}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {trend !== undefined && (
          <div className="flex items-center mt-1">
            {trend > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
            ) : trend < 0 ? (
              <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
            ) : null}
            <span
              className={cn(
                'text-xs',
                trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-muted-foreground'
              )}
            >
              {trend > 0 ? '+' : ''}
              {trend}% {trendLabel || 'vs last period'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface DeliveryStatsProps {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  onTimeRate: number;
}

export function DeliveryStats({
  total,
  pending,
  inTransit,
  delivered,
  onTimeRate,
}: DeliveryStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      <StatCard
        title="Total Orders"
        value={formatNumber(total)}
        icon={<Package className="h-4 w-4" />}
      />
      <StatCard
        title="Pending"
        value={formatNumber(pending)}
        icon={<Clock className="h-4 w-4" />}
        variant="warning"
      />
      <StatCard
        title="In Transit"
        value={formatNumber(inTransit)}
        icon={<Truck className="h-4 w-4" />}
        variant="info"
      />
      <StatCard
        title="Delivered"
        value={formatNumber(delivered)}
        icon={<CheckCircle className="h-4 w-4" />}
        variant="success"
      />
      <StatCard
        title="On-Time Rate"
        value={formatPercent(onTimeRate)}
        icon={<Target className="h-4 w-4" />}
        variant={onTimeRate >= 90 ? 'success' : onTimeRate >= 70 ? 'warning' : 'danger'}
      />
    </div>
  );
}

interface SellTrackingStatsProps {
  totalSellIn: number;
  totalSellOut: number;
  totalStock: number;
  sellThroughRate: number;
  avgDaysOfStock?: number;
}

export function SellTrackingStats({
  totalSellIn,
  totalSellOut,
  totalStock,
  sellThroughRate,
  avgDaysOfStock,
}: SellTrackingStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      <StatCard
        title="Total Sell-In"
        value={formatNumber(totalSellIn)}
        subtitle="Units shipped"
        icon={<TrendingUp className="h-4 w-4" />}
      />
      <StatCard
        title="Total Sell-Out"
        value={formatNumber(totalSellOut)}
        subtitle="Units sold"
        icon={<TrendingDown className="h-4 w-4" />}
      />
      <StatCard
        title="Current Stock"
        value={formatNumber(totalStock)}
        subtitle="At customer locations"
        icon={<Package className="h-4 w-4" />}
      />
      <StatCard
        title="Sell-Through"
        value={formatPercent(sellThroughRate)}
        icon={<BarChart3 className="h-4 w-4" />}
        variant={sellThroughRate >= 70 ? 'success' : sellThroughRate >= 50 ? 'warning' : 'danger'}
      />
      {avgDaysOfStock !== undefined && (
        <StatCard
          title="Days of Stock"
          value={avgDaysOfStock}
          subtitle="Average coverage"
          icon={<Calendar className="h-4 w-4" />}
          variant={avgDaysOfStock > 60 ? 'warning' : avgDaysOfStock < 14 ? 'danger' : 'default'}
        />
      )}
    </div>
  );
}

interface InventoryStatsProps {
  totalValue: number;
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  nearExpiryItems: number;
  avgStockCoverage?: number;
}

export function InventoryStats({
  totalValue,
  totalItems,
  lowStockItems,
  outOfStockItems,
  nearExpiryItems,
  avgStockCoverage,
}: InventoryStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      <StatCard
        title="Total Value"
        value={formatCurrency(totalValue)}
        icon={<DollarSign className="h-4 w-4" />}
      />
      <StatCard
        title="Total Items"
        value={formatNumber(totalItems)}
        icon={<Package className="h-4 w-4" />}
      />
      <StatCard
        title="Low Stock"
        value={formatNumber(lowStockItems)}
        icon={<AlertTriangle className="h-4 w-4" />}
        variant={lowStockItems > 0 ? 'warning' : 'default'}
      />
      <StatCard
        title="Out of Stock"
        value={formatNumber(outOfStockItems)}
        icon={<AlertTriangle className="h-4 w-4" />}
        variant={outOfStockItems > 0 ? 'danger' : 'default'}
      />
      <StatCard
        title="Near Expiry"
        value={formatNumber(nearExpiryItems)}
        icon={<Clock className="h-4 w-4" />}
        variant={nearExpiryItems > 0 ? 'warning' : 'default'}
      />
      {avgStockCoverage !== undefined && (
        <StatCard
          title="Avg Coverage"
          value={`${avgStockCoverage.toFixed(1)} mo`}
          icon={<Calendar className="h-4 w-4" />}
          variant={avgStockCoverage < 1 ? 'danger' : avgStockCoverage > 6 ? 'warning' : 'default'}
        />
      )}
    </div>
  );
}
