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
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  },
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50',
  },
  ACTIVE: {
    label: 'Active',
    className: 'bg-green-500 text-white hover:bg-green-500',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-purple-100 text-purple-700 hover:bg-purple-100',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-700 hover:bg-red-100',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-600 hover:bg-red-50',
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
