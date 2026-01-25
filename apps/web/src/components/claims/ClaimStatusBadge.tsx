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
    className: 'bg-gray-100 text-gray-700',
  },
  SUBMITTED: {
    label: 'Submitted',
    className: 'bg-blue-50 text-blue-700',
  },
  UNDER_REVIEW: {
    label: 'Under Review',
    className: 'bg-yellow-50 text-yellow-700',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-green-100 text-green-700',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-700',
  },
  PAID: {
    label: 'Paid',
    className: 'bg-purple-100 text-purple-700',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-gray-200 text-gray-600',
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
