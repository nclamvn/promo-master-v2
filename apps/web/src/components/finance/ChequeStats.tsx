/**
 * Cheque Stats Component
 */

import { StatCard } from './FinanceStats';
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ChequeStatsProps {
  summary: {
    totalIssued: number;
    totalCleared: number;
    totalVoided: number;
    totalPending: number;
    issuedAmount: number;
    clearedAmount: number;
    pendingAmount: number;
  };
}

export function ChequeStats({ summary }: ChequeStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Issued Cheques"
        value={summary.issuedAmount}
        subValue={`${summary.totalIssued} outstanding`}
        icon={<CreditCard className="h-4 w-4" />}
        variant="warning"
      />
      <StatCard
        title="Cleared"
        value={summary.clearedAmount}
        subValue={`${summary.totalCleared} processed`}
        icon={<CheckCircle className="h-4 w-4" />}
        variant="success"
      />
      <StatCard
        title="Voided"
        value={summary.totalVoided}
        subValue="Cancelled cheques"
        icon={<XCircle className="h-4 w-4" />}
        variant="destructive"
      />
      <StatCard
        title="Pending"
        value={summary.pendingAmount}
        subValue={`${summary.totalPending} awaiting`}
        icon={<Clock className="h-4 w-4" />}
      />
    </div>
  );
}

export default ChequeStats;
