/**
 * Promotion Status Badge Component
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PromotionStatus } from '@/types';

interface PromotionStatusBadgeProps {
  status: PromotionStatus;
  className?: string;
}

const statusConfig: Record<PromotionStatus, { label: string; className: string }> = {
  DRAFT: {
    label: 'Draft',
    className: 'bg-surface-hover text-foreground-muted border border-surface-border',
  },
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    className: 'bg-warning-muted text-warning border border-warning/30',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-primary-muted text-primary border border-primary/30',
  },
  ACTIVE: {
    label: 'Active',
    className: 'bg-success-muted text-success border border-success/30',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-accent-muted text-accent border border-accent/30',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-danger-muted text-danger border border-danger/30',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-danger-muted text-danger border border-danger/30',
  },
};

export function PromotionStatusBadge({ status, className }: PromotionStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.DRAFT;

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
