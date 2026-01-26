/**
 * Claim Status Badge Component
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ClaimStatus } from '@/types';

interface ClaimStatusBadgeProps {
  status: ClaimStatus;
  className?: string;
}

const statusConfig: Record<ClaimStatus, { label: string; className: string }> = {
  DRAFT: {
    label: 'Draft',
    className: 'bg-surface-hover text-foreground-muted border border-surface-border',
  },
  SUBMITTED: {
    label: 'Submitted',
    className: 'bg-primary-muted text-primary border border-primary/30',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    className: 'bg-warning-muted text-warning border border-warning/30',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-success-muted text-success border border-success/30',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-danger-muted text-danger border border-danger/30',
  },
  PAID: {
    label: 'Paid',
    className: 'bg-accent-muted text-accent border border-accent/30',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-surface-hover text-foreground-subtle border border-surface-border',
  },
};

export function ClaimStatusBadge({ status, className }: ClaimStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.DRAFT;

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
