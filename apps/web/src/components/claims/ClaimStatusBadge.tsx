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
    className: 'bg-slate-500 text-white border border-slate-600 dark:bg-slate-600 dark:border-slate-700',
  },
  SUBMITTED: {
    label: 'Submitted',
    className: 'bg-blue-500 text-white border border-blue-600 dark:bg-blue-600 dark:border-blue-700',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    className: 'bg-amber-500 text-white border border-amber-600 dark:bg-amber-600 dark:border-amber-700',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-emerald-600 text-white border border-emerald-700 dark:bg-emerald-500 dark:border-emerald-600',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-500 text-white border border-red-600 dark:bg-red-600 dark:border-red-700',
  },
  PAID: {
    label: 'Paid',
    className: 'bg-violet-500 text-white border border-violet-600 dark:bg-violet-600 dark:border-violet-700',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-slate-500 text-white border border-slate-600 dark:bg-slate-600 dark:border-slate-700',
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
