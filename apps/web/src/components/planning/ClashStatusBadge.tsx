/**
 * Clash Status Badge Component
 */

import { Badge } from '@/components/ui/badge';

interface ClashStatusBadgeProps {
  status: 'DETECTED' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED' | string;
}

const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  DETECTED: { label: 'Detected', variant: 'destructive' },
  REVIEWING: { label: 'Reviewing', variant: 'default' },
  RESOLVED: { label: 'Resolved', variant: 'secondary' },
  DISMISSED: { label: 'Dismissed', variant: 'outline' },
};

export function ClashStatusBadge({ status }: ClashStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    variant: 'outline' as const,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

interface ClashSeverityBadgeProps {
  severity: 'HIGH' | 'MEDIUM' | 'LOW' | string;
}

const severityConfig: Record<
  string,
  { label: string; className: string }
> = {
  HIGH: { label: 'High', className: 'bg-danger-muted text-danger border-danger/30' },
  MEDIUM: { label: 'Medium', className: 'bg-warning-muted text-warning border-warning/30' },
  LOW: { label: 'Low', className: 'bg-primary-muted text-primary border-primary/30' },
};

export function ClashSeverityBadge({ severity }: ClashSeverityBadgeProps) {
  const config = severityConfig[severity] || {
    label: severity,
    className: 'bg-surface-hover text-foreground-muted',
  };

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
