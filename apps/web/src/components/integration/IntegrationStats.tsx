/**
 * Integration Stats Components
 */

import { Link, Database, Webhook, Key, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  className,
}: StatCardProps) {
  const variantStyles = {
    default: '',
    success: 'border-green-500/30 bg-green-500/10 dark:bg-green-500/20',
    warning: 'border-yellow-500/30 bg-yellow-500/10 dark:bg-yellow-500/20',
    danger: 'border-red-500/30 bg-red-500/10 dark:bg-red-500/20',
  };

  const iconColors = {
    default: 'text-muted-foreground',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    danger: 'text-red-600 dark:text-red-400',
  };

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={iconColors[variant]}>{icon || <Activity className="h-4 w-4" />}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

interface IntegrationSummaryProps {
  erpConnections: number;
  erpActive: number;
  dmsConnections: number;
  dmsActive: number;
  webhookEndpoints: number;
  webhookActive: number;
  apiKeys: number;
  apiKeysActive: number;
}

export function IntegrationSummary({
  erpConnections,
  erpActive,
  dmsConnections,
  dmsActive,
  webhookEndpoints,
  webhookActive,
  apiKeys,
  apiKeysActive,
}: IntegrationSummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <StatCard
        title="ERP Connections"
        value={erpConnections}
        subtitle={`${erpActive} active`}
        icon={<Database className="h-4 w-4" />}
        variant={erpActive > 0 ? 'success' : 'default'}
      />
      <StatCard
        title="DMS Connections"
        value={dmsConnections}
        subtitle={`${dmsActive} active`}
        icon={<Link className="h-4 w-4" />}
        variant={dmsActive > 0 ? 'success' : 'default'}
      />
      <StatCard
        title="Webhook Endpoints"
        value={webhookEndpoints}
        subtitle={`${webhookActive} active`}
        icon={<Webhook className="h-4 w-4" />}
        variant={webhookActive > 0 ? 'success' : 'default'}
      />
      <StatCard
        title="API Keys"
        value={apiKeys}
        subtitle={`${apiKeysActive} active`}
        icon={<Key className="h-4 w-4" />}
        variant={apiKeysActive > 0 ? 'success' : 'default'}
      />
    </div>
  );
}

interface ConnectionStatusBadgeProps {
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
}

export function ConnectionStatusBadge({ status }: ConnectionStatusBadgeProps) {
  const config = {
    ACTIVE: { label: 'Active', className: 'bg-emerald-600 text-white dark:bg-emerald-500', icon: CheckCircle },
    INACTIVE: { label: 'Inactive', className: 'bg-slate-500 text-white dark:bg-slate-600', icon: Activity },
    ERROR: { label: 'Error', className: 'bg-red-500 text-white dark:bg-red-600', icon: AlertTriangle },
  };

  const { label, className, icon: Icon } = config[status];

  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', className)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

interface SyncStatusBadgeProps {
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'COMPLETED_WITH_ERRORS' | 'FAILED';
}

export function SyncStatusBadge({ status }: SyncStatusBadgeProps) {
  const config = {
    PENDING: { label: 'Pending', className: 'bg-slate-500 text-white dark:bg-slate-600' },
    RUNNING: { label: 'Running', className: 'bg-blue-500 text-white dark:bg-blue-600' },
    COMPLETED: { label: 'Completed', className: 'bg-emerald-600 text-white dark:bg-emerald-500' },
    COMPLETED_WITH_ERRORS: { label: 'With Errors', className: 'bg-amber-500 text-white dark:bg-amber-600' },
    FAILED: { label: 'Failed', className: 'bg-red-500 text-white dark:bg-red-600' },
  };

  const { label, className } = config[status];

  return (
    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', className)}>
      {label}
    </span>
  );
}
