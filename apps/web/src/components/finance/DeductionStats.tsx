/**
 * Deduction Stats Component
 */

import { StatCard } from './FinanceStats';
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface DeductionStatsProps {
  summary: {
    totalOpen: number;
    totalMatched: number;
    totalDisputed: number;
    totalResolved: number;
    openAmount: number;
    matchedAmount: number;
    disputedAmount: number;
  };
}

export function DeductionStats({ summary }: DeductionStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Open Deductions"
        value={summary.openAmount}
        subValue={`${summary.totalOpen} pending`}
        icon={<Clock className="h-4 w-4" />}
        variant="warning"
      />
      <StatCard
        title="Matched"
        value={summary.matchedAmount}
        subValue={`${summary.totalMatched} resolved`}
        icon={<CheckCircle className="h-4 w-4" />}
        variant="success"
      />
      <StatCard
        title="Disputed"
        value={summary.disputedAmount}
        subValue={`${summary.totalDisputed} in review`}
        icon={<AlertCircle className="h-4 w-4" />}
        variant="destructive"
      />
      <StatCard
        title="Resolved/Written Off"
        value={summary.totalResolved}
        subValue="Closed cases"
        icon={<XCircle className="h-4 w-4" />}
      />
    </div>
  );
}

export default DeductionStats;
