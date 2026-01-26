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
    success: 'border-green-200 bg-green-50/50',
    warning: 'border-yellow-200 bg-yellow-50/50',
    danger: 'border-red-200 bg-red-50/50',
  };

  const iconColors = {
    default: 'text-muted-foreground',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
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
    ACTIVE: { label: 'Active', className: 'bg-success-muted text-success', icon: CheckCircle },
    INACTIVE: { label: 'Inactive', className: 'bg-surface-hover text-foreground-muted', icon: Activity },
    ERROR: { label: 'Error', className: 'bg-danger-muted text-danger', icon: AlertTriangle },
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
    PENDING: { label: 'Pending', className: 'bg-surface-hover text-foreground-muted' },
    RUNNING: { label: 'Running', className: 'bg-primary-muted text-primary' },
    COMPLETED: { label: 'Completed', className: 'bg-success-muted text-success' },
    COMPLETED_WITH_ERRORS: { label: 'With Errors', className: 'bg-warning-muted text-warning' },
    FAILED: { label: 'Failed', className: 'bg-danger-muted text-danger' },
  };

  const { label, className } = config[status];

  return (
    <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', className)}>
      {label}
    </span>
  );
}
