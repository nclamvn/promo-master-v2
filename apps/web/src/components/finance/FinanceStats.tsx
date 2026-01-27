/**
 * Finance Stats Component - Summary cards for finance pages
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

export function StatCard({ title, value, subValue, icon, trend, variant = 'default' }: StatCardProps) {
  const variantColors = {
    default: 'text-foreground',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    destructive: 'text-red-600 dark:text-red-400',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', variantColors[variant])}>
          {typeof value === 'number' ? <CurrencyDisplay amount={value} size="lg" /> : value}
        </div>
        {subValue && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1 text-green-500" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3 mr-1 text-red-500" />}
            {subValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface AccrualStatsProps {
  summary: {
    totalAmount: number;
    pendingAmount: number;
    postedAmount: number;
    reversedAmount?: number;
    entryCount: number;
  };
}

export function AccrualStats({ summary }: AccrualStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Accrued"
        value={summary.totalAmount}
        subValue={`${summary.entryCount} entries`}
        icon={<DollarSign className="h-4 w-4" />}
      />
      <StatCard
        title="Pending"
        value={summary.pendingAmount}
        icon={<Clock className="h-4 w-4" />}
        variant="warning"
      />
      <StatCard
        title="Posted to GL"
        value={summary.postedAmount}
        icon={<CheckCircle className="h-4 w-4" />}
        variant="success"
      />
      <StatCard
        title="Reversed"
        value={summary.reversedAmount || 0}
        icon={<XCircle className="h-4 w-4" />}
        variant="destructive"
      />
    </div>
  );
}

export default StatCard;
