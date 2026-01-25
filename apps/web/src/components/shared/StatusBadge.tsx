/**
 * StatusBadge Component - Industrial Design System
 */

import { cn } from '@/lib/utils';

type StatusType =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'PAID'
  | 'UNPAID'
  | 'INACTIVE'
  | 'DEPLETED'
  | 'OVERDUE'
  | 'AT_RISK'
  | 'ON_TRACK';

interface StatusBadgeProps {
  status: StatusType | string;
  showDot?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const statusConfig: Record<string, {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
}> = {
  DRAFT: {
    label: 'Draft',
    bg: 'bg-surface-hover',
    text: 'text-foreground-muted',
    border: 'border-surface-border',
    dot: 'bg-foreground-subtle'
  },
  PENDING: {
    label: 'Pending',
    bg: 'bg-warning-muted',
    text: 'text-warning',
    border: 'border-warning/30',
    dot: 'bg-warning'
  },
  APPROVED: {
    label: 'Approved',
    bg: 'bg-primary-muted',
    text: 'text-primary',
    border: 'border-primary/30',
    dot: 'bg-primary'
  },
  ACTIVE: {
    label: 'Active',
    bg: 'bg-success-muted',
    text: 'text-success',
    border: 'border-success/30',
    dot: 'bg-success'
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-accent-muted',
    text: 'text-accent',
    border: 'border-accent/30',
    dot: 'bg-accent'
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-danger-muted',
    text: 'text-danger',
    border: 'border-danger/30',
    dot: 'bg-danger'
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-danger-muted',
    text: 'text-danger',
    border: 'border-danger/30',
    dot: 'bg-danger'
  },
  PAID: {
    label: 'Paid',
    bg: 'bg-success-muted',
    text: 'text-success',
    border: 'border-success/30',
    dot: 'bg-success'
  },
  UNPAID: {
    label: 'Unpaid',
    bg: 'bg-warning-muted',
    text: 'text-warning',
    border: 'border-warning/30',
    dot: 'bg-warning'
  },
  INACTIVE: {
    label: 'Inactive',
    bg: 'bg-surface-hover',
    text: 'text-foreground-muted',
    border: 'border-surface-border',
    dot: 'bg-foreground-subtle'
  },
  DEPLETED: {
    label: 'Depleted',
    bg: 'bg-danger-muted',
    text: 'text-danger',
    border: 'border-danger/30',
    dot: 'bg-danger'
  },
  OVERDUE: {
    label: 'Overdue',
    bg: 'bg-danger-muted',
    text: 'text-danger',
    border: 'border-danger/30',
    dot: 'bg-danger animate-status-blink'
  },
  AT_RISK: {
    label: 'At Risk',
    bg: 'bg-warning-muted',
    text: 'text-warning',
    border: 'border-warning/30',
    dot: 'bg-warning animate-pulse-subtle'
  },
  ON_TRACK: {
    label: 'On Track',
    bg: 'bg-success-muted',
    text: 'text-success',
    border: 'border-success/30',
    dot: 'bg-success'
  },
};

const sizeClasses = {
  sm: 'px-1.5 py-0 text-2xs',
  default: 'px-2 py-0.5 text-2xs',
  lg: 'px-2.5 py-1 text-xs',
};

export function StatusBadge({
  status,
  showDot = true,
  size = 'default',
  className
}: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    bg: 'bg-surface-hover',
    text: 'text-foreground-muted',
    border: 'border-surface-border',
    dot: 'bg-foreground-subtle'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border font-semibold uppercase tracking-wide',
        config.bg,
        config.text,
        config.border,
        sizeClasses[size],
        className
      )}
    >
      {showDot && (
        <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      )}
      {config.label}
    </span>
  );
}
